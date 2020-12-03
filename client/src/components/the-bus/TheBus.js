import { Grid } from 'semantic-ui-react';
import PlayingCard from '../playing-card/PlayingCard';

const TheBus = ({ bus, chooseCard, active }) => {
  console.log(bus);
  const nextRow = bus.findIndex((row) => row.find((card) => card)) + 1;

  return (
    <Grid textAlign="center">
      {bus.map((row, i) => (
        <Grid.Row columns={row.length} key={i}>
          {row.map((card, j) => (
            <div key={j} onClick={i === nextRow && active ? () => chooseCard({ row: i, col: j }) : null}>
              <PlayingCard card={card} back={!card} />
            </div>
          ))}
        </Grid.Row>
      ))}
    </Grid>
  );
};

export default TheBus;
