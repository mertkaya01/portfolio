import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { profile } from '@/data/profile'
import { initials } from '@/lib/format'

const { volleyball, sport, gaming } = profile

// LED-style scoreboard digits: always two characters, like "09"
const pad = (value: string | number) => String(value).padStart(2, '0')

const STATS = [
  { label: 'Medals', value: pad(sport.medals) },
  { label: 'Seasons', value: pad(volleyball.years) },
  { label: 'Since', value: volleyball.startedIn },
  { label: 'Position', value: initials(volleyball.position) },
]

export function SportSection() {
  return (
    <Section
      id="sport"
      index="05"
      kicker="Beyond the court"
      title="Sport"
      intro={`${sport.medals} medals in total — from inter-school tournaments, orienteering and athletics to math competitions.`}
    >
      <Reveal>
        {/* gap-px over a light background draws the thin lines between the cells */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-light/15 bg-light/10 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-night p-6 sm:p-8">
              <dt className="font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
                {stat.label}
              </dt>
              <dd className="mt-3 font-mono text-5xl font-bold text-accent tabular-nums [text-shadow:0_0_18px_rgb(255_210_63/0.45)] sm:text-6xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sport.highlights.map((highlight, i) => (
          <li key={highlight}>
            <Reveal delay={i * 110} className="h-full">
              <div className="h-full border-t border-wood/40 pt-5">
                <span className="font-mono text-xs text-wood">{pad(i + 1)}</span>
                <p className="mt-3 text-lg leading-relaxed text-light/85">{highlight}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* Off the court: a small line, not a headline */}
      <Reveal delay={200}>
        <p className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-light/10 pt-6 text-sm text-muted">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">Off the court</span>
          <span className="text-light/80">
            {gaming.game} · {gaming.platform} Level {gaming.level}
          </span>
          <ButtonLink href={gaming.profileUrl} variant="link">
            {gaming.platform} profile
          </ButtonLink>
        </p>
      </Reveal>
    </Section>
  )
}
