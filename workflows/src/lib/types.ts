export type Email = {
  to: string;
  time: string;
  subject: string;
  content: string;
};

export type EmailMsg = {
  email: Email;
}

export type NewsletterInput = {
  email: string;
  skipRetry?: boolean;
}

export interface ScenarioConfig {
  scenarioNumber: number;
  title: string;
  description: string;
  workflowFile: string;
  retryPolicy?: {
    maximumAttempts?: number;
    backoffCoefficient?: number;
    initialInterval?: string;
  };
}
