import os, re, json

ROOT = "/Users/sina/fun/acx-claude-books"
TXT = os.path.join(ROOT, "data/reviews_txt")
MANIFEST = os.path.join(ROOT, "data/manifest.json")
SCORES = os.path.join(ROOT, "data/scores.json")
SCORES_OPUS = os.path.join(ROOT, "data/scores_opus.json")
OUT_INDEX = os.path.join(ROOT, "src/data/index.json")

WEIGHTS = {"insight":.30,"engagement":.25,"originality":.15,"fairness":.15,"structure":.15}

manifest = json.load(open(MANIFEST))

def load_scores(path):
    out = {}
    if os.path.exists(path):
        for s in json.load(open(path)):
            out[str(s["id"]).zfill(3)] = s
    return out

sonnet_raw = load_scores(SCORES)
opus_raw = load_scores(SCORES_OPUS)

def pack(s):
    if not s:
        return None
    sc = s["scores"]
    return {
        "scores": sc,
        "weighted": round(sum(sc[k]*w for k,w in WEIGHTS.items()), 2),
        "verdict": s["verdict"],
        "strongest": s["strongest"],
        "weakest": s["weakest"],
        "summaryTrap": s["summary_trap"],
    }

index = []
for r in manifest:
    rid = r["id"]

    sonnet = pack(sonnet_raw.get(rid))
    opus = pack(opus_raw.get(rid))
    primary = opus or sonnet
    judge = "opus" if opus else ("sonnet" if sonnet else None)

    index.append({
        "id": rid,
        "slug": r["slug"],
        "title": r["title"],
        "wordCount": r["wordCount"],
        "judge": judge,
        # primary (canonical) score — Opus where re-judged, else Sonnet
        "scores": primary["scores"] if primary else None,
        "weighted": primary["weighted"] if primary else None,
        "verdict": primary["verdict"] if primary else None,
        "strongest": primary["strongest"] if primary else None,
        "weakest": primary["weakest"] if primary else None,
        "summaryTrap": primary["summaryTrap"] if primary else None,
        # both passes for comparison
        "sonnet": sonnet,
        "opus": opus,
    })

# rank by canonical weighted desc
scored = [x for x in index if x["weighted"] is not None]
scored.sort(key=lambda x: x["weighted"], reverse=True)
for i, x in enumerate(scored):
    x["rank"] = i + 1

json.dump(index, open(OUT_INDEX, "w"), ensure_ascii=False, indent=0)

n_opus = sum(1 for x in index if x["judge"] == "opus")
print(f"Wrote index ({len(index)} reviews, {len(scored)} scored, {n_opus} opus-judged)")
print("Top 8:")
for x in scored[:8]:
    print(f"  {x['rank']:>2}. {x['weighted']:>4}  [{x['judge']}]  {x['title'][:46]}")
