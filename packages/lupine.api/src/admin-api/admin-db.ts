import { ServerResponse } from 'http';
import { IApiBase, FsUtils, Logger, apiCache, ServerRequest, ApiRouter, ApiHelper } from 'lupine.api';
import { exportCSV, exportCSVTables, loadCSV } from './admin-csv';

const logger = new Logger('admin-db');
export class AdminDb implements IApiBase {
  protected router = new ApiRouter();
  adminUser: any;

  constructor() {
    this.mountDashboard();
  }

  public getRouter(): ApiRouter {
    return this.router;
  }

  protected mountDashboard() {
    this.router.use('/install', this.install.bind(this));
    this.router.use('/run-sql', this.runSql.bind(this));
    // this.router.use('/table-info', this.tableInfo.bind(this));

    this.router.use('/tables/list', this.tableList.bind(this));
    this.router.use('/tables/download', this.tableDownloadAll.bind(this));
    this.router.use('/tables/upload', this.tableUpload.bind(this));
    this.router.use('/tables/truncate', this.tableTruncateAll.bind(this));
    this.router.use('/tables/drop', this.tableDropAll.bind(this));
    this.router.use('/table/data/:tableName/?offset/?limit', this.tableData.bind(this));
    this.router.use('/table/delete/:tableName/:id', this.tableDelete.bind(this));
    this.router.use('/table/drop/:tableName', this.tableDrop.bind(this));
    this.router.use('/table/truncate/:tableName', this.tableTruncate.bind(this));
    this.router.use('/table/download/:tableName', this.tableDownload.bind(this));
  }

  async tableList(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const result = await db.getAllTables(true);
    const response = {
      status: Array.isArray(result) ? 'ok' : 'error',
      message: 'Table List.',
      result: result,
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableDownloadAll(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tables = await db.getAllTableNames();
    exportCSVTables(db, tables, res);
    return true;
  }

  async tableUpload(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const lines = Buffer.from(req.locals.body!)
      .toString()
      .split(/(?:\r\n|\r|\n)/g);
    const result = await loadCSV(db, lines);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ status: 'ok', result }));
    res.end();
    return true;
  }

  async tableTruncateAll(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tables = await db.getAllTableNames();
    if (tables && tables.length > 0) {
      for (const i in tables) {
        await db.truncateTable(tables[i]);
      }
    }

    const response = {
      status: 'ok',
      message: 'Truncate all Tables: ' + tables.length,
      result: '',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableDropAll(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tables = await db.getAllTableNames();
    if (tables && tables.length > 0) {
      for (const i in tables) {
        await db.execute(`DROP TABLE ${tables[i]}`);
      }
    }

    const response = {
      status: 'ok',
      message: 'Truncate all Tables: ' + tables.length,
      result: '',
    };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableData(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tableName = req.locals.urlParameters.get('tableName', '');
    let pageIndex = req.locals.urlParameters.getInt('offset', 0); // Number.parseInt(post.pg_i as string);
    const pageLimit = req.locals.urlParameters.getInt('limit', 30); //Number.parseInt(post.pg_l as string) || 50;

    const response = {
      status: 'error',
      message: tableName ? 'Table Data.' : 'Need a table name.',
      result: null,
    };
    if (tableName) {
      const itemsCount = await db.selectOneResult(tableName, 'count(*)');
      let maxPages = Math.floor(itemsCount / pageLimit);
      if (itemsCount % pageLimit !== 0) {
        maxPages++;
      }
      if (pageIndex > maxPages) {
        pageIndex = maxPages - 1;
      }

      const offset = pageIndex * pageLimit;
      response.result = await db.selectObject(tableName, undefined, undefined, undefined, pageLimit, offset);
      response.status = 'ok';
      (response as any).itemsCount = itemsCount;
      (response as any).pageIndex = pageIndex;
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableDelete(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tableName = req.locals.urlParameters.get('tableName', '');
    const id = req.locals.urlParameters.getInt('id', -1);

    const response = {
      status: 'error',
      message: tableName ? 'Table delete.' : 'Need a table name.',
      result: null,
    };
    if (tableName && id > 0) {
      const result = await db.deleteObject(tableName, { id: id });
      response.result = result;
      response.status = 'ok';
      ApiHelper.sendJson(req, res, response);
      return true;
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableDownload(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tableName = req.locals.urlParameters.get('tableName', '');
    if (!tableName) {
      const response = {
        status: 'error',
        message: 'Need a table name.',
      };
      ApiHelper.sendJson(req, res, response);
      return true;
    }
    exportCSV(db, tableName, res);
    return true;
  }

  async tableDrop(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tableName = req.locals.urlParameters.get('tableName', '');
    const response = {
      status: 'error',
      message: tableName ? 'Delete Table.' : 'Need a table name.',
      result: '',
    };
    if (tableName) {
      const result = await db.execute(`DROP TABLE ${tableName}`);
      response.result = result;
      response.status = 'ok';
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableTruncate(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tableName = req.locals.urlParameters.get('tableName', '');
    const response = {
      status: 'error',
      message: tableName ? 'Truncate Table.' : 'Need a table name.',
      result: '',
    };
    if (tableName) {
      const result = await db.truncateTable(tableName);
      response.result = result;
      response.status = 'ok';
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async runSql(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const data = req.locals.json();
    const response = {
      status: 'error',
      message: '',
      result: '',
    };
    if (data && !Array.isArray(data) && data.sql) {
      const sql = ((data.sql as string) || '').trim();
      const result = sql.toUpperCase().startsWith('SELECT') ? await db.select(sql) : await db.execute(sql);
      response.status = 'ok';
      response.message = 'Executed sql.';
      response.result = result;
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async install(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const appData = apiCache.getAppData();
    const installDir = appData.dataPath + '/resources';
    const dbType = appData.dbType;
    const sqlFile = `${installDir}/install.${dbType}.sql`;
    const sql = await FsUtils.readFile(sqlFile);
    if (!sql) {
      const response = { errorMessage: `Can't read file: ${sqlFile}` };
      ApiHelper.sendJson(req, res, response);
      return true;
    }

    const sqlArr = sql.replace(/^#.*/gm, '').replace(/\r/g, ' ').replace(/\n/g, ' ').split(';');
    const result = [];
    for (let one in sqlArr) {
      const oneSql = sqlArr[one].trim();
      if (oneSql) {
        try {
          const one = await db.execute(oneSql);
          result.push(one);
        } catch (error: any) {
          result.push({ error: error.message });
        }
      }
    }
    const response = { status: 'ok', message: 'Installed', result };
    ApiHelper.sendJson(req, res, response);
    return true;
  }

  async tableInfo(req: ServerRequest, res: ServerResponse) {
    const db = apiCache.getDb();
    const tableName = req.locals.query.get('table');
    const response = {
      status: 'error',
      message: tableName ? 'Get Table.' : 'Need a table name.',
      result: '',
    };
    if (tableName) {
      const result = await db.getTableInfo(tableName);
      response.result = result;
      response.status = 'ok';
    }
    ApiHelper.sendJson(req, res, response);
    return true;
  }
}
