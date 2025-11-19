# Sikyon Survey Project - Web Application

A modern web application for visualizing and exploring archaeological survey data from the ancient Greek city of Sikyon. Built with Node.js, Express, React, and MapLibre GL.

## Features

- **Interactive Map**: Explore Sikyon archaeological data on an interactive map using MapLibre GL
- **Multiple Data Layers**: Toggle between different archaeological datasets (pottery, architecture, coins, survey tracts)
- **Advanced Filtering**: Filter data by period, type, and other attributes
- **Feature Details**: Click on map features to view detailed information in a modal
- **Modern UI**: Clean, responsive interface with smooth animations
- **Sample Data**: Includes sample data for demonstration (can be replaced with actual Sikyon data)

## Project Structure

```
web-sikyon/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.js         # Server entry point
│   ├── public/
│   │   └── data/           # GeoJSON data files
│   └── package.json
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API clients
│   │   ├── styles/          # CSS files
│   │   └── App.js           # Main app component
│   └── package.json
└── package.json             # Root package (scripts for both)
```

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **shpjs** - Shapefile to GeoJSON conversion
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI framework
- **MapLibre GL JS** - Modern mapping library
- **react-map-gl** - React wrapper for MapLibre
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-sikyon
```

2. Install all dependencies:
```bash
npm run install:all
```

This will install dependencies for the root, backend, and frontend.

### Running the Application

#### Development Mode (Both servers)

Run both backend and frontend concurrently:
```bash
npm run dev
```

- Backend will run on `http://localhost:5000`
- Frontend will run on `http://localhost:3000`

**Port Already in Use?** Run this instead:
```bash
npm run dev:clean
```
This will automatically kill any process using port 5000 and start fresh.

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions.

#### Run Separately

Backend only:
```bash
npm run server:dev
```

Frontend only:
```bash
npm run client:dev
```

### Production Build

Build the frontend for production:
```bash
npm run build
```

## Loading Sikyon Data from Zenodo

The Sikyon Survey Project data is available at: https://zenodo.org/records/1054450

### Step 1: Download the Data

1. Visit https://zenodo.org/records/1054450
2. Download the file: `sikyon-survey-project-dissemination.zip` (3.1 GB)
3. Extract the ZIP file

### Step 2: Convert Shapefiles to GeoJSON

The dataset includes ESRI Shapefiles in the GIS folder. You'll need to convert these to GeoJSON format.

#### Option A: Automated Batch Conversion (Recommended)

Use our automated script to convert all shapefiles at once:

```bash
# Install GDAL first (if not already installed)
# macOS:
brew install gdal

# Ubuntu/Debian:
sudo apt-get install gdal-bin

# Run the batch conversion script
./scripts/convert-all-shapefiles.sh ~/path/to/sikyon-data/GIS ./backend/public/data
```

This script will:
- Automatically find all `.shp` files
- Convert them to GeoJSON
- Save directly to the backend data folder
- Show progress and feature counts

See [DATA_LOADING_GUIDE.md](DATA_LOADING_GUIDE.md) for detailed instructions.

#### Option B: Manual GDAL Conversion

Convert individual files:
```bash
ogr2ogr -f GeoJSON output.geojson input.shp
```

#### Option C: Using Online Tools

- Visit https://mapshaper.org/
- Upload your .shp, .shx, .dbf files
- Export as GeoJSON

#### Option D: Using Node.js

Use the included Node.js script for individual files:

```bash
cd backend
node scripts/convert-shapefile.js ../path/to/input.shp public/data/output.geojson
```

### Step 3: Load Data into Application

If you used the automated script (Option A), your files are already in place! Just restart the server:

```bash
# Restart both servers
npm run dev

# Or just the backend
npm run server:dev
```

If you converted files manually:
1. Place your GeoJSON files in `backend/public/data/`
2. Optionally rename them for better display (e.g., `pottery.geojson`, `architecture.geojson`)
3. The backend will automatically detect and serve these files
4. Restart the backend server

### Expected Data Structure

GeoJSON files should follow this structure:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "id": "unique-id",
        "type": "Fine Ware",
        "period": "Classical",
        "description": "Description of the artifact",
        "square": "Grid reference",
        ...other properties
      }
    }
  ]
}
```

## API Endpoints

### GET /api/health
Health check endpoint

### GET /api/data/layers
Get all available data layers

### GET /api/data/layer/:layerId
Get GeoJSON data for a specific layer

### POST /api/data/filter
Filter layer data
```json
{
  "layerId": "pottery",
  "filters": {
    "period": "Roman",
    "type": "Storage"
  }
}
```

### GET /api/data/feature/:layerId/:featureId
Get details for a specific feature

## Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration

The frontend proxies API requests to the backend via the `proxy` field in `frontend/package.json`.

For production, set the API URL:
```bash
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Customization

### Adding New Data Layers

1. Add GeoJSON file to `backend/public/data/`
2. The system will auto-detect it
3. Optionally customize colors in `MapView.js`:

```javascript
const colors = {
  pottery: '#ef4444',
  architecture: '#3b82f6',
  coins: '#f59e0b',
  'your-new-layer': '#your-color'
};
```

### Styling Map Features

Edit the `getLayerStyle` function in `frontend/src/components/MapView.js` to customize how different geometry types are displayed.

### Filtering Options

Filters are automatically generated from the unique values in your GeoJSON properties. The system scans all features and extracts unique values for each property.

## Deployment

### Backend Deployment

Deploy to any Node.js hosting service:
- Heroku
- DigitalOcean
- AWS Elastic Beanstalk
- Google Cloud Platform

### Frontend Deployment

Build and deploy to static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

Build command:
```bash
cd frontend && npm run build
```

## Development

### Adding New Features

1. Backend: Add routes in `backend/src/routes/`, controllers in `controllers/`, and logic in `services/`
2. Frontend: Add components in `frontend/src/components/` and styles in `styles/`

### Code Style

- Use ES6+ features
- Follow React best practices
- Keep components modular and reusable

## Troubleshooting

### Port Already in Use (EADDRINUSE Error)

**Quick fix:**
```bash
# Kill any process using port 5000 and start clean
npm run dev:clean
```

**Or manually:**
```bash
# Find and kill the process
kill -9 $(lsof -ti:5000)

# Then start normally
npm run dev
```

**Common cause on macOS:** AirPlay Receiver uses port 5000
- System Preferences → Sharing → Disable "AirPlay Receiver"

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

### Available Helper Scripts

```bash
npm run dev:clean      # Kill port 5000 and start dev servers
npm run kill:backend   # Kill process on port 5000
npm run kill:frontend  # Kill process on port 3000
npm run kill:all       # Kill both ports
```

### CORS Issues

Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL.

### Data Not Loading

1. Check that GeoJSON files are in `backend/public/data/`
2. Verify GeoJSON format is valid
3. Check browser console for errors (F12)
4. Verify backend API is running on port 5000
5. Test the API: `curl http://localhost:5000/api/health`

## License

MIT

## Credits

Archaeological data from the Sikyon Survey Project:
- Data Source: https://zenodo.org/records/1054450
- License: Creative Commons Attribution Share Alike 4.0 International

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Contact

For questions about the Sikyon Survey Project data, refer to the Zenodo record.