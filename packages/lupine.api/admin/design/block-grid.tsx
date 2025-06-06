import { CssProps } from 'lupine.web';
import { DesignBlockBox } from './design-block-box';
import { BlockTitle } from './block-title';

export type BlockGridProps = {};
export const BlockGrid = (props: BlockGridProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    margin: '10px 0 0 0',
    '>div': {
      width: '-webkit-fill-available',
    },
    '&.drag-over': {
      backgroundColor: 'red',
    },
    '&:not(:has(div))': {
      padding: '10px',
    },
  };

  return (
    <div css={css} class='design-container grid'>
      <DesignBlockBox id='1'>
        <BlockTitle>design block 1</BlockTitle>
      </DesignBlockBox>
      <DesignBlockBox id='2'>
        <BlockTitle>design block 2</BlockTitle>
      </DesignBlockBox>
      <DesignBlockBox id='3'>
        <BlockTitle>design block 3</BlockTitle>
      </DesignBlockBox>
    </div>
  );
};
