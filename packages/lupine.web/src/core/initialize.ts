import { Logger } from '../lib/logger';
import { generateAllGlobalStyles } from './bind-styles';
import { defaultThemeName, getCurrentTheme, updateTheme } from './bind-theme';
import { mountComponents } from './mount-components';
// import { callPageResetEvent } from './page-reset-events';
import { PageRouter } from './page-router';
import { callPageLoadedEvent } from './page-loaded-events';
import { initServerCookies } from './server-cookie';
import { IToClientDelivery } from '../models';
import { getMetaDataObject, getMetaDataTags, getPageTitle } from './bind-meta';
import { initWebEnv, initWebSetting } from '../lib/web-env';
import { _lupineJs, PageProps, PageResultType, setRenderPageProps } from './export-lupine';
import { isFrontEnd } from '../lib/is-frontend';

const logger = new Logger('initialize');

const renderTargetPage = async (props: PageProps, renderPartPage: boolean) => {
  if (_lupineJs.router instanceof PageRouter) {
    return _lupineJs.router.handleRoute(props.url, props, renderPartPage);
  }
  return await _lupineJs.router(props);
};

// this is called by server side for SSR (server-side-rendering)
const generatePage = async (props: PageProps, toClientDelivery: IToClientDelivery): Promise<PageResultType> => {
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
    title: getPageTitle(),
    metaData: getMetaDataTags(),
    globalCss: cssText,
    themeName: currentTheme.themeName,
  };
};
_lupineJs.generatePage = generatePage;

let _pageInitialized = false;
// this is called in the FE when the document is loaded
// to avoid circular reference, bindLinks can't call initializePage directly
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
  document.title = getPageTitle();
  const metaData = getMetaDataObject();
  // meta data?
};
if (isFrontEnd()) {
  addEventListener('popstate', (event) => {
    initializePage();
  });
  addEventListener('load', (event) => {
    initializePage();
  });
}
_lupineJs.initializePage = initializePage;
