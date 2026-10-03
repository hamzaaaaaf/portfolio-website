# Work, Stats and About. The home page is the hand-written dashboard in public/index.html.
WINTITLE = {"work": "Work", "stats": "Stats", "about": "About Me"}
def page(title, desc, pagekey, dock_key, path, main_html, extra_head=""):
    return head(title, desc, extra_head, path) + f"""
<body class="app doc-page" data-page="{pagekey}">
{COMMON_TOP}
{menubar(pagekey)}

  <main class="win app-win doc-win">
    {bar(WINTITLE.get(pagekey, pagekey.title()))}
    <div class="win__body doc">
{main_html}
      <footer class="footer footer--slim">
        <div class="footer__bar mono">
          <span>© 2026 Hamza</span>
          <button class="footer__spark" type="button" data-spark><span aria-hidden="true">✦</span> <span data-sparks>·</span> sparks</button>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  </main>

{dock(dock_key)}

{SCRIPTS}
</body>
</html>
"""

def case(slug, title, bar_title, art, glyph, meta, overview, points, extra, links, i=0):
    pts = "".join(f"<li>{p}</li>" for p in points)
    lk = "".join(links)
    return f'''    <article class="win case reveal" id="{slug}">
      {bar(bar_title)}
      <div class="win__body">
        <div class="project__media"><div class="art {art}"></div><span class="project__glyph">{glyph}</span></div>
        <div class="case__body">
          <h2 class="case__title">{title}</h2>
          <div class="case__meta mono">{meta}</div>
          <p>{overview}</p>
          <h4>What it does</h4>
          <ul class="points">{pts}</ul>
          {extra}
          <div class="case__links">{lk}</div>
        </div>
      </div>
    </article>'''

EXT = ' target="_blank" rel="noopener"'
def BTN(href, text, primary=False):
    cls = "mac-btn mac-btn--primary" if primary else "mac-btn"
    ext = EXT if href.startswith("http") else ""
    return f'<a class="{cls}" href="{href}"{ext}>{text}</a>'

work_main = f"""    <header class="page-head" id="top">
      <span class="label mono">Work</span>
      <h1 class="h1">Selected <em>work.</em></h1>
      <p class="lede">Small projects, finished and shipped. What each one does and how it's put together.</p>
    </header>
    <section class="section section--tight" style="padding-top:0">
{case("panic-pack", "Panic Pack!", "panic-pack · Godot 4", "art--panic", "!", "<span>2026</span><span>Godot 4</span><span>GDScript</span><span>Windows</span>",
      "A first-person beat-the-clock game. Your taxi is coming. Search the house, grab everything on your packing list before time runs out, then get out the front door.",
      ["A new randomised packing list every run, pulled up with <kbd>Tab</kbd>", "A flight countdown, then the taxi arrives and you sprint for the door", "Pick up, carry and drop physics objects around the house", "Doors that open, a radio that plays, footsteps as you move", "A furnished low-poly house built from food, furniture and building asset packs"],
      '<h4>Controls</h4><dl class="keys"><dt><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></dt><dd>Move</dd><dt>Mouse</dt><dd>Look</dd><dt><kbd>E</kbd></dt><dd>Interact, pick up, drop</dd><dt><kbd>Tab</kbd></dt><dd>Hold to view the packing list</dd><dt><kbd>Space</kbd></dt><dd>Jump</dd></dl>',
      [BTN("https://github.com/hamzaaaaaf/panic-pack-/releases/tag/v0.1.0", "Download for Windows", True), BTN("https://github.com/hamzaaaaaf/panic-pack-", "View source ↗")])}
{case("instagram-unliker", "Instagram Unliker", "instagram-post-unliker · JavaScript", "art--heart", "♡", "<span>2026</span><span>JavaScript</span><span>Browser console</span>",
      "Instagram makes you unlike old posts one at a time. This script does it in bulk from your own browser, with no password, cookie or API key involved.",
      ["Enters Instagram's Select mode on the Likes page by itself", "Selects every loaded post, unlikes them and confirms the dialog", "Waits between batches so Instagram can catch up, then keeps going", "Stops cleanly with a console message if the page changes underneath it", "Logs each batch to the console so you can watch it work"],
      '<h4>How to use it</h4><ol class="points"><li>Open Your Activity, then Interactions, then Likes</li><li>Open the browser console</li><li>Paste the script and press Enter</li></ol>',
      [BTN("https://github.com/hamzaaaaaf/instagram-post-unliker", "View source ↗", True)])}
{case("this-site", "byhamza.dev", "portfolio-website · Cloudflare", "art--site", "h", "<span>2026</span><span>HTML</span><span>CSS</span><span>JavaScript</span><span>Workers</span><span>D1</span>",
      "The site you're on. A dashboard modelled on the Xbox 360, with tabs, tiles, a Guide, achievements and full controller support, served from Cloudflare's edge with no build step.",
      ["Every app opens over the dashboard, so you never leave the page", "Plug in a controller: bumpers switch tabs, A opens, B goes back", "29 achievements and a 1000 gamerscore, with sounds made in the browser", "Stack, Snake, Breakout and a typing test with global leaderboards in D1", "Live LeetCode and GitHub stats, and live visitor presence through a Durable Object"],
      "", [BTN("https://github.com/hamzaaaaaf/portfolio-website", "View source ↗", True), BTN("/terminal", "Open the terminal")])}
    </section>
    <section class="section section--tight">
      <div class="win cta reveal">
        <h2>Want the <em>numbers?</em></h2>
        <div class="cta__btns">{BTN("/stats", "See live stats", True)}{BTN("/play", "Play Stack")}</div>
      </div>
    </section>"""
