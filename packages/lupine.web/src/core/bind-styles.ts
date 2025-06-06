import { CssProps } from '../jsx';
import { getCurrentTheme, themeCookieName } from './bind-theme';
import { camelToHyphens } from './camel-to-hyphens';
// import { bindPageResetEvent } from './page-reset-events';
import { bindPageLoadedEvent } from './page-loaded-events';

const wrapCss = (className: string, cssText: string, mediaQuery?: string) => {
  // if (!className) {
  //   console.warn(`No class name is provided for ${cssText}`);
  // }
  let cssTextWrap = className ? `${className}{${cssText}}` : cssText;
  if (mediaQuery) {
    cssTextWrap = `${mediaQuery}{${cssTextWrap}}`;
  }
  return cssTextWrap;
};

const processStyleValue = (style: CssProps) => {
  return Object.keys(style)
    .map((key) => key.trim())
    .map((key) => {
      const noOutput =
        (style[key] != null && typeof style[key] === 'object') ||
        typeof style[key] === 'undefined' ||
        style[key] === '';
      return noOutput ? '' : `${camelToHyphens(key)}:${style[key]};`;
    })
    .join('');
};

const updateOneBlock = (css: string[], cssTemp: string[], className: string, mediaQuery?: string) => {
  if (cssTemp.length > 0) {
    const cssText = wrapCss(className, cssTemp.join(''), mediaQuery);
    css.push(cssText);
    cssTemp.length = 0;
  }
};

export const processStyle = (className: string, style: CssProps, mediaQuery?: string): string[] => {
  const css: string[] = [];
  const cssTemp: string[] = [];
  for (let i in style) {
    const value = style[i];
    if (value === null || typeof value !== 'object') {
      if (value !== '' && typeof value !== 'undefined') {
        if (!className) {
          console.warn(`No className is defined for: ${camelToHyphens(i)}:${value};`);
        }
        cssTemp.push(`${camelToHyphens(i)}:${value};`);
      }
    } else {
      updateOneBlock(css, cssTemp, className, mediaQuery);

      if (i.startsWith('@keyframes')) {
        const cssText = Object.keys(value)
          .map((stageKey) => stageKey + '{' + processStyleValue(value[stageKey] as CssProps) + '}')
          .join('');
        css.push(`${i}{${cssText}}`);
      } else if (i.startsWith('@media')) {
        const ret = processStyle(className, value, i);
        css.push(...ret);
      } else {
        // '&:hover, &.open': {
        //     '>.d1, .d2': {
        //     },
        // }, ==>
        // &:hover >.d1, &:hover >.d2, &.open >.d1, &.open .d2
        const newClassName = !className
          ? i
          : className
              .split(',')
              .map((key0) => key0.trim())
              .map((key0) => {
                return i
                  .split(',')
                  .map((key) => key.trim())
                  .map((key) => {
                    // not needed to "+" as them share same parents?
                    // return key.split('+').map(key2 => key2.startsWith('&') ? key0 + key2.substring(1) : key0 + ' ' + key2).join('+');
                    return key.startsWith('&') ? key0 + key.substring(1) : key0 + ' ' + key;
                  })
                  .join(',');
              })
              .join(',');
        const ret = processStyle(newClassName, value, mediaQuery);
        css.push(...ret);
      }
    }
  }
  updateOneBlock(css, cssTemp, className, mediaQuery);
  return css;
};

// mount-components has the same name `sty-`
export const updateStyles = (selector: string, style: CssProps) => {
  const el = selector && document.querySelector(selector);
  if (el) {
    const cssText = processStyle(selector, style).join('');
    // if the first child is style, then update it
    if (el.firstChild && el.firstChild.nodeName === 'STYLE') {
      (el.firstChild as any).innerHTML = cssText;
    } else {
      const style = document.createElement('style');
      style.innerHTML = cssText;
      // style.id = `sty-${selector}`; // sty means style, this is different from mount-components.renderComponent
      el.prepend(style);
    }
  } else {
    console.warn(`Can't find "${selector}" to update styles.`);
  }
};

const updateCssDom = (uniqueStyleId: string, cssText: string, cssDom: HTMLElement | null) => {
  if (!cssDom) {
    cssDom = document.createElement('style');
    cssDom.id = `sty-${uniqueStyleId}`;
    document.head.appendChild(cssDom);
  }
  cssDom.innerText = cssText;
};

/*
Global styles including theme will not be updated once it's created.
topClassName is a className or a tag name.
For example, it can be like this for all elements:
  html { ... } or :root { ... }
*/
const _globalStyle = new Map();
export const bindGlobalStyles = (uniqueStyleId: string, topClassName: string, style: CssProps, forceUpdate = false) => {
  if (typeof document !== 'undefined') {
    let cssDom = document.getElementById(`sty-${uniqueStyleId}`);
    if (forceUpdate || !cssDom) {
      updateCssDom(uniqueStyleId, processStyle(topClassName, style).join(''), cssDom);
    }
  } else if (!_globalStyle.has(uniqueStyleId) || forceUpdate) {
    // don't overwrite it to have the same behavior as in the Browser
    _globalStyle.set(uniqueStyleId, { topClassName, style });
  }
};

const generateThemeStyles = () => {
  const currentTheme = getCurrentTheme();
  const themeCss = [];
  for (let themeName in currentTheme.themes) {
    // i is for case-insensitive
    themeCss.push(...processStyle(`[data-theme="${themeName}" i]`, currentTheme.themes[themeName]));
  }
  return themeCss.join('\n');
};

if (typeof document !== 'undefined') {
  // Update theme in Browser when no SSR
  bindPageLoadedEvent(() => {
    const uniqueStyleId = themeCookieName;
    let cssDom = document.getElementById(`sty-${uniqueStyleId}`);
    if (!cssDom) {
      updateCssDom(uniqueStyleId, generateThemeStyles(), cssDom);
    }
  });
}

const clearGlobalStyles = () => {
  // reset unique id
  _globalStyle.clear();
};
// bindPageResetEvent(clearGlobalStyles);

export const generateAllGlobalStyles = () => {
  const result = [];

  result.push(`<style id="sty-theme">${generateThemeStyles()}</style>`);

  for (let [uniqueStyleId, { topClassName, style }] of _globalStyle) {
    const cssText = processStyle(topClassName, style).join('');
    result.push(`<style id="sty-${uniqueStyleId}">${cssText}</style>`);
  }

  clearGlobalStyles();
  return result.join('');
};
