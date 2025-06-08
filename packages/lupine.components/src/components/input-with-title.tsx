// used in MessageBox.show
export const InputWithTitle = (
  title: string,
  defaultValue: string,
  onInputChanged?: (option: string) => void,
  onInputInputed?: (option: string) => void,
  className = 'input-base',
  width = '100%',
) => {
  return (
    <div>
      <div>{title}</div>
      <div>
        <input
          class={className}
          style={{ width }}
          onChange={(e: any) => onInputChanged?.(e?.target?.value)}
          onInput={(e: any) => onInputInputed?.(e?.target?.value)}
          value={defaultValue}
        />
      </div>
    </div>
  );
};
