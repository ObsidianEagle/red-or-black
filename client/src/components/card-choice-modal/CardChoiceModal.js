import { useState } from 'react';
import { Button, Container, Dropdown, Modal } from 'semantic-ui-react';
import { CLUBS, DIAMONDS, HEARTS, SPADES } from '../../constants/statuses';
import './CardChoiceModal.scss';

const CardChoiceModal = ({ isOpen, sendChoice }) => {
  const [rank, setRank] = useState(null);
  const [suit, setSuit] = useState(null);

  const ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
  const suits = [SPADES, DIAMONDS, CLUBS, HEARTS];

  const valuesToDropdownOption = (values) => values.map((val) => ({ key: val, text: val, value: val }));

  return (
    <Modal open={isOpen} className="card-choice-modal">
      <Modal.Header className="modal-header">Pick a card</Modal.Header>
      <Modal.Content>
        <Container textAlign="center">
          <Dropdown
            placeholder="Rank"
            selection
            options={valuesToDropdownOption(ranks)}
            value={rank}
            onChange={(_e, { value }) => setRank(value)}
            className="choice-dropdown"
          />
          <Dropdown
            placeholder="Suit"
            selection
            options={valuesToDropdownOption(suits)}
            value={suit}
            onChange={(_e, { value }) => setSuit(value)}
            className="choice-dropdown"
          />
          <div>
            <Button disabled={!rank || !suit} onClick={() => sendChoice({ suit, value: rank })}>
              Submit
            </Button>
          </div>
        </Container>
      </Modal.Content>
    </Modal>
  );
};

export default CardChoiceModal;
