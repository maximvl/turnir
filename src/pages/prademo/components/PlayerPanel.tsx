import React from 'react'
import { Player } from '../types'
import './PlayerPanel.css' // We'll create this CSS file

interface PlayerPanelProps {
  players: Player[]
  onMakeTurn: (playerId: string) => void // Callback when button is clicked
  onMakeMultipleTurns: (playerIds: string[]) => void // Callback when multiple turns are made
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  players,
  onMakeTurn,
  onMakeMultipleTurns,
}) => {
  const makeTurnWithEachPlayer = () => {
    const playerIds = players.map((player) => player.id)
    onMakeMultipleTurns(playerIds)
  }

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
              {player.name} - очки {player.gameScore}
            </span>
            <span className="player-position">
              (от владения: {player.ownerScore})
            </span>
            <button
              className="turn-button"
              onClick={() => onMakeTurn(player.id)}
            >
              Ходить
            </button>
          </li>
        ))}
      </ul>
      <div
        style={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button className="turn-button" onClick={makeTurnWithEachPlayer}>
          Сделать ход каждым
        </button>
      </div>
    </div>
  )
}

export default PlayerPanel
