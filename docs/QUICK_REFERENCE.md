# Quick Reference Guide

## Essential Commands

### Start Application

```bash
# Backend (Terminal 1)
cd backend && npm start

# Frontend (Terminal 2)
cd frontend && npm start
```

### Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Access URLs

- **Frontend**: http://localhost:3100
- **Backend API**: http://localhost:3180/api
- **API Layers**: http://localhost:3180/api/layers

## Key File Locations

### Configuration

| File | Purpose |
|------|---------|
| `backend/src/config/layerConfig.js` | Layer ordering, filtering, visibility |
| `frontend/.env` | Frontend port and environment |
| `backend/src/index.js` | Backend port and CORS |
| `frontend/package.json` | Proxy and script configuration |

### Data

| Path | Contents |
|------|----------|
| `backend/data/sample-data/` | GeoJSON data files |
| `frontend/src/services/mockDatabase.js` | Mock database data |

### Components

| File | Component |
|------|-----------|
| `frontend/src/pages/LandingPage.js` | Home page |
| `frontend/src/pages/MapPage.js` | Map view |
| `frontend/src/pages/DatabaseView.js` | Database query interface |
| `frontend/src/components/FeatureModal.js` | Feature popups |
| `frontend/src/components/MapView.js` | Map rendering |

## Common Tasks

### Change Ports

**Frontend (3100 → 3200):**
```bash
# Edit frontend/.env
PORT=3200

# Or edit frontend/package.json
"start": "PORT=3200 react-scripts start"
```

**Backend (3180 → 3280):**
```bash
# Edit backend/src/index.js
const PORT = process.env.PORT || 3280;

# Update CORS
const CORS_ORIGIN = 'http://localhost:3200';

# Update frontend proxy (frontend/package.json)
"proxy": "http://localhost:3280"
```

### Add New Layer

1. **Add GeoJSON file:**
   ```bash
   cp your-layer.geojson backend/data/sample-data/
   ```

2. **Configure layer** (`backend/src/config/layerConfig.js`):
   ```javascript
   layerOrder: [
     'existing-layer',
     'your-layer'  // Add here
   ],

   layerSettings: {
     'your-layer': {
       name: 'Display Name',
       description: 'Description',
       defaultVisible: true
     }
   }
   ```

3. **Restart backend**

### Enable/Disable Layer Filtering

**Edit** `backend/src/config/layerConfig.js`:

```javascript
// Disable filtering
noFilterLayers: [
  'base-layer',
  'your-layer'  // Add here to disable filtering
],

// Enable filtering (remove from noFilterLayers list)
```

### Convert Shapefile to GeoJSON

```bash
# Single file
ogr2ogr -f GeoJSON output.geojson input.shp

# Batch convert
./scripts/convert-all-shapefiles.sh /path/to/shapefiles
```

## API Quick Reference

### GET /api/layers
Returns list of all layers with metadata.

**Response:**
```json
[
  {
    "id": "pottery",
    "name": "Pottery Finds",
    "visible": true,
    "allowFiltering": false
  }
]
```

### GET /api/layers/:id
Returns GeoJSON for specific layer.

**Example:**
```bash
curl http://localhost:3180/api/layers/pottery
```

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [...]
}
```

## Coordinate Systems

### Input (Greek Grid - EPSG:2100)
```
X: 386813 m
Y: 4204087 m
```

### Output (WGS84 - EPSG:4326)
```
Longitude: 22.713°
Latitude: 37.980°
```

**Transformation:** Automatic via proj4 on backend

## Troubleshooting Quick Fixes

### Port in use
```bash
lsof -ti:3100 | xargs kill -9
lsof -ti:3180 | xargs kill -9
```

### Clear cache
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Map not showing
```bash
# Check coordinates are WGS84 (not Greek Grid)
curl http://localhost:3180/api/layers/pottery | jq '.features[0].geometry.coordinates'

