import json
# Finder data. Covers are drawn in CSS from these palettes; no copyrighted art.
GAMES = [
  {"id": "minecraft", "t": "Minecraft", "p": "PC · Pocket Edition", "yr": "Where it started", "c": ["#6fbf4a", "#3f7f2a", "#8a5a2b"], "g": "▦",
   "note": "The game that started it all. Pocket Edition on a phone in 6th grade, building until the battery died."},
  {"id": "arkham", "t": "Batman: Arkham series", "p": "Xbox 360", "yr": "4 games", "c": ["#1d2230", "#0c0f16", "#f5c518"], "g": "◆",
   "note": "Asylum, City, Origins and Knight. The whole run, start to finish. Still the best superhero games made."},
  {"id": "uncharted4", "t": "Uncharted 4", "p": "PS4", "yr": "The reason I bought a PS4", "c": ["#d9a45b", "#8c4a2f", "#2c1a12"], "g": "✦",
   "note": "Wanted to play it so badly I bought a PS4 for it. Worth every penny."},
  {"id": "gta", "t": "GTA V Online", "p": "Heists with friends", "yr": "Best time of my life", "c": ["#6ad06a", "#2a7a3a", "#0f2a14"], "g": "$",
   "note": "Heists with the squad. Planning, arguing, failing, finally pulling it off. Genuinely the best time of my life."},
  {"id": "fortnite", "t": "Fortnite", "p": "Since Season 1", "yr": "Season 4 was peak", "c": ["#8f6bff", "#3b2a9a", "#1ad1ff"], "g": "★",
   "note": "Dropped in from Season 1. Season 4, with the meteor and the superheroes, was the best it ever got."},
  {"id": "warzone", "t": "Warzone", "p": "The original", "yr": "Verdansk", "c": ["#8a8f7a", "#3f4436", "#1b1d17"], "g": "◎",
   "note": "The original, on the original map. Late nights with friends and far too many gulags."},
  {"id": "rocketleague", "t": "Rocket League", "p": "With friends", "yr": "Car football", "c": ["#2f9bff", "#ff7a2f", "#122033"], "g": "●",
   "note": "Car football. Endless games with friends, and the occasional aerial that made it all worth it."},
  {"id": "friday13", "t": "Friday the 13th", "p": "Short but loved", "yr": "Played briefly", "c": ["#3a0d0d", "#12060a", "#9aa0a6"], "g": "✕",
   "note": "Only played it for a short time, but absolutely loved it. Asymmetric horror done right."},
  {"id": "crash", "t": "Crash of the Titans", "p": "PSP", "yr": "Handheld days", "c": ["#ff9a2e", "#c24a12", "#2b1405"], "g": "▲",
   "note": "On the PSP. The handheld that went everywhere with me."},
  {"id": "spiderman", "t": "Spider-Man 3 · TASM 1 & 2", "p": "Three games", "yr": "Web-slinging", "c": ["#d92b2b", "#1f3fae", "#0c1330"], "g": "✳",
   "note": "Spider-Man 3, then The Amazing Spider-Man 1 and 2. Swinging around the city never got old."},
]
MOVIES = [
  {"id": "aasb", "t": "As Above, So Below", "p": "2014 · Found footage", "yr": "Favourite", "c": ["#3b3325", "#15120c", "#c9a24a"], "g": "▽",
   "note": "Found footage in the Paris catacombs. Claustrophobic in the best way."},
  {"id": "blairwitch", "t": "The Blair Witch Project", "p": "1999 · Found footage", "yr": "A classic", "c": ["#2f3a2a", "#10150e", "#b8b09a"], "g": "✶",
   "note": "The one that started found footage. Proof that what you don't see is scarier."},
]
PROJECTS = [
  {"id": "panic-pack", "t": "Panic Pack!", "p": "Godot 4 · GDScript", "yr": "2026", "art": "art--panic", "g": "!", "open": "/work#panic-pack",
   "note": "A first-person race against the clock. Grab everything on a random packing list and make the taxi."},
  {"id": "instagram-unliker", "t": "Instagram Unliker", "p": "JavaScript", "yr": "2026", "art": "art--heart", "g": "♡", "open": "/work#instagram-unliker",
   "note": "Clears years of Instagram likes in one run, pacing itself so the page keeps up."},
  {"id": "this-site", "t": "byhamza.dev", "p": "Workers · D1 · Three.js", "yr": "2026", "art": "art--site", "g": "h", "open": "/work#this-site",
   "note": "This site. A desktop in the browser, served from Cloudflare's edge."},
]
APPS = [
  ("stack", "Stack", "/play", "Game"), ("type", "Typing Test", "/type", "Speed test"), ("draw", "Kaleidoscope", "/draw", "Drawing toy"),
  ("guestbook", "Guestbook", "/guestbook", "Sign the wall"), ("arcade", "Arcade", "/arcade", "Snake & Breakout"), ("wyr", "Would You Rather", "/wyr", "Game votes"), ("terminal", "Terminal", "/terminal", "Shell"), ("settings", "System Settings", "/settings", "Preferences"),
]
data = {
  "games": GAMES, "movies": MOVIES, "projects": PROJECTS,
  "apps": [{"id": k, "t": n, "p": sub, "open": h, "icon": ICONS[k]} for k, n, h, sub in APPS],
}
FOLDER = '<svg viewBox="0 0 20 16" aria-hidden="true"><path d="M1 3a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2Z" fill="currentColor"/></svg>'
side = [("projects", "Projects", "▤"), ("games", "Games", "◉"), ("movies", "Movies", "▶"), ("apps", "Apps", "⌘"), ("achievements", "Achievements", "★")]
side_html = "".join(f'<button type="button" class="fnd__loc" data-folder="{k}"><span class="fnd__ico fnd__ico--{k}">{g}</span>{n}<span class="fnd__count" data-count="{k}"></span></button>' for k, n, g in side)

