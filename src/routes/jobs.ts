import { Router, Request, Response } from 'express';
import { runJob, getAvailableJobs } from '../jobs/jobRunner';

const router = Router();

router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Jobs system is active.',
    availableJobs: getAvailableJobs(),
  });
});

router.post('/trigger/:jobName', async (req: Request, res: Response) => {
  const { jobName } = req.params;
  try {
    await runJob(jobName as any);
    res.json({ 
      success: true, 
      message: `Job "${jobName}" triggered successfully.` 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to trigger job.' 
    });
  }
});

export default router;
