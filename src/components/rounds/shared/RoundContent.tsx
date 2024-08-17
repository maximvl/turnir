import { Item, RoundType } from "../../../types";
import StreamerChoiceRound from "../StreamerChoice/StreamerChoiceRound";
import ViewerChoiceRound from "../ViewerChoice/ViewerChoiceRound";
import ProtectionRound from "../Protection/ProtectionRound";
import SwapRound from "../Swap/SwapRound";
import ClosestVotesRound from "../ClosestVotes/ClosestVotesRound";
import ResurrectionRound from "../Resurrection/ResurrectionRound";
import RandomEliminationRound from "../RandomElimination/RandomEliminationRound";

type Props = {
  roundType: RoundType;
  activeItems: Item[];
  eliminatedItems: Item[];
  onItemElimination: (id: string) => void;
  onItemProtection: (id: string) => void;
  onItemSwap: (id: string) => void;
  onItemResurrection: (id: string) => void;
};

export default function RoundContent({
  roundType,
  activeItems,
  eliminatedItems,
  onItemElimination,
  onItemProtection,
  onItemSwap,
  onItemResurrection,
}: Props) {
  switch (roundType) {
    case RoundType.RandomElimination: {
      return <RandomEliminationRound items={activeItems} onItemWinning={onItemElimination} />;
    }
    case RoundType.StreamerChoice: {
      return <StreamerChoiceRound items={activeItems} onItemElimination={onItemElimination} />;
    }
    case RoundType.ViewerChoice: {
      return <ViewerChoiceRound items={activeItems} onItemElimination={onItemElimination} />;
    }
    case RoundType.Protection: {
      return <ProtectionRound items={activeItems} onItemProtection={onItemProtection} />;
    }
    case RoundType.Swap: {
      return <SwapRound items={activeItems} onItemSwap={onItemSwap} />;
    }
    case RoundType.ClosestVotes: {
      return <ClosestVotesRound items={activeItems} onItemElimination={onItemElimination} />;
    }
    case RoundType.Resurrection: {
      return (
        <ResurrectionRound
          activeItems={activeItems}
          eliminatedItems={eliminatedItems}
          onItemResurrection={onItemResurrection}
        />
      );
    }
    default: {
      return <div>Round type {roundType} not implemented</div>;
    }
  }
}
