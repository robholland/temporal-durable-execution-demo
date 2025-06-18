<script lang="ts">
	import { page } from '$app/stores';
	import { io, Socket } from 'socket.io-client';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Spinner, Button } from 'flowbite-svelte';
	import { Timeline, TimelineItem } from 'flowbite-svelte';
  import { ExclamationCircleSolid, UserCircleSolid, FlagSolid, ChevronLeftOutline, ChevronRightOutline, CreditCardSolid, TruckSolid } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import type { EmailMsg, ToggleEmailServiceMsg, ScenarioMsg, WorkflowCodeMsg, DeployMsg, ScenarioConfig, ScenariosListMsg, TransactionInput, TransactionStep, TransactionMsg, StepInteractionMsg, CardBalanceMsg } from '../lib/types';
	import logo from '$lib/images/Temporal_Symbol_dark_1_2x.png';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
  import highlightStyles from "svelte-highlight/styles/a11y-light";

	$: activeUrl = $page.url.pathname;

	let emailService: boolean = true;
	let submitted = false;
	let active = false;
	let currentScenario = 1;
	let scenarios: ScenarioConfig[] = [];

	// Reactive statements to ensure UI updates
	$: currentScenarioConfig = scenarios.find(s => s.scenarioNumber === currentScenario);
	$: scenarioTitle = currentScenarioConfig?.title || 'Loading...';

	type TransactionEventStatus = "started" | "completed" | "failed" | "pending";

	type TransactionEvent = {
		time: string;
		type: string;
		status: TransactionEventStatus;
		subject: string;
		details?: string;
		amount?: number;
		stepId?: string;
		failureSource?: 'user' | 'automatic';
		predeterminedError?: string;
	}

	let workflowCode = "";
	let highlightLines: number[] = [];
	let events: TransactionEvent[] = [];
	
	// Transaction form data
	let customerEmail = "bob@example.com";
	let productName = "Coffee Beans";
	let amount = 9.99;
	let shippingAddress = "123 High Street, London, UK";
	let cardBalance = 50.00;

	const reset = () => {
		customerEmail = "bob@example.com";
		submitted = false;
		active = false;
		events = [];
	}

	const nextScenario = () => {
		if (currentScenario < scenarios.length) {
			loadScenario(currentScenario + 1);
		}
	}

	const prevScenario = () => {
		if (currentScenario > 1) {
			loadScenario(currentScenario - 1);
		}
	}

	const loadScenario = (scenarioNumber?: number) => {
		const targetScenario = scenarioNumber || currentScenario;
		reset();
		
		// Update server state - let server confirm the scenario change
		socket?.emit('loadScenario', { scenario: targetScenario } as ScenarioMsg);
	}

	const getCurrentScenarioConfig = (): ScenarioConfig | undefined => {
		return scenarios.find(s => s.scenarioNumber === currentScenario);
	}

	const getStepIcon = (stepName: string, status: TransactionEventStatus, failureSource?: 'user' | 'automatic') => {
		const iconClass = "w-4 h-4";
		
		if (status === "completed") {
			switch (stepName) {
				case "Check Balance":
					return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900"><svg class="${iconClass} text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path></svg></span>`;
				case "Charge Card":
					return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900"><svg class="${iconClass} text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path></svg></span>`;
				case "Reserve Stock":
					return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900"><svg class="${iconClass} text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg></span>`;
				case "Ship Item":
					return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900"><svg class="${iconClass} text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"></path></svg></span>`;
				case "Send Receipt":
					return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900"><svg class="${iconClass} text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg></span>`;
				default:
					return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900"><svg class="${iconClass} text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></span>`;
			}
		} else if (status === "failed") {
			if (failureSource === "user") {
				// Show monkey emoji for user-triggered failures
				return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-red-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-red-900"><span class="text-base">🐵</span></span>`;
			} else {
				// Show standard error icon for automatic failures (like insufficient balance)
				return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-red-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-red-900"><svg class="${iconClass} text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></span>`;
			}
		} else if (status === "pending") {
			return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-yellow-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-yellow-900"><svg class="${iconClass} text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg></span>`;
		} else {
			return `<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900"><svg class="${iconClass} text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg></span>`;
		}
	}

	let socket: Socket;

	const register = async () => {
		if (customerEmail !== "") {
			submitted = true;
			active = true;
			const transactionInput: TransactionInput = {
				customerEmail,
				productName,
				amount,
				shippingAddress,
				cardBalance
			};
			await socket.emitWithAck('register', transactionInput);
		}
	}

	const toggleEmailService = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		console.log('Toggling email service', target.checked);
		socket.emit('toggleEmailService', { status: target.checked } as ToggleEmailServiceMsg);
	}

	const deploy = async () => {
		console.log('Deploying');
		socket.emit('deploy', { email: customerEmail } as DeployMsg);
	}

	const handleStepInteraction = (stepId: string, action: 'success' | 'fail' | 'predetermined-fail') => {
		console.log(`Step interaction: ${stepId} -> ${action}`);
		socket.emit('stepInteraction', { stepId, action } as StepInteractionMsg);
	}

	const handleStepSuccess = (event: TransactionEvent) => {
		if (event.stepId) {
			handleStepInteraction(event.stepId, 'success');
		}
	}

	const handleStepFail = (event: TransactionEvent) => {
		if (event.stepId) {
			handleStepInteraction(event.stepId, 'fail');
		}
	}

	const handlePredeterminedFail = (event: TransactionEvent) => {
		if (event.stepId) {
			handleStepInteraction(event.stepId, 'predetermined-fail');
		}
	}

	onMount(() => {
		socket = io();

		socket.on('workflow:code', (msg: WorkflowCodeMsg) => {
			workflowCode = msg.code;
			if (msg.line > 0) {
				highlightLines = [msg.line - 1];
			} else {
				highlightLines = [];
			}
		});

		socket.on('email:completed', (msg: EmailMsg) => {
			console.log('Email completed', msg);
			events = [...events, { ...msg.email, type: 'email', status: "completed" }];
		});

		socket.on('email:failed', (msg: EmailMsg) => {
			console.log('Email failed', msg);
			events = [...events, { ...msg.email, type: 'email', status: "failed", details: '' }];
		});

		socket.on('transaction:started', () => {
			console.log('Transaction started');
			events = [...events, { time: new Date().toTimeString(), type: 'transaction', status: "started", subject: 'Transaction Started' }];
		})

		socket.on('transaction:completed', () => {
			console.log('Transaction complete');
			active = false;
			events = [...events, { time: new Date().toTimeString(), type: 'transaction', status: "completed", subject: 'Transaction Completed' }];
			highlightLines = [];
		})

		socket.on('transaction:failed', () => {
			console.log('Transaction failed');
			active = false;
			events = [...events, { time: new Date().toTimeString(), type: 'transaction', status: "failed", subject: 'Transaction Failed' }];
			highlightLines = [];
		})

		socket.on('transaction:step', (msg: TransactionMsg) => {
			console.log('Transaction step', msg.step);
			
			const newEvent = { 
				time: msg.step.time, 
				type: 'step', 
				status: msg.step.status, 
				subject: msg.step.stepName,
				details: msg.step.details,
				amount: msg.step.amount,
				stepId: msg.step.stepId,
				failureSource: msg.step.failureSource,
				predeterminedError: msg.step.predeterminedError
			};

			// Check if we already have an event with the same stepId
			const existingIndex = events.findIndex(e => e.stepId === msg.step.stepId);
			
			if (existingIndex >= 0) {
				// Update existing event
				events[existingIndex] = newEvent;
				events = [...events]; // Trigger reactivity
			} else {
				// Add new event
				events = [...events, newEvent];
			}
		});

		socket.on('emailServiceStatus', (status: boolean) => {
			emailService = status;
		});

		socket.on('scenario', (msg: ScenarioMsg) => {
			currentScenario = msg.scenario;
		});

		socket.on('scenarios', (msg: ScenariosListMsg) => {
			scenarios = msg.scenarios;
			console.log('Loaded scenarios:', scenarios);
		});

		socket.on('cardBalance', (msg: CardBalanceMsg) => {
			cardBalance = msg.balance;
			console.log('Updated card balance to:', cardBalance);
		});

		socket.emit('getEmailServiceStatus');
		socket.emit('getScenario');
		socket.emit('getScenarios');

		// Load initial scenario after scenarios are loaded
		setTimeout(() => {
			if (scenarios.length > 0) {
				loadScenario();
			}
		}, 100);
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Durable Execution" />
	{@html highlightStyles}
</svelte:head>

<div class="relative px-8">
	<Navbar class="px-2 sm:px-4 py-2.5 fixed z-20 top-0 start-0 border-b shadow-lg">
		<NavBrand href="/">
			<img src="{logo}" class="me-2 h-12 sm:h-9" alt="Temporal Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Durable Execution</span>
		</NavBrand>
		
		<!-- Scenario Navigation in Navbar -->
		{#if scenarios.length > 0}
			<div class="flex items-center space-x-4 text-sm">
				<Button color="light" size="xs" on:click={prevScenario} disabled={currentScenario === 1}>
					<ChevronLeftOutline class="w-3 h-3" />
				</Button>
				<div class="text-center px-2">
					<div class="text-sm font-medium text-gray-900 dark:text-white">{scenarioTitle}</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">{currentScenario} of {scenarios.length}</div>
				</div>
				<Button color="light" size="xs" on:click={nextScenario} disabled={currentScenario === scenarios.length}>
					<ChevronRightOutline class="w-3 h-3" />
				</Button>
			</div>
		{/if}
		
		<NavHamburger />
		<NavUl {activeUrl} class="mr-4">
			<NavLi href="/" on:click={reset}>Reset</NavLi>
			<NavLi href="http://localhost:8233/">Temporal UI</NavLi>
		</NavUl>
	</Navbar>

	<div class="mt-20">
		{#if scenarios.length > 0}
			<!-- Scenario Description -->
			{#if currentScenarioConfig?.description}
				<div class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p class="text-blue-800 dark:text-blue-200">{currentScenarioConfig.description}</p>
				</div>
			{/if}

			<!-- Timeline and Editor View -->
			<div class="grid grid-cols-3 gap-4">
				<section class="bg-white p-6 dark:bg-gray-900 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
					<!-- Transaction Form -->
					{#if !submitted}
						<div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order</h3>
							<div class="space-y-3">
								<div class="relative">
									<label for="customerEmail" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Customer Email</label>
									<input 
										id="customerEmail"
										class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
										placeholder="customer@example.com" 
										type="email" 
										bind:value={customerEmail} 
										required
									>
								</div>
								<div class="relative">
									<label for="productName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Product</label>
									<input 
										id="productName"
										class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
										bind:value={productName} 
										required
									>
								</div>
								<div class="relative">
									<label for="amount" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Amount (£)</label>
									<input 
										id="amount"
										class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
										type="number"
										step="0.01"
										bind:value={amount} 
										required
									>
								</div>
								<div class="relative">
									<label for="shippingAddress" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Shipping Address</label>
									<input 
										id="shippingAddress"
										class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
										bind:value={shippingAddress} 
										required
									>
								</div>
								
								<!-- Demo Configuration Section -->
								<div class="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
									<div class="mb-2">
										<span class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Demo Configuration</span>
									</div>
									<div class="relative">
										<label for="cardBalance" class="block mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
											Card Balance (£)
											{#if currentScenarioConfig?.cardBalance !== undefined}
												<span class="text-xs text-blue-600 dark:text-blue-400 ml-1">(Set by scenario)</span>
											{/if}
										</label>
										<input 
											id="cardBalance"
											class="block p-2.5 w-full text-sm text-gray-700 bg-gray-100 rounded-lg border border-gray-200 focus:ring-blue-300 focus:border-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-gray-300 dark:focus:ring-blue-400 dark:focus:border-blue-400" 
											type="number"
											step="0.01"
											bind:value={cardBalance} 
											required
										>
									</div>
								</div>
								
								<Button color="blue" class="w-full mt-4" on:click={register} disabled={!customerEmail}>
									Buy
								</Button>
							</div>
						</div>
					{/if}

					<!-- Timeline -->
					<Timeline order="vertical" class="w-full">
						{#each events as event}
							<TimelineItem title={event.subject}>
								<svelte:fragment slot="icon">
									{#if event.type === "step"}
										{@html getStepIcon(event.subject, event.status, event.failureSource)}
									{:else if event.type === "transaction"}
										{#if event.status == "started"}
											<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900">
												<UserCircleSolid class="w-4 h-4 text-green-600 dark:text-green-400" />
											</span>
										{:else if event.status == "completed"}
											<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-green-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-green-900">
												<FlagSolid class="w-4 h-4 text-green-600 dark:text-green-400" />
											</span>
										{:else}
											<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-red-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-red-900">
												<ExclamationCircleSolid class="w-4 h-4 text-red-600 dark:text-red-400" />
											</span>
										{/if}
									{/if}
								</svelte:fragment>
								{#if event.details}
									<p class="text-sm">{event.details}</p>
								{/if}
								
								{#if event.type === "step" && event.status === "pending" && event.stepId}
									<div class="mt-3 flex gap-2">
																		{#if event.predeterminedError}
									<Button 
										size="sm" 
										color="red" 
										on:click={() => handlePredeterminedFail(event)}
										class="font-medium"
									>
										😢 Sad
									</Button>
								{:else}
									<Button 
										size="sm" 
										color="green" 
										on:click={() => handleStepSuccess(event)}
										class="font-medium"
									>
										😊 Happy
									</Button>
								{/if}
										{#if currentScenarioConfig?.showChaosButton}
											<Button 
												size="xs" 
												outline 
												color="red" 
												on:click={() => handleStepFail(event)}
												class="font-normal"
											>
												🐵 Chaos
											</Button>
										{/if}
									</div>
								{/if}
							</TimelineItem>
						{/each}
					</Timeline>
					{#if active}<Spinner class="mt-4" />{/if}
				</section>
				
				<section class="col-span-2 p-6 pt-0 text-sm bg-white dark:bg-gray-900 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
					<Highlight language={typescript} code={workflowCode} let:highlighted>
						<LineNumbers {highlighted} highlightedLines={highlightLines} wrapLines --highlighted-background="rgba(0, 0, 255, 0.2)" />
					</Highlight>
				</section>
			</div>
		{:else}
			<!-- Loading state -->
			<div class="flex items-center justify-center py-12">
				<Spinner class="mr-3" />
				<span class="text-gray-500 dark:text-gray-400">Loading scenarios...</span>
			</div>
		{/if}
	</div>
</div>
