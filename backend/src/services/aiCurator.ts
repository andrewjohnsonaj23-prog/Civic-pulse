// === AI CURATOR SERVICE (Living Intelligence Layer) ===
// This is where Grok will eventually operate as the brain of CivicPulse

import { relevanceScore } from './relevance';

export interface AnalysisResult {
  issueId: string;
  newScore: number;
  reason: string;
  confidence: number; // 0-100
}

/**
 * Re-score a single issue and generate meaningful reasoning.
 */
export function reScoreIssue(issue: any, context?: string): AnalysisResult {
  const baseScore = relevanceScore(issue);
  let adjustedScore = baseScore;
  const reasons: string[] = [];

  // Build intelligent reasoning based on issue properties
  if (issue.urgency === "critical") {
    reasons.push("Critical urgency applied strong boost");
  } else if (issue.urgency === "high") {
    reasons.push("High urgency contributed to elevated score");
  }

  if ((issue.momentum ?? 0) > 1000) {
    reasons.push("Strong recent momentum increased ranking");
  } else if ((issue.momentum ?? 0) > 500) {
    reasons.push("Moderate momentum supported score");
  }

  if (issue.big) {
    reasons.push("National-level impact recognized");
  }

  if (issue.scope === "district") {
    reasons.push("Local district relevance prioritized");
  } else if (issue.scope === "state") {
    reasons.push("State-wide relevance factored in");
  } else if (issue.scope === "federal") {
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

/**
 * Analyze multiple issues at once.
 */
export function analyzeIssues(issues: any[], context?: string) {
  const results: AnalysisResult[] = [];

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

/**
 * Detect emerging topics (placeholder for future real signals).
 */
export function detectEmergingTopics(signals: any[]): string[] {
  const topics: string[] = [];
  if (signals.length > 0) {
    topics.push("Emerging topic detection system is initialized");
  }
  return topics;
}
