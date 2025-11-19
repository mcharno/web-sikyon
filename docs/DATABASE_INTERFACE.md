# Database Query Interface

## Overview

The Database Query Interface provides a user-friendly way to search, filter, and export archaeological data from the Sikyon Survey Project. Users can query pottery, architecture, and coin finds with multiple criteria and export results in various formats.

## User Interface Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Database View Page                      │
└─────────────────────────────────────────────────────────┘
              │
              ├─────┬─────────┬─────────┐
              │     │         │         │
              ▼     ▼         ▼         ▼
        ┌─────┴┐ ┌──┴──┐  ┌──┴──┐  ┌──┴──┐
        │Pottery│ │Arch │  │Coins│  │More │
        └───┬───┘ └──┬──┘  └──┬──┘  └─────┘
            │        │        │
            └────────┼────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Filter Controls│
            │  - Type        │
            │  - Period      │
            │  - Subtype     │
            │  - Square      │
            │  - Tract       │
            └────────┬───────┘
                     │
                [Click Search]
                     │
                     ▼
            ┌────────────────┐
            │  Results Table │
            │ (sortable)     │
            └────────┬───────┘
                     │
                     ├──────────────┬──────────────┐
                     │              │              │
                [View Details]  [Export CSV]  [View on Map]
                     │              │              │
                     ▼              ▼              ▼
              ┌──────────┐    ┌─────────┐    ┌──────────┐
              │ Detail   │    │CSV File │    │Map with  │
              │ View     │    │Download │    │Results   │
              │ w/Media  │    └─────────┘    │Overlay   │
              └──────────┘                   └──────────┘
```

## Components

### 1. Dataset Selector

```javascript
const [selectedDataset, setSelectedDataset] = useState('pottery');

const datasetConfig = {
  pottery: {
    name: 'Pottery',
    fields: ['type', 'period', 'subtype', 'square', 'tract'],
    displayFields: ['id', 'square', 'tract', 'type', 'period',
                    'subtype', 'count', 'weight_g', 'description']
  },
  architecture: {
    name: 'Architecture',
    fields: ['type', 'period', 'subtype', 'material', 'square', 'tract'],
    displayFields: ['id', 'square', 'tract', 'type', 'period',
                    'subtype', 'material', 'dimensions', 'description']
  },
  coins: {
    name: 'Coins',
    fields: ['period', 'emperor', 'denomination', 'condition', 'square', 'tract'],
    displayFields: ['id', 'square', 'tract', 'period', 'emperor',
                    'denomination', 'date_range', 'condition', 'description']
  }
};
```

### 2. Filter Controls

Dynamic filters based on selected dataset:

```javascript
const [filters, setFilters] = useState({});

// Generate filter controls
{config.fields.map(field => {
  const uniqueValues = getUniqueValues(selectedDataset, field);

  return (
    <div key={field} className="filter-group">
      <label>{formatFieldName(field)}</label>
      <select
        value={filters[field] || ''}
        onChange={(e) => handleFilterChange(field, e.target.value)}
      >
        <option value="">All</option>
        {uniqueValues.map(value => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
})}
```

### 3. Results Table

Displays filtered results in sortable table:

```javascript
<table className="results-table">
  <thead>
    <tr>
      {config.displayFields.map(field => (
        <th key={field} onClick={() => handleSort(field)}>
          {formatFieldName(field)}
          {sortField === field && (sortDir === 'asc' ? '↑' : '↓')}
        </th>
      ))}
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {results.map(item => (
      <tr key={item.id}>
        {config.displayFields.map(field => (
          <td key={field}>
            {truncate(item[field], 50)}
          </td>
        ))}
        <td>
          <button onClick={() => setSelectedItem(item)}>
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### 4. Detail View

Rich detail display with media support:

```javascript
const DetailView = ({ item, onClose }) => {
  const media = getMediaFields(item);

  return (
    <div className="detail-view">
      {/* Images Section */}
      {media.images.length > 0 && (
        <div className="detail-media-section">
          <h4>Images</h4>
          <div className="detail-media-gallery">
            {media.images.map(({ key, value }) => (
              <img
                key={key}
                src={value}
                alt={key}
                onClick={() => setSelectedImage(value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* PDFs Section */}
      {media.pdfs.length > 0 && (
        <div className="detail-documents-section">
          <h4>Documents</h4>
          {media.pdfs.map(({ key, value }) => (
            <a
              key={key}
              href={value}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 {formatFieldName(key)}
            </a>
          ))}
        </div>
      )}

      {/* Properties */}
      <div className="detail-properties">
        {Object.entries(item).map(([key, value]) => (
          <div key={key} className="detail-row">
            <span className="detail-label">{formatFieldName(key)}:</span>
            <span className="detail-value">{value || 'N/A'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Data Service

### Mock Database (Current Implementation)

```javascript
// frontend/src/services/mockDatabase.js

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
    description: 'Fragments of an Attic red-figure drinking cup',
    coordinates: [22.721, 37.981],
    image: 'https://example.com/pottery-001.jpg',
    pdf_report: 'https://example.com/reports/pottery-001.pdf'
  },
  // ... more entries
];

// Filter function
function filterData(data, filters) {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return item[key] === value;
    });
  });
}

