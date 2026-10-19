import type { ArtProps } from '../../engine/types'
import { ArtPlaceholder } from '../ArtPlaceholder'

// The art of this set. A placeholder for now; the real scene arrives in M10.
// Default export: the registry loads this file on its own, only when it is needed.
export default function UniversityArt(props: ArtProps) {
  return (
    <ArtPlaceholder
      {...props}
      style="ASCII · terminal"
      idea="The world redrawn in characters — code takes over."
      milestone="M10"
    />
  )
}
