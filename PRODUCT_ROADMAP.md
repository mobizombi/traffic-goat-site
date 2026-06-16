# Traffic Goat — AI Affiliate Tools Product Roadmap

Goal: turn proven service expertise (the Affiliate Program Audit) into a stack of AI-powered digital products — starting cheap to build, validated by real demand, scaling toward recurring revenue. Not a side project — this is how Traffic Goat stops being "one audit at a time" and starts compounding.

**Sequencing rule:** each phase must be selling before the next phase starts building. Don't build #2 on a guess that #1 will work — build #1, sell it, then decide.

---

## Phase 1 — Dormant Affiliate Reactivation Engine
**Status:** ✅ Built and live — free tool shipped 2026-06-16 ([reactivation-engine.html](reactivation-engine.html)) | **Target:** First paid custom-run sale within 30 days

**Build note:** the live version uses smart templating (mail-merge from the 3 proven templates in the Audit Kit), not a live LLM API call — the site is static with no backend. This is the honest MVP: real, functional, ships today. A true AI-generated-per-partner version is a fast upgrade once there's a backend, but isn't required to start selling.

### What it is
Upload a partner export (CSV, or direct PartnerStack/Rewardful API connection later) → AI flags dormant partners by inactivity tier (14/30/60+ days) → auto-drafts personalized reactivation emails per segment, using the same logic already proven in the Affiliate Activation Audit Kit.

### Why first
- Directly extends a product that already exists and is already selling (the $97 Kit)
- Cheapest build: AI text generation + simple CSV parsing — no scraping, no fragile integrations
- Pain is proven, not theoretical — it's the exact pattern from the real client teardown
- Fastest path to "does anyone pay for this" signal

### Build scope (MVP)
1. CSV upload (manual export from any affiliate platform)
2. Simple scoring logic: flag rows by last-activity date into 3 tiers
3. AI-generated reactivation email per tier, personalized with partner name + program specifics
4. Output: downloadable email batch + summary report (X dormant, Y flagged, Z emails generated)

### Pricing
- $47-$97 per run (one-time), or $29/month for ongoing monthly runs
- Bundle option: Kit ($97) + Reactivation Engine first run ($47) = $129 combo

### Dependencies
- None blocking — can start immediately with manual CSV upload, no API integrations required for MVP

---

## Phase 2 — Affiliate Program Health Dashboard
**Status:** Not started | **Target:** Start after Phase 1 has 3+ paying users

### What it is
SaaS-ification of the existing 40-point Activation Scorecard from the Kit. Connects to a data source (CSV upload to start, API later), auto-scores program health monthly, shows trend over time across the same 4 categories: Onboarding, Follow-Up Cadence, Payout Competitiveness, Creative & Proof.

### Why second
- Natural recurring-revenue evolution of a product that's already validated as one-time
- Reuses scoring logic already built for the Kit — low incremental build cost
- Recurring billing is the real prize: $29-49/month per program is a better long-term asset than repeated one-time sales

### Build scope (MVP)
1. Monthly CSV upload reminder + scoring
2. Trend chart: score over time, per category
3. Auto-flag: "biggest change since last month" + suggested action
4. Email digest: monthly summary sent automatically

### Pricing
- $29-49/month per program
- First month free for Kit buyers (upsell path from Phase 1 product)

### Dependencies
- Phase 1 should be selling first — validates that people will pay for AI-driven affiliate diagnostics at all before building the recurring version

---

## Phase 3 — Niche / Partner Finder
**Status:** Researched, not started | **Target:** Evaluate after Phase 2 traction

### What it is
AI-assisted search for potential affiliates in a given niche — blogs, YouTube channels, newsletters — ranked by estimated audience fit and relevance signals. Addresses the #1 pain point even PartnerStack-tier tools don't solve: recruitment is still manual everywhere.

### Why third, not first
- Real pain, but highest build cost of the four — needs actual data sourcing (search APIs, scraping, or paid data feeds), not just AI text generation
- Quality bar is high — a bad partner-match list damages trust fast; this needs more validation before charging for it
- Worth doing only once Phase 1/2 prove people pay for AI affiliate tools from Traffic Goat specifically

### Build scope (rough, needs real scoping before committing)
1. Input: niche/category + product description
2. Search layer: identify candidate sites/creators (via search API or curated data source — needs research into cost-effective options)
3. AI ranking: score candidates by relevance/fit signals
4. Output: ranked shortlist with contact info where available

### Pricing (placeholder, validate before committing)
- $97-197 per niche search, or bundled into a higher retainer tier

### Dependencies
- Needs a cost-effective data source decided before scoping — this is a research task on its own, not just a build task
- Should not start until Phase 1 and 2 have real paying users

---

## Phase 4 — Fraud Triage Lite
**Status:** Researched, not started | **Target:** Evaluate after Phase 3, or skip

### What it is
Upload click/conversion data → AI flags anomalies (geo mismatches, click bursts, suspicious conversion ratios) for small/mid programs priced out of enterprise fraud tools like 24metrics.

### Why last
- Real, well-documented pain (15-25% of CPA spend is fraudulent industry-wide) — but the risk of false positives damaging real partner relationships is higher here than any other product on this list
- Needs the most caution: output should be framed as "investigate this" not "this affiliate is fraudulent" — wrong call here costs Adam credibility with a client's partner network
- Lowest priority not because the pain isn't real, but because getting it wrong is the most costly mistake on this roadmap

### Build scope (rough)
1. CSV upload: click/conversion logs
2. Anomaly detection: flag statistical outliers (geo mismatch, click bursts, conversion ratio anomalies)
3. Output: flagged list with "why flagged" reasoning, framed as leads for investigation, not verdicts

### Pricing (placeholder)
- $97-197 per audit run, positioned as an add-on to the full Affiliate Program Audit rather than fully self-serve

### Dependencies
- Build only if Phases 1-3 validate that self-serve AI affiliate tools are a real revenue line
- May make more sense as a manual service add-on (using AI internally) rather than a self-serve product, given the stakes of getting it wrong

---

## Decision Filter (apply before starting any phase)

Before building the next phase, confirm:
1. Is the previous phase actually selling — not just live, but generating real purchases?
2. Does skipping ahead solve a problem someone has asked about, or is it just the more interesting build?
3. Can this be built with AI-text-generation logic (cheap, fast) or does it need real data infrastructure (slower, costlier, riskier)?
4. Does getting this wrong cost a client relationship, or just a refund?

If the answer to #1 is no, stop and fix that before touching the next phase.

---

*Owner: Adam | Reviewed by: Strategist, Systems Architect, Affiliate Specialist, Analyst*
*Last updated: 2026-06-16*
