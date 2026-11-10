// Front-page photo deck.
//
// On the first load in a tab, the upper row of cards slides in from the left
// and the lower row slides in from the right. The rows frame the name in the
// middle of the first screen. After the rows settle, hovering or tapping a
// photograph shows it in the middle. Scrolling reveals the introduction below.
(function () {
  const deck = document.querySelector(".home-deck");
  const navbar = document.getElementById("navbar");
  const tucksNavbar = document.body.classList.contains("hide-navbar");

  // On a page that tucks the navbar away (hide_navbar: true), bring it back
  // once the deck has scrolled out from under it, so the bar never covers a
  // photograph. The introduction is a full screen that settles flush with the
  // top (see _home_deck.scss), so the page can always scroll that far.
  // Without a working deck there is nothing to make room for, so the bar comes
  // straight back.
  function updateNavbar() {
    if (!tucksNavbar || !navbar) return;
    const live = deck && deck.classList.contains("is-live");
    const past = !live || deck.getBoundingClientRect().bottom <= navbar.offsetHeight;
    document.body.classList.toggle("navbar-revealed", past);
  }

  if (!deck) {
    updateNavbar();
    return;
  }

  // A reload opens on the photographs again rather than wherever the page was
  // left, so the browser is told not to restore the scroll position, and any
  // #home-intro in the address is dropped before it can jump there.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const arrivedAtIntro = location.hash === "#home-intro";
  if (arrivedAtIntro) history.replaceState(null, "", location.pathname + location.search);

  const sources = Array.from(deck.querySelectorAll(".home-deck-source li")).map(function (li) {
    return li.dataset.full;
  });
  if (sources.length === 0) {
    updateNavbar();
    return;
  }

  // A fresh order on every visit, so each photo gets its turn in the rows,
  // including on a phone, where only some of them fit.
  for (let i = sources.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = sources[i];
    sources[i] = sources[j];
    sources[j] = swap;
  }

  const board = deck.querySelector(".home-deck-board");
  const stage = deck.querySelector(".home-deck-stage");
  const layers = Array.from(stage.querySelectorAll("img"));
  const title = deck.querySelector(".home-deck-title");
  const hint = deck.querySelector(".home-deck-hint");
  const scrollCue = deck.querySelector(".home-deck-scroll");
  const intro = document.getElementById("home-intro");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const introSeenKey = "home-deck-rows-hover-entrance-seen";

  let geo = null;
  let cards = [];
  let lifted = null;
  let front = 0;
  let dropTimer = null;
  let dealt = false;

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  // Only horizontal position changes during the entrance; each row stays at
  // its final height and every photograph stays square at its final size.
  function transformFor(x, y) {
    return "translate(" + round(x) + "px, " + round(y) + "px)";
  }

  // rounded, so tiny floats never print in exponent form
  function round(value, places) {
    const factor = Math.pow(10, places || 2);
    return Math.round(value * factor) / factor;
  }

  function introSeen() {
    try {
      return sessionStorage.getItem(introSeenKey) === "1";
    } catch (_) {
      return false;
    }
  }

  function markIntroSeen() {
    try {
      sessionStorage.setItem(introSeenKey, "1");
    } catch (_) {
      // Storage can be unavailable; the entrance still runs once on this load.
    }
  }

  // Work out where everything goes. The stylesheet already spans the deck
  // across the first screen; this only reads its size, plus the fixed navbar
  // and fixed footer that sit over its top and bottom edges.
  function measure() {
    const vw = deck.clientWidth;
    const vh = deck.clientHeight;
    // the footer comes after this script in the page, so look it up here
    const footer = document.querySelector("footer.fixed-bottom");
    // a tucked-away navbar is not over the deck, so the top row can sit high
    const navHeight = navbar && !tucksNavbar ? navbar.offsetHeight : 0;
    const footerHeight = footer ? footer.offsetHeight : 0;

    const wide = vw >= 900;
    const perRow = wide ? clamp(Math.floor(vw / 100), 12, 16) : clamp(Math.floor(vw / 64), 5, 11);
    const gap = wide ? 10 : 6;
    const pad = wide ? 28 : 12;
    const size = (vw - pad * 2 - gap * (perRow - 1)) / perRow;
    const topY = navHeight + (wide ? 16 : 10);
    const bottomY = vh - footerHeight - size - (wide ? 16 : 10);

    const slots = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < perRow; col++) {
        slots.push({ x: pad + col * (size + gap), y: row === 0 ? topY : bottomY, row: row, col: col });
      }
    }

    const bandTop = topY + size + 28;
    const bandBottom = bottomY - 44;
    const stageMax = wide ? vw * 0.34 : vw * 0.78;
    const stageSize = Math.max(0, Math.min((bandBottom - bandTop) * 0.75, stageMax));

    return {
      vw: vw,
      vh: vh,
      perRow: perRow,
      size: size,
      slots: slots,
      stageBox: { x: (vw - stageSize) / 2, y: (vh - stageSize) / 2, size: stageSize },
      cueY: bottomY - 34,
    };
  }

  function placeChrome() {
    const box = geo.stageBox;
    stage.style.left = box.x + "px";
    stage.style.top = box.y + "px";
    stage.style.width = box.size + "px";
    stage.style.height = box.size + "px";
    if (scrollCue) scrollCue.style.top = geo.cueY + "px";
  }

  function build() {
    board.textContent = "";
    cards = geo.slots.map(function (slot, i) {
      const source = sources[i % sources.length];
      const el = document.createElement("button");
      el.type = "button";
      el.className = "deck-card";
      el.setAttribute("aria-label", "Show photo " + ((i % sources.length) + 1));
      el.style.width = geo.size + "px";
      el.style.height = geo.size + "px";

      const img = document.createElement("img");
      img.src = source;
      img.alt = "";
      img.decoding = "async";
      el.appendChild(img);
      board.appendChild(el);

      const card = { el: el, img: img, slot: slot, source: source };
      bindCard(card);
      return card;
    });
  }

  // A card at rest: thumbnail-sized, in its slot.
  function place(card) {
    card.el.style.width = geo.size + "px";
    card.el.style.height = geo.size + "px";
    card.el.style.transform = transformFor(card.slot.x, card.slot.y);
  }

  // --- the intro: the two rows enter from opposite sides -----------------

  // Cards stay at their final size. The top row comes from the left; the
  // bottom row comes from the right. Stagger each row in its direction of
  // travel so the photographs arrive as a sequence instead of a single slab.
  function offscreenX(card) {
    return card.slot.row === 0 ? card.slot.x - geo.vw - geo.size : card.slot.x + geo.vw + geo.size;
  }

  function holdOffscreen() {
    cards.forEach(function (card) {
      card.el.style.transform = transformFor(offscreenX(card), card.slot.y);
    });
  }

  function finished(animations) {
    return Promise.all(
      animations.map(function (a) {
        return a.finished;
      })
    );
  }

  function slideRowsIn() {
    return finished(
      cards.map(function (card) {
        const rank = card.slot.row === 0 ? card.slot.col : geo.perRow - 1 - card.slot.col;
        return card.el.animate([{ transform: transformFor(offscreenX(card), card.slot.y) }, { transform: transformFor(card.slot.x, card.slot.y) }], {
          duration: 850,
          delay: rank * 45,
          easing: "cubic-bezier(.2,.7,.2,1)",
          fill: "both",
        });
      })
    );
  }

  function settle() {
    cards.forEach(function (card) {
      place(card);
      card.el.getAnimations().forEach(function (a) {
        a.cancel();
      });
    });
    dealt = true;
    deck.classList.remove("is-dealing");
    deck.classList.add("is-settled");
  }

  // Give the photos a moment to arrive so the cards do not fly in blank, but
  // never hold the intro back for long.
  function whenPhotosReady() {
    const decoded = Promise.all(
      cards.map(function (card) {
        return card.img.decode ? card.img.decode().catch(function () {}) : Promise.resolve();
      })
    );
    const timeout = new Promise(function (resolve) {
      setTimeout(resolve, 1500);
    });
    return Promise.race([decoded, timeout]);
  }

  // --- photo preview, available only after the rows have arrived ----------

  function show(card) {
    clearTimeout(dropTimer);
    if (!dealt || card === lifted || geo.stageBox.size <= 0) return;
    if (lifted) lifted.el.classList.remove("is-lifted");
    card.el.classList.add("is-lifted");
    lifted = card;
    title.classList.add("is-hidden");

    const incoming = layers[1 - front];
    const outgoing = layers[front];
    front = 1 - front;
    incoming.src = card.source;

    const box = geo.stageBox;
    const scale = geo.size / box.size;
    const dx = card.slot.x - box.x;
    const dy = card.slot.y - box.y;
    const outgoingOpacity = getComputedStyle(outgoing).opacity;
    incoming.getAnimations().forEach(function (animation) {
      animation.cancel();
    });
    outgoing.getAnimations().forEach(function (animation) {
      animation.cancel();
    });
    incoming.style.zIndex = 2;
    outgoing.style.zIndex = 1;

    incoming.animate(
      [
        { transform: "translate(" + dx + "px, " + dy + "px) scale(" + scale + ")", opacity: 1 },
        { transform: "none", opacity: 1 },
      ],
      { duration: reduceMotion ? 0 : 520, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
    );
    if (outgoing.getAttribute("src")) {
      outgoing.animate([{ opacity: outgoingOpacity }, { opacity: 0 }], {
        duration: reduceMotion ? 0 : 260,
        fill: "forwards",
      });
    }
  }

  function drop() {
    clearTimeout(dropTimer);
    if (!lifted) return;
    lifted.el.classList.remove("is-lifted");
    lifted = null;
    const layer = layers[front];
    const opacity = getComputedStyle(layer).opacity;
    layer.getAnimations().forEach(function (animation) {
      animation.cancel();
    });
    layer.animate([{ opacity: opacity }, { opacity: 0 }], {
      duration: reduceMotion ? 0 : 260,
      fill: "forwards",
    });
    title.classList.remove("is-hidden");
  }

  function dropSoon() {
    clearTimeout(dropTimer);
    dropTimer = setTimeout(drop, 450);
  }

  function bindCard(card) {
    let intent = null;
    card.el.addEventListener("pointerenter", function (event) {
      if (event.pointerType !== "mouse") return;
      intent = setTimeout(function () {
        show(card);
      }, 70);
    });
    card.el.addEventListener("pointerleave", function (event) {
      clearTimeout(intent);
      if (event.pointerType === "mouse") dropSoon();
    });
    card.el.addEventListener("click", function () {
      show(card);
    });
    card.el.addEventListener("focus", function () {
      show(card);
    });
    card.el.addEventListener("blur", dropSoon);
  }

  // --- start --------------------------------------------------------------

  // This script is included partway down the page, before the footer it has
  // to measure, so wait until the rest of the page has been parsed.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  function start() {
    deck.classList.add("is-live");
    // the deck and the introduction become a screen each (see _home_deck.scss)
    document.documentElement.classList.add("home-snap");
    window.scrollTo(0, 0);
    if (arrivedAtIntro) {
      // the browser may still jump to the anchor it was given once the page loads
      window.addEventListener(
        "load",
        function () {
          window.scrollTo(0, 0);
        },
        { once: true }
      );
    }
    geo = measure();
    placeChrome();
    build();
    hint.textContent = finePointer ? "hover a photo" : "tap a photo";
    watchNavbar();
    stepByScreen();
    deck.addEventListener("click", function (event) {
      if (!event.target.closest(".deck-card")) drop();
    });
    if (scrollCue && intro) {
      scrollCue.addEventListener("click", function (event) {
        event.preventDefault();
        intro.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

    if (reduceMotion || introSeen()) {
      if (reduceMotion) markIntroSeen();
      settle();
    } else {
      deck.classList.add("is-dealing");
      holdOffscreen();
      whenPhotosReady()
        .then(whenVisible)
        .then(function () {
          markIntroSeen();
          return slideRowsIn();
        })
        .then(settle, settle);
    }

    function watchNavbar() {
      if (!tucksNavbar) return;
      let queued = false;
      window.addEventListener(
        "scroll",
        function () {
          if (queued) return;
          queued = true;
          requestAnimationFrame(function () {
            queued = false;
            updateNavbar();
          });
        },
        { passive: true }
      );
      updateNavbar();
    }

    // One wheel or trackpad gesture moves exactly one screen: the deck, the
    // introduction, then education and teaching. Snapping alone lets a gentle
    // notch spring back and a hard swipe's momentum carry on, so a gesture
    // that would leave the current screen is taken over here: the page glides
    // to the next screen and the rest of the gesture, momentum included, is
    // swallowed. A screen taller than the window (the introduction on a phone)
    // scrolls as usual until its edge. Touch and keys keep the browser's own
    // snapping, which already stops once per swipe or key press.
    function stepByScreen() {
      const screens = [deck].concat(Array.from(document.querySelectorAll(".home-screen")));
      if (screens.length < 2) return;
      let busy = false;
      let target = 0;
      let started = 0;
      let quiet = null;

      // where each screen starts, and where it ends for a screen taller than the window
      function spans() {
        const vh = window.innerHeight;
        return screens.map(function (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          return { top: top, end: top + Math.max(0, el.offsetHeight - vh) };
        });
      }

      // The gesture is over once the page has arrived and the wheel has been
      // still for a moment, so trailing momentum cannot start another step. If
      // the page never arrives (the scroll bar was grabbed, say), give up waiting.
      function release() {
        clearTimeout(quiet);
        quiet = setTimeout(function () {
          if (Math.abs(window.scrollY - target) <= 2 || Date.now() - started > 1500) busy = false;
          else release();
        }, 220);
      }

      window.addEventListener(
        "wheel",
        function (event) {
          if (event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
          if (busy) {
            event.preventDefault();
            release();
            return;
          }
          const down = event.deltaY > 0;
          const y = window.scrollY;
          const s = spans();
          let i = 0;
          while (i + 1 < s.length && s[i + 1].top <= y + 2) i++;
          // inside a tall screen, scroll it as usual until its edge
          if (down ? y < s[i].end - 2 : y > s[i].top + 2) return;
          const next = down ? i + 1 : i - 1;
          if (next < 0 || next >= s.length) return;

          event.preventDefault();
          busy = true;
          started = Date.now();
          // coming back up into a tall screen lands on its end, where the reader left it
          target = Math.round(down ? s[next].top : s[next].end);
          window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
          release();
        },
        { passive: false }
      );
    }

    // A page opened in a background tab would otherwise play its intro unseen,
    // so keep the cards waiting until the tab is actually in front of someone.
    function whenVisible() {
      if (!document.hidden) return Promise.resolve();
      return new Promise(function (resolve) {
        document.addEventListener("visibilitychange", function onChange() {
          if (document.hidden) return;
          document.removeEventListener("visibilitychange", onChange);
          resolve();
        });
      });
    }

    // Rebuild for a new width. Height-only changes are ignored below a margin,
    // because mobile browsers resize the viewport as their toolbars come and go
    // during an ordinary scroll.
    let resizeTimer = null;
    window.addEventListener("resize", function () {
      updateNavbar();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (deck.clientWidth === geo.vw && Math.abs(deck.clientHeight - geo.vh) < 120) return;

        cards.forEach(function (card) {
          card.el.getAnimations().forEach(function (a) {
            a.cancel();
          });
        });
        layers.forEach(function (layer) {
          layer.getAnimations().forEach(function (animation) {
            animation.cancel();
          });
          layer.removeAttribute("src");
        });
        clearTimeout(dropTimer);
        lifted = null;
        front = 0;
        title.classList.remove("is-hidden");
        geo = measure();
        placeChrome();
        build();
        settle();
      }, 150);
    });
  }
})();