finder = app_page("Finder · Hamza", "Browse Hamza's projects, favourite games, films and achievements.", "finder", "finder", f"""  <main class="win app-win finder-win">
    {bar('<span id="fnd-title">Finder</span>')}
    <div class="win__body fnd">
      <nav class="fnd__side" aria-label="Folders">
        <span class="fnd__head">Favourites</span>
        {side_html}
        <span class="fnd__head">Locations</span>
        <a class="fnd__loc" href="https://github.com/hamzaaaaaf" target="_blank" rel="noopener"><span class="fnd__ico">⌥</span>GitHub</a>
        <a class="fnd__loc" href="/"><span class="fnd__ico">h</span>byhamza.dev</a>
      </nav>
      <section class="fnd__main">
        <div class="fnd__tools">
          <div class="fnd__nav"><button type="button" class="icon-btn" id="fnd-back" aria-label="Back">‹</button><button type="button" class="icon-btn" id="fnd-fwd" aria-label="Forward">›</button></div>
          <b class="fnd__path" id="fnd-path">Projects</b>
          <div class="fnd__view" role="group" aria-label="View">
            <button type="button" class="icon-btn" data-view="grid" aria-label="Icons">▦</button><button type="button" class="icon-btn" data-view="list" aria-label="List">☰</button>
          </div>
          <label class="fnd__search"><span aria-hidden="true">⌕</span><input id="fnd-q" type="search" placeholder="Search" autocomplete="off"></label>
        </div>
        <div class="fnd__items" id="fnd-items" role="listbox" tabindex="0" aria-label="Items"></div>
        <div class="fnd__status mono" id="fnd-status"></div>
      </section>
      <aside class="fnd__peek" id="fnd-peek" aria-live="polite"></aside>
    </div>
  </main>
  <script type="application/json" id="fnd-data">{json.dumps(data)}</script>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/finder.js" defer></script>""")
open(P + 'finder.html', 'w').write(finder)
