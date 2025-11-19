# Setup Guide

## Prerequisites

### Required Software
- **Node.js**: Version 14.0 or higher
- **npm**: Version 6.0 or higher (comes with Node.js)
- **Git**: For version control

### Recommended Software
- **VS Code** or similar code editor
- **Postman** or similar API testing tool (for backend development)
- **ogr2ogr** (part of GDAL) - for shapefile conversion (optional)

### System Requirements
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **OS**: macOS, Linux, or Windows

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web-sikyon
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected dependencies:**
```
├── axios@1.6.2
├── cors@2.8.5
├── express@4.18.2
├── proj4@2.9.2
└── shpjs@4.0.4
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

**Expected dependencies:**
```
├── react@18.2.0
├── react-dom@18.2.0
├── react-router-dom@6.20.1
├── maplibre-gl@3.6.2
├── react-map-gl@7.1.7
├── axios@1.6.2
├── react-csv@2.2.2
└── react-scripts@5.0.1
```

### 4. Environment Configuration

#### Frontend Environment

Create or verify `frontend/.env`:

```bash
# frontend/.env
PORT=3100
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

**Note:** `DANGEROUSLY_DISABLE_HOST_CHECK` is only for development. Remove in production.

#### Backend Environment (Optional)

The backend uses default configuration, but you can create `backend/.env` for custom settings:

```bash
# backend/.env (optional)
PORT=3180
NODE_ENV=development
CORS_ORIGIN=http://localhost:3100
DATA_DIR=./data/sample-data
```

## Running the Application

### Development Mode

#### Terminal 1: Start Backend

```bash
cd backend
npm start
```

**Expected output:**
```
Sikyon backend server running on port 3180
Environment: development
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view sikyon-frontend in the browser.

  http://localhost:3100

Note that the development build is not optimized.
To create a production build, use npm run build.
```

The browser should automatically open to http://localhost:3100.

### Verify Installation

1. **Check Backend Health**
   ```bash
   curl http://localhost:3180/api/layers
   ```
   Should return JSON array of available layers.

2. **Check Frontend**
   - Navigate to http://localhost:3100
   - Should see the Sikyon Survey Project landing page
   - Click "Map" - should load interactive map
   - Click "Database" - should show query interface

3. **Test Map Interaction**
   - Toggle layers in sidebar
   - Click on a feature
   - Verify popup appears with feature details

## Data Setup

### Using Sample Data

The repository includes sample data in `backend/data/sample-data/`. This is automatically loaded by the backend.

**Sample data structure:**
```
backend/data/sample-data/
├── pottery.geojson
├── architecture.geojson
├── coins.geojson
├── geophysics-interpretation.geojson
├── arch-features-line.geojson
├── arch-features-point.geojson
├── tracts.geojson
├── squares.geojson
└── cliffs.geojson
```

### Converting Zenodo Shapefiles to GeoJSON

If you have the original Zenodo shapefiles:

#### Method 1: Using ogr2ogr (Recommended)

```bash
# Install GDAL (includes ogr2ogr)
# macOS:
brew install gdal

# Ubuntu/Debian:
sudo apt-get install gdal-bin

# Convert a shapefile
ogr2ogr -f GeoJSON \
  backend/data/sample-data/pottery.geojson \
  path/to/zenodo/pottery.shp
```

#### Method 2: Batch Conversion Script

Use the included conversion script:

```bash
# From project root
chmod +x scripts/convert-all-shapefiles.sh
./scripts/convert-all-shapefiles.sh /path/to/zenodo/shapefiles
```

**The script will:**
1. Find all `.shp` files recursively
2. Convert each to GeoJSON
3. Place results in `backend/data/sample-data/`
4. Show progress with colored output

### Data Directory Structure

```
backend/data/
├── sample-data/           # Current dataset (GeoJSON)
│   ├── *.geojson
│   └── README.md
├── shapefiles/           # Original shapefiles (optional)
│   └── *.shp
└── converted/            # Conversion outputs (optional)
    └── *.geojson
```

## Configuration

### Port Configuration

**Default ports:**
- Frontend: 3100
- Backend: 3180

**To change ports:**

1. **Frontend** - Edit `frontend/package.json`:
   ```json
   {
     "scripts": {
       "start": "PORT=3200 react-scripts start"
     }
   }
   ```
   Or update `frontend/.env`:
   ```
   PORT=3200
   ```

