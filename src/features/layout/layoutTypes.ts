/*
  Coordinate convention (meters)
  ------------------------------
  - The floor is the XZ plane. Y is up (height).
  - Origin (0, 0, 0) is the center of the room.
  - Room size is 20 m (X) by 12 m (Z), so X is in [-10, 10] and Z is in [-6, 6].
  - An item's position is the center of its footprint, snapped to 0.5 m.
  - rotationY is yaw in degrees: 0, 90, 180, or 270.
  - width/depth describe the footprint at rotation 0. After a 90°/270° turn,
    those two axes swap for clamping and drawing.
*/

export const EQUIPMENT_TYPES = ['cabinet', 'machine', 'workbench'] as const
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number]

export type Vec2 = {
  x: number
  z: number
}

export type RotationY = 0 | 90 | 180 | 270

export type EquipmentItem = {
  id: string
  type: EquipmentType
  name: string
  position: Vec2
  rotationY: RotationY
  width: number
  depth: number
  height: number
}

export type LayoutSnapshot = {
  items: EquipmentItem[]
  selectedId: string | null
}

/**
 * History is a stack of layout snapshots.
 * `present` is the live layout. `past` / `future` power Undo / Redo.
 * Selection is stored with the snapshot so Undo restores both items and selection.
 */
export type HistoryState = {
  past: LayoutSnapshot[]
  present: LayoutSnapshot
  future: LayoutSnapshot[]
}

export const ROOM_WIDTH = 20
export const ROOM_DEPTH = 12
export const GRID_SIZE = 0.5
export const PROXIMITY_THRESHOLD = 0.6

export const EQUIPMENT_DEFAULTS: Record<
  EquipmentType,
  { width: number; depth: number; height: number; color: string }
> = {
  cabinet: { width: 1, depth: 1, height: 2, color: '#3d5a80' },
  machine: { width: 2, depth: 1.5, height: 1.6, color: '#4a5568' },
  workbench: { width: 1.5, depth: 0.75, height: 0.9, color: '#8b6914' },
}

export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

export function footprintForRotation(
  item: Pick<EquipmentItem, 'width' | 'depth' | 'rotationY'>,
): { width: number; depth: number } {
  const swapped = item.rotationY === 90 || item.rotationY === 270
  return swapped
    ? { width: item.depth, depth: item.width }
    : { width: item.width, depth: item.depth }
}

export function clampToRoom(
  x: number,
  z: number,
  width: number,
  depth: number,
): Vec2 {
  const halfW = width / 2
  const halfD = depth / 2
  const minX = -ROOM_WIDTH / 2 + halfW
  const maxX = ROOM_WIDTH / 2 - halfW
  const minZ = -ROOM_DEPTH / 2 + halfD
  const maxZ = ROOM_DEPTH / 2 - halfD
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    z: Math.min(maxZ, Math.max(minZ, z)),
  }
}

export function nextRotation(current: RotationY): RotationY {
  const order: RotationY[] = [0, 90, 180, 270]
  const index = order.indexOf(current)
  return order[(index + 1) % order.length]
}

export function createEquipment(
  type: EquipmentType,
  existing: EquipmentItem[],
): EquipmentItem {
  const defaults = EQUIPMENT_DEFAULTS[type]
  const count = existing.filter((item) => item.type === type).length + 1
  const rotationY: RotationY = 0
  const { width, depth } = footprintForRotation({
    width: defaults.width,
    depth: defaults.depth,
    rotationY,
  })
  const position = findOpenPosition(existing, width, depth)

  return {
    id: crypto.randomUUID(),
    type,
    name: `${type}-${count}`,
    position,
    rotationY,
    width: defaults.width,
    depth: defaults.depth,
    height: defaults.height,
  }
}

function findOpenPosition(
  items: EquipmentItem[],
  width: number,
  depth: number,
): Vec2 {
  for (let z = -5; z <= 5; z += 1) {
    for (let x = -8; x <= 8; x += 1) {
      const snapped = {
        x: snapToGrid(x),
        z: snapToGrid(z),
      }
      const clamped = clampToRoom(snapped.x, snapped.z, width, depth)
      const taken = items.some(
        (item) =>
          Math.hypot(
            item.position.x - clamped.x,
            item.position.z - clamped.z,
          ) < 1,
      )
      if (!taken) return clamped
    }
  }
  return clampToRoom(0, 0, width, depth)
}
