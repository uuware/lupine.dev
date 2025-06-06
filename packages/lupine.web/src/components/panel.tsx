import { CssProps, JSXInternal } from '../jsx';
import { ContentPosition, Position } from '../types';

export type PanelProps = {
  children: any;
  className?: string;
  contentPosition?: ContentPosition;
  css?: CssProps;
};

export const Panel = ({ children, className, css }: PanelProps) => {
  const newCss: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: ContentPosition.center,
    ...css,
  };

  return (
    <div css={newCss} class={['panel-box', className].join(' ')}>
      {children}
    </div>
  );
};
