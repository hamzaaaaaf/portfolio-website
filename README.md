# byhamza.dev

My personal site, built as an Xbox 360 dashboard. Live at **[byhamza.dev](https://byhamza.dev)**.

- **Dashboard**: the 2011 "Metro" dashboard. Tabs for home, projects, games, social, apps and settings, with live tiles.
- **Never leaves the page**: every app opens full screen over the dashboard and zooms back into its tile. Old addresses like `/work` land on the dashboard with that app open.
- **Controller support**: plug in a controller. The stick or d-pad moves, A opens, B goes back, LB and RB switch tabs, and the Guide button opens the Guide. Keyboard works too: arrows, Enter, Escape, `[` and `]`.
- **Achievements**: 29 of them worth 1000 gamerscore, with the unlock pop-up and sound. Some are secret.
- **Arcade**: Snake, Breakout, Stack (3D), a typing test and Would You Rather, all with global leaderboards.
- **Internet Explorer**: browse byhamza.dev on byhamza.dev, as deep as you like.
- **Live**: visitor presence, LeetCode and GitHub stats, the guestbook wall and a global sparks counter.
- **Cheat codes**: type them anywhere. The terminal has a hint if you're stuck.
- **Sounds**: all synthesised in the browser with Web Audio.

## Stack

Plain HTML, CSS and JavaScript with no build step. Hosted on Cloudflare Workers with static assets, D1 for leaderboards, votes and the guestbook, and a Durable Object for live presence.

```
public/index.html   the dashboard
public/x360.*       dashboard styles and logic
public/os.js        achievements, cheats, sparks and presence (shared with every app)
public/*.html       the apps that open inside the dashboard
src/worker.js       /api/leetcode, /api/github, /api/scores, /api/sparks, /api/guestbook, /api/wyr, /api/live
db/schema.sql       D1 tables
tools/gen/          Python that generates the app pages: python3 tools/gen/pages.py
```

## Run locally

```sh
npx wrangler d1 execute portfolio-db --local --file db/schema.sql
npx wrangler dev
```

Pushing to `main` deploys automatically.

## Guestbook moderation

Set a secret named `ADMIN_KEY` on the Worker (Workers & Pages → portfolio-website → Settings → Variables and Secrets), then open `/review` and enter it to approve or delete entries.

Not affiliated with Microsoft or Xbox.
