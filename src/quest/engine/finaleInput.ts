// The finale's swing. When the 3D match point is on screen it takes the keys that hit the ball
// (Space / Enter swing, ← → swing to that side), so the stage's keyboard hands them over here
// instead of spiking straight away. While the simple finale stands in, nothing is registered
// and Space spikes as before.
export type SwingKey = ' ' | 'Enter' | 'ArrowLeft' | 'ArrowRight'
type Swing = (key: SwingKey, time: number) => void

let swing: Swing | null = null

export function setFinaleSwing(handler: Swing | null) {
  swing = handler
}

export const finaleSwing = () => swing

export const isSwingKey = (key: string): key is SwingKey =>
  key === ' ' || key === 'Enter' || key === 'ArrowLeft' || key === 'ArrowRight'

// Parts of a scene the visitor plays with (a suitcase to drag, a photo to open): a click,
// a tap or a swipe there is theirs, not the stage's "next"
export const INTERACTIVE = '[data-quest-interactive]'
export const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && target.closest(INTERACTIVE) !== null
