// Mock data for CivicPulse — seeded representative content used across all tabs.
export type Scope = "district" | "local" | "state" | "federal" | "all";

export type Issue = {
  id: string;
  title: string;
  category: string;
  scope: Exclude<Scope, "all">;
  urgency: "critical" | "high" | "medium" | "low";
  description: string;
  whyItMatters: string; // one-sentence stakes
  yes: number;
  no: number;
  unsure: number;
  goal: number;
  pulse: number; // verified district pulse %
  deadline: string;
  momentum?: number; // supports added today
  momentumText?: string; // freeform momentum signal e.g. "Media pickup imminent"
  pros: string[]; // non-partisan, factual, 2-3 short bullets
  cons: string[]; // non-partisan, factual, 2-3 short bullets
  big?: boolean;
};

export const ISSUES: Issue[] = [
  {
    id: "i1",
    title: "Rebuild Maple Street school after fire damage",
    category: "Education",
    scope: "district",
    urgency: "critical",
    description: "Allocate $4.2M from district reserves to rebuild the east wing before fall semester.",
    whyItMatters: "Prevents 480 students from being bused 14 miles in September.",
    yes: 1840, no: 212, unsure: 96, goal: 3000, pulse: 87,
    deadline: "Closes in 6 days",
    momentum: 412,
    pros: ["Keeps 480 kids in their neighborhood", "Uses existing reserve funds", "Ready before fall semester"],
    cons: ["Draws down 28% of district reserves", "No vote on long-term funding plan"],
  },
  {
    id: "i2",
    title: "Add protected bike lane along 12th Avenue",
    category: "Infrastructure/Transportation",
    scope: "local",
    urgency: "medium",
    description: "Redesign 1.4 mi corridor with concrete-protected lanes and signal priority.",
    whyItMatters: "Cuts crash risk on the city's deadliest corridor by an estimated 62%.",
    yes: 920, no: 410, unsure: 180, goal: 2000, pulse: 64,
    deadline: "Closes in 14 days",
    momentum: 87,
    pros: ["Projected 62% fewer crashes", "Adds 1.4mi of safe cycling", "Improves bus signal timing"],
    cons: ["Removes 64 parking spaces", "9 months of construction"],
  },
  {
    id: "i3",
    title: "Cap insulin co-pays at $35/month statewide",
    category: "Healthcare",
    scope: "state",
    urgency: "critical",
    description: "Mirror federal Medicare cap for all state-regulated insurance plans.",
    whyItMatters: "Saves 91,000 diabetic residents an average of $1,800/year.",
    yes: 5420, no: 612, unsure: 308, goal: 8000, pulse: 81,
    deadline: "Closes in 3 days",
    momentum: 1284,
    momentumText: "Media pickup imminent",
    pros: ["Saves residents ~$1,800/year", "Matches federal Medicare cap", "Reduces ER visits from rationing"],
    cons: ["May raise premiums slightly", "Doesn't cover self-funded plans"],
  },
  {
    id: "i4",
    title: "Modernize the federal voting rights protections act",
    category: "Democracy/Voting Rights",
    scope: "federal",
    urgency: "high",
    description: "Restore Section 5 preclearance and add automatic voter registration nationwide.",
    whyItMatters: "Restores federal review in 9 states with the highest suppression risk.",
    yes: 24800, no: 4120, unsure: 2210, goal: 50000, pulse: 73,
    deadline: "Closes in 21 days",
    momentum: 2104,
    big: true,
    pros: ["Automatic registration adds eligible voters", "Restores federal oversight in 9 states", "Standardizes ID rules"],
    cons: ["Increases federal administrative cost", "States lose some election autonomy"],
  },
  {
    id: "i5",
    title: "Plant 5,000 trees in District 7 by 2027",
    category: "Environment",
    scope: "district",
    urgency: "low",
    description: "Use $1.1M ARPA surplus to expand canopy in heat-island neighborhoods.",
    whyItMatters: "Cools 12 hottest blocks by up to 8°F during summer heat waves.",
    yes: 612, no: 88, unsure: 41, goal: 1500, pulse: 78,
    deadline: "Closes in 30 days",
    pros: ["Cools heat-island blocks up to 8°F", "Uses one-time ARPA surplus", "Improves air quality"],
    cons: ["~$220K/yr ongoing maintenance", "Trees take 5–7 years to mature"],
  },
  {
    id: "i6",
    title: "Fund 24/7 mental health crisis response team",
    category: "Public Safety/Crime",
    scope: "local",
    urgency: "high",
    description: "Replace police response with trained clinicians for non-violent mental health calls.",
    whyItMatters: "Diverts 3,200 yearly 911 calls away from armed-officer response.",
    yes: 1320, no: 280, unsure: 144, goal: 2500, pulse: 71,
    deadline: "Closes in 9 days",
    momentum: 198,
    pros: ["Frees 3,200 officer-hours/year", "Trained clinicians for mental health calls", "Pilot cities saw 24% fewer arrests"],
    cons: ["Requires hiring 18 new clinicians", "Limited weekend coverage in year 1"],
  },
  {
    id: "i7",
    title: "Property tax relief for seniors on fixed income",
    category: "Housing/Affordability",
    scope: "state",
    urgency: "medium",
    description: "Freeze property tax assessments for homeowners 65+ earning under $60K.",
    whyItMatters: "Keeps 14,000 seniors in their homes as assessments spike 22%.",
    yes: 3210, no: 920, unsure: 410, goal: 5000, pulse: 69,
    deadline: "Closes in 18 days",
    pros: ["Protects 14,000 seniors from displacement", "Income-capped at $60K", "Reversible if income rises"],
    cons: ["Shifts ~$18M burden to other taxpayers", "May reduce school funding"],
  },
  {
    id: "i8",
    title: "Repair Riverside Bridge before structural failure",
    category: "Infrastructure/Transportation",
    scope: "district",
    urgency: "critical",
    description: "Engineering report rates bridge at 38/100. Fund immediate Phase 1 retrofit.",
    whyItMatters: "Avoids closure that would reroute 8,000 daily commuters by 22 minutes.",
    yes: 2010, no: 95, unsure: 60, goal: 2500, pulse: 92,
    deadline: "Closes in 4 days",
    momentum: 624,
    momentumText: "Engineering report just released",
    pros: ["Prevents emergency closure", "Saves commuters 22 min/day", "Phase 1 cheaper than full rebuild"],
    cons: ["Lane closures during retrofit", "Full rebuild still needed by 2030"],
  },
  {
    id: "i9",
    title: "Cap grocery price hikes during declared inflation emergencies",
    category: "Economy/Inflation/Cost of Living",
    scope: "federal",
    urgency: "critical",
    description: "Authorizes FTC to cap markups on 40 staple grocery items during sustained CPI spikes >6%.",
    whyItMatters: "Targets the basket items that drove 38% of last year's grocery inflation for working families.",
    yes: 28400, no: 9120, unsure: 3410, goal: 50000, pulse: 79,
    deadline: "Closes in 11 days",
    momentum: 3120, momentumText: "Top story on 3 networks",
    big: true,
    pros: ["Targets staples that hit families hardest", "Triggered only during CPI emergencies", "FTC already has price-gouging authority"],
    cons: ["Critics warn of supply shortages", "Adds enforcement burden on FTC", "Sunsets in 3 years pending review"],
  },
  {
    id: "i10",
    title: "Modernize asylum processing — clear the 5-year backlog",
    category: "Immigration",
    scope: "federal",
    urgency: "high",
    description: "Hires 1,500 immigration judges and digitizes case management across 22 border centers.",
    whyItMatters: "Cuts asylum wait from 5 years to roughly 10 months — easing both border and city shelter strain.",
    yes: 19200, no: 11400, unsure: 5200, goal: 40000, pulse: 64,
    deadline: "Closes in 16 days",
    momentum: 1640,
    big: true,
    pros: ["Cuts wait times ~83%", "Bipartisan border + due-process package", "Funds rural border infrastructure"],
    cons: ["$18B over 5 years", "Civil-liberties groups flag biometric expansion", "Phased hiring takes 3 years"],
  },
  {
    id: "i11",
    title: "Strengthen Social Security solvency for the next 75 years",
    category: "Social Security",
    scope: "federal",
    urgency: "high",
    description: "Raises the payroll tax cap to $400K and adjusts COLA to a senior-specific index.",
    whyItMatters: "Prevents the projected 23% benefit cut hitting 70 million retirees in 2034.",
    yes: 31200, no: 6800, unsure: 2900, goal: 45000, pulse: 82,
    deadline: "Closes in 9 days",
    momentum: 2410, momentumText: "Active today",
    big: true,
    pros: ["Avoids 23% benefit cut in 2034", "Only top 6% of earners pay more", "Better inflation match for retirees"],
    cons: ["Higher payroll cost for top earners", "Doesn't address Medicare separately", "Projected solvency just to 2099"],
  },
  {
    id: "i12",
    title: "National AI transparency & deepfake disclosure act",
    category: "Technology/AI",
    scope: "federal",
    urgency: "high",
    description: "Requires watermarks on AI-generated political content and disclosure for hiring algorithms.",
    whyItMatters: "Restores trust before the 2026 election — 71% of voters already report seeing AI-faked clips.",
    yes: 22100, no: 4800, unsure: 3600, goal: 35000, pulse: 76,
    deadline: "Closes in 13 days",
    momentum: 1820,
    pros: ["Watermarks on political AI media", "Audit rights for hiring algorithms", "Bipartisan co-sponsors"],
    cons: ["Enforcement against foreign actors unclear", "Compliance cost for small firms", "Watermark standards still drafting"],
  },
  {
    id: "i13",
    title: "Codify reproductive healthcare protections at the state level",
    category: "Abortion/Reproductive Rights",
    scope: "state",
    urgency: "critical",
    description: "Locks current access into state statute and shields out-of-state patients and providers.",
    whyItMatters: "Affects access for an estimated 2.1M people of reproductive age in the state.",
    yes: 12800, no: 6400, unsure: 1900, goal: 22000, pulse: 67,
    deadline: "Closes in 5 days",
    momentum: 1980,
    pros: ["Stabilizes current access in state law", "Shield law for out-of-state patients", "Protects providers from civil suits"],
    cons: ["Federal preemption risk remains", "Doesn't expand funding", "Opponents promising legal challenge"],
  },
  {
    id: "i14",
    title: "Expand the child tax credit to $3,600 per child",
    category: "Taxes/Government Spending",
    scope: "federal",
    urgency: "high",
    description: "Restores the 2021 expanded CTC permanently with monthly advance payments.",
    whyItMatters: "Cut child poverty by 46% the year it was active — would lift ~3M kids back out.",
    yes: 26400, no: 7200, unsure: 3100, goal: 42000, pulse: 78,
    deadline: "Closes in 12 days",
    momentum: 1540,
    pros: ["Cuts child poverty ~46%", "Monthly advance payments", "Phases out above $150K AGI"],
    cons: ["~$110B/yr cost", "Critics warn of work disincentive", "Pay-fors still being negotiated"],
  },
  {
    id: "i15",
    title: "Federal disaster relief reform after climate-driven losses",
    category: "Disaster Relief",
    scope: "federal",
    urgency: "high",
    description: "Pre-funds FEMA, speeds individual-assistance approval to 14 days, and indexes payouts to actual costs.",
    whyItMatters: "Average household waits 67 days for FEMA help — this gets families housed faster.",
    yes: 18600, no: 2400, unsure: 2100, goal: 30000, pulse: 84,
    deadline: "Closes in 19 days",
    momentum: 980,
    pros: ["Cuts assistance wait by ~80%", "Indexes payouts to local rebuild costs", "Pre-funded — no mid-disaster delays"],
    cons: ["Higher annual baseline cost", "Requires FEMA hiring surge", "Indexing methodology disputed"],
  },
  {
    id: "i16",
    title: "Strengthen federal protections against election interference",
    category: "Foreign Policy",
    scope: "federal",
    urgency: "high",
    description: "Mandates rapid CISA disclosure of foreign interference and funds state cyber defenses.",
    whyItMatters: "Closes the disclosure gap that delayed alerts to 14 states in the last cycle.",
    yes: 17400, no: 3100, unsure: 2600, goal: 28000, pulse: 80,
    deadline: "Closes in 22 days",
    momentum: 740,
    pros: ["Faster public disclosure of threats", "Grants for state cyber teams", "Bipartisan intelligence-committee backed"],
    cons: ["Classification carve-outs remain broad", "Annual cost ~$1.2B", "Some states resist federal mandates"],
  },
  {
    id: "i17",
    title: "Protect collective bargaining rights for app-based workers",
    category: "Labor/Workforce",
    scope: "federal",
    urgency: "medium",
    description: "Extends NLRA-style protections to rideshare and delivery workers without reclassifying them.",
    whyItMatters: "Covers an estimated 4.5M gig workers without forcing them into W-2 status.",
    yes: 11200, no: 5800, unsure: 2900, goal: 20000, pulse: 66,
    deadline: "Closes in 24 days",
    momentum: 420,
    pros: ["Bargaining without reclassification", "Preserves flexibility workers want", "Federal floor across all states"],
    cons: ["Platforms warn of price hikes", "Implementation rules still drafting", "Doesn't address benefits parity"],
  },
  {
    id: "i18",
    title: "Police accountability & body-camera transparency act",
    category: "Public Safety/Crime",
    scope: "state",
    urgency: "high",
    description: "Statewide body-cam mandate with 30-day public release on use-of-force incidents.",
    whyItMatters: "Currently only 38% of departments have cameras — and release timelines vary 9× by county.",
    yes: 9400, no: 3600, unsure: 1800, goal: 18000, pulse: 71,
    deadline: "Closes in 17 days",
    momentum: 510,
    pros: ["Standardizes release timeline", "Funds body-cams in rural depts", "Independent review board"],
    cons: ["$94M startup cost", "Police unions opposing scope", "Storage costs grow over time"],
  },
  {
    id: "i19",
    title: "Civil rights protections for LGBTQ+ Americans in employment & housing",
    category: "Civil Rights",
    scope: "federal",
    urgency: "high",
    description: "Codifies Bostock-era protections into the Civil Rights Act of 1964.",
    whyItMatters: "29 states still lack explicit employment and housing protections.",
    yes: 21600, no: 6200, unsure: 2800, goal: 35000, pulse: 73,
    deadline: "Closes in 20 days",
    momentum: 1240,
    pros: ["Standardizes protection across 50 states", "Codifies SCOTUS Bostock ruling", "Includes housing + credit"],
    cons: ["Religious-exemption debate ongoing", "Enforcement adds EEOC workload", "Some states preparing challenges"],
  },
  {
    id: "i20",
    title: "Farm bill update: support family farms and stabilize food prices",
    category: "Agriculture",
    scope: "federal",
    urgency: "medium",
    description: "Caps payments to top 1% of agribusinesses and reinvests in mid-size family operations.",
    whyItMatters: "Redirects ~$4B/yr toward the 90% of farms producing under $1M in revenue.",
    yes: 8600, no: 2200, unsure: 1900, goal: 15000, pulse: 75,
    deadline: "Closes in 26 days",
    momentum: 280,
    pros: ["Caps payouts to mega-agribusiness", "Stabilizes mid-size farm income", "Includes SNAP funding extension"],
    cons: ["Large-farm lobby opposing caps", "Crop insurance rules still contested", "5-year reauthorization is complex"],
  },
];

