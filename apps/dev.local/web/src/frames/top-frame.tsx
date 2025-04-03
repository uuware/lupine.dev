import { VNode, CssProps, webEnv } from 'lupine.js';
import { UserInfo } from '../components/user-info';

export const TopFrame = async (placeholderClassname: string, vnode: VNode<any>) => {
  const cssContainer: CssProps = {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
    '.header-user': {
      position: 'absolute',
      right: '10px',
      zIndex: 10,
    },
    '.top-frame-box': {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
    },
  };

  console.log('version', webEnv('APP_VERSION', '1.0.0'));
  return (
    <div css={cssContainer}>
      <div class='header-user'>
        <UserInfo />
      </div>
      {/* Can't put css on this placeholder node! */}
      <div class={'top-frame-box ' + placeholderClassname}>{vnode}</div>
    </div>
  );
};
