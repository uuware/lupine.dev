/*
 * for my-apps
 */
export class DynamicalLoad {
  constructor() {}

  loadScript(url: string, idForReplace?: string, removeOnLoaded = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.existScript(url, idForReplace)) {
        resolve(url);
        return;
      }
      const scriptDom = document.createElement('script');
      scriptDom.src = url;
      if (idForReplace) {
        scriptDom.id = idForReplace;
      }

      scriptDom.onload = () => {
        resolve(url);
        if (removeOnLoaded) {
          scriptDom.remove();
        }
      };

      scriptDom.onerror = () => {
        reject(new Error('Failed to load module script with URL ' + url));
        if (removeOnLoaded) {
          scriptDom.remove();
        }
      };

      const head = document.getElementsByTagName('head')[0];
      head ? head.appendChild(scriptDom) : document.documentElement.appendChild(scriptDom);
    });
  }

  // TODO: more accuracy
  existScript(url: string, id?: string) {
    if (id) {
      const scriptDom = document.getElementById(id);
      if (scriptDom && scriptDom.tagName === 'SCRIPT') {
        const src = (scriptDom as HTMLScriptElement).src.split('?')[0];
        if (src.substring(src.length - url.length) === url) {
          return true;
        }
      }
    }

    const scripts = document.scripts;
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src.split('?')[0];
      if (src.substring(src.length - url.length) === url) {
        return true;
      }
    }
  }

  loadCss(url: string, idForReplace?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.existCss(url, idForReplace)) {
        resolve(url);
        return;
      }
      if (idForReplace) {
        const sheet = document.getElementById(idForReplace);
        if (sheet && sheet.tagName === 'LINK') {
          sheet.parentNode!.removeChild(sheet);
        }
      }

      const linkDom = document.createElement('link');
      linkDom.rel = 'stylesheet';
      linkDom.type = 'text/css';
      linkDom.href = url;
      linkDom.media = 'all';
      if (idForReplace) {
        linkDom.id = idForReplace;
      }
      linkDom.onload = () => {
        resolve(url);
      };

      linkDom.onerror = () => {
        reject(new Error('Failed to load css with URL ' + url));
      };

      document.getElementsByTagName('head')[0].appendChild(linkDom);
    });
  }

  // TODO: more accuracy
  existCss(url: string, id?: string) {
    if (id) {
      const linkDom = document.getElementById(id);
      if (linkDom && linkDom.tagName === 'LINK') {
        const href = (<any>linkDom).href.split('?')[0];
        if (href.substring(href.length - url.length) === url) {
          return true;
        }
      }
    }

    const styles = document.styleSheets;
    for (let i = 0; i < styles.length; i++) {
      const linkDom = styles[i] as any;
      const href = linkDom.href.split('?')[0];
      if (href.substring(href.length - url.length) === url) {
        return true;
      }
    }
  }

  // removeCss(url: string, id?: string) {
  //     if (id) {
  //         const sheet = document.getElementById(id);
  //         if (sheet && sheet instanceof HTMLElement) {
  //             const href = (<any>sheet).href;
  //             if (href.substring(href.length - url.length) === url) {
  //                 (<any>sheet).disabled = true;
  //                 sheet.parentNode.removeChild(sheet);
  //                 return;
  //             }
  //         }
  //     }
  //     const styles = document.styleSheets;
  //     for (const i = 0; i < styles.length; i++) {
  //         const sheet = styles[i] as any;
  //         if (sheet.href.substring(sheet.href.length - url.length) === url) {
  //             sheet.disabled = true;
  //             sheet.ownerNode.parentNode.removeChild(sheet.ownerNode);
  //             return;
  //         }
  //     }
  // }
}

export default new DynamicalLoad();
