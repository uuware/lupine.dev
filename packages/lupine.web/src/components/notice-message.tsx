import { bindGlobalStyles } from '../core';
import { CssProps } from '../jsx';
/**
How to use:
  Notification.sendMessage(message);
*/
export enum NotificationColor {
  Success = 'var(--success-bg-color)',
  Info = 'var(--info-bg-color)',
  Warning = 'var(--warning-bg-color)',
  Error = 'var(--error-bg-color)',
}
export const notificationColorFromValue = (value: string) => {
  switch (value) {
    case 'Success':
      return NotificationColor.Success;
    case 'Info':
      return NotificationColor.Info;
    case 'Warning':
      return NotificationColor.Warning;
    case 'Error':
      return NotificationColor.Error;
  }
  return NotificationColor.Info;
};
export class NotificationMessage {
  // public static readonly Color = NotificationColor;

  private static initialized = false;
  private static container: HTMLElement;

  static init() {
    /* styles for resizable splitter */
    const css: CssProps = {
      position: 'fixed',
      top: 0,
      right: 0,
      height: 'auto',
      overflowY: 'auto',
      maxHeight: '100%',
      width: '100%',
      maxWidth: '400px',
      // cursor: 'pointer',
      // backgroundColor: '#fefefe',
      padding: '0 10px',
      zIndex: 'var(--layer-notice)',
      // borderRadius: '6px',
      // boxShadow: '0px 0px 2px #000',
      '>div': {
        color: 'var(--notice-color-with-bg)',
        padding: '10px 8px',
        margin: '16px 0',
        borderRadius: '6px',
        boxShadow: 'var(--cover-box-shadow)', //'3px 3px 8px #767676',
        transition: 'all 0.5s',
        transform: 'scale(0.1)',
        opacity: 0,
      },
      '.close-btn': {
        position: 'absolute',
        top: '-2px',
        right: '3px',
        color: 'var(--notice-color-with-bg)',
        fontWeight: 'bold',
        fontSize: '22px',
        lineHeight: '20px',
        cursor: 'pointer',
        transition: '0.3s',
      },

      '.close-btn:hover': {
        color: 'black',
      },
    };
    bindGlobalStyles('lj_notification', '.lj_notification', css);

    let container = document.querySelector('.lj_notification');
    if (!container) {
      container = document.createElement('div');
      container.className = 'lj_notification';
      document.body.appendChild(container);
      this.container = container as HTMLElement;
    }
  }

  static sendMessage(message: string, backgroundColor = NotificationColor.Info, permanent = false, showTime = 3000) {
    if (!this.initialized) {
      this.initialized = true;
      this.init();
    }
    this.container.scrollTop = 0;
    const div = document.createElement('div');
    div.innerHTML = message;
    div.style.backgroundColor = backgroundColor;
    this.container.insertBefore(div, this.container.firstChild);
    setTimeout(() => {
      div.style.opacity = '1';
      div.style.transform = 'scale(1)';
    }, 0);

    if (permanent) {
      const closeBtn = document.createElement('span');
      closeBtn.innerHTML = '&times;';
      closeBtn.className = 'close-btn';
      div.appendChild(closeBtn);
      closeBtn.onclick = () => {
        this.container.removeChild(div);
      };
    } else {
      setTimeout(() => {
        div.style.opacity = '0';
        div.style.transform = 'scale(0.1)';
        setTimeout(() => {
          this.container.removeChild(div);
        }, 1000);
      }, showTime);
    }
  }
}
