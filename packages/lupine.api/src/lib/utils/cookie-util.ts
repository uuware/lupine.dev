import { SetCookieProps } from '../../models';

export const parseCookies = (str: string | undefined) => {
  let rx = /([^;=\s]*)=([^;]*)/g;
  let obj: { [key: string]: string } = {};
  if (str) {
    for (let m; (m = rx.exec(str)); ) {
      obj[m[1]] = decodeURIComponent(m[2]);
    }
  }
  return obj;
};

export const serializeCookie = (name: string, value: string, options: SetCookieProps) => {
  const expires = new Date(new Date().getTime() + options.expireDays * 24 * 3600000);
  const cookiePair =
    name +
    '=' +
    encodeURIComponent(value) +
    '; Expires=' +
    expires.toUTCString() +
    '; Path=' +
    (options.path ? options.path : '/') +
    (options.domain ? '; Domain=' + options.domain : '') +
    (options.httpOnly ? '; HttpOnly' : '') +
    (options.Partitioned ? '; Partitioned' : '') +
    (options.sameSite ? '; SameSite=' + options.sameSite : '') +
    (options.secure ? '; Secure' : '');
  return cookiePair;
};
