import type { ArtProps } from '../../engine/types'
import { ArtPlaceholder } from '../ArtPlaceholder'

// The art of this set. A placeholder for now; the real scene arrives in M9.
// Default export: the registry loads this file on its own, only when it is needed.
export default function ExamArt(props: ArtProps) {
  return <ArtPlaceholder {...props} set="exam" milestone="M9" />
}
