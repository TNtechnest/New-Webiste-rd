/**
 * Homepage interaction layer.
 * Keeps animation logic grouped and guarded so missing sections do not break the page.
 */
document.addEventListener("DOMContentLoaded", () => {
  initGalleryMarquee();
  initPartnerLogoTouch();

  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const baseEase = "power3.out";
  const baseDuration = 1.4;

  gsap.registerPlugin(ScrollTrigger);

  // Animate stat counters only when their matching elements exist.
  animatePerc(".percentage", 50, gsap);
  animatePerc(".kmvs-percentage", 50, gsap);
  animatePerc(".doc-percent", 50, gsap);

  // Hero entrance.
  if (document.querySelector(".hero-title")) {
    gsap
      .timeline()
      .from(".hero-title", {
        duration: baseDuration,
        ease: baseEase,
        opacity: 0,
        y: 80
      })
      .from(
        ".hero-subtitle",
        {
          duration: baseDuration * 0.7,
          ease: baseEase,
          opacity: 0,
          y: 50
        },
        "-=0.6"
      )
      .from(
        ".hero-aside",
        {
          duration: baseDuration * 0.8,
          ease: baseEase,
          opacity: 0,
          x: 80
        },
        "-=0.7"
      );
  }

  // Below-the-fold section reveals.
  animateFrom(".video-banner", {
    duration: baseDuration,
    ease: baseEase,
    opacity: 0,
    scale: 0.92,
    trigger: "#section-banner"
  }, gsap);

  initIntroCrtBoot(gsap);

  if (document.querySelector("#section-about")) {
    gsap
      .timeline({
        scrollTrigger: {
          once: true,
          start: "top 80%",
          trigger: "#section-about"
        }
      })
      .from(".about-pillars .pillar", {
        duration: baseDuration,
        ease: baseEase,
        opacity: 0,
        stagger: 0.25,
        y: 60
      })
      .from(
        ".about-description",
        {
          duration: baseDuration * 0.8,
          ease: baseEase,
          opacity: 0,
          y: 40
        },
        "-=0.7"
      )
      .from(
        ".about-cta",
        {
          duration: baseDuration * 0.7,
          ease: baseEase,
          opacity: 0,
          y: 30
        },
        "-=0.5"
      );
  }

  animateFrom(".work-grid .work-item", {
    duration: baseDuration,
    ease: baseEase,
    opacity: 0,
    stagger: 0.22,
    trigger: ".work-grid",
    y: 80
  }, gsap);

  if (document.querySelector(".doc-grid")) {
    gsap
      .timeline({
        scrollTrigger: {
          once: true,
          start: "top 80%",
          trigger: ".doc-grid"
        }
      })
      .from(".doc-image-box", {
        duration: baseDuration,
        ease: baseEase,
        opacity: 0,
        x: -100
      })
      .from(
        ".doc-cards-column",
        {
          duration: baseDuration,
          ease: baseEase,
          opacity: 0,
          y: 80
        },
        "-=0.6"
      )
      .from(
        ".doc-explore",
        {
          duration: baseDuration,
          ease: baseEase,
          opacity: 0,
          x: 100
        },
        "-=0.6"
      );
  }

  animateFrom(".contact-prompt, .contact-details", {
    duration: baseDuration,
    ease: baseEase,
    opacity: 0,
    stagger: 0.3,
    trigger: "#section-contact",
    y: 50
  }, gsap);

  animateFrom(".footer-branding", {
    duration: baseDuration,
    ease: baseEase,
    opacity: 0,
    trigger: "#section-footer",
    y: 30
  }, gsap, "top 90%");

  initFooterScrollAnimation();
});

/**
 * Animate number counters once their elements enter view.
 */
function animatePerc(selector, value, gsap) {
  const target = document.querySelector(selector);

  if (!target) {
    return;
  }

  const counter = { val: 0 };

  gsap.to(counter, {
    duration: 1.5,
    ease: "power1.out",
    scrollTrigger: {
      once: true,
      start: "top 80%",
      trigger: selector
    },
    val: value,
    onUpdate: () => {
      target.innerText = `${Math.round(counter.val)}%`;
    }
  });
}

/**
 * Helper for one-off reveal animations that depend on a section existing.
 */
function animateFrom(selector, config, gsap, start = "top 85%") {
  if (!document.querySelector(selector) || !document.querySelector(config.trigger)) {
    return;
  }

  const { trigger, ...animation } = config;

  gsap.from(selector, {
    ...animation,
    scrollTrigger: {
      once: true,
      start,
      trigger
    }
  });
}

/**
 * CRT-style boot animation for the intro statement panel.
 */
function initIntroCrtBoot(gsap) {
  const panel = document.querySelector(".intro-container-box");
  const text = document.querySelectorAll(".intro-mid-text, .intro-bottom-text");

  if (!panel || text.length === 0) {
    return;
  }

  const timeline = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      once: true,
      start: "top 72%",
      trigger: "#intro"
    }
  });

 
}

/**
 * Replay the footer lettering effect once when the footer scrolls into view.
 */
function initFooterScrollAnimation() {
  const footer = document.querySelector(".footer-section");
  const letters = document.querySelectorAll(".footer-branding .letter");

  if (!footer || letters.length === 0) {
    return;
  }

  let played = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || played) {
        return;
      }

      played = true;

      letters.forEach((letter, index) => {
        letter.classList.add("scroll-anim");
        letter.style.setProperty("--i", index);
      });

      window.setTimeout(() => {
        letters.forEach((letter) => {
          letter.classList.remove("scroll-anim");
        });
      }, 1800);
    });
  });

  observer.observe(footer);
}

/**
 * Duplicate each gallery track so the CSS marquee can loop without snapping.
 */
function initGalleryMarquee() {
  document.querySelectorAll(".gallery-track").forEach((track) => {
    if (track.dataset.loopReady === "true") {
      return;
    }

    const originals = Array.from(track.children);

    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");

      if (clone.tagName === "IMG") {
        if (!clone.hasAttribute("loading")) {
          clone.loading = "lazy";
        }

        if (!clone.hasAttribute("decoding")) {
          clone.decoding = "async";
        }

        if (!clone.hasAttribute("fetchpriority")) {
          clone.setAttribute("fetchpriority", "low");
        }
      }

      track.appendChild(clone);
    });

    const updateDistance = () => {
      const firstClone = track.children[originals.length];

      if (firstClone) {
        track.style.setProperty("--gallery-scroll-offset", `-${firstClone.offsetTop}px`);
      }
    };

    originals.forEach((item) => {
      if (item.tagName === "IMG" && !item.complete) {
        item.addEventListener("load", updateDistance, { once: true });
      }
    });

    if (window.ResizeObserver) {
      const observer = new ResizeObserver(updateDistance);
      observer.observe(track);
    } else {
      window.addEventListener("resize", updateDistance);
    }

    window.requestAnimationFrame(updateDistance);
    track.dataset.loopReady = "true";
  });
}

/**
 * Keep partner logos colored briefly on touch devices.
 */
function initPartnerLogoTouch() {
  document.querySelectorAll(".partners-logo-track img").forEach((logo) => {
    logo.addEventListener("touchstart", () => {
      logo.classList.add("logo-active");

      window.setTimeout(() => {
        logo.classList.remove("logo-active");
      }, 1400);
    }, { passive: true });
  });
}
