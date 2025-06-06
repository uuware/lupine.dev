import { ServerResponse } from 'http';
import { Logger } from '../lib/logger';
import { handler404 } from '../api';
import { ApiRouterCallback, AppCacheKeys, AsyncStorageProps, getAppCache, ServerRequest } from '../models';
const logger = new Logger('web-processor');

export class WebProcessor {
  static debugPath: string | undefined;
  static debugHandler: ApiRouterCallback | undefined;

  static enableDebug(path: string, debugHandler: ApiRouterCallback) {
    WebProcessor.debugPath = path;
    WebProcessor.debugHandler = debugHandler;
  }

  async processRequest(store: AsyncStorageProps, req: ServerRequest, res: ServerResponse) {
    if (WebProcessor.debugPath && req.locals.urlWithoutQuery.startsWith(WebProcessor.debugPath)) {
      if (WebProcessor.debugHandler) {
        await WebProcessor.debugHandler(req, res, req.locals.urlWithoutQuery);
        return true;
      }
    }

    // check if the request is handled by the api
    try {
      const _lupineApi = getAppCache().get(store.appName, AppCacheKeys.API_MODULE);
      if (_lupineApi && _lupineApi.processApi) {
        const result = await _lupineApi.processApi(store, store.locals.urlWithoutQuery, req, res);
        if (result) {
          return true;
        }
      } else {
        logger.error(`url: ${store.locals.url}, appName: ${store.appName}, no api module found`);
      }
    } catch (e: any) {
      logger.error(`url: ${store.locals.url}, appName: ${store.appName}, process api error: `, e.message);
    }

    handler404(res, `Request is not processed, url: ${req.locals.url}`);
    return true;
  }
}
