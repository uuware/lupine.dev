// Lite Dom Utils
/*
  Don't judge whether this.node is valid, so it throws error when this.node is not found or undefined
*/
export class LiteDom {
  private node: Element;

  static queryOne(selector?: string | Element | LiteDom, docRoot?: Element): LiteDom | null {
    if (!selector) {
      return null;
    }
    if (selector instanceof LiteDom) {
      return selector;
    }
    if (selector instanceof Element) {
      return new LiteDom(selector);
    }
    const el = (docRoot || document).querySelector(selector) as Element;
    return el ? new LiteDom(el) : null;
  }

  static queryAll(selector?: string | Element | LiteDom, docRoot?: Element): LiteDom[] {
    if (!selector) {
      return [];
    }
    if (selector instanceof LiteDom) {
      return [selector];
    }
    if (selector instanceof Element) {
      return [new LiteDom(selector)];
    }
    const el = (docRoot || document).querySelectorAll(selector);
    const ret = [];
    for (let i in el) {
      ret.push(new LiteDom(el[i] as Element));
    }
    return ret;
  }

  static createElement(html: string, docRoot?: Document): LiteDom {
    const dom = (docRoot || document).createElement(html);
    const domLib = new LiteDom(dom);
    return domLib;
  }

  constructor(selector?: string | Element | LiteDom, docRoot?: Element) {
    if (selector instanceof LiteDom) {
      this.node = selector.node;
    } else if (selector instanceof Element) {
      this.node = selector;
    } else {
      const el = selector && ((docRoot || document).querySelector(selector) as Element);
      if (el) {
        this.node = el;
      } else {
        throw new TypeError('Element is not defined for a new LibDom');
      }
    }
  }

  getElement(): Element {
    return this.node;
  }

  // query children and set value or innerHTML
  $(selector: string, value?: string | number | boolean | null): LiteDom | null {
    const dom = LiteDom.queryOne(selector, this.node);
    if (dom && typeof value !== 'undefined') {
      if ('checked' in dom.node) {
        dom.node.checked = !!value;
      } else if ('value' in dom.node) {
        dom.node.value = value;
      } else if ('innerHTML' in dom.node) {
        dom.node.innerHTML = '' + value;
      }
    }
    return dom;
  }

  // query children
  query(selector: string): LiteDom | null {
    return LiteDom.queryOne(selector, this.node);
  }

  // query children
  queryAll(selector: string): LiteDom[] {
    return LiteDom.queryAll(selector, this.node);
  }

  on(eventName: string, eventHandler: (this: Element, ev: any) => any) {
    this.node.addEventListener(eventName, eventHandler, false);
    return this;
  }

  off(eventName: string, eventHandler: (this: Element, ev: any) => any) {
    this.node.removeEventListener(eventName, eventHandler, false);
    return this;
  }

  fire(event: Event) {
    this.node.dispatchEvent(event);
    return this;
  }

  isCheckbox(): boolean {
    return this.tagName === 'INPUT' && (this.node as any).type === 'checkbox';
  }
  isRadio(): boolean {
    return this.tagName === 'INPUT' && (this.node as any).type === 'radio';
  }

  val(value?: string): string | LiteDom {
    if (typeof value === 'undefined') {
      return (<any>this.node).value;
    }
    'value' in this.node && (this.node.value = value);
    return this;
  }

  checked(value?: boolean) {
    if (typeof value === 'undefined') {
      return (<any>this.node).checked;
    }
    'checked' in this.node && (this.node.checked = !!value);
    return this;
  }

  selectedIndex(value?: number) {
    if (typeof value === 'undefined') {
      return (<any>this.node).selectedIndex;
    }
    'selectedIndex' in this.node && (this.node.selectedIndex = value);
    return this;
  }

  html(value?: string): string | LiteDom {
    if (typeof value === 'undefined') {
      return this.node.innerHTML;
    }
    'innerHTML' in this.node && (this.node.innerHTML = value);
    return this;
  }

  /*
    element.style.backgroundColor = 'blue' // works
    element.style['backgroundColor'] = 'blue' // works
    element.style['background-color'] = 'blue' // does not work

    element.style.setProperty('background-color','blue') // works
    element.style.setProperty('backgroundColor','blue') // does not work
  */
  css(propertyName: string, value?: string): string | false | LiteDom {
    if (typeof value === 'undefined') {
      return this.node instanceof HTMLElement && this.node.style.getPropertyValue(propertyName);
    }
    if (this.node instanceof HTMLElement) {
      if (value === null) {
        this.node.style.removeProperty(propertyName);
      } else {
        this.node.style.setProperty(propertyName, value);
      }
    }
    return this;
  }

  attribute(attributeName: string, value?: string): string | null | LiteDom {
    if (typeof value === 'undefined') {
      return this.node.getAttribute(attributeName);
    }
    if (value === null) {
      this.node.removeAttribute(attributeName);
    } else {
      this.node.setAttribute(attributeName, value);
    }
    return this;
  }

  class(addClass?: string | string[], removeClass?: string | string[]): string | LiteDom {
    if (!addClass && !removeClass) {
      return (<any>this.node).className;
    }
    const classList = this.node.classList;
    if (addClass) {
      addClass instanceof Array ? classList.add(...addClass) : classList.add(addClass);
    }
    if (removeClass) {
      removeClass instanceof Array ? classList.remove(...removeClass) : classList.remove(removeClass);
    }
    return this;
  }

  appendChild(child: Element | LiteDom) {
    const dom = child instanceof LiteDom ? child.getElement() : child;
    dom && this.node.appendChild(dom);
    return this;
  }

  removeChild(child: Element | LiteDom) {
    const dom = child instanceof LiteDom ? child.getElement() : child;
    dom && this.node.removeChild(dom);
    return this;
  }

  removeSelf() {
    // this.node.parentElement!.removeChild(this.node);
    this.node.remove();
    return this;
  }

  get children(): LiteDom[] {
    if (!this.node.children) {
      return [];
    }
    const ret = [];
    for (let i = 0; i < this.node.children.length; i++) {
      ret.push(new LiteDom(this.node.children[i]));
    }
    return ret;
  }

  // originally returns the HTML-uppercased qualified name.
  get tagName(): string {
    return this.node.tagName.toUpperCase();
  }
}

export default LiteDom.queryOne;
