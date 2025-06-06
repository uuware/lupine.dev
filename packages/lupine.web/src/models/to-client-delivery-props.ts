import { ISimpleStorage } from './simple-storage-props';

export interface IToClientDelivery {
  getWebEnv(): { [k: string]: string };
  getWebSetting(): { [k: string]: string };
  getServerCookie(): ISimpleStorage;
  // getLang(): { [k: string]: string };
}
