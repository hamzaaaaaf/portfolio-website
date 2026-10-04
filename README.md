# byhamza.dev

My personal site: a web port of [DashX360](https://github.com/ZivvoZ/dashx360) by ZivvoZ, the Xbox 360 Metro dashboard recreated for Windows. Live at **[byhamza.dev](https://byhamza.dev)**.

Every screen is DashX360's 1280×720 canvas scaled to fit the window, so tile positions, colours, fonts, animation timings and sound cues come straight from its XAML and C#. The content is mine.

- **Startup**: the boot video, the loading ring, the dashboard settling in and the "signed in to Xbox LIVE" pop-up.
- **Dashboard**: bing, home, social, video, games, music, apps and settings, with DashX360's sliding tab change and the neighbouring tabs peeking in at the edges.
- **Xbox Guide**: Games & Apps, profile, Xbox Home, Media and Settings blades, plus Achievements and Friends.
- **My Games and My Apps**: my projects, with DashX360's game details screen (overview, details, extras, gallery). Capital City, my first Python game, is in the tray and playable.
- **Bing**: searches the console like the 360's Bing did, with a last tile that searches the web.
- **System Settings, Profile, Themes and a Music Player** for songs on your own device.
- **Achievements**: 31 of them worth 1000 gamerscore, saved in your browser.

### Controls

| | Controller | Keyboard |
| --- | --- | --- |
| Move | Left stick, d-pad | Arrow keys or WASD |
| Select | A | Enter or Space |
| Back | B or Back | Escape, Backspace or B |
| Switch tabs | LB / RB | Q / E, Tab / Shift+Tab, or Page Up / Page Down |
| Game details | X | X |
| Search | Y | Y or F |
| Xbox Guide | Guide / PS / Home button, PlayStation touchpad, or Back + Start | Home or G |

Xbox, PlayStation and Nintendo controllers are mapped by button position, so the bottom face button is always A. Mouse, trackpad swipes and touch work too.

## Stack

Plain HTML, CSS and JavaScript with no build step, hosted on Cloudflare Workers with static assets. The Worker only serves `/api/leetcode` and `/api/github` (cached stats).

```
public/index.html        page shell and a plain-text summary for search engines
public/dash.css          DashX360's styles
public/dash.js           dashboard, Guide, menus, sounds and input
public/assets/           artwork, sounds, boot video and fonts (built by tools/build_assets.py)
src/worker.js            /api/leetcode and /api/github
tools/build_assets.py    converts DashX360's assets for the web
```

`tools/build_assets.py` takes DashX360's `Assets` folder and Microsoft's [Selawik](https://github.com/microsoft/Selawik) release (an open-source stand-in for Segoe UI), resizes everything to twice its on-screen size as WebP, crops my gamerpic from `tools/src/gamerpic.jpg`, and draws the Capital City, Panic Pack! and Instagram Unliker artwork:

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
