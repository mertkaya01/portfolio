import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { profile } from '@/data/profile'
import { initials } from '@/lib/format'
import type { SportIcon } from '@/types/content'

const { volleyball, sport, gaming, name } = profile

// Four separate statistics. Each gets a one-line note (from the same profile data), so
// "16", "9" and "2017" read as three different things — not as a date.
const STATS = [
  { label: 'Medals', value: String(sport.medals), note: 'Sports & math competitions' },
  { label: 'Seasons', value: String(volleyball.years), note: 'Competitive volleyball' },
  { label: 'Since', value: volleyball.startedIn, note: 'First season' },
  { label: 'Position', value: initials(volleyball.position), note: volleyball.position },
]

// FACEIT shows level 10 in red
const FACEIT_LEVEL_10 = '#fe1f00'

export function InterestSection() {
  return (
    <Section
      id="interest"
      index="05"
      kicker="Beyond the court"
      title="Interest"
      intro={`${sport.medals} medals in total — from inter-school tournaments, orienteering and athletics to math competitions.`}
    >
      <Reveal>
        <Scoreboard />
      </Reveal>

      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sport.highlights.map((highlight, i) => (
          <li key={highlight.label}>
            <Reveal delay={i * 90} className="h-full">
              <article className="h-full rounded-2xl border border-light/10 bg-shadow p-6 transition-colors duration-200 hover:border-wood/40">
                <span className="flex size-10 items-center justify-center rounded-full border border-wood/30 text-wood">
                  <Icon name={highlight.icon} />
                </span>
                <h3 className="mt-5 font-mono text-[0.7rem] tracking-[0.2em] text-wood uppercase">
                  {highlight.label}
                </h3>
                <p className="mt-2 leading-relaxed text-light/85">{highlight.text}</p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* Off the court: a small card, not a headline */}
      <Reveal delay={150}>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-light/10 bg-shadow px-6 py-5">
          {/* FACEIT-style level badge: the level inside a red ring */}
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full border-2 font-mono text-sm font-bold"
            style={{ borderColor: FACEIT_LEVEL_10, color: FACEIT_LEVEL_10 }}
          >
            {gaming.level}
          </span>
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">
              Off the court
            </p>
            <p className="mt-1 text-light/85">
              {gaming.game} · {gaming.platform} Level {gaming.level}
            </p>
          </div>
          <ButtonLink href={gaming.profileUrl} variant="link" className="sm:ml-auto">
            {gaming.platform} profile
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  )
}

// An arena scoreboard: a header strip, then the LED digits
function Scoreboard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-light/15 bg-black/60">
      <div className="flex items-center justify-between gap-4 border-b border-light/10 px-6 py-3 font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
        <span className="flex items-center gap-2">
          {/* two "power" lights, like on a real scoreboard */}
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent/40" />
          Scoreboard
        </span>
        <span>
          #{volleyball.jerseyNumber} · {name}
        </span>
      </div>

      {/* Each statistic is its own LED panel, with space around it: four separate numbers */}
      <dl className="grid grid-cols-2 gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-light/10 bg-night px-5 py-5 sm:px-6"
            // faint horizontal scan lines: the texture of an LED panel
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 4px)',
            }}
          >
            <dt className="font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
              {stat.label}
            </dt>
            <dd className="mt-3 font-mono text-4xl font-bold text-accent tabular-nums [text-shadow:0_0_14px_rgb(255_210_63/0.35)] sm:text-5xl">
              {stat.value}
            </dd>
            <dd className="mt-2 border-t border-light/10 pt-2 text-xs leading-snug text-light/60">
              {stat.note}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// Small line icons, drawn in code (stroke = currentColor, so they take the text color)
function Icon({ name }: { name: SportIcon }) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'size-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'volleyball':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c-2.5 3.5-2.5 8 0 9M12 12c4 .5 7.5 3 8.4 4.5M12 12c-1.8 3.6-5.6 6-8 6.4" />
        </svg>
      )
    case 'medal':
      return (
        <svg {...common}>
          <path d="M8 3l2.5 6M16 3l-2.5 6" />
          <circle cx="12" cy="15" r="6" />
          <path d="M12 12.5l.8 1.7 1.8.2-1.3 1.2.4 1.8-1.7-.9-1.7.9.4-1.8-1.3-1.2 1.8-.2z" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5z" />
        </svg>
      )
    case 'math':
      return (
        <svg {...common}>
          <path d="M17 5H7l5 7-5 7h10" />
        </svg>
      )
  }
}
