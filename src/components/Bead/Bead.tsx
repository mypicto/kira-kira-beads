import { DragEvent } from 'react';
import { Bead as BeadType } from '../../domain/gameTypes';
import './Bead.css';

type Props = {
  bead: BeadType;
  draggable?: boolean;
  onDragStart?: (bead: BeadType, event: DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function Bead({ bead, draggable = false, onDragStart, onClick, selected, disabled = false }: Props) {
  const className = [
    'bead',
    `bead-color-${bead.color}`,
    `bead-shape-${bead.shape}`,
    `bead-size-${bead.size}`,
    selected ? 'bead-selected' : '',
    disabled ? 'bead-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      draggable={!disabled && draggable}
      onDragStart={(event) => {
        if (disabled) return;
        onDragStart?.(bead, event);
      }}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
      aria-label={`${bead.color} ${bead.shape} ${bead.size}`}
      role="img"
    >
      <span className="bead-glare" />
    </div>
  );
}
