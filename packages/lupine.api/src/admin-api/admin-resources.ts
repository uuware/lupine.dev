import { ServerResponse } from 'http';
import * as fs from 'fs/promises';
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
} from 'lupine.api';
import path from 'path';
import { needDevAdminSession } from './admin-auth';

export class AdminResources implements IApiBase {
  private logger = new Logger('resources-api');
  protected router = new ApiRouter();

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    // called by FE
    this.router.use('/data', needDevAdminSession, this.data.bind(this));
    this.router.use('/download', needDevAdminSession, this.download.bind(this));
    this.router.use('/upload', needDevAdminSession, this.upload.bind(this));
    this.router.use('/rename', needDevAdminSession, this.rename.bind(this));
    this.router.use('/remove', needDevAdminSession, this.remove.bind(this));
  }

  async upload(req: ServerRequest, res: ServerResponse) {
    const fPath = req.locals.query.get('p');
    const fName = req.locals.query.get('n');
    const data = req.locals.body;
    if (!data || data.length < 1 || !fPath || !fName) {
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:wrong_data'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    const appData = apiCache.getAppData();
    const locPath = this.pathJoin(fPath, appData.realPath);
    if (!(await FsUtils.pathExist(locPath))) {
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:wrong_data'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    const key = req.locals.query.get('key') as string;
    const chunkNumberStr = req.locals.query.get('chunkNumber') as string;
    const chunkNumber = parseInt(chunkNumberStr);
    const totalChunks = parseInt(req.locals.query.get('totalChunks') as string);
    const decryptedKey = key && adminHelper.decryptJson(key.replace(/ /g, '+'));
    const keyNG =
      !chunkNumberStr ||
      !totalChunks ||
      (chunkNumber !== 0 && (!decryptedKey || decryptedKey.ind !== chunkNumber || decryptedKey.cnt !== totalChunks));
    if (keyNG) {
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:permission_denied'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }
    const MAX_FILE_SIZE = 1024 * 1024 * 800; // MB
    if (totalChunks * data.length > MAX_FILE_SIZE) {
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:file_too_large'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    const filename = path.join(fPath, fName);
    // write data to a file
    if (chunkNumber === 0) {
      await fs.writeFile(filename, data, 'binary');
    } else {
      await fs.appendFile(filename, data, 'binary');
    }

    const response = {
      status: 'ok',
      chunkNumber,
      totalChunks,
      message: langHelper.getLang('shared:file_part_updated'),
      key: adminHelper.encryptJson({ ind: chunkNumber + 1, cnt: totalChunks, t: new Date().getTime() }),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  private chkData(data: any, req: ServerRequest, res: ServerResponse, chkCredential: boolean) {
    if (!data || Array.isArray(data) || typeof data !== 'object') {
      this.logger.error(`chkData, missing parameters`, data);
      const response = {
        status: 'error',
        message: 'Wrong data [missing parameters].', //langHelper.getLang('shared:wrong_data'),
      };
      ApiHelper.sendJson(req, res, response);
      return false;
    }
    return data;
  }

  private async getFolders(locPath: string) {
    const results: any[] = [];
    const folders = await FsUtils.getListNames(locPath);

    results.push({
      fullPath: locPath,
    });
    for (let i = 0; i < folders.length; i++) {
      const oneFolder = folders[i];
      const fileInfo = await FsUtils.fileInfo(path.join(locPath, oneFolder));
      if (fileInfo?.isFile) {
        results.push({
          name: oneFolder,
          time: new Date(fileInfo!.mtime).toLocaleString(),
          size: fileInfo?.size,
        });
      } else {
        const subFolders = await FsUtils.getListNames(path.join(locPath, oneFolder));
        const subFoldersWithTime = [];
        for (let j = 0; j < subFolders.length; j++) {
          const subFile = subFolders[j];
          const fileInfo2 = await FsUtils.fileInfo(path.join(locPath, oneFolder, subFile));

          if (fileInfo2?.isFile) {
            subFoldersWithTime.push({
              name: subFile,
              time: new Date(fileInfo2.mtime).toLocaleString(),
              size: fileInfo2?.size,
            });
          } else {
            subFoldersWithTime.push({
              name: subFile,
              time: fileInfo2?.mtime && new Date(fileInfo2.mtime).toLocaleString(),
            });
          }
        }
        results.push({
          name: oneFolder,
          time: fileInfo?.mtime && new Date(fileInfo.mtime).toLocaleString(),
          items: subFoldersWithTime,
        });
      }
    }
    return results;
  }

  private pathJoin(folder: string, apiPath: string) {
    return folder !== '/' && folder !== '' && (folder.startsWith('/') || folder.startsWith('\\') || folder[1] === ':')
      ? path.join(folder)
      : path.join(apiPath, folder);
  }

  async data(req: ServerRequest, res: ServerResponse) {
    const data = this.chkData(req.locals.json(), req, res, false);
    if (!data) return true;
    let results: any[] = [];
    if (typeof data.folder === 'string') {
      const appData = apiCache.getAppData();
      const locPath = this.pathJoin(data.folder, appData.realPath);
      results = await this.getFolders(locPath);
    }
    const response = {
      status: 'ok',
      message: 'OK',
      results,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // called by clients
  async download(req: ServerRequest, res: ServerResponse) {
    const data = this.chkData(req.locals.json(), req, res, true);
    if (!data) return true;

    if (typeof data.resource === 'string') {
      const resPath = path.join(data.resource);
      if (await FsUtils.pathExist(resPath)) {
        ApiHelper.sendFile(req, res, resPath);
        return true;
      }
    }
    const response = {
      status: 'error',
      message: 'Resource not found',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async rename(req: ServerRequest, res: ServerResponse) {
    const data = this.chkData(req.locals.json(), req, res, true);
    if (!data) return true;

    if (typeof data.resource === 'string' && data.oldName && data.newName) {
      const resPath = path.join(data.resource);
      const basePath = path.dirname(resPath);
      const oldPath = path.join(basePath, data.oldName);
      if (await FsUtils.pathExist(oldPath)) {
        const newPath = path.join(basePath, data.newName);
        await FsUtils.renamePath(oldPath, newPath);
        if (await FsUtils.pathExist(newPath)) {
          const response = {
            status: 'ok',
            message: 'Resource renamed to ' + newPath,
          };
          ApiHelper.sendJson(req, res, response);
        } else {
          const response = {
            status: 'error',
            message: 'Resource not renamed',
          };
          ApiHelper.sendJson(req, res, response);
        }
        return true;
      }
    }
    const response = {
      status: 'error',
      message: 'Resource not found',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async remove(req: ServerRequest, res: ServerResponse) {
    const data = this.chkData(req.locals.json(), req, res, true);
    if (!data) return true;

    if (typeof data.resource === 'string') {
      const resPath = path.join(data.resource);
      if (await FsUtils.pathExist(resPath)) {
        await FsUtils.unlinkPath(resPath);
        const response = {
          status: 'ok',
          message: 'Resource removed',
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
    }
    const response = {
      status: 'error',
      message: 'Resource not found',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
}
