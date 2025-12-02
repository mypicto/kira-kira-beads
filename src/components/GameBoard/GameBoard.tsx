import { Bead, GamePhase, Problem, Slot as SlotType } from '../../domain/gameTypes';
import { Slot } from '../Slot/Slot';
import './GameBoard.css';

type Props = {
  phase: GamePhase;
  problem: Problem | null;
  placement: SlotType[];
  onSlotDrop: (slotIndex: number, bead: Bead) => void;
  onSlotClear: (slotIndex: number) => void;
  disabled?: boolean;
};

export function GameBoard({ phase, problem, placement, onSlotDrop, onSlotClear, disabled = false }: Props) {
  const displaySlots = phase === 'showing' && problem ? problem.slots : placement;
  const canInteract = phase === 'reproduce' && !disabled;
  const isHardLayout = displaySlots.length > 5;
  const columns = isHardLayout ? 5 : displaySlots.length || 5;

  const title = (() => {
    if (phase === 'showing') return 'おてほんをおぼえてね';
    if (phase === 'reproduce') return 'おなじならびをつくってみよう';
    if (phase === 'result') return 'ふくしゅうのじかん';
    return 'じゅんびちゅう';
  })();

  const phaseLabel = (() => {
    if (phase === 'showing') return 'みる';
    if (phase === 'reproduce') return 'つくる';
    if (phase === 'result') return 'こたえあわせ';
    return 'まち';
  })();

  return (
    <div className="gameboard">
      <div className="gameboard-header">
        <div className="gameboard-title">{title}</div>
        <div className="gameboard-phase">{phaseLabel}</div>
      </div>
      <div className="slot-row" style={{ gridTemplateColumns: `repeat(${columns}, minmax(48px, 1fr))` }}>
        {displaySlots.map((slot) => (
          <Slot
            key={slot.index}
            slot={slot}
            disabled={!canInteract}
            showIndex
            onDrop={onSlotDrop}
            onClick={() => (canInteract ? onSlotClear(slot.index) : undefined)}
          />
        ))}
      </div>
    </div>
  );
}
