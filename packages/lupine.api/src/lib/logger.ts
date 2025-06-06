// here it must import from async-storage but not from api!
import { asyncLocalStorage } from '../api/async-storage';
import { LogConfig, LogLevels, LogMessageFromSubProcess, LoggerColors, getDefaultLogConfig } from '../models/logger-props';

const fs = require('fs');
const util = require('util');
const cluster = require('cluster');
const path = require('path');

export const LogWriterMessageId = 'LogWriter';
/*
%O	Pretty-print an Object on multiple lines.
%o	Pretty-print an Object all on a single line.
%s	String.
%d	Number (both integer and float).
%j	JSON. Replaced with the string '[Circular]' if the argument contains circular references.
%%	Single percent sign ('%'). This does not consume an argument.

logger.info('log test. numer: %d, string: %s, json: %j', 11, 'p2', {key: 'value', n: 22});
*/
export class LogWriter {
  static instance = new LogWriter();

  private constructor() {}

  private _config: LogConfig | undefined;
  getConfig = (): LogConfig => {
    return this._config || getDefaultLogConfig();
  };

  savedSize = -1; // -1 for needing initialize
  fileHandle = 0;
  level = Object.keys(LogLevels).findIndex((item) => item === this.getConfig().level);

  private _init(config: LogConfig) {
    console.debug(`init Log: ${config.level}`);
    if (!cluster.isPrimary) {
      console.error('Logger cannot be initialised in sub process.');
      return;
    }

    this._config = {
      ...getDefaultLogConfig(),
      ...config,
    };

    this.level = Object.keys(LogLevels).findIndex((item) => item === this.getConfig().level);
    if (this.fileHandle > 0) {
      fs.closeSync(this.fileHandle);
      this.fileHandle = 0;
    }
    if (this.getConfig().outToFile) {
      if (!fs.existsSync(this.getConfig().folder)) {
        fs.mkdirSync(this.getConfig().folder, { recursive: true });
      }

      const filename = path.join(
        this.getConfig().folder,
        this.getConfig().filename.replace('%index%', '0')
      );
      this.fileHandle = fs.openSync(filename, 'a+');
      if (this.fileHandle <= 0) {
        this.savedSize = 0;
        console.error(`Open log error, descriptor: ${this.fileHandle}, file: ${filename}`);
        return;
      }
      this.checkSize();
    }
  }

  checkSize() {
    if (this.fileHandle <= 0) {
      return;
    }

    const stats = fs.fstatSync(this.fileHandle);
    this.savedSize = stats['size'];
    if (this.savedSize >= this.getConfig().maxSize) {
      fs.closeSync(this.fileHandle);
      const filename = this.getConfig().filename;
      if (filename.indexOf('%index%') >= 0) {
        const maxCount = this.getConfig().maxCount || 5;
        for (let i = maxCount - 1; i >= 1; i--) {
          const nameFrom = path.join(this.getConfig().folder, filename.replace('%index%', (i - 1).toString()));
          const nameTo = path.join(this.getConfig().folder, filename.replace('%index%', i.toString()));
          if (fs.existsSync(nameFrom)) {
            fs.renameSync(nameFrom, nameTo);
          }
        }
      } else if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
      const nameCurrent = path.join(this.getConfig().folder, filename.replace('%index%', '0'));
      this.fileHandle = fs.openSync(nameCurrent, 'a+');
      this.savedSize = 0;
      if (this.fileHandle <= 0) {
        console.error(`Open log error, descriptor: ${this.fileHandle}, file: ${nameCurrent}`);
      }
    }
  }

  timestamp(date?: Date) {
    return (date || new Date()).toJSON();
  }

  /*
	messageFromSubProcess should be called from worker process.

	// must be let!
	let worker = cluster.fork();

	worker.on('message', (msgObject) => {
		if (!msgObject || !msgObject.id) {
			logger.warn(`Unknown message from work: ${worker.id}`);
			return;
		}

		if (msgObject.id == LogWriterMessageId) {
			logger.messageFromSubProcess(msgObject);
		}
		...
	});

	*/
  // this is primary, msg is from a client. LogWriter only writes to a file in primary
  static messageFromSubProcess(msgObject: LogMessageFromSubProcess) {
    if (!cluster.isPrimary || !msgObject.level || !msgObject.messageList) {
      console.error('Logger got wrong message: ', msgObject);
      return;
    }
    LogWriter.instance._log(
      msgObject.level,
      msgObject.namespace,
      msgObject.color,
      msgObject.messageList,
      msgObject.pid,
      msgObject.uuid
    );
  }

