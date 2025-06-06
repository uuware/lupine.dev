import { ServerResponse } from 'http';
import { AsyncStorageProps } from './async-storage-props';
import { ServerRequest } from './locals-props';
import { HostToPathProps } from './host-to-path-props';
import { IAppCache } from './app-cache-props';
import { IAppSharedStorage } from './app-shared-storage-props';
;
export interface IApiModule {
  processApi(store: AsyncStorageProps, url: string, req: ServerRequest, res: ServerResponse): Promise<boolean>;
  initApi(appConfig: HostToPathProps, appCache: IAppCache, appStorage: IAppSharedStorage): Promise<void>;
}
