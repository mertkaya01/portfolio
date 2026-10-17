import { useEffect } from 'react'

// Sets the browser tab title for the current page (and the title shown in history / bookmarks)
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
