import { Logger } from '../lib/logger';
import { ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { appLoader } from './app-loader';
import { DebugService } from '../api/debug-service';
import { AppCacheGlobal, AppCacheKeys, getAppCache, ServerRequest } from '../models';
import { cleanupAndExit } from './cleanup-exit';
const logger = new Logger('process-dev-requests');

function deleteRequireCache(moduleName: string) {
  var solvedName = require.resolve(moduleName),
    nodeModule = require.cache[solvedName];
  if (nodeModule) {
    for (var i = 0; i < nodeModule.children.length; i++) {
      var child = nodeModule.children[i];
      deleteRequireCache(child.filename);
    }
    delete require.cache[solvedName];
  }
}

// this is a worker and msg is from Primary
// when debug is on, it's in primary, but it shouldn't receive those msgs
export const processDebugMessage = async (msgObject: any) => {
  logger.info(`processDebugMessage, id: ${msgObject && msgObject.id}, message: ${msgObject && msgObject.message}`);
  if (msgObject.id === 'debug' && msgObject.message === 'refresh') {
    if (msgObject.appName) {
      const appConfig = getAppCache().get(msgObject.appName, AppCacheKeys.API_CONFIG);
      appLoader.refreshApi(appConfig);
    } else {
      // refresh all in a worker (app scope)
      let appList = getAppCache().get(AppCacheGlobal, AppCacheKeys.APP_LIST);
      for (const appName of appList) {
        const appConfig = getAppCache().get(appName, AppCacheKeys.API_CONFIG);
        appLoader.refreshApi(appConfig);
      }
    }

    // TemplateCache should be only used in api scope, so shouldn't clear it here
    // apiCache.clearTemplateCache();

    // this only works in debug mode (no clusters)
    DebugService.broadcastRefresh();
  }
  if (msgObject.id === 'debug' && msgObject.message === 'suspend') {
    // Only when it's debug mode, it can go here, otherwise suspend should be processed in processMessageFromWorker
    console.log(`[server] Received suspend command.`);
    cleanupAndExit();
  }
};

export async function processRefreshCache(req: ServerRequest) {
  // if this is a child process, we need to notice parent process to broadcast to all clients to refresh
  if (process.send) {
    const appName = req.locals.query.get('appName');
    process.send({ id: 'debug', message: 'refresh', appName });
  }
  // if it's debug mode (only one process)
  else {
    // if (getAppCache().get(APP_GLOBAL, AppCacheKeys.API_DEBUG) === true)
    const appName = req.locals.query.get('appName');
    processDebugMessage({ id: 'debug', message: 'refresh', appName });
  }
}

// this is only for local development
export async function processDevRequests(req: ServerRequest, res: ServerResponse, rootUrl?: string) {
  res.end();
  const address = req.socket.address() as AddressInfo;
  if (address.address !== '127.0.0.1') {
    console.log(`[server] Ignore request from: `, req.url, address.address);
    return true;
  }
  if (req.url === '/debug/suspend') {
    console.log(`[server] Received suspend command.`);
    if (process.send) {
      // send to parent process to kill all
      process.send({ id: 'debug', message: 'suspend' });
    }
    // if it's debug mode (only one process)
    else if (getAppCache().get(AppCacheGlobal, AppCacheKeys.APP_DEBUG) === true) {
      await processDebugMessage({ id: 'debug', message: 'suspend' });
    }
  } else if (req.url === '/debug/refresh') {
    await processRefreshCache(req);
  }
  if (req.url === '/debug/client') {
  }
  return true;
}
