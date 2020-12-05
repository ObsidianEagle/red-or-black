import { Button, Container, Modal } from 'semantic-ui-react';
import {
  BLACK,
  CLUBS,
  DIAMONDS,
  HEARTS,
  HIGHER,
  INBETWEEN,
  LOWER,
  OUTSIDE,
  RED,
  SAME,
  SPADES
} from '../../constants/statuses';
import CardChoiceModal from '../card-choice-modal/CardChoiceModal';
import './ChoiceModal.scss';

const ChoiceModal = ({ isOpen, playerCards, sendChoice, skipToRideTheBus, players }) => {
  let headerText = '';
  let choices = [];

  switch (playerCards?.length) {
    case 0:
      headerText = 'Red or black?';
      choices = [RED, BLACK];
      break;
    case 1:
      headerText = 'Higher or lower?';
      choices = [HIGHER, LOWER, SAME];
      break;
    case 2:
      headerText = 'Outside or inbetween?';
      choices = [OUTSIDE, INBETWEEN];
      break;
    case 3:
      headerText = 'Pick a suit';
      choices = [SPADES, DIAMONDS, CLUBS, HEARTS];
      break;
    case 4:
      headerText = 'Pick a card';
      return <CardChoiceModal isOpen={isOpen} sendChoice={sendChoice} />;
    default:
      break;
  }

  return (
    <Modal open={isOpen} className="choice-modal">
      <Modal.Header className="modal-header">{headerText}</Modal.Header>
      <Modal.Content>
        <Container textAlign="center">
          {choices.map((choice) => (
            <Button onClick={() => sendChoice(choice)} key={choice} className="choice-button">
              {choice}
            </Button>
          ))}
          {players.length < 2 ? (
            <>
              <br />
              <Button onClick={skipToRideTheBus}>Ride The Bus</Button>
            </>
          ) : null}
        </Container>
      </Modal.Content>
    </Modal>
  );
};

export default ChoiceModal;
