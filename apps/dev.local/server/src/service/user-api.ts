import { ServerResponse } from 'http';
import {
  DateUtils,
  CryptoUtils,
  Logger,
  apiCache,
  ServerRequest,
  ApiHelper,
  JsonKeyValue,
  langHelper,
  apiStorage,
} from 'lupine.api';
import { sendEmail, sendSiteEmail } from './send-email';

const PW_RETRY_MAX = 5;
const PW_RETRY_RESET_MINUTES = 15;
const logger = new Logger('user-api');

export type LoginJsonProps = {
  id: number; // user id
  u: string; // username
  t: string; // type: admin, user
  ip: string;
  h: string; // hash of name+pass
  r?: any; // record, user info after verification
};

export const decryptJson = (text: string) => {
  const cryptoKey = process.env['CRYPTO_KEY'];
  if (cryptoKey && text) {
    try {
      const deCrypto = CryptoUtils.decrypt(text, cryptoKey);
      const json = JSON.parse(deCrypto);
      return json;
    } catch (error: any) {
      logger.error(error.message);
    }
  }
  return false;
};
export const encryptJson = (jsonOrText: string | object) => {
  const cryptoKey = process.env['CRYPTO_KEY'];
  if (cryptoKey && jsonOrText) {
    try {
      const text = typeof jsonOrText === 'string' ? jsonOrText : JSON.stringify(jsonOrText);
      const encryptText = CryptoUtils.encrypt(text, cryptoKey);
      return encryptText;
    } catch (error: any) {
      logger.error(error.message);
    }
  }
  return false;
};

export const getUserFromCookie = async (
  req: ServerRequest,
  res: ServerResponse,
  sendResponseWhenError = true
): Promise<LoginJsonProps | false> => {
  try {
    const cookies = req.locals.cookies();
    const token = cookies.get('_token', '');
    if (token) {
      const json = decryptJson(token) as LoginJsonProps;
      if (!json || !json.u) {
        if (sendResponseWhenError) {
          const response = {
            status: 'error',
            message: langHelper.getLang('shared:not_logged_in'),
          };
          ApiHelper.sendJson(req, res, response);
        }
        return false;
      }
      // if it's special admin
      if (json.h && json.u === process.env['ADMIN_USER'] && process.env['ADMIN_PASS']) {
        const specialToken = CryptoUtils.hash((process.env['ADMIN_USER'] + ':' + process.env['ADMIN_PASS']) as string);
        if (json.h === specialToken) {
          json.r = {
            id: 0,
            email: json.u,
            username: json.u,
            nickname: json.u,
            usertype: json.t,
          };
          return json;
        }
      }

      // verify whether the user is blocked
      const db = apiCache.getDb();
      const record = await db.selectObject('$__s_user', ['*'], {
        username: json.u,
      });
      if (!record || record.length !== 1 || record[0].block === '1') {
        const msg =
          !record || record.length !== 1
            ? langHelper.getLang('shared:user_not_found')
            : langHelper.getLang('shared:user_locked');
        if (sendResponseWhenError) {
          const response = {
            status: 'error',
            message: msg,
          };
          ApiHelper.sendJson(req, res, response);
        }
        return false;
      }

      // when user changes password, the cookie info will be invalid
      const nameAndPassHash = CryptoUtils.hash(((record[0].username as string) + ':' + record[0].password) as string);
      if (json.h !== nameAndPassHash) {
        if (sendResponseWhenError) {
          const response = {
            status: 'error',
            message: langHelper.getLang('shared:wrong_hash'),
          };
          ApiHelper.sendJson(req, res, response);
        }
        return false;
      }
      json.r = record[0];
      return json;
    }
  } catch (error: any) {
    logger.error(error.message);
  }
  if (sendResponseWhenError) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:not_logged_in'),
    };
    ApiHelper.sendJson(req, res, response);
  }
  return false;
};

