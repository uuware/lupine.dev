import {
  CssProps,
  PageProps,
  DomUtils,
  getRenderPageProps,
  NotificationColor,
  NotificationMessage,
  initializePage,
} from 'lupine.js';
import { Footer } from './footer';
import { setCookieUser } from '../services/shared-data';

const fetchLogin = async (username: string, password: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/login', { u: username, p: password });
  return data.json;
};

export const LoginPage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100%',
    overflowY: 'auto',
    '.top-header': {
      padding: '50px 0',
      margin: 'auto',
      fontSize: '200%',
    },
    '.top-content': {
      flex: '1',
      padding: '8px 16px',
      margin: 'auto',
      // '.login-button, .login-tip': {
      //   justifyContent: 'center',
      // },
      '.top-content-box': {
        padding: '20px 40px',
        boxShadow: 'var(--cover-box-shadow)',
      },
      '.login-button button': {
        width: '100%',
        fontSize: '150%',
        height: '40px',
      },
      '.login-tip': {
        color: 'gray',
        fontSize: '90%',
      },
      '.login-tip a': {
        padding: '0 10px',
      },
      '.label': {
        width: '200px',
      },
      '.row-box': {
        marginBottom: '16px',
      },
    },
    '.top-footer': {
      padding: '16px 16px 4px 16px',
      margin: 'auto',
    },
  };

  const onLogin = async () => {
    const username = DomUtils.getValue('.u-name')!;
    const password = DomUtils.getValue('.u-pass')!;
    if (!username || !password) {
      NotificationMessage.sendMessage('Please input username and password', NotificationColor.Error);
      return;
    }
    const auth = await fetchLogin(username, password);
    // console.log('====auth', auth);
    if (auth.result) {
      setCookieUser(auth.user || {});
      initializePage('/');
    } else {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
    }
  };

  return (
    <div css={css} class='admin-login'>
      <div class='top-header'>
        <div class='top-title'>Login</div>
      </div>
      <div class='top-content'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>Username:</div>
            <div>
              <input class='input-base u-name' type='text' />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>Password:</div>
            <div>
              <input class='input-base u-pass' type='password' />
            </div>
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onLogin()} class='button-base'>
              Login
            </button>
          </div>
          <div class='row-box login-tip'>* Login System</div>
          <div class='row-box login-tip'>
            * No account? <a href='/register'>Go to register</a> or <a href='/'>Home</a>
          </div>
          <div class='row-box login-tip'>
            * Forgot password? <a href='/reset-pw'>Reset password</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2024 <a href='/'>Sample</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
