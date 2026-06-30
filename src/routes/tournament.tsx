import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { reviewUrl } from '../data/reviews'
import {
  champion,
  finalistDetails,
  groupTable,
  LENS_META,
  ordinalWord,
  tournament,
  type FinalistDetail,
} from '../data/tournament'

export const Route = createFileRoute('/tournament')({
  component: Tournament,
  head: () => ({
    meta: [
      { title: 'The Tournament — ACX Book Review Contest' },
      {
        name: 'description',
        content:
          'The top 50 entries, judged comparatively in a 34-agent tournament: a group stage of thirty head-to-head tables and a three-judge final.',
      },
    ],
  }),
})

const WINNER_GLOSS: Record<number, string> = {
  2021: '20,600 words that revived Georgism with running gags and Magic: the Gathering analogies.',
  2022: 'Won by fighting the famous book it reviewed — and proposing the "gossip trap" in its place.',
  2023: "A teacher's confessional carrying an original theory of why schools fail.",
  2024: '5,500 unflinching words on an obscure suicide memoir, ending on a very long walk.',
  2025: 'The non-book year: Joan of Arc, reviewed as a person.',
}

/** "Springboard thesis: the rest…" → bold lead + soft remainder. */
function LeadItem({ text }: { text: string }) {
  const i = text.indexOf(': ')
  if (i === -1)
    return <span className="text-[var(--ink-soft)]">{text}</span>
  return (
    <>
      <strong className="text-[var(--ink)]">{text.slice(0, i)}.</strong>{' '}
      <span className="text-[var(--ink-soft)]">{text.slice(i + 2)}</span>
    </>
  )
}

function ChampionPlaque() {
  const readerWhy =
    champion.whys.find((w) => w.lens === 'reader')?.why ?? champion.whys[0]?.why
  return (
    <section className="champion-plaque relative mt-10 rounded-3xl p-7 text-center sm:p-12">
      <p className="kicker text-[var(--gold)]">Unanimous champion</p>
      <h2 className="display-title mx-auto mt-4 max-w-3xl text-4xl leading-[1.04] font-bold tracking-tight text-[var(--ink)] sm:text-6xl">
        {champion.title}
      </h2>
      <p className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-[var(--ink-soft)]">
        <span>
          <strong className="text-[var(--gold)]">3 of 3</strong> first-place votes
        </span>
        <span className="hidden text-[var(--line)] sm:inline">·</span>
        <span>
          a perfect <strong className="text-[var(--gold)]">21 / 21</strong> Borda
          count
        </span>
        <span className="hidden text-[var(--line)] sm:inline">·</span>
        <span>
          seeded <strong className="text-[var(--ink)]">#3</strong> by the rubric
        </span>
      </p>
      {readerWhy && (
        <blockquote className="mx-auto mt-7 max-w-2xl text-left text-[1.05rem] leading-relaxed text-[var(--ink-soft)] italic">
          “{readerWhy}”
          <footer className="mt-2 text-right text-sm not-italic text-[var(--ink-faint)]">
            — {LENS_META.reader.label}, in the final deliberation
          </footer>
        </blockquote>
      )}
      <p className="mt-8">
        <a
          href={reviewUrl(champion.slug)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] px-6 py-2.5 font-semibold text-[var(--gold)] no-underline transition hover:bg-[color-mix(in_oklab,var(--gold)_24%,transparent)]"
        >
          Read the winning review <ExternalLink size={15} />
        </a>
      </p>
    </section>
  )
}

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: '01',
    title: 'The scouting report',
    body: 'One research agent read five years of contest history — every winner from Progress and Poverty to Joan of Arc — and distilled what actually wins into a judging brief that every judge below carried into the room.',
  },
  {
    n: '02',
    title: 'The group stage',
    body: 'Three rounds, ten tables of five per round, reshuffled each time. Thirty judges each read five full reviews and ranked them head-to-head — no rubric, just "which would you keep reading?" Placements scored 4 to 0; twelve points possible.',
  },
  {
    n: '03',
    title: 'The final',
    body: 'The top eight advanced. Three judges with deliberately different tastes — reader delight, craft, contest history — each read all eight in full and cast a strict ranking. Borda count decided the title.',
  },
]

function Method() {
  return (
    <section className="mt-14">
      <p className="kicker mb-2">How the winner was chosen</p>
      <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
        Scores rank a field. They can't pick a winner.
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        The rubric scores on the{' '}
        <Link to="/">standings page</Link> judged every entry alone, against an
        absolute standard. For the playoff, the top 50 were instead judged the way
        readers actually decide — comparatively. Raw scores played no part beyond
        seeding the field.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="island-shell rounded-2xl p-6">
            <span className="score-figure text-3xl font-semibold text-[var(--claret)] opacity-60">
              {s.n}
            </span>
            <h3 className="display-title mt-3 text-lg font-semibold text-[var(--ink)]">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              {s.body}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-[var(--ink-faint)]">
        34 agents, roughly four million tokens of reading and deliberation, one
        afternoon.
      </p>
    </section>
  )
}

