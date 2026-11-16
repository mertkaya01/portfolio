// The quest (the five sets) is on — on the live site too. A switch is kept, should it ever need
// to come off: build with VITE_QUEST=off (e.g. an environment variable on Render).
// Off means: no Start button, no Enter shortcut, no "Replay the quest" — and its code is never loaded.
export const QUEST_ENABLED = import.meta.env.DEV || import.meta.env.VITE_QUEST !== 'off'
