# Sikyon Data Conversion Scripts

Utilities for converting Sikyon Survey Project data formats.

## Available Scripts

### `convert-all-shapefiles.sh`

Batch converts all ESRI Shapefiles in a directory to GeoJSON format.

**Requirements:**
- GDAL/ogr2ogr installed

**Usage:**
```bash
./convert-all-shapefiles.sh <input_directory> [output_directory]
```

**Examples:**
```bash
# Convert all shapefiles from downloaded Sikyon data
./convert-all-shapefiles.sh ~/Downloads/sikyon-data/GIS

# Convert and save directly to backend data folder
./convert-all-shapefiles.sh ~/Downloads/sikyon-data/GIS ../backend/public/data

# Convert with default output to ./geojson-output
./convert-all-shapefiles.sh ./my-shapefiles
```

**Features:**
- ✓ Recursively finds all `.shp` files
- ✓ Converts to WGS84 GeoJSON
- ✓ Preserves directory structure
- ✓ Shows progress and feature counts
- ✓ Colorized output for easy reading
- ✓ Error handling and validation
- ✓ Checks for existing files
- ✓ Summary report at completion

**Sample Output:**
```
╔════════════════════════════════════════════════════════╗
║   Sikyon Shapefile to GeoJSON Batch Converter         ║
╚════════════════════════════════════════════════════════╝

Input directory:  /Users/user/sikyon-data/GIS
Output directory: /Users/user/web-sikyon/backend/public/data

Searching for shapefiles...
Found 8 shapefile(s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Converting: Pottery_Finds.shp
✓ Success
  Output: backend/public/data/pottery-finds.geojson
  Features: 1247
  Size: 2.3M

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Converting: Architecture.shp
✓ Success
  Output: backend/public/data/architecture.geojson
  Features: 89
  Size: 456K

╔════════════════════════════════════════════════════════╗
║   Conversion Summary                                   ║
╚════════════════════════════════════════════════════════╝

Total shapefiles found: 8
Successfully converted: 8

GeoJSON files saved to: backend/public/data

Next steps:
  1. Review the converted files in: backend/public/data
  2. Copy desired files to: backend/public/data/
  3. Restart the backend server
  4. Refresh the web application
```

---

### Installing GDAL

**macOS:**
```bash
brew install gdal
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install gdal-bin
```

**Windows:**
- Download from https://gdal.org/
- Or use OSGeo4W installer

**Verify installation:**
```bash
ogr2ogr --version
# Should output: GDAL 3.x.x, released...
```

---

## Troubleshooting

### "Permission denied"

Make the script executable:
```bash
chmod +x convert-all-shapefiles.sh
```

### "ogr2ogr: command not found"

Install GDAL (see above)

### No shapefiles found

Check your input directory path:
```bash
ls ~/Downloads/sikyon-data/GIS/*.shp
```

### Files in wrong location

The script preserves directory structure. If shapefiles are nested:
```
input/
  └── subfolder/
      └── data.shp
```

Output will be:
```
output/
  └── subfolder/
      └── data.geojson
```

To flatten the structure, copy files to a single directory first:
```bash
find ~/sikyon-data/GIS -name "*.shp" -exec cp {} ./temp-shapefiles/ \;
./convert-all-shapefiles.sh ./temp-shapefiles
```

---

## Advanced Usage

### Convert with coordinate system transformation

Edit the script and modify the ogr2ogr command to include:
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 "$output_file" "$shp_file"
```

### Filter during conversion

Add a WHERE clause to the ogr2ogr command:
```bash
ogr2ogr -f GeoJSON -where "Period='Roman'" "$output_file" "$shp_file"
```

### Simplify geometries

For large polygon datasets, add simplification:
```bash
ogr2ogr -f GeoJSON -simplify 0.0001 "$output_file" "$shp_file"
```

---

For more detailed information, see [DATA_LOADING_GUIDE.md](../DATA_LOADING_GUIDE.md)
