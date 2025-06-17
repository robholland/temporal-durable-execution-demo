import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';
import { createConnection, getEnv } from './src/lib/server/temporal';
import { Client } from '@temporalio/client';
import type { DeployMsg, EmailMsg, TransactionInput, ScenarioMsg, ToggleEmailServiceMsg, WorkflowCodeMsg, ScenariosListMsg, TransactionMsg } from './src/lib/types';
import { getAllScenarios, getScenario } from '../workflows/src/scenarios';
import fs from 'fs';
import proto from '@temporalio/proto';
const { temporal } = proto;
import Long from 'long';
import workflow from '@temporalio/workflow';

const DEMO_DELAY = 1000;

const WORKFLOW_RETRY = {
	maximumAttempts: Infinity,
	backoffCoefficient: 1,
	initialInterval: '5 seconds',
}

const webSocketServer = {
	name: 'websocket',
	configureServer(server: ViteDevServer) {
		if (!server.httpServer) return;

		let emailServiceStatus: boolean = true;
		let currentScenario: number = 1;

		const io = new Server(server.httpServer);
		const clientEnv = getEnv();
		const sdkClient = new Client({
			namespace: clientEnv.namespace,
			connection: createConnection(clientEnv)
		});

		let poller: NodeJS.Timeout | undefined = undefined;

		const loadScenarioWorkflow = (scenarioNumber: number) => {
			const scenario = getScenario(scenarioNumber);
			if (!scenario) {
				console.error(`Scenario ${scenarioNumber} not found`);
				return;
			}

			try {
				fs.copyFileSync(`../workflows/src/${scenario.workflowFile}`, '../workflows/src/workflows.ts');
				console.log(`Loaded scenario ${scenarioNumber} workflow from ${scenario.workflowFile}`);
			} catch (err) {
				console.error(`Failed to load scenario ${scenarioNumber} workflow:`, err);
			}
		}

		const processWorkflowCode = (fullCode: string): { processedCode: string; lineOffset: number } => {
			// Find the main workflow function and elide everything before it
			const workflowFunctionMatch = fullCode.match(/(export async function \w+Workflow[^{]*\{[\s\S]*)/);
			
			if (workflowFunctionMatch) {
				const workflowFunction = workflowFunctionMatch[1];
				const processedCode = `// ... imports and setup ...\n\n${workflowFunction}`;
				
				// Calculate line offset: count lines before the workflow function starts
				const codeBeforeWorkflow = fullCode.substring(0, workflowFunctionMatch.index);
				const linesBefore = codeBeforeWorkflow.split('\n').length - 1;
				// Subtract 2 because we add 2 lines with the comment and empty line
				const lineOffset = linesBefore - 2;
				
				return { processedCode, lineOffset };
			}
			
			return { processedCode: fullCode, lineOffset: 0 }; // Fallback to full code if pattern not found
		}

		const getScenarioWorkflowCode = (scenarioNumber: number): string => {
			const scenario = getScenario(scenarioNumber);
			if (!scenario) {
				console.error(`Scenario ${scenarioNumber} not found`);
				return '';
			}

			try {
				const fullCode = fs.readFileSync(`../workflows/src/${scenario.workflowFile}`, 'utf-8');
				const { processedCode } = processWorkflowCode(fullCode);
				return processedCode;
			} catch (err) {
				console.error(`Failed to read scenario ${scenarioNumber} workflow:`, err);
				return '';
			}
		}

		const fetchEnhancedStackTrace = async (workflowId: string): Promise<workflow.EnhancedStackTrace> => {
			return sdkClient.workflow.getHandle(workflowId).query('__enhanced_stack_trace');
		}

		const resetWorkflowExecution = async (workflowId: string) => {
			try {
				console.log('Resetting workflow execution:', workflowId);
				const resetWorkflowExecutionRequest = temporal.api.workflowservice.v1.ResetWorkflowExecutionRequest.create({
					namespace: clientEnv.namespace,
					workflowExecution: { workflowId: workflowId, runId: '' },
					resetReapplyType: temporal.api.enums.v1.ResetReapplyType.RESET_REAPPLY_TYPE_NONE,
					workflowTaskFinishEventId: new Long(3),
					requestId: new Date().toISOString(),
				})
				await sdkClient.workflowService.resetWorkflowExecution(resetWorkflowExecutionRequest);
			} catch (err) {
				console.error('Failed to reset workflow execution', err);
			}
		}

		// Load initial scenario
		loadScenarioWorkflow(currentScenario);

		io.on('connection', (socket) => {
			socket.on('register', async ({ customerEmail, productName, amount, shippingAddress }: TransactionInput, cb) => {
				const wfId = `purchase-${customerEmail}-${Date.now()}`;
				const scenario = getScenario(currentScenario);

				if (!scenario) {
					cb({ error: `Scenario ${currentScenario} not found` });
					return;
				}

				sdkClient.workflow.start(
					'PurchaseWorkflow',
					{
						workflowId: wfId,
						taskQueue: 'demo',
						workflowTaskTimeout: '5 seconds',
						args: [{ customerEmail, productName, amount, shippingAddress } as TransactionInput],
						retry: scenario.retryPolicy
					}
				)
				.then((handle) => {
					console.log('Transaction started');
					socket.emit('transaction:started');
					cb({});

					poller = setInterval(async () => {
						try {
							const trace = await fetchEnhancedStackTrace(wfId);
							const location = trace.stacks[0].locations[0];
							const workflowPath = location.file_path;
							if (workflowPath) {
								const fullCode = fs.readFileSync(workflowPath, 'utf-8');
								const { processedCode, lineOffset } = processWorkflowCode(fullCode);
								const adjustedLine = location.line ? Math.max(1, location.line - lineOffset) : 1;
								
								socket.emit('workflow:code', {
									name: location.function_name,
									code: processedCode,
									line: adjustedLine,
								} as WorkflowCodeMsg);
							}
							console.dir(trace, { depth: null });
						} catch (err) {
							console.error('Failed to fetch enhanced stack trace', err);
						}
					}, 250);

					handle.result()
					.then(() => {
						console.log('Transaction completed');
						socket.emit('transaction:completed');

						clearInterval(poller);
						poller = undefined;
					})
					.catch((err) => {
						console.log('Transaction failed', err);
						socket.emit('transaction:failed');

						clearInterval(poller);
						poller = undefined;
					});
				})
				.catch((err) => { cb({ error: err }); });
			});

			socket.on('getEmailServiceStatus', async () => {
				socket.emit('emailServiceStatus', emailServiceStatus);
			});

			socket.on('toggleEmailService', async (msg: ToggleEmailServiceMsg) => {
				emailServiceStatus = msg.status;
				console.log('Email service status', emailServiceStatus ? 'up' : 'down');
			});

			socket.on('getScenarios', async () => {
				const scenarios = getAllScenarios();
				socket.emit('scenarios', { scenarios } as ScenariosListMsg);
			});

			socket.on('getScenario', async () => {
				socket.emit('scenario', { scenario: currentScenario });
			});

			socket.on('loadScenario', async (msg: ScenarioMsg) => {
				currentScenario = msg.scenario;
				loadScenarioWorkflow(currentScenario);
				
				// Send the workflow code immediately
				const workflowCode = getScenarioWorkflowCode(currentScenario);
				socket.emit('workflow:code', {
					name: 'PurchaseWorkflow',
					code: workflowCode,
					line: 0, // No highlighted line initially
				} as WorkflowCodeMsg);
				
				console.log(`Switched to scenario ${currentScenario}`);
			});

			socket.on('deploy', async (msg: DeployMsg) => {
				if (msg.email !== '') {
					resetWorkflowExecution(`purchase-${msg.email}-*`);
				}
				loadScenarioWorkflow(currentScenario);
				console.log('Deploy');
			});

			socket.on('email', async (msg: EmailMsg, cb) => {
				if (emailServiceStatus) {
					console.log('Email completed', msg);
					io.emit('email:completed', msg);
					cb({});
				} else {
					console.log('Email failed', msg);
					io.emit('email:failed', msg);
					cb({ error: 'Email service is down' });
				}
			});

			socket.on('transaction', async (msg: TransactionMsg, cb) => {
				const { step } = msg;
				
				// Simulate some business logic failures vs network failures
				const shouldFail = false;
				const isBusinessLogicFailure = Math.random() < 0.5; // 50% of failures are business logic
				
				if (shouldFail) {
					if (isBusinessLogicFailure && step.stepName === 'Charge Card') {
						// Business logic failure - insufficient funds or declined card
						const failedStep = { ...step, status: 'failed' as const, details: 'Card declined - insufficient credit limit' };
						console.log('Transaction step failed (business logic)', failedStep);
						io.emit('transaction:step', { step: failedStep });
						cb({ error: 'Card declined' });
					} else if (isBusinessLogicFailure && step.stepName === 'Reserve Stock') {
						// Business logic failure - out of stock
						const failedStep = { ...step, status: 'failed' as const, details: 'Out of stock - item no longer available' };
						console.log('Transaction step failed (business logic)', failedStep);
						io.emit('transaction:step', { step: failedStep });
						cb({ error: 'Out of stock' });
					} else {
						// Network/service failure - should be retried
						const failedStep = { ...step, status: 'failed' as const, details: `${step.stepName} service temporarily unavailable` };
						console.log('Transaction step failed (network)', failedStep);
						io.emit('transaction:step', { step: failedStep });
						cb({ error: 'Service temporarily unavailable' });
					}
				} else {
					// Success
					await new Promise(resolve => setTimeout(resolve, DEMO_DELAY));
					
					const completedStep = { ...step, status: 'completed' as const };
					console.log('Transaction step completed', completedStep);
					io.emit('transaction:step', { step: completedStep });
					cb({});
				}
			});
		});
	}
}

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});

