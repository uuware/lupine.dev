const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs/promises');
const { runCmd, copyFolder, sendRequest, loadEnv, readJson, pathExists, cpIndexHtml } = require('lupine.api/dev');

const triggerHandle = {
  restart: null,
  refresh: null,
};
const triggerReStartServer = async (isDev, npmCmd, httpPort) => {
  if (triggerHandle.restart) {
    clearTimeout(triggerHandle.restart);
  }
  triggerHandle.restart = setTimeout(async () => {
    const url = `http://127.0.0.1:${httpPort}/debug/suspend`;
    await sendRequest(url, isDev ? 2 : 0);
    console.log('[dev-server] ReStart Server: ', url);
    isDev && runCmd(npmCmd);
  }, 500);
};
const triggerRefreshServer = async (isDev, httpPort) => {
  if (triggerHandle.refresh) {
    clearTimeout(triggerHandle.refresh);
  }
  triggerHandle.refresh = setTimeout(async () => {
    const url = `http://127.0.0.1:${httpPort}/debug/refresh`;
    await sendRequest(url, isDev ? 2 : 0);
    console.log('[dev-server] Refresh Server: ', url);
  }, 500);
};

const watchServerPlugin = (isDev, npmCmd, httpPort) => {
  return {
    name: 'watchServerPlugin',
    setup(build) {
      build.onEnd(async (res) => {
        // console.log(`Build meta data: `, res);
        console.log(`[dev-server] Build finished`);
        if (isDev) {
          await triggerReStartServer(isDev, npmCmd, httpPort);
        }
      });
    },
  };
};

const watchServer = async (isDev, npmCmd, httpPort, serverRootPath) => {
  const cmd = isDev ? esbuild.context : esbuild.build;
  const ctx = await cmd({
    entryPoints: ['apps/shared-server-src/index.ts'],
    outdir: path.join(serverRootPath, 'server'),
    platform: 'node',
    sourcemap: !!isDev,
    format: 'cjs',
    bundle: true,
    treeShaking: true,
    metafile: true,
    external: [
      'pg',
      'oracledb',
      'tedious',
      // 'better-sqlite3',
      'nock',
      'pg-query-stream',
      'mock-aws-s3',
      'aws-sdk',
      'mysql2',
      'mysql',
      // 'knex',
      'sqlite3',
    ],
    minify: !isDev,
    plugins: [watchServerPlugin(isDev, npmCmd, httpPort)],
  });

  isDev && (await ctx.watch());
  isDev && console.log('[dev-server] Watching...');
};

const copyCache = new Map();
const clientProcessOnEnd = async (saved) => {
  cpIndexHtml(saved.indexHtml, path.join(saved.outdir, 'index.html'), saved.appName);

  const assets = saved['copyFiles'];
  if (assets) {
    for (oneDir of assets) {
      await copyFolder(copyCache, oneDir.from, oneDir.to, saved.isDev);
    }
  }

  if (saved.isDev) {
    await triggerRefreshServer(saved.isDev, saved.httpPort);
  }
};

const watchClientPlugin = (saved) => {
  return {
    name: 'watchClientPlugin',
    setup(build) {
      build.onEnd(async (res) => {
        // console.log(`Build meta data: `, res);
        console.log(`[dev-client:${saved.appName}] Build finished`);
        await clientProcessOnEnd(saved);
      });
    },
  };
};

const watchClient = async (saved, isDev, entryPoints, outbase) => {
  const cmd = isDev ? esbuild.context : esbuild.build;
  const ctx = await cmd({
    entryPoints,
    outdir: saved.outdir,
    outbase,
    // entryNames: '[name]-[hash]',
    platform: 'browser',
    sourcemap: !!isDev, // inline
    format: 'iife',
    bundle: true,
    treeShaking: true,
    external: [],
    metafile: true,
    minify: !isDev,
    loader: { '.svg': 'text' },
    loader: { '.png': 'file' },
    loader: { '.glsl': 'text' },
    jsxImportSource: 'lupine.js',
    jsx: 'automatic',
    plugins: [watchClientPlugin(saved)],
  });

  isDev && (await ctx.watch());
  isDev && console.log(`[dev-client:${saved.appName}] Watching...`);
};

const watchApiPlugin = (isDev, httpPort) => {
  return {
    name: 'watchApiPlugin',
    setup(build) {
      build.onEnd(async (res) => {
        // console.log(`Build meta data: `, res);
        console.log(`[dev-api] Build finished`);

        if (isDev) {
          await triggerRefreshServer(isDev, httpPort);
        }
      });
    },
  };
};

