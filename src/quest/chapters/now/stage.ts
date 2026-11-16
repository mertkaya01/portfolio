import { CanvasTexture, NeutralToneMapping, SRGBColorSpace, type WebGLRenderer } from 'three'

// How Set 5's 3D is rendered — shared by every 3D scene and the finale (pass to <Canvas
// onCreated>):
// - Neutral tone mapping (Khronos PBR Neutral) instead of R3F's default ACES, which washes
//   stylised colours out and shifts their hue (yellow → orange). Neutral keeps a colour as it
//   was picked — the orange court stays orange, the accent yellow stays yellow — and only
//   rolls off the brightest lights. (AgX, tried first, made the court a pale salmon.)
// (A RoomEnvironment reflection map was tried too: it froze the page for about 350 ms each
// time a 3D canvas started, for highlights the lights below give almost as well.)
export function setupStage({ gl }: { gl: WebGLRenderer }) {
  gl.toneMapping = NeutralToneMapping
  gl.toneMappingExposure = 1.05
}

// A soft round spot, white in the middle and clear at the edge, made once on a canvas.
// Used for the lamps' glow (added on top) and the soft shadows under people (in black).
let soft: CanvasTexture | null = null
export function softSpot() {
  if (soft) return soft
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  soft = new CanvasTexture(canvas)
  soft.colorSpace = SRGBColorSpace
  return soft
}

// Camera lenses: the scenes are composed for a 45° view; a narrower lens (like a TV camera's
// longer focal length) looks less like a toy and flatter, so the camera steps back to keep the
// same framing. How far back, for a given field of view:
const DEG = Math.PI / 180
export const stepBack = (fov: number) => Math.tan(22.5 * DEG) / Math.tan((fov / 2) * DEG)
