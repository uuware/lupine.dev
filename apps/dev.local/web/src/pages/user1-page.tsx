import { CssProps, getRenderPageProps, HtmlVar, MediaQueryMaxWidth, MediaQueryRange, PageProps, RefProps, ToggleSwitch } from 'lupine.js';

export const User1Page = async () => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    margin: 'auto',
    '.gauge-box': {
      margin: 'auto',
      width: '90%',
      maxWidth: '500px',
      backgroundColor: '#00000000',
      boxShadow: '#000000 13.02px 13.02px 52.08px 0px',
      borderRadius: '16px',
      padding: '40px',
      textAlign: 'center',
    },
    '.sound-box': {
      margin: 'auto',
      // height: '30px',
      textAlign: 'center',
      fontSize: '20px',
      padding: '10px',
      fontWeight: 'bold',
      fontFamily: 'Roboto, sans-serif',
    },
    '.toggle-box': {
      textAlign: 'center',
    },
  };

  const nodeTest1 = HtmlVar('');
  const nodeTest2 = HtmlVar('Initial Value');
  const onClickTuner = async (checked: boolean) => {
    nodeTest1.value = 'Value set in onClickTuner event: ' + checked;
  };

  const ref: RefProps = {
    onLoad: async (el: Element) => {
      nodeTest1.value = 'parameter1: ' + getRenderPageProps().urlParameters?.parameter1 + ', option1: ' + getRenderPageProps().urlParameters?.option1;
      nodeTest2.value = 'Value set in onLoad event';
    },
  };
  return (
    <div css={css} ref={ref} class='gauge-top'>
      <div class='gauge-box'>
        <div class='sound-box'>{nodeTest1.node}</div>
        <div class='sound-box'>{nodeTest2.node}</div>
        <div class='toggle-box'>
          <ToggleSwitch onChanged={onClickTuner} checked={false} />
        </div>
      </div>
    </div>
  );
};
