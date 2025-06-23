import * as activities from './activities';
import { proxyActivities } from '@temporalio/workflow';
import type { TransactionInput } from './lib/types';

const { chargeCard, reserveStock, shipItem, sendReceipt, sendChargeFailureEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: { maximumAttempts: 1 }, // No retries - fail immediately
});

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
} 