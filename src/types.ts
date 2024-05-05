export type Item = {
  title: string;
  status: ItemStatus;
  eliminationRound?: number;
  eliminationType?: RoundType;
  id: string;
};

export enum ItemStatus {
  Active,
  Eliminated,
  Protected,
}

export enum TurnirState {
  EditCandidates,
  Start,
  RoundSelection,
  RoundStart,
  RoundEnd,
  Victory,
}

export enum RoundType {
  RandomElimination = "RandomElimination",
  StreamerChoice = "StreamerChoice",
  ViewerChoice = "ViewerChoice",
  Protection = "Protection",
  StreamerVsRandom = "StreamerVsRandom",
}

export const ClassicRoundTypes = [
  RoundType.RandomElimination,
  RoundType.StreamerChoice,
  RoundType.ViewerChoice,
];

export const NewRoundTypes = [
  RoundType.Protection,
  // RoundType.StreamerVsRandom
];

export const RoundTypes = ClassicRoundTypes.concat(NewRoundTypes);

export const RoundTypeNames = {
  [RoundType.RandomElimination]: "Случайное устранение",
  [RoundType.StreamerChoice]: "Выбор стримера",
  [RoundType.ViewerChoice]: "Выбор зрителей",
  [RoundType.Protection]: "Защита кандидата",
  [RoundType.StreamerVsRandom]: "Стример против рандома",
};

export const RoundTypeTooltip: { [key: string]: string } = {
  [RoundType.Protection]:
    "Случайный кандидат получает защиту от вылета на 1 раз",
  [RoundType.StreamerVsRandom]: "Стример выбирает кто вылетит не видя варианты",
};

export const enum MusicType {
  Wheel = "Wheel",
  Victory = "Victory",
  Thinking = "Thinking",
  RickRoll = "RickRoll",
}

export const MusicTypeIds = {
  [MusicType.Wheel]: "wheel-music",
  [MusicType.Victory]: "victory-music",
  [MusicType.Thinking]: "thinking-music",
  [MusicType.RickRoll]: "rickroll-music",
};
