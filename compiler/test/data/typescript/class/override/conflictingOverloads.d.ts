declare class Message {
  once(event: 'abort', listener: () => void): this;
  once(event: 'timeout', listener: () => void): this;
  once(event: any, listener: () => void): this;
  once(event: 'close', listener: () => void): this;
  once(event: 'drain', listener: () => void): this;
}


declare interface Ping {
  ping(a: Number | String);
  ping(a: Boolean | Number);
}