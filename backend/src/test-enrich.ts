import { enrichIssue } from './services/aiCurator';

async function runTest() {
  const testIssue = {
    title: "Lower insulin prices for Type 1 diabetics",
    description: "Cap the monthly cost of insulin at $35 for all Americans with diabetes."
  };

  const result = await enrichIssue(testIssue);

  console.log("=== Enriched Issue Result ===");
  console.log(JSON.stringify(result, null, 2));
}

runTest();
