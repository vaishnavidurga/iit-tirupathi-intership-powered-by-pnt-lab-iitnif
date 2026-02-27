# GEE Flask scaffold

This folder contains a small Flask scaffold that simulates a Google Earth Engine (GEE) export/sampling service. It exposes two endpoints used by the frontend:

- `POST /api/gee/export` — start a job. Expects JSON `{ satellite, date, sensors }` where `sensors` is an array of `{ id, lat, lon }`.
- `GET /api/gee/result?jobId=<id>` — return job status and per-sensor results: `{ ready: bool, results: [{ sensorId, value }] }`.

- `POST /api/gee/validate` — run satellite sampling for a set of sensors and compute validation metrics vs provided ground values. Expects JSON `{ satellite, date, sensors: [{ id, lat, lon, value }] }` and returns `{ pairs: [{ sensorId, sat, ground }], metrics: { n, rmse, mae, r2 } }`.

The validate endpoint also supports an optional ML correction step: if `scikit-learn` is installed and there are at least 2 sensors with both satellite and ground values, the server will fit a simple linear regression mapping satellite -> ground values and return corrected predictions and model coefficients in the response. This helps evaluate whether a small learned calibration can improve raw satellite agreement with sensors.

Behavior:
- If the server has a configured GEE environment (the `earthengine-api` installed and the environment variable `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account JSON), the scaffold contains a placeholder where real sampling code can be added.
- If GEE is not configured, the server returns deterministic mock values so the frontend can be tested without credentials.

Quick start (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r server/requirements.txt
# Optionally set your service account credentials for real GEE usage:
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\service-account.json'
python server/server.py
```

Example requests:

PowerShell (invoke export):

```powershell
$body = @{ satellite='Sentinel-2'; date='2025-11-19'; sensors=@(@{ id='SENS_001'; lat=12.34; lon=56.78 }) }
Invoke-RestMethod -Uri 'http://localhost:5000/api/gee/export' -Method POST -Body (ConvertTo-Json $body) -ContentType 'application/json'
```

Then poll the result:

```powershell
Invoke-RestMethod -Uri 'http://localhost:5000/api/gee/result?jobId=job-xxxx' -Method GET
```

Notes:
- This scaffold is intended for development and testing. For production you should:
  - Use a robust job queue (Redis/RQ, Celery, etc.) for long-running exports.
  - Persist job metadata and results to a database.
  - Implement authentication and authorization for the endpoints.
  - Add retries and better error handling around Earth Engine calls.
