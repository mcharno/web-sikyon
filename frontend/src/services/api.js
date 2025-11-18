import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all available data layers
 */
export const fetchLayers = async () => {
  try {
    const response = await api.get('/data/layers');
    return response.data;
  } catch (error) {
    console.error('Error fetching layers:', error);
    throw error;
  }
};

/**
 * Fetch GeoJSON data for a specific layer
 */
export const fetchLayerData = async (layerId) => {
  try {
    const response = await api.get(`/data/layer/${layerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching layer ${layerId}:`, error);
    throw error;
  }
};

/**
 * Filter data based on criteria
 */
export const filterData = async (layerId, filters) => {
  try {
    const response = await api.post('/data/filter', { layerId, filters });
    return response.data;
  } catch (error) {
    console.error('Error filtering data:', error);
    throw error;
  }
};

/**
 * Fetch feature details by ID
 */
export const fetchFeatureDetails = async (layerId, featureId) => {
  try {
    const response = await api.get(`/data/feature/${layerId}/${featureId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feature details:', error);
    throw error;
  }
};

export default api;
