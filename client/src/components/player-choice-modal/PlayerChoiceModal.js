import { Button, Container, Modal } from 'semantic-ui-react';
import './PlayerChoiceModal.scss';

const PlayerChoiceModal = ({ isOpen, thisPlayerId, players, setTarget }) => {
  const availablePlayers = players
    .filter((player) => player.cardCount > 0)
    .filter((player) => player.id !== thisPlayerId);

  return (
    <Modal open={isOpen} className="player-choice-modal">
      <Modal.Header className="modal-header">Choose a player to fuck</Modal.Header>
      <Modal.Content>
        <Container textAlign="center">
          {availablePlayers.map((player) => (
            <Button onClick={() => setTarget(player.id)} key={player.id} className="choice-button">
              {player.name}
            </Button>
          ))}
        </Container>
      </Modal.Content>
    </Modal>
  );
};

export default PlayerChoiceModal;
