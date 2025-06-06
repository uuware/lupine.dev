import {
  CssProps,
  DomUtils,
  getRenderPageProps,
  HtmlVar,
  NotificationColor,
  NotificationMessage,
  RefProps,
} from 'lupine.web';

const ReleaseList = (props: { result: any; onUpdate: () => void }) => {
  const ref: RefProps = {
    onLoad: async () => {
      const data = JSON.parse(localStorage.getItem('admin-release') || '{}');
      DomUtils.setValue('.from-list', data.fromList || '');
    },
  };
  return (
    <div ref={ref}>
      <div class='row-box mt-m'>
        <label class='label mr-m release-label'>From:</label>
        <div class='w-50p'>
          <select type='text' class='input-base w-100p from-list'>
            {props.result.appsFrom.map((app: string) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div class='row-box mt-m'>
        <label class='label mr-m release-label'>To:</label>
        <div class='w-50p'>
          <select type='text' class='input-base w-100p to-list'>
            {props.result.apps.map((app: string) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div class='row-box mt-m'>
        <label class='label mr-m release-label'>Release:</label>
        <label class='label mr-m' for='chk-server'>
          Server:
        </label>
        <div class='mr-l'>
          <input type='checkbox' class='base-css chk-server' id='chk-server' />
        </div>
        <label class='label mr-m' for='chk-api'>
          Api:
        </label>
        <div class='mr-l'>
          <input type='checkbox' class='base-css chk-api' id='chk-api' />
        </div>
        <label class='label mr-m' for='chk-web'>
          Web:
        </label>
        <div class='mr-l'>
          <input type='checkbox' class='base-css chk-web' id='chk-web' />
        </div>
        <label class='label mr-m' for='chk-env'>
          Env:
        </label>
        <div class='mr-l'>
          <input type='checkbox' class='base-css chk-env' id='chk-env' />
        </div>
        <label class='label mr-m' for='chk-backup'>
          ( Backup:
        </label>
        <div class=''>
          <input type='checkbox' class='base-css chk-backup' id='chk-backup' /> )
        </div>
      </div>
      <div class='row-box mt-m'>
        <button onClick={props.onUpdate} class='button-base'>
          Update
        </button>
      </div>
    </div>
  );
};

export const AdminReleasePage = () => {
  const fetchData = async (options: { targetUrl: string; accessToken: string }) => {
    const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/release/check', options);
    console.log('AdminRelease', data);
    return data.json;
  };
  const css: CssProps = {
    '.release-label': {
      width: '130px',
    },
  };
  const domLog = HtmlVar('');
  const domUpdate = HtmlVar('');
  const getDomData = () => {
    const dataOld = JSON.parse(localStorage.getItem('admin-release') || '{}');
    const data = {
      targetUrl: DomUtils.getValue('.target-url'),
      accessToken: DomUtils.getValue('.access-token'),
      fromList: DomUtils.getValue('.from-list') || dataOld.fromList,
    };
    localStorage.setItem('admin-release', JSON.stringify(data));
    return data;
  };

  const onUpdate = async () => {
    const data = getDomData();
    if (!data.targetUrl || !data.accessToken) {
      NotificationMessage.sendMessage('Please fill in all fields', NotificationColor.Error);
      return;
    }

    const fromList = DomUtils.getValue('.from-list');
    const toList = DomUtils.getValue('.to-list');
    const chkServer = DomUtils.getChecked('.chk-server');
    const chkApi = DomUtils.getChecked('.chk-api');
    const chkWeb = DomUtils.getChecked('.chk-web');
    const chkEnv = DomUtils.getChecked('.chk-env');
    const chkBackup = DomUtils.getChecked('.chk-backup');
    if (!chkServer && !chkApi && !chkWeb && !chkEnv) {
      NotificationMessage.sendMessage('Please select the release options', NotificationColor.Error);
      return;
    }

    if (fromList !== toList && !confirm('The From and To are not the same, are you sure?')) {
      return;
    }
    if (!confirm('Are you sure you want to update the release? (Assets are not copied, so it may cause issues)')) {
      return;
    }
    const response = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/release/update', {
      ...data,
      fromList,
      toList,
      chkServer,
      chkApi,
      chkWeb,
      chkEnv,
      chkBackup,
    });
    const dataResponse = await response.json;
    console.log('AdminRelease', dataResponse);
    if (!dataResponse || dataResponse.status !== 'ok') {
      NotificationMessage.sendMessage(dataResponse.message || 'Failed to update release', NotificationColor.Error);
      return;
    }
    NotificationMessage.sendMessage('Release updated successfully', NotificationColor.Success);
  };

  const onCheck = async () => {
    const data = getDomData();
    if (!data.targetUrl || !data.accessToken) {
      NotificationMessage.sendMessage('Please fill in all fields', NotificationColor.Error);
      return;
    }
    const result = await fetchData(data);
    if (!result || result.status !== 'ok') {
      NotificationMessage.sendMessage(result.message || 'Failed to get release list', NotificationColor.Error);
      return;
    }
    console.log(result);

    domUpdate.value = <ReleaseList result={result} onUpdate={onUpdate} />;
    domLog.value = <pre>{JSON.stringify(result, null, 2)}</pre>;
  };

  const onRefreshCacheLocal = async () => {
    return onRefreshCache(true);
  };
  const onRefreshCacheRemote = async () => {
    return onRefreshCache(false);
  };
  const onRefreshCache = async (isLocal?: boolean) => {
    const data = getDomData();
    if (!isLocal) {
      if (!data.targetUrl || !data.accessToken) {
        NotificationMessage.sendMessage('Please fill in all fields', NotificationColor.Error);
        return;
      }
    }

    const response = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/release/refresh-cache', {
      ...data,
      isLocal,
    });
    const dataResponse = await response.json;
    console.log('AdminRelease', dataResponse);
    if (!dataResponse || dataResponse.status !== 'ok') {
      NotificationMessage.sendMessage(dataResponse.message || 'Failed to refresh cache', NotificationColor.Error);
      return;
    }
    domLog.value = <pre>{JSON.stringify(dataResponse, null, 2)}</pre>;
    NotificationMessage.sendMessage('Cache refreshed successfully', NotificationColor.Success);
  };

  const ref: RefProps = {
    onLoad: async () => {
      const data = JSON.parse(localStorage.getItem('admin-release') || '{}');
      DomUtils.setValue('.target-url', data.targetUrl || '');
      DomUtils.setValue('.access-token', data.accessToken || '');
    },
  };
  return (
    <div ref={ref} css={css} class='admin-release-top'>
      <div class='row-box mt1 mb1'>
        <label class='label mr-m release-label'>Target Url:</label>
        <div class='w-50p'>
          <input type='text' class='input-base w-100p target-url' placeholder='Target Url' />
        </div>
      </div>
      <div class='row-box mt1 mb1'>
        <label class='label mr-m release-label'>Access token:</label>
        <div class='w-50p'>
          <input type='text' class='input-base w-100p access-token' placeholder='Access token' />
        </div>
      </div>
      <div class='row-box mt1 mb1'>
        <button onClick={onCheck} class='button-base'>
          Check
        </button>
        <button onClick={onRefreshCacheRemote} class='button-base'>
          Refresh Cache (Remote)
        </button>
        <button onClick={onRefreshCacheLocal} class='button-base'>
          Refresh Cache (Local)
        </button>
      </div>
      {domUpdate.node}
      {domLog.node}
    </div>
  );
};
