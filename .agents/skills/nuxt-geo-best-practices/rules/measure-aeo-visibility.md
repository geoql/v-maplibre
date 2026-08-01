---
title: Measure AEO Visibility with Statistical Rigor — Never Trust a Single Sweep
impact: CRITICAL
impactDescription: Without repeated sampling, LLM stochasticity makes before/after comparisons meaningless — you cannot tell a real ranking change from noise
tags: measurement, aeo, verification, statistics, share-of-voice, wilson, monitoring
---

## Measure AEO Visibility with Statistical Rigor — Never Trust a Single Sweep

Every other rule in this skill tells you what to **build**. This one tells you how to know whether it **worked** — and it is the rule most teams skip.

The core problem: **generative engines are stochastic**. Ask ChatGPT "best maps API for India" ten times and you may be cited six times, then four, then seven — with no content change at all. A naive "run it before the fix, run it after" comparison measures sampling noise, not your work.

Worse, two different things get conflated constantly:

| Metric       | Meaning                                                    |
| ------------ | ---------------------------------------------------------- |
| **Mention**  | Your brand/domain appears in the **answer text**           |
| **Citation** | The engine used a page on your domain as a **source link** |

They move independently. A brand can be mentioned constantly and never cited (no link equity), or cited without being named (buried source). Track both or you will misread your own progress.

**Incorrect (the comparison almost everyone makes):**

```bash
# ❌ WRONG — single sample before, single sample after.
# LLM output variance alone is larger than most real content-driven changes,
# so this "result" is indistinguishable from a coin flip.
# Monday:   ask ChatGPT "best maps API for India" -> not cited
# (ship E-E-A-T schema, FAQ blocks, robots.txt allowlist)
# Friday:   ask ChatGPT "best maps API for India" -> cited!
# Conclusion: "the schema fix worked" <- UNSUPPORTED
```

**Correct (repeated sampling + share-of-voice + confidence intervals):**

```bash
# ✅ CORRECT — pooled sampling across many sweeps, compared month-over-month
#    with an explicit noise verdict. Canonry is one implementation; the
#    method matters more than the tool.

# Track a stable query basket + your real competitors
cnry query add my-site "best maps API for India" "Mapbox alternative for India"
cnry competitor add my-site mapbox.com google.com openstreetmap.org

# Sweep repeatedly — cadence is what buys statistical power
cnry run my-site --wait          # repeat on a schedule, >=5x/month

# Month-over-month comparison with Wilson 95% intervals
cnry visibility-compare my-site --from 2026-05 --to 2026-06 --format json
```

```jsonc
// What a statistically honest comparison returns
{
  "shareOfVoice": {
    "from": { "percent": 0.0, "interval": [0.0, 8.2] },
    "to": { "percent": 12.5, "interval": [4.1, 28.0] },
    "verdict": "within-noise", // <- intervals overlap: NOT a confirmed gain
    "driftRobust": true,
  },
  "continuity": { "status": "ok" },
  "lowRunCount": false,
}
```

### The four guardrails that make a comparison trustworthy

1. **Share-of-voice over absolute rate.** `yourMentions / (yourMentions + competitorMentions)`. An engine can become broadly chattier or more reticent about naming _any_ vendor between months; absolute citation rate moves with that drift, share-of-voice largely cancels it.
2. **Confidence intervals, not point estimates.** A Wilson 95% interval on a proportion tells you whether 0% → 12% is a real move or two overlapping clouds. Report `within-noise` honestly — **never present it as a decline or a win**.
3. **Comparable baskets only.** Compare only the query × provider pairs present in **both** periods. Adding five queries mid-month silently changes the denominator and invents movement that never happened.
4. **Model-continuity gating.** If the engine's underlying model changed between periods (or the provider label covers a moving target), you cannot attribute the swing to your site. Mark it `model-discontinuous` and make no directional claim.

### Sampling floor — below this, don't claim anything

| Sweeps / month / project | What you can honestly say                                   |
| ------------------------ | ----------------------------------------------------------- |
| 1                        | Nothing. This is a spot check, not a measurement.           |
| 2-4                      | Direction only, with explicit "not statistically resolved". |
| **>= 5**                 | **Minimum for a `moved` vs `within-noise` verdict**         |
| 10+                      | Tight enough intervals to resolve moderate changes          |

Fewer than ~5 sweeps makes the interval so wide that almost every real change reads as noise. This is why AEO monitoring must be **scheduled and unattended** — a tool you run by hand when you remember will never clear the floor.

### Cost control — sampling is the expensive axis

Every sweep is `queries × providers` LLM calls. Ten queries across four engines, five times a month, is 200 billed calls/month **per project**. Practical approach:

- Start with **one** grounded engine and a **free tier** to establish the baseline and prove the signal is useful
- Add engines deliberately, once you know which ones actually cite your category
- Keep the query basket **small and stable** — basket churn destroys comparability (guardrail 3) _and_ multiplies cost

### Beware measurement surfaces that can't fail

If you put an AEO dashboard behind interactive edge auth (Cloudflare Access, SSO) and then point an uptime monitor at `/`, the auth layer returns **200 for the login page** whether your app is alive or dead. The monitor is green through a total outage. Probe an endpoint that reaches the real origin — see sibling skill `nuxt-agent-ready-best-practices`, rule `security-edge-auth-agent-bypass`.

### What a real baseline looks like

A production audit of a mid-size Nuxt site (41 pages, all GEO infrastructure already shipped — `llms.txt`, sitemap, valid schema):

```
queries: 10 | cited: 0 | mentioned: 0
share of voice: 0 of 36 brand mentions
competitors: google.com=10, mapbox.com=10, openstreetmap.org=10
index coverage: 90% (38/42 indexed in Google Search Console)
```

The lesson: **classic SEO health does not imply AEO visibility**. That site ranked #3.9 for its own brand name in Google and had 90% index coverage — while being cited in _zero_ of ten category queries. Brand search and category discovery are different games. Measure the one you actually care about.

### Verify your measurement is real, not a false green

```bash
# 1. The API you monitor must reach the ORIGIN, not an auth wall
curl -s -o /dev/null -w "%{http_code}\n" https://aeo.example.com/api/v1/projects
# 401 from your app = good (real origin, auth enforced)
# 200 HTML login page = your monitor is measuring the auth layer

# 2. Sweeps actually completed (not stuck "running")
cnry status my-site | grep -E "Status|Total runs"

# 3. Sample size cleared the floor before you quote any delta
cnry visibility-compare my-site --from 2026-05 --to 2026-06 --format json | jq '.lowRunCount'
# false = enough sweeps; true = do not make directional claims
```

Reference: [GEO Paper §2.2 "Visibility Metrics"](https://arxiv.org/abs/2311.09735) · [Wilson score interval](https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval) · [Canonry](https://github.com/Canonry/canonry) (open-source AEO monitoring; `visibility-compare` implements the four guardrails above) · sibling rule `content-statistics`
