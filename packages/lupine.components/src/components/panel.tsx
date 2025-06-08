import { CssProps } from '../jsx';

export type PanelProps = {
  children: any;
  className?: string;
  css?: CssProps;
};

export const Panel = ({ children, className, css }: PanelProps) => {
  const newCss: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    ...css,
  };

  return (
    <div css={newCss} class={['panel-box', className].join(' ')}>
      {children}
    </div>
  );
};
