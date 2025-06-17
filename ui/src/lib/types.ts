export type Email = {
  to: string;
  time: string;
  subject: string;
  content: string;
};

export type EmailMsg = {
  email: Email;
}

export type ToggleEmailServiceMsg = {
  status: boolean;
}

export type ScenarioMsg = {
  scenario: number;
}

export type ScenarioConfig = {
  scenarioNumber: number;
  title: string;
  description: string;
  workflowFile: string;
  cardBalance?: number;
  showChaosButton?: boolean;
}

export type ScenariosListMsg = {
  scenarios: ScenarioConfig[];
}

export type TransactionInput = {
  customerEmail: string;
  productName: string;
  amount: number;
  shippingAddress: string;
  cardBalance: number;
}

export type TransactionStep = {
  stepName: string;
  time: string;
  status: 'started' | 'completed' | 'failed' | 'pending';
  details?: string;
  amount?: number;
  stepId?: string;
  failureSource?: 'user' | 'automatic';
  predeterminedError?: string;
}

export type TransactionMsg = {
  step: TransactionStep;
}

export type NewsletterInput = {
  email: string;
}

export type WorkflowCodeMsg = {
  name: string;
  code: string;
  line: number;
}

export type DeployMsg = {
  email: string;
}

export type StepInteractionMsg = {
  stepId: string;
  action: 'success' | 'fail' | 'predetermined-fail';
}

export type CardBalanceMsg = {
  balance: number;
}