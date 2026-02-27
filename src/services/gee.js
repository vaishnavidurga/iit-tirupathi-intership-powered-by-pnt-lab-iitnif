// Lightweight GEE client shim for the demo app.
// This module attempts to call a backend endpoint `/api/gee/export` which should orchestrate
// Google Earth Engine jobs (recommended: implement server-side in Python or Node with proper GEE auth).
// If the endpoint is not reachable, this shim falls back to a simulator response.

import simulator from './simulator'

async function startExport({satellite='Sentinel-2', date=null} = {}){
  // try calling local server endpoint
  try{
    const resp = await fetch('/api/gee/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satellite, date })
    })
    if(!resp.ok) throw new Error('server returned ' + resp.status)
    const data = await resp.json()
    return data
  }catch(err){
    // fallback: mock response for demo - encode satellite and date into jobId
    const encode = (s) => String(s).replace(/\s+/g,'_')
    const jid = `mock-${encode(satellite)}-${encode(date||'latest')}`
    return new Promise((resolve) => setTimeout(()=> resolve({ message: 'mock-export-started', jobId: jid }), 800))
  }
}

async function getResult(jobId){
  try{
    const resp = await fetch(`/api/gee/result?jobId=${encodeURIComponent(jobId)}`)
    if(!resp.ok) throw new Error('server returned ' + resp.status)
    const data = await resp.json()
    return data
  }catch(err){
    // fallback: return a mock per-sensor estimate map for demo
    // try to parse satellite and date from our mock jobId: mock-Satellite-YYYY-MM-DD
    const parts = String(jobId||'').split('-')
    let satellite = 'Sentinel-2'
    let date = null
    if(parts.length >= 3 && parts[0] === 'mock'){
      satellite = parts[1].replace(/_/g,' ')
      date = parts.slice(2).join('-')
      if(date === 'latest') date = null
    }

    // check whether requested date is available in simulator mock dates
    const available = simulator.listSatelliteDates()
    if(date && !available.includes(date)){
      // simulate not-ready / no-data for that date
      const notReady = { jobId, ready: false, message: 'no data for requested date' }
      return new Promise((resolve) => setTimeout(()=> resolve(notReady), 600))
    }

    // generate mock results per sensor with small satellite-dependent bias
    const biasMap = {
      'Sentinel-2': -1.5,
      'Sentinel-1': 0.8,
      'ERA5': 2.0
    }
    const bias = biasMap[satellite] ?? 0
    const base = { SENS_001: 36.5, SENS_002: 42.1, SENS_003: 33.2, SENS_004: 41.8 }
    const results = {}
    Object.keys(base).forEach(k => {
      // add tiny random noise
      const noise = (Math.random()-0.5) * 1.2
      results[k] = { moistureEst: Number((base[k] + bias + noise).toFixed(2)), ndwiMean: Number((40 + Math.random()*10).toFixed(2)) }
    })
    const mock = { jobId, ready: true, satellite, date, results }
    return new Promise((resolve) => setTimeout(()=> resolve(mock), 600))
  }
}

export default { startExport, getResult }
