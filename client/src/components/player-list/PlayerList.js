import { Table } from 'semantic-ui-react';
import { CHOOSE, GIVE_DRINK, TAKE_DRINK } from '../../constants/statuses';

const statusText = (status) => {
  switch (status) {
    case CHOOSE:
      return 'Choosing...';
    case TAKE_DRINK:
      return 'Drinking...';
    case GIVE_DRINK:
      return 'Giving out drinks...';
    default:
      return '';
  }
};

const PlayerList = ({ thisPlayerId, players }) => (
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
          <Table.Cell>{statusText(player.status)}</Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

export default PlayerList;
