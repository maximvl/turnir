// src/constants.ts (or in App.tsx)
import { Player } from './types'

export const BOARD_SIZE = 40 // Standard Monopoly size

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Praden',
    color: 'red',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p2',
    name: 'Lasqa',
    color: '#1E90FF',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p3',
    name: 'Segall',
    color: '#32CD32',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p4',
    name: 'Roadhouse',
    color: '#B8860B',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p5',
    name: 'Mad',
    color: '#BF00FF',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p6',
    name: 'xQc',
    color: 'orange',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p7',
    name: 'forsen',
    color: 'cyan',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
  {
    id: 'p8',
    name: 'uzya',
    color: 'magenta',
    position: 1,
    gameScore: 0,
    ownerScore: 0,
    cellsOwned: {},
  },
]
