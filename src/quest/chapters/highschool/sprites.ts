// Small fixed sprites of Set 1, drawn as text: one string per row, one character per pixel.
// k = dark outline / silhouette, y / a = the ball's yellow and blue, '.' = empty.
// (The players are not here: they are drawn from a skeleton, see figure.ts.)

// The ball (1 m ≈ 16 px, so about 4 px across plus its outline), readable on any background
export const BALL = ['..kkk..', '.kyyyk.', 'kyyaayk', 'kyayyyk', 'kyyyayk', '.kyyyk.', '..kkk..']

// A seagull, wings up and wings down (two frames of its flap)
export const GULL_UP = ['kk...kk', '..k.k..', '...k...']
export const GULL_DOWN = ['...k...', '.kk.kk.', 'k.....k']

// The Turkish flag's star, 5 px wide
export const STAR = ['..#..', '#####', '.###.', '.#.#.']
