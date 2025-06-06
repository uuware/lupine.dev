import { deepMerge, Logger } from '../lib';
import { apiLangEn } from './api-lang-en';
import { LangProps, OneLangProps } from './lang-props';
import { apiCache } from '../api';
import { apiLangZhCn } from './api-lang-zh-cn';

/*
This module only provides server-side multi-language support.

language code: https://www.andiamo.co.uk/resources/iso-language-codes/
English: en, Chinese (PRC): zh-cn, Chinese (Hong Kong): zh-hk, Chinese (Taiwan): zh-tw, Japanese: ja, Korean: ko


Multi-language reason:
This framework may be used for Chinese or English projects, but to keep only one code, the underlying framework needs to return messages, pages, and other content when called.
Before the call, a message list needs to be set up. The underlying framework returns the message corresponding to the language based on the key.
*/
export class LangHelper {
  private static instance: LangHelper;
  private logger = new Logger('lang-helper');
  private langs: LangProps = {};

  private constructor() {
    this.addLang(apiLangEn);
    this.addLang(apiLangZhCn);
  }

  public static getInstance(): LangHelper {
    if (!LangHelper.instance) {
      LangHelper.instance = new LangHelper();
    }
    return LangHelper.instance;
  }

  // 'My name is {name}' -> getLang('my_name_is', { name: 'John' })
  public getLang(key: string, params?: { [key: string]: string | number | boolean }) {
    return this.getLangWithLangName(key, apiCache.getLang(), '', params);
  }

  public getLangWithLangName(
    key: string,
    langName = '',
    defaultLang = '',
    params?: { [key: string]: string | number | boolean }
  ) {
    if (!langName) {
      // if lang is not set, this should be called in a request
      langName = apiCache.getLang();
    }
    const oneLang = this.langs[langName];
    if (!oneLang || !oneLang.langs[key]) {
      this.logger.warn(`Lang not found: ${langName}`);
      return defaultLang || `${key} (Lang not found)`;
    }
    if (params) {
      return oneLang.langs[key].replace(/\{(\w+)\}/g, (match, name) => {
        return (params[name] || match).toString();
      });
    }
    return oneLang.langs[key];
  }

  public getLangs() {
    return this.langs;
  }

  // Sub projects can extend or override the language set
  public addLang(lang: OneLangProps) {
    if (!this.langs[lang.langName]) {
      this.langs[lang.langName] = { langName: lang.langName, langs: {} };
    }
    deepMerge(this.langs[lang.langName], lang);
  }
}

export const langHelper = /* @__PURE__ */ LangHelper.getInstance();
