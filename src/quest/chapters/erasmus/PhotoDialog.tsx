import { useEffect, useRef } from 'react'

import { useT } from '@/i18n'

import { useHoldClock } from '../../engine/questClock'

import type { HavelPhoto } from './photos'

// A photo from the Havel, opened over the quest. A native modal <dialog>: the browser keeps the
// focus inside and gives it back to the spot afterwards; Esc, the Close button or a click
// beside the photo closes it. While it is open the quest waits.
export function PhotoDialog({ photo, onClose }: { photo: HavelPhoto; onClose: () => void }) {
  const t = useT()
  const ref = useRef<HTMLDialogElement>(null)
  const label = t.quest.photos[photo.id]
  useHoldClock('erasmus-photo', true)

  // Open it once it is on the page. No close() on the way out: a removed dialog leaves the top
  // layer by itself, and a close() there would fire onClose (React's dev double-run of effects
  // would shut the photo the moment it opened).
  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      data-quest-photo
      data-quest-interactive
      aria-label={label}
      onClose={onClose}
      // a click on the dark backdrop (the dialog itself, not the photo) closes it
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-auto max-h-[92vh] max-w-[min(94vw,1000px)] animate-fade-in overflow-visible bg-transparent p-0 text-light backdrop:bg-night/85 backdrop:backdrop-blur-sm"
    >
      <figure className="flex flex-col items-center">
        {photo.src ? (
          <img
            src={photo.src}
            alt={label}
            decoding="async"
            className="max-h-[78vh] w-auto rounded-lg object-contain shadow-2xl"
          />
        ) : (
          <div className="grid aspect-[4/3] w-[min(84vw,640px)] place-items-center rounded-lg border-2 border-dashed border-light/35 p-8 text-center font-mono text-xs [overflow-wrap:anywhere] text-light/70">
            {t.quest.photos.missing(photo.id)}
          </div>
        )}
        <figcaption className="mt-3 flex w-full items-center justify-between gap-4">
          <span className="font-display text-lg font-bold tracking-tight">{label}</span>
          <button
            type="button"
            autoFocus
            onClick={() => ref.current?.close()}
            className="rounded-full border border-light/30 px-4 py-1.5 font-mono text-xs tracking-[0.15em] uppercase hover:bg-light/10"
          >
            {t.quest.photos.close}
          </button>
        </figcaption>
      </figure>
    </dialog>
  )
}
