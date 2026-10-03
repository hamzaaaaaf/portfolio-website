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

# ------------------------------------------------------------------ Play
play = app_page("Stack · Hamza", "A one-button stacking game with a global leaderboard.", "play", "arcade", f"""  <main class="win app-win game">
    {bar("Stack")}
    <div class="win__body">
      <canvas class="app-canvas" id="game" aria-label="Stack game. Press space or tap to drop a block."></canvas>
      <div class="hud score">
        <span class="score__n" id="score">0</span>
        <span class="score__best mono">Best <span id="best">0</span></span>
        <span class="perfect" id="perfect">Perfect</span>
      </div>
      <div class="hud prompt">
        <h1 class="prompt__title" id="prompt-title">Stack</h1>
        <span class="prompt__hint glass mono" id="prompt-hint">Tap, click or press space</span>
      </div>
      <form class="submit glass" id="submit" hidden>
        <span class="mono">Post to the leaderboard</span>
        <input id="initials" maxlength="3" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="AAA" aria-label="Your initials">
        <button class="mac-btn mac-btn--primary" type="submit">Post</button>
      </form>
      <aside class="board glass" id="board" aria-label="Global leaderboard">
        <div class="board__head"><span class="mono">Global top 10</span><button class="icon-btn" type="button" id="board-toggle" aria-expanded="true">Hide</button></div>
        <ol class="board__list" id="board-list"><li class="muted">Loading…</li></ol>
      </aside>
      <div class="tools glass">
        <button class="icon-btn" id="sound" type="button" aria-pressed="true" title="Sound">Sound</button>
      </div>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script type="importmap">{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js" } }</script>
  <script type="module" src="/play.js"></script>""")
open(P + 'play.html', 'w').write(play)

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

# ------------------------------------------------------------------ Type
def seg(attr, items, cls="icon-btn"):
    return "".join(f'<button class="{cls}" type="button" {attr}>{t}</button>' for attr, t in items)
modes = seg("", [('data-kind="time"', "Time"), ('data-kind="words"', "Words"), ('data-kind="code"', "Code")])
vals = seg("", [('data-for="time" data-val="15"', "15"), ('data-for="time" data-val="30"', "30"), ('data-for="time" data-val="60"', "60"),
                ('data-for="words" data-val="10"', "10"), ('data-for="words" data-val="25"', "25"), ('data-for="words" data-val="50"', "50"),
                ('data-for="code" data-val="python"', "Python"), ('data-for="code" data-val="java"', "Java")])
typep = app_page("Typing Test · Hamza", "How fast can you type? Timed, word and code modes, with a global leaderboard.", "type", "arcade", f"""  <main class="win app-win type-win">
    {bar("Typing Test")}
    <div class="win__body tt">
      <div class="tt__bar">
        <div class="tt__group glass">{modes}</div>
        <div class="tt__group glass">{vals}</div>
        <div class="tt__group glass"><button class="icon-btn" type="button" id="tt-clicks" title="Key sounds">Clicks</button><button class="icon-btn" type="button" data-restart title="Restart (Tab)">Restart</button></div>
      </div>

      <section class="tt__test" id="tt-test">
        <div class="tt__live mono"><span class="tt__timer" id="tt-timer">30</span><span><b id="tt-wpm">0</b> wpm</span><span><b id="tt-acc">100%</b> acc</span></div>
        <div class="tt__viewport" id="tt-viewport">
          <div class="tt__words" id="tt-words" aria-hidden="true"></div>
          <div class="tt__caret" id="tt-caret"></div>
          <div class="tt__focus" id="tt-focus">Click here or press any key to focus</div>
        </div>
        <input class="tt__input" id="tt-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Type the words shown">
        <p class="tt__hint mono"><kbd>Tab</kbd> restart · <kbd>Esc</kbd> new text · <kbd>⌥</kbd><kbd>⌫</kbd> delete word</p>
      </section>

      <section class="tt__results" id="tt-results" hidden>
        <div class="tt__big">
          <div><span class="mono muted">wpm</span><b id="tt-r-wpm">0</b></div>
          <div><span class="mono muted">accuracy</span><b id="tt-r-acc">0%</b></div>
          <span class="tt__pb" id="tt-r-pb" hidden>New personal best</span>
        </div>
        <svg class="tt__graph" id="tt-graph" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"></svg>
        <dl class="tt__meta">
          <div><dt class="mono muted">test</dt><dd id="tt-r-mode">·</dd></div>
          <div><dt class="mono muted">raw</dt><dd id="tt-r-raw">·</dd></div>
          <div><dt class="mono muted">correct/wrong</dt><dd id="tt-r-chars">·</dd></div>
          <div><dt class="mono muted">time</dt><dd id="tt-r-time">·</dd></div>
        </dl>
        <form class="submit glass tt__submit" id="tt-submit" hidden>
          <span class="mono">Post to the 30s leaderboard</span>
          <input id="tt-initials" maxlength="3" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="AAA" aria-label="Your initials">
          <button class="mac-btn mac-btn--primary" type="submit">Post</button>
        </form>
        <div class="tt__board" id="tt-boardwrap"><span class="mono muted">Global top 10 · 30 seconds</span><ol class="board__list" id="tt-board"><li class="muted">Loading…</li></ol></div>
        <button class="mac-btn mac-btn--primary tt__again" type="button" data-restart>Next test <kbd>Enter</kbd></button>
      </section>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/type.js" defer></script>""")
