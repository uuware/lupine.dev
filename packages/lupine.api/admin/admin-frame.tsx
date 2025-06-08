import { bindGlobalStyles, CssProps, ComponentChildren, RefProps, VNode, getWebVersion } from 'lupine.components';
import {
  NestMenuItemProps,
  DomUtils,
  MenuSidebar,
  ThemeSelector,
  TabsUpdateProps,
  TabsPageProps,
  Tabs,
} from 'lupine.components';
import { adminCss } from './admin-css';
import { CreateTablesPage, RunSqlPage } from './admin-db';
import { TableListPage } from './admin-table-list';
import { adminFrameProps } from './admin-frame-props';
import { AdminMenuPage } from './admin-menu-list';
import { TestThemesPage } from './admin-test-themes';
import { AdminPagePage } from './admin-page-list';
import { AdminPerformancePage } from './admin-performance';
import { AdminReleasePage } from './admin-release';
import { AdminTestAnimationsPage } from './admin-test-animations';
import { AdminTestEditPage } from './admin-test-edit';
import { AdminResourcesPage } from './admin-resources';
import { AdminTokensPage } from './admin-tokens';
import { TestComponentPage } from './admin-test-component';

export type AdminFrameProps = {
  children: ComponentChildren;
  title?: string;
  css?: CssProps;
};
export const AdminFrame = (props: AdminFrameProps) => {
  const refUpdate = adminFrameProps.refUpdate;
  const addPanel = async (title: string, page: VNode) => {
    if (refUpdate?.getCount && refUpdate.getCount() > adminFrameProps.maxTabsCount) {
      alert('You are opening too many pages');
      return;
    }
    if (refUpdate?.findAndActivate && refUpdate.findAndActivate(title)) {
      return;
    }
    refUpdate?.newPage && (await refUpdate.newPage(title, page));
  };
  const adminTopMenu: NestMenuItemProps[] = [
    { text: 'Top', url: '/admin' },
    {
      text: 'Contents',
      url: '',
      items: [
        {
          text: 'Menu List',
          url: '',
          js: () => addPanel('Menu', AdminMenuPage()),
        },
        {
          text: 'Page List',
          url: '',
          js: () => addPanel('Page', AdminPagePage()),
        },
        {
          text: 'Process List',
          url: '',
          js: () => addPanel('Process', <div>new Process</div>),
        },
      ],
    },
    // { text: 'menu2', url: '/st_did.l--liangbufan.gunanguanvqingguandeng.html' },
    // {
    //   text: 'Admin',
    //   url: '',
    //   items: [{ text: 'Users', url: '/admin/users' }],
    // },
    {
      text: 'DB',
      url: '',
      items: [
        {
          text: 'Table List',
          url: '',
          js: () => addPanel('Table List', TableListPage()),
        },
        {
          text: 'Create Tables',
          url: '',
          js: () => addPanel('Create Tables', CreateTablesPage()),
        },
        {
          text: 'Run SQL',
          url: '',
          js: () => addPanel('Run SQL', RunSqlPage()),
        },
      ],
    },
    {
      text: 'Test',
      url: '',
      items: [
        {
          text: 'Test Themes',
          url: '',
          js: () => addPanel('Test Themes', TestThemesPage()),
        },
        {
          text: 'Test Component',
          url: '',
          js: () => addPanel('Test Component', TestComponentPage()),
        },
        {
          text: 'Test Animations',
          url: '',
          js: () => addPanel('Test Animations', AdminTestAnimationsPage()),
        },
        {
          text: 'Test Edit',
          url: '',
          js: () => addPanel('Test Edit', AdminTestEditPage()),
        },
      ],
    },

    {
      text: 'Access',
      url: '',
      items: [
        {
          text: 'Release',
          url: '',
          js: () => addPanel('Release', AdminReleasePage()),
        },
        {
          text: 'Tokens',
          url: '',
          js: () => addPanel('Tokens', AdminTokensPage()),
        },
      ],
    },

    {
      text: 'Server Info',
      url: '',
      items: [
        {
          text: 'Performance',
          url: '',
          js: () => addPanel('Performance', AdminPerformancePage()),
        },
        {
          text: 'Resources',
          url: '',
          js: () => addPanel('Resources', AdminResourcesPage()),
        },
      ],
    },
    {
      text: 'About',
      url: '',
      js: () => addPanel('About', <div>new About</div>),
    },
  ];

  const maxWidthMobileMenu = '800px';
  const css: CssProps = {
    backgroundColor: 'var(--primary-bg-color)',
    color: 'var(--primary-color)',
    ...adminCss,
    display: 'flex',
    flexDirection: 'column',
    // padding: '10px',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    overflowY: 'auto',
    '.f-header': {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 16px 4px 0px',
      fontSize: '80%',
    },
    '.top-logo': {
      marginLeft: '16px',
      marginRight: '16px',
    },
    '.top-title': {
      flex: '1',
      fontSize: '160%',
      margin: 'auto',
    },
    '.top-menu': {
      display: 'flex',
    },
    '.top-menu .item': {
      padding: '0px 2px',
    },
    '.f-body': {
      flex: '1',
      display: 'flex',
      borderTop: 'var(--primary-border)',
      minHeight: '0',
    },
    '.body-menu': {
      width: '200px',
      // padding: '8px 16px',
      borderRight: 'var(--primary-border)',
      overflowY: 'auto',
      color: 'var(--sidebar-color)',
      backgroundColor: 'var(--sidebar-bg-color)',
    },
    '.close-menu-icon': {
      position: 'relative',
    },
    '.close-menu-icon.hide + .body-menu': {
      display: 'none',
    },
    '.close-menu-icon::after': {
      content: '""',
      position: 'absolute',
      top: '-13px',
      left: '-1px',
      transform: 'rotate(90deg)',
      width: '0',
      height: '0',
      borderLeft: '7px solid transparent',
      borderRight: '7px solid transparent',
      borderTop: '7px solid var(--primary-color)',
      transition: 'all 300ms ease-in-out',
      zIndex: 'var(--layer-sidebar)',
    },
    ['@media only screen and (max-width: ' + maxWidthMobileMenu + ')']: {
      '.body-menu, .close-menu-icon': {
        display: 'none',
      },
    },
    '.body-content': {
      flex: '1',
      overflowX: 'auto',
      // padding: '8px 16px',
    },
    ...props.css,
  };
  const onLogoutClick = () => {
    DomUtils.clearCookie('_token_dev', '/');
    window.location.href = '/admin';
  };

  bindGlobalStyles('admin-frame', '.admin-frame-box', css);

  const refCloseMenu: RefProps = {};
  const onCloseMenuClick = () => {
    refCloseMenu.current.classList.toggle('hide');
  };
  return (
    <div class='admin-frame-box'>
      <div class='f-header'>
        <MenuSidebar
          items={adminTopMenu}
          maxWidthMobileMenu={maxWidthMobileMenu}
          color='var(--sidebar-color)'
          backgroundColor='var(--sidebar-bg-color)'
          mobileMenu={true}
        ></MenuSidebar>
        <div class='top-logo'>Lupine.Dev - {getWebVersion()}</div>
        <div class='top-title'>{props.title}</div>
        <div class='top-menu'>
          <ThemeSelector></ThemeSelector>
          <button onClick={() => window.open('/')} class='button-base button-s'>
            Home
          </button>
          <button onClick={onLogoutClick} class='button-base button-s'>
            Logout
          </button>
        </div>
      </div>
      <div class='f-body'>
        <div ref={refCloseMenu} class='close-menu-icon' onClick={onCloseMenuClick} title='Hide / Show Side Menu'></div>
        <div class='body-menu'>
          <MenuSidebar
            items={adminTopMenu}
            maxWidthMobileMenu={maxWidthMobileMenu}
            color='var(--sidebar-color)'
            backgroundColor='var(--sidebar-bg-color)'
            desktopMenu={true}
          ></MenuSidebar>
        </div>
        <div class='body-content'>
          <AdminPanel refUpdate={refUpdate} title='Panel'></AdminPanel>
        </div>
      </div>
    </div>
  );
};

export type AdminPanelProps = {
  title?: string;
  css?: CssProps;
  refUpdate: TabsUpdateProps;
};
export const AdminPanel = (props: AdminPanelProps) => {
  const css: CssProps = {
    height: '100%',
  };
  bindGlobalStyles('admin-panel', '.admin-panel-box', css);
  const pages: TabsPageProps[] = [];
  return (
    <div class='admin-panel-box'>
      <Tabs pages={pages} refUpdate={props.refUpdate} pagePadding='8px'></Tabs>
    </div>
  );
};
