import cluster from 'cluster';
import { Logger, LogWriter, LogWriterMessageId } from '../lib';
import { processDebugMessage } from './process-dev-requests';
import { appStorage } from './app-shared-storage';
import { AppSharedStorageMessageId } from '../models';
import { cleanupAndExit } from './cleanup-exit';

const logger = new Logger('app-message');
// send msg to all clients
const broadcast = (msgObject: any) => {
  for (let i in cluster.workers) {
    if (cluster.workers[i]) cluster.workers[i].send(msgObject);
  }
};

// this is a worker and msg is from Primary
// when debug is on, it's in primary, but it shouldn't receive those msgs
export const processMessageFromPrimary = (msgObject: any) => {
  if (!msgObject || !msgObject.id) {
    logger.warn(`Unknown message from master in work: ${cluster.worker?.id}`);
    return;
  }

  if (msgObject.id == 'debug') {
    processDebugMessage(msgObject);
  } else if (msgObject.id == AppSharedStorageMessageId) {
    appStorage.messageFromPrimaryProcess(msgObject);
  } else {
    logger.warn(`Unknown message: ${msgObject.id}`);
  }
};

// this is primary, msg is from a client
export const processMessageFromWorker = (msgObject: any) => {
  if (!msgObject || !msgObject.id) {
    if (msgObject['watch:require']) return;
    logger.warn(`Unknown message from work: ${cluster.worker?.id}`);
    return;
  }

  if (msgObject.id == LogWriterMessageId) {
    LogWriter.messageFromSubProcess(msgObject);
  } else if (msgObject.id == AppSharedStorageMessageId) {
    appStorage.messageFromSubProcess(msgObject);
  } else if (msgObject.id == 'debug') {
    logger.debug(
      `Message from worker ${cluster.worker?.id}, message: ${msgObject.message}, appName: ${msgObject.appName}`
    );
    broadcast(msgObject);
    // if it's suspend, the primary process will exit
    if (msgObject.message === 'suspend') {
      setTimeout(() => {
        console.log(`[server primary] Received suspend command.`, cluster.workers);
        cleanupAndExit();
      }, 100);
    }
  } else {
    logger.warn(`Unknown message: ${msgObject.id}`);
  }
};
