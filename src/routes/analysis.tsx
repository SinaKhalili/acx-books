import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { reviewUrl } from '../data/reviews'
import {
  rankVsAi,
  rubricVsTournament,
  sonnetVsOpus,
  strength,
} from '../data/analysis'

export const Route = createFileRoute('/analysis')({
  component: Analysis,
  head: () => ({
    meta: [
      { title: 'Rank correlations — ACX Book Review Contest' },
      {
        name: 'description',
        content:
          "Two reader-requested analyses: Spearman rank correlations between the rubric, the tournament, the two model passes, and Pangram's AI-writing estimate.",
      },
    ],
  }),
})

function fmt(rho: number) {
  const s = rho.toFixed(2)
  return rho > 0 ? `+${s}` : s
}

/** A compact SVG scatter with an optional y = x reference line. */
function Scatter({
  points,
  domainX,
  domainY,
  labelX,
  labelY,
  invertY = false,
  diagonal = false,
}: {
  points: { x: number; y: number; title: string }[]
  domainX: [number, number]
  domainY: [number, number]
  labelX: string
  labelY: string
  invertY?: boolean
  diagonal?: boolean
}) {
  const W = 300
  const H = 300
  const pad = 34
  const [x0, x1] = domainX
  const [y0, y1] = domainY
  const sx = (x: number) => pad + ((x - x0) / (x1 - x0)) * (W - pad - 10)
  const sy = (y: number) => {
    const t = (y - y0) / (y1 - y0)
    return pad + (invertY ? 1 - t : t) * (H - pad - pad)
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-4 w-full"
      role="img"
      aria-label={`${labelX} versus ${labelY} scatter plot`}
    >
      {/* frame */}
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--line)" />
      <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} stroke="var(--line)" />
      {diagonal && (
        <line
          x1={sx(x0)}
          y1={sy(y0)}
          x2={sx(x1)}
          y2={sy(y1)}
          stroke="var(--line)"
          strokeDasharray="4 4"
        />
      )}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={sx(p.x)}
          cy={sy(p.y)}
          r={4}
          className="fill-[var(--claret)]"
          opacity={0.6}
        >
          <title>{p.title}</title>
        </circle>
      ))}
      <text
        x={(W + pad) / 2}
        y={H - 6}
        textAnchor="middle"
        className="fill-[var(--ink-faint)]"
        fontSize="11"
      >
        {labelX}
      </text>
      <text
        x={-H / 2}
        y={12}
        textAnchor="middle"
        transform="rotate(-90)"
        className="fill-[var(--ink-faint)]"
        fontSize="11"
      >
        {labelY}
      </text>
    </svg>
  )
}

function RhoStat({ rho, n }: { rho: number; n: number }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="score-figure text-5xl font-semibold text-[var(--claret)] tabular-nums">
        {fmt(rho)}
      </span>
      <span className="text-sm text-[var(--ink-soft)]">
        Spearman ρ · {strength(rho)}
        <br />
        <span className="text-[var(--ink-faint)]">n = {n}</span>
      </span>
    </div>
  )
}

function CorrelationCard({
  kicker,
  title,
  children,
  rho,
  n,
  scatter,
}: {
  kicker: string
  title: string
  children: React.ReactNode
  rho: number
  n: number
  scatter: React.ReactNode
}) {
  return (
    <div className="island-shell rounded-2xl p-6 sm:p-7">
      <p className="kicker mb-2">{kicker}</p>
      <h3 className="display-title text-xl leading-snug font-semibold text-[var(--ink)]">
        {title}
      </h3>
      <div className="mt-5">
        <RhoStat rho={rho} n={n} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
        {children}
      </p>
      {scatter}
    </div>
  )
}

