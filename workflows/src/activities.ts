import { io } from 'socket.io-client';
import type { TransactionStep, TransactionMsg } from './lib/types';
import { ApplicationFailure } from '@temporalio/activity'

const socket = io("http://localhost:5173/");

export async function chargeCard(customerEmail: string, amount: number): Promise<void> {
  const step: TransactionStep = {
    stepName: "Charge Card",
    time: new Date().toTimeString(),
    status: "started", 
    details: `Processing payment of £${amount}`,
    amount
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg, (response: any) => {
      if (response.error) {
        if (response.error.includes('Insufficient balance')) {
          reject(ApplicationFailure.create({ nonRetryable: true, message: 'Card declined: insufficient funds' }));
        } else {
          reject(response.error);
        }
      } else {
        resolve();
      }
    });
  });
}

export async function reserveStock(productName: string): Promise<void> {
  const step: TransactionStep = {
    stepName: "Reserve Stock",
    time: new Date().toTimeString(),
    status: "started",
    details: `Reserving inventory for ${productName}`
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}

export async function shipItem(customerEmail: string, productName: string, shippingAddress: string): Promise<void> {
  const step: TransactionStep = {
    stepName: "Ship Item",
    time: new Date().toTimeString(),
    status: "started",
    details: `Dispatching ${productName} to ${shippingAddress}`
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}

export async function sendReceipt(customerEmail: string, productName: string, amount: number): Promise<void> {
  const step: TransactionStep = {
    stepName: "Send Receipt",
    time: new Date().toTimeString(),
    status: "started",
    details: `Sending receipt for ${productName} (£${amount}) to ${customerEmail}`
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}

export async function sendChargeFailureEmail(customerEmail: string, amount: number): Promise<void> {
  const step: TransactionStep = {
    stepName: "Send Charge Failure Email",
    time: new Date().toTimeString(),
    status: "started",
    details: `Sending charge failure email for £${amount} to ${customerEmail}`
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}

export async function pendingSleep(): Promise<void> {
  const step: TransactionStep = {
    stepName: "Sleep",
    time: new Date().toTimeString(),
    status: "pending",
    details: "Waiting 30 days for review period (demo: 5 seconds)"
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg);
    resolve();
  });
}

export async function completeSleep(): Promise<void> {
  const step: TransactionStep = {
    stepName: "Sleep",
    time: new Date().toTimeString(),
    status: "completed",
    details: "Review period wait completed"
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg);
    resolve();
  });
}

export async function sendReviewRequest(customerEmail: string, productName: string, amount: number): Promise<void> {
  const step: TransactionStep = {
    stepName: "Send Review Request",
    time: new Date().toTimeString(),
    status: "started",
    details: `Sending review request for ${productName} (£${amount}) to ${customerEmail}`
  };

  return new Promise((resolve, reject) => {
    socket.emit('transaction', { step } as TransactionMsg, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}