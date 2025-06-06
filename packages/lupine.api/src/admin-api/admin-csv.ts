import { ServerResponse } from 'http';
import { Logger } from 'lupine.api';
import { Db } from '../lib/db';

const logger = new Logger('admin-csv');
export const exportCSVData = async (db: Db, tableName: string, res: ServerResponse) => {
  res.write(`@TABLE,${tableName}\r\n`);

  const result = await db.selectObject(tableName);
  if (result && result.length > 0) {
    const fields = Object.keys(result[0]).join(',').toLowerCase();
    res.write(`@FIELD,${fields}\r\n`);
    result.forEach((row: any) => {
      res.write(`${JSON.stringify(Object.values(row))}\r\n`);
    });
  } else {
    res.write('#no data\r\n');
  }
};

export const exportCSVHead = (fileName: string, res: ServerResponse) => {
  res.writeHead(200, {
    'Content-Type': 'text/csv',
    // 'Expires': '0',
    // 'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Content-Disposition': 'attachment; filename=' + fileName + '.ljcsv',
    // 'Content-Description': 'File Transfer',
  });
};

export const exportCSV = async (db: Db, tableName: string, res: ServerResponse) => {
  if (tableName) {
    exportCSVHead(tableName + '-' + new Date().toJSON().replace(/:/g, '-'), res);
    await exportCSVData(db, tableName, res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Need a table name.');
  }
  res.end();
  return true;
};

export const exportCSVTables = async (db: Db, tables: string[], res: ServerResponse) => {
  exportCSVHead('all-tables-' + new Date().toJSON().replace(/:/g, '-'), res);
  for (const i in tables) {
    await exportCSVData(db, tables[i], res);
    res.write('\r\n');
  }
  res.end();
  return true;
};

export const loadCSV = async (db: Db, lines: string[]) => {
  let table = '';
  let insSql = '';
  const result: any = {};
  for (const i in lines) {
    if (!lines[i] || lines[i].startsWith('#')) {
      continue;
    }
    if (lines[i].startsWith('@TABLE,')) {
      table = lines[i].substring(7);
      result[table] = { succeeded: 0, failed: 0, errorMessage: [] };
    } else if (lines[i].startsWith('@FIELD,')) {
      const fields = lines[i].substring(7); //.split(',');
      const values = Array(fields.split(',').length).fill('?').join(',');
      insSql = `INSERT INTO ${table} (${fields} ) VALUES (${values})`;
    } else {
      try {
        const row = JSON.parse(lines[i]);
        const r = await db.execute(insSql, row);
        result[table].succeeded++;
      } catch (error: any) {
        result[table].failed++;
        result[table].errorMessage.push(error.message);
      }
    }
  }

  return result;
};
