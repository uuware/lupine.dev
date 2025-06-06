import { bindGlobalStyles, ComponentChildren, CssProps } from 'lupine.web';
import { dragData, findTopBlock } from './drag-data';

export type BlockBoxProps = {
  id: string;
  children: ComponentChildren;
  isNewBlock?: boolean;
};

export const DesignBlockBox = (props: BlockBoxProps) => {
  const css: CssProps = {
    display: 'flex',
    width: '100%',
    border: '1px dotted #ccc',
    position: 'relative',
    flex: '1',
    '&.dragging': {
      opacity: '0.3',
    },
    '&.drag-over-top': {
      borderTop: 'dashed 2px red',
    },
    '&.drag-over-bottom': {
      borderBottom: 'dashed 2px red',
    },
    '>.menu-bar': {
      display: 'none',
      position: 'absolute',
      top: '0',
      right: '0',
      flexDirection: 'row',
      '>.menu-item': {
        padding: '1px 8px',
        margin: '0 2px',
        border: 'var(--primary-border)',
        fontSize: '70%',
      },
      '>.menu-item.drag': {
        cursor: 'grab',
      },
      '>.menu-item.remove': {
        cursor: 'pointer',
      },
    },
    '&:hover > .menu-bar': {
      display: 'flex',
    },
    '>.child': {
      margin: '8px 0',
      width: '100%',
      height: '100%',
    },
  };
  bindGlobalStyles('design-block-box', '.design-block-box', css);

  const findMsgSender = (ev: any) => {
    const msgSender = (window as any)._lj_design;
    if (msgSender) {
      // inside iframe
      return msgSender;
    } else {
      // outside iframe
      const topEl = findTopBlock(ev.target, 'edit-page-body');
      const iframe = topEl!.querySelector('.iframe') as HTMLIFrameElement;
      const msgSender = (iframe as any).contentWindow._lj_design;
      return msgSender;
    }
  };

  const dragStart = (ev: any) => {
    const overEl = findTopBlock(ev.target, 'design-block-box');
    dragData.dragBlock = overEl;
    // const childIndex = Array.prototype.indexOf.call(overEl!.parentNode!.children, overEl);

    ev.dataTransfer.clearData();
    const msgSender = findMsgSender(ev);
    msgSender.toIframe('drag-started', { el: overEl });
    if (props.isNewBlock) {
    }
    ev.dataTransfer.effectAllowed = 'move';
    ev.currentTarget.parentNode.parentNode.classList.add('dragging');
  };
  const dragEnd = (ev: any) => {
    ev.currentTarget.parentNode.parentNode.classList.remove('dragging');
    const msgSender = findMsgSender(ev);
    msgSender.toIframe('drag-ended', {});
    if (props.isNewBlock) {
      // dragEl = dragData.dragBlock.clone();
      return;
    }
    return;

    const el = dragData.overBlock;
    if (dragData.resetDragOver) {
      dragData.resetDragOver();
    }
    if (ev.dataTransfer.dropEffect === 'none') {
      ev.dataTransfer.clearData();
      return;
    }

    if (el) {
      let dragEl = dragData.dragBlock;
      if (props.isNewBlock) {
        dragEl = dragData.dragBlock.clone();
      }

      // a design-container without children
      if (el.classList.contains('design-container') && el.children.length === 1) {
        el.appendChild(dragData.dragBlock);
        return;
      }
      if (dragData.position == 'top') {
        el.parentNode.insertBefore(dragData.dragBlock, el);
      } else {
        el.parentNode.insertBefore(dragData.dragBlock, el.nextSibling);
      }
    }
  };

  const remove = (ev: any) => {
    ev.currentTarget.parentNode.parentNode.remove();
  };

  return (
    <div class='design-block-box'>
      <div class='menu-bar'>
        <div class='menu-item drag' draggable={true} onDragStart={dragStart} onDragEnd={dragEnd}>
          Drag
        </div>
        {props.isNewBlock ? undefined : (
          <div class='menu-item remove' onClick={remove}>
            Remove
          </div>
        )}
      </div>
      <div class='child'>{props.children}</div>
    </div>
  );
};
