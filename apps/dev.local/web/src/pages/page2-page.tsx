import { CssProps, getRenderPageProps, HtmlVar, MediaQueryMaxWidth, RefProps, ToggleSwitch } from 'lupine.js';

export const Page2Page = async () => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    margin: 'auto',
    padding: '32px',
    '.page1-title': {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    '.page1-item': {
      fontSize: '16px',
      marginBottom: '16px',
    },
  };

  const nodeTest1 = HtmlVar('');
  const ref: RefProps = {
    onLoad: async (el: Element) => {
      nodeTest1.value = 'parameter1: ' + getRenderPageProps().urlParameters?.parameter1 + ', option1: ' + getRenderPageProps().urlParameters?.option1;
    },
  };
  return (
    <div css={css} ref={ref} class='page1-top'>
      <div class='page1-box'>
      <div class='page1-title'>This is sample page2 (can be in different frames).</div>
      <div class='page1-item'>{nodeTest1.node}</div>
      </div>
    </div>
  );
};