export type Bill = {
  id: string;
  title: string;
  summary: string;
  supporters: number;
  threshold: 500 | 1000 | 5000;
  authors: number;
  amendments: number;
  stage: "Drafting" | "Gathering Support" | "Threshold Met" | "Delivered" | "In Committee";
  category: string;
};

export const BILLS: Bill[] = [
  {
    id: "b1", title: "District 7 School Modernization Act",
    summary: "Merged 3 community drafts. Funds rebuild + STEM lab expansion across 4 schools.",
    supporters: 2870, threshold: 5000, authors: 14, amendments: 22,
    stage: "Gathering Support", category: "Education",
  },
  {
    id: "b2", title: "Pedestrian Safety & Vision Zero Local Act",
    summary: "AI-assisted draft from 47 issue votes. Lowers default speed to 25mph in residential zones.",
    supporters: 740, threshold: 1000, authors: 6, amendments: 8,
    stage: "Gathering Support", category: "Infrastructure/Transportation",
  },
  {
    id: "b3", title: "Crisis Response & Mental Health Funding Act",
    summary: "Establishes 24/7 clinician dispatch alongside emergency services.",
    supporters: 1240, threshold: 1000, authors: 9, amendments: 11,
    stage: "Threshold Met", category: "Public Safety/Crime",
  },
  {
    id: "b4", title: "Affordable Insulin Guarantee",
    summary: "Statewide $35 cap. Delivered to State Health Committee with 5.8K constituent signatures.",
    supporters: 5820, threshold: 5000, authors: 21, amendments: 34,
    stage: "Delivered", category: "Healthcare",
  },
  {
    id: "b5", title: "Senior Property Tax Relief Resolution",
    summary: "Freezes assessments for fixed-income seniors. Draft phase — refining income thresholds.",
    supporters: 312, threshold: 500, authors: 4, amendments: 3,
    stage: "Drafting", category: "Housing/Affordability",
  },
];

