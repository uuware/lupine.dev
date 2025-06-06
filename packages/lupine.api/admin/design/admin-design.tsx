import { CssProps, PageProps } from 'lupine.web';
import { DesignBlockBox } from './design-block-box';
import { dragData, findTopBlock } from './drag-data';
import { BlockGrid } from './block-grid';
import { BlockTitle } from './block-title';
import { BlockParagraph } from './block-paragraph';

const fetchLogin = async (props: PageProps, username: string, password: string) => {
  const data = await props.renderPageFunctions.fetchData('/api/admin/auth', {
    u: username,
    p: password,
  });
  return data.json;
};

export const AdminDesignPage = async (props: PageProps) => {
  if (typeof window === 'undefined') {
    return <div>No SSR.</div>;
  }
  if (window.top === window) {
    return <div>This page should be running in an iframe.</div>;
  }

  let dragStarted = false;
  let dragEl: any = null;
  let dragOverEl: any = null;
  // set an object for parent to commutate
  const msgSender = ((window as any)._lj_design = {
    toIframe: (cmd: string, data: any) => {
      console.log('iframe window', cmd, data);
      if (cmd === 'drag-started') {
        dragStarted = true;
        dragEl = data.el;
      }
      if (cmd === 'drag-ended') {
        dragData.resetDragOver();
      }

      if (cmd === 'add-block') {
        console.log('addBlock', data);
      }
    },
  });

  dragData.resetDragOver = () => {
    if (dragData.overBlock) {
      dragData.overBlock.classList.remove('drag-over');
      dragData.overBlock.classList.remove('drag-over-top');
      dragData.overBlock.classList.remove('drag-over-bottom');
      dragData.overBlock = null;
    }
  };
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100%',
    overflowY: 'auto',
    '>.design-container': {
      flexDirection: 'column',
    },
    '.design-container': {
      display: 'flex',
      flex: '1',
      flexWrap: 'wrap',
    },
  };

  const drop = (ev: any) => {
    dragStarted = false;
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text/plain');
    console.log('drop', ev, data);
    // ev.target.appendChild(document.getElementById(data));
    if (data === 'block-paragraph') {
      const newBlock = document.createElement('div');
      newBlock.innerHTML = 'new block';
      newBlock.classList.add('design-block-box');
      newBlock.classList.add('dragging');
      newBlock.draggable = true;
      newBlock.addEventListener('dragend', dragData.resetDragOver);
      ev.target.appendChild(newBlock);
    }

    if (dragOverEl && dragEl) {
      // let dragEl = dragData.dragBlock;
      // if (props.isNewBlock) {
      //   dragEl = dragData.dragBlock.clone();
      // }

      // a design-container without children
      if (dragOverEl.classList.contains('design-container') && dragOverEl.children.length === 1) {
        dragOverEl.appendChild(dragEl);
        return;
      }
      if (dragData.position == 'top') {
        dragOverEl.parentNode.insertBefore(dragEl, dragOverEl);
      } else {
        dragOverEl.parentNode.insertBefore(dragEl, dragOverEl.nextSibling);
      }
    }
  };
  const dragOver = (ev: any) => {
    ev.preventDefault();
    console.log('dragData', ev, dragStarted);
    if (!dragStarted) {
      return;
    }

    // whether inside design-container without any children (only style)
    const overContainer = findTopBlock(ev.target, 'design-container');
    console.log('overContainer', overContainer);
    dragOverEl = overContainer;
    if (overContainer && overContainer.children.length === 1) {
      dragData.resetDragOver();
      dragData.overBlock = overContainer;
      overContainer.classList.add('drag-over');
      return;
    }

    // over another design-block-box
    const overEl = findTopBlock(ev.target, 'design-block-box');
    if (!overEl || overEl.classList.contains('dragging')) {
      return;
    }

    dragOverEl = overEl;
    dragData.resetDragOver();
    dragData.overBlock = overEl;
    const rect = overEl.getBoundingClientRect();
    const y = ev.clientY - rect.top;
    if (y < rect.height / 2) {
      dragData.position = 'top';
      overEl.classList.add('drag-over-top');
    }
    if (y > rect.height / 2) {
      dragData.position = 'bottom';
      overEl.classList.add('drag-over-bottom');
    }
  };
  const dragLeave = (ev: any) => {
    ev.preventDefault();
    dragData.resetDragOver();
  };

  return (
    <div css={css} class='design-container-top'>
      <div class='design-container' onDrop={drop} onDragOver={dragOver} onDragLeave={dragLeave}>
        <DesignBlockBox id='1'>
          <BlockTitle>design block one</BlockTitle>
        </DesignBlockBox>
        <DesignBlockBox id='2'>
          <BlockGrid />
        </DesignBlockBox>
        <DesignBlockBox id='3'>
          <BlockTitle>design block three</BlockTitle>
        </DesignBlockBox>
        <DesignBlockBox id='4'>
          <BlockParagraph>design block three</BlockParagraph>
        </DesignBlockBox>
        <DesignBlockBox id='5'>
          <BlockTitle>design block three</BlockTitle>
        </DesignBlockBox>
        <DesignBlockBox id='6'>
          <BlockGrid />
        </DesignBlockBox>
        <DesignBlockBox id='7'>
          <BlockGrid />
        </DesignBlockBox>
      </div>
    </div>
  );
};
