import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import environment from './config/environment';
import { errorHandler, notFound } from './middleware/errorHandler';
import guestRoutes from './api/guest/index';
import managementRoutes from './api/management/index';
import { pool } from './config/db';
import { swaggerSpec } from './config/swagger';

// Initialize express app
const app = express();

// Test database connection
pool.query('SELECT 1')
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if unable to connect to database
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Documentation
if (environment.isDevelopment) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Endpoint to get the Swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log(`API Documentation available at http://localhost:${environment.port}/api-docs`);
}

// API Routes
app.use('/api/guest', guestRoutes);
app.use('/api/management', managementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
const server = app.listen(environment.port, () => {
  console.log(`Server running on port ${environment.port} in ${environment.nodeEnv} mode`);
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end().then(() => {
      console.log('Database connections closed');
      process.exit(0);
    }).catch(err => {
      console.error('Error closing database connections:', err);
      process.exit(1);
    });
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
}
