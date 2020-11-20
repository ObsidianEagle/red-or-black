import { Button } from 'semantic-ui-react';
import { CONTINUE, FUCK, TAKE_DRINK } from '../../constants/statuses';

// Handles status message + button when moving to RTB
const FuckYouActionArea = ({ players, playerStatus, sendContinue, prevPlayerName }) => {
  let statusText = null;
  let showButton = false;

  if (players.filter(player => player.cardCount > 0).length === 1) {
    statusText = "You've been fucked! Get ready to ride the bus.";
  } else if (playerStatus === FUCK) {
    statusText = `You've been fucked by ${prevPlayerName}! Fuck someone else or wait for the timer to run out.`;
  } else if (playerStatus === TAKE_DRINK) {
    statusText = `You've been fucked by ${prevPlayerName}! Drink, then choose someone to fuck.`;
  } else if (playerStatus === CONTINUE) {
    statusText = `Choose someone to fuck.`;
  }

  return (
    <>
      {statusText ? <h2>{statusText}</h2> : null}
      {showButton ? <Button onClick={sendContinue}>Ride the Bus</Button> : null}
    </>
  );
};

export default FuckYouActionArea;
