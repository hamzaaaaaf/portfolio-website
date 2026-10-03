GB_COLORS = [("#111008", "Ink"), ("#e5484d", "Red"), ("#ff8a5c", "Orange"), ("#f5b800", "Yellow"), ("#28c840", "Green"), ("#0a64e8", "Blue"), ("#a259ff", "Purple"), ("#ff7aa2", "Pink")]
PRESSED = ' aria-pressed="true"'
gb_sw = "".join(f'<button class="swatch" type="button" data-gbc="{c}" style="--c:{c}" aria-label="{n}"{PRESSED if n == "Ink" else ""}></button>' for c, n in GB_COLORS)
guest_main = f"""    <header class="page-head" id="top">
      <span class="label mono">Guestbook</span>
      <h1 class="h1">Sign the <em>wall.</em></h1>
      <p class="lede">Draw something, leave a note. Every entry is checked by hand before it goes up.</p>
    </header>
    <section class="section section--tight" style="padding-top:0">
      <div class="gb">
        <form class="win gb__form" id="gb-form">
          {bar("New Entry")}
          <div class="win__body gb__body">
            <div class="gb__canvas"><canvas id="gb-canvas" width="300" height="300" aria-label="Drawing pad"></canvas><span class="gb__hint muted" id="gb-hint">Draw here</span></div>
            <div class="gb__tools">
              <div class="gb__swatches">{gb_sw}</div>
              <div class="gb__row">
                <button class="icon-btn" type="button" data-gbs="3">S</button><button class="icon-btn" type="button" data-gbs="7" aria-pressed="true">M</button><button class="icon-btn" type="button" data-gbs="14">L</button>
                <button class="icon-btn" type="button" id="gb-eraser">Eraser</button><button class="icon-btn" type="button" id="gb-undo">Undo</button><button class="icon-btn" type="button" id="gb-clear">Clear</button>
              </div>
            </div>
            <label class="gb__field"><span>Name</span><input id="gb-name" maxlength="24" autocomplete="nickname" required placeholder="Your name"></label>
            <label class="gb__field"><span>Note</span><input id="gb-msg" maxlength="140" autocomplete="off" placeholder="Say something nice (optional)"></label>
            <button class="mac-btn mac-btn--primary gb__send" type="submit">Sign the wall</button>
            <p class="gb__fine muted">Links and rude words are blocked. Entries appear once approved.</p>
          </div>
        </form>
        <div class="gb__wall" id="gb-wall" aria-live="polite"><p class="muted">Loading the wall…</p></div>
      </div>
    </section>"""
open(P + 'guestbook.html', 'w').write(page("Guestbook · Hamza", "Draw something and sign Hamza's guestbook.", "guestbook", "guestbook", "/guestbook", guest_main + """
  <script src="/guestbook.js" defer></script>"""))

review_main = """    <header class="page-head" id="top">
      <span class="label mono">Review</span>
      <h1 class="h1">Guestbook <em>queue.</em></h1>
      <p class="lede">Approve or delete pending entries. The key is the ADMIN_KEY secret on the Worker.</p>
    </header>
    <section class="section section--tight" style="padding-top:0">
      <form class="rv__key" id="rv-key"><input type="password" id="rv-pass" placeholder="Admin key" autocomplete="current-password"><button class="mac-btn mac-btn--primary" type="submit">Unlock</button></form>
      <div class="gb__wall" id="rv-list"></div>
    </section>"""
open(P + 'review.html', 'w').write(page("Review · Hamza", "Guestbook moderation.", "review", "", "/review", review_main + """
  <script src="/review.js" defer></script>""", '\n  <meta name="robots" content="noindex">'))
