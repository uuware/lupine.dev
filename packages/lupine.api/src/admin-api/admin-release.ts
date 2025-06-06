import { ServerResponse } from 'http';
import {
  IApiBase,
  Logger,
  apiCache,
  ServerRequest,
  ApiRouter,
  ApiHelper,
  langHelper,
  FsUtils,
  adminHelper,
  processRefreshCache,
} from 'lupine.api';
import path from 'path';
import { needDevAdminSession } from './admin-auth';
import { adminTokenHelper } from './admin-token-helper';

export class AdminRelease implements IApiBase {
  private logger = new Logger('release-api');
  protected router = new ApiRouter();

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    // called by FE
    this.router.use('/check', needDevAdminSession, this.check.bind(this));
    this.router.use('/update', needDevAdminSession, this.update.bind(this));
    // called online or by clients
    this.router.use('/refresh-cache', needDevAdminSession, this.refreshCache.bind(this));

    // ...ByClient will verify credentials from post, so it doesn't need AdminSession
    this.router.use('/byClientCheck', this.byClientCheck.bind(this));
    this.router.use('/byClientUpdate', this.byClientUpdate.bind(this));
    this.router.use('/byClientRefreshCache', this.byClientRefreshCache.bind(this));
  }

  async refreshCache(req: ServerRequest, res: ServerResponse) {
    // check whether it's from online admin
    const json = await adminHelper.getDevAdminFromCookie(req, res, false);
    const jsonData = req.locals.json();
    if (json && jsonData && !Array.isArray(jsonData) && jsonData.isLocal) {
      await processRefreshCache(req);
      const response = {
        status: 'ok',
        message: 'Cache refreshed successfully.',
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    const data = await this.chkData(jsonData, req, res, true);
    if (!data) return true;

    let targetUrl = data.targetUrl as string;
    if (targetUrl.endsWith('/')) {
      targetUrl = targetUrl.slice(0, -1);
    }
    const remoteData = await fetch(targetUrl + '/api/admin/release/byClientRefreshCache', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const resultText = await remoteData.text();
    let remoteResult: any;
    try {
      remoteResult = JSON.parse(resultText);
    } catch (e: any) {
      remoteResult = { status: 'error', message: resultText };
    }
    const response = {
      status: 'ok',
      message: 'check.',
      ...remoteResult,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  public async chkData(data: any, req: ServerRequest, res: ServerResponse, chkCredential: boolean) {
    // add access token
    if (!data || Array.isArray(data) || typeof data !== 'object' || !data.accessToken || !data.targetUrl) {
      const response = {
        status: 'error',
        message: 'Wrong data [missing parameters].', //langHelper.getLang('shared:wrong_data'),
      };
      ApiHelper.sendJson(req, res, response);
      return false;
    }
    if (chkCredential) {
      if (await adminTokenHelper.validateToken(data.accessToken)) {
        return data;
      } else if (
        process.env['DEV_ADMIN_PASS'] !== '' &&
        data.accessToken === `${process.env['DEV_ADMIN_USER']}@${process.env['DEV_ADMIN_PASS']}`
      ) {
        return data;
      } else {
        const response = {
          status: 'error',
          message: 'Wrong data [wrong token].', //langHelper.getLang('shared:wrong_data'),
        };
        ApiHelper.sendJson(req, res, response);
        return false;
      }
    }
    return data;
  }

  // this is called by the FE, then call byClientCheck to get remote server's information
  async check(req: ServerRequest, res: ServerResponse) {
    const jsonData = req.locals.json();
    const data = await this.chkData(jsonData, req, res, false);
    if (!data) return true;

    // From app list is from local
    const appData = apiCache.getAppData();
    const folders = await FsUtils.getListNames(path.join(appData.apiPath, '..'));
    const apps = folders.filter((app: string) => app.endsWith('_web')).map((app: string) => app.replace('_web', ''));

    let targetUrl = data.targetUrl as string;
    if (targetUrl.endsWith('/')) {
      targetUrl = targetUrl.slice(0, -1);
    }
    const remoteData = await fetch(targetUrl + '/api/admin/release/byClientCheck', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const resultText = await remoteData.text();
    let remoteResult: any;
    try {
      remoteResult = JSON.parse(resultText);
    } catch (e: any) {
      remoteResult = { status: 'error', message: resultText };
    }
    const response = {
      status: 'ok',
      message: 'check.',
      appsFrom: apps,
      ...remoteResult,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // called by clients
  async byClientCheck(req: ServerRequest, res: ServerResponse) {
    const jsonData = req.locals.json();
    const data = await this.chkData(jsonData, req, res, true);
    if (!data) return true;

    const appData = apiCache.getAppData();
    const folders = await FsUtils.getListNames(path.join(appData.apiPath, '..'));
    const apps = folders.filter((app: string) => app.endsWith('_web')).map((app: string) => app.replace('_web', ''));

    const foldersWithTime = [];
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const subFolders = await FsUtils.getListNames(path.join(appData.apiPath, '..', folder));
      const subFoldersWithTime = [];
      for (let j = 0; j < subFolders.length; j++) {
        const subFolder = subFolders[j];
        const fileInfo = await FsUtils.fileInfo(path.join(appData.apiPath, '..', folder, subFolder));
        subFoldersWithTime.push({
          name: subFolder,
          time: new Date(fileInfo!.mtime).toLocaleString(),
          size: fileInfo?.size,
        });
      }
      const fileInfo = await FsUtils.fileInfo(path.join(appData.apiPath, '..', folder));
      foldersWithTime.push({
        name: folder,
        time: new Date(fileInfo!.mtime).toLocaleString(),
        items: subFoldersWithTime,
      });
    }

    // const logFolders = await FsUtils.getListNames(path.join(appData.apiPath, '../../log'));
    const response = {
      status: 'ok',
      message: 'Remote server information called from a client.',
      appData: appData as any,
      apps,
      folders,
      foldersWithTime,
      // logs: logFolders,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async update(req: ServerRequest, res: ServerResponse) {
    const jsonData = req.locals.json();
    const data = await this.chkData(jsonData, req, res, false);
    if (!data) return true;

    if (!data.chkServer && !data.chkApi && !data.chkWeb && !data.chkEnv) {
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:wrong_data'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    let targetUrl = data.targetUrl as string;
    if (targetUrl.endsWith('/')) {
      targetUrl = targetUrl.slice(0, -1);
    }
    if (data.chkEnv) {
      const result = await this.updateSendFile(data, '.env');
      if (!result || result.status !== 'ok') {
        ApiHelper.sendJson(req, res, result);
        return true;
      }
      const result2 = await this.updateSendFile(data, '.env.development');
      if (!result2 || result2.status !== 'ok') {
        ApiHelper.sendJson(req, res, result2);
        return true;
      }
      const result3 = await this.updateSendFile(data, '.env.production');
      if (!result3 || result3.status !== 'ok') {
        ApiHelper.sendJson(req, res, result3);
        return true;
      }
    }
    if (data.chkWeb) {
      const result = await this.updateSendFile(data, 'web');
      if (!result || result.status !== 'ok') {
        ApiHelper.sendJson(req, res, result);
        return true;
      }
    }
    if (data.chkApi) {
      const result = await this.updateSendFile(data, 'api');
      if (!result || result.status !== 'ok') {
        ApiHelper.sendJson(req, res, result);
        return true;
      }
    }
    // update server at the last
    if (data.chkServer) {
      const result = await this.updateSendFile(data, 'server');
      if (!result || result.status !== 'ok') {
        ApiHelper.sendJson(req, res, result);
        return true;
      }
    }

    const response = {
      status: 'ok',
      message: 'updated',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async updateSendFile(data: any, chkOption: string) {
    let targetUrl = data.targetUrl;
    if (targetUrl.endsWith('/')) {
      targetUrl = targetUrl.slice(0, -1);
    }
    const fromList = data.fromList;
    const appData = apiCache.getAppData();
    let sendFile = '';
    if (chkOption === 'server') {
      sendFile = path.join(appData.apiPath, '..', 'server', 'index.js');
    } else if (chkOption === 'api') {
      sendFile = path.join(appData.apiPath, '..', fromList + '_api', 'index.js');
    } else if (chkOption === 'web') {
      sendFile = path.join(appData.apiPath, '..', fromList + '_web', 'index.js');
    } else if (chkOption.startsWith('.env')) {
      sendFile = path.join(appData.apiPath, '../../..', chkOption);
    }
    const fileContent = (await FsUtils.readFile(sendFile))!;
    // const compressedContent = await new Promise<Buffer>((resolve, reject) => {
    //     zlib.gzip(fileContent, (err, buffer) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(buffer);
    //         }
    //     });
    // })
    const chunkSize = 1024 * 500;
    let cnt = 0;
    for (let i = 0; i < fileContent.length; i += chunkSize) {
      const chunk = fileContent.slice(i, i + chunkSize);
      if (!chunk) break;

      const postData = {
        method: 'POST',
        body: JSON.stringify({ ...data, chkOption, index: cnt, size: fileContent.length }) + '\n\n' + chunk,
      };
      this.logger.debug(`updateSendFile, index: ${cnt}, sending (max): ${i + chunkSize} / ${fileContent.length}`);
      const remoteData = await fetch(targetUrl + '/api/admin/release/byClientUpdate', postData);
      const resultText = await remoteData.text();
      let remoteResult: any;
      try {
        remoteResult = JSON.parse(resultText);
      } catch (e: any) {
        remoteResult = { status: 'error', message: resultText };
      }
      if (!remoteResult || remoteResult.status !== 'ok') {
        return remoteResult;
      }
      cnt++;
    }

    const remoteResult = { status: 'ok', message: 'updated' };
    return remoteResult;
  }

  // called by clients
  async byClientUpdate(req: ServerRequest, res: ServerResponse) {
    const body = req.locals.body as Buffer;
    let jsonData = {};
    let fileContent = null;
    try {
      const index = body.indexOf('\n\n');
      if (index !== -1) {
        jsonData = JSON.parse(body.subarray(0, index).toString());
        fileContent = body.subarray(index + 2);
      }
      const data = await this.chkData(jsonData, req, res, true);
      if (!data) return true;

      const toList = data.toList as string;
      const chkOption = data.chkOption as string;
      if (
        !chkOption ||
        !toList ||
        (chkOption !== 'server' && chkOption !== 'api' && chkOption !== 'web' && !chkOption.startsWith('.env'))
      ) {
        const response = {
          status: 'error',
          message: 'Wrong data.',
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }

      const appData = apiCache.getAppData();
      let saveFile = '';
      if (chkOption === 'server') {
        saveFile = path.join(appData.apiPath, '..', 'server', 'index.js');
      } else if (chkOption === 'api') {
        saveFile = path.join(appData.apiPath, '..', toList + '_api', 'index.js');
      } else if (chkOption === 'web') {
        saveFile = path.join(appData.apiPath, '..', toList + '_web', 'index.js');
      } else if ((chkOption as string).startsWith('.env')) {
        saveFile = path.join(appData.apiPath, '../../..', chkOption);
      }
      if (data.chkBackup && data.index === 0) {
        const bakContent = await FsUtils.readFile(saveFile);
        if (bakContent) {
          const bakFile = saveFile + '.bak-' + new Date().toISOString().replace(/:/g, '-');
          await FsUtils.writeFile(bakFile, bakContent);
        }
      }
      if (data.index === 0) {
        await FsUtils.writeFile(saveFile, fileContent || '');
      } else {
        await FsUtils.appendFile(saveFile, fileContent || '');
      }

      const response = {
        status: 'ok',
        message: 'Remote server updated by a client.',
      };
      ApiHelper.sendJson(req, res, response);
    } catch (e: any) {
      console.log('byClientUpdate failed', e);
      const response = {
        status: 'error',
        message: 'byClientUpdate failed',
      };
      ApiHelper.sendJson(req, res, response);
    }
    return true;
  }

  async byClientRefreshCache(req: ServerRequest, res: ServerResponse) {
    const jsonData = req.locals.json();
    const data = await this.chkData(jsonData, req, res, true);
    if (!data) return true;

    await processRefreshCache(req);
    const response = {
      status: 'ok',
      message: 'Cache refreshed successfully.',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
}
