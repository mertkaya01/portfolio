import { useT } from '@/i18n'

type Props = {
  finale: boolean
  beat: number // current line inside the set (0-based)
  beats: number // lines in this set
  onPrev: () => void
  onNext: () => void
}

const BUTTON =
  'flex items-center gap-2 rounded-full border border-light/20 px-4 py-2 font-mono text-[0.7rem] tracking-[0.15em] text-light/80 uppercase transition-colors hover:border-accent hover:text-accent'

// The bottom bar: Back, how far into this set you are, Next.
// Every action also has a key, but the buttons make it work without a keyboard.
export function ControlsBar({ finale, beat, beats, onPrev, onNext }: Props) {
  const t = useT()
  return (
    <footer className="flex items-center justify-between gap-4 border-t border-light/10 bg-black/50 px-4 py-3 sm:px-6">
      <button type="button" onClick={onPrev} className={BUTTON}>
        <span aria-hidden="true">←</span> {t.quest.back}
      </button>

      {finale ? (
        <p className="font-mono text-[0.7rem] tracking-[0.15em] text-muted uppercase">
          <span className="hidden sm:inline">{t.quest.spikeHint}</span>
          <span className="sm:hidden">{t.quest.spikeHintTouch}</span>
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="flex gap-1.5">
            {Array.from({ length: beats }, (_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === beat ? 'w-6 bg-accent' : i < beat ? 'w-2 bg-light/50' : 'w-2 bg-light/15'
                }`}
              />
            ))}
          </span>
          <span className="hidden font-mono text-[0.65rem] tracking-[0.15em] text-muted uppercase md:inline">
            {t.quest.moveHint}
          </span>
        </div>
      )}

      {finale ? (
        // keeps the hint centred where the Next button would be
        <span aria-hidden="true" className="w-[5.5rem]" />
      ) : (
        <button type="button" onClick={onNext} className={BUTTON}>
          {t.quest.next} <span aria-hidden="true">→</span>
        </button>
      )}
    </footer>
  )
}
