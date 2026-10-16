import type { Lang } from '../i18n'
import { t } from '../i18n'

type Props = {
  lang: Lang
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onLangChange: (lang: Lang) => void
}

export function Toolbar({
  lang,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onLangChange,
}: Props) {
  return (
    <header className="toolbar">
      <h1 className="toolbar-title">{t(lang, 'title')}</h1>
      <p className="toolbar-hint">{t(lang, 'roomHint')}</p>
      <div className="toolbar-actions">
        <button type="button" onClick={onUndo} disabled={!canUndo}>
          {t(lang, 'undo')}
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo}>
          {t(lang, 'redo')}
        </button>
        <div className="lang-toggle" role="group" aria-label={t(lang, 'language')}>
          <button
            type="button"
            className={lang === 'en' ? 'is-active' : undefined}
            onClick={() => onLangChange('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={lang === 'vi' ? 'is-active' : undefined}
            onClick={() => onLangChange('vi')}
          >
            VI
          </button>
        </div>
      </div>
    </header>
  )
}
