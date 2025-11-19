# Data Model

## Overview

This document describes the data structures, formats, and schemas used throughout the Sikyon web application.

## GeoJSON Structure

All spatial data is stored and transmitted as GeoJSON FeatureCollections.

### Standard GeoJSON Format

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [22.713, 37.980]
      },
      "properties": {
        "id": 1,
        "name": "Feature Name",
        "type": "Feature Type",
        ...additional properties
      }
    }
  ]
}
```

### Geometry Types

The application supports all standard GeoJSON geometry types:

- **Point**: Single coordinate `[lon, lat]`
- **MultiPoint**: Array of coordinates `[[lon1, lat1], [lon2, lat2]]`
- **LineString**: Array of coordinates forming a line
- **MultiLineString**: Array of LineStrings
- **Polygon**: Array of linear rings (first is exterior, rest are holes)
- **MultiPolygon**: Array of Polygons

## Coordinate Systems

### Input: Greek Grid (EPSG:2100)

**Official Name**: GGRS87 / Greek Grid
**Projection**: Transverse Mercator
**Units**: Meters

**Definition:**
```
+proj=tmerc
+lat_0=0
+lon_0=24
+k=0.9996
+x_0=500000
+y_0=0
+ellps=GRS80
+towgs84=-199.87,74.79,246.62,0,0,0,0
+units=m
+no_defs
```

**Example Coordinate:**
```
X (Easting): 386813 m
Y (Northing): 4204087 m
```

### Output: WGS84 (EPSG:4326)

**Official Name**: WGS 84
**Type**: Geographic (latitude/longitude)
**Units**: Decimal degrees

**Example Coordinate:**
```
Longitude: 22.713°
Latitude: 37.980°
```

### Transformation

All coordinates are automatically transformed on the backend:

```javascript
// Input (Greek Grid)
[386813, 4204087]

// After transformation (WGS84)
[22.713, 37.980]
```

## Layer Metadata Schema

### Layer List Response

```typescript
interface Layer {
  id: string;              // Unique layer identifier
  name: string;            // Display name
  description: string;     // Human-readable description
  visible: boolean;        // Current visibility state
  allowFiltering: boolean; // Whether filtering is enabled
  geometryType?: string;   // Point, LineString, Polygon, etc.
  featureCount?: number;   // Number of features in layer
}

