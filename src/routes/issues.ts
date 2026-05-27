import { Router } from 'express';
import { relevanceScore } from '../services/relevance';
import { analyzeIssues, reScoreIssue } from '../services/aiCurator';

const router = Router();

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
    return relevanceScore(b) - relevanceScore(a);
  });

  res.json({
    success: true,
    count: sorted.length,
    rankedBy: "relevanceScore (backend AI layer)",
    issues: sorted,
  });
});

// NEW: Test endpoint to trigger the AI Curator
router.get('/analyze', (req, res) => {
  const context = req.query.context as string | undefined;

  const results = analyzeIssues(MOCK_ISSUES, context);

  res.json({
    success: true,
    message: "AI Curator analysis complete",
    contextUsed: context || null,
    ...results,
  });
});

// NEW: Analyze a single issue (useful for testing)
router.get('/analyze/:id', (req, res) => {
  const issueId = req.params.id;
  const context = req.query.context as string | undefined;

  const issue = MOCK_ISSUES.find(i => i.id === issueId);

  if (!issue) {
    return res.status(404).json({ success: false, message: "Issue not found" });
  }

  const result = reScoreIssue(issue, context);

  res.json({
    success: true,
    message: "Single issue analyzed by AI Curator",
    result,
  });
});

export default router;
