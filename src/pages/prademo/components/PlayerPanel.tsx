import React from 'react'
import { Player } from '../types'
import './PlayerPanel.css' // We'll create this CSS file

interface PlayerPanelProps {
  players: Player[]
  onMakeTurn: (playerId: string) => void // Callback when button is clicked
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ players, onMakeTurn }) => {
  return (
    <div className="player-panel">
      <h3>Игроки</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id} className="player-item">
            <span
              className="player-color-indicator"
              style={{ backgroundColor: player.color }}
            ></span>
            <span className="player-name">
              {player.name} - очки {player.score}
            </span>
            <span className="player-position">(Клетка: {player.position})</span>
            <button
              className="turn-button"
              onClick={() => onMakeTurn(player.id)}
            >
              Make Turn
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PlayerPanel
