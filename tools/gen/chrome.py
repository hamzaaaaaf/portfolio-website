# One-off generator for the shared page chrome. Output is plain static HTML.
THEME_INIT = """<script>(function(){var d=document.documentElement,p={};var k=location.pathname.replace(/\\.html$/,'').replace(/\\/$/,'').slice(1),M={work:1,about:1,stats:1,play:1,type:1,arcade:1,wyr:1,draw:1,terminal:1,guestbook:1,finder:'games',settings:'settings'};if(window.top===window.self){if(M[k]){location.replace('/#'+(M[k]===1?k+(location.hash?'/'+location.hash.slice(1):''):M[k]));return}}else d.classList.add('embed');try{p=JSON.parse(localStorage.getItem('prefs')||'{}')}catch(e){}var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.dataset.theme=t;d.dataset.wall=p.wall||'butter';if(p.grain===true)d.dataset.grain='on';if(p.motion==='reduce')d.dataset.motion='reduce';if(p.dock)d.style.setProperty('--dock-size',p.dock+'px');d.classList.add('js')})();</script>"""

def head(title, desc, extra="", path="/"):
    url = "https://byhamza.dev" + path
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#ffe066">
  <link rel="canonical" href="{url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="https://byhamza.dev/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/InterTight.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/InstrumentSerif-Italic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/fonts.css">
  <link rel="stylesheet" href="/styles.css">
  {THEME_INIT}{extra}
