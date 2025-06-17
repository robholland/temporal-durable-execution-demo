import { sveltekit } from '@sveltejs/kit/vite';
import { type ViteDevServer, defineConfig } from 'vite';
import { Server } from 'socket.io';
import { createConnection, getEnv } from './src/lib/server/temporal';
import { Client } from '@temporalio/client';
import type { DeployMsg, EmailMsg, TransactionInput, ScenarioMsg, ToggleEmailServiceMsg, WorkflowCodeMsg, ScenariosListMsg, TransactionMsg, StepInteractionMsg, CardBalanceMsg } from './src/lib/types';
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
		let currentCardBalance: number = 50.00; // Default card balance

		// Store pending transaction steps with their callbacks and timeouts
		const pendingSteps = new Map<string, {
			callback: (result: any) => void;
			timeout: NodeJS.Timeout;
			step: any; // Store the original step data
		}>();

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

			// Update card balance if specified in scenario, otherwise use default
			if (scenario.cardBalance !== undefined) {
				currentCardBalance = scenario.cardBalance;
				console.log(`Set card balance to £${scenario.cardBalance.toFixed(2)} for scenario ${scenarioNumber}`);
			} else {
				currentCardBalance = 50.00; // Reset to default
				console.log(`Reset card balance to default £${currentCardBalance.toFixed(2)} for scenario ${scenarioNumber}`);
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
			// Send initial card balance when client connects
			socket.emit('cardBalance', { balance: currentCardBalance } as CardBalanceMsg);
			
			socket.on('register', async ({ customerEmail, productName, amount, shippingAddress, cardBalance }: TransactionInput, cb) => {
				// Store the card balance for this transaction
				currentCardBalance = cardBalance;
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
				
				// Send the current card balance to the client
				socket.emit('cardBalance', { balance: currentCardBalance } as CardBalanceMsg);
				
				// Confirm the scenario change back to the client
				socket.emit('scenario', { scenario: currentScenario } as ScenarioMsg);
				
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
				
				// Generate unique step ID
				const stepId = `${step.stepName}-${Date.now()}-${Math.random()}`;
				
				// Special handling for "Charge Card" step - check balance automatically
				if (step.stepName === "Charge Card") {
					const chargeAmount = step.amount || 0;
					
					if (currentCardBalance < chargeAmount) {
						// Insufficient balance - prepare the predetermined error
						const predeterminedError = `Insufficient balance. Card balance: £${currentCardBalance.toFixed(2)}, Required: £${chargeAmount.toFixed(2)}`;
						
						const pendingStep = { 
							...step, 
							status: 'pending' as const, 
							stepId,
							predeterminedError,
						};
						
						console.log('Transaction step pending (insufficient balance check)', pendingStep);
						io.emit('transaction:step', { step: pendingStep });
						
						// Set up timeout for auto-failure with predetermined error
						const timeout = setTimeout(() => {
							if (pendingSteps.has(stepId)) {
								const failedStep = { 
									...step, 
									status: 'failed' as const, 
									stepId,
									details: predeterminedError,
									failureSource: 'automatic' as const
								};
								
								console.log('Transaction step auto-failed (predetermined error timeout)', failedStep);
								io.emit('transaction:step', { step: failedStep });
								
								const pendingData = pendingSteps.get(stepId);
								if (pendingData) {
									pendingData.callback({ error: predeterminedError });
									pendingSteps.delete(stepId);
								}
							}
						}, 5000); // Use the same 5-second timeout as other steps
						
						// Store the pending step with predetermined error
						pendingSteps.set(stepId, {
							callback: cb,
							timeout,
							step: { ...step, predeterminedError }
						});
						return;
					}
				}
				
				// For all steps (including Charge Card with sufficient balance), create pending step with interactive controls
				const pendingStep = { 
					...step, 
					status: 'pending' as const, 
					stepId,
				};
				
				console.log('Transaction step pending user interaction', pendingStep);
				io.emit('transaction:step', { step: pendingStep });
				
				// Set up timeout for auto-success after 5 seconds
				const timeout = setTimeout(() => {
					if (pendingSteps.has(stepId)) {
						// For Charge Card step, deduct balance on successful completion
						if (step.stepName === "Charge Card" && step.amount) {
							currentCardBalance -= step.amount;
						}
						
						// Auto-success after timeout
						const completedStep = { ...step, status: 'completed' as const, stepId };
						console.log('Transaction step auto-completed (timeout)', completedStep);
						io.emit('transaction:step', { step: completedStep });
						
						const pendingData = pendingSteps.get(stepId);
						if (pendingData) {
							pendingData.callback({});
							pendingSteps.delete(stepId);
						}
					}
				}, 5000); // 5 second timeout
				
				// Store the pending step
				pendingSteps.set(stepId, {
					callback: cb,
					timeout,
					step
				});
			});

			// Handle manual step interaction
			socket.on('stepInteraction', async (msg: StepInteractionMsg) => {
				const { stepId, action } = msg;
				
				if (pendingSteps.has(stepId)) {
					const pendingData = pendingSteps.get(stepId)!;
					
					// Clear the timeout
					clearTimeout(pendingData.timeout);
					
					// Check if this step has a predetermined error
					const hasPredeterminedError = pendingData.step.predeterminedError;
					
					// Resolve the step based on user action
					if (action === 'success') {
						// Prevent success for steps with predetermined errors
						if (hasPredeterminedError) {
							console.log('Ignoring success action for step with predetermined error');
							return;
						}
						
						const stepName = stepId.split('-')[0];
						
						// For Charge Card step, deduct balance on successful completion
						if (stepName === "Charge Card" && pendingData.step.amount) {
							currentCardBalance -= pendingData.step.amount;
							console.log(`Charge Card step completed by user - deducted £${pendingData.step.amount.toFixed(2)}, remaining balance: £${currentCardBalance.toFixed(2)}`);
						}
						
						const completedStep = { stepName, status: 'completed' as const, stepId, time: new Date().toTimeString() };
						console.log('Transaction step completed (user action)', completedStep);
						io.emit('transaction:step', { step: completedStep });
						pendingData.callback({});
					} else if (action === 'predetermined-fail') {
						// Handle predetermined failure - should be treated as automatic failure
						const stepName = stepId.split('-')[0];
						const errorMessage = hasPredeterminedError || 'Predetermined failure';
						
						const failedStep = { 
							stepName, 
							status: 'failed' as const, 
							stepId, 
							time: new Date().toTimeString(), 
							details: errorMessage,
							failureSource: 'automatic' as const 
						};
						console.log('Transaction step failed (predetermined error triggered early)', failedStep);
						io.emit('transaction:step', { step: failedStep });
						pendingData.callback({ error: errorMessage });
					} else {
						// Manual failure (chaos monkey)
						const stepName = stepId.split('-')[0];
						const failedStep = { 
							stepName, 
							status: 'failed' as const, 
							stepId, 
							time: new Date().toTimeString(), 
							details: 'Manual failure', 
							failureSource: 'user' as const 
						};
						console.log('Transaction step failed (user chaos action)', failedStep);
						io.emit('transaction:step', { step: failedStep });
						pendingData.callback({ error: 'User triggered failure' });
					}
					
					// Clean up
					pendingSteps.delete(stepId);
				}
			});
		});
	}
}

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});

