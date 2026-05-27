// =====================================================
// Score Refresh Job
// =====================================================
// This job will:
// - Run AI analysis on issues
// - Re-score them using the AI Curator
// - (Later) update scores in the database

import { analyzeIssues } from '../services/aiCurator';

// Temporary mock issues (we will replace this with real data later)
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

export async function scoreRefreshJob() {
  console.log('🔄 [scoreRefreshJob] Starting AI-powered score refresh...');

  // Run the AI Curator on all issues
  const result = analyzeIssues(MOCK_ISSUES, "Triggered by scoreRefreshJob");

  console.log(`✅ [scoreRefreshJob] Analyzed ${result.totalAnalyzed} issues`);
  console.log('📊 AI Analysis Results:', JSON.stringify(result.results, null, 2));

  // TODO (future):
  // 1. Load real issues from database
  // 2. Call analyzeIssues() with real data
  // 3. Save updated scores + reasoning back to database
  // 4. Log what changed

  console.log('✅ [scoreRefreshJob] Score refresh completed.');
}
