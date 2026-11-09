import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'

import { useT } from '@/i18n'
import { useLocale } from '@/i18n/locale'

import { setArtWidth } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'

import { COLORS } from './colors'
import {
  CourtScene,
  GraduationScene,
  InternshipScene,
  LookingScene,
  ScoreboardScene,
} from './scenes'

// Set 5's art: the tie-break, in 3D — a low-poly arena at night (three.js through React Three
// Fiber). This file and three.js load only when Set 5 is near, so they never slow down the
// first visit. One 3D scene per step: the scoreboard on the big screen, then the scenes.
function prefersCalm() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export default function TieBreakArt({ chapter, scene }: ArtProps) {
  const t = useT()
  const locale = useLocale((s) => s.locale)
  const boxRef = useRef<HTMLDivElement>(null)
  const [calm] = useState(prefersCalm)

  // the 3D view fills its whole frame; the caption lines up with it
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const fit = () => setArtWidth(box, box.clientWidth)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  const id = scene < 0 ? 'scoreboard' : (chapter.scenes[scene]?.id ?? 'court')
  const board = {
    set: String(chapter.set),
    title: chapter.title.toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-US'),
    period: chapter.period,
  }
  const label =
    scene < 0
      ? t.quest.arenaScoreboard(chapter.set, chapter.title, chapter.period)
      : `${t.quest.art.label} · ${t.quest.art.shot(scene + 1, chapter.scenes.length)}`

  return (
    <div ref={boxRef} role="img" aria-label={label} className="size-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 9, 20], fov: 45, near: 0.1, far: 100 }}
        frameloop={calm ? 'demand' : 'always'}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[COLORS.night]} />
        <fog attach="fog" args={[COLORS.night, 18, 42]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 12, 8]} intensity={1.1} />
        {id === 'scoreboard' ? (
          <ScoreboardScene key={id} board={board} calm={calm} />
        ) : id === 'graduated' ? (
          <GraduationScene key={id} calm={calm} />
        ) : id === 'internship' ? (
          <InternshipScene key={id} calm={calm} />
        ) : id === 'looking' ? (
          <LookingScene key={id} calm={calm} />
        ) : (
          <CourtScene key={id} calm={calm} />
        )}
      </Canvas>
    </div>
  )
}
