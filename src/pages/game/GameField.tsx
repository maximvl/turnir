import { Player } from './type'

type Props = {
  players: Player[]
}

export default function GameField({ players }: Props) {
  // returns a table 9x20 with players
  return (
    <table>
      <tbody>
        {Array.from({ length: 10 }).map((_, i) => (
          <tr key={i}>
            {Array.from({ length: 13 }).map((_, j) => {
              const cellId = i * 13 + j
              const isMiddleColumn = j === 6
              const cellPlayers = players.filter(
                (player) => player.position === cellId
              )
              const cellPlayersItems = cellPlayers.map((player) => (
                <div key={player.id}>{player.name}</div>
              ))
              return (
                <td
                  key={j}
                  style={{
                    border: '1px solid white',
                    minWidth: '100px',
                    minHeight: '50px',
                  }}
                >
                  {!isMiddleColumn && <div>#{cellId}</div>}
                  <span style={{ color: cellPlayers[0]?.team || 'white' }}>
                    {cellPlayersItems}
                  </span>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
