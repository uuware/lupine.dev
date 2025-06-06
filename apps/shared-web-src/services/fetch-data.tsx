import { JsonObject, webEnv } from 'lupine.web';
import { ClientEnvKeys } from '../common/client-env-keys';

// This is called from the frontend and the backend as well, so API_BASE_URL may be different.
export const fetchData = async (urlWithoutHost: string, postData?: string | JsonObject) => {
  // const url = envFrontend.API_BASE_URL + urlWithoutHost;
  const url = webEnv(ClientEnvKeys.API_BASE_URL, '') + urlWithoutHost;
  console.log('========fetchData', url);

  const option = {
    method: postData ? 'POST' : 'GET',
    body: postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : undefined,
  };
  const data = await fetch(url, option);
  // const json = await data.json();
  const text = await data.text();
  try {
    const json = JSON.parse(text);
    return { json };
  } catch (e) {
    return { text };
  }
};
