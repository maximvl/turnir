import { RoundType, RoundTypeNames } from "../types";

type Props = {
  roundNumber: number;
  roundType: RoundType;
  itemsLeft: number;
};

export default function RoundTitle({
  roundNumber,
  roundType,
  itemsLeft,
}: Props) {
  const title = itemsLeft === 2 ? "Финал" : `Раунд ${roundNumber}`;
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>
        {title}: {RoundTypeNames[roundType]}
      </h3>
    </div>
  );
}
