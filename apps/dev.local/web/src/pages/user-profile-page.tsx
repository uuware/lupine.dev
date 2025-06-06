import {
  DomUtils,
  getRenderPageProps,
  HtmlVar,
  MediaQueryMaxWidth,
  NotificationMessage,
  NotificationColor,
  PageProps,
  RefProps,
  CssProps,
} from 'lupine.web';
import { getUserInfo, UserInfoType } from '../components/user-info';

const PageContent = ({ user }: { user: UserInfoType }) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    margin: 'auto',
    '.label': {
      width: '200px',
      marginBottom: '20px',
    },
    '.m-menu': {
      display: 'flex',
      flexDirection: 'row',
      padding: '10px',
      border: '1px solid #aaa',
      borderRadius: '8px',
      margin: '10px 0',
    },
    '.m-label': {
      width: '200px',
    },
    '.m-text': {
      // width: '400px',
      marginBottom: '10px',
    },
    'textarea.m-text': {
      height: '80px',
    },
  };

  const onSave = async () => {
    const nickname = DomUtils.getValue('.f-nickname');
    const password = DomUtils.getValue('.f-password');
    const password2 = DomUtils.getValue('.f-password2');
    if (!nickname) {
      NotificationMessage.sendMessage('Prefer name can\'t be empty', NotificationColor.Error);
      return;
    }
    if (password && password !== password2) {
      NotificationMessage.sendMessage('The two passwords do not match', NotificationColor.Error);
      return;
    }
    if (password && password.length < 6) {
      NotificationMessage.sendMessage('Password length must be at least 6 characters', NotificationColor.Error);
      return;
    }
    const data: any = {
      nickname,
      password,
    };

    const result = await getRenderPageProps().renderPageFunctions.fetchData('/api/user-profile', JSON.stringify(data));
    console.log(result);
    NotificationMessage.sendMessage(result.json.message || 'Update success', NotificationColor.Success);
    setTimeout(() => {
      document.location.reload();
    }, 1000);
  };
  return (
    <div css={css}>
      <div class='row-box m-menu'>
        <span>Profile</span>
      </div>
      <div class='row-box'>
        <button class='button-base' onClick={onSave}>
          Update
        </button>{' '}
        <div>(Password will not be updated if it is empty)</div>
      </div>
      <div class='row-box mt-l'>
        <label class='m-label'>Email:</label> {user.email}
      </div>
      <div class='row-box mt-l'>
        <label class='m-label'>Type:</label> {user.usertype}
      </div>
      <hr />
      <div class='row-box'>
        <label class='m-label'>Prefer name:</label>{' '}
        <input type='text' class='input-base m-text f-nickname' value={user.nickname} />
      </div>
      <div class='row-box'>
        <label class='m-label'>Password:</label> <input type='password' class='input-base m-text f-password' value='' />
      </div>
      <div class='row-box'>
        <label class='m-label'>Confirm password:</label>{' '}
        <input type='password' class='input-base m-text f-password2' value='' />
      </div>
    </div>
  );
};

export const UserProfilePage = async (props: PageProps) => {
  const ref: RefProps = {
    onLoad: async () => {
      const user = await getUserInfo();
      dom.value = (
        <div class='padding-block'>
          <PageContent user={user!}></PageContent>
        </div>
      );
    },
  };
  const dom = HtmlVar('Loading...');
  return (
    <div>
      <div ref={ref}>{dom.node}</div>
    </div>
  );
};
