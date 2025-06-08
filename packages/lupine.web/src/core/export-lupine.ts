import { VNode } from '../jsx';
import { PageRouter } from './page-router';
import { IToClientDelivery, JsonObject } from '../models';

export type RenderPageFunctionsType = {
  fetchData: (url: string, postBody?: string | JsonObject, returnRawResponse?: boolean) => Promise<any>;
  [key: string]: Function;
};
export interface PageProps {
  url: string;
  // urlSections: string[];
  query: { [key: string]: string };
  urlParameters: { [key: string]: string };
  renderPageFunctions: RenderPageFunctionsType;
}

export type PageResultType = {
  content: string;
  title: string;
  metaData: string;
  themeName: string;
  globalCss: string;
};
export type _LupineJs = {
  // generatePage and initializePage are set in initialize.ts to avoid circular reference
  generatePage: (props: any, toClientDelivery: IToClientDelivery) => Promise<PageResultType>;
  initializePage: (newUrl?: string) => Promise<void>;
  renderPageFunctions: RenderPageFunctionsType;
  router: PageRouter | ((props: PageProps) => Promise<VNode<any>>);
  renderPageProps: PageProps;
};

// main instance to be used in the FE and the BE
export const _lupineJs: _LupineJs = {} as _LupineJs;

// for SSR, it exports _lupineJs function for the server to call
if (typeof exports !== 'undefined') {
  // ignore esbuild's warnings:
  // The CommonJS "exports" variable is treated as a global variable in an ECMAScript module and may not work as expected [commonjs-variable-in-esm]
  exports._lupineJs = () => {
    return _lupineJs;
  };
}

// this should be called by the FE and also by the server side to set fetchData and others for client and server side rendering.
// And the RenderPageFunctionsType will be passed to call (generate) a page through PageProps
export const bindRenderPageFunctions = (calls: RenderPageFunctionsType) => {
  _lupineJs.renderPageFunctions = calls || {};
};
// export const getRenderPageFunctions = (): RenderPageFunctionsType => {
//   return globalThis._lupineJs.renderPageFunctions;
// }
// this is only used inside the core
export const setRenderPageProps = (props: PageProps) => {
  _lupineJs.renderPageProps = props;
};
// this is used by the code to get url info when it's executed in the FE or in the server side.
export const getRenderPageProps = (): PageProps => {
  return _lupineJs.renderPageProps;
};

export const bindRouter = (router: PageRouter | ((props: PageProps) => Promise<VNode<any>>)) => {
  _lupineJs.router = router;
};
