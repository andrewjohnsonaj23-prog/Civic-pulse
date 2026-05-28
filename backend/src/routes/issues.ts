import { Router, Request, Response } from 'express';
import { relevanceScore } from '../services/relevance';
import { analyzeIssues, enrichIssue } from '../services/aiCurator';

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

// NEW: AI Analysis endpoint (for testing the AI Curator)
router.get('/analyze', (req, res) => {
  const result = analyzeIssues(MOCK_ISSUES, "Testing AI Curator integration");
  res.json({
    success: true,
    message: "AI analysis completed",
    ...result,
  });
});

// =====================================================
// NEW: Create a new issue + Auto-Enrich with Grok
// =====================================================
router.post('/', async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'title and description are required',
    });
  }

  try {
    // Call Grok to enrich the issue
    const enriched = await enrichIssue({ title, description });

    res.json({
      success: true,
      message: 'Issue created and enriched successfully',
      issue: enriched,
    });
  } catch (error: any) {
    console.error('Error enriching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create and enrich issue',
      error: error.message,
    });
  }
});

export default router;
