import { CssProps } from 'lupine.web';

export type BlockGridProps = {};
export const BlockGrid = (props: BlockGridProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    '>div': {
      width: '33.33%',
    },
  };

  return (
    <div css={css} class='block-item grid'>
      <div contentEditable={true}>design block one</div>
      <div contentEditable={true}>design block two</div>
      <div contentEditable={true}>design block three</div>
    </div>
  );
};