open(P + 'work.html', 'w').write(page("Work · Hamza", "Case studies: Panic Pack!, Instagram Unliker and this website.", "work", "work", "/work", work_main))

stats_main = f"""    <header class="page-head" id="top">
      <span class="label mono">Stats</span>
      <h1 class="h1">By the <em>numbers.</em></h1>
      <p class="lede">Live from LeetCode, GitHub and this site.</p>
    </header>
    <section class="section section--tight" style="padding-top:0">
      <div class="stats-grid">
        <div class="win win--wide lc__win reveal" data-leetcode>
          {bar("LeetCode · hamza57")}
          <div class="win__body">
            <div class="panel">
              <span class="mono muted">Solved</span>
              <span class="lc__big" data-lc="all">·</span>
              <div class="lc__split">
                <div class="lc__diff lc__diff--easy"><span class="mono">Easy</span><b data-lc="easy">·</b></div>
                <div class="lc__diff lc__diff--med"><span class="mono">Medium</span><b data-lc="medium">·</b></div>
                <div class="lc__diff lc__diff--hard"><span class="mono">Hard</span><b data-lc="hard">·</b></div>
              </div>
            </div>
            <div class="panel">
              <span class="mono muted">Recently solved</span>
              <ol class="lc__list"></ol>
              <a class="lc__profile mono" href="https://leetcode.com/u/hamza57/" target="_blank" rel="noopener">Full profile ↗</a>
            </div>
            <div class="panel lc__cal">
              <div class="lc__cal-head">
                <span class="mono muted" data-lc="range">Last 12 months</span>
                <span class="mono muted"><b data-lc="days">·</b> active days</span>
              </div>
              <div class="lc__months mono" aria-hidden="true"></div>
              <div class="lc__heat" role="img" aria-label="LeetCode activity over the last year"></div>
              <div class="lc__legend mono muted">Less <i></i><i></i><i></i><i></i><i></i> More</div>
            </div>
          </div>
        </div>

        <div class="win reveal" data-github>
          {bar("GitHub · hamzaaaaaf")}
          <div class="win__body stat-body">
            <div><span class="mono muted">Public repos</span><div class="big-n" data-gh="repos">·</div></div>
            <div style="display:grid;gap:12px"><span class="mono muted">Languages</span><div class="gh__bar"></div><ul class="gh__langs"></ul></div>
            <div><span class="mono muted">Recently pushed</span><div class="gh__repos" style="margin-top:10px"></div></div>
          </div>
        </div>

        <div class="win reveal" data-sitestats style="--i:1">
          {bar("byhamza.dev")}
          <div class="win__body stat-body">
            <div class="tiles">
              <div class="tile"><span>Sparks</span><b data-sparks>·</b><span>left by visitors</span></div>
              <div class="tile"><span>Stack record</span><b data-site="top">·</b><span data-site="topname">·</span></div>
              <div class="tile"><span>Typing record</span><b data-site="type">·</b><span data-site="typename">·</span></div>
            </div>
            <dl class="specs" style="grid-template-columns:auto 1fr">
              <dt>My time</dt><dd data-tztext="dev">···</dd>
              <dt>Your time</dt><dd data-tztext="viewer">···</dd>
            </dl>
            <div class="cta__btns"><button class="mac-btn mac-btn--primary" type="button" data-spark>Leave a spark ✦</button><a class="mac-btn" href="/play">Beat the record</a></div>
          </div>
        </div>
      </div>
    </section>"""
open(P + 'stats.html', 'w').write(page("Stats · Hamza", "Live LeetCode, GitHub and site stats.", "stats", "leetcode", "/stats", stats_main))

