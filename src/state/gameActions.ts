import { Difficulty, GamePhase, Problem, Slot } from '../domain/gameTypes';
import { ScoreResult } from '../domain/scoreCalculator';

export type GameAction =
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty; slots: Slot[] }
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_PROBLEM'; problem: Problem }
  | { type: 'RESET_PLACEMENT'; slots: Slot[] }
  | { type: 'UPDATE_SLOT'; slotIndex: number; bead: Slot['bead'] }
  | { type: 'SET_SCORE'; scoreResult: ScoreResult }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'RESET_ROUNDS'; slots: Slot[] }
  | { type: 'SET_TOTAL_SUMMARY_VISIBLE'; visible: boolean }
  | { type: 'RESET_ALL'; slots: Slot[] };
