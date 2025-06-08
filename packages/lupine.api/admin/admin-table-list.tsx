import {
  DomUtils,
  NotificationColor,
  NotificationMessage,
  CssProps,
  RefProps,
  getRenderPageProps,
  mountComponents,
} from 'lupine.components';
import { adminFrameProps } from './admin-frame-props';
import { TableDataPage } from './admin-table-data';

const fetchTableList = async () => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/tables/list');
  return data.json;
};
const fetchTableDrop = async (tableName: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData(`/api/admin/db/table/drop/${tableName}`);
  return data.json;
};
const fetchTableTruncate = async (tableName: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/table/truncate/' + tableName);
  return data.json;
};
const fetchTableTruncateAll = async () => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/tables/truncate');
  return data.json;
};

export const TableListPage = () => {
  const refUpdate = adminFrameProps.refUpdate;

  const openTablePanel = async (tableName: string) => {
    if (refUpdate?.getCount && refUpdate.getCount() > adminFrameProps.maxTabsCount) {
      alert('You are opening too many pages');
      return;
    }
    if (refUpdate?.findAndActivate && refUpdate.findAndActivate('Table: ' + tableName)) {
      return;
    }
    refUpdate?.newPage && (await refUpdate.newPage('Table: ' + tableName, TableDataPage(tableName)));
  };

  const onDelete = async (tableName: string) => {
    if (!confirm(`Are you really Deleting ${tableName}?`)) {
      return;
    }
    const json = await fetchTableDrop(tableName);
    console.log('====fetchTableDelete', json);
    NotificationMessage.sendMessage('Deleted: ' + tableName);
    onClick();
  };

  const onDownload = async (tableName: string) => {
    DomUtils.download('/api/admin/db/table/download/' + tableName);
  };

  const onTruncate = async (tableName: string) => {
    if (!confirm(`Are you really Removing all data for ${tableName}?`)) {
      return;
    }
    const json = await fetchTableTruncate(tableName);
    console.log('====fetchTableTruncate', json);
    NotificationMessage.sendMessage('Truncated: ' + tableName);
    onClick();
  };

  const onDownloadAll = async () => {
    DomUtils.download('/api/admin/db/tables/download');
  };

  const onTruncateAll = async () => {
    if (!confirm(`Are you really Removing all data for all tables? You can't revert it! (first confirm)`)) {
      return;
    }
    if (
      !confirm(`Are you really Removing all data for all tables? You may not be able to login again! (last confirm)`)
    ) {
      return;
    }
    await fetchTableTruncateAll();
    NotificationMessage.sendMessage('Truncated all tables!');
    onClick();
  };

  const onDropAll = async () => {
    if (!confirm(`Are you really Dropping all tables? You can't revert it! (first confirm)`)) {
      return;
    }
    if (!confirm(`Are you really Dropping all tables? You may not be able to login again! (last confirm)`)) {
      return;
    }
    const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/tables/drop');
    NotificationMessage.sendMessage('Dropped all tables!' + JSON.stringify(data.json, null, '    '));
    onClick();
  };

  const onClick = async () => {
    const search = refInput.current.value;
    const json = await fetchTableList();
    console.log('====fetchTableList', json);

    if (!json || json.status !== 'ok') {
      NotificationMessage.sendMessage(json.message, NotificationColor.Error);
      return;
    }
    const dom =
      json && json.status === 'ok' && json.result.length > 0 ? (
        <div>
          {json.result
            .filter((item: { tbl_name: string | any[] }) => {
              return !search || item.tbl_name.indexOf(search) >= 0;
            })
            .map((item: any, index: number) => {
              return (
                <div class={'row-' + (index % 2)}>
                  <a href='javascript:void(0);' onClick={() => openTablePanel(item.tbl_name)}>
                    {item.tbl_name}
                  </a>
                  , count: {item.count}
                  <div>sql: {item.sql},</div>
                  <div class={'row-box'}>
                    <button onClick={() => onDownload(item.tbl_name)} class='button-base button-s'>
                      Download
                    </button>
                    <button onClick={() => onTruncate(item.tbl_name)} class='button-base button-s red'>
                      Truncate
                    </button>
                    <button onClick={() => onDelete(item.tbl_name)} class='button-base button-s red'>
                      Drop
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div>No Result</div>
      );

    await mountComponents(document.querySelector('.admin-table-list'), dom);
  };
  const onUpload = async () => {
    const domFile = document.querySelector('#upload_data') as HTMLInputElement;
    if (!domFile.files || domFile.files.length !== 1) {
      alert('Please select one and only one file.');
      return;
    }

    const data = await fetch('/api/admin/db/tables/upload', {
      method: 'POST',
      body: new Uint8Array(await domFile.files[0].arrayBuffer()),
      headers: {
        'Content-type': domFile.files[0].type,
      },
    });
    const result = await data.json();
    domFile.value = '';
    onClick();
    // document.querySelector('.admin-table-log')!.innerHTML = JSON.stringify(result, null, ' ');
    NotificationMessage.sendMessage(JSON.stringify(result, null, ' '), NotificationColor.Info, true);
  };

  const css: CssProps = {
    '.admin-table-list > div > div': {
      backgroundColor: 'var(--row-1-bg-color)', //'#95c998',
      marginTop: '16px',
    },
    '.admin-table-list .row-1': {
      backgroundColor: 'var(--row-2-bg-color)', //'#e8f8e8', //#95c998
    },
    '.admin-table-list > div > div:hover': {
      backgroundColor: 'var(--row-hover-bg-color)',
    },
    '.admin-table-log': {
      display: 'block',
      unicodeBidi: 'embed',
      fontFamily: 'monospace',
      whiteSpace: 'pre',
    },
  };
  let timeoutID: NodeJS.Timeout | undefined = undefined;
  const refInput: RefProps = {};
  const ref: RefProps = {
    onLoad: onClick,
  };
  const onInput = () => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      onClick();
    }, 500);
  };
  return (
    <div css={css} ref={ref}>
      <div class='admin-sub-title'>Table List</div>
      <div class='row-box'>
        <div>
          <input type='text' ref={refInput} class='input-base' placeholder='Search' onInput={onInput} />
        </div>
        <button onClick={onClick} class='button-base'>
          Refresh List
        </button>
        <button onClick={onDownloadAll} class='button-base'>
          Download all data
        </button>
        <button onClick={onTruncateAll} class='button-base red'>
          Truncate all data
        </button>
        <button onClick={onDropAll} class='button-base red'>
          Drop all table
        </button>
      </div>
      <div class='row-box mt1'>
        <div>
          <input type='file' id='upload_data' class='input-base' />
        </div>
        <button onClick={onUpload} class='button-base'>
          Upload
        </button>
      </div>
      <div class='admin-table-log'></div>
      <div class='admin-table-list'>(Table list)</div>
    </div>
  );
};
