import { ServerResponse } from 'http';
import { encodeHtml } from './encode-html';
import { IsType } from '../lib';

export const handler200 = (res: ServerResponse, msg: string | object, title = '', contentType?: string) => {
  handlerResponse(res, 200, title, msg, contentType);
};

export const handler304 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 304, '304 Not Modified', msg, contentType);
};

export const handler403 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 403, '403 Forbidden', msg, contentType);
};

export const handler405 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 405, '405 Method Not Allowed', msg, contentType);
};

export const handler404 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 404, '404 Not Found', msg, contentType);
};

export const handler416 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 416, '416 Range Not Satisfiable', msg, contentType);
};

export const handler500 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 500, '500 Internal Server Error', msg, contentType);
};

export const handler400 = (res: ServerResponse, msg?: string | object, contentType?: string) => {
  handlerResponse(res, 400, '400 Bad Request', msg, contentType);
};

export const handlerResponse = (
  res: ServerResponse,
  statusCode: number,
  title: string,
  msg?: string | object,
  contentType?: string
) => {
  res.statusCode = statusCode;
  if (res.writable) {
    try {
      res.setHeader('content-type', contentType || 'text/html');
    } catch (e) {
      // errors may have been triggered when headers being sent already
    }
  }

  const text = IsType.isObject(msg) ? JSON.stringify(msg) : (msg as string);
  const html = contentType === 'application/json' ? msg : generateHtml(title, text || title);
  res.end(html);
};

export const generateHtml = (title: string, message: string) => {
  return `${[
    '<!doctype html>',
    '<html>',
    '  <head>',
    '    <meta charset="utf-8">',
    `    <title>${title}</title>`,
    '  </head>',
    '  <body>',
    `      <p>${encodeHtml(message)}</p>`,
    '  </body>',
    '</html>',
  ].join('\n')}\n`;
};
