import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import issuesRouter from './routes/issues';
import jobsRouter from './routes/jobs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CivicPulse Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Issues routes (AI-ranked data)
app.use('/api/issues', issuesRouter);

// Jobs routes (trigger & monitor the AI layer)
app.use('/api/jobs', jobsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CivicPulse Backend running on http://localhost:${PORT}`);
  console.log(`   AI Relevance Engine active on /api/issues/my-feed`);
  console.log(`   Jobs system active on /api/jobs/status and /api/jobs/trigger/:jobName`);
});
