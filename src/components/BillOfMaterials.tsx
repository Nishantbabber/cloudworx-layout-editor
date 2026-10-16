import { EQUIPMENT_TYPES } from '../features/layout/layoutTypes'
import type { EquipmentType } from '../features/layout/layoutTypes'
import type { Lang } from '../i18n'
import { t } from '../i18n'
import type { MessageKey } from '../i18n'

type Props = {
  lang: Lang
  counts: Record<EquipmentType, number>
}

const TYPE_KEYS: Record<EquipmentType, MessageKey> = {
  cabinet: 'cabinet',
  machine: 'machine',
  workbench: 'workbench',
}

export function BillOfMaterials({ lang, counts }: Props) {
  const total = counts.cabinet + counts.machine + counts.workbench

  return (
    <section className="panel panel-bom">
      <h2>{t(lang, 'bom')}</h2>
      {total === 0 ? (
        <p className="empty-state">{t(lang, 'emptyBom')}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t(lang, 'type')}</th>
              <th>{t(lang, 'quantity')}</th>
            </tr>
          </thead>
          <tbody>
            {EQUIPMENT_TYPES.map((type) => (
              <tr key={type}>
                <td>{t(lang, TYPE_KEYS[type])}</td>
                <td>{counts[type]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
