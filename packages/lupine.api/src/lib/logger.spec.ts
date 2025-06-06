import { Logger, LogLevels } from './logger';
const cluster = require('cluster');
const vm = require('vm');

const fs = require('fs');
jest.mock('fs');
jest.mock('cluster');

describe('Test logger', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('test init without recreating a file', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 1 });

    const logger = new Logger('test1');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 1024,
      maxCount: 5,
      outToFile: true,
      outToConsole: true,
      level: LogLevels.debug,
    });

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.openSync).toHaveBeenCalled();
    expect(fs.fstatSync).toHaveBeenCalled();
    expect(fs.existsSync.mock.calls[0][0]).toBe('./log');
    expect(fs.mkdirSync.mock.calls[0][0]).toBe('./log');
    expect(fs.openSync.mock.calls[0][0]).toBe('log/log0.log');
  });

  it('test init, with recreating log file', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 1025 });

    const logger = new Logger('test2');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 10,
      maxCount: 5,
      outToFile: true,
      outToConsole: true,
      level: LogLevels.debug,
    });

    logger.debug('a'.repeat(11));

    expect(fs.closeSync).toHaveBeenCalled();
    expect(fs.openSync).toHaveBeenCalled();
    expect(fs.fstatSync).toHaveBeenCalled();
    expect(fs.closeSync.mock.calls[0][0]).toBe(1);

    expect(fs.renameSync.mock.calls[0][0]).toBe('log/log3.log');
    expect(fs.renameSync.mock.calls[3][0]).toBe('log/log0.log');

    expect(fs.openSync.mock.calls[0][0]).toBe('log/log0.log');
    expect(fs.openSync.mock.calls[1][0]).toBe('log/log0.log');
  });

  it('test init, with recreating log file after logs', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 9 });

    const logger = new Logger('test2');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 10,
      maxCount: 5,
      outToFile: true,
      outToConsole: true,
      level: LogLevels.debug,
    });

    logger.debug('a'.repeat(9));

    expect(fs.openSync).toHaveBeenCalled();
    expect(fs.fstatSync).toHaveBeenCalled();

    fs.fstatSync.mockReturnValue({ size: 11 });
    logger.debug('a'.repeat(2));

    expect(fs.closeSync).toHaveBeenCalled();
    expect(fs.closeSync.mock.calls[1][0]).toBe(1);
    expect(fs.renameSync.mock.calls[0][0]).toBe('log/log3.log');
    expect(fs.renameSync.mock.calls[3][0]).toBe('log/log0.log');

    expect(fs.openSync.mock.calls[0][0]).toBe('log/log0.log');
    expect(fs.openSync.mock.calls[1][0]).toBe('log/log0.log');
  });

  it('test log format', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 9 });

    const logger = new Logger('test2');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 1024,
      maxCount: 5,
      outToFile: true,
      outToConsole: true,
      level: LogLevels.debug,
    });

    logger.debug(
      'log test. numer: %d, string: %s, json: %j, [%%], Pretty-print: %O',
      123,
      's456',
      { k: 'key', v: 789 },
      { k2: 'key2', v2: 901 }
    );
    console.log('test writing log: [' + fs.writeFileSync.mock.calls[0][1].toString() + ']');
    expect(
      fs.writeFileSync.mock.calls[0][1]
        .toString()
        .endsWith(
          `test2: log test. numer: 123, string: s456, json: {"k":"key","v":789}, [%], Pretty-print: { k2: 'key2', v2: 901 }\r\n`
        )
    ).toBe(true);
  });

  it('test different log level', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 9 });

    const logger = new Logger('test2');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 1024,
      maxCount: 5,
      outToFile: true,
      outToConsole: true,
      level: LogLevels.info,
    });

    logger.debug('a'.repeat(10));
    logger.info('b'.repeat(10));
    logger.warn('c'.repeat(10));
    logger.error('d'.repeat(10));
    logger.fatal('e'.repeat(10));
    console.log('test writing log: [' + fs.writeFileSync.mock.calls[0][1].toString() + ']');
    expect(fs.writeFileSync.mock.calls[0][1].toString().endsWith('test2: bbbbbbbbbb\r\n')).toBe(true);
    expect(fs.writeFileSync.mock.calls[3][1].toString().endsWith('test2: eeeeeeeeee\r\n')).toBe(true);
  });

  it('test logs in cluster, messages should be sent to Master', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 1 });

    const process = require('process');
    const mockSend = jest.spyOn(process, 'send').mockImplementation(() => {});

    const logger = new Logger('test2');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 1024,
      maxCount: 5,
      outToFile: true,
      outToConsole: true,
      level: LogLevels.debug,
    });

    // change isPrimary to false, so Logger will send message to Master
    cluster.isPrimary = false;
    logger.debug('isPrimary, %d, %s', 1, '2');
    cluster.isPrimary = true;

    expect(mockSend).toHaveBeenCalledWith({
      color: 204,
      id: 'LogWriter',
      level: 'DEBUG',
      messageList: ['isPrimary, %d, %s', 1, '2'],
      namespace: 'test2',
      pid: process.pid,
    });
  });

  it('test no file output', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.openSync.mockReturnValue(1);
    fs.fstatSync.mockReturnValue({ size: 1 });

    const logger = new Logger('test2');
    logger.init({
      folder: './log',
      filename: 'log%index%.log',
      maxSize: 1024,
      maxCount: 5,
      outToFile: false,
      outToConsole: true,
      level: LogLevels.debug,
    });

    logger.debug('debug');

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
