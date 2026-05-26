// =====================================================
// Issue Type Definition
// =====================================================
// This interface defines the shape of an issue in the system.
//
// It includes both current fields and future fields the AI layer will use.

export interface Issue {
  id: string;
  title: string;
  description?: string;
  category?: string;
  urgency: "critical" | "high" | "medium" | "low";
  momentum: number;
  scope: "district" | "local" | "state" | "federal" | "all";
  big?: boolean;
  momentumText?: string | null;

  // =====================================================
  // AI Layer Fields (Future Use)
  // =====================================================
  lastAnalyzedAt?: string;           // When the AI last reviewed this issue
  aiReasoning?: string;              // Why the AI gave this score
  source?: "user_submitted" | "news" | "x_trending" | "government" | "manual";
  confidenceScore?: number;          // How confident the AI is (0–100)
  aiSuggestedAction?: "boost" | "add" | "monitor" | "ignore" | "merge";
}
