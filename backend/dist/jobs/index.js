"use strict";
// =====================================================
// Jobs Registry
// =====================================================
// This file will register all background jobs / tasks.
//
// In the future, we can trigger these jobs:
// - Manually (via API)
// - On a schedule (using a cron library or external scheduler)
// - When certain events happen
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobs = void 0;
const scoreRefreshJob_1 = require("./scoreRefreshJob");
// You can add more jobs here as we build them
exports.jobs = {
    scoreRefreshJob: scoreRefreshJob_1.scoreRefreshJob,
};
// Future usage example:
// import { runJob } from './index';
// await runJob('scoreRefreshJob');
