// This is Lupine.Js's version to help release confirmation, and user's api can add sub version to this.
const WEB_VERSION = '1.0.0 - build 20250409';
const _saved = {
  WEB_VERSION,
};

export const addWebVersion = (version: string) => {
  _saved.WEB_VERSION = WEB_VERSION + ` (${version})`;
};
export const getWebVersion = () => {
  return _saved.WEB_VERSION;
};
