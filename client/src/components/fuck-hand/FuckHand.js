import { Button, Container } from 'semantic-ui-react';
import PlayingCard from '../playing-card/PlayingCard';
import './FuckHand.scss';

const FuckHand = ({ cards, fuckCards, setFuckCard, openChoice }) => {
  const isPlayable = (card) => openChoice || fuckCards.find((fc) => fc.value === card.value) !== undefined;

  return (
    <Container textAlign="center" className="fuck-hand">
      <div className="fuck-hand-cards">
        {cards.map((card) => (
          <Button
            className="fuck-hand-card"
            disabled={!isPlayable(card)}
            onClick={() => setFuckCard(card)}
            key={card.suit + card.value}
          >
            <div>
              <PlayingCard card={card} />
            </div>
          </Button>
        ))}
      </div>
    </Container>
  );
};

export default FuckHand;
