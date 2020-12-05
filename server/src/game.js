import { GAME_STATE, PLAYER_INIT_ACK } from './constants/messages.js';
import {
  BLACK,
  CHOOSE,
  CLUBS,
  CONTINUE,
  DIAMONDS,
  END,
  FUCK,
  FUCK_YOU,
  GIVE_DRINK,
  HEARTS,
  HIGHER,
  INBETWEEN,
  LOWER,
  OUTSIDE,
  RED,
  RED_OR_BLACK,
  RIDE_THE_BUS,
  SAME,
  SPADES,
  START,
  TAKE_DRINK
} from './constants/statuses.js';

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
    status: null,
    cardCount: 0
  });
  gameState.private.playerCards[id] = [];
  if (!gameState.public.currentPlayer) {
    gameState.public.currentPlayer = id;
    gameState.public.players.find((player) => player.id === id).status = CHOOSE;
  }
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
  if (ws.id === gameState.public.currentPlayer) {
    gameState.public.currentPlayer =
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
    game: RED_OR_BLACK,
    prevPlayer: null,
    currentPlayer: null,
    fuckCards: [],
    countdown: null,
    bus: []
  };
  gameState.private = {
    playerCards: {},
    deck: populateDeck(numberOfDecks),
    countdownCallback: null,
    bus: []
  };
};

