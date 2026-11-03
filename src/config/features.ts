// The quest (the five sets) is still being built, so it stays off the live site until it's done.
// - `npm run dev`: always on, to keep working on it
// - live site: on only when the build has VITE_QUEST=on (set it in render.yaml once it's finished)
// Off means: no Start button, no Enter shortcut, no "Replay the quest" — and its code is never loaded.
export const QUEST_ENABLED = import.meta.env.DEV || import.meta.env.VITE_QUEST === 'on'
