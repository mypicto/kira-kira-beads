import { GamePhase } from '../../domain/gameTypes';
import './Controls.css';

type Props = {
  phase: GamePhase;
  onStart: () => void;
  onOk: () => void;
  onReset: () => void;
  disableStart?: boolean;
  disableOk?: boolean;
  disableReset?: boolean;
};

export function Controls({
  phase,
  onStart,
  onOk,
  onReset,
  disableStart = false,
  disableOk = false,
  disableReset = false,
}: Props) {
  return (
    <div className="controls">
      <button className="btn btn-ghost" onClick={onReset} disabled={disableReset}>
        ↺ リセット
      </button>
      <div className="controls-center">
        <button className="btn btn-primary" onClick={onStart} disabled={disableStart}>
          ▶︎ スタート
        </button>
        <button className="btn btn-accent" onClick={onOk} disabled={disableOk || phase !== 'reproduce'}>
          ✓ こたえる
        </button>
      </div>
    </div>
  );
}
