import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import crypto from 'crypto';

// https://github.com/ErickWendel/websockets-with-nodejs-from-scratch/blob/main/nodejs-raw-websocket/server.mjs
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
// https://github.com/websockets/ws/blob/d343a0cf7bba29a4e14217cb010446bec8fdf444/lib/receiver.js

// This is a specification specific to WebSocket protocol
const WEBSOCKET_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const SEVEN_BITS_INTEGER_MARKER = 125;
const SIXTEEN_BITS_INTEGER_MARKER = 126;

const MAXIMUM_SIXTEEN_BITS_INTEGER = 2 ** 16; // 0 to 65536
const MASK_KEY_BYTES_LENGTH = 4;
const OPCODE_TEXT = 0x01; // 1 bit in binary 1
const FIRST_BIT = 128;

// This is only used in debug mode (no clusters)
export class MiniWebSocket {
  clientRefreshFlag = Date.now();
  clients = new Set();
  _onMessage: Function;

  constructor(onMessage: Function) {
    this._onMessage = onMessage;
  }

  public handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    this.clients.add(socket);
    socket.on('close', () => {
      console.log('socket closed');
      this.clients.delete(socket);
    });
    socket.on('error', () => {
      console.log('socket error');
      this.clients.delete(socket);
    });
    socket.on('end', () => {
      console.log('socket end');
      this.clients.delete(socket);
    });
    socket.on('readable', () => this.onSocketReadable(socket));
    const key = req.headers['sec-websocket-key']!;
    socket.write(this.handleHeaders(key));
  }

  private handleHeaders(key: string) {
    const digest = crypto
      .createHash('sha1')
      .update(key + WEBSOCKET_GUID)
      .digest('base64');
    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Content-Type: text/html',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`,
    ];
    return headers.concat('\r\n').join('\r\n');
  }

  private onSocketReadable(socket: Duplex) {
    try {
      // consume optcode (first byte)
      // 1 - 1 byte - 8bits
      socket.read(1);

      const [markerAndPayloadLength] = socket.read(1);
      // Because the first bit is always 1 for client-to-server messages
      // you can subtract one bit (128 or '10000000')
      // from this byte to get rid of the MASK bit
      const lengthIndicatorInBits = markerAndPayloadLength - FIRST_BIT;

      let messageLength = 0;
      if (lengthIndicatorInBits <= SEVEN_BITS_INTEGER_MARKER) {
        messageLength = lengthIndicatorInBits;
      } else if (lengthIndicatorInBits === SIXTEEN_BITS_INTEGER_MARKER) {
        // unsigned, big-endian 16-bit integer [0 - 65K] - 2 ** 16
        messageLength = socket.read(2).readUint16BE(0);
      } else {
        throw new Error(`Message is too long!`);
      }
      if (messageLength < 1) {
        return;
      }

      const maskKey = socket.read(MASK_KEY_BYTES_LENGTH);
      const encoded = socket.read(messageLength);
      const decoded = this.unmask(encoded, maskKey);
      const received = decoded.toString('utf8');
      console.log('message received: ', received);
      this._onMessage(received, socket);
    } catch (error) {}
  }

  private unmask(encodedBuffer: Buffer, maskKey: Buffer) {
    const finalBuffer = Buffer.from(encodedBuffer);
    for (let index = 0; index < encodedBuffer.length; index++) {
      finalBuffer[index] = encodedBuffer[index] ^ maskKey[index % MASK_KEY_BYTES_LENGTH];
    }

    return finalBuffer;
  }

  public broadcast(msg: string) {
    const data = this.prepareMessage(msg);
    this.clients.forEach((socket: any) => {
      if (socket.readyState === 'open' || socket.readyState === 'writeOnly') {
        socket.write(data);
      } else {
        this.clients.delete(socket);
      }
    });
  }
  public sendMessage(socket: Duplex, msg: string) {
    const data = this.prepareMessage(msg);
    socket.write(data);
  }

  private concat(bufferList: any, totalLength: any) {
    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for (const buffer of bufferList) {
      target.set(buffer, offset);
      offset += buffer.length;
    }

    return target;
  }

  private prepareMessage(message: string) {
    const msg = Buffer.from(message);
    const messageSize = msg.length;

    let dataFrameBuffer;

    // 0x80 === 128 in binary
    // '0x' +  Math.abs(128).toString(16) == 0x80
    const firstByte = 0x80 | OPCODE_TEXT; // single frame + text
    if (messageSize <= SEVEN_BITS_INTEGER_MARKER) {
      const bytes = [firstByte];
      dataFrameBuffer = Buffer.from(bytes.concat(messageSize));
    } else if (messageSize <= MAXIMUM_SIXTEEN_BITS_INTEGER) {
      const offsetFourBytes = 4;
      const target = Buffer.allocUnsafe(offsetFourBytes);
      target[0] = firstByte;
      target[1] = SIXTEEN_BITS_INTEGER_MARKER | 0x0; // just to know the mask

      target.writeUint16BE(messageSize, 2); // content lenght is 2 bytes
      dataFrameBuffer = target;

      // alloc 4 bytes
      // [0] - 128 + 1 - 10000001  fin + opcode
      // [1] - 126 + 0 - payload length marker + mask indicator
      // [2] 0 - content length
      // [3] 113 - content length
      // [ 4 - ..] - the message itself
    } else {
      throw new Error('Message is too long.');
    }
    const totalLength = dataFrameBuffer.byteLength + messageSize;
    const dataFrameResponse = this.concat([dataFrameBuffer, msg], totalLength);
    return dataFrameResponse;
  }
}
