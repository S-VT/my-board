/* Animated street ad devices for the SMM scene: poster scroller, prism billboard,
   digital screen and LED ticker. Posters are rendered once per size into offscreen canvases. */
(() => {
  const NS = (window.SmmStreet = window.SmmStreet || {});
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = k => k * k * (3 - 2 * k);
  const ease = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const mod = (a, n) => ((a % n) + n) % n;
  const font = (w, px, mono) => `${w} ${px}px ${mono ? '"JetBrains Mono", monospace' : 'Inter, Manrope, sans-serif'}`;

  function fit(c, text, weight, px, maxW, mono) {
    c.font = font(weight, px, mono);
    const w = c.measureText(text).width;
    if (w > maxW) { px *= maxW / w; c.font = font(weight, px, mono); }
    return px;
  }
  function canvas(w, h) {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w));
    cv.height = Math.max(1, Math.round(h));
    return cv;
  }
  function cover(c, img, x, y, w, h, scale = 1, ax = 0.5, ay = 0.5) {
    if (!img || !img.complete || !img.naturalWidth) return false;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    const r = Math.max(w / img.naturalWidth, h / img.naturalHeight) * scale;
    const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
    c.drawImage(img, x + (w - dw) * ax, y + (h - dh) * ay, dw, dh);
    return true;
  }
  function stripes(c, x, y, w, h, step, color) {
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = color;
    c.lineWidth = step * 0.45;
    c.beginPath();
    for (let k = -h; k < w + h; k += step) { c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); }
    c.stroke();
    c.restore();
  }

  /* ---------- Posters ---------- */
  const POSTERS = {
    lawyer(c, w, h, L) {
      c.fillStyle = '#e9e9ec'; c.fillRect(0, 0, w, h);
      // Scales of justice.
      const cx = w * 0.74, top = h * 0.07;
      c.strokeStyle = '#111113'; c.lineWidth = w * 0.014; c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cx, top); c.lineTo(cx, top + h * 0.17);
      c.moveTo(cx - w * 0.13, top + h * 0.035); c.lineTo(cx + w * 0.13, top + h * 0.035);
      [-1, 1].forEach(sd => {
        c.moveTo(cx + sd * w * 0.13, top + h * 0.035); c.lineTo(cx + sd * w * 0.08, top + h * 0.1);
        c.moveTo(cx + sd * w * 0.13, top + h * 0.035); c.lineTo(cx + sd * w * 0.18, top + h * 0.1);
      });
      c.moveTo(cx - w * 0.07, top + h * 0.17); c.lineTo(cx + w * 0.07, top + h * 0.17);
      c.stroke();
      c.fillStyle = '#111113';
      [-1, 1].forEach(sd => { c.beginPath(); c.arc(cx + sd * w * 0.13, top + h * 0.1, w * 0.05, 0, Math.PI); c.fill(); });
      c.textAlign = 'left'; c.textBaseline = 'top';
      fit(c, L.law1, 900, w * 0.2, w * 0.84); c.fillText(L.law1, w * 0.08, h * 0.29);
      fit(c, L.law2, 800, w * 0.15, w * 0.84); c.fillText(L.law2, w * 0.08, h * 0.42);
      c.fillStyle = '#3a3b3f';
      L.lawList.forEach((t, i) => { fit(c, t, 600, w * 0.066, w * 0.8); c.fillText('· ' + t, w * 0.08, h * (0.56 + i * 0.065)); });
      c.fillStyle = '#111113'; c.fillRect(0, h * 0.78, w, h * 0.22);
      c.fillStyle = '#f2f2f5';
      fit(c, L.law3, 900, w * 0.085, w * 0.84); c.fillText(L.law3, w * 0.08, h * 0.82);
      c.fillStyle = '#a1a1a6'; fit(c, L.law4, 500, w * 0.055, w * 0.84); c.fillText(L.law4, w * 0.08, h * 0.91);
    },
    handyman(c, w, h, L) {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1d1d20'); g.addColorStop(1, '#09090a');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      // Wrench.
      c.save();
      c.translate(w * 0.72, h * 0.17); c.rotate(-0.75);
      c.fillStyle = '#e9e9ec';
      c.fillRect(-w * 0.03, -h * 0.02, w * 0.06, h * 0.2);
      c.beginPath(); c.arc(0, -h * 0.03, w * 0.085, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#16161a'; c.fillRect(-w * 0.03, -h * 0.1, w * 0.06, h * 0.07);
      c.restore();
      c.fillStyle = '#f2f2f5'; c.textAlign = 'left'; c.textBaseline = 'top';
      fit(c, L.hand1, 900, w * 0.19, w * 0.84); c.fillText(L.hand1, w * 0.08, h * 0.3);
      fit(c, L.hand2, 900, w * 0.19, w * 0.84); c.fillText(L.hand2, w * 0.08, h * 0.43);
      c.fillStyle = '#c7c7cc';
      L.handList.forEach((t, i) => { fit(c, t, 600, w * 0.066, w * 0.8); c.fillText('· ' + t, w * 0.08, h * (0.58 + i * 0.065)); });
      c.fillStyle = '#e9e9ec'; c.fillRect(w * 0.08, h * 0.81, w * 0.84, h * 0.1);
      c.fillStyle = '#111113'; c.textAlign = 'center'; c.textBaseline = 'middle';
      fit(c, L.hand3, 900, w * 0.075, w * 0.76); c.fillText(L.hand3, w / 2, h * 0.86);
    },
    repair(c, w, h, L) {
      c.fillStyle = '#dcdde0'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#111113'; c.fillRect(w * 0.64, 0, w * 0.36, h);
      // Phone outline with a cracked screen.
      const px = w * 0.53, py = h * 0.18, pw = w * 0.075, ph = h * 0.64;
      c.strokeStyle = '#111113'; c.lineWidth = w * 0.006;
      c.strokeRect(px, py, pw, ph);
      c.beginPath(); c.moveTo(px + pw * 0.2, py + ph * 0.25); c.lineTo(px + pw * 0.55, py + ph * 0.4); c.lineTo(px + pw * 0.35, py + ph * 0.55); c.lineTo(px + pw * 0.8, py + ph * 0.7); c.stroke();
      c.fillStyle = '#f2f2f5'; c.textAlign = 'center'; c.textBaseline = 'middle';
      fit(c, '30', 900, h * 0.6, w * 0.3); c.fillText('30', w * 0.82, h * 0.44);
      fit(c, L.rep3, 700, h * 0.1, w * 0.3); c.fillText(L.rep3, w * 0.82, h * 0.82);
      c.fillStyle = '#111113'; c.textAlign = 'left';
      fit(c, L.rep1, 900, h * 0.22, w * 0.44); c.fillText(L.rep1, w * 0.05, h * 0.3);
      fit(c, L.rep2, 800, h * 0.16, w * 0.44); c.fillText(L.rep2, w * 0.05, h * 0.54);
      c.fillStyle = '#5a5b5f'; fit(c, L.rep4, 500, h * 0.07, w * 0.44); c.fillText(L.rep4, w * 0.05, h * 0.8);
    },
    liquidation(c, w, h, L) {
      c.fillStyle = '#0d0d0f'; c.fillRect(0, 0, w, h);
      stripes(c, 0, 0, w, h * 0.09, w * 0.08, '#e9e9ec');
      stripes(c, 0, h * 0.91, w, h * 0.09, w * 0.08, '#e9e9ec');
      c.fillStyle = '#f2f2f5'; c.textAlign = 'center'; c.textBaseline = 'middle';
      fit(c, L.liq1, 900, w * 0.15, w * 0.86); c.fillText(L.liq1, w / 2, h * 0.2);
      fit(c, '−90%', 900, w * 0.42, w * 0.9); c.fillText('−90%', w / 2, h * 0.44);
      c.fillStyle = '#e9e9ec'; c.fillRect(w * 0.08, h * 0.62, w * 0.84, h * 0.11);
      c.fillStyle = '#0d0d0f'; fit(c, L.liq2, 900, w * 0.08, w * 0.78); c.fillText(L.liq2, w / 2, h * 0.675);
      c.fillStyle = '#a1a1a6'; fit(c, L.liq3, 600, w * 0.06, w * 0.84); c.fillText(L.liq3, w / 2, h * 0.81);
    },
    sneakers(c, w, h, L, img) {
      c.fillStyle = '#0c0c0d'; c.fillRect(0, 0, w, h);
      cover(c, img, 0, 0, w, h * 0.82, 1.04, 0.5, 0.4);
      const g = c.createLinearGradient(0, h * 0.55, 0, h);
      g.addColorStop(0, 'rgba(12,12,13,0)'); g.addColorStop(0.45, 'rgba(12,12,13,.95)');
      c.fillStyle = g; c.fillRect(0, h * 0.5, w, h * 0.5);
      c.fillStyle = '#f2f2f5'; c.textAlign = 'left'; c.textBaseline = 'top';
      fit(c, L.sneak1, 900, w * 0.11, w * 0.84); c.fillText(L.sneak1, w * 0.08, h * 0.74);
      fit(c, L.sneak2, 500, w * 0.06, w * 0.84); c.fillStyle = '#a1a1a6'; c.fillText(L.sneak2, w * 0.08, h * 0.86);
      c.fillStyle = '#f2f2f5'; c.beginPath(); c.arc(w * 0.82, h * 0.12, w * 0.12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0c0c0d'; c.textAlign = 'center'; c.textBaseline = 'middle';
      fit(c, '−40%', 900, w * 0.08, w * 0.2); c.fillText('−40%', w * 0.82, h * 0.12);
    },
    all99(c, w, h, L) {
      c.fillStyle = '#0f0f11'; c.fillRect(0, 0, w, h);
      stripes(c, 0, 0, w, h, h * 0.22, 'rgba(255,255,255,.05)');
      c.fillStyle = '#f2f2f5'; c.textAlign = 'left'; c.textBaseline = 'middle';
      fit(c, L.all1, 800, h * 0.2, w * 0.36); c.fillText(L.all1, w * 0.06, h * 0.34);
      fit(c, L.all2, 500, h * 0.09, w * 0.36); c.fillStyle = '#a1a1a6'; c.fillText(L.all2, w * 0.06, h * 0.6);
      c.fillStyle = '#f2f2f5'; c.textAlign = 'right';
      fit(c, L.all3, 900, h * 0.78, w * 0.56); c.fillText(L.all3, w * 0.95, h * 0.52);
    },
    flats(c, w, h, L) {
      const g = c.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#9fa0a5'); g.addColorStop(1, '#5c5d62');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(17,17,19,.22)';
      [[0.62, 0.42], [0.7, 0.26], [0.79, 0.34], [0.87, 0.18]].forEach(([x, top]) => c.fillRect(w * x, h * top, w * 0.075, h * (1 - top)));
      c.fillStyle = '#111113'; c.textAlign = 'left'; c.textBaseline = 'top';
      fit(c, L.flats1, 900, h * 0.24, w * 0.55); c.fillText(L.flats1, w * 0.05, h * 0.12);
      fit(c, L.flats2, 800, h * 0.2, w * 0.55); c.fillText(L.flats2, w * 0.05, h * 0.4);
      c.fillStyle = '#26272a'; fit(c, L.flats3, 600, h * 0.09, w * 0.55); c.fillText(L.flats3, w * 0.05, h * 0.72);
    }
  };

  function renderPoster(kind, w, h, L, img) {
    const cv = canvas(w, h);
    const cx = cv.getContext('2d');
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = 'high';
    POSTERS[kind](cx, cv.width, cv.height, L, img);
    return cv;
  }

  /* ---------- Devices ---------- */
  // Backlit scroller: holds each poster, then rolls it up and the next one in.
  function drawScroller(c, posters, x, y, w, h, t) {
    const hold = 5.5, roll = 1.3, period = hold + roll, n = posters.length;
    const k = Math.floor(t / period), local = t - k * period;
    const cur = posters[mod(k, n)], next = posters[mod(k + 1, n)];
    const p = local < hold ? 0 : ease((local - hold) / roll);
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.drawImage(cur, x, y - p * h, w, h);
    if (p > 0) c.drawImage(next, x, y + h - p * h, w, h);
    if (p > 0 && p < 1) {
      const sy = y + h - p * h;
      const g = c.createLinearGradient(0, sy - h * 0.05, 0, sy + h * 0.05);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x, sy - h * 0.05, w, h * 0.1);
    }
    const glass = c.createLinearGradient(x, y, x + w, y + h);
    glass.addColorStop(0, 'rgba(255,255,255,.1)'); glass.addColorStop(0.35, 'rgba(255,255,255,0)'); glass.addColorStop(1, 'rgba(0,0,0,.12)');
    c.fillStyle = glass; c.fillRect(x, y, w, h);
    c.restore();
  }

  // Triangular prism slats turn one after another, left to right, revealing the next face.
  function drawPrism(c, faces, x, y, w, h, t, slats) {
    const hold = 4.6, turn = 1.6, period = hold + turn, n = faces.length;
    const k = Math.floor(t / period), local = t - k * period;
    const sw = w / slats, R = sw / Math.sqrt(3);
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#060607'; c.fillRect(x, y, w, h);
    for (let i = 0; i < slats; i++) {
      const delay = (i / slats) * turn * 0.55;
      const p = local < hold + delay ? 0 : ease(clamp((local - hold - delay) / (turn * 0.45), 0, 1));
      const base = -p * (2 * Math.PI / 3);
      const cx = x + (i + 0.5) * sw;
      for (let f = 0; f < 3; f++) {
        const a = base + f * (2 * Math.PI / 3);
        const facing = Math.cos(a);
        if (facing <= 0.02) continue;
        const x0 = cx + R * Math.sin(a - Math.PI / 3), x1 = cx + R * Math.sin(a + Math.PI / 3);
        const face = faces[mod(k + f, n)];
        const src = face.width / slats;
        c.drawImage(face, i * src, 0, src, face.height, Math.min(x0, x1), y, Math.abs(x1 - x0) + 0.6, h);
        c.fillStyle = `rgba(0,0,0,${(1 - facing) * 0.75})`;
        c.fillRect(Math.min(x0, x1), y, Math.abs(x1 - x0) + 0.6, h);
      }
      c.fillStyle = 'rgba(0,0,0,.35)';
      c.fillRect(x + (i + 1) * sw - 0.5, y, 1, h);
    }
    const sheen = c.createLinearGradient(0, y, 0, y + h);
    sheen.addColorStop(0, 'rgba(255,255,255,.08)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0)'); sheen.addColorStop(1, 'rgba(0,0,0,.18)');
    c.fillStyle = sheen; c.fillRect(x, y, w, h);
    c.restore();
  }

  // Digital screen: product spot with Ken Burns moves and hard wipes (cross-fading two photos ghosts the faces).
  // `wave` (0..1) wipes in a greeting when someone walks by.
  function drawScreen(c, imgs, x, y, w, h, t, wave, L) {
    const seq = [
      { img: imgs.hold, text: L.scr1, sub: L.scr1s, zoom: 1, ay: 0.35 },
      { img: imgs.serum, text: L.scr3, sub: L.scr3s, zoom: 1, ay: 0.35 },
      { img: imgs.hold, text: L.scr2, sub: L.scr2s, zoom: 1.55, ay: 0.22 }
    ];
    const slot = 3.8, wipe = 0.55;
    const k = Math.floor(t / slot), local = t - k * slot;
    const cur = seq[mod(k, 3)], prev = seq[mod(k - 1, 3)];
    const zoom = s => 1.02 + 0.07 * s;
    const p = ease(clamp(local / wipe, 0, 1));
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#9c9da1'; c.fillRect(x, y, w, h);
    cover(c, prev.img, x, y, w, h, zoom(1) * prev.zoom, 0.5, prev.ay);
    const edge = x + w * p;
    c.save();
    c.beginPath(); c.rect(x, y, edge - x, h); c.clip();
    cover(c, cur.img, x, y, w, h, zoom(local / slot) * cur.zoom, 0.5, cur.ay);
    c.restore();
    if (p > 0 && p < 1) { c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(edge - 1.5, y, 3, h); }
    let txt = cur.text, sub = cur.sub, rise = ease(clamp((local - wipe) / 0.45, 0, 1));
    if (wave > 0) {
      const we = x + w * ease(wave);
      c.save();
      c.beginPath(); c.rect(x, y, we - x, h); c.clip();
      // Tighter, higher crop: only the greeting hand and the face are in frame.
      cover(c, imgs.wave, x, y, w, h, 1.24 + Math.sin(t * 1.3) * 0.008, 0.5, 0.16);
      c.restore();
      if (wave < 1) { c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(we - 1.5, y, 3, h); }
      if (wave > 0.5) { txt = L.scrWave; sub = L.scrWaveS; rise = clamp((wave - 0.5) * 2, 0, 1); }
    }
    const band = c.createLinearGradient(0, y + h * 0.62, 0, y + h);
    band.addColorStop(0, 'rgba(14,14,16,0)'); band.addColorStop(0.55, 'rgba(14,14,16,.85)');
    c.fillStyle = band; c.fillRect(x, y + h * 0.6, w, h * 0.4);
    c.globalAlpha = rise;
    c.fillStyle = '#f5f5f7'; c.textAlign = 'left'; c.textBaseline = 'top';
    fit(c, txt, 800, w * 0.1, w * 0.86); c.fillText(txt, x + w * 0.07, y + h * 0.8 + (1 - rise) * h * 0.03);
    c.fillStyle = '#c7c7cc'; fit(c, sub, 500, w * 0.055, w * 0.86); c.fillText(sub, x + w * 0.07, y + h * 0.89 + (1 - rise) * h * 0.03);
    c.globalAlpha = 1;
    c.restore();
  }

  // LED dot-matrix ticker.
  function drawTicker(c, text, x, y, w, h, t, speed) {
    c.save();
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#050506'; c.fillRect(x, y, w, h);
    c.font = font(700, h * 0.72, true);
    const tw = c.measureText(text).width + h * 3;
    const off = mod(t * speed, tw);
    c.fillStyle = '#e8e8ec';
    c.shadowColor = 'rgba(255,255,255,.65)';
    c.shadowBlur = h * 0.35;
    c.textBaseline = 'middle';
    for (let xx = x + w - off; xx > x - tw; xx -= tw) c.fillText(text, xx, y + h * 0.54);
    for (let xx = x + w - off + tw; xx < x + w + tw; xx += tw) c.fillText(text, xx, y + h * 0.54);
    c.shadowBlur = 0;
    const cell = Math.max(2, h / 7);
    c.fillStyle = 'rgba(5,5,6,.78)';
    for (let yy = y; yy < y + h; yy += cell) c.fillRect(x, yy, w, Math.max(1, cell * 0.32));
    for (let xx = x; xx < x + w; xx += cell) c.fillRect(xx, y, Math.max(1, cell * 0.32), h);
    c.restore();
  }

  NS.ads = { renderPoster, drawScroller, drawPrism, drawScreen, drawTicker, fit, font, cover, stripes };
})();
