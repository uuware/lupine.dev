import { ServerResponse } from 'http';
import { FsUtils, Logger, apiCache, ServerRequest, ApiHelper, langHelper } from 'lupine.api';
import { decryptJson, encryptJson, getUserFromCookie } from './user-api';
import fsPromises from 'fs/promises';
import path from 'path';
import { sendFile } from './file-api-base';

const MAX_FILE_SIZE = 1024 * 1024 * 50; // 50MB
const logger = new Logger('qa');

export const addCfgFile = async (req: ServerRequest, res: ServerResponse) => {
  const data = req.locals.body;
  if (!data) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const loginJson = await getUserFromCookie(req, res, true);
  if (!loginJson || loginJson.t !== 'admin') {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:permission_denied'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const key = req.locals.query.get('key') as string;
  const chunkNumberStr = req.locals.query.get('chunkNumber') as string;
  const chunkNumber = parseInt(chunkNumberStr);
  const totalChunks = parseInt(req.locals.query.get('totalChunks') as string);
  const decryptedKey = key && decryptJson(key.replace(/ /g, '+'));
  const fname = req.locals.query.get('fn') as string;
  if (
    !fname ||
    fname.indexOf('..') >= 0 ||
    fname.indexOf('/') >= 0 ||
    fname.indexOf('\\') >= 0 ||
    !chunkNumberStr ||
    !totalChunks ||
    (chunkNumber !== 0 && (!decryptedKey || decryptedKey.ind !== chunkNumber || decryptedKey.cnt !== totalChunks))
  ) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  if (totalChunks * data.length > MAX_FILE_SIZE) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:file_too_large'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const appData = apiCache.getAppData();
  const dataPath = appData.dataPath + '/cfg-files/';
  if (!(await FsUtils.pathExist(dataPath))) {
    await FsUtils.pathMkdir(dataPath);
  }
  const filename = dataPath + fname;
  // write data to a file
  if (chunkNumber === 0) {
    await fsPromises.writeFile(filename, data, 'binary');
  } else {
    await fsPromises.appendFile(filename, data, 'binary');
  }

  const response = {
    status: 'ok',
    chunkNumber,
    totalChunks,
    message: langHelper.getLang('shared:file_uploaded'),
    key: encryptJson({
      ind: chunkNumber + 1,
      cnt: totalChunks,
      t: new Date().getTime(),
    }),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const serveCfgImage = async (req: ServerRequest, res: ServerResponse) => {
  const id = req.locals.urlParameters.get('id', '');
  if (!id || id.indexOf('..') >= 0 || id.indexOf('/') >= 0 || id.indexOf('\\') >= 0) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const appData = apiCache.getAppData();
  const filename = path.join(appData.dataPath, 'cfg-files', id);
  if (!(await FsUtils.pathExist(filename))) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:file_not_found'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  await sendFile(req, res, filename);
  return true;
};
