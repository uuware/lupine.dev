import { CssProps } from '../jsx';

export type SelectOptionProps = {
  option: string;
  value: string;
  selected?: boolean;
};
export const SelectWithTitle = (
  title: string,
  options: SelectOptionProps[],
  onOptionChanged: (option: string) => void,
  size?: number,
  className = 'input-base',
  width = '100%',
) => {
  const css: CssProps = {
    select: {
      height: 'auto',
      overflowY: 'auto',
      width,
    },
  };
  return (
    <div css={css}>
      <div>{title}</div>
      <div>
        <select class={className} onChange={(e: any) => onOptionChanged(e?.target?.value)} size={size}>
          {options.map((option) => (
            <option value={option.value} selected={option.selected}>
              {option.option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
