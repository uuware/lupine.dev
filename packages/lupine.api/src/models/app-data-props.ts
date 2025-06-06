import { Db } from '../lib/db';

export type AppDataProps = {
  db: Db;
  dbType: string;
  dbFilename: string;
  config: any;
  dataPath: string;
  webPath: string;
};
