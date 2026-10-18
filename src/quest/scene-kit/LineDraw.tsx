import type { SVGProps } from 'react'

type Props = Omit<SVGProps<SVGPathElement>, 'pathLength'> & {
  d: string
  delay?: number // ms before it starts drawing
  duration?: number // ms
}

// A line that draws itself — the motif that ties all scenes together (court lines, optical
// form lines, code lines, the flight path…). Put it inside an <svg> and give it a stroke color.
//
// The trick: pathLength={1} makes the browser treat the path as exactly 1 long, whatever its
// real size. A dash of 1 followed by a gap of 1, shifted by 1, shows only the gap (nothing);
// animating the shift back to 0 slides the dash into place — the line draws from start to end.
export function LineDraw({ d, delay = 0, duration = 1000, className = '', style, ...rest }: Props) {
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray="1 1"
      strokeLinecap="round"
      className={`animate-draw-path ${className}`}
      style={{ animationDelay: `${delay}ms`, animationDuration: `${duration}ms`, ...style }}
      {...rest}
    />
  )
}
