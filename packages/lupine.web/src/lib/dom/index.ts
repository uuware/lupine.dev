import { calculateTextWidth } from './calculate-text-width';
import { clearCookie, getCookie, setCookie } from './cookie';
import { download } from './download';
import { downloadStream } from './download-stream';

export class DomUtils {
  public static calculateTextWidth(text: string, font: string) {
    return calculateTextWidth(text, font);
  }

  public static getValue(cssSelector: string) {
    return (document.querySelector(cssSelector) as HTMLInputElement)?.value;
  }

  public static setValue(cssSelector: string, value: string) {
    const dom = document.querySelector(cssSelector) as HTMLInputElement;
    if (dom) dom.value = value;
  }

  public static getChecked(cssSelector: string) {
    return (document.querySelector(cssSelector) as HTMLInputElement)?.checked;
  }

  public static setChecked(cssSelector: string, checked: boolean) {
    const dom = document.querySelector(cssSelector) as HTMLInputElement;
    if (dom) dom.checked = checked;
  }

  public static joinValues(values: (string | undefined)[]) {
    return values.filter((item) => item && item !== '').join(' ');
  }

  public static setCookie(
    name: string,
    value: string,
    expireDays = 365,
    path?: string,
    domain?: string,
    secure?: string
  ) {
    return setCookie(name, value, expireDays, path, domain, secure);
  }

  public static getCookie(key: string) {
    return getCookie(key);
  }

  public static clearCookie(name: string, path?: string, domain?: string, secure?: string) {
    return clearCookie(name, path, domain, secure);
  }

  public static download(link: string, filename?: string) {
    return download(link, filename);
  }

  public static downloadStream(blob: Blob, filename?: string) {
    return downloadStream(blob, filename);
  }

  public static byId(id: string) {
    return document.querySelector(`#${id}`);
  }

  public static byCssPath(cssPath: string) {
    return document.querySelector(cssPath);
  }

  public static bySelector(selector: string) {
    return document.querySelector(selector);
  }
}