export type Rep = {
  id: string;
  name: string;
  title: string;
  party: "D" | "R" | "I";
  level: "Local" | "State" | "Federal";
  alignment: number; // 0-100
  responseRate: number;
  recentVotes: number;
  photo: string; // emoji avatar
};

export const REPS: Rep[] = [
  { id: "r1", name: "Maria Chen", title: "District 7 Council Member", party: "D", level: "Local", alignment: 82, responseRate: 71, recentVotes: 34, photo: "👩🏻‍💼" },
  { id: "r2", name: "James Whitaker", title: "State Senator, Dist. 14", party: "R", level: "State", alignment: 41, responseRate: 38, recentVotes: 87, photo: "👨🏼‍💼" },
  { id: "r3", name: "Aisha Robinson", title: "State Assembly, Dist. 22", party: "D", level: "State", alignment: 76, responseRate: 64, recentVotes: 102, photo: "👩🏾‍💼" },
  { id: "r4", name: "Daniel Okafor", title: "U.S. Representative", party: "D", level: "Federal", alignment: 68, responseRate: 22, recentVotes: 218, photo: "👨🏿‍💼" },
  { id: "r5", name: "Sarah Kim", title: "U.S. Senator", party: "I", level: "Federal", alignment: 58, responseRate: 11, recentVotes: 340, photo: "👩🏻" },
];

