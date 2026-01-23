const dataService = require('../services/data.service');
const { trackLayerRequest, trackGisProcessing } = require('../middleware/metrics');

/**
 * Get all available data layers
 */
const getLayers = async (req, res) => {
  try {
    const layers = await dataService.getAvailableLayers();
    res.json(layers);
  } catch (error) {
    console.error('Error getting layers:', error);
    res.status(500).json({ error: 'Failed to retrieve layers' });
  }
};

/**
 * Get GeoJSON data for a specific layer
 */
const getLayerData = async (req, res) => {
  try {
    const { layerId } = req.params;

    // Track layer request
    trackLayerRequest(layerId, 'view');

    // Measure GIS processing time
    const startTime = Date.now();
    const data = await dataService.getLayerGeoJSON(layerId);
    const duration = (Date.now() - startTime) / 1000;
    trackGisProcessing('load_layer', duration);

    if (!data) {
      return res.status(404).json({ error: 'Layer not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting layer data:', error);
    res.status(500).json({ error: 'Failed to retrieve layer data' });
  }
};

/**
 * Filter data based on criteria
 */
const filterData = async (req, res) => {
  try {
    const { layerId, filters } = req.body;

    if (!layerId || !filters) {
      return res.status(400).json({ error: 'layerId and filters are required' });
    }

    // Track layer filter request
    trackLayerRequest(layerId, 'filter');

    // Measure GIS filtering time
    const startTime = Date.now();
    const filteredData = await dataService.filterLayerData(layerId, filters);
    const duration = (Date.now() - startTime) / 1000;
    trackGisProcessing('filter', duration);

    res.json(filteredData);
  } catch (error) {
    console.error('Error filtering data:', error);
    res.status(500).json({ error: 'Failed to filter data' });
  }
};

/**
 * Get details for a specific feature
 */
const getFeatureDetails = async (req, res) => {
  try {
    const { layerId, featureId } = req.params;

    // Track feature detail request
    trackLayerRequest(layerId, 'feature_detail');

    // Measure GIS processing time
    const startTime = Date.now();
    const feature = await dataService.getFeatureById(layerId, featureId);
    const duration = (Date.now() - startTime) / 1000;
    trackGisProcessing('get_feature', duration);

    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    res.json(feature);
  } catch (error) {
    console.error('Error getting feature details:', error);
    res.status(500).json({ error: 'Failed to retrieve feature details' });
  }
};

module.exports = {
  getLayers,
  getLayerData,
  filterData,
  getFeatureDetails
};
