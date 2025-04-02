// src/constants.ts (or in App.tsx)
import { Player } from './types'

export const BOARD_SIZE = 40 // Standard Monopoly size

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Player 1',
    color: 'red',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p2',
    name: 'Player 2',
    color: 'blue',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p3',
    name: 'Player 3',
    color: 'green',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p4',
    name: 'Player 4',
    color: 'yellow',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p5',
    name: 'Player 5',
    color: 'purple',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p6',
    name: 'Player 6',
    color: 'orange',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p7',
    name: 'Player 7',
    color: 'cyan',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
  {
    id: 'p8',
    name: 'Player 8',
    color: 'magenta',
    position: 1,
    score: 0,
    cellsOwned: {},
  },
]
