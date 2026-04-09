# 🌱 IoT-Based Soil Moisture Monitoring with Remote Sensing Validation

## Overview
Built an IoT-based system to monitor soil moisture in real time and validate it using satellite data. The system combines field sensors, GPS-based mapping, and remote sensing indices to analyze moisture variations and support irrigation decisions.

---

## Problem
Traditional irrigation lacks precise, location-based data, leading to inefficient water usage. This project addresses that by combining:
- Ground sensor data  
- Satellite-based moisture indicators  
- Geospatial visualization  

---

## System Implementation

### Hardware
- Raspberry Pi  
- Soil Moisture Sensor (via MCP3008 ADC)  
- DHT11 (Temperature & Humidity)  
- LDR (Light Sensor)  
- NEO-6M GPS Module  
- Relay-controlled Water Pump & Solenoid Valve  

### Software & Tools
- React.js (Vite) – Web dashboard  
- Firebase – Real-time database  
- Google Earth Engine – Satellite data processing  
- QGIS – Geospatial visualization  

---

## Methodology
1. Collected real-time soil and environmental data using sensors  
2. Tagged each reading with GPS coordinates  
3. Sent data to Firebase for storage and access  
4. Retrieved satellite data (Sentinel-1, Sentinel-2, ERA5)  
5. Computed indices (NDWI, NDVI, SAR backscatter)  
6. Compared satellite data with ground measurements  
7. Visualized results on a web dashboard  
8. Implemented threshold-based automatic irrigation  

---

## Key Results
- Real-time soil moisture monitoring with location tagging  
- GPS-based mapping of field conditions  
- Similar moisture patterns observed between sensor and satellite data  
- Effective identification of dry zones for irrigation  
- Automated irrigation triggered based on moisture thresholds  

---

## Technical Architecture
- **Data Flow:** Sensors → Raspberry Pi → Firebase → Web Dashboard  
- **Frontend:** React.js + Chart.js + Leaflet  
- **Backend/Data:** Firebase (real-time sync)  
- **Geospatial:** Google Earth Engine + QGIS  

---

## Repository Structure
src/
 ├── components/      # UI components (Map, Charts)
 ├── pages/           # Dashboard, Analytics, Irrigation
 ├── services/        # Firebase, GEE integration
 ├── hooks/           # Custom hooks
 └── utils/           # Helper functions



## Project Link
https://github.com/vaishnavidurga/IIT-Tirupati-PNT-Lab-Internship

---

## Notes
- Demonstrates integration of IoT, geospatial analysis, and web technologies  
  
