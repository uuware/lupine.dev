import { VNode, CssProps, getWebVersion } from 'lupine.js';

export const TopFrame = async (placeholderClassname: string, vnode: VNode<any>) => {
  const cssContainer: CssProps = {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative',
    '.top-frame-box': {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
    },
  };

  console.log('Web version: ', getWebVersion());
  return (
    <div css={cssContainer}>
      {/* Can't put css on this placeholder node! */}
      <div class={'top-frame-box ' + placeholderClassname}>{vnode}</div>
    </div>
  );
};
