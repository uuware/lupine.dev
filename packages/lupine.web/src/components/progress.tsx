import { RefProps } from '../jsx';
import { HtmlVar } from './html-var';

export type ProgressHookProps = {
  onProgress?: (percentage: number, chunkNumber: number, totalChunks: number) => void;
  onShow?: (show: boolean, title?: string) => void;
};
export type ProgressProps = {
  hook: ProgressHookProps;
};

export const Progress = (props: ProgressProps) => {
  const css: any = {
    position: 'fixed',
    display: 'flex',
    bottom: '0',
    left: '0',
    width: '100%',
    zIndex: 'var(--layer-modal-over)',
    flexDirection: 'column',
    backgroundColor: '#e6e6e6de',
    padding: '16px',
    '.progress-box': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 'auto',
      margin: 'auto',
    },
    '.progress-bar': {
      display: 'flex',
      width: '100%',
      height: '60px',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    '.progress-bar1': {
      height: '100%',
      width: '0%',
      backgroundColor: '#49e57e',
    },
    '.progress-bar2': {
      height: '100%',
      width: '100%',
      backgroundColor: '#2bb8cd',
    },
    '.progress-tips': {
      marginTop: '10px',
      fontSize: '30px',
      color: '#49e57e',
    },
  };

  props.hook.onProgress = (percentage: number, chunkNumber: number, totalChunks: number) => {
    // console.log(`Upload progress: ${percentage}% (chunk ${chunkNumber} of ${totalChunks})`);
    percentage = Math.round(percentage * 100);
    const bar1 = document.querySelector('.progress-bar1') as HTMLElement;
    const bar2 = document.querySelector('.progress-bar2') as HTMLElement;
    bar1.style.width = `${percentage}%`;
    bar2.style.width = `${1 - percentage}%`;
    dom.value = `${percentage}%`;
  };
  props.hook.onShow = (show: boolean, title?: string) => {
    if (title) {
      domTitle.value = title;
    }
    if (show) {
      ref.current?.classList.remove('d-none');
    } else {
      ref.current?.classList.add('d-none');
    }
  };

  const ref: RefProps = {};
  const domTitle = HtmlVar('Progress');
  const dom = HtmlVar('0 %');
  return (
    <div ref={ref} css={css} class='progress-top d-none'>
      <div class='progress-box'>
        <div class='progress-title mb-m align-left w-100p'>{domTitle.node}</div>
        <div class='progress-bar'>
          <div class='progress-bar1'></div>
          <div class='progress-bar2'></div>
        </div>
        <div class='progress-tips'>{dom.node}</div>
      </div>
    </div>
  );
};
