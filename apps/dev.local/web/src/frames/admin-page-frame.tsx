import { MenuBar, MediaQueryMaxWidth, webSetting, webEnv, VNode, CssProps } from 'lupine.js';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

const defaultTopMenu = [
  { text: '首页', url: '/' },
  { text: '管理列表', url: '/admin/music-list' },
  { text: '管理用户', url: '/admin/user' },
  { text: '管理网站', url: '/admin/cfg' },
];

export const AdminPageFrame = async (placeholderClassname: string, vnode: VNode<any>) => {
  const cssContainer: CssProps = {
    display: 'flex',
    'flex-direction': 'column',
    width: '100%',
    'min-height': '100%',
    'overflow-y': 'auto',
    '.content-block': {
      display: 'flex',
      flex: '1',
      margin: 'auto',
      maxWidth: MediaQueryMaxWidth.DesktopMax,
      width: '100%',
    },
    '.top-footer': {
      paddingTop: '16px',
    },
  };

  return (
    <div css={cssContainer}>
      <Header title='管理页面' subtitle={'ver: ' + webEnv('APP_VERSION', '1.0.0')}></Header>
      <MenuBar items={defaultTopMenu} maxWidthMobileMenu={'800px'} maxWidth={MediaQueryMaxWidth.DesktopMax}></MenuBar>
      <div class={'content-block ' + placeholderClassname}>{vnode}</div>
      <div class='top-footer'>
        <Footer title={webSetting('footer', `Copyright© 2024 <a href='/'>lupine.dev</a>. All Rights Reserved.`)}></Footer>
      </div>
    </div>
  );
};
