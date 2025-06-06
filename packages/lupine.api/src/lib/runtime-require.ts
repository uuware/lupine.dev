import { Logger } from './logger';

const path = require('path');

const logger = new Logger('RuntimeRequire');
export class RuntimeRequire {
  constructor() {}

  static require(p: string) {
    logger.debug('require: ' + p);
    return eval('require')(p);
  }

  static requireRelative(rootPath: string, relativePath: string) {
    const p = path.resolve(rootPath, relativePath);
    logger.debug('require: ' + p);
    return eval('require')(p);
  }
}
