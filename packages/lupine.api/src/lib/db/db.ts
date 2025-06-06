import { Logger } from '../logger';
import { DbConfig } from '../../models/db-config';

// Instead, Boolean values are stored as integers 0 (false) and 1 (true).
export type DbFieldValue = { [key: string]: string | number };

const logger = new Logger('db');
export class Db {
  type: string;
  tablePrefix: string;

  constructor(option: DbConfig) {
    console.log(
      `init Db, type: ${option.type}, host: ${option.host}:${option.port}, user: ${option.user}, database: ${option.database}, filename: ${option.filename}`
    );

    this.type = option.type;
    this.tablePrefix = option.tablePrefix || 'tbl_';
  }

  public close() {
    throw new Error('Method not implemented');
  }

  public connect() {
    throw new Error('Method not implemented');
  }

  // public async createTable(table: string, fields: string[]): Promise<any> {
  //   throw new Error('Method not implemented');
  // }

  public async getAllTables(addCount = false): Promise<any> {
    throw new Error('Method not implemented');
  }

  public async getAllTableNames(): Promise<string[]> {
    const result = await this.getAllTables(false);
    return result.map((item: any) => item.name);
  }

  public async getTableInfo(table: string): Promise<any> {
    throw new Error('Method not implemented');
  }

  protected nativeQuery(sql: string, params?: any, isSelect?: boolean): Promise<any> {
    throw new Error('Method not implemented');
  }

  public async truncateTable(tableName: string): Promise<any> {
    throw new Error('Method not implemented');
  }

  public async select(sql: string, params?: any) {
    const fixedSql = this.replacePrefix(sql);
    return await this.nativeQuery(fixedSql, params, true);
  }
  public async execute(sql: string, params?: any) {
    const fixedSql = this.replacePrefix(sql);
    return await this.nativeQuery(fixedSql, params, false);
  }
  // public async query(sql: string, params?: any, addReturning?: boolean) {
  //   try {
  //     const fixedSql = this.replacePrefix(sql);
  //     return await this.nativeQuery(fixedSql, params, addReturning);
  //   } catch (err) {
  //     console.log(err);
  //     throw err;
  //   }
  // }

  // public replacePrefixXX(tableName: string, fromPrefix?: string) {
  //   if (!fromPrefix) {
  //     fromPrefix = '$__';
  //   }

  //   if (tableName.startsWith(fromPrefix)) {
  //     return this.tablePrefix + tableName.substring(fromPrefix.length);
  //   }
  //   return tableName;
  // }

  public replacePrefix(sql: string, fromPrefix?: string) {
    if (!fromPrefix || typeof fromPrefix === 'undefined') {
      fromPrefix = '$__';
    }

    var escaped = false;
    var quoteChar = '';
    sql = sql.trim();
    var n = sql.length;

    var startPos = 0;
    var literal = '';
    while (startPos < n) {
      var ip = sql.indexOf(fromPrefix, startPos);
      if (ip < 0) {
        break;
      }

      var j = sql.indexOf("'", startPos);
      var k = sql.indexOf('"', startPos);
      if (k >= 0 && (k < j || j < 0)) {
        quoteChar = '"';
        j = k;
      } else {
        quoteChar = "'";
      }

      if (j < 0) {
        j = n;
      }
      //literal += sql.substring(startPos, j).replace(prefix, this.tableprefix);
      literal += sql.substring(startPos, j).split(fromPrefix).join(this.tablePrefix);
      startPos = j;

      j = startPos + 1;

      if (j >= n) {
        break;
      }

      // quote comes first, find end of quote
      while (true) {
        k = sql.indexOf(quoteChar, j);
        escaped = false;
        if (k < 0) {
          break;
        }
        let l = k - 1;
        while (l >= 0 && sql.substring(l, l + 1) == '\\') {
          l--;
          escaped = !escaped;
        }
        if (escaped) {
          j = k + 1;
          continue;
        }
        break;
      }
      if (k < 0) {
        // error in the query - no end quote; ignore it
        break;
      }
      literal += sql.substring(startPos, k + 1);
      startPos = k + 1;
    }
    if (startPos < n) {
      literal += sql.substring(startPos, n);
    }
    return literal;
  }

