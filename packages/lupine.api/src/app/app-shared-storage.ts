/**
 * A persistent storage for the Api
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import cluster from 'cluster';
import { SimpleStorage } from '../api';
import { FsUtils, Logger } from '../lib';
import {
  SimpleStorageDataProps,
  AppSharedStorageApiPrefix,
  AppSharedStorageMessageId,
  AppSharedStorageWebPrefix,
  IAppSharedStorage,
  StorageMessageFromSubProcess,
} from '../models';

// in Api scope, use ApiSharedStorage instead of this
// storage cross clusters, loaded when start and saved before exist
export class AppSharedStorage implements IAppSharedStorage {
  private static instance: IAppSharedStorage;
  configMap: { [key: string]: { fPath: string; storage: SimpleStorage } } = {};
  logger = new Logger('server-config');

  private constructor() {}

  public static getInstance(): IAppSharedStorage {
    if (!AppSharedStorage.instance) {
      AppSharedStorage.instance = new AppSharedStorage();
    }
    return AppSharedStorage.instance;
  }

  private getWorker(workerId: number) {
    for (let i in cluster.workers) {
      if (cluster.workers[i]?.id === workerId) return cluster.workers[i];
    }
  }

  private getStorageMap(appName: string) {
    let storage = this.configMap[appName];
    if (!storage) {
      this.configMap[appName] = { fPath: '', storage: new SimpleStorage({}) };
      storage = this.configMap[appName];
    }
    return storage;
  }
  private getStorage(appName: string): SimpleStorage {
    return this.getStorageMap(appName).storage;
  }

  // this is primary, msg is from a client
  messageFromSubProcess(msgObject: StorageMessageFromSubProcess) {
    if (!cluster.isPrimary || !msgObject.action || !msgObject.key || !msgObject.appName || !msgObject.workerId) {
      console.error('AppStorage got wrong message: ', msgObject);
      return;
    }

    if (msgObject.action === 'get') {
      const storage = this.getStorage(msgObject.appName);
      const value = storage.get(msgObject.key, '');
      console.log(`AppStorage get value from ${msgObject.pid} in ${process.pid}, for key: ${msgObject.key}`);
      // send message back to the worker from the worker id
      const worker = this.getWorker(msgObject.workerId);
      if (!worker) {
        console.error("AppStorage can' find the worker: ", msgObject);
        return;
      }
      worker.send({
        value,
        ...msgObject,
      });
    } else if (msgObject.action === 'getWithPrefix') {
      const storage = this.getStorage(msgObject.appName);
      const value = storage.getWithPrefix(msgObject.key);
      console.log(`AppStorage getWithPrefix from ${msgObject.pid} in ${process.pid}, for key: ${msgObject.key}`);
      // send message back to the worker from the worker id
      const worker = this.getWorker(msgObject.workerId);
      if (!worker) {
        console.error("AppStorage can' find the worker: ", msgObject);
        return;
      }
      worker.send({
        value: JSON.stringify(value),
        ...msgObject,
      });
    } else if (msgObject.action === 'set') {
      const storage = this.getStorage(msgObject.appName);
      storage.set(msgObject.key, msgObject.value);
    } else if (msgObject.action === 'save') {
      this.save(msgObject.appName);
    } else {
      this.logger.warn(`Unknown message: ${msgObject.action}`);
    }
  }

  // this is a worker and msg is from Primary
  // when debug is on, it's in primary, but it shouldn't receive those msgs
  // mainly for get (a worker requests a get, primaary sends the value back to here)
  messageFromPrimaryProcess(msgObject: StorageMessageFromSubProcess) {
    AppSharedStorageWorker.messageFromPrimaryProcess(msgObject);
  }

  // should be only called from primary when the app is starting
  async load(appName: string, rootPath: string) {
    if (!cluster.isPrimary) {
      throw new Error('AppStorage.load should be only called from primary');
    }

    const map = this.getStorageMap(appName);
    map.fPath = path.join(rootPath, 'config.json');

    let tempPath = map.fPath;
    try {
      if (!(await FsUtils.pathExist(tempPath))) {
        tempPath = path.join(rootPath, 'resources', 'config_default.json');
      }

      let json;
      if ((json = await fs.readFile(tempPath, 'utf-8'))) {
        // it will still save to map.fPath
        map.storage.setContent(JSON.parse(json));
        map.storage.Dirty = false;
        this.logger.info(`Loading shared storage for [ ${appName} ] from ${tempPath}`);
      }
    } catch (e: any) {
      this.logger.error('Loading json file failed: ' + tempPath, e.message);
    }
  }

  // called from primary before exit, or from api to save changes
  async save(appName?: string) {
    if (!cluster.isPrimary) {
      AppSharedStorageWorker.save(appName);
      return;
    }

    if (appName) {
      const map = this.configMap[appName];
      if (map && map.fPath && map.storage.size() > 0 && map.storage.Dirty) {
        await map.storage.saveContent(map.fPath);
      }
    } else {
      // save all data
      for (let appName in this.configMap) {
        const map = this.configMap[appName];
        if (map && map.fPath && map.storage.size() > 0 && map.storage.Dirty) {
          await map.storage.saveContent(map.fPath);
        }
      }
    }
  }

  // this can be called in primary or worker
  get(appName: string, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`AppStorage get value start in ${process.pid}, for key: ${key}`);

      if (!cluster.isPrimary) {
        AppSharedStorageWorker.get(appName, key, resolve, reject);
        return;
      }

      // in primary
      resolve(this.getStorage(appName).get(key, ''));
    });
  }
  getWeb(appName: string, key: string): Promise<string> {
    return this.get(appName, AppSharedStorageWebPrefix + key);
  }
  getApi(appName: string, key: string): Promise<string> {
    return this.get(appName, AppSharedStorageApiPrefix + key);
  }
  getWebAll(appName: string): Promise<SimpleStorageDataProps> {
    return this.getWithPrefix(appName, AppSharedStorageWebPrefix);
  }
  getWithPrefix(appName: string, prefixKey: string): Promise<SimpleStorageDataProps> {
    return new Promise((resolve, reject) => {
      console.log(`AppStorage getWithPrefix start in ${process.pid}, for prefixKey: ${prefixKey}`);

      if (!cluster.isPrimary) {
        AppSharedStorageWorker.getWithPrefix(appName, prefixKey, resolve, reject);
        return;
      }

      // in primary
      resolve(this.getStorage(appName).getWithPrefix(prefixKey));
    });
  }

  // this can be called in primary or worker
  set(appName: string, key: string, value: any) {
    if (!cluster.isPrimary) {
      AppSharedStorageWorker.set(appName, key, value);
      return;
    }

    // in primary
    this.getStorage(appName).set(key, value);
  }
  setWeb(appName: string, key: string, value: any) {
    return this.set(appName, AppSharedStorageWebPrefix + key, value);
  }
  setApi(appName: string, key: string, value: any) {
    return this.set(appName, AppSharedStorageApiPrefix + key, value);
  }
}

type AppSharedStorageWorkerMap = { [key: string]: any };
class AppSharedStorageWorker {
  static handleMap: AppSharedStorageWorkerMap = {};
  static logger = new Logger('server-config');

  static messageFromPrimaryProcess(msgObject: StorageMessageFromSubProcess) {
    if (cluster.isPrimary || !msgObject.action || !msgObject.key || !msgObject.uniqueKey) {
      console.error('AppSharedStorageWorker got wrong message: ', msgObject);
      return;
    }

    if (msgObject.action === 'get') {
      console.log(`AppStorage get value end in ${process.pid}, for key: ${msgObject.key}`);

      const value = msgObject.value;
      // how to pass the value to the caller
      const map = this.handleMap[msgObject.uniqueKey];
      delete this.handleMap[msgObject.uniqueKey];
      if (map) {
        map.resolve(value);
      } else {
        throw new Error(`Unknown uniqueKey: ${msgObject.uniqueKey}`);
      }
    } else if (msgObject.action === 'getWithPrefix') {
      console.log(`AppStorage get value end in ${process.pid}, for key: ${msgObject.key}`);
      const value = JSON.parse(msgObject.value);
      // how to pass the value to the caller
      const map = this.handleMap[msgObject.uniqueKey];
      delete this.handleMap[msgObject.uniqueKey];
      if (map) {
        map.resolve(value);
      } else {
        throw new Error(`Unknown uniqueKey: ${msgObject.uniqueKey}`);
      }
    } else {
      this.logger.warn(`Unknown message: ${msgObject.action}`);
    }
  }

  static async save(appName?: string) {
    if (cluster.isPrimary) {
      throw new Error('AppSharedStorageWorker should be only called from workers');
    }
    const obj: StorageMessageFromSubProcess = {
      id: AppSharedStorageMessageId,
      pid: process.pid,
      workerId: cluster.worker?.id || 0,
      action: 'save',
      appName: appName || '',
      key: '',
    };
    process.send!(obj);
  }

  static get(appName: string, key: string, resolve: (value: any) => void, reject: (reason: any) => void) {
    if (cluster.isPrimary) {
      throw new Error('AppSharedStorageWorker should be only called from workers');
    }
    const uniqueKey = key + ':' + crypto.randomUUID();
    AppSharedStorageWorker.handleMap[uniqueKey] = { resolve, reject };
    const obj: StorageMessageFromSubProcess = {
      id: AppSharedStorageMessageId,
      pid: process.pid,
      workerId: cluster.worker?.id || 0,
      action: 'get',
      appName,
      uniqueKey,
      key,
    };
    process.send!(obj);
  }

  static getWithPrefix(appName: string, prefixKey: string, resolve: (value: any) => void, reject: (reason: any) => void) {
    if (cluster.isPrimary) {
      throw new Error('AppSharedStorageWorker should be only called from workers');
    }
    const uniqueKey = prefixKey + ':' + crypto.randomUUID();
    AppSharedStorageWorker.handleMap[uniqueKey] = { resolve, reject };
    const obj: StorageMessageFromSubProcess = {
      id: AppSharedStorageMessageId,
      pid: process.pid,
      workerId: cluster.worker?.id || 0,
      action: 'getWithPrefix',
      appName,
      uniqueKey,
      key: prefixKey,
    };
    process.send!(obj);
  }

  static set(appName: string, key: string, value: any) {
    if (cluster.isPrimary) {
      throw new Error('AppSharedStorageWorker should be only called from workers');
    }
    const obj: StorageMessageFromSubProcess = {
      id: AppSharedStorageMessageId,
      pid: process.pid,
      workerId: cluster.worker?.id || 0,
      action: 'set',
      appName,
      key,
      value,
    };
    process.send!(obj);
  }
}

// this can be used in app, but in api, it should use getAppStorage()
export const appStorage = /* @__PURE__ */ AppSharedStorage.getInstance();
