# byhamza.dev

My personal site, built like the Xbox 360 dashboard because the 360 was my first console. It's a web port of [DashX360](https://github.com/ZivvoZ/dashx360) by ZivvoZ, the Metro dashboard recreated for Windows. Live at **[byhamza.dev](https://byhamza.dev)**.

Every screen is DashX360's 1280×720 canvas scaled to fit the window, so tile positions, colours, fonts, animation timings and sound cues come straight from its XAML and C#. The content is mine.

- **Tabs**: about, projects, hobbies and social. Each tile opens its own window, or goes straight to the project's page.
- **About**: who I am, education, tech stack, Message Me, LinkedIn and achievements. My photo is a click away, in About Me.
- **Message Me**: type a message on an Xbox 360 style on-screen keyboard (or a real one) and it's emailed to me. See [Messages](#messages).
- **Projects**: Panic Pack!, Instagram Unliker and this site, plus live LeetCode and GitHub stats.
- **Hobbies**: where it began (Batman: Arkham Asylum and Minecraft), my gaming journey and favourite games, live Valorant, Fortnite, PlayStation and Steam stats, most played across every platform, and my favourite and latest films from Letterboxd with IMDb ratings.
- **Settings and Open Tray** live in the Xbox Guide. Open Tray behaves like a console with no disc in it: it opens and closes the tray.
- **Xbox Guide**: Games & Apps, profile, Xbox Home, Media and Settings blades, plus Achievements. Y goes to Xbox Home.
- **Achievements**: 33 of them worth 1000 gamerscore, saved in your browser.

### Controls

| | Controller | Keyboard |
| --- | --- | --- |
| Move | Left stick, d-pad | Arrow keys or WASD |
| Select | A | Enter or Space |
| Back | B or Back | Escape, Backspace or B |
| Switch tabs | LB / RB | Q / E, Tab / Shift+Tab, or Page Up / Page Down |
| Xbox Guide | Guide / PS / Home button, PlayStation touchpad, or Back + Start | Home or G |
| Xbox Home (in the Guide) | Y | Y |

Xbox, PlayStation and Nintendo controllers are mapped by button position, so the bottom face button is always A. Mouse, trackpad swipes and touch work too.

## Live stats

`src/worker.js` serves `/api/feed`. A cron trigger pulls everything every six hours into the `FEED` KV namespace, so visits never wait on other sites, and a source that fails keeps its last good copy. Nothing is typed in by hand.

| Source | Where it comes from | Needs |
| --- | --- | --- |
| LeetCode | LeetCode's GraphQL API | nothing |
| GitHub | GitHub's REST API | nothing (`GITHUB_TOKEN` if Cloudflare's shared IPs hit the rate limit) |
| Films | my Letterboxd profile (favourites and counts), films by date rated, and the diary RSS feed. Letterboxd puts a browser check in front of Cloudflare, so the pages go through the r.jina.ai reader and the last good read is kept | nothing (`JINA_API_KEY` if the reader's shared limit gets in the way) |
| IMDb ratings | OMDb | `OMDB_API_KEY` |
| Steam | the public profile, and the Web API for full library hours | `STEAM_API_KEY`, with "Game details" set to public |
| PlayStation | PSN's mobile API: trophies and play time | `PSN_NPSSO` |
| Valorant | the HenrikDev API: rank, most played act, and headshot %, K/D and more from up to 100 ranked games. Hours are estimated: ranked games times the latest games' length plus three minutes for queue, plus about 500 on other accounts | `HENRIK_API_KEY` and `VALORANT_ID` (`name#tag`, kept out of the repo and the page) |
| Fortnite | fortnite-api.com, with PlayStation hours as a fallback | `FORTNITE_API_KEY` and `FORTNITE_NAME` (Epic display name) |

Add the secrets under Workers & Pages → portfolio-website → Settings → Variables and Secrets. A section with no secret just stays hidden. After adding one, open `byhamza.dev/api/feed?refresh` to pull everything straight away (it works at most once every ten minutes); `status` in the reply says how each source went.

- **OMDb**: a free key from omdbapi.com/apikey.aspx.
- **Steam**: a key from steamcommunity.com/dev/apikey, then Profile → Edit Profile → Privacy Settings → Game details: Public.
- **PlayStation**: sign in at playstation.com, then open ca.account.sony.com/api/v1/ssocookie and copy the `npsso` value. The Worker swaps it for a refresh token and keeps that renewed; if PlayStation stats ever stop updating, paste a fresh one.
- **Valorant**: a free key from the HenrikDev Discord (docs.henrikdev.xyz). Set `VALORANT_REGION` too if you're not on `eu`.
- **Fortnite**: a free key from dash.fortnite-api.com, your Epic display name, and Fortnite → Settings → Account and Privacy → Show on career leaderboard: On.

## Messages

`/api/contact` takes a message from the on-screen keyboard and emails it through Cloudflare Email Routing, from dashboard@byhamza.dev with the visitor's address as Reply-To. It needs:

- Email Routing turned on for byhamza.dev, with your inbox as a verified destination address.
- A `CONTACT_TO` secret holding that inbox address (it stays out of the repo).

To keep it from being abused, a visitor can send three messages an hour and the site twenty a day; messages need a valid email to reply to, can't be stuffed with links, and anything sent faster than a person could type is quietly dropped. Until `CONTACT_TO` is set, the window says messages aren't switched on and points to the email address instead.

## Stack

Plain HTML, CSS and JavaScript with no build step, hosted on Cloudflare Workers with static assets.

```
public/index.html        page shell and a plain-text summary for search engines
public/dash.css          DashX360's styles
public/dash.js           dashboard, windows, Guide, sounds and input
public/assets/           artwork, sounds, boot video and fonts (built by tools/build_assets.py)
src/worker.js            /api/feed, /api/contact and the cron that refreshes the feed
tools/build_assets.py    converts DashX360's assets for the web
tools/minecraft_scene.py draws the Minecraft-style scene in Where It Began
```

`tools/build_assets.py` takes DashX360's `Assets` folder and Microsoft's [Selawik](https://github.com/microsoft/Selawik) release (an open-source stand-in for Segoe UI), resizes everything to twice its on-screen size as WebP, crops my gamerpic from `tools/src/gamerpic.jpg`, and draws the Panic Pack! and Instagram Unliker artwork:

```sh
python3 tools/build_assets.py path/to/dashx360/Assets path/to/Selawik_Release
```

## Run locally

```sh
npx wrangler dev
```

Pushing to `main` deploys automatically.

## Credits

Dashboard design, artwork and sounds from DashX360 by ZivvoZ. Unofficial non-commercial fan project: Xbox and related names, logos, imagery and sounds are property of Microsoft, and this site isn't affiliated with or endorsed by Microsoft.
