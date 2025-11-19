# Next Steps and Future Enhancements

## Immediate Priorities

### 1. Real Zenodo Data Integration

**Current State**: Using mock/sample data
**Goal**: Load complete Zenodo dataset into application

**Steps:**
1. Download complete Zenodo archive
   ```bash
   wget https://zenodo.org/record/1054450/files/sikyon-survey-data.zip
   unzip sikyon-survey-data.zip
   ```

2. Convert all shapefiles to GeoJSON
   ```bash
   chmod +x scripts/convert-all-shapefiles.sh
   ./scripts/convert-all-shapefiles.sh /path/to/shapefiles
   ```

3. Place in `backend/data/sample-data/`

4. Verify coordinate transformation
   ```bash
   # Should show WGS84 coordinates
   curl http://localhost:3180/api/layers/pottery | jq '.features[0].geometry.coordinates'
   ```

**Estimated time**: 4-8 hours

---

### 2. PostgreSQL Database Migration

**Current State**: File-based GeoJSON
**Goal**: PostgreSQL with PostGIS for scalable storage and querying

**Implementation:**

**A. Database Setup**
```bash
# Install PostgreSQL and PostGIS
# Ubuntu/Debian:
sudo apt-get install postgresql postgis

# macOS:
brew install postgresql postgis

# Create database
createdb sikyon_survey
psql sikyon_survey -c "CREATE EXTENSION postgis;"
```

**B. Schema Creation**
```sql
-- Create tables
CREATE TABLE pottery (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(100) NOT NULL,
  period VARCHAR(100),
  subtype VARCHAR(100),
  count INTEGER,
  weight_g NUMERIC(10,2),
  square VARCHAR(20),
  tract VARCHAR(50),
  description TEXT,
  image_urls TEXT[],
  pdf_urls TEXT[],
  external_refs TEXT[],
  geometry GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pottery_geom ON pottery USING GIST(geometry);
CREATE INDEX idx_pottery_type ON pottery(type);
CREATE INDEX idx_pottery_period ON pottery(period);

-- Repeat for architecture, coins, geophysics, etc.
```

**C. Data Import Script**
```javascript
// scripts/import-to-postgres.js
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sikyon_survey',
  password: 'your_password',
  port: 5432,
});

async function importGeoJSON(tableName, filePath) {
  const data = JSON.parse(fs.readFileSync(filePath));

  for (const feature of data.features) {
    const { properties, geometry } = feature;

    await pool.query(
      `INSERT INTO ${tableName} (name, type, period, geometry)
       VALUES ($1, $2, $3, ST_GeomFromGeoJSON($4))`,
      [
        properties.name,
        properties.type,
        properties.period,
        JSON.stringify(geometry)
      ]
    );
  }
}
```

**D. Update Backend API**
```javascript
// backend/src/services/database.service.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function getLayerData(layerId) {
  const result = await pool.query(
    `SELECT
       id,
       jsonb_build_object(
         'type', 'FeatureCollection',
         'features', jsonb_agg(
           jsonb_build_object(
             'type', 'Feature',
             'geometry', ST_AsGeoJSON(geometry)::jsonb,
             'properties', to_jsonb(row) - 'geometry'
           )
         )
       ) as geojson
     FROM ${layerId}
     GROUP BY id`
  );

  return result.rows[0]?.geojson;
}
```

**Estimated time**: 16-24 hours

---

### 3. Media Management System

**Current State**: External image/PDF URLs
**Goal**: Self-hosted media with upload capability

**Implementation:**

**A. Media Storage Structure**
```
backend/data/media/
├── pottery/
│   ├── thumbnails/
│   │   └── pottery-001-thumb.jpg
│   └── full/
│       └── pottery-001.jpg
├── architecture/
├── coins/
└── reports/
    └── pdf/
        └── report-001.pdf
```

**B. Upload API**
```javascript
// backend/src/routes/media.routes.js
const multer = require('multer');
const sharp = require('sharp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type; // pottery, architecture, etc.
    cb(null, `data/media/${type}/full/`);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/upload/:type', upload.single('image'), async (req, res) => {
  const { type } = req.params;
  const fullPath = req.file.path;

  // Generate thumbnail
  const thumbPath = fullPath.replace('/full/', '/thumbnails/')
                            .replace(/\.(jpg|png)$/, '-thumb.$1');

  await sharp(fullPath)
    .resize(300, 300, { fit: 'cover' })
    .toFile(thumbPath);

  res.json({
    full: `/media/${type}/full/${req.file.filename}`,
    thumbnail: `/media/${type}/thumbnails/${req.file.filename}`
  });
});
```

**C. Image Optimization**
```javascript
// Use sharp for optimization
const sharp = require('sharp');

await sharp(input)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 85, progressive: true })
  .toFile(output);
```

**Estimated time**: 12-16 hours

---

## Enhanced Features

### 4. Advanced Filtering

**Goal**: More sophisticated filtering with spatial queries

