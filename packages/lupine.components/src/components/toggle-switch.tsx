import { bindGlobalStyles, CssProps } from 'lupine.web';
import { ToggleBase, ToggleBaseHookProps } from './toggle-base';

export enum ToggleSwitchSize {
  SmallSmall = 'smallsmall',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}
export type ToggleSwitchProps = {
  size: ToggleSwitchSize;
  text?: { on: string; off: string };
  textWidth?: string;
  disabled?: boolean;
  checked?: boolean;
  onClick?: (checked: boolean) => void;
  hook?: ToggleBaseHookProps;
};
export const ToggleSwitch = (props: ToggleSwitchProps) => {
  const sizeH =
    props.size === ToggleSwitchSize.SmallSmall
      ? 16
      : props.size === ToggleSwitchSize.Small
      ? 22
      : props.size === ToggleSwitchSize.Large
      ? 42
      : 34;
  const cssSize =
    props.size === ToggleSwitchSize.SmallSmall
      ? 'smallsmall'
      : props.size === ToggleSwitchSize.Small
      ? 'small'
      : props.size === ToggleSwitchSize.Large
      ? 'large'
      : '';

  const css: CssProps = {
    width: `100%`,
    height: `100%`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .ts-slider': {
      position: 'relative',
      cursor: 'pointer',
      backgroundColor: 'var(--toggle-background-color, #c7c7c7)',
      transition: '.4s',
      borderRadius: '34px',
      height: '100%',
      display: 'flex',
      padding: '0 27px 0 37px',
      alignItems: 'center',
    },
    '&.smallsmall .ts-slider': {
      padding: '0 8px 0 22px',
      fontSize: '0.65rem',
    },
    '&.small .ts-slider': {
      padding: '0 17px 0 27px',
      fontSize: '0.85rem',
    },
    '&.large .ts-slider': {
      padding: '0 37px 0 57px',
    },

    '& .ts-slider .ts-circle': {
      position: 'absolute',
      content: '',
      height: '26px',
      width: '26px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'var(--toggle-ball-color, #fff)',
      transition: '.4s',
      borderRadius: '50%',
    },
    '&.smallsmall .ts-slider .ts-circle': {
      height: '12px',
      width: '12px',
      left: '2px',
      bottom: '2px',
    },
    '&.small .ts-slider .ts-circle': {
      height: '18px',
      width: '18px',
      left: '3px',
      bottom: '2px',
    },
    '&.large .ts-slider .ts-circle': {
      height: '38px',
      width: '38px',
      left: '4px',
      bottom: '2px',
    },

    '& .ts-on-text, & .ts-off-text': {
      display: 'none',
      width: props.textWidth,
    },
    '&.toggle-on .ts-on-text': {
      display: 'block',
    },
    '&.toggle-off .ts-off-text': {
      display: 'block',
    },

    '&.toggle-on .ts-slider': {
      backgroundColor: 'var(--primary-accent-color, #0a74c9)',
      padding: '0 47px 0 17px',
    },
    '&.smallsmall.toggle-on .ts-slider': {
      padding: '0 18px 0 12px',
    },
    '&.small.toggle-on .ts-slider': {
      padding: '0 27px 0 17px',
    },
    '&.large.toggle-on .ts-slider': {
      padding: '0 72px 0 22px',
    },

    '&.toggle-on .ts-slider .ts-circle': {
      left: 'unset',
      right: '3px',
    },
    '&.disabled .ts-slider': {
      cursor: 'not-allowed',
      opacity: 'var(--primary-disabled-opacity)',
    },
  };

  // this is a sample to add variables for a theme
  const cssTheme: CssProps = {
    '[data-theme="dark" i]': {
      '--toggle-ball-color': '#000000',
      '--toggle-background-color': '#262626',
    },
  };

  bindGlobalStyles('toggle-switch-theme', '', cssTheme);
  return (
    <ToggleBase {...props} size={{ w: 'auto', h: sizeH }}>
      <div
        css={css}
        class={`toggle-switch-component toggle-placeholder ${props.checked ? 'toggle-on' : 'toggle-off'}${
          props.disabled ? ' disabled' : ''
        } ${cssSize}`}
      >
        <span class='ts-slider'>
          <span class='ts-on-text'>{props.text?.on}</span>
          <span class='ts-circle'></span>
          <span class='ts-off-text'>{props.text?.off}</span>
        </span>
      </div>
    </ToggleBase>
  );
};