export type Victory = {
  id: string;
  title: string;
  date: string;
  ripple: number;
  category: string;
  yourRole?: string;
  scope?: "district" | "city" | "state" | "national";
};

export const VICTORIES: Victory[] = [
  { id: "v1", title: "Free school lunches expanded to all K-8 students", date: "Mar 2026", ripple: 12400, category: "Education", yourRole: "Voted YES · shared with 4 neighbors", scope: "district" },
  { id: "v2", title: "Riverside Park finally got crosswalks", date: "Feb 2026", ripple: 3200, category: "Infrastructure/Transportation", yourRole: "Co-authored the original bill", scope: "district" },
  { id: "v3", title: "Statewide pharmacy benefit reform passed", date: "Jan 2026", ripple: 84000, category: "Healthcare", yourRole: "Voted YES · contacted 2 reps", scope: "state" },
  { id: "v4", title: "Mental health crisis response funded city-wide", date: "Dec 2025", ripple: 41000, category: "Public Safety/Crime", yourRole: "Amendment idea adopted", scope: "city" },
  { id: "v5", title: "Solar-ready roofs required on new schools", date: "Nov 2025", ripple: 8600, category: "Climate", yourRole: "Voted YES · attended hearing", scope: "district" },
  { id: "v6", title: "Senior transit pass extended to ages 60+", date: "Oct 2025", ripple: 5400, category: "Infrastructure/Transportation", yourRole: "Voted YES", scope: "district" },
  { id: "v7", title: "Federal cap on insulin prices signed into law", date: "Mar 2026", ripple: 1540000, category: "Healthcare", yourRole: "Voted YES · joined national call week", scope: "national" },
  { id: "v8", title: "National broadband expansion for rural counties", date: "Feb 2026", ripple: 820000, category: "Infrastructure/Transportation", yourRole: "Shared with 12 neighbors", scope: "national" },
  { id: "v9", title: "Clean Air Act amendments tighten methane limits", date: "Jan 2026", ripple: 2300000, category: "Climate", yourRole: "Voted YES · contacted 3 federal reps", scope: "national" },
  { id: "v10", title: "Student loan interest paused for public-service workers", date: "Dec 2025", ripple: 640000, category: "Education", yourRole: "Co-signed national petition", scope: "national" },
];

