from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
import uuid
import os
import hashlib
import math
import numpy as np
try:
    from sklearn.linear_model import LinearRegression
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False

try:
    import ee
    EE_AVAILABLE = True
except Exception:
    EE_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# In-memory job store. For production use persistent storage (DB).
JOBS = {}


def mock_value_for_sensor(sensor, satellite, date):
    key = f"{sensor.get('id','')}-{sensor.get('lat')}-{sensor.get('lon')}-{satellite}-{date}"
    h = hashlib.sha256(key.encode()).hexdigest()
    val = (int(h[:8], 16) % 5000) / 100.0
    return round(val, 3)


def run_job(jobId, payload):
    JOBS[jobId] = {'ready': False, 'payload': payload, 'results': None}
    sensors = payload.get('sensors', [])
    satellite = payload.get('satellite')
    date = payload.get('date')

    # Simulate some processing time for sampling / export
    time.sleep(2)

    results = []

    # If Earth Engine is available and credentials are configured, you could
    # run actual sampling here. This scaffold keeps a safe fallback to deterministic
    # mock values so the frontend can be tested without credentials.
    if EE_AVAILABLE and os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
        try:
            ee.Initialize()
            # Real sampling logic would go here. For example:
            # - choose an ImageCollection depending on `satellite`
            # - filter by date and location
            # - reduceRegion or sample at point geometry
            # For this scaffold we fall through to deterministic mocks below.
            pass
        except Exception as e:
            print('Earth Engine init/sample failed, falling back to mock:', e)

    for s in sensors:
        v = mock_value_for_sensor(s, satellite, date)
        results.append({'sensorId': s.get('id'), 'value': v})

    JOBS[jobId]['results'] = results
    JOBS[jobId]['ready'] = True


def compute_metrics(pairs):
    # pairs: list of {'sensorId', 'sat', 'ground'}
    y_true = []
    y_pred = []
    for p in pairs:
        g = p.get('ground')
        s = p.get('sat')
        if g is None:
            continue
        try:
            y_true.append(float(g))
            y_pred.append(float(s))
        except Exception:
            continue
    if len(y_true) == 0:
        return {'n': 0, 'rmse': None, 'mae': None, 'r2': None}
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    mse = float(np.mean((y_true - y_pred) ** 2))
    rmse = float(np.sqrt(mse))
    mae = float(np.mean(np.abs(y_true - y_pred)))
    # R^2
    ss_res = float(np.sum((y_true - y_pred) ** 2))
    ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
    r2 = None
    if ss_tot != 0:
        r2 = 1.0 - (ss_res / ss_tot)
    return {'n': int(len(y_true)), 'rmse': rmse, 'mae': mae, 'r2': r2}


def fit_ml_and_predict(pairs):
    """Fit a simple ML regression (linear) mapping satellite -> ground.

    Returns predictions for each pair (or None) and model info.
    """
    # prepare training data for sensors that have both sat and ground
    X = []
    y = []
    indices = []
    for i, p in enumerate(pairs):
        try:
            s = float(p.get('sat'))
            g = p.get('ground')
            if g is None:
                continue
            g = float(g)
            X.append([s])
            y.append(g)
            indices.append(i)
        except Exception:
            continue

    if len(X) < 2 or not SKLEARN_AVAILABLE:
        # Not enough data or sklearn not available -> return None (no ML)
        return None

    X = np.array(X)
    y = np.array(y)
    model = LinearRegression()
    model.fit(X, y)
    preds = model.predict(X)

    # build predictions aligned to original `pairs` list
    full_preds = [None] * len(pairs)
    for idx, pidx in enumerate(indices):
        full_preds[pidx] = float(preds[idx])

    model_info = {'coef': float(model.coef_[0]) if hasattr(model, 'coef_') else None, 'intercept': float(model.intercept_) if hasattr(model, 'intercept_') else None}
    return {'predictions': full_preds, 'model': model_info}


@app.route('/api/gee/export', methods=['POST'])
def start_export():
    data = request.get_json() or {}
    sensors = data.get('sensors', [])
    if not sensors:
        return jsonify({'error': 'sensors required'}), 400

    jobId = f"job-{uuid.uuid4().hex[:8]}"
    threading.Thread(target=run_job, args=(jobId, data), daemon=True).start()
    return jsonify({'jobId': jobId}), 202


@app.route('/api/gee/result', methods=['GET'])
def get_result():
    jobId = request.args.get('jobId')
    if not jobId or jobId not in JOBS:
        return jsonify({'error': 'jobId not found'}), 404
    job = JOBS[jobId]
    return jsonify({'ready': job['ready'], 'results': job['results']})



@app.route('/api/gee/validate', methods=['POST'])
def validate():
    """Validate satellite values against ground sensors.

    Expects JSON: { satellite, date, sensors: [ { id, lat, lon, value } ] }
    Returns: { pairs: [{ sensorId, sat, ground }], metrics: { n, rmse, mae, r2 } }
    """
    data = request.get_json() or {}
    sensors = data.get('sensors', [])
    satellite = data.get('satellite')
    date = data.get('date')
    if not sensors:
        return jsonify({'error': 'sensors required'}), 400

    pairs = []
    for s in sensors:
        # Attempt real sampling if EE is available; otherwise fall back to deterministic mock
        sat_val = None
        if EE_AVAILABLE and os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
            try:
                # Placeholder for real EE sampling. Implement sampling here.
                # Example approach:
                #  - choose an ImageCollection depending on `satellite`
                #  - filter by date and select an image
                #  - create ee.Geometry.Point(lon, lat) and sample or reduceRegion
                #  - read band value
                # For safety this scaffold does not assume a specific dataset/band.
                pass
            except Exception as e:
                print('EE sampling failed, falling back to mock:', e)

        if sat_val is None:
            sat_val = mock_value_for_sensor(s, satellite, date)

        # Ground value field: check common names
        ground_val = s.get('value')
        if ground_val is None:
            ground_val = s.get('ground')
        if ground_val is None:
            ground_val = s.get('soil_moisture')
        pairs.append({'sensorId': s.get('id'), 'sat': sat_val, 'ground': ground_val})

    # Compute raw metrics (sat vs ground)
    raw_metrics = compute_metrics(pairs)

    # Attempt ML correction (sat -> ground) if possible
    ml_result = fit_ml_and_predict(pairs)
    ml_info = None
    corrected_metrics = None
    if ml_result is not None:
        preds = ml_result.get('predictions')
        # attach corrected predictions to pairs
        for i, p in enumerate(pairs):
            p['ml_pred'] = preds[i]
        corrected_metrics = compute_metrics([{'sat': p.get('ml_pred'), 'ground': p.get('ground')} for p in pairs if p.get('ml_pred') is not None])
        ml_info = ml_result.get('model')

    return jsonify({'pairs': pairs, 'metrics': {'raw': raw_metrics, 'corrected': corrected_metrics}, 'ml': ml_info})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
