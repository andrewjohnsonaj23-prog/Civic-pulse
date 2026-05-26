# CivicPulse — Living AI Layer Architecture

## Overview
This document describes how the **Living AI Layer** will work inside the CivicPulse backend.

The goal is to move from a static relevance scoring system to a dynamic, intelligent system where Grok (or another model) can analyze real-world signals and keep the app relevant over time.

## Current State (Phase 1)
- We have a basic backend with Express + TypeScript.
- We have a static `relevanceScore()` function in `src/services/relevance.ts`.
- We have created `src/services/aiCurator.ts` as the future home for real AI logic.
- We have an empty `src/jobs/` folder ready for scheduled intelligence tasks.

## High-Level Architecture


## Key Components (Planned)

### 1. AI Curator (`src/services/aiCurator.ts`)
- This is the main intelligence layer.
- Will eventually contain functions that:
  - Analyze individual issues
  - Detect trending topics
  - Suggest new issues to add
  - Update relevance scores with reasoning
- Will call Grok (or another model) with structured prompts.

### 2. Jobs / Workers (`src/jobs/`)
- Scheduled tasks that run periodically (e.g. every 15–60 minutes).
- Examples:
  - `dailyIntelligenceJob.ts`
  - `trendingTopicsJob.ts`
  - `scoreRefreshJob.ts`

### 3. Data Model Enhancements (Future)
Issues should eventually support fields like:
- `lastAnalyzedAt`
- `aiReasoning`
- `source` (e.g. "user_submitted", "news", "x_trending")
- `confidenceScore`
- `aiSuggestedAction`

## Guiding Principles

1. **Keep the AI layer separate** from the main API routes when possible.
2. **Start simple** — do not connect real external APIs until the structure is clean.
3. **Make reasoning visible** — when the AI makes a decision, we should be able to see *why*.
4. **Safety first** — new issues or big score changes should have confidence thresholds and review steps.
5. **Incremental** — we build one piece at a time and verify after each step.

## Current Phase: Phase 1 — Architecture & Foundation

We are currently defining the structure and creating clean homes for future logic.
We are **not** yet connecting real external data sources.

## Next Phases (Planned)

- Phase 2: Job / Worker foundation + scheduling
- Phase 3: First real integration point for Grok
- Phase 4: Connect one lightweight external signal
- Phase 5: Safety, moderation, and logging layer

---
Last Updated: May 2026
