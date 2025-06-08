import { JsonObject, webEnv } from 'lupine.components';

export const fetchData = async (
  urlWithoutHost: string,
  postData?: string | JsonObject,
  returnRawResponse?: boolean
) => {
  const url = webEnv('API_BASE_URL', '') + urlWithoutHost;
  console.log('========fetchData', url);

  const option = {
    method: postData ? 'POST' : 'GET',
    body: postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : undefined,
  };
  const response = await fetch(url, option);
  if (returnRawResponse) {
    return response;
  }
  // const json = await data.json();
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return { json };
  } catch (e) {
    return { text };
  }
};
