import { Grid } from 'semantic-ui-react';
import { CONTINUE } from '../../constants/statuses';
import PlayingCard from '../playing-card/PlayingCard';
import './TheBus.scss';

const TheBus = ({ bus, chooseCard, active, status }) => {
  const nextRow = bus.findIndex((row) => !row.find((card) => card));

  return (
    <Grid textAlign="center" className="the-bus">
      {bus.map((row, i) => (
        <Grid.Row columns={row.length} key={i}>
          {row.map((card, j) => (
            <div className="bus-card" key={j} onClick={i === nextRow && active && status === CONTINUE ? () => chooseCard({ row: i, col: j }) : null}>
              <PlayingCard card={card} back={!card} />
            </div>
          ))}
        </Grid.Row>
      ))}
    </Grid>
  );
};

export default TheBus;
