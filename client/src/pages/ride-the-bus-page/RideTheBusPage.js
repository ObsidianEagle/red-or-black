import { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import PlayerChoiceModal from '../../components/player-choice-modal/PlayerChoiceModal';
import RideTheBusActionModal from '../../components/ride-the-bus-action-modal/RideTheBusActionModal';
import RideTheBusCardModal from '../../components/ride-the-bus-card-modal/RideTheBusCardModal';
import TheBus from '../../components/the-bus/TheBus';
import { GAME_STATE, PLAYER_ACTION, TIMEOUT_WARNING } from '../../constants/messages';
import { CHOOSE, CONTINUE, END, TAKE_DRINK } from '../../constants/statuses';

const RideTheBusPage = ({ playerId, gameState, ws, setGameState }) => {
  const [showPlayerChoiceModal, setShowPlayerChoiceModal] = useState(false);
  const [showRideTheBusModal, setShowRideTheBusModal] = useState(false);
  const [showRideTheBusActionModal, setShowRideTheBusActionModal] = useState(false);
  const [guess, setGuess] = useState(null);
  const [cardPos, setCardPos] = useState(null);

  useEffect(() => {
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case GAME_STATE:
          setGameState(msg.payload.gameState);
          break;
        case TIMEOUT_WARNING:
          // TODO
          break;
        default:
          console.log(msg);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Game connection closed by server');
      setTimeout(window.location.reload.bind(window.location), 2000);
    };
  }, [setGameState, ws]);

  useEffect(() => {
    console.debug({ gameState });
  }, [gameState]);

  useEffect(() => {
    const sendChoice = (cardPos, guess) => {
      const msgObject = {
        type: PLAYER_ACTION,
        payload: {
          action: CHOOSE,
          choice: {
            cardPos,
            guess
          }
        }
      };
      const msgString = JSON.stringify(msgObject);
      ws.send(msgString);
    };

    if (cardPos && guess) {
      sendChoice(cardPos, guess);
      setCardPos(null);
      setGuess(null);
    }
  }, [cardPos, guess, ws]);

  useEffect(() => {
    setShowRideTheBusModal(cardPos && !guess);
  }, [guess, cardPos, setShowPlayerChoiceModal]);

  useEffect(() => {
    const playerStatus = gameState.players.find((player) => player.id === playerId).status;
    setShowRideTheBusActionModal(playerStatus === TAKE_DRINK | playerStatus === END);
  }, [gameState, setShowRideTheBusActionModal, playerId]);

  useEffect(() => {
    setShowPlayerChoiceModal(gameState.players.find((player) => player.id === playerId).status === CHOOSE);
  }, [gameState, setShowPlayerChoiceModal, playerId]);

  const sendPlayerChoice = (target) => {
    const msgObject = {
      type: PLAYER_ACTION,
      payload: {
        action: CHOOSE,
        choice: {
          target
        }
      }
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
  };

  const sendContinue = () => {
    const msgObject = {
      type: PLAYER_ACTION,
      payload: {
        action: CONTINUE
      }
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
  };

  if (!gameState) return null;

  const { bus, currentPlayer, players } = gameState;
  const playerStatus = players.find((player) => player.id === playerId).status;

  return (
    <>
      <PlayerChoiceModal
        isOpen={showPlayerChoiceModal}
        thisPlayerId={playerId}
        players={players}
        setTarget={sendPlayerChoice}
        rideTheBus
      />
      <RideTheBusActionModal isOpen={showRideTheBusActionModal} status={playerStatus} takeDrink={sendContinue} />
      <RideTheBusCardModal isOpen={showRideTheBusModal} setGuess={setGuess} />
      <Container textAlign="center" className="ride-the-bus-page">
        <h2>
          <b>{players.find((player) => player.id === currentPlayer).name}</b> is currently riding the bus
        </h2>
        <TheBus bus={bus} chooseCard={setCardPos} active={currentPlayer === playerId} status={playerStatus} />
      </Container>
    </>
  );
};

export default RideTheBusPage;
