import React, { useRef, useEffect, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchLayerData, filterData } from '../services/api';
import '../styles/MapView.css';

const SIKYON_CENTER = {
  longitude: 22.72,
  latitude: 37.99,
  zoom: 14
};

const MapView = ({ layers, filters, onFeatureClick }) => {
  const mapRef = useRef();
  const [viewState, setViewState] = useState(SIKYON_CENTER);
  const [layersData, setLayersData] = useState({});
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    loadAllLayers();
  }, [layers]);

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const loadAllLayers = async () => {
    const data = {};
    for (const layer of layers) {
      if (layer.visible) {
        try {
          const geojson = await fetchLayerData(layer.id);
          data[layer.id] = geojson;
        } catch (error) {
          console.error(`Error loading layer ${layer.id}:`, error);
        }
      }
    }
    setLayersData(data);
  };

  const applyFilters = async () => {
    if (Object.keys(filters).length === 0) {
      loadAllLayers();
      return;
    }

    const data = {};
    for (const layer of layers) {
      if (layer.visible) {
        try {
          const geojson = await filterData(layer.id, filters);
          data[layer.id] = geojson;
        } catch (error) {
          console.error(`Error filtering layer ${layer.id}:`, error);
        }
      }
    }
    setLayersData(data);
  };

  const handleMapClick = (event) => {
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const layerId = feature.source;
      onFeatureClick(feature, layerId);
    }
  };

  const handleMouseMove = (event) => {
    const features = event.features;
    if (features && features.length > 0) {
      setHoveredFeature(features[0]);
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      }
    } else {
      setHoveredFeature(null);
      if (mapRef.current) {
        mapRef.current.getCanvas().style.cursor = '';
      }
    }
  };

  const getLayerStyle = (layerId, geometryType) => {
    const colors = {
      pottery: '#ef4444',
      architecture: '#3b82f6',
      coins: '#f59e0b',
      'survey-tracts': '#10b981'
    };

    const color = colors[layerId] || '#6366f1';

    if (geometryType === 'Point') {
      return {
        id: `${layerId}-circles`,
        type: 'circle',
        paint: {
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            10,
            6
          ],
          'circle-color': color,
          'circle-opacity': 0.8,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2
        }
      };
    } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      return {
        id: `${layerId}-polygons`,
        type: 'fill',
        paint: {
          'fill-color': color,
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.6,
            0.3
          ],
          'fill-outline-color': color
        }
      };
    } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      return {
        id: `${layerId}-lines`,
        type: 'line',
        paint: {
          'line-color': color,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            4,
            2
          ],
          'line-opacity': 0.8
        }
      };
    }

    return null;
  };

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        interactiveLayerIds={Object.keys(layersData).flatMap(id => [`${id}-circles`, `${id}-polygons`, `${id}-lines`])}
      >
        {Object.entries(layersData).map(([layerId, geojson]) => {
          if (!geojson || !geojson.features || geojson.features.length === 0) {
            return null;
          }

          const layer = layers.find(l => l.id === layerId);
          if (!layer || !layer.visible) {
            return null;
          }

          const geometryType = geojson.features[0]?.geometry?.type;
          const layerStyle = getLayerStyle(layerId, geometryType);

          if (!layerStyle) {
            return null;
          }

          return (
            <Source
              key={layerId}
              id={layerId}
              type="geojson"
              data={geojson}
            >
              <Layer {...layerStyle} />
            </Source>
          );
        })}
      </Map>

      {hoveredFeature && (
        <div className="map-tooltip" style={{
          left: hoveredFeature.x,
          top: hoveredFeature.y
        }}>
          <div className="tooltip-content">
            {hoveredFeature.properties.type && (
              <div><strong>Type:</strong> {hoveredFeature.properties.type}</div>
            )}
            {hoveredFeature.properties.period && (
              <div><strong>Period:</strong> {hoveredFeature.properties.period}</div>
            )}
            <div className="tooltip-hint">Click for details</div>
          </div>
        </div>
      )}

      <div className="map-legend">
        <h3>Legend</h3>
        {layers.filter(l => l.visible).map(layer => {
          const colors = {
            pottery: '#ef4444',
            architecture: '#3b82f6',
            coins: '#f59e0b',
            'survey-tracts': '#10b981'
          };
          const color = colors[layer.id] || '#6366f1';

          return (
            <div key={layer.id} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: color }}></span>
              <span className="legend-label">{layer.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapView;
