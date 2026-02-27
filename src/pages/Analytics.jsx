import React, { useEffect, useState, useMemo } from "react";
import { Chart, registerables } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
Chart.register(...registerables)
import useNow from '../hooks/useNow'
import { db } from "../services/firebase";
import { ref, onValue } from "firebase/database";
import simulator from "../services/simulator";
import Papa from "papaparse";

export default function Analytics() {
  const [sensors, setSensors] = useState([]);
  const [source, setSource] = useState("firebase") // 'firebase' | 'simulator'
  const now = useNow(30 * 1000)

  useEffect(() => {
    let unsubscribe = () => {}

    if (source === 'simulator'){
      // subscribe to simulator
      unsubscribe = simulator.subscribe(list => {
        // simulator provides array of current readings
        const sensorList = list.map(s => {
          // Ensure timestamp is a valid number; for simulator we can auto-fix invalid timestamps
          let ts = Number(s.timestamp);
          if (!isFinite(ts) || ts <= 0) ts = Date.now();
          return {
            sensorId: s.sensorId,
            fieldName: s.fieldName,
            soilMoisture: s.soilMoisture,
            temperature: s.temperature,
            humidity: s.humidity,
            timestamp: ts
          }
        })
        setSensors(sensorList)
      })
    } else {
      // Firebase database reference
      const sensorsRef = ref(db, "sensors");

      // Listener to fetch real-time data
      const off = onValue(sensorsRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setSensors([]);
          return;
        }

        // Convert object to array
        const sensorList = Object.keys(data).map((id) => {
          let ts = Number(data[id].timestamp);
          if (!isFinite(ts) || ts <= 0) ts = Date.now();
          return ({
            sensorId: id,
            fieldName: data[id].fieldName || "Field-1",
            soilMoisture: data[id].moisture ?? data[id].soilMoisture ?? 0,
            temperature: data[id].temperature ?? 0,
            humidity: data[id].humidity ?? 0,
            timestamp: ts,
          })
        });

        setSensors(sensorList);
      });

      unsubscribe = () => off()
    }

    return () => { try{ unsubscribe() }catch(e){} }
  }, [source]);

  // `now` comes from shared useNow hook

  function exportCSV() {
    const rows = [];
    sensors.forEach((s) =>
      rows.push({
        sensorId: s.sensorId,
        fieldName: s.fieldName,
        moisture: s.soilMoisture,
        temp: s.temperature,
        humidity: s.humidity,
        timestamp: s.timestamp,
      })
    );

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sensor_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2>Data Analytics & Reports</h2>

      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className="btn" onClick={() => setSource('firebase')} style={source==='firebase'?{border:'2px solid #2D5016'}:{}}>Firebase</button>
        <button className="btn" onClick={() => setSource('simulator')} style={source==='simulator'?{border:'2px solid #2D5016'}:{}}>Simulator</button>
        <div style={{alignSelf:'center',marginLeft:8,color:'#666'}}>Source: {source}</div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4>Sensor Table</h4>
            <div style={{ fontSize: 13, color: "#666" }}>
              Filter, sort and export sensor snapshots.
            </div>
          </div>
          <div>
            <button className="btn" onClick={exportCSV}>Export CSV</button>
          </div>
        </div>

        <table style={{ width: "100%", marginTop: 12 }}>
          <thead>
            <tr>
              <th>Sensor</th>
              <th>Field</th>
              <th>Moisture</th>
              <th>Temp</th>
              <th>Humidity</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {sensors.map((s) => (
              <tr key={s.sensorId}>
                  <td>{s.sensorId}</td>
                  <td>{s.fieldName}</td>
                  <td>{s.soilMoisture}</td>
                  <td>{s.temperature}</td>
                  <td>{s.humidity}</td>
                  <td>
                    {Number.isFinite(Number(s.timestamp)) ? (
                      <span>{new Date(s.timestamp).toLocaleString()}</span>
                    ) : (
                      <span style={{color:'red'}}>Invalid date</span>
                    )}
                    <div style={{fontSize:11,color:'#666'}}>
                      {Number.isFinite(Number(s.timestamp)) ? Math.round((now - Number(s.timestamp)) / 1000) + 's ago' : ''}
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h4>Comparative analysis</h4>
        <div style={{display:'flex',gap:12}}>
          {/* Average soil moisture summary */}
          <div style={{width:'100%',marginBottom:8,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <strong style={{marginRight:8}}>Average soil moisture:</strong>
            {useMemo(()=>{
              const groups = {}
              sensors.forEach(s=>{
                const base = (s.fieldName||s.sensorId).split(' - ')[0].trim()
                if(!groups[base]) groups[base]=[]
                groups[base].push(Number(s.soilMoisture)||0)
              })
              const colors = ['#2D5016','#4A90E2','#E24A4A','#D4A017','#8E44AD']
              return Object.keys(groups).map((g,i)=>{
                const avg = Math.round((groups[g].reduce((a,b)=>a+b,0)/groups[g].length)*10)/10
                return (
                  <div key={g} style={{display:'inline-flex',alignItems:'center',gap:8,background:'#fff',padding:'6px 8px',borderRadius:6,border:'1px solid #eee'}}>
                    <span style={{width:12,height:12,background:colors[i%colors.length],display:'inline-block',borderRadius:3}} />
                    <span style={{fontWeight:700}}>{g}</span>
                    <span style={{color:'#666'}}>{avg}%</span>
                  </div>
                )
              })
            }, [sensors])}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:'#666',marginBottom:8}}>Seasonal trends (monthly average, mock)</div>
            <Line data={useMemo(()=>{
              // build months labels
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
              // group sensors by base field
              const groups = {}
              sensors.forEach(s=>{
                const base = (s.fieldName||s.sensorId).split(' - ')[0].trim()
                if(!groups[base]) groups[base]=[]
                groups[base].push(Number(s.soilMoisture)||40)
              })
              const labels = months
              const datasets = Object.keys(groups).map((g,i)=>{
                // deterministic pseudo-base from group name
                const seed = g.split('').reduce((a,c)=>a + c.charCodeAt(0),0)
                const base = Math.round((groups[g].reduce((a,b)=>a+b,0)/groups[g].length)||40)
                const data = labels.map((m,mi)=>{
                  // seasonal variation (sinusoidal) + small noise
                  const seasonal = base + 8*Math.sin((mi/12)*2*Math.PI + (seed%7)/7)
                  const noise = ((seed%13)-6)/10 + (Math.random()-0.5)*1.5
                  return Math.round(Math.max(0,Math.min(100,seasonal + noise))*10)/10
                })
                const colors = ['#2D5016','#4A90E2','#E24A4A','#D4A017','#8E44AD']
                return { label: g, data, borderColor: colors[i%colors.length], backgroundColor: colors[i%colors.length], tension:0.2 }
              })
              return { labels, datasets }
            }, [sensors])} options={{plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true}}}} />
          </div>
          <div style={{width:320}}>
            <div style={{fontSize:13,color:'#666',marginBottom:8}}>Cross-field snapshot</div>
            <Bar data={useMemo(()=>{
              const groups = {}
              sensors.forEach(s=>{
                const base = (s.fieldName||s.sensorId).split(' - ')[0].trim()
                if(!groups[base]) groups[base]=[]
                groups[base].push(Number(s.soilMoisture)||40)
              })
              const labels = Object.keys(groups)
              const data = labels.map(l=> Math.round((groups[l].reduce((a,b)=>a+b,0)/groups[l].length)*10)/10 )
              return { labels, datasets:[{ label:'Avg Moisture (%)', data, backgroundColor: labels.map((_,i)=>['#2D5016','#4A90E2','#E24A4A','#D4A017','#8E44AD'][i%5]) }] }
            }, [sensors])} options={{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}}/>
            <div style={{fontSize:12,color:'#666',marginTop:8}}>This is mock data synthesized from current sensor snapshots to demonstrate comparative analytics.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
