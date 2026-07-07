/* ============================================================
   Passive Aggressive Detector™ — Incident Recovery Wizard
   Vanilla JS wizard controller
   ============================================================ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 30) : ms));

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const screens = $$(".screen");
  const progressFill = $("#progressFill");
  const progressPercent = $("#progressPercent");
  const progressStage = $("#progressStage");
  const progressBar = $("#progressBar");

  const STAGES = {
    1: { pct: 20, label: "Booting System" },
    2: { pct: 40, label: "Analyzing Message" },
    3: { pct: 60, label: "Generating Response" },
    4: { pct: 80, label: "Reviewing Patch" },
    5: { pct: 100, label: "Deploying Patch" },
    6: { pct: 100, label: "Recovery Complete" },
  };

  let current = 1;
  const visited = new Set();

  /* -------- progress bar -------- */
  function setProgress(screenNo) {
    const s = STAGES[screenNo] || STAGES[1];
    progressFill.style.width = s.pct + "%";
    progressPercent.textContent = s.pct + "%";
    progressStage.textContent = s.label;
    progressBar.setAttribute("aria-valuenow", String(s.pct));
  }

  /* -------- screen switching -------- */
  function showScreen(no) {
    screens.forEach((sc) => sc.classList.remove("is-active"));
    const target = screens.find((sc) => sc.dataset.screen === String(no));
    if (!target) return;
    target.classList.add("is-active");
    current = no;
    setProgress(no);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

    if (!visited.has(no)) {
      visited.add(no);
      runScreen(no);
    }
  }

  function next() {
    if (current < 6) showScreen(current + 1);
  }

  /* -------- block-style progress bar renderer -------- */
  function blockBar(pct, total = 14) {
    const filled = Math.round((pct / 100) * total);
    return "█".repeat(filled) + "░".repeat(total - filled);
  }

  async function animateLoader(blocksEl, pctEl, duration, onDone) {
    const start = performance.now();
    return new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        // ease-out
        const eased = 1 - Math.pow(1 - t, 2);
        const pct = Math.round(eased * 100);
        blocksEl.textContent = blockBar(pct);
        pctEl.textContent = pct + "%";
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          blocksEl.textContent = blockBar(100);
          pctEl.textContent = "100%";
          onDone && onDone();
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  /* -------- typewriter for log lines -------- */
  async function typeLogLine(container, text, opts = {}) {
    const line = document.createElement("div");
    line.className = "log-line";
    container.appendChild(line);
    if (reduceMotion) {
      line.textContent = text;
    } else {
      for (let i = 0; i < text.length; i++) {
        line.textContent = text.slice(0, i + 1);
        await sleep(opts.speed || 16);
      }
    }
    if (opts.markDone) line.classList.add("done");
    container.scrollTop = container.scrollHeight;
  }

  /* ================= SCREEN 1 ================= */
  async function screen1() {
    const log = $("#log1");
    const blocks = $("#blocks1");
    const pct = $("#pct1");
    const btn = $("#btn1");
    blocks.textContent = blockBar(0);

    const logs = [
      "Initializing emotional damage scanner...",
      "Loading overthinking module...",
      "Checking tone mismatch...",
    ];
    for (const l of logs) {
      await typeLogLine(log, l, { markDone: true });
      await sleep(180);
    }
    await animateLoader(blocks, pct, reduceMotion ? 100 : 2600);
    await sleep(250);
    btn.classList.remove("hidden");
    btn.classList.add("reveal");
    btn.onclick = next;
  }

  /* ================= SCREEN 3 ================= */
  async function screen3() {
    const log = $("#log3");
    const blocks = $("#blocks3");
    const pct = $("#pct3");
    const btn = $("#btn3");
    blocks.textContent = blockBar(0);
    pct.textContent = "0%";

    // milestones: [percent, text]
    const steps = [
      [8, "Thinking..."],
      [27, "Wait..."],
      [48, "That sounded wrong."],
      [72, "Searching common sense..."],
      [91, "Re-routing through emotional intelligence..."],
      [100, "Correct response found."],
    ];

    let from = 0;
    for (const [target, text] of steps) {
      await typeLogLine(log, text);
      await animateSegment(blocks, pct, from, target, reduceMotion ? 60 : 520);
      from = target;
      await sleep(reduceMotion ? 10 : 260);
    }

    await sleep(200);
    btn.classList.remove("hidden");
    btn.classList.add("reveal");
    btn.onclick = next;
  }

  function animateSegment(blocksEl, pctEl, from, to, duration) {
    const start = performance.now();
    return new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 2);
        const pct = Math.round(from + (to - from) * eased);
        blocksEl.textContent = blockBar(pct);
        pctEl.textContent = pct + "%";
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  /* ================= SCREEN 4 ================= */
  function screen4() {
    const deployBtn = $("#deployBtn");
    const abortBtn = $("#abortBtn");
    const abortErr = $("#abortErr");

    deployBtn.onclick = next;
    abortBtn.onclick = () => {
      abortErr.classList.remove("hidden");
      // re-trigger shake if already shown
      abortErr.style.animation = "none";
      void abortErr.offsetWidth;
      abortErr.style.animation = "";
    };
  }

  /* ================= SCREEN 5 ================= */
  const APOLOGY =
`Sorryyy,

I genuinely didn't mean it like that.

My brain somehow took a very stupid route to say:

"Wait... didn't we already spend an hour talking about Voicemails for Isabelle earlier?" 😭

I accept full responsibility for being an idiot lol.`;

  async function screen5() {
    const items = $$("#checklist li[data-check]");
    const apologyBox = $("#apologyBox");
    const apologyText = $("#apologyText");
    const acceptBtn = $("#acceptBtn");

    await sleep(300);
    for (const li of items) {
      li.classList.add("ticked");
      await sleep(reduceMotion ? 20 : 650);
    }

    await sleep(300);
    apologyBox.classList.remove("hidden");

    // typewriter the apology
    if (reduceMotion) {
      apologyText.textContent = APOLOGY;
      apologyText.classList.add("typed");
    } else {
      for (let i = 0; i < APOLOGY.length; i++) {
        apologyText.textContent = APOLOGY.slice(0, i + 1);
        await sleep(22);
      }
      apologyText.classList.add("typed");
    }

    await sleep(250);
    acceptBtn.classList.remove("hidden");
    acceptBtn.classList.add("reveal");
    acceptBtn.onclick = next;
  }

  /* -------- run a screen's animation sequence -------- */
  function runScreen(no) {
    switch (no) {
      case 1: screen1(); break;
      case 3: screen3(); break;
      case 4: screen4(); break;
      case 5: screen5(); break;
      default: break;
    }
  }

  /* -------- generic "next" buttons (screen 2) -------- */
  $$("[data-next]").forEach((b) => (b.onclick = next));

  /* -------- restart -------- */
  $("#restartBtn").onclick = () => {
    // reset state
    visited.clear();
    // reset screen 1
    $("#log1").innerHTML = "";
    $("#blocks1").textContent = "";
    $("#pct1").textContent = "0%";
    $("#btn1").classList.add("hidden");
    // reset screen 3
    $("#log3").innerHTML = "";
    $("#blocks3").textContent = "";
    $("#pct3").textContent = "0%";
    $("#btn3").classList.add("hidden");
    // reset screen 4
    $("#abortErr").classList.add("hidden");
    // reset screen 5
    $$("#checklist li").forEach((li) => li.classList.remove("ticked"));
    $("#apologyBox").classList.add("hidden");
    $("#apologyText").textContent = "";
    $("#apologyText").classList.remove("typed");
    $("#acceptBtn").classList.add("hidden");

    showScreen(1);
    visited.add(1);
    runScreen(1);
  };

  /* -------- boot -------- */
  visited.add(1);
  setProgress(1);
  screen1();
})();
