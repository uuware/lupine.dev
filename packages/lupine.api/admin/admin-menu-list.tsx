import { CssProps, PageProps, RefProps, getRenderPageProps, NotificationMessage } from 'lupine.components';
import { AdminTableData } from './admin-table-data';
import { adminFrameProps } from './admin-frame-props';
import { AdminMenuEditPage } from './admin-menu-edit';

const tableName = '$__s_menu';
const fetchTableDelete = async (tableName: string, id: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData(`/api/admin/menu/delete/${id}`);
  return data.json;
};

export const AdminMenuSinglePage = async (props: PageProps) => {
  return <AdminMenuPage />;
};

export const AdminMenuPage = () => {
  const refUpdate = adminFrameProps.refUpdate;
  const onDelete = async (rowData: any) => {
    if (!confirm(`Are you really Deleting ${rowData['menuid']}?`)) {
      return;
    }
    const json = await fetchTableDelete(tableName, rowData['menuid']);
    console.log('====fetchTableDelete', json);
    NotificationMessage.sendMessage('Deleted: ' + rowData['menuid']);
    updateList.refreshRef();
  };

  const onEdit = async (rowData: any) => {
    if (refUpdate?.getCount && refUpdate.getCount() > adminFrameProps.maxTabsCount) {
      alert('You are opening too many pages');
      return;
    }
    if (refUpdate?.findAndActivate && refUpdate.findAndActivate('Menu: ' + rowData.menuid)) {
      return;
    }
    refUpdate?.newPage && (await refUpdate.newPage('Menu: ' + rowData.menuid, AdminMenuEditPage(rowData.menuid)));
  };

  const css: CssProps = {
    '.admin-table-list > div > div': {
      backgroundColor: '#95c998',
      marginBottom: '16px',
    },
    '.admin-table-list .row-1': {
      backgroundColor: '#e8f8e8', //#95c998
    },
  };
  const updateList = { refreshRef: Function, onDelete, onEdit };
  const refInput: RefProps = {};
  let timeoutID: NodeJS.Timeout | undefined = undefined;
  const onInput = () => {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      updateList.refreshRef();
    }, 500);
  };
  const onNewMenu = async () => {
    if (refUpdate?.getCount && refUpdate.getCount() > adminFrameProps.maxTabsCount) {
      alert('You are opening too many pages');
      return;
    }
    if (refUpdate?.findAndActivate && refUpdate.findAndActivate('Table: ' + tableName)) {
      return;
    }
    refUpdate?.newPage && (await refUpdate.newPage('Table: ' + tableName, AdminMenuEditPage('')));
  };
  const onSearch = () => {};
  return (
    <div css={css}>
      <div class='admin-sub-title'>Users List</div>
      <div class='row-box mt1 mb1'>
        <div>
          <input type='text' ref={refInput} class='input-base' placeholder='Search' onInput={onInput} />
        </div>
        <button onClick={onSearch} class='button-base'>
          Search
        </button>
        <button onClick={onNewMenu} class='button-base'>
          New Menu
        </button>
      </div>
      <AdminTableData tableName={'$__s_menu'} update={updateList}></AdminTableData>
    </div>
  );
};
