const proj4 = require('proj4');

// Define Greek Grid EPSG:2100 (GGRS87)
proj4.defs('EPSG:2100', '+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +ellps=GRS80 +towgs84=-199.87,74.79,246.62,0,0,0,0 +units=m +no_defs');

// WGS84 is built-in as EPSG:4326

/**
 * Transform coordinates from Greek Grid (EPSG:2100) to WGS84 (EPSG:4326)
 * @param {Array} coords - [x, y] in Greek Grid
 * @returns {Array} - [longitude, latitude] in WGS84
 */
function transformToWGS84(coords) {
  if (!coords || coords.length < 2) return coords;

  // Check if already in WGS84 range (rough check)
  const [x, y] = coords;
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    // Already in lat/lon range, return as-is
    return coords;
  }

  // Transform from EPSG:2100 to EPSG:4326
  try {
    const [lon, lat] = proj4('EPSG:2100', 'EPSG:4326', [x, y]);
    return coords.length === 2 ? [lon, lat] : [lon, lat, ...coords.slice(2)];
  } catch (error) {
    console.error('Error transforming coordinates:', coords, error);
    return coords;
  }
}

/**
 * Recursively transform all coordinates in a geometry
 * @param {Object} geometry - GeoJSON geometry object
 * @returns {Object} - Transformed geometry
 */
function transformGeometry(geometry) {
  if (!geometry || !geometry.type) return geometry;

  const transformed = { ...geometry };

  switch (geometry.type) {
    case 'Point':
      transformed.coordinates = transformToWGS84(geometry.coordinates);
      break;

    case 'LineString':
    case 'MultiPoint':
      transformed.coordinates = geometry.coordinates.map(transformToWGS84);
      break;

    case 'Polygon':
    case 'MultiLineString':
      transformed.coordinates = geometry.coordinates.map(ring =>
        ring.map(transformToWGS84)
      );
      break;

    case 'MultiPolygon':
      transformed.coordinates = geometry.coordinates.map(polygon =>
        polygon.map(ring => ring.map(transformToWGS84))
      );
      break;

    case 'GeometryCollection':
      transformed.geometries = geometry.geometries.map(transformGeometry);
      break;
  }

  return transformed;
}

/**
 * Transform a GeoJSON FeatureCollection from Greek Grid to WGS84
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Object} - Transformed GeoJSON
 */
function transformGeoJSON(geojson) {
  if (!geojson || geojson.type !== 'FeatureCollection') {
    return geojson;
  }

  return {
    ...geojson,
    features: geojson.features.map(feature => ({
      ...feature,
      geometry: transformGeometry(feature.geometry)
    }))
  };
}

module.exports = {
  transformToWGS84,
  transformGeometry,
  transformGeoJSON
};
