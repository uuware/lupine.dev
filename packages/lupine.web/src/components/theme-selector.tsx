import { bindGlobalStyles, getCurrentTheme, updateTheme } from '../core';
import { CssProps } from '../jsx';
import { ContentPosition } from '../types';
import { PopupMenu } from './popup-menu';

export type ThemeSelectorProps = {
  className?: string;
  contentPosition?: ContentPosition;
  css?: CssProps;
};

export const ThemeSelector = ({ className, css }: ThemeSelectorProps) => {
  const newCss: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'end',
    // justifyContent: ContentPosition.center,
    ...css,
  };

  bindGlobalStyles('theme-switch', '.theme-switch', newCss);
  const handleSelected = (themeName: string) => {
    updateTheme(themeName);
  };
  const currentTheme = getCurrentTheme();
  const list = [];
  for (let themeName in currentTheme.themes) {
    list.push(themeName);
  }
  return (
    <div css={newCss} class={['theme-switch', className].join(' ')} title='Select theme'>
      <PopupMenu list={list} defaultValue={currentTheme.themeName} handleSelected={handleSelected}></PopupMenu>
    </div>
  );
};
