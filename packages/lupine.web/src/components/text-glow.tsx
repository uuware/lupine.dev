import { CssProps } from '../jsx';

export type TextGlowProps = {
  text: string;
  color?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
};
export const TextGlow = (props: TextGlowProps) => {
  const css: CssProps = {
    width: `100%`,
    height: `100%`,
    textAlign: 'center',
    color: props.color || '#22b8ff',
    padding: props.padding || '10px',
    fontSize: props.fontSize || '30px',
    fontWeight: props.fontWeight || '500',
    '.text-glow': {
      animation: 'text-glow-a 1.5s infinite alternate',
    },
    '@keyframes text-glow-a': {
      '0%': {
        textShadow: '0 0 5px #ff005e, 0 0 10px #ff005e, 0 0 20px #ff005e, 0 0 40px #ff005e, 0 0 80px #ff005e',
      },
      '100%': {
        textShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #00d4ff, 0 0 160px #00d4ff',
      },
    },
  };
  return (
    <div css={css} class='text-glow-top'>
      <div class='text-glow'>{props.text}</div>
    </div>
  );
};
