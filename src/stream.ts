import { EventEmitter } from 'node:events';
import type {  IncomingMessage, ServerResponse } from "node:http";

export class Stream {
  private events: EventEmitter;
  private request: IncomingMessage;
  private response: ServerResponse;
  public isOpen: boolean;
  public isClosed: boolean;

  constructor(request: IncomingMessage, response: ServerResponse) {
    this.events = new EventEmitter();
    this.request = request;
    this.response = response;
    this.isOpen = false;
    this.isClosed = false;

    this.events.on('push', (event: string, data: any) => {
      this.response.write(`event: ${event}\n`);
      this.response.write(`data: ${
        JSON.stringify(data)
      }\n\n`);
    });

    this.request.on('close', () => this.close());
  }

  public open() {
    this.response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    this.isOpen = true;
    this.push('open', 'connected');
  }

  public push(event: string, data: any) {
    if (this.isClosed) throw new Error('Stream is closed');

    process.nextTick(() => {
      console.log('push', event, data);
      this.events.emit('push', event, data);
      console.log('pushed', event, data);
    });
  }

  public send(data: any) {
    this.push('message', data);
  }

  public close() {
    if (this.isClosed) return;

    this.push('close', 'disconnected');
    process.nextTick(() => {
      this.response.end();

      this.isClosed = true;
      this.isOpen = false;
    });
  }
}