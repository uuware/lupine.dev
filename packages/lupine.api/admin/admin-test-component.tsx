import {
  RefProps,
  FloatWindow,
  NotificationMessage,
  notificationColorFromValue,
  PopupMenuWithButton,
  PopupMenuWithLabel,
  ToggleSwitch,
  ToggleSwitchSize,
  ModalWindow,
  MessageBox,
  MessageBoxButtonProps,
  NotificationColor,
  SelectWithTitle,
  InputWithTitle,
  Button,
  ButtonSize,
  ButtonHookProps,
} from 'lupine.components';

const TestWindows = () => {
  const doModal = (closeWhenClickOutside: boolean) => {
    ModalWindow.show({
      title: 'Save Menu',
      buttons: ['Ok', 'Cancel'],
      closeWhenClickOutside,
      contentMinWidth: '50%',
      handleClicked: (index: number, close: () => void) => {
        close();
      },
      children: <div>test Modal</div>,
    });
  };

  const list: string[] = ['Success', 'Info', 'Warning', 'Alert', '', 'Permanent'];
  const handleSelected = (value: string) => {
    const level = notificationColorFromValue(value);
    const permanent = value === 'Permanent';
    NotificationMessage.sendMessage('Selected: ' + value, level, permanent);
  };

  return (
    <div>
      <div class='row-box mb-s'>
        <button class='button-base mr-m mb-s' onClick={() => doModal(true)}>
          Modal (close click outside)
        </button>
        <button class='button-base mr-m mb-s' onClick={() => doModal(false)}>
          Test Modal
        </button>
        <button
          class='button-base mr-m mb-s'
          onClick={() =>
            FloatWindow.show({
              title: 'Title',
              buttons: ['OK'],
              handleClicked: (index: number, close) => {
                close();
              },
              children: <div>This is float window (modal).</div>,
            })
          }
        >
          Float Window
        </button>
        <button
          class='button-base mr-m mb-s'
          onClick={() =>
            FloatWindow.show({
              title: 'Title',
              buttons: ['OK'],
              handleClicked: (index: number, close) => {
                close();
              },
              children: <div>This is float window (no modal).</div>,
              noModal: true,
            })
          }
        >
          Float Window (no modal)
        </button>
        <button
          class='button-base mr-m mb-s'
          onClick={() =>
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.YesNo,
              contentMinWidth: '200px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: <div>YesNo dialog.</div>,
            })
          }
        >
          MessageBox
        </button>

        <button
          class='button-base mr-m mb-s'
          onClick={() => {
            const options = [
              { option: 'Option 1', value: '1' },
              { option: 'Option 2', value: '2', selected: true },
              { option: 'Option 3', value: '3' },
            ];
            const content = SelectWithTitle('Select an option', options, (option: string) => {
              NotificationMessage.sendMessage('You selected: ' + option, NotificationColor.Success);
            });
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.OkCancel,
              contentMinWidth: '300px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: content,
            });
          }}
        >
          Select an option (Select)
        </button>

        <button
          class='button-base mr-m mb-s'
          onClick={() => {
            const options = [
              { option: 'Option 1', value: '1' },
              { option: 'Option 2', value: '2' },
              { option: 'Option 3', value: '3', selected: true },
            ];
            const content = SelectWithTitle(
              'Select an option',
              options,
              (option: string) => {
                NotificationMessage.sendMessage('You selected: ' + option, NotificationColor.Success);
              },
              3
            );
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.OkCancel,
              contentMinWidth: '300px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: content,
            });
          }}
        >
          Select an option (List)
        </button>

        <button
          class='button-base mr-m mb-s'
          onClick={() => {
            const content = InputWithTitle('Enter a value', 'default value', (value: string) => {
              NotificationMessage.sendMessage('You entered: ' + value, NotificationColor.Success);
            });
            MessageBox.show({
              title: 'Title',
              buttonType: MessageBoxButtonProps.OkCancel,
              contentMinWidth: '300px',
              handleClicked: (index: number, close) => {
                close();
              },
              children: content,
            });
          }}
        >
          Input a value
        </button>
      </div>

      <br />
      <div class='row-box mb-s h3 bold'>PopupMenu</div>
      <div class='row-box mb-s'>
        <PopupMenuWithButton
          label='Test PopupMenu'
          list={list}
          defaultValue={''}
          noUpdateValue={true}
          handleSelected={handleSelected}
        ></PopupMenuWithButton>
        <PopupMenuWithLabel
          label='Test PopupMenu'
          list={list}
          defaultValue={''}
          noUpdateValue={true}
          handleSelected={handleSelected}
        ></PopupMenuWithLabel>
      </div>
    </div>
  );
};

const TestColors = () => {
  return (
    <div class='w-100p mb-s'>
      <div class='row-box'>
        <div class='success-text mb-s w-50p'>Success color</div>
        <div class='success-bg mb-s w-50p'>Success background color</div>
      </div>

      <div class='row-box'>
        <div class='info-text mb-s w-50p'>Information color</div>
        <div class='info-bg mb-s w-50p'>Information background color</div>
      </div>

      <div class='row-box'>
        <div class='warning-text mb-s w-50p'>Warning color</div>
        <div class='warning-bg mb-s w-50p'>Warning background color</div>
      </div>

      <div class='row-box'>
        <div class='error-text mb-s w-50p'>Alert color</div>
        <div class='error-bg mb-s w-50p'>Alert background color</div>
      </div>
      <div class='row-box'>
        <button
          class='button-base mr-m'
          onClick={() => NotificationMessage.sendMessage('Test Message.', NotificationColor.Success)}
        >
          Success
        </button>
        <button
          class='button-base mr-m'
          onClick={() => NotificationMessage.sendMessage('Test Message.', NotificationColor.Info)}
        >
          Info
        </button>
        <button
          class='button-base mr-m'
          onClick={() => NotificationMessage.sendMessage('Test Message.', NotificationColor.Warning)}
        >
          Warning
        </button>
        <button
          class='button-base mr-m'
          onClick={() => NotificationMessage.sendMessage('Test Message.', NotificationColor.Error)}
        >
          Error
        </button>
        <button
          class='button-base mr-m'
          onClick={() => NotificationMessage.sendMessage('Test Message.', NotificationColor.Error, true)}
        >
          Permanent
        </button>
      </div>
    </div>
  );
};

const TestTextFontSize = () => {
  return (
    <div>
      <div class='row-box mb-s h3 bold'>Class Text Sizes with bold</div>
      <div class='page-title bold mb-s'>page-title=h2, This is the page title</div>
      <div class='page-subtitle bold mb-s'>page-subtitle=h3-5, Subtitle</div>
      <div class='h3 bold mb-s'>h3 bold, Paragraph title</div>
      <div class='h3-5 bold mb-s'>h3-5 bold, Paragraph title</div>
      <div class='h4 bold mb-s'>h4 bold, Paragraph title</div>
      <div class='h4-5 bold mb-s'>h4-5 bold, Paragraph title</div>
      <div class='h5 bold mb-s'>h5 bold, Paragraph title</div>
      <div class='page-paragraph mb-s'>page-paragraph=h4, Paragraph</div>
      <div class='page-paragraph-s mb-s'>page-paragraph-s=h5, Smaller paragraph</div>

      <br />
      <div class='row-box mb-s h3 bold'>Tag Text Sizes</div>

      <div class='h1-l mb-s'>class h1-l, sample text</div>
      <h1 class='mb-s'>tag h1, sample text</h1>
      <div class='h1 mb-s'>class h1, sample text</div>

      <h2 class='mb-s'>tag h2, sample text</h2>
      <div class='h2 mb-s'>class h2, sample text</div>

      <h3 class='mb-s'>tag h3, sample text</h3>
      <div class='h3 mb-s'>class h3, sample text</div>
      <div class='h3-5 mb-s'>class h3-5, sample text</div>

      <h4 class='mb-s'>tag h4, sample text</h4>
      <div class='h4 mb-s'>class h4, sample text</div>
      <div class='h4-5 mb-s'>class h4-5, sample text</div>

      <h5 class='mb-s'>tag h5, sample text</h5>
      <div class='h5 mb-s'>class h5, sample text</div>

      <h6 class='mb-s'>tag h6, sample text</h6>
      <div class='h6 mb-s'>class h6, sample text</div>
      <div class='h6-s mb-s'>class h6-s, sample text</div>
    </div>
  );
};

