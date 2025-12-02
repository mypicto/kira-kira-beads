import './RoundSummary.css';

type Props = {
  roundScores: number[];
  totalScore: number;
  onRestart: () => void;
};

export function RoundSummary({ roundScores, totalScore, onRestart }: Props) {
  return (
    <div className="round-summary-backdrop">
      <div className="round-summary-card">
        <div className="round-summary-title">3ラウンドの ポイント</div>
        <div className="round-summary-total">{totalScore}</div>
        <div className="round-summary-list">
          {roundScores.map((score, idx) => (
            <div key={idx} className="round-summary-row">
              <span>ラウンド {idx + 1}</span>
              <span className="round-summary-score">{score}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={onRestart}>
          もういっかい あそぶ
        </button>
      </div>
    </div>
  );
}
