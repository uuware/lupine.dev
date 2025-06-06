import { CssProps, RefProps } from 'lupine.web';

export enum ButtonSize {
  SmallLarge = 'button-ss',
  Small = 'button-s',
  Medium = 'button-m',
  Large = 'button-l',
  LargeLarge = 'button-ll',
}
export type ButtonHookProps = {
  setEnabled?: (enabled: boolean) => void;
  getEnabled?: () => boolean;
};
export type ButtonProps = {
  text: string;
  size: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  hook?: ButtonHookProps;
  class?: string;
  css?: CssProps;
};
export const Button = (props: ButtonProps) => {
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
  return (
    <button
      ref={ref}
      class={['button-base', props.size, props.class].join(' ')}
      css={props.css}
      disabled={disabled}
      onClick={onClick}
    >
      {props.text}
    </button>
  );
};
