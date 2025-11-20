import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import FeatureModal from '../components/FeatureModal';
import { fetchLayers } from '../services/api';
import '../styles/MapPage.css';

const MapPage = () => {
  const location = useLocation();
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [queryResults, setQueryResults] = useState(null);

  useEffect(() => {
    loadLayers();
  }, []);

  useEffect(() => {
    // Check if we came from the database with query results
    const params = new URLSearchParams(location.search);
    if (params.get('from') === 'database') {
      const storedResults = sessionStorage.getItem('mapQueryResults');
      if (storedResults) {
        setQueryResults(JSON.parse(storedResults));
        // Clear the stored results
        sessionStorage.removeItem('mapQueryResults');
      }
    }
  }, [location]);

  const loadLayers = async () => {
    try {
      setLoading(true);
      const data = await fetchLayers();
      setLayers(data);
      setError(null);
    } catch (err) {
      console.error('Error loading layers:', err);
      setError('Failed to load data layers');
    } finally {
      setLoading(false);
    }
  };

  const handleLayerToggle = (layerId) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleFeatureClick = (feature, layerId) => {
    setSelectedFeature({ ...feature, layerId });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const clearQueryResults = () => {
    setQueryResults(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Sikyon Survey Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadLayers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <h1>Interactive Map</h1>
        <p>Explore archaeological features with interactive layers and filtering</p>
      </div>

      <div className="map-content">
        <Sidebar
          layers={layers}
          onLayerToggle={handleLayerToggle}
          onFilterChange={handleFilterChange}
          isOpen={sidebarOpen}
        />

        <MapView
          layers={layers}
          filters={filters}
          onFeatureClick={handleFeatureClick}
          queryResults={queryResults}
        />
      </div>

      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
};

export default MapPage;
