import os, re, json, csv

ROOT = "/Users/sina/fun/acx-claude-books"
TXT = os.path.join(ROOT, "data/reviews_txt")
MANIFEST = os.path.join(ROOT, "data/manifest.json")
SCORES = os.path.join(ROOT, "data/scores.json")
SCORES_OPUS = os.path.join(ROOT, "data/scores_opus.json")
PANGRAM = os.path.join(ROOT, "data/pangram.csv")
OUT_INDEX = os.path.join(ROOT, "src/data/index.json")

WEIGHTS = {"insight":.30,"engagement":.25,"originality":.15,"fairness":.15,"structure":.15}

manifest = json.load(open(MANIFEST))


def load_pangram(path):
    """Pangram AI-detection results, keyed by the 3-digit review id prefix."""
    out = {}
    if not os.path.exists(path):
        return out
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            rid = (row.get("id") or "").strip()
            if not rid:
                continue
            try:
                frac_ai = float(row["fraction_ai"])
            except (TypeError, ValueError, KeyError):
                continue
            out[rid[:3]] = {
                "fractionAi": round(frac_ai, 4),
                "fractionAiAssisted": round(float(row.get("fraction_ai_assisted") or 0), 4),
                "fractionHuman": round(float(row.get("fraction_human") or 0), 4),
                "prediction": (row.get("prediction_short") or "").strip(),
                "verdict": (row.get("prediction") or "").strip(),
            }
    return out

pangram = load_pangram(PANGRAM)

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
        # Pangram AI-detection result (None if not analyzed)
        "pangram": pangram.get(rid),
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