// Getter functions
export function getPottery(filters = {}) {
  return filterData(mockPottery, filters);
}

export function getArchitecture(filters = {}) {
  return filterData(mockArchitecture, filters);
}

export function getCoins(filters = {}) {
  return filterData(mockCoins, filters);
}

// Get unique values for filter dropdowns
export function getUniqueValues(dataset, field) {
  const data = {
    pottery: mockPottery,
    architecture: mockArchitecture,
    coins: mockCoins
  }[dataset];

  return [...new Set(data.map(item => item[field]))].filter(Boolean).sort();
}
```

### Future PostgreSQL Implementation

```javascript
// backend/src/services/database.service.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function queryPottery(filters = {}) {
  // Build WHERE clause
  const conditions = [];
  const values = [];
  let paramCount = 1;

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      conditions.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // Execute query
  const query = `
    SELECT
      id, square, tract, type, period, subtype,
      count, weight_g, description,
      ST_AsGeoJSON(geometry)::json as geometry,
      image_urls, pdf_urls, external_refs
    FROM pottery
    ${whereClause}
    ORDER BY id
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

// Get unique values for filters
async function getUniqueValues(table, column) {
  const result = await pool.query(
    `SELECT DISTINCT ${column} FROM ${table}
     WHERE ${column} IS NOT NULL
     ORDER BY ${column}`
  );

  return result.rows.map(row => row[column]);
}

// Full-text search
async function searchPottery(searchTerm) {
  const result = await pool.query(
    `SELECT * FROM pottery
     WHERE to_tsvector('english', description || ' ' || type) @@
           to_tsquery('english', $1)`,
    [searchTerm.split(' ').join(' & ')]
  );

  return result.rows;
}

// Spatial query
async function queryWithinBounds(table, bounds) {
  const result = await pool.query(
    `SELECT * FROM ${table}
     WHERE ST_Within(
       geometry,
       ST_MakeEnvelope($1, $2, $3, $4, 4326)
     )`,
    [bounds.west, bounds.south, bounds.east, bounds.north]
  );

  return result.rows;
}
```

## Export Functions

### CSV Export

```javascript
import { CSVLink } from 'react-csv';

<CSVLink
  data={results}
  filename={`sikyon-${selectedDataset}-${new Date().toISOString().split('T')[0]}.csv`}
  className="export-btn"
>
  Export CSV
</CSVLink>
```

**Generated CSV:**
```csv
id,square,tract,type,period,subtype,count,weight_g,description
1,A-12,Tract 1,Fine Ware,Classical,Red-Figure,15,234,"Fragments of..."
2,A-13,Tract 1,Coarse Ware,Hellenistic,Storage,8,156,"Storage vessel..."
```

### GeoJSON Export

```javascript
export function exportToGeoJSON(data) {
  return {
    type: 'FeatureCollection',
    features: data
      .filter(item => item.coordinates)
      .map(item => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: item.coordinates
        },
        properties: {
          ...item,
          coordinates: undefined  // Remove from properties
        }
      }))
  };
}
```

### Map Visualization

```javascript
const handleViewOnMap = () => {
  // Convert results to GeoJSON
  const geojson = exportToGeoJSON(results);

  // Store in sessionStorage
  sessionStorage.setItem('mapQueryResults', JSON.stringify(geojson));

  // Navigate to map
  navigate('/map?from=database');
};
```

**In MapPage.js:**
```javascript
useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('from') === 'database') {
    const storedResults = sessionStorage.getItem('mapQueryResults');
    if (storedResults) {
      setQueryResults(JSON.parse(storedResults));
      sessionStorage.removeItem('mapQueryResults');
    }
  }
}, [location]);
```

