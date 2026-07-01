import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { ChevronDown, ExternalLink, Search } from 'lucide-react'
import {
  CRITERIA,
  distribution,
  JUDGE_LABEL,
  reviews,
  reviewUrl,
  scoredReviews,
  stats,
  type Judge,
  type ReviewEntry,
} from '../data/reviews'

export const Route = createFileRoute('/')({ component: Leaderboard })

type SortKey = 'score' | 'title' | 'length'

const ordinal = (r: ReviewEntry) =>
  scoredReviews.findIndex((x) => x.id === r.id) + 1

function medalClass(rank: number) {
  if (rank === 1) return 'medal-gold'
  if (rank === 2) return 'medal-silver'
  if (rank === 3) return 'medal-bronze'
  return ''
}

function JudgeBadge({ judge }: { judge: Judge | null }) {
  if (judge !== 'opus') return null
  return (
    <span
      className="shrink-0 rounded-full border border-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide text-[var(--gold)] uppercase"
      title="Re-judged by Claude Opus 4.8"
    >
      {JUDGE_LABEL.opus}
    </span>
  )
}

function median(nums: number[]) {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function FieldHistogram() {
  const { bins, max } = distribution()
  const med = median(scoredReviews.map((r) => r.weighted ?? 0))
  return (
    <div className="island-shell mt-10 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker mb-2">The field at a glance</p>
          <p className="max-w-md text-[var(--ink-soft)]">
            162 entries scored. Median{' '}
            <strong className="text-[var(--ink)]">{med.toFixed(1)}</strong>, mean{' '}
            <strong className="text-[var(--ink)]">{stats().avg.toFixed(1)}</strong>.
            The top {stats().opusJudged} were re-judged by Opus 4.8.
          </p>
        </div>
        <div className="flex items-end gap-2 sm:gap-3" aria-hidden="true">
          {bins.map((b) => (
            <div key={b.bucket} className="flex flex-col items-center gap-1.5">
              <span className="font-display text-xs font-semibold text-[var(--ink-soft)] tabular-nums">
                {b.count}
              </span>
              <div
                className="w-7 rounded-t-md bg-[var(--claret)] sm:w-9"
                style={{ height: `${18 + (b.count / (max || 1)) * 92}px` }}
              />
              <span className="font-display text-xs text-[var(--ink-faint)] tabular-nums">
                {b.bucket}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CriteriaSpark({ r }: { r: ReviewEntry }) {
  if (!r.scores) return null
  const vals = CRITERIA.map((c) => r.scores![c.key])
  return (
    <div
      className="flex items-end gap-[3px]"
      title="insight · voice · originality · fairness · structure"
    >
      {vals.map((v, i) => (
        <span
          key={i}
          className="w-[5px] rounded-sm bg-[var(--claret)] opacity-75"
          style={{ height: `${4 + v * 2.2}px` }}
        />
      ))}
    </div>
  )
}

const VERDICT_LIMIT = 400

function Verdict({ text }: { text: string }) {
  const [full, setFull] = useState(false)
  const long = text.length > VERDICT_LIMIT
  let shown = text
  if (long && !full) {
    shown = text.slice(0, VERDICT_LIMIT)
    const lastSpace = shown.lastIndexOf(' ')
    if (lastSpace > 0) shown = shown.slice(0, lastSpace)
    shown = shown.replace(/[,;:.\s]+$/, '') + '…'
  }
  return (
    <p className="leading-relaxed text-[var(--ink-soft)]">
      {shown}{' '}
      {long && (
        <button
          onClick={() => setFull((v) => !v)}
          className="font-semibold text-[var(--claret)] hover:underline"
        >
          {full ? 'Show less' : 'Show more'}
        </button>
      )}
    </p>
  )
}

function RowDetail({ r }: { r: ReviewEntry }) {
  if (!r.scores) return null
  const other = r.judge === 'opus' ? r.sonnet : null
  return (
    <div className="border-t border-[var(--line-soft)] px-4 pt-4 pb-4 sm:px-5">
      <div className="grid gap-6 sm:grid-cols-[1fr_minmax(220px,300px)]">
        <div className="space-y-3 text-sm">
          {r.verdict && <Verdict text={r.verdict} />}
          {r.strongest && (
            <p className="leading-relaxed">
              <span className="kicker mr-2 text-[var(--gold)]">Strongest</span>
              <span className="text-[var(--ink-soft)]">{r.strongest}</span>
            </p>
          )}
          {r.weakest && (
            <p className="leading-relaxed">
              <span className="kicker mr-2">Weakest</span>
              <span className="text-[var(--ink-soft)]">{r.weakest}</span>
            </p>
          )}
          {other && (
            <p className="text-xs text-[var(--ink-faint)]">
              Sonnet's first pass scored this{' '}
              <strong className="text-[var(--ink-soft)]">
                {other.weighted.toFixed(1)}
              </strong>
              .
            </p>
          )}
          <a
            href={reviewUrl(r.slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold no-underline"
          >
            Read the full review <ExternalLink size={14} />
          </a>
        </div>

        <div className="space-y-2.5">
          {CRITERIA.map((c) => {
            const v = r.scores![c.key]
            return (
              <div key={c.key} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-[var(--ink-soft)]">
                  {c.label}
                </span>
                <div className="score-bar-track flex-1">
                  <div className="score-bar-fill" style={{ width: `${v * 10}%` }} />
                </div>
                <span className="font-display w-6 shrink-0 text-right text-sm font-semibold text-[var(--ink)] tabular-nums">
                  {v}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Leaderboard() {
  const s = stats()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('score')
  const [hideTraps, setHideTraps] = useState(false)
  const [opusOnly, setOpusOnly] = useState(false)
  // expanded by default — track which rows the user has collapsed
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const rows = useMemo(() => {
    let list = reviews.slice()
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((r) => r.title.toLowerCase().includes(q))
    }
    if (hideTraps) list = list.filter((r) => r.summaryTrap !== true)
    if (opusOnly) list = list.filter((r) => r.judge === 'opus')
    list.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      if (sort === 'length') return b.wordCount - a.wordCount
      return (b.weighted ?? -1) - (a.weighted ?? -1)
    })
    return list
  }, [query, sort, hideTraps, opusOnly])

  return (
    <main className="page-wrap px-1 pb-10 pt-12 sm:pt-16">
      <section className="text-center">
        <p className="kicker mb-4">Astral Codex Ten · 2026</p>
        <h1 className="display-title mx-auto max-w-4xl text-5xl leading-[1.02] font-semibold tracking-tight text-[var(--ink)] sm:text-7xl">
          ACX Book Review Contest
        </h1>
        <p className="display-title mt-3 text-xl font-medium text-[var(--claret)] sm:text-2xl">
          Judged by Claude Opus 4.8
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          All 162 entries in this year's contest, each scored against a five-part
          rubric. Click any title to read the review in full on the ACX Review
          Archive.
        </p>
        <div className="mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-[var(--ink-soft)]">
          <span>
            <strong className="text-[var(--ink)]">{s.total}</strong> entries
          </span>
          <span className="hidden text-[var(--line)] sm:inline">·</span>
          <span>
            <strong className="text-[var(--ink)]">{s.avg.toFixed(1)}</strong> mean
          </span>
          <span className="hidden text-[var(--line)] sm:inline">·</span>
          <span>
            top <strong className="text-[var(--ink)]">{s.opusJudged}</strong> re-judged
            by <strong className="text-[var(--ink)]">Opus 4.8</strong>
          </span>
        </div>
      </section>

      <FieldHistogram />

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="display-title text-2xl font-semibold text-[var(--ink)]">
            Full standings
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="field flex items-center gap-2 px-3.5 py-2">
              <Search size={15} className="text-[var(--ink-faint)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles…"
                className="w-40 bg-transparent text-sm outline-none sm:w-52"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="field cursor-pointer px-3.5 py-2 text-sm outline-none"
            >
              <option value="score">Sort: Score</option>
              <option value="title">Sort: Title (A–Z)</option>
              <option value="length">Sort: Length</option>
            </select>
            <button
              onClick={() => setOpusOnly((v) => !v)}
              className={`rounded-full border px-3.5 py-2 text-sm transition ${
                opusOnly
                  ? 'border-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] text-[var(--gold)]'
                  : 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink-soft)] hover:border-[var(--chip-line)]'
              }`}
            >
              Opus-judged
            </button>
            <button
              onClick={() => setHideTraps((v) => !v)}
              className={`rounded-full border px-3.5 py-2 text-sm transition ${
                hideTraps
                  ? 'border-[var(--chip-line)] bg-[var(--accent-wash)] text-[var(--claret)]'
                  : 'border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink-soft)] hover:border-[var(--chip-line)]'
              }`}
              title="Hide entries flagged as mostly summary"
            >
              Hide summary-traps
            </button>
          </div>
        </div>

        <p className="mt-2 text-sm text-[var(--ink-faint)]">
          {rows.length} {rows.length === 1 ? 'entry' : 'entries'} shown
        </p>

        <ol className="mt-4 space-y-2">
          {rows.map((r) => {
            const rank = r.weighted != null ? ordinal(r) : null
            const isOpen = !collapsed.has(r.id)
            return (
              <li key={r.id} className="island-shell rank-row overflow-hidden rounded-xl">
                <div className="flex items-center gap-4 px-4 py-3.5 sm:gap-5 sm:px-5">
                  <span
                    className={`rank-medal w-9 shrink-0 text-right text-lg font-semibold tabular-nums sm:w-11 sm:text-xl ${
                      rank ? medalClass(rank) : 'text-[var(--ink-faint)]'
                    }`}
                  >
                    {rank ?? '—'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={reviewUrl(r.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="display-title truncate text-base font-medium text-[var(--ink)] no-underline hover:text-[var(--claret)] sm:text-lg"
                        title="Read the full review"
                      >
                        {r.title}
                      </a>
                      <JudgeBadge judge={r.judge} />
                    </div>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--ink-faint)]">
                      <span>{r.wordCount.toLocaleString()} words</span>
                      {r.summaryTrap && (
                        <>
                          <span>·</span>
                          <span className="text-[var(--bronze)]">summary-trap</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <CriteriaSpark r={r} />
                  </div>
                  <span
                    className={`score-figure w-14 shrink-0 text-right text-2xl font-semibold sm:text-3xl ${
                      rank && rank <= 3 ? medalClass(rank) : 'text-[var(--claret)]'
                    }`}
                  >
                    {r.weighted != null ? r.weighted.toFixed(1) : '·'}
                  </span>
                  <button
                    onClick={() => toggle(r.id)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Collapse details' : 'Expand details'}
                    className="-mr-1 shrink-0 rounded-lg p-1 text-[var(--ink-faint)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--ink)]"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
                {isOpen && <RowDetail r={r} />}
              </li>
            )
          })}
        </ol>
      </section>
    </main>
  )
}