2. **Backend** - Edit `backend/src/index.js`:
   ```javascript
   const PORT = process.env.PORT || 3280;
   ```

3. **Update CORS** - Edit `backend/src/index.js`:
   ```javascript
   const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3200';
   ```

4. **Update Proxy** - Edit `frontend/package.json`:
   ```json
   {
     "proxy": "http://localhost:3280"
   }
   ```

### Layer Configuration

Edit `backend/src/config/layerConfig.js` to customize:

```javascript
module.exports = {
  // Hide specific layers
  excludedLayers: ['iso-2m', 'unwanted-layer'],

  // Control rendering order (bottom to top)
  layerOrder: [
    'base-layer',
    'middle-layer',
    'top-layer'
  ],

  // Disable filtering for specific layers
  noFilterLayers: ['base-layer', 'background'],

  // Layer-specific settings
  layerSettings: {
    'my-layer': {
      name: 'Display Name',
      description: 'Layer description',
      defaultVisible: true  // Show on load
    }
  }
};
```

## Troubleshooting Installation

### Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3100
```

**Solutions:**

1. **Find and kill process:**
   ```bash
   # macOS/Linux
   lsof -ti:3100 | xargs kill -9

   # Windows
   netstat -ano | findstr :3100
   taskkill /PID <PID> /F
   ```

2. **Use different port** (see Port Configuration above)

### Module Not Found

**Error:**
```
Module not found: Error: Can't resolve 'react-router-dom'
```

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

**Error in browser console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Verify backend CORS configuration** (`backend/src/index.js`):
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3100',
     credentials: true
   }));
   ```

2. **Check frontend proxy** (`frontend/package.json`):
   ```json
   "proxy": "http://localhost:3180"
   ```

3. **Restart both servers** after configuration changes

### Map Not Loading

**Symptoms:**
- Map container visible but no tiles
- Console shows coordinate errors

**Solutions:**

1. **Check coordinate transformation:**
   ```bash
   curl http://localhost:3180/api/layers/pottery | jq '.features[0].geometry.coordinates'
   ```
   Should show WGS84 coordinates (longitude, latitude):
   ```json
   [22.713, 37.980]
   ```
   NOT Greek Grid:
   ```json
   [386813, 4204087]
   ```

2. **Verify MapLibre GL CSS** is imported in `frontend/src/index.js`:
   ```javascript
   import 'maplibre-gl/dist/maplibre-gl.css';
   ```

### Build Errors

**Error:**
```
npm ERR! code ELIFECYCLE
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove lock files
rm package-lock.json

# Reinstall
npm install
```

## Development Workflow

### Typical Development Session

```bash
# Terminal 1: Backend with auto-reload
cd backend
npm install -g nodemon  # One-time install
nodemon src/index.js

# Terminal 2: Frontend with hot reload
cd frontend
npm start

# Terminal 3: Git operations
git status
git add .
git commit -m "Description"
git push
```

### Testing Backend API

```bash
# List layers
curl http://localhost:3180/api/layers

# Get specific layer
curl http://localhost:3180/api/layers/pottery

# Pretty print JSON
curl http://localhost:3180/api/layers/pottery | jq '.'

# Filter layer (example)
curl -X POST http://localhost:3180/api/layers/filter \
  -H "Content-Type: application/json" \
  -d '{"layerId": "pottery", "filters": {"type": "Fine Ware"}}'
```

### Code Formatting

```bash
# Frontend
cd frontend
npm run format  # If configured

# Or use Prettier directly
npx prettier --write "src/**/*.{js,jsx,css}"

# Backend
cd backend
npx prettier --write "src/**/*.js"
```

## Next Steps

After successful setup:

1. **Explore the application**
   - Visit each page (Home, Map, Database)
   - Test layer toggling and filtering
   - Try database queries and exports

2. **Review documentation**
   - Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
   - Check [DATA_MODEL.md](./DATA_MODEL.md) for data structures
   - See [FEATURE_POPUPS.md](./FEATURE_POPUPS.md) for popup customization

3. **Start customizing**
   - Add your own data to `backend/data/sample-data/`
   - Modify layer configuration in `backend/src/config/layerConfig.js`
   - Customize styles in `frontend/src/styles/`

4. **Plan production deployment**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
   - Review [NEXT_STEPS.md](./NEXT_STEPS.md) for future enhancements
