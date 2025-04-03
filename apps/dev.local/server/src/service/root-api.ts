import { IApiBase, Logger, StaticServer, ApiRouter, langHelper } from 'lupine.api';
import { Api } from './api';
import { apiLangEn } from '../lang/api-lang-en';
import { apiLangZhCn } from '../lang/api-lang-zh-cn';

const logger = new Logger('root-api');
export class RootApi implements IApiBase {
  protected router = new ApiRouter();

  constructor() {
    langHelper.addLang(apiLangEn);
    langHelper.addLang(apiLangZhCn);
    logger.info('RootApi is loaded.');
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    this.router.use('/api', new Api().getRouter());

    const staticServer = new StaticServer();
    this.router.use('*', staticServer.processRequest.bind(staticServer));
  }
}
