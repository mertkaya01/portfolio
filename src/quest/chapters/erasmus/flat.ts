import type { CSSProperties } from 'react'

import { QUEST } from '../../engine/palette'

// Set 4's flat vector look: clean shapes, flat colours, no outlines, soft shadows. Everything is
// SVG in a 320 × 180 box (like the other sets), sharp at any size. Phones keep x 70–249.
export const FLAT = {
  sky: '#8fc8ee',
  skyDeep: '#3d8fd1',
  cloud: '#f4f8fb',
  river: '#2f8fa3',
  riverLight: '#6cc3cf',
  grass: '#7fb069',
  tree: '#6b5a4a', // bare spring branches
  brick: '#b5523b', // Brandenburg's red brick
  brickDark: '#8e3b2a',
  roof: '#5a3a33',
  stone: '#e9e1d3',
  navy: '#1f2a44',
  euBlue: '#1f4fb5',
  star: QUEST.accent, // the quest's accent — and the stars of the EU flag
  white: '#ffffff',
  ink: '#1b1f2a',
  grey: '#9aa5b1',
  greyLight: '#d5dbe2',
  skin: ['#e9b48f', '#c98b5e', '#8d5a3b', '#f2c9a7'],
  hair: { mert: '#2b1d16', black: '#16120f', blond: '#d9b26a', red: '#a3492c', brown: '#5b3a24' },
}

// The display font of the site, for titles
export const DISPLAY = "'Big Shoulders Variable', ui-sans-serif, sans-serif"
export const MONO = "'JetBrains Mono Variable', ui-monospace, monospace"

// CSS animations for SVG shapes (keyframes in index.css): they scale / move around their own
// middle, starting `delay` ms after the scene appears
export const pop = (delay: number, ms = 450): CSSProperties => ({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  animation: `pop-in ${ms}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms both`,
})
export const slideUp = (delay: number, ms = 500): CSSProperties => ({
  animation: `slide-up ${ms}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
})
export const grow = (delay: number, ms = 600): CSSProperties => ({
  transformBox: 'fill-box',
  transformOrigin: 'bottom',
  animation: `grow-y ${ms}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
})

// a ring that swells and fades around something to tap — a few times, then it rests
export const pulse = (delay: number, times = 3): CSSProperties => ({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  animation: `hotspot-pulse 1.4s ease-out ${delay}ms ${times} both`,
})

// How a flat person looks (people.tsx draws them)
export type Look = {
  hair: string
  style: 'bun' | 'short' | 'long' | 'curly'
  skin: string
  top: string
  legs?: string
}
// Mert in Brandenburg: long dark hair tied back, the white jacket of his photos, jeans
export const MERT_LOOK: Look = {
  hair: FLAT.hair.mert,
  style: 'bun',
  skin: FLAT.skin[0],
  top: FLAT.white,
  legs: '#4b6a9b',
}

// a five-pointed star
export function star(x: number, y: number, r: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    return `${(x + Math.cos(a) * rr).toFixed(2)} ${(y + Math.sin(a) * rr).toFixed(2)}`
  })
  return `M${pts.join(' L')} Z`
}
