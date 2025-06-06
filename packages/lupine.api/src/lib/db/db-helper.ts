import { Logger } from '../logger';
import { Db } from './db';
import { DbConfig } from '../../models/db-config';
import { DbSqlite } from './db-sqlite';

const logger = new Logger('db-helper');
export class DbHelper {
  static async createInstance(option: DbConfig): Promise<Db> {
    if (!option || !option.type) {
      throw new Error('Invalid configuration');
    }

    const type = option.type.toLowerCase();
    switch (type) {
      case 'sqlite':
        const db = new DbSqlite(option);
        await db.connect();
        return db;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }
}
