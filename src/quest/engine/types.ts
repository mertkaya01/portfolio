// What every set's art receives. The art can follow the story: `beat` is the line being shown
// (0-based), `beats` how many lines the set has — e.g. the pixel ball can move on each line.
export type ArtProps = { beat: number; beats: number }

// How a set's art is shown: in a panel next to the text, or across the whole stage
export type SetLayout = 'panel' | 'fullscreen'