  _log(
    level: string,
    namespace: string,
    color: LoggerColors | undefined,
    messageList: (string | object | number)[],
    pid?: number,
    uuid?: string
  ) {
    const store = asyncLocalStorage.getStore();
    uuid = !uuid && store && store.uuid ? ':' + store.uuid : '';
    if (!cluster.isPrimary) {
      if (process && process.send) {
        const obj: LogMessageFromSubProcess = {
          id: LogWriterMessageId,
          pid: pid || process.pid,
          level,
          namespace,
          color,
          messageList,
          uuid,
        };
        process.send(obj);
      } else {
        console.error('Logger is not in Master but also not in sub process!');
      }
      return;
    }
    if (!this.getConfig().outToFile && !this.getConfig().outToConsole) {
      return;
    }
    if (this.savedSize == -1) {
      // all config must be in process.env
      this._init(getDefaultLogConfig());
    }

    const s = util.format(...messageList);
    pid = pid ? pid : process.pid;
    const ns = !namespace ? '' : '[' + namespace + '] ';
    // Safety check, cut it if the string is too long
    if (s.length > 1024) {
      console.warn('Log string is too long: ' + s.length);
    }
    const msg = `${this.timestamp()} ${level} [${pid}${uuid}] ${ns}${s.length > 1024 ? s.substring(0, 1024) : s}`;
    if (this.getConfig().outToFile) {
      if (this.savedSize >= this.getConfig().maxSize) {
        this.checkSize();
      }
      if (this.fileHandle <= 0) {
        console.error(`Log to file error, msg: ${msg}`);
      } else {
        const msgBuf = Buffer.from(msg + '\r\n');
        const options = { flag: 'a+', encoding: 'utf8', mode: '0777' };
        fs.writeFileSync(this.fileHandle, msgBuf, options);
        this.savedSize += msgBuf.byteLength;
      }
    }
    if (this.getConfig().outToConsole) {
      // background color on Chrome's console, error: 250 230 230, warn: 255 241 212
      if (typeof color === 'undefined' && level !== 'ERROR' && level !== 'WARN') {
        console.log(msg);
      } else {
        const printColor = level === 'ERROR' ? 196 : level === 'WARN' ? 199 : color;
        console.log(`\u001B[38:5:${printColor};1m${msg}\u001B[0m`);
      }
    }
  }
}

export class Logger {
  namespace = '';
  color: LoggerColors | undefined = undefined;
  constructor(namespace: string, color?: LoggerColors) {
    this.namespace = namespace;
    this.color = color;
    // if (this.isDebug()) {
    // 	if (typeof color === 'undefined') {
    // 		console.log(`[Logger] namespace: ${namespace}, color: undefined`);
    // 	} else {
    // 		console.log(
    // 			`\u001B[38:5:${this.color};1m[Logger] namespace: ${namespace}, color: ${this.color}\u001B[0m`
    // 		);
    // 	}
    // }
  }

  isDebug(): boolean {
    return LogWriter.instance.level <= 4;
  }

  debug(...message: (string | object | number)[]) {
    if (LogWriter.instance.level < 4) {
      return;
    }
    LogWriter.instance._log('DEBUG', this.namespace, this.color, message);
  }

  info(...message: (string | object | number)[]) {
    if (LogWriter.instance.level < 3) {
      return;
    }
    LogWriter.instance._log('INFO', this.namespace, this.color, message);
  }

  warn(...message: (string | object | number)[]) {
    if (LogWriter.instance.level < 2) {
      return;
    }
    LogWriter.instance._log('WARN', this.namespace, this.color, message);
  }

  error(...message: (string | object | number)[]) {
    if (LogWriter.instance.level < 1) {
      return;
    }
    LogWriter.instance._log('ERROR', this.namespace, this.color, message);
  }

  fatal(...message: (string | object | number)[]) {
    if (LogWriter.instance.level < 0) {
      return;
    }
    LogWriter.instance._log('FATAL', this.namespace, this.color, message);
  }
}
