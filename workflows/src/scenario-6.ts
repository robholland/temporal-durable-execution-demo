import * as activities from './activities';
import type { TransactionInput } from './lib/types';

// Manual retry utility function
async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 10,
  initialDelayMs: number = 1000,
  timeoutMs: number = 10000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to each attempt
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)), timeoutMs)
      );
      
      const result = await Promise.race([operation(), timeoutPromise]);
      return result as T;
    } catch (error) {
      lastError = error;
      
      // Don't retry certain types of errors (like insufficient funds)
      if (error instanceof Error && error.message.includes('nonRetryable')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = initialDelayMs;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

export async function PurchaseWorkflow(input: TransactionInput) {
  const { customerEmail, productName, amount, shippingAddress } = input;
  
  // Charge the customer's card
  try {
    await retryOperation(
      () => activities.chargeCard(customerEmail, amount),
      'chargeCard'
    );
  } catch (error) {
    // Send failure notification with retry logic
    await retryOperation(
      () => activities.sendChargeFailureEmail(customerEmail, amount),
      'sendChargeFailureEmail'
    );
    return;
  }

  // Reserve the item in inventory
  await retryOperation(
    () => activities.reserveStock(productName),
    'reserveStock'
  );

  // Ship the item
  await retryOperation(
    () => activities.shipItem(customerEmail, productName, shippingAddress),
    'shipItem'
  );

  // Send receipt confirmation
  await retryOperation(
    () => activities.sendReceipt(customerEmail, productName, amount),
    'sendReceipt'
  );
}