**Features:**
- Date range filtering
- Numeric range filtering (e.g., weight, count)
- Spatial filtering (within polygon, buffer)
- Combined filters with AND/OR logic
- Save filter presets

**Implementation:**
```javascript
// Advanced filter UI
<FilterBuilder>
  <FilterGroup operator="AND">
    <Filter field="period" operator="equals" value="Classical" />
    <Filter field="count" operator="greaterThan" value={10} />
    <FilterGroup operator="OR">
      <Filter field="type" operator="equals" value="Fine Ware" />
      <Filter field="type" operator="equals" value="Red-Figure" />
    </FilterGroup>
  </FilterGroup>
</FilterBuilder>

// PostGIS spatial query
SELECT * FROM pottery
WHERE ST_Within(
  geometry,
  ST_GeomFromText('POLYGON(...)', 4326)
)
AND period = 'Classical'
AND count > 10;
```

**Estimated time**: 20-24 hours

---

### 5. Data Export Options

**Goal**: Multiple export formats for research use

**Formats:**
- **CSV**: Current implementation
- **GeoJSON**: For GIS software
- **KML**: For Google Earth
- **Shapefile**: For ArcGIS/QGIS
- **Excel**: With formatted tables
- **PDF Report**: With maps and statistics

**Implementation:**
```javascript
// Excel export
const ExcelJS = require('exceljs');

async function exportToExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pottery Finds');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Period', key: 'period', width: 15 },
    // ...
  ];

  worksheet.addRows(data);

  // Style header
  worksheet.getRow(1).font = { bold: true };

  return await workbook.xlsx.writeBuffer();
}

// Shapefile export
const shpwrite = require('shp-write');

shpwrite.write(
  {
    layers: {
      pottery: { type: 'point', features: geojson.features }
    }
  },
  'zip',
  (err, buffer) => {
    // Send zip file
  }
);
```

**Estimated time**: 16-20 hours

---

### 6. Temporal Visualization

**Goal**: Visualize changes over time

**Features:**
- Timeline slider
- Period-based filtering
- Animated transitions between periods
- Temporal heatmaps

**Implementation:**
```javascript
// Timeline component
<Timeline
  periods={['Archaic', 'Classical', 'Hellenistic', 'Roman', 'Byzantine']}
  selectedPeriod={period}
  onPeriodChange={setPeriod}
/>

// Filter by period
useEffect(() => {
  const filteredLayers = layers.map(layer => ({
    ...layer,
    data: layer.data.features.filter(f =>
      f.properties.period === selectedPeriod
    )
  }));
  setVisibleLayers(filteredLayers);
}, [selectedPeriod]);

// Animation
const animatePeriods = async () => {
  for (const period of periods) {
    setSelectedPeriod(period);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};
```

**Estimated time**: 24-32 hours

---

### 7. 3D Terrain Visualization

**Goal**: 3D visualization with terrain

**Features:**
- Elevation data integration
- 3D building models
- Terrain profiles
- Viewshed analysis

**Implementation:**
```javascript
// MapLibre 3D terrain
<Map
  {...viewState}
  terrain={{
    source: 'mapbox-dem',
    exaggeration: 1.5
  }}
  pitch={60}  // 3D viewing angle
>
  <Source
    id="mapbox-dem"
    type="raster-dem"
    url="mapbox://mapbox.terrain-rgb"
  />

  {/* 3D buildings */}
  <Layer
    id="buildings-3d"
    type="fill-extrusion"
    paint={{
      'fill-extrusion-color': '#aaa',
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0.6
    }}
  />
</Map>
```

**Estimated time**: 32-40 hours

---

### 8. Statistical Dashboard

**Goal**: Analytics and statistics dashboard

**Features:**
- Find counts by type/period
- Distribution charts
- Heatmaps
- Comparative analysis

**Implementation:**
```javascript
// Using Recharts or D3.js
import { BarChart, Bar, PieChart, Pie, LineChart } from 'recharts';

<Dashboard>
  {/* Distribution by period */}
  <BarChart data={periodCounts}>
    <Bar dataKey="count" fill="#667eea" />
  </BarChart>

  {/* Find density heatmap */}
  <HeatMap
    data={spatialDensity}
    gradient={{
      0.0: '#ffffcc',
      0.5: '#fd8d3c',
      1.0: '#bd0026'
    }}
  />

  {/* Temporal trends */}
  <LineChart data={temporalTrends}>
    <Line type="monotone" dataKey="count" stroke="#667eea" />
  </LineChart>
</Dashboard>
```

**Estimated time**: 20-28 hours

---

## Infrastructure Improvements

### 9. Authentication and User Management

**Goal**: User accounts for data management

**Features:**
- User registration/login
- Role-based permissions (viewer, editor, admin)
- Personal saved filters and views
- Activity logging

