// The quest's shared colours. Five art styles, one set of inks: every set takes its key colours
// from here, so the pixel art, the pencil, the terminal, the flat vectors and the 3D arena read
// as one story that levels up — not five demos. (The site's own tokens are in index.css; the
// night and the accent are the same values.)
export const QUEST = {
  night: '#0a0b0d', // the stage around the pictures (the site's --color-night)
  ink: '#1b1f2a', // lines and text on light grounds (pencil, flat vectors)
  paper: '#f1ead8', // light grounds: the sketchbook, a scoreboard's face
  accent: '#ffd23f', // the one warm accent: the ball, the stars, the highlighter, the LEDs
  team: '#2f5aa8', // Mert's team: the jersey, the court surround
  wood: '#c98b52', // the parquet, warm light (the site's --color-wood)
} as const
