import * as fs from 'fs';
import * as path from 'path';
import { ServerResponse } from 'http';
import { FsUtils, Logger } from '../lib';
import { getWebEnv } from '../lib';
import { ServerRequest } from '../models/locals-props';
import { ToClientDelivery } from './to-client-delivery';
import { IToClientDelivery } from '../models/to-client-delivery-props';
import { JsonObject } from '../models/json-object';
import { getTemplateCache } from './api-cache';
import { apiStorage } from './api-shared-storage';
import { SimpleStorageDataProps } from '../models';

const logger = new Logger('StaticServer');

export type RenderPageFunctionsType = {
  fetchData: (url: string, postData: string | JsonObject) => Promise<any>;
  [key: string]: Function;
};
let renderPageFunctions: RenderPageFunctionsType = {
  fetchData: async (url: string, postData: string | JsonObject) => {
    throw new Error('Method not implemented');
  },
};
export const getRenderPageFunctions = () => renderPageFunctions;
// for the FE code to fetch data in SSR
export const bindRenderPageFunctions = (calls: RenderPageFunctionsType) => {
  for (let k in calls) {
    renderPageFunctions[k] = calls[k];
  }
};

export type PageResultType = {
  content: string;
  title: string;
  metaData: string;
  themeName: string;
  globalCss: string;
};
type _LupineJs = {
  generatePage: (props: any, toClientDelivery: IToClientDelivery) => Promise<PageResultType>;
};

export const isServerSideRenderUrl = (urlWithoutQuery: string) => {
  /*
    ""                            -->   ""
    "name"                        -->   ""
    "name.txt"                    -->   "txt"
    ".htpasswd"                   -->   ""
    "name.with.many.dots.myext"   -->   "myext"
  */
  const ext = urlWithoutQuery.slice(((urlWithoutQuery.lastIndexOf('.') - 1) >>> 0) + 2);
  return ext === '' || ext === 'html';
};

// If the folder contains index.html and index.js, then the js will be used to render
const findNearestRoot = async (cachedHtml: any, webRoot: string, urlWithoutQuery: string) => {
  if (urlWithoutQuery === '/' || urlWithoutQuery === '/index.html') {
    return webRoot;
  }
  if (urlWithoutQuery.endsWith('/')) {
    urlWithoutQuery = urlWithoutQuery.slice(0, -1);
  }

  // cache sub folders whether it has both index.html and js, or virtual path
  if (!cachedHtml['_sub_:' + webRoot]) {
    cachedHtml['_sub_:' + webRoot] = {};
  }

  const cacheRoots = cachedHtml['_sub_:' + webRoot];
  let nearRoot = path.join(webRoot, urlWithoutQuery);
  if (cacheRoots[nearRoot] === '1') {
    return nearRoot;
  }

  while (
    cacheRoots[nearRoot] === '0' ||
    !(await FsUtils.pathExist(path.join(nearRoot, 'index.html'))) ||
    !(await FsUtils.pathExist(path.join(nearRoot, 'index.js')))
  ) {
    cacheRoots[nearRoot] = '0';
    nearRoot = path.dirname(nearRoot);
    if (cacheRoots[nearRoot] === '1' || nearRoot.length <= webRoot.length) {
      break;
    }
  }
  if (nearRoot.length <= webRoot.length) {
    nearRoot = webRoot;
  } else {
    cacheRoots[nearRoot] = '1';
  }
  return nearRoot;
};

