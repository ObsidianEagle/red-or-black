import { } from 'dotenv/config.js';
import fs from 'fs';
import https from 'https';
import readline from 'readline';
import WebSocket from 'ws';
import { EXIT, HELP, REMOVE_PLAYER, RESTART, SET_DECKS, SKIP, UPDATE } from './constants/commands.js';
import { PLAYER_INIT, SERVER_ERROR } from './constants/messages.js';
import { CHOOSE, CONTINUE, FUCK_YOU, RED_OR_BLACK } from './constants/statuses.js';
import {
  broadcastGameState,
  handleRedOrBlackChoice,
  initialisePlayer,
  nextPlayer,
  populateDeck,
  removePlayer,
  restartGame,
  setPlayerStatus,
  updateCurrentGame
} from './game.js';

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

const sendServerError = (errorMessage, clients) => {
  const msgObject = {
    type: SERVER_ERROR,
    payload: {
      errorMessage
    }
  };
  const msgString = JSON.stringify(msgObject);
  clients.forEach((client) => client.send(msgString));
  console.debug(
    `server error with message ${errorMessage} sent to client(s) ${clients.map((client) => client.id).join()}`
  );
};

// GLOBALS
const clients = [];
let numberOfDecks = 1;
let idCounter = 1;
const gameState = {
  public: {
    players: [],
    game: RED_OR_BLACK,
    currentPlayer: null
  },
  private: {
    playerCards: {},
    deck: populateDeck(numberOfDecks)
  }
};

// WEBSOCKET LISTENERS
wss.on('connection', (ws) => {
  ws.id = idCounter++;
  clients.push(ws);

  ws.on('open', () => {
    console.debug(`client ${ws.id}: connection opened`);
  });

  ws.on('message', (reqString) => {
    const req = JSON.parse(reqString);
    console.log(req);
    switch (req.type) {
      case PLAYER_INIT:
        const duplicateName = gameState.public.players.find((player) => player.name === req.payload.name);
        if (duplicateName) {
          sendServerError(
            `Player with name "${req.payload.name}" has already joined - please choose a different name`,
            [ws]
          );
          break;
        }

        initialisePlayer(req.payload, gameState, ws);
        console.debug(`client ${ws.id}: player initialised with name ${ws.name}`);
        broadcastGameState(gameState, clients);
        break;
      case PLAYER_ACTION:
        switch (gameState.public.game) {
          case RED_OR_BLACK:
            if (ws.id !== gameState.public.currentPlayer) break;
            if (req.payload.action === CHOOSE) {
              handleRedOrBlackChoice(gameState, req.payload.choice, ws.id);
            } else if (req.payload.action === CONTINUE) {
              setPlayerStatus(gameState, gameState.public.currentPlayer, null);
              nextPlayer(gameState);
              setPlayerStatus(gameState, gameState.public.currentPlayer, CHOOSE);
              updateCurrentGame(gameState);
            }
            break;
          case FUCK_YOU:
            // TODO
            break;
          default:
            break;
        }
        broadcastGameState(gameState, clients);
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    removePlayer(gameState, ws, clients);
    console.debug(`client ${ws.id}: connection closed, removed from game`);

    if (!gameState.players.length) {
      restartGame(gameState, numberOfDecks);
      idCounter = 1;
      console.debug(`no players remaining, game state reset`);
    }

    broadcastGameState(gameState, clients);
  });

  ws.on('error', (err) => {
    console.debug(`client ${ws.id}: error: ${err.message}`);
  });
});

wss.on('error', (err) => {
  console.debug(`server encountered an error: ${err.name} - ${err.message}`);
});

// SERVER CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.info(`Server running on port ${PORT}`);
console.info('Type `start` to begin the game');
console.info('Type `help` to see a list of commands.');

rl.on('line', (input) => {
  const inputSplit = input.split(' ');
  const command = inputSplit[0].toLowerCase();
  const parameter = input.split.length > 1 ? inputSplit[1] : null;
  switch (command) {
    case HELP:
      console.info('Available commands:');
      console.info("  `skip` - skip the current player's turn.");
      console.info('  `update` - broadcast the current game state to all players.');
      console.info('  `restart` - restart the game.');
      console.info('  `set-decks <number_of_decks>` - update the number of decks in play.');
      console.info('  `remove-player <player_id>` - remove a player from the game. [TODO - Not Yet Implemented]');
      console.info('  `exit` - close the server.');
      break;
    case SKIP:
      // TODO
      break;
    case EXIT:
      console.info('Closing server.');
      wss.close();
      process.exit(0);
    case UPDATE:
      // TODO
      break;
    case RESTART:
      // TODO
      break;
    case SET_DECKS:
      if (!parameter || isNaN(parseInt(parameter))) {
        console.info('No valid selection given.');
      } else {
        numberOfDecks = parseInt(parameter);
      }
      break;
    case REMOVE_PLAYER:
      // TODO
      break;
    case '':
      break;
    default:
      console.info('Command not recognised.');
      break;
  }
});

if (httpsServer) {
  httpsServer.listen(PORT);
}
