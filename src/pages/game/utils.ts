import { Player } from './type'

type Params = {
  id: string
  name: string
  team: Player['team']
  position: number
}

export function makePlayer({ id, name, team, position }: Params): Player {
  return {
    id,
    name,
    team,
    position,
    status: 'alive',
  }
}