function Analysis() {
  const notable = rankVsAi.flagged.find((f) => f.fractionAi >= 1)
  return (
    <main className="page-wrap px-1 pb-16 pt-12 sm:pt-16">
      <section className="text-center">
        <p className="kicker mb-4">Astral Codex Ten · 2026 · Reader questions</p>
        <h1 className="display-title mx-auto max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
          Two rank correlations
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          A reader asked two good questions: how well do our different rankings
          actually agree, and does a review's AI-writing estimate predict where it
          lands? Spearman's rank correlation — the ρ that runs from −1 to +1 — is
          tailor-made for both.
        </p>
      </section>

      {/* (1) Agreement between rankings */}
      <section className="mt-14">
        <p className="kicker mb-2">Question one</p>
        <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
          Do the rankings agree?
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          The same reviews get ordered three ways: the five-part rubric scores
          every entry alone, a comparative head-to-head tournament re-ranked the
          top&nbsp;50, and two model passes (Sonnet, then an Opus re-judge) each
          scored the overlap. Spearman ρ says how much any two of those orderings
          move together — 1 is identical, 0 is unrelated.
        </p>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <CorrelationCard
            kicker="Rubric vs. tournament"
            title="Absolute scores vs. head-to-head judging"
            rho={rubricVsTournament.rho}
            n={rubricVsTournament.n}
            scatter={
              <Scatter
                points={rubricVsTournament.points.map((p) => ({
                  x: p.rubricRank,
                  y: p.tourneyRank,
                  title: `${p.title} — rubric #${p.rubricRank}, tournament #${p.tourneyRank}`,
                }))}
                domainX={[1, rubricVsTournament.n]}
                domainY={[1, rubricVsTournament.n]}
                labelX="Rubric rank (top 50)"
                labelY="Tournament rank"
                diagonal
              />
            }
          >
            A {strength(rubricVsTournament.rho)} correlation. Scoring reviews in
            isolation and pitting them against each other produce related but
            genuinely different orders — the comparative judging reshuffled a lot,
            which is exactly why the winner wasn't the rubric's&nbsp;#1.
          </CorrelationCard>

          <CorrelationCard
            kicker="Sonnet vs. Opus"
            title="Two model passes on the same reviews"
            rho={sonnetVsOpus.rho}
            n={sonnetVsOpus.n}
            scatter={
              <Scatter
                points={sonnetVsOpus.points.map((p) => ({
                  x: p.sonnet,
                  y: p.opus,
                  title: `${p.title} — Sonnet ${p.sonnet.toFixed(1)}, Opus ${p.opus.toFixed(1)}`,
                }))}
                domainX={[3, 9]}
                domainY={[3, 9]}
                labelX="Sonnet weighted score"
                labelY="Opus weighted score"
                diagonal
              />
            }
          >
            Also {strength(sonnetVsOpus.rho)}. Even the same rubric read by two
            models only agrees this much — a useful reminder of how much noise sits
            under any single ranking. (Only the top entries were re-judged, so the
            restricted range damps the number somewhat.)
          </CorrelationCard>
        </div>
      </section>

      {/* (2) Rank vs Pangram %AI */}
      <section className="mt-16">
        <p className="kicker mb-2">Question two</p>
        <h2 className="display-title text-3xl font-semibold text-[var(--ink)]">
          Does AI-written text rank higher?
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          <a href="https://www.pangram.com/" target="_blank" rel="noreferrer">
            Pangram
          </a>{' '}
          estimated what fraction of each review reads as AI-generated. Correlating
          that against the rubric rank asks whether AI writing helped or hurt.
        </p>

        <div className="island-shell mt-7 rounded-2xl p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <RhoStat rho={rankVsAi.rho} n={rankVsAi.n} />
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              Effectively zero — a {strength(rankVsAi.rho)} relationship. The
              catch, and the more interesting finding, is that{' '}
              <strong className="text-[var(--ink)]">
                {rankVsAi.fullyHuman} of {rankVsAi.n}
              </strong>{' '}
              reviews read as fully human, so there's barely any AI signal to
              correlate with.{' '}
              {notable && (
                <>
                  And where there is: a review Pangram calls 100% AI-generated,{' '}
                  <em>{notable.title}</em>, still ranked{' '}
                  <strong className="text-[var(--ink)]">#{notable.rank}</strong>.
                </>
              )}
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <p className="kicker mb-3">
              The {rankVsAi.flagged.length} entries Pangram flagged with any AI
              writing
            </p>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-[var(--ink-faint)]">
                  <th className="py-2 pr-3 font-medium">Rank</th>
                  <th className="py-2 pr-3 font-medium">Review</th>
                  <th className="py-2 pr-3 font-medium">Pangram</th>
                  <th className="py-2 pr-3 text-right font-medium">% AI</th>
                </tr>
              </thead>
              <tbody>
                {rankVsAi.flagged.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-[var(--line-soft)] align-baseline"
                  >
                    <td className="score-figure py-2 pr-3 font-semibold text-[var(--claret)] tabular-nums">
                      {f.rank}
                    </td>
                    <td className="py-2 pr-3">
                      <a
                        href={reviewUrl(f.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--ink)] no-underline hover:text-[var(--claret)]"
                      >
                        {f.title}
                        <ExternalLink size={12} className="text-[var(--ink-faint)]" />
                      </a>
                    </td>
                    <td className="py-2 pr-3 text-[var(--ink-soft)]">
                      {f.prediction}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--ink-soft)]">
                      {Math.round(f.fractionAi * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="island-shell mt-16 rounded-2xl p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
        <p className="kicker mb-2">On method</p>
        Spearman ρ correlates the <em>ranks</em> rather than the raw values, so
        it's robust to the scores' uneven spacing and reports monotonic agreement
        rather than a straight-line fit. Ties are handled with average ranks.
      </div>

      <p className="mt-10 text-center">
        <Link to="/" className="no-underline">
          ← Back to the standings
        </Link>
      </p>
    </main>
  )
}
