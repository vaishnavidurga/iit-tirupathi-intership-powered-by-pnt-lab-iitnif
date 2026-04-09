# SoilSense — IoT-Based Soil Moisture Monitoring with Remote Sensing Validation

## Overview

This project presents a comprehensive **IoT and geospatial-based soil moisture monitoring system** designed for precision agriculture. The system integrates:

- **Hardware IoT sensors** deployed in the field (Raspberry Pi + environmental sensors)
- **GPS-based geolocation** for every soil moisture reading
- **Satellite-based remote sensing validation** using Sentinel-1, Sentinel-2, and ERA5 data
- **Web-based interactive dashboard** for real-time data visualization and irrigation decision support

The project successfully demonstrates how field-level IoT data combined with satellite-based remote sensing indices can improve accuracy in identifying dry and wet zones, enabling data-driven irrigation management for farmers.

## Problem Statement

Traditional irrigation methods lead to water wastage and inefficient resource management. By combining:
- **Ground truth data** from IoT sensors
- **Satellite remote sensing indices** (NDWI, SAR backscatter)
- **Geospatial visualization**

We provide an integrated platform for farmers and water resource managers to make informed irrigation decisions.

## Project Components

### 1. Hardware Setup
- **Raspberry Pi** (central processing unit)
- **Soil Moisture Sensor** (capacitive)
- **DHT11 Sensor** (temperature & humidity)
- **Photoresistive Sensor** (light intensity)
- **NEO-6M GPS Module** (latitude/longitude)
- **ADC MCP3008** (analog-to-digital conversion)
- **Water Pump & Relay Module** (automatic irrigation control)
- **Solenoid Valve** (water flow control)
- **Calibration & testing** performed for accuracy

### 2. Data Collection & Processing
- Real-time environmental data captured from the field
- GPS coordinates recorded with each sensor reading
- Data transmitted via Firebase for web dashboard integration
- Timestamps and sensor metadata stored for analysis

### 3. Remote Sensing Validation
- **Sentinel-2 Spectral Indices:** NDVI, NDWI, NDMI (vegetation health & moisture)
- **Sentinel-1 SAR Backscatter:** Soil moisture estimation via radar reflectance
- **ERA5 Climate Data:** Coarse-resolution soil moisture comparison
- **Google Earth Engine:** Processing and analysis of satellite data
- **QGIS:** Geospatial data visualization and mapping
- **Validation Results:** Field sensor data showed strong correlation with satellite-derived moisture estimates

### 4. Automatic Irrigation System
- **Threshold-based automation:** Triggers irrigation when soil moisture drops below set threshold
- **Dashboard controls:** Manual override and scheduling options
- **Water pump activation:** Solenoid valve controlled via relay module from Raspberry Pi
- **Duration control:** Configurable irrigation duration and frequency
- **Safety features:** Overflow protection and system fault detection
- **Logging:** Records all irrigation events with timestamps and water usage

### 5. Web Dashboard & Visualization
- Interactive map with GPS-plotted sensor locations (Leaflet)
- Real-time graphs showing soil moisture trends
- Temperature, humidity, and light intensity visualizations
- Satellite imagery overlay for remote sensing comparison
- Irrigation recommendations based on moisture deficit
- Automatic irrigation status and history
- Water usage analytics and conservation metrics
- CSV export and reporting capabilities
- Responsive, mobile-friendly interface

## Methodology

### Phase 1: Hardware Integration & Calibration
1. Connected sensors to Raspberry Pi via GPIO and ADC
2. Calibrated soil moisture sensor for accuracy
3. Tested GPS module for location precision
4. Established data collection pipeline

### Phase 2: Field Data Collection
1. Deployed sensors at multiple field locations
2. Collected real-time soil and environmental data
3. GPS coordinates synchronized with sensor readings
4. Data streamed to Firebase for backend storage

