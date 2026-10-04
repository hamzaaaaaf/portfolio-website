# Generates public/index.html, the Xbox 360 "Metro" dashboard.
# Run: python3 tools/gen/dashboard.py
#
# Each hub is a 4 x 3 grid (columns 175/231/231/175 at 720p, like the real
# dashboard). A tile's place is its grid-area: "row / col / row-end / col-end".
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public', 'index.html')
ICONS = open(os.path.join(HERE, 'icons.svg.part')).read()


def I(name, cls='tile__ico'):
    return f'<svg class="{cls}"><use href="#i-{name}"/></svg>'


def tile(area, cls, inner, label, attrs='type="button"', tag='button'):
    return f'<{tag} class="tile {cls}" {attrs} style="--a:{area}">{inner}<span class="tile__label">{label}</span></{tag}>'


def opens(target):
    return f'type="button" data-open="{target}"'


def ext(url):
    return f'href="{url}" target="_blank" rel="noopener"'


SNAKE = '<span class="art"><i></i><i></i><i></i><i></i><i></i><b></b></span>'
DOOM = '<span class="art"><span class="doom-word">DOOM</span><span class="doom-sub">{sub}</span></span>'

HUBS = {
    'bing': [
        '<div class="tile tile--searchbox" style="--a:1/1/2/4">' + I('search') + '<input type="search" data-search placeholder="search byhamza.dev" aria-label="Search byhamza.dev" autocomplete="off" spellcheck="false"></div>',
        '<div class="results" data-results style="--a:2/1/4/4"></div>',
        tile('2/4/3/5', 'tile--search', I('search'), 'bing', 'type="button" data-focus-search'),
    ],
    'home': [
        tile('1/1/2/2', 'tile--img art-doom', DOOM.format(sub=''), 'Play DOOM', opens('doom')),
        tile('2/1/3/2', 'tile--sys', I('pin'), 'My Pins', opens('pins')),
        tile('3/1/4/2', 'tile--sys', I('clock'), 'Recent', opens('recent')),
        tile('1/2/3/4', 'tile--img art-hero', '<span class="art"><span class="pic pic--hero"><i>h</i></span><span class="hero__text"><b>Hamza</b><span>Turning curious ideas into real software.</span></span></span>', 'Hamza · Computer Science at Aston University', opens('profile')),
        tile('3/2/4/3', 'tile--img art-panic', '<span class="art"><b>!</b></span>', 'Panic Pack!', opens('projects/panic-pack')),
        tile('3/3/4/4', 'tile--img art-ie', '<span class="art"><svg><use href="#i-ie"/></svg></span>', 'Internet Explorer', opens('ie')),
        tile('1/4/2/5', 'tile--img art-lc', '<span class="art"><b data-live="lc">·</b><small>solved</small></span>', 'LeetCode', opens('stats')),
        tile('2/4/3/5', 'tile--img art-guest', '<span class="art" data-live="guest"></span>', 'Guestbook', opens('guestbook')),
        tile('3/4/4/5', 'tile--img art-ach', '<span class="art"><b data-gs>0</b><small>gamerscore</small></span>', 'Achievements', opens('achievements')),
    ],
    'social': [
        '<button class="tile tile--card" type="button" data-open="profile" style="--a:1/1/4/3"><span class="card"><span class="pic pic--avatar"><i>h</i></span><span class="card__body"><b class="card__tag">Hamza</b><span class="gs gs--lg"><i>G</i><span data-gs>0</span></span><span class="card__meta">Computer Science · Aston University<br>Birmingham, UK</span><span class="card__recent" data-recent></span></span></span><span class="tile__label">Hamza</span></button>',
        tile('1/3/2/4', 'tile--sys tile--online', I('people') + '<b class="tile__n" data-online-n>1</b>', 'Online Now', 'type="button" data-focus-only'),
        tile('2/3/3/4', 'tile--img art-guest', '<span class="art" data-live="guest2"></span>', 'Guestbook', opens('guestbook')),
        tile('3/3/4/4', 'tile--sys', I('spark') + '<b class="tile__n" data-sparks>·</b>', 'Leave a Spark', 'type="button" data-spark'),
        tile('1/4/2/5', 'tile--img art-linkedin', I('in'), 'LinkedIn', ext('https://www.linkedin.com/in/hamza-faisal-125833263/') + ' data-ach="networker"', 'a'),
        tile('2/4/3/5', 'tile--img art-github', I('git'), 'GitHub', ext('https://github.com/hamzaaaaaf') + ' data-ach="source"', 'a'),
        tile('3/4/4/5', 'tile--sys', I('mail'), 'Message Hamza', 'href="mailto:hello@byhamza.dev" data-ach="messenger"', 'a'),
    ],
    'games': [
        tile('1/1/3/2', 'tile--sys', I('games'), 'My Games', opens('library')),
        tile('3/1/4/2', 'tile--sys', I('trophy'), 'Achievements', opens('achievements')),
        tile('1/2/3/4', 'tile--img art-doom art-doom--big', DOOM.format(sub='Knee-Deep in the Dead'), 'DOOM · Play now', opens('doom')),
        tile('3/2/4/3', 'tile--img art-fav', '<span class="art" data-fav="0"></span>', '·', opens('library') + ' data-favlabel="0"'),
        tile('3/3/4/4', 'tile--img art-fav', '<span class="art" data-fav="1"></span>', '·', opens('library') + ' data-favlabel="1"'),
        tile('1/4/2/5', 'tile--img art-fav', '<span class="art" data-fav="2"></span>', '·', opens('library') + ' data-favlabel="2"'),
        tile('2/4/3/5', 'tile--img art-fav', '<span class="art" data-fav="3"></span>', '·', opens('library') + ' data-favlabel="3"'),
        tile('3/4/4/5', 'tile--sys', I('clock'), 'Recently Played', opens('recent')),
    ],
    'projects': [
        tile('1/1/2/2', 'tile--sys', I('folder'), 'All Projects', opens('projects')),
        tile('2/1/3/2', 'tile--sys', I('chart'), 'Stats', opens('stats')),
        tile('3/1/4/2', 'tile--sys', I('user'), 'Profile', opens('profile')),
        tile('1/2/3/4', 'tile--img art-panic art-panic--big', '<span class="art"><b>!</b><span class="hero__text"><b>Panic Pack!</b><span>Grab everything on the list before the taxi leaves.</span></span></span>', 'Panic Pack! · Godot 4', opens('projects/panic-pack')),
        tile('3/2/4/3', 'tile--img art-heart', '<span class="art"><b>♡</b></span>', 'Instagram Unliker', opens('projects/instagram-unliker')),
        tile('3/3/4/4', 'tile--img art-site', '<span class="art"><b>h</b></span>', 'byhamza.dev', opens('projects/this-site')),
        tile('1/4/2/5', 'tile--img art-github', I('git'), 'GitHub', ext('https://github.com/hamzaaaaaf') + ' data-ach="source"', 'a'),
        tile('2/4/3/5', 'tile--img art-lc art-lc--sm', '<span class="art"><b>{ }</b></span>', 'LeetCode', ext('https://leetcode.com/u/hamza57/'), 'a'),
        tile('3/4/4/5', 'tile--img art-linkedin', I('in'), 'LinkedIn', ext('https://www.linkedin.com/in/hamza-faisal-125833263/') + ' data-ach="networker"', 'a'),
    ],
    'apps': [
        tile('1/1/2/2', 'tile--sys', I('term'), 'Terminal', opens('terminal')),
        tile('2/1/3/2', 'tile--sys', I('kaleido'), 'Kaleidoscope', opens('draw')),
        tile('3/1/4/2', 'tile--sys', I('book'), 'Guestbook', opens('guestbook')),
        tile('1/2/3/4', 'tile--img art-ie art-ie--big', '<span class="art"><svg><use href="#i-ie"/></svg></span>', 'Internet Explorer', opens('ie')),
        tile('3/2/4/3', 'tile--img art-doom', DOOM.format(sub=''), 'DOOM', opens('doom')),
        tile('3/3/4/4', 'tile--sys', I('chart'), 'Stats', opens('stats')),
        tile('1/4/2/5', 'tile--sys', I('trophy'), 'Achievements', opens('achievements')),
        tile('2/4/3/5', 'tile--sys', I('games'), 'My Games', opens('library')),
        tile('3/4/4/5', 'tile--sys', I('info'), 'System Info', opens('system')),
    ],
    'settings': [
        tile('1/1/2/2', 'tile--sys', I('user'), 'Profile', opens('profile')),
        tile('2/1/3/2', 'tile--sys', I('info'), 'System', opens('system')),
        tile('3/1/4/2', 'tile--sys', I('power'), 'Turn Off', 'type="button" data-poweroff'),
        tile('1/2/2/3', 'tile--sys', I('moon'), 'Theme: <b data-setval="theme"></b>', 'type="button" data-set="theme"'),
        tile('2/2/3/3', 'tile--sys', I('palette'), 'Colour: <b data-setval="skin"></b>', 'type="button" data-set="skin"'),
        tile('3/2/4/3', 'tile--sys', I('sound'), 'Sound: <b data-setval="sound"></b>', 'type="button" data-set="sound"'),
        tile('1/3/2/4', 'tile--sys', I('guide'), 'Startup: <b data-setval="bootlogo"></b>', 'type="button" data-set="bootlogo"'),
        tile('2/3/3/4', 'tile--sys', I('motion'), 'Motion: <b data-setval="motion"></b>', 'type="button" data-set="motion"'),
        tile('3/3/4/4', 'tile--sys', I('people'), 'Online: <b data-setval="live"></b>', 'type="button" data-set="live"'),
        tile('1/4/2/5', 'tile--sys', I('trophy'), 'Achievements', opens('achievements')),
        tile('2/4/3/5', 'tile--sys', I('pad'), 'Controllers', opens('system')),
        tile('3/4/4/5', 'tile--sys', I('clock'), 'Recent', opens('recent')),
    ],
}

