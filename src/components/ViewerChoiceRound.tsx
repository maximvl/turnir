import { Item } from "../types";

type Props = {
  items: Item[];
  onItemElimination: (index: number) => void;
};

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  return (
    <div>
      <h1>ViewerChoiceRound</h1>
    </div>
  );
}
