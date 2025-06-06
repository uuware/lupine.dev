import { DbConfig, DbHelper, HostToPathProps, IApiBase, ServerRequest } from 'lupine.api';
import { ServerResponse } from 'http';
import path from 'path';
import { apiCache, asyncLocalStorage, bindRenderPageFunctions } from '.';
import { AppCacheGlobal, AppCacheKeys, AsyncStorageProps, IApiModule, IAppCache, IAppSharedStorage, setAppCache } from '../models';
import { apiStorage } from './api-shared-storage';

export class ApiModule implements IApiModule {
  rootApi: IApiBase;
  constructor(api: IApiBase) {
    this.rootApi = api;
  }

  public async processApi(store: AsyncStorageProps, url: string, req: ServerRequest, res: ServerResponse) {
    let result = false;
    await asyncLocalStorage.run(store, async () => {
      if (await this.rootApi.getRouter().findRoute(url, req, res, true)) {
        result = true;
        return true;
      }
    });
    return result;
  }

  // appCache is from app-loader (parent scope), not the same in current scope
  public async initApi(appConfig: HostToPathProps, appCacheFromApp: IAppCache, appStorageFromApp: IAppSharedStorage) {
    // set app's instances to api
    setAppCache(appCacheFromApp);
    // setAppStorage(appStorageFromApp);
    apiStorage.setAppSharedStorage(appStorageFromApp);
    // set RENDER_PAGE_FUNCTIONS to API module
    bindRenderPageFunctions(appCacheFromApp.get(AppCacheGlobal, AppCacheKeys.RENDER_PAGE_FUNCTIONS));

    console.log(`appConfig: `, appConfig);
    apiCache.set(apiCache.KEYS.APP_DATA, appConfig);
    // apiCache.set(apiCache.KEYS.APP_CACHE, appCache);

    // await this.initConfig(appConfig);
    apiCache.clearTemplateCache();

    appConfig.dbConfig.filename = path.join(appConfig.dataPath, 'sqlite3.db');
    await this.initDb(appConfig.dbConfig);
  }

  private async initDb(config: DbConfig) {
    const db = await DbHelper.createInstance(config);
    apiCache.set(apiCache.KEYS.DB, db);
    return db;
  }

  // private async initConfig(appConfig: HostToPathProps) {
  //   await AppConfig.load(appConfig.dataPath);
  // }
}
