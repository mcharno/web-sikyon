# Troubleshooting Guide

## Quick Diagnostics

### Health Check Commands

```bash
# Backend health
curl http://localhost:3180/api/layers
# Should return JSON array of layers

# Frontend health
curl http://localhost:3100
# Should return HTML

# Check processes
lsof -i :3100  # Frontend
lsof -i :3180  # Backend

# Check Node.js version
node --version  # Should be 14.0 or higher
npm --version   # Should be 6.0 or higher
```

## Common Issues

### 1. Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3100
Error: listen EADDRINUSE :::3180
```

**Causes:**
- Previous instance still running
- Another application using the port
- macOS AirPlay Receiver (port 5000/7000)

**Solutions:**

**Option A: Kill the process**
```bash
# macOS/Linux
lsof -ti:3100 | xargs kill -9
lsof -ti:3180 | xargs kill -9

# Windows
netstat -ano | findstr :3100
taskkill /PID <PID> /F
```

**Option B: Change ports**
```bash
# Frontend
cd frontend
# Edit package.json or .env
PORT=3200 npm start

# Backend
cd backend
# Edit src/index.js
PORT=3280 npm start
```

**Option C: Find and stop AirPlay (macOS)**
```
System Preferences → Sharing → Uncheck "AirPlay Receiver"
```

---

### 2. Dependencies Not Installing

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

**Option A: Clear cache and reinstall**
```bash
cd frontend  # or backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Option B: Use legacy peer deps**
```bash
npm install --legacy-peer-deps
```

**Option C: Update npm**
```bash
npm install -g npm@latest
```

---

### 3. Map Not Loading or Displaying

**Symptoms:**
- Blank map area
- No tiles showing
- Console errors about coordinates

**Diagnosis:**

Check browser console (F12) for errors:
```javascript
// Good - WGS84 coordinates
coordinates: [22.713, 37.980]

// Bad - Greek Grid coordinates (not transformed)
coordinates: [386813, 4204087]
```

**Solutions:**

**Check coordinate transformation:**
```bash
# Test single layer
curl http://localhost:3180/api/layers/pottery | jq '.features[0].geometry.coordinates'

# Should show WGS84:
[22.713, 37.980]

# NOT Greek Grid:
[386813, 4204087]
```

**Verify proj4 is installed:**
```bash
cd backend
npm list proj4
# Should show: proj4@2.9.2 or similar
```

**Check MapLibre CSS:**
```javascript
// In frontend/src/index.js or App.js
import 'maplibre-gl/dist/maplibre-gl.css';
```

**Verify data files exist:**
```bash
ls backend/data/sample-data/*.geojson
# Should list GeoJSON files
```

---

### 4. CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:3180/api/layers'
from origin 'http://localhost:3100' has been blocked by CORS policy
```

**Solutions:**

**Check backend CORS config** (`backend/src/index.js`):
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3100',  // Must match frontend
  credentials: true
}));
```

**Check frontend proxy** (`frontend/package.json`):
```json
{
  "proxy": "http://localhost:3180"
}
```

**Restart both servers** after config changes:
```bash
# Kill both
pkill -f "node.*3100"
pkill -f "node.*3180"

# Restart
cd backend && npm start &
cd frontend && npm start &
```

---

### 5. Layers Not Showing

**Symptoms:**
- Sidebar shows layers
- Toggling doesn't work
- No features on map

**Diagnosis:**

**Check browser console:**
```javascript
// Should see logs like:
Loading layers: ['pottery', 'architecture', 'coins']
Rendering layer pottery: Point, 1543 features
```

**Check layer data:**
```bash
# Test API
curl http://localhost:3180/api/layers/pottery

# Check feature count
curl http://localhost:3180/api/layers/pottery | jq '.features | length'
```

**Solutions:**

**Check layer configuration:**
```javascript
// backend/src/config/layerConfig.js

// Make sure layer isn't excluded
excludedLayers: []  // Should NOT contain your layer

// Check layer order
layerOrder: [
  'pottery',  // Must be in this list
  'architecture',
  'coins'
]
```

**Check defaultVisible:**
```javascript
layerSettings: {
  'pottery': {
    defaultVisible: true  // Set to true to show on load
  }
}
```

**Verify GeoJSON is valid:**
```bash
cd backend/data/sample-data
cat pottery.geojson | jq '.type'
# Should output: "FeatureCollection"
```

---

### 6. Features Not Clickable

**Symptoms:**
- Map shows features
- Clicking does nothing
- No popup appears

**Diagnosis:**

**Check browser console for errors**

**Check interactiveLayerIds:**
```javascript
// In MapView.js
interactiveLayerIds={Object.keys(layersData).flatMap(id => [
  `${id}-circles`,
  `${id}-polygons`,
  `${id}-lines`
])}
```

**Solutions:**

**Verify onClick handler:**
```javascript
<Map
  onClick={handleMapClick}
  // ...
>
```

**Check if layer IDs match:**
```javascript
// Layer rendering
<Layer id={`${layerId}-circles`} />

// Interactive IDs
[`${layerId}-circles`]  // Must match exactly
```

