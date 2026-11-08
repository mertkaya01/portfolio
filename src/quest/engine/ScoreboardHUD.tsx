import type { ExperienceState } from '@/app/experienceMachine'

import { useContent, useT } from '@/i18n'

type Props = { state: ExperienceState; onSkip: () => void }

// The top bar of the quest, styled like an arena scoreboard: which set is being played,
// the five sets (played / now / still to come), and a Skip button that is always there.
export function ScoreboardHUD({ state, onSkip }: Props) {
  const t = useT()
  const { chapters } = useContent()
  const finale = state.name === 'FINALE'
  // In the finale every set has been played
  const current = state.name === 'QUEST' ? state.chapter : chapters.length
  const chapter = state.name === 'QUEST' ? chapters[state.chapter] : undefined

  return (
    <header className="flex items-center justify-between gap-4 border-b border-light/10 bg-black/50 px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden="true" className="flex gap-1">
          <span className="size-1.5 rounded-full bg-accent" />
          <span className="size-1.5 rounded-full bg-accent/40" />
        </span>
        <p className="truncate font-mono text-[0.7rem] tracking-[0.25em] text-muted uppercase">
          {finale ? (
            <span className="animate-breathe text-accent">{t.quest.matchPoint}</span>
          ) : (
            <>
              {t.quest.set} {chapter?.set} · <span className="text-light">{chapter?.title}</span>
            </>
          )}
        </p>
      </div>

      {/* The five sets */}
      <ol aria-label={t.quest.sets} className="hidden items-center gap-1.5 sm:flex">
        {chapters.map((set, i) => {
          const played = i < current
          const now = i === current
          return (
            <li
              key={set.id}
              aria-current={now ? 'step' : undefined}
              className={`flex size-7 items-center justify-center rounded font-mono text-xs transition-colors ${
                played
                  ? 'bg-accent/80 text-night'
                  : now
                    ? 'border border-accent text-accent'
                    : 'border border-light/15 text-muted'
              }`}
            >
              {set.set}
              <span className="sr-only">
                {' '}
                {set.title}
                {played ? t.quest.played : ''}
              </span>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        onClick={onSkip}
        className="flex shrink-0 items-center gap-2 rounded-full border border-light/20 px-3.5 py-1.5 font-mono text-[0.7rem] tracking-[0.15em] text-light/80 uppercase transition-colors hover:border-accent hover:text-accent"
      >
        {t.quest.skip}
        <kbd className="rounded border border-light/20 px-1 text-[0.6rem] text-muted">Esc</kbd>
      </button>
    </header>
  )
}
