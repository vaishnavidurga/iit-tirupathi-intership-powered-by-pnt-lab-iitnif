import React, { useMemo, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import simulator from '../services/simulator'
import { generateValidationPDF } from '../utils/report'

Chart.register(...registerables)

export default function Validation(){
  const results = [
    { satellite: 'Sentinel-1', mse: 935.78, rmse: 30.59, mae: null, sampleSize: 200, lastUpdated: '2025-11-19' },
    { satellite: 'Sentinel-2', mse: 563.61, rmse: 23.74, mae: null, sampleSize: 200, lastUpdated: '2025-11-19' },
    { satellite: 'ERA5',      mse: 417.53, rmse: 20.43, mae: null, sampleSize: 200, lastUpdated: '2025-11-19' }
  ]

  const [selectedSat, setSelectedSat] = useState(results[0].satellite)

  function randomNormal(mean=0, std=1){
    let u=0,v=0
    while(u===0) u = Math.random()
    while(v===0) v = Math.random()
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return z*std + mean
  }

  function genSamplesForSatellite(sat){
    const r = results.find(x => x.satellite === sat)
    const rmse = Math.abs(r?.rmse || 20)
    const n = Math.max(30, Math.min(200, Math.floor(r.sampleSize || 100)))
    const pairs = []
    for(let i=0;i<n;i++){
      const ground = 20 + Math.random()*60
      const satVal = Math.max(0, Math.min(100, ground + randomNormal(0, rmse)))
      pairs.push({ x: Number(satVal.toFixed(2)), y: Number(ground.toFixed(2)) })
    }
    return pairs
  }

  function pearson(pairs){
    const n = pairs.length
    if(n===0) return 0
    const xs = pairs.map(p=>p.x)
    const ys = pairs.map(p=>p.y)
    const meanX = xs.reduce((a,b)=>a+b,0)/n
    const meanY = ys.reduce((a,b)=>a+b,0)/n
    const num = xs.reduce((s,x,i)=> s + (x-meanX)*(ys[i]-meanY), 0)
    const den = Math.sqrt(xs.reduce((s,x)=> s + Math.pow(x-meanX,2),0) * ys.reduce((s,y)=> s + Math.pow(y-meanY,2),0))
    if(den===0) return 0
    return num/den
  }

  function linearFit(pairs){
    const n = pairs.length
    const xs = pairs.map(p=>p.x)
    const ys = pairs.map(p=>p.y)
    const meanX = xs.reduce((a,b)=>a+b,0)/n
    const meanY = ys.reduce((a,b)=>a+b,0)/n
    let num = 0, den = 0
    for(let i=0;i<n;i++){ num += (xs[i]-meanX)*(ys[i]-meanY); den += Math.pow(xs[i]-meanX,2) }
    const slope = den === 0 ? 0 : num/den
    const intercept = meanY - slope*meanX
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    return { slope, intercept, line: [{x:minX, y: slope*minX + intercept}, {x:maxX, y: slope*maxX + intercept}] }
  }

  const samples = useMemo(()=> genSamplesForSatellite(selectedSat), [selectedSat])
  const r = useMemo(()=> pearson(samples), [samples])
  const fit = useMemo(()=> linearFit(samples), [samples])

  const scatterData = {
    datasets: [
      { label: 'Points', data: samples, backgroundColor: 'rgba(46,125,50,0.8)', pointRadius: 4 },
      { label: 'Fit', data: fit.line, type: 'line', borderColor: 'rgba(244,67,54,0.9)', borderWidth: 2, pointRadius: 0, fill: false }
    ]
  }

  const scatterOptions = {
    scales: {
      x: { title: { display: true, text: 'Satellite estimate' } },
      y: { title: { display: true, text: 'Ground truth' } }
    },
    plugins: { legend: { position: 'top' } },
    maintainAspectRatio: false
  }

  return (
    <div>
      <h2>ML Model Validation</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 420px',gap:16}}>
        <div>
          <div className="card">
            <h4>Model comparison</h4>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left'}}>Satellite</th>
                  <th>MSE</th>
                  <th>RMSE</th>
                  <th>Samples</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r=> (
                  <tr key={r.satellite}>
                    <td>{r.satellite}</td>
                    <td>{r.mse}</td>
                    <td>{r.rmse}%</td>
                    <td>{r.sampleSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h4>Correlation</h4>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
              <label style={{fontSize:13}}>Satellite: </label>
              <select value={selectedSat} onChange={e=>setSelectedSat(e.target.value)}>
                {results.map(r=> <option key={r.satellite} value={r.satellite}>{r.satellite}</option>)}
              </select>
              <div style={{marginLeft:12,color:'#666'}}>Pearson r: <strong>{r.toFixed(3)}</strong></div>
            </div>
            <div style={{height:260}}>
              <Scatter data={scatterData} options={scatterOptions} />
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h4>Feature importance</h4>
            <p>Top features: backscatter (SAR), NDWI, surface temperature, soil texture (mock).</p>
          </div>
          <div style={{height:12}} />
          <div className="card">
            <h4>Reports</h4>
            <div>Last training: {results[0].lastUpdated}</div>
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <button className="btn" onClick={()=>generateValidationPDF(results)}>
                Download validation report (PDF)
              </button>
              <button className="btn" onClick={()=>{
                const csv = results.map(r =>
                  `${r.satellite},${r.rmse},${r.mse},${r.sampleSize},${r.lastUpdated}`
                ).join('\n')

                const blob = new Blob(
                  [`Satellite,RMSE,MSE,Samples,LastUpdated\n${csv}`],
                  {type:'text/csv'}
                )

                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'validation_metrics.csv'
                a.click()
                URL.revokeObjectURL(url)
              }}>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}