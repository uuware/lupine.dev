import { CssProps, RefProps, VNode } from 'lupine.web';

export const PlayButtonSize = {
  Small: { w: 50, h: 50 },
  Medium: { w: 70, h: 70 },
  Large: { w: 90, h: 90 },
};
export type PlayButtonSizeProps = {
  w: number;
  h: number;
};
export type PlayButtonProps = {
  size: PlayButtonSizeProps;
  disabled?: boolean;
  checked?: boolean;
  onClick?: (checked: boolean) => void;
  hook?: ToggleBaseHookProps;
};
export const PlayButton = (props: PlayButtonProps) => {
  const css: CssProps = {
    width: `100%`,
    height: `100%`,
    borderRadius: '50%',
    backgroundColor: '#3b29cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '.play-icon': {
      width: '50%',
      height: '50%',
      transition: 'all 0.2s ease-in-out',
      backgroundColor: '#fff',
      cursor: 'pointer',
    },
    '&.toggle-off .play-icon': {
      clipPath: 'polygon(20% 0, 20% 100%, 90% 50%, 90% 50%, 90% 50%, 90% 50%, 90% 50%, 90% 50%, 90% 50%)',
      translate: '6% 0',
    },
    '&.toggle-on .play-icon': {
      clipPath: 'polygon(0 0, 0 100%, 33.33% 100%, 33.33% 0, 66.66% 0, 100% 0, 100% 100%, 66.66% 100%, 66.66% 0)',
      translate: '0 0',
    },
    '&.disabled': {
      cursor: 'not-allowed',
      backgroundColor: '#5d578b',
    },
  };
  return (
    <ToggleBase {...props}>
      <ToggleWaveFrame>
        <div
          css={css}
          class={`toggle-button-component toggle-placeholder ${props.checked ? 'toggle-on' : 'toggle-off'}${
            props.disabled ? ' disabled' : ''
          }`}
        >
          <div class='play-icon'></div>
        </div>
      </ToggleWaveFrame>
    </ToggleBase>
  );
};

export type ToggleButtonProps = {
  size: ToggleBaseSizeProps;
  onText: string;
  offText: string;
  disabled?: boolean;
  checked?: boolean;
  onClick?: (checked: boolean) => void;
  hook?: ToggleBaseHookProps;
};
export const ToggleButton = (props: ToggleButtonProps) => {
  const css: CssProps = {
    // width: `${props.size + 5}px`,
    // height: `${props.size + 5}px`,
    '&.disabled': {
      cursor: 'not-allowed',
    },
    '&.toggle-on .on, &.toggle-off .off': {
      display: 'block',
    },
    '&.toggle-on .off, &.toggle-off .on': {
      display: 'none',
    },
  };
  return (
    <ToggleBase {...props}>
      <div
        css={css}
        class={`toggle-button-component toggle-placeholder ${props.checked ? 'toggle-on' : 'toggle-off'}${
          props.disabled ? ' disabled' : ''
        }`}
      >
        <div class='on'>{props.onText}</div>
        <div class='off'>{props.offText}</div>
      </div>
    </ToggleBase>
  );
};

export type ToggleWaveFrameProps = {
  children: VNode<any>;
};
export const ToggleWaveFrame = (props: ToggleWaveFrameProps) => {
  const css: CssProps = {
    width: `100%`,
    height: `100%`,
    '@keyframes pulse-border': {
      '0%': {
        transform: 'scale(0.6)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(1)',
        opacity: 0,
      },
    },
    '.toggle-waves': {
      position: 'absolute',
      width: `100%`,
      height: `100%`,
      top: '-0',
      left: '0',
      borderRadius: '50%',
      backgroundColor: '#eb205580',
      opacity: 0,
      zIndex: -1,
      animation: 'pulse-border 3s ease-in-out infinite',
    },
    '.toggle-waves-1': {
      '-webkit-animation-delay': '0s',
      'animation-delay': '0s',
    },

    '.toggle-waves-2': {
      '-webkit-animation-delay': '1s',
      'animation-delay': '1s',
    },

    '.toggle-waves-3': {
      '-webkit-animation-delay': '2s',
      'animation-delay': '2s',
    },
    '.toggle-waves-box': {
      width: `100%`,
      height: `100%`,
      padding: `18%`,
    },
    '&.disabled .toggle-waves': {
      backgroundColor: '#5d578b',
    },
  };
  return (
    <div css={css} class='toggle-waves-box toggle-placeholder'>
      <div class='toggle-waves toggle-waves-1'></div>
      <div class='toggle-waves toggle-waves-2'></div>
      <div class='toggle-waves toggle-waves-3'></div>
      <div class='toggle-waves-box'>{props.children}</div>
    </div>
  );
};

export const ToggleBaseSize = {
  Small: { w: 30, h: 30 },
  Medium: { w: 50, h: 50 },
  Large: { w: 70, h: 70 },
};
export type ToggleBaseSizeProps = {
  w: number | string;
  h: number | string;
};
export type ToggleBaseHookProps = {
  setChecked?: (checked: boolean) => void;
  getChecked?: () => boolean;
  setEnabled?: (enabled: boolean) => void;
  getEnabled?: () => boolean;
};
export type ToggleBaseProps = {
  size: ToggleBaseSizeProps;
  disabled?: boolean;
  checked?: boolean;
  onClick?: (checked: boolean) => void;
  hook?: ToggleBaseHookProps;
  children: VNode<any>;
};
export const ToggleBase = (props: ToggleBaseProps) => {
  const applyToggle = (checked: boolean, disabled: boolean) => {
    const childDom = ref.$all('.toggle-base-container .toggle-placeholder');
    childDom.forEach((dom: HTMLElement) => {
      dom.classList.toggle('toggle-on', checked);
      dom.classList.toggle('toggle-off', !checked);
      dom.classList.toggle('disabled', disabled);
    });
  };
  let disabled = props.disabled || false;
  const ref: RefProps = {
    onLoad: async (el: Element) => {
      applyToggle(props.checked || false, disabled);
    },
  };
  const onClick = (e: MouseEvent) => {
    if (disabled) {
      return;
    }

    const checked = (e.target as HTMLInputElement).checked;
    applyToggle(checked, disabled);
    if (props.onClick) {
      props.onClick(checked);
    }
  };
  if (props.hook) {
    props.hook.setChecked = (checked: boolean) => {
      (ref.$('input.toggle-base-checkbox') as HTMLInputElement).checked = checked;
      applyToggle(checked, disabled);
    };
    props.hook.getChecked = () => {
      return (ref.$('input.toggle-base-checkbox') as HTMLInputElement).checked;
    };
    props.hook.setEnabled = (enabled: boolean) => {
      disabled = !enabled;
      const dom = ref.$('input.toggle-base-checkbox') as HTMLInputElement;
      dom.disabled = disabled;
      applyToggle(dom.checked, disabled);
    };
    props.hook.getEnabled = () => {
      return !disabled;
    };
  }

  const css: CssProps = {
    width: `${typeof props.size.w === 'number' ? props.size.w + 'px' : props.size.w}`,
    height: `${typeof props.size.h === 'number' ? props.size.h + 'px' : props.size.h}`,
    '.toggle-base-box, .toggle-base-container': {
      position: 'relative',
      width: `100%`,
      height: `100%`,
    },
    '.toggle-base-checkbox': {
      opacity: 0,
      position: 'absolute',
      pointerEvents: 'none',
    },
  };
  return (
    <div ref={ref} css={css} class='toggle-base-component'>
      <label class='toggle-base-box'>
        <div class='toggle-base-container'>{props.children}</div>
        <input
          type='checkbox'
          class='toggle-base-checkbox'
          checked={props.checked || false}
          disabled={disabled}
          onClick={onClick}
        />
      </label>
    </div>
  );
};
