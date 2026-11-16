import { CapsuleGeometry, CylinderGeometry, SphereGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// The shapes every 3D person in Set 5 is built from — Mert, the players, the crowd. Soft-edged
// boxes for the body and head, capsules for arms and legs, spheres for hands: the edges catch
// the light (a sharp 90° box edge never does), and the figures read as stylised people instead
// of stacked bricks. Made once here and shared by everyone (one copy on the graphics card).
//
// The build, in metres, feet at y 0, facing +z, about 1.95 m to the top of the hair:
//   shoes 0–0.09 · legs 0.09–0.9 · hips 0.74–0.98 · torso 0.9–1.54 · neck 1.6
//   head 1.66–1.98 · shoulders at x ±0.31, y 1.5 (arms hang from there, hands at −0.67)
export const BODY = {
  legX: 0.11,
  legY: 0.49,
  hipsY: 0.86,
  torsoY: 1.22,
  neckY: 1.6,
  headY: 1.82,
  shoulder: { x: 0.31, y: 1.5 },
  armY: -0.31, // the arm's middle, below the shoulder
  handY: -0.67,
}

export const SHAPES = {
  torso: new RoundedBoxGeometry(0.48, 0.64, 0.27, 3, 0.1),
  hips: new RoundedBoxGeometry(0.44, 0.24, 0.25, 2, 0.08), // shorts, or the top of trousers
  head: new RoundedBoxGeometry(0.29, 0.32, 0.29, 3, 0.11),
  hairTop: new RoundedBoxGeometry(0.31, 0.11, 0.32, 2, 0.05),
  hairBack: new RoundedBoxGeometry(0.31, 0.24, 0.08, 2, 0.035),
  // stubble: a thin shell over the jaw, a hair wider than the head, and over the upper lip
  stubble: new RoundedBoxGeometry(0.297, 0.1, 0.17, 3, 0.05),
  lip: new RoundedBoxGeometry(0.11, 0.022, 0.012, 1, 0.006),
  leg: new CapsuleGeometry(0.085, 0.64, 4, 10),
  arm: new CapsuleGeometry(0.062, 0.5, 4, 10),
  sleeve: new CapsuleGeometry(0.076, 0.14, 4, 10), // a jersey's short sleeve
  hand: new SphereGeometry(0.064, 12, 8),
  shoe: new RoundedBoxGeometry(0.17, 0.09, 0.3, 2, 0.035),
  kneePad: new CylinderGeometry(0.096, 0.096, 0.1, 14),
  neck: new CylinderGeometry(0.055, 0.062, 0.12, 10),
  ear: new SphereGeometry(0.034, 8, 6),
  // sitting: the thigh lies forward, the shin hangs down
  thigh: new CapsuleGeometry(0.088, 0.3, 4, 10),
  shin: new CapsuleGeometry(0.08, 0.32, 4, 10),
  // a graduation gown, worn over the clothes: long, wide in the sleeves; and the cap
  robe: new RoundedBoxGeometry(0.54, 0.98, 0.32, 3, 0.1),
  robeSleeve: new CapsuleGeometry(0.085, 0.5, 4, 10),
  capBoard: new RoundedBoxGeometry(0.44, 0.025, 0.44, 1, 0.01),
  capCrown: new CylinderGeometry(0.15, 0.16, 0.1, 14),
  // the crowd: a seated body and a head, drawn many times at once
  fan: new RoundedBoxGeometry(0.42, 0.5, 0.32, 2, 0.1),
  fanHead: new SphereGeometry(0.13, 12, 8),
}
