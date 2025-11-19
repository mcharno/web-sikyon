// Mock database data for Sikyon artifacts
// This will be replaced with real Postgres data later

const mockPottery = [
  {
    id: 1,
    square: 'A-12',
    tract: 'Tract 1',
    type: 'Fine Ware',
    period: 'Classical',
    subtype: 'Red-Figure',
    count: 15,
    weight_g: 234,
    description: 'Red-figure pottery fragments with figural decoration',
    coordinates: [22.721, 37.981]
  },
  {
    id: 2,
    square: 'B-8',
    tract: 'Tract 1',
    type: 'Coarse Ware',
    period: 'Roman',
    subtype: 'Amphora',
    count: 8,
    weight_g: 1420,
    description: 'Amphora handles and body sherds',
    coordinates: [22.719, 37.983]
  },
  {
    id: 3,
    square: 'C-15',
    tract: 'Tract 2',
    type: 'Fine Ware',
    period: 'Hellenistic',
    subtype: 'Black-Glazed',
    count: 23,
    weight_g: 178,
    description: 'Black-glazed tableware fragments',
    coordinates: [22.723, 37.979]
  },
  {
    id: 4,
    square: 'D-20',
    tract: 'Tract 2',
    type: 'Cooking Ware',
    period: 'Archaic',
    subtype: 'Cooking Pot',
    count: 12,
    weight_g: 890,
    description: 'Cooking pot rims and bases',
    coordinates: [22.718, 37.985]
  },
  {
    id: 5,
    square: 'E-5',
    tract: 'Tract 3',
    type: 'Storage',
    period: 'Byzantine',
    subtype: 'Pithos',
    count: 3,
    weight_g: 3200,
    description: 'Large storage vessel fragments',
    coordinates: [22.725, 37.982]
  }
];

const mockArchitecture = [
  {
    id: 1,
    square: 'C-15',
    tract: 'Tract 2',
    type: 'Building',
    period: 'Hellenistic',
    subtype: 'Foundation',
    material: 'Stone',
    dimensions: '12.5 x 8.2 m',
    description: 'Rectangular foundation with ashlar blocks',
    coordinates: [22.723, 37.979]
  },
  {
    id: 2,
    square: 'A-10',
    tract: 'Tract 1',
    type: 'Wall',
    period: 'Classical',
    subtype: 'City Wall',
    material: 'Stone',
    dimensions: '45m length, 2.1m width',
    description: 'Fortification wall section',
    coordinates: [22.720, 37.980]
  },
  {
    id: 3,
    square: 'F-18',
    tract: 'Tract 3',
    type: 'Road',
    period: 'Roman',
    subtype: 'Paved Road',
    material: 'Stone paving',
    dimensions: '3.5m width',
    description: 'Paved road with wheel ruts',
    coordinates: [22.726, 37.984]
  }
];

const mockCoins = [
  {
    id: 1,
    square: 'D-20',
    tract: 'Tract 2',
    period: 'Roman',
    emperor: 'Hadrian',
    denomination: 'Bronze',
    date_range: '117-138 CE',
    condition: 'Fair',
    description: 'Bronze coin, emperor portrait on obverse',
    coordinates: [22.718, 37.985]
  },
  {
    id: 2,
    square: 'B-12',
    tract: 'Tract 1',
    period: 'Classical',
    emperor: null,
    denomination: 'Silver Stater',
    date_range: '400-350 BCE',
    condition: 'Good',
    description: 'Sikyon mint, chimaera on reverse',
    coordinates: [22.721, 37.982]
  },
  {
    id: 3,
    square: 'E-7',
    tract: 'Tract 3',
    period: 'Byzantine',
    emperor: 'Justinian I',
    denomination: 'Follis',
    date_range: '527-565 CE',
    condition: 'Poor',
    description: 'Large bronze follis, worn',
    coordinates: [22.724, 37.983]
  }
];

// Helper functions

export function getPottery(filters = {}) {
  return filterData(mockPottery, filters);
}

export function getArchitecture(filters = {}) {
  return filterData(mockArchitecture, filters);
}

export function getCoins(filters = {}) {
  return filterData(mockCoins, filters);
}

export function getAllData(filters = {}) {
  return {
    pottery: getPottery(filters),
    architecture: getArchitecture(filters),
    coins: getCoins(filters)
  };
}

function filterData(data, filters) {
  if (Object.keys(filters).length === 0) return data;

  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;

      const itemValue = item[key];
      if (itemValue === null || itemValue === undefined) return false;

      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });
}

// Get unique values for filter dropdowns
export function getUniqueValues(dataset, field) {
  const values = new Set();
  const data = dataset === 'pottery' ? mockPottery :
                dataset === 'architecture' ? mockArchitecture :
                mockCoins;

  data.forEach(item => {
    if (item[field] !== null && item[field] !== undefined) {
      values.add(item[field]);
    }
  });

  return Array.from(values).sort();
}

// Export data formats
export function exportToCSV(data, type) {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
  ].join('\n');

  return csv;
}

export function exportToGeoJSON(data) {
  return {
    type: 'FeatureCollection',
    features: data
      .filter(item => item.coordinates)
      .map(item => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: item.coordinates
        },
        properties: Object.fromEntries(
          Object.entries(item).filter(([key]) => key !== 'coordinates')
        )
      }))
  };
}
