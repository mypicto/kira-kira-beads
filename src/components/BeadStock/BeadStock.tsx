import { DragEvent } from 'react';
import { Bead as BeadType } from '../../domain/gameTypes';
import { Bead } from '../Bead/Bead';
import './BeadStock.css';

type Props = {
  beads: BeadType[];
  onBeadDragStart: (bead: BeadType, event: DragEvent<HTMLDivElement>) => void;
  onSelect: (bead: BeadType) => void;
  selectedBeadId?: string | null;
  disabled?: boolean;
};

export function BeadStock({ beads, onBeadDragStart, onSelect, selectedBeadId, disabled = false }: Props) {
  return (
    <div className="beadstock">
      <div className="beadstock-header">
        <div className="beadstock-title">ビーズをえらんでね</div>
        <div className="beadstock-hint">ドラッグでも タップでも うごかせるよ</div>
      </div>
      <div className="beadstock-grid">
        {beads.map((bead) => (
          <Bead
            key={bead.id}
            bead={bead}
            draggable={!disabled}
            selected={selectedBeadId === bead.id}
            disabled={disabled}
            onDragStart={(draggedBead, event) => {
              if (disabled) return;
              onBeadDragStart(draggedBead, event);
            }}
            onClick={() => {
              if (disabled) return;
              onSelect(bead);
            }}
          />
        ))}
      </div>
    </div>
  );
}