function PastWinners() {
  return (
    <section className="mt-16">
      <p className="kicker mb-2">The scouting report</p>
      <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
        What wins ACX
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        Before any review was compared to another, a research agent studied the
        five past contests and the reviews that won them.
      </p>

      <div className="mt-6 space-y-0">
        {tournament.research.winners.map((w) => (
          <div
            key={w.year}
            className="flex gap-5 border-b border-[var(--line-soft)] py-3"
          >
            <span className="font-display w-12 shrink-0 pt-0.5 font-semibold text-[var(--claret)] tabular-nums">
              {w.year}
            </span>
            <div>
              <p className="m-0 font-medium text-[var(--ink)]">
                {w.title.replace(/ \(reviewed by .*\)$/, '')}
              </p>
              <p className="m-0 mt-0.5 text-sm text-[var(--ink-soft)]">
                {WINNER_GLOSS[w.year] ?? ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="island-shell rounded-2xl p-6">
          <p className="kicker mb-3 text-[var(--gold)]">What the winners do</p>
          <ul className="m-0 list-none space-y-3 p-0 text-sm leading-relaxed">
            {tournament.research.themes.map((t, i) => (
              <li key={i}>
                <LeadItem text={t} />
              </li>
            ))}
          </ul>
        </div>
        <div className="island-shell rounded-2xl p-6">
          <p className="kicker mb-3">The mortal sins</p>
          <ul className="m-0 list-none space-y-3 p-0 text-sm leading-relaxed">
            {tournament.research.antiPatterns.map((t, i) => (
              <li key={i}>
                <LeadItem text={t} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <details className="island-shell group mt-4 rounded-2xl px-6 py-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-[var(--ink)] [&::-webkit-details-marker]:hidden">
          The full judging brief, as every judge received it
          <ChevronDown
            size={18}
            className="shrink-0 text-[var(--ink-faint)] transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="article-body mt-4 [&_p]:text-[var(--ink-soft)] [&_p]:text-[0.98rem]">
          {tournament.research.brief.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>
    </section>
  )
}

function VotePips({ ranks }: { ranks: number[] }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`Group-stage placements: ${ranks.map(ordinalWord).join(', ')}`}
    >
      {ranks.map((r, i) => (
        <span
          key={i}
          className={`font-display text-xs font-semibold tabular-nums ${
            r === 1 ? 'text-[var(--gold)]' : 'text-[var(--ink-faint)]'
          }`}
        >
          {ordinalWord(r)}
        </span>
      ))}
    </span>
  )
}

function FinalistRow({ f }: { f: FinalistDetail }) {
  const [open, setOpen] = useState(f.position === 1)
  const isChampion = f.position === 1
  return (
    <li
      className={`island-shell rank-row overflow-hidden rounded-xl ${
        isChampion ? 'champion-row' : ''
      }`}
    >
      <div className="flex items-center gap-4 px-4 py-3.5 sm:gap-5 sm:px-5">
        <span
          className={`rank-medal w-8 shrink-0 text-right text-lg font-semibold tabular-nums sm:text-xl ${
            isChampion ? 'medal-gold' : 'text-[var(--ink-faint)]'
          }`}
        >
          {f.position}
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={reviewUrl(f.slug)}
            target="_blank"
            rel="noreferrer"
            className="display-title block truncate text-base font-medium text-[var(--ink)] no-underline hover:text-[var(--claret)] sm:text-lg"
            title="Read the full review"
          >
            {f.title}
          </a>
          <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[var(--ink-faint)]">
            <span>{f.groupPoints} / 12 group pts</span>
            <span>·</span>
            <VotePips ranks={f.groupRanks} />
          </p>
        </div>
        <div className="hidden w-36 shrink-0 sm:block">
          <div className="borda-track">
            <div
              className="borda-fill"
              style={{ width: `${(f.borda / 21) * 100}%` }}
            />
          </div>
        </div>
        <span
          className={`score-figure w-16 shrink-0 text-right text-xl font-semibold sm:text-2xl ${
            isChampion ? 'medal-gold' : 'text-[var(--claret)]'
          }`}
        >
          {f.borda}
          <span className="text-sm font-normal text-[var(--ink-faint)]">/21</span>
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Collapse the judges’ takes' : 'Expand the judges’ takes'}
          className="-mr-1 shrink-0 rounded-lg p-1 text-[var(--ink-faint)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--ink)]"
        >
          <ChevronDown
            size={18}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      {open && (
        <div className="space-y-4 border-t border-[var(--line-soft)] px-4 pt-4 pb-5 sm:px-5">
          {f.takes.map((t) => (
            <div key={t.lens} className="text-sm leading-relaxed">
              <p className="m-0 mb-1 flex items-baseline gap-2">
                <span className="kicker">{LENS_META[t.lens].label}</span>
                <span className="text-xs text-[var(--ink-faint)]">
                  ranked it {ordinalWord(t.rank)}
                </span>
              </p>
              <p className="m-0 text-[var(--ink-soft)]">{t.rationale}</p>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

function TheFinal() {
  return (
    <section className="mt-16">
      <p className="kicker mb-2">The final</p>
      <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
        Eight survivors, three judges, no ties allowed
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        Each judge read all eight finalists in full.{' '}
        {(['reader', 'craft', 'pattern'] as const).map((l, i) => (
          <span key={l}>
            <strong className="text-[var(--ink)]">{LENS_META[l].label}</strong>{' '}
            judged {LENS_META[l].blurb}
            {i < 2 ? '; ' : '.'}
          </span>
        ))}{' '}
        Expand a row for their verdicts.
      </p>
      <ol className="mt-6 list-none space-y-2 p-0">
        {finalistDetails.map((f) => (
          <FinalistRow key={f.id} f={f} />
        ))}
      </ol>
    </section>
  )
}

function Delta({ d }: { d: number }) {
  if (d === 0)
    return <span className="text-xs text-[var(--ink-faint)]">—</span>
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${
        d > 0 ? 'text-[var(--gold)]' : 'text-[var(--ink-faint)]'
      }`}
      title={`${Math.abs(d)} place${Math.abs(d) === 1 ? '' : 's'} ${
        d > 0 ? 'above' : 'below'
      } its rubric seeding`}
    >
      {d > 0 ? '▲' : '▽'}
      {Math.abs(d)}
    </span>
  )
}

function GroupStage() {
  const [showAll, setShowAll] = useState(false)
  const rows = showAll ? groupTable : groupTable.slice(0, 16)
  return (
    <section className="mt-16">
      <p className="kicker mb-2">The group stage</p>
      <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
        All fifty, head to head
      </h2>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        Every review was ranked at three different tables against twelve
        different opponents. The ▲▽ column shows movement against the rubric
        seeding — comparative judging reshuffled the order considerably.
      </p>
      <div className="mt-6">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 border-b border-[var(--line-soft)] py-2.5 sm:gap-4 ${
              r.isFinalist ? 'finalist-line' : ''
            }`}
          >
            <span className="rank-medal w-7 shrink-0 text-right text-sm font-semibold text-[var(--ink-faint)] tabular-nums">
              {r.position}
            </span>
            <span className="w-8 shrink-0 text-right">
              <Delta d={r.delta} />
            </span>
            <a
              href={reviewUrl(r.slug)}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate text-[0.95rem] text-[var(--ink)] no-underline hover:text-[var(--claret)]"
            >
              {r.title}
            </a>
            {r.firsts > 0 && (
              <span className="hidden shrink-0 text-xs text-[var(--gold)] sm:inline">
                {r.firsts}×1st
              </span>
            )}
            <div className="hidden w-28 shrink-0 sm:block">
              <div className="borda-track">
                <div
                  className="borda-fill is-claret"
                  style={{ width: `${(r.points / 12) * 100}%` }}
                />
              </div>
            </div>
            <span className="score-figure w-10 shrink-0 text-right text-base font-semibold text-[var(--claret)]">
              {r.points}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="rounded-full border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-2 text-sm text-[var(--ink-soft)] transition hover:border-[var(--chip-line)]"
        >
          {showAll ? 'Show fewer' : `Show all ${groupTable.length}`}
        </button>
      </p>
    </section>
  )
}

function JudgingRoom() {
  const quotes = tournament.groupStandouts
    .filter((s) => s.length > 80 && s.length < 320)
    .slice(0, 4)
  if (!quotes.length) return null
  return (
    <section className="mt-16">
      <p className="kicker mb-2">Heard at the tables</p>
      <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
        Moments the judges couldn't forget
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {quotes.map((q, i) => (
          <blockquote
            key={i}
            className="island-shell m-0 rounded-2xl p-5 text-sm leading-relaxed text-[var(--ink-soft)] italic"
          >
            {q}
          </blockquote>
        ))}
      </div>
    </section>
  )
}

function Tournament() {
  return (
    <main className="page-wrap px-1 pb-16 pt-12 sm:pt-16">
      <section className="text-center">
        <p className="kicker mb-4">Astral Codex Ten · 2026 · The playoff</p>
        <h1 className="display-title mx-auto max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
          The Tournament
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          The top 50 entries left their rubric scores behind and were judged the
          only way that matters — against each other, in full, by judges briefed
          on five years of contest history.
        </p>
      </section>

      <ChampionPlaque />
      <Method />
      <PastWinners />
      <TheFinal />
      <GroupStage />
      <JudgingRoom />

      <div className="island-shell mt-16 rounded-2xl p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
        <p className="kicker mb-2">A caveat</p>
        Thirty-four instances of Claude arguing about essays is a provocative
        artifact, not a final word. The real contest is judged by Scott and human
        readers — who are warmly invited to disagree.
      </div>

      <p className="mt-10 text-center">
        <Link to="/" className="no-underline">
          ← Back to the standings
        </Link>
      </p>
    </main>
  )
}
