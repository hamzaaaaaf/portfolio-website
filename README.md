# byhamza.dev

My personal site: a small desktop in the browser. Live at **[byhamza.dev](https://byhamza.dev)**.

- **Desktop**: menu bar, dock with magnification, draggable windows with working traffic lights, sticky notes and a right-click menu.
- **Spotlight** (<kbd>⌘</kbd><kbd>K</kbd>): jump anywhere, run actions, do quick maths.
- **Stack** (`/play`): a one-button 3D stacking game with a global leaderboard.
- **Kaleidoscope** (`/draw`): symmetric drawing with ink and glow brushes, PNG export.
- **Terminal** (`/terminal`): the site as a command line. Try `help`, `hamzafetch` or `leetcode`.
- **System Settings** (`/settings`): light, dark or auto, five wallpapers, dock size, sound and reduced motion.
- **Finder** (`/finder`): projects, favourite games and films, apps and achievements, with Quick Look.
- **Typing Test** (`/type`): time, words and code modes with a global leaderboard.
- **Guestbook** (`/guestbook`): draw and sign the wall. Entries are held for approval at `/review`.
- **Live cursors**: see other visitors on the same page, relayed by a Durable Object.
- **Achievements**: 23 of them, some secret.
- **Stats** (`/stats`): live LeetCode and GitHub numbers.

## Stack

Plain HTML, CSS and JavaScript with no build step. Three.js for the game, native scrolling with CSS scroll-driven animations. Hosted on Cloudflare Workers with static assets, D1 for leaderboards and the guestbook, and a Durable Object for live cursors.

```
public/        the site (served as static files)
src/worker.js  /api/leetcode, /api/github, /api/scores, /api/sparks, /api/guestbook, /api/live
db/schema.sql  D1 tables
```

## Run locally

```sh
npx wrangler d1 execute portfolio-db --local --file db/schema.sql
npx wrangler dev
```

Pushing to `main` deploys automatically.

## Guestbook moderation

Set a secret named `ADMIN_KEY` on the Worker (Workers & Pages → portfolio-website → Settings → Variables and Secrets), then open `/review` and enter it to approve or delete entries.
