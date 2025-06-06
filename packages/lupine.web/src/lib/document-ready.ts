/*
 * for my-apps
 */
export class DocumentReady {
  constructor() {}

  // code is from https://code.jquery.com/jquery-1.12.4.js
  // for document only (not for elements)
  ready(fn: Function): void {
    if (document.readyState === 'complete') {
      setTimeout(fn, 0);
    } else {
      // The ready event handler and self cleanup method
      const completed = function () {
        if (document.readyState === 'complete') {
          document.removeEventListener('DOMContentLoaded', completed);
          window.removeEventListener('load', completed);
          setTimeout(fn, 0);
        }
      };

      document.addEventListener('DOMContentLoaded', completed);
      window.addEventListener('load', completed);
    }
  }

  readyPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ready(() => {
        resolve();
      });
    });
  }
}

export default new DocumentReady();
