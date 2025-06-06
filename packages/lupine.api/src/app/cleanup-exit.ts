import cluster from 'cluster';
import { appStorage } from './app-shared-storage';

export const cleanupAndExit = async () => {
  console.log(`${process.pid} - Process on SIGINT, exit.`);
  // save shared storage first
  if (cluster.isPrimary) {
    // save only happens once
    await appStorage.save();
  }
  process.exit(0);
};
