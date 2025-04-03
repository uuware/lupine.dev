import { ServerResponse } from 'http';
import { Logger, ServerRequest } from 'lupine.api';
import fsPromises from 'fs/promises';
import fs from 'fs';

const logger = new Logger('file-api-base');
export const sendFile = async (req: ServerRequest, res: ServerResponse, filename: string) => {

  // add 3 days cache
  res.setHeader('Cache-Control', 'public, max-age=2592000');
  res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());

  const videoStream = fs.createReadStream(filename);
  videoStream.pipe(res);
  return true;
};

export const sendVideo = async (req: ServerRequest, res: ServerResponse, filename: string) => {
  const rangeHeader = req.headers.range;
  // check req header if it contains a rage attr
  if (!rangeHeader) throw new Error('Requires Range header');

  const fileData = await fsPromises.stat(filename);
  const videoSize = fileData.size;

  const splittedRange = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(splittedRange[0]);
  const end = splittedRange[1] ? parseInt(splittedRange[1], 10) : videoSize - 1;
  const contentLength = end - start + 1;
  logger.debug(`sendVideo, Start: ${start}, End: ${end}, Content-Length: ${contentLength}, Video Size: ${videoSize}`);

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  // create a read stream and pipe it ro the res object
  const videoStream = fs.createReadStream(filename, { start, end });

  res.writeHead(206, headers);
  videoStream.pipe(res);
  return true;
};
