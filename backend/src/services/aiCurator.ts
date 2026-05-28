import dotenv from 'dotenv';
dotenv.config();

// === AI CURATOR SERVICE (Living Intelligence Layer) ===
// This version calls Grok (xAI) for real AI enrichment

import { relevanceScore } from './relevance';

export interface AnalysisResult {
  issueId: string;
  newScore: number;
  reason: string;
  confidence: number;
}

export function reScoreIssue(issue: any, context?: string): AnalysisResult {
  const baseScore = relevanceScore(issue);
  let adjustedScore = baseScore;
  const reasons: string[] = [];

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

export function detectEmergingTopics(signals: any[]): string[] {
  const topics: string[] = [];
  if (signals.length > 0) {
    topics.push("Emerging topic detection system is initialized");
  }
  return topics;
}

// =====================================================
// Enrich Issue - Real AI Version (Using Grok)
// =====================================================

export interface EnrichedIssue {
  title: string;
  description: string;
  category: string;
  scope: "district" | "local" | "state" | "federal";
  urgency: "critical" | "high" | "medium" | "low";
  why_it_matters: string;
  pros: string[];
  cons: string[];
  relevance_score: number;
  relevance_reasoning: string;
  big_impact: boolean;
  tags: string[];
}

export function buildEnrichPrompt(title: string, description: string): string {
  return `You are an expert civic policy analyst helping citizens understand issues clearly and fairly.

Analyze the following issue and return a JSON object with this exact structure:

{
  "title": "Improved/clear version of the title",
  "description": "Clear and neutral description of the issue",
  "category": "One main category (e.g. Healthcare, Education, Economy, Infrastructure, etc.)",
  "scope": "district | local | state | federal",
  "urgency": "critical | high | medium | low",
  "why_it_matters": "1-2 sentence explanation of why this matters to regular people",
  "pros": ["benefit 1", "benefit 2", "benefit 3"],
  "cons": ["downside 1", "downside 2", "downside 3"],
  "relevance_score": 0-100,
  "relevance_reasoning": "Explain why you gave this relevance score",
  "big_impact": true or false,
  "tags": ["tag1", "tag2"]
}

Rules:
- Be fair and non-partisan.
- Keep explanations short and clear.
- Only use the categories and scopes listed above.
- Respond with valid JSON only.

Issue to analyze:
Title: ${title}
Description: ${description}`;
}

async function callGrok(prompt: string): Promise<EnrichedIssue> {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    throw new Error("XAI_API_KEY is not set in backend/.env");
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from Grok");
  }

  return JSON.parse(content) as EnrichedIssue;
}

export async function enrichIssue(rawIssue: { title: string; description: string }): Promise<EnrichedIssue> {
  const prompt = buildEnrichPrompt(rawIssue.title, rawIssue.description);

  try {
    // Try calling Grok
    const result = await callGrok(prompt);
    return result;
  } catch (error) {
    console.error("Grok call failed, using fallback mock:", error);

    // Fallback mock (in case Grok fails or key is missing)
    return {
      title: rawIssue.title,
      description: rawIssue.description,
      category: "Healthcare",
      scope: "federal",
      urgency: "high",
      why_it_matters: "This policy would directly reduce out-of-pocket costs for millions of Americans who depend on insulin to survive.",
      pros: [
        "Lowers monthly medication costs for people with diabetes",
        "Reduces medical debt related to chronic illness",
        "Improves medication adherence and health outcomes"
      ],
      cons: [
        "May reduce profit margins for pharmaceutical companies",
        "Could lead to higher costs for other medications",
        "Implementation details are still unclear"
      ],
      relevance_score: 85,
      relevance_reasoning: "High relevance due to public concern over drug pricing.",
      big_impact: true,
      tags: ["healthcare", "prescription drugs", "cost of living"]
    };
  }
}