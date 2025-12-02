import { getDifficultyConfig } from '../domain/difficulty';
import { Difficulty, GamePhase, MAX_ROUNDS, Problem, ResultRank, Slot } from '../domain/gameTypes';
import { createEmptySlots } from '../domain/slots';
import { ScoreResult } from '../domain/scoreCalculator';
import { GameAction } from './gameActions';

export type GameState = {
  phase: GamePhase;
  difficulty: Difficulty;
  currentProblem: Problem | null;
  currentPlacement: Slot[];
  score: number | null;
  rank: ResultRank | null;
  positionScores: number[];
  attributeScores: number[];
  currentRound: number;
  roundScores: number[];
  totalScore: number;
  showTotalSummary: boolean;
};

export function createInitialState(difficulty: Difficulty = 'normal'): GameState {
  const config = getDifficultyConfig(difficulty);
  return {
    phase: 'idle',
    difficulty,
    currentProblem: null,
    currentPlacement: createEmptySlots(config.numSlots),
    score: null,
    rank: null,
    positionScores: [],
    attributeScores: [],
    currentRound: 1,
    roundScores: [],
    totalScore: 0,
    showTotalSummary: false,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_DIFFICULTY': {
      const base = createInitialState(action.difficulty);
      return {
        ...base,
        currentPlacement: action.slots,
      };
    }
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'SET_PROBLEM':
      return { ...state, currentProblem: action.problem };
    case 'RESET_PLACEMENT':
      return { ...state, currentPlacement: action.slots };
    case 'UPDATE_SLOT': {
      const nextPlacement = state.currentPlacement.map((slot) =>
        slot.index === action.slotIndex ? { ...slot, bead: action.bead } : slot,
      );
      return { ...state, currentPlacement: nextPlacement };
    }
    case 'SET_SCORE': {
      const roundIndex = state.currentRound - 1;
      const nextRoundScores = [...state.roundScores];
      nextRoundScores[roundIndex] = action.scoreResult.score;
      const nextTotalScore = nextRoundScores.reduce((sum, val) => sum + val, 0);

      return {
        ...state,
        score: action.scoreResult.score,
        rank: action.scoreResult.rank,
        positionScores: action.scoreResult.positionScores,
        attributeScores: action.scoreResult.attributeScores,
        roundScores: nextRoundScores,
        totalScore: nextTotalScore,
      };
    }
    case 'ADVANCE_ROUND': {
      const nextRound = Math.min(state.currentRound + 1, MAX_ROUNDS);
      return {
        ...state,
        currentRound: nextRound,
      };
    }
    case 'RESET_ROUNDS': {
      return {
        ...state,
        currentRound: 1,
        roundScores: [],
        totalScore: 0,
        score: null,
        rank: null,
        positionScores: [],
        attributeScores: [],
        showTotalSummary: false,
        currentPlacement: action.slots,
        currentProblem: null,
        phase: 'idle',
      };
    }
    case 'SET_TOTAL_SUMMARY_VISIBLE':
      return { ...state, showTotalSummary: action.visible };
    case 'RESET_ALL': {
      const base = createInitialState(state.difficulty);
      return {
        ...base,
        currentPlacement: action.slots,
      };
    }
    default:
      return state;
  }
}
