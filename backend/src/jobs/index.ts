// =====================================================
// Jobs Registry
// =====================================================
// This file will register all background jobs / tasks.
//
// In the future, we can trigger these jobs:
// - Manually (via API)
// - On a schedule (using a cron library or external scheduler)
// - When certain events happen

import { scoreRefreshJob } from './scoreRefreshJob';

// You can add more jobs here as we build them
export const jobs = {
  scoreRefreshJob,
};

// Future usage example:
// import { runJob } from './index';
// await runJob('scoreRefreshJob');
