import { IApiBase, Logger, ServerRequest, ApiRouter, AdminApi } from 'lupine.api';
import {
  userLogin,
  userReg,
  getUserList,
  updateUser,
  blockUser,
  getUserInfo,
  sendUserNote,
  updateProfile,
  userActivation,
  userResetCode,
  userResetPw,
} from './user-api';
import { writeSetting } from './setting-api';
import { addCfgFile, serveCfgImage } from './admin-api';
import { ServerResponse } from 'http';

const logger = new Logger('api');

export class Api implements IApiBase {
  protected router = new ApiRouter();
  adminUser: any;

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    const adminApi = new AdminApi();
    this.router.use('/admin', adminApi.getRouter());

    this.router.use('/health-check', this.healthCheck.bind(this));

    this.router.use('/write-settings', writeSetting);
    this.router.use('/add-cfg-file', addCfgFile);
    this.router.use('/image/:id', serveCfgImage);

    this.router.use('/user-info', getUserInfo);
    this.router.use('/user-note', sendUserNote);
    this.router.use('/users', getUserList);
    this.router.use('/user-update', updateUser);
    this.router.use('/user-profile', updateProfile);
    this.router.use('/user-block', blockUser);

    this.router.use('/login', userLogin);
    this.router.use('/register', userReg);
    this.router.use('/user-activate', userActivation);
    this.router.use('/reset-code', userResetCode);
    this.router.use('/reset-pw', userResetPw);
  }

  async healthCheck(req: ServerRequest, res: ServerResponse) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        status: 'OK',
        message: 'Health Check Successful',
        memoryUsage: process.memoryUsage(),
      })
    );
    res.end();
    return true;
  }
}