// Example
{
  "id": "pottery",
  "name": "Pottery Finds",
  "description": "Ceramic artifacts and sherds",
  "visible": true,
  "allowFiltering": false,
  "geometryType": "Point",
  "featureCount": 1543
}
```

## Feature Properties

### Common Properties

All features should include these standard properties when available:

```typescript
interface CommonProperties {
  id?: number | string;     // Unique identifier
  name?: string;            // Feature name
  type?: string;            // Feature type/category
  description?: string;     // Detailed description
}
```

### Pottery Properties

```typescript
interface PotteryProperties extends CommonProperties {
  square?: string;          // Survey square (e.g., "A-12")
  tract?: string;           // Survey tract (e.g., "Tract 1")
  type: string;             // Pottery type (e.g., "Fine Ware")
  period: string;           // Time period (e.g., "Classical")
  subtype?: string;         // Subtype (e.g., "Red-Figure")
  count?: number;           // Number of sherds
  weight_g?: number;        // Weight in grams
  fabric?: string;          // Fabric type
  decoration?: string;      // Decoration style
  image?: string;           // URL to image
  images?: string[];        // Array of image URLs
  pdf_report?: string;      // URL to PDF report
  external_reference?: string; // External URL
}
```

**Example:**
```json
{
  "id": 1,
  "name": "Red-Figure Kylix Fragment",
  "type": "Fine Ware",
  "period": "Classical",
  "subtype": "Red-Figure",
  "count": 3,
  "weight_g": 234,
  "square": "A-12",
  "tract": "Tract 1",
  "description": "Fragments of an Attic red-figure drinking cup with figural decoration",
  "image": "https://example.com/pottery/kylix-001.jpg",
  "pdf_report": "https://example.com/reports/pottery-001.pdf"
}
```

### Architecture Properties

```typescript
interface ArchitectureProperties extends CommonProperties {
  square?: string;          // Survey square
  tract?: string;           // Survey tract
  type: string;             // Building type (e.g., "Wall")
  period: string;           // Time period
  subtype?: string;         // Subtype (e.g., "Foundation")
  material?: string;        // Construction material
  dimensions?: string;      // Size description
  preservation?: string;    // Preservation state
  orientation?: string;     // Cardinal direction
  image?: string;           // URL to image
  images?: string[];        // Array of image URLs
  pdf_report?: string;      // URL to PDF report
}
```

**Example:**
```json
{
  "id": 15,
  "name": "Building Foundation",
  "type": "Architecture",
  "period": "Hellenistic",
  "subtype": "Foundation Wall",
  "material": "Limestone blocks",
  "dimensions": "12m x 8m",
  "preservation": "Good",
  "orientation": "N-S",
  "square": "B-7",
  "tract": "Tract 2",
  "description": "Well-preserved foundation of rectangular building",
  "images": [
    "https://example.com/arch/building-015a.jpg",
    "https://example.com/arch/building-015b.jpg"
  ]
}
```

### Coins Properties

```typescript
interface CoinsProperties extends CommonProperties {
  square?: string;          // Survey square
  tract?: string;           // Survey tract
  period: string;           // Time period
  emperor?: string;         // Issuing emperor
  denomination?: string;    // Coin denomination
  date_range?: string;      // Date range (e.g., "350-340 BCE")
  mint?: string;            // Mint location
  condition?: string;       // Preservation condition
  weight_g?: number;        // Weight in grams
  diameter_mm?: number;     // Diameter in millimeters
  metal?: string;           // Metal type (e.g., "Bronze")
  obverse?: string;         // Obverse description
  reverse?: string;         // Reverse description
  image_obverse?: string;   // URL to obverse image
  image_reverse?: string;   // URL to reverse image
  pdf_report?: string;      // URL to PDF report
}
```

**Example:**
```json
{
  "id": 42,
  "name": "Bronze Coin of Sikyon",
  "period": "Hellenistic",
  "emperor": "Philip V",
  "denomination": "Bronze",
  "date_range": "221-179 BCE",
  "mint": "Sikyon",
  "condition": "Fair",
  "weight_g": 3.2,
  "diameter_mm": 18,
  "metal": "Bronze",
  "obverse": "Head of Zeus right",
  "reverse": "Dove flying left",
  "square": "C-15",
  "tract": "Tract 3",
  "image_obverse": "https://example.com/coins/042-obverse.jpg",
  "image_reverse": "https://example.com/coins/042-reverse.jpg"
}
```

### Geophysical Survey Properties

```typescript
interface GeophysicsProperties extends CommonProperties {
  survey_type?: string;     // Type (e.g., "Magnetometry")
  anomaly_type?: string;    // Anomaly classification
  interpretation?: string;  // Interpretation notes
  confidence?: string;      // Confidence level (Low/Medium/High)
  area_m2?: number;         // Area in square meters
  depth_estimate?: string;  // Estimated depth
  image?: string;           // Survey image
  pdf_report?: string;      // Detailed report
}
```

## Media Fields

### Image Fields

The system automatically detects image fields by:

1. **Field name contains:**
   - `image`
   - `photo`
   - `picture`

2. **Value ends with image extension:**
   - `.jpg`, `.jpeg`
   - `.png`
   - `.gif`, `.webp`

3. **Array field named:**
   - `images[]`
   - `photos[]`
   - `pictures[]`

**Single Image:**
```json
{
  "image": "https://example.com/photo.jpg",
  "photo_url": "https://example.com/artifact.png"
}
```

**Multiple Images:**
```json
{
  "images": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

### PDF Document Fields

The system automatically detects PDF fields by:

1. **Field name contains:**
   - `pdf`
   - `document`
   - `report`

2. **Value ends with:**
   - `.pdf`

3. **Array field named:**
   - `pdfs[]`
   - `documents[]`

**Example:**
```json
{
  "pdf_report": "https://example.com/report.pdf",
  "documentation": "https://example.com/study.pdf",
  "pdfs": [
    "https://example.com/report1.pdf",
    "https://example.com/report2.pdf"
  ]
}
```

### URL Fields

External reference URLs are detected by:

1. **Field name contains:**
   - `url`
   - `link`
   - `reference`
   - `external`

2. **Value starts with:**
   - `http://`
   - `https://`

**Example:**
```json
{
  "external_reference": "https://zenodo.org/records/1054450",
  "publication_url": "https://doi.org/10.1234/example",
  "website": "https://sikyon-survey.org"
}
```

## Filter Parameters

### Frontend Filter Request

```typescript
interface FilterRequest {
  layerId: string;          // Layer to filter
  filters: {
    [key: string]: string | number | boolean;
  };
}
```

**Example:**
```json
{
  "layerId": "pottery",
  "filters": {
    "period": "Classical",
    "type": "Fine Ware"
  }
}
```

### Filter Response

Returns a filtered GeoJSON FeatureCollection with matching features only.

## Database Query Interface

### Query Parameters

```typescript
interface QueryParams {
  dataset: 'pottery' | 'architecture' | 'coins';
  filters: {
    type?: string;
    period?: string;
    subtype?: string;
    square?: string;
    tract?: string;
    material?: string;        // Architecture only
    emperor?: string;         // Coins only
    denomination?: string;    // Coins only
    condition?: string;       // Coins only
  };
}
```

### Query Results

```typescript
interface QueryResult {
  id: number;
  [key: string]: any;       // All feature properties
}

type QueryResults = QueryResult[];
```

## Export Formats

### CSV Export

Headers are generated from object keys. All data is flattened:

```csv
id,square,tract,type,period,count,weight_g,description
1,A-12,Tract 1,Fine Ware,Classical,15,234,"Fragments of..."
2,A-13,Tract 1,Coarse Ware,Hellenistic,8,156,"Storage vessel..."
```

### GeoJSON Export

Standard GeoJSON FeatureCollection for map visualization:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [22.713, 37.980]
      },
      "properties": {
        "id": 1,
        "type": "Fine Ware",
        ...
      }
    }
  ]
}
```

## Data Validation

### Required Fields

**All Features:**
- `geometry` - Valid GeoJSON geometry
- `properties` - Object with at least one property

**Recommended Fields:**
- `id` - Unique identifier
- `type` - Feature classification
- `description` - Human-readable description

### Coordinate Validation

```javascript
function isValidWGS84(coords) {
  const [lon, lat] = coords;
  return lon >= -180 && lon <= 180 &&
         lat >= -90 && lat <= 90;
}