panes = []
for hub, tiles in HUBS.items():
    panes.append(f'    <section class="pane" data-pane="{hub}" aria-label="{hub}">\n      <div class="tiles">\n        ' + '\n        '.join(tiles) + '\n      </div>\n    </section>')
pivots = '\n'.join(f'      <button class="pivot" type="button" role="tab" data-tab="{h}">{h}</button>' for h in HUBS)

GUIDE_TABS = {
    'Games & Apps': [('open', 'achievements', 'Achievements'), ('open', 'recent', 'Recently Played'), ('open', 'library', 'My Games'), ('open', 'doom', 'DOOM'), ('open', 'ie', 'Internet Explorer'), ('open', 'pins', 'My Pins')],
    'Media': [('open', 'profile', 'Hamza’s Profile'), ('open', 'projects', 'Projects'), ('open', 'stats', 'Stats'), ('open', 'guestbook', 'Guestbook'), ('open', 'draw', 'Kaleidoscope'), ('open', 'terminal', 'Terminal')],
    'Settings': [('set', 'theme', 'Theme'), ('set', 'skin', 'Colour'), ('set', 'sound', 'Sound'), ('set', 'bootlogo', 'Startup Animation'), ('go', 'settings', 'System Settings'), ('poweroff', '', 'Turn Off Console')],
}
gtabs = ''.join(f'<button type="button" data-gtab="{i}">{t}</button>' for i, t in enumerate(GUIDE_TABS))
glists = ''
for i, items in enumerate(GUIDE_TABS.values()):
    rows = []
    for kind, target, label in items:
        attr = {'open': f'data-open="{target}"', 'set': f'data-set="{target}"', 'go': f'data-go="{target}"', 'poweroff': 'data-poweroff'}[kind]
        val = f'<b data-setval="{target}"></b>' if kind == 'set' else ''
        rows.append(f'<button type="button" {attr}><span>{label}</span>{val}</button>')
    glists += f'<div class="guide__list" data-glist="{i}"{"" if i == 0 else " hidden"}>' + ''.join(rows) + '</div>'

