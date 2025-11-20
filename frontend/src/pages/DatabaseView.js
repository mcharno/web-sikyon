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
  const [selectedImage, setSelectedImage] = useState(null);

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

  const isImageField = (key, value) => {
    if (!value || typeof value !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const lowerValue = value.toLowerCase();
    return (
      lowerKey.includes('image') ||
      lowerKey.includes('photo') ||
      lowerKey.includes('picture') ||
      lowerValue.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
  };

  const isPDFField = (key, value) => {
    if (!value || typeof value !== 'string') return false;
    const lowerKey = key.toLowerCase();
    const lowerValue = value.toLowerCase();
    return (
      lowerKey.includes('pdf') ||
      lowerKey.includes('document') ||
      lowerValue.match(/\.pdf$/i)
    );
  };

  const isURLField = (key, value) => {
    if (!value || typeof value !== 'string') return false;
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes('url') ||
      lowerKey.includes('link') ||
      lowerKey.includes('reference') ||
      value.startsWith('http://') ||
      value.startsWith('https://')
    );
  };

  const getMediaFields = (item) => {
    if (!item) return { images: [], pdfs: [] };
    const media = { images: [], pdfs: [] };

    Object.entries(item).forEach(([key, value]) => {
      if (isImageField(key, value)) {
        media.images.push({ key, value });
      } else if (isPDFField(key, value)) {
        media.pdfs.push({ key, value });
      }
    });

    // Check for array fields
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach((img, idx) => {
        media.images.push({ key: `image_${idx}`, value: img });
      });
    }
    if (item.pdfs && Array.isArray(item.pdfs)) {
      item.pdfs.forEach((pdf, idx) => {
        media.pdfs.push({ key: `pdf_${idx}`, value: pdf });
      });
    }

    return media;
  };

  const config = datasetConfig[selectedDataset];
  const hasFilters = Object.keys(filters).some(key => filters[key]);
  const media = selectedItem ? getMediaFields(selectedItem) : { images: [], pdfs: [] };

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
                      {/* Images Section */}
                      {media.images.length > 0 && (
                        <div className="detail-media-section">
                          <h4>Images</h4>
                          <div className="detail-media-gallery">
                            {media.images.map(({ key, value }) => (
                              <div key={key} className="detail-media-item">
                                <img
                                  src={value}
                                  alt={key}
                                  className="detail-media-thumbnail"
                                  onClick={() => setSelectedImage(value)}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="detail-media-placeholder" style={{ display: 'none' }}>
                                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                  </svg>
                                  <span>Image not available</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PDFs Section */}
                      {media.pdfs.length > 0 && (
                        <div className="detail-documents-section">
                          <h4>Documents</h4>
                          <div className="detail-documents-list">
                            {media.pdfs.map(({ key, value }) => (
                              <a
                                key={key}
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="detail-document-link"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                  <polyline points="14 2 14 8 20 8"></polyline>
                                  <line x1="16" y1="13" x2="8" y2="13"></line>
                                  <line x1="16" y1="17" x2="8" y2="17"></line>
                                  <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Properties */}
                      <div className="detail-properties">
                        {Object.entries(selectedItem).map(([key, value]) => {
                          if (key === 'coordinates') return null;
                          if (isImageField(key, value) || isPDFField(key, value)) return null;

                          const isURL = isURLField(key, value);

                          return (
                            <div key={key} className="detail-row">
                              <span className="detail-label">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                              </span>
                              <span className="detail-value">
                                {isURL ? (
                                  <a href={value} target="_blank" rel="noopener noreferrer" className="detail-link">
                                    {value}
                                  </a>
                                ) : (
                                  value || 'N/A'
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Additional Images Section */}
                      <div className="detail-images-section">
                        <h4>Additional Images</h4>
                        <div className="detail-images-grid">
                          <div className="detail-image-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>Additional images will appear here when available</span>
                          </div>
                        </div>
                      </div>

                      {/* Map Section */}
                      <div className="detail-map-section">
                        <h4>Location</h4>
                        <div className="detail-map-placeholder">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>Interactive map will appear here when coordinates are available</span>
                        </div>
                      </div>
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

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="lightbox-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content">
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img src={selectedImage} alt="Full size" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;
