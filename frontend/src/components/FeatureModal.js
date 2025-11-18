import React from 'react';
import '../styles/FeatureModal.css';

const FeatureModal = ({ feature, onClose }) => {
  if (!feature) return null;

  const { properties, layerId } = feature;

  const formatKey = (key) => {
    return key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {properties.type || properties.name || 'Feature Details'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {properties.description && (
            <div className="feature-description">
              <p>{properties.description}</p>
            </div>
          )}

          <div className="feature-properties">
            <h3 className="properties-title">Properties</h3>
            <dl className="properties-list">
              {Object.entries(properties).map(([key, value]) => {
                if (key === 'description' || !value) return null;

                return (
                  <div key={key} className="property-item">
                    <dt className="property-key">{formatKey(key)}</dt>
                    <dd className="property-value">{value.toString()}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {layerId && (
            <div className="feature-meta">
              <span className="meta-label">Layer:</span>
              <span className="meta-value">{formatKey(layerId)}</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;
