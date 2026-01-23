const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'sikyon_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ============================================================================
// HTTP Metrics
// ============================================================================

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'sikyon_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
  registers: [register],
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
  name: 'sikyon_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Active requests gauge
const httpRequestsInProgress = new client.Gauge({
  name: 'sikyon_http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method'],
  registers: [register],
});

// Response size histogram
const httpResponseSize = new client.Histogram({
  name: 'sikyon_http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register],
});

// ============================================================================
// Application Metrics
// ============================================================================

// Layer data requests
const layerRequests = new client.Counter({
  name: 'sikyon_layer_requests_total',
  help: 'Total number of layer data requests',
  labelNames: ['layer_id', 'action'],
  registers: [register],
});

// GIS data processing duration
const gisProcessingDuration = new client.Histogram({
  name: 'sikyon_gis_processing_duration_seconds',
  help: 'Duration of GIS data processing in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

// ============================================================================
// Error Metrics
// ============================================================================

// Error counter
const errorsTotal = new client.Counter({
  name: 'sikyon_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route', 'status_code'],
  registers: [register],
});

// ============================================================================
// Helper Functions
// ============================================================================

function getRoutePattern(path) {
  // Normalize routes for metrics (replace IDs with :id)
  return path
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
    .replace(/\/[a-zA-Z0-9_-]{10,}/g, '/:slug');
}

// ============================================================================
// Metrics Middleware
// ============================================================================

function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  const method = req.method;
  const originalUrl = req.originalUrl || req.url;

  // Increment in-progress requests
  httpRequestsInProgress.inc({ method });

  // Override res.end to capture metrics after response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Restore original end function
    res.end = originalEnd;
    res.end(chunk, encoding);

    // Calculate request duration
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = res.statusCode.toString();
    const route = getRoutePattern(originalUrl);

    // Decrement in-progress requests
    httpRequestsInProgress.dec({ method });

    // Record metrics
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    httpRequestTotal.inc({ method, route, status_code: statusCode });

    // Track response size if available
    const contentLength = res.get('Content-Length');
    if (contentLength) {
      httpResponseSize.observe(
        { method, route, status_code: statusCode },
        parseInt(contentLength, 10)
      );
    }

    // Track errors
    if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
      errorsTotal.inc({
        type: statusCode.startsWith('4') ? 'client' : 'server',
        route,
        status_code: statusCode
      });
    }
  };

  next();
}

// ============================================================================
// Metrics Endpoint Handler
// ============================================================================

async function metricsHandler(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err.message);
  }
}

// ============================================================================
// Tracking Functions
// ============================================================================

function trackLayerRequest(layerId, action = 'view') {
  layerRequests.inc({ layer_id: layerId || 'unknown', action });
}

function trackGisProcessing(operation, duration) {
  gisProcessingDuration.observe({ operation }, duration);
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  metricsMiddleware,
  metricsHandler,
  trackLayerRequest,
  trackGisProcessing,
  register,
};
