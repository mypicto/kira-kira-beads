import { Bead, Problem } from './gameTypes';
import { DifficultyConfig } from './difficulty';
import { createEmptySlots } from './slots';

const randomId = () => Math.random().toString(36).slice(2, 10);

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateProblem(config: DifficultyConfig): Problem {
  if (config.numBeadsInProblem > config.numSlots) {
    throw new Error('numBeadsInProblem must be less than or equal to numSlots');
  }

  const slots = createEmptySlots(config.numSlots);
  const usedIndices = new Set<number>();

  while (usedIndices.size < config.numBeadsInProblem) {
    const index = Math.floor(Math.random() * config.numSlots);
    if (usedIndices.has(index)) continue;

    const bead: Bead = {
      id: randomId(),
      color: randomPick(config.colors),
      shape: randomPick(config.shapes),
      size: randomPick(config.sizes),
    };

    slots[index] = { index, bead };
    usedIndices.add(index);
  }

  return {
    id: randomId(),
    slots,
  };
}
