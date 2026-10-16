import { PROXIMITY_THRESHOLD } from './layoutTypes'
import type { EquipmentItem } from './layoutTypes'

export type ProximityConflict = {
  aId: string
  aName: string
  bId: string
  bName: string
  distance: number
}

/**
 * Flags any two items whose centers are closer than 0.6 m.
 *
 * Distance is the floor (XZ) Euclidean length between footprint centers:
 *   d = sqrt((x1 - x2)^2 + (z1 - z2)^2)
 * Height (Y) is ignored because this is a 2D layout spacing rule.
 */
export function findProximityConflicts(
  items: EquipmentItem[],
): ProximityConflict[] {
  const conflicts: ProximityConflict[] = []

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i]
      const b = items[j]
      const distance = Math.hypot(
        a.position.x - b.position.x,
        a.position.z - b.position.z,
      )
      if (distance < PROXIMITY_THRESHOLD) {
        conflicts.push({
          aId: a.id,
          aName: a.name,
          bId: b.id,
          bName: b.name,
          distance,
        })
      }
    }
  }

  return conflicts
}

export function conflictingIds(conflicts: ProximityConflict[]): Set<string> {
  const ids = new Set<string>()
  for (const conflict of conflicts) {
    ids.add(conflict.aId)
    ids.add(conflict.bId)
  }
  return ids
}
