(() => {
  const text = document.getElementById("storyText");
  const section = document.querySelector(".tn-about-hero-pin");

  if (!text || !section) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sourceWords = text.textContent.trim().split(/\s+/);
  const highlightSequence = [
    { word: "storytelling", color: "#8e6d6d" },
    { word: "design", color: "#fba243" },
    { word: "strategy", color: "#6c4c3f" },
    { word: "narratives", color: "#486758" },
    { word: "creativity", color: "#555555" },
    { word: "empathy", color: "#8e6d6d" },
    { word: "strategy", color: "#fba243" },
    { word: "human-centred", color: "#6c4c3f" },
    { word: "design", color: "#486758" }
  ];
  const fragment = document.createDocumentFragment();
  let highlightIndex = 0;

  text.textContent = "";

  sourceWords.forEach((word, index) => {
    const span = document.createElement("span");
    const normalizedWord = normalizeWord(word);
    const highlight = highlightSequence[highlightIndex];

    span.className = "tn-about-hero-word";
    span.textContent = word;

    if (highlight && normalizedWord === highlight.word) {
      span.classList.add("tn-about-hero-word-highlight");
      span.style.setProperty("--tn-about-hero-accent", highlight.color);
      highlightIndex += 1;
    }

    fragment.appendChild(span);

    if (index < sourceWords.length - 1) {
      fragment.appendChild(document.createTextNode(" "));
    }
  });

  text.appendChild(fragment);

  const spans = Array.from(text.querySelectorAll(".tn-about-hero-word"));
  const total = spans.length;

  section.style.setProperty(
    "--tn-about-hero-scroll-height",
    `${Math.max(500, total * 5.8)}vh`
  );

  if (reducedMotion) {
    spans.forEach((span) => {
      span.classList.add("revealed");
    });
    return;
  }

  let targetProgress = 0;
  let currentProgress = 0;
  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeWord(word) {
    return word.toLowerCase().replace(/^[^a-z-]+|[^a-z-]+$/g, "");
  }

  function requestRevealUpdate() {
    const rect = section.getBoundingClientRect();
    const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
    const isPinned = rect.top <= 0 && rect.bottom > window.innerHeight;
    const isFinished = rect.bottom <= window.innerHeight;

    targetProgress = clamp(-rect.top / scrollRange, 0, 1);
    section.classList.toggle("tn-about-hero-is-pinned", isPinned);
    section.classList.toggle("tn-about-hero-is-finished", isFinished);

    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateReveal);
    }
  }

  function updateReveal() {
    currentProgress += (targetProgress - currentProgress) * 0.16;

    if (targetProgress > 0.965) {
      targetProgress = 1;
      currentProgress = 1;
    }

    if (Math.abs(targetProgress - currentProgress) < 0.001) {
      currentProgress = targetProgress;
    } else {
      window.requestAnimationFrame(updateReveal);
    }

    const revealProgress = clamp(currentProgress / 0.86, 0, 1);
    const revealIndex = revealProgress * total;

    spans.forEach((span, index) => {
      if (index < revealIndex - 1) {
        span.classList.add("revealed");
        span.classList.remove("active");
      } else if (index < revealIndex) {
        span.classList.add("active");
        span.classList.remove("revealed");
      } else {
        span.classList.remove("revealed", "active");
      }
    });

    if (currentProgress === targetProgress) {
      ticking = false;
    }
  }

  requestRevealUpdate();
  window.addEventListener("scroll", requestRevealUpdate, { passive: true });
  window.addEventListener("resize", requestRevealUpdate);
})();
