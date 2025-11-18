#!/usr/bin/env node

/**
 * Helper script to convert Shapefiles to GeoJSON
 * Usage: node scripts/convert-shapefile.js <input.shp> <output.geojson>
 */

const shp = require('shpjs');
const fs = require('fs');
const path = require('path');

async function convertShapefile(inputPath, outputPath) {
  try {
    console.log(`Converting ${inputPath} to GeoJSON...`);

    // Read the shapefile
    const buffer = fs.readFileSync(inputPath);

    // Convert to GeoJSON
    const geojson = await shp(buffer);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write GeoJSON file
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

    console.log(`✓ Successfully converted to ${outputPath}`);
    console.log(`  Features: ${geojson.features.length}`);

    // Display sample properties from first feature
    if (geojson.features.length > 0) {
      console.log(`  Sample properties:`, Object.keys(geojson.features[0].properties));
    }

  } catch (error) {
    console.error('Error converting shapefile:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node convert-shapefile.js <input.shp> <output.geojson>');
  console.log('Example: node convert-shapefile.js data/sikyon.shp public/data/pottery.geojson');
  process.exit(1);
}

const [inputPath, outputPath] = args;

// Run conversion
convertShapefile(inputPath, outputPath);