</head>"""

LOGO = """<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="currentColor"/><text x="16" y="22.5" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="21" fill="var(--bg)">h</text></svg>"""

SUN = """<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>"""
MOON = """<svg class="moon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"/></svg>"""

CUR = ' aria-current="page"'

APPNAME = {"home": "Finder", "finder": "Finder", "work": "Work", "stats": "Stats", "about": "About", "play": "Stack", "draw": "Kaleidoscope",
           "type": "Typing Test", "arcade": "Arcade", "wyr": "Would You Rather", "terminal": "Terminal", "settings": "System Settings", "guestbook": "Guestbook", "": "Finder"}
APPHREF = {"home": "/finder"}

def menubar(current):
    items = [("Work", "/work"), ("Stats", "/stats"), ("About", "/about")]
    links = "\n      ".join(
        f'<a class="menubar__item" href="{h}"{CUR if l.lower() == current else ""}>{l}</a>' for l, h in items)
    return f"""  <header class="menubar">
    <div class="menubar__left">
      <button class="menubar__logo" type="button" data-menu="hmenu" aria-haspopup="menu" aria-label="Menu">{LOGO}</button>
      <a class="menubar__name" href="{APPHREF.get(current, "/")}">{APPNAME.get(current, "Finder")}</a>
      {links}
      <button class="menubar__item" type="button" data-menu="appsmenu" aria-haspopup="menu"{CUR if current in ("play", "draw", "type", "terminal", "guestbook", "settings", "finder", "arcade", "wyr") else ""}>Apps</button>
    </div>
    <div class="menubar__right">
      <button class="sparks" type="button" data-spark title="Leave a spark" aria-label="Leave a spark"><span class="sparks__icon" aria-hidden="true">✦</span><span class="sparks__n" data-sparks>·</span></button>
      <button class="menubar__icon" type="button" data-spotlight aria-label="Search (Ctrl K)" title="Search  ⌘K"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/></svg></button>
      <button class="theme-toggle menubar__icon" type="button" aria-label="Switch between light and dark mode" title="Light / dark">{SUN}{MOON}</button>
      <span class="menubar__clock" data-menuclock><span class="menubar__date"></span><span></span></span>
    </div>
  </header>"""

def sq(inner, bg, gid):
    return f"""<svg viewBox="0 0 56 56" aria-hidden="true"><defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">{bg}</linearGradient><clipPath id="c-{gid}"><rect width="56" height="56" rx="13"/></clipPath></defs><g clip-path="url(#c-{gid})"><rect width="56" height="56" fill="url(#{gid})"/>{inner}</g></svg>"""

def stops(a, b):
    return f'<stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/>'

ICONS = {
  "home": sq('<text x="28" y="40" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="38" fill="#2b2100">h</text>', stops("#fff3a6", "#f5b800"), "g-home"),
  "work": sq('<path d="M11 19a3 3 0 0 1 3-3h9l3 3h16a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3Z" fill="#fff" fill-opacity=".92"/><path d="M11 24h34" stroke="#4aa3f5" stroke-opacity=".35" stroke-width="2"/>', stops("#8fd0ff", "#3d97f2"), "g-work"),
  "leetcode": sq('<text x="28" y="36" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="20" fill="#ffa116">{ }</text>', stops("#34322c", "#16150f"), "g-lc"),
  "stack": sq('<rect x="15" y="34" width="26" height="7" rx="2" fill="#ff8a5c"/><rect x="17" y="26" width="23" height="7" rx="2" fill="#ffb347"/><rect x="19" y="18" width="19" height="7" rx="2" fill="#fff"/>', stops("#fff1a8", "#ffcf3a"), "g-stack"),
  "draw": sq('<g transform="translate(28 28)" style="mix-blend-mode:screen">' + "".join(f'<ellipse rx="12" ry="4.6" cx="10" transform="rotate({a})" fill="{c}" fill-opacity=".85"/>' for a, c in zip(range(0, 360, 60), ["#ffe066", "#ff8a5c", "#ff7aa2", "#ffe066", "#ff8a5c", "#ff7aa2"])) + '</g>', stops("#2a2619", "#100f0a"), "g-draw"),
  "mail": sq('<rect x="12" y="17" width="32" height="22" rx="3" fill="#fff"/><path d="m13 19 15 11 15-11" fill="none" stroke="#3d97f2" stroke-width="2.4" stroke-linejoin="round"/>', stops("#7cc8ff", "#1f7cf2"), "g-mail"),
  "github": sq('<circle cx="21" cy="17" r="3.6" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="21" cy="39" r="3.6" fill="none" stroke="#fff" stroke-width="2.6"/><circle cx="35" cy="23" r="3.6" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M21 20.6v14.8M35 26.6c0 6-14 5-14 9" fill="none" stroke="#fff" stroke-width="2.6"/>', stops("#3a4048", "#1b1f24"), "g-gh"),
  "terminal": sq('<path d="M15 21l7 7-7 7" fill="none" stroke="#ffd84d" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 36h13" stroke="#f8f1d8" stroke-width="3.4" stroke-linecap="round"/>', stops("#3b382f", "#12110c"), "g-term"),
  "settings": sq('<g transform="translate(28 28)"><circle r="13.5" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="4.2 2.9"/><circle r="9.5" fill="#8e8e93"/><circle r="4.5" fill="#fff"/></g>', stops("#c7c7cc", "#8e8e93"), "g-set"),
  "type": sq('<rect x="9" y="17" width="38" height="24" rx="5" fill="#fff" fill-opacity=".95"/>' + "".join(f'<rect x="{13 + i * 6}" y="21" width="4.4" height="4.4" rx="1.2" fill="#8e8e93"/>' for i in range(6)) + "".join(f'<rect x="{15 + i * 6}" y="27.5" width="4.4" height="4.4" rx="1.2" fill="#8e8e93"/>' for i in range(5)) + '<rect x="18" y="34" width="20" height="4" rx="1.4" fill="#ffb800"/>', stops("#ffe27a", "#f5b800"), "g-type"),
  "finder": sq('<rect x="0" y="0" width="28" height="56" fill="#5fb4ff"/><rect x="28" y="0" width="28" height="56" fill="#e8f3ff"/><path d="M28 6c-4 10-5 22-2 30h5" fill="none" stroke="#1b3a5c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="15" y="18" width="3.2" height="8" rx="1.6" fill="#1b3a5c"/><rect x="37" y="18" width="3.2" height="8" rx="1.6" fill="#1b3a5c"/><path d="M14 39c8 6 20 6 28 0" fill="none" stroke="#1b3a5c" stroke-width="2.4" stroke-linecap="round"/>', stops("#5fb4ff", "#2a8cf0"), "g-finder"),
  "guestbook": sq('<rect x="13" y="12" width="30" height="34" rx="3" fill="#fffdf3"/><path d="M18 22h20M18 28h20M18 34h12" stroke="#c9b27a" stroke-width="2" stroke-linecap="round"/><path d="M34 40l9-9 3 3-9 9h-3z" fill="#ff8a5c"/>', stops("#ff9f6b", "#e8623a"), "g-guest"),
  "arcade": sq('<rect x="10" y="20" width="36" height="20" rx="10" fill="#fff" fill-opacity=".95"/><circle cx="20" cy="30" r="4" fill="#3a2c00"/><circle cx="36" cy="27" r="3" fill="#ff5f57"/><circle cx="41" cy="32" r="3" fill="#28c840"/><rect x="18.5" y="11" width="3" height="11" rx="1.5" fill="#fff"/><circle cx="20" cy="11" r="4" fill="#ff5f57"/>', stops("#8f6bff", "#4a2fc9"), "g-arc"),
  "wyr": sq('<rect x="8" y="14" width="17" height="24" rx="3" fill="#ff8a5c"/><rect x="31" y="14" width="17" height="24" rx="3" fill="#3d97f2"/><circle cx="28" cy="26" r="7" fill="#fff"/><text x="28" y="29.5" text-anchor="middle" font-family="Inter Tight, Arial, sans-serif" font-weight="800" font-size="8" fill="#111008">VS</text>', stops("#2a2619", "#100f0a"), "g-wyr"),
  "linkedin": sq('<text x="28" y="38" text-anchor="middle" font-family="Inter Tight, Arial, sans-serif" font-weight="700" font-size="24" fill="#fff">in</text>', stops("#2d8ae6", "#0a66c2"), "g-li"),
}

def dock(current):
    items = [
        ("home", "Home", "/", ""), ("finder", "Finder", "/finder", ""), ("leetcode", "Stats", "/stats", ""),
        ("arcade", "Arcade", "/arcade", ""), ("draw", "Kaleidoscope", "/draw", ""), ("guestbook", "Guestbook", "/guestbook", ""), ("terminal", "Terminal", "/terminal", "dock__extra"),
        ("mail", "Mail", "/about#contact", ""), ("settings", "System Settings", "/settings", "dock__extra"),
        None,
        ("github", "GitHub", "https://github.com/hamzaaaaaf", "dock__extra"), ("linkedin", "LinkedIn", "https://www.linkedin.com/in/hamza-faisal-125833263/", "dock__extra"),
    ]
    out = []
    for it in items:
        if it is None:
            out.append('<span class="dock__sep dock__extra" aria-hidden="true"></span>')
            continue
        key, label, href, cls = it
        ext = ' target="_blank" rel="noopener"' if href.startswith("http") else ""
        cur = ' aria-current="page"' if key == current else ""
        out.append(f'<a class="dock__item {cls}" href="{href}"{ext}{cur} aria-label="{label}"><span class="dock__icon">{ICONS[key]}</span><span class="dock__tip">{label}</span></a>')
    return '  <nav class="dock" aria-label="Dock">\n    ' + "\n    ".join(out) + "\n  </nav>"

X = '<svg viewBox="0 0 8 8"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="#4d0000" stroke-width="1.3"/></svg>'
MIN = '<svg viewBox="0 0 8 8"><path d="M1 4h6" stroke="#5c3b00" stroke-width="1.3"/></svg>'
PLUS = '<svg viewBox="0 0 8 8"><path d="M4 1v6M1 4h6" stroke="#004d0a" stroke-width="1.3"/></svg>'
LIGHTS = f'<span class="lights"><button class="light light--r" type="button" aria-label="Close">{X}</button><button class="light light--y" type="button" aria-label="Minimise">{MIN}</button><button class="light light--g" type="button" aria-label="Zoom">{PLUS}</button></span>'

def bar(title, extra=""):
    return f'<div class="win__bar">{LIGHTS}<span class="win__title">{title}</span>{extra}</div>'

TOAST = '<div class="toast" role="status" aria-live="polite"><svg class="toast__icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="#ffd84d"/><text x="16" y="22.5" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="21" fill="#2b2100">h</text></svg><span class="toast__text"></span></div>'

COMMON_TOP = """  <div class="wallpaper" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <div class="cursor" aria-hidden="true"><span class="cursor__label">View</span></div>
  """ + TOAST

SCRIPTS = """  <script src="/main.js" defer></script>
  <script src="/os.js" defer></script>"""
