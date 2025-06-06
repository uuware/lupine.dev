exports.sendRequest = async (url, waitSeconds) => {
  try {
    // need node 18
    const ret = await fetch(url, {
      signal: AbortSignal.timeout(waitSeconds * 1000),
    });
    waitSeconds > 0 && (await new Promise((r) => setTimeout(r, waitSeconds * 1000)));
    return ret;
  } catch (err) {
    console.error('sendRequest error: ', err);
  }
};
