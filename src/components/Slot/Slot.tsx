import { DragEvent } from 'react';
import { Bead as BeadType, Slot as SlotType } from '../../domain/gameTypes';
import { Bead } from '../Bead/Bead';
import './Slot.css';

type BorderColor = 'default' | 'green' | 'yellow' | 'red';

type Props = {
  slot: SlotType;
  onDrop?: (slotIndex: number, bead: BeadType) => void;
  onClick?: (slotIndex: number) => void;
  borderColor?: BorderColor;
  disabled?: boolean;
  showIndex?: boolean;
};

export function Slot({ slot, onDrop, onClick, borderColor = 'default', disabled = false, showIndex = false }: Props) {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    try {
      const bead = JSON.parse(data) as BeadType;
      onDrop?.(slot.index, bead);
    } catch {
      // noop on malformed data
    }
  };

  return (
    <div
      className={`slot ${disabled ? 'slot-disabled' : ''} slot-border-${borderColor}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      onClick={() => {
        if (disabled) return;
        onClick?.(slot.index);
      }}
      role="button"
      aria-label={`slot-${slot.index}`}
      tabIndex={0}
    >
      {showIndex && <div className="slot-index">{slot.index + 1}</div>}
      {slot.bead ? <Bead bead={slot.bead} /> : <div className="slot-placeholder" />}
    </div>
  );
}
