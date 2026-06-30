import { byId } from './reviews'
import tournamentJson from './tournament.json'

export type PanelLens = 'reader' | 'craft' | 'pattern'

export type PastWinner = { year: number; title: string; note: string }

export type TournamentResearch = {
  winners: PastWinner[]
  themes: string[]
  antiPatterns: string[]
  brief: string
}

export type GroupStanding = {
  id: string
  title: string
  points: number
  firsts: number
  seed: number
}

export type Placement = { round: number; rank: number; note: string }

export type Finalist = {
  id: string
  title: string
  groupPoints: number
  borda: number
  firstVotes: number
}

export type PanelJudge = {
  lens: PanelLens
  ranking: { id: string; rank: number; rationale: string }[]
  champion: { id: string; why: string }
}

export type TournamentData = {
  research: TournamentResearch
  standings: GroupStanding[]
  placementDetails: Record<string, Placement[]>
  groupStandouts: string[]
  finalists: Finalist[]
  panel: PanelJudge[]
  champion: { id: string; title: string; borda: number; firstVotes: number }
}

export const tournament = tournamentJson as TournamentData

export const LENS_META: Record<PanelLens, { label: string; blurb: string }> = {
  reader: {
    label: 'The Reader',
    blurb: 'pure reader delight — what the ACX readership would actually vote for',
  },
  craft: {
    label: 'The Craft Critic',
    blurb: 'argument quality, structure, prose, and epistemic honesty',
  },
  pattern: {
    label: 'The Historian',
    blurb: 'the shape of past winners, with a bonus for genuine novelty',
  },
}

const slugOf = (id: string) => byId.get(id)?.slug ?? ''

export type FinalistDetail = Finalist & {
  position: number
  slug: string
  rubricScore: number | null
  takes: { lens: PanelLens; rank: number; rationale: string }[]
  groupRanks: number[]
}

export const finalistDetails: FinalistDetail[] = tournament.finalists.map(
  (f, i) => ({
    ...f,
    position: i + 1,
    slug: slugOf(f.id),
    rubricScore: byId.get(f.id)?.weighted ?? null,
    takes: tournament.panel.map((p) => {
      const entry = p.ranking.find((e) => e.id === f.id)
      return {
        lens: p.lens,
        rank: entry?.rank ?? 0,
        rationale: entry?.rationale ?? '',
      }
    }),
    groupRanks: (tournament.placementDetails[f.id] ?? [])
      .slice()
      .sort((a, b) => a.round - b.round)
      .map((p) => p.rank),
  }),
)

export type GroupRow = GroupStanding & {
  position: number
  /** Positive = climbed vs. the rubric seeding, negative = fell. */
  delta: number
  slug: string
  isFinalist: boolean
}

const finalistIds = new Set(tournament.finalists.map((f) => f.id))

export const groupTable: GroupRow[] = tournament.standings.map((s, i) => ({
  ...s,
  position: i + 1,
  delta: s.seed - i,
  slug: slugOf(s.id),
  isFinalist: finalistIds.has(s.id),
}))

export const champion = {
  ...tournament.champion,
  slug: slugOf(tournament.champion.id),
  whys: tournament.panel.map((p) => ({ lens: p.lens, why: p.champion.why })),
}

export const ordinalWord = (n: number) =>
  n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