**Test with console:**
```javascript
// Add to handleMapClick
const handleMapClick = (event) => {
  console.log('Map clicked:', event);
  console.log('Features:', event.features);
  // Should log feature data when clicking
};
```

---

### 7. Database Query Not Working

**Symptoms:**
- Search button doesn't work
- No results shown
- Console errors

**Solutions:**

**Check mock database:**
```javascript
// frontend/src/services/mockDatabase.js
// Verify data exists
console.log(mockPottery.length);  // Should be > 0
```

**Check filter function:**
```javascript
// Test in browser console
import { getPottery } from './services/mockDatabase';
console.log(getPottery({ type: 'Fine Ware' }));
```

**Verify state updates:**
```javascript
// In DatabaseView.js
const handleSearch = () => {
  console.log('Filters:', filters);
  const data = getPottery(filters);
  console.log('Results:', data);
  setResults(data);
};
```

---

### 8. Images Not Loading

**Symptoms:**
- Placeholder icons showing
- "Image not available" message
- Network errors in console

**Diagnosis:**

**Check image URLs:**
```bash
# Test URL in browser or curl
curl -I https://example.com/image.jpg
# Should return 200 OK
```

**Check CORS for images:**
```
Access-Control-Allow-Origin must be set for image domains
```

**Solutions:**

**Use CORS-friendly image hosts:**
- Direct links from your server
- Imgur, Cloudinary with CORS enabled
- Zenodo direct links

**Serve images from backend:**
```javascript
// backend/src/index.js
app.use('/media', express.static('data/media'));

// Use relative URLs
image: '/media/pottery/pot-001.jpg'
```

**Update image URLs in data:**
```javascript
// Change from:
image: 'file:///local/path.jpg'

// To:
image: 'https://your-server.com/media/pottery/pot-001.jpg'
```

---

### 9. Build Errors

**Symptoms:**
```
npm ERR! Failed at the build script
npm ERR! code ELIFECYCLE
```

**Solutions:**

**Clear build artifacts:**
```bash
cd frontend
rm -rf build node_modules .cache
npm install
npm run build
```

**Check for syntax errors:**
```bash
npm run lint
```

**Increase Node memory:**
```bash
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

---

### 10. Deployment Issues

**Symptoms:**
- Works locally, fails in production
- 404 errors on refresh
- API calls failing

**Solutions:**

**Configure React Router for production:**
```javascript
// Use HashRouter instead of BrowserRouter
import { HashRouter as Router } from 'react-router-dom';
```

Or configure server for SPA:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

**Update API URL:**
```bash
# .env.production
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Debug Mode

### Enable Debug Logging

**Backend:**
```javascript
// backend/src/index.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}
```

**Frontend:**
```javascript
// frontend/src/index.js
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true;
}

// Use in components
if (window.DEBUG) {
  console.log('Debug info:', data);
}
```

### Browser DevTools

**Network Tab:**
- Check API requests
- Verify response codes (200, 404, 500)
- Inspect response payloads

**Console Tab:**
- Look for errors (red)
- Check warnings (yellow)
- Review debug logs

**React DevTools:**
```bash
# Install extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

---

## Performance Issues

### Slow Map Loading

**Diagnosis:**
```javascript
// Add timing logs
console.time('loadLayers');
await loadAllLayers();
console.timeEnd('loadLayers');
```

**Solutions:**

**Reduce data size:**
```bash
# Simplify geometries
ogr2ogr -simplify 0.0001 output.geojson input.geojson
```

**Enable caching:**
```javascript
// backend/src/index.js
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

**Load only visible layers:**
```javascript
// Only load defaultVisible layers initially
const visibleLayers = layers.filter(l => l.visible);
```

---

## Getting Help

### Information to Provide

When reporting issues, include:

1. **Environment:**
   ```bash
   node --version
   npm --version
   cat /etc/os-release  # Linux
   sw_vers  # macOS
   ```

2. **Error messages:**
   - Full console output
   - Browser console errors
   - Network tab errors

3. **Steps to reproduce:**
   - What you did
   - What you expected
   - What actually happened

4. **Configuration:**
   - Port numbers
   - Environment variables
   - Layer configuration

### Useful Commands

```bash
# Check all dependencies
npm list

# Verify file integrity
find . -name "*.js" -exec node -c {} \;

# Check Git status
git status
git log -1

# Test API endpoints
curl -v http://localhost:3180/api/layers
curl -v http://localhost:3180/api/layers/pottery

# Check logs
tail -f backend/logs/error.log  # If logging enabled
```

### Reset to Clean State

```bash
# Full reset
cd web-sikyon

# Clean backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Clean frontend
cd ../frontend
rm -rf node_modules package-lock.json build
npm install

# Restart Git (if needed)
git clean -fdx  # CAUTION: Removes all untracked files
git reset --hard HEAD

# Restart servers
cd ../backend && npm start &
cd ../frontend && npm start &
```
