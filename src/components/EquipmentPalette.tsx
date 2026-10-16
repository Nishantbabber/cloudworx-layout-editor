import { EQUIPMENT_TYPES } from '../features/layout/layoutTypes'
import type { EquipmentType } from '../features/layout/layoutTypes'
import type { Lang } from '../i18n'
import { t } from '../i18n'
import type { MessageKey } from '../i18n'

type Props = {
  lang: Lang
  onAdd: (type: EquipmentType) => void
}

const TYPE_KEYS: Record<EquipmentType, MessageKey> = {
  cabinet: 'cabinet',
  machine: 'machine',
  workbench: 'workbench',
}

const TYPE_HINTS: Record<EquipmentType, string> = {
  cabinet: '1.0 × 1.0 m',
  machine: '2.0 × 1.5 m',
  workbench: '1.5 × 0.75 m',
}

export function EquipmentPalette({ lang, onAdd }: Props) {
  return (
    <aside className="panel panel-left">
      <h2>{t(lang, 'equipment')}</h2>
      <ul className="palette-list">
        {EQUIPMENT_TYPES.map((type) => (
          <li key={type} className="palette-item">
            <div>
              <strong>{t(lang, TYPE_KEYS[type])}</strong>
              <span>{TYPE_HINTS[type]}</span>
            </div>
            <button type="button" onClick={() => onAdd(type)}>
              {t(lang, 'add')}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
