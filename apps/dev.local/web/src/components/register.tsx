import { CssProps, PageProps, DomUtils, getRenderPageProps, NotificationColor, NotificationMessage, webSetting } from 'lupine.web';
import { Footer } from './footer';

const fetchReg = async (body: any) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/register', body);
  return data.json;
};

export const RegisterPage = async (props: PageProps) => {
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

  const onSubmit = async () => {
    const username = DomUtils.getValue('.u-name')!;
    const password = DomUtils.getValue('.u-pass')!;
    if (!username || !password) {
      NotificationMessage.sendMessage('请输入用户名和密码', NotificationColor.Error);
      return;
    }
    // check username is email?
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(username)) {
      NotificationMessage.sendMessage('请输入一个正确的邮箱地址作为用户名', NotificationColor.Error);
      return;
    }
    if (password.length < 6) {
      NotificationMessage.sendMessage('密码长度至少为6位', NotificationColor.Error);
      return;
    }

    const preferredName = DomUtils.getValue('.u-pname')!;
    if (!preferredName) {
      NotificationMessage.sendMessage('请输入网名', NotificationColor.Error);
      return;
    }

    const isMale = DomUtils.getChecked('.u-male');
    const isFemale = DomUtils.getChecked('.u-female');
    if (!isMale && !isFemale) {
      NotificationMessage.sendMessage('请选择性别', NotificationColor.Error);
      return;
    }

    const body = {
      u: username,
      p: password,
      preferredName,
      sex: isMale ? 'male' : 'female',
    };
    const data = await fetchReg(body);
    if (data.status === 'ok') {
      NotificationMessage.sendMessage(data.message, NotificationColor.Success);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } else {
      NotificationMessage.sendMessage(data.message, NotificationColor.Error);
    }
  };
  return (
    <div css={css} class='admin-login'>
      <div class='top-header'>
        <div class='top-title'>Register</div>
      </div>
      <div class='top-content login-form-width'>
        <div class='top-content-box'>
          <div class='row-box'>
            <div class='label'>Username (Email)：</div>
            <div>
              <input class='input-base u-name' type='text' maxLength={50} />
            </div>
          </div>
          {webSetting('verifyEmail', '1') === '1' && (
            <div class='row-box login-tip'>
              * Confirm you email carefully and your email is used to receive authentication code.
            </div>
          )}
          <div class='row-box'>
            <div class='label'>Password:</div>
            <div>
              <input class='input-base u-pass' type='password' maxLength={50} />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>Preferred Name:</div>
            <div>
              <input class='input-base u-pname' type='text' maxLength={50} />
            </div>
          </div>
          <div class='row-box'>
            <div class='label'>Gender:</div>
            <div>
              <input class='u-male' type='radio' name='sex' id='male' /> <label for='male'>Male</label>
              <input class='u-female ml-l' type='radio' name='sex' id='female' /> <label for='female'>Female</label>
            </div>
          </div>
          <div class='row-box login-button'>
            <button onClick={() => onSubmit()} class='button-base'>
              Register
            </button>
          </div>
          <div class='row-box login-tip'>
            * Already have an account? <a href='/login'>Login</a> or
            <a href='/'>Home</a>
          </div>
        </div>
      </div>
      <div class='top-footer'>
        <Footer title="Copyright© 2025 <a href='/'>Home</a>. All Rights Reserved."></Footer>
      </div>
    </div>
  );
};
