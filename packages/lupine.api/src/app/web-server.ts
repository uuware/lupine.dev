import { ServerOptions } from 'https';
import { Logger } from '../lib/logger';
import { WebListener } from './web-listener';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { WebProcessor } from './web-processor';
import { DebugService } from '../api/debug-service';
const logger = new Logger('web-server');

export class WebServer {
  webListener: WebListener;
  constructor(webListener?: WebListener) {
    this.webListener = webListener || new WebListener(new WebProcessor());
  }

  handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    const clientIp = `${(socket as any).remoteAddress}:${(socket as any).remotePort}`;
    if (req.url?.startsWith('/debug') && socket.readable && socket.writable) {
      logger.info(`Upgrade WebSocket access: ${req.url} from ${clientIp}.`);
      DebugService.handleUpgrade(req, socket, head);
    } else {
      logger.error(`Unexpected web socket access: ${req.url} from ${clientIp}`);
      socket.destroy();
    }
  }

  startHttp(httpPort: number, bindIp?: string, timeout?: number) {
    const httpServer = http.createServer(this.webListener.listener.bind(this.webListener));
    if (typeof timeout === 'number') httpServer.setTimeout(timeout);

    httpServer.on('upgrade', this.handleUpgrade.bind(this));

    httpServer.listen(httpPort, bindIp, () => {
      logger.info(`Http Server is started: http://localhost:${httpPort}`);
    });
    httpServer.on('error', (error: any) => {
      logger.error('Error occurred on http server', error);
    });
    return httpServer;
  }

  // multi domain https hosting
  // https://stackoverflow.com/questions/38162077/expressjs-multi-domain-https-hosting
  startHttps(httpsPort: number, bindIp?: string, sslKeyPath?: string, sslCrtPath?: string, timeout?: number) {
    const httpsOptions: ServerOptions = {};
    if (sslKeyPath && fs.existsSync(sslKeyPath) && sslCrtPath && fs.existsSync(sslCrtPath)) {
      logger.info('Load site ssl certificate.');
      // The options to https.createServer must include key and cert as they are required.
      // Even though that set won't be used if SNI provides a hostname.
      httpsOptions['key'] = fs.readFileSync(sslKeyPath, 'utf8');
      httpsOptions['cert'] = fs.readFileSync(sslCrtPath, 'utf8');
      // httpsOptions['ca'] = 'pem';
      // httpsOptions['SNICallback'] = function (domain, cb) {
      //   if (typeof sites[domain] === "undefined") {
      //     cb(new Error("domain not found"), null);
      //     console.log("Error: domain not found: " + domain);

      //   } else {
      //     cb(null, sites[domain].context);
      //   }
      // };
    } else {
      logger.warn(
        `Ssl certificate is not defined or doesn't exist, key file: ${sslKeyPath}, certificate file: ${sslCrtPath}`
      );
    }

    const httpsServer = https.createServer(httpsOptions, this.webListener.listener.bind(this.webListener));
    httpsServer.on('upgrade', this.handleUpgrade.bind(this));

    if (typeof timeout === 'number') {
      httpsServer.setTimeout(timeout);
    }
    httpsServer.listen(httpsPort, bindIp, () => {
      logger.info(`Https Server is started: https://localhost:${httpsPort}`);
    });
    httpsServer.on('error', (error: any) => {
      logger.error('Error occurred on https server', error);
    });
    return httpsServer;
  }
}
