# Sikyon Survey Project - Web Application

## Overview

The Sikyon Survey Project web application is a comprehensive archaeological data visualization and query platform for the ancient Greek city of Sikyon. The application provides interactive mapping, database querying, and rich media support for archaeological survey data.

## Features

### 1. Interactive Map Visualization
- MapLibre GL-based mapping with multiple archaeological layers
- Real-time layer toggling and filtering
- Clickable features with detailed popups
- Support for multiple geometry types (points, lines, polygons)
- Coordinate transformation from Greek Grid (EPSG:2100) to WGS84 (EPSG:4326)

### 2. Database Query Interface
- Filter and search pottery, architecture, and coin finds
- Multi-criteria filtering by type, period, material, etc.
- Detailed drill-down views for individual artifacts
- CSV export functionality
- Map visualization of query results

### 3. Rich Media Support
- Image galleries with thumbnail and lightbox views
- PDF document links
- External reference URLs
- Automatic media detection and display

### 4. Responsive Design
- Mobile-friendly interface
- Adaptive layouts for all screen sizes
- Touch-optimized interactions

## Technology Stack

### Frontend
- **React 18.2** - UI framework
- **React Router 6.20** - Client-side routing
- **MapLibre GL 3.6** - Map rendering
- **react-map-gl 7.1** - React wrapper for MapLibre
- **react-csv 2.2** - CSV export functionality
- **Axios 1.6** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **proj4** - Coordinate transformation
- **shpjs** - Shapefile parsing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
web-sikyon/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── layerConfig.js          # Layer configuration
│   │   ├── services/
│   │   │   ├── coordinateTransform.service.js
│   │   │   └── data.service.js
│   │   └── index.js                    # Express server
│   ├── data/
│   │   └── sample-data/                # GeoJSON data files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js               # Navigation header
│   │   │   ├── Sidebar.js              # Layer control sidebar
│   │   │   ├── MapView.js              # Map component
│   │   │   └── FeatureModal.js         # Feature detail popup
│   │   ├── pages/
│   │   │   ├── LandingPage.js          # Home page
│   │   │   ├── MapPage.js              # Map view page
│   │   │   └── DatabaseView.js         # Database query page
│   │   ├── services/
│   │   │   ├── api.js                  # API client
│   │   │   └── mockDatabase.js         # Mock data
│   │   ├── styles/                     # CSS files
│   │   └── App.js                      # Main app component
│   └── package.json
└── docs/                               # Documentation
```

## Key Configuration

### Ports
- **Frontend**: http://localhost:3100
- **Backend**: http://localhost:3180

### Layer Configuration
Layers are configured in `backend/src/config/layerConfig.js`:
- **Rendering order**: Bottom to top
- **Filtering**: Enabled only for specific layers
- **Visibility**: Default visibility settings per layer

### Coordinate Systems
- **Input Data**: Greek Grid (EPSG:2100)
- **Map Display**: WGS84 (EPSG:4326)
- **Transformation**: Automatic via proj4

## Quick Start

### Prerequisites
- Node.js 14+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web-sikyon
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3180
   ```

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm start
   # Application opens at http://localhost:3100
   ```

## Data Source

The application is designed to work with the Sikyon Survey Project dataset published on Zenodo:
- **Dataset**: [https://zenodo.org/records/1054450](https://zenodo.org/records/1054450)
- **Format**: ESRI Shapefiles (converted to GeoJSON)
- **Coverage**: Archaeological survey data including pottery, architecture, coins, and geophysical surveys

## Documentation

See the `/docs` directory for detailed documentation:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [CONFIGURATION.md](./CONFIGURATION.md) - Configuration reference
- [DATA_MODEL.md](./DATA_MODEL.md) - Data structures and formats
- [FEATURE_POPUPS.md](./FEATURE_POPUPS.md) - Feature popup system
- [DATABASE_INTERFACE.md](./DATABASE_INTERFACE.md) - Database query interface
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Future development recommendations

## License

This project is designed for the Sikyon Survey Project archaeological data visualization.

## Acknowledgments

Data from the Sikyon Survey Project (Zenodo: 1054450)
