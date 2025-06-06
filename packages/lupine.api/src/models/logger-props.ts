export enum LogLevels {
  'fatal' = 'fatal',
  'error' = 'error',
  'warn' = 'warn',
  'info' = 'info',
  'debug' = 'debug',
}

export interface LogConfig {
  folder: string;
  filename: string; // %index% will be replaced with 0, 1, ..., maxCount
  maxSize: number;
  maxCount: number;
  outToFile: boolean;
  outToConsole: boolean;
  level: LogLevels;
}

const getSizeFromString = (value: string | undefined, defaultValue: number) => {
  if (typeof value === 'undefined' || value === '') return defaultValue;
  // the value can be a number, or ?kb, or ?mb
  const match = value!.match(/^(\d+)(kb|mb)?$/i);
  if (match) {
    const number = parseInt(match[1], 10);
    if (match[2]?.toLowerCase() === 'kb') {
      return number * 1024;
    } else if (match[2]?.toLowerCase() === 'mb') {
      return number * 1024 * 1024;
    }
    return number;
  } else {
    console.error(`Invalid log size: ${value}`);
  }
  return defaultValue;
};

const isStringTrue = (value: string | undefined, defaultValue: boolean) => {
  if (typeof value === 'undefined' || value === '') return defaultValue;
  value = (value || '').trim().toLocaleLowerCase();
  return value === 'true' || value === '1';
};
export const getDefaultLogConfig = (): LogConfig => {
  // process.env may not be initialized at script starting
  return {
    folder: process.env['LOG_FOLDER'] || './log/',
    filename: process.env['LOG_FILENAME'] || 'log-%index%.log', // %index% will be replaced with 0, 1, ..., maxCount-1, default is 0
    maxSize: getSizeFromString(process.env['LOG_MAX_SIZE'], 1024 * 1024 * 1),
    maxCount: Number(process.env['LOG_MAX_COUNT'] || '5'),
    outToFile: isStringTrue(process.env['LOG_OUT_TO_FILE'], true),
    outToConsole: isStringTrue(process.env['LOG_OUT_TO_CONSOLE'], true),
    level: (process.env['LOG_LEVEL'] || 'info').trim().toLocaleLowerCase() as LogLevels,
  };
};

export interface LogMessageFromSubProcess {
  id: string;
  pid: number | undefined;
  uuid?: string;
  level: string;
  namespace: string;
  color: LoggerColors | undefined;
  messageList: (string | number | object)[];
}

// Colors for console
// https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
export const enum LoggerColors {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
  BrightBlack = 8,
  BrightRed = 9,
  BrightGreen = 10,
  BrightYellow = 11,
  BrightBlue = 12,
  BrightMagenta = 13,
  BrightCyan = 14,
  BrightWhite = 15,
}
