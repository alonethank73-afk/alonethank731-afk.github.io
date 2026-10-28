(() => {
  document.documentElement.classList.add("js");
  const C = window.SURPRISE;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  /* ---------- ใส่ข้อความจาก config ---------- */
  document.title = fill(C.hero.title, { name: C.herName });
  $("gateLine1").textContent = C.gate.line1;
  $("gateLine2").textContent = C.gate.line2;
  $("heroKicker").textContent = C.hero.kicker;
  $("heroTitle").textContent = fill(C.hero.title, { name: C.herName });
  $("heroSub").textContent = C.hero.subtitle;
  $("counterLabel").textContent = C.hero.counterLabel;
  $("letterTitle").textContent = C.letterTitle;
  $("letterSign").textContent = fill(C.finale.signature, { from: C.fromName });
  $("memoriesTitle").textContent = C.memoriesTitle;
  $("reasonsTitle").textContent = C.reasonsTitle;
  $("reasonBtn").textContent = C.reasonsButton;
  $("teaserText").textContent = C.finale.teaser;
  $("teaserBtn").textContent = C.finale.teaserButton;
  $("question").textContent = C.finale.question;
  $("yesBtn").textContent = C.finale.yes;
  $("noBtn").textContent = C.finale.no;
  $("yesMessage").textContent = C.finale.yesMessage;
  $("finaleSign").textContent = fill(C.finale.signature, { from: C.fromName });

  /* ---------- หัวใจลอย ---------- */
  if (!reduceMotion) {
    const box = $("hearts");
    for (let i = 0; i < 18; i++) {
      const h = document.createElement("span");
      h.className = "heart";
      h.textContent = "♥";
      h.style.left = Math.random() * 100 + "%";
      h.style.fontSize = 10 + Math.random() * 22 + "px";
      h.style.animationDuration = 9 + Math.random() * 10 + "s";
      h.style.animationDelay = -Math.random() * 15 + "s";
      h.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      box.appendChild(h);
    }
  }

  /* ---------- ตัวนับวัน ---------- */
  const start = new Date(C.startDate + "T00:00:00");
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    let diff = Math.abs(Date.now() - start.getTime()) / 1000;
    if (isNaN(diff)) diff = 0;
    $("cDays").textContent = Math.floor(diff / 86400).toLocaleString("th-TH");
    $("cHours").textContent = pad(Math.floor((diff % 86400) / 3600));
    $("cMins").textContent = pad(Math.floor((diff % 3600) / 60));
    $("cSecs").textContent = pad(Math.floor(diff % 60));
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- ความทรงจำ ---------- */
  const tl = $("timeline");
  C.memories.forEach((m) => {
    const li = document.createElement("li");
    li.className = "memory reveal";
    const photo = document.createElement("div");
    photo.className = "memory__photo";
    if (m.photo) {
      const img = document.createElement("img");
      img.src = m.photo;
      img.alt = m.title;
      img.loading = "lazy";
      photo.appendChild(img);
    } else {
      photo.innerHTML = '<div class="memory__ph"><b>♥</b><span>ใส่รูปตรงนี้<br>แก้ที่ config.js</span></div>';
    }
    const body = document.createElement("div");
    const d = document.createElement("p"); d.className = "memory__date"; d.textContent = m.date;
    const t = document.createElement("h3"); t.className = "memory__title"; t.textContent = m.title;
    const p = document.createElement("p"); p.className = "memory__text"; p.textContent = m.text;
    body.append(d, t, p);
    li.append(photo, body);
    tl.appendChild(li);
  });

  /* ---------- เหตุผลที่รัก ---------- */
  let pool = [];
  let shown = 0;
  function nextReason() {
    if (!pool.length) pool = C.reasons.map((_, i) => i).sort(() => Math.random() - 0.5);
    const i = pool.pop();
    shown = (shown % C.reasons.length) + 1;
    $("reasonText").textContent = C.reasons[i];
    $("reasonCount").textContent = shown + " / " + C.reasons.length;
    const card = $("reasonCard");
    card.classList.remove("is-swap");
    void card.offsetWidth;
    card.classList.add("is-swap");
  }
  nextReason();
  $("reasonBtn").addEventListener("click", nextReason);

  /* ---------- จดหมาย (พิมพ์ทีละตัว) ---------- */
  const letterBox = $("letterBody");
  const paras = C.letter.map((txt) => {
    const p = document.createElement("p");
    letterBox.appendChild(p);
    const chars = window.Intl && Intl.Segmenter
      ? Array.from(new Intl.Segmenter("th", { granularity: "grapheme" }).segment(txt), (s) => s.segment)
      : Array.from(txt);
    return { el: p, chars, full: txt };
  });
  let typingDone = false;
  function finishTyping() {
    typingDone = true;
    paras.forEach((p) => (p.el.textContent = p.full));
    $("letterSign").classList.add("is-shown");
    $("skipTyping").hidden = true;
  }
  async function typeLetter() {
    for (const p of paras) {
      for (let i = 0; i < p.chars.length; i++) {
        if (typingDone) return;
        p.el.textContent += p.chars[i];
        await new Promise((r) => setTimeout(r, 45));
      }
    }
    finishTyping();
  }
  $("skipTyping").addEventListener("click", finishTyping);
  let typingStarted = false;
  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    if (reduceMotion) finishTyping(); else typeLetter();
  }

  /* ---------- เลื่อนแล้วค่อยปรากฏ ---------- */
  document.querySelectorAll(".section__title, .paper, .reason-card, .finale > div").forEach((el) => el.classList.add("reveal"));
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-visible");
          if (e.target.classList.contains("paper")) startTyping();
          io.unobserve(e.target);
        });
      }, { threshold: 0.15 })
    : null;
  document.querySelectorAll(".reveal").forEach((el) => {
    if (io) io.observe(el); else { el.classList.add("is-visible"); if (el.classList.contains("paper")) startTyping(); }
  });

  /* ---------- เพลง ---------- */
  const audio = $("audio");
  const musicBtn = $("music");
  if (C.music && C.music.src) {
    audio.src = C.music.src;
    $("musicLabel").textContent = C.music.title;
    musicBtn.hidden = false;
    const setState = (playing) => {
      musicBtn.classList.toggle("is-playing", playing);
      musicBtn.setAttribute("aria-pressed", String(playing));
    };
    musicBtn.addEventListener("click", () => {
      if (audio.paused) audio.play().then(() => setState(true)).catch(() => {});
      else { audio.pause(); setState(false); }
    });
    audio.addEventListener("play", () => setState(true));
    audio.addEventListener("pause", () => setState(false));
  }

  /* ---------- เปิดซอง ---------- */
  $("envelope").addEventListener("click", () => {
    const env = $("envelope");
    if (env.classList.contains("is-open")) return;
    env.classList.add("is-open");
    if (C.music && C.music.src) audio.play().catch(() => {});
    setTimeout(() => {
      $("gate").classList.add("is-gone");
      document.body.classList.remove("is-locked");
    }, reduceMotion ? 50 : 1300);
  });

  /* ---------- ไฮไลต์สุดท้าย ---------- */
  $("teaserBtn").addEventListener("click", () => {
    $("teaser").hidden = true;
    $("ask").hidden = false;
    $("ask").classList.add("is-visible");
  });

  const noBtn = $("noBtn");
  let noCount = 0;
  function dodge() {
    const r = noBtn.getBoundingClientRect();
    const yes = $("yesBtn").getBoundingClientRect();
    const w = r.width, h = r.height, m = 12;
    let x, y, tries = 0;
    do {
      x = m + Math.random() * (window.innerWidth - w - m * 2);
      y = m + Math.random() * (window.innerHeight - h - m * 2);
      tries++;
    } while (tries < 20 && x < yes.right + 20 && x + w > yes.left - 20 && y < yes.bottom + 20 && y + h > yes.top - 20);
    noBtn.classList.add("is-dodging");
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
    noCount++;
    const texts = C.finale.noTexts;
    noBtn.textContent = texts[(noCount - 1) % texts.length];
  }
  ["pointerenter", "touchstart", "focus"].forEach((ev) =>
    noBtn.addEventListener(ev, (e) => { if (ev === "touchstart") e.preventDefault(); dodge(); }, { passive: false })
  );
  noBtn.addEventListener("click", (e) => { e.preventDefault(); dodge(); });

  $("yesBtn").addEventListener("click", () => {
    $("ask").hidden = true;
    noBtn.classList.remove("is-dodging");
    $("done").hidden = false;
    $("done").classList.add("is-visible");
    if (!reduceMotion) confetti();
  });

  /* ---------- confetti ---------- */
  function confetti() {
    const cv = $("confetti");
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ["#ff6b8b", "#ffc98a", "#fff1ea", "#ff8e6b", "#c9a0ff"];
    const bits = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.55,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 4,
      s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0], heart: Math.random() < 0.3
    }));
    let frames = 0;
    (function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      bits.forEach((b) => {
        b.vy += 0.3; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.r += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.c;
        if (b.heart) { ctx.font = b.s * 2 + "px sans-serif"; ctx.fillText("♥", 0, 0); }
        else ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
        ctx.restore();
      });
      if (++frames < 260) requestAnimationFrame(loop); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }
})();
