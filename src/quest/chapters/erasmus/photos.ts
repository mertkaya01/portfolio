// The photos behind the spots of Set 4. A photo is a file in ./photos named after its spot
// (bridge.jpeg, river.webp …): drop it in and the spot appears — no code to change. Vite finds
// the files at build time and gives each a hashed URL. A spot with no photo yet is left out
// of the live site; the dev server shows it as a dashed placeholder.
const FILES = import.meta.glob<string>('./photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export type PhotoId = 'bridge' | 'museum' | 'river' | 'campus'
export type HavelPhoto = { id: PhotoId; x: number; y: number; src?: string }

const fileFor = (id: PhotoId) =>
  Object.entries(FILES).find(([path]) => path.split('/').pop()?.split('.')[0] === id)?.[1]

// the spots that have a photo (all of them on the dev server), with where they sit in the
// 320 × 180 picture — inside the phone's middle, x 70–249
const spots = (list: Omit<HavelPhoto, 'src'>[]): HavelPhoto[] =>
  list
    .map((spot) => ({ ...spot, src: fileFor(spot.id) }))
    .filter((spot) => spot.src || import.meta.env.DEV)

// By the Havel: Mert on the bridge (the photo the scene is drawn from), the sunset on the
// river, and the industrial museum (the brick building on the right)
export const HAVEL_PHOTOS = spots([
  { id: 'bridge', x: 174, y: 112 },
  { id: 'river', x: 208, y: 126 },
  { id: 'museum', x: 246, y: 66 },
])

// At TH Brandenburg: the campus, seen from his dorm window
export const CAMPUS_PHOTOS = spots([{ id: 'campus', x: 226, y: 22 }])
