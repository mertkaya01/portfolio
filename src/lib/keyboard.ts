// Elements that already do something when you press Enter or Space on them (a focused button
// clicks, a focused link opens). Our own shortcuts step aside for these.
export const handlesOwnKeys = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest('button, a, input, textarea, select, summary, [contenteditable]') !== null

// Shortcuts with Ctrl / Cmd / Alt belong to the browser (Ctrl+S, Alt+←, …)
export const hasModifier = (e: KeyboardEvent) => e.ctrlKey || e.metaKey || e.altKey
