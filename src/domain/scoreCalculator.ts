import { Difficulty, Problem, ResultRank, Slot } from './gameTypes';

export type ScoreResult = {
  score: number;
  rank: ResultRank;
  positionScores: number[];
  attributeScores: number[];
};

function toRank(score: number): ResultRank {
  if (score >= 90) return 'perfect';
  if (score >= 70) return 'good';
  if (score >= 40) return 'ok';
  return 'try';
}

function normalizePlacement(problem: Problem, placement: Slot[]): Slot[] {
  if (placement.length === problem.slots.length) return placement;
  const fallback = Array.from({ length: problem.slots.length }, (_, index) => placement[index] ?? { index, bead: null });
  return fallback;
}

function getWeights(difficulty: Difficulty) {
  if (difficulty === 'normal') {
    return { wPos: 0.25, wAttr: 0.75 };
  }
  return { wPos: 0.4, wAttr: 0.6 };
}

function diversityFactor(problem: Problem, placement: Slot[], attrScoreAvg: number, difficulty: Difficulty): number {
  if (difficulty !== 'normal') return 1;

  const problemKinds = new Set<string>();
  const answerKinds = new Set<string>();

  problem.slots.forEach((slot) => {
    if (slot.bead) problemKinds.add(`${slot.bead.color}-${slot.bead.shape}-${slot.bead.size}`);
  });
  placement.forEach((slot) => {
    if (slot.bead) answerKinds.add(`${slot.bead.color}-${slot.bead.shape}-${slot.bead.size}`);
  });

  const coverage = problemKinds.size === 0 ? 1 : Math.min(1, answerKinds.size / problemKinds.size);
  const factor = 0.6 + 0.4 * coverage * attrScoreAvg;
  return Math.max(0.6, Math.min(1, factor));
}

export function calcScore(problem: Problem, placement: Slot[], difficulty: Difficulty = 'easy'): ScoreResult {
  const normalizedPlacement = normalizePlacement(problem, placement);
  const numSlots = problem.slots.length;

  const positionScores: number[] = problem.slots.map((slot, index) => {
    const userSlot = normalizedPlacement[index];
    const hasBead = slot.bead !== null;
    const userBead = userSlot?.bead;

    if (!hasBead && !userBead) return 1;
    if (hasBead && userBead) {
      const colorMatch = slot.bead!.color === userBead.color;
      const shapeMatch = slot.bead!.shape === userBead.shape;
      const sizeMatch = slot.bead!.size === userBead.size;
      return colorMatch && shapeMatch && sizeMatch ? 1 : 0;
    }
    return 0;
  });

  const attributeScores: number[] = problem.slots.map((slot, index) => {
    const userSlot = normalizedPlacement[index];
    if (!slot.bead && !userSlot?.bead) return 1;
    if (!slot.bead || !userSlot?.bead) return 0;

    const colorMatch = slot.bead.color === userSlot.bead.color ? 1 : 0;
    const shapeMatch = slot.bead.shape === userSlot.bead.shape ? 1 : 0;
    const sizeMatch = slot.bead.size === userSlot.bead.size ? 1 : 0;

    return (colorMatch + shapeMatch + sizeMatch) / 3;
  });

  const posScore = positionScores.reduce((sum: number, val) => sum + val, 0) / numSlots;
  const attrScore = attributeScores.reduce((sum: number, val) => sum + val, 0) / numSlots;
  const { wPos, wAttr } = getWeights(difficulty);
  const factor = diversityFactor(problem, normalizedPlacement, attrScore, difficulty);

  const totalScore = Math.round(100 * factor * (wPos * posScore + wAttr * attrScore));
  const rank = toRank(totalScore);

  return {
    score: totalScore,
    rank,
    positionScores,
    attributeScores,
  };
}