export const getUserInfo = async (req: ServerRequest, res: ServerResponse) => {
  const loginJson = await getUserFromCookie(req, res, true);
  if (!loginJson) {
    return true;
  }

  const user = loginJson.r;
  const response = {
    status: 'ok',
    results: {
      id: user.id,
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      usertype: user.usertype,
    },
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const getUserList = async (req: ServerRequest, res: ServerResponse) => {
  const db = apiCache.getDb();
  const loginJson = await getUserFromCookie(req, res, true);
  if (!loginJson) {
    return true;
  }
  if (loginJson.t !== 'admin') {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:permission_denied'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const users = await db.selectObject('$__s_user', undefined, undefined);
  const response = {
    status: 'ok',
    results: users,
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const needLoginSession = async (req: ServerRequest, res: ServerResponse) => {
  const cryptoKey = process.env['CRYPTO_KEY'];
  if (!cryptoKey) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:crypto_key_not_set', {
        cryptoKey: 'CRYPTO_KEY',
      }),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // TODO: secure and httpOnly cookies
  const json = await getUserFromCookie(req, res, false);
  if (json && json.u) {
    // the session has logged in info, so continue to process the request
    return false;
  }

  const response = {
    status: 'error',
    message: langHelper.getLang('shared:not_logged_in'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const userLogin = async (req: ServerRequest, res: ServerResponse) => {
  const db = apiCache.getDb();
  const cryptoKey = process.env['CRYPTO_KEY'];
  if (!cryptoKey) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:crypto_key_not_set', {
        cryptoKey: 'CRYPTO_KEY',
      }),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // TODO: secure and httpOnly cookies
  // when login without username and password, use cookie info
  const data = req.locals.json();
  if (!data || Array.isArray(data) || !data.u || (!data.p && !data.c)) {
    const cookies = req.locals.cookies();
    const token = cookies.get('_token', '');
    if (token) {
      const loginJson = await getUserFromCookie(req, res, false);
      if (loginJson) {
        const response = {
          status: 'ok',
          message: langHelper.getLang('shared:login_success'),
          result: token,
          user: {
            u: loginJson.u,
            t: loginJson.t,
          },
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
    }
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:not_logged_in'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  if (process.env['ADMIN_PASS'] && data.u === process.env['ADMIN_USER'] && data.p === process.env['ADMIN_PASS']) {
    const specialToken = CryptoUtils.hash((process.env['ADMIN_USER'] + ':' + process.env['ADMIN_PASS']) as string);
    const loginJson: LoginJsonProps = {
      ip: req.socket.remoteAddress as string,
      id: 0,
      u: data.u as string,
      t: 'admin',
      h: specialToken,
    };

    const token = JSON.stringify(loginJson);
    const tokenCookie = CryptoUtils.encrypt(token, cryptoKey);
    const response = {
      status: 'ok',
      message: langHelper.getLang('shared:login_success'),
      result: tokenCookie,
      user: {
        u: loginJson.u,
        t: loginJson.t,
      },
    };

    // sameSite: 'none' needs secure=true
    req.locals.setCookie('_token', tokenCookie, {
      expireDays: 360,
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const result = await db.selectObject(
    '$__s_user',
    ['id', 'username', 'password', 'level', 'usertype', 'pwretry', 'activation', 'activated', 'lastvisitdate', 'block'],
    { username: data.u as string }
  );
  if (result && result.length === 1 && result[0].username === data.u) {
    if (result[0].block === '1') {
      const response = {
        status: 'error',
        action: 'block',
        message: langHelper.getLang('shared:user_locked'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    let loginOk = false;
    if (result[0].activated !== '1') {
      if (!data.c) {
        const response = {
          status: 'error',
          action: 'activate',
          message: langHelper.getLang('shared:user_not_activated'),
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
      if (result[0].activation.length < 6 || result[0].activation !== data.c) {
        const response = {
          status: 'error',
          message: langHelper.getLang('shared:wrong_activation'),
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
      loginOk = true;
    } else {
      if (data.c && (result[0].activation.length < 6 || result[0].activation !== data.c)) {
        const response = {
          status: 'error',
          message: langHelper.getLang('shared:wrong_activation'),
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
      loginOk = true;
    }

    // if retries exceed, don't allow login
    if (!loginOk && result[0].pwretry > PW_RETRY_MAX) {
      const lastvisitdate = DateUtils.fromJSONString(result[0].lastvisitdate);
      if (lastvisitdate && Date.now() - lastvisitdate.getTime() < 1000 * 60 * PW_RETRY_RESET_MINUTES) {
        const response = {
          status: 'error',
          action: 'pwretry',
          message: langHelper.getLang('shared:login_failed_too_many_times', {
            minutes: PW_RETRY_RESET_MINUTES,
          }),
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
      // reset pwretry and lastvisitdate time
      result[0].pwretry = 0;
      await db.updateObject(
        '$__s_user',
        { pwretry: 0, lastvisitdate: DateUtils.toJSONString(new Date()) },
        { username: data.u as string }
      );
    }

    if (!loginOk && result[0].password !== CryptoUtils.hash(data.p as string)) {
      await db.updateObject(
        '$__s_user',
        {
          pwretry: result[0].pwretry + 1,
          lastvisitdate: DateUtils.toJSONString(new Date()),
        },
        { username: data.u as string }
      );
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:login_failed'),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    await db.updateObject(
      '$__s_user',
      { pwretry: 0, activation: '', activated: '1', lastvisitdate: DateUtils.toJSONString(new Date()) },
      { username: data.u as string }
    );
    const nameAndPassHash = CryptoUtils.hash(((result[0].username as string) + ':' + result[0].password) as string);
    const loginJson: LoginJsonProps = {
      ip: req.socket.remoteAddress as string,
      id: result[0].id,
      u: result[0].username,
      t: result[0].usertype,
      h: nameAndPassHash,
    };

    const token = JSON.stringify(loginJson);
    const tokenCookie = CryptoUtils.encrypt(token, cryptoKey);
    const response = {
      status: 'ok',
      message: langHelper.getLang('shared:login_success'),
      result: tokenCookie,
      user: {
        u: loginJson.u,
        t: loginJson.t,
      },
    };
    req.locals.setCookie('_token', tokenCookie, {
      expireDays: 360,
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    });
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const response = {
    status: 'error',
    message: langHelper.getLang('shared:login_failed'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const userLogout = async (req: ServerRequest, res: ServerResponse) => {
  req.locals.setCookie('_token', '', { expireDays: 360, path: '/', httpOnly: false, secure: true, sameSite: 'none' });
  ApiHelper.sendJson(req, res, { status: 'ok', message: 'Logged out.' });
  return true;
};

export const userReg = async (req: ServerRequest, res: ServerResponse) => {
  const db = apiCache.getDb();
  const cryptoKey = process.env['CRYPTO_KEY'];
  if (!cryptoKey) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:crypto_key_not_set', {
        cryptoKey: 'CRYPTO_KEY',
      }),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // TODO: secure and httpOnly cookies
  const data = req.locals.json();
  if (!data || Array.isArray(data) || !data.u || !data.p || !data.preferredName || !data.sex) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  if (req.locals.body && req.locals.body.length > 1024) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(data.u as string)) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_email_format'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const result = await db.selectObject('$__s_user', ['username'], {
    username: data.u as string,
  });
  if (result && result.length > 0) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:register_username_exists'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const lastvisitdate = DateUtils.toJSONString(new Date());
  // const random = CryptoUtils.randomString(16);
  const result2 = await db.insertObject('$__s_user', {
    nickname: data.preferredName as string,
    username: data.u as string,
    email: data.u as string,
    password: CryptoUtils.hash(data.p as string),
    gender: data.sex as string,
    usertype: 'user',
    registerdate: lastvisitdate,
    lastvisitdate: lastvisitdate,
    activated: '0', // '' or 0: not activated, 1: activated
    activation: '',
  });
  if (!result2) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:register_failed'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  // const currentSettings = AppConfig.get(AppConfig.WEB_SETTINGS_KEY);
  // const siteUrl = currentSettings['siteUrl'] || 'https://your-site.com';
  // const siteUrl = (await apiStorage.getWeb('siteUrl')) || 'https://your-site.com';

  // const regEmailTitle = 'activate your account';
  // const body = `Please click the link to activate your account: ${siteUrl}/api/user-activate?u=${data.u}&a=${random}`;
  // sendEmail(data.u as string, regEmailTitle, body);
  const response = {
    status: 'ok',
    message: langHelper.getLang('shared:register_success'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

// // Response is HTML page
// export const userActivation = async (req: ServerRequest, res: ServerResponse) => {
//   const userEmail = req.locals.query.get('u');
//   const activation = req.locals.query.get('a');
//   if (!userEmail || !activation || activation.length !== 32) {
//     const response = 'Wrong data.';
//     ApiHelper.sendHtml(req, res, response);
//     return true;
//   }

//   const db = apiCache.getDb();
//   const result = await db.selectObject('$__s_user', ['id', 'activation'], {
//     username: userEmail,
//   });
//   if (!result || result.length !== 1) {
//     const response = '<meta charset="utf-8" />Activation failed. User does not exist, please contact admin.';
//     ApiHelper.sendHtml(req, res, response);
//     return true;
//   }

//   if (result[0].activation !== activation) {
//     const response = '<meta charset="utf-8" />Activation failed. Activation code is incorrect, please contact admin.';
//     ApiHelper.sendHtml(req, res, response);
//     return true;
//   }

//   await db.updateObject('$__s_user', { activation: '' }, { username: userEmail });
//   const response = '<meta charset="utf-8" />Activation successful, please <a href="/login">login</a>.';
//   ApiHelper.sendHtml(req, res, response);
//   return true;
// };

export const userResetCode = async (req: ServerRequest, res: ServerResponse) => {
  const json = req.locals.json() as JsonKeyValue;
  const userEmail = json.u as string;
  if (!userEmail) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const db = apiCache.getDb();
  const result = await db.selectObject('$__s_user', ['id'], {
    username: userEmail,
  });
  if (!result || result.length !== 1) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:user_not_found'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const lastvisitdate = DateUtils.toJSONString(new Date());
  const random = CryptoUtils.randomNumberString(8);
  await db.updateObject('$__s_user', { activation: random, lastvisitdate: lastvisitdate }, { username: userEmail });

  const siteUrl = (await apiStorage.getWeb('siteUrl')) || 'https://your-site.com';
  const emailTitle = 'Authentication code';
  const body = `This is the authentication code [${random}] for your account at ${siteUrl}. Please copy this Authentication code to login or reset your password.`;
  sendEmail(userEmail, emailTitle, body);
  const response = {
    status: 'ok',
    message: langHelper.getLang('shared:send_and_copy_activation'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const userResetPw = async (req: ServerRequest, res: ServerResponse) => {
  const json = req.locals.json() as JsonKeyValue;
  const userEmail = json.u as string;
  const pass = json.p as string;
  const activation = json.a as string;
  if (!userEmail || !activation || activation.length !== 32 || !pass || pass.length < 6) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const db = apiCache.getDb();
  const result = await db.selectObject('$__s_user', ['id', 'activation'], {
    username: userEmail,
  });
  if (!result || result.length !== 1) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:user_not_found'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  if (result[0].activation !== activation) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_activation'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  await db.updateObject('$__s_user', { activation: '', password: CryptoUtils.hash(pass) }, { username: userEmail });
  const response = {
    status: 'ok',
    message: langHelper.getLang('shared:password_reset_success'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const updateUser = async (req: ServerRequest, res: ServerResponse) => {
  const loginJson = await getUserFromCookie(req, res, true);
  if (!loginJson || loginJson.t !== 'admin') {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:permission_denied'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const json = req.locals.json() as JsonKeyValue;
  const id = json.id as number;
  const usertype = json.usertype as string;
  const password = json.password as string;
  const db = apiCache.getDb();
  if (!id) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:wrong_data'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const updateObj: any = { usertype: usertype };
  if (password) {
    updateObj['password'] = CryptoUtils.hash(password);
  }
  // clear activation, only admin can update
  updateObj['activation'] = '';
  updateObj['activated'] = '1';
  updateObj['pwretry'] = 0;
  const result = await db.updateObject('$__s_user', updateObj, { id: id });
  const response = {
    status: 'ok',
    results: result,
    message: `Updated user.`,
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const updateProfile = async (req: ServerRequest, res: ServerResponse) => {
  const loginJson = await getUserFromCookie(req, res, true);
  if (!loginJson) {
    const response = {
      status: 'error',
      message: 'Permission denied.',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }
  // when special admin updates, nothing will be updated
  if (loginJson.t === 'admin' && loginJson.id === 0) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:no_update_for_special_user'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const json = req.locals.json() as JsonKeyValue;
  const nickname = json.nickname as string;
  const password = json.password as string;
  const db = apiCache.getDb();
  if (!nickname) {
    const response = {
      status: 'error',
      message: 'Wrong data.',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const updateObj: any = { nickname };
  if (password) {
    if (password.length < 6) {
      const response = {
        status: 'error',
        message: langHelper.getLang('shared:password_length_wrong', { len: 6 }),
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }
    updateObj['password'] = CryptoUtils.hash(password);
  }
  const result = await db.updateObject('$__s_user', updateObj, {
    id: loginJson.id,
  });
  const response = {
    status: 'ok',
    results: result,
    message: langHelper.getLang('shared:updated_profile'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const blockUser = async (req: ServerRequest, res: ServerResponse) => {
  const id = req.locals.query.get('id');
  const block = req.locals.query.get('block');
  const db = apiCache.getDb();
  const loginJson = await getUserFromCookie(req, res, true);
  if (!id || typeof block === 'undefined' || block === null || !loginJson || loginJson.t !== 'admin') {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:permission_denied'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  const result = await db.updateObject('$__s_user', { block: block }, { id: id });
  const response = {
    status: 'ok',
    results: result,
    message: `User lock updated to [${block}].`,
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};

export const sendUserNote = async (req: ServerRequest, res: ServerResponse) => {
  const loginJson = await getUserFromCookie(req, res, true);
  if (!loginJson) {
    return true;
  }

  const ty = req.locals.query.get('ty');
  const db = apiCache.getDb();
  const user = await db.selectObject('$__s_user', undefined, {
    id: loginJson.id,
  });
  if (!user || user.length !== 1 || !ty) {
    const response = {
      status: 'error',
      message: langHelper.getLang('shared:user_not_found'),
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  if (ty === 'deposit') {
    await sendSiteEmail(`user: ${user[0].username} has done a Deposit`, `user: ${user[0].username} has done a Deposit`);
  }
  if (ty === 'withdraw') {
    const points = req.locals.query.get('points');
    const account = req.locals.query.get('account');
    await sendSiteEmail(
      `user: ${user[0].username} requires Withdraw`,
      `user: ${user[0].username} requires Withdraw points: ${points} to account: ${account}`
    );
  }

  const response = {
    status: 'ok',
    message: langHelper.getLang('shared:send_email_notification'),
  };
  ApiHelper.sendJson(req, res, response);
  return true;
};
