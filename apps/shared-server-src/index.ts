// initApp should be called before any other logics, so need to avoid `export default new Class()`
import * as path from 'path';
import {
  HostToPathProps,
  appStart,
  bindRenderPageFunctions,
  getDefaultDbConfig,
  getRenderPageFunctions,
  loadEnv,
} from 'lupine.api';
import { fetchData } from './services/fetch-data';
import { ServerEnvKeys } from './server-env-keys';

const initAndStartServer = async () => {
  const envFile = process.argv.find((i) => i.startsWith('--env='))?.substring(6) || '.env';
  // it can use "#!import file_name" to import another env file
  await loadEnv(envFile);
  bindRenderPageFunctions({ fetchData });

  const dbConfig = { ...getDefaultDbConfig() };
  const serverRootPath = path.resolve(process.env[ServerEnvKeys.SERVER_ROOT_PATH]!);
  const apps = (process.env[ServerEnvKeys.APPS] || '').split(',');
  const webRootMap: HostToPathProps[] = [];

  for (const app of apps) {
    const appHosts = process.env[`${ServerEnvKeys.DOMAINS}@${app}`] || '';
    const dbFilename =
      process.env[`${ServerEnvKeys.DB_FILENAME}@${app}`] || process.env[`${ServerEnvKeys.DB_FILENAME}`] || 'sqlite3.db';
    webRootMap.push({
      appName: app,
      hosts: appHosts ? appHosts.split(',') : [],
      // web, data, api folders should be created in building process
      realPath: path.join(serverRootPath, app + '_web'),
      dataPath: path.join(serverRootPath, app + '_data'),
      apiPath: path.join(serverRootPath, app + '_api'),
      dbType: process.env[`${ServerEnvKeys.DB_TYPE}@${app}`] || process.env[`${ServerEnvKeys.DB_TYPE}`] || 'sqlite',
      dbConfig: { ...dbConfig, filename: dbFilename },
    });
  }

  const bindIp = process.env[ServerEnvKeys.BIND_IP] || '::';
  // 0 to disable http/https server
  const httpPort = Number.parseInt(process.env[ServerEnvKeys.HTTP_PORT] || '8080');
  const httpsPort = Number.parseInt(process.env[ServerEnvKeys.HTTPS_PORT] || '8443');
  const sslKeyPath = process.env[ServerEnvKeys.SSL_KEY_PATH] || '';
  const sslCrtPath = process.env[ServerEnvKeys.SSL_CRT_PATH] || '';

  // Can't use log until initApp is called (after AppStart.start)
  await appStart.start({
    renderPageFunctions: getRenderPageFunctions(),
    debug: process.env[ServerEnvKeys.NODE_ENV] === 'development',
    apiConfig: {
      serverRoot: `${serverRootPath}`,
      webHostMap: webRootMap,
    },
    serverConfig: {
      bindIp,
      httpPort,
      httpsPort,
      sslKeyPath,
      sslCrtPath,
    },
  });
};
initAndStartServer();
