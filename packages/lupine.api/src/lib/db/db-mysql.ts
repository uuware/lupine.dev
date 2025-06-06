// import sqlite3, { Database } from 'sqlite3';
import { Logger } from '../logger';
import { Db } from './db';
import { DbConfig } from '../../models/db-config';

/**
connection = mysql.createConnection({
  host : 'localhost',
  user : 'wnc',
  password : 'jrmLyTC8r6QLMhf3',
  port : 3306,
  database: 'je51',
  insecureAuth: true,
  //debug: true,
});
connection.connect();

connection.end();

    getConn: function (config) {
      config.host = config.host || "localhost";
      config.port = config.port || 3306;
      connection = mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        database: config.database,
        insecureAuth: config.insecureAuth,
        debug: config.debug,
      });
      connection.connect();

      this.debug = config.debug || false;
      var thisObj = this;
      connection.on("error", function (err) {
        if (!err.fatal) {
          return;
        }

        if (err.code !== "PROTOCOL_CONNECTION_LOST") {
          throw err;
        }

        //console.log('Re-connecting lost connection: ' + err.stack);
        console.log("Re-connecting lost connection: " + err);
        thisObj.connection = thisObj.getConn(config);
      });
      this.connection = connection;
      return connection;
    },

    query: function (cb, sql) {
      try {
        var conn = this.connection;
        sql = this.replacePrefix(sql);
        console.log("query:" + sql);
        conn.query(sql, cb);
      } catch (err) {
        console.log(err);
        if (err.code == "PROTOCOL_CONNECTION_LOST") {
          var conn = this.connection;
          conn.query(sql, cb);
        } else {
          cb(err, false);
        }
      }
      return true;
    },

    escape: function (val) {
      return mysql.escape(val);
    },

    escapeId: function (id) {
      return mysql.escapeId(id);
    },

*/
const logger = new Logger('db-mysql');
export class DbMysql extends Db {
  // db!: Database;

  constructor(option: DbConfig) {
    super(option);

    // this.db = new sqlite3.Database(option.filename!, sqlite3.OPEN_READWRITE);

    if (logger.isDebug()) {
      this.testConnection();
    }
  }

  close() {
    // this.db.close();
  }

  connect() {
    return Promise.resolve();
  }

  public nativeQuery(sql: string, params?: any) {
    return new Promise((resolve, reject) => {
      // this.db.all(sql, params, (err: any, rows: unknown) => {
      //   if (err) {
      //     console.error(err);
      //     reject(err);
      //   } else {
      //     if (logger.isDebug()) {
      //       console.log('query result:' + sql, rows);
      //     }
      //     resolve(rows);
      //   }
      // });
    });
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
      return await result;
    }
    return false;
  }
}
