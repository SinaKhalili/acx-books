import { scoredReviews } from './reviews'

/** Average-rank (tie-corrected) ranks for a list of values. */
function averageRanks(vals: number[]): number[] {
  const order = vals
    .map((v, i) => [v, i] as const)
    .sort((a, b) => a[0] - b[0])
  const ranks = new Array<number>(vals.length)
  let i = 0
  while (i < order.length) {
    let j = i
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++
    const avg = (i + j) / 2 + 1 // ranks are 1-based
    for (let k = i; k <= j; k++) ranks[order[k][1]] = avg
    i = j + 1
  }
  return ranks
}

/** Spearman's rank correlation coefficient (handles ties via average ranks). */
export function spearman(pairs: [number, number][]): number {
  const n = pairs.length
  if (n < 2) return 0
  const rx = averageRanks(pairs.map((p) => p[0]))
  const ry = averageRanks(pairs.map((p) => p[1]))
  const mx = rx.reduce((s, v) => s + v, 0) / n
  const my = ry.reduce((s, v) => s + v, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my)
    dx += (rx[i] - mx) ** 2
    dy += (ry[i] - my) ** 2
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0
}

/** Plain-language gloss for a correlation magnitude. */
export function strength(rho: number): string {
  const a = Math.abs(rho)
  if (a >= 0.7) return 'strong'
  if (a >= 0.4) return 'moderate'
  if (a >= 0.2) return 'weak'
  return 'negligible'
}

/** Canonical rubric rank (1 = best) by review id. */
export const rubricRank = new Map(scoredReviews.map((r, i) => [r.id, i + 1]))

// ── Rank vs. Pangram's AI estimate ─────────────────────────────────────────

export const rankVsAi = (() => {
  const points = scoredReviews
    .filter((r) => r.pangram)
    .map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      rank: rubricRank.get(r.id)!,
      score: r.weighted!,
      fractionAi: r.pangram!.fractionAi,
      prediction: r.pangram!.prediction,
    }))
  // Spearman on (rank, %AI). Report the score-vs-AI sign so "positive = AI ranks
  // higher" reads intuitively — it's just the negation of the rank-vs-AI value.
  const rhoRank = spearman(points.map((p) => [p.rank, p.fractionAi]))
  const rho = -rhoRank
  const flagged = points
    .filter((p) => p.fractionAi > 0)
    .sort((a, b) => b.fractionAi - a.fractionAi)
  const fullyHuman = points.length - flagged.length
  return { rho, n: points.length, points, flagged, fullyHuman }
})()
