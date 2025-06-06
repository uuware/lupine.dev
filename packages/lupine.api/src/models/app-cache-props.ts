// interface of AppCache

export const AppCacheGlobal = 'APP_GLOBAL';

export enum AppCacheKeys {
  APP_LIST = 'APP_LIST', // all app names list
  TEMPLATE = 'TEMPLATE',
  APP_DATA = 'APP_DATA',
  APP_DEBUG = 'APP_DEBUG',
  NODE_ENV = 'NODE_ENV',
  API_MODULE = 'API_MODULE',
  API_CONFIG = 'API_CONFIG',
  RENDER_PAGE_FUNCTIONS = 'RENDER_PAGE_FUNCTIONS',

  START_TIME = 'START_TIME',
}

export interface IAppCache {
  clear(appName: string | undefined): void;
  get(appName: string, key: string): any;
  set(appName: string, key: string, value: any): void;
  clearTemplateCache(): void;
}
const _savedCache: { appCache: IAppCache | null } = {
  appCache: null,
};
export const getAppCache = (): IAppCache => {
  return _savedCache.appCache!;
};
export const setAppCache = (cache: IAppCache) => {
  _savedCache.appCache = cache;
};
