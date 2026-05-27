import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import issuesRouter from './routes/issues';
import jobsRouter from './routes/jobs';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CivicPulse Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/issues', issuesRouter);
app.use('/api/jobs', jobsRouter);

const server = app.listen(PORT, '0.0.0.0', () => {
  const addr = server.address();
  console.log('Server address object:', JSON.stringify(addr));
  console.log(`🚀 CivicPulse Backend running on http://localhost:${PORT}`);
  console.log(`   Issues API active on /api/issues/my-feed`);
  console.log(`   Jobs API active on /api/jobs/status`);
});

server.on('error', (err) => {
  console.error('SERVER ERROR:', err);
  process.exit(1);
});
