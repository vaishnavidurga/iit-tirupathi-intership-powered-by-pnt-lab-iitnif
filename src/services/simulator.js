// In-browser data simulator for sensor readings, satellite mock metadata and ML validation outputs
// Exposes simple subscribe API and helpers to fetch historical slices

function rand(min, max){ return Math.random()*(max-min)+min }

const sensorsTemplate = [
  // Cluster sensors around a green garden area near VR Siddhartha Engineering College
  // Approx campus center: 16.5175, 80.6325 (Kanuru, Vijayawada 520007)
  // Offsets are small so markers cluster visually on the garden area
  { sensorId: 'SENS_001', fieldName: 'FIELD A- North', location: { lat: 16.5190, lon: 80.6330 } },
  { sensorId: 'SENS_002', fieldName: 'FIELD B - South', location: { lat: 16.5160, lon: 80.6320 } },
  { sensorId: 'SENS_003', fieldName: 'FIELD C - East',  location: { lat: 16.5178, lon: 80.6340 } },
  { sensorId: 'SENS_004', fieldName: 'FIELD D - West',  location: { lat: 16.5172, lon: 80.6310 } }
]

// generate initial time-series for last 30 days, per 15-min interval (but we'll sample fewer points to keep data small)
function generateHistory(){
  const now = Date.now()
  const points = []
  for(let i=0;i<24*12;i++){ // last 24 hours at 5-min intervals
    points.push(now - (24*60*60*1000) + i*(5*60*1000))
  }
  const hist = {}
  sensorsTemplate.forEach(s => {
    hist[s.sensorId] = points.map(ts => {
      // simulate diurnal pattern: sine + noise
      const date = new Date(ts)
      const hour = date.getUTCHours()
      const diurnal = 20 + 10*Math.sin((hour/24)*2*Math.PI)
      const moisture = Math.max(12, Math.min(88, 50 + (Math.sin(ts/10000000)+Math.random()-0.5)*10 - (diurnal-20)/2))
      const temp = Math.max(10, Math.min(40, diurnal + (Math.random()-0.5)*3))
      const humidity = Math.max(25, Math.min(95, 60 + (Math.cos(ts/8000000)+Math.random()-0.5)*18))
      const status = moisture < 25 ? 'critical' : (moisture < 40 ? 'low' : (moisture > 70 ? 'high' : 'optimal'))
      return { sensorId: s.sensorId, fieldName: s.fieldName, location: s.location, soilMoisture: Number(moisture.toFixed(1)), temperature: Number(temp.toFixed(1)), humidity: Number(humidity.toFixed(1)), timestamp: new Date(ts).toISOString(), status }
    })
  })
  return hist
}

const historyStore = generateHistory()

// current state (latest reading per sensor)
const current = {}
sensorsTemplate.forEach(s => {
  const arr = historyStore[s.sensorId]
  current[s.sensorId] = arr[arr.length-1]
})

// subscribers
const subscribers = []

function tick(){
  // advance each sensor slightly
  Object.keys(current).forEach(id => {
    const prev = current[id]
    const date = new Date()
    const hour = date.getUTCHours()
    const diurnal = 20 + 10*Math.sin((hour/24)*2*Math.PI)
    // apply only small incremental changes so readings evolve slowly (small steps)
    const moisture = Math.max(12, Math.min(88, prev.soilMoisture + (Math.random()-0.5)*0.4 - (diurnal-24)/100))
    const temp = Math.max(8, Math.min(42, prev.temperature + (Math.random()-0.5)*0.2))
    const humidity = Math.max(20, Math.min(98, prev.humidity + (Math.random()-0.5)*0.5))
    const status = moisture < 25 ? 'critical' : (moisture < 40 ? 'low' : (moisture > 70 ? 'high' : 'optimal'))
    const reading = { sensorId: id, fieldName: prev.fieldName, location: prev.location, soilMoisture: Number(moisture.toFixed(1)), temperature: Number(temp.toFixed(1)), humidity: Number(humidity.toFixed(1)), timestamp: new Date().toISOString(), status }
    current[id] = reading
    // append to history
    const arr = historyStore[id]
    arr.push(reading)
    if(arr.length>12*24*30) arr.shift()
  })
  // notify
  subscribers.forEach(fn => fn(Object.values(current)))
}

  // start ticking every 5 minutes (user requested small periodic changes)
  const TICK_INTERVAL = 5 * 60 * 1000 // 5 minutes
