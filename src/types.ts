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
}

export const RoundTypes = [
  RoundType.RandomElimination,
  RoundType.StreamerChoice,
  RoundType.ViewerChoice,
];

export const RoundTypeNames = {
  [RoundType.RandomElimination]: "Случайное устранение",
  [RoundType.StreamerChoice]: "Выбор стримера",
  [RoundType.ViewerChoice]: "Выбор зрителей",
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
