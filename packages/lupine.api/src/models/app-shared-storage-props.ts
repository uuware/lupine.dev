import { ISimpleStorage, SimpleStorageDataProps } from './simple-storage-props';

// interface of AppSharedStorage
export const AppSharedStorageMessageId = 'AppSharedStorage';
export type StorageMessageAction = 'get' | 'set' | 'save' | 'getWithPrefix';
export interface StorageMessageFromSubProcess {
  id: string;
  pid: number | undefined;
  workerId: number;
  action: StorageMessageAction;
  key: string;
  prefixKey?: string;
  value?: any;
  uniqueKey?: string;
  appName: string;
}

// also used in packages\lupine.api\src\common-js\web-env.js
export const AppSharedStorageWebPrefix = 'WEB.';
export const AppSharedStorageApiPrefix = 'API.';

export interface IAppSharedStorage {
  // this is a worker and msg is from Primary (but when debug is on, it's primary)
  messageFromPrimaryProcess(msgObject: any): void;
  // this is primary, msg is from a client
  messageFromSubProcess(msgObject: any): void;
  load(appName: string, rootPath: string): Promise<void>;
  save(appName?: string): Promise<void>;
  get(appName: string, key: string): Promise<string>;
  getWeb(appName: string, key: string): Promise<string>;
  getApi(appName: string, key: string): Promise<string>;
  getWebAll(appName: string): Promise<SimpleStorageDataProps>;
  getWithPrefix(appName: string, prefixKey: string): Promise<SimpleStorageDataProps>;
  set(appName: string, key: string, value: any): void;
  setWeb(appName: string, key: string, value: any): void;
  setApi(appName: string, key: string, value: any): void;
}
