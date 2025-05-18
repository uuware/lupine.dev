import {
  CssProps,
  PageProps,
  DomUtils,
  getRenderPageProps,
  NotificationColor,
  NotificationMessage,
  initializePage,
  RefProps,
} from 'lupine.js';
import { Footer } from './footer';
import { setCookieUser } from '../services/shared-data';

const fetchLogin = async (username: string, code: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/login', {
    u: username,
    c: code,
  });
  return data.json;
};

const fetchCode = async (username: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/reset-code', { u: username });
  return data.json;
};

export const LoginCodePage = async (props: PageProps) => {
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


  const onCode = async () => {
    const codeButton = DomUtils.bySelector('.code-button') as HTMLButtonElement;
    if (codeButton.classList.contains('disabled')) {
      return;
    }

    const username = DomUtils.getValue('.u-name')!;
    if (!username) {
      NotificationMessage.sendMessage('请输入用户名（邮箱）', NotificationColor.Error);
      return;
    }

    const auth = await fetchCode(username);
    if (auth.status === 'ok') {
      NotificationMessage.sendMessage(
        '验证码已发送到您的邮箱，请复制到这里登录。',
        NotificationColor.Success
      );

      codeButton.classList.add('disabled');
      setTimeout(() => {
        codeButton.classList.remove('disabled');
      }, 60000);
    } else {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
    }
  };

  const onLogin = async () => {
    const codeDom = DomUtils.bySelector('.u-code') as HTMLInputElement;
    const userDom = DomUtils.bySelector('.u-name') as HTMLInputElement;
    const username = userDom.value;
    const code = codeDom.value;
    if (!username || !code) {
      NotificationMessage.sendMessage('请输入用户名和验证码', NotificationColor.Error);
      return;
    }
    const auth = await fetchLogin(username, code);
    // console.log('====auth', auth);
    if (auth.status === 'error') {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
      return;
    }

    if (auth.result) {
      setCookieUser(auth.user || {});
      initializePage('/');
      // window.location.href = '/';
    } else {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
    }
  };

  const ref: RefProps = {
    onLoad: async () => {
      const email = props.query['email'] || '';
      DomUtils.setValue('.u-name', email);
    },
  };
  return (
    <div css={css} class='admin-login' ref={ref}>
      <div class='top-header'>
        <div class='top-title'>登录</div>
      </div>
      <div class='top-content login-form-width'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>用户名（邮箱）:</div>
            <input class='input-base u-name' type='text' />
          </div>
          <div class='row-box'>
            <button onClick={() => onCode()} class='button-base button-s code-button'>
              发送验证码
            </button>
          </div>
          <div class='row-box'>
            <div class='label'>验证码:</div>
            <div>
              <input class='input-base u-code' type='text' />
            </div>
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onLogin()} class='button-base'>
              登录
            </button>
          </div>
          <div class='row-box login-tip'>* 登录以使用此系统。</div>
          <div class='row-box login-tip'>
            * 没有账号？
            <a href='/register' class='pr-m'>注册</a> or <a href='/'>首页</a>
          </div>
          <div class='row-box login-tip'>
            * 使用密码登录？<a href='/login'>使用密码登录</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2025 <a href='/'>Home</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