const watchApi = async (saved, isDev, entryPoints) => {
  const cmd = isDev ? esbuild.context : esbuild.build;
  const ctx = await cmd({
    entryPoints,
    outdir: saved.outdirApi,
    // outbase,
    platform: 'node',
    sourcemap: !!isDev, // inline
    format: 'cjs', // iife, cjs
    bundle: true,
    treeShaking: true,
    metafile: true,
    external: [
      'pg',
      'oracledb',
      'tedious',
      // 'better-sqlite3',
      'nock',
      'pg-query-stream',
      'mock-aws-s3',
      'aws-sdk',
      'mysql2',
      'mysql',
      // 'knex',
      'sqlite3',
      'nodemailer',
    ],
    minify: !isDev,
    plugins: [watchApiPlugin(isDev, saved.httpPort)],
  });

  isDev && (await ctx.watch());
  isDev && console.log(`[dev-api:${saved.appName}] Watching...`);
};

const watchAdditionalFiles = async (saved, entryPoints) => {
  const cmd = saved.isDev ? esbuild.context : esbuild.build;
  const ctx = await cmd({
    entryPoints: entryPoints,
    outdir: 'dist/tmp',
    write: false,
    loader: { '.html': 'empty', '.css': 'empty', '.js': 'empty' },
    plugins: [watchClientPlugin(saved)],
  });

  saved.isDev && (await ctx.watch());
};

// Add Server, API, Client and additional files entry points to esbuild
const start = async () => {
  // Any code accessing from process.env should be after loadEnv
  // process env files, "#!import .env" can be used to include another env file
  let envFile = process.argv.find((i) => i.startsWith('--env='))?.substring(6);
  // load env file, but not overwrite existing env variables
  await loadEnv(envFile);

  const serverRootPathEnv = process.env['SERVER_ROOT_PATH'];
  if (!serverRootPathEnv) {
    console.error('SERVER_ROOT_PATH is not set');
    return 0;
  }
  const serverRootPath = path.resolve(serverRootPathEnv);
  await fs.mkdir(serverRootPath, { recursive: true });
  if (!(await pathExists(serverRootPath))) {
    console.error(`Can't create server root path: ${serverRootPath}`);
    return 0;
  }

  // command to start the server when source files are changed
  const npmCmd = process.argv.find((i) => i.startsWith('--cmd='))?.substring(6);
  const isDev = process.argv.find((i) => i === '--dev=1');

  // All apps should be defined in .env file like this:
  // APPS=domain1.com,domain2.com
  const apps = (process.env['APPS'] || '').split(',');

  const httpPort = process.env['HTTP_PORT'];
  for (const app of apps) {
    const appJson = `apps/${app}/lupine.json`;
    const additionalFiles = [];
    const appCfg = await readJson(appJson);
    const appName = appCfg['name'];
    const appDir = path.dirname(appJson);
    if (appCfg['watchFiles']) {
      appCfg['watchFiles'].forEach((item) => additionalFiles.push(`${appDir}/${item}`));
    }

    // create data folder
    await fs.mkdir(`${serverRootPath}/${appName}_data`, { recursive: true });

    const entryPoint = `${appDir}/${appCfg['entryPoint']}`;
    const saved = {
      isDev,
      appName,
      httpPort,
      indexHtml: `${appDir}/${appCfg['indexHtml']}`,
      serverRoot: serverRootPath,
      outdir: `${serverRootPath}/${appName}_web`,
      outdirApi: `${serverRootPath}/${appName}_api`,
      copyFiles: appCfg['copyFiles'].map((item) => ({
        from: `${appDir}/${item.from}`,
        to:
          item.type == 'data'
            ? `${serverRootPath}/${appName}_data/${item.to}`
            : `${serverRootPath}/${appName}_web/${item.to}`,
      })),
    };
    watchClient(saved, isDev, [entryPoint], path.dirname(entryPoint));

    if (appCfg['entryPointApi']) {
      const entryPointApi = `${appDir}/${appCfg['entryPointApi']}`;
      watchApi(saved, isDev, [entryPointApi]);
    }
    if (additionalFiles.length > 0) {
      watchAdditionalFiles(saved, additionalFiles);
    }
  }

  watchServer(isDev, npmCmd, httpPort, serverRootPath);
};
start();
