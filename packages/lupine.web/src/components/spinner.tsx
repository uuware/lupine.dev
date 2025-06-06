export enum SpinnerSize {
  Small = '22px',
  Medium = '30px',
  Large = '40px',
  LargeLarge = '60px',
}
export const Spinner01 = ({
  size = SpinnerSize.Medium,
  color = 'var(--primary-color)',
}: {
  size?: SpinnerSize;
  color?: string;
}) => {
  const borderWidth =
    size === SpinnerSize.Small || size === SpinnerSize.Medium ? '4px' : size === SpinnerSize.Large ? '6px' : '9px';
  const css: any = {
    width: size,
    aspectRatio: 1,
    borderRadius: '50%',
    background: `radial-gradient(farthest-side,${color} 94%,#0000) top/8px 8px no-repeat, conic-gradient(#0000 30%,${color})`,
    '-webkit-mask': `radial-gradient(farthest-side,#0000 calc(100% - ${borderWidth}),#000 0)`,
    animation: 'spinner01 1s infinite linear',
    '@keyframes spinner01': {
      '100%': { transform: 'rotate(1turn)' },
    },
  };
  return <div css={css}></div>;
};

export const Spinner02 = ({
  size = SpinnerSize.Medium,
  color = 'var(--primary-color)',
}: {
  size?: SpinnerSize;
  color?: string;
}) => {
  const base = parseInt(size.replace('px', ''));
  const ballSize = Array.from({ length: 7 }, (_, i) => `${i * base / 15 / 7}px`);
  const css: any = {
    width: size,
    height: size,
    display: 'flex',
    placeItems: 'center',
    justifyContent: 'center',
    '.spinner02-box': {
      '--spin02-w': `${base / 2 - 3}px`,
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      color,
      boxShadow: `
    calc(1*var(--spin02-w))      calc(0*var(--spin02-w))      0 0,
    calc(0.707*var(--spin02-w))  calc(0.707*var(--spin02-w))  0 ${ballSize[1]},
    calc(0*var(--spin02-w))      calc(1*var(--spin02-w))      0 ${ballSize[2]},
    calc(-0.707*var(--spin02-w)) calc(0.707*var(--spin02-w))  0 ${ballSize[3]},
    calc(-1*var(--spin02-w))     calc(0*var(--spin02-w))      0 ${ballSize[4]},
    calc(-0.707*var(--spin02-w)) calc(-0.707*var(--spin02-w)) 0 ${ballSize[5]},
    calc(0*var(--spin02-w))      calc(-1*var(--spin02-w))     0 ${ballSize[6]}`,
      animation: 'spinner02 1s infinite steps(8)',
    },
    '@keyframes spinner02': {
      '100%': { transform: 'rotate(1turn)' },
    },
  };
  return (
    <div css={css}>
      <div class='spinner02-box'></div>
    </div>
  );
};

// color should be space splited RGB colors
export const Spinner03 = ({ size = SpinnerSize.Medium, colorRGB = '55 55 55' }: { size?: SpinnerSize; colorRGB?: string }) => {
  const css: any = {
    width: size,
    height: size,
    aspectRatio: 1,
    display: 'grid',
    borderRadius: '50%',
    background: `linear-gradient(0deg, rgb(${colorRGB} / 50%) 30%, #0000 0 70%, rgb(${colorRGB} / 100%) 0) 50% / 8% 100%, linear-gradient(90deg, rgb(${colorRGB} / 25%) 30%, #0000 0 70%, rgb(${colorRGB} / 75%) 0) 50% / 100% 8%`,
    backgroundRepeat: 'no-repeat',
    animation: 'spinner03 1s infinite steps(12)',
    '&::before, &::after': {
      content: '""',
      gridArea: '1/1',
      borderRadius: '50%',
      background: 'inherit',
      opacity: 0.915,
      transform: 'rotate(30deg)',
    },
    '&::after': {
      opacity: 0.83,
      transform: 'rotate(60deg)',
    },
    '@keyframes spinner03': {
      '100%': { transform: 'rotate(1turn)' },
    },
  };
  return <div css={css}></div>;
};
