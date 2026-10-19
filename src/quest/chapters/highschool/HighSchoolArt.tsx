import type { ArtProps } from '../../engine/types'
import { ArtPlaceholder } from '../ArtPlaceholder'

// The art of this set. A placeholder for now; the real scene arrives in M8.
// Default export: the registry loads this file on its own, only when it is needed.
export default function HighSchoolArt(props: ArtProps) {
  return (
    <ArtPlaceholder
      {...props}
      style="Pixel art"
      idea="A pixel court at sunset — where volleyball started."
      milestone="M8"
    />
  )
}
