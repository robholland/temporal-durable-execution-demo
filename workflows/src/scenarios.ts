import { ScenarioConfig } from './lib/types';

export const scenarios: ScenarioConfig[] = [
  {
    scenarioNumber: 1,
    title: "The MVP",
    workflowFile: "scenario-1.ts",
    showChaosButton: false, // Hide chaos button initially
    retryPolicy: undefined // No retries
  },
  {
    scenarioNumber: 2,
    title: "Insufficient balance",
    workflowFile: "scenario-2.ts",
    cardBalance: 5.00, // Low balance to trigger charge failures
    showChaosButton: false, // Introduce chaos button in scenario 2
    retryPolicy: undefined // No retries
  }
];

// retryPolicy: {
//   maximumAttempts: Infinity,
//   backoffCoefficient: 1,
//   initialInterval: "5 seconds"
// }

export function getScenario(scenarioNumber: number): ScenarioConfig | undefined {
  return scenarios.find(s => s.scenarioNumber === scenarioNumber);
}

export function getAllScenarios(): ScenarioConfig[] {
  return scenarios;
} 