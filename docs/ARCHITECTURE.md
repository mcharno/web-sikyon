# System Architecture

## Overview

The Sikyon web application follows a client-server architecture with a React frontend and Node/Express backend. The system is designed to handle archaeological survey data with spatial components, providing interactive visualization and querying capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Application                        │ │
│  │                    (Port 3100)                              │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ Landing Page │  │   Map Page   │  │ Database View│    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │    Header    │  │   Sidebar    │  │ FeatureModal │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐                       │ │
│  │  │   MapView    │  │  MapLibre GL │                       │ │
│  │  └──────────────┘  └──────────────┘                       │ │
│  │                                                             │ │
│  │  Services:                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐                       │ │
│  │  │   API Client │  │ Mock Database│                       │ │
│  │  └──────────────┘  └──────────────┘                       │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                            │ HTTP/REST API                       │
└────────────────────────────┼───────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Backend Server                        │
│                        (Port 3180)                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Express REST API                         │ │
│  │                                                             │ │
│  │  Endpoints:                                                 │ │
│  │  - GET  /api/layers              List available layers     │ │
│  │  - GET  /api/layers/:id          Get layer GeoJSON data    │ │
│  │  - POST /api/layers/filter       Filter layer data         │ │
│  │  - GET  /api/layers/:id/features Get feature details       │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────────┐ │
│  │                      Services Layer                         │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │Data Service  │  │Coord Transform│ │Layer Config  │    │ │
│  │  │              │  │               │  │              │    │ │
│  │  │- Load GeoJSON│  │- EPSG:2100   │  │- Ordering    │    │ │
│  │  │- Filter data │  │  ↓ EPSG:4326 │  │- Exclusions  │    │ │
│  │  │- Cache mgmt  │  │- proj4 lib   │  │- Filtering   │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    File System                              │ │
│  │                                                             │ │
│  │  data/sample-data/                                         │ │
│  │  ├── pottery.geojson                                       │ │
│  │  ├── architecture.geojson                                  │ │
│  │  ├── coins.geojson                                         │ │
│  │  ├── geophysics-*.geojson                                  │ │
│  │  └── [other layers].geojson                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App (Router)
│
├── Header
│   └── Navigation Links (Home, Map, Database, Data Source)
│
├── Route: / → LandingPage
│   └── Project description and navigation cards
│
├── Route: /map → MapPage
│   ├── Sidebar
│   │   ├── Layer toggles
│   │   └── Filter controls
│   ├── MapView
│   │   ├── MapLibre GL
│   │   ├── GeoJSON Sources
│   │   ├── Layer Rendering
│   │   └── Click handlers
│   └── FeatureModal (conditional)
│       ├── Special fields display
│       ├── Image gallery
│       ├── PDF documents
│       └── Property list
│
└── Route: /database → DatabaseView
    ├── Dataset selector (Pottery/Architecture/Coins)
    ├── Filter controls
    ├── Results table
    ├── Detail view
    │   ├── Image gallery
    │   ├── PDF documents
    │   └── Property details
    └── Export actions (CSV, Map)
```

## Data Flow

### Map Layer Loading

```
User visits /map
     │
     ▼
MapPage mounts
     │
     ├──→ Fetch layers list
     │    (GET /api/layers)
     │         │
     │         ▼
     │    Backend reads layerConfig
     │    Returns layer metadata
     │         │
     │         ▼
     │    Frontend receives layer list
     │    Stores in state
     │
     └──→ Load visible layers
          (GET /api/layers/:id for each)
               │
               ▼
          Backend:
          1. Read GeoJSON from file
          2. Transform coordinates (Greek Grid → WGS84)
          3. Cache result
          4. Return to frontend
               │
               ▼
          Frontend:
          1. Receive GeoJSON
          2. Create MapLibre Source
          3. Add Layers (circles/polygons/lines)
          4. Enable interactions
```

### Feature Click Flow

```
User clicks map feature
     │
     ▼
MapView onClick handler
     │
     ├──→ Extract feature properties
     ├──→ Extract layer ID
     └──→ Call onFeatureClick(feature, layerId)
          │
          ▼
     MapPage state update
     setSelectedFeature({properties, layerId})
          │
          ▼
     FeatureModal renders
          │
          ├──→ Parse special fields (name, type, count, etc.)
          ├──→ Detect media fields (images, PDFs)
          ├──→ Detect URL fields
          └──→ Render sections:
               - Highlights (special fields)
               - Description
               - Image gallery
               - PDF documents
               - Additional properties
```

### Database Query Flow

```
User enters filters → Clicks Search
     │
     ▼
DatabaseView state update
     │
     └──→ Call appropriate getter function
          (getPottery/getArchitecture/getCoins)
               │
               ▼
          mockDatabase.js
          Filters data based on criteria
               │
               ▼
          Returns filtered results
               │
               ▼
     DatabaseView displays results table
          │
          ├──→ User clicks "View" → Show detail view
          │    (with images, PDFs, properties)
          │
          ├──→ User clicks "Export CSV" → Download CSV
          │
          └──→ User clicks "View on Map" →
               1. Convert results to GeoJSON
               2. Store in sessionStorage
               3. Navigate to /map?from=database
               4. MapPage detects query param
               5. Loads query results from sessionStorage
               6. Renders as green overlay on map
