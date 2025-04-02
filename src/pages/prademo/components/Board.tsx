import React from 'react'
import Cell from './Cell'
import { Player } from '../types'
import { BOARD_SIZE } from '../constants' // Use BOARD_SIZE
import './Board.css' // We'll create this CSS file
import { Tooltip } from '@mui/material'

interface BoardProps {
  players: Player[]
}

const Board: React.FC<BoardProps> = ({ players }) => {
  // Helper function to get players on a specific cell
  const getPlayersOnCell = (cellNumber: number): Player[] => {
    return players.filter((p) => p.position === cellNumber)
  }

  const getCellOwners = (cellNumber: number): Player[] => {
    return players.filter((p) => p.cellsOwned[cellNumber] !== undefined)
  }

  // --- Generate Cells for Each Side ---
  // Let's assume a standard 11x11 grid structure conceptually (40 unique cells)
  // Side length (excluding corners counted multiple times)
  const sideLength = BOARD_SIZE / 4 // = 10 for BOARD_SIZE=40
  const cellsPerSide = sideLength // = 10 including corner

  const renderCell = (cellNumber: number) => (
    <Cell
      key={cellNumber}
      cellNumber={cellNumber}
      playersOnCell={getPlayersOnCell(cellNumber)}
      owners={getCellOwners(cellNumber)}
    />
  )

  // Bottom Row (Cells 10 to 1, visually right to left)
  const bottomRow = []
  for (let i = cellsPerSide; i >= 1; i--) {
    bottomRow.push(renderCell(i))
  }

  // Left Column (Cells 11 to 20, visually bottom to top)
  const leftCol: React.ReactNode[] = []
  for (let i = cellsPerSide + 1; i < cellsPerSide * 2 + 1; i++) {
    leftCol.push(renderCell(i))
  }

  // Top Row (Cells 21 to 31, visually left to right)
  const topRow: React.ReactNode[] = []
  for (let i = cellsPerSide * 2 + 1; i < cellsPerSide * 3 + 1; i++) {
    topRow.push(renderCell(i))
  }
  // Right Column (Cells 32 to 40, visually top to bottom)
  const rightCol: React.ReactNode[] = []
  for (let i = cellsPerSide * 3 + 1; i <= BOARD_SIZE; i++) {
    rightCol.push(renderCell(i))
  }

  return (
    <div className="board-container">
      <div className="board-layout">
        {/* Top Row */}
        <div className="board-row top-row">{topRow}</div>

        {/* Middle Section (Left Col, Center Space, Right Col) */}
        <div className="board-middle">
          <div className="board-col left-col">{leftCol}</div>
          <div className="board-center-space">
            {/* Optional: Game Title or Image */}
            <h2>Mini Board Game</h2>
          </div>
          <div className="board-col right-col">{rightCol}</div>
        </div>

        {/* Bottom Row */}
        <div className="board-row bottom-row">{bottomRow}</div>
      </div>
    </div>
  )
}

export default Board
