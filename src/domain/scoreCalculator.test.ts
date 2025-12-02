import { describe, expect, it } from 'vitest';
import { Difficulty, Problem, Slot } from './gameTypes';
import { calcScore } from './scoreCalculator';

const bead = (id: string, overrides: Partial<Slot['bead']> = {}): Slot['bead'] => ({
  id,
  color: 'red',
  shape: 'circle',
  size: 'small',
  ...overrides,
});

describe('calcScore', () => {
  it('returns perfect score for identical placement', () => {
    const problem: Problem = {
      id: 'p1',
      slots: [
        { index: 0, bead: bead('a') },
        { index: 1, bead: null },
        { index: 2, bead: null },
        { index: 3, bead: bead('b', { color: 'blue', size: 'large' }) },
        { index: 4, bead: null },
      ],
    };

    const placement: Slot[] = problem.slots.map((slot) => ({
      index: slot.index,
      bead: slot.bead ? { ...slot.bead } : null,
    }));

    const result = calcScore(problem, placement);
    expect(result.score).toBe(100);
    expect(result.rank).toBe('perfect');
    expect(result.positionScores.every((v) => v === 1)).toBe(true);
    expect(result.attributeScores.every((v) => v === 1)).toBe(true);
  });

  it('scores partial matches according to spec (easy)', () => {
    const problem: Problem = {
      id: 'p2',
      slots: [
        { index: 0, bead: bead('a') },
        { index: 1, bead: bead('b', { color: 'yellow' }) },
        { index: 2, bead: null },
        { index: 3, bead: null },
        { index: 4, bead: null },
      ],
    };

    const placement: Slot[] = [
      { index: 0, bead: bead('a-1', { color: 'blue' }) }, // position match, partial attribute
      { index: 1, bead: null }, // missing bead
      { index: 2, bead: null },
      { index: 3, bead: null },
      { index: 4, bead: null },
    ];

    const result = calcScore(problem, placement, 'easy');

    expect(result.score).toBe(68);
    expect(result.rank).toBe('ok');
    expect(result.positionScores[0]).toBe(0);
    expect(result.positionScores[1]).toBe(0);
    expect(result.attributeScores[0]).toBeCloseTo(2 / 3);
    expect(result.attributeScores[1]).toBe(0);
  });

  it('applies diversity penalty in normal when using single bead type', () => {
    const problem: Problem = {
      id: 'p3',
      slots: [
        { index: 0, bead: bead('r1', { color: 'red' }) },
        { index: 1, bead: bead('r2', { color: 'orange' }) },
        { index: 2, bead: bead('r3', { color: 'yellow' }) },
        { index: 3, bead: bead('r4', { color: 'sky' }) },
        { index: 4, bead: bead('r5', { color: 'blue' }) },
      ],
    };

    const sameBead = bead('u1', { color: 'red' });
    const placement: Slot[] = [
      { index: 0, bead: sameBead }, // only here it fully matches
      { index: 1, bead: sameBead },
      { index: 2, bead: sameBead },
      { index: 3, bead: sameBead },
      { index: 4, bead: sameBead },
    ];

    const result = calcScore(problem, placement, 'normal');

    expect(result.positionScores).toEqual([1, 0, 0, 0, 0]);
    expect(result.score).toBeLessThan(50);
    expect(result.rank === 'ok' || result.rank === 'try').toBe(true);
  });
});
