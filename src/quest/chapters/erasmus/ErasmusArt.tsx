import type { ArtProps } from '../../engine/types'
import { ArtPlaceholder } from '../ArtPlaceholder'

// The art of this set. A placeholder for now; the real scene arrives in M11.
// Default export: the registry loads this file on its own, only when it is needed.
export default function ErasmusArt(props: ArtProps) {
  return (
    <ArtPlaceholder
      {...props}
      style="Modern vector"
      idea="Istanbul → Brandenburg in clean lines and flat color."
      milestone="M11"
    />
  )
}
