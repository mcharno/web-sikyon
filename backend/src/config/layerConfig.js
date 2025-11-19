/**
 * Layer configuration for display and filtering
 *
 * This file controls which layers are shown, their display order,
 * and whether they can be filtered.
 */

const layerConfig = {
  // Layers to exclude entirely (won't appear in the app)
  excludedLayers: [
    'iso-2m',
    'iso_2m',
    'ISO-2m',
    'ISO_2m'
    // Adding multiple variations to catch different naming conventions
  ],

  // Layer display order (bottom to top)
  // Layers earlier in this array will be rendered underneath later ones
  layerOrder: [
    'survey-tracts',                    // Base layer - survey boundaries
    'squares',                          // Grid squares on top of tracts
    'cliffs',                           // Natural features
    'geophysics-interpretation',        // Geophysics data
    'architectural-features-line',      // Linear architecture
    'architectural-features-point',     // Point architecture
    'architecture',                     // General built features
    'pottery',                          // Artifact finds
    'coins'                            // Small finds on top
  ],

  // Layers that CANNOT be filtered (all except the three specified)
  // Only these layers will have filtering enabled:
  //   - Architectural Features Line
  //   - Architectural Features Point
  //   - Geophysics Interpretation
  noFilterLayers: [
    'survey-tracts',
    'squares',
    'cliffs',
    'pottery',
    'coins',
    'architecture',
    // Add any other layers here that should NOT have filtering
    // All variations to catch different naming
  ],

  // Layer display settings
  layerSettings: {
    'survey-tracts': {
      defaultVisible: true,
      name: 'Survey Tracts',
      description: 'Survey area boundaries'
    },
    'squares': {
      defaultVisible: true,
      name: 'Survey Squares',
      description: 'Grid square boundaries'
    },
    'cliffs': {
      defaultVisible: true,
      name: 'Cliffs',
      description: 'Cliff edges and escarpments'
    },
    'architectural-features-line': {
      defaultVisible: false,
      name: 'Architectural Features Line',
      description: 'Linear architectural features (walls, roads, etc.)'
    },
    'architectural-features-point': {
      defaultVisible: false,
      name: 'Architectural Features Point',
      description: 'Point architectural features'
    },
    'geophysics-interpretation': {
      defaultVisible: false,
      name: 'Geophysics Interpretation',
      description: 'Interpreted geophysical anomalies'
    },
    'architecture': {
      defaultVisible: false,
      name: 'Architectural Features',
      description: 'Buildings, walls, and structures'
    },
    'pottery': {
      defaultVisible: false,
      name: 'Pottery Finds',
      description: 'Ceramic artifacts and sherds'
    },
    'coins': {
      defaultVisible: false,
      name: 'Coin Finds',
      description: 'Numismatic finds'
    }
  }
};

module.exports = layerConfig;
