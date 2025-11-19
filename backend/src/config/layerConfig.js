/**
 * Layer configuration for display and filtering
 *
 * This file controls which layers are shown, their display order,
 * and whether they can be filtered.
 */

const layerConfig = {
  // Layers to exclude entirely (won't appear in the app)
  excludedLayers: [
    // Add layer IDs here that you want to completely hide
    // Example: 'temporary-data', 'test-layer'
  ],

  // Layer display order (bottom to top)
  // Layers earlier in this array will be rendered underneath later ones
  layerOrder: [
    'survey-tracts',  // Base layer - survey boundaries
    'squares',        // Grid squares on top of tracts
    'cliffs',         // Natural features
    'architecture',   // Built features
    'pottery',        // Artifact finds
    'coins'           // Small finds on top
  ],

  // Layers that should not have filtering enabled
  noFilterLayers: [
    'survey-tracts',  // Just boundaries, no meaningful attributes to filter
    'squares',        // Just grid references
    'cliffs'          // Geographic features, no temporal/categorical data
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
