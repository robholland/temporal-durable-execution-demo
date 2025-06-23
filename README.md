# Description

This demo was presented at the Open Source in Finance Forum, 24th June 2025.

In this 15-minute talk and live demo, we'll walk through how small failures in financial systems can lead to big inconsistencies—and how Durable Execution helps teams prevent them. We'll simulate a real transaction system under failure conditions and you'll observe how a Durable Execution platform enables the application to overcome them and complete successfully—despite intermittent failures, service outages, and even a crash of the application itself.

If you've ever had to build your own safety nets around stateful operations, this talk is for you.

You'll see how Durable Execution lets developers focus on business rules, not retry loops or recovery glue and why this shift matters for building reliable, maintainable financial platforms.

The demo will use Temporal, an open source Durable Execution platform with broad adoption by the financial industry.

# Setup

In `ui/`: `npm install`

In `workflows/`: `npm install`

# Run

From `./ui`: `npm run dev`

Open http://localhost:5173

From `./workflows`: `npm run worker.watch`

# Development

If you make changes to, or add/remove scenarios, you must re-bundle so that the worker can find the code.

From `./workflows`: `npm run bundle`

Enjoy :)
