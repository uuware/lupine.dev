// This class is used by both BE and FE (cookie for SSR).
export class SimpleStorage {
  private settings: { [key: string]: string } = {};

  constructor(settings: { [key: string]: string }) {
    this.settings = settings;
  }

  contains(key: string): boolean {
    return key in this.settings;
  }
  set(key: string, value: string) {
    return (this.settings[key] = value);
  }
  get(key: string, defaultValue: string): string {
    return key in this.settings ? this.settings[key] : defaultValue;
  }
  getInt(key: string, defaultValue: number): number {
    if (key in this.settings) {
      const i = parseInt(this.settings[key]);
      if (!isNaN(i)) {
        return i;
      }
    }
    return defaultValue;
  }
  getBoolean(key: string, defaultValue: boolean): boolean {
    return key in this.settings
      ? this.settings[key] === '1' || this.settings[key].toLowerCase() === 'true'
      : defaultValue;
  }
  getJson(key: string, defaultValue: object): object {
    if (key in this.settings) {
      try {
        return JSON.parse(this.settings[key]);
      } catch (error) {}
    }
    return defaultValue;
  }
}