const TestButtons = () => {
  const doModal = (closeWhenClickOutside: boolean) => {
    ModalWindow.show({
      title: 'Save Menu',
      buttons: ['Ok', 'Cancel'],
      closeWhenClickOutside,
      contentMinWidth: '50%',
      handleClicked: (index: number, close: () => void) => {
        close();
      },
      children: <div>test Modal</div>,
    });
  };

  const list: string[] = ['Success', 'Info', 'Warning', 'Alert', '', 'Permanent'];
  const handleSelected = (value: string) => {
    const level = notificationColorFromValue(value);
    const permanent = value === 'Permanent';
    NotificationMessage.sendMessage('Selected: ' + value, level, permanent);
  };

  // Basic HTML Buttons
  const basicButton1: RefProps = {};
  const basicButton2: RefProps = {};
  const onBasicButtonClick = () => {
    basicButton1.current.disabled = !basicButton1.current.disabled;
    basicButton2.current.disabled = !basicButton2.current.disabled;
  };

  // Lupine Button
  const buttonHook1: ButtonHookProps = {};
  const buttonHook2: ButtonHookProps = {};
  const onButtonClick = () => {
    buttonHook1.setEnabled?.(!buttonHook1.getEnabled?.());
    buttonHook2.setEnabled?.(!buttonHook2.getEnabled?.());
  };
  return (
    <div>
      <div class='row-box mb-s h3 bold'>Basic HTML Buttons</div>
      <div class='row-box mb-s'>
        <button class='button-base button-ss mr-m' onClick={onBasicButtonClick} ref={basicButton1}>
          Button
        </button>
        <button class='button-base button-s mr-m' onClick={onBasicButtonClick} ref={basicButton2}>
          Button
        </button>
        <button class='button-base button-m mr-m' onClick={onBasicButtonClick}>
          Button
        </button>
        <button class='button-base button-l mr-m' onClick={onBasicButtonClick}>
          Button
        </button>
        <button class='button-base button-ll mr-m' onClick={onBasicButtonClick}>
          Button
        </button>
      </div>

      <div class='row-box mb-s h3 bold'>Lupine Buttons</div>
      <div class='row-box mb-s'>
        <Button text='Test 1' size={ButtonSize.SmallLarge} class='mr-m' onClick={onButtonClick} hook={buttonHook1} />
        <Button text='Test 2' size={ButtonSize.Small} class='mr-m' hook={buttonHook2} onClick={onButtonClick} />
        <Button text='Click Me' size={ButtonSize.Medium} class='mr-m' css={{ color: 'red' }} onClick={onButtonClick} />
        <Button text='Button' size={ButtonSize.Large} class='mr-m' onClick={onButtonClick} />
        <Button text='Button' size={ButtonSize.LargeLarge} class='mr-m' onClick={onButtonClick} />
      </div>
    </div>
  );
};

