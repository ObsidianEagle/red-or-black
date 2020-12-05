import { useEffect } from 'react';
import { Button, Grid } from 'semantic-ui-react';
import CardsView from '../../components/cards-view/CardsView';
import ChoiceModal from '../../components/choice-modal/ChoiceModal';
import PlayerList from '../../components/player-list/PlayerList';
import { GAME_STATE, PLAYER_ACTION, TIMEOUT_WARNING } from '../../constants/messages';
import { CHOOSE, CONTINUE, FUCK, GIVE_DRINK, TAKE_DRINK } from '../../constants/statuses';
import './RedOrBlackPage.scss';

const RedOrBlackPage = ({ playerId, gameState, ws, setGameState, playerCards, setPlayerCards }) => {
  useEffect(() => {
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case GAME_STATE:
          setGameState(msg.payload.gameState);
          setPlayerCards(msg.payload.cards);
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
  }, [setGameState, ws, setPlayerCards]);

  useEffect(() => {
    console.debug({ gameState, cards: playerCards });
  }, [gameState, playerCards]);

  if (!gameState || !playerCards) return null;

  const { players } = gameState;

  const sendChoice = (choice) => {
    const msgObject = {
      type: PLAYER_ACTION,
      payload: {
        action: CHOOSE,
        choice
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

  const skipToRideTheBus = () => {
    const msgObject = {
      type: PLAYER_ACTION,
      payload: {
        action: FUCK
      }
    };
    const msgString = JSON.stringify(msgObject);
    ws.send(msgString);
  };

  const playerStatus = players.find((player) => player.id === playerId).status;

  return (
    <>
      <ChoiceModal
        isOpen={playerStatus === CHOOSE}
        playerCards={playerCards}
        sendChoice={sendChoice}
        skipToRideTheBus={skipToRideTheBus}
        players={players}
      />
      <Grid columns={2} stackable className="red-or-black-grid">
        <Grid.Column width={10} textAlign="center">
          <h3>Your Cards</h3>
          <CardsView cards={playerCards} />
          {playerStatus === TAKE_DRINK || playerStatus === GIVE_DRINK ? (
            <>
              <h2>{playerStatus === TAKE_DRINK ? 'Wrong! Drink.' : 'Correct! Give out some drinks.'}</h2>
              <Button onClick={sendContinue} className="continue-button">
                Finish Turn
              </Button>
            </>
          ) : null}
        </Grid.Column>
        <Grid.Column width={6}>
          <PlayerList players={players} thisPlayerId={playerId} />
        </Grid.Column>
      </Grid>
    </>
  );
};

export default RedOrBlackPage;
