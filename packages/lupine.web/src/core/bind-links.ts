import { initializePage } from './core';

export function bindLinks(el: Element | Document) {
  const links = el.getElementsByTagName('a');
  for (var i = 0, l = links.length; i < l; i++) {
    let href = new URL(links[i].href, document.baseURI).href;
    if (links[i].target !== '_blank' && href.startsWith(document.location.origin)) {
      href = href.substring(document.location.origin.length);
      // console.log(`====${href}, javascript:init('${document.links[i].href}')`);
      links[i].onclick = () => {
        initializePage(href);
        return false;
      };
    }
  }
}
