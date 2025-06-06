import { ServerResponse } from 'http';
import { ServerRequest } from '../models/locals-props';
import { JsonObject } from '../models/json-object';
import fs from 'fs';

export class ApiHelper {
  static sendJson(req: ServerRequest, res: ServerResponse, json: JsonObject, statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(json));
    res.end();
    return true;
  }

  static sendHtml(req: ServerRequest, res: ServerResponse, html: string, statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html' });
    res.write(html);
    res.end();
    return true;
  }

  static sendFile(req: ServerRequest, res: ServerResponse, filepath: string, statusCode = 200) {
    res.writeHead(statusCode, { 'Content-Type': 'application/octet-stream' });
    fs.createReadStream(filepath).pipe(res);
    return true;
  }
}
