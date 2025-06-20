import { setCookie } from '../lib/cookie';
import { ThemesProps } from '../models';
import { isFrontEnd } from '../lib/is-frontend';
import { getEitherCookie } from './server-cookie';

// theme doesn't need to reset, theme name is stored in cookie

export const defaultThemeName = 'light';
export const themeCookieName = 'theme';
export const updateThemeEventName = 'updateTheme';
export const themeAttributeName = 'data-theme';
const _themeCfg: { defaultTheme: string; themes: ThemesProps } = { defaultTheme: defaultThemeName, themes: {} };
export const bindTheme = (defaultTheme: string, themes: ThemesProps) => {
  _themeCfg.defaultTheme = defaultTheme;
  _themeCfg.themes = themes;

  // set to cookie
  getCurrentTheme();
};

export const getCurrentTheme = () => {
  let themeName = getEitherCookie(themeCookieName) as string;
  if (!themeName || !_themeCfg.themes[themeName]) {
    themeName = _themeCfg.defaultTheme;
    if (isFrontEnd()) {
      setCookie(themeCookieName, _themeCfg.defaultTheme);
    }
  }
  return { themeName, themes: _themeCfg.themes };
};

export const updateTheme = (themeName: string) => {
  // Theme is only updated in Browser
  _themeCfg.defaultTheme = themeName;
  if (!isFrontEnd()) {
    return;
  }

  setCookie(themeCookieName, themeName);
  document.documentElement.setAttribute(themeAttributeName, themeName);

  // update theme for all iframe
  // TODO: third-party domains?
  const allIframe = document.querySelectorAll('iframe');
  for (let i = 0; i < allIframe.length; i++) {
    if (allIframe[i].contentWindow && allIframe[i].contentWindow!.top === window) {
      allIframe[i].contentWindow!.document.documentElement.setAttribute(themeAttributeName, themeName);
    }
  }

  const event = new CustomEvent(updateThemeEventName, { detail: themeName });
  window.dispatchEvent(event);
};
