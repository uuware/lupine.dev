const _dragData: any = {};
export { _dragData as dragData };

export const findTopBlock = (el: HTMLElement, cssName: string): HTMLElement | undefined => {
  if (el.classList.contains(cssName)) {
    return el;
  }
  if (el.parentElement) {
    return findTopBlock(el.parentElement, cssName);
  }
};

// if (typeof window !== 'undefined') {
//   const iframe = document.querySelector('.iframe') as HTMLIFrameElement;
//   // communication with inside iframe
//   const msgSender = (iframe as any).contentWindow._lj_design;
//   msgSender.toParent = (cmd: string, data: any) => {
//     if (cmd === 'xxx') {
//       console.log('addBlock', data);
//     }
//   };

//   msgSender.toIframe('add-block', 'ss');
// }
