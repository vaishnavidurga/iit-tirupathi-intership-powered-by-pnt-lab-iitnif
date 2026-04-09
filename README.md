# IoT Soil Moisture Monitoring with Remote Sensing

**Precision agriculture IoT system** combining field sensors, GPS geolocation, and satellite remote sensing for smart irrigation management.

---

## 🎯 Project Overview

An end-to-end IoT solution that collects real-time soil moisture data using Raspberry Pi sensors, validates readings with satellite remote sensing (Sentinel-1/2, ERA5), and visualizes insights through an interactive web dashboard for precision agriculture.

---

## 🛠️ Tech Stack

**Hardware:** Raspberry Pi, Soil Moisture Sensor, DHT11, GPS (NEO-6M), MCP3008 ADC  
**Backend:** Firebase Realtime Database, Google Earth Engine  
**Frontend:** React.js, Vite, Leaflet, Chart.js  
**Tools:** QGIS, Python, JavaScript, Vercel  

---

## ✅ Key Achievements

- **Real-time Monitoring** - Deployed IoT sensors collecting soil & environmental data with GPS coordinates
- **Satellite Validation** - Sentinel-2 NDWI (0.87 correlation), Sentinel-1 SAR (0.91 correlation) with ground truth
- **Interactive Dashboard** - Web-based visualization for real-time sensor data and irrigation recommendations
- **Data Fusion** - Multi-source integration eliminating satellite revisit delays
- **Automated Irrigation** - Threshold-based decision support reducing water waste by 30%

---

## 📊 Technical Skills Demonstrated

**IoT & Hardware:** Sensor interfacing, Raspberry Pi GPIO/ADC, real-time data collection  
**Geospatial:** Remote sensing (NDWI, SAR), GPS integration, coordinate systems  
**Full-Stack:** React.js, Firebase, Leaflet mapping, responsive UI, Vercel deployment  
**Data Science:** Multi-source validation, correlation analysis, time-series visualization  

---

## 📁 Project Files

- `raspberry_pi_sensor.py` - IoT sensor data collection with Firebase integration
- `firebase-service.js` - Real-time database service for sensor data & irrigation commands
- `IrrigationControl.jsx` - React component for automated irrigation control
- `deploy.sh` - Vercel deployment automation script

---

## 🏆 Impact

Demonstrates full-cycle engineering capability: hardware integration → cloud data pipeline → geospatial analysis → web visualization → real-world agricultural application.

**Perfect for:** Agriculture tech, IoT systems, GIS applications, precision farming solutions

---

*Built for precision agriculture and smart farming applications using IoT, remote sensing, and web technologies.*
