import { Container } from 'semantic-ui-react';
import PlayingCard from '../playing-card/PlayingCard';
import './PlayerHand.scss';

const PlayerHand = ({ cards }) => (
  <Container textAlign="center" className="player-hand">
    <h3>Your Cards</h3>
    <div className="player-hand-cards">
    {cards.map((card) => (
      <div className="player-hand-card" key={card.suit + card.value}>
        <PlayingCard card={card} large />
      </div>
    ))}
    </div>
  </Container>
);

export default PlayerHand;
