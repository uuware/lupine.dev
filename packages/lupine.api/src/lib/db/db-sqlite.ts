import Database from 'better-sqlite3';
import { Logger } from '../logger';
import { Db } from './db';
import { DbConfig } from '../../models/db-config';

const logger = new Logger('db-sqlite');
export class DbSqlite extends Db {
  db!: Database.Database;

  constructor(option: DbConfig) {
    super(option);

    this.db = new Database(option.filename!, {
      nativeBinding: 'node_modules/better-sqlite3/build/Release/better_sqlite3.node',
    });
    this.db.pragma('journal_mode = WAL');

    if (logger.isDebug()) {
      this.testConnection();
    }
  }

  close() {
    this.db.close();
  }

  connect() {
    return Promise.resolve();
  }

  // INSERT...RETURNING is also supported in MariaDB from 10.5.0
  public nativeQuery(sql: string, params?: any, isSelect?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let rows: any;
        if (isSelect) {
          rows = params ? this.db.prepare(sql).all(params) : this.db.prepare(sql).all();
        } else {
          const preSql = sql.trim().substring(0, 6).toLowerCase();
          if (preSql.startsWith('insert') || preSql.startsWith('update') || preSql.startsWith('delete')) {
            sql = sql + ' returning *';
          }
          rows = params ? this.db.prepare(sql).run(params) : this.db.prepare(sql).run();
          if (rows && typeof rows.length === 'undefined') {
            // sqlite3 returns id as a record
            rows = [
              {
                ...rows,
                id: rows.changes > 0 ? rows.lastInsertRowid : undefined,
              },
            ];
          }
        }

        if (logger.isDebug()) {
          console.log('query:', sql, ', params:', params, ', result:', rows && rows.length);
        }
        resolve(rows);
      } catch (err) {
        console.error('query:', sql, ', params:', params, ', error:', err);
        reject(err);
      }
    });
  }

  public async truncateTable(tableName: string): Promise<any> {
    // sqlite doesn't have DROP command
    return this.execute(`DELETE FROM ${tableName}`);
  }

  // public async createTable(table: string, fields: string[]) {
  //   // table = this.replacePrefix(table);
  //   const query = 'CREATE TABLE ' + table + ' (' + fields.join(',') + ')';
  //   return await this.query(query);
  // }

  public async getTableCount(tableName: string) {
    const result = await this.select(`SELECT COUNT(*) as c FROM ${tableName}`);
    return result[0].c;
  }

  public async getAllTables(addCount = false) {
    const query = `SELECT * FROM sqlite_master WHERE type ='table';`;
    const result = await this.select(query);
    if (result) {
      if (addCount) {
        for (let i in result) {
          result[i].count = await this.getTableCount(result[i].tbl_name);
        }
      }
      return result;
    }
    return false;
  }

  public async getTableInfo(table: string): Promise<any> {
    const query = `PRAGMA table_info(${table});`;
    const result = await this.execute(query);
    return result;
  }
}
