/**
 * Sample:
 *   const domUniqueId = uniqueIdGenerator('lj');
 *   const id1 = domUniqueId();
 *   const id2 = domUniqueId();
 * @param preKey
 * @returns A function to generate Unique Ids
 */
// export function uniqueIdGenerator2(preKey: string) {
//   let count = 0;
//   let diff = '';
//   return function (reset = false): string {
//     if (reset) {
//       count = 0;
//       diff = '';
//     }
//     if (count > 9999999999999999) {
//       count = 0;
//       diff = Math.round(new Date().getTime() / 1000).toString(36) + '-';
//     }
//     count++;
//     return `${preKey}${diff}${count.toString(36)}`;
//   };
// }

export function uniqueIdGenerator(preKey: string) {
  let count = 0;
  let lastKey = Math.round(new Date().getTime() / 1000).toString(36);
  return function (): string {
    const key = Math.round(new Date().getTime() / 1000).toString(36);
    if (key !== lastKey) {
      count = 0;
      lastKey = key;
    } else {
      count++;
    }
    return `${preKey}${lastKey}${count.toString(36)}`;
  };
}
