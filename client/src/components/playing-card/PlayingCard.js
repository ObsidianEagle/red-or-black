import Cards from '../../assets/cards';
import './PlayingCard.scss';

const PlayingCard = ({ card, back, large }) => {
  if (back) {
    return <Cards.B1 className="playing-card" />
  } else {
    const componentName = card.suit.substr(0, 1) + card.value;
    const Component = Cards[componentName];
    return <Component className={`playing-card${large ? '-large' : ''}`} />;
  }
};

export default PlayingCard;
