// The placeholder convention: unfinished text starts with "TODO:".
// Shared by the UI (to hide unfinished links) and scripts/check-content.ts (to list them).
// The return type says "if true, this is a string starting with TODO:". Saying just "string"
// would make TypeScript think every non-TODO value can't be a string at all.
export const isTodo = (value: unknown): value is `TODO:${string}` =>
  typeof value === 'string' && value.startsWith('TODO:')

// A link we can actually render: present and not a placeholder
export const isRealLink = (href: string | undefined): href is string => !!href && !isTodo(href)
