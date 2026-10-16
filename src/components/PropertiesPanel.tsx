import { GRID_SIZE } from '../features/layout/layoutTypes'
import type { EquipmentItem } from '../features/layout/layoutTypes'
import type { Lang } from '../i18n'
import { t } from '../i18n'
import type { MessageKey } from '../i18n'

type Props = {
  lang: Lang
  item: EquipmentItem | null
  onNudge: (dx: number, dz: number) => void
  onSetPosition: (x: number, z: number) => void
  onRotate: () => void
  onDelete: () => void
}

const TYPE_KEYS: Record<EquipmentItem['type'], MessageKey> = {
  cabinet: 'cabinet',
  machine: 'machine',
  workbench: 'workbench',
}

export function PropertiesPanel({
  lang,
  item,
  onNudge,
  onSetPosition,
  onRotate,
  onDelete,
}: Props) {
  return (
    <aside className="panel panel-right">
      <h2>{t(lang, 'properties')}</h2>
      {item ? (
        <div className="properties">
          <dl>
            <dt>{t(lang, 'name')}</dt>
            <dd>{item.name}</dd>
            <dt>{t(lang, 'id')}</dt>
            <dd className="mono">{item.id.slice(0, 8)}</dd>
            <dt>{t(lang, 'type')}</dt>
            <dd>{t(lang, TYPE_KEYS[item.type])}</dd>
            <dt>{t(lang, 'rotation')}</dt>
            <dd>{item.rotationY}°</dd>
            <dt>{t(lang, 'size')}</dt>
            <dd>
              {item.width} × {item.depth} × {item.height}
            </dd>
          </dl>

          <fieldset>
            <legend>{t(lang, 'position')}</legend>
            <label>
              X
              <input
                key={`x-${item.id}-${item.position.x}`}
                name="pos-x"
                type="number"
                step={GRID_SIZE}
                defaultValue={item.position.x}
                onBlur={(event) => {
                  const x = Number(event.target.value)
                  if (Number.isFinite(x)) onSetPosition(x, item.position.z)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur()
                  }
                }}
              />
            </label>
            <label>
              Z
              <input
                key={`z-${item.id}-${item.position.z}`}
                name="pos-z"
                type="number"
                step={GRID_SIZE}
                defaultValue={item.position.z}
                onBlur={(event) => {
                  const z = Number(event.target.value)
                  if (Number.isFinite(z)) onSetPosition(item.position.x, z)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur()
                  }
                }}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>{t(lang, 'move')}</legend>
            <div className="nudge-pad">
              <button type="button" onClick={() => onNudge(0, -GRID_SIZE)}>
                −Z
              </button>
              <div className="nudge-mid">
                <button type="button" onClick={() => onNudge(-GRID_SIZE, 0)}>
                  −X
                </button>
                <button type="button" onClick={() => onNudge(GRID_SIZE, 0)}>
                  +X
                </button>
              </div>
              <button type="button" onClick={() => onNudge(0, GRID_SIZE)}>
                +Z
              </button>
            </div>
          </fieldset>

          <div className="property-actions">
            <button type="button" onClick={onRotate}>
              {t(lang, 'rotate90')}
            </button>
            <button type="button" className="danger" onClick={onDelete}>
              {t(lang, 'delete')}
            </button>
          </div>
        </div>
      ) : (
        <p className="empty-state">{t(lang, 'noSelection')}</p>
      )}
    </aside>
  )
}
