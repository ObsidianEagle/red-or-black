import { useEffect, useState } from 'react';
import { Grid } from 'semantic-ui-react';
import CardsView from '../../components/cards-view/CardsView';
import FuckHand from '../../components/fuck-hand/FuckHand';
import FuckYouActionArea from '../../components/fuck-you-action-area/FuckYouActionArea';
import PlayerChoiceModal from '../../components/player-choice-modal/PlayerChoiceModal';
import PlayerList from '../../components/player-list/PlayerList';
import { GAME_STATE, PLAYER_ACTION, TIMEOUT_WARNING } from '../../constants/messages';
import { CHOOSE, CONTINUE, FUCK_YOU, START, TAKE_DRINK } from '../../constants/statuses';
import './FuckYouPage.scss';

const FuckYouPage = ({ playerId, gameState, ws, setGameState, playerCards, setPlayerCards }) => {
  const [fuckCard, setFuckCard] = useState(null);
  const [fuckTarget, setFuckTarget] = useState(null);

  useEffect(() => {
    ws.onmessage = (e) => {
      if (gameState.game !== FUCK_YOU) return;
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case GAME_STATE:
          setGameState(msg.payload.gameState);
          setPlayerCards(msg.payload.cards);
          // TESTING
          console.debug({ gameState, cards: playerCards });
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
  }, [setGameState, ws, gameState, playerCards, setPlayerCards]);

  useEffect(() => {
    console.debug({ gameState, cards: playerCards });
  }, [gameState, playerCards]);

  useEffect(() => {
    const sendFuck = (card, target) => {
      const msgObject = {
        type: PLAYER_ACTION,
        payload: {
          action: CHOOSE,
          choice: {
            card,
            target
          }
        }
      };
      const msgString = JSON.stringify(msgObject);
      ws.send(msgString);
    };

    if (fuckCard && fuckTarget) {
      sendFuck(fuckCard, fuckTarget);
      setFuckCard(null);
      setFuckTarget(null);
    }
  }, [fuckCard, fuckTarget, ws]);

  if (!gameState || !playerCards) return null;

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

  const { players, fuckCards, prevPlayer, countdown } = gameState;
  const playerStatus = players.find((player) => player.id === playerId).status;

  const findPlayerName = (id) => players.find((player) => player.id === id).name;

  if (gameState.game !== FUCK_YOU) return null;

  return (
    <>
      <PlayerChoiceModal
        isOpen={fuckCard !== null}
        thisPlayerId={playerId}
        players={players}
        setTarget={setFuckTarget}
      />
      <Grid columns={2} stackable className="red-or-black-grid">
        <Grid.Column width={10} textAlign="center">
          <CardsView cards={fuckCards} />
          <FuckYouActionArea
            players={players}
            playerStatus={playerStatus}
            sendContinue={sendContinue}
            prevPlayerName={prevPlayer ? findPlayerName(prevPlayer) : undefined}
          />
          <FuckHand
            cards={playerCards}
            fuckCards={fuckCards}
            setFuckCard={setFuckCard}
            openChoice={playerStatus === TAKE_DRINK || playerStatus === START}
            handDisabled={players.filter((player) => player.cardCount > 0).length === 1}
          />
        </Grid.Column>
        <Grid.Column width={6}>
          {countdown ? <h1>Timer: {countdown}</h1> : null}
          <PlayerList
            players={players}
            thisPlayerId={playerId}
            prevPlayerName={prevPlayer ? findPlayerName(prevPlayer) : undefined}
          />
        </Grid.Column>
      </Grid>
    </>
  );
};

export default FuckYouPage;
