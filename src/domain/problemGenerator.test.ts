import { describe, expect, it } from 'vitest';
import { getDifficultyConfig } from './difficulty';
import { generateProblem } from './problemGenerator';

describe('generateProblem', () => {
  it('creates a problem with correct slot and bead counts', () => {
    const config = getDifficultyConfig('easy');
    const problem = generateProblem(config);

    expect(problem.slots).toHaveLength(config.numSlots);
    const beads = problem.slots.filter((slot) => slot.bead !== null);
    expect(beads).toHaveLength(config.numBeadsInProblem);

    const indices = new Set(beads.map((slot) => slot.index));
    expect(indices.size).toBe(beads.length);
  });
});