function isValidGreekGrid(coords) {
  const [x, y] = coords;
  // Approximate bounds for Greek Grid
  return x >= 200000 && x <= 800000 &&
         y >= 3800000 && y <= 4700000;
}
```

### Property Validation

```javascript
function validateProperties(props) {
  // Check for required fields
  if (!props.type) {
    console.warn('Missing type property');
  }

  // Validate data types
  if (props.count && typeof props.count !== 'number') {
    console.warn('Count should be a number');
  }

  // Validate URLs
  if (props.image && !isValidURL(props.image)) {
    console.warn('Invalid image URL');
  }
}
```

## Special Field Handling

### Priority Display Fields

These fields are displayed prominently in the UI:

1. `name` - Primary identifier
2. `type` - Classification
3. `count` - Quantity
4. `period` - Time period
5. `date` - Specific date
6. `material` - Material composition

### Excluded Fields

These fields are not displayed in property lists:

- `coordinates` - Shown on map
- `geometry` - Internal use
- `id` - Used for indexing
- Media fields (`image`, `pdf`, etc.) - Shown in dedicated sections

## Data Directory Structure

```
backend/data/
├── sample-data/                  # Active dataset
│   ├── pottery.geojson
│   ├── architecture.geojson
│   ├── coins.geojson
│   ├── geophysics-interpretation.geojson
│   ├── geophysics-magnetic.geojson
│   ├── geophysics-resistivity.geojson
│   ├── arch-features-line.geojson
│   ├── arch-features-point.geojson
│   ├── tracts.geojson
│   ├── squares.geojson
│   ├── cliffs.geojson
│   └── README.md
├── media/                        # Images and PDFs
│   ├── pottery/
│   ├── architecture/
│   ├── coins/
│   └── reports/
└── shapefiles/                  # Original data (optional)
    └── *.shp
```

## Future Database Schema

When migrating to PostgreSQL with PostGIS:

### Tables

```sql
-- Pottery table
CREATE TABLE pottery (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(100),
  period VARCHAR(100),
  subtype VARCHAR(100),
  count INTEGER,
  weight_g NUMERIC(10,2),
  square VARCHAR(20),
  tract VARCHAR(50),
  description TEXT,
  image_url VARCHAR(500),
  pdf_url VARCHAR(500),
  external_ref VARCHAR(500),
  geometry GEOMETRY(Point, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index
CREATE INDEX idx_pottery_geom ON pottery USING GIST(geometry);

-- Similar tables for architecture, coins, geophysics, etc.
```

### Views

```sql
-- Combined artifacts view
CREATE VIEW all_artifacts AS
SELECT id, 'pottery' as layer, name, type, period, geometry FROM pottery
UNION ALL
SELECT id, 'architecture' as layer, name, type, period, geometry FROM architecture
UNION ALL
SELECT id, 'coins' as layer, name, type, period, geometry FROM coins;
```

## Data Import Guidelines

1. **Preserve original data** - Keep source shapefiles
2. **Document transformations** - Log all coordinate conversions
3. **Validate on import** - Check geometry validity
4. **Normalize values** - Standardize periods, types, etc.
5. **Generate UUIDs** - Use consistent ID scheme
6. **Handle nulls** - Decide on null vs. empty string
7. **Sanitize text** - Remove special characters from descriptions
8. **Optimize geometry** - Simplify when appropriate
