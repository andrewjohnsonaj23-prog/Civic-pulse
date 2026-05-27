"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobRunner_1 = require("../jobs/jobRunner");
const router = (0, express_1.Router)();
// Accepts both GET and POST so you can test easily from the browser
router.all('/trigger/:jobName', async (req, res) => {
    const { jobName } = req.params;
    try {
        await (0, jobRunner_1.runJob)(jobName);
        res.json({
            success: true,
            message: `Job "${jobName}" triggered successfully.`,
        });
    }
    catch (error) {
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
exports.default = router;
