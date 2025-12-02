import { DragEvent } from 'react';
import { Bead as BeadType, Color } from '../../domain/gameTypes';
import { Bead } from '../Bead/Bead';
import './BeadStock.css';

type Props = {
  beads: BeadType[];
  colorOrder: Color[];
  onBeadDragStart: (bead: BeadType, event: DragEvent<HTMLDivElement>) => void;
  onSelect: (bead: BeadType) => void;
  selectedBeadId?: string | null;
  disabled?: boolean;
};

export function BeadStock({ beads, colorOrder, onBeadDragStart, onSelect, selectedBeadId, disabled = false }: Props) {
  const beadsByColor = colorOrder.map((color) => beads.filter((b) => b.color === color));

  return (
    <div className="beadstock">
      <div className="beadstock-header">
        <div className="beadstock-title">ビーズをえらんでね</div>
        <div className="beadstock-hint">ドラッグでも タップでも うごかせるよ</div>
      </div>
      <div className="beadstock-grid">
        {beadsByColor.map((rowBeads, rowIdx) => {
          const cells = [...rowBeads].slice(0, 6);
          while (cells.length < 6) {
            cells.push(null as unknown as BeadType);
          }
          return (
            <div className="beadstock-row" key={colorOrder[rowIdx]}>
              {cells.map((bead, idx) =>
                bead ? (
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
                ) : (
                  <div key={`placeholder-${rowIdx}-${idx}`} className="beadstock-placeholder" />
                ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
