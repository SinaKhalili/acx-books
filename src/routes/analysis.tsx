import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { reviewUrl } from '../data/reviews'
import { rankVsAi, strength } from '../data/analysis'

export const Route = createFileRoute('/analysis')({
  component: Analysis,
  head: () => ({
    meta: [
      { title: 'Does AI-written text rank higher? — ACX Book Review Contest' },
      {
        name: 'description',
        content:
          "A reader-requested analysis: the Spearman rank correlation between a review's rubric rank and Pangram's estimate of how AI-generated it is.",
      },
    ],
  }),
})

function fmt(rho: number) {
  const s = rho.toFixed(2)
  return rho > 0 ? `+${s}` : s
}

/** Scatter of every scored review: rubric rank (x) against Pangram %AI (y). */
function AiScatter() {
  const W = 640
  const H = 300
  const padL = 40
  const padB = 34
  const padT = 12
  const padR = 12
  const n = rankVsAi.n
  const sx = (rank: number) =>
    padL + ((rank - 1) / (n - 1)) * (W - padL - padR)
  const sy = (frac: number) => padT + (1 - frac) * (H - padT - padB)
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-6 w-full"
      role="img"
      aria-label="Rubric rank versus Pangram percent-AI scatter plot"
    >
      {/* gridlines at 0 / 50 / 100% */}
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line
            x1={padL}
            y1={sy(f)}
            x2={W - padR}
            y2={sy(f)}
            stroke="var(--line-soft)"
          />
          <text
            x={padL - 6}
            y={sy(f) + 3}
            textAnchor="end"
            className="fill-[var(--ink-faint)]"
            fontSize="10"
          >
            {Math.round(f * 100)}%
          </text>
        </g>
      ))}
      {/* points: fully-human ones muted along the baseline, AI-flagged in claret */}
      {rankVsAi.points.map((p) => {
        const flagged = p.fractionAi > 0
        return (
          <circle
            key={p.id}
            cx={sx(p.rank)}
            cy={sy(p.fractionAi)}
            r={flagged ? 4.5 : 3}
            className={flagged ? 'fill-[var(--claret)]' : 'fill-[var(--ink-faint)]'}
            opacity={flagged ? 0.85 : 0.35}
          >
            <title>{`${p.title} — rank #${p.rank}, ${Math.round(
              p.fractionAi * 100,
            )}% AI`}</title>
          </circle>
        )
      })}
      <text
        x={(W + padL) / 2}
        y={H - 4}
        textAnchor="middle"
        className="fill-[var(--ink-faint)]"
        fontSize="11"
      >
        Rubric rank (1 = best → {n})
      </text>
    </svg>
  )
}

function Analysis() {
  const notable = rankVsAi.flagged.find((f) => f.fractionAi >= 1)
  return (
    <main className="page-wrap px-1 pb-16 pt-12 sm:pt-16">
      <section className="text-center">
        <p className="kicker mb-4">Astral Codex Ten · 2026 · Reader question</p>
        <h1 className="display-title mx-auto max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight text-[var(--ink)] sm:text-6xl">
          Does AI-written text rank higher?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
          A reader asked for the Spearman rank correlation between a review's
          standing and how AI-generated it looks — the ρ that runs from −1 to +1
          is tailor-made for exactly this.{' '}
          <a href="https://www.pangram.com/" target="_blank" rel="noreferrer">
            Pangram
          </a>{' '}
          estimated the AI fraction of every entry; here it is against the rubric
          rank.
        </p>
      </section>

      <div className="island-shell mt-12 rounded-2xl p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-baseline gap-3">
            <span className="score-figure text-6xl font-semibold text-[var(--claret)] tabular-nums">
              {fmt(rankVsAi.rho)}
            </span>
            <span className="text-sm text-[var(--ink-soft)]">
              Spearman ρ · {strength(rankVsAi.rho)}
              <br />
              <span className="text-[var(--ink-faint)]">n = {rankVsAi.n}</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
            Effectively zero — a {strength(rankVsAi.rho)} relationship. AI-written
            prose neither helped nor hurt. The catch, and the more interesting
            finding, is that{' '}
            <strong className="text-[var(--ink)]">
              {rankVsAi.fullyHuman} of {rankVsAi.n}
            </strong>{' '}
            reviews read as fully human, so there's barely any AI signal to
            correlate with in the first place.{' '}
            {notable && (
              <>
                And where there is: a review Pangram calls 100% AI-generated,{' '}
                <em>{notable.title}</em>, still ranked{' '}
                <strong className="text-[var(--ink)]">#{notable.rank}</strong>.
              </>
            )}
          </p>
        </div>

        <AiScatter />
        <p className="mt-2 text-center text-xs text-[var(--ink-faint)]">
          Each dot is one review. Grey dots read as fully human; claret dots are
          the {rankVsAi.flagged.length} Pangram flagged with any AI writing —
          scattered across every part of the ranking.
        </p>
      </div>

      <section className="mt-10">
        <p className="kicker mb-3">
          The {rankVsAi.flagged.length} entries Pangram flagged with any AI writing
        </p>
        <div className="island-shell overflow-x-auto rounded-2xl p-6 sm:p-7">
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
      </section>

      <div className="island-shell mt-12 rounded-2xl p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
        <p className="kicker mb-2">On method</p>
        Spearman ρ correlates the <em>ranks</em> rather than the raw values, so
        it's robust to the scores' uneven spacing and reports monotonic agreement
        rather than a straight-line fit. Ties (here, the wall of 0% entries) are
        handled with average ranks.
      </div>

      <p className="mt-10 text-center">
        <Link to="/" className="no-underline">
          ← Back to the standings
        </Link>
      </p>
    </main>
  )
}
