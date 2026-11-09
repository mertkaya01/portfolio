import { ledText, ledWidth } from './font'
import { C, rect } from './pixel'
import type { Shot } from './shot'

// A scene that isn't drawn yet: an empty storyboard frame with its number ("1/6"), so the
// montage can be played and timed before every picture exists. Replaced scene by scene.
export const pendingShot: Shot = {
  over: (b, _t, { scene }) => {
    b.data.fill(C.night)
    // the corners of a viewfinder
    for (const [x, y, dx, dy] of [
      [24, 20, 1, 1],
      [295, 20, -1, 1],
      [24, 159, 1, -1],
      [295, 159, -1, -1],
    ]) {
      rect(b, dx > 0 ? x : x - 11, y, 12, 1, C.plank)
      rect(b, x, dy > 0 ? y : y - 11, 1, 12, C.plank)
    }
    const label = `${scene.index + 1}/${scene.count}`
    ledText(b, label, Math.round(160 - ledWidth(label, 4) / 2), 76, {
      pitch: 4,
      size: 3,
      on: C.plank,
    })
  },
  still: 0,
}
