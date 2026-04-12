import { Queue } from 'bullmq';
import redis from './redis';

let receiptsQueue: Queue | null = null;

export const getReceiptsQueue = (): Queue => {
  if (!receiptsQueue) {
    receiptsQueue = new Queue('receipts', { connection: redis });
  }
  return receiptsQueue;
};