about_main = f"""    <header class="page-head" id="top">
      <span class="label mono">About</span>
      <h1 class="h1">Hi, I'm <em>Hamza.</em></h1>
      <p class="lede">Second-year Computer Science student at Aston University, based in Birmingham, UK.</p>
    </header>
    <section class="section section--tight about" style="padding-top:0" id="about">
      <div class="win about__win reveal">
        {bar("About This Hamza")}
        <div class="win__body">
          <div class="orb" aria-hidden="true">h</div>
          <div>
            <h2 class="about__name">Hamza</h2>
            <p class="about__sub">Computer Science, second year</p>
            <dl class="specs">
              <dt>Studying</dt><dd>BSc Computer Science</dd>
              <dt>University</dt><dd>Aston University</dd>
              <dt>Location</dt><dd>Birmingham, UK</dd>
              <dt>Languages</dt><dd>Python, Java</dd>
              <dt>Modules</dt><dd>Data structures, algorithms, OOP, software engineering</dd>
              <dt>My time</dt><dd data-tztext="dev">···</dd>
              <dt>Your time</dt><dd data-tztext="viewer">···</dd>
              <dt>Favourite colour</dt><dd>Yellow</dd>
            </dl>
            <div class="about__btns">
              <a class="mac-btn" href="https://www.linkedin.com/in/hamza-faisal-125833263/" target="_blank" rel="noopener">More Info…</a>
              <a class="mac-btn" href="/settings">System Settings…</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="two-col">
        <div class="win reveal">
          {bar("now.md")}
          <div class="win__body pad-body">
            <ul class="now">
              <li><span class="ico">✎</span><div><b>Studying</b><span>Data structures, algorithms, OOP and software engineering at Aston.</span></div></li>
              <li><span class="ico">☕</span><div><b>Learning</b><span>Java for uni, Python for everything else.</span></div></li>
              <li><span class="ico">{{}}</span><div><b>Practising</b><span>LeetCode alongside the data structures module. <a href="/stats"><u>See the numbers</u></a>.</span></div></li>
              <li><span class="ico">▦</span><div><b>Building</b><span>This site, one window at a time.</span></div></li>
              <li><span class="ico">🎮</span><div><b>Off the clock</b><span>Games since Minecraft, found-footage horror films. <a href="/finder#games"><u>Browse the shelf</u></a>.</span></div></li>
            </ul>
          </div>
        </div>
        <div class="win reveal" style="--i:1">
          {bar("timeline")}
          <div class="win__body pad-body">
            <ol class="timeline">
              <li><span class="when">2025</span><b>Started at Aston University</b><p>BSc Computer Science, Birmingham.</p></li>
              <li><span class="when">Aug 2026</span><b>Instagram Unliker</b><p>A browser script that clears old likes in bulk.</p></li>
              <li><span class="when">Sep 2026</span><b>Panic Pack!</b><p>A first-person packing race, made in Godot.</p></li>
              <li><span class="when">Sep 2026</span><b>byhamza.dev</b><p>This site goes live.</p></li>
              <li><span class="when">Now</span><b>Second year</b><p>More modules, more projects.</p></li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section class="toolkit" aria-label="Toolkit">
      <span class="label mono toolkit__label">Toolkit</span>
      <div class="marquee" data-dir="-1">
        <div class="marquee__inner">
          <span>Python</span><i>✦</i><span><em>Java</em></span><i>✦</i><span>Godot</span><i>✦</i><span><em>Git &amp; GitHub</em></span><i>✦</i><span>Cloudflare</span><i>✦</i><span><em>SQL</em></span><i>✦</i>
        </div>
      </div>
      <div class="marquee marquee--outline" data-dir="1">
        <div class="marquee__inner">
          <span>Data Structures</span><i>✦</i><span>Algorithms</span><i>✦</i><span>Object-Oriented Design</span><i>✦</i><span>Software Engineering</span><i>✦</i>
        </div>
      </div>
    </section>

    <section class="section section--tight" id="contact">
      <div class="contact__grid">
        <div>
          <span class="label mono">Contact</span>
          <h2 class="contact__title reveal" style="margin-top:24px">Have an idea? <em>Say hello.</em></h2>
          <div class="socials">
            <a href="https://github.com/hamzaaaaaf" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/hamza-faisal-125833263/" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href="https://leetcode.com/u/hamza57/" target="_blank" rel="noopener">LeetCode ↗</a>
            <button type="button" data-copy-email>Copy email</button>
          </div>
        </div>
        <form class="win mail reveal" action="mailto:hello@byhamza.dev" method="get" data-mail>
          {bar("New Message", '<button class="mail__send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.3 10l12.4 2-12.4 2Z"/></svg></button>')}
          <div class="win__body">
            <div class="mail__row"><span>To:</span>hello@byhamza.dev</div>
            <label class="mail__row"><span>Subject:</span><input name="subject" type="text" placeholder="Hello" autocomplete="off"></label>
            <textarea name="body" aria-label="Message" placeholder="Write something…"></textarea>
            <div class="mail__foot"><button class="mac-btn mac-btn--primary" type="submit">Send</button></div>
          </div>
        </form>
      </div>
    </section>"""
open(P + 'about.html', 'w').write(page("About · Hamza", "Hamza: Computer Science at Aston University. Now, timeline, toolkit and contact.", "about", "home", "/about", about_main))
