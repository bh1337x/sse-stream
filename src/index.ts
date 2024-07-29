import {
  createServer,
  type IncomingMessage,
  type ServerResponse
} from "node:http";
import { Stream } from "./stream";
import { sleep } from "bun";

async function handler(request: IncomingMessage, response: ServerResponse) {
  const stream = new Stream(request, response);
  stream.open();

  stream.send('Hello, world!');
  stream.push('time', { time: new Date().toISOString() });
  await sleep(3000);
  stream.send('Goodbye, world!');

  stream.close();
}

async function main() {
  const server = createServer((request, response) => {
    handler(request, response).catch((e) => {
      if (!response.headersSent) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
      }
      
      console.error(e);
      response.end(e.stack);
    });
  });

  server.listen(1337, () => {
    console.log('Server listening on port 1337');
  });

  process.on('SIGINT', () => {
    server.close();
  });
}

if (import.meta.main) {
  main().catch(console.error);
}