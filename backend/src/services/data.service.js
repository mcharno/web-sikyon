const fs = require('fs').promises;
const path = require('path');
const shp = require('shpjs');

const DATA_DIR = path.join(__dirname, '../../public/data');

// In-memory cache for loaded data
let layersCache = null;
let geoJSONCache = {};

/**
 * Initialize and get available layers from the data directory
 */
async function getAvailableLayers() {
  if (layersCache) {
    return layersCache;
  }

  try {
    // Check if data directory exists
    try {
      await fs.access(DATA_DIR);
    } catch {
      // Return sample data structure if no data is loaded yet
      return getSampleLayers();
    }

    const files = await fs.readdir(DATA_DIR);
    const layers = [];

    for (const file of files) {
      if (file.endsWith('.geojson')) {
        const layerId = file.replace('.geojson', '');
        const filePath = path.join(DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const geojson = JSON.parse(content);

        // Analyze the layer to determine categories
        const categories = extractCategories(geojson);

        layers.push({
          id: layerId,
          name: formatLayerName(layerId),
          type: geojson.features[0]?.geometry?.type || 'Unknown',
          featureCount: geojson.features.length,
          categories: categories,
          visible: true
        });
      }
    }

    layersCache = layers.length > 0 ? layers : getSampleLayers();
    return layersCache;
  } catch (error) {
    console.error('Error loading layers:', error);
    return getSampleLayers();
  }
}

/**
 * Get GeoJSON data for a specific layer
 */
async function getLayerGeoJSON(layerId) {
  // Check cache first
  if (geoJSONCache[layerId]) {
    return geoJSONCache[layerId];
  }

  try {
    const filePath = path.join(DATA_DIR, `${layerId}.geojson`);
    const content = await fs.readFile(filePath, 'utf-8');
    const geojson = JSON.parse(content);

    // Cache the data
    geoJSONCache[layerId] = geojson;

    return geojson;
  } catch (error) {
    console.error(`Error loading layer ${layerId}:`, error);
    // Return sample data for demonstration
    return getSampleGeoJSON(layerId);
  }
}

/**
 * Filter layer data based on criteria
 */
async function filterLayerData(layerId, filters) {
  const geojson = await getLayerGeoJSON(layerId);

  if (!geojson) {
    return null;
  }

  const filtered = {
    type: 'FeatureCollection',
    features: geojson.features.filter(feature => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return true; // Skip empty filters
        }

        const propValue = feature.properties[key];

        // Handle different filter types
        if (Array.isArray(value)) {
          return value.includes(propValue);
        } else if (typeof value === 'string') {
          return propValue && propValue.toString().toLowerCase().includes(value.toLowerCase());
        } else {
          return propValue === value;
        }
      });
    })
  };

  return filtered;
}

/**
 * Get a specific feature by ID
 */
async function getFeatureById(layerId, featureId) {
  const geojson = await getLayerGeoJSON(layerId);

  if (!geojson) {
    return null;
  }

  return geojson.features.find(
    f => f.properties.id === featureId || f.id === featureId
  );
}

/**
 * Extract unique categories from GeoJSON properties
 */
function extractCategories(geojson) {
  const categories = {};

  geojson.features.forEach(feature => {
    Object.entries(feature.properties).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        if (!categories[key]) {
          categories[key] = new Set();
        }
        categories[key].add(value);
      }
    });
  });

  // Convert Sets to Arrays
  Object.keys(categories).forEach(key => {
    categories[key] = Array.from(categories[key]).sort();
  });

  return categories;
}

/**
 * Format layer name for display
 */
function formatLayerName(layerId) {
  return layerId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get sample layers for demonstration (when no real data is loaded)
 */
function getSampleLayers() {
  return [
    {
      id: 'pottery',
      name: 'Pottery Finds',
      type: 'Point',
      featureCount: 0,
      categories: {
        period: ['Archaic', 'Classical', 'Hellenistic', 'Roman', 'Medieval'],
        type: ['Storage', 'Cooking', 'Fine Ware', 'Coarse Ware']
      },
      visible: true
    },
    {
      id: 'architecture',
      name: 'Architectural Features',
      type: 'Polygon',
      featureCount: 0,
      categories: {
        period: ['Archaic', 'Classical', 'Hellenistic', 'Roman', 'Medieval'],
        type: ['Building', 'Wall', 'Foundation', 'Road']
      },
      visible: true
    },
    {
      id: 'coins',
      name: 'Coin Finds',
      type: 'Point',
      featureCount: 0,
      categories: {
        period: ['Archaic', 'Classical', 'Hellenistic', 'Roman', 'Medieval', 'Byzantine']
      },
      visible: true
    },
    {
      id: 'survey-tracts',
      name: 'Survey Tracts',
      type: 'Polygon',
      featureCount: 0,
      categories: {},
      visible: true
    }
  ];
}

/**
 * Get sample GeoJSON for demonstration
 */
function getSampleGeoJSON(layerId) {
  // Sikyon coordinates: approximately 37.99°N, 22.72°E
  const sikyonCenter = [22.72, 37.99];

  if (layerId === 'pottery') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'pot-001',
          geometry: { type: 'Point', coordinates: [sikyonCenter[0] + 0.01, sikyonCenter[1] + 0.01] },
          properties: {
            id: 'pot-001',
            type: 'Fine Ware',
            period: 'Classical',
            description: 'Red-figure pottery fragment',
            square: 'A-12'
          }
        },
        {
          type: 'Feature',
          id: 'pot-002',
          geometry: { type: 'Point', coordinates: [sikyonCenter[0] - 0.01, sikyonCenter[1] + 0.005] },
          properties: {
            id: 'pot-002',
            type: 'Storage',
            period: 'Roman',
            description: 'Amphora handle',
            square: 'B-8'
          }
        }
      ]
    };
  } else if (layerId === 'architecture') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'arch-001',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [sikyonCenter[0], sikyonCenter[1]],
              [sikyonCenter[0] + 0.002, sikyonCenter[1]],
              [sikyonCenter[0] + 0.002, sikyonCenter[1] + 0.002],
              [sikyonCenter[0], sikyonCenter[1] + 0.002],
              [sikyonCenter[0], sikyonCenter[1]]
            ]]
          },
          properties: {
            id: 'arch-001',
            type: 'Building',
            period: 'Hellenistic',
            description: 'Foundation walls',
            square: 'C-15'
          }
        }
      ]
    };
  } else if (layerId === 'coins') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'coin-001',
          geometry: { type: 'Point', coordinates: [sikyonCenter[0] + 0.005, sikyonCenter[1] - 0.005] },
          properties: {
            id: 'coin-001',
            period: 'Roman',
            description: 'Bronze coin, Emperor Hadrian',
            square: 'D-20'
          }
        }
      ]
    };
  }

  return { type: 'FeatureCollection', features: [] };
}

module.exports = {
  getAvailableLayers,
  getLayerGeoJSON,
  filterLayerData,
  getFeatureById
};
