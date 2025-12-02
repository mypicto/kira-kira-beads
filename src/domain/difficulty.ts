import { Color, Difficulty, Shape, Size } from './gameTypes';

export type DifficultyConfig = {
  numSlots: number;
  numBeadsInProblem: number;
  showDurationMs: number;
  colors: Color[];
  shapes: Shape[];
  sizes: Size[];
};

const easyConfig: DifficultyConfig = {
  numSlots: 5,
  numBeadsInProblem: 3,
  showDurationMs: 700,
  colors: ['red', 'yellow', 'sky'],
  shapes: ['circle'],
  sizes: ['small'],
};

const normalConfig: DifficultyConfig = {
  numSlots: 5,
  numBeadsInProblem: 5,
  showDurationMs: 500,
  colors: ['red', 'orange', 'yellow', 'sky', 'blue'],
  shapes: ['circle', 'rounded-rect', 'diamond'],
  sizes: ['small', 'large'],
};

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return difficulty === 'easy' ? easyConfig : normalConfig;
}
