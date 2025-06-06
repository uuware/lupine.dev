import { MenuBar, MediaQueryMaxWidth, webSetting, VNode, CssProps, getWebVersion } from 'lupine.web';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

const defaultTopMenu = [
  { text: 'Home', url: '/' },
  { text: 'Manage List', url: '/admin/music-list' },
  { text: 'Manage Users', url: '/admin/user' },
  { text: 'Manage Website', url: '/admin/cfg' },
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
      <Header title='Admin Page (Lupine.Dev)' subtitle={'ver: ' + getWebVersion()}></Header>
      <MenuBar items={defaultTopMenu} maxWidthMobileMenu={'800px'} maxWidth={MediaQueryMaxWidth.DesktopMax}></MenuBar>
      <div class={'content-block ' + placeholderClassname}>{vnode}</div>
      <div class='top-footer'>
        <Footer title={webSetting('footer', `Copyright© 2024 <a href='/'>lupine.dev</a>. All Rights Reserved.`)}></Footer>
      </div>
    </div>
  );
};
