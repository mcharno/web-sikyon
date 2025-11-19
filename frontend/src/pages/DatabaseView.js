import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import { getPottery, getArchitecture, getCoins, getUniqueValues, exportToGeoJSON } from '../services/mockDatabase';
import '../styles/DatabaseView.css';

const DatabaseView = () => {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState('pottery');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const datasetConfig = {
    pottery: {
      name: 'Pottery',
      fields: ['type', 'period', 'subtype', 'square', 'tract'],
      displayFields: ['id', 'square', 'tract', 'type', 'period', 'subtype', 'count', 'weight_g', 'description']
    },
    architecture: {
      name: 'Architecture',
      fields: ['type', 'period', 'subtype', 'material', 'square', 'tract'],
      displayFields: ['id', 'square', 'tract', 'type', 'period', 'subtype', 'material', 'dimensions', 'description']
    },
    coins: {
      name: 'Coins',
      fields: ['period', 'emperor', 'denomination', 'condition', 'square', 'tract'],
      displayFields: ['id', 'square', 'tract', 'period', 'emperor', 'denomination', 'date_range', 'condition', 'description']
    }
  };

  const handleDatasetChange = (dataset) => {
    setSelectedDataset(dataset);
    setFilters({});
    setResults([]);
    setShowResults(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    let data;
    switch (selectedDataset) {
      case 'pottery':
        data = getPottery(filters);
        break;
      case 'architecture':
        data = getArchitecture(filters);
        break;
      case 'coins':
        data = getCoins(filters);
        break;
      default:
        data = [];
    }
    setResults(data);
    setShowResults(true);
    setSelectedItem(null);
  };

  const handleClearFilters = () => {
    setFilters({});
    setResults([]);
    setShowResults(false);
  };

  const handleViewOnMap = () => {
    const geojson = exportToGeoJSON(results);
    // Store the results in sessionStorage to pass to the map
    sessionStorage.setItem('mapQueryResults', JSON.stringify(geojson));
    navigate('/map?from=database');
  };

  const config = datasetConfig[selectedDataset];
  const hasFilters = Object.keys(filters).some(key => filters[key]);

  return (
    <div className="database-view">
      <div className="database-header">
        <h1>Archaeological Database</h1>
        <p>Query and explore the Sikyon Survey data</p>
      </div>

      <div className="database-container">
        <div className="database-sidebar">
          <div className="dataset-selector">
            <h3>Dataset</h3>
            <div className="dataset-buttons">
              <button
                className={`dataset-btn ${selectedDataset === 'pottery' ? 'active' : ''}`}
                onClick={() => handleDatasetChange('pottery')}
              >
                Pottery
              </button>
              <button
                className={`dataset-btn ${selectedDataset === 'architecture' ? 'active' : ''}`}
                onClick={() => handleDatasetChange('architecture')}
              >
                Architecture
              </button>
              <button
                className={`dataset-btn ${selectedDataset === 'coins' ? 'active' : ''}`}
                onClick={() => handleDatasetChange('coins')}
              >
                Coins
              </button>
            </div>
          </div>

          <div className="filters-section">
            <div className="filters-header">
              <h3>Filters</h3>
              {hasFilters && (
                <button onClick={handleClearFilters} className="clear-btn">
                  Clear All
                </button>
              )}
            </div>

            {config.fields.map(field => {
              const uniqueValues = getUniqueValues(selectedDataset, field);
              return (
                <div key={field} className="filter-group">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
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

            <button onClick={handleSearch} className="search-btn">
              Search
            </button>
          </div>
        </div>

        <div className="database-content">
          {!showResults ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <h3>Select filters and click Search</h3>
              <p>Use the filters on the left to refine your search, then click Search to view results.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <h3>No results found</h3>
              <p>Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h3>{results.length} {results.length === 1 ? 'result' : 'results'} found</h3>
                <div className="results-actions">
                  <CSVLink
                    data={results}
                    filename={`sikyon-${selectedDataset}-${new Date().toISOString().split('T')[0]}.csv`}
                    className="export-btn"
                  >
                    Export CSV
                  </CSVLink>
                  <button onClick={handleViewOnMap} className="map-btn">
                    View on Map
                  </button>
                </div>
              </div>

              <div className="results-container">
                {selectedItem ? (
                  <div className="detail-view">
                    <div className="detail-header">
                      <h3>Details</h3>
                      <button onClick={() => setSelectedItem(null)} className="close-detail-btn">
                        Back to Results
                      </button>
                    </div>
                    <div className="detail-content">
                      {Object.entries(selectedItem).map(([key, value]) => {
                        if (key === 'coordinates') return null;
                        return (
                          <div key={key} className="detail-row">
                            <span className="detail-label">
                              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                            </span>
                            <span className="detail-value">{value || 'N/A'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="results-table-container">
                    <table className="results-table">
                      <thead>
                        <tr>
                          {config.displayFields.map(field => (
                            <th key={field}>
                              {field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}
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
                                {field === 'description' && item[field] && item[field].length > 50
                                  ? item[field].substring(0, 50) + '...'
                                  : item[field] || 'N/A'}
                              </td>
                            ))}
                            <td>
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="view-btn"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseView;
