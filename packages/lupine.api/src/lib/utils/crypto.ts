import crypto from 'crypto';
import { Buffer } from 'node:buffer';

// Hex takes two characters for each byte - Base64 takes 4 characters for every 3 bytes, so it's more efficient than hex
// https://github.com/luke-park/SecureCompatibleEncryptionExamples/blob/master/JavaScript/SCEE-Node.js
export class CryptoUtils {
  static ALGORITHM_NAME = 'aes-256-cbc';
  static ALGORITHM_NONCE_SIZE = 16; // need 16 for aes-256-cbc
  static encrypt(text: string, key: string) {
    const pass = crypto.createHash('md5').update(key).digest('hex');
    const nonce = crypto.randomBytes(this.ALGORITHM_NONCE_SIZE);
    const cipher = crypto.createCipheriv(this.ALGORITHM_NAME, Buffer.from(pass), nonce);

    // cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    const buf = Buffer.concat([nonce, cipher.update(Buffer.from(text, 'utf8')), cipher.final()]);
    return buf.toString('base64');
  }

  static decrypt(encryptedWithNonce: string, key: string) {
    const pass = crypto.createHash('md5').update(key).digest('hex');
    const buf = Buffer.from(encryptedWithNonce, 'base64');
    const nonce = buf.subarray(0, this.ALGORITHM_NONCE_SIZE);
    const cipherText = buf.subarray(this.ALGORITHM_NONCE_SIZE);

    const cipher = crypto.createDecipheriv(this.ALGORITHM_NAME, Buffer.from(pass), nonce);
    const buf2 = Buffer.concat([cipher.update(cipherText), cipher.final()]);
    return buf2.toString('utf8');
  }

  static hash(text: string) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  static sha256(text: string) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  static randomString(len: number) {
    return crypto.randomBytes(len).toString('hex');
  }

  static randomNumberString(len: number) {
    return crypto.randomInt(10 ** (len - 1), 10 ** len - 1).toString();
  }

  static uuid() {
    return crypto.randomUUID();
  }
}
