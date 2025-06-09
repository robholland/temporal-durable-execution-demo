import { ScenarioConfig } from './lib/types';

export const scenarios: ScenarioConfig[] = [
  {
    scenarioNumber: 1,
    title: "Scenario 1: No Retries",
    description: "In this scenario, retries are disabled. If any email fails to send, the entire workflow will fail immediately without attempting to recover.",
    workflowFile: "scenario-1.ts",
    retryPolicy: undefined // No retries
  },
  {
    scenarioNumber: 2,
    title: "Scenario 2: With Retries",
    description: "In this scenario, retries are enabled with Temporal's built-in retry mechanism. If an email fails, the system will automatically retry with exponential backoff until it succeeds.",
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