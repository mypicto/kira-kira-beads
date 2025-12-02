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

const hardConfig: DifficultyConfig = {
  numSlots: 15,
  numBeadsInProblem: 15,
  showDurationMs: 500,
  colors: normalConfig.colors,
  shapes: normalConfig.shapes,
  sizes: normalConfig.sizes,
};

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  if (difficulty === 'easy') return easyConfig;
  if (difficulty === 'hard') return hardConfig;
  return normalConfig;
}
