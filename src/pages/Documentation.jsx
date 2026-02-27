import React from 'react'

export default function Documentation(){
  return (
    <div>
      <h2>Technical Documentation</h2>
      <div className="card">
        <h4>System architecture</h4>
        <svg width="100%" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="20" width="180" height="60" rx="8" fill="#fff" stroke="#ddd"/>
          <text x="20" y="50" fill="#2C3E50">IoT Sensors (Field)</text>
          <rect x="210" y="20" width="220" height="60" rx="8" fill="#fff" stroke="#ddd"/>
          <text x="220" y="50" fill="#2C3E50">Edge Gateway / Telemetry</text>
          <rect x="450" y="20" width="320" height="60" rx="8" fill="#fff" stroke="#ddd"/>
          <text x="460" y="50" fill="#2C3E50">Cloud - Satellite Ingest / ML / Dashboard</text>
          <line x1="190" y1="50" x2="210" y2="50" stroke="#ccc" strokeWidth="2" />
          <line x1="430" y1="50" x2="450" y2="50" stroke="#ccc" strokeWidth="2" />
        </svg>
        <p>Data flows from field sensors to an edge gateway, into cloud processing where satellite data is ingested and ML models validate soil moisture estimates. The dashboard visualizes results and produces irrigation recommendations.</p>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h4>Sensor specifications & deployment</h4>
        <p>Simulated sensors provide moisture, temperature and humidity readings. In production: use capacitance probes, telemetry over LoRaWAN/3G/4G and secure APIs.</p>
      </div>

      <div className="card" style={{marginTop:12}}>
        <h4>ML methodology</h4>
        <ol>
          <li>Preprocess satellite bands and apply atmospheric correction</li>
          <li>Extract features: NDWI, backscatter, surface temp</li>
          <li>Train regression models vs ground truth sensors</li>
          <li>Validate with cross-validation and compute R²/RMSE/MAE</li>
        </ol>
      </div>
      
      <div className="card" style={{marginTop:12}}>
        <h4>Production integration notes</h4>
        <p>The demo uses an in-browser simulator. For production, integrate real telemetry and satellite tiles as follows:</p>
        <h5>Telemetry (MQTT / WebSocket)</h5>
        <p>Recommended pattern: sensors → edge gateway (LoRaWAN/MQTT) → broker (e.g. EMQX, Mosquitto) → bridge to cloud WebSocket or REST. Below is a simple WebSocket consumer pattern:</p>
        <pre style={{background:'#f3f4f6',padding:8,borderRadius:6,overflow:'auto'}}>{`// Example (browser)
const ws = new WebSocket('wss://your-broker.example/ws');
ws.onmessage = (ev) => { const msg = JSON.parse(ev.data); /* update UI */ }
ws.onopen = () => console.log('ws open')
`}</pre>
        <h5>Satellite tiles</h5>
        <p>Use Sentinel Hub, AWS Open Data, or public tile servers. Example Leaflet tile layer for XYZ tiles:</p>
        <pre style={{background:'#f3f4f6',padding:8,borderRadius:6,overflow:'auto'}}>{`L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
// For Sentinel tiles, configure proper tile endpoint and attribution
`}</pre>
        <p>Be mindful of usage limits and CORS; use a tile proxy or hosted service when needed.</p>
      </div>
    </div>
  )
}
