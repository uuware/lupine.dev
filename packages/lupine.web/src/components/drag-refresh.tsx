import { CssProps, RefProps } from '../jsx';
import { Spinner02, SpinnerSize } from './spinner';

export type DragRefreshCloseProps = () => void;

export type DragRefreshProps = {
  container: string;
  onDragRefresh: (close: DragRefreshCloseProps) => Promise<void>;
};

export const DragFresh = (props: DragRefreshProps) => {
  const css: CssProps = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '0px',
    position: 'relative',
    '.drag-spinner': {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      zIndex: 3,
      display: 'none',
      justifyContent: 'center',
      transition: 'opacity 0.5s ease',
      alignItems: 'end',
      backgroundImage: 'linear-gradient(to bottom, rgba(200,200,200,0.8), rgba(255,255,255,0))',
    },
    '&.show .drag-spinner': {
      display: 'flex',
    },
  };

  const closeSpin = () => {
    const spinnerDom = ref.$('.drag-spinner') as HTMLDivElement;
    if (!spinnerDom) return;
    spinnerDom.style.opacity = '0';
    setTimeout(() => {
      spinnerDom.style.opacity = '1';
      spinnerDom.parentElement!.classList.remove('show');
    }, 300);
  };
  const ref: RefProps = {
    onLoad: async () => {
      const container = document.querySelector(props.container) as HTMLDivElement;
      const pullDom = ref.current as HTMLDivElement;
      const spinnerDom = ref.$('.drag-spinner') as HTMLDivElement;
      if (!container || !pullDom || !spinnerDom) return;
      let touchstartY = 0;
      let touchstartX = 0;
      let direction = '';
      let needRefresh = false;
      const maxHeight = 150;
      container.addEventListener('touchstart', (e: any) => {
        touchstartY = e.touches[0].clientY;
        touchstartX = e.touches[0].clientX;
        direction = '';
        needRefresh = false;
      });
      container.addEventListener('touchmove', (e: any) => {
        console.log(`window.scrollY: ${window.scrollY}`);
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const movedY = touchY - touchstartY;
        const movedX = touchX - touchstartX;
        if (direction === '') {
          if (movedY > 0) {
            direction = 'Y';
          } else if (movedX > 0) {
            direction = 'X';
          }
        }
        if (direction === 'X') {
          return;
        }
        if (window.scrollY === 0) {
          needRefresh = movedY > 30;
          if (movedY > 5) {
            pullDom.classList.add('show');
            spinnerDom.style.height = `${Math.min(maxHeight, movedY)}px`;
          } else {
            pullDom.classList.remove('show');
            spinnerDom.style.height = '0';
          }
        } else if (window.scrollY > Math.min(maxHeight, movedY)) {
          pullDom.classList.remove('show');
          spinnerDom.style.height = '0';
        }
      });
      container.addEventListener('touchend', (e) => {
        if (direction === 'Y') {
          if (needRefresh) {
            props.onDragRefresh(closeSpin);
          } else {
            closeSpin();
          }
        }
        direction = '';
      });
    },
  };
  return (
    <div css={css} ref={ref} class='drag-refresh-box'>
      <div class='drag-spinner'>
        <Spinner02 size={SpinnerSize.Large} />
      </div>
    </div>
  );
};
