import { ServerResponse } from 'http';
import { IApiBase, Logger, apiCache, ServerRequest, ApiRouter, ApiHelper } from 'lupine.api';

const logger = new Logger('admin-menu');
export class AdminMenu implements IApiBase {
  protected router = new ApiRouter();
  adminUser: any;

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    this.router.use('/list', this.list.bind(this));
    this.router.use('/add', this.add.bind(this));
    this.router.use('/save', this.save.bind(this));
    this.router.use('/get/:id', this.getRecord.bind(this));
    this.router.use('/delete/:id', this.delete.bind(this));
  }

  async list(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const result = await db.selectObject('$__s_menu');
    const response = {
      status: Array.isArray(result) ? 'ok' : 'error',
      message: 'Menu List.',
      result: result,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async add(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const data = req.locals.json() as any;
    delete data['id'];
    const result = await db.insertObject('$__st_user', data);
    const response = {
      status: Array.isArray(result) ? 'ok' : 'error',
      message: 'User List.',
      result: result,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async save(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const data = req.locals.json() as any;

    const id = data['id'];
    if (!data['idReadonly']) {
      // save as
      const result = await db.selectObject('$__s_menu', ['menuid'], {
        menuid: id,
      });
      if (result && result.length > 0) {
        const response = {
          status: 'ID_EXISTS',
          message: `Menu id: ${id} exists`,
        };
        ApiHelper.sendJson(req, res, response);
        return true;
      }
    }

    await db.deleteObject('$__s_menu', { menuid: id });
    const result = await db.insertObject('$__s_menu', {
      menuid: id,
      title: data['title'],
      note: data['note'],
      package: data['package'],
      items: JSON.stringify(data['items']),
      updateduserid: 1,
      updatedstamp: new Date().toISOString(),
    });
    const response = {
      status: 'ok',
      result: result,
      message: 'Menu Saved.',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async getRecord(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const id = req.locals.urlParameters.get('id', '');

    const response = {
      status: 'error',
      message: 'Get a menu item.',
      result: {},
    };
    if (id) {
      const result = await db.selectObject('$__s_menu', undefined, {
        menuid: id,
      });
      if (result && result.length > 0) {
        response.result = {
          menuid: result[0]['menuid'],
          title: result[0]['title'],
          note: result[0]['note'],
          package: result[0]['package'],
          items: JSON.parse(result[0]['items']),
        };
      }
      response.status = 'ok';
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async delete(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const id = req.locals.urlParameters.get('id', '');

    const response = {
      status: 'ok',
      message: 'Delete a menu.',
      result: null,
    };
    if (id) {
      const result = await db.deleteObject('$__s_menu', { menuid: id });
      response.result = result;
      response.status = 'ok';
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }
}
