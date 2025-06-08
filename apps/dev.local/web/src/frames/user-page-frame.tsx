import {
  MenuBar,
  LinkList,
  MediaQueryMaxWidth,
  webSetting,
  VNode,
  CssProps,
  MediaQueryRange,
} from 'lupine.components';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { getCookieUser } from '../services/shared-data';
import { FooterMenu } from '../components/footer-menu';

const defaultTopMenu = [
  { text: 'Home', url: '/' },
  { text: 'Page1', url: '/user/page1/parameter1/fixed-section/parameter2/option1' },
  { text: 'Page2', url: '/user/page2/parameterx/fixed-section/parametery/optionz' },
  { text: 'Frame1', url: '/frame1' },
  { text: 'Frame1-1', url: '/frame1/page1' },
  { text: 'Frame2', url: '/frame2' },
  { text: 'Frame2-1', url: '/frame2/page1' },
];

const defaultTopMenuUser = [
  { text: 'Home', url: '/' },
  { text: 'Page1', url: '/user/page1/parameter1/fixed-section/parameter2/option1' },
  { text: 'Page2', url: '/user/page2/parameterx/fixed-section/parametery/optionz' },
  { text: 'Frame1', url: '/frame1' },
  { text: 'Frame1-1', url: '/frame1/page1' },
  { text: 'Frame2', url: '/frame2' },
  { text: 'Frame2-1', url: '/frame2/page1' },
  { text: 'User1', url: '/user/user1/url-parameter/' },
  { text: 'User1-2', url: '/user/user1/sample-parameter/option1/' },
  { text: 'Contact', url: '/user/contact' },
];

export const UserPageFrame = async (placeholderClassname: string, vnode: VNode<any>) => {
  const cssContainer: CssProps = {
    display: 'flex',
    'flex-direction': 'column',
    // padding: '10px',
    width: '100%',
    'min-height': '100%',
    'overflow-y': 'auto',
    '.content-block': {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
    },
    '.content-block .padding-block': {
      padding: '0 16px',
    },
    '.top-link-list, .top-footer': {
      paddingTop: '16px',
    },
    [MediaQueryRange.TabletBelow]: {
      '.header-box, .top-link-list, .top-footer .footer-box, .menu-bar-box': {
        display: 'none',
      },
      '.content-block' : {
        paddingBottom: '16px',
      },
      '.metronome-page-box, .gauge-box': {
        boxShadow: '#313131 2.02px 2.02px 5.08px 1px !important',
      },
    },
  };

  const userCookie = getCookieUser();
  const actualMenu = !userCookie || !userCookie.u ? defaultTopMenu : defaultTopMenuUser;
  return (
    <div css={cssContainer}>
      <Header title={webSetting('siteTitle', 'lupine.dev')} subtitle=''></Header>
      <MenuBar items={actualMenu} maxWidthMobileMenu={'800px'} maxWidth={MediaQueryMaxWidth.DesktopMax}></MenuBar>
      <div class={'content-block ' + placeholderClassname}>{vnode}</div>
      <div class='top-link-list'>
        <LinkList items={actualMenu} title=''></LinkList>
      </div>
      <div class='top-footer'>
        <Footer title={webSetting('footer', `Copyright© 2024 <a href='/'>lupine.dev</a>. All Rights Reserved.`)}></Footer>
        <FooterMenu></FooterMenu>
      </div>
    </div>
  );
};
