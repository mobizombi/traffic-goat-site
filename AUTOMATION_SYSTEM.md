# Traffic Goat - Automatic Traction System

This is the A-Z operating system for getting attention and converting it into Revenue Leak Audit requests.

## What Is Automated
- Daily content packet generation.
- LinkedIn/Facebook post drafts.
- Outreach segment rotation.
- Prospect tracker append flow.
- Daily checklist.
- Weekly scorecard structure.
- Recurring Codex reminder to execute the system.

## What Still Requires Approval
These actions create external side effects and must be approved before execution:
- Publishing LinkedIn posts or articles.
- Publishing Facebook posts.
- Sending outbound messages.
- Commenting from personal or company accounts.
- Inviting people to follow pages.
- Editing personal profiles.

## Daily Command
Run:

```bash
npm run ops:today
```

This creates:

```text
ops/daily/YYYY-MM-DD.md
```

The packet contains:
- LinkedIn post draft.
- Facebook post draft.
- Outreach segment.
- Source queries.
- First message and follow-ups.
- Commenting target.
- Execution checklist.

## Preview Without Advancing Queue
Run:

```bash
npm run ops:preview
```

Use this to inspect the next packet without rotating the content/outreach indexes.

## Add A Prospect
Run:

```bash
node scripts/traffic-goat-ops.js add-prospect "Company" "https://example.com" "Name" "Founder" "LinkedIn" "Affiliate activation leak"
```

This appends the prospect to:

```text
prospect-tracker.csv
```

## Daily Execution Flow
1. Generate packet.
2. Review post drafts.
3. Publish from Traffic Goat LinkedIn/Facebook after approval.
4. Add 5 prospects.
5. Send 3-5 personalized audit offers after approval.
6. Comment on 5 relevant LinkedIn posts after approval.
7. Record results in the weekly scorecard.

## Weekly Execution Flow
Every Sunday:
1. Fill `WEEKLY_TRACTION_SCORECARD.md`.
2. Identify top-performing angle.
3. Identify lowest-performing angle.
4. Adjust content queue and outreach segment.
5. Keep only what produces replies, clicks, audit requests, or conversations.

## Current Funnel
Traffic source:
- LinkedIn content.
- Facebook Page posts.
- LinkedIn comments.
- Direct outreach.

Offer:
- Revenue Leak Audit.

Conversion:
- Website mailto CTA to `adam@traffic-goat.com`.
- CTA clicks tracked in Google Analytics as `cta_click`.

## Scale Path
Stage 1:
- Manual approval posting and outbound.
- 50-100 prospects.
- 8-12 posts.

Stage 2:
- Add a real form endpoint instead of mailto.
- Add CRM tagging.
- Add email follow-up templates.
- Add retargeting pixels if paid ads become relevant.

Stage 3:
- Connect social APIs where available.
- Schedule approved posts.
- Automate prospect enrichment.
- Automate weekly reporting.
