import { Router } from 'express';
import { runJob } from '../jobs/jobRunner';

const router = Router();

// Manual trigger endpoint (great for development & testing)
router.post('/trigger/:jobName', async (req, res) => {
  const { jobName } = req.params;

  try {
    await runJob(jobName as any);
    res.json({
      success: true,
      message: `Job "${jobName}" triggered successfully.`,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to trigger job.',
    });
  }
});

// Health check for the jobs system
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Jobs system is active.',
    availableJobs: ['scoreRefreshJob'],
  });
});

export default router;
