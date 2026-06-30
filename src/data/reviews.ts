import indexData from './index.json'

export type Scores = {
  insight: number
  engagement: number
  originality: number
  fairness: number
  structure: number
}

export type ModelVerdict = {
  scores: Scores
  weighted: number
  verdict: string
  strongest: string
  weakest: string
  summaryTrap: boolean
}

export type Judge = 'opus' | 'sonnet'

export type ReviewEntry = {
  id: string
  slug: string
  title: string
  wordCount: number
  judge: Judge | null
  scores: Scores | null
  weighted: number | null
  verdict: string | null
  strongest: string | null
  weakest: string | null
  summaryTrap: boolean | null
  sonnet: ModelVerdict | null
  opus: ModelVerdict | null
  rank?: number
}

export const JUDGE_LABEL: Record<Judge, string> = {
  opus: 'Opus 4.8',
  sonnet: 'Sonnet',
}

export const reviews = indexData as ReviewEntry[]

export const byId = new Map(reviews.map((r) => [r.id, r]))

/** External link to the full review on the ACX Review Archive. */
export function reviewUrl(slug: string) {
  return `https://acxreviews.robennals.org/reviews/${slug}`
}

export const CRITERIA: { key: keyof Scores; label: string; weight: number }[] = [
  { key: 'insight', label: 'Insight & payoff', weight: 30 },
  { key: 'engagement', label: 'Engagement & voice', weight: 25 },
  { key: 'originality', label: 'Originality', weight: 15 },
  { key: 'fairness', label: 'Fairness & accuracy', weight: 15 },
  { key: 'structure', label: 'Structure & pacing', weight: 15 },
]

const contentLoaders = import.meta.glob<{ default: ReviewContent }>(
  './reviews/*.json',
)

export async function loadReviewContent(
  id: string,
): Promise<ReviewContent | null> {
  const loader = contentLoaders[`./reviews/${id}.json`]
  if (!loader) return null
  const mod = await loader()
  return mod.default
}

export const scoredReviews = reviews
  .filter((r) => r.weighted != null)
  .sort((a, b) => (b.weighted ?? 0) - (a.weighted ?? 0))

export function stats() {
  const scored = scoredReviews
  const n = scored.length
  const avg = n
    ? scored.reduce((s, r) => s + (r.weighted ?? 0), 0) / n
    : 0
  const traps = reviews.filter((r) => r.summaryTrap === true).length
  const opusJudged = reviews.filter((r) => r.judge === 'opus').length
  return {
    total: reviews.length,
    scored: n,
    avg,
    traps,
    opusJudged,
    top: scored[0] ?? null,
  }
}

/** Distribution of canonical weighted scores into integer buckets (e.g. 3..9). */
export function distribution() {
  const counts = new Map<number, number>()
  for (const r of scoredReviews) {
    const b = Math.floor(r.weighted ?? 0)
    counts.set(b, (counts.get(b) ?? 0) + 1)
  }
  const keys = [...counts.keys()]
  if (!keys.length) return { bins: [] as { bucket: number; count: number }[], max: 0 }
  const lo = Math.min(...keys)
  const hi = Math.max(...keys)
  const bins: { bucket: number; count: number }[] = []
  for (let b = lo; b <= hi; b++) bins.push({ bucket: b, count: counts.get(b) ?? 0 })
  return { bins, max: Math.max(...bins.map((x) => x.count)) }
}
