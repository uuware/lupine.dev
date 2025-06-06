import { DomUtils } from '../lib';
import { ISimpleStorage } from '../models/simple-storage-props';

// getEitherCookie can be used in both FE and SSR
export const getEitherCookie = (name: string) => {
  if (typeof window === 'undefined') {
    // SSR
    return getServerCookie(name);
  } else {
    return DomUtils.getCookie(name);
  }
};

// In SSR (server-side-rendering), some components may need to access cookies
let _serverCookies: ISimpleStorage;
export const getServerCookie = (name: string) => {
  return _serverCookies && _serverCookies.get(name, '');
};
// TODO: Server cookies safety should be OK? as this is dropped after SSR
export const initServerCookies = (serverCookies: ISimpleStorage) => {
  return (_serverCookies = serverCookies);
};
