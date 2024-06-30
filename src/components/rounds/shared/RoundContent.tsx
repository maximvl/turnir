import { Item, RoundType } from "../../../types";
import StreamerChoiceRound from "../StreamerChoice/StreamerChoiceRound";
import ViewerChoiceRound from "../ViewerChoice/ViewerChoiceRound";
import Wheel from "../RandomElimination/Wheel";
import ProtectionRound from "../Protection/ProtectionRound";
import SwapRound from "../Swap/SwapRound";
import ClosestVotesRound from "../ClosestVotes/ClosestVotesRound";

type Props = {
  roundType: RoundType;
  items: Item[];
  onItemElimination: (id: string) => void;
  onItemProtection: (id: string) => void;
  onItemSwap: (id: string) => void;
};

export default function RoundContent({ roundType, items, onItemElimination, onItemProtection, onItemSwap }: Props) {
  switch (roundType) {
    case RoundType.RandomElimination: {
      return <Wheel items={items} onItemWinning={onItemElimination} />;
    }
    case RoundType.StreamerChoice: {
      return <StreamerChoiceRound items={items} onItemElimination={onItemElimination} />;
    }
    case RoundType.ViewerChoice: {
      return <ViewerChoiceRound items={items} onItemElimination={onItemElimination} />;
    }
    case RoundType.Protection: {
      return <ProtectionRound items={items} onItemProtection={onItemProtection} />;
    }
    case RoundType.Swap: {
      return <SwapRound items={items} onItemSwap={onItemSwap} />;
    }
    case RoundType.ClosestVotes: {
      return <ClosestVotesRound items={items} onItemElimination={onItemElimination} />;
    }
    default: {
      return <div>Round type {roundType} not implemented</div>;
    }
  }
}
