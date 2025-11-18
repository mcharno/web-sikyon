import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import FeatureModal from './components/FeatureModal';
import Header from './components/Header';
import { fetchLayers } from './services/api';
import './styles/App.css';

function App() {
  const [layers, setLayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [filters, setFilters] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadLayers();
  }, []);

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
    <div className="app">
      <Header toggleSidebar={toggleSidebar} />

      <div className="app-content">
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
}

export default App;
