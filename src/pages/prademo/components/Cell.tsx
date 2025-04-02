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
    backgroundColor: theme.palette.common.black,
  },
}))

interface CellProps {
  cellNumber: number
  playersOnCell: Player[]
  owners: Player[]
}

const Cell: React.FC<CellProps> = ({ cellNumber, playersOnCell, owners }) => {
  return (
    <BootstrapTooltip
      title={
        <div style={{ backgroundColor: 'black' }}>
          <div>Клетка {cellNumber}:</div>
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
      </div>
    </BootstrapTooltip>
  )
}

export default Cell
