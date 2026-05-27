"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const relevance_1 = require("../services/relevance");
const aiCurator_1 = require("../services/aiCurator");
const router = (0, express_1.Router)();
// Temporary mock data (we will replace this with real data later)
const MOCK_ISSUES = [
    {
        id: "1",
        title: "Increase funding for local schools",
        urgency: "high",
        momentum: 1240,
        scope: "district",
        big: false,
        momentumText: "Active today",
    },
    {
        id: "2",
        title: "Expand rural broadband access",
        urgency: "medium",
        momentum: 890,
        scope: "state",
        big: true,
        momentumText: null,
    },
    {
        id: "3",
        title: "Lower prescription drug costs",
        urgency: "critical",
        momentum: 3200,
        scope: "federal",
        big: true,
        momentumText: "Major national debate",
    },
    {
        id: "4",
        title: "Fix potholes on Main Street",
        urgency: "medium",
        momentum: 450,
        scope: "district",
        big: false,
        momentumText: null,
    },
];
// Existing endpoint - returns ranked issues
router.get('/my-feed', (req, res) => {
    const sorted = [...MOCK_ISSUES].sort((a, b) => {
        return (0, relevance_1.relevanceScore)(b) - (0, relevance_1.relevanceScore)(a);
    });
    res.json({
        success: true,
        count: sorted.length,
        rankedBy: "relevanceScore (backend AI layer)",
        issues: sorted,
    });
});
// NEW: AI Analysis endpoint (for testing the AI Curator)
router.get('/analyze', (req, res) => {
    const result = (0, aiCurator_1.analyzeIssues)(MOCK_ISSUES, "Testing AI Curator integration");
    res.json({
        success: true,
        message: "AI analysis completed",
        ...result,
    });
});
exports.default = router;
