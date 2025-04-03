import { JsonObject } from 'lupine.api';

export const fetchData = async (urlWithoutHost: string, postData: string | JsonObject) => {
  const url = process.env['API_BASE_URL'] + urlWithoutHost;
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
