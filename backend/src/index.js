const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3180;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3100'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static data files
app.use('/data', express.static(path.join(__dirname, '../public/data')));

// Routes
const dataRoutes = require('./routes/data.routes');
app.use('/api/data', dataRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sikyon API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Sikyon backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
