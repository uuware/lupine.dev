import {
  MenuBar,
  LinkList,
  MediaQueryMaxWidth,
  webSetting,
  VNode,
  CssProps,
} from 'lupine.js';
import { Footer } from '../components/footer';
import { Header } from '../components/header';

const defaultTopMenu = [
  { text: 'Home', url: '/' },
  { text: 'Page1', url: '/user/page1/parameter1/fixed-section/parameter2/option1' },
  { text: 'Frame1', url: '/frame1' },
  { text: 'Frame1-1', url: '/frame1/page1' },
  { text: 'Frame2', url: '/frame2' },
  { text: 'Frame2-1', url: '/frame2/page1' },
  { text: 'Frame2-2', url: '/frame2/page2' },
];

export const Frame2PageFrame = async (placeholderClassname: string, vnode: VNode<any>) => {
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
  };

  return (
    <div css={cssContainer}>
      <Header title={'This is Frame2'} subtitle='(Frame can contain pages)'></Header>
      <MenuBar items={defaultTopMenu} maxWidthMobileMenu={'800px'} maxWidth={MediaQueryMaxWidth.DesktopMax} backgroundColor='#595909'></MenuBar>
      <div class={'content-block ' + placeholderClassname}>{vnode}</div>
      <div class='top-link-list'>
        <LinkList items={defaultTopMenu} title=''></LinkList>
      </div>
      <div class='top-footer'>
        <Footer
          title={webSetting('footer', `Copyright© 2024 <a href='/'>lupine.dev</a>. All Rights Reserved.`)}
        ></Footer>
      </div>
    </div>
  );
};
