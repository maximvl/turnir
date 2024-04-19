import RandomEliminationRound from "./RandomEliminationRound";
import { Item, RoundType } from "../types";
import StreamerChoiceRound from "./StreamerChoiceRound";
import ViewerChoiceRound from "./ViewerChoiceRound";

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
      return (
        <RandomEliminationRound
          items={items}
          onItemElimination={onItemElimination}
        />
      );
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
