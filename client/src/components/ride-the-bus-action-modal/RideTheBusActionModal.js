import { Button, Container, Modal } from 'semantic-ui-react';
import { END } from '../../constants/statuses';
import './RideTheBusActionModal.scss';

const RideTheBusActionModal = ({ isOpen, takeDrink, status }) => {
  return (
    <Modal open={isOpen} className="ride-the-bus-action-modal">
      <Modal.Content>
        <Container textAlign="center">
          {status === END ? (
            <h2>Congratulations! Now Leave.</h2>
          ) : (
            <Button onClick={takeDrink} className="action-button">
              Drink
            </Button>
          )}
        </Container>
      </Modal.Content>
    </Modal>
  );
};

export default RideTheBusActionModal;
