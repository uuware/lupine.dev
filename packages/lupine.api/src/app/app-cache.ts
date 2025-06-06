/**
 * A simple settings/config class for storing key/value pairs in memory
 */

import { AppCacheGlobal, AppCacheKeys, IAppCache } from '../models/app-cache-props';

// ApiCache doesn't share cross clusters
// Since apis and app are independent, so AppCache in apis and app are different instances.
// That's why replaceInstance is used to copy data from app to apis,
// and also AppCache is not shared cross app and apis, so `set` is only supposed to be called when app starts
export class AppCache implements IAppCache {
  private static instance: AppCache;

  cacheMap: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): AppCache {
    if (!AppCache.instance) {
      AppCache.instance = new AppCache();
    }
    return AppCache.instance;
  }

  clear(appName: string | undefined) {
    const preKey = appName + '.';
    Object.keys(this.cacheMap).forEach((key) => {
      if (!appName || key.startsWith(preKey)) {
        delete this.cacheMap[key];
      }
    });
  }

  get(appName: string, key: string) {
    return this.cacheMap[`${appName}.${key}`];
  }

  set(appName: string, key: string, value: any) {
    if (typeof value === 'undefined') {
      delete this.cacheMap[`${appName}.${key}`];
    } else {
      this.cacheMap[`${appName}.${key}`] = value;
    }
  }

  clearTemplateCache() {
    const appList = this.get(AppCacheGlobal, AppCacheKeys.APP_LIST) as string[];
    appList.forEach((appName) => {
      this.set(appName, AppCacheKeys.TEMPLATE, undefined);
    });
  }
}

// this can be used in app, but in api, it should use getAppCache()
export const appCache = /* @__PURE__ */ AppCache.getInstance();
