import { Table } from 'semantic-ui-react';
import { CHOOSE, FUCK, GIVE_DRINK, START, TAKE_DRINK } from '../../constants/statuses';

const statusText = (status, prevPlayerName) => {
  switch (status) {
    case CHOOSE:
      return 'Choosing...';
    case TAKE_DRINK:
      return 'Drinking...';
    case GIVE_DRINK:
      return 'Giving out drinks...';
    case FUCK:
      return `Fucked by ${prevPlayerName}...`;
    case START:
      return 'Waiting to start...';
    default:
      return '';
  }
};

const PlayerList = ({ thisPlayerId, players, prevPlayerName }) => (
  <Table celled unstackable>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Player</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {players.map((player) => (
        <Table.Row key={player.id}>
          <Table.Cell>
            {player.name}
            {player.id === thisPlayerId ? ' (you)' : null}
          </Table.Cell>
          <Table.Cell>{statusText(player.status, prevPlayerName)}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default PlayerList;
