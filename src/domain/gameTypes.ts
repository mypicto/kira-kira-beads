export type Color = 'red' | 'orange' | 'yellow' | 'sky' | 'blue';
export type Shape = 'circle' | 'rounded-rect' | 'diamond';
export type Size = 'small' | 'large';

export type BeadId = string;

export type Bead = {
  id: BeadId;
  color: Color;
  shape: Shape;
  size: Size;
};

export type SlotIndex = number;

export type Slot = {
  index: SlotIndex;
  bead: Bead | null;
};

export type ProblemId = string;

export type Problem = {
  id: ProblemId;
  slots: Slot[];
};

export type Difficulty = 'easy' | 'normal' | 'hard';

export type ResultRank = 'perfect' | 'good' | 'ok' | 'try';

export type GamePhase = 'idle' | 'showing' | 'reproduce' | 'result';

export type RoundNumber = 1 | 2 | 3;

export const MAX_ROUNDS = 3 as const;
