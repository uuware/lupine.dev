import { Logger } from '../logger';
import { FsUtils } from './fs-utils';

const logger = new Logger('setting-file');

export type FileSettingProps = {
  [key: string]: string | number | boolean | object;
};

/**
 * A simple settings/config class for storing key/value pairs with persistence.
 */
export class FileSetting {
  private settings: FileSettingProps = {};

  constructor() {}

  async load(path: string) {
    let json;
    if ((json = await FsUtils.readFile(path))) {
      try {
        const jsonObject = JSON.parse(json);
        Object.assign(this.settings, jsonObject);
      } catch (e: any) {
        logger.error('Loading json file failed', e.message);
      }
    }
  }

  async save(path: string) {
    await FsUtils.writeFile(path, JSON.stringify(this.settings));
  }

  set(key: string, value: string | number | boolean | object | undefined) {
    if (value === undefined) {
      delete this.settings[key];
    } else {
      this.settings[key] = value;
    }
  }

  setAll(values: FileSettingProps) {
    for (let k in values) {
      this.settings[k] = values[k];
    }
  }

  get(key: string, defaultValue: string | number | boolean | object): string | number | boolean | object {
    return key in this.settings ? this.settings[key] : defaultValue;
  }

  get getAll(): FileSettingProps {
    return this.settings;
  }
}
