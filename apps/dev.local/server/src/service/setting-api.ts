import { ServerResponse } from 'http';
import { deepMerge, Logger, AppConfig, ServerRequest, ApiHelper, langHelper } from 'lupine.api';
import { getUserFromCookie } from './user-api';

// const logger = new Logger('cfg-api');

export const readSetting = async (req: ServerRequest, res: ServerResponse) => {
  const data = req.locals.json();
  const loginJson = await getUserFromCookie(req, res, true);
  if (!data || Array.isArray(data) || typeof data !== 'object' || !loginJson || loginJson.t !== 'admin') {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:permission_denied'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // overwrite all webSettings
  const currentSettings = AppConfig.get(AppConfig.WEB_SETTINGS_KEY);
  const newSettings = deepMerge(currentSettings, data);
  AppConfig.set(AppConfig.WEB_SETTINGS_KEY, newSettings);
  AppConfig.save();

  const response = {
    status: 'ok',
    message: langHelper.getLang('shared:configuration_updated'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const writeSetting = async (req: ServerRequest, res: ServerResponse) => {
  const data = req.locals.json();
  const loginJson = await getUserFromCookie(req, res, true);
  if (!data || Array.isArray(data) || typeof data !== 'object' || !loginJson || loginJson.t !== 'admin') {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:permission_denied'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // overwrite all webSettings
  const currentSettings = AppConfig.get(AppConfig.WEB_SETTINGS_KEY);
  const newSettings = deepMerge(currentSettings, data);
  AppConfig.set(AppConfig.WEB_SETTINGS_KEY, newSettings);
  AppConfig.save();

  const response = {
    status: 'ok',
    message: langHelper.getLang('shared:configuration_updated'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};
