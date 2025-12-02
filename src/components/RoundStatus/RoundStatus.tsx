import './RoundStatus.css';

type Props = {
  currentRound: number;
  maxRound: number;
};

export function RoundStatus({ currentRound, maxRound }: Props) {
  return (
    <div className="round-status">
      <span className="round-pill">ラウンド {currentRound}</span>
      <span className="round-divider">/</span>
      <span className="round-total">{maxRound}</span>
    </div>
  );
}