# Should show: [22.xxx, 37.xxx]
# NOT: [386xxx, 4204xxx]
```

### CORS errors
1. Check `backend/src/index.js` - origin should match frontend
2. Check `frontend/package.json` - proxy should match backend
3. Restart both servers

## Layer Configuration Defaults

```javascript
{
  // Hide these layers completely
  excludedLayers: ['iso-2m', 'iso-2m-line', 'iso-2m-polygon'],

  // Render order (bottom to top)
  layerOrder: [
    'tracts', 'squares', 'cliffs',
    'geophysics-interpretation',
    'arch-features-line', 'arch-features-point',
    'architecture', 'pottery', 'coins'
  ],

  // Layers WITHOUT filtering
  noFilterLayers: [
    'tracts', 'squares', 'cliffs',
    'geophysics-magnetic', 'geophysics-resistivity',
    'pottery', 'architecture', 'coins'
  ],

  // Filtering ENABLED (not in noFilterLayers)
  // - arch-features-line
  // - arch-features-point
  // - geophysics-interpretation

  // Visible by default
  layerSettings: {
    pottery: { defaultVisible: true },
    architecture: { defaultVisible: true },
    coins: { defaultVisible: true }
  }
}
```

## Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push -u origin claude/create-sikyon-web-app-01WziEGeRUCzKCGJtGfWALcZ
```

## Test Endpoints

```bash
# Backend health
curl http://localhost:3180/api/layers

# Specific layer
curl http://localhost:3180/api/layers/pottery | jq '.'

# Check coordinates
curl http://localhost:3180/api/layers/pottery | jq '.features[0].geometry.coordinates'

# Frontend health
curl http://localhost:3100
```

## Directory Structure

```
web-sikyon/
├── backend/
│   ├── src/
│   │   ├── config/layerConfig.js      ← Layer configuration
│   │   ├── services/
│   │   │   ├── coordinateTransform.service.js
│   │   │   └── data.service.js
│   │   └── index.js                   ← Server entry point
│   └── data/sample-data/              ← GeoJSON files
├── frontend/
│   ├── src/
│   │   ├── pages/                     ← Page components
│   │   ├── components/                ← Reusable components
│   │   ├── services/                  ← API and data services
│   │   └── styles/                    ← CSS files
│   └── public/
├── docs/                              ← Documentation
└── scripts/                           ← Utility scripts
```

## Environment Variables

### Frontend (.env)
```bash
PORT=3100
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_API_URL=http://localhost:3180
```

### Backend (.env) - Optional
```bash
PORT=3180
NODE_ENV=development
CORS_ORIGIN=http://localhost:3100
DATA_DIR=./data/sample-data
```

## Keyboard Shortcuts (Browser)

- **F12** - Open DevTools
- **Ctrl+Shift+C / Cmd+Shift+C** - Inspect element
- **Ctrl+R / Cmd+R** - Reload page
- **Ctrl+Shift+R / Cmd+Shift+R** - Hard reload (clear cache)

## Feature Detection Patterns

### Images
Detected by field name or extension:
- `image`, `photo`, `picture`, `*.jpg`, `*.png`

### PDFs
- `pdf`, `document`, `report`, `*.pdf`

### URLs
- `url`, `link`, `reference`, `http://`, `https://`

## Quick Customization

### Change Map Center
**File:** `frontend/src/components/MapView.js`
```javascript
const SIKYON_CENTER = {
  longitude: 22.71,  // Change longitude
  latitude: 37.99,   // Change latitude
  zoom: 14          // Change zoom
};
```

### Change Layer Colors
**File:** `frontend/src/components/MapView.js`
```javascript
const baseColors = {
  'pottery': '#e74c3c',       // Red
  'architecture': '#3498db',  // Blue
  'coins': '#f39c12'          // Orange
};
```

### Add Special Field
**File:** `frontend/src/components/FeatureModal.js`
```javascript
const specialFields = [
  'name', 'type', 'count', 'period',
  'date', 'material',
  'your_field'  // Add here
];
```

## Production Build

```bash
# Frontend
cd frontend
npm run build

# Outputs to: frontend/build/

# Backend (no build needed - Node.js)
# Just ensure NODE_ENV=production
```

## Useful npm Scripts

```bash
# Backend
npm start              # Start server
npm install           # Install dependencies

# Frontend
npm start             # Start dev server
npm run build         # Production build
npm test              # Run tests
```

## Documentation Index

- **README.md** - Project overview
- **ARCHITECTURE.md** - System design
- **SETUP.md** - Installation guide
- **CONFIGURATION.md** - Config reference
- **DATA_MODEL.md** - Data structures
- **FEATURE_POPUPS.md** - Popup system
- **DATABASE_INTERFACE.md** - Query interface
- **TROUBLESHOOTING.md** - Problem solving
- **NEXT_STEPS.md** - Future development
- **QUICK_REFERENCE.md** - This file

## Support

For issues, check:
1. Browser console (F12)
2. Backend terminal output
3. TROUBLESHOOTING.md
4. GitHub issues