**Implementation:**
```javascript
// JWT authentication
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected routes
router.post('/api/layers', authenticateToken, (req, res) => {
  // Only authenticated users can add layers
});

// Role-based access
const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.sendStatus(403);
  next();
};

router.delete('/api/layers/:id', authenticateToken, requireRole('admin'), ...);
```

**Estimated time**: 24-32 hours

---

### 10. Testing Suite

**Goal**: Comprehensive testing

**Tests to add:**
- Unit tests for data transformations
- Integration tests for API
- E2E tests for user workflows
- Performance tests

**Implementation:**
```javascript
// Jest unit tests
describe('Coordinate Transformation', () => {
  test('transforms Greek Grid to WGS84', () => {
    const input = [386813, 4204087];
    const output = transformToWGS84(input);
    expect(output[0]).toBeCloseTo(22.713, 3);
    expect(output[1]).toBeCloseTo(37.980, 3);
  });
});

// Cypress E2E tests
describe('Map Interaction', () => {
  it('displays feature popup on click', () => {
    cy.visit('/map');
    cy.get('.maplibregl-canvas').click(400, 300);
    cy.get('.modal-content').should('be.visible');
    cy.get('.modal-title').should('contain', 'Feature');
  });
});

// API tests with Supertest
const request = require('supertest');

describe('GET /api/layers', () => {
  it('returns layer list', async () => {
    const res = await request(app).get('/api/layers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
```

**Estimated time**: 40-48 hours

---

### 11. Performance Optimization

**Goal**: Faster loading and rendering

**Optimizations:**
- Vector tiles instead of GeoJSON
- Service worker for offline access
- CDN for static assets
- Database query optimization
- Lazy loading and code splitting

**Implementation:**

**A. Vector Tiles with PMTiles**
```bash
# Generate PMTiles
tippecanoe -o pottery.pmtiles pottery.geojson

# Serve with pmtiles server
pmtiles serve . --port 8080
```

```javascript
// Use in MapLibre
<Source
  id="pottery"
  type="vector"
  url="pmtiles://http://localhost:8080/pottery.pmtiles"
>
  <Layer
    id="pottery-circles"
    source-layer="pottery"
    type="circle"
  />
</Source>
```

**B. Service Worker**
```javascript
// public/service-worker.js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**C. Code Splitting**
```javascript
// Lazy load pages
const MapPage = lazy(() => import('./pages/MapPage'));
const DatabaseView = lazy(() => import('./pages/DatabaseView'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/map" element={<MapPage />} />
    <Route path="/database" element={<DatabaseView />} />
  </Routes>
</Suspense>
```

**Estimated time**: 32-40 hours

---

## Production Deployment

### 12. Production Infrastructure

**Goal**: Deploy to production environment

**Components:**
- Frontend: Static hosting (Netlify/Vercel/S3+CloudFront)
- Backend: Node.js server (AWS EC2/DigitalOcean/Heroku)
- Database: Managed PostgreSQL (AWS RDS/DigitalOcean)
- Media: Object storage (S3/DO Spaces)

**Deployment Steps:**

**A. Frontend (Netlify)**
```bash
# Build
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=build
```

**B. Backend (Docker)**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3180
CMD ["node", "src/index.js"]
```

```bash
# Build and deploy
docker build -t sikyon-backend .
docker push your-registry/sikyon-backend
```

**C. Database (AWS RDS)**
```bash
# Create instance
aws rds create-db-instance \
  --db-instance-identifier sikyon-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20

# Enable PostGIS
psql -h sikyon-db.xxx.rds.amazonaws.com -U admin
CREATE EXTENSION postgis;
```

**Estimated time**: 24-32 hours

---

## Documentation and Outreach

### 13. User Documentation

**To create:**
- User guide with screenshots
- Video tutorials
- API documentation (Swagger/OpenAPI)
- Data dictionary
- Citation guidelines

**Estimated time**: 16-24 hours

---

### 14. Academic Integration

**Features:**
- DOI assignment for datasets
- Citation export (BibTeX, RIS)
- Integration with ORCID
- Data versioning
- Persistent identifiers

**Estimated time**: 12-16 hours

---

## Priority Roadmap

### Phase 1: Core Data (1-2 months)
1. Real Zenodo data integration
2. PostgreSQL migration
3. Media management system

### Phase 2: Enhanced Features (2-3 months)
4. Advanced filtering
5. Data export options
6. Statistical dashboard

### Phase 3: Production (1-2 months)
7. Performance optimization
8. Testing suite
9. Production deployment

### Phase 4: Advanced Features (3-4 months)
10. Authentication
11. Temporal visualization
12. 3D visualization

### Phase 5: Academic Integration (1 month)
13. User documentation
14. Academic features

---

## Estimated Total Effort

- **Phase 1**: 120-160 hours
- **Phase 2**: 120-152 hours
- **Phase 3**: 96-120 hours
- **Phase 4**: 112-136 hours
- **Phase 5**: 28-40 hours

**Total**: 476-608 hours (12-15 weeks full-time)
