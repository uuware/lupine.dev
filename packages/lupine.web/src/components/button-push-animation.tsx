import { CssProps, RefProps } from 'lupine.web';

export enum ButtonPushAnimationSize {
  SmallSmall = 'button-ss',
  Small = 'button-s',
  Medium = 'button-m',
  Large = 'button-l',
  LargeLarge = 'button-ll',
}
export type ButtonPushAnimationHookProps = {
  setEnabled?: (enabled: boolean) => void;
  getEnabled?: () => boolean;
};
export type ButtonPushAnimationProps = {
  text: string;
  size: ButtonPushAnimationSize;
  disabled?: boolean;
  onClick?: () => void;
  hook?: ButtonPushAnimationHookProps;
  class?: string;
  css?: CssProps;
};
export const ButtonPushAnimation = (props: ButtonPushAnimationProps) => {
  let disabled = props.disabled || false;
  const onClick = () => {
    if (disabled) {
      return;
    }
    if (props.onClick) {
      props.onClick();
    }
  };
  if (props.hook) {
    props.hook.setEnabled = (enabled: boolean) => {
      disabled = !enabled;
      ref.current.disabled = disabled;
    };
    props.hook.getEnabled = () => {
      return !disabled;
    };
  }

  const ref: RefProps = {};
  const css: CssProps = {
    all: 'unset',
    cursor: 'pointer',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
    position: 'relative',
    borderRadius: 'var(--border-radius-m)',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    boxShadow: '-0.15em -0.15em 0.15em -0.075em rgba(5, 5, 5, 0.25), 0.0375em 0.0375em 0.0675em 0 rgba(5, 5, 5, 0.1)',
    '.button-outer': {
      position: 'relative',
      zIndex: 1,
      borderRadius: 'inherit',
      transition: 'box-shadow 300ms ease',
      willChange: 'box-shadow',
      boxShadow: '0 0.05em 0.05em -0.01em rgba(5, 5, 5, 1), 0 0.01em 0.01em -0.01em rgba(5, 5, 5, 0.5), 0.15em 0.3em 0.1em -0.01em rgba(5, 5, 5, 0.25)',
    },
    '.button-inner': {
      position: 'relative',
      zIndex: 2,
      borderRadius: 'inherit',
      padding: 'var(--button-padding)',
      background: 'linear-gradient(135deg, #ffffff, #eeeeee)',
      transition: 'box-shadow 300ms ease, background-image 250ms ease, transform 250ms ease;',
      willChange: 'box-shadow, background-image, transform',
      overflow: 'clip',
      // clipPath: 'inset(0 0 0 0 round 999vw)',
      boxShadow: '0 0 0 0 inset rgba(5, 5, 5, 0.1), -0.05em -0.05em 0.05em 0 inset rgba(5, 5, 5, 0.25), 0 0 0 0 inset rgba(5, 5, 5, 0.1), 0 0 0.05em 0.2em inset rgba(255, 255, 255, 0.25), 0.025em 0.05em 0.1em 0 inset rgba(255, 255, 255, 1), 0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25), -0.075em -0.25em 0.25em 0.1em inset rgba(5, 5, 5, 0.25)',
    },
    '.button-inner span': {
      position: 'relative',
      zIndex: 4,
      // fontFamily: 'Inter, sans-serif',
      letterSpacing: '-0.05em',
      // fontWeight: 500,
      color: 'rgba(0, 0, 0, 0);',
      backgroundImage: 'linear-gradient(135deg, rgba(25, 25, 25, 1), rgba(75, 75, 75, 1))',
      backgroundClip: 'text',
      transition: 'transform 250ms ease',
      display: 'block',
      willChange: 'transform',
      textShadow: 'rgba(0, 0, 0, 0.1) 0 0 0.1em',
      userSelect: 'none',
    },
    '&.button-ss': {
      borderRadius: '2px',
    },
    '&.button-s': {
      borderRadius: '3px',
    },
    '&.button-l': {
      borderRadius: '6px',
    },
    '&.button-ll': {
      borderRadius: '10px',
    },
    '&.button-ss .button-inner': {
      padding: '0.1rem 0.3rem',
      fontSize: '0.65rem',
    },
    '&.button-s .button-inner': {
      padding: '0.2rem 0.5rem',
      fontSize: '0.85rem',
    },
    '&.button-l .button-inner': {
      padding: '0.4rem 1.2rem',
      fontSize: '1.5rem',
    },
    '&.button-ll .button-inner': {
      padding: '0.5rem 1.5rem',
      fontSize: '2rem',
    },
    '&:active .button-outer': {
      boxShadow: '0 0 0 0 rgba(5, 5, 5, 1), 0 0 0 0 rgba(5, 5, 5, 0.5), 0 0 0 0 rgba(5, 5, 5, 0.25)',
    },
    '&:active .button-inner': {
      boxShadow: '0.1em 0.15em 0.05em 0 inset rgba(5, 5, 5, 0.75), -0.025em -0.03em 0.05em 0.025em inset rgba(5, 5, 5, 0.5), 0.25em 0.25em 0.2em 0 inset rgba(5, 5, 5, 0.5), 0 0 0.05em 0.5em inset rgba(255, 255, 255, 0.15), 0 0 0 0 inset rgba(255, 255, 255, 1), 0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25), -0.075em -0.12em 0.2em 0.1em inset rgba(5, 5, 5, 0.25)',
    },
    '&:hover .button-inner': {
      transform: 'scale(0.99)',
    },
    '&:hover .button-inner span': {
      transform: 'scale(0.975)',
    },
    ...props.css,
  };
  return (
    <button ref={ref} css={css} class={['button-push-animation', props.size, props.class].join(' ')} disabled={disabled} onClick={onClick}>
      <div class="button-outer">
        <div class="button-inner">
          <span>{props.text}</span>
        </div>
      </div>
    </button>
  );
};