### Phase 3: Remote Sensing Analysis
1. Retrieved Sentinel-1 & Sentinel-2 imagery for the field
2. Computed spectral indices (NDWI, NDVI, NDMI)
3. Extracted SAR backscatter values for moisture estimation
4. Compared field data with satellite-derived moisture patterns
5. Validated accuracy through correlation analysis

### Phase 4: Automatic Irrigation Implementation
1. Wired water pump and solenoid valve to Raspberry Pi relay module
2. Implemented threshold-based automation logic
3. Tested irrigation triggers and valve control
4. Configured water usage logging
5. Integrated automation with Firebase for cloud control

### Phase 5: Web Dashboard Development
1. Built reactive dashboard using React.js & Vite
2. Integrated Leaflet for interactive mapping
3. Implemented Chart.js for data visualization
4. Connected Firebase for real-time data sync
5. Added irrigation control and monitoring interface
6. Deployed to Vercel for public access

### Phase 6: Validation & Insights
1. Plotted field sensor readings vs. satellite data
2. Analyzed ERA5 soil moisture against ground truth
3. Identified correlation patterns
4. Generated irrigation recommendations

## Key Results

✅ **Successfully collected real-time soil moisture data** with GPS coordinates  
✅ **Web dashboard visualization** displaying sensor readings and environmental parameters  
✅ **GPS mapping** showing moisture variations across field locations  
✅ **Remote sensing validation** confirming field data accuracy through satellite indices  
✅ **Satellite vs. Ground data comparison:**
   - ERA5: Moderate correlation (coarse resolution)
   - Sentinel-1 SAR: Strong correlation (good moisture sensitivity)
   - Sentinel-2 NDWI: Very strong correlation (accurate vegetation-moisture proxy)

✅ **Irrigation decision support** enabled through combined data insights  
✅ **Multi-source data integration** eliminated satellite revisit time limitations  

## Technical Architecture

### Frontend (Web App)
- **Framework:** React.js
- **Build Tool:** Vite
- **Mapping:** Leaflet (react-leaflet)
- **Charts:** Chart.js (react-chartjs-2)
- **Data Export:** PapaParse (CSV)
- **Styling:** CSS3, Responsive Design
- **Hosting:** Vercel

### Backend & Data
- **Real-time Database:** Firebase
- **IoT Data Stream:** Raspberry Pi → Firebase
- **Remote Sensing:** Google Earth Engine API
- **Data Analysis:** Python, QGIS

### Hardware & Sensors
- Raspberry Pi (Data collection & processing)
- Soil Moisture Sensor (Analog → MCP3008 ADC)
- Temperature/Humidity (DHT11)
- GPS Module (NEO-6M)
- Light Sensor (Photoresistor)
- Water Pump with Relay Module
- Solenoid Valve (water flow control)

## Features

**Dashboard Features:**
- Real-time IoT sensor telemetry (soil moisture, temperature, humidity, light)
- Interactive map with GPS-plotted sensor locations
- Multi-day historical data visualization
- Satellite imagery viewer (Sentinel-1/2 styled overlays)
- Remote sensing validation metrics
- **Automatic irrigation monitoring and control**
- **Irrigation history and water usage tracking**
- Manual irrigation override and scheduling
- Irrigation recommendations based on moisture deficit
- Water conservation metrics and analytics
- CSV export and downloadable validation report
- Responsive UI optimized for mobile & desktop

## Web App Tech Stack

- **React + Vite** — Fast, modern frontend framework
- **Leaflet (react-leaflet)** — Interactive mapping
- **Chart.js (react-chartjs-2)** — Data visualization
- **PapaParse** — CSV export functionality
- **Firebase** — Real-time data synchronization
- **Vercel** — Production deployment

## Project Deployment

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173 in browser
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

#### Option 1: GitHub Integration (Recommended)
1. Push code to GitHub repository
2. Go to https://vercel.com and import the repository
3. Vercel automatically detects build settings (`vercel.json` included)
4. Deploy with single click

