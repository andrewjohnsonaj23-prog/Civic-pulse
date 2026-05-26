// =====================================================
// Score Refresh Job (Example)
// =====================================================
// This job will eventually:
// - Fetch current issues
// - Run AI analysis on them
// - Update relevance scores in the database
//
// For now, this is a skeleton that logs what it would do.

export async function scoreRefreshJob() {
  console.log('🔄 [scoreRefreshJob] Starting score refresh...');

  // TODO: In the future this will:
  // 1. Load issues from database
  // 2. Call analyzeIssue() from aiCurator.ts for each issue
  // 3. Update scores + reasoning in the database
  // 4. Log what changed

  console.log('✅ [scoreRefreshJob] Score refresh completed (placeholder).');
}
