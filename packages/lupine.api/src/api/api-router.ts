import { ServerResponse } from 'http';
import { Logger } from '../lib';
import { ServerRequest } from '../models/locals-props';
import { handler404 } from './handle-status';
import { SimpleStorage } from './simple-storage';
import { ApiRouterCallback, ApiRouterData, ApiRouterMethod, IApiRouter } from '../models/api-router-props';
const logger = new Logger('api-router');

/*
If there is a common logic to be called all endpoints, then you can set filter.
Or, for a particular endpoint, if you want a logic to be called before any other 
WebRouterCallback or WebRouter it can be done like this:

const commLogic: WebRouterCallback = async (req: ServerRequest, res: ServerResponse) => {
  console.log('this is called by all...');
  return false;
}
router.use('/auth', commLogic, otherLogic);
*/

function isIApiRouter(handler: ApiRouterCallback | IApiRouter): handler is IApiRouter {
  return (handler as IApiRouter).findRoute !== undefined;
}

export class ApiRouter implements IApiRouter {
  private routerData: ApiRouterData[] = [];
  private filter: ApiRouterCallback | undefined;

  setFilter(filter: ApiRouterCallback) {
    this.filter = filter;
  }

  // the path should start with / and end without /, and it can be
  //    /aaa/:bbb/ccc/:ddd (ccc is a fixed section)
  //    /aaa/:bbb/ccc/?ddd/?eee (from ddd, all sections are optional)
  private storeRouter(path: string, handler: (ApiRouterCallback | IApiRouter)[], method: ApiRouterMethod) {
    let fixedPath;
    if (path === '*' || path === '/' || path === '' || path === '/*') {
      fixedPath = '*';
    } else {
      fixedPath = path;
      if (!fixedPath.startsWith('/')) {
        fixedPath = '/' + fixedPath;
      }
      if (fixedPath.endsWith('/')) {
        fixedPath = fixedPath.substring(0, fixedPath.length - 1);
      }
    }

    let parameterLength = 0;
    let parameterVariables: string[] = [];
    const ind = fixedPath.indexOf('/:');
    if (ind >= 0) {
      parameterVariables = fixedPath.substring(ind + 1).split('/');
      fixedPath = fixedPath.substring(0, ind);
      // from optionInd, all will be optional
      const optionInd = parameterVariables.findIndex((item) => item.startsWith('?'));
      parameterLength = optionInd >= 0 ? optionInd : parameterVariables.length;
    }

    this.routerData.push({
      path: fixedPath,
      handler,
      method: method,
      parameterVariables,
      parameterLength,
    });
  }

  get(path: string, ...handler: (ApiRouterCallback | IApiRouter)[]) {
    this.storeRouter(path, handler, ApiRouterMethod.GET);
  }
  post(path: string, ...handler: (ApiRouterCallback | IApiRouter)[]) {
    this.storeRouter(path, handler, ApiRouterMethod.POST);
  }

  use(path: string, ...handler: (ApiRouterCallback | IApiRouter)[]) {
    this.storeRouter(path, handler, ApiRouterMethod.ALL);
  }

  private async callHandle(
    handle: ApiRouterCallback,
    path: string,
    req: ServerRequest,
    res: ServerResponse
  ): Promise<boolean> {
    try {
      if ((await handle(req, res, path)) || res.writableEnded) {
        logger.debug(`Processed path: ${path}`);
        return true;
      }
    } catch (e: any) {
      logger.error(`Processed path: ${path}, error: ${e.message}`);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.write(
        JSON.stringify({
          status: 'error',
          message: `Processed path: ${path}, error: ${e.message}`,
        })
      );
      res.end();
      return true;
    }
    return false;
  }

  async findRoute(url: string, req: ServerRequest, res: ServerResponse, handleNotFound: boolean): Promise<boolean> {
    for (let i = 0, routerList; (routerList = this.routerData[i]); i++) {
      if (
        (routerList.method === ApiRouterMethod.ALL || routerList.method === req.method) &&
        (routerList.path === '*' || url === routerList.path || url.startsWith(routerList.path + '/'))
      ) {
        const parameters: { [key: string]: string } = {};
        let meet = true;
        if (routerList.parameterVariables.length > 0) {
          meet = false;
          const restPath = url.substring(routerList.path.length + 1).split('/');
          // the path must have mandatory parameters but some parameters can be optional
          if (
            restPath.length >= routerList.parameterLength &&
            restPath.length <= routerList.parameterVariables.length
          ) {
            meet = true;
            for (const [index, item] of routerList.parameterVariables.entries()) {
              if (!item.startsWith(':') && !item.startsWith('?') && item !== restPath[index]) {
                meet = false;
                break;
              } else if ((item.startsWith(':') || item.startsWith('?')) && index < restPath.length) {
                parameters[item.replace(/[:?]/g, '')] = restPath[index];
              }
            }
            req.locals.urlParameters = new SimpleStorage(parameters);
          }
        }

        if (meet) {
          for (let j = 0, router; (router = routerList.handler[j]); j++) {
            if (isIApiRouter(router)) {
              // it's a sub-level router
              const nextPath = routerList.path === '*' ? url : url.substring(routerList.path.length);
              // the sub-level router will not have the appName
              if ((await router.findRoute(nextPath, req, res, handleNotFound)) || res.writableEnded) {
                return true;
              }
            } else {
              // it should be a function
              // the query's url should match the api's path
              if (await this.callHandle(router, url, req, res)) {
                return true;
              }
            }
          }
        }

        if (handleNotFound) {
          // no match under this path
          logger.debug(`Processed path: ${url}, router path: ${routerList.path}`);
          const html = JSON.stringify({
            status: 'error',
            message: `Can't find any matches under router ${routerList.path} for path: ${url}.`,
          });
          handler404(res, html);
          return true;
        }
      }
    }
    return false;
  }

  async handleRequest(url: string, req: ServerRequest, res: ServerResponse): Promise<boolean> {
    if (this.filter && (await this.callHandle(this.filter, url, req, res))) {
      return true;
    }

    return await this.findRoute(url, req, res, true);
  }
}
