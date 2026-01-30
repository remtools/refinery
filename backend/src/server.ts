import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/index.js';
import { db } from './database/index.js';

// Import routes
import epicsRouter from './routes/epics.js';
import storiesRouter from './routes/stories.js';
import acceptanceCriteriaRouter from './routes/acceptance-criteria.js';
import testCasesRouter from './routes/test-cases.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/epics', epicsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/acceptance-criteria', acceptanceCriteriaRouter);
app.use('/api/test-cases', testCasesRouter);

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
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();