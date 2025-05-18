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
      NotificationMessage.sendMessage('Please input username (Email)', NotificationColor.Error);
      return;
    }

    const auth = await fetchCode(username);
    if (auth.status === 'ok') {
      NotificationMessage.sendMessage(
        'Authentication code is sent to your email, please copy it here to login.',
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
      NotificationMessage.sendMessage('Please input username and authentication code', NotificationColor.Error);
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
        <div class='top-title'>Login</div>
      </div>
      <div class='top-content login-form-width'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>Username (Email):</div>
            <input class='input-base u-name' type='text' />
          </div>
          <div class='row-box'>
            <button onClick={() => onCode()} class='button-base button-s code-button'>
              Send Authentication Code
            </button>
          </div>
          <div class='row-box'>
            <div class='label'>Authentication Code:</div>
            <div>
              <input class='input-base u-code' type='text' />
            </div>
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onLogin()} class='button-base'>
              Login
            </button>
          </div>
          <div class='row-box login-tip'>* Login to use this system.</div>
          <div class='row-box login-tip'>
            * Don't have an account?
            <a href='/register' class='pr-m'>Go to Register</a> or <a href='/'>Home</a>
          </div>
          <div class='row-box login-tip'>
            * Password login?<a href='/login'>Login with password</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2025 <a href='/'>Home</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
