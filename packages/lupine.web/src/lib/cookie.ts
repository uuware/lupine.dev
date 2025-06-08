export const setCookie = (
  name: string,
  value: string,
  expireDays = 365,
  path?: string,
  domain?: string,
  secure?: string
) => {
  const expires = new Date(new Date().getTime() + expireDays * 24 * 3600000);
  document.cookie =
    name +
    '=' +
    escape(value) +
    ';expires=' +
    expires.toUTCString() +
    ';path=' +
    (path ? path : '/') +
    (domain ? ';domain=' + domain : '') +
    (secure ? ';secure' : '');
};

export const getCookie = (key: string) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    if (c.substring(0, key.length + 1) == key + '=') {
      return unescape(c.substring(key.length + 1));
    }
  }
  return null;
};

export const clearCookie = (name: string, path?: string, domain?: string, secure?: string) => {
  document.cookie =
    name +
    '=;expires=Fri, 02-Jan-1970 00:00:00 GMT' +
    ';path=' +
    (path ? path : '/') +
    (domain ? ';domain=' + domain : '') +
    (secure ? ';secure' : '');
};
