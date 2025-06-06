export const padRight = (str: string, length: number, fillString: string) => {
  return str.padEnd(length, fillString);
};
export const padLeft = (str: string, length: number, fillString: string) => {
  return str.padStart(length, fillString);
};