  // public escapeId(field) {
  //     return field;
  // }

  // public escape(field) {
  //     return field;
  // }

  private selectBaseSql(table: string, fields?: string[], whereFieldValues?: DbFieldValue, orderSql?: string) {
    table = this.replacePrefix(table);
    let sql = 'SELECT ';
    if (fields && fields.length > 0) {
      sql += fields.join(',');
    } else {
      sql += '*';
    }

    sql += ' FROM ' + table;
    let params: any[] = [];
    if (whereFieldValues && Object.keys(whereFieldValues).length > 0) {
      sql +=
        ' WHERE ' +
        Object.keys(whereFieldValues)
          .map((item) => `${item}=?`)
          .join(' AND ');
      params = Object.values(whereFieldValues);
    }
    if (orderSql) {
      sql += ' ORDER BY ' + orderSql;
    }
    return { sql, params };
  }

  public async selectObject(
    table: string,
    fields?: string[],
    whereFieldValues?: DbFieldValue,
    orderSql?: string,
    limit?: number,
    offset?: number
  ) {
    const base = this.selectBaseSql(table, fields, whereFieldValues, orderSql);
    if (limit && limit > 0) {
      base.sql += ' LIMIT ' + limit;
    }
    if (typeof offset === 'number' && !isNaN(offset)) {
      base.sql += ' OFFSET ' + offset;
    }
    return await this.select(base.sql, base.params);
  }

  public async selectOneRow(
    table: string,
    fields?: string[],
    whereFieldValues?: DbFieldValue,
    orderSql?: string,
    offset?: number
  ) {
    const result = await this.selectObject(table, fields, whereFieldValues, orderSql, 1, offset);
    if (result && Array.isArray(result)) {
      return result[0];
    }
    return undefined;
  }

  public async selectOneResult(table: string, field: string, whereFieldValues?: DbFieldValue) {
    const base = this.selectBaseSql(table, [field], whereFieldValues);
    const result = await this.select(base.sql, base.params);
    if (result && Array.isArray(result)) {
      return result[0][Object.keys(result[0])[0]];
    }
    return undefined;
  }

  // return ids
  public async insertObject(table: string, fieldValues: DbFieldValue) {
    table = this.replacePrefix(table);
    const fields = Object.keys(fieldValues);
    const values = Array(fields.length).fill('?').join(',');
    let sql = 'INSERT INTO ' + table + ' (' + fields.join(',') + ') VALUES (' + values + ')';
    const params = Object.values(fieldValues);
    return await this.execute(sql, params);
  }

  public async updateObject(table: string, updateFieldValues: DbFieldValue, whereFieldValues: DbFieldValue) {
    table = this.replacePrefix(table);
    const fields = Object.keys(updateFieldValues);
    let sql = 'UPDATE ' + table + ' SET ' + fields.map((item) => `${item}=?`).join(',');
    const params = Object.values(updateFieldValues);

    if (whereFieldValues && Object.keys(whereFieldValues).length > 0) {
      sql +=
        ' WHERE ' +
        Object.keys(whereFieldValues)
          .map((item) => `${item}=?`)
          .join(' AND ');
      params.push(...Object.values(whereFieldValues));
    }
    return await this.execute(sql, params);
  }

  public async deleteObject(table: string, whereFieldValues: DbFieldValue) {
    table = this.replacePrefix(table);
    let sql =
      'DELETE FROM ' +
      table +
      ' WHERE ' +
      Object.keys(whereFieldValues)
        .map((item) => `${item}=?`)
        .join(' AND ');
    const params = Object.values(whereFieldValues);

    return await this.execute(sql, params);
  }

  // public async hasTable(table: string): Promise<boolean> {
  //   table = this.replacePrefix(table);
  //   return await this.knex.schema.hasTable(table);
  // }

  // public async createTable(table: string, funCallback: (tableBuilder: Knex.CreateTableBuilder) => any) {
  //   table = this.replacePrefix(table);
  //   return await this.knex.schema.createTable(table, funCallback);
  // }

  // public async dropTable(table: string) {
  //   table = this.replacePrefix(table);
  //   return await this.knex.schema.dropTableIfExists(table);
  // }

  public async testConnection() {
    return await this.select('select 1+1 as result');
  }
}
