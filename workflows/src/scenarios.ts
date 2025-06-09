import { ScenarioConfig } from './lib/types';

export const scenarios: ScenarioConfig[] = [
  {
    scenarioNumber: 1,
    title: "Scenario 1: The Fragile System",
    description: "No retries at all. One network hiccup and your entire purchase disappears into the void. Shows how brittle systems fail completely on minor issues.",
    workflowFile: "scenario-1.ts",
    retryPolicy: undefined // No retries
  },
  {
    scenarioNumber: 2,
    title: "Scenario 2: Actually Working As Intended",
    description: "Temporal's intelligent handling. Miraculously behaves exactly as a human would expect - retries network issues, fails fast on business logic. Revolutionary concept: technology that works.",
    workflowFile: "scenario-2.ts",
    retryPolicy: {
      maximumAttempts: Infinity,
      backoffCoefficient: 1,
      initialInterval: "5 seconds"
    }
  }
];

export function getScenario(scenarioNumber: number): ScenarioConfig | undefined {
  return scenarios.find(s => s.scenarioNumber === scenarioNumber);
}

export function getAllScenarios(): ScenarioConfig[] {
  return scenarios;
} 