import { useEffect, useState, type RefObject } from 'react'

// A full-screen set's art tells the stage how wide its picture is on screen, so the caption
// under it lines up with the picture's left edge (SetScene reads --art-w).
export function setArtWidth(inside: Element, width: number) {
  inside.closest<HTMLElement>('[data-art-frame]')?.style.setProperty('--art-w', `${width}px`)
}

const PHONE_BELOW = 640 // px

// For vector art in a 16:9 box (Sets 2 and 3): on wide boxes the whole picture fits and the
// caption lines up with it; on phones (narrow boxes) the picture is shown bigger, cropped to its
// middle — the same part Set 1 keeps (x 70–249 of 320). Returns true on phones: use it for the
// SVG's preserveAspectRatio ('slice' vs 'meet').
export function useFit16x9(box: RefObject<HTMLElement | null>) {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => {
      const narrow = el.clientWidth < PHONE_BELOW
      setPhone(narrow)
      setArtWidth(
        el,
        narrow ? el.clientWidth : Math.min(el.clientWidth, (el.clientHeight * 16) / 9),
      )
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [box])
  return phone
}