open(P + 'type.html', 'w').write(typep)

exec(open(os.path.join(HERE, 'finder_page.py')).read())
exec(open(os.path.join(HERE, 'guest_page.py')).read())
exec(open(os.path.join(HERE, 'fun_pages.py')).read())

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

# ------------------------------------------------------------------ Settings
walls = [("butter", "Butter"), ("honey", "Honey"), ("lemon", "Lemon"), ("sunset", "Sunset"), ("paper", "Paper")]
wall_opts = "".join(f'<button class="wallopt" type="button" data-wall="{k}" aria-label="{n}"><span class="wallopt__swatch wall-{k}"></span><span>{n}</span></button>' for k, n in walls)
settings = app_page("System Settings · Hamza", "Make this site yours: theme, wallpaper, dock and more.", "settings", "settings", f"""  <main class="win app-win settings-win">
    {bar("System Settings")}
    <div class="win__body settings">
      <nav class="settings__side" aria-label="Settings sections">
        <div class="settings__me"><span class="orb orb--sm" aria-hidden="true">h</span><div><b>Hamza</b><span class="muted">byhamza.dev</span></div></div>
        <a href="#appearance" class="is-active"><i class="si si--app"></i>Appearance</a>
        <a href="#wallpaper"><i class="si si--wall"></i>Wallpaper</a>
        <a href="#dock"><i class="si si--dock"></i>Dock</a>
        <a href="#sound"><i class="si si--sound"></i>Sound</a>
        <a href="#access"><i class="si si--access"></i>Accessibility</a>
        <a href="#about-site"><i class="si si--about"></i>About</a>
      </nav>
      <div class="settings__main">
        <section id="appearance" class="pane">
          <h2>Appearance</h2>
          <div class="group">
            <div class="row"><span>Appearance</span>
              <div class="seg" role="radiogroup" aria-label="Appearance">
                <button type="button" data-set="theme" data-val="light" role="radio"><span class="seg__prev seg__prev--light"></span>Light</button>
                <button type="button" data-set="theme" data-val="dark" role="radio"><span class="seg__prev seg__prev--dark"></span>Dark</button>
                <button type="button" data-set="theme" data-val="auto" role="radio"><span class="seg__prev seg__prev--auto"></span>Auto</button>
              </div>
            </div>
            <div class="row"><span>Film grain<small>A faint texture over everything</small></span><button class="switch" type="button" role="switch" data-set="grain"></button></div>
            <div class="row"><span>Live cursors<small>See other visitors moving around, and let them see you</small></span><button class="switch" type="button" role="switch" data-set="live"></button></div>
          </div>
        </section>
        <section id="wallpaper" class="pane">
          <h2>Wallpaper</h2>
          <div class="group"><div class="walls">{wall_opts}</div></div>
        </section>
        <section id="dock" class="pane">
          <h2>Dock</h2>
          <div class="group">
            <div class="row"><span>Size</span><input class="slider" type="range" min="40" max="64" step="2" data-set="dock" aria-label="Dock size"></div>
            <div class="row"><span>Magnification<small>Icons grow as you hover</small></span><button class="switch" type="button" role="switch" data-set="magnify"></button></div>
          </div>
        </section>
        <section id="sound" class="pane">
          <h2>Sound</h2>
          <div class="group">
            <div class="row"><span>Interface sounds<small>Clicks, sparks and the game</small></span><button class="switch" type="button" role="switch" data-set="sound"></button></div>
          </div>
        </section>
        <section id="access" class="pane">
          <h2>Accessibility</h2>
          <div class="group">
            <div class="row"><span>Reduce motion<small>Turns off smooth scrolling and most animation</small></span><button class="switch" type="button" role="switch" data-set="motion"></button></div>
          </div>
        </section>
        <section id="about-site" class="pane">
          <h2>About</h2>
          <div class="group">
            <div class="row"><span>Built with</span><span class="muted">HTML, CSS, JavaScript, Three.js</span></div>
            <div class="row"><span>Hosted on</span><span class="muted">Cloudflare Workers + D1</span></div>
            <div class="row"><span>Source</span><a class="muted" href="https://github.com/hamzaaaaaf/portfolio-website" target="_blank" rel="noopener">github.com/hamzaaaaaf ↗</a></div>
            <div class="row"><span>Reset everything</span><button class="mac-btn" type="button" data-reset>Reset</button></div>
          </div>
        </section>
      </div>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/settings.js" defer></script>""")
open(P + 'settings.html', 'w').write(settings)

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
