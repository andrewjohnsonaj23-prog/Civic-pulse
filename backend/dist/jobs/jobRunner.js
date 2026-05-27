"use strict";
// =====================================================
// Job Runner Utility
// =====================================================
// This file allows us to trigger jobs manually or programmatically.
//
// In the future, this can be called by:
// - An API endpoint (for development/testing)
// - A cron scheduler
// - Event-driven triggers
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJob = runJob;
const index_1 = require("./index");
async function runJob(jobName) {
    const job = index_1.jobs[jobName];
    if (!job) {
        throw new Error(`Job "${jobName}" not found.`);
    }
    console.log(`🚀 Triggering job: ${jobName}`);
    try {
        await job();
        console.log(`✅ Job completed: ${jobName}`);
    }
    catch (error) {
        console.error(`❌ Job failed: ${jobName}`, error);
        throw error;
    }
}
