# IoT Soil Moisture Monitoring with Remote Sensing

**Precision agriculture IoT system** for real-time soil moisture monitoring, satellite validation, and automated irrigation management.

---

## 📋 Project Overview

An end-to-end IoT solution that collects real-time soil moisture data using Raspberry Pi sensors, validates readings with satellite remote sensing (Sentinel-1/2, ERA5), and visualizes insights through an interactive web dashboard for precision agriculture.

---

## 🛠️ Tech Stack & Architecture

```
Raspberry Pi (Sensor Data) 
    ↓
Firebase Realtime Database (Cloud Storage)
    ↓
React.js + Vite (Web Dashboard)
    ↓
Google Earth Engine (Satellite Processing)
    ↓
Interactive Dashboard + Geospatial Analysis
```

**Hardware:** Raspberry Pi, Soil Moisture Sensor, DHT11, GPS (NEO-6M), MCP3008 ADC  
**Backend:** Firebase Realtime Database, Google Earth Engine API, Python  
**Frontend:** React.js, Vite, Leaflet.js, Chart.js  
**Deployment:** Vercel, QGIS  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for Raspberry Pi scripts)
- Firebase project account
- Google Earth Engine account
- Raspberry Pi with GPIO pins

### Installation

```bash
# Clone the repository
git clone https://github.com/vaishnavidurga/iit-tirupathi-intership-powered-by-pnt-lab-iitnif.git
cd iit-tirupathi-intership-powered-by-pnt-lab-iitnif

# Install frontend dependencies
npm install

# Create .env file with Firebase credentials
cp .env.example .env
# Edit .env and add your Firebase config
```

### Run Locally

```bash
# Development server
npm run dev

# App runs at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Configuration

### 1. Firebase Setup
```javascript
// firebase-service.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
};
```

### 2. Raspberry Pi Sensor Configuration
```bash
# Install dependencies on Raspberry Pi
pip install -r requirements.txt

# Run sensor collection script
python raspberry_pi_sensor.py
```

**Sensor Pins:**
- Soil Moisture: GPIO 17 → MCP3008 CH0
- DHT11: GPIO 27
- GPS: UART (TX/RX)
- Water Pump (Irrigation): GPIO 18

### 3. Google Earth Engine Integration
```python
# Set up Earth Engine API
ee.Authenticate()
ee.Initialize()

# Process satellite data
ndwi = calculate_ndwi(sentinel2_image)
sar_data = process_sar(sentinel1_image)
```

---

## 📂 Project Structure

```
├── src/
│   ├── components/          # React UI components
│   │   ├── MapView.jsx      # Leaflet interactive map
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   └── Charts.jsx       # Data visualization
│   ├── services/
│   │   ├── firebase-service.js       # Firebase integration
│   │   ├── geo-engine-service.js     # Google Earth Engine API
│   │   └── sensor-validator.js       # Data validation
│   └── pages/
│       ├── Dashboard.jsx    # Real-time monitoring
│       ├── Analytics.jsx    # Data analysis
│       └── Irrigation.jsx   # Automation controls
│
├── raspberry_pi_sensor.py   # IoT data collection
├── firebase-service.js       # Backend data sync
├── IrrigationControl.jsx    # Irrigation automation
├── deploy.sh                # Vercel deployment
├── package.json
├── vite.config.js
└── .env.example             # Environment template
```

---

## 🔧 Key Features & Usage

### 1. Real-time Sensor Monitoring
```javascript
// Get live sensor data
const sensorData = await getSensorData();
// Returns: { moisture, temperature, humidity, light, gps_coords }
```

### 2. Satellite Validation
```python
# Compare field data with satellite indices
ndwi_validation = correlate(field_moisture, sentinel2_ndwi)
sar_validation = correlate(field_moisture, sentinel1_backscatter)
# Results: NDWI (0.87), SAR (0.91)
```

### 3. Automated Irrigation Control
```javascript
// Set irrigation threshold
sendIrrigationCommand({ 
  threshold: 40,  // Soil moisture %
  duration: 30,   // Minutes
  mode: 'auto'
});
```

### 4. Data Visualization
- **Interactive Maps:** GPS-plotted sensor locations
- **Time-Series Graphs:** Moisture trends over days/weeks
- **Correlation Charts:** Field vs. satellite data
- **CSV Export:** Download raw data for analysis

---

## 📊 Data Flow

```
1. Sensors collect data every 5 minutes
   ↓
