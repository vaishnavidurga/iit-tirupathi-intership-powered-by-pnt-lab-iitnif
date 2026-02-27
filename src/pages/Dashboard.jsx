import React, {useEffect, useState, useMemo} from 'react'
import useNow from '../hooks/useNow'
import simulator from '../services/simulator'
import { db } from '../services/firebase'
import { ref, onValue } from 'firebase/database'
import MapView from '../components/MapView'
import Papa from 'papaparse'
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// Data export helpers used by quick actions
function exportCSV(list){
  const rows = list.map(s => ({
    sensorId: s.sensorId,
    fieldName: s.fieldName,
    moisture: s.soilMoisture,
    temp: s.temperature,
    humidity: s.humidity,
    timestamp: s.timestamp
  }))
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sensor_data.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function exportJSON(list){
  const json = JSON.stringify(list, null, 2)
  const blob = new Blob([json], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sensor_data.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function exportPDF(list){
  const [{ jsPDF }] = await Promise.all([import('jspdf')])
  const doc = new jsPDF({unit:'pt', format:'letter'})
  let y = 40
  doc.setFontSize(14)
  doc.text('SoilSense sensor snapshot', 40, y)
  y += 24
  doc.setFontSize(10)
  list.forEach(s=>{
    if(y > 750){ doc.addPage(); y=40 }
    const line = `${s.sensorId} | ${s.fieldName} | ${s.soilMoisture}% | ${s.temperature}°C | ${s.humidity}% | ${new Date(s.timestamp).toLocaleString()}`
    doc.text(line, 40, y)
    y += 12
  })
  doc.save('sensor_snapshot.pdf')
}

function moistureColor(status){
  if(status==='critical') return 'var(--danger)'
  if(status==='low') return 'var(--warning)'
  if(status==='high') return 'orange'
  return 'var(--success)'
}

export default function Dashboard(){
  const [sensors, setSensors] = useState([])
  const [selected, setSelected] = useState(null)
  const [source, setSource] = useState('simulator') // 'simulator' | 'firebase'
  // center constants were previously used for jump/reset features; removed per request
  const [mapCenter, setMapCenter] = useState(null)
  const [mapStyle, setMapStyle] = useState('normal') // normal | vegetation
  const [customPoints, setCustomPoints] = useState([]) // user-added points
  const [showHelp, setShowHelp] = useState(false)
  const now = useNow(30 * 1000)
  const lastUpdate = useMemo(() => {
    if(!sensors || sensors.length === 0) return null
    return sensors.reduce((max, s) => {
      const t = Number(s.timestamp)
      return isFinite(t) ? Math.max(max, t) : max
    }, 0)
  }, [sensors])
  useEffect(()=>{
    // when switching sources, clear selection while we load new data
    setSelected(null)
    let unsubscribe = () => {}

    if(source === 'simulator'){
      unsubscribe = simulator.subscribe(list => {
        // normalize simulator timestamps to ms and ensure valid numbers
        const normalized = list.map(s => ({
          ...s,
          timestamp: (s.timestamp ? Number(Date.parse(s.timestamp)) : Date.now())
        }))
        setSensors(normalized)
        if(!selected && normalized && normalized.length>0) setSelected(normalized[0])
      })
    } else {
      const sensorsRef = ref(db, 'sensors')
      const off = onValue(sensorsRef, (snapshot) => {
        const data = snapshot.val()
        if(!data){ setSensors([]); return }
        // attempt to reuse simulator locations for sensors that don't have locations in Firebase
        const simList = simulator.sensorsList()
        const keys = Object.keys(data)
        const list = keys.map((id, idx) => {
          const fd = data[id]
          const sim = simList.find(s => s.sensorId === id)
          // base fallback location: simulator > firebase fallback > generated jitter
          let loc = fd.location ?? sim?.location ?? { lat: 16.5062, lon: 80.6480 }
          // if many sensors share the same fallback, apply tiny jitter so markers are visible
          if(!fd.location && !sim){
            const jitter = (idx % 5) * 0.00025
            loc = { lat: loc.lat + jitter, lon: loc.lon + jitter }
          }
          // normalize timestamp to ms
          const tsRaw = fd.timestamp ?? Date.now()
          let ts = Number(tsRaw)
          if (!isFinite(ts)) ts = (typeof tsRaw === 'string' ? Number(Date.parse(tsRaw)) : Date.now())

          return {
            sensorId: id,
            fieldName: fd.fieldName ?? `Field-${id}`,
            soilMoisture: fd.soilMoisture ?? fd.moisture ?? 0,
            temperature: fd.temperature ?? 0,
            humidity: fd.humidity ?? 0,
            status: fd.status ?? 'normal',
            timestamp: ts,
            location: loc
          }
        })
        setSensors(list)
        if(!selected && list.length>0) setSelected(list[0])
      })
      unsubscribe = () => off()
    }

    return () => {
      try{ unsubscribe() }catch(e){}
    }
  },[source])

  // automatically move map when a sensor or field is selected
  useEffect(() => {
    if (selected && selected.location) {
      setMapCenter([selected.location.lat, selected.location.lon])
    }
  }, [selected])

  // Group sensors by base field name (prefix before " - ") to avoid duplicate field cards
  const fieldGroups = useMemo(() => {
    const map = {}
    sensors.forEach(s => {
      const base = (s.fieldName || s.sensorId).split(' - ')[0].trim()
      if (!map[base]) map[base] = { name: base, sensors: [] }
      map[base].sensors.push(s)
    })
    const groups = Object.values(map).map(g => {
      const avg = Math.round((g.sensors.reduce((sum, it) => sum + (Number(it.soilMoisture) || 0), 0) / g.sensors.length) * 10) / 10
      const status = g.sensors.some(it => it.status === 'critical') ? 'critical' : g.sensors.some(it => it.status === 'low') ? 'low' : 'normal'
      return { ...g, avgMoisture: avg, status }
    })

    // enforce specific ordering: Field A, Field B, Field C, Field D, then any others alphabetically
    const order = ['Field A', 'Field B', 'Field C', 'Field D']
    groups.sort((a, b) => {
      const ia = order.indexOf(a.name)
      const ib = order.indexOf(b.name)
      if (ia === -1 && ib === -1) return a.name.localeCompare(b.name)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })

    return groups
  }, [sensors])

  const chartData = useMemo(()=>{
    if(!selected) return null

    // helper to create a small synthetic history when no real history exists
    const makeSynthetic = (base, tempBase, points = 20, intervalMs = 5*60*1000) => {
      const now = Date.now()
      const arr = []
      for(let i=0;i<points;i++){
        const ts = now - (points - i) * intervalMs
        const moisture = Math.max(0, Math.min(100, base + (Math.random()-0.5)*1.5))
        const temperature = Number((tempBase + (Math.random()-0.5)*0.5).toFixed(1))
        arr.push({ timestamp: ts, soilMoisture: Number(moisture.toFixed(1)), temperature })
      }
      return arr
    }

    let hist = []
    try{
      if(source === 'simulator'){
        hist = simulator.getHistory(selected.sensorId, 288) || []
      } else {
        // For Firebase (or other sources) we may not have historical data stored; synthesize a small history
        hist = []
      }
    }catch(e){ hist = [] }

    if(!hist || hist.length === 0){
      const baseMoisture = Number(selected.soilMoisture) || 40
      const baseTemp = Number(selected.temperature) || 25
      hist = makeSynthetic(baseMoisture, baseTemp, 20)
    }

    return {
      labels: hist.map(h=>new Date(h.timestamp).toLocaleTimeString()),
      datasets: [
        { label: 'Soil moisture (%)', data: hist.map(h=>h.soilMoisture), borderColor:'#2D5016', tension:0.2, fill:true, backgroundColor:'rgba(45,80,22,0.08)'},
        { label: 'Temperature (°C)', data: hist.map(h=>h.temperature), borderColor:'#4A90E2', tension:0.2, yAxisID:'y1' }
      ]
    }
  },[selected, sensors, source])


  // whenever selected sensor changes, pan the map to it
  useEffect(() => {
    if (selected && selected.location) {
      setMapCenter([selected.location.lat, selected.location.lon])
    }
  }, [selected])

  return (
    <div>
      {showHelp && (
        <div
          style={{
            position:'fixed',
            top:0,
            left:0,
            right:0,
            bottom:0,
            background:'rgba(0,0,0,0.6)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            zIndex:1000
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="card"
            style={{
              maxWidth:450,
              padding:24,
              borderRadius:12,
              background:'white',
              boxShadow:'0 10px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{marginTop:0}}>Dashboard Help</h3>
            <p><strong>Click on the map</strong> to place a custom marker at any location.</p>
            <p><strong>Clear Markers:</strong> Remove all custom markers you've placed.</p>
            <p><strong>Normal View:</strong> Standard street map.</p>
            <p><strong>Vegetation View:</strong> Satellite imagery showing crops, fields, and vegetation in green.</p>
            <button className="btn" onClick={() => setShowHelp(false)} style={{marginTop:12}}>Close</button>
          </div>
        </div>
      )}
      <h2>Live Sensor Dashboard</h2>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn" onClick={() => setSource('simulator')} style={source==='simulator'?{border:'2px solid #2D5016'}:{}}>Simulator</button>
        <button className="btn" onClick={() => setSource('firebase')} style={source==='firebase'?{border:'2px solid #2D5016'}:{}}>Firebase</button>
        <div style={{alignSelf:'center',marginLeft:8,color:'#666'}}>
          <div>Source: {source}</div>
          <div style={{fontSize:12,color:'#777'}}>
            {lastUpdate ? Math.round((now - lastUpdate)/1000) + 's since last update' : 'no data yet'}
          </div>
        </div>
        <div style={{marginLeft:12, display:'flex', gap:8, alignItems:'center'}}>
          <button className="btn" onClick={() => setMapStyle('normal')}>Normal View</button>
          <button className="btn" onClick={() => setMapStyle('vegetation')}>Vegetation View</button>
          <button className="btn" onClick={() => setCustomPoints([])}>Clear Markers</button>
          <button className="btn" onClick={() => setShowHelp(true)}>Help</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        <div>
          <MapView
            markers={[...sensors, ...customPoints]}
            center={mapCenter || undefined}
            mapStyle={mapStyle}
            onMapClick={(latlng)=>{
              // add a simple custom point with lat/lon
              setCustomPoints(prev => [...prev, {lat: latlng.lat, lon: latlng.lng}])
            }}
          />
          <div style={{display:'flex',gap:12,marginTop:12}}>
            {fieldGroups.map(group => (
              <div
                key={group.name}
                className="card"
                style={{flex:1,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}
                onClick={() => setSelected(group.sensors[0])}
              >
                <div>
                  <div style={{fontWeight:700}}>{group.name}</div>
                  <div style={{fontSize:13,color:'#666'}}>{group.sensors.length} sensor{group.sensors.length>1? 's':''} • {group.sensors[0]?.sensorId}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:18,fontWeight:700}}>{group.avgMoisture}%</div>
                  <div style={{fontSize:12,color:'#666'}}>{group.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{marginTop:12}}>
            <h3>Historical trends — {selected?.fieldName}</h3>
            {chartData ? <Line data={chartData} options={{interaction:{mode:'index',intersect:false},scales:{y:{beginAtZero:true},y1:{position:'right',grid:{display:false}}}}} /> : <div>Loading...</div>}
          </div>
        </div>

        <aside>
          <div className="card">
            <h3>Selected Sensor</h3>
            {selected ? (
              <div>
                <div style={{fontWeight:700,fontSize:18}}>{selected.fieldName}</div>
                <div style={{marginTop:8}}>Moisture: <strong>{selected.soilMoisture}%</strong></div>
                <div>Temperature: {selected.temperature}°C</div>
                <div>Humidity: {selected.humidity}%</div>
                <div style={{marginTop:8}}>Status: <span style={{color:moistureColor(selected.status),fontWeight:700}}>{selected.status}</span></div>
              </div>
            ) : <div>Loading...</div>}
          </div>

          <div className="card" style={{marginTop:12}}>
            <h4>Quick Actions</h4>
            <div style={{display:'flex',gap:8}}>
              <button className="btn" onClick={() => exportCSV(sensors)}>Export CSV</button>
              <button className="btn" onClick={() => exportJSON(sensors)}>Export JSON</button>
              <button className="btn" onClick={() => exportPDF(sensors)}>Export PDF</button>
            </div>
            <div style={{height:10}} />
            
          </div>

        </aside>
      </div>
    </div>
  )
}