**Map display:**
```javascript
{queryResults && (
  <Source id="query-results" type="geojson" data={queryResults}>
    <Layer
      id="query-results-circles"
      type="circle"
      paint={{
        'circle-radius': 8,
        'circle-color': '#10b981',  // Green
        'circle-opacity': 0.9,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3
      }}
    />
  </Source>
)}
```

## Advanced Features

### 1. Multi-Field Search

```javascript
const [searchTerm, setSearchTerm] = useState('');

function searchAll(term) {
  return data.filter(item => {
    const searchableText = [
      item.description,
      item.type,
      item.period,
      item.square
    ].join(' ').toLowerCase();

    return searchableText.includes(term.toLowerCase());
  });
}
```

### 2. Numeric Range Filters

```javascript
<div className="filter-group">
  <label>Count Range</label>
  <input
    type="number"
    placeholder="Min"
    value={filters.count_min || ''}
    onChange={(e) => setFilters({
      ...filters,
      count_min: e.target.value
    })}
  />
  <input
    type="number"
    placeholder="Max"
    value={filters.count_max || ''}
    onChange={(e) => setFilters({
      ...filters,
      count_max: e.target.value
    })}
  />
</div>

// In filter function
if (filters.count_min && item.count < parseInt(filters.count_min)) {
  return false;
}
if (filters.count_max && item.count > parseInt(filters.count_max)) {
  return false;
}
```

### 3. Saved Queries

```javascript
const [savedQueries, setSavedQueries] = useState([]);

function saveQuery(name) {
  const query = {
    id: Date.now(),
    name,
    dataset: selectedDataset,
    filters: { ...filters },
    createdAt: new Date().toISOString()
  };

  setSavedQueries([...savedQueries, query]);
  localStorage.setItem('savedQueries', JSON.stringify([...savedQueries, query]));
}

function loadQuery(query) {
  setSelectedDataset(query.dataset);
  setFilters(query.filters);
  handleSearch();
}
```

### 4. Sorting

```javascript
const [sortField, setSortField] = useState('id');
const [sortDirection, setSortDirection] = useState('asc');

function sortResults(data, field, direction) {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (typeof aVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}
```

### 5. Pagination

```javascript
const [page, setPage] = useState(1);
const [perPage] = useState(50);

const paginatedResults = useMemo(() => {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return sortedResults.slice(start, end);
}, [sortedResults, page, perPage]);

<Pagination>
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>
  <span>Page {page} of {Math.ceil(results.length / perPage)}</span>
  <button
    disabled={page >= Math.ceil(results.length / perPage)}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>
</Pagination>
```

## API Endpoints (Future)

### Query Endpoint

```javascript
// GET /api/query/pottery
router.get('/api/query/:dataset', async (req, res) => {
  const { dataset } = req.params;
  const filters = req.query;

  try {
    const results = await queryDataset(dataset, filters);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/query/advanced
router.post('/api/query/advanced', async (req, res) => {
  const {
    datasets,      // ['pottery', 'coins']
    filters,       // { type: 'Fine Ware', period: 'Classical' }
    spatial,       // { bounds: {...}, buffer: 100 }
    dateRange,     // { start: '450 BCE', end: '400 BCE' }
    textSearch     // 'red figure kylix'
  } = req.body;

  // Complex query logic
  const results = await advancedQuery(req.body);
  res.json(results);
});
```

### Export Endpoint

```javascript
// GET /api/export/:dataset?format=csv
router.get('/api/export/:dataset', async (req, res) => {
  const { dataset } = req.params;
  const { format = 'csv' } = req.query;
  const filters = req.query;

  const data = await queryDataset(dataset, filters);

  switch (format) {
    case 'csv':
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${dataset}.csv"`);
      res.send(convertToCSV(data));
      break;

    case 'geojson':
      res.setHeader('Content-Type', 'application/geo+json');
      res.json(convertToGeoJSON(data));
      break;

    case 'shapefile':
      const zip = await convertToShapefile(data);
      res.setHeader('Content-Type', 'application/zip');
      res.send(zip);
      break;
  }
});
```

## Best Practices

1. **Performance**
   - Paginate large result sets
   - Index frequently filtered fields
   - Cache common queries
   - Debounce search inputs

2. **User Experience**
   - Clear filter button
   - Show result count
   - Loading indicators
   - Empty state messages
   - Keyboard shortcuts

3. **Data Quality**
   - Validate filter inputs
   - Handle missing data gracefully
   - Normalize values for comparison
   - Provide data quality indicators

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels
   - Focus management
   - Color contrast

5. **Mobile Responsiveness**
   - Touch-friendly controls
   - Collapsible filters
   - Horizontal scrolling tables
   - Responsive layout
