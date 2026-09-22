// Portfolio category sliders. Each category is a horizontal scroll container;
// these arrows are a mouse-friendly alternative to dragging. Scrolling itself
// is native, so the slider still works with this script absent — the arrows
// simply stay hidden.
(function () {
  const wraps = document.querySelectorAll(".scroller-wrap");
  if (wraps.length === 0) return;

  wraps.forEach(function (wrap) {
    const scroller = wrap.querySelector(".scroller");
    const prev = wrap.querySelector(".scroller-prev");
    const next = wrap.querySelector(".scroller-next");
    if (!scroller || !prev || !next) return;

    function step() {
      // advance by one card, falling back to most of the viewport
      const card = scroller.querySelector(".col");
      if (!card) return scroller.clientWidth * 0.8;
      const gap = parseFloat(getComputedStyle(scroller).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function update() {
      // Snapping rests the first card against the container's padding, so
      // scrollLeft settles at the padding width rather than 0. Derive the
      // slack from that padding instead of assuming a single pixel.
      const style = getComputedStyle(scroller);
      const slack = Math.max(parseFloat(style.paddingLeft) || 0, parseFloat(style.paddingRight) || 0) + 2;
      const overflowing = scroller.scrollWidth > scroller.clientWidth + slack;
      const atStart = scroller.scrollLeft <= slack;
      const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - slack;
      prev.hidden = !overflowing || atStart;
      next.hidden = !overflowing || atEnd;
    }

    prev.addEventListener("click", function () {
      scroller.scrollBy({ left: -step(), behavior: "smooth" });
    });

    next.addEventListener("click", function () {
      scroller.scrollBy({ left: step(), behavior: "smooth" });
    });

    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // images load late and change scrollWidth, so re-check once settled
    window.addEventListener("load", update);
    update();
  });
})();
