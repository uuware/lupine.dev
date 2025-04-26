import {
  CssProps,
  DomUtils,
  getRenderPageProps,
  HtmlVar,
  NotificationMessage,
  NotificationColor,
  RefProps,
  ThemeSelector,
} from 'lupine.js';
import { getCookieUser } from '../services/shared-data';
import { userCookieName } from '../models';

export type UserInfoType = {
  id: number;
  email: string;
  username: string;
  nickname: string;
  usertype: string;
  points: number;
};
export const getUserInfo = async () => {
  console.log('get user info');
  const result = await getRenderPageProps().renderPageFunctions.fetchData('/api/user-info');
  if (!result.json || result.json.status !== 'ok') {
    NotificationMessage.sendMessage('Failed to get user info.', NotificationColor.Error);
    return null;
  }
  return result.json.results;
};
export const UserInfo = (props?: any) => {
  const css: CssProps = {
    display: 'flex',
    paddingTop: '4px',
    paddingRight: '8px',
    '.login-links': {
      display: 'flex',
    },
  };

  const onLogout = async () => {
    // DomUtils.clearCookie(tokenCookieName, '/');
    DomUtils.clearCookie(userCookieName, '/');
    // call server to clear cookie
    await getRenderPageProps().renderPageFunctions.fetchData('/api/logout');
    window.location.href = '/';
  };
  const dom = HtmlVar('');
  const ref: RefProps = {
    onLoad: async () => {
      const user = await getUserInfo();
      const userCookie = getCookieUser();
      if (user && (user.username !== userCookie.u || user.usertype !== userCookie.t)) {
        await onLogout();
        window.location.href = '/login';
        return;
      }
      if (user && user.username === userCookie.u && user.usertype === userCookie.t) {
        dom.value = (
          <div class='login-links'>
            <div class='pr-m row-box'>
              <label>Theme:</label> <ThemeSelector></ThemeSelector>
            </div>
            <div>
              Hi, <a href='/user/profile'>{user.nickname}</a>
            </div>
            <a class='ml-m' href='javascript:void()' onClick={onLogout}>
              Logout
            </a>
            {user.usertype === 'admin' && (
              <a class='ml-m' href='/admin'>
                Admin
              </a>
            )}
          </div>
        );
      } else {
        dom.value = (
          <div class='login-links'>
            <a href='/login'>Login</a>
            <a href='/register' class='ml-m'>
              Register
            </a>
          </div>
        );
      }
    },
  };
  return (
    <div css={css} class='user-info-box' ref={ref}>
      {dom.node}
    </div>
  );
};
