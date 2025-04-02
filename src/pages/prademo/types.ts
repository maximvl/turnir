// src/types.ts
export interface Player {
  id: string
  name: string
  color: string
  position: number // Cell number (1-based)
  score: number
  cellsOwned: { [cellNumber: number]: number }
}

export interface ActionLogEntry {
  id: string // Use timestamp + random for uniqueness
  timestamp: string
  message: string
}
