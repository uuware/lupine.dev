import {
  ButtonPushAnimation,
  ButtonPushAnimationSize,
  HtmlVar,
  PlayButton,
  PlayButtonSize,
  Progress,
  ProgressHookProps,
  RefProps,
  Spinner01,
  Spinner02,
  Spinner03,
  SpinnerSize,
  TextGlow,
  TextWave,
  updateStyles,
} from 'lupine.web';

const TestButton = () => {
  const onClick = async () => {
    dom.value = 'You clicked the button.';
  };
  const ref: RefProps = {
    onLoad: async () => {
      dom.value = 'This value is set in onLoad event.';
    },
  };
  const dom = HtmlVar('');
  return (
    <div ref={ref} class='row-box pt-m'>
      <button onClick={onClick} class='button-base'>
        Click me!
      </button>
      <div class='pl-m'>{dom.node}</div>
    </div>
  );
};

const TestInput = () => {
  const onInput = async (ev?: any) => {
    // you can get value from: ev.target.value
    dom.value = 'Your input: ' + refInput.current.value;
  };
  const onClick = async () => {
    refInput.current.value = '';
    refInput.current.dispatchEvent(new Event('input'));
  };
  const dom = HtmlVar('');
  const refInput: RefProps = {};
  return (
    <div>
      <div class='row-box pt-m'>
        <input ref={refInput} class='input-base' type='input' onInput={onInput} />
        <div class='pl-m'>{dom.node}</div>
      </div>
      <div class='row-box pt-m'>
        <button onClick={onClick} class='button-base'>
          Clear Input Value
        </button>
      </div>
    </div>
  );
};

const TestMouse = () => {
  const onClick = (ev: any) => {
    dom.value = `Clicked: x: ${ev.clientX}, y: ${ev.clientY}`;
  };
  const onMMove = (ev: any) => {
    dom.value = `Moving: x: ${ev.clientX}, y: ${ev.clientY}`;
  };
  const dom = HtmlVar('');
  return (
    <div style={{ border: 'solid 1px red' }} class='row-box p-m' onMouseMove={onMMove}>
      <button onClick={onClick} class='button-base'>
        Move your mouse
      </button>
      <div class='pt-m'>{dom.node}</div>
    </div>
  );
};

// You can use defaultMessageHub, or use the sample here
type CommunicationProps = {
  update: {
    send: (obj: { id: string; message: string }) => { status: 'ok' | 'error'; message: string };
    receive?: (obj: { id: string; message: string }) => { status: 'ok' | 'error'; message: string };
  };
};
const TestCommunication = (props: CommunicationProps) => {
  const onInput = async (ev: any) => {
    const msg = ev.target.value;
    const response = props.update.send({ id: 'msg', message: msg });
    dom.value = `response, status: ${response.status}, msg: ${response.message}`;
  };
  props.update.receive = (obj: { id: string; message: string }) => {
    dom.value = `received message, id: ${obj.id}, msg: ${obj.message}`;
    return { status: 'ok', message: 'echo: ' + obj.message };
  };
  const dom = HtmlVar('');
  return (
    <div>
      <div class='row-box pt-m'>
        <label class='pr-m'>Send Message: </label>
        <input class='input-base' type='input' onInput={onInput} />
      </div>
      <div class='row-box pt-m'>
        <label class='pr-m'>Received Message: </label>
        <div class='pl-m'>{dom.node}</div>
      </div>
    </div>
  );
};

const TestStyles = () => {
  const css: any = {
    color: 'blue',
    border: '1px solid red',
    'font-size': 20,
    '@keyframes spin': {
      '0%': {
        textShadow: '5px 5px 0 #ff005e, 5px 5px 0 #00d4ff',
      },
      '50%': {
        textShadow: '-5px -5px 0 #00d4ff, -5px -5px 0 #ff005e',
      },
    },
    '.text, .text2': {
      'font-size': '15px',
      animation: 'spin 5s infinite',
    },
    '.text2:hover': {
      color: 'red',
      border: '1px solid green',
      'font-size': '15px',
    },
    '@media screen and (min-width: 768px)': {
      '.text, .text2': {
        color: 'blue',
        'font-size': '20px',
      },
    },
    '@media screen and (min-width: 1024px)': {
      '.text': {
        color: 'orange',
        'font-size': '30px',
      },
    },
  };
  let ref: RefProps = { id: '' };
  const onClick = () => {
    css.color = css.color === 'blue' ? 'green' : 'blue';
    updateStyles(`[${ref.id}]`, css);
    console.log(`update styles`, css.color, css);
  };
  return (
    <div ref={ref} css={css} style='padding:10px;' class='pt-m' onClick={onClick}>
      Click to change styles, <span class='text'>Change window's width, </span>
      <span class='text2'>Move mouse to here</span>
    </div>
  );
};

