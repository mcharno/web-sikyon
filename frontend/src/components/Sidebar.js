import React, { useState, useEffect } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ layers, onLayerToggle, onFilterChange, isOpen }) => {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (layers.length > 0 && !selectedLayer) {
      setSelectedLayer(layers[0].id);
    }
  }, [layers, selectedLayer]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const currentLayer = layers.find(l => l.id === selectedLayer);
  const hasFilters = Object.keys(filters).some(key => filters[key]);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h2 className="section-title">Data Layers</h2>
          <div className="layers-list">
            {layers.map(layer => (
              <div key={layer.id} className="layer-item">
                <label className="layer-label">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => onLayerToggle(layer.id)}
                    className="layer-checkbox"
                  />
                  <span className="layer-name">{layer.name}</span>
                  <span className="layer-count">
                    {layer.featureCount > 0 ? layer.featureCount : '...'}
                  </span>
                </label>
                {layer.allowFiltering && (
                  <button
                    className={`filter-button ${selectedLayer === layer.id ? 'active' : ''}`}
                    onClick={() => setSelectedLayer(layer.id)}
                    title="Filter this layer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {currentLayer && currentLayer.allowFiltering && (
          <div className="sidebar-section">
            <div className="section-header">
              <h2 className="section-title">Filter: {currentLayer.name}</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear
                </button>
              )}
            </div>

            {currentLayer.categories && Object.keys(currentLayer.categories).length > 0 ? (
              <div className="filters-container">
                {Object.entries(currentLayer.categories).map(([key, values]) => (
                  <div key={key} className="filter-group">
                    <label className="filter-label">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <select
                      value={filters[key] || ''}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All</option>
                      {values.map(value => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-filters">No filters available for this layer</p>
            )}
          </div>
        )}

        {currentLayer && !currentLayer.allowFiltering && (
          <div className="sidebar-section">
            <div className="section-header">
              <h2 className="section-title">{currentLayer.name}</h2>
            </div>
            <p className="no-filters">
              {currentLayer.description || 'This layer does not support filtering.'}
            </p>
          </div>
        )}

        <div className="sidebar-section info-section">
          <h3 className="info-title">About</h3>
          <p className="info-text">
            The Sikyon Survey Project presents archaeological data from the ancient Greek city of Sikyon.
            Use the layer controls to show/hide different data types, and apply filters to refine your search.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
