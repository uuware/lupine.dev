// const request = require('request');
import * as fs from 'fs';
import * as path from 'path';
import { ServerResponse } from 'http';
import { Logger } from '../lib';
import { ServerRequest } from '../models/locals-props';
import { handler200, handler404, handler500 } from './handle-status';
import { isServerSideRenderUrl, serverSideRenderPage } from './server-render';
import { serverContentType } from './server-content-type';
import { apiCache } from './api-cache';

export class StaticServer {
  logger = new Logger('StaticServer');

  private async sendFile(realPath: string, requestPath: string, res: ServerResponse) {
    try {
      // const text = fs.readFileSync(realPath);
      // createReadStream has default autoClose(true)
      // https://nodejs.org/api/fs.html#fscreatereadstreampath-options
      const fileStream = fs.createReadStream(realPath);
      fileStream.on('error', (error) => {
        this.logger.warn(`File not found: ${realPath}`);
        handler404(res);
        return true;
      });
      fileStream.on('open', () => {
        let ext = path.extname(realPath);
        ext = ext ? ext.slice(1) : 'unknown';
        const contentType = serverContentType[ext] || 'text/plain';
        res.writeHead(200, {
          'Content-Type': contentType + '; charset=UTF-8',
        });
      });
      fileStream.on('end', function () {
        res.end();
      });
      // res.write(text);
      // res.end();
      fileStream.pipe(res);

      return true;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.logger.warn(`File not found: ${realPath}`);
        handler200(res, `File not found: ${requestPath}`);
      } else {
        this.logger.error(`Error for: ${realPath}`, err);
        handler200(res, 'Service failed: ' + err.message);
      }
      return true;
    }
  }

  async processRequest(req: ServerRequest, res: ServerResponse, rootUrl?: string) {
    this.logger.info(`StaticServer, url: ${req.locals.url}, host: ${req.locals.host}, rootUrl: ${rootUrl}`);

    const hostPath = apiCache.getAsyncStore().hostPath;
    const urlSplit = (rootUrl || req.locals.urlWithoutQuery).split('?');
    const fullPath = path.join(hostPath.realPath, urlSplit[0]);

    const jumpToServerSideRender = () => {
      const error = new Error();
      (error as any).code = 'ENOENT';
      // jump to serverSideRenderPage
      throw error;
    };
    try {
      if (urlSplit[0] === '/' || urlSplit[0] === '/index.html') {
        jumpToServerSideRender();
      }

      // if fullPath doesn't exist, it will throw ENOENT error
      const realPath = await fs.promises.realpath(fullPath);
      console.log(`request: ${realPath}`);
      // for security reason, the requested file should be inside of wwwRoot
      if (realPath.substring(0, hostPath.realPath.length) !== hostPath.realPath) {
        this.logger.warn(`ACCESS DENIED: ${urlSplit[0]}`);
        handler200(res, `ACCESS DENIED: ${urlSplit[0]}`);
        return true;
      }

      let finalPath = '';
      if ((await fs.promises.lstat(realPath)).isDirectory()) {
        if ((await fs.promises.lstat(path.join(realPath, 'index.js'))).isFile()) {
          // because it's directory, it means index.html, and if it has index.js, it will jump to serverSideRenderPage
          jumpToServerSideRender();
        }
        // if index.js doesn't exist, it will send index.html
        finalPath = path.join(realPath, 'index.html');
      } else {
        // it's a file, and if it's index.html and the same directory has index.js, it will jump to serverSideRenderPage
        if (realPath.endsWith('/index.html') && (await fs.promises.lstat(path.join(path.dirname(realPath), 'index.js'))).isFile()) {
          jumpToServerSideRender();
        }
        finalPath = realPath;
      }

      // now we need to send finalPath file. If finalPath doesn't exist, it will cause error and jump to serverSideRenderPage
      try {
        const allowOrigin = (req.headers.origin && req.headers.origin !== 'null') ? req.headers.origin : '*';
        res.setHeader('Access-Control-Allow-Origin', allowOrigin);

        await this.sendFile(finalPath, urlSplit[0], res);
      } catch (err: any) {
        this.logger.warn(`File not found: ${urlSplit[0]}`);
        handler200(res, `File not found: ${urlSplit[0]}`);
      }
      return true;
    } catch (err: any) {
      // file doesn't exist
      if (err.code === 'ENOENT') {
        if (isServerSideRenderUrl(urlSplit[0])) {
          serverSideRenderPage(hostPath.appName, hostPath.realPath, urlSplit[0], urlSplit[1], req, res);
        } else {
          this.logger.error(`File not found: ${urlSplit[0]}`);
          handler404(res, `File not found: ${urlSplit[0]}`);
        }
      } else {
        this.logger.error(`Error for: ${urlSplit[0]}`, err);
        handler500(res, `processRequest error: ${err.message}`);
      }
      return true;
    }
  }
}
