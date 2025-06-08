import { MediaQueryRange, MediaQueryMaxWidth, webSetting } from 'lupine.components';
import { UserInfo } from './user-info';

export const Header = (props: { title: string; subtitle?: string }) => {
  const css: any = {
    display: 'flex',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    margin: 'auto',
    position: 'relative',
    '.header-user': {
      position: 'absolute',
      right: '10px',
      zIndex: 10,
    },
    '.logo-box': {
      height: '100px',
      width: '100px',
      display: 'flex',
      alignSelf: 'center',
    },
    '.logo': {
      height: '100%',
      padding: '1px',
      margin: 'auto',
    },
    '.header-title': {
      flex: '1',
      fontSize: '38px',
      textAlign: 'center',
      // margin: '25px 0',
      textShadow: '-3px -3px 10px white, 3px 3px 10px black',
      color: 'darkblue',
    },
    '.header-subtitle': {
      fontSize: '11px',
      textAlign: 'center',
      // margin: '25px 0',
      // textShadow: '-3px -3px 10px white, 3px 3px 10px black',
      // color: 'darkblue',
    },
    [MediaQueryRange.ExtraSmallBelow]: {
      '.header-title, .header-subtitle': {
        fontSize: '12px',
      },
    },
    [MediaQueryRange.MobileBelow]: {
      '.header-title': {
        fontSize: '20px',
      },
    },
    [MediaQueryRange.DesktopAbove]: {
      '.header-title': {
        fontSize: '50px',
      },
    },
  };
  return (
    <div css={css} class='header-box'>
      <div class='header-user'>
        <UserInfo />
      </div>
      <div class='logo-box'>
        <img class='logo' src={`/api/image/${webSetting('siteLogo', '(not set)')}`} />
      </div>
      <div class='header-title'>
        {props.title}
        <div class='header-subtitle pt-s'>{props.subtitle}</div>
      </div>
    </div>
  );
};
