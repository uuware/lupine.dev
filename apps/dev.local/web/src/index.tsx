import {
  debugWatch,
  bindRenderPageFunctions,
  bindRouter,
  webEnv,
  PageRouter,
  bindTheme,
  setDefaultMetaTitle,
  setDefaultMetaDescription,
  bindGlobalStyles,
  _LupineJs,
  _lupineJs,
  bindLang,
  PageProps,
  Redirect,
} from 'lupine.js';
import { fetchData } from './services/fetch-data';
import { themes } from './styles/theme';
import { NotFoundPage } from './components/not-found-page';
import { LoginPage } from './components/login';
import { RegisterPage } from './components/register';
import { AdminCfgPage } from './pages/admin-cfg';
import { baseCss } from './styles/base-css';
import { UserProfilePage } from './pages/user-profile-page';
import { ResetPasswordPage } from './components/reset-password';
import { ClientEnvKeys } from '../../../shared-web-src';
import { AdminItemListPage } from './pages/admin-item-list';
import { AdminItemEditPage } from './pages/admin-item-edit';
import { UserHomePage } from './pages/user-home-page';
import { UserPageFrame } from './frames/user-page-frame';
import { AdminPageFrame } from './frames/admin-page-frame';
import { devAdminPageRouter } from 'lupine.api/admin';
import { AdminUserPage } from './pages/admin-user';
import { User1Page } from './pages/user1-page';
import { Page1Page } from './pages/page1-page';
import { TopFrame } from './frames/top-frame';
import { Frame1PageFrame } from './frames/frame1-page-frame';
import { Page2Page } from './pages/page2-page';
import { Frame2PageFrame } from './frames/frame2-page-frame';
import { ContactPage } from './pages/contact';

if (typeof window !== 'undefined' && webEnv(ClientEnvKeys.NODE_ENV, '') === 'development') {
  debugWatch(webEnv(ClientEnvKeys.API_PORT, 0));
}

bindLang('zh-cn', {});
bindTheme('light', themes);
bindGlobalStyles('comm-css', ':root', baseCss);
setDefaultMetaTitle('Development Project for LupineJS');
setDefaultMetaDescription('Development Project for LupineJS');

bindRenderPageFunctions({ fetchData });

const fetchAuth = async (props: PageProps) => {
  const data = await props.renderPageFunctions.fetchData('/api/user-info');
  return data.json;
};

export const checkAdminAuth = async (props: PageProps) => {
  if (typeof document === 'undefined') {
    return <div></div>;
  }

  const json = await fetchAuth(props);
  console.log('======auth', json);
  if (!json || !json.results || json.results.usertype !== 'admin') {
    return Redirect({ url: '/' });
  }
  return null;
};

export const checkAuth = async (props: PageProps) => {
  if (typeof document === 'undefined') {
    return <div></div>;
  }

  const json = await fetchAuth(props);
  console.log('======auth', json);
  if (!json || !json.results) {
    return Redirect({ url: '/' });
  }
  return null;
};

const adminPageRouter = new PageRouter();
adminPageRouter.setFramePage({
  component: AdminPageFrame,
  placeholderClassname: 'admin-page-placeholder',
});
// management
adminPageRouter.use('/music-edit/:id/', checkAdminAuth, AdminItemEditPage);
adminPageRouter.use('/user', checkAdminAuth, AdminUserPage);
adminPageRouter.use('/cfg', checkAdminAuth, AdminCfgPage);
adminPageRouter.use('*', checkAdminAuth, AdminItemListPage);

const userPageRouter = new PageRouter();
userPageRouter.setFramePage({
  component: UserPageFrame,
  placeholderClassname: 'user-page-placeholder',
});
// user, auth
userPageRouter.use('/profile', checkAuth, UserProfilePage);
userPageRouter.use('/contact', checkAuth, ContactPage);
userPageRouter.use('/user1/:parameter1/?option1/', User1Page);
userPageRouter.use('/page1/:parameter1/fixed-section/:parameter2/?option1/', Page1Page);
userPageRouter.use('/page2/:parameter1/fixed-section/:parameter2/?option1/', Page2Page);
userPageRouter.use('/', UserHomePage);


const frame1PageRouter = new PageRouter();
frame1PageRouter.setFramePage({
  component: Frame1PageFrame,
  placeholderClassname: 'frame1-page-placeholder',
});
frame1PageRouter.use('/page1', Page1Page);
frame1PageRouter.use('/page2', Page2Page);
frame1PageRouter.use('*', Page1Page);


const frame2PageRouter = new PageRouter();
frame2PageRouter.setFramePage({
  component: Frame2PageFrame,
  placeholderClassname: 'frame2-page-placeholder',
});
frame2PageRouter.use('/page1', Page1Page);
frame2PageRouter.use('/page2', Page2Page);
frame2PageRouter.use('*', Page1Page);


const pageRouter = new PageRouter();
pageRouter.setFramePage({
  component: TopFrame,
  placeholderClassname: 'top-frame-placeholder',
});

pageRouter.use('/admin-dev', devAdminPageRouter);
pageRouter.use('/admin', adminPageRouter);
pageRouter.use('/user', userPageRouter);
pageRouter.use('/frame1', frame1PageRouter);
pageRouter.use('/frame2', frame2PageRouter);


pageRouter.use('/login', LoginPage);
pageRouter.use('/register', RegisterPage);
pageRouter.use('/reset-pw', ResetPasswordPage);

pageRouter.use('/', userPageRouter);
pageRouter.use('*', NotFoundPage);
bindRouter(pageRouter);
