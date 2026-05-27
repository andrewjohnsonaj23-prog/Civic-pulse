"use strict";
// === AI CURATOR SERVICE (Living Intelligence Layer) ===
// This is where Grok will eventually operate as the brain of CivicPulse
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectEmergingTopics = exports.analyzeIssues = exports.reScoreIssue = void 0;
const relevance_1 = require("./relevance");
/**
 * Re-score a single issue and generate meaningful reasoning.
 */
function reScoreIssue(issue, context) {
    const baseScore = (0, relevance_1.relevanceScore)(issue);
    let adjustedScore = baseScore;
    const reasons = [];
    // Build intelligent reasoning based on issue properties
    if (issue.urgency === "critical") {
        reasons.push("Critical urgency applied strong boost");
    }
    else if (issue.urgency === "high") {
        reasons.push("High urgency contributed to elevated score");
    }
    if ((issue.momentum ?? 0) > 1000) {
        reasons.push("Strong recent momentum increased ranking");
    }
    else if ((issue.momentum ?? 0) > 500) {
        reasons.push("Moderate momentum supported score");
    }
    if (issue.big) {
        reasons.push("National-level impact recognized");
    }
    if (issue.scope === "district") {
        reasons.push("Local district relevance prioritized");
    }
    else if (issue.scope === "state") {
        reasons.push("State-wide relevance factored in");
    }
    else if (issue.scope === "federal") {
        reasons.push("Federal scope applied");
    }
    if (issue.momentumText) {
        reasons.push("Active real-world traction detected");
    }
    // Fallback if no strong signals
    if (reasons.length === 0) {
        reasons.push("Baseline relevance scoring applied");
    }
    const finalReason = reasons.join(" + ");
    return {
        issueId: issue.id,
        newScore: adjustedScore,
        reason: finalReason,
        confidence: context ? 80 : 65,
    };
}
exports.reScoreIssue = reScoreIssue;
/**
 * Analyze multiple issues at once.
 */
function analyzeIssues(issues, context) {
    const results = [];
    for (const issue of issues) {
        const result = reScoreIssue(issue, context);
        results.push(result);
    }
    return {
        analyzedAt: new Date().toISOString(),
        totalAnalyzed: results.length,
        contextUsed: context || "None",
        results,
    };
}
exports.analyzeIssues = analyzeIssues;
/**
 * Detect emerging topics (placeholder for future real signals).
 */
function detectEmergingTopics(signals) {
    const topics = [];
    if (signals.length > 0) {
        topics.push("Emerging topic detection system is initialized");
    }
    return topics;
}
exports.detectEmergingTopics = detectEmergingTopics;
