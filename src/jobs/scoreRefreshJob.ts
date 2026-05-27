import { analyzeIssues } from '../services/aiCurator';

const MOCK_ISSUES = [
  { id: "1", title: "Increase funding for local schools", urgency: "high", momentum: 1240, scope: "district", big: false, momentumText: "Active today" },
  { id: "2", title: "Expand rural broadband access", urgency: "medium", momentum: 890, scope: "state", big: true, momentumText: null },
  { id: "3", title: "Lower prescription drug costs", urgency: "critical", momentum: 3200, scope: "federal", big: true, momentumText: "Major national debate" },
  { id: "4", title: "Fix potholes on Main Street", urgency: "medium", momentum: 450, scope: "district", big: false, momentumText: null },
];

export async function scoreRefreshJob(): Promise<void> {
  console.log('[ScoreRefreshJob] Starting score refresh...');
  
  try {
    const result = analyzeIssues(MOCK_ISSUES, 'Scheduled score refresh');
    console.log(`[ScoreRefreshJob] Analyzed ${result.totalAnalyzed} issues`);
    console.log(`[ScoreRefreshJob] Completed at ${result.analyzedAt}`);
  } catch (error) {
    console.error('[ScoreRefreshJob] Failed:', error);
    throw error;
  }
}
