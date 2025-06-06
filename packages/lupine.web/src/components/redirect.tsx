import { RefProps } from '../jsx';

export type RedirectProps = {
  title?: string;
  url: string;
  delaySeconds?: number;
};
export const Redirect = ({ title = 'redirect...', url, delaySeconds = 0 }: RedirectProps) => {
  // if SSR is disabled, then MetaData will not be working
  // MetaData({ httpEquiv: 'refresh', content: delaySeconds + ';URL=' + url });
  const ref: RefProps = {
    onLoad: async (el: Element) => {
      setTimeout(() => {
        window.location.href = url;
      }, delaySeconds * 1000);
    },
  };
  return <div ref={ref}>{title}</div>;
};
