import { Container } from 'semantic-ui-react';
import PlayingCard from '../playing-card/PlayingCard';
import './CardsView.scss';

const CardsView = ({ cards }) => (
  <Container textAlign="center" className="cards-view">
    <div className="cards-view-cards">
      {cards.map((card) => (
        <div className="cards-view-card" key={card.suit + card.value}>
          <PlayingCard card={card} large />
        </div>
      ))}
    </div>
  </Container>
);

export default CardsView;
