import * as fs from 'fs/promises';

export type FileInfoProps = {
  size: number;
  mtime: number;
  isFile: boolean;
  isDir: boolean;
};
export class FsUtils {
  static readFile = async (filePath: string): Promise<string | undefined> => {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      return text;
    } catch (e) {
      console.log('writeFile failed', e);
      return undefined;
    }
  };

  static fileInfo = async (filePath: string): Promise<FileInfoProps | undefined> => {
    try {
      const stats = await fs.stat(filePath);
      return { size: stats.size, mtime: stats.mtime.getTime(), isFile: stats.isFile(), isDir: stats.isDirectory() };
    } catch {
      return undefined;
    }
  };

  static writeFile = async (
    filePath: string,
    content:
      | string
      | NodeJS.ArrayBufferView
      | Iterable<string | NodeJS.ArrayBufferView>
      | AsyncIterable<string | NodeJS.ArrayBufferView>
  ): Promise<boolean> => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    } catch (e) {
      console.log('writeFile failed', e);
      return false;
    }
  };

  static appendFile = async (filePath: string, content: string | Uint8Array): Promise<boolean> => {
    try {
      await fs.appendFile(filePath, content, 'utf-8');
      return true;
    } catch (e) {
      console.log('appendFile failed', e);
      return false;
    }
  };

  static pathExist = async (filePath: string) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  };

  static pathMkdir = async (dirPath: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch {
      return false;
    }
  };

  static unlinkPath = async (filePath: string) => {
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  };

  static renamePath = async (filePath: string, newPath: string) => {
    try {
      await fs.rename(filePath, newPath);
      return true;
    } catch {
      return false;
    }
  };

  static getListNames = async (dirPath: string) => {
    try {
      const files = await fs.readdir(dirPath, { recursive: false });
      return files;
    } catch {
      return [];
    }
  };

  static getListDirent = async (dirPath: string) => {
    try {
      const files = await fs.readdir(dirPath, {
        recursive: false,
        withFileTypes: true,
      });
      return files;
    } catch {
      return [];
    }
  };
}
