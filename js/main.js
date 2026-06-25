// --- お店空間 (GALLERY) 自動スクロール × 手動加減速ハイブリッド ---
(() => {
  const slider = document.getElementById("gallery-slider");
  const track = document.getElementById("gallery-track");
  if (!slider || !track) return;

  const items = Array.from(track.children);
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    track.appendChild(clone);
  });

  let currentX = 0;
  let isDragging = false;
  let startX = 0;
  let dragStartX = 0;
  const autoSpeed = 0.8;

  function getHalfWidth() {
    const card = track.querySelector(".gallery-card");
    if (!card) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseInt(style.gap) || 24;
    return (card.offsetWidth + gap) * items.length;
  }

  function updateScroll() {
    const halfWidth = getHalfWidth();

    if (!isDragging && halfWidth > 0) {
      currentX -= autoSpeed;
      if (currentX <= -halfWidth) {
        currentX += halfWidth;
      }
    }
    if (currentX > 0 && halfWidth > 0) {
      currentX -= halfWidth;
    }

    track.style.transform = `translateX(${currentX}px)`;
    requestAnimationFrame(updateScroll);
  }

  const dragStart = (x) => {
    isDragging = true;
    startX = x;
    dragStartX = currentX;
  };

  const dragMove = (x) => {
    if (!isDragging) return;
    const deltaX = x - startX;
    currentX = dragStartX + deltaX;
  };

  const dragEnd = () => {
    isDragging = false;
  };

  slider.addEventListener("mousedown", (e) => dragStart(e.clientX));
  window.addEventListener("mousemove", (e) => dragMove(e.clientX));
  window.addEventListener("mouseup", dragEnd);

  slider.addEventListener(
    "touchstart",
    (e) => dragStart(e.touches[0].clientX),
    { passive: true },
  );
  window.addEventListener("touchmove", (e) => dragMove(e.touches[0].clientX), {
    passive: true,
  });
  window.addEventListener("touchend", dragEnd);

  requestAnimationFrame(updateScroll);
})();

// --- キャンバスアニメーション (炭火の火の粉＆熱気) ---
(() => {
  const configs = [
    {
      el: document.getElementById("hero-canvas"),
      count: 4,
      color: "rgba(217, 4, 41, 0.08)",
      isWave: true,
    },
    {
      el: document.getElementById("bg-canvas"),
      count: 35,
      color: "rgba(239, 35, 60, 0.4)",
      speedMin: 0.6,
      speedMax: 1.8,
      lengthMin: 2,
      lengthMax: 5,
      isSpark: true,
    },
  ];

  const layers = [];

  configs.forEach((cfg) => {
    const c = cfg.el;
    if (!c) return;
    const ctx = c.getContext("2d");

    const resize = () => {
      c.width = c.clientWidth || window.innerWidth;
      c.height = c.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const items = [];
    if (cfg.isSpark) {
      for (let i = 0; i < cfg.count; i++) {
        items.push({
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          radius:
            cfg.lengthMin + Math.random() * (cfg.lengthMax - cfg.lengthMin),
          speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
          wobble: Math.random() * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
        });
      }
    } else if (cfg.isWave) {
      for (let i = 0; i < cfg.count; i++) {
        items.push({
          y: c.height * 0.5 + Math.random() * c.height * 0.3,
          length: 0.0008 + Math.random() * 0.001,
          amplitude: 30 + Math.random() * 50,
          speed: 0.006 + Math.random() * 0.012,
          phase: Math.random() * 100,
        });
      }
    }

    layers.push({ c, ctx, items, cfg });
  });

  function animate() {
    layers.forEach((layer) => {
      const { ctx, c, items, cfg } = layer;
      ctx.clearRect(0, 0, c.width, c.height);

      if (cfg.isSpark) {
        items.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = p.radius > 4 ? "rgba(255, 159, 67, 0.7)" : cfg.color;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speed;
          p.wobble += p.wobbleSpeed;
          p.x += Math.sin(p.wobble) * 0.4;

          if (p.y < -p.radius) {
            p.y = c.height + p.radius;
            p.x = Math.random() * c.width;
          }
        });
      } else if (cfg.isWave) {
        items.forEach((w) => {
          ctx.beginPath();
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = 4;
          w.phase += w.speed;

          for (let x = 0; x < c.width; x++) {
            const y = w.y + Math.sin(x * w.length + w.phase) * w.amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }
    });
    requestAnimationFrame(animate);
  }

  if (layers.length > 0) {
    animate();
  }
})();

// --- ヒーロービデオ自動再生 ---
(() => {
  const heroVideo = document.querySelector(".hero-video");
  const heroSection = document.querySelector(".hero");
  if (!heroVideo || !heroSection) return;

  heroVideo.muted = true;

  const showPlayButton = () => {
    if (document.querySelector(".hero-play")) return;
    const btn = document.createElement("button");
    btn.className = "hero-play";
    btn.setAttribute("aria-label", "動画再生");
    btn.innerText = "▶";
    btn.addEventListener("click", () => {
      heroVideo.muted = true;
      heroVideo.play().then(() => btn.remove());
    });
    heroSection.appendChild(btn);
  };

  const tryPlay = () => {
    const p = heroVideo.play();
    if (p !== undefined) {
      p.then(() => {
        heroSection.classList.add("video-playing");
      }).catch(() => {
        showPlayButton();
      });
    }
  };

  tryPlay();
  ["click", "touchstart"].forEach((ev) => {
    window.addEventListener(ev, tryPlay, { once: true });
  });
})();
