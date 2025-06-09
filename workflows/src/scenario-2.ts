import * as activities from './activities';
import { proxyActivities } from '@temporalio/workflow';
import type { TransactionInput } from './lib/types';

const { chargeCard, reserveStock, shipItem, sendReceipt } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: { 
    initialInterval: '5 seconds', 
    backoffCoefficient: 1,
    maximumAttempts: 5 // Intelligent retries for network/service issues
  },
});

export async function PurchaseWorkflow(input: TransactionInput) {
  const { customerEmail, productName, amount, shippingAddress } = input;

  // Charge the customer's card
  await chargeCard(customerEmail, amount);

  // Reserve the item in inventory
  await reserveStock(productName);

  // Ship the item
  await shipItem(customerEmail, productName, shippingAddress);

  // Send receipt confirmation
  await sendReceipt(customerEmail, productName, amount);
} 