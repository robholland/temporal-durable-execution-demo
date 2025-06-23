import * as activities from './activities';
import { proxyActivities, proxyLocalActivities, sleep as temporalSleep } from '@temporalio/workflow';
import type { TransactionInput } from './lib/types';

const { chargeCard, reserveStock, shipItem, sendReceipt, sendChargeFailureEmail, sendReviewRequest } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 1,
  }
});

const { pendingSleep, completeSleep } = proxyLocalActivities<typeof activities>({
  startToCloseTimeout: '1 seconds',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 1,
  }
});

async function sleep(duration: any): Promise<void> {
  // Emit the wait step (this will show as pending with interaction buttons)
  await pendingSleep();

  // Sleep for the specified duration using Temporal's timer
  await temporalSleep(duration);

  // Emit the completion step
  await completeSleep();
}

export async function PurchaseWorkflow(input: TransactionInput) {
  const { customerEmail, productName, amount, shippingAddress } = input;

  // Charge the customer's card
  try {
    await chargeCard(customerEmail, amount);
  } catch (error) {
    await sendChargeFailureEmail(customerEmail, amount);
    return;
  }

  // Reserve the item in inventory
  await reserveStock(productName);

  // Ship the item
  await shipItem(customerEmail, productName, shippingAddress);

  // Send receipt confirmation
  await sendReceipt(customerEmail, productName, amount);

  // Sleep for 30 days (ok, it's a demo, so just 5 seconds)
  await sleep('5 seconds');

  // Send review request
  await sendReviewRequest(customerEmail, productName, amount);
} 