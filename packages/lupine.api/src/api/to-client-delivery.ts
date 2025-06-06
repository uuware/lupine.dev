import { IToClientDelivery } from '../models/to-client-delivery-props';
import { ISimpleStorage } from '../models/simple-storage-props';

export class ToClientDelivery implements IToClientDelivery {
  private webEnv: { [k: string]: string };
  private webSetting: { [k: string]: string };
  private cookies: ISimpleStorage;

  constructor(webEnv: { [k: string]: string }, webSetting: { [k: string]: string }, cookies: ISimpleStorage) {
    this.webEnv = webEnv;
    this.webSetting = webSetting;
    this.cookies = cookies;
  }

  public getWebEnv() {
    return this.webEnv;
  }

  public getWebSetting() {
    return this.webSetting;
  }

  public getServerCookie() {
    return this.cookies;
  }
}
