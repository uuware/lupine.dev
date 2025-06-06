// This class is used by both BE and FE (cookie for SSR).
export interface ISimpleStorage {
  contains(key: string): boolean;
  set(key: string, value: string): void;
  get(key: string, defaultValue: string): string;
  getInt(key: string, defaultValue: number): number;
  getBoolean(key: string, defaultValue: boolean): boolean;
  getJson(key: string, defaultValue: object): object;
}
