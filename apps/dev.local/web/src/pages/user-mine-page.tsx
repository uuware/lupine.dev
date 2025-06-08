import { CssProps, DomUtils, getRenderPageProps, PageProps } from 'lupine.components';
import { getCookieUser } from '../services/shared-data';
import { userCookieName } from '../models';

const fetchHomeData = async (props: PageProps) => {
  const data = await props.renderPageFunctions.fetchData('/api/settings');
  return data.json;
};

export const UserMinePage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    margin: '0 auto',
    '.mine-box': {
      padding: '16px',
    },
    '.login-links': {
      display: 'flex',
      padding: '16px',
    },
  };

  const onLogout = async () => {
    // DomUtils.clearCookie(tokenCookieName, '/');
    DomUtils.clearCookie(userCookieName, '/');
    // call server to clear cookie
    await getRenderPageProps().renderPageFunctions.fetchData('/api/logout');
    window.location.href = '/';
  };
  const userCookie = getCookieUser();
  return (
    <div css={css}>
      <div class='login-links'>
        <div>
          Hi, <a href='/user/profile'>{userCookie.u}</a>
        </div>
        <a class='ml-m' href='javascript:void()' onClick={onLogout}>
          Logout
        </a>
        {userCookie.t === 'admin' && (
          <a class='ml-m' href='/admin'>
            Admin
          </a>
        )}
      </div>
      <div class='mine-box'>
        <div class='page-title'>Mine page</div>
        <div class='a-text'>Mine page</div>
      </div>
    </div>
  );
};
