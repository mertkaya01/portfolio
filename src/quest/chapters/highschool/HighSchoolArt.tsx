import type { ArtProps } from '../../engine/types'
import { ArtPlaceholder } from '../ArtPlaceholder'

// The art of this set. A placeholder for now; the real scene arrives in M8.
// Default export: the registry loads this file on its own, only when it is needed.
export default function HighSchoolArt(props: ArtProps) {
  return <ArtPlaceholder {...props} set="highschool" milestone="M8" />
}
