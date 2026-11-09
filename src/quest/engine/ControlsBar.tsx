import { useT } from '@/i18n'

type Props = {
  finale: boolean
  step: number // current step inside the set (0 = its scoreboard)
  steps: number // steps in this set
  stepKey: string // restarts the progress bar on every step
  duration: number // ms the current step stays when the quest plays by itself
  playing: boolean // the visitor's choice: playing by itself, or paused
  running: boolean // the clock is actually ticking (playing, and the tab is on screen)
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
}

const BUTTON =
  'flex items-center gap-2 rounded-full border border-light/20 px-4 py-2 font-mono text-[0.7rem] tracking-[0.15em] text-light/80 uppercase transition-colors hover:border-accent hover:text-accent'

// The bottom bar: Back · Pause/Play · how far into this set you are · Next.
// Every action also has a key, but the buttons make it work without a keyboard.
export function ControlsBar(props: Props) {
  const { finale, step, steps, stepKey, duration, playing, running } = props
  const t = useT()
  return (
    <footer className="flex items-center justify-between gap-3 border-t border-light/10 bg-black/50 px-4 py-3 sm:px-6">
      <button type="button" onClick={props.onPrev} className={BUTTON}>
        <span aria-hidden="true">←</span> {t.quest.back}
      </button>

      {finale ? (
        <p className="font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase">
          <span className="hidden sm:inline">{t.quest.spikeHint}</span>
          <span className="sm:hidden">{t.quest.spikeHintTouch}</span>
        </p>
      ) : (
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {/* Pause / Play: the quest moves on by itself, so it must be possible to stop it */}
          <button
            type="button"
            onClick={props.onTogglePlay}
            aria-label={playing ? t.quest.pause : t.quest.play}
            className={`${BUTTON} px-3`}
          >
            <span aria-hidden="true" className="w-3 text-center">
              {playing ? '❚❚' : '▶'}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              {playing ? t.quest.pause : t.quest.play}
            </span>
            <kbd
              aria-hidden="true"
              className="hidden rounded border border-light/20 px-1 text-[0.6rem] text-muted md:inline"
            >
              P
            </kbd>
          </button>

          {/* the steps of this set; the current one fills up while it plays */}
          <span aria-hidden="true" className="flex gap-1.5">
            {Array.from({ length: steps }, (_, i) => (
              <span
                key={i}
                className={`relative h-1 overflow-hidden rounded-full transition-all duration-500 ${
                  i === step ? 'w-6 bg-accent/35' : i < step ? 'w-2 bg-light/50' : 'w-2 bg-light/15'
                }`}
              >
                {i === step && (
                  <span
                    key={stepKey}
                    className="absolute inset-0 origin-left bg-accent"
                    style={{
                      animation: `step-fill ${duration}ms linear both`,
                      animationPlayState: running ? 'running' : 'paused',
                    }}
                  />
                )}
              </span>
            ))}
          </span>
          <span className="hidden font-mono text-[0.65rem] tracking-[0.15em] text-muted uppercase lg:inline">
            {t.quest.moveHint}
          </span>
        </div>
      )}

      {finale ? (
        // keeps the hint centred where the Next button would be
        <span aria-hidden="true" className="w-[5.5rem]" />
      ) : (
        <button type="button" onClick={props.onNext} className={BUTTON}>
          {t.quest.next} <span aria-hidden="true">→</span>
        </button>
      )}
    </footer>
  )
}
