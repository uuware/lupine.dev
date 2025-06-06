// This is Lupine.Api's version to help release confirmation, and user's api can add sub version to this.
const API_VERSION = '1.0.0 - build 20250411';
const _saved = {
  API_VERSION,
}

export const addApiVersion = (version: string) => {
  _saved.API_VERSION = API_VERSION + ` (${version})`;
}
export const getApiVersion = () => {
  return _saved.API_VERSION;
}
