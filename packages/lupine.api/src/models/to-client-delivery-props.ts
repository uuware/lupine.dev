import { ISimpleStorage } from './simple-storage-props';

export interface IToClientDelivery {
  getWebEnv(): { [k: string]: string };
  getServerCookie(): ISimpleStorage;
}
