import {
  DomUtils,
  getRenderPageProps,
  HtmlVar,
  NotificationMessage,
  NotificationColor,
  PageProps,
  RefProps,
  CssProps,
} from 'lupine.web';

export const AdminUserPage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    margin: '0 auto',
    padding: '16px',
    '.m-menu': {
      display: 'flex',
      flexDirection: 'row',
      padding: '10px',
      border: '1px solid #aaa',
      borderRadius: '8px',
      margin: '10px 0',
    },
    '.row-top': {
      paddingBottom: '16px',
      marginBottom: '16px',
      borderBottom: 'dotted 1px #aaa',
    },
    '.u-pass': {
      width: '120px',
    },
  };

  const onUpdate = async (user: any) => {
    const usertype = DomUtils.getValue(`.row-${user.id} .u-usertype`);
    const pass = DomUtils.getValue(`.row-${user.id} .u-pass`);
    if (!confirm('Do you want to update user: ' + user.username + '?')) {
      return;
    }
    const result = await getRenderPageProps().renderPageFunctions.fetchData('/api/user-update', {
      id: user.id,
      usertype: usertype,
      password: pass,
    });
    if (result.json.status !== 'ok') {
      NotificationMessage.sendMessage(result.json.message, NotificationColor.Error);
      return;
    } else {
      NotificationMessage.sendMessage(result.json.message, NotificationColor.Success);
    }
    setTimeout(() => {
      document.location.reload();
    }, 1000);
  };

  const onBlock = async (user: any, block: string) => {
    const blockText = block === '1' ? 'Block' : 'Allow';
    if (!confirm('Do you want to ' + blockText + ' this user login?')) {
      return;
    }
    const result = await getRenderPageProps().renderPageFunctions.fetchData(
      '/api/user-block?id=' + user.id + '&block=' + block
    );
    if (result.json.status !== 'ok') {
      NotificationMessage.sendMessage(result.json.message, NotificationColor.Error);
      return;
    } else {
      NotificationMessage.sendMessage(result.json.message, NotificationColor.Success);
    }
    setTimeout(() => {
      document.location.reload();
    }, 1000);
  };
  const formatTime = (time: string) => {
    if (time.length === 24) {
      return time.substring(0, 19).replace('T', ' ');
    }
    return time;
  };
  const UserList = (props: any) => {
    console.log('props:', props);
    return (
      <div>
        {props.users.map((user: any, i: number) => {
          return (
            <div class={'row-top row-' + user.id}>
              <div class='row-box'>
                <label class='u-name'>
                  User: {user.username}, Id: {user.id}
                </label>
                <label class='ml-m'>{user.block === '1' ? ' (Blocked)' : ''}</label>
              </div>
              <div class='row-box'>
                <label class='u-name mr-m'>Registered: {formatTime(user.registerdate)}, </label>
                <label class='u-name mr-m'>Last login: {formatTime(user.lastvisitdate)}, </label>
                <label class='u-point mr-m'>Type:</label>
                <select class='u-usertype'>
                  <option value='admin' selected={user.usertype === 'admin'}>
                    Admin
                  </option>
                  <option value='user' selected={user.usertype !== 'admin'}>
                    User
                  </option>
                </select>
                <label class='u-point ml-m'>Password:</label>
                <input type='password' value='' class='input-base u-pass' />
                <button class='button-base' onClick={() => onUpdate(user)}>
                  Update
                </button>
                {user.block === '1' ? (
                  <button class='button-base' onClick={() => onBlock(user, '0')}>
                    Unblock
                  </button>
                ) : (
                  <button class='button-base ml-s' onClick={() => onBlock(user, '1')}>
                    Block
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const fetchUsers = async () => {
    const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/users');
    return data.json;
  };
  const ref: RefProps = {
    onLoad: async () => {
      const response = await fetchUsers();
      if (response.status !== 'ok') {
        NotificationMessage.sendMessage(response.message, NotificationColor.Error);
        return;
      }
      userList.value = <UserList users={response.results} />;
    },
  };
  const userList = HtmlVar('');
  return (
    <div css={css} class='management-user-page-box' ref={ref}>
      <div class='list-top'>{userList.node}</div>
    </div>
  );
};
