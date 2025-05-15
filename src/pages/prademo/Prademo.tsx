import React, { useState } from 'react'
import Board from './components/Board'
import PlayerPanel from './components/PlayerPanel'
import ActionLog from './components/ActionLog'
import { Player, ActionLogEntry } from './types'
import { BOARD_SIZE, INITIAL_PLAYERS } from './constants'
import './Prademo.css' // Main layout CSS
import { sample } from 'lodash'
import { Box, Button } from '@mui/material'
import SettingsButton, { DefaultSettings } from './components/SettingsButton'
import useLocalStorage from '@/common/hooks/useLocalStorage'

function Prademo() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS)
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([])

  const { value: loadedSettings } = useLocalStorage({
    key: 'prademo-settings',
    defaultValue: DefaultSettings,
  })
  const settings = {
    ...DefaultSettings,
    ...loadedSettings,
  }

  // Helper to roll a single die
  const rollDie = (): number => Math.floor(Math.random() * 6) + 1

  // Helper to add a log entry
  const logAction = (messages: string[]) => {
    const newEntries: ActionLogEntry[] = messages.map((message) => ({
      id: `${Date.now()}-${Math.random()}`, // Simple unique ID
      timestamp: new Date().toLocaleTimeString(),
      message: message,
    }))
    // Add to the beginning of the array
    setActionLog((prevLog) => [...newEntries, ...prevLog])
  }

  const makeTurnUpdate = (players: Player[], currentPlayerId: string) => {
    const player = players.find((p) => p.id === currentPlayerId)
    if (!player) return // Should not happen

    // create array of dicesToRoll size
    const diceRolls = Array.from({ length: settings.dicesToRoll }, () =>
      rollDie()
    )
    const totalRoll = diceRolls.reduce((acc, die) => acc + die, 0)

    // Calculate new position (1-based index, wraps around)
    const currentPosition = player.position
    // Subtract 1 for 0-based calculation, add roll, modulo, add 1 back for 1-based
    const newPosition = ((currentPosition - 1 + totalRoll) % BOARD_SIZE) + 1

    // score is based on settings percentage
    const gameInfo = sample([
      {
        hours: 5,
        score: settings.scoreBelow5h,
        cellScore: (settings.ownershipIncome * settings.scoreBelow5h) / 100,
      },
      {
        hours: 10,
        score: settings.scoreBelow10h,
        cellScore: (settings.ownershipIncome * settings.scoreBelow10h) / 100,
      },
      {
        hours: 15,
        score: settings.scoreBelow15h,
        cellScore: (settings.ownershipIncome * settings.scoreBelow15h) / 100,
      },
      {
        hours: 20,
        score: settings.scoreBelow20h,
        cellScore: (settings.ownershipIncome * settings.scoreBelow20h) / 100,
      },
      {
        hours: 25,
        score: settings.scoreAbove20h,
        cellScore: (settings.ownershipIncome * settings.scoreAbove20h) / 100,
      },
    ])

    const cellOwners = players.filter(
      (p) => p.cellsOwned[newPosition] !== undefined && p.id !== player.id
    )
    const cellOwnersBonuses = cellOwners.map((p) => ({
      name: p.name,
      bonus: p.cellsOwned[newPosition],
    }))

    const bonusesText = cellOwnersBonuses
      .map((p) => `${p.name} (${p.bonus} очков)`)
      .join(', ')

    const bonusesLine =
      cellOwnersBonuses.length > 0
        ? ` и заплатил владельцам: ${bonusesText}`
        : ''

    const rollText = diceRolls.map((die) => die.toString()).join('+')

    // Log the action
    const log = `${player.name} выкинул ${totalRoll} (${rollText}) и перешел с ${currentPosition} на ${newPosition}, прошел игру на ${gameInfo.hours} часов и получил ${gameInfo.score} очков и захватил сектор на ${gameInfo.cellScore} очков${bonusesLine}`

    const currentOwnedValue = player.cellsOwned[newPosition] || 0

    const updatedPlayers = players.map((p) => {
      if (p.id === player.id) {
        p.cellsOwned[newPosition] = currentOwnedValue + gameInfo.cellScore
        return {
          ...p,
          position: newPosition,
          gameScore: p.gameScore + gameInfo.score,
        }
      }
      const ownerBonus = cellOwnersBonuses.find(
        (bonus) => bonus.name === p.name
      )
      if (ownerBonus && p.id !== player.id) {
        return { ...p, ownerScore: p.ownerScore + ownerBonus.bonus }
      }
      return p
    })

    return {
      updatedPlayers,
      log,
    }
  }

  // Handle player turn logic
  const handleMakeTurn = (playerId: string) => {
    const update = makeTurnUpdate(players, playerId)
    if (!update) return
    const { updatedPlayers, log } = update

    // Log the action
    logAction([log])
    // Update player state (immutable update)
    setPlayers(updatedPlayers)
  }

  const handleMakeMultipleTurns = (playerIds: string[]) => {
    const updates = playerIds.reduce(
      (acc: { updatedPlayers: Player[]; log: string[] }, id) => {
        const update = makeTurnUpdate(acc.updatedPlayers, id)
        if (!update) return acc
        const { updatedPlayers, log } = update
        return {
          updatedPlayers,
          log: [log, ...acc.log],
        }
      },
      { updatedPlayers: players, log: [] }
    )

    // Log the action
    logAction(updates.log)
    // Update player state (immutable update)
    setPlayers(updates.updatedPlayers)
  }

  return (
    <div className="app-container">
      <h1 style={{ color: 'white' }}>Simple Praden Game</h1>
      <Box display="flex" justifyContent="center">
        <SettingsButton />
      </Box>
      <div className="main-layout">
        <div className="board-section">
          <Board players={players} />
          <div style={{ display: 'flex', gap: '20px' }}>
            <PlayerPanel
              players={players}
              onMakeTurn={handleMakeTurn}
              onMakeMultipleTurns={handleMakeMultipleTurns}
            />
            <div>
              <ActionLog logEntries={actionLog} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prademo
