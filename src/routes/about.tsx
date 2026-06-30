import { createFileRoute, Link } from '@tanstack/react-router'
import { CRITERIA } from '../data/reviews'

export const Route = createFileRoute('/about')({ component: About })

const ANCHORS: [string, string][] = [
  ['9–10', 'Exceptional. The rare entry you’d expect to be a finalist or winner.'],
  ['7–8', 'Strong. Clearly above the field; shortlist-worthy.'],
  ['5–6', 'Competent. Readable, no major flaws, but undistinguished.'],
  ['3–4', 'Weak. Mostly summary, flat voice, or notable problems.'],
  ['1–2', 'Poor. Tedious, confused, inaccurate, or barely engages the book.'],
]

function About() {
  return (
    <main className="read-wrap px-1 pb-20 pt-12 sm:pt-16">
      <p className="kicker mb-3 text-center">Method</p>
      <h1 className="display-title text-center text-4xl leading-[1.04] font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
        How the scores were produced
      </h1>

      <div className="article-body mt-10 [&_p]:text-[var(--ink-soft)]">
        <p>
          This is an unofficial simulation of the Astral Codex Ten 2026 Book Review
          Contest judging. Every one of the 162 entries was handed, on its own, to
          an AI judge with no knowledge of the other entries, and scored against an
          absolute standard on a five-part rubric. The full text of each review
          lives on Rob Ennals' ACX Review Archive; this site only adds the scores.
        </p>
        <p>
          The first pass used Claude Sonnet across all 162 entries. The top 50 were
          then re-judged by the stronger Claude Opus 4.8 model, which is more
          discriminating; where an Opus score exists, it is the one shown, and the
          Sonnet score is kept alongside for comparison.
        </p>
        <p>
          The guiding principle, borrowed from Scott Alexander's own commentary: the
          best reviews are not summaries. They teach you something non-obvious,
          advance an argument, and have a distinctive voice. The most common failure
          mode — content summary with no payoff — is penalized, and entries that
          fall into it are flagged as summary-traps.
        </p>
      </div>

      <h2 className="display-title mt-12 text-2xl font-semibold text-[var(--ink)]">
        The rubric
      </h2>
      <ul className="mt-4 space-y-3">
        {CRITERIA.map((c) => (
          <li
            key={c.key}
            className="island-shell flex items-center justify-between gap-4 rounded-xl px-4 py-3"
          >
            <span className="text-[var(--ink)]">{c.label}</span>
            <span className="font-display font-semibold text-[var(--claret)]">
              {c.weight}%
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-[var(--ink-faint)]">
        The weighted total is computed deterministically from these five scores,
        rounded to one decimal place.
      </p>

      <h2 className="display-title mt-12 text-2xl font-semibold text-[var(--ink)]">
        Scale anchors
      </h2>
      <dl className="mt-4 space-y-2">
        {ANCHORS.map(([range, desc]) => (
          <div
            key={range}
            className="flex gap-4 border-b border-[var(--line-soft)] py-2.5"
          >
            <dt className="font-display w-14 shrink-0 font-semibold text-[var(--claret)]">
              {range}
            </dt>
            <dd className="m-0 text-[var(--ink-soft)]">{desc}</dd>
          </div>
        ))}
      </dl>

      <div className="island-shell mt-12 rounded-2xl p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
        <p className="kicker mb-2">A caveat</p>
        AI judgment is fallible and idiosyncratic. These scores are a provocative
        artifact, not a final word — the real contest is judged by Scott and human
        readers.
      </div>

      <p className="mt-10 text-center">
        <Link to="/" className="no-underline">
          ← Back to the standings
        </Link>
      </p>
    </main>
  )
}
