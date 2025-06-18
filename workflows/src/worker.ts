import { Worker } from '@temporalio/worker';
import { createNativeConnection, type WorkerEnv, getEnv } from './lib/temporal';
import * as activities from './activities';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Connect to the WebSocket server
function connectToUI() {
  try {
    socket = io('http://localhost:5173'); // Default Vite dev server port
    
    socket.on('connect', () => {
      console.log('Worker connected to UI WebSocket');
    });
    
    socket.on('disconnect', () => {
      console.log('Worker disconnected from UI WebSocket');
    });
    
    socket.on('connect_error', (error) => {
      console.log('Worker WebSocket connection error:', error.message);
    });
  } catch (error) {
    console.log('Failed to connect to UI WebSocket:', error);
  }
}

// Emit worker events to UI
function emitWorkerEvent(status: 'started' | 'stopped' | 'crashed', details?: string, error?: string) {
  if (socket) {
    socket.emit('worker:event', { status, details, error });
    console.log(`Worker event emitted: ${status}`, details || error || '');
  }
}

/**
 * Run a Worker with an mTLS connection, configuration is provided via environment variables.
 * Note that serverNameOverride and serverRootCACertificate are optional.
 */
async function run({
  address,
  namespace,
  clientCertPath,
  clientKeyPath,
  serverNameOverride,
  serverRootCACertificatePath,
  taskQueue,
}: WorkerEnv) {
  // Connect to UI first
  connectToUI();
  
  try {
    const connection = await createNativeConnection({ address, clientCertPath, clientKeyPath, serverNameOverride, serverRootCACertificatePath });

    const worker = await Worker.create({
      connection,
      namespace,
      workflowsPath: require.resolve('./workflows'),
      taskQueue,
      activities,
    });

    emitWorkerEvent('started', 'Worker ready and listening for tasks');
    console.log('Worker started successfully');

    await worker.run();
    await connection.close();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    emitWorkerEvent('crashed', 'Worker crashed unexpectedly', errorMessage);
    throw error;
  }
}

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Worker received SIGTERM');
  emitWorkerEvent('stopped', 'Worker terminated by signal');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Worker received SIGINT');
  emitWorkerEvent('stopped', 'Worker interrupted by user');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in worker:', error);
  emitWorkerEvent('crashed', 'Worker crashed with uncaught exception', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection in worker:', reason);
  emitWorkerEvent('crashed', 'Worker crashed with unhandled rejection', String(reason));
  process.exit(1);
});

run(getEnv() as WorkerEnv).then(
  () => process.exit(0)
);