const dataService = require('../services/data.service');

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
    const data = await dataService.getLayerGeoJSON(layerId);

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

    const filteredData = await dataService.filterLayerData(layerId, filters);
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
    const feature = await dataService.getFeatureById(layerId, featureId);

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
