const fs = require('fs').promises;
const path = require('path');
const shp = require('shpjs');
const { transformGeoJSON } = require('./coordinateTransform.service');
const layerConfig = require('../config/layerConfig');

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

        // Skip excluded layers
        if (layerConfig.excludedLayers.includes(layerId)) {
          continue;
        }

        const filePath = path.join(DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const geojson = JSON.parse(content);

        // Analyze the layer to determine categories
        const categories = extractCategories(geojson);

        // Get settings from config or use defaults
        const settings = layerConfig.layerSettings[layerId] || {};
        const isVisible = settings.defaultVisible !== undefined
          ? settings.defaultVisible
          : false;
        const allowFiltering = !layerConfig.noFilterLayers.includes(layerId);

        layers.push({
          id: layerId,
          name: settings.name || formatLayerName(layerId),
          type: geojson.features[0]?.geometry?.type || 'Unknown',
          featureCount: geojson.features.length,
          categories: categories,
          visible: isVisible,
          allowFiltering: allowFiltering,
          description: settings.description || ''
        });
      }
    }

    // Sort layers according to layerOrder configuration
    layers.sort((a, b) => {
      const orderA = layerConfig.layerOrder.indexOf(a.id);
      const orderB = layerConfig.layerOrder.indexOf(b.id);

      // If layer not in order config, put it at the end
      const indexA = orderA === -1 ? 999 : orderA;
      const indexB = orderB === -1 ? 999 : orderB;

      return indexA - indexB;
    });

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
    let geojson = JSON.parse(content);

    // Transform coordinates from Greek Grid to WGS84
    geojson = transformGeoJSON(geojson);

    // Cache the transformed data
    geoJSONCache[layerId] = geojson;

    return geojson;
  } catch (error) {
    console.error(`Error loading layer ${layerId}:`, error);
    // Return sample data for demonstration (already in WGS84)
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
  const sampleLayers = [
    {
      id: 'pottery',
      name: 'Pottery Finds',
      type: 'Point',
      featureCount: 0,
      categories: {
        period: ['Archaic', 'Classical', 'Hellenistic', 'Roman', 'Medieval'],
        type: ['Storage', 'Cooking', 'Fine Ware', 'Coarse Ware']
      },
      visible: false,
      allowFiltering: true,
      description: 'Ceramic artifacts and sherds'
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
      visible: false,
      allowFiltering: true,
      description: 'Buildings, walls, and structures'
    },
    {
      id: 'coins',
      name: 'Coin Finds',
      type: 'Point',
      featureCount: 0,
      categories: {
        period: ['Archaic', 'Classical', 'Hellenistic', 'Roman', 'Medieval', 'Byzantine']
      },
      visible: false,
      allowFiltering: true,
      description: 'Numismatic finds'
    },
    {
      id: 'survey-tracts',
      name: 'Survey Tracts',
      type: 'Polygon',
      featureCount: 0,
      categories: {},
      visible: true,
      allowFiltering: false,
      description: 'Survey area boundaries'
    },
    {
      id: 'squares',
      name: 'Survey Squares',
      type: 'Polygon',
      featureCount: 0,
      categories: {},
      visible: true,
      allowFiltering: false,
      description: 'Grid square boundaries'
    },
    {
      id: 'cliffs',
      name: 'Cliffs',
      type: 'LineString',
      featureCount: 0,
      categories: {},
      visible: true,
      allowFiltering: false,
      description: 'Cliff edges and escarpments'
    }
  ];

  // Sort according to layerOrder
  sampleLayers.sort((a, b) => {
    const orderA = layerConfig.layerOrder.indexOf(a.id);
    const orderB = layerConfig.layerOrder.indexOf(b.id);
    const indexA = orderA === -1 ? 999 : orderA;
    const indexB = orderB === -1 ? 999 : orderB;
    return indexA - indexB;
  });

  return sampleLayers;
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
  } else if (layerId === 'survey-tracts') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'tract-001',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [sikyonCenter[0] - 0.01, sikyonCenter[1] - 0.01],
              [sikyonCenter[0] + 0.01, sikyonCenter[1] - 0.01],
              [sikyonCenter[0] + 0.01, sikyonCenter[1] + 0.01],
              [sikyonCenter[0] - 0.01, sikyonCenter[1] + 0.01],
              [sikyonCenter[0] - 0.01, sikyonCenter[1] - 0.01]
            ]]
          },
          properties: {
            id: 'tract-001',
            name: 'Tract 1',
            description: 'Survey tract covering central area'
          }
        }
      ]
    };
  } else if (layerId === 'squares') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'square-001',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [sikyonCenter[0] - 0.005, sikyonCenter[1] - 0.005],
              [sikyonCenter[0], sikyonCenter[1] - 0.005],
              [sikyonCenter[0], sikyonCenter[1]],
              [sikyonCenter[0] - 0.005, sikyonCenter[1]],
              [sikyonCenter[0] - 0.005, sikyonCenter[1] - 0.005]
            ]]
          },
          properties: {
            id: 'square-001',
            name: 'Square A-1',
            description: 'Survey square A-1'
          }
        },
        {
          type: 'Feature',
          id: 'square-002',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [sikyonCenter[0], sikyonCenter[1]],
              [sikyonCenter[0] + 0.005, sikyonCenter[1]],
              [sikyonCenter[0] + 0.005, sikyonCenter[1] + 0.005],
              [sikyonCenter[0], sikyonCenter[1] + 0.005],
              [sikyonCenter[0], sikyonCenter[1]]
            ]]
          },
          properties: {
            id: 'square-002',
            name: 'Square B-2',
            description: 'Survey square B-2'
          }
        }
      ]
    };
  } else if (layerId === 'cliffs') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'cliff-001',
          geometry: {
            type: 'LineString',
            coordinates: [
              [sikyonCenter[0] - 0.008, sikyonCenter[1] + 0.008],
              [sikyonCenter[0] - 0.006, sikyonCenter[1] + 0.01],
              [sikyonCenter[0] - 0.003, sikyonCenter[1] + 0.009],
              [sikyonCenter[0], sikyonCenter[1] + 0.011],
              [sikyonCenter[0] + 0.003, sikyonCenter[1] + 0.01]
            ]
          },
          properties: {
            id: 'cliff-001',
            name: 'Northern Cliff Edge',
            description: 'Cliff edge along northern boundary'
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
