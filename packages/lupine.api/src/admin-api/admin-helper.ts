import { ServerResponse } from 'http';
import { ApiHelper } from '../api';
import { CryptoUtils, Logger } from '../lib';
import { ServerRequest } from '../models';

/*
dev-admin uses different authentication method from frontend.
dev-admin only provides fixed username and password authentication, no user maintenance.
saved cookie name: _token_dev
*/

// DEFAULT_ADMIN_PASS is DEFAULT_ADMIN_NAME + ':' + login password hash.
// Use below command to generate hash:
// node -e "console.log(require('crypto').createHash('md5').update('admin:F4AZ5O@2fPUjw%f$LmhZpJTQ^DoXnWPkH#hqE', 'utf8').digest('hex'))"
export type DevAdminSessionProps = {
  u: string; // username
  t: string; // type: admin, user
  ip: string;
  h: string; // md5 of name+pass
};

export const DEV_ADMIN_TYPE = 'dev-admin';
export const DEV_ADMIN_CRYPTO_KEY_NAME = 'DEV_CRYPTO_KEY';
export const DEV_ADMIN_SESSION_NAME = '_token_dev';
export class AdminHelper {
  private static instance: AdminHelper;
  private logger = new Logger('admin-api');

  private constructor() {}

  public static getInstance(): AdminHelper {
    if (!AdminHelper.instance) {
      AdminHelper.instance = new AdminHelper();
    }
    return AdminHelper.instance;
  }

  decryptJson(text: string) {
    const cryptoKey = process.env[DEV_ADMIN_CRYPTO_KEY_NAME];
    if (cryptoKey && text) {
      try {
        const deCrypto = CryptoUtils.decrypt(text, cryptoKey);
        const json = JSON.parse(deCrypto);
        return json;
      } catch (error: any) {
        this.logger.error(error.message);
      }
    }
    return false;
  }

  encryptJson(jsonOrText: string | object) {
    const cryptoKey = process.env[DEV_ADMIN_CRYPTO_KEY_NAME];
    if (cryptoKey && jsonOrText) {
      try {
        const text = typeof jsonOrText === 'string' ? jsonOrText : JSON.stringify(jsonOrText);
        const encryptText = CryptoUtils.encrypt(text, cryptoKey);
        return encryptText;
      } catch (error: any) {
        this.logger.error(error.message);
      }
    }
    return false;
  }

  async getDevAdminFromCookie(
    req: ServerRequest,
    res: ServerResponse,
    sendResponseWhenError = true
  ): Promise<DevAdminSessionProps | false> {
    try {
      const cookies = req.locals.cookies();
      const token = cookies.get(DEV_ADMIN_SESSION_NAME, '');
      if (token) {
        const json = this.decryptJson(token) as DevAdminSessionProps;
        if (!json || json.t !== DEV_ADMIN_TYPE) {
          if (sendResponseWhenError) {
            const response = {
              status: 'error',
              message: 'Wrong session data, contact site admin please.',
            };
            ApiHelper.sendJson(req, res, response);
          }
          return false;
        }

        // if it's special admin
        if (json.h && json.u === process.env['DEV_ADMIN_USER']) {
          const hash = CryptoUtils.hash(process.env['DEV_ADMIN_USER'] + ':' + process.env['DEV_ADMIN_PASS']);
          if (json.h === hash) {
            return json;
          }
        }
        return false;
      }
    } catch (error: any) {
      this.logger.error(error.message);
    }
    if (sendResponseWhenError) {
      const response = {
        status: 'error',
        message: 'Please login to use this system.',
      };
      ApiHelper.sendJson(req, res, response);
    }
    return false;
  }
}

// add comment for tree shaking
export const adminHelper = /* @__PURE__ */ AdminHelper.getInstance();
