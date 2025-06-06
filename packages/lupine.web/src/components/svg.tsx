// this is not a good approach because if one svg file is used in multiple places
// then the svg string will be rendered multiple times.
export const Svg = ({
  children,
  width,
  height,
  color,
}: {
  children: string;
  width?: string;
  height?: string;
  color?: string;
}) => {
  const css: any = {
    svg: {
      maxWidth: '100%',
      maxHeight: '100%',
      width,
      height,
      fill: color,
    },
  };
  return <div css={css}>{children}</div>;
};