const titleText = '<!--META-TITLE-->';
const metaTextStart = '<!--META-ENV-START-->';
const metaTextEnd = '<!--META-ENV-END-->';
const containerText = '<div class="lupine-root">'; // '</div>'
type CachedHtmlProps = {
  content: string;
  webEnv: { [k: string]: string };
  // serverConfig: { [k: string]: any };
  titleIndex: number;
  metaIndexStart: number;
  metaIndexEnd: number;
  containerIndex: number;
};
export const serverSideRenderPage = async (
  appName: string,
  webRoot: string,
  urlWithoutQuery: string,
  urlQuery: string,
  req: ServerRequest,
  res: ServerResponse
) => {
  console.log(`=========SSR, root: ${webRoot}, url: ${urlWithoutQuery}`);

  // cache multiple folders
  const cachedHtml = getTemplateCache();

  // in order to support virtual path and also sub folders, here needs to find nearest sub folder which contains index.js
  const nearRoot = await findNearestRoot(cachedHtml, webRoot, urlWithoutQuery);

  // the FE code needs to export _lupineJs
  // const lupinJs = await import(webRoot + '/index.js');
  const lupinJs = require(path.join(nearRoot, 'index.js'));
  if (!lupinJs || !lupinJs._lupineJs) {
    throw new Error('_lupineJs is not defined');
  }

  console.log(`=========load lupine: `, lupinJs);
  const _lupineJs = lupinJs._lupineJs() as _LupineJs;
  const props = {
    url: urlWithoutQuery,
    // urlSections: urlWithoutQuery.split('/').filter((i) => !!i),
    query: Object.fromEntries(new URLSearchParams(urlQuery || '')), //new URLSearchParams(urlQuery || ''),
    urlParameters: {},
    renderPageFunctions: renderPageFunctions,
  };

  if (!cachedHtml[nearRoot]) {
    const content = await fs.promises.readFile(path.join(nearRoot, 'index.html'));
    const contentWithEnv = content.toString();
    cachedHtml[nearRoot] = {
      content: contentWithEnv,
      webEnv: getWebEnv(appName),
      titleIndex: contentWithEnv.indexOf(titleText),
      metaIndexStart: contentWithEnv.indexOf(metaTextStart),
      metaIndexEnd: contentWithEnv.indexOf(metaTextEnd),
      containerIndex: contentWithEnv.indexOf(containerText),
    } as CachedHtmlProps;
  }

  const currentCache = cachedHtml[nearRoot] as CachedHtmlProps;
  const webSetting = await apiStorage.getWebAll();
  const webSettingShortKey: SimpleStorageDataProps = {};
  for (let item of Object.keys(webSetting)) {
    const newItem = item.substring(4);
    webSettingShortKey[newItem] = webSetting[item];
  }
  // const webSetting = AppConfig.get(AppConfig.WEB_SETTINGS_KEY) || {};
  const clientDelivery = new ToClientDelivery(currentCache.webEnv, webSettingShortKey, req.locals.cookies());
  const page = await _lupineJs.generatePage(props, clientDelivery);
  // console.log(`=========load lupin: `, content);

  const allowOrigin = (req.headers.origin && req.headers.origin !== 'null') ? req.headers.origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  // res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Encoding': 'gzip' });

  // const s = zlib.createGzip();
  // stream.pipeline(s, res, (err) => {
  //   s.write(cachedHtml.content.substring(0, cachedHtml.titleIndex).replace('<!--META-THEME-->', page.themeName));
  //   s.write(page.title);
  //   s.write(cachedHtml.content.substring(cachedHtml.titleIndex + titleText.length, cachedHtml.metaIndex));
  //   s.write(page.metaData);
  //   s.write(page.globalCss);
  //   s.write(
  //     cachedHtml.content.substring(cachedHtml.metaIndex + metaText.length, cachedHtml.containerIndex + containerText.length)
  //   )
  //   s.write(page.content);
  //   s.write(cachedHtml.content.substring(cachedHtml.containerIndex + containerText.length), (err) => {
  //     s.flush();
  //     res.end();
  //   });
  // });

  // data-theme and title
  res.write(currentCache.content.substring(0, currentCache.titleIndex).replace('<!--META-THEME-->', page.themeName));
  res.write(page.title);
  res.write(currentCache.content.substring(currentCache.titleIndex + titleText.length, currentCache.metaIndexStart));
  // meta data
  res.write(page.metaData);
  res.write(page.globalCss);
  res.write('<script id="web-env" type="application/json">' + JSON.stringify(currentCache.webEnv) + '</script>');
  res.write('<script id="web-setting" type="application/json">' + JSON.stringify(webSettingShortKey) + '</script>');
  res.write(
    currentCache.content.substring(
      currentCache.metaIndexEnd + metaTextEnd.length,
      currentCache.containerIndex + containerText.length
    )
  );
  // content
  res.write(page.content);
  res.write(currentCache.content.substring(currentCache.containerIndex + containerText.length));

  // const html = index.toString().replace('<div class="lupine-root"></div>', content);
  // handler200(res, html);
  res.end();
};
