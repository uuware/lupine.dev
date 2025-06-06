import { VNode } from '../jsx';
import { Logger } from '../lib';
import { isFrontEnd, PageProps } from './core';
import { mountComponents } from './mount-components';

export type PageRouterCallback = (props: PageProps) => Promise<VNode<any> | null>;

export type PageRouterData = {
  path: string;
  handler: (PageRouterCallback | PageRouter)[];
  parameterVariables: string[];
  parameterLength: number;
};

export type FramePageProps = {
  component: (placeholderClassname: string, vnode: VNode<any>) => Promise<VNode<any>>;
  placeholderClassname: string;
};

export class PageRouter {
  logger = new Logger('page-router');
  private routerData: PageRouterData[] = [];
  private filter: PageRouterCallback | undefined;
  private framePage: FramePageProps | undefined;

  // if the filter returns null (passed filter), the router will continue.
  // it works in the same way as in use method
  setFilter(filter: PageRouterCallback) {
    this.filter = filter;
  }

  setFramePage(framePage: FramePageProps) {
    this.framePage = framePage;
  }

  // the path should start with / and end without /, and it can be
  //    /aaa/:bbb/ccc/:ddd (ccc is a fixed section)
  //    /aaa/:bbb/ccc/?ddd/?eee (from ddd, all sections are optional)
  //    /aaa/:?bbb/ccc/ (from bbb, all sections are optional)
  private storeRouter(path: string, handler: (PageRouterCallback | PageRouter)[]) {
    let fixedPath;
    if (path === '*' || path === '' || path === '/*') {
      // removed path === '/' ||
      fixedPath = '*';
    } else {
      fixedPath = path;
      if (!fixedPath.startsWith('/')) {
        fixedPath = '/' + fixedPath;
      }
      if (fixedPath.endsWith('/') && fixedPath.length > 1) {
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
      parameterVariables,
      parameterLength,
    });
  }

  use(path: string, ...handler: (PageRouterCallback | PageRouter)[]) {
    this.storeRouter(path, handler);
  }

  private async callHandle(handle: PageRouterCallback, path: string, props: PageProps): Promise<VNode<any> | null> {
    try {
      const vNode = await handle(props);
      // logger.debug(`Processed path: ${path}`);
      return vNode;
    } catch (e: any) {
      this.logger.error(`Processed path: ${path}, error: ${e.message}`);
      // res.write(JSON.stringify({ status: 'error', message: `Processed path: ${path}, error: ${e.message}` }));
    }
    return null;
  }

  async findRoute(url: string, props: PageProps, renderPartPage: boolean): Promise<VNode<any> | null> {
    for (let i = 0, routerList; (routerList = this.routerData[i]); i++) {
      if (routerList.path === '*' || url === routerList.path || url.startsWith(routerList.path + '/')) {
        const parameters: { [key: string]: string } = {};
        let meet = true;
        if (routerList.parameterVariables.length > 0) {
          meet = false;
          let newUrl = url.substring(routerList.path.length + 1);
          if (newUrl.endsWith('/')) {
            newUrl = newUrl.substring(0, newUrl.length - 1);
          }
          const restPath = newUrl.split('/');
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
            props.urlParameters = parameters;
          }
        }

        if (meet) {
          for (let j = 0, router; (router = routerList.handler[j]); j++) {
            if (router instanceof PageRouter) {
              // it's a sub-level router
              const nextPath =
                routerList.path === '*' || (url === '/' && routerList.path === '/')
                  ? url
                  : url.substring(routerList.path.length);
              // TODO: sub-level?
              const vNode = await router.handleRoute(nextPath, props, renderPartPage);
              if (vNode) {
                return vNode;
              }
            } else {
              // it should be a function
              // the query's url should match the api's path
              const dom = await this.callHandle(router, url, props);
              if (dom) {
                return dom;
              }
            }
          }
          // stop process for this path if no page is found
          return null;
        }
      }
    }
    return null;
  }

  async handleRoute(url: string, props: PageProps, renderPartPage: boolean): Promise<VNode<any> | null> {
    let vNode = null;
    if (this.filter) {
      vNode = await this.callHandle(this.filter, url, props);
    }
    if (!vNode) {
      vNode = await this.findRoute(url, props, renderPartPage);
    }

    if (vNode && this.framePage) {
      const selector = '.' + this.framePage.placeholderClassname;
      if (renderPartPage && isFrontEnd() && document.querySelector(selector)) {
        await mountComponents(selector, vNode);
        return null;
      } else {
        return this.framePage.component(this.framePage.placeholderClassname, vNode);
      }
    }
    return vNode;
  }
}
