import { DomUtils, getEitherCookie } from 'lupine.components';
import { userCookieName } from '../models';

export type UserCookieType = {
  u?: string;
  t?: string;
};
export const getCookieUser = (): UserCookieType => {
  try {
    return JSON.parse(getEitherCookie(userCookieName) || '{}');
  } catch (e) {
    return {};
  }
};
export const setCookieUser = (user: UserCookieType) => {
  // for web, client and server are the same domain
  // for mobile and desktop, client domain is localhost and userCookieName is for the client
  DomUtils.setCookie(userCookieName, JSON.stringify(user || {}), 360, '/');
};
