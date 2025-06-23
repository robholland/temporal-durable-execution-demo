import { ScenarioConfig } from './lib/types';

export const scenarios: ScenarioConfig[] = [
  {
    scenarioNumber: 1,
    title: "The MVP",
    workflowFile: "scenario-1.ts",
    showChaosButton: false
  },
  {
    scenarioNumber: 2,
    title: "Insufficient balance",
    workflowFile: "scenario-2.ts",
    cardBalance: 5.00, // Low balance to trigger charge failures
    showChaosButton: false
  },
  {
    scenarioNumber: 3,
    title: "Signs of Chaos",
    workflowFile: "scenario-3.ts",
    showChaosButton: true
  },
  {
    scenarioNumber: 4,
    title: "Durable Execution: Ignoring the Monkey",
    workflowFile: "scenario-4.ts",
    showChaosButton: true
  },
  {
    scenarioNumber: 5,
    title: "Durable Execution: Chaos vs Process",
    workflowFile: "scenario-5.ts",
    cardBalance: 5.00, // Low balance to trigger charge failures
    showChaosButton: true
  },
  {
    scenarioNumber: 6,
    title: "The Worst (?) Kind of Chaos: Process Death",
    workflowFile: "scenario-6.ts",
    showChaosButton: true,
    showCrashButton: true,
    crashButtonBehaviour: 'lost',
  },
  {
    scenarioNumber: 7,
    title: "What were we doing?",
    workflowFile: "scenario-7.ts",
    showChaosButton: true,
    showCrashButton: true,
    crashButtonBehaviour: 'reset',
  },
  {
    scenarioNumber: 8,
    title: "Durable Execution: Just carry on",
    workflowFile: "scenario-8.ts",
    showChaosButton: true,
    showCrashButton: true,
    crashButtonBehaviour: 'replay',
  },
  {
    scenarioNumber: 9,
    title: "Durable Execution: Learning what is possible",
    workflowFile: "scenario-9.ts",
    showCrashButton: true,
    crashButtonBehaviour: 'replay',
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