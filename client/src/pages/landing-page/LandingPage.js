import { useState } from 'react';
import { Button, Container, Header, Input } from 'semantic-ui-react';
import StatusMessage from '../../components/status-message/StatusMessage';
import { PLAYER_INIT, PLAYER_INIT_ACK, SERVER_ERROR } from '../../constants/messages';
import './LandingPage.scss';

const PROTOCOL = process.env.REACT_APP_USE_WSS === 'true' ? 'wss' : 'ws';

const LandingPage = ({ setPlayerId, setGameState, setWs }) => {
  let initialHost = '';
  if (window.location.search.length) {
    const queryParams = window.location.search
      .substring(1)
      .split('&')
      .map((s) => s.split('='));
    const hostParam = queryParams.find((pair) => pair[0] === 'host');
    if (hostParam) initialHost = hostParam[1];
  }

  const [name, setName] = useState('');
  const [host, setHost] = useState(initialHost);
  const [errorMessage, setErrorMessage] = useState('');
  const [connecting, setConnecting] = useState(false);

  const enterGame = (host, name) => {
    setConnecting(true);
    const ws = new WebSocket(`${PROTOCOL}://${host}`);
    setWs(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: PLAYER_INIT, payload: { name: name.trim() } }));
      window.setInterval(() => ws.send(JSON.stringify({ type: 'PING' })), 60000);
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case PLAYER_INIT_ACK:
          setGameState(msg.payload.gameState);
          setPlayerId(msg.payload.id);
          break;
        case SERVER_ERROR:
          setErrorMessage(msg.payload.errorMessage);
          ws.close();
          break;
        default:
          console.log(msg);
          break;
      }
      setConnecting(false);
    };

    ws.onerror = (e) => setErrorMessage(`WebSocket error: ${JSON.stringify(e)}`);

    ws.onclose = (e) => setErrorMessage(`Connection closed: code ${e.code}${e.reason ? ` - reason ${e.reason}` : ''}`);
  };

  return (
    <Container textAlign="center" className="landing-page">
      <Header className="main-header">Red <span style={{ color: '#77281A' }}>or</span> <span style={{ color: 'black' }}>Black</span></Header>
      <Input
        label="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-element form-input"
        maxLength={12}
      />
      <Input
        label="Host Address"
        value={host}
        onChange={(e) => setHost(e.target.value)}
        className="form-element form-input"
      />
      <Button
        disabled={!name || !host || connecting}
        onClick={() => enterGame(host, name)}
        className="form-element enter-game-button"
      >
        Enter Game
      </Button>
      {errorMessage.length > 0 && <StatusMessage message={errorMessage} />}
    </Container>
  );
};

export default LandingPage;
