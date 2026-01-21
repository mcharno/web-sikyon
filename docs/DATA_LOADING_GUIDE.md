# Sikyon Data Loading Guide

Complete guide for downloading, converting, and loading the Sikyon Survey Project data.

## Quick Method (Automated)

### Step 1: Download the Data

```bash
# Visit the Zenodo repository
open https://zenodo.org/records/1054450

# Or use wget/curl to download directly (requires ~3.1 GB free space)
wget https://zenodo.org/records/1054450/files/sikyon-survey-project-dissemination.zip
```

### Step 2: Extract the Archive

```bash
# Extract the downloaded file
unzip sikyon-survey-project-dissemination.zip -d sikyon-data

# Navigate to see the structure
cd sikyon-data
ls -la
```

Expected structure:
```
sikyon-data/
├── Database/          # Microsoft Access files
├── GIS/              # ESRI Shapefiles (what we need!)
├── Geophysics/       # Magnetometry and GPR data
└── Photographs/      # Field photos and documentation
```

### Step 3: Convert All Shapefiles to GeoJSON

**Using the automated script (recommended):**

```bash
# Make sure you're in the web-sikyon directory
cd /path/to/web-sikyon

# Run the conversion script
./scripts/convert-all-shapefiles.sh ~/Downloads/sikyon-data/GIS ./backend/public/data
```

This will:
- Find all `.shp` files in the GIS directory
- Convert each to GeoJSON format
- Preserve directory structure
- Show progress and feature counts
- Save directly to the backend data folder

### Step 4: Restart and View

```bash
# Restart the backend (if running)
# Stop with Ctrl+C, then:
npm run server:dev

# Or restart both servers
npm run dev
```

Open http://localhost:3000 and your data should appear on the map!

---

## Manual Method (Individual Files)

### Option A: Using GDAL Command Line

```bash
# Install GDAL if needed
# macOS:
brew install gdal

# Ubuntu/Debian:
sudo apt-get install gdal-bin

# Convert a single shapefile
ogr2ogr -f GeoJSON output.geojson input.shp

# Example: Convert pottery finds
ogr2ogr -f GeoJSON pottery.geojson sikyon-data/GIS/Pottery_Finds.shp
```

### Option B: Using Online Tools

1. Visit https://mapshaper.org/
2. Click "Select" and upload these files together:
   - `filename.shp`
   - `filename.shx`
   - `filename.dbf`
   - `filename.prj` (if available)
3. Click "Export" → Select "GeoJSON"
4. Download and save to `backend/public/data/`

### Option C: Using Node.js Script

```bash
# Use the included Node.js converter
cd backend
node scripts/convert-shapefile.js ../sikyon-data/GIS/Pottery.shp public/data/pottery.geojson
```

---

## Understanding the Data Structure

### GIS Directory Contents

The Sikyon GIS folder typically contains:

- **Survey Grids**: Grid squares used during field survey
- **Pottery Scatters**: Distribution of pottery finds
- **Architectural Features**: Building foundations, walls
- **Survey Tracts**: Areas covered in the survey
- **Topographic Features**: Terrain and landscape data

### GeoJSON Property Fields

Common fields you'll find in the data:

```javascript
{
  "type": "Feature",
  "geometry": { ... },
  "properties": {
    "OBJECTID": "unique identifier",
    "Tract": "survey tract number",
    "Square": "grid square reference",
    "Period": "Archaeological period (e.g., Classical, Hellenistic, Roman)",
    "Type": "Feature type (e.g., pottery, architecture)",
    "Count": "number of artifacts",
    "Notes": "field notes and descriptions",
    // ... more fields depending on the layer
  }
}
```

---

## Troubleshooting

### Problem: "ogr2ogr: command not found"

**Solution:** Install GDAL first
```bash
# macOS
brew install gdal

# Ubuntu/Debian
sudo apt-get install gdal-bin

# Verify installation
ogr2ogr --version
```

### Problem: "No such file or directory"

**Solution:** Use absolute paths
```bash
# Instead of:
./scripts/convert-all-shapefiles.sh sikyon-data/GIS

# Use:
./scripts/convert-all-shapefiles.sh ~/Downloads/sikyon-data/GIS
```

### Problem: Conversion succeeds but no data appears

