// Front-page photo deck.
//
// On load a quarter of the cards flies in from each corner of the screen and
// gathers in a pile in the middle. The pile then drifts apart, each card
// gliding along a gentle curve to its place in one of two rows pinned to the
// top and bottom of the viewport. Hovering a card
// (or tapping it, or focusing it from the keyboard) lifts it out of its row
// and sets it down large in the centre. Scrolling past the deck reveals the
// introduction below it.
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
    return { thumb: li.dataset.thumb, full: li.dataset.full };
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
  const hint = deck.querySelector(".home-deck-hint");
  const scrollCue = deck.querySelector(".home-deck-scroll");
  const intro = document.getElementById("home-intro");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let geo = null;
  let cards = [];
  let lifted = null;
  let front = 0;
  let dealt = false;

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  // Every keyframe uses the same list of functions, so the browser can
  // interpolate position, size and tilt independently.
  function transformFor(x, y, scale, rotation) {
    return "translate(" + round(x) + "px, " + round(y) + "px) scale(" + round(scale, 4) + ") rotate(" + round(rotation || 0) + "deg)";
  }

  // rounded, so tiny floats never print in exponent form
  function round(value, places) {
    const factor = Math.pow(10, places || 2);
    return Math.round(value * factor) / factor;
  }

  function between(low, high) {
    return low + Math.random() * (high - low);
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

    // the centre stage fills the band between the rows, with room to breathe
    const bandTop = topY + size + 28;
    const bandBottom = bottomY - 44;
    // about a third of the width on a wide screen, most of it on a phone, and
    // never more than three quarters of the band, so the photo has margin
    const stageMax = wide ? vw * 0.34 : vw * 0.78;
    const stageSize = Math.max(0, Math.min((bandBottom - bandTop) * 0.75, stageMax));
    const stageBox = {
      x: (vw - stageSize) / 2,
      y: bandTop + (bandBottom - bandTop - stageSize) / 2,
      size: stageSize,
    };

    return {
      vw: vw,
      vh: vh,
      perRow: perRow,
      size: size,
      slots: slots,
      stageBox: stageBox,
      cueY: bottomY - 34,
    };
  }

  function placeChrome() {
    const box = geo.stageBox;
    stage.style.left = box.x + "px";
    stage.style.top = box.y + "px";
    stage.style.width = box.size + "px";
    stage.style.height = box.size + "px";
    if (hint) hint.style.top = box.y + box.size / 2 - 10 + "px";
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
      img.src = source.full;
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
    card.el.style.transform = transformFor(card.slot.x, card.slot.y, 1, 0);
  }

  // --- the intro: gather from the corners, then drift into place --------

  // During the intro each card is drawn at the size of the enlarged photo and
  // shrunk on its way to its slot. Drawing it large and scaling down keeps it
  // sharp; drawing it small and scaling up would blur it.

  // Where a full-size card has to be, scaled down, to sit exactly in its slot.
  // It scales about its own centre.
  function restingPlace(card) {
    const big = geo.stageBox.size;
    const shift = (geo.size - big) / 2;
    return { x: card.slot.x + shift, y: card.slot.y + shift, scale: geo.size / big };
  }

  // Plan each card's route. A quarter of the deck comes in from each corner:
  // the corner nearest the slot the card will end up in, so each quarter
  // gathers from one side and drifts back out towards it. Within a corner the
  // arrival order is random, which mixes the four streams together in the pile.
  function planIntro() {
    const big = geo.stageBox.size;
    const box = geo.stageBox;
    const corners = [[], [], [], []];
    cards.forEach(function (card) {
      const right = card.slot.col >= geo.perRow / 2;
      const bottom = card.slot.row === 1;
      corners[(bottom ? 2 : 0) + (right ? 1 : 0)].push(card);
    });

    corners.forEach(function (group, corner) {
      const right = corner % 2 === 1;
      const bottom = corner >= 2;
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const swap = group[i];
        group[i] = group[j];
        group[j] = swap;
      }
      group.forEach(function (card, rank) {
        card.route = {
          rank: rank,
          // just beyond the corner, so the card slides in from off screen
          start: {
            x: right ? geo.vw + between(20, 80) : -big - between(20, 80),
            y: bottom ? geo.vh + between(20, 80) : -big - between(20, 80),
            rotation: between(-18, 18),
          },
          // an untidy pile on the stage, the later arrivals on top
          pile: {
            x: box.x + between(-10, 10),
            y: box.y + between(-10, 10) - rank * 0.8,
            rotation: between(-6, 6),
          },
        };
        // cards landing at the same moment from different corners interleave
        card.el.style.zIndex = rank * 4 + corner + 1;
      });
    });
  }

  // Before anything moves, every card waits off screen at full size.
  function holdOffscreen() {
    const big = geo.stageBox.size;
    planIntro();
    cards.forEach(function (card) {
      const start = card.route.start;
      card.el.style.width = big + "px";
      card.el.style.height = big + "px";
      card.el.style.transform = transformFor(start.x, start.y, 1, start.rotation);
    });
  }

  function finished(animations) {
    return Promise.all(
      animations.map(function (a) {
        return a.finished;
      })
    );
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function gatherThenDrift() {
    // all four corners at once, each card a little after the one before it
    // from the same corner, so the pile builds up
    const gathering = cards.map(function (card) {
      const route = card.route;
      return card.el.animate(
        [
          { transform: transformFor(route.start.x, route.start.y, 1, route.start.rotation) },
          { transform: transformFor(route.pile.x, route.pile.y, 1, route.pile.rotation) },
        ],
        { duration: 950, delay: route.rank * 55, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }
      );
    });

    return finished(gathering)
      .then(function () {
        // the pile rests for a beat before it comes apart
        return wait(200);
      })
      .then(function () {
        return finished(
          cards.map(function (card) {
            return drift(card);
          })
        );
      });
  }

  // Drift a card from the pile to its slot along a gentle curve, shrinking as
  // it goes. Every card bends the same way, so the pile unwinds like a swirl,
  // and each sets off at a slightly different moment.
  function drift(card) {
    const from = card.route.pile;
    const to = restingPlace(card);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy) || 1;
    // the curve's control point: the midpoint, pushed out to one side
    const bend = Math.min(90, length * 0.2) * between(0.7, 1);
    const cx = from.x + dx / 2 - (dy / length) * bend;
    const cy = from.y + dy / 2 + (dx / length) * bend;
    const sway = between(-5, 5);

    const steps = 8;
    const frames = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      frames.push({
        offset: t,
        transform:
          k === steps
            ? transformFor(to.x, to.y, to.scale, 0)
            : transformFor(
                u * u * from.x + 2 * u * t * cx + t * t * to.x,
                u * u * from.y + 2 * u * t * cy + t * t * to.y,
                1 + (to.scale - 1) * t,
                from.rotation * u + sway * Math.sin(Math.PI * t)
              ),
      });
    }

    return card.el.animate(frames, {
      duration: 1200,
      delay: between(0, 250),
      easing: "cubic-bezier(.4,0,.2,1)",
      fill: "forwards",
    });
  }

  function settle() {
    cards.forEach(function (card) {
      place(card);
      card.el.style.zIndex = "";
      card.route = null;
      card.el.getAnimations().forEach(function (a) {
        a.cancel();
      });
    });
    dealt = true;
    deck.classList.remove("is-dealing");
    // the hint only makes sense once there are cards in rows to hover
    if (hint && !lifted) hint.classList.remove("is-hidden");
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

  // --- lifting a card into the centre -------------------------------------

  function show(card) {
    if (!dealt || card === lifted) return;
    if (lifted) lifted.el.classList.remove("is-lifted");
    card.el.classList.add("is-lifted");
    lifted = card;
    if (hint) hint.classList.add("is-hidden");

    const incoming = layers[1 - front];
    const outgoing = layers[front];
    front = 1 - front;

    // start from the thumbnail, which is already loaded, and upgrade to the
    // full image once it arrives
    incoming.src = card.source.thumb;
    if (card.source.full !== card.source.thumb) {
      const full = new Image();
      full.onload = function () {
        if (lifted === card) incoming.src = card.source.full;
      };
      full.src = card.source.full;
    }

    // FLIP: begin exactly over the card in its row, then travel to the stage
    const box = geo.stageBox;
    const scale = geo.size / box.size;
    const dx = card.slot.x - box.x;
    const dy = card.slot.y - box.y;

    incoming.getAnimations().forEach(function (a) {
      a.cancel();
    });
    outgoing.getAnimations().forEach(function (a) {
      a.cancel();
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
      outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: reduceMotion ? 0 : 260,
        fill: "forwards",
      });
    }
  }

  function bindCard(card) {
    let intent = null;

    // a short pause before lifting, so sweeping the pointer across a row does
    // not launch every card it passes over
    card.el.addEventListener("pointerenter", function (event) {
      if (event.pointerType !== "mouse") return;
      intent = setTimeout(function () {
        show(card);
      }, 70);
    });
    card.el.addEventListener("pointerleave", function () {
      clearTimeout(intent);
    });

    // taps, and clicks that beat the hover pause
    card.el.addEventListener("click", function () {
      show(card);
    });
    card.el.addEventListener("focus", function () {
      show(card);
    });
  }

  // --- the introduction below ---------------------------------------------

  function revealIntro() {
    if (!intro) return;
    const parts = Array.from(intro.children).filter(function (el) {
      return el.tagName === "HEADER" || el.tagName === "ARTICLE";
    });
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    parts.forEach(function (el) {
      el.classList.add("home-reveal");
    });
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    parts.forEach(function (el) {
      observer.observe(el);
    });
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
    if (hint) {
      hint.textContent = finePointer ? "hover a card" : "tap a card";
      hint.classList.add("is-hidden");
    }
    revealIntro();
    watchNavbar();
    if (scrollCue && intro) {
      scrollCue.addEventListener("click", function (event) {
        event.preventDefault();
        intro.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    }

    if (reduceMotion) {
      settle();
    } else {
      deck.classList.add("is-dealing");
      holdOffscreen();
      whenPhotosReady().then(whenVisible).then(gatherThenDrift).then(settle, settle);
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
          layer.getAnimations().forEach(function (a) {
            a.cancel();
          });
          layer.removeAttribute("src");
        });
        lifted = null;
        if (hint) hint.classList.remove("is-hidden");

        geo = measure();
        placeChrome();
        build();
        settle();
      }, 150);
    });
  }
})();
