import {
  CssProps,
  PageProps,
  DomUtils,
  getRenderPageProps,
  NotificationColor,
  NotificationMessage,
  initializePage,
} from 'lupine.components';
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
        paddingLeft: '10px',
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
    if (auth.status === 'error' && auth.action === 'activate') {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
      setTimeout(() => {
        initializePage('/login-code?email=' + username);
      }, 1000);
      return;
    }

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
        <div class='top-title'>登陆</div>
      </div>
      <div class='top-content login-form-width'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>用户名 (Email)：</div>
            <input class='input-base u-name' type='text' />
          </div>
          <div class='row-box'>
            <div class='label'>密码：</div>
            <input class='input-base u-pass' type='password' />
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onLogin()} class='button-base'>
              登录
            </button>
          </div>
          <div class='row-box login-tip'>* 登录系统</div>
          <div class='row-box login-tip'>
            * 还没有账户？<a href='/register'>去注册</a>或者<a href='/'>首页</a>
          </div>
          <div class='row-box login-tip'>
            * 忘记了密码？<a href='/reset-pw'>重新设置密码</a>
          </div>
          <div class='row-box login-tip'>
            * 无密码登录？<a href='/login-code'>用验证码登录</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2025 <a href='/'>Home</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
