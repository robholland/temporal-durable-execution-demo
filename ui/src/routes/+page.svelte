<script lang="ts">
	import { page } from '$app/stores';
	import { io, Socket } from 'socket.io-client';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Spinner, Button } from 'flowbite-svelte';
	import { Toggle } from 'flowbite-svelte';
	import { Timeline, TimelineItem } from 'flowbite-svelte';
  import { EnvelopeOpenSolid, ExclamationCircleSolid, EnvelopeSolid, UserCircleSolid, FlagSolid, ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { EmailMsg, ToggleEmailServiceMsg, ScenarioMsg, WorkflowCodeMsg, DeployMsg, ScenarioConfig, ScenariosListMsg } from '../lib/types';
	import logo from '$lib/images/Temporal_Symbol_dark_1_2x.png';
	import Highlight, { LineNumbers } from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
  import highlightStyles from "svelte-highlight/styles/a11y-light";

	$: activeUrl = $page.url.pathname;

	let emailService: boolean = true;
	let active = false;
	let currentScenario = 1;
	let scenarios: ScenarioConfig[] = [];

	type CampaignEventStatus = "started" | "completed" | "failed";

	type CampaignEvent = {
		time: string;
		type: string;
		status: CampaignEventStatus;
		subject: string;
		content?: string;
	}

	let workflowCode = "";
	let highlightLines: number[] = [];
	let events: CampaignEvent[] = [];
	let email = "";

	const reset = () => {
		email = "";
		active = false;
		events = [];
	}

	const nextScenario = () => {
		if (currentScenario < scenarios.length) {
			currentScenario++;
			loadScenario();
		}
	}

	const prevScenario = () => {
		if (currentScenario > 1) {
			currentScenario--;
			loadScenario();
		}
	}

	const loadScenario = () => {
		reset();
		
		// Update server state
		socket?.emit('loadScenario', { scenario: currentScenario } as ScenarioMsg);
	}

	const getCurrentScenarioConfig = (): ScenarioConfig | undefined => {
		return scenarios.find(s => s.scenarioNumber === currentScenario);
	}

	let socket: Socket;

	const register = async () => {
		if (email !== "") {
			active = true;
			await socket.emitWithAck('register', { email });
		}
	}

	const toggleEmailService = async (event: Event) => {
		const target = event.target as HTMLInputElement;
		console.log('Toggling email service', target.checked);
		socket.emit('toggleEmailService', { status: target.checked } as ToggleEmailServiceMsg);
	}

	const deploy = async () => {
		console.log('Deploying');
		socket.emit('deploy', { email } as DeployMsg);
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
			events = [...events, { ...msg.email, type: 'email', status: "failed", content: '' }];
		});

		socket.on('campaign:started', () => {
			console.log('Campaign started');
			events = [...events, { time: new Date().toTimeString(), type: 'campaign', status: "started", subject: 'Campaign Started' }];
		})

		socket.on('campaign:completed', () => {
			console.log('Campaign complete');
			active = false;
			events = [...events, { time: new Date().toTimeString(), type: 'campaign', status: "completed", subject: 'Campaign Completed' }];
			highlightLines = [];
		})

		socket.on('campaign:failed', () => {
			console.log('Campaign failed');
			active = false;
			events = [...events, { time: new Date().toTimeString(), type: 'campaign', status: "failed", subject: 'Campaign Failed' }];
			highlightLines = [];
		})

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
		<NavHamburger />
		<NavUl {activeUrl} class="mr-4">
			<NavLi href="/" on:click={reset}>Reset</NavLi>
			<NavLi href="http://localhost:8233/">Temporal UI</NavLi>
		</NavUl>
	</Navbar>

	<div class="mt-20">
		{#if scenarios.length > 0}
			<!-- Scenario Navigation -->
			<div class="mb-6 flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 rounded-lg p-4 dark:border-gray-600 dark:bg-gray-700">
				<Button color="light" size="sm" on:click={prevScenario} disabled={currentScenario === 1}>
					<ChevronLeftOutline class="w-4 h-4 mr-2" />
					Previous
				</Button>
				<div class="text-center">
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{getCurrentScenarioConfig()?.title || 'Loading...'}</h1>
					<p class="text-sm text-gray-500 dark:text-gray-400">Scenario {currentScenario} of {scenarios.length}</p>
				</div>
				<Button color="light" size="sm" on:click={nextScenario} disabled={currentScenario === scenarios.length}>
					Next
					<ChevronRightOutline class="w-4 h-4 ml-2" />
				</Button>
			</div>

			<!-- Scenario Description -->
			<div class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<p class="text-blue-800 dark:text-blue-200">{getCurrentScenarioConfig()?.description || 'Loading scenario description...'}</p>
			</div>

			<!-- Timeline and Editor View -->
			<div class="grid grid-cols-3 gap-4">
				<section class="bg-white p-6 dark:bg-gray-900 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
					<!-- Form moved into timeline -->
					{#if !active}
						<div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
							<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Start Workflow</h3>
							<div class="space-y-3">
								<div class="relative">
									<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
									<input 
										id="email"
										class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
										placeholder="Enter email address" 
										type="email" 
										bind:value={email} 
										required
									>
								</div>
								<Button color="blue" class="w-full" on:click={register} disabled={!email}>
									Start Campaign
								</Button>
							</div>
						</div>
					{/if}

					<!-- Timeline -->
					<Timeline order="vertical" class="w-full">
						{#each events as event}
							<TimelineItem title={event.subject} date={event.time}>
								<svelte:fragment slot="icon">
									{#if event.type === "email"}
										{#if event.status == "completed"}
											<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-primary-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-primary-900">
												<EnvelopeOpenSolid class="w-4 h-4 text-primary-600 dark:text-primary-400" />
											</span>
										{:else}
											<span class="flex absolute -start-3 justify-center items-center w-6 h-6 bg-red-200 rounded-full ring-8 ring-white dark:ring-gray-900 dark:bg-red-900">
												<EnvelopeSolid class="w-4 h-4 text-red-600 dark:text-red-400" />
											</span>
										{/if}
									{:else if event.type === "campaign"}
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
								{#if event.content}
									<p>{event.content}</p>
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
