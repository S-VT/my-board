(() => {
  const SLIDES = new Set(['0', '1']);
  const FOLLOW_TAU = 0.075;   // s, position smoothing: tight, but removes per-event jitter
  const AMP_RISE_TAU = 0.35;  // s, how fast the pulse fades in while the mouse moves
  const AMP_FALL_TAU = 0.9;   // s, how gently it settles after the mouse stops
  const PULSE_PERIOD = 2.8;   // s
  const SPEED_FULL = 900;     // px/s at which the pulse reaches full amplitude

  // Light profile: a wide Gaussian halo plus a smaller, denser core.
  const HALO_PEAK = 0.072, HALO_K = 3.2;
  const CORE_PEAK = 0.05, CORE_K = 4.0, CORE_RATIO = 0.39;

  const finePointer = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1181px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const glow = document.createElement('div');
  glow.className = 'ph-cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  const body = document.createElement('div');
  body.className = 'ph-cursor-glow__body';
  const canvas = document.createElement('canvas');
  body.appendChild(canvas);
  glow.appendChild(body);
  const anchor = document.getElementById('ph-ambient-bg');
  if (anchor) anchor.after(glow); else document.body.prepend(glow);

  let paintedSize = 0, paintedScale = 0;

  function profile(t, k) {
    // Gaussian with a polynomial taper so the value reaches exactly zero at the rim.
    return Math.exp(-k * t * t) * (1 - t * t * t * t * t * t);
  }

  // Rasterises the light with triangular dither of ±1 alpha level. The noise sits below one
  // quantisation step, so it reads as a continuous gradient instead of visible grain or rings.
  function paint() {
    const size = Math.round(Math.min(980, Math.max(640, innerWidth * 0.5)));
    const scale = Math.min(1.5, devicePixelRatio || 1);
    if (size === paintedSize && scale === paintedScale) return;
    paintedSize = size; paintedScale = scale;

    const px = Math.round(size * scale);
    canvas.width = px;
    canvas.height = px;
    canvas.style.width = canvas.style.height = `${size}px`;
    canvas.style.left = canvas.style.top = `${-size / 2}px`;

    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(px, px);
    const data = img.data;
    const c = (px - 1) / 2, rHalo = px / 2, rCore = rHalo * CORE_RATIO;
    for (let yy = 0; yy < px; yy++) {
      const dy = yy - c;
      for (let xx = 0; xx < px; xx++) {
        const dx = xx - c;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= rHalo) continue;
        let a = HALO_PEAK * profile(d / rHalo, HALO_K);
        if (d < rCore) a += CORE_PEAK * profile(d / rCore, CORE_K);
        const v = a * 255 + (Math.random() + Math.random() - 1);
        const q = v <= 0 ? 0 : Math.round(v);
        if (!q) continue;
        const i = (yy * px + xx) * 4;
        data[i] = data[i + 1] = data[i + 2] = 255;
        data[i + 3] = q;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  let tx = 0, ty = 0;          // pointer target
  let x = 0, y = 0;            // rendered position
  let amp = 0, ampTarget = 0;  // pulse amplitude 0..1
  let phase = 0;
  let lastMoveT = 0, lastPX = 0, lastPY = 0;
  let raf = 0, prevT = 0, placed = false, inside = false;

  const slideAllowed = () => SLIDES.has(document.body.dataset.activeSlide);
  const active = () => finePointer.matches && inside && placed && slideAllowed();

  const syncVisibility = () => {
    const on = active();
    if (on) paint();
    glow.classList.toggle('is-visible', on);
    if (on) start();
  };

  const ease = (dt, tau) => 1 - Math.exp(-dt / tau);

  function frame(t) {
    const dt = Math.min(0.05, prevT ? (t - prevT) / 1000 : 1 / 60);
    prevT = t;

    x += (tx - x) * ease(dt, FOLLOW_TAU);
    y += (ty - y) * ease(dt, FOLLOW_TAU);

    if (t - lastMoveT > 140) ampTarget = 0;
    amp += (ampTarget - amp) * ease(dt, ampTarget > amp ? AMP_RISE_TAU : AMP_FALL_TAU);
    phase = (phase + dt / PULSE_PERIOD) % 1;

    // Breathing: soft swell in size, slight brightness dip at the peak.
    const wave = reducedMotion.matches ? 0 : (1 - Math.cos(phase * Math.PI * 2)) / 2;
    const scale = 1 + 0.055 * amp * wave;
    const alpha = 1 - 0.14 * amp * wave;

    glow.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    body.style.transform = `scale(${scale.toFixed(4)})`;
    body.style.opacity = alpha.toFixed(4);

    const settled = Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && amp < 0.002;
    if (settled || !active()) { raf = 0; prevT = 0; return; }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  addEventListener('pointermove', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const now = performance.now();
    tx = e.clientX;
    ty = e.clientY;
    if (!placed) {
      placed = true;
      x = tx; y = ty;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    } else {
      const dt = Math.max(8, now - lastMoveT) / 1000;
      const speed = Math.hypot(tx - lastPX, ty - lastPY) / dt;
      ampTarget = Math.max(ampTarget * 0.85, Math.min(1, speed / SPEED_FULL));
    }
    lastMoveT = now; lastPX = tx; lastPY = ty;
    inside = true;
    syncVisibility();
  }, { passive: true });

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (paintedSize) paint(); }, 200);
  });

  document.documentElement.addEventListener('pointerleave', () => { inside = false; syncVisibility(); });
  addEventListener('blur', () => { inside = false; syncVisibility(); });
  finePointer.addEventListener?.('change', syncVisibility);

  // The deck updates body[data-active-slide] on every navigation.
  new MutationObserver(syncVisibility).observe(document.body, { attributes: true, attributeFilter: ['data-active-slide'] });
})();
