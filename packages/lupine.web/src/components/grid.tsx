export const Grid = ({ gridOption }: { gridOption: any }) => {
  const cssContainer: any = {
    display: 'grid',
    ...gridOption.options,
  };
  const cells: any = [];
  gridOption.cells.forEach((cell: any, index: number) => {
    const name = cell.name || 'cell' + index;
    cssContainer[`.${name}`] = cell.option;
    cells.push(<div class={name}>{cell.component}</div>);
  });
  const className = 'grid-box' + (gridOption.className ? ` ${gridOption.className}` : '');
  return (
    <div css={cssContainer} class={className}>
      {cells}
    </div>
  );
};
