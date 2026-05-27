import { scoreRefreshJob } from './scoreRefreshJob';

type JobName = 'scoreRefreshJob';

const jobs: Record<JobName, () => Promise<void>> = {
  scoreRefreshJob,
};

export async function runJob(jobName: JobName): Promise<void> {
  const job = jobs[jobName];
  if (!job) {
    throw new Error(`Job "${jobName}" not found. Available jobs: ${Object.keys(jobs).join(', ')}`);
  }
  console.log(`[JobRunner] Starting job: ${jobName}`);
  await job();
  console.log(`[JobRunner] Completed job: ${jobName}`);
}

export function getAvailableJobs(): JobName[] {
  return Object.keys(jobs) as JobName[];
}
