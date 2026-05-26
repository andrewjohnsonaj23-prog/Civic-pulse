import { Router } from 'express';
import { relevanceScore } from '../services/relevance';
import { Issue } from '../types/issue';

const router = Router();

// Mock data now uses the proper Issue interface (ready for AI fields later)
const MOCK_ISSUES: Issue[] = [
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

router.get('/my-feed', (req, res) => {
  // Sort using the backend relevance engine
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

export default router;
