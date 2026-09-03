/**
 * Shared site bootstrap.
 * Handles reusable page setup such as the navbar include, footer lettering,
 * image loading defaults, and external link safety.
 */
(function () {
  let threeScriptPromise;
  let vantaScriptPromise;

  /**
   * Create one fixed animated background for the full website.
   */
  function initSiteBackground() {
    if (!shouldEnableAnimatedBackground()) {
      return;
    }

    document.body.classList.add("site-vanta-page");

    let background = document.getElementById("site-vanta-background");

    if (!background) {
      background = document.createElement("div");
      background.id = "site-vanta-background";
      background.setAttribute("aria-hidden", "true");
      document.body.prepend(background);
    }

    if (background.dataset.vantaReady === "true") {
      return;
    }

    loadScriptOnce(
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js",
      "site-three-r134",
      "three"
    )
      .then(() => loadScriptOnce(
        "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js",
        "site-vanta-dots",
        "vanta"
      ))
      .then(() => {
        if (!window.VANTA || background.dataset.vantaReady === "true") {
          return;
        }

        window.VANTA.DOTS({
          el: "#site-vanta-background",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xffffff,
          color2: 0xffffff,
          backgroundColor: 0x043537,
          size: 1.8,
          spacing: 28.00,
          showLines: false
        });

        background.dataset.vantaReady = "true";
      })
      .catch((error) => {
        console.error("Website background failed to load.", error);
      });
  }

  function shouldEnableAnimatedBackground() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(connection && connection.saveData);
    const slowConnection = Boolean(connection && /2g/.test(connection.effectiveType || ""));

    return !prefersReducedMotion && !saveData && !slowConnection;
  }

  function scheduleBackgroundInit() {
    const run = () => window.setTimeout(initSiteBackground, 120);

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 1800 });
      return;
    }

    window.setTimeout(run, 700);
  }

  function loadScriptOnce(src, id, type) {
    const existingScript = document.querySelector(`script[data-site-script="${id}"]`);

    if (existingScript) {
      return existingScript.dataset.loaded === "true"
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
          existingScript.addEventListener("load", resolve, { once: true });
          existingScript.addEventListener("error", reject, { once: true });
        });
    }

    if (type === "three" && threeScriptPromise) {
      return threeScriptPromise;
    }

    if (type === "vanta" && vantaScriptPromise) {
      return vantaScriptPromise;
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.dataset.siteScript = id;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });

    if (type === "three") {
      threeScriptPromise = promise;
    }

    if (type === "vanta") {
      vantaScriptPromise = promise;
    }

    return promise;
  }

  /**
   * Build and run the shared premium floating navigation.
   */
  function initPremiumNavbar() {
    if (document.querySelector(".cinematic-nav")) {
      return;
    }

    const nav = document.createElement("header");
    nav.className = "cinematic-nav";
    nav.setAttribute("data-nav-state", "top");
    nav.innerHTML = `
      <a class="cinematic-logo" href="index.html" aria-label="Redesign Canvas home">
        <img
          class="cinematic-logo-image"
          src="../assets/images/site/Logo/RD - white transperent  Logo.webp"
          alt="Redesign Canvas"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        >
      </a>

      <button class="cinematic-menu-toggle" type="button" aria-label="Open menu" aria-controls="cinematic-menu" aria-expanded="false">
        <span class="cinematic-menu-toggle-glow" aria-hidden="true"></span>
        <span class="cinematic-menu-lines" aria-hidden="true">
          <span></span>
          <span></span>
        </span>
      </button>
    `;

    const overlay = document.createElement("div");
    overlay.className = "cinematic-menu";
    overlay.id = "cinematic-menu";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="cinematic-menu-backdrop" aria-hidden="true"></div>
      <nav class="cinematic-menu-panel" aria-label="Primary navigation">
       
        <ul class="cinematic-menu-list">
          <li style="--item-index: 0"><a href="About.html">About</a></li>
          <li style="--item-index: 1"><a href="Work.html">Work</a></li>
          <li style="--item-index: 2"><a href="About.html#Team">Team</a></li>
          <li style="--item-index: 3"><a href="#section-contact">Connect</a></li>
        </ul>
      </nav>
    `;

    document.body.prepend(overlay);
    document.body.prepend(nav);

    const toggle = nav.querySelector(".cinematic-menu-toggle");
    const menuLinks = overlay.querySelectorAll("a");
    const focusableMenuItems = [toggle, ...menuLinks];
    const cursor = createPremiumCursor();
    let lastScrollY = window.scrollY;
    let ticking = false;
    let menuOpen = false;

    const setNavState = () => {
      const currentScrollY = Math.max(window.scrollY, 0);

      if (menuOpen) {
        nav.setAttribute("data-nav-state", "menu");
      } else if (currentScrollY <= 20) {
        nav.setAttribute("data-nav-state", "top");
      } else if (currentScrollY > lastScrollY && currentScrollY > 120) {
        nav.setAttribute("data-nav-state", "hidden");
      } else {
        nav.setAttribute("data-nav-state", "glass");
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const requestNavUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(setNavState);
        ticking = true;
      }
    };

    const openMenu = () => {
      menuOpen = true;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      nav.classList.add("is-menu-open");
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("cinematic-menu-open");
      setNavState();

      window.setTimeout(() => {
        if (menuOpen) {
          menuLinks[0]?.focus({ preventScroll: true });
        }
      }, 260);
    };

    const closeMenu = (restoreFocus = false) => {
      menuOpen = false;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.classList.remove("is-menu-open");
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cinematic-menu-open");
      setNavState();

      if (restoreFocus) {
        toggle.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener("click", () => {
      if (menuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target.classList.contains("cinematic-menu-backdrop")) {
        closeMenu(true);
      }
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href) {
          return;
        }

        closeMenu(false);

        if (href.startsWith("#")) {
          const target = document.querySelector(href);

          if (target) {
            event.preventDefault();
            window.setTimeout(() => {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 260);
          }
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuOpen) {
        closeMenu(true);
      }

      if (event.key === "Tab" && menuOpen) {
        const firstItem = focusableMenuItems[0];
        const lastItem = focusableMenuItems[focusableMenuItems.length - 1];

        if (event.shiftKey && document.activeElement === firstItem) {
          event.preventDefault();
          lastItem.focus();
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault();
          firstItem.focus();
        }
      }
    });

    window.addEventListener("scroll", requestNavUpdate, { passive: true });
    window.addEventListener("resize", requestNavUpdate);
    setNavState();

    if (cursor) {
      initPremiumCursor(cursor, nav, overlay);
    }
  }
document.querySelector(".premium-cursor")?.remove();
  function createPremiumCursor() {
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return null;
    }

    const cursor = document.createElement("div");
    cursor.className = "premium-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    return cursor;
  }

  function initPremiumCursor(cursor, nav, overlay) {
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let renderX = cursorX;
    let renderY = cursorY;

    const moveCursor = () => {
      renderX += (cursorX - renderX) * 0.2;
      renderY += (cursorY - renderY) * 0.2;
      cursor.style.transform = `translate3d(${renderX}px, ${renderY}px, 0) translate(-50%, -50%)`;
      window.requestAnimationFrame(moveCursor);
    };

    document.addEventListener("pointermove", (event) => {
      cursorX = event.clientX;
      cursorY = event.clientY;

      nav.style.setProperty("--pointer-x", `${event.clientX}px`);
      overlay.style.setProperty("--pointer-x", `${event.clientX}px`);
      overlay.style.setProperty("--pointer-y", `${event.clientY}px`);
    }, { passive: true });

    document.querySelectorAll("a, button").forEach((item) => {
      item.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
      item.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
    });

    moveCursor();
  }

  /**
   * Split footer words into individually animatable letters once per page.
   */
  function initFooterBranding() {
    const footerBranding = document.querySelector(".footer-branding");

    if (!footerBranding) {
      return;
    }

    footerBranding.querySelectorAll("span").forEach((word) => {
      if (word.dataset.split === "true") {
        return;
      }

      const text = word.textContent.trim();
      word.textContent = "";
      word.dataset.split = "true";

      [...text].forEach((char, index) => {
        const letter = document.createElement("span");
        letter.className = "letter";
        letter.style.setProperty("--i", index);
        letter.innerHTML = char === " " ? "&nbsp;" : char;
        word.appendChild(letter);
      });
    });
  }

  /**
   * Apply non-visual loading defaults to media so the pages remain identical
   * while becoming more efficient and resilient.
   */
  function enhanceMedia() {
    document.querySelectorAll("img").forEach((image) => {
      if (!image.hasAttribute("alt")) {
        image.setAttribute("alt", "");
      }

      if (!image.hasAttribute("decoding")) {
        image.decoding = "async";
      }

      if (!shouldStayEager(image) && !image.hasAttribute("loading")) {
        image.loading = "lazy";
      }

      if (!shouldStayEager(image) && !image.hasAttribute("fetchpriority")) {
        image.setAttribute("fetchpriority", "low");
      }

      if (!image.hasAttribute("width") || !image.hasAttribute("height")) {
        applyIntrinsicSize(image);
      }
    });

    document.querySelectorAll("iframe").forEach((frame) => {
      if (!frame.hasAttribute("loading")) {
        frame.loading = "lazy";
      }

      if (!frame.hasAttribute("referrerpolicy")) {
        frame.referrerPolicy = "strict-origin-when-cross-origin";
      }
    });

    document.querySelectorAll("video").forEach((video) => {
      if (!video.hasAttribute("preload")) {
        video.preload = "metadata";
      }
    });
  }

  /**
   * Ensure external links opened in a new tab do not keep an opener reference.
   */
  function secureExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const relValues = new Set(
        (link.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );

      relValues.add("noopener");
      relValues.add("noreferrer");

      link.setAttribute("rel", [...relValues].join(" "));
    });
  }

  /**
   * Fill small SEO and accessibility gaps consistently across legacy pages.
   */
  function enhanceDocumentMetadata() {
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");

    if (!canonical.parentNode) {
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = new URL(window.location.pathname || "/", "https://redesigncanvas.com").href;

    upsertMeta("og:site_name", "Redesign Canvas", "property");
    upsertMeta("og:title", document.title || "Redesign Canvas", "property");
    upsertMeta("og:type", "website", "property");
    upsertMeta("og:url", canonical.href, "property");
    upsertMeta("twitter:card", "summary_large_image", "name");

    if (!document.querySelector('script[type="application/ld+json"][data-site-schema="true"]')) {
      const schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.dataset.siteSchema = "true";
      schema.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Redesign Canvas",
        url: "https://redesigncanvas.com/",
        email: "connect@redesigncanvas.com",
        description: "Communication and design studio creating brand identities, campaigns, documentary storytelling, and social impact communication.",
        areaServed: "Global",
        sameAs: [
          "https://www.instagram.com/redesign_canvas",
          "https://www.linkedin.com/company/redesign-canvas/",
          "https://youtube.com/@redesigncanvas"
        ],
        knowsAbout: [
          "Brand storytelling",
          "Campaign strategy",
          "Social impact communication",
          "Documentary photography",
          "Design systems"
        ]
      });
      document.head.appendChild(schema);
    }
  }

  function upsertMeta(key, content, attribute) {
    const selector = `meta[${attribute}="${key}"]`;
    const meta = document.querySelector(selector) || document.createElement("meta");

    if (!meta.parentNode) {
      meta.setAttribute(attribute, key);
      document.head.appendChild(meta);
    }

    meta.content = content;
  }

  function enhanceAccessibility() {
    document.querySelectorAll(".social-icons a").forEach((link) => {
      if (link.hasAttribute("aria-label")) {
        return;
      }

      const href = link.href.toLowerCase();
      const label = href.includes("instagram")
        ? "Visit Redesign Canvas on Instagram"
        : href.includes("linkedin")
          ? "Visit Redesign Canvas on LinkedIn"
          : href.includes("youtube")
            ? "Visit Redesign Canvas on YouTube"
            : "Visit Redesign Canvas social profile";

      link.setAttribute("aria-label", label);
    });

    document.querySelectorAll("iframe").forEach((frame) => {
      if (!frame.title || frame.title === "YouTube video player") {
        frame.title = "Redesign Canvas project video";
      }
    });
  }

  /**
   * Keep key above-the-fold visuals eager and defer everything else.
   */
  function shouldStayEager(image) {
    return false;
  }

  /**
   * Stamp natural dimensions onto images when possible to reduce layout shift.
   */
  function applyIntrinsicSize(image) {
    const setDimensions = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        return;
      }

      if (!image.hasAttribute("width")) {
        image.setAttribute("width", image.naturalWidth);
      }

      if (!image.hasAttribute("height")) {
        image.setAttribute("height", image.naturalHeight);
      }
    };

    if (image.complete) {
      setDimensions();
    } else {
      image.addEventListener("load", setDimensions, { once: true });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initPremiumNavbar();
    enhanceDocumentMetadata();
    initFooterBranding();
    enhanceMedia();
    secureExternalLinks();
    enhanceAccessibility();
    scheduleBackgroundInit();
  });

  window.RedesignSite = {
    enhanceAccessibility,
    enhanceDocumentMetadata,
    enhanceMedia,
    initSiteBackground,
    initPremiumNavbar,
    initFooterBranding,
    secureExternalLinks
  };
})();


(() => {
  const track = document.getElementById("workflowTrack");
  const prev = document.getElementById("workflowPrev");
  const next = document.getElementById("workflowNext");
  const dotsBox = document.getElementById("workflowDots");

  if (!track || !prev || !next || !dotsBox || !track.parentElement) {
    return;
  }

  const wrap = track.parentElement;
  const cards = Array.from(track.children);

  const isMobile = () => matchMedia("(max-width:767px)").matches;

  cards.forEach((_, i) => {
    const dot = document.createElement("span");

    dot.className = "workflow-dot";

    dot.onclick = () => activate(i, true);

    dotsBox.appendChild(dot);
  });

  const dots = Array.from(dotsBox.children);

  let current = 0;

  function center(i) {
    const card = cards[i];

    const axis = isMobile() ? "top" : "left";
    const size = isMobile() ? "clientHeight" : "clientWidth";
    const start = isMobile() ? card.offsetTop : card.offsetLeft;

    wrap.scrollTo({
      [axis]: start - (wrap[size] / 2 - card[size] / 2),
      behavior: "smooth"
    });
  }

  function toggleUI(i) {
    cards.forEach((c, k) => c.toggleAttribute("active", k === i));

    dots.forEach((d, k) =>
      d.classList.toggle("active", k === i)
    );

    prev.disabled = i === 0;
    next.disabled = i === cards.length - 1;
  }

  function activate(i, scroll) {
    if (i === current) return;

    current = i;

    toggleUI(i);

    if (scroll) center(i);
  }

  function go(step) {
    activate(
      Math.min(Math.max(current + step, 0), cards.length - 1),
      true
    );
  }

  prev.onclick = () => go(-1);
  next.onclick = () => go(1);

  addEventListener(
    "keydown",
    (e) => {
      if (["ArrowRight", "ArrowDown"].includes(e.key)) go(1);

      if (["ArrowLeft", "ArrowUp"].includes(e.key)) go(-1);
    },
    { passive: true }
  );

  cards.forEach((card, i) => {
    card.addEventListener(
      "mouseenter",
      () =>
        matchMedia("(hover:hover)").matches &&
        activate(i, true)
    );

    card.addEventListener("click", () =>
      activate(i, true)
    );
  });

  let sx = 0,
    sy = 0;

  track.addEventListener(
    "touchstart",
    (e) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    },
    { passive: true }
  );

  track.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;

      if (isMobile() ? Math.abs(dy) > 60 : Math.abs(dx) > 60)
        go((isMobile() ? dy : dx) > 0 ? -1 : 1);
    },
    { passive: true }
  );

  if (window.matchMedia("(max-width:767px)").matches)
    dotsBox.hidden = true;

  addEventListener("resize", () => center(current));

  toggleUI(0);
  center(0);
})();

// JavaScript — உங்க existing JS-ஐ இதால் replace பண்ணுங்க
const box = document.getElementById('introBox');
const overlay = document.getElementById('spotlightOverlay');
const midText = document.getElementById('midText');
const bottomText = document.getElementById('bottomText');
const SIZE = 500;

if (box && overlay && midText && bottomText) {
  box.addEventListener('mouseenter', () => {
    overlay.style.opacity = '1';
    midText.style.backgroundSize = SIZE + 'px ' + SIZE + 'px';
    bottomText.style.backgroundSize = SIZE + 'px ' + SIZE + 'px';
  });

  box.addEventListener('mouseleave', () => {
    overlay.style.opacity = '0';
    midText.style.backgroundSize = '0px 0px';
    bottomText.style.backgroundSize = '0px 0px';
    midText.style.backgroundPosition = '50% 50%';
    bottomText.style.backgroundPosition = '50% 50%';
  });

  box.addEventListener('mousemove', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    overlay.style.background = `radial-gradient(circle ${SIZE * 0.45}px at ${px}% ${py}%, rgba(255,200,120,0.08) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`;

    const midRect = midText.getBoundingClientRect();
    midText.style.backgroundPosition = (e.clientX - midRect.left - SIZE/2) + 'px ' + (e.clientY - midRect.top - SIZE/2) + 'px';

    const botRect = bottomText.getBoundingClientRect();
    bottomText.style.backgroundPosition = (e.clientX - botRect.left - SIZE/2) + 'px ' + (e.clientY - botRect.top - SIZE/2) + 'px';
  });
}

(function () {
  const mobileHeroQuery = window.matchMedia("(max-width: 768px)");
  const hero = document.getElementById("section-hero");
  const spacer = document.querySelector(".hero-spacer");

  if (!hero || !spacer) {
    return;
  }

  let ticking = false;

  function updateMobileHeroText() {
    if (!mobileHeroQuery.matches) {
      document.body.classList.remove("mobile-hero-second-active");
      ticking = false;
      return;
    }

    const heroTop = hero.offsetTop;
    const scrollDistance = Math.max(spacer.offsetHeight, window.innerHeight);
    const progress = (window.scrollY - heroTop) / scrollDistance;

    document.body.classList.toggle("mobile-hero-second-active", progress > 0.42);
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateMobileHeroText);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  mobileHeroQuery.addEventListener?.("change", requestUpdate);
  updateMobileHeroText();
})();
