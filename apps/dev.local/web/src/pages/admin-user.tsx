import {
  DomUtils,
  getRenderPageProps,
  HtmlVar,
  NotificationMessage,
  NotificationColor,
  PageProps,
  RefProps,
} from 'lupine.js';

export const AdminUserPage = async (props: PageProps) => {
  const css: any = {
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
    const blockText = block === '1' ? '阻止' : '允许';
    if (!confirm('要 ' + blockText + ' 当前用户登陆吗？')) {
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
                  用户: {user.username}, Id: {user.id}
                </label>
                <label class='ml-m'>{user.block === '1' ? ' (Blocked)' : ''}</label>
              </div>
              <div class='row-box'>
                <label class='u-name mr-m'>注册：{formatTime(user.registerdate)}, </label>
                <label class='u-name mr-m'>最后登录：{formatTime(user.lastvisitdate)}, </label>
                <label class='u-point mr-m'>类型：</label>
                <select class='u-usertype'>
                  <option value='admin' selected={user.usertype === 'admin'}>
                    管理
                  </option>
                  <option value='user' selected={user.usertype !== 'admin'}>
                    普通
                  </option>
                </select>
                <label class='u-point ml-m'>密码：</label>
                <input type='password' value='' class='input-base u-pass' />
                <button class='button-base' onClick={() => onUpdate(user)}>
                  更新
                </button>
                {user.block === '1' ? (
                  <button class='button-base' onClick={() => onBlock(user, '0')}>
                    解除
                  </button>
                ) : (
                  <button class='button-base ml-s' onClick={() => onBlock(user, '1')}>
                    阻止
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
