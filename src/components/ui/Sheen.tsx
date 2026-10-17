// Light that follows the mouse across a tilting card (position comes from --sx / --sy).
// Appears while the card's `group` is hovered.
export function Sheen({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${className}`}
      style={{
        background:
          'radial-gradient(circle at var(--sx, 50%) var(--sy, 50%), rgb(255 255 255 / 0.12), transparent 45%)',
      }}
    />
  )
}
