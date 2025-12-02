import { Slot } from './gameTypes';

export function createEmptySlots(numSlots: number): Slot[] {
  return Array.from({ length: numSlots }, (_, index) => ({
    index,
    bead: null,
  }));
}
