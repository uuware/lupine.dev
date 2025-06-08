import {
  CssProps,
  getRenderPageProps,
  isFrontEnd,
  RefProps,
  DomUtils,
  ModalWindow,
  NotificationMessage,
  PopupMenu,
} from 'lupine.components';
import { DesignBlockBox } from './design/design-block-box';
import { BlockParagraph } from './design/block-paragraph';

const fetchTableList = async () => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/tables');
  return data.json;
};
const fetchTableDrop = async (tableName: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/table-drop', {
    table: tableName,
  });
  return data.json;
};
const fetchTableTruncate = async (tableName: string) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/db/table-truncate', {
    table: tableName,
  });
  return data.json;
};

export const SaveMenu = (props: {
  menuIdReadonly?: boolean;
  menuId: string;
  title: string;
  note: string;
  package: string;
}) => {
  return (
    <div className='save-menu'>
      <div class='row-box mb-s'>
        <div class='w-7'>Menu Id:</div>
        <input type='text' id='s_menuId' value={props.menuId} class='input-base w-20' readonly={props.menuIdReadonly} />
      </div>
      <div class='row-box mb-s'>
        <div class='w-7'>Menu Title:</div>
        <input type='text' id='s_menuTitle' value={props.title} class='input-base w-20' />
      </div>
      <div class='row-box mb-s'>
        <div class='w-7'>Menu Description:</div>
        <input type='text' id='s_menuNote' value={props.note} class='input-base w-20' />
      </div>
      <div class='row-box mb-s'>
        <div class='w-7'>Package id:</div>
        <input type='text' id='s_menuPackage' value={props.package} class='input-base w-20' />
      </div>
    </div>
  );
};

