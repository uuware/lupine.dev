function getEnv(key: string, defaultValue: number): number;
function getEnv(key: string, defaultValue: string): string;
function getEnv(key: string, defaultValue: boolean): boolean;
function getEnv(key: string, defaultValue: object): object;
function getEnv(key: string, defaultValue: any): any {
  if (typeof process.env[key] === 'undefined') {
    return defaultValue;
  }

  if (typeof defaultValue === 'number') {
    return Number.parseInt(process.env[key]!);
  }
  if (typeof defaultValue === 'boolean') {
    return process.env[key]!.toLocaleLowerCase() === 'true' || process.env[key] === '1';
  }
  if (typeof defaultValue === 'object') {
    try {
      return JSON.parse(process.env[key]!);
    } catch (error) {}
    return defaultValue;
  }
  // if (typeof defaultValue === 'string') {
  //   return process.env[key];
  // }
  return process.env[key];
}
export { getEnv };
