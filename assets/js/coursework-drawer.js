// Coursework drawer (see _includes/coursework_drawer.liquid, _sass/_coursework_drawer.scss).
//
// One semester is open at a time, pulled open in place. Clicking a closed
// folder (its tab or the strip of it that shows) opens it and closes the one
// that was open; clicking an open folder's tab closes it again. All folders
// start closed.
(function () {
  const drawer = document.querySelector(".cw-drawer");
  if (!drawer) return;

  const folders = Array.from(drawer.querySelectorAll(".cw-folder"));
  const tabs = folders.map((folder) => folder.querySelector(".cw-tab"));
  if (!folders.length) return;

  // a little longer than the open/close transition in the stylesheet
  const SETTLE_MS = 650;

  let open = null;
  let holding = 0;

  function show(folder) {
    open = folder;
    folders.forEach((f, i) => {
      const isOpen = f === folder;
      f.classList.toggle("is-open", isOpen);
      tabs[i].setAttribute("aria-expanded", String(isOpen));
    });
  }

  // When a folder further up closes, everything below it rises with it, the
  // clicked tab included. Scroll along with it, frame by frame, so the tab
  // stays under the pointer and its course list unfolds where the reader is
  // already looking.
  function hold(el) {
    cancelAnimationFrame(holding);
    const anchor = el.getBoundingClientRect().top;
    const until = performance.now() + SETTLE_MS;
    (function frame(now) {
      const drift = el.getBoundingClientRect().top - anchor;
      if (drift) window.scrollBy(0, drift);
      if (now < until) holding = requestAnimationFrame(frame);
    })(performance.now());
  }

  function toggle(folder) {
    hold(folder);
    show(folder === open ? null : folder);
  }

  folders.forEach((folder, i) => {
    folder.addEventListener("click", (event) => {
      if (event.target.closest(".cw-tab")) toggle(folder);
      // the open folder's list is for reading; only its tab closes it
      else if (folder !== open) toggle(folder);
    });

    tabs[i].addEventListener("keydown", (event) => {
      const step = { ArrowUp: -1, ArrowDown: 1 }[event.key];
      if (!step) return;
      event.preventDefault();
      tabs[(i + step + tabs.length) % tabs.length].focus();
    });
  });

  drawer.classList.add("is-live");
  show(null);
})();
