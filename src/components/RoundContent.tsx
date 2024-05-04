import RandomEliminationRound from "./RandomEliminationRound";
import { Item, RoundType } from "../types";
import StreamerChoiceRound from "./StreamerChoiceRound";
import ViewerChoiceRound from "./ViewerChoiceRound";
import Wheel from "./Wheel";

type Props = {
  roundType: RoundType;
  items: Item[];
  onItemElimination: (id: string) => void;
};

export default function RoundContent({
  roundType,
  items,
  onItemElimination,
}: Props) {
  switch (roundType) {
    case RoundType.RandomElimination: {
      return <Wheel items={items} onItemElimination={onItemElimination} />;
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
    default: {
      return <div>Round type {roundType} not implemented</div>;
    }
  }
}
