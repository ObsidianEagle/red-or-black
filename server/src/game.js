import { RED_OR_BLACK } from './constants/games';
import {
  BLACK,
  CLUBS,
  DIAMONDS,
  FUCK_YOU,
  HEARTS,
  IN_PROGRESS,
  LOWER,
  RED,
  RIDE_THE_BUS,
  SAME,
  SPADES
} from './constants/statuses';

export const populateDeck = (numberOfDecks) => {
  const suits = [HEARTS, SPADES, CLUBS, DIAMONDS];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const deck = [];
  for (let i = 0; i < numberOfDecks; i++) {
    suits.forEach((suit) => {
      values.forEach((value) => {
        deck.push({ suit, value });
      });
    });
  }

  const jokers = Array(2 * numberOfDecks).fill({ suit: null, value: 'JOKER' });

  return [...deck, ...jokers];
};

export const initialisePlayer = (playerInitRequest, gameState, ws) => {
  ws.name = playerInitRequest.name;
  const { name, id } = ws;
  gameState.public.players.push({
    name,
    id,
    status: null
  });
  gameState.private.playerCards[id] = [];
  if (!gameState.public.nextPlayer) gameState.public.nextPlayer = id;
  const playerInitAck = {
    type: PLAYER_INIT_ACK,
    payload: { id, gameState: gameState.public }
  };
  ws.send(JSON.stringify(playerInitAck));
};

export const broadcastGameState = (gameState, clients) => {
  clients.forEach((client) => {
    const msgObject = {
      type: GAME_STATE,
      payload: {
        gameState: gameState.public,
        cards: gameState.private.playerCards[client.id]
      }
    };
    const msgString = JSON.stringify(msgObject);
    client.send(msgString);
  });
  console.debug('game state broadcast to all clients');
};

export const removePlayer = (gameState, ws, clients) => {
  // Remove from client list
  clients.splice(
    clients.findIndex((client) => client.id === ws.id),
    1
  );

  // Return if client was not in player list
  const isPlayer = gameState.public.players.find((player) => player.id === ws.id);
  if (!isPlayer) return;

  // If leaving player is next up, move on to player after
  if (ws.id === gameState.public.nextPlayer) {
    gameState.public.nextPlayer =
      gameState.public.players[
        (gameState.public.players.findIndex((player) => player.id === ws.id) + 1) % gameState.public.players.length
      ].id;
  }

  // Remove leaving player from player list
  gameState.public.players.splice(
    gameState.public.players.findIndex((player) => player.id === ws.id),
    1
  );
};

export const restartGame = (gameState, numberOfDecks) => {
  gameState.public = {
    players: [],
    status: IN_PROGRESS,
    game: RED_OR_BLACK,
    nextPlayer: null
  };
  gameState.private = {
    playerCards: {},
    deck: populateDeck(numberOfDecks)
  };
};

export const updateCurrentGame = (gameState) => {
  switch (gameState.public.game) {
    case RED_OR_BLACK:
      const playerIds = gameState.public.players.map((player) => player.id);
      const fullHands = playerIds.filter((id) => gameState.private.playerCards[id].length === 5);
      if (fullHands.length === playerIds.length) {
        gameState.public.game = FUCK_YOU;
      }
      break;
    case FUCK_YOU:
      const playerIds = gameState.public.players.map((player) => player.id);
      const nonEmptyHands = playerIds.filter((id) => gameState.private.playerCards[id].length > 0);
      if (nonEmptyHands.length === 1) {
        gameState.public.game = RIDE_THE_BUS;
        gameState.public.nextPlayer = nonEmptyHands[0];
        gameState.private.deck = populateDeck(1);
      }
      break;
    default:
      break;
  }
};

export const cardValueToNumericalValue = (cardValue) => {
  const numericalValues = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
    JOKER: -1
  };
  return numericalValues[cardValue];
};

export const handleRedOrBlackChoice = (gameState, choice, playerId) => {
  const drawnCard = gameState.deck.splice(Math.floor(Math.random() * gameState.private.deck.length), 1)[0];
  const playerCards = gameState.private.playerCards[playerId];

  switch (gameState.private.playerCards[playerId].length) {
    case 0:
      if (
        (choice === RED && (drawnCard.suit === HEARTS || drawnCard.suit === DIAMONDS)) ||
        (choice === BLACK && (drawnCard.suit === SPADES || drawnCard.suit === CLUBS))
      ) {
        // Give drink
      } else {
        // Take drink
      }
    case 1:
      if (
        (choice === HIGHER &&
          cardValueToNumericalValue(drawnCard.value) > cardValueToNumericalValue(playerCards[0].value)) ||
        (choice === LOWER &&
          cardValueToNumericalValue(drawnCard.value) < cardValueToNumericalValue(playerCards[0].value)) ||
        (choice === SAME &&
          cardValueToNumericalValue(drawnCard.value) < cardValueToNumericalValue(playerCards[0].value))
      ) {
        // Give drink
      } else {
        // Take drink
      }
  }
};
