import { useState } from 'react';
import './App.scss';
import { FUCK_YOU, RED_OR_BLACK, RIDE_THE_BUS } from './constants/statuses';
import FuckYouPage from './pages/fuck-you-page/FuckYouPage';
import LandingPage from './pages/landing-page/LandingPage';
import RedOrBlackPage from './pages/red-or-black-page/RedOrBlackPage';
import RideTheBusPage from './pages/ride-the-bus-page/RideTheBusPage';

const App = () => {
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerCards, setPlayerCards] = useState(null);
  const [ws, setWs] = useState(null);

  const displayGameView = () => {
    const gameViewParams = { playerId, gameState, ws, setGameState, playerCards, setPlayerCards };
    switch (gameState.game) {
      case RED_OR_BLACK:
        return <RedOrBlackPage {...gameViewParams} />;
      case FUCK_YOU:
        return <FuckYouPage {...gameViewParams} />;
      case RIDE_THE_BUS:
        return <RideTheBusPage {...gameViewParams} />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
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
