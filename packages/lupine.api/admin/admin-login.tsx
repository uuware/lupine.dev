import { CssProps, PageProps, webEnv, DomUtils, NotificationColor, NotificationMessage } from 'lupine.components';
import { adminCss } from './admin-css';

const fetchLogin = async (props: PageProps, username: string, password: string) => {
  const data = await props.renderPageFunctions.fetchData('/api/admin/auth', {
    u: username,
    p: password,
  });
  return data.json;
};

export const AdminLoginPage = async (props: PageProps) => {
  const css: CssProps = {
    ...adminCss,
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
      '.login-button, .login-tip': {
        justifyContent: 'center',
      },
      '.login-button button': {
        width: '80%',
        fontSize: '150%',
        height: '40px',
      },
      '.login-tip': {
        color: 'gray',
        fontSize: '90%',
      },
      '.label': {
        width: '100px',
      },
      '.row-box': {
        marginBottom: '8px',
      },
    },
    '.top-footer': {
      padding: '16px 16px 4px 16px',
      margin: 'auto',
    },
  };

  const onLogin = async () => {
    const auth = await fetchLogin(props, DomUtils.getValue('.u-name')!, DomUtils.getValue('.u-pass')!);
    console.log('====auth', auth);
    if (!auth || auth.status !== 'ok') {
      NotificationMessage.sendMessage((auth && auth.message) || 'Login failed', NotificationColor.Error);
    }
    if (auth.result) {
      DomUtils.setCookie('_token_dev', auth.result, 30, '/');
      window.location.href = '/admin_dev';
    }
  };
  return (
    <div css={css} class='admin-login'>
      <div class='top-header'>
        <div class='top-title'>Site Management (Lupine.JS 1.0)</div>
      </div>
      <div class='top-content'>
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
        <div class='row-box login-tip'>* Login after using the system.</div>
      </div>
      <div class='top-footer'>
        Copyright© 2023-2024 Lupine.JS{' '}
        <a href={`http://localhost:${webEnv('API_PORT', 11080)}/`} target='_blank'>
          http://localhost:{webEnv('API_PORT', 11080)}/
        </a>
        . All Rights Reserved.
      </div>
    </div>
  );
};