export const AdminPageEditPage = (menuId: string) => {
  if (!isFrontEnd()) {
    return <div>No SSR.</div>;
  }

  let savedMenuId = '';
  let savedMenuTitle = '';
  let savedMenuNote = '';
  let savedPackage = '';
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
    DomUtils.download('/api/admin/db/table-download?table=' + tableName);
  };

  const onClick = async () => {
    const json = await fetchTableList();
    console.log('====fetchTableList', json);
  };

  const doLoad = (results: any) => {
    oMenu.length = 0;
    savedMenuId = results.menuid;
    savedMenuTitle = results.title;
    savedMenuNote = results.note;
    savedPackage = results.package;
    for (const i in results.items) {
      const item = results.items[i];
      const lev = Number.parseInt(item[0]);
      var pre = new Array(lev * 4 + 1).join('-');
      oMenu.options[oMenu.length] = new Option(pre + item[4], item.join('\t'));
    }
    oMenu.selectedIndex = 0;
    doListChg();
  };
  const onSave = () => {
    doSave(false);
  };
  const onSaveAs = () => {
    doSave(true);
  };
  const doSave = async (isSaveAs = false) => {
    const handleClicked = async (index: number) => {
      if (index === 0) {
        // Save
        const id = DomUtils.getValue('#s_menuId');
        const title = DomUtils.getValue('#s_menuTitle');
        const note = DomUtils.getValue('#s_menuNote');
        const pkg = DomUtils.getValue('#s_menuPackage');
        let regex = /^[a-zA-Z0-9]+$/;
        if (!id || !regex.test(id)) {
          alert('menuId is not valid!');
          return;
        }
        const menuIdReadonly = !isSaveAs && !!savedMenuId;
        const items = getAllItems();
        const post: any = {
          id,
          title,
          note,
          items,
          idReadonly: menuIdReadonly,
          package: pkg,
        };

        const updateIds = () => {
          savedMenuId = id;
          savedMenuTitle = title;
          savedMenuNote = note;
          savedPackage = pkg;
          ref.$('.admin-sub-title').innerHTML = `Edit Menu: ${savedMenuId}`;
        };
        const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/menus/save', post);
        if (data.json && data.json.status !== 'ok') {
          if (!post.idReadonly && data.json.status === 'ID_EXISTS') {
            if (!confirm(`${data.json.message}\r\n\r\nDo you want to override the same menu id?`)) {
              return;
            }
            post.idReadonly = true;
            const data2 = await getRenderPageProps().renderPageFunctions.fetchData('/api/admin/menus/save', post);
            if (data2.json && data2.json.status !== 'ok') {
              alert(`Error happened: ${data2.json.message}`);
            } else {
              updateIds();
              NotificationMessage.sendMessage('Menu is saved.');
            }
          } else {
            alert(`Error happened: ${data.json.message}`);
            return;
          }
        } else {
          updateIds();
          NotificationMessage.sendMessage('Menu is saved.');
        }
      }

      modalClose();
    };
    const modalClose = await ModalWindow.show({
      title: 'Save Menu',
      buttons: ['Save', 'Cancel'],
      // contentMaxHeight: '400px',
      handleClicked,
      children: (
        <SaveMenu
          menuIdReadonly={!!savedMenuId && !isSaveAs}
          menuId={savedMenuId}
          title={savedMenuTitle}
          note={savedMenuNote}
          package={savedPackage}
        ></SaveMenu>
      ),
    });
  };

  let oMenu!: HTMLSelectElement;
  const ref: RefProps = {
    onLoad: async () => {
      // oMenu = document.querySelector('#menulist')!;
      // if (menuId) {
      //   const response = await getRenderPageProps().renderPageFunctions.fetchData(`/api/admin/pages/get/${menuId}`);
      //   doLoad(response.json.result);
      // }
    },
  };
  function getSel(ismsg = true) {
    if (oMenu.selectedIndex < 0 && ismsg) {
      if (oMenu.length == 0) {
        NotificationMessage.sendMessage('No item in menu item list.');
      } else {
        NotificationMessage.sendMessage('Please select one item.');
      }
    }
    return oMenu.selectedIndex;
  }
  function getLevel(ind: number) {
    var t = oMenu.options[ind].value.split('\t');
    return Number.parseInt(t[0]);
  }
  function getNav(ind: number) {
    var t = oMenu.options[ind].value.split('\t');
    return t[1];
  }
  function getAcc(ind: number) {
    var t = oMenu.options[ind].value.split('\t');
    return t[2];
  }
  function getLnk(ind: number) {
    var t = oMenu.options[ind].value.split('\t');
    return t[3];
  }
  function getTxt(ind: number) {
    var t = oMenu.options[ind].value.split('\t');
    return t[4];
  }

  function getAllItems() {
    const ret = [];
    for (var i = 0; i < oMenu.length; i++) {
      // ret.push(oMenu.options[i].value);
      ret.push([getLevel(i), getNav(i), getAcc(i), getLnk(i), getTxt(i)]);
    }
    return ret;
  }
  async function doDelete() {
    if (!savedMenuId) {
      alert('Current menu is not on DB yet.');
      return;
    }
    if (!confirm('Do you delete this menu from the system?')) return;
    await getRenderPageProps().renderPageFunctions.fetchData(`/api/admin/menus/delete/${savedMenuId}`);
    doNew();
    NotificationMessage.sendMessage('Menu is deleted.');
  }
  function doNew() {
    savedMenuId = '';
    for (var i = oMenu.length - 1; i >= 0; i--) {
      oMenu.options[i].remove();
    }
  }
  function byId(id: string) {
    return document.getElementById(id)! as HTMLElement;
  }
  function doListChg() {
    var ind = getSel(false);
    var tt = getTxt(ind);

    var ty = '0';
    DomUtils.setValue('#menuimageout', '');
    DomUtils.setValue('#menuimageon', '');
    DomUtils.setValue('#menupanel', '');
    if (tt.substring(0, 4) == '[::]') {
      var t = tt.split('[::]');
      if (t.length == 6) {
        DomUtils.setValue('#menuimg1', t[3]);
        DomUtils.setValue('#menuimg2', t[4]);
        ty = t[1];
        tt = t[2];
        DomUtils.setValue('#menupanel', t[5]);
      }
    }

    var lev = getLevel(ind);
    if (lev > 0) {
      byId('img_p0').style.display = 'none';
      byId('img_p1').style.display = 'none';
      byId('img_p2').style.display = 'none';
      byId('img_panel').style.display = 'none';
    } else {
      byId('img_p0').style.display = '';
      byId('img_p1').style.display = '';
      byId('img_p2').style.display = '';
      byId('img_panel').style.display = '';
    }

    DomUtils.setChecked('#itemtype1', ty == '' || ty == '0');
    DomUtils.setChecked('#itemtype2', ty == '1');
    DomUtils.setValue('#menutitle', tt);
    DomUtils.setValue('#menulink', getLnk(ind));
    DomUtils.setValue('#menutarget', getNav(ind));
    DomUtils.setValue('#menuaccess', getAcc(ind));
  }

  function doReplace(ind2?: number) {
    var ind = typeof ind2 === 'number' && ind2 >= 0 ? ind2 : getSel(true);
    if (ind < 0) return;
    var menutxt = DomUtils.getValue('#menutitle').trim();
    if (menutxt == '') {
      alert('Please input menu text.');
      return;
    }
    if (menutxt.indexOf('[::]') >= 0) {
      alert('Cannot include "[::]" in menu text.');
      return;
    }

    var lev = getLevel(ind);
    var acc = DomUtils.getValue('#menuaccess');
    var nav = DomUtils.getValue('#menutarget');
    if (!nav || nav == '' || !acc || acc == '') {
      alert('Please select browsernav and access.');
      return;
    }

    var itemty = '0';
    if (DomUtils.getChecked('#itemtype2')) {
      itemty = '1';
    }
    var img1 = DomUtils.getValue('#menuimageout').trim();
    var img2 = DomUtils.getValue('#menuimageon').trim();
    var panel = DomUtils.getValue('#menupanel').trim();
    if (itemty == '1' && img1 == '') {
      alert('For selected Image, need input image path.');
      return;
    }

    if (img1 != '' || panel != '') {
      menutxt = '[::]' + itemty + '[::]' + menutxt + '[::]' + img1 + '[::]' + img2 + '[::]' + panel;
    }

    var pre = new Array(lev * 4 + 1).join('-');
    oMenu.options[ind].value = lev + '	' + nav + '	' + acc + '	XX	' + DomUtils.getValue('#menulink').trim() + '	' + menutxt;
    oMenu.options[ind].text = pre + DomUtils.getValue('#menutitle').trim();
  }
  function doAppend(act: number) {
    var ind = oMenu.selectedIndex;
    if (ind < 0) {
      ind = oMenu.length - 1;
    }
    if (act == 1) {
      DomUtils.setValue('#menutitle', 'New Item');
      DomUtils.setValue('#menulink', '');
    }
    if (DomUtils.getValue('#menutitle').trim() == '') {
      alert('Please input menu text.');
      return;
    }
    var acc = DomUtils.getValue('#menuaccess');
    var nav = DomUtils.getValue('#menutarget');
    if (!nav || nav == '' || !acc || acc == '') {
      alert('Please select Target and Access Level.');
      return;
    }
    oMenu.options[oMenu.length] = new Option('', '');
    for (var i = oMenu.length - 1; ind >= 0 && i > ind; i--) {
      oMenu.options[i].text = oMenu.options[i - 1].text;
      oMenu.options[i].value = oMenu.options[i - 1].value;
    }
    doReplace(ind + 1);
    oMenu.options[ind + 1].selected = true;
  }

  function doDel() {
    var ind = getSel(true);
    if (ind < 0) return;
    if (!confirm('Delete the selected item and all the subs?')) return;
    var lev = getLevel(ind);
    var ind0 = -1;
    for (var i = ind; i < oMenu.length; i++) {
      var levx = getLevel(i);
      if (levx <= lev && i != ind) {
        break;
      }
      ind0 = i;
    }
    for (var i = ind0; i >= ind; i--) {
      oMenu.options[i].remove();
    }

    if (ind >= oMenu.length) ind = oMenu.length - 1;
    if (ind >= 0) oMenu.options[ind].selected = true;
  }

  function doMoveUp(ind: number) {
    if (ind < 1) return -1;
    var ind0 = -1;
    var lev = getLevel(ind);
    for (var i = ind - 1; i >= 0; i--) {
      var levx = getLevel(i);
      if (levx < lev) {
        break;
      }
      if (levx == lev) {
        ind0 = i;
        break;
      }
    }
    if (ind0 < 0) return -1;
    oMenu.options[ind0].selected = true;
    var inds = ind0;

    for (var i = ind; i < oMenu.length; i++) {
      var levx = getLevel(i);
      if (levx <= lev && i != ind) break;

      for (var j = i; j > ind0; j--) {
        var text = oMenu.options[j].text;
        var value = oMenu.options[j].value;
        oMenu.options[j].text = oMenu.options[j - 1].text;
        oMenu.options[j].value = oMenu.options[j - 1].value;
        oMenu.options[j - 1].text = text;
        oMenu.options[j - 1].value = value;
      }
      ind0++;
    }
    return ind0 - inds;
  }
  function doUp() {
    var ind = getSel(true);
    doMoveUp(ind);
  }
  function doDown() {
    var ind = getSel(true);
    if (ind < 0) return;

    if (ind >= oMenu.length - 1) return;
    var ind0 = -1;
    var lev = getLevel(ind);
    for (var i = ind + 1; i < oMenu.length; i++) {
      var levx = getLevel(i);
      if (levx < lev) {
        break;
      }
      if (levx == lev) {
        ind0 = i;
        break;
      }
    }
    if (ind0 < 0) return;
    var ind2 = doMoveUp(ind0);
    oMenu.options[ind + ind2].selected = true;
  }
  function doLeft() {
    var ind = getSel(true);
    if (ind < 0) return;

    var lev = getLevel(ind);
    if (lev <= 0) return;
    for (var i = ind; i < oMenu.length; i++) {
      var t = oMenu.options[i].value.split('\t');
      let newlev = Number.parseInt(t[0]);
      if (newlev <= lev && i != ind) break;

      newlev--;
      t[0] = '' + newlev;
      var pre = new Array(newlev * 4 + 1).join('-');
      oMenu.options[i].value = t.join('	');
      oMenu.options[i].text = pre + t[4];
    }
  }
  function doRight() {
    var ind = getSel(true);
    if (ind < 1) return;

    var lev0 = getLevel(ind - 1);
    var lev = getLevel(ind);
    if (lev0 < lev) return;
    for (var i = ind; i < oMenu.length; i++) {
      var t = oMenu.options[i].value.split('\t');
      let newlev = Number.parseInt(t[0]);
      if (newlev <= lev && i != ind) break;

      newlev++;
      t[0] = '' + newlev;
      var pre = new Array(newlev * 4 + 1).join('-');
      oMenu.options[i].value = t.join('	');
      oMenu.options[i].text = pre + t[4];
    }
  }

  const css: CssProps = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: 'var(--primary-border)',
    '.edit-page-header': {
      height: '30px',
    },
    '.edit-page-body': {
      borderTop: 'var(--primary-border)',
      flex: '1',
      display: 'flex',
      flexDirection: 'row',
    },
    '.edit-page-menu': {
      display: 'flex',
      width: '200px',
      flexDirection: 'column',
      borderRight: 'var(--primary-border)',
    },
    '.edit-page-if': {
      flex: '1',
      overflowX: 'auto',
      overflowY: 'auto',
    },
    '.edit-page-if .iframe': {
      display: 'flex', // resolve the scrollbar issue
      width: '100%',
      height: '100%',
      // border: 'solid 1px red',
    },
  };

  const list = ['aaa', 'bbb'];
  const handleSelected = (themeName: string) => {
    const iframe = ref.current.querySelector('.iframe') as HTMLIFrameElement;
    iframe.contentDocument!.body.innerHTML = 'abc' + themeName;
  };

  const addBlock = () => {
    const iframe = ref.current.querySelector('.iframe') as HTMLIFrameElement;
    // communication with inside iframe
    const msgSender = (iframe as any).contentWindow._lj_design;
    msgSender.toParent = (cmd: string, data: any) => {
      if (cmd === 'xxx') {
        console.log('addBlock', data);
      }
    };

    msgSender.toIframe('add-block', 'ss');
  };

  const iframeLoad = () => {
    const iframe = ref.current.querySelector('.iframe') as HTMLIFrameElement;
    const msgSender = (iframe as any).contentWindow._lj_design;
    if (msgSender) {
      msgSender.toParent = (cmd: string, data: any) => {
        console.log('top window', cmd, data);
        if (cmd === 'xxx') {
        }
      };
    }
  };

  return (
    <div css={css} ref={ref}>
      <div class='edit-page-header row-box pt-s pl-s'>
        <div>Edit Menu: {menuId}</div>
        <PopupMenu list={list} defaultValue={'aaa'} handleSelected={handleSelected}></PopupMenu>
      </div>
      <div class='edit-page-body pt-s pl-s'>
        <div class='edit-page-menu pt-s pl-s'>
          <div onClick={addBlock}>
            <DesignBlockBox id='5' isNewBlock={true}>
              <BlockParagraph>design block three</BlockParagraph>
            </DesignBlockBox>
          </div>
          <div onClick={addBlock}>Add Block</div>
          <div onClick={addBlock}>Add Block</div>
        </div>
        <div class='edit-page-if pt-s pl-s'>
          <iframe onLoad={iframeLoad} class='iframe' frameBorder='0' src='/admin_dev/design'></iframe>
        </div>
      </div>
    </div>
  );
};
