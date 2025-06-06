import { bindGlobalStyles } from '../core';
import { CssProps } from '../jsx';
import { stopPropagation } from '../lib';
/**
How to use:
  // getSplitter's first parameter is the container's selector where the Splitter will be in.
  // the second parameter is whether it's Vertical
  // then the third parameter is it's RightOrTop or not
  const locationLeft = false;
  const splitter = ResizableSplitter.getSplitter('.body .side', true, locationLeft);
  const container = (
        <div class='body'>
            <div class='side'>
              {splitter}
              {designPanel}
            </div>
          ...

*/
export class ResizableSplitter {
  static hostNode: HTMLElement;
  static isVertical = true;
  static isRightOrTop = true;

  private static initialized = false;
  private static startXorY = 0;
  private static startWidthOrHeight = 0;
  private static pressed = false;

  static init() {
    /* styles for resizable splitter */
    const css: CssProps = {
      '.resizable-splitter-v-left, .resizable-splitter-v-right': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '2px',
        cursor: 'col-resize',
      },
      '.resizable-splitter-v-right': {
        left: 'unset',
        right: 0,
      },
      '.resizable-splitter-v-left:hover, .resizable-splitter-v-right:hover': {
        width: '4px',
        backgroundColor: '#ccc',
      },

      '.resizable-splitter-h-top, .resizable-splitter-h-bottom': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        cursor: 'row-resize',
      },
      '.resizable-splitter-h-bottom': {
        top: 'unset',
        bottom: 0,
      },
      '.resizable-splitter-h-top:hover, .resizable-splitter-h-bottom:hover': {
        height: '4px',
        backgroundColor: '#ccc',
      },
    };
    bindGlobalStyles('resizable-splitter', 'html', css);

    window.addEventListener('mousemove', ResizableSplitter.onMousemove.bind(ResizableSplitter), false);
    document.documentElement.addEventListener('mouseup', ResizableSplitter.onMouseup.bind(ResizableSplitter), false);
  }

  static getSplitterClassName(isVertical: boolean, isRightOrTop: boolean): string {
    const className =
      'resizable-splitter-' +
      (isVertical ? (isRightOrTop ? 'v-right' : 'v-left') : isRightOrTop ? 'h-top' : 'h-bottom');
    return className;
  }

  static onMousedown(event: any) {
    if (event.buttons !== 1 || event.button !== 0) return;
    this.pressed = true;
    this.startXorY = this.isVertical ? event.clientX : event.clientY;
    const startPosition = document.defaultView!.getComputedStyle(this.hostNode)[this.isVertical ? 'width' : 'height'];
    this.startWidthOrHeight = parseInt(startPosition, 10);
  }

  static onMousemove(event: any) {
    if (!this.pressed || event.buttons !== 1 || event.button !== 0) {
      return;
    }

    // prevent text/element selection when drag
    stopPropagation(event);
    if (this.isVertical) {
      const movedXorY = this.startWidthOrHeight + (event.clientX - this.startXorY) * (this.isRightOrTop ? 1 : -1);
      this.hostNode.style.width = movedXorY + 'px';
    } else {
      const movedXorY = this.startWidthOrHeight + (event.clientY - this.startXorY) * (this.isRightOrTop ? -1 : 1);
      this.hostNode.style.height = movedXorY + 'px';
    }
  }

  static onMouseup() {
    if (this.pressed) this.pressed = false;
  }

  static getSplitter(selector: string, isVertical: boolean, isRightOrTop: boolean) {
    const className = this.getSplitterClassName(isVertical, isRightOrTop);

    const onMousedown = (event: any) => {
      if (!this.initialized) {
        this.initialized = true;
        this.init();
      }

      ResizableSplitter.hostNode = document.querySelector(selector)!;
      if (!ResizableSplitter.hostNode) {
        console.error(`Can't find element: ${selector}`);
        return;
      }
      ResizableSplitter.isVertical = isVertical;
      ResizableSplitter.isRightOrTop = isRightOrTop;
      ResizableSplitter.onMousedown.bind(ResizableSplitter)(event);
    };

    return <div onMouseDown={onMousedown} class={className}></div>;
  }
}
