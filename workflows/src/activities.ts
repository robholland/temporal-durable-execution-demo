import { io } from 'socket.io-client';
import type { Email, EmailMsg, TransactionStep, TransactionMsg } from './lib/types';

export async function sendEmail(email: Email): Promise<void> {
  const socket = io("http://localhost:5173/");

  return new Promise((resolve, reject) => {
    socket.emit('email', { email } as EmailMsg, (response: any) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}

export async function chargeCard(customerEmail: string, amount: number): Promise<void> {
  const socket = io("http://localhost:5173/");
  
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
        reject(response.error);
      } else {
        resolve();
      }
    });
  });
}

export async function reserveStock(productName: string): Promise<void> {
  const socket = io("http://localhost:5173/");
  
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
  const socket = io("http://localhost:5173/");
  
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
  const socket = io("http://localhost:5173/");
  
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