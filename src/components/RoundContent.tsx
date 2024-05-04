import RandomEliminationRound from "./RandomEliminationRound";
import { Item, RoundType } from "../types";
import StreamerChoiceRound from "./StreamerChoiceRound";
import ViewerChoiceRound from "./ViewerChoiceRound";
import Wheel from "./Wheel";
import ProtectionRound from "./ProtectionRound";

type Props = {
  roundType: RoundType;
  items: Item[];
  onItemElimination: (id: string) => void;
  onItemProtection: (id: string) => void;
};

export default function RoundContent({
  roundType,
  items,
  onItemElimination,
  onItemProtection,
}: Props) {
  switch (roundType) {
    case RoundType.RandomElimination: {
      return <Wheel items={items} onItemWinning={onItemElimination} />;
    }
    case RoundType.StreamerChoice: {
      return (
        <StreamerChoiceRound
          items={items}
          onItemElimination={onItemElimination}
        />
      );
    }
    case RoundType.ViewerChoice: {
      return (
        <ViewerChoiceRound
          items={items}
          onItemElimination={onItemElimination}
        />
      );
    }
    case RoundType.Protection: {
      return (
        <ProtectionRound items={items} onItemProtection={onItemProtection} />
      );
    }
    default: {
      return <div>Round type {roundType} not implemented</div>;
    }
  }
}
