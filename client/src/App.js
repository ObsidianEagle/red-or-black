import { useState } from 'react';
import './App.scss';
import { FUCK_YOU, RED_OR_BLACK, RIDE_THE_BUS } from './constants/statuses';
import LandingPage from './pages/landing-page/LandingPage';
import RedOrBlackPage from './pages/red-or-black-page/RedOrBlackPage';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [ws, setWs] = useState(null);

  const displayGameView = () => {
    const gameViewParams = { playerId, gameState, ws, setGameState };
    switch (gameState.game) {
      case RED_OR_BLACK:
        return <RedOrBlackPage {...gameViewParams} />
      case FUCK_YOU:
        // TODO
        return null;
      case RIDE_THE_BUS:
        // TODO
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {playerId && gameState ? (
        displayGameView()
      ) : (
        <LandingPage setPlayerId={setPlayerId} setGameState={setGameState} setWs={setWs} />
      )}
      <div className="main-footer">
        <p>
          Created by Alex King. View the source on <a href="https://github.com/ObsidianEagle/red-or-black">GitHub</a>.
        </p>
      </div>
    </div>
  );
};

export default App;
