import dotenv from 'dotenv';
dotenv.config();

import { startWorker } from './worker.js';

startWorker().catch(err => {
  console.error('Worker failed:', err);
  process.exit(1);
});