let intervalId = null

export default {
  sensorsList(){
    return sensorsTemplate.map(s=>({...s}))
  },
  subscribe(fn){
    subscribers.push(fn)
    // send initial snapshot
    fn(Object.values(current))
    if(!intervalId){
      intervalId = setInterval(tick, TICK_INTERVAL)
    }
    return () => {
      const idx = subscribers.indexOf(fn)
      if(idx>=0) subscribers.splice(idx,1)
      if(subscribers.length===0 && intervalId){
        clearInterval(intervalId); intervalId=null
      }
    }
  },
  getHistory(sensorId, points=288){ // last 24h by default (5-min samples ~ 288)
    const arr = historyStore[sensorId] || []
    return arr.slice(-points)
  },
  // mock satellite metadata (no real imagery) — return simple generated dataset
  listSatelliteDates(){
    const dates = []
    const now = new Date()
    for(let d=0; d<30; d+=3){
      const dt = new Date(now.getTime() - d*24*3600*1000)
      dates.push(dt.toISOString().slice(0,10))
    }
    return dates
  },
  getSatelliteMock({sat='Sentinel-2', date=null}){
    // returns metadata and a tiny svg string we can render inline
    const ndwiMean = Number((45 + Math.random()*30).toFixed(1))
    const moistureEst = Number((30 + Math.random()*30).toFixed(1))
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='${sat.includes('1')? '#b2dfdb':'#c8e6c9'}'/><text x='20' y='40' font-size='18' fill='#2C3E50'>${sat} — ${date||new Date().toISOString().slice(0,10)}</text><text x='20' y='70' font-size='14' fill='#2C3E50'>NDWI mean: ${ndwiMean}%</text><text x='20' y='94' font-size='14' fill='#2C3E50'>Soil moisture est: ${moistureEst}%</text></svg>`
    return { satellite: sat, date: date||new Date().toISOString().slice(0,10), ndwiMean, moistureEst, svg }
  },
  // ML validation mock
  getMLValidation(){
    const satellites = ['Sentinel-1','Sentinel-2','ERA5']
    return satellites.map(sat => ({
      satellite: sat,
      rmse: Number((3 + Math.random()*4).toFixed(2)),
      r_squared: Number((0.7 + Math.random()*0.25).toFixed(2)),
      mae: Number((2 + Math.random()*3).toFixed(2)),
      sampleSize: 800 + Math.floor(Math.random()*1500),
      lastUpdated: new Date(Date.now() - Math.floor(Math.random()*7)*24*3600*1000).toISOString().slice(0,10)
    }))
  },
  // irrigation recommendation generator
  getIrrigationRecommendation(sensorReading){
    const target = 55
    const deficitPercent = Math.max(0, target - sensorReading.soilMoisture)
    const waterDeficitLiters = Math.round(deficitPercent * 2.5 * 10) // arbitrary conversion
    const priority = deficitPercent > 20 ? 'high' : (deficitPercent >10 ? 'medium' : 'low')
    const recommended = priority==='high' ? 'Irrigate within 6 hours' : (priority==='medium' ? 'Irrigate within 24 hours' : 'Monitor and schedule')
    const estDuration = `${Math.max(10, Math.round(waterDeficitLiters/3))} minutes`
    return { fieldId: sensorReading.sensorId, currentMoisture: sensorReading.soilMoisture, targetMoisture: target, waterDeficit: waterDeficitLiters, priority, recommendedAction: recommended, estimatedDuration: estDuration }
  }
}
