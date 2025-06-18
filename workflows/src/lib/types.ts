export type Email = {
  to: string;
  time: string;
  subject: string;
  content: string;
};

export type EmailMsg = {
  email: Email;
}

export type TransactionInput = {
  customerEmail: string;
  productName: string;
  amount: number;
  shippingAddress: string;
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

export interface ScenarioConfig {
  scenarioNumber: number;
  title: string;
  description?: string;
  workflowFile: string;
  cardBalance?: number;
  showChaosButton?: boolean;
  showCrashButton?: boolean;
  crashButtonBehaviour?: 'lost' | 'reset' | 'replay'
}
