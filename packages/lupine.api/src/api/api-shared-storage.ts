/**
 * A persistent storage for the Api
 */
import { IAppSharedStorage } from '../models';
import { SimpleStorageDataProps } from '../models';
import { apiCache } from './api-cache';

// ApiSharedStorage is used in api module to store variables inside an api scope
export class ApiSharedStorage {
  private storage: IAppSharedStorage | undefined;

  public setAppSharedStorage(storage: IAppSharedStorage): void {
    this.storage = storage;
  }
  public getAppSharedStorage(): IAppSharedStorage {
    if (!this.storage) {
      throw new Error('AppSharedStorage not initialized');
    }
    return this.storage;
  }

  // called from primary before exit, or from api to save changes
  async save() {
    const appName = apiCache.getAppName();
    await this.getAppSharedStorage().save(appName);
  }

  get(key: string): Promise<string> {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().get(appName, key);
  }
  getWeb(key: string): Promise<string> {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().getWeb(appName, key);
  }
  getApi(key: string): Promise<string> {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().getApi(appName, key);
  }
  getWebAll(): Promise<SimpleStorageDataProps> {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().getWebAll(appName);
  }
  getWithPrefix(prefixKey: string): Promise<SimpleStorageDataProps> {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().getWithPrefix(appName, prefixKey);
  }

  set(key: string, value: any) {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().set(appName, key, value);
  }
  setWeb(key: string, value: any) {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().setWeb(appName, key, value);
  }
  setApi(key: string, value: any) {
    const appName = apiCache.getAppName();
    return this.getAppSharedStorage().setApi(appName, key, value);
  }
}

// this can be used in app, but in api, it should use getAppStorage()
export const apiStorage = /* @__PURE__ */ new ApiSharedStorage();
