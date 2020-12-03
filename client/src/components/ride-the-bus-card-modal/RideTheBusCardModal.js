import { Button, Container, Modal } from 'semantic-ui-react';
import { HIGHER, LOWER, SAME } from '../../constants/statuses';
import './RideTheBusCardModal.scss';

const RideTheBusCardModal = ({ isOpen, setGuess }) => {
  const choices = [HIGHER, LOWER, SAME];

  return (
    <Modal open={isOpen} className="ride-the-bus-card-modal">
      <Modal.Header className="modal-header">Higher or Lower?</Modal.Header>
      <Modal.Content>
        <Container textAlign="center">
          {choices.map((choice) => (
            <Button onClick={() => setGuess(choice)} key={choice} className="choice-button">
              {choice}
            </Button>
          ))}
        </Container>
      </Modal.Content>
    </Modal>
  );
};

export default RideTheBusCardModal;
