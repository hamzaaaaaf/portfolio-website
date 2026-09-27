# byhamza.dev

My personal site: a small desktop in the browser. Live at **[byhamza.dev](https://byhamza.dev)**.

- **Desktop**: menu bar, dock with magnification, draggable windows with working traffic lights, sticky notes and a right-click menu.
- **Spotlight** (<kbd>⌘</kbd><kbd>K</kbd>): jump anywhere, run actions, do quick maths.
- **Stack** (`/play`): a one-button 3D stacking game with a global leaderboard.
- **Kaleidoscope** (`/draw`): symmetric drawing with ink and glow brushes, PNG export.
- **Terminal** (`/terminal`): the site as a command line. Try `help`, `hamzafetch` or `leetcode`.
- **System Settings** (`/settings`): light, dark or auto, five wallpapers, dock size, sound and reduced motion.
- **LeetCode**: live solved counts, a yearly heatmap and recent problems.

## Stack

Plain HTML, CSS and JavaScript with no build step. Three.js for the game and Lenis for smooth scrolling. Hosted on Cloudflare Workers with static assets, with D1 for the leaderboard.

```
public/        the site (served as static files)
src/worker.js  /api/leetcode, /api/scores, /api/sparks
db/schema.sql  D1 tables
```

## Run locally

```sh
npx wrangler d1 execute portfolio-db --local --file db/schema.sql
npx wrangler dev
```

Pushing to `main` deploys automatically.
