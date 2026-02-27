Google Earth Engine integration (demo)
------------------------------------

This project includes a lightweight shim (`src/services/gee.js`) that calls a backend endpoint at `/api/gee/export` to start Earth Engine export jobs.

Recommended server setup (Python, Flask example):

1. Create a small Flask server with GEE authenticated service account (see GEE docs).

```python
from flask import Flask, request, jsonify
import ee

app = Flask(__name__)
eee.Initialize()

@app.route('/api/gee/export', methods=['POST'])
def start_export():
    payload = request.json or {}
    # implement your export workflow: select collection, date range, preprocess, export to GCS or Drive
    # enqueue a task and return a job id
    job_id = 'gae-12345'
    return jsonify({ 'message': 'export started', 'jobId': job_id })

if __name__ == '__main__':
    app.run(port=5000)
```

2. Configure CORS and secure access. Use a service account and never embed private keys on the client.

3. In production, orchestrate preprocessing steps (cloud masking, atmospheric correction), then export reduced products (NDWI mean, moisture estimate) and push results to your DB for the dashboard to consume.

Client notes:
- The demo UI calls `POST /api/gee/export` with `{ satellite, date }`.
- If the endpoint is not present, `src/services/gee.js` returns a mock response so the UI continues to work.

Security:
- Always secure the endpoint (auth header, API key, or host-only access) before connecting it to real GEE workloads.
