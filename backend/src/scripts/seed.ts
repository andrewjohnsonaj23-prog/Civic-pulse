import { supabase } from '../lib/supabase';

const SEED_ISSUES = [
  {
    title: "Rebuild Maple Street school after fire damage",
    category: "Education",
    scope: "district",
    urgency: "critical",
    description: "Allocate $4.2M from district reserves to rebuild the east wing before fall semester.",
    why_it_matters: "Prevents 480 students from being bused 14 miles in September.",
    yes_votes: 1840,
    no_votes: 212,
    unsure_votes: 96,
    goal: 3000,
    pulse: 87,
    deadline: "Closes in 6 days",
    momentum: 412,
    momentum_text: null,
    pros: ["Keeps 480 kids in their neighborhood", "Uses existing reserve funds", "Ready before fall semester"],
    cons: ["Draws down 28% of district reserves", "No vote on long-term funding plan"],
    big: false,
  },
  {
    title: "Cap insulin co-pays at $35/month statewide",
    category: "Healthcare",
    scope: "state",
    urgency: "critical",
    description: "Mirror federal Medicare cap for all state-regulated insurance plans.",
    why_it_matters: "Saves 91,000 diabetic residents an average of $1,800/year.",
    yes_votes: 5420,
    no_votes: 612,
    unsure_votes: 308,
    goal: 8000,
    pulse: 81,
    deadline: "Closes in 3 days",
    momentum: 1284,
    momentum_text: "Media pickup imminent",
    pros: ["Saves residents ~$1,800/year", "Matches federal Medicare cap"],
    cons: ["May raise premiums slightly", "Doesn't cover self-funded plans"],
    big: false,
  },
  {
    title: "Cap grocery price hikes during declared inflation emergencies",
    category: "Economy/Inflation/Cost of Living",
    scope: "federal",
    urgency: "critical",
    description: "Authorizes FTC to cap markups on 40 staple grocery items during sustained CPI spikes.",
    why_it_matters: "Targets the basket items that drove 38% of last year's grocery inflation for working families.",
    yes_votes: 28400,
    no_votes: 9120,
    unsure_votes: 3410,
    goal: 50000,
    pulse: 79,
    deadline: "Closes in 11 days",
    momentum: 3120,
    momentum_text: "Top story on 3 networks",
    pros: ["Targets staples that hit families hardest", "FTC already has price-gouging authority"],
    cons: ["Critics warn of supply shortages", "Adds enforcement burden on FTC"],
    big: true,
  },
];

async function seed() {
  console.log('Seeding database...');

  const { data, error } = await supabase
    .from('issues')
    .insert(SEED_ISSUES)
    .select();

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} issues successfully`);
  process.exit(0);
}

seed();
