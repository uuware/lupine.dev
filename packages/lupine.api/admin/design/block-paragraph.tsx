import { ComponentChildren, CssProps } from 'lupine.web';
import { DesignBlockBox } from './design-block-box';

export type BlockGridProps = {
  children: ComponentChildren;
};
export const BlockParagraph = (props: BlockGridProps) => {
  const css: CssProps = {
    // width: '100%',
    fontSize: 'var(--font-size-paragraph)',
    margin: '8px 16px',
  };

  return (
    <div css={css} class='block-paragraph'>
      {props.children}
    </div>
  );
};
