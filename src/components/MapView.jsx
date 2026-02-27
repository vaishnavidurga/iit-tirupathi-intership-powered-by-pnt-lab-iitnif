import React, { useRef, useEffect, useState } from 'react'
import useNow from '../hooks/useNow'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function MapView({
  markers = [],
  center = [16.5062, 80.6480],
  zoom = 14,
  height = 360,
  flyOnCenterChange = true,
  mapStyle = 'normal', // 'normal' | 'vegetation'
  onMapClick // function(latlng)
}) {
  const mapRef = useRef(null)
  const [weatherById, setWeatherById] = useState({})
  const now = useNow(30 * 1000)

  const disableInteractions = (map) => {
    if (!map) return
    try {
      map.dragging?.disable()
      map.scrollWheelZoom?.disable()
      map.doubleClickZoom?.disable()
      map.touchZoom?.disable()
    } catch (e) {}
  }

  const enableInteractions = (map) => {
    if (!map) return
    try {
      map.dragging?.enable()
      map.scrollWheelZoom?.enable()
      map.doubleClickZoom?.enable()
      map.touchZoom?.enable()
    } catch (e) {}
  }

  // Keep interactions enabled by default so users can click to place markers
  useEffect(() => {
    if (mapRef.current) enableInteractions(mapRef.current)
  }, [])

  // Fly map to new center
  useEffect(() => {
    const map = mapRef.current
    if (!map || !center) return
    try {
      // Always use setView for reliable centering; is more reliable than flyTo
      map.setView(center, zoom)
      console.log('Map moved to:', center, 'zoom:', zoom)
    } catch (e) {
      console.error('Map center error:', e)
    }
  }, [center, zoom])

  return (
    <div style={{ height }} className="card map-card">
      <div
        style={{ height: '100%', borderRadius: 8 }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          whenCreated={(map) => {
            mapRef.current = map
            // Enable all interactions on map creation
            enableInteractions(map)
            if (onMapClick) {
              map.on('click', (e) => onMapClick(e.latlng))
            }
          }}
          style={{ height: '100%', borderRadius: 8 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            key={mapStyle}
            url={
            mapStyle === 'vegetation'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
            attribution={mapStyle === 'vegetation' ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
          />
          {markers.map((m) => {
            const lat = m.location?.lat ?? m.lat
            const lon = m.location?.lon ?? m.lon
            const keyId = m.sensorId || `${lat}-${lon}`
            const isCustom = !m.sensorId
            return (
              <Marker
                key={keyId}
                position={[lat, lon]}
                eventHandlers={{
                  mouseover: (e) => e.target.openPopup(),
                  mouseout: (e) => e.target.closePopup(),
                  click: async () => {
                    if (isCustom) return
                    try {
                      const id = m.sensorId
                      if (weatherById[id]) return
                      const key = import.meta.env.VITE_OPENWEATHER_API_KEY || ''
                      if (!key) return
                      const res = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`
                      )
                      if (!res.ok) return
                      const data = await res.json()
                      setWeatherById((prev) => ({ ...prev, [id]: data }))
                    } catch (e) {}
                  }
                }}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontWeight: 700 }}>
                      {isCustom ? `Custom point (${lat.toFixed(4)}, ${lon.toFixed(4)})` : m.fieldName}
                    </div>
                    {!isCustom && (
                      <>
                        <div>Moisture: {m.soilMoisture}%</div>
                        <div>Temp: {m.temperature}°C</div>
                        <div>Humidity: {m.humidity}%</div>
                      </>
                    )}
                    {weatherById[m.sensorId] && (
                      <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Weather (OpenWeather)</div>
                        <div>Conditions: {weatherById[m.sensorId].weather?.[0]?.description || '—'}</div>
                        <div>Temp: {weatherById[m.sensorId].main?.temp ?? '—'} °C</div>
                        <div>Humidity: {weatherById[m.sensorId].main?.humidity ?? '—'}%</div>
                        <div>Wind: {weatherById[m.sensorId].wind?.speed ?? '—'} m/s</div>
                      </div>
                    )}
                    {!isCustom && (
                      <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                        <div>{new Date(m.timestamp).toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          {(() => {
                            const t = Number(m.timestamp ?? Date.now())
                            if (!isFinite(t)) return ''
                            return Math.round((now - t) / 1000) + 's ago'
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}
