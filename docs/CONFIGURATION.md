# Configuration Reference

## Overview

This document describes all configuration options available in the Sikyon web application.

## Backend Configuration

### Environment Variables

Location: `backend/.env` (create if doesn't exist)

```bash
# Server Configuration
PORT=3180                                    # Backend server port
NODE_ENV=development                         # Environment (development/production)

# CORS Configuration
CORS_ORIGIN=http://localhost:3100           # Allowed frontend origin

# Data Configuration
DATA_DIR=./data/sample-data                 # GeoJSON data directory

# Caching
ENABLE_CACHE=true                           # Enable in-memory caching
CACHE_TTL=3600                              # Cache time-to-live (seconds)
```

### Layer Configuration

Location: `backend/src/config/layerConfig.js`

#### Complete Configuration Example

```javascript
module.exports = {
  /**
   * Layers to completely exclude from the application
   * These layers will not appear in the API or frontend
   */
  excludedLayers: [
    'iso-2m',
    'iso-2m-line',
    'iso-2m-polygon',
    'unwanted-layer'
  ],

  /**
   * Layer rendering order (bottom to top)
   * Layers at the beginning render first (appear below)
   * Layers at the end render last (appear on top)
   */
  layerOrder: [
    'tracts',              // Base layer
    'squares',             // Survey squares
    'cliffs',              // Topography
    'geophysics-interpretation',
    'geophysics-magnetic',
    'geophysics-resistivity',
    'arch-features-line',  // Architecture lines
    'arch-features-point', // Architecture points
    'architecture',        // Buildings
    'pottery',            // Pottery finds
    'coins'              // Coin finds (top layer)
  ],

  /**
   * Layers without filtering capability
   * These layers will not show filter controls in the UI
   * All layers NOT in this list will have filtering enabled
   */
  noFilterLayers: [
    'tracts',
    'squares',
    'cliffs',
    'geophysics-magnetic',
    'geophysics-resistivity',
    'pottery',
    'architecture',
    'coins'
  ],

  /**
   * Per-layer settings
   * Configure display names, descriptions, and default visibility
   */
  layerSettings: {
    'pottery': {
      name: 'Pottery Finds',
      description: 'Ceramic artifacts and sherds',
      defaultVisible: true,    // Visible on initial load
      color: '#e74c3c'        // Optional: custom color
    },
    'architecture': {
      name: 'Architectural Features',
      description: 'Buildings, walls, and structures',
      defaultVisible: true,
      color: '#3498db'
    },
    'coins': {
      name: 'Coin Finds',
      description: 'Numismatic finds',
      defaultVisible: true,
      color: '#f39c12'
    },
    'geophysics-interpretation': {
      name: 'Geophysical Survey',
      description: 'Interpreted geophysical anomalies',
      defaultVisible: false,
      color: '#9b59b6'
    },
    'arch-features-line': {
      name: 'Architectural Features (Lines)',
      description: 'Linear architectural elements',
      defaultVisible: false,
      color: '#1abc9c'
    },
    'arch-features-point': {
      name: 'Architectural Features (Points)',
      description: 'Point architectural features',
      defaultVisible: false,
      color: '#16a085'
    },
    'tracts': {
      name: 'Survey Tracts',
      description: 'Survey area divisions',
      defaultVisible: true,
      color: '#95a5a6'
    },
    'squares': {
      name: 'Survey Squares',
      description: 'Survey grid squares',
      defaultVisible: true,
      color: '#7f8c8d'
    },
    'cliffs': {
      name: 'Topographical Features',
      description: 'Cliffs and terrain features',
      defaultVisible: true,
      color: '#34495e'
    }
  }
};
```

#### Layer Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | String | Display name in UI | Layer ID |
| `description` | String | Tooltip/help text | Empty |
| `defaultVisible` | Boolean | Show on initial load | `false` |
| `color` | String | Layer color (hex) | Auto-assigned |
| `minZoom` | Number | Minimum zoom level | `0` |
| `maxZoom` | Number | Maximum zoom level | `22` |

### Server Configuration

Location: `backend/src/index.js`

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Port configuration
const PORT = process.env.PORT || 3180;

// CORS configuration
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3100';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (if serving images/PDFs)
app.use('/static', express.static('data/media'));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

## Frontend Configuration

### Environment Variables

Location: `frontend/.env`

```bash
# Development Server
PORT=3100                                   # Frontend dev server port
BROWSER=none                                # Disable auto-open browser
DANGEROUSLY_DISABLE_HOST_CHECK=true        # Dev only - allow all hosts

# API Configuration
REACT_APP_API_URL=http://localhost:3180    # Backend API URL
REACT_APP_API_TIMEOUT=30000                # API request timeout (ms)

# Map Configuration
REACT_APP_MAP_CENTER_LAT=37.99             # Default map center latitude
REACT_APP_MAP_CENTER_LNG=22.71             # Default map center longitude
REACT_APP_MAP_ZOOM=14                      # Default zoom level
REACT_APP_MAP_STYLE=https://...            # Custom map style URL (optional)

# Feature Flags
REACT_APP_ENABLE_DEBUG=false               # Enable debug logging
REACT_APP_ENABLE_ANALYTICS=false           # Enable analytics
```

### Package Configuration

Location: `frontend/package.json`

```json
{
  "name": "sikyon-frontend",
  "version": "1.0.0",
  "private": true,

  "proxy": "http://localhost:3180",

  "scripts": {
    "start": "PORT=3100 react-scripts start",
    "dev": "PORT=3100 react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
    "lint": "eslint src/"
  },

  "eslintConfig": {
    "extends": ["react-app"]
  },

  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### Map Configuration

Location: `frontend/src/components/MapView.js`

```javascript
// Default map center (Sikyon coordinates)
const SIKYON_CENTER = {
  longitude: 22.71,
  latitude: 37.99,
  zoom: 14
};

// Map style options
const MAP_STYLES = {
  // Basic OSM style (default)
  osm: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',

  // Satellite imagery
  satellite: 'https://...',

  // Terrain
  terrain: 'https://...'
};

// Map configuration
const mapConfig = {
  minZoom: 10,        // Minimum zoom level
  maxZoom: 20,        // Maximum zoom level
  bearing: 0,         // Initial bearing
  pitch: 0,          // Initial pitch (3D tilt)

  // Interaction options
  dragRotate: true,
  touchZoomRotate: true,
  doubleClickZoom: true,
  scrollZoom: true
};
```

### Layer Styling

Location: `frontend/src/components/MapView.js`

```javascript
const getLayerStyle = (layerId, geometryType) => {
  const baseColors = {
    'pottery': '#e74c3c',
    'architecture': '#3498db',
    'coins': '#f39c12',
    'geophysics-interpretation': '#9b59b6'
  };

  const color = baseColors[layerId] || '#95a5a6';

  // Point/Circle layers
  if (geometryType === 'Point' || geometryType === 'MultiPoint') {
    return {
      id: `${layerId}-circles`,
      type: 'circle',
      paint: {
        'circle-radius': 6,
        'circle-color': color,
        'circle-opacity': 0.8,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    };
  }

  // Polygon/Fill layers
  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    return {
      id: `${layerId}-polygons`,
      type: 'fill',
      paint: {
        'fill-color': color,
        'fill-opacity': 0.3,
        'fill-outline-color': color
      }
    };
  }

  // Line/LineString layers
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
    return {
      id: `${layerId}-lines`,
      type: 'line',
      paint: {
        'line-color': color,
        'line-width': 2,
        'line-opacity': 0.8
      }
    };
  }
};
```

### Mock Database Configuration

Location: `frontend/src/services/mockDatabase.js`

```javascript
// Sample data structure - customize as needed
const mockPottery = [
  {
    id: 1,
    square: 'A-12',
    tract: 'Tract 1',
    type: 'Fine Ware',
    period: 'Classical',
    subtype: 'Red-Figure',
    count: 15,
    weight_g: 234,
    description: 'Description...',
    coordinates: [22.721, 37.981],

    // Optional media fields
    image: 'https://example.com/pottery-001.jpg',
    images: [
      'https://example.com/pottery-001a.jpg',
      'https://example.com/pottery-001b.jpg'
    ],
    pdf_report: 'https://example.com/reports/pottery-001.pdf',
    external_reference: 'https://zenodo.org/records/1054450'
  }
  // ... more entries
];
```

## API Configuration

### API Client

Location: `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
                     'http://localhost:3180/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add auth, logging, etc.)
