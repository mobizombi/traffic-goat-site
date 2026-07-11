# Deploying traffic-goat.com

The live site is served by **GitHub Pages from the `gh-pages` branch** (legacy build,
custom domain via `CNAME`). DNS points at GitHub Pages (185.199.108-111.153).

## Important: main vs gh-pages

- **`main`** is the source of truth. It holds everything - the site files AND internal
  business docs (outreach, BD plan, proposal/audit templates, `prospect-tracker.csv`,
  `ops/`, `scripts/`). These must **never** be published.
- **`gh-pages`** is the public branch. It must contain **only public site files**:
  `index.html`, `styles.css`, `robots.txt`, `sitemap.xml`, `favicon.ico`, `assets/`,
  `blog/`, the tool pages (`revenue-leak-calculator.html`, `reactivation-engine.html`,
  `affiliate-activation-kit.html`), `CNAME`.

There is intentionally **no auto-deploy workflow**. The old `.github/workflows/pages.yml`
uploaded the entire repo root, which exposed `prospect-tracker.csv` and every internal
`.md` at `traffic-goat.com/<file>` (fixed 2026-07-11). It was removed so a future "fix"
can't silently re-leak.

## How to deploy a change

Edit files on `main`, commit, then publish only the public files to `gh-pages`:

```sh
git worktree add -f /tmp/tg-ghpages origin/gh-pages
cp index.html styles.css robots.txt sitemap.xml /tmp/tg-ghpages/   # whichever changed
# (copy assets/ blog/ tool pages too if they changed)
cd /tmp/tg-ghpages
git add -A
git commit -m "Deploy: <summary>"
git push origin HEAD:gh-pages
git worktree remove /tmp/tg-ghpages
```

Pages rebuilds in ~1-2 min. Verify the change is live and that no internal file is
reachable, e.g. `curl -o /dev/null -w '%{http_code}' https://traffic-goat.com/prospect-tracker.csv`
should return **404**.
