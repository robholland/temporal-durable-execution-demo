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
  retryPolicy?: {
    maximumAttempts?: number;
    backoffCoefficient?: number;
    initialInterval?: string;
  };
}

export type ScenariosListMsg = {
  scenarios: ScenarioConfig[];
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