// Temporary finale: match point and a button to take it. Milestones 7–9 replace this with the
// 3D court, where you time the spike yourself.
export function FinalePlaceholder({ onSpike }: { onSpike: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs tracking-[0.3em] text-wood uppercase">Set 5 · Tie-break</p>
      <h2 className="mt-4 animate-rise font-display text-7xl font-black tracking-tight text-accent uppercase [text-shadow:0_0_30px_rgb(255_210_63/0.35)] sm:text-9xl">
        Match point
      </h2>
      <p className="mt-6 max-w-md text-light/70">
        One ball left. The 3D court — where you time the spike yourself — is coming soon. For now,
        take the point.
      </p>
      <button
        type="button"
        onClick={onSpike}
        className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold tracking-[0.15em] text-night uppercase transition-colors hover:bg-light"
      >
        Spike it
        <kbd className="rounded border border-night/30 px-1.5 text-[0.65rem]">Space</kbd>
      </button>
    </div>
  )
}
