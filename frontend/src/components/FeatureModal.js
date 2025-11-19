import React, { useState } from 'react';
import '../styles/FeatureModal.css';

const FeatureModal = ({ feature, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Special fields to display prominently
  const specialFields = ['name', 'type', 'count', 'period', 'date', 'material'];
  const excludeFromProperties = ['description', 'image', 'images', 'photo', 'photos', 'picture', 'pictures', 'pdf', 'pdfs', 'document', 'documents', ...specialFields];

  const getSpecialFieldValue = (field) => {
    return properties[field] || properties[field.toLowerCase()] || properties[field.toUpperCase()];
  };

  const getMediaFields = () => {
    const media = { images: [], pdfs: [] };

    Object.entries(properties).forEach(([key, value]) => {
      if (isImageField(key, value)) {
        media.images.push({ key, value });
      } else if (isPDFField(key, value)) {
        media.pdfs.push({ key, value });
      }
    });

    // Also check for array fields
    if (properties.images && Array.isArray(properties.images)) {
      properties.images.forEach((img, idx) => {
        media.images.push({ key: `image_${idx}`, value: img });
      });
    }
    if (properties.pdfs && Array.isArray(properties.pdfs)) {
      properties.pdfs.forEach((pdf, idx) => {
        media.pdfs.push({ key: `pdf_${idx}`, value: pdf });
      });
    }

    return media;
  };

  const media = getMediaFields();

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {getSpecialFieldValue('name') || properties.type || 'Feature Details'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Special Fields */}
          {specialFields.some(field => getSpecialFieldValue(field)) && (
            <div className="feature-highlights">
              {specialFields.map(field => {
                const value = getSpecialFieldValue(field);
                if (!value) return null;
                return (
                  <div key={field} className="highlight-item">
                    <span className="highlight-label">{formatKey(field)}:</span>
                    <span className="highlight-value">{value.toString()}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Description */}
          {properties.description && (
            <div className="feature-description">
              <h3>Description</h3>
              <p>{properties.description}</p>
            </div>
          )}

          {/* Images */}
          {media.images.length > 0 && (
            <div className="feature-media">
              <h3>Images</h3>
              <div className="media-gallery">
                {media.images.map(({ key, value }, idx) => (
                  <div key={key} className="media-item">
                    <img
                      src={value}
                      alt={formatKey(key)}
                      className="media-thumbnail"
                      onClick={() => setSelectedImage(value)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="media-placeholder" style={{ display: 'none' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span className="placeholder-text">Image not available</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDFs */}
          {media.pdfs.length > 0 && (
            <div className="feature-documents">
              <h3>Documents</h3>
              <div className="documents-list">
                {media.pdfs.map(({ key, value }) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="document-link"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>{formatKey(key)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Other Properties */}
          <div className="feature-properties">
            <h3 className="properties-title">Additional Properties</h3>
            <dl className="properties-list">
              {Object.entries(properties).map(([key, value]) => {
                if (excludeFromProperties.includes(key.toLowerCase()) || !value) return null;
                if (isImageField(key, value) || isPDFField(key, value)) return null;

                const isURL = isURLField(key, value);

                return (
                  <div key={key} className="property-item">
                    <dt className="property-key">{formatKey(key)}</dt>
                    <dd className="property-value">
                      {isURL ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="property-link">
                          {value}
                        </a>
                      ) : (
                        value.toString()
                      )}
                    </dd>
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

export default FeatureModal;
