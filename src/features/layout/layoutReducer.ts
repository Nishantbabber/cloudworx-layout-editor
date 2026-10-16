import {
  clampToRoom,
  createEquipment,
  footprintForRotation,
  nextRotation,
  snapToGrid,
} from './layoutTypes'
import type {
  EquipmentItem,
  EquipmentType,
  HistoryState,
  LayoutSnapshot,
} from './layoutTypes'

export type LayoutAction =
  | { type: 'add'; equipmentType: EquipmentType }
  | { type: 'select'; id: string | null }
  | { type: 'nudge'; dx: number; dz: number }
  | { type: 'setPosition'; x: number; z: number }
  | { type: 'rotate' }
  | { type: 'delete' }
  | { type: 'undo' }
  | { type: 'redo' }

export const initialHistory: HistoryState = {
  past: [],
  present: { items: [], selectedId: null },
  future: [],
}

function cloneSnapshot(snapshot: LayoutSnapshot): LayoutSnapshot {
  return {
    selectedId: snapshot.selectedId,
    items: snapshot.items.map((item) => ({
      ...item,
      position: { ...item.position },
    })),
  }
}

function commit(state: HistoryState, next: LayoutSnapshot): HistoryState {
  return {
    past: [...state.past, cloneSnapshot(state.present)],
    present: next,
    future: [],
  }
}

function selectedItem(snapshot: LayoutSnapshot): EquipmentItem | undefined {
  return snapshot.items.find((item) => item.id === snapshot.selectedId)
}

function moveItem(
  item: EquipmentItem,
  x: number,
  z: number,
): EquipmentItem {
  const footprint = footprintForRotation(item)
  const snapped = { x: snapToGrid(x), z: snapToGrid(z) }
  const position = clampToRoom(
    snapped.x,
    snapped.z,
    footprint.width,
    footprint.depth,
  )
  return { ...item, position }
}

export function layoutReducer(
  state: HistoryState,
  action: LayoutAction,
): HistoryState {
  const { present } = state

  switch (action.type) {
    case 'add': {
      const item = createEquipment(action.equipmentType, present.items)
      return commit(state, {
        items: [...present.items, item],
        selectedId: item.id,
      })
    }

    // Selection is not an edit, so it does not push history.
    case 'select':
      return {
        ...state,
        present: { ...present, selectedId: action.id },
      }

    case 'nudge':
    case 'setPosition': {
      const item = selectedItem(present)
      if (!item) return state
      const x =
        action.type === 'nudge' ? item.position.x + action.dx : action.x
      const z =
        action.type === 'nudge' ? item.position.z + action.dz : action.z
      const moved = moveItem(item, x, z)
      if (
        moved.position.x === item.position.x &&
        moved.position.z === item.position.z
      ) {
        return state
      }
      return commit(state, {
        ...present,
        items: present.items.map((candidate) =>
          candidate.id === item.id ? moved : candidate,
        ),
      })
    }

    case 'rotate': {
      const item = selectedItem(present)
      if (!item) return state
      const rotationY = nextRotation(item.rotationY)
      const rotated: EquipmentItem = { ...item, rotationY }
      const moved = moveItem(rotated, rotated.position.x, rotated.position.z)
      return commit(state, {
        ...present,
        items: present.items.map((candidate) =>
          candidate.id === item.id ? moved : candidate,
        ),
      })
    }

    case 'delete': {
      if (!present.selectedId) return state
      return commit(state, {
        items: present.items.filter((item) => item.id !== present.selectedId),
        selectedId: null,
      })
    }

    case 'undo': {
      const previous = state.past[state.past.length - 1]
      if (!previous) return state
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [cloneSnapshot(present), ...state.future],
      }
    }

    case 'redo': {
      const next = state.future[0]
      if (!next) return state
      return {
        past: [...state.past, cloneSnapshot(present)],
        present: next,
        future: state.future.slice(1),
      }
    }

    default:
      return state
  }
}

export function countByType(
  items: EquipmentItem[],
): Record<EquipmentType, number> {
  return {
    cabinet: items.filter((item) => item.type === 'cabinet').length,
    machine: items.filter((item) => item.type === 'machine').length,
    workbench: items.filter((item) => item.type === 'workbench').length,
  }
}
