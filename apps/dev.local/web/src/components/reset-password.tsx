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
      NotificationMessage.sendMessage('Please enter your username', NotificationColor.Error);
      return;
    }
    const auth = await fetchCode(username);
    if (auth.status === 'ok') {
      NotificationMessage.sendMessage('Verification code has been sent to your email, please copy and paste it here', NotificationColor.Success);

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
      NotificationMessage.sendMessage('Please enter your username, password, and verification code', NotificationColor.Error);
      return;
    }
    if (password !== password2) {
      NotificationMessage.sendMessage('The two passwords do not match', NotificationColor.Error);
      return;
    }
    if (password.length < 6) {
      NotificationMessage.sendMessage('Password length must be at least 6 characters', NotificationColor.Error);
      return;
    }
    const auth = await fetchReset(username, password, authCode);
    if (auth.status === 'ok') {
      NotificationMessage.sendMessage('Password reset successfully, please login', NotificationColor.Success);
    } else {
      NotificationMessage.sendMessage(auth.message, NotificationColor.Error);
    }
  };

  return (
    <div css={css} class='admin-login'>
      <div class='top-header'>
        <div class='top-title'>Reset Password</div>
      </div>
      <div class='top-content'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>Username (Email):</div>
            <div>
              <input class='input-base u-name' type='text' />
            </div>
          </div>
          <div class='row-box code-button'>
            <button onClick={() => onCode()} class='button-base'>
              Send Verification Code
            </button>
          </div>
          <div class='row-box'>
            <div class='label'>Verification Code:</div>
            <div>
              <input class='input-base u-code' type='text' />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>New Password:</div>
            <div>
              <input class='input-base u-pass' type='password' />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>Confirm Password:</div>
            <div>
              <input class='input-base u-pass2' type='password' />
            </div>
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onLogin()} class='button-base'>
              Reset Password
            </button>
          </div>
          <div class='row-box login-tip'>
            * Use password login? <a href='/login'>Go to login</a> or <a href='/'>Home</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2024 <a href='/'>Sample</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
