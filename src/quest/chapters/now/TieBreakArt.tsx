import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useT } from '@/i18n'

import { setArtWidth } from '../../engine/artWidth'
import type { ArtProps } from '../../engine/types'

import { COLORS } from './colors'
import { StageLights, Warmup } from './lights'
import { setupStage } from './stage'
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
  const boxRef = useRef<HTMLDivElement>(null)
  const [calm] = useState(prefersCalm)
  // nothing is drawn until the shaders are compiled (Warmup): no freeze as Set 5 comes on
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

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
    // "Tie-break" is the English word in both languages: TIE-BREAK, never the Turkish TİE-BREAK
    title: chapter.title.toLocaleUpperCase('en-US'),
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
        frameloop={!ready ? 'never' : calm ? 'demand' : 'always'}
        gl={{ antialias: true }}
        onCreated={setupStage}
      >
        <color attach="background" args={[COLORS.night]} />
        <fog attach="fog" args={[COLORS.night, 18, 42]} />
        <StageLights />
        {id === 'scoreboard' ? (
          <ScoreboardScene key={id} board={board} calm={calm} />
        ) : id === 'graduated' ? (
          <GraduationScene key={id} calm={calm} banner={t.quest.graduationBanner} />
        ) : id === 'internship' ? (
          <InternshipScene key={id} calm={calm} />
        ) : id === 'looking' ? (
          <LookingScene key={id} calm={calm} />
        ) : (
          <CourtScene key={id} calm={calm} />
        )}
        <Warmup onReady={onReady} prepare={setupStage} />
      </Canvas>
    </div>
  )
}
