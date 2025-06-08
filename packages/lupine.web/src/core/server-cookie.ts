import { getCookie } from '../lib/cookie';
import { ISimpleStorage } from '../models/simple-storage-props';
import { isFrontEnd } from '../lib/is-frontend';

// getEitherCookie can be used in both FE and SSR
export const getEitherCookie = (name: string) => {
  if (!isFrontEnd()) {
    // SSR
    return getServerCookie(name);
  } else {
    return getCookie(name);
  }
};

// In SSR (server-side-rendering), some components may need to access cookies
let _serverCookies: ISimpleStorage;
export const getServerCookie = (name: string) => {
  return _serverCookies && _serverCookies.get(name, '');
};
// TODO: Server cookies safety should be OK? as this is dropped after SSR
// This is called by server side to initialize cookies for SSR
export const initServerCookies = (serverCookies: ISimpleStorage) => {
  return (_serverCookies = serverCookies);
};