```

## Layer Configuration System

The layer configuration provides centralized control over all map layers:

```javascript
// backend/src/config/layerConfig.js

{
  // Layers to completely exclude
  excludedLayers: ['iso-2m', 'iso-2m-line', ...],

  // Bottom-to-top rendering order
  layerOrder: [
    'tracts',
    'squares',
    'cliffs',
    'geophysics-*',
    'arch-features-line',
    'arch-features-point',
    'architecture',
    'pottery',
    'coins'
  ],

  // Layers without filtering capability
  noFilterLayers: [
    'tracts',
    'squares',
    'cliffs',
    // (all except arch-features-*, geophysics-interpretation)
  ],

  // Per-layer settings
  layerSettings: {
    'pottery': {
      name: 'Pottery Finds',
      description: 'Ceramic artifacts and sherds',
      defaultVisible: true
    },
    // ...
  }
}
```

## Coordinate Transformation

All spatial data undergoes coordinate transformation:

```
Input: Greek Grid (EPSG:2100)
[386813, 4204087]
     │
     ▼
proj4 transformation
     │
     ▼
Output: WGS84 (EPSG:4326)
[22.713, 37.980]
     │
     ▼
MapLibre GL rendering
```

**Transformation definition:**
```javascript
proj4.defs('EPSG:2100',
  '+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 ' +
  '+x_0=500000 +y_0=0 +ellps=GRS80 ' +
  '+towgs84=-199.87,74.79,246.62,0,0,0,0 ' +
  '+units=m +no_defs'
);
```

## State Management

### Frontend State

**MapPage:**
- `layers` - Array of layer metadata with visibility flags
- `filters` - Current filter criteria per layer
- `selectedFeature` - Currently clicked feature (for modal)
- `sidebarOpen` - Sidebar visibility toggle
- `queryResults` - GeoJSON from database queries

**DatabaseView:**
- `selectedDataset` - Current dataset (pottery/architecture/coins)
- `filters` - Filter criteria
- `results` - Query results array
- `selectedItem` - Item for detail view
- `selectedImage` - Image for lightbox

**MapView:**
- `viewState` - Map viewport (center, zoom)
- `layersData` - Cached GeoJSON data per layer
- `hoveredFeature` - Feature under cursor

### Backend State

**In-memory cache:**
- `geoJSONCache` - Transformed GeoJSON data keyed by layer ID
- Cache invalidation: On server restart or layer configuration change

## API Design

### REST Endpoints

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/layers` | List all layers | Layer metadata array |
| GET | `/api/layers/:id` | Get layer data | GeoJSON FeatureCollection |
| POST | `/api/layers/filter` | Filter layer | Filtered GeoJSON |
| GET | `/api/layers/:id/features/:fid` | Get feature | Single feature details |

### Response Formats

**Layer metadata:**
```json
{
  "id": "pottery",
  "name": "Pottery Finds",
  "description": "Ceramic artifacts and sherds",
  "visible": true,
  "allowFiltering": true
}
```

**GeoJSON response:**
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
        "name": "Red-Figure Kylix",
        "type": "Fine Ware",
        "period": "Classical",
        "count": 3,
        "image": "https://example.com/image.jpg"
      }
    }
  ]
}
```

## Security Considerations

### Current Implementation
- CORS enabled for localhost development
- No authentication (read-only public data)
- No rate limiting
- Input validation on filter parameters

### Production Recommendations
- Add HTTPS/TLS
- Implement rate limiting
- Add request validation middleware
- Consider read-only API keys for tracking
- Implement CSP headers
- Add CSRF protection if adding write operations

## Performance Optimization

### Current Optimizations
1. **Backend caching**: Transformed GeoJSON cached in memory
2. **Selective loading**: Only visible layers loaded initially
3. **Client-side filtering**: Reduces server requests
4. **Lazy loading**: Images loaded on demand

### Future Optimizations
1. **Vector tiles**: Replace GeoJSON with PMTiles for large datasets
2. **Progressive loading**: Load high-detail data on zoom
3. **Service worker**: Cache static assets and API responses
4. **Database indexes**: When moving from mock to real database
5. **CDN**: Serve static assets and images from CDN

## Deployment Architecture

```
Production Environment (Recommended)

┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                        (HTTPS Termination)                       │
└────────────────┬────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌───────────────┐   ┌───────────────┐
│  Frontend     │   │  Backend      │
│  (Static)     │   │  (Node/Express│
│               │   │   API)        │
│  Nginx/CDN    │   │               │
│  Port 443     │   │  Port 3180    │
└───────────────┘   └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    │  + PostGIS    │
                    │               │
                    │  Port 5432    │
                    └───────────────┘
```

## Technology Decisions

### Why MapLibre GL?
- Open-source (vs. Mapbox GL)
- Modern vector tile support
- Better performance than Leaflet for large datasets
- 3D capabilities for future enhancements

### Why React?
- Component-based architecture
- Large ecosystem
- Good mapping library support
- Team familiarity

### Why Express?
- Lightweight
- Minimal API requirements
- Easy integration with spatial libraries
- Good for rapid prototyping

### Why proj4?
- Standard library for coordinate transformations
- Supports EPSG:2100 (Greek Grid)
- Widely used and tested
- Works in both Node.js and browsers
