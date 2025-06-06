import * as fs from 'fs/promises';
import { ISimpleStorage, SimpleStorageDataProps } from '../models/simple-storage-props';

// This class is used by both BE and FE (cookie for SSR).
export class SimpleStorage implements ISimpleStorage {
  private settings: SimpleStorageDataProps = {};
  private dirty: boolean = false;

  constructor(settings: SimpleStorageDataProps) {
    this.settings = settings;
  }

  setContent(settings: SimpleStorageDataProps) {
    this.settings = settings;
    this.dirty = true;
  }
  async saveContent(filePath: string) {
    await fs.writeFile(filePath, JSON.stringify(this.settings));
    this.dirty = false;
  }

  set Dirty(dirty: boolean) {
    this.dirty = dirty;
  }
  get Dirty(): boolean {
    return this.dirty;
  }

  contains(key: string): boolean {
    return key in this.settings;
  }
  size(): number {
    return Object.keys(this.settings).length;
  }
  set(key: string, value: string) {
    this.dirty = true;
    if (typeof value === 'undefined') {
      delete this.settings[key];
    } else {
      this.settings[key] = value;
    }
  }

  getWithPrefix(prefixKey: string): SimpleStorageDataProps {
    // get all key startswith prefixKey
    const result: SimpleStorageDataProps = {};
    for (let key in this.settings) {
      if (key.startsWith(prefixKey)) {
        result[key] = this.settings[key];
      }
    }
    return result;
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