const TestInputs = () => {
  return (
    <div>
      <div class='row-box mb-s h3 bold'>Basic Inputs</div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Input Label:</div>
        <input type='text' class='input-base input-ss' placeholder='Placeholder' />
        <input type='text' class='input-base input-ss' value='Text value' />
      </div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Input Label:</div>
        <input type='text' class='input-base input-s' placeholder='Placeholder' />
        <input type='text' class='input-base input-s' value='Text value' />
      </div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Input Label:</div>
        <input type='text' class='input-base' placeholder='Placeholder' />
        <input type='text' class='input-base' value='Text value' />
      </div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Input Label:</div>
        <input type='text' class='input-base input-l' placeholder='Placeholder' />
        <input type='text' class='input-base input-l' value='Text value' />
      </div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Input Label:</div>
        <input type='text' class='input-base input-ll' placeholder='Placeholder' />
        <input type='text' class='input-base input-ll' value='Text value' />
      </div>

      <div class='row-box mb-s h3 bold'>Readonly / Disabled</div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Readonly:</div>
        <input type='text' class='input-base' placeholder='Placeholder' readonly={true} />
        <input type='text' class='input-base' value='Text value' readonly={true} />
      </div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Disabled:</div>
        <input type='text' class='input-base' placeholder='Placeholder' disabled={true} />
        <input type='text' class='input-base' value='Text value' disabled={true} />
      </div>

      <div class='row-box mb-s h3 bold'>Select</div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Select:</div>
        <select id='menutarget' class='input-base' size={1}>
          <option value='0'>Parent Window</option>
          <option value='1'>New Window</option>
        </select>
      </div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Disabled:</div>
        <select id='menutarget' class='input-base' size={1} disabled={true}>
          <option value='0'>Parent Window</option>
          <option value='1'>New Window</option>
        </select>
      </div>

      <div class='row-box mb-s h3 bold'>Radio</div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Radio box:</div>
        <label class='input-label label-ss pr-m'>
          <input class='input-base input-ss' type='radio' name='itemtype-ss' />
          Text
        </label>

        <label class='input-label label-ss pr-m'>
          <input class='input-base input-ss' type='radio' name='itemtype-ss' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-ss disabled pr-m'>
          <input class='input-base input-ss' type='radio' name='itemtype-ss_rc' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-ss disabled pr-m'>
          <input class='input-base input-ss' type='radio' name='itemtype-ss_rc' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Radio box:</div>
        <label class='input-label label-s pr-m'>
          <input class='input-base input-s' type='radio' name='itemtype-s' />
          Text
        </label>

        <label class='input-label label-s pr-m'>
          <input class='input-base input-s' type='radio' name='itemtype-s' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-s disabled pr-m'>
          <input class='input-base input-s' type='radio' name='itemtype-s_rc' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-s disabled pr-m'>
          <input class='input-base input-s' type='radio' name='itemtype-s_rc' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Radio box:</div>
        <label class='input-label pr-m'>
          <input class='input-base' type='radio' name='itemtype' />
          Text
        </label>

        <label class='input-label pr-m'>
          <input class='input-base' type='radio' name='itemtype' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label disabled pr-m'>
          <input class='input-base' type='radio' name='itemtype_rc' disabled={true} />
          Disabled
        </label>
        <label class='input-label disabled pr-m'>
          <input class='input-base' type='radio' name='itemtype_rc' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Radio box:</div>
        <label class='input-label label-l pr-m'>
          <input class='input-base input-l' type='radio' name='itemtype-l' />
          Text
        </label>

        <label class='input-label label-l pr-m'>
          <input class='input-base input-l' type='radio' name='itemtype-l' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-l disabled pr-m'>
          <input class='input-base input-l' type='radio' name='itemtype-l_rc' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-l disabled pr-m'>
          <input class='input-base input-l' type='radio' name='itemtype-l_rc' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Radio box:</div>
        <label class='input-label label-ll pr-m'>
          <input class='input-base input-ll' type='radio' name='itemtype-ll' />
          Text
        </label>

        <label class='input-label label-ll pr-m'>
          <input class='input-base input-ll' type='radio' name='itemtype-ll' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-ll disabled pr-m'>
          <input class='input-base input-ll' type='radio' name='itemtype-ll_rc' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-ll disabled pr-m'>
          <input class='input-base input-ll' type='radio' name='itemtype-ll_rc' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s h3 bold'>Checkbox</div>
      <div class='row-box mb-s'>
        <div class='pr-m'>Checkbox:</div>
        <label class='input-label label-ss pr-m'>
          <input class='input-base input-ss' type='checkbox' />
          Text
        </label>

        <label class='input-label label-ss pr-m'>
          <input class='input-base input-ss' type='checkbox' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-ss disabled pr-m'>
          <input class='input-base input-ss' type='checkbox' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-ss disabled pr-m'>
          <input class='input-base input-ss' type='checkbox' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Checkbox:</div>
        <label class='input-label label-s pr-m'>
          <input class='input-base input-s' type='checkbox' />
          Text
        </label>

        <label class='input-label label-s pr-m'>
          <input class='input-base input-s' type='checkbox' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-s disabled pr-m'>
          <input class='input-base input-s' type='checkbox' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-s disabled pr-m'>
          <input class='input-base input-s' type='checkbox' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Checkbox:</div>
        <label class='input-label pr-m'>
          <input class='input-base' type='checkbox' />
          Text
        </label>

        <label class='input-label pr-m'>
          <input class='input-base' type='checkbox' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label disabled pr-m'>
          <input class='input-base' type='checkbox' disabled={true} />
          Disabled
        </label>
        <label class='input-label disabled pr-m'>
          <input class='input-base' type='checkbox' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Checkbox:</div>
        <label class='input-label label-l pr-m'>
          <input class='input-base input-l' type='checkbox' />
          Text
        </label>

        <label class='input-label label-l pr-m'>
          <input class='input-base input-l' type='checkbox' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-l disabled pr-m'>
          <input class='input-base input-l' type='checkbox' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-l disabled pr-m'>
          <input class='input-base input-l' type='checkbox' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s'>
        <div class='pr-m'>Checkbox:</div>
        <label class='input-label label-ll pr-m'>
          <input class='input-base input-ll' type='checkbox' />
          Text
        </label>

        <label class='input-label label-ll pr-m'>
          <input class='input-base input-ll' type='checkbox' checked />
          Checked
        </label>

        {/* checkbox and radio don't have readonly attribute */}
        <label class='input-label label-ll disabled pr-m'>
          <input class='input-base input-ll' type='checkbox' disabled={true} />
          Disabled
        </label>
        <label class='input-label label-ll disabled pr-m'>
          <input class='input-base input-ll' type='checkbox' checked disabled={true} />
          Disabled checked
        </label>
      </div>

      <div class='row-box mb-s h3 bold'>Input field</div>
      <div class='row-box mb-s'>
        <div class='input-field w-100p'>
          <input class='input-base w-100p f-subject' type='text' required placeholder=' ' />
          <span>Subject *</span>
        </div>
        <div class='input-field w-100p'>
          <textarea class='input-base w-100p msg-area f-message' required placeholder=' '></textarea>
          <span>Message *</span>
        </div>
      </div>

      <div class='row-box mb-s h3 bold'>List</div>
      <div class='row-box mb-s'>
        <div class='row-box flex-1 mr-m'>
          <div class='list-box'>
            <select class='input-base w-100p h-100p list' id='menulist' size={8}>
              <option value='0	0	0	0	index.php?st_p1=&amp;st_p2=&amp;st_m1=home	Web No Coding Home'>Home</option>
              <option>Help</option>
              <option disabled={true}>Beginners</option>
              <option>----for Beginners</option>
              <option>----Template</option>
            </select>
          </div>
        </div>
        <div class='row-box flex-1'>
          <div class='list-box'>
            <select class='input-base w-100p h-100p list' id='menulist' size={8} disabled={true}>
              <option value='0	0	0	0	index.php?st_p1=&amp;st_p2=&amp;st_m1=home	Web No Coding Home'>Disabled</option>
              <option>Help</option>
              <option>Beginners</option>
              <option>----for Beginners</option>
              <option>----Template</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestComponentPage = () => {
  return (
    <div>
      <div class='row-box mb-s'>
        <TestWindows />
      </div>
      <div class='row-box mb-s'>
        <TestColors />
      </div>
      <div class='row-box mb-s'>
        <TestTextFontSize />
      </div>
      <div class='row-box mb-s'>
        <TestButtons />
      </div>
      <div class='row-box mb-s'>
        <TestInputs />
      </div>

      <div class='row-box mb-s h3 bold'>Toggle Switch</div>
      <div class='row-box mb-s'>
        <ToggleSwitch checked={true} size={ToggleSwitchSize.SmallSmall} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.SmallSmall} />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Small} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Small} />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Medium} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Medium} />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Large} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Large} />
      </div>

      <div class='row-box mb-s h3 bold'>Toggle Switch with text</div>
      <div class='row-box mb-s'>
        <ToggleSwitch
          checked={true}
          size={ToggleSwitchSize.SmallSmall}
          text={{ on: 'On', off: 'Off' }}
          textWidth='50px'
        />
        <ToggleSwitch
          checked={false}
          size={ToggleSwitchSize.SmallSmall}
          text={{ on: 'Enable', off: 'Disable' }}
          textWidth='50px'
        />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Small} text={{ on: 'On', off: 'Off' }} textWidth='50px' />
        <ToggleSwitch
          checked={false}
          size={ToggleSwitchSize.Small}
          text={{ on: 'Enable', off: 'Disable' }}
          textWidth='50px'
        />
        <ToggleSwitch
          checked={true}
          size={ToggleSwitchSize.Medium}
          text={{ on: 'Set', off: 'Not Set' }}
          textWidth='60px'
        />
        <ToggleSwitch
          checked={false}
          size={ToggleSwitchSize.Medium}
          text={{ on: 'Show', off: 'Hide' }}
          textWidth='60px'
        />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Large} text={{ on: 'Yes', off: 'No' }} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Large} text={{ on: 'Up', off: 'Down' }} />
      </div>

      <div class='row-box mb-s h3 bold'>Toggle Switch Disabled</div>
      <div class='row-box mb-s'>
        <ToggleSwitch checked={true} size={ToggleSwitchSize.SmallSmall} disabled={true} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.SmallSmall} disabled={true} />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Small} disabled={true} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Small} disabled={true} />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Medium} disabled={true} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Medium} disabled={true} />
        <ToggleSwitch checked={true} size={ToggleSwitchSize.Large} disabled={true} />
        <ToggleSwitch checked={false} size={ToggleSwitchSize.Large} disabled={true} />
      </div>
    </div>
  );
};
