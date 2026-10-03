wyr = app_page("Would You Rather · Hamza", "Would you rather play this game or that one? Vote and see what everyone else picked.", "wyr", "arcade", f"""  <main class="win app-win wyr-win">
    {bar("Would You Rather")}
    <div class="win__body wyr">
      <div class="wyr__top">
        <div class="tt__group glass"><button class="icon-btn" type="button" data-tab="play" aria-pressed="true">Play</button><button class="icon-btn" type="button" data-tab="ranks">Rankings</button></div>
        <div class="wyr__stats mono"><span><b id="wyr-count">0</b> votes</span><span><b id="wyr-streak">0</b> streak</span><span><b id="wyr-lib">·</b> games</span></div>
      </div>
      <section id="wyr-play" class="wyr__play">
        <h1 class="wyr__q">Would you rather <em>play…</em></h1>
        <div class="wyr__stage" id="wyr-stage"></div>
        <p class="wyr__verdict" id="wyr-verdict" aria-live="polite"></p>
        <p class="tt__hint mono"><kbd>←</kbd> or <kbd>→</kbd> to pick · <kbd>Space</kbd> next · <button class="linkish" type="button" id="wyr-skip">Skip this pair</button></p>
      </section>
      <section id="wyr-ranks" class="wyr__ranks" hidden>
        <h2 class="wyr__q">The crowd’s <em>rankings.</em></h2>
        <p class="muted">Every vote is a head-to-head match. Ratings work like chess Elo: beating a favourite is worth more. <b id="wyr-total">·</b> votes so far.</p>
        <ol class="wyr__rank" id="wyr-rank"></ol>
      </section>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/wyr.js" defer></script>""")
open(P + 'wyr.html', 'w').write(wyr)

arcade = app_page("Arcade · Hamza", "Every game on the site in one place: Snake, Breakout, Stack, a typing test and Would You Rather.", "arcade", "arcade", f"""  <main class="win app-win arcade-win">
    {bar("Arcade")}
    <div class="win__body arc">
      <div class="arc__cab">
        <div class="arc__top">
          <nav class="carts" aria-label="Games"><button class="cart" type="button" data-game="snake"><span class="cart__i"><svg viewBox="0 0 56 56" aria-hidden="true"><rect width="56" height="56" rx="13" fill="#1b170c"/><path d="M14 38h10V24h14v-8" fill="none" stroke="#ffd84d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="40" cy="38" r="4" fill="#ff5f57"/></svg></span><span>Snake</span></button><button class="cart" type="button" data-game="breakout"><span class="cart__i"><svg viewBox="0 0 56 56" aria-hidden="true"><rect width="56" height="56" rx="13" fill="#1b170c"/><rect x="9" y="11" width="11" height="5" rx="1.5" fill="#ff5f57"/><rect x="22" y="11" width="11" height="5" rx="1.5" fill="#ff5f57"/><rect x="35" y="11" width="11" height="5" rx="1.5" fill="#ff5f57"/><rect x="9" y="18" width="11" height="5" rx="1.5" fill="#ffbd2e"/><rect x="22" y="18" width="11" height="5" rx="1.5" fill="#ffbd2e"/><rect x="35" y="18" width="11" height="5" rx="1.5" fill="#ffbd2e"/><rect x="9" y="25" width="11" height="5" rx="1.5" fill="#28c840"/><rect x="22" y="25" width="11" height="5" rx="1.5" fill="#28c840"/><rect x="35" y="25" width="11" height="5" rx="1.5" fill="#28c840"/><circle cx="30" cy="36" r="3" fill="#fff"/><rect x="18" y="44" width="20" height="4" rx="2" fill="#ffd84d"/></svg></span><span>Breakout</span></button><a class="cart" href="/play"><span class="cart__i">{ICONS['stack']}</span><span>Stack</span></a><a class="cart" href="/type"><span class="cart__i">{ICONS['type']}</span><span>Typing</span></a><a class="cart" href="/wyr"><span class="cart__i">{ICONS['wyr']}</span><span>Rather</span></a></nav>
          <div class="arc__score mono"><span>Score <b id="arc-score">0</b></span><span>Best <b id="arc-best">0</b></span></div>
        </div>
        <div class="arc__screen"><canvas id="arc-canvas" aria-label="Arcade game"></canvas><span class="arc__scan" aria-hidden="true"></span></div>
        <p class="arc__help mono" id="arc-help"></p>
        <form class="submit glass tt__submit" id="arc-submit" hidden>
          <span class="mono">Post your score</span>
          <input id="arc-initials" maxlength="3" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="AAA" aria-label="Your initials">
          <button class="mac-btn mac-btn--primary" type="submit">Post</button>
        </form>
      </div>
      <aside class="arc__board"><span class="mono muted">Global top 10</span><ol class="board__list" id="arc-board"></ol></aside>
    </div>
  </main>""", extra_head="""
  <link rel="stylesheet" href="/apps.css">""", extra_scripts="""  <script src="/arcade.js" defer></script>""")
open(P + 'arcade.html', 'w').write(arcade)
