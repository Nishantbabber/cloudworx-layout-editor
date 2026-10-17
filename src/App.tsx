import { useEffect, useMemo, useReducer, useState } from 'react'
import { BillOfMaterials } from './components/BillOfMaterials'
import { EquipmentPalette } from './components/EquipmentPalette'
import { ItemList } from './components/ItemList'
import { PropertiesPanel } from './components/PropertiesPanel'
import { SceneCanvas } from './components/SceneCanvas'
import { Toolbar } from './components/Toolbar'
import {
  countByType,
  initialHistory,
  layoutReducer,
} from './features/layout/layoutReducer'
import {
  conflictingIds,
  findProximityConflicts,
} from './features/layout/layoutRules'
import type { Lang } from './i18n'
import { t } from './i18n'

function App() {
  const [history, dispatch] = useReducer(layoutReducer, initialHistory)
  const [lang, setLang] = useState<Lang>('en')
  const { present } = history
  const selected =
    present.items.find((item) => item.id === present.selectedId) ?? null

  const conflicts = useMemo(
    () => findProximityConflicts(present.items),
    [present.items],
  )
  const conflictIdSet = useMemo(() => conflictingIds(conflicts), [conflicts])
  const bom = useMemo(() => countByType(present.items), [present.items])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isEditingText = Boolean(
        target &&
          (target.matches('input, textarea, select') || target.isContentEditable),
      )
      if (isEditingText) return

      const withMod = event.metaKey || event.ctrlKey
      if (withMod && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        dispatch({ type: event.shiftKey ? 'redo' : 'undo' })
      }
      // Deletion remains an explicit button action so Backspace/Delete used
      // while navigating other controls cannot unexpectedly remove equipment.
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="app-shell">
      <Toolbar
        lang={lang}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        onUndo={() => dispatch({ type: 'undo' })}
        onRedo={() => dispatch({ type: 'redo' })}
        onLangChange={setLang}
      />

      <div className="workspace">
        <EquipmentPalette
          lang={lang}
          onAdd={(equipmentType) => dispatch({ type: 'add', equipmentType })}
        />

        <main className="viewport-column">
          <SceneCanvas
            items={present.items}
            selectedId={present.selectedId}
            conflictIds={conflictIdSet}
            onSelect={(id) => dispatch({ type: 'select', id })}
          />
          <section className="warnings" aria-live="polite">
            <h2>{t(lang, 'warnings')}</h2>
            {conflicts.length === 0 ? (
              <p className="empty-state">{t(lang, 'noWarnings')}</p>
            ) : (
              <ul>
                {conflicts.map((conflict) => (
                  <li key={`${conflict.aId}-${conflict.bId}`}>
                    <strong>
                      {conflict.aName} ({conflict.aId.slice(0, 8)})
                    </strong>
                    {' · '}
                    <strong>
                      {conflict.bName} ({conflict.bId.slice(0, 8)})
                    </strong>{' '}
                    {t(lang, 'tooClose')} {conflict.distance.toFixed(2)} m
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        <PropertiesPanel
          lang={lang}
          item={selected}
          onNudge={(dx, dz) => dispatch({ type: 'nudge', dx, dz })}
          onSetPosition={(x, z) => dispatch({ type: 'setPosition', x, z })}
          onRotate={() => dispatch({ type: 'rotate' })}
          onDelete={() => dispatch({ type: 'delete' })}
        />
      </div>

      <div className="bottom-row">
        <ItemList
          lang={lang}
          items={present.items}
          selectedId={present.selectedId}
          conflictIds={conflictIdSet}
          onSelect={(id) => dispatch({ type: 'select', id })}
        />
        <BillOfMaterials lang={lang} counts={bom} />
      </div>
    </div>
  )
}

export default App