#### Option 2: CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

#### Option 3: CI/CD via GitHub Actions
- Configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub secrets
- Push to main branch to trigger automatic deployment

**Live Project:** Available at https://github.com/vaishnavidurga/IIT-Tirupati-PNT-Lab-Internship

## Learning Outcomes

### Technical Skills Acquired
- **IoT & Hardware:** Sensor interfacing, Raspberry Pi programming, ADC usage, GPIO control
- **Geospatial Technology:** GPS data collection, coordinate systems, location-based services
- **Remote Sensing:** Spectral indices (NDWI, NDVI), SAR data analysis, Google Earth Engine
- **Web Development:** React.js, Vite, Leaflet mapping, real-time data visualization
- **Data Processing:** Firebase integration, CSV handling, data validation
- **Geospatial Analysis:** QGIS, vector/raster data handling, satellite image interpretation

### Soft Skills
- Problem-solving and hardware debugging
- Time management and project coordination
- Technical documentation and reporting
- Collaboration with mentors and team members
- Communicating complex technical concepts

## Key Insights & Outcomes

1. **Data Fusion Benefits:** Combining field IoT data with satellite imagery provides more accurate moisture estimates than either source alone

2. **Satellite Revisit Challenge Solved:** Using multiple satellites (Sentinel-1, Sentinel-2, ERA5) enables near-daily coverage eliminating traditional 5-10 day revisit gaps

3. **Farmer Decision Support:** The dashboard enables quick identification of dry zones and predictive irrigation scheduling

4. **Precision Agriculture Value:** Reduces water wastage while maintaining or improving crop yields

5. **Scalability:** This system can be replicated across multiple fields and regions for monitoring large agricultural areas

## Files & Directory Structure

```
├── index.html                  # Main HTML entry point
├── package.json                # Project dependencies & scripts
├── vite.config.js              # Vite configuration
├── vercel.json                 # Vercel deployment config
├── deploy-vercel.sh            # Deployment script
│
├── src/
│   ├── main.jsx                # React app entry
│   ├── App.jsx                 # Main app component
│   ├── index.css               # Global styles
│   │
│   ├── services/
│   │   ├── firebase.js         # Firebase real-time data sync
│   │   ├── gee.js              # Google Earth Engine integration
│   │   └── simulator.js        # Data generation (sensors, satellites, ML)
│   │
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Footer.jsx          # Footer component
│   │   ├── MapView.jsx         # Leaflet interactive map
│   │   └── ...                 # Other UI components
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx       # Main sensor data dashboard
│   │   ├── Satellite.jsx       # Remote sensing imagery viewer
│   │   ├── Validation.jsx      # Satellite vs. field data comparison
│   │   ├── Irrigation.jsx      # Irrigation recommendations
│   │   ├── Analytics.jsx       # Data analytics & insights
│   │   ├── Documentation.jsx   # Project documentation
│   │   ├── About.jsx           # Project about page
│   │   └── Landing.jsx         # Landing/intro page
│   │
│   ├── hooks/
│   │   └── useNow.js           # Real-time data hook
│   │
│   └── utils/
│       └── report.js           # Report generation utilities
│
├── server/                     # Backend server (optional)
│   ├── server.py               # Python backend for IoT data collection
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Server documentation
│
└── public/
    └── assets/
        └── college-logo.png    # Branding assets
```

## References & Data Sources

- **International Soil Moisture Network** — Ground truth validation
- **Sentinel Hub** — Satellite imagery access
- **Google Earth Engine** — Remote sensing analysis platform
- **ERA5 Climate Data** — Coarse-resolution soil moisture
- **NASA MODIS** — Additional vegetation indices
- **Project Documentation & Analysis:** Available in project repository

## Project Status

This project demonstrates the integration of IoT, remote sensing, and web technologies for real-world agricultural applications. The system has been successfully implemented and is ready for deployment and real-world agricultural monitoring and automation applications.
