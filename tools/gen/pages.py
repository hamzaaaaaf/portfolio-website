# Generates the app pages in public/. Run: python3 tools/gen/pages.py
import sys
import os
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from chrome import *

P = os.path.join(HERE, '..', '..', 'public') + os.sep
TICKS = "".join(f'<b style="transform: rotate({a}deg) translateY(-44px)"></b>' for a in range(0, 360, 30))

def clock_widget(who, tz_attr, i):
    return f'''<div class="widget-clock fade" style="--i:{i}" data-drag data-tzclock="{tz_attr}">
            <div class="analog">{TICKS}<i class="h"></i><i class="m"></i><i class="s"></i></div>
            <span class="widget-clock__label"><b>{who}</b> <span data-tzabbr>···</span></span>
          </div>'''

def app_page(title, desc, page, dock_key, body, extra_head="", extra_scripts=""):
    return head(title, desc, extra_head, "/" + page) + f"""
<body class="app" data-page="{page}">
{COMMON_TOP}
{menubar(page)}

{body}

{dock(dock_key)}

{SCRIPTS}
{extra_scripts}
</body>
</html>
"""

# ------------------------------------------------------------------ Home
exec(open(os.path.join(HERE, 'home_pages.py')).read())

# ------------------------------------------------------------------ Draw
PRESSED = ' aria-pressed="true"'
swatches = "".join(f'<button class="swatch" type="button" data-color="{c}" style="--c:{c}" aria-label="{n}"{PRESSED if n == "Butter" else ""}></button>'
                   for c, n in [("#fff6d6", "Cream"), ("#ffd84d", "Butter"), ("#ff8a5c", "Tangerine"), ("#ff7aa2", "Pink"), ("#7fd6b2", "Mint"), ("#8fb8ff", "Sky")])
draw = app_page("Kaleidoscope · Hamza", "Draw anything and it gets mirrored into a pattern.", "draw", "draw", f"""  <main class="win app-win">
    {bar("Kaleidoscope")}
    <div class="win__body canvas-dark">
      <canvas class="app-canvas" id="paper" aria-label="Drawing canvas"></canvas>
      <div class="hud hint">
        <h1>Draw <em>anything.</em></h1>
        <p>Every stroke is mirrored into a pattern.</p>
      </div>
      <div class="bar glass" role="toolbar" aria-label="Drawing tools">
        <div class="bar__group" data-group="sym" aria-label="Symmetry">
          <button class="icon-btn" type="button" data-sym="1">1</button>
          <button class="icon-btn" type="button" data-sym="4">4</button>
          <button class="icon-btn" type="button" data-sym="6">6</button>
          <button class="icon-btn" type="button" data-sym="8" aria-pressed="true">8</button>
          <button class="icon-btn" type="button" data-sym="12">12</button>
          <button class="icon-btn" type="button" id="mirror" aria-pressed="true" title="Mirror each slice">Mirror</button>
        </div>
        <span class="bar__sep"></span>
        <div class="bar__group" data-group="brush" aria-label="Brush">
          <button class="icon-btn" type="button" data-brush="ink" aria-pressed="true">Ink</button>
          <button class="icon-btn" type="button" data-brush="glow">Glow</button>
        </div>
        <span class="bar__sep"></span>
        <div class="bar__group" data-group="color" aria-label="Colour">
          {swatches}
          <button class="swatch swatch--rainbow" type="button" data-color="rainbow" aria-label="Rainbow"></button>
        </div>
        <span class="bar__sep"></span>
        <div class="bar__group"><input class="size" id="size" type="range" min="1" max="24" value="5" aria-label="Brush size"></div>
        <span class="bar__sep"></span>
        <div class="bar__group">
          <button class="icon-btn" type="button" id="surprise" title="Draw something for me">Surprise</button>
          <button class="icon-btn" type="button" id="undo" title="Undo (Ctrl+Z)">Undo</button>
          <button class="icon-btn" type="button" id="clear">Clear</button>
          <button class="icon-btn" type="button" id="save">Save</button>
        </div>
      </div>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/draw.js" defer></script>""")
open(P + 'draw.html', 'w').write(draw)

exec(open(os.path.join(HERE, 'guest_page.py')).read())

# ------------------------------------------------------------------ Terminal
term = app_page("Terminal · Hamza", "The whole site as a command line.", "terminal", "terminal", f"""  <main class="win app-win term-win">
    {bar("hamza — zsh — 80×24".replace("—", "·"))}
    <div class="win__body term" id="term" tabindex="0" aria-label="Terminal. Type help and press enter.">
      <div class="term__out" id="term-out" aria-live="polite"></div>
      <label class="term__line"><span class="term__prompt"><span class="y">hamza@byhamza</span> <span class="b" id="term-cwd">~</span> %</span><input id="term-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"></label>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/terminal.js" defer></script>""")
open(P + 'terminal.html', 'w').write(term)

# ------------------------------------------------------------------ Retired pages
# The old mini games and Mac-only apps now live on the dashboard.
for name, target in [("play", "games"), ("type", "games"), ("arcade", "games"), ("wyr", "games"), ("finder", "library"), ("settings", "settings")]:
    open(P + name + '.html', 'w').write(f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>byhamza.dev</title><meta http-equiv="refresh" content="0; url=/#{target}"><script>location.replace('/#{target}')</script></head><body></body></html>
""")

# ------------------------------------------------------------------ 404
nf = head("Not found · Hamza", "This page doesn't exist.", '\n  <meta name="robots" content="noindex">') + f"""
<body data-page="404">
{COMMON_TOP}
{menubar("")}
  <div class="big-404" aria-hidden="true">404</div>

  <main class="alert-wrap">
    <div class="win alert" role="alertdialog" aria-labelledby="nf-title" aria-describedby="nf-desc">
      <svg class="alert__icon" viewBox="0 0 64 64" aria-hidden="true"><path d="M28.5 8.6a4 4 0 0 1 7 0l24 42A4 4 0 0 1 56 56.6H8a4 4 0 0 1-3.5-6l24-42Z" fill="#febc2e"/><rect x="29.5" y="22" width="5" height="19" rx="2.5" fill="#3a2c00"/><circle cx="32" cy="47.5" r="3" fill="#3a2c00"/></svg>
      <h1 id="nf-title">This page doesn't exist.</h1>
      <p id="nf-desc">Check the address, or head somewhere that does.</p>
      <a class="mac-btn mac-btn--primary" href="/">Go Home</a>
      <a class="mac-btn" href="/play">Play Stack</a>
    </div>
  </main>

{dock("")}

{SCRIPTS}
</body>
</html>
"""
open(P + '404.html', 'w').write(nf)
print("written")