api.interceptors.request.use(
  config => {
    if (process.env.REACT_APP_ENABLE_DEBUG === 'true') {
      console.log('API Request:', config);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor (error handling, logging)
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
```

## Coordinate Transformation Configuration

Location: `backend/src/services/coordinateTransform.service.js`

```javascript
const proj4 = require('proj4');

// Greek Grid (EGSA '87) - EPSG:2100
proj4.defs('EPSG:2100',
  '+proj=tmerc ' +
  '+lat_0=0 ' +
  '+lon_0=24 ' +
  '+k=0.9996 ' +
  '+x_0=500000 ' +
  '+y_0=0 ' +
  '+ellps=GRS80 ' +
  '+towgs84=-199.87,74.79,246.62,0,0,0,0 ' +
  '+units=m ' +
  '+no_defs'
);

// WGS84 - EPSG:4326 (default)
// Already defined in proj4

// Transform function
function transformToWGS84(coords) {
  // coords: [x, y] or [x, y, z]
  // Returns: [longitude, latitude] or [longitude, latitude, z]

  // Check if already in WGS84 range
  const [x, y] = coords;
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    return coords; // Already WGS84
  }

  // Transform from EPSG:2100 to EPSG:4326
  const [lon, lat] = proj4('EPSG:2100', 'EPSG:4326', [x, y]);

  // Preserve elevation if present
  return coords.length === 2 ? [lon, lat] : [lon, lat, coords[2]];
}
```

## Build Configuration

### Production Build

Location: `frontend/package.json`

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "source-map-explorer 'build/static/js/*.js'"
  },

  "homepage": ".",  // For relative paths in production
}
```

### Environment-Specific Builds

```bash
# Development build
npm run build

# Production build with optimizations
GENERATE_SOURCEMAP=false npm run build

# Build with custom API URL
REACT_APP_API_URL=https://api.example.com npm run build
```

## Performance Configuration

### Backend Caching

Location: `backend/src/services/data.service.js`

```javascript
// In-memory cache
const geoJSONCache = {};
const CACHE_ENABLED = process.env.ENABLE_CACHE !== 'false';
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600', 10);

// Cache with TTL
const cacheWithTTL = {
  data: {},
  timestamps: {},

  set(key, value) {
    if (!CACHE_ENABLED) return;
    this.data[key] = value;
    this.timestamps[key] = Date.now();
  },

  get(key) {
    if (!CACHE_ENABLED) return null;
    const age = Date.now() - (this.timestamps[key] || 0);
    if (age > CACHE_TTL * 1000) {
      delete this.data[key];
      delete this.timestamps[key];
      return null;
    }
    return this.data[key];
  }
};
```

## Security Configuration

### Production Security Headers

Add to `backend/src/index.js`:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

## Logging Configuration

### Development Logging

```javascript
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}
```

### Production Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## Configuration Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use environment variables** for sensitive/environment-specific config
3. **Validate configuration** on startup
4. **Document all options** in code comments
5. **Provide sensible defaults** for all optional settings
6. **Use type checking** for configuration values
7. **Separate dev/prod configs** using NODE_ENV
