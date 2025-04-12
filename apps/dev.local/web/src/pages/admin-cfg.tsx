import {
  DomUtils,
  getRenderPageProps,
  MediaQueryMaxWidth,
  NotificationMessage,
  NotificationColor,
  PageProps,
  uploadFile,
  webSetting,
  CssProps,
} from 'lupine.js';

export const AdminCfgPage = async (props: PageProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: MediaQueryMaxWidth.DesktopMax,
    margin: '0 auto',
    padding: '16px',
    '.label': {
      width: '200px',
      marginBottom: '20px',
    },
    '.m-menu': {
      display: 'flex',
      flexDirection: 'row',
      padding: '10px',
      border: '1px solid #aaa',
      borderRadius: '8px',
      margin: '10px 0',
    },
    '.m-label': {
      width: '200px',
    },
    '.m-text': {
      width: '400px',
      marginBottom: '10px',
    },
    'textarea.m-text': {
      height: '80px',
    },
  };

  const uploadImgFile = async (sector: string, fname: string) => {
    const file = (DomUtils.bySelector(sector) as HTMLInputElement)!.files;
    if (!file || file.length !== 1) {
      return;
    }
    const ext = file[0].name.split('.').pop();
    if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
      NotificationMessage.sendMessage('Please select an image file', NotificationColor.Error);
      return;
    }
    const result = await uploadFile(file[0], '/api/add-cfg-file?fn=' + fname + '.' + ext);
    if (!result) {
      NotificationMessage.sendMessage('Failed to upload file', NotificationColor.Error);
      return;
    }
  };

  const onSave = async () => {
    const title = DomUtils.getValue('.f-title');
    const footer = DomUtils.getValue('.f-footer');
    const section1 = DomUtils.getValue('.f-section1');
    const section2 = DomUtils.getValue('.f-section2');
    const section3 = DomUtils.getValue('.f-section3');
    const section4 = DomUtils.getValue('.f-section4');
    const ourValueTitle = DomUtils.getValue('.f-value-t');
    const ourValue = DomUtils.getValue('.f-value');
    const pageLimit = DomUtils.getValue('.f-pageLimit');
    const sitePaypal = DomUtils.getValue('.f-sitePaypal');
    const siteEmail = DomUtils.getValue('.f-siteEmail');
    const siteUrl = DomUtils.getValue('.f-siteUrl');

    await uploadImgFile('.img-logo', 'logo');

    const data: any = {
      title,
      footer,
      section1,
      section2,
      section3,
      section4,
      ourValueTitle,
      ourValue,
      pageLimit,
      sitePaypal,
      siteEmail,
      siteUrl,
    };

    const siteLogo = (DomUtils.bySelector('.img-logo') as HTMLInputElement)!.files;
    if (siteLogo && siteLogo.length === 1) {
      const filename = 'logo.' + siteLogo[0].name.split('.').pop();
      data['siteLogo'] = filename;
    }

    const result = await getRenderPageProps().renderPageFunctions.fetchData(
      '/api/write-settings',
      JSON.stringify(data)
    );
    console.log(data);
    setTimeout(() => {
      document.location.reload();
    }, 500);
  };

  return (
    <div css={css} class='management-cfg-page-box'>
      <div class='row-box'>
        <button class='button-base' onClick={onSave}>
          Save
        </button>
      </div>
      <div class='row-box'>
        <label class='m-label'>Page Title:</label>{' '}
        <input type='text' class='input-base m-text f-title' value={webSetting('title', '(not set)')} />
      </div>
      <div class='row-box'>
        <label class='m-label'>Logo:</label>{' '}
        <input type='file' class='input-base m-text img-logo mr-m' accept='.jpg, .jpeg, .png, .svg' />
        {webSetting('siteLogo', '(not set)')}
      </div>
      <div class='row-box'>
        <label class='m-label'>Page Footer:</label>{' '}
        <input
          type='text'
          class='input-base m-text f-footer'
          value={webSetting('footer', `Copyright© 2024 <a href='/'>lupine.dev</a>. All Rights Reserved.`)}
        />
      </div>

      <br />
      <div class='row-box'>
        <label class='m-label'>Per Page Items:</label>{' '}
        <input type='number' class='input-base m-text f-pageLimit' value={webSetting('pageLimit', 10)} />
      </div>
      <div class='row-box'>
        <label class='m-label'>Email address:</label>{' '}
        <input type='text' class='input-base m-text f-siteEmail' value={webSetting('siteEmail', '(not set)')} />
      </div>
      <div class='row-box'>
        <label class='m-label'>Website Url:</label>{' '}
        <input type='text' class='input-base m-text f-siteUrl' value={webSetting('siteUrl', '(not set)')} />
      </div>
    </div>
  );
};
