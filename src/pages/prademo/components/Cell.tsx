import React from 'react'
import { Player } from '../types'
import './Cell.css' // We'll create this CSS file next
import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material'

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: '20px',
    backgroundColor: theme.palette.common.black,
  },
}))

interface CellProps {
  cellNumber: number
  playersOnCell: Player[]
  owners: Player[]
}

const Cell: React.FC<CellProps> = ({ cellNumber, playersOnCell, owners }) => {
  const getTooltipPlacement = () => {
    // 2-9 bottom, 10-21 left, 22-29 top, 30-40 left, 1 - right
    if (cellNumber >= 2 && cellNumber <= 9) {
      return 'bottom'
    }
    if (cellNumber >= 10 && cellNumber <= 21) {
      return 'left'
    }
    if (cellNumber >= 22 && cellNumber <= 29) {
      return 'top'
    }
    if (cellNumber >= 30 && cellNumber <= 40) {
      return 'right'
    }
    if (cellNumber === 1) {
      return 'right'
    }
  }

  return (
    <BootstrapTooltip
      placement={getTooltipPlacement()}
      title={
        <div style={{ backgroundColor: 'black' }}>
          <div>Владельцы {cellNumber}:</div>
          {owners.map((owner) => (
            <div key={owner.id} style={{ color: owner.color }}>
              {owner.name}: {owner.cellsOwned[cellNumber]}
            </div>
          ))}
        </div>
      }
    >
      <div className="cell">
        <span className="cell-number">{cellNumber}</span>
        <div className="player-dots">
          {playersOnCell.map((player, index) => (
            <div
              key={player.id}
              className="player-dot"
              style={{
                backgroundColor: player.color,
                // Simple offset to avoid perfect overlap
                transform: `translate(${index * 5}px, ${index * -3}px)`,
              }}
              title={player.name} // Tooltip for player name
            ></div>
          ))}
        </div>
        <div className="bar-container">
          {owners.map((owner) => (
            <div
              key={owner.id}
              className="bar"
              style={{
                backgroundColor: owner.color,
              }}
            />
          ))}
        </div>
      </div>
    </BootstrapTooltip>
  )
}

export default Cell
