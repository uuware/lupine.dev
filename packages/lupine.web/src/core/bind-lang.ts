import { DomUtils } from '../lib';
import { getEitherCookie } from './server-cookie';

// The FE only loads one language for the consideration of the size

export const defaultLangName = 'en';
export const langCookieName = 'lang';
export const updateLangEventName = 'updateLang';
const _langCfg: any = { defaultLang: defaultLangName, langs: {} };
export type OneLangProps = { [key: string]: string };
export const bindLang = (defaultLang: string, langs: OneLangProps) => {
  _langCfg.defaultLang = defaultLang;
  _langCfg.langs = langs;

  // set to cookie
  getCurrentLang();
};

export const getCurrentLang = () => {
  let langName = getEitherCookie(langCookieName) as string;
  if (!langName || !_langCfg.langs[langName]) {
    langName = _langCfg.defaultLang;
    if (typeof window !== 'undefined') {
      DomUtils.setCookie(langCookieName, _langCfg.defaultLang);
    }
  }
  return { langName, langs: _langCfg.langs };
};

// the FE needs to reload the page when the language is changed
export const updateLang = (langName: string) => {
  // Lang is only updated in Browser
  _langCfg.defaultLang = langName;
  if (typeof window === 'undefined') {
    return;
  }

  DomUtils.setCookie(langCookieName, langName);
  // document.documentElement.setAttribute(langAttributeName, langName);

  // // update lang for all iframe
  // const allIframe = document.querySelectorAll('iframe');
  // for (let i = 0; i < allIframe.length; i++) {
  //   if (allIframe[i].contentWindow && allIframe[i].contentWindow!.top === window) {
  //     allIframe[i].contentWindow!.document.documentElement.setAttribute(langAttributeName, langName);
  //   }
  // }

  const event = new CustomEvent(updateLangEventName, { detail: langName });
  window.dispatchEvent(event);
};
