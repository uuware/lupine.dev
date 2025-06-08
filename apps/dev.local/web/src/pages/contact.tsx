import {
  DomUtils,
  getRenderPageProps,
  MediaQueryMaxWidth,
  NotificationMessage,
  NotificationColor,
  PageProps,
  CssProps,
} from 'lupine.components';

const submitFormData = async (body: any) => {
  const data = await getRenderPageProps().renderPageFunctions.fetchData('/api/add-contact', body);
  return data.json;
};

export const ContactPage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.MobileMax,
    // height: '1000px',
    margin: 'auto',
    padding: '0 20px',
    '.header-title': {
      fontSize: 'var(--page-title-font-size)',
      textAlign: 'center',
      padding: '20px 0',
    },
    '.msg-area': {
      height: '100px',
    },
    '.msg-btn': {
      height: '60px',
    },
  };

  const onSubmit = async () => {
    const name = DomUtils.getValue('.f-name');
    if (!name) {
      NotificationMessage.sendMessage('Please input your name', NotificationColor.Error);
      return;
    }

    const email = DomUtils.getValue('.f-email')!;
    if (!email) {
      NotificationMessage.sendMessage('Please input your email address', NotificationColor.Error);
      return;
    }
    // check username is email?
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email)) {
      NotificationMessage.sendMessage('Please input correct email address', NotificationColor.Error);
      return;
    }

    const subject = DomUtils.getValue('.f-subject')!;
    if (!subject) {
      NotificationMessage.sendMessage('Please input subject', NotificationColor.Error);
      return;
    }
    const message = DomUtils.getValue('.f-message')!;
    if (!message) {
      NotificationMessage.sendMessage('Please input message', NotificationColor.Error);
      return;
    }

    const body = {
      name,
      email,
      subject,
      message,
    };
    const data = await submitFormData(body);
    if (data.status === 'ok') {
      NotificationMessage.sendMessage(data.message, NotificationColor.Success);
      // window.location.href = '/login';
      DomUtils.setValue('.f-name', '');
      DomUtils.setValue('.f-email', '');
      DomUtils.setValue('.f-subject', '');
      DomUtils.setValue('.f-message', '');
    } else {
      NotificationMessage.sendMessage(data.message, NotificationColor.Error);
    }
  };
  return (
    <div css={css}>
      <div class='header-title'>Contact Us</div>
      <div class='input-field w-100p'>
        <input class='input-base w-100p f-name' type='text' required placeholder=' ' />
        <span>Name *</span>
      </div>
      <div class='input-field w-100p'>
        <input class='input-base w-100p f-email' type='email' required placeholder=' ' />
        <span>E-Mail *</span>
      </div>
      <div class='input-field w-100p'>
        <input class='input-base w-100p f-subject' type='text' required placeholder=' ' />
        <span>Subject *</span>
      </div>
      <div class='input-field w-100p'>
        <textarea class='input-base w-100p msg-area f-message' required placeholder=' '></textarea>
        <span>Message *</span>
      </div>
      <button onClick={onSubmit} class='button-base msg-btn'>
        Submit
      </button>
      {/* <iframe width='100%' height='100%' src='https://form.jotform.com/242752573546867'></iframe> */}
    </div>
  );
};
