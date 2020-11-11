import { } from 'dotenv/config.js';
import fs from 'fs';
import https from 'https';
import WebSocket from 'ws';

// SERVER
let PORT = 8080;
if (process.argv.length > 2) PORT = process.argv[2];
if (process.env.PORT) PORT = process.env.PORT;

const wssConfig = {};
let httpsServer;
if (process.env.USE_HTTPS_SERVER === 'true') {
  httpsServer = https.createServer({
    cert: fs.readFileSync('src/config/server.crt'),
    key: fs.readFileSync('src/config/server.key')
  });
  wssConfig.server = httpsServer;
} else {
  wssConfig.port = PORT;
}
const wss = new WebSocket.Server(wssConfig);

// GLOBALS
const clients = [];
let idCounter = 1;

// WEBSOCKET LISTENERS
wss.on('connection', (ws) => {
  ws.id = idCounter++;
  clients.push(ws);

  ws.on('open', () => {
    console.debug(`client ${ws.id}: connection opened`);
  });

  ws.on('message', (reqString) => {
    console.debug(`client ${ws.id}: ${reqString}`);
  });

  ws.on('close', () => {
    console.debug(`client ${ws.id}: connection closed`);
  });

  ws.on('error', (err) => {
    console.debug(`client ${ws.id}: error: ${err.message}`);
  });
});

wss.on('error', (err) => {
  console.debug(`server encountered an error: ${err.name} - ${err.message}`);
});

if (httpsServer) {
  httpsServer.listen(PORT);
}
