/*
delay(3000).then(() => alert('runs after 3 seconds'));
or
await delay(3000);
*/
export const delay = (ms: number) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
