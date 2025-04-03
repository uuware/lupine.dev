import { getEitherCookie } from 'lupine.js';
import { userCookieName } from '../models';

const _sharedData: { _browserAudio?: string; _metronome?: string } = {};

export const getBrowserAudio = () => {
  return _sharedData._browserAudio;
};
export const getMetronome = () => {
  return _sharedData._metronome;
};

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
