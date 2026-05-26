// === RELEVANCE ENGINE (Backend AI Layer) ===
// This is where the intelligence will eventually live

export const relevanceScore = (i: any): number => {
  let score = 0;

  // Urgency weighting
  if (i.urgency === "critical") score += 2800;
  else if (i.urgency === "high") score += 1400;
  else if (i.urgency === "medium") score += 500;

  // Momentum
  score += (i.momentum ?? 0) * 1.6;

  // Breaking news / real-world traction
  if (i.momentumText) score += 1100;

  // Big national impact
  if (i.big) score += 2000;

  // Personal / district relevance
  if (i.scope === "district") score += 900;
  else if (i.scope === "local") score += 300;

  return Math.round(score);
};
