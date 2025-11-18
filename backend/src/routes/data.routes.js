const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');

// Get all available datasets/layers
router.get('/layers', dataController.getLayers);

// Get GeoJSON data for a specific layer
router.get('/layer/:layerId', dataController.getLayerData);

// Get filtered data
router.post('/filter', dataController.filterData);

// Get feature details by ID
router.get('/feature/:layerId/:featureId', dataController.getFeatureDetails);

module.exports = router;