**Checklist:**
1. ✓ Verify GeoJSON files are in `backend/public/data/`
   ```bash
   ls -lh backend/public/data/
   ```

2. ✓ Check files have content
   ```bash
   head backend/public/data/pottery.geojson
   ```

3. ✓ Verify coordinate system (should be WGS84, EPSG:4326)
   ```bash
   # If coordinates look wrong, reproject:
   ogr2ogr -f GeoJSON -t_srs EPSG:4326 output.geojson input.shp
   ```

4. ✓ Restart backend server
   ```bash
   # Ctrl+C to stop, then:
   npm run server:dev
   ```

5. ✓ Check browser console for errors (F12)

### Problem: "Features appear in wrong location"

**Solution:** The shapefile might be in a different coordinate system. Reproject to WGS84:

```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 \
  backend/public/data/pottery.geojson \
  sikyon-data/GIS/Pottery.shp
```

### Problem: File names have spaces or special characters

The script handles this automatically, but if you're converting manually:

```bash
# Use quotes around filenames
ogr2ogr -f GeoJSON "output.geojson" "My Shapefile With Spaces.shp"
```

---

## Advanced: Selective Loading

### Load Only Specific Periods

You can filter during conversion:

```bash
# Only Roman period features
ogr2ogr -f GeoJSON \
  -where "Period = 'Roman'" \
  roman-only.geojson \
  input.shp
```

### Simplify Large Datasets

For better performance with large polygon datasets:

```bash
# Simplify geometry to reduce file size
ogr2ogr -f GeoJSON \
  -simplify 0.0001 \
  simplified.geojson \
  input.shp
```

### Convert with Specific Fields Only

```bash
# Only include certain attribute fields
ogr2ogr -f GeoJSON \
  -select "Period,Type,Description" \
  filtered.geojson \
  input.shp
```

---

## Customizing Layer Names and Colors

After loading data, you may want to customize how it appears:

### 1. Rename Files for Better Display

```bash
# The filename becomes the layer ID
mv backend/public/data/SIKYON_POTTERY_FINDS_2010.geojson \
   backend/public/data/pottery.geojson
```

### 2. Update Layer Colors

Edit `frontend/src/components/MapView.js` around line 68:

```javascript
const colors = {
  pottery: '#ef4444',        // Red for pottery
  architecture: '#3b82f6',   // Blue for architecture
  coins: '#f59e0b',          // Orange for coins
  'survey-grids': '#10b981', // Green for grids
  // Add your layers here:
  'topography': '#8b5cf6',   // Purple
};
```

---

## Performance Tips

### For Large Datasets (>10,000 features)

1. **Split into smaller files** by period or region
2. **Simplify geometries** as shown above
3. **Use clustering** for point data (future enhancement)
4. **Implement tile-based loading** for very large datasets

### Optimize GeoJSON Files

```bash
# Remove unnecessary precision from coordinates
ogr2ogr -f GeoJSON \
  -lco COORDINATE_PRECISION=5 \
  optimized.geojson \
  input.shp
```

---

## Verifying Your Data

### Check Feature Count

```bash
# Count features in GeoJSON
grep -c '"type":"Feature"' backend/public/data/pottery.geojson
```

### Inspect Properties

```bash
# View first feature properties
cat backend/public/data/pottery.geojson | jq '.features[0].properties'
```

### Check Bounding Box

```bash
# Get extent of the data
ogrinfo -al -so pottery.geojson | grep Extent
```

Expected for Sikyon area:
- Longitude: ~22.7° E
- Latitude: ~37.9° N

---

## Next Steps

After loading your data:

1. **Explore the map** - Pan, zoom, click features
2. **Test filters** - Try filtering by period, type, etc.
3. **Customize styling** - Adjust colors, sizes, opacity
4. **Add custom filters** - Modify the sidebar to add new filter types
5. **Export views** - Consider adding screenshot/export functionality

---

## Getting Help

- **Script issues**: Check script output for specific error messages
- **GDAL errors**: Run `ogr2ogr --help-general` for documentation
- **GeoJSON validation**: Use https://geojsonlint.com/
- **Coordinate issues**: Verify CRS with `ogrinfo -al -so input.shp`

## Data Attribution

When using Sikyon Survey data:

```
Sikyon Survey Project
Source: https://zenodo.org/records/1054450
License: Creative Commons Attribution Share Alike 4.0 International
```