HTML = f'''<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Hamza · Computer Science</title>
  <meta name="description" content="Hamza studies Computer Science at Aston University. Projects, live stats, DOOM, a browser and achievements, on a dashboard you can drive with a controller.">
  <meta name="theme-color" content="#5a5c60">
  <link rel="canonical" href="https://byhamza.dev/">
  <meta property="og:title" content="Hamza · Computer Science">
  <meta property="og:description" content="Projects, live stats, DOOM, a browser and achievements, on a dashboard you can drive with a controller.">
  <meta property="og:url" content="https://byhamza.dev/">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://byhamza.dev/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>(function(){{var d=document.documentElement,p={{}};try{{p=JSON.parse(localStorage.getItem('prefs')||'{{}}')}}catch(e){{}}var t;try{{t=localStorage.getItem('theme')}}catch(e){{}}if(t!=='light'&&t!=='dark')t='light';d.dataset.theme=t;d.dataset.skin=p.skin==='yellow'?'yellow':'green';d.dataset.bootlogo=p.bootlogo==='hamza'?'hamza':'xbox';if(p.motion==='reduce')d.dataset.motion='reduce';if(window.top!==window.self)d.classList.add('nested');d.classList.add('js')}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Michroma&display=swap">
  <link rel="stylesheet" href="/x360.css">
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"ProfilePage","mainEntity":{{"@type":"Person","name":"Hamza","url":"https://byhamza.dev","jobTitle":"Computer Science student","affiliation":{{"@type":"CollegeOrUniversity","name":"Aston University"}},"address":{{"@type":"PostalAddress","addressLocality":"Birmingham","addressCountry":"GB"}},"sameAs":["https://github.com/hamzaaaaaf","https://www.linkedin.com/in/hamza-faisal-125833263/","https://leetcode.com/u/hamza57/"]}}}}</script>
</head>
<body data-shell="x360" data-page="home">
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <radialGradient id="orb-metal" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#d9dbd8"/><stop offset=".75" stop-color="#8d918c"/><stop offset="1" stop-color="#4c504b"/></radialGradient>
      <linearGradient id="orb-green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9ff8a"/><stop offset=".45" stop-color="#5dc21e"/><stop offset="1" stop-color="#1c7a0c"/></linearGradient>
      <symbol id="orb" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="url(#orb-metal)"/><path d="M22 18c11 3 20 12 28 24 8-12 17-21 28-24 6 6 10 13 12 21-10 1-21 7-31 18 10 11 21 17 31 18-2 8-6 15-12 21-11-3-20-12-28-24-8 12-17 21-28 24-6-6-10-13-12-21 10-1 21-7 31-18-10-11-21-17-31-18 2-8 6-15 12-21Z" fill="url(#orb-green)"/><ellipse cx="38" cy="26" rx="20" ry="10" fill="#fff" opacity=".35"/></symbol>
{ICONS}    </defs>
  </svg>

  <div class="power" hidden>
    <button class="power__btn" type="button" aria-label="Turn on">
      <span class="power__ring"><i></i><i></i><i></i><i></i></span>
      <span class="power__disc"><svg><use href="#i-power"/></svg></span>
    </button>
    <p class="power__hint">Touch the power button, or press any key</p>
  </div>

  <div class="boot" aria-hidden="true" hidden>
    <div class="boot__sky"></div>
    <div class="boot__sphere"></div>
    <div class="boot__burst"><i></i><i></i></div>
    <div class="boot__orb"><svg viewBox="0 0 100 100"><use href="#orb"/></svg></div>
    <div class="boot__ring"></div>
    <div class="boot__mark"><b>XBOX</b><span>360</span></div>
    <div class="boot__mark boot__mark--hamza"><b>HAMZA</b><span>360</span></div>
  </div>

  <header class="xbar">
    <nav class="pivots" aria-label="Dashboard" role="tablist">
{pivots}
    </nav>
    <div class="me">
      <span class="me__live" data-online hidden></span>
      <button class="me__card" type="button" data-guide aria-label="Open the Guide">
        <span class="me__text"><b>Hamza</b><span class="gs"><i>G</i><span data-gs>0</span></span></span>
        <span class="pic" data-logo aria-hidden="true"><i>h</i></span>
      </button>
    </div>
  </header>

  <main class="panes" id="panes">
{chr(10).join(panes)}
  </main>

  <p class="hints" data-hints aria-hidden="true"><span><i class="btn btn--a">A</i> Select</span><span><i class="btn btn--y">Y</i> Search</span><span><i class="btn btn--x">X</i> Guide</span></p>

  <section class="screen" hidden aria-live="polite">
    <div class="screen__head"><small class="screen__over"></small><nav class="screen__pivots"></nav></div>
    <div class="screen__body"></div>
    <p class="hints hints--screen" aria-hidden="true"><span><i class="btn btn--a">A</i> Select</span><span><i class="btn btn--b">B</i> Back</span></p>
  </section>

  <div class="app" hidden>
    <div class="app__body"></div>
    <div class="splash" hidden><div class="splash__art"></div><p class="splash__name"></p><div class="splash__dots"><i></i><i></i><i></i><i></i><i></i></div></div>
    <button class="guidebtn" type="button" data-guide aria-label="Open the Guide"><svg viewBox="0 0 100 100"><use href="#orb"/></svg></button>
  </div>

  <div class="guide" hidden>
    <div class="guide__panel" role="dialog" aria-label="Guide">
      <div class="guide__top">
        <span class="pic" data-logo aria-hidden="true"><i>h</i></span>
        <span class="guide__me"><b>Hamza</b><span class="gs"><i>G</i><span data-gs>0</span></span></span>
        <time class="guide__time" data-clock></time>
      </div>
      <nav class="guide__tabs">{gtabs}</nav>
      <div class="guide__lists">{glists}</div>
      <div class="guide__foot"><button type="button" data-home><i class="btn btn--y">Y</i> Xbox Home</button><button type="button" data-poweroff><i class="btn btn--x">X</i> Turn Off</button><button type="button" data-back><i class="btn btn--b">B</i> Back</button></div>
    </div>
  </div>

  <div class="dialog" hidden>
    <div class="dialog__panel" role="alertdialog" aria-modal="true">
      <h2 class="dialog__title"></h2>
      <p class="dialog__text"></p>
      <div class="dialog__btns"><button type="button" data-dialog="yes">Yes</button><button type="button" data-dialog="no">No</button></div>
      <p class="dialog__foot"><span><i class="btn btn--a">A</i> Select</span><span><i class="btn btn--b">B</i> Back</span></p>
    </div>
  </div>

  <div class="blackout" hidden></div>
  <div class="toaster" aria-live="polite"></div>
  <p class="legal">byhamza.dev is a fan-made tribute to the Xbox 360 dashboard and isn’t affiliated with Microsoft. DOOM shareware © id Software, running on Chocolate Doom (GPL).</p>

  <script src="/sound.js" defer></script>
  <script src="/pad.js" defer></script>
  <script src="/os.js" defer></script>
  <script src="/x360.js" defer></script>
</body>
</html>
'''
open(OUT, 'w').write(HTML)
print('written', OUT)