const TestProgress = () => {
  const progressHook: ProgressHookProps = {};
  return (
    <div>
      <div class='row-box mb-s'>
        <Progress hook={progressHook} />
      </div>
      <button
        class='button-base button-m m-m'
        onClick={async () => {
          progressHook.onShow?.(true, 'Test Progress');
          for (let i = 0; i < 100; i++) {
            progressHook.onProgress?.(i / 100, 1, 1);
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
          progressHook.onShow?.(false);
        }}
      >
        Test Progress
      </button>
    </div>
  );
};

export const AdminTestAnimationsPage = () => {
  const msg1: CommunicationProps = {
    update: {
      send: (obj: { id: string; message: string }) => {
        return msg2.update.receive!(obj);
      },
    },
  };
  const msg2: CommunicationProps = {
    update: {
      send: (obj: { id: string; message: string }) => {
        return msg1.update.receive!(obj);
      },
    },
  };
  return (
    <div>
      <div>
        <div>Test the Button's onClick event.</div>
        <TestButton />
      </div>
      <div class='pt-m'>
        <br />
        <hr />
        <br />
        <div>Test the Input's onChange event.</div>
        <TestInput />
      </div>
      <div class='pt-m'>
        <br />
        <hr />
        <br />
        <div>Test Mouse event.</div>
        <TestMouse />
      </div>
      <div class='pt-m'>
        <br />
        <hr />
        <br />
        <div>Test Communication between components.</div>
        <TestCommunication update={msg1.update} />
        <TestCommunication update={msg2.update} />
      </div>
      <div class='pt-m'>
        <br />
        <hr />
        <br />
        <div>Test Style.</div>
        <TestStyles />
      </div>
      <div class='pt-m'>
        <br />
        <hr />
        <br />
        <div>Test Text Glow.</div>
        <TextGlow text='This is a sample of Text Glow' />
      </div>
      <div class='pt-m'>
        <br />
        <hr />
        <br />
        <div>Test Text Wave.</div>
        <TextWave text='This is a sample of Text Wave' />
      </div>

      <div class='pt-m'>
        PlayButton
        <PlayButton size={PlayButtonSize.Small} />
        <PlayButton size={PlayButtonSize.Medium} />
        <PlayButton size={PlayButtonSize.Large} />
      </div>

      <div class='p2'>
        <div class='row-box mb-s'>
          <Spinner01 size={SpinnerSize.Small} />
          <Spinner01 size={SpinnerSize.Medium} />
          <Spinner01 size={SpinnerSize.Large} />
          <Spinner01 size={SpinnerSize.LargeLarge} />
        </div>
        <div class='row-box mb-s'>
          <Spinner02 size={SpinnerSize.Small} />
          <Spinner02 size={SpinnerSize.Medium} />
          <Spinner02 size={SpinnerSize.Large} />
          <Spinner02 size={SpinnerSize.LargeLarge} />
        </div>
        <div class='row-box mb-s'>
          <Spinner03 size={SpinnerSize.Small} />
          <Spinner03 size={SpinnerSize.Medium} />
          <Spinner03 size={SpinnerSize.Large} />
          <Spinner03 size={SpinnerSize.LargeLarge} />
        </div>

        <div class='row-box mb-s'>
          <ButtonPushAnimation text='Test ButtonPushAnimation' size={ButtonPushAnimationSize.SmallSmall} />
        </div>
        <div class='row-box mb-s'>
          <ButtonPushAnimation text='Test ButtonPushAnimation' size={ButtonPushAnimationSize.Small} />
        </div>
        <div class='row-box mb-s'>
          <ButtonPushAnimation text='Test ButtonPushAnimation' size={ButtonPushAnimationSize.Medium} />
        </div>
        <div class='row-box mb-s'>
          <ButtonPushAnimation text='Test ButtonPushAnimation' size={ButtonPushAnimationSize.Large} />
        </div>
        <div class='row-box mb-s'>
          <ButtonPushAnimation text='Test ButtonPushAnimation' size={ButtonPushAnimationSize.LargeLarge} />
        </div>

        <div class='row-box mb-s'>
          <TestProgress />
        </div>
      </div>
    </div>
  );
};
