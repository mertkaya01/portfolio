import type { Variants } from 'motion/react'

// How one set hands over to the next. Every boundary is drawn with the tools of the style that
// comes in — the rendering itself levels up as the story does:
//   Set 1 → 2  'pixels'    paper-coloured blocks pour over the pixel art, then clear in ever
//                          finer blocks: the resolution goes up, and it is pencil on paper
//   Set 2 → 3  'scan'      an amber scan line runs down the sketch; above it, the terminal
//   Set 3 → 4  'poweroff'  the terminal switches off like an old CRT — a bright line, a dot —
//                          and the flat world opens from that dot
//   Set 4 → 5  'unfold'    the flat picture lies down flat onto its lower edge, like a card
//                          falling onto a table, and the 3D arena comes up behind it
//   Set 5 → finale 'breakout'  the match point breaks out of the screen and fills the stage
// Going back, or with less motion asked for: a plain crossfade ('fade').
export type Arrival = 'fade' | 'pixels' | 'scan' | 'poweroff' | 'unfold' | 'breakout'

// into set 2, 3, 4, 5, and into the finale (index = the set we come from, 0-based)
const FORWARD: Arrival[] = ['pixels', 'scan', 'poweroff', 'unfold', 'breakout']

// `from` / `to`: set indexes, the finale counting as one past the last set
export function arrivalFor(from: number, to: number, direction: number, calm: boolean): Arrival {
  if (calm || direction <= 0 || to !== from + 1) return 'fade'
  return FORWARD[from] ?? 'fade'
}

// Transitions the new set's screen plays itself (ArtScreen): the layer stays clear behind it,
// so the set going out shows through until the new picture has arrived
export const drawsItsOwnArrival = (a: Arrival) => a === 'pixels' || a === 'scan' || a === 'poweroff'

const EASE = [0.22, 1, 0.36, 1] as const // ease-out-expo
const NIGHT = 'rgba(10, 11, 13, 1)'
const CLEAR = 'rgba(10, 11, 13, 0)'
// the middle of the screen, inside a set's layer (the caption row sits under the screen)
const SCREEN_MIDDLE = 'center calc(50% - 3.6rem)'

// The two layers on the stage while sets change: the one coming in ("enter" → "center") and
// the one going out ("exit"). `custom` is the arrival; for the layer going out, AnimatePresence
// hands it the newest one, so it knows how to leave. (No perspective turns here: on layers this
// big, a CSS 3D rotation flung the picture off screen — 'unfold' squashes it flat instead.)
export const SET_LAYER: Variants = {
  enter: (a: Arrival) =>
    a === 'fade'
      ? { opacity: 0, zIndex: 1 }
      : a === 'unfold'
        ? { opacity: 0, scale: 1.04, zIndex: 1 }
        : a === 'breakout'
          ? { opacity: 1, zIndex: 2 }
          : { opacity: 1, zIndex: 2, backgroundColor: CLEAR },
  center: (a: Arrival) =>
    a === 'fade'
      ? { opacity: 1, transition: { duration: 0.5, ease: EASE } }
      : a === 'unfold'
        ? { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.8, ease: EASE } }
        : drawsItsOwnArrival(a)
          ? // back to the dark behind it once the new picture is fully there
            { opacity: 1, backgroundColor: NIGHT, transition: { delay: 1.3, duration: 0 } }
          : { opacity: 1 },
  exit: (a: Arrival) => {
    switch (a) {
      case 'pixels': // gone once the blocks cover it
        return { opacity: 0, transition: { delay: 0.45, duration: 0 } }
      case 'scan': // gone once the scan line has passed
        return { opacity: 0, transition: { delay: 0.95, duration: 0 } }
      case 'poweroff': // squeezed into a bright line, then a dot
        return {
          scaleY: [1, 0.006, 0.006],
          scaleX: [1, 1, 0],
          filter: ['brightness(1)', 'brightness(2.4)', 'brightness(4)'],
          opacity: [1, 1, 0],
          transformOrigin: SCREEN_MIDDLE,
          zIndex: 3,
          transition: { duration: 0.55, times: [0, 0.62, 1], ease: 'easeIn' },
        }
      case 'unfold': // lies back onto the floor of the arena: squashed down to its lower edge
        return {
          scaleY: 0.1,
          scaleX: 0.97,
          y: '5%',
          opacity: 0,
          transformOrigin: 'center 74%',
          zIndex: 3,
          transition: { duration: 0.85, ease: [0.45, 0, 0.55, 1] },
        }
      case 'breakout':
        return { opacity: 0, transition: { delay: 0.4, duration: 0.3 } }
      default:
        return { opacity: 0, transition: { duration: 0.5, ease: EASE } }
    }
  },
}
