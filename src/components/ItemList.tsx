import type { EquipmentItem } from '../features/layout/layoutTypes'
import type { Lang } from '../i18n'
import { t } from '../i18n'
import type { MessageKey } from '../i18n'

type Props = {
  lang: Lang
  items: EquipmentItem[]
  selectedId: string | null
  conflictIds: Set<string>
  onSelect: (id: string) => void
}

const TYPE_KEYS: Record<EquipmentItem['type'], MessageKey> = {
  cabinet: 'cabinet',
  machine: 'machine',
  workbench: 'workbench',
}

export function ItemList({
  lang,
  items,
  selectedId,
  conflictIds,
  onSelect,
}: Props) {
  return (
    <section className="panel panel-bottom">
      <h2>{t(lang, 'items')}</h2>
      {items.length === 0 ? (
        <p className="empty-state">{t(lang, 'emptyItems')}</p>
      ) : (
        <ul className="item-list">
          {items.map((item) => {
            const selected = item.id === selectedId
            const conflict = conflictIds.has(item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`item-row${selected ? ' is-selected' : ''}${conflict ? ' is-conflict' : ''}`}
                  onClick={() => onSelect(item.id)}
                >
                  <span className="item-name">{item.name}</span>
                  <span className="item-meta">
                    {t(lang, TYPE_KEYS[item.type])} · X {item.position.x} · Z{' '}
                    {item.position.z} · {item.rotationY}°
                  </span>
                  {conflict ? (
                    <span className="badge">{t(lang, 'conflict')}</span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
