import React, { useState, useEffect } from 'react'
import simulator from '../services/simulator'
import Papa from 'papaparse'
import MapView from '../components/MapView'

export default function Satellite() {
  const dates = simulator.listSatelliteDates()
  const [date, setDate] = useState(dates[0])
  const [sat, setSat] = useState('Sentinel-2')
  const [overlay, setOverlay] = useState(true)
  const [validation, setValidation] = useState(null)

  const mock = simulator.getSatelliteMock({ sat, date })

  // typical revisit intervals (days)
  const revisit = {
    'Sentinel-2': 5,
    'Sentinel-1': 6,
    ERA5: 1,
  }

  // compute which satellites are expected to have data for the selected date
  const availableSats = (() => {
    if (!date) return []
    const sel = new Date(date + 'T00:00:00Z')
    const today = new Date()
    const dayDiff = Math.round((today - sel) / (24 * 3600 * 1000))
    return Object.keys(revisit).filter((s) => {
      const r = revisit[s] || 1
      if (dayDiff < 0) return false
      if (r === 1) return true
      return dayDiff % r === 0
    })
  })()

  // auto-switch to an available satellite when needed
  useEffect(() => {
    if (!availableSats || availableSats.length === 0) return
    if (!availableSats.includes(sat)) setSat(availableSats[0])
  }, [availableSats.join(','), date])

  // export helpers
  function exportValidationCSV(v) {
    if (!v || !v.pairs) return
    const rows = v.pairs.map((p) => ({ sensorId: p.sensorId, ground: p.ground, satellite: p.sat }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'validation_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportValidationJSON(v) {
    if (!v) return
    const data = { metrics: v.metrics, pairs: v.pairs }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'validation_results.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2>Satellite Data Viewer</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label>
          Date:{' '}
          <select value={date} onChange={(e) => setDate(e.target.value)}>
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <div style={{ marginLeft: 12, alignSelf: 'center', color: '#444' }}>
          Available satellites for {date}: {availableSats.length > 0 ? availableSats.join(', ') : 'None'}
        </div>

        <label style={{ marginLeft: 12 }}>
          Satellite:{' '}
          <select value={sat} onChange={(e) => setSat(e.target.value)} disabled={!availableSats || availableSats.length === 0}>
            {availableSats && availableSats.length > 0 ? (
              availableSats.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))
            ) : (
              <option value="">No satellites available</option>
            )}
          </select>
        </label>

        <label style={{ marginLeft: 12 }}>
          <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} /> Overlay sensor locations
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16 }}>
        <div className="card">
          <h3>
            {sat} — {date}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: mock.svg }} />
        </div>

        <div>
          <div className="card">
            <h4>NDWI & Soil Moisture</h4>
            <div>
              NDWI mean: <strong>{mock.ndwiMean}%</strong>
            </div>
            <div>
              Satellite soil moisture estimate: <strong>{mock.moistureEst}%</strong>
            </div>
          </div>

          <div style={{ height: 12 }} />

          {overlay && (
            <MapView
              markers={simulator.sensorsList().map((s) => ({
                ...s,
                soilMoisture: Math.round(30 + Math.random() * 40),
                temperature: 20 + Math.round(Math.random() * 6),
                humidity: 60 + Math.round(Math.random() * 20),
                timestamp: new Date().toISOString(),
              }))}
            />
          )}
        </div>
      </div>

      {validation && (
        <div style={{ marginTop: 12 }} className="card">
          <h4>Validation Results</h4>

          {validation.metrics ? (
            <div>
              <div>
                Samples: <strong>{validation.metrics.n}</strong>
              </div>
              <div>
                RMSE: <strong>{validation.metrics.rmse}</strong>
              </div>
              <div>
                MAE: <strong>{validation.metrics.mae}</strong>
              </div>
              <div>
                R²: <strong>{validation.metrics.r2}</strong>
              </div>

              <div style={{ height: 8 }} />

              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button className="btn" onClick={() => exportValidationCSV(validation)}>
                  Download CSV
                </button>
                <button className="btn" onClick={() => exportValidationJSON(validation)}>
                  Download JSON
                </button>
              </div>

              <h5>Per-sensor</h5>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Sensor</th>
                    <th>Ground</th>
                    <th>Satellite</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.pairs.map((p) => (
                    <tr key={p.sensorId}>
                      <td>{p.sensorId}</td>
                      <td>{p.ground}</td>
                      <td>{p.sat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No matching satellite results available.</div>
          )}
        </div>
      )}
    </div>
  )
}
