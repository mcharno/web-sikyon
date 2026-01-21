# Quick Start Guide

Get the Sikyon web app running in under 5 minutes!

## Prerequisites

- Node.js 16+ installed
- npm or yarn

## Installation & Running

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

   **Getting "port already in use" error?** Use this instead:
   ```bash
   npm run dev:clean
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

That's it! The app will run with sample archaeological data.

## What You'll See

- **Interactive Map**: Centered on Sikyon, Greece (37.99°N, 22.72°E)
- **Data Layers**: Sample pottery finds, architectural features, coins, and survey tracts
- **Sidebar**: Layer controls and filtering options
- **Click Features**: Click any point/polygon on the map to see details

## Next Steps

### Load Real Sikyon Data

1. Download data from https://zenodo.org/records/1054450
2. Convert shapefiles to GeoJSON (see README.md)
3. Place GeoJSON files in `backend/public/data/`
4. Restart the backend server

### Customize

- **Colors**: Edit `frontend/src/components/MapView.js` line 68-73
- **Filters**: Automatically generated from your GeoJSON properties
- **Styling**: Modify CSS files in `frontend/src/styles/`

## Troubleshooting

**Port already in use? (Most common issue)**
```bash
# Quick fix - kills port 5000 and starts fresh
npm run dev:clean

# Or manually kill the process
kill -9 $(lsof -ti:5000)
```

**On macOS:** Disable AirPlay Receiver if port 5000 is always busy:
- System Preferences → Sharing → Uncheck "AirPlay Receiver"

**CORS errors?**
- Ensure backend is running on port 5000
- Check `backend/.env` CORS_ORIGIN setting

**Need help?**
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions
- See full README.md for detailed documentation
- Check browser console for errors (F12)
- Verify both servers are running

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  React Frontend │ ◄─────► │  Express Backend │
│  (Port 3000)    │  API    │   (Port 5000)    │
└─────────────────┘         └──────────────────┘
        │                            │
        │                            │
        ▼                            ▼
   MapLibre GL              GeoJSON Data Files
 (Map Rendering)           (backend/public/data/)
```

Happy mapping! 🗺️
