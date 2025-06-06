export interface DbConfig {
  type: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  poolMin: number;
  poolMax: number;
  connectionTimeout: number;
  tablePrefix: string;
  filename?: string;
}

export const getDefaultDbConfig = (): DbConfig => {
  // process.env may not be initialized at script starting
  return {
    type: process.env['DB_TYPE'] || 'sqlite',
    host: '',
    port: 0,
    user: '',
    password: '',
    database: '',
    poolMin: 1,
    poolMax: 5,
    connectionTimeout: 10000,
    tablePrefix: '',
    filename: process.env['DB_FILENAME'] || 'sqlite3.db',
  };
};
