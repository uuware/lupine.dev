import {
  CssProps,
  PageProps,
  DomUtils,
  HtmlVar,
  getRenderPageProps,
  NotificationColor,
  NotificationMessage,
} from 'lupine.js';
import { Footer } from './footer';

const fetchCode = async (username: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/reset-code', { u: username });
  return data.json;
};

const fetchReset = async (username: string, password: string, authCode: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/reset-pw', {
    u: username,
    p: password,
    a: authCode,
  });
  return data.json;
};

export const ResetPasswordPage = async (props: PageProps) => {
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

  const onCode = async () => {
    const username = DomUtils.getValue('.u-name')!;
    if (!username) {
      NotificationMessage.sendMessage('请输入用户名', NotificationColor.Error);
      return;
    }
    const auth = await fetchCode(username);
    if (auth.status === 'ok') {
      NotificationMessage.sendMessage('验证码已发送到您的邮箱，请复制并粘贴到此处', NotificationColor.Success);

      // const loginButton = DomUtils.bySelector('.login-button button') as HTMLButtonElement;
      // loginButton.disabled = false;
    } else {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
    }
  };
  const onLogin = async () => {
    const username = DomUtils.getValue('.u-name')!;
    const password = DomUtils.getValue('.u-pass')!;
    const password2 = DomUtils.getValue('.u-pass2')!;
    const authCode = DomUtils.getValue('.u-code')!;
    if (!username || !password || !password2 || !authCode) {
      NotificationMessage.sendMessage('请输入用户名、密码和验证码', NotificationColor.Error);
      return;
    }
    if (password !== password2) {
      NotificationMessage.sendMessage('两次输入的密码不一致', NotificationColor.Error);
      return;
    }
    if (password.length < 6) {
      NotificationMessage.sendMessage('密码长度至少为6位', NotificationColor.Error);
      return;
    }
    const auth = await fetchReset(username, password, authCode);
    if (auth.status === 'ok') {
      NotificationMessage.sendMessage('密码重置成功，请登录', NotificationColor.Success);
    } else {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
    }
  };

  return (
    <div css={css} class='admin-login'>
      <div class='top-header'>
        <div class='top-title'>重置密码</div>
      </div>
      <div class='top-content'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>用户名 (邮箱):</div>
            <div>
              <input class='input-base u-name' type='text' />
            </div>
          </div>
          <div class='row-box code-button'>
            <button onClick={() => onCode()} class='button-base'>
              发送验证码
            </button>
          </div>
          <div class='row-box'>
            <div class='label'>验证码:</div>
            <div>
              <input class='input-base u-code' type='text' />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>新密码:</div>
            <div>
              <input class='input-base u-pass' type='password' />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>确认密码:</div>
            <div>
              <input class='input-base u-pass2' type='password' />
            </div>
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onLogin()} class='button-base'>
              重置密码
            </button>
          </div>
          <div class='row-box login-tip'>
            * 用密码登录？<a href='/login'>去登录</a>或者<a href='/'>首页</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2024 <a href='/'>GFF.com</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
