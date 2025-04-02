import React, { useState } from 'react'
import Board from './components/Board'
import PlayerPanel from './components/PlayerPanel'
import ActionLog from './components/ActionLog'
import { Player, ActionLogEntry } from './types'
import { BOARD_SIZE, INITIAL_PLAYERS } from './constants'
import './Prademo.css' // Main layout CSS
import { sample } from 'lodash'

function Prademo() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS)
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([])

  // Helper to roll a single die
  const rollDie = (): number => Math.floor(Math.random() * 6) + 1

  // Helper to add a log entry
  const logAction = (message: string) => {
    const newEntry: ActionLogEntry = {
      id: `${Date.now()}-${Math.random()}`, // Simple unique ID
      timestamp: new Date().toLocaleTimeString(),
      message: message,
    }
    // Add to the beginning of the array
    setActionLog((prevLog) => [newEntry, ...prevLog])
  }

  // Handle player turn logic
  const handleMakeTurn = (playerId: string) => {
    const playerIndex = players.findIndex((p) => p.id === playerId)
    if (playerIndex === -1) return // Should not happen

    const currentPlayer = players[playerIndex]

    // Roll 3 dice
    const dice1 = rollDie()
    const dice2 = rollDie()
    const dice3 = rollDie()
    const totalRoll = dice1 + dice2 + dice3

    // Calculate new position (1-based index, wraps around)
    const currentPosition = currentPlayer.position
    // Subtract 1 for 0-based calculation, add roll, modulo, add 1 back for 1-based
    const newPosition = ((currentPosition - 1 + totalRoll) % BOARD_SIZE) + 1

    const gameInfo = sample([
      { hours: 5, score: 10, cellScore: 1 },
      { hours: 10, score: 20, cellScore: 2 },
      { hours: 15, score: 30, cellScore: 3 },
      { hours: 20, score: 40, cellScore: 4 },
    ])

    const currentOwnedValue = currentPlayer.cellsOwned[newPosition] || 0
    currentPlayer.cellsOwned[newPosition] =
      gameInfo.cellScore + currentOwnedValue

    const cellOwners = players.filter(
      (p) => p.cellsOwned[newPosition] !== undefined && p.id !== playerId
    )
    const cellOwnersBonuses = cellOwners.map((p) => ({
      name: p.name,
      bonus: p.cellsOwned[newPosition],
    }))

    const bonusesText = cellOwnersBonuses
      .map((p) => `${p.name} (${p.bonus} очков)`)
      .join(', ')

    // Log the action
    logAction(
      `${currentPlayer.name} выкинул ${totalRoll} (${dice1}+${dice2}+${dice3}) и перешел с ${currentPosition} на ${newPosition}, прошел игру на ${gameInfo.hours} часов и получил ${gameInfo.score} очков и захватил сектор на ${gameInfo.cellScore} очков и заплатил владельцам: ${bonusesText}`
    )

    // Update player state (immutable update)
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            position: newPosition,
            score: p.score + gameInfo.score,
          }
        }
        const ownerBonus = cellOwnersBonuses.find(
          (bonus) => bonus.name === p.name
        )
        if (ownerBonus && p.id !== playerId) {
          return { ...p, score: p.score + ownerBonus.bonus }
        }
        return p
      })
    )
  }

  return (
    <div className="app-container">
      <h1>Simple Board Game</h1>
      <div className="main-layout">
        <div className="board-section">
          <Board players={players} />
          <div style={{ display: 'flex' }}>
            <PlayerPanel players={players} onMakeTurn={handleMakeTurn} />
            <div className="action-log">
              <ActionLog logEntries={actionLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prademo
