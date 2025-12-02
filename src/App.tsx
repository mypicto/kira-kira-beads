import { DragEvent, useEffect, useMemo, useReducer, useRef, useState, ChangeEvent } from 'react';
import { Bead, Difficulty, MAX_ROUNDS } from './domain/gameTypes';
import { DifficultyConfig, getDifficultyConfig } from './domain/difficulty';
import { generateProblem } from './domain/problemGenerator';
import { calcScore } from './domain/scoreCalculator';
import { createEmptySlots } from './domain/slots';
import { Controls } from './components/Controls/Controls';
import { GameBoard } from './components/GameBoard/GameBoard';
import { BeadStock } from './components/BeadStock/BeadStock';
import { RoundStatus } from './components/RoundStatus/RoundStatus';
import { ResultView } from './components/ResultView/ResultView';
import { RoundSummary } from './components/RoundSummary/RoundSummary';
import { createInitialState, gameReducer } from './state/gameReducer';
import './styles/global.css';

function buildStock(config: DifficultyConfig): Bead[] {
  const beads: Bead[] = [];
  config.colors.forEach((color) => {
    config.shapes.forEach((shape) => {
      config.sizes.forEach((size) => {
        beads.push({
          id: `${color}-${shape}-${size}`,
          color,
          shape,
          size,
        });
      });
    });
  });
  return beads;
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createInitialState('normal'));
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const timerRef = useRef<number | null>(null);

  const config = useMemo(() => getDifficultyConfig(state.difficulty), [state.difficulty]);
  const beadStock = useMemo(() => buildStock(config), [config]);
  const hasAnyBead = useMemo(() => state.currentPlacement.some((slot) => Boolean(slot.bead)), [state.currentPlacement]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startProblem = () => {
    if (state.showTotalSummary) return;
    if (state.phase !== 'idle') return;

    const emptySlots = createEmptySlots(config.numSlots);
    const problem = generateProblem(config);

    clearTimer();
    dispatch({ type: 'RESET_PLACEMENT', slots: emptySlots });
    dispatch({ type: 'SET_PROBLEM', problem });
    dispatch({ type: 'SET_PHASE', phase: 'showing' });
    setSelectedBead(null);

    timerRef.current = window.setTimeout(() => {
      dispatch({ type: 'SET_PHASE', phase: 'reproduce' });
    }, config.showDurationMs);
  };

  const handleSlotDrop = (slotIndex: number, bead: Bead) => {
    if (state.phase !== 'reproduce') return;
    dispatch({ type: 'UPDATE_SLOT', slotIndex, bead });
  };

  const handleSlotClick = (slotIndex: number) => {
    if (state.phase !== 'reproduce') return;
    if (selectedBead) {
      dispatch({ type: 'UPDATE_SLOT', slotIndex, bead: selectedBead });
    } else {
      dispatch({ type: 'UPDATE_SLOT', slotIndex, bead: null });
    }
  };

  const resetPlacement = (force = false) => {
    if (!force) {
      if (state.showTotalSummary) return;
      if (state.phase !== 'idle' && state.phase !== 'reproduce') return;
    }

    const emptySlots = createEmptySlots(config.numSlots);
    dispatch({ type: 'RESET_PLACEMENT', slots: emptySlots });
    setSelectedBead(null);
  };

  const finishAndScore = () => {
    if (state.phase !== 'reproduce') return;
    if (!state.currentProblem) return;

    clearTimer();
    const scoreResult = calcScore(state.currentProblem, state.currentPlacement, state.difficulty);
    dispatch({ type: 'SET_SCORE', scoreResult });
    dispatch({ type: 'SET_PHASE', phase: 'result' });
    setSelectedBead(null);
  };

  const handleNext = () => {
    if (state.currentRound >= MAX_ROUNDS) {
      dispatch({ type: 'SET_TOTAL_SUMMARY_VISIBLE', visible: true });
      dispatch({ type: 'SET_PHASE', phase: 'idle' });
      resetPlacement(true);
      return;
    }

    dispatch({ type: 'ADVANCE_ROUND' });
    resetPlacement(true);
    dispatch({ type: 'SET_PHASE', phase: 'idle' });

    // 次のラウンドを自動で開始
    startProblem();
  };

  const handleSelectDifficulty = (event: ChangeEvent<HTMLSelectElement>) => {
    if (state.showTotalSummary) return;
    if (state.phase !== 'idle') return;
    const next = event.target.value as Difficulty;
    const emptySlots = createEmptySlots(getDifficultyConfig(next).numSlots);
    clearTimer();
    dispatch({ type: 'SET_DIFFICULTY', difficulty: next, slots: emptySlots });
    setSelectedBead(null);
  };

  const handleRestart = () => {
    clearTimer();
    const emptySlots = createEmptySlots(config.numSlots);
    dispatch({ type: 'RESET_ROUNDS', slots: emptySlots });
    setSelectedBead(null);
  };

  const handleBeadDragStart = (bead: Bead, event: DragEvent<HTMLDivElement>) => {
    if (state.phase !== 'reproduce') return;
    event.dataTransfer?.setData('application/json', JSON.stringify(bead));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <h1>きらきら・ビーズ・コピー</h1>
        </div>
        <div className="header-right">
          <RoundStatus currentRound={state.currentRound} maxRound={MAX_ROUNDS} />
          <select
            className="difficulty-select"
            value={state.difficulty}
            onChange={handleSelectDifficulty}
            disabled={state.showTotalSummary || state.phase !== 'idle'}
          >
            <option value="easy">かんたん</option>
            <option value="normal">ふつう</option>
            <option value="hard">むずかしい</option>
          </select>
        </div>
      </header>

      <div className="layout-grid">
        <div className="board-area">
          <GameBoard
            phase={state.phase}
            problem={state.currentProblem}
            placement={state.currentPlacement}
            onSlotDrop={handleSlotDrop}
            onSlotClear={handleSlotClick}
            disabled={state.phase !== 'reproduce'}
          />

          {state.phase === 'result' && state.currentProblem && state.score !== null && state.rank && (
            <ResultView
              problem={state.currentProblem}
              placement={state.currentPlacement}
              score={state.score}
              rank={state.rank}
              positionScores={state.positionScores}
              attributeScores={state.attributeScores}
              currentRound={state.currentRound}
              maxRound={MAX_ROUNDS}
              onNext={handleNext}
            />
          )}
        </div>

        <div className="board-area">
          <Controls
            phase={state.phase}
            onStart={startProblem}
            onOk={finishAndScore}
            onReset={resetPlacement}
            disableStart={state.phase !== 'idle' || state.showTotalSummary}
            disableOk={!hasAnyBead || state.phase !== 'reproduce'}
            disableReset={state.showTotalSummary || (state.phase !== 'idle' && state.phase !== 'reproduce')}
          />
          <BeadStock
            beads={beadStock}
            colorOrder={config.colors}
            onBeadDragStart={handleBeadDragStart}
            onSelect={(bead) => setSelectedBead(bead)}
            selectedBeadId={selectedBead?.id ?? null}
            disabled={state.phase !== 'reproduce'}
          />
        </div>
      </div>

      {state.showTotalSummary && (
        <RoundSummary roundScores={state.roundScores} totalScore={state.totalScore} onRestart={handleRestart} />
      )}
    </div>
  );
}
