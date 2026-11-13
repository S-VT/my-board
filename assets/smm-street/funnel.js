/* SMM page 4: two audiences go through the same path.
   In the upper banner-only lane, people have interest in the product and enter the Trust block,
   yet hesitate inside the Trust stage itself and peel away without deciding to buy.
   In the lower official-channel lane, daily posts, reviews and answers build trust before purchase. */
(() => {
  const host = document.querySelector('#sec-smm .smm-funnel');
  const canvas = host && host.querySelector('.smm-funnel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const GATES = [0.25, 0.5, 0.75];
  const TRUST_MIN = 0.5, TRUST_MAX = 0.75, TRUST_MID = 0.625;
  const LANES = {
    ads: { cy: 0.24, pace: 1.0, glow: 0.10 },
    ch: { cy: 0.77, pace: 1.38, glow: 0.36 }
  };
  let W = 0, H = 0, dpr = 1, running = false, raf = 0, prev = 0, spawnAcc = 0;
  let parts = [], pulses = [];

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const half = x => (0.185 - 0.105 * Math.pow(clamp(x, 0, 1), 0.9)) * H;
  const isEn = () => document.documentElement.lang === 'en';

  const glowSprite = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const gctx = c.getContext('2d');
    const g = gctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,.34)');
    g.addColorStop(0.45, 'rgba(255,255,255,.11)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    gctx.fillStyle = g;
    gctx.fillRect(0, 0, 32, 32);
    return c;
  })();

  function sampleAdsDrop() {
    const r = Math.random();
    // 8% mild scatter inside Cold (away from 0.25 border)
    if (r < 0.08) return { dropX: 0.08 + Math.random() * 0.11, trustDoubt: false };
    // 5% mild scatter inside Interest (away from 0.25 and 0.50 borders)
    if (r < 0.13) return { dropX: 0.31 + Math.random() * 0.12, trustDoubt: false };
    // 75% enter Trust with clear product interest, hesitate inside Trust (0.545..0.678), and peel outward
    if (r < 0.88) {
      const bell = (Math.random() + Math.random()) * 0.5;
      return { dropX: 0.545 + bell * 0.133, trustDoubt: true };
    }
    // 12% rare impulse buyers reach the end
    return { dropX: 9, trustDoubt: false };
  }

  function sampleChannelDrop() {
    const r = Math.random();
    if (r < 0.05) return 0.10 + Math.random() * 0.10;
    if (r < 0.09) return 0.33 + Math.random() * 0.11;
    if (r < 0.12) return 0.57 + Math.random() * 0.11;
    return 9;
  }

  function normHalf(x) {
    return 0.185 - 0.105 * Math.pow(clamp(x, 0, 1), 0.9);
  }

  function particleNormY(p) {
    const L = LANES[p.lane];
    const baseHalf = normHalf(p.x) * 0.80;
    const wobNorm = (1.5 + p.hes * 2.0) / Math.max(160, H || 300);
    return L.cy + p.off * baseHalf + Math.sin(p.wob) * wobNorm + p.nyOff;
  }

  function spawn(x, lane) {
    const off = Math.random() * 2 - 1;
    if (lane === 'ads') {
      const fate = sampleAdsDrop();
      // Upper-side particles peel out through the top of Trust; middle/lower peel downward toward the reason badge
      const peelUp = fate.trustDoubt && off < -0.24;
      parts.push({
        lane, x, off,
        wob: Math.random() * Math.PI * 2,
        speed: 0.064 + Math.random() * 0.032,
        heat: 0,
        dropX: fate.dropX,
        trustDoubt: fate.trustDoubt,
        peelDir: peelUp ? -1 : 1,
        hes: 0,
        alive: 1,
        drop: 0,
        vx: 0,
        nvy: 0,
        nyOff: 0,
        trailAcc: 0,
        trail: []
      });
    } else {
      parts.push({
        lane, x, off,
        wob: Math.random() * Math.PI * 2,
        speed: 0.064 + Math.random() * 0.032,
        heat: 0,
        dropX: sampleChannelDrop(),
        trustDoubt: false,
        peelDir: 1,
        hes: 0,
        alive: 1,
        drop: 0,
        vx: 0,
        nvy: 0,
        nyOff: 0,
        trailAcc: 0,
        trail: []
      });
    }
  }

  function seed() {
    parts = [];
    pulses = [];
    for (let i = 0; i < 58; i++) {
      spawn(Math.random() * 0.24, 'ads');
      spawn(Math.random() * 0.24, 'ch');
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    if (W > 10 && H > 10 && parts.length === 0) {
      seed();
      for (let i = 0; i < 260; i++) update(1 / 30);
    }
    if (!running) draw();
  }

  function update(dt) {
    spawnAcc += dt * 19;
    while (spawnAcc > 1) {
      spawnAcc -= 1;
      spawn(-0.02, 'ads');
      spawn(-0.02, 'ch');
    }

    const effH = Math.max(160, H || 300);
    const pillHalfNorm = ((W && W < 520 ? 8.5 : 10) + 6) / effH;
    const pillTopNorm = 0.565 - pillHalfNorm;
    const topLimitNorm = 8 / effH;

    for (const p of parts) {
      const L = LANES[p.lane];

      if (p.drop) {
        p.drop += dt;
        const grav = p.trustDoubt ? (p.peelDir > 0 ? 0.16 : 0.12) : 0.32;
        p.nvy += dt * grav * p.peelDir;
        p.nyOff += p.nvy * dt;

        if (p.lane === 'ads' && p.trustDoubt) {
          const baseNY = L.cy + p.off * normHalf(p.x) * 0.80;
          if (p.peelDir > 0) {
            const maxNYOff = Math.max(0.06, pillTopNorm - baseNY);
            if (p.nyOff > maxNYOff * 0.72) p.nvy *= Math.max(0, 1 - dt * 5.2);
            if (p.nyOff > maxNYOff) p.nyOff = maxNYOff;
          } else {
            const minNYOff = Math.min(-0.05, topLimitNorm - baseNY);
            if (p.nyOff < minNYOff * 0.72) p.nvy *= Math.max(0, 1 - dt * 5.2);
            if (p.nyOff < minNYOff) p.nyOff = minNYOff;
          }
        } else if (p.lane === 'ads' && p.peelDir > 0) {
          if (p.nyOff > 0.19) p.nyOff = 0.19;
        }

        p.x += p.vx * dt;
        p.vx *= Math.max(0, 1 - dt * 2.5);
        if (p.trustDoubt && p.x > TRUST_MAX - 0.022) {
          p.x = TRUST_MAX - 0.022;
        }

        if (p.trustDoubt) {
          p.trailAcc += dt;
          if (p.trailAcc >= 0.042) {
            p.trailAcc = 0;
            p.trail.push({ x: p.x, y: particleNormY(p) });
            if (p.trail.length > 6) p.trail.shift();
          }
          const lifeSpan = 1.08;
          const u = clamp(p.drop / lifeSpan, 0, 1);
          p.alive = u < 0.38 ? 1 : Math.pow(1 - (u - 0.38) / 0.62, 1.5);
          p.heat = Math.max(0.72, p.heat - dt * 0.85);
        } else {
          p.alive = clamp(1 - p.drop / 0.72, 0, 1);
          p.heat = Math.max(0.18, p.heat - dt * 1.5);
        }
        continue;
      }

      if (p.lane === 'ads') {
        // Warm up clearly across Interest (0.22..0.50) because product interest is real
        const interestWarm = clamp((p.x - 0.20) / 0.28, 0, 1) * 1.95;
        let hes = 0;
        if (p.trustDoubt && p.x > TRUST_MIN + 0.012) {
          hes = clamp(1 - (p.dropX - p.x) / 0.056, 0, 1);
        }
        p.hes = hes;
        p.heat = p.x > 0.72
          ? 2.1 + clamp((p.x - 0.72) / 0.22, 0, 0.7)
          : Math.max(0.22, interestWarm * (1 - 0.22 * hes));

        const paceFactor = 1 - 0.34 * hes;
        p.x += p.speed * dt * L.pace * paceFactor;
        p.wob += dt * (1.7 + hes * 3.4);
        if (hes > 0.04) {
          p.nyOff += p.peelDir * hes * dt * 0.088;
          if (hes > 0.22) {
            p.trailAcc += dt;
            if (p.trailAcc >= 0.042) {
              p.trailAcc = 0;
              p.trail.push({ x: p.x, y: particleNormY(p) });
              if (p.trail.length > 6) p.trail.shift();
            }
          }
        }
      } else {
        p.heat = clamp((p.x - 0.06) / 0.76, 0, 1) * 3.0;
        p.x += p.speed * dt * L.pace * (1 + p.heat * 0.12);
        p.wob += dt * 1.6;
        if (Math.random() < dt * 0.32 && p.x > 0.28 && p.x < 0.78 && pulses.length < 5) {
          pulses.push({ x: p.x, t: 0 });
        }
      }

      if (p.x >= p.dropX) {
        p.drop = 0.001;
        if (p.trustDoubt) {
          p.trail.push({ x: p.x, y: particleNormY(p) });
          if (p.trail.length > 6) p.trail.shift();
          p.vx = p.speed * (0.34 + Math.random() * 0.18);
          p.nvy = p.peelDir * (p.peelDir > 0
            ? (0.155 + Math.random() * 0.065)
            : (0.122 + Math.random() * 0.050));
        } else {
          p.vx = p.speed * 0.28;
          p.nvy = p.peelDir * 0.032;
        }
      }
    }

    parts = parts.filter(p => p.alive > 0.01 && p.x < 1.04);
    for (const q of pulses) q.t += dt;
    pulses = pulses.filter(q => q.t < 1.1);
  }

  function lanePath(cy) {
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const x = i / 40;
      ctx.lineTo(x * W, cy - half(x));
    }
    for (let i = 40; i >= 0; i--) {
      const x = i / 40;
      ctx.lineTo(x * W, cy + half(x));
    }
    ctx.closePath();
  }

  function draw() {
    if (W < 4 || H < 4) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Subtle highlight across the Trust block (0.50..0.75) so its interior is clearly distinct from its borders
    const tx0 = TRUST_MIN * W;
    const tw = (TRUST_MAX - TRUST_MIN) * W;
    const trustBand = ctx.createLinearGradient(0, 0, 0, H);
    trustBand.addColorStop(0, 'rgba(255,255,255,.034)');
    trustBand.addColorStop(0.5, 'rgba(255,255,255,.020)');
    trustBand.addColorStop(1, 'rgba(255,255,255,.030)');
    ctx.fillStyle = trustBand;
    ctx.fillRect(tx0, 0, tw, H);

    // Stage boundary guides at 0.25, 0.50, 0.75
    ctx.save();
    ctx.setLineDash([2, 6]);
    for (const g of GATES) {
      const isTrustEdge = g === TRUST_MIN || g === TRUST_MAX;
      ctx.strokeStyle = isTrustEdge ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.09)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(g * W, 2);
      ctx.lineTo(g * W, H - 2);
      ctx.stroke();
    }
    ctx.restore();

    for (const key of ['ads', 'ch']) {
      const L = LANES[key];
      const cy = L.cy * H;
      lanePath(cy);
      const body = ctx.createLinearGradient(0, 0, W, 0);
      if (key === 'ads') {
        body.addColorStop(0, 'rgba(255,255,255,.016)');
        body.addColorStop(0.42, 'rgba(255,255,255,.046)');
        body.addColorStop(0.63, 'rgba(255,255,255,.026)');
        body.addColorStop(1, 'rgba(255,255,255,.011)');
      } else {
        body.addColorStop(0, 'rgba(255,255,255,.016)');
        body.addColorStop(0.5, 'rgba(255,255,255,.048)');
        body.addColorStop(1, 'rgba(255,255,255,.082)');
      }
      ctx.fillStyle = body;
      ctx.fill();
      ctx.strokeStyle = key === 'ch' ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.clip();
      if (key === 'ch') {
        for (const q of pulses) {
          const x = q.x * W, k = q.t / 1.1, spread = 14 + k * 42;
          const g = ctx.createLinearGradient(x - spread, 0, x + spread, 0);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(0.5, `rgba(255,255,255,${(0.075 * (1 - k)).toFixed(3)})`);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(x - spread, cy - half(q.x), spread * 2, half(q.x) * 2);
        }
      }
      ctx.restore();

      // Soft departure halo directly outside the interior of Trust (0.50..0.75) on the upper banner lane
      if (key === 'ads') {
        const dx = TRUST_MID * W;
        const dy = cy + half(TRUST_MID) * 1.32;
        const rx = tw * 0.44;
        const ry = H * 0.17;
        ctx.save();
        ctx.translate(dx, dy);
        ctx.scale(rx / 16, ry / 16);
        ctx.globalAlpha = 0.24;
        ctx.drawImage(glowSprite, -16, -16, 32, 32);
        ctx.restore();
      }

      const px = W * 0.985, r = H * 0.16;
      const glow = ctx.createRadialGradient(px, cy, 0, px, cy, r);
      glow.addColorStop(0, `rgba(255,255,255,${L.glow})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(px - r, cy - r, r * 2, r * 2);
    }

    // People: warm up with interest, hesitate and visibly peel out of the Trust block when there is no channel
    for (const p of parts) {
      const x = p.x * W;
      const y = particleNormY(p) * H;
      const heat = clamp(p.heat / 3, 0, 1);
      const r = 1.55 + heat * 1.55;
      const light = Math.round(98 + heat * 157);
      const alpha = p.alive * (0.55 + heat * 0.45);

      if (p.drop > 0.01 && p.trustDoubt && p.trail.length >= 2) {
        ctx.globalAlpha = alpha * 0.36;
        ctx.strokeStyle = `rgb(${light},${light},${Math.min(255, light + 4)})`;
        ctx.lineWidth = Math.max(1, r * 0.68);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x * W, p.trail[0].y * H);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x * W, p.trail[i].y * H);
        }
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.globalAlpha = alpha;
      if (heat > 0.48 && (!p.drop || (p.trustDoubt && p.drop < 0.42))) {
        const gr = r * (p.drop ? 4.2 : 5.2);
        ctx.drawImage(glowSprite, x - gr, y - gr, gr * 2, gr * 2);
      }
      ctx.fillStyle = `rgb(${light},${light},${Math.min(255, light + 4)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(ts) {
    if (!running) return;
    const dt = prev ? Math.min(0.05, (ts - prev) / 1000) : 0;
    prev = ts;
    update(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  function run(on) {
    if (on && !running) {
      resize();
      if (parts.length === 0) {
        seed();
        for (let i = 0; i < 260; i++) update(1 / 30);
      }
      if (reduced.matches) {
        draw();
        return;
      }
      running = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    } else if (!on && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  new ResizeObserver(() => resize()).observe(canvas);
  new MutationObserver(() => { if (!running) draw(); }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  });
  window.SmmFunnel = { run };
})();