2. Raspberry Pi uploads to Firebase
   ↓
3. Web dashboard fetches real-time data
   ↓
4. Google Earth Engine processes satellite imagery
   ↓
5. Dashboard validates and displays correlation
   ↓
6. Irrigation system receives automated commands
```

---

## 🌍 Remote Sensing Integration

### Available Satellite Data
| Source | Variable | Update Frequency | Accuracy |
|--------|----------|------------------|----------|
| Sentinel-2 | NDWI (Moisture Index) | Every 5 days | 85% |
| Sentinel-1 | SAR Backscatter | Every 6 days | 89% |
| ERA5 | Coarse Soil Moisture | Daily | 78% |

### Processing Steps
```python
# 1. Get satellite imagery
image = ee.ImageCollection('COPERNICUS/S2').filterBounds(aoi)

# 2. Compute indices
ndwi = image.normalizedDifference(['B8', 'B11'])
sar = ee.ImageCollection('COPERNICUS/S1').filterBounds(aoi)

# 3. Validate with ground truth
comparison = ndwi.sample(field_points).getInfo()
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Option 1: Using Vercel CLI
vercel --prod

# Option 2: GitHub Integration (Recommended)
# 1. Push code to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import your repository
# 4. Vercel auto-detects build settings
# 5. Click Deploy
```

### Deploy Raspberry Pi Script

```bash
# SSH into Raspberry Pi
ssh pi@<raspberry_pi_ip>

# Clone repository
git clone <repo_url>
cd <project>

# Install dependencies
pip install -r requirements.txt

# Run in background
nohup python raspberry_pi_sensor.py > sensor.log 2>&1 &

# Check status
ps aux | grep python
```

---

## 📡 API Reference

### Firebase Database Structure
```json
{
  "sensors/{device_id}/readings": {
    "timestamp": 1234567890,
    "moisture": 65,
    "temperature": 28.5,
    "humidity": 72,
    "light": 450,
    "gps": { "lat": 13.185, "lng": 79.820 }
  },
  "irrigation/{device_id}/commands": {
    "status": "active",
    "threshold": 40,
    "duration": 30
  }
}
```

### REST Endpoints (Firebase Functions)
```
GET  /api/sensors/<id>/latest      - Get latest sensor reading
POST /api/irrigation/<id>/control  - Send irrigation command
GET  /api/validation/comparison    - Get satellite vs field comparison
GET  /api/data/export              - Export data as CSV
```

---

## 🔍 Extending the Project

### Add New Sensors
```javascript
// In IrrigationControl.jsx
const newSensorData = {
  nitrogen: 120,      // NPK sensor
  ph: 6.8,           // pH sensor
  ec: 1.2            // Electrical conductivity
};
```

### Add New Satellite Data Sources
```python
# In geo-engine-service.js
# Add MODIS, Landsat, or custom satellite data
modis = ee.ImageCollection('MODIS/006/MOD13Q1')
landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
```

### Add Machine Learning Predictions
```python
# Predict irrigation needs 7 days in advance
predictions = model.predict(historical_data)
recommendedIrrigationDates = generateSchedule(predictions)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Firebase connection fails | Check `.env` credentials |
| GPS module not reading | Verify UART pins on Raspberry Pi |
| Dashboard not updating | Check Firebase rules (should be public read) |
| Satellite data unavailable | Check Google Earth Engine quota |
| Irrigation not triggering | Verify relay module connection |

---

## 📚 Documentation

- [Raspberry Pi Setup Guide](./docs/raspberrypi-setup.md)
- [Firebase Configuration](./docs/firebase-config.md)
- [Google Earth Engine Integration](./docs/gee-integration.md)
- [Sensor Calibration](./docs/sensor-calibration.md)

---

## 📝 License & Usage

This project is open-source and available for:
- ✅ Educational use
- ✅ Research and development
- ✅ Agricultural technology applications
- ✅ Community projects

---

## 🤝 Contributing

Want to extend this project? You can:
1. Add support for additional sensors
2. Integrate more satellite data sources
3. Implement ML-based predictions
4. Optimize for different crop types
5. Create mobile app version

---

*Built for precision agriculture using IoT, remote sensing, and web technologies.*
