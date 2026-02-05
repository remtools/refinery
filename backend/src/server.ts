import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/index.js';
import { db } from './database/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import projectsRouter from './routes/projects.js';
import epicsRouter from './routes/epics.js';
import storiesRouter from './routes/stories.js';
import acceptanceCriteriaRouter from './routes/acceptance-criteria.js';
import testCasesRouter from './routes/test-cases.js';
import actorsRouter from './routes/actors.js';
import testSetsRouter from './routes/test-sets.js';
import testRunsRouter from './routes/test-runs.js';

// Load configuration from central config file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '..', '..', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const app = express();
const PORT = process.env.PORT || config.server.port || 3000;
const HOST = process.env.HOST || config.server.host || 'localhost';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/projects', projectsRouter);
app.use('/api/epics', epicsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/acceptance-criteria', acceptanceCriteriaRouter);
app.use('/api/test-cases', testCasesRouter);
app.use('/api/actors', actorsRouter);
app.use('/api/test-sets', testSetsRouter);
app.use('/api/test-runs', testRunsRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const startServer = async () => {
  try {
    await db.connect();
    console.log('Database connected successfully');

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();