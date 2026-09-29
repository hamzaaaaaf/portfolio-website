# byhamza.dev

My personal site: a small desktop in the browser. Live at **[byhamza.dev](https://byhamza.dev)**.

- **Desktop**: the home page is a Mac desktop. Widgets, icons you can select, drag and double-click, rubber-band selection, draggable windows, sticky notes and a right-click menu.
- **Windows**: every page is a window. Red closes it back to the desktop, yellow minimises, green zooms. Anything that can't be done shakes.
- **Spotlight** (<kbd>⌘</kbd><kbd>K</kbd>): jump anywhere, run actions, do quick maths.
- **Kaleidoscope** (`/draw`): symmetric drawing with ink and glow brushes, PNG export.
- **Terminal** (`/terminal`): the site as a command line. Try `help`, `hamzafetch` or `leetcode`.
- **System Settings** (`/settings`): light, dark or auto, five wallpapers, dock size, sound and reduced motion.
- **Finder** (`/finder`): projects, favourite games and films, apps and achievements, with Quick Look.
- **Typing Test** (`/type`): time, words and code modes with a global leaderboard.
- **Arcade** (`/arcade`): every game in one place. Snake and Breakout on a CRT, plus Stack (a 3D stacking game), the typing test and Would You Rather, all with global leaderboards.
- **Would You Rather** (`/wyr`): pick between two of 168 games. Every vote feeds an Elo ranking.
- **Guestbook** (`/guestbook`): draw and sign the wall. Entries are held for approval at `/review`.
- **Live cursors**: see other visitors on the same page, relayed by a Durable Object.
- **Achievements**: 29 of them, some secret.
- **Cheat codes**: type them anywhere. The terminal has a hint if you're stuck.
- **Stats** (`/stats`): live LeetCode and GitHub numbers.

## Stack

Plain HTML, CSS and JavaScript with no build step. Three.js for the game, native scrolling with CSS scroll-driven animations. Hosted on Cloudflare Workers with static assets, D1 for leaderboards, votes and the guestbook, and a Durable Object for live cursors.

```
public/        the site (served as static files)
src/worker.js  /api/leetcode, /api/github, /api/scores, /api/sparks, /api/guestbook, /api/wyr, /api/live
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
