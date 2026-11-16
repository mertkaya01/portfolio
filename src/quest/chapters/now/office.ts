// Where things are in the office (places.tsx draws the room, scenes.tsx puts the people in):
// a round table in the middle, five seats around it facing its centre, every 60° — the sixth
// place, at 0° (on the +x side), is where Mert stands.
export const TABLE = { x: 0, z: -0.6, r: 1.15, top: 0.75 }
export const SEATS = [60, 120, 180, 240, 300].map((deg) => {
  const a = (deg * Math.PI) / 180
  const x = TABLE.x + Math.cos(a) * 1.5
  const z = TABLE.z + Math.sin(a) * 1.5
  return { x, z, face: Math.atan2(TABLE.x - x, TABLE.z - z) }
})
