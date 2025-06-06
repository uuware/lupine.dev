import { getMetaDataObject, getMetaDataTags, getMetaTitle } from '../components';
import { VNode } from '../jsx';
import { initWebEnv, initWebSetting } from '../lib';
import { Logger } from '../lib/logger';
import { generateAllGlobalStyles } from './bind-styles';
import { defaultThemeName, getCurrentTheme, updateTheme } from './bind-theme';
import { mountComponents } from './mount-components';
// import { callPageResetEvent } from './page-reset-events';
import { PageRouter } from './page-router';
import { callPageLoadedEvent } from './page-loaded-events';
import { initServerCookies } from './server-cookie';
import { IToClientDelivery } from '../models/to-client-delivery-props';

export type JsonKeyValue = {
  [key: string]: string | number | boolean | null | undefined | JsonKeyValue | JsonKeyValue[];
};
export type JsonObject =
  | JsonKeyValue[]
  | {
      [key: string]: string | number | boolean | null | undefined | JsonKeyValue | JsonKeyValue[];
    };

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
  generatePage: (props: any, toClientDelivery: IToClientDelivery) => Promise<PageResultType>;
  renderPageFunctions: RenderPageFunctionsType;
  router: PageRouter | ((props: PageProps) => Promise<VNode<any>>);
  renderPageProps: PageProps;
};

const logger = new Logger('core');
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
const setRenderPageProps = (props: PageProps) => {
  _lupineJs.renderPageProps = props;
};
// this is used by the code to get url info when it's executed in the FE or in the server side.
export const getRenderPageProps = (): PageProps => {
  return _lupineJs.renderPageProps;
};

export const bindRouter = (router: PageRouter | ((props: PageProps) => Promise<VNode<any>>)) => {
  _lupineJs.router = router;
};

export const isFrontEnd = () => {
  return typeof window === 'object' && typeof document === 'object';
};

const renderTargetPage = async (props: PageProps, renderPartPage: boolean) => {
  if (_lupineJs.router instanceof PageRouter) {
    return _lupineJs.router.handleRoute(props.url, props, renderPartPage);
  }
  return await _lupineJs.router(props);
};

// this is called by server side for SSR (server-side-rendering)
export const generatePage = async (props: PageProps, toClientDelivery: IToClientDelivery): Promise<PageResultType> => {
  setRenderPageProps(props);

  initWebEnv(toClientDelivery.getWebEnv());
  initWebSetting(toClientDelivery.getWebSetting());
  initServerCookies(toClientDelivery.getServerCookie());
  // callPageResetEvent();
  callPageLoadedEvent();

  const jsxNodes = await renderTargetPage(props, false);
  if (!jsxNodes || !jsxNodes.props) {
    return {
      content: `Unexpected url: ${props.url}`,
      title: '',
      metaData: '',
      globalCss: '',
      themeName: defaultThemeName,
    };
  }

  await mountComponents(null, jsxNodes);
  const currentTheme = getCurrentTheme();
  const cssText = generateAllGlobalStyles();
  const content = jsxNodes.props._html.join('');

  return {
    content,
    title: getMetaTitle(),
    metaData: getMetaDataTags(),
    globalCss: cssText,
    themeName: currentTheme.themeName,
  };
};
_lupineJs.generatePage = generatePage;

let _pageInitialized = false;
// this is called in the FE when the document is loaded
export const initializePage = async (newUrl?: string) => {
  const currentPageInitialized = _pageInitialized;
  _pageInitialized = true;
  logger.log('initializePage: ', newUrl);
  if (newUrl) {
    window.history.pushState({ urlPath: newUrl }, '', newUrl);
    // prevents browser from storing history with each change:
    // window.history.replaceState({ html: '', pageTitle: newUrl }, '', newUrl);
  }
  const splitUrl = newUrl ? newUrl.split('?') : [];
  const url = splitUrl[0] || document.location.pathname;
  const queryString = splitUrl[1] || document.location.search;

  const props: PageProps = {
    url,
    // urlSections: url.split('/').filter((i) => !!i),
    query: Object.fromEntries(new URLSearchParams(queryString)), // new URLSearchParams(queryString),
    urlParameters: {},
    renderPageFunctions: _lupineJs.renderPageFunctions,
  };

  setRenderPageProps(props);
  // !currentPageInitialized && callPageResetEvent();
  !currentPageInitialized && callPageLoadedEvent();

  const jsxNodes = await renderTargetPage(props, currentPageInitialized);
  if (jsxNodes === null) return;
  if (!jsxNodes || !jsxNodes.props) {
    document.querySelector('.lupine-root')!.innerHTML = `Unexpected url: ${url}`;
    return;
  }

  // generateAllGlobalStyles will be updated directly in Browser
  await mountComponents('.lupine-root', jsxNodes);
  updateTheme(getCurrentTheme().themeName);

  // title
  document.title = getMetaTitle();
  const metaData = getMetaDataObject();
  // meta data?
};
if (typeof window !== 'undefined') {
  addEventListener('popstate', (event) => {
    initializePage();
  });
  addEventListener('load', (event) => {
    initializePage();
  });
}