export const updateCurrentGame = (gameState) => {
  const playerIds = gameState.public.players.map((player) => player.id);
  switch (gameState.public.game) {
    case RED_OR_BLACK:
      const fullHands = playerIds.filter((id) => gameState.private.playerCards[id].length === 5);
      if (fullHands.length === playerIds.length) {
        gameState.public.game = FUCK_YOU;
        gameState.public.currentPlayer = gameState.public.players[0].id;
        gameState.public.players[0].status = START;
        gameState.public.countdown = 15;
        return FUCK_YOU;
      }
      break;
    case FUCK_YOU:
      const playersWithCards = gameState.public.players.find((player) => player.cardCount > 0);
      if (playersWithCards.length === 1) {
        gameState.public.game = RIDE_THE_BUS;
        gameState.public.currentPlayer = playersWithCards[0].id;
        setPlayerStatus(gameState, playersWithCards[0].id, CONTINUE);
        gameState.private.deck = populateDeck(1);
        return RIDE_THE_BUS;
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

export const nextPlayer = (gameState, playerId) => {
  gameState.public.currentPlayer =
    gameState.public.players[
      (gameState.public.players.findIndex((player) => player.id === playerId) + 1) % gameState.public.players.length
    ].id;
};

export const setPlayerStatus = (gameState, playerId, status) => {
  gameState.public.players.find((player) => player.id === playerId).status = status;
};

export const handleRedOrBlackChoice = (gameState, choice, playerId) => {
  const drawnCard = gameState.private.deck.splice(Math.floor(Math.random() * gameState.private.deck.length), 1)[0];
  const drawnCardValue = cardValueToNumericalValue(drawnCard.value);
  const playerCards = gameState.private.playerCards[playerId];
  const playerHoldsJoker = playerCards.find((card) => card.value === 'JOKER');
  gameState.public.players.find((player) => player.id === playerId).cardCount++;

  switch (gameState.private.playerCards[playerId].length) {
    case 0:
      gameState.private.playerCards[playerId].push(drawnCard);
      if (
        (choice === RED && (drawnCard.suit === HEARTS || drawnCard.suit === DIAMONDS)) ||
        (choice === BLACK && (drawnCard.suit === SPADES || drawnCard.suit === CLUBS))
      ) {
        setPlayerStatus(gameState, playerId, GIVE_DRINK);
      } else {
        setPlayerStatus(gameState, playerId, TAKE_DRINK);
      }
      break;
    case 1:
      const playerCardValue = cardValueToNumericalValue(playerCards[0].value);
      gameState.private.playerCards[playerId].push(drawnCard);
      if (
        ((choice === HIGHER && drawnCardValue > playerCardValue) ||
          (choice === LOWER && drawnCardValue < playerCardValue) ||
          (choice === SAME && drawnCardValue < playerCardValue)) &&
        !playerHoldsJoker
      ) {
        setPlayerStatus(gameState, playerId, GIVE_DRINK);
      } else {
        setPlayerStatus(gameState, playerId, TAKE_DRINK);
      }
      break;
    case 2:
      const sortedPlayerCardValues = playerCards
        .map((card) => cardValueToNumericalValue(card.value))
        .sort((a, b) => a - b);
      const lowerPlayerCardValue = sortedPlayerCardValues[0];
      const upperPlayerCardValue = sortedPlayerCardValues[1];
      gameState.private.playerCards[playerId].push(drawnCard);
      if (
        ((choice === OUTSIDE && (drawnCardValue < lowerPlayerCardValue || drawnCardValue > upperPlayerCardValue)) ||
          (choice === INBETWEEN && drawnCardValue > lowerPlayerCardValue && drawnCardValue < upperPlayerCardValue)) &&
        !playerHoldsJoker
      ) {
        setPlayerStatus(gameState, playerId, GIVE_DRINK);
      } else {
        setPlayerStatus(gameState, playerId, TAKE_DRINK);
      }
      break;
    case 3:
      gameState.private.playerCards[playerId].push(drawnCard);
      if (
        (choice === SPADES && drawnCard.suit === SPADES) ||
        (choice === CLUBS && drawnCard.suit === CLUBS) ||
        (choice === DIAMONDS && drawnCard.suit === DIAMONDS) ||
        (choice === HEARTS && drawnCard.suit === HEARTS)
      ) {
        setPlayerStatus(gameState, playerId, GIVE_DRINK);
      } else {
        setPlayerStatus(gameState, playerId, TAKE_DRINK);
      }
      break;
    case 4:
      gameState.private.playerCards[playerId].push(drawnCard);
      if (drawnCard.value === choice.value && drawnCard.suit === choice.suit) {
        setPlayerStatus(gameState, playerId, GIVE_DRINK);
      } else {
        setPlayerStatus(gameState, playerId, TAKE_DRINK);
      }
      break;
    default:
      break;
  }
};

export const handleFuck = (gameState, card, target, playerId, clients) => {
  gameState.public.currentPlayer = target;
  gameState.public.prevPlayer = playerId;
  gameState.public.players.forEach((player) => (player.status = null));
  gameState.public.players.find((player) => player.id === target).status = FUCK;
  gameState.public.fuckCards.push(card);
  gameState.private.playerCards[playerId].splice(
    gameState.private.playerCards[playerId].findIndex(
      (playerCard) => playerCard.suit === card.suit && playerCard.value === card.value
    ),
    1
  );
  gameState.public.players.find((player) => player.id === playerId).cardCount =
    gameState.private.playerCards[playerId].length;

  if (
    !Object.keys(gameState.private.playerCards).find((key) =>
      gameState.private.playerCards[key].find((playerCard) => playerCard.value === card.value)
    )
  ) {
    settleFucked(gameState, clients);
  } else {
    gameState.public.countdown = 15;
    if (gameState.private.countdownCallback) clearInterval(gameState.private.countdownCallback);
    gameState.private.countdownCallback = beginCountdownTimer(gameState, clients);
  }
};

export const settleFucked = (gameState, clients) => {
  gameState.public.countdown = null;
  clearInterval(gameState.private.countdownCallback);
  gameState.public.players.forEach((player) => player.status === null);
  setPlayerStatus(gameState, gameState.public.currentPlayer, TAKE_DRINK);
  broadcastGameState(gameState, clients);
};

export const beginCountdownTimer = (gameState, clients) =>
  setInterval(() => {
    if (gameState.public.countdown === null || !clients.length) {
      return;
    } else if (gameState.public.countdown > 0) {
      gameState.public.countdown -= 1;
      broadcastGameState(gameState, clients);
    } else {
      settleFucked(gameState, clients);
    }
  }, 1000);

export const populateBus = (gameState) => {
  const newDeck = populateDeck(1);
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  gameState.private.deck = newDeck;

  gameState.private.bus = [
    newDeck.splice(0, 1),
    newDeck.splice(0, 2),
    newDeck.splice(0, 3),
    newDeck.splice(0, 4),
    newDeck.splice(0, 3),
    newDeck.splice(0, 2),
    newDeck.splice(0, 1)
  ];
  gameState.public.bus = [
    gameState.private.bus[0],
    Array(2).fill(null),
    Array(3).fill(null),
    Array(4).fill(null),
    Array(3).fill(null),
    Array(2).fill(null),
    Array(1).fill(null)
  ];

  // FOR DEV PURPOSES
  gameState.private.bus[1][1].value = 'JOKER';

  if (gameState.private.bus[0][0].value === 'JOKER') populateBus(gameState);
};

export const handleRideTheBusChoice = (gameState, { cardPos: { row, col }, guess }) => {
  const prevCardValue = cardValueToNumericalValue(gameState.public.bus[row - 1].find((card) => card).value);
  const chosenCardValue = cardValueToNumericalValue(gameState.private.bus[row][col].value);
  gameState.public.bus[row][col] = gameState.private.bus[row][col];

  if (chosenCardValue === -1) {
    gameState.public.players.find((player) => player.id === gameState.public.currentPlayer).status =
      gameState.public.players.length > 1 ? CHOOSE : TAKE_DRINK;
  } else if (
    (guess === HIGHER && chosenCardValue > prevCardValue) ||
    (guess === LOWER && chosenCardValue < prevCardValue) ||
    (guess === SAME && chosenCardValue === prevCardValue)
  ) {
    gameState.public.players.find((player) => player.id === gameState.public.currentPlayer).status =
      row === gameState.public.bus.length - 1 ? END : CONTINUE;
  } else {
    gameState.public.players.find((player) => player.id === gameState.public.currentPlayer).status = TAKE_DRINK;
  }
};
