import { CssProps } from '../jsx';
import { DomUtils } from '../lib';
import { getEitherCookie } from './server-cookie';

// theme doesn't need to reset, theme name is stored in cookie

export const defaultThemeName = 'light';
export const themeCookieName = 'theme';
export const updateThemeEventName = 'updateTheme';
export const themeAttributeName = 'data-theme';
const _themeCfg: any = { defaultTheme: defaultThemeName, themes: {} };
export const bindTheme = (defaultTheme: string, themes: { [key: string]: CssProps }) => {
  _themeCfg.defaultTheme = defaultTheme;
  _themeCfg.themes = themes;

  // set to cookie
  getCurrentTheme();
};

export const getCurrentTheme = () => {
  let themeName = getEitherCookie(themeCookieName) as string;
  if (!themeName || !_themeCfg.themes[themeName]) {
    themeName = _themeCfg.defaultTheme;
    if (typeof window !== 'undefined') {
      DomUtils.setCookie(themeCookieName, _themeCfg.defaultTheme);
    }
  }
  return { themeName, themes: _themeCfg.themes as { [key: string]: CssProps } };
};

export const updateTheme = (themeName: string) => {
  // Theme is only updated in Browser
  _themeCfg.defaultTheme = themeName;
  if (typeof window === 'undefined') {
    return;
  }

  DomUtils.setCookie(themeCookieName, themeName);
  document.documentElement.setAttribute(themeAttributeName, themeName);

  // update theme for all iframe
  const allIframe = document.querySelectorAll('iframe');
  for (let i = 0; i < allIframe.length; i++) {
    if (allIframe[i].contentWindow && allIframe[i].contentWindow!.top === window) {
      allIframe[i].contentWindow!.document.documentElement.setAttribute(themeAttributeName, themeName);
    }
  }

  const event = new CustomEvent(updateThemeEventName, { detail: themeName });
  window.dispatchEvent(event);
};
