import { GamePhase } from '../../domain/gameTypes';
import './PhaseIndicator.css';

type Props = {
  phase: GamePhase;
};

const PHASE_EMOJI: Record<GamePhase, string> = {
  idle: '⏯️',
  showing: '👁️',
  reproduce: '✋',
  result: '⭐',
};

export function PhaseIndicator({ phase }: Props) {
  return (
    <div className="phase-indicator">
      <div className="phase-emoji">{PHASE_EMOJI[phase]}</div>
      <div className="phase-label">{phase}</div>
    </div>
  );
}