export const USER = {
  name: "Andrew",
  district: "District 7",
  zip: "94114",
  verified: true,
  impactScore: 742,
  stewardshipScore: 86,
  votesCast: 47,
  billsCoauthored: 3,
  repsContacted: 12,
  joined: "Sep 2025",
};

// Prioritized hottest first. Colors tuned for dark-navy premium palette.
export const CATEGORY_COLORS: Record<string, string> = {
  "Economy/Inflation/Cost of Living": "oklch(0.78 0.16 70)",
  Immigration: "oklch(0.72 0.15 50)",
  Healthcare: "oklch(0.72 0.17 162)",
  "Democracy/Voting Rights": "oklch(0.62 0.19 258)",
  "Public Safety/Crime": "oklch(0.68 0.20 25)",
  Education: "oklch(0.7 0.18 285)",
  "Taxes/Government Spending": "oklch(0.76 0.15 90)",
  "Border Security": "oklch(0.7 0.18 38)",
  "Energy/Climate": "oklch(0.74 0.18 145)",
  "Housing/Affordability": "oklch(0.7 0.17 30)",
  "Infrastructure/Transportation": "oklch(0.68 0.14 220)",
  "Foreign Policy": "oklch(0.64 0.14 240)",
  Environment: "oklch(0.74 0.16 155)",
  "Technology/AI": "oklch(0.72 0.16 295)",
  "Social Security": "oklch(0.74 0.15 175)",
  "Abortion/Reproductive Rights": "oklch(0.7 0.18 340)",
  "Gun Rights/Control": "oklch(0.66 0.18 20)",
  "Veterans Affairs": "oklch(0.79 0.13 230)",
  "Disaster Relief": "oklch(0.7 0.19 40)",
  Agriculture: "oklch(0.74 0.16 125)",
  "Labor/Workforce": "oklch(0.72 0.17 55)",
  "Civil Rights": "oklch(0.7 0.18 320)",
  "LGBTQ+ Issues": "oklch(0.72 0.18 310)",
  Other: "oklch(0.7 0.04 250)",
  // Legacy aliases (older entries / Congress mocks)
  Transit: "oklch(0.7 0.16 195)",
  Democracy: "oklch(0.62 0.19 258)",
  "Public Safety": "oklch(0.78 0.16 70)",
  Family: "oklch(0.72 0.21 148)",
  Housing: "oklch(0.7 0.17 30)",
  Infrastructure: "oklch(0.68 0.14 220)",
  Veterans: "oklch(0.79 0.13 230)",
};

// Ordered list — surfaced as filter chips (hottest first).
export const CATEGORY_ORDER: string[] = [
  "Economy/Inflation/Cost of Living",
  "Immigration",
  "Healthcare",
  "Democracy/Voting Rights",
  "Public Safety/Crime",
  "Education",
  "Taxes/Government Spending",
  "Border Security",
  "Energy/Climate",
  "Housing/Affordability",
  "Infrastructure/Transportation",
  "Foreign Policy",
  "Environment",
  "Technology/AI",
  "Social Security",
  "Abortion/Reproductive Rights",
  "Gun Rights/Control",
  "Veterans Affairs",
  "Disaster Relief",
  "Agriculture",
  "Labor/Workforce",
  "Civil Rights",
  "LGBTQ+ Issues",
  "Other",
];
