import { devAdminPageRouter } from 'lupine.api/admin';
import {
  addWebVersion,
  bindGlobalStyles,
  bindLang,
  bindRenderPageFunctions,
  bindRouter,
  bindTheme,
  debugWatch,
  isFrontEnd,
  PageRouter,
  setDefaultMetaDescription,
  setDefaultPageTitle,
  webEnv,
} from 'lupine.components';
import { themes } from '../styles/theme';
import { baseCss } from '../styles/base-css';
import { ClientEnvKeys } from '../../../../shared-web-src';
import { fetchData } from '../services/fetch-data';

if (isFrontEnd() && webEnv(ClientEnvKeys.NODE_ENV, '') === 'development') {
  debugWatch(webEnv(ClientEnvKeys.API_PORT, 0));
}

addWebVersion('20250409');
bindLang('zh-cn', {});
bindTheme('light', themes);
bindGlobalStyles('comm-css', ':root', baseCss);
setDefaultPageTitle('Sample - Page Title');
setDefaultMetaDescription('Sample - Page Description');

bindRenderPageFunctions({ fetchData });

const pageRouter = new PageRouter();
pageRouter.use('/admin_dev', devAdminPageRouter);
bindRouter(pageRouter);
