import { Item, RoundType } from '../../../types'
import StreamerChoiceRound from '../StreamerChoice/StreamerChoiceRound'
import ViewerChoiceRound from '../ViewerChoice/ViewerChoiceRound'
import ProtectionRound from '../Protection/ProtectionRound'
import SwapRound from '../Swap/SwapRound'
import ClosestVotesRound from '../ClosestVotes/ClosestVotesRound'
import ResurrectionRound from '../Resurrection/ResurrectionRound'
import RandomEliminationRound from '../RandomElimination/RandomEliminationRound'
import DealRound from '../DealRound/DealRound'
import DealReturn from '../DealRound/DealReturn'

type Props = {
  roundType: RoundType
  roundId: number
  activeItems: Item[]
  eliminatedItems: Item[]
  onItemElimination: (id: string) => void
  onItemProtection: (id: string) => void
  onItemSwap: (id: string) => void
  onItemResurrection: (id: string) => void
  onIteamDeal: (id: string) => void
  dealItem?: Item
  onDealReturn: (id: string) => void
  subscriberOnly: boolean
}

export default function RoundContent({
  roundType,
  roundId,
  activeItems,
  eliminatedItems,
  onItemElimination,
  onItemProtection,
  onItemSwap,
  onItemResurrection,
  onIteamDeal,
  dealItem,
  onDealReturn,
  subscriberOnly,
}: Props) {
  switch (roundType) {
    case RoundType.RandomElimination: {
      return (
        <RandomEliminationRound
          items={activeItems}
          onItemWinning={onItemElimination}
        />
      )
    }
    case RoundType.StreamerChoice: {
      return (
        <StreamerChoiceRound
          items={activeItems}
          onItemElimination={onItemElimination}
        />
      )
    }
    case RoundType.ViewerChoice: {
      return (
        <ViewerChoiceRound
          items={activeItems}
          onItemElimination={onItemElimination}
          subscriberOnly={subscriberOnly}
        />
      )
    }
    case RoundType.Protection: {
      return (
        <ProtectionRound
          items={activeItems}
          onItemProtection={onItemProtection}
        />
      )
    }
    case RoundType.Swap: {
      return <SwapRound items={activeItems} onItemSwap={onItemSwap} />
    }
    case RoundType.ClosestVotes: {
      return (
        <ClosestVotesRound
          items={activeItems}
          onItemElimination={onItemElimination}
          subscriberOnly={subscriberOnly}
        />
      )
    }
    case RoundType.Resurrection: {
      return (
        <ResurrectionRound
          activeItems={activeItems}
          eliminatedItems={eliminatedItems}
          onItemResurrection={onItemResurrection}
          subscriberOnly={subscriberOnly}
        />
      )
    }
    case RoundType.Deal: {
      return <DealRound items={activeItems} onItemSelect={onIteamDeal} />
    }
    case RoundType.DealReturn: {
      if (!dealItem) {
        return <div>Deal item not found</div>
      }
      return (
        <DealReturn
          item={dealItem}
          onItemReturn={onDealReturn}
          onItemElimination={onItemElimination}
        />
      )
    }
    default: {
      return <div>Round type {roundType} not implemented</div>
    }
  }
}
