import { Problem, ResultRank, Slot as SlotType } from '../../domain/gameTypes';
import { Slot } from '../Slot/Slot';
import './ResultView.css';

type Props = {
  problem: Problem;
  placement: SlotType[];
  score: number;
  rank: ResultRank;
  positionScores: number[];
  attributeScores: number[];
  currentRound: number;
  maxRound: number;
  onNext: () => void;
};

type BorderColor = 'green' | 'yellow' | 'red';

function borderForSlots(problemSlot: SlotType, userSlot?: SlotType): BorderColor {
  const targetBead = problemSlot.bead;
  const userBead = userSlot?.bead ?? null;

  if (!targetBead && !userBead) return 'green';
  if (!targetBead || !userBead) return 'red';

  const colorMatch = targetBead.color === userBead.color;
  const shapeMatch = targetBead.shape === userBead.shape;
  const sizeMatch = targetBead.size === userBead.size;

  if (colorMatch && shapeMatch && sizeMatch) return 'green';
  if (colorMatch || shapeMatch || sizeMatch) return 'yellow';
  return 'red';
}

function rankLabel(rank: ResultRank) {
  switch (rank) {
    case 'perfect':
      return 'パーフェクト';
    case 'good':
      return 'いいね';
    case 'ok':
      return 'もうすこし';
    default:
      return 'またちょうせん';
  }
}

export function ResultView({
  problem,
  placement,
  score,
  rank,
  positionScores,
  attributeScores,
  currentRound,
  maxRound,
  onNext,
}: Props) {
  const positionAvg = positionScores.length
    ? positionScores.reduce((sum, v) => sum + v, 0) / positionScores.length
    : 0;
  const attributeAvg = attributeScores.length
    ? attributeScores.reduce((sum, v) => sum + v, 0) / attributeScores.length
    : 0;

  return (
    <div className="result-view">
      <div className="result-top">
        <div className="result-column">
          <div className="result-label">おてほん</div>
          <div
            className="result-slot-row"
            style={{ gridTemplateColumns: `repeat(${Math.min(problem.slots.length, 5)}, minmax(46px, 1fr))` }}
          >
            {problem.slots.map((slot) => (
              <Slot key={slot.index} slot={slot} borderColor="green" disabled showIndex />
            ))}
          </div>
        </div>
        <div className="result-column">
          <div className="result-label">あなたのこたえ</div>
          <div
            className="result-slot-row"
            style={{ gridTemplateColumns: `repeat(${Math.min(problem.slots.length, 5)}, minmax(46px, 1fr))` }}
          >
            {problem.slots.map((slot) => {
              const userSlot = placement.find((s) => s.index === slot.index);
              const borderColor = borderForSlots(slot, userSlot);
              return (
                <Slot
                  key={slot.index}
                  slot={userSlot ?? { index: slot.index, bead: null }}
                  borderColor={borderColor}
                  disabled
                  showIndex
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="result-score-card">
        <div className="score-main">
          <div className="score-number">{score}</div>
          <div className="score-rank">{rankLabel(rank)}</div>
        </div>
        <div className="score-bars">
          <div className="score-bar">
            <span>ばしょ</span>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${Math.round(positionAvg * 100)}%` }} />
            </div>
          </div>
          <div className="score-bar">
            <span>みため</span>
            <div className="bar">
              <div className="bar-fill bar-fill-alt" style={{ width: `${Math.round(attributeAvg * 100)}%` }} />
            </div>
          </div>
          <div className="score-meta">ラウンド {currentRound} / {maxRound}</div>
        </div>
      </div>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onNext}>
          ▷ つぎへ
        </button>
      </div>
    </div>
  );
}
