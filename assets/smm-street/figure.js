/* Side-view human figure for the SMM street scene: gait solver, poses and an organic renderer.
   Units are body heights (U); y points up; x points in the direction the figure faces. */
(() => {
  const NS = (window.SmmStreet = window.SmmStreet || {});

  const THIGH = 0.26, SHIN = 0.26, ANKLE_H = 0.04, TOE = 0.118, HEEL = 0.042;
  const UPPER_ARM = 0.18, FOREARM = 0.155;
  const TORSO = 0.29;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = k => k * k * (3 - 2 * k);
  const mod = (a, n) => ((a % n) + n) % n;
  const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };

  function ik(hx, hy, tx, ty, a, b, bendCCW) {
    let dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy);
    const max = (a + b) * 0.999;
    if (d > max) { const k = max / d; dx *= k; dy *= k; d = max; }
    const ang = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
    const base = Math.atan2(dy, dx) + (bendCCW ? ang : -ang);
    return { mid: [hx + a * Math.cos(base), hy + a * Math.sin(base)], end: [hx + dx, hy + dy] };
  }

  /* ---------- Gait (contact points move at exactly the ground speed) ---------- */
  function makeGait(stride, stance) {
    const step = stance * stride;
    const ankleFrom = (px, py, pitch, toePivot) => {
      const v = toePivot ? rot(TOE, -ANKLE_H, pitch) : rot(-HEEL, -ANKLE_H, pitch);
      return [px - v[0], py - v[1]];
    };
    const stancePose = p => {
      const xr = step / 2 - step * p;
      if (p < 0.14) {
        const k = 1 - p / 0.14, pitch = 0.18 * k * k;
        const a = ankleFrom(xr - HEEL, 0, pitch, false);
        return [a[0], a[1], pitch];
      }
      if (p > 0.62) {
        const k = (p - 0.62) / 0.38, pitch = -0.5 * k * k;
        const a = ankleFrom(xr + TOE, 0, pitch, true);
        return [a[0], a[1], pitch];
      }
      return [xr, ANKLE_H, 0];
    };
    // Swing is a cubic Hermite whose end velocities equal the stance velocities at toe-off and
    // heel strike, so the foot never stops or snaps at the phase changes.
    const off = stancePose(1), on = stancePose(0);
    const d = 1e-4, k = (1 - stance) / stance;
    const offEnd = stancePose(1 - d), onNext = stancePose(d);
    const vOff = off.map((v, i) => (v - offEnd[i]) / d * k);
    const vOn = on.map((v, i) => (onNext[i] - v) / d * k);
    const hermite = (p0, m0, p1, m1, s) => {
      const s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
    };
    const swingPose = s => {
      // Clearance peaks early in the swing; sin² keeps the added lift flat at both ends.
      const lift = 0.07 * Math.pow(Math.sin(Math.PI * s), 2) * (1.3 - 0.6 * s);
      return [
        hermite(off[0], vOff[0], on[0], vOn[0], s),
        Math.max(ANKLE_H * 0.9, hermite(off[1], vOff[1], on[1], vOn[1], s) + lift),
        clamp(hermite(off[2], vOff[2], on[2], vOn[2], s), -0.75, 0.32)
      ];
    };
    return ph => (ph < stance ? stancePose(ph / stance) : swingPose((ph - stance) / (1 - stance)));
  }

  /* ---------- Poses ---------- */
  function buildBody(hip, lean, headTilt, neckTilt) {
    const T = (lx, ly) => [hip[0] + lx * Math.cos(lean) + ly * Math.sin(lean), hip[1] - lx * Math.sin(lean) + ly * Math.cos(lean)];
    const shoulder = T(-0.005, TORSO - 0.03);
    const neck0 = T(0.018, TORSO - 0.005);
    const nAng = lean + neckTilt;
    const neck1 = [neck0[0] + 0.052 * Math.sin(nAng), neck0[1] + 0.052 * Math.cos(nAng)];
    const base = rot(-0.012, -0.052, headTilt);
    const head = [neck1[0] - base[0], neck1[1] - base[1]];
    return { hip, lean, T, shoulder, neck0, neck1, head, headTilt };
  }

  function walkPose(gait, ph, phoneBob) {
    const bob = Math.cos(4 * Math.PI * (ph - 0.3));
    const hip = [0, 0.54 + 0.014 * bob];
    const body = buildBody(hip, 0.13, -0.78, 0.62);
    const legs = [gait(mod(ph + 0.5, 1)), gait(ph)].map(p => {
      const r = ik(hip[0], hip[1], p[0], p[1], THIGH, SHIN, true);
      return { hip, knee: r.mid, ankle: r.end, pitch: p[2] };
    });
    // The phone is held steady at chest height; the hand absorbs most of the bob.
    const phone = [body.shoulder[0] + 0.15, body.shoulder[1] - 0.2 - phoneBob * 0.006 * bob];
    const near = ik(body.shoulder[0] + 0.01, body.shoulder[1], phone[0] - 0.01, phone[1] - 0.01, UPPER_ARM, FOREARM, false);
    const swing = 0.2 * Math.cos(2 * Math.PI * ph);
    const ua = -Math.PI / 2 + swing;
    const elbow = [body.shoulder[0] - 0.012 + UPPER_ARM * Math.cos(ua), body.shoulder[1] + UPPER_ARM * Math.sin(ua)];
    const fa = ua + 0.28 + Math.max(0, swing) * 0.7;
    const far = { shoulder: [body.shoulder[0] - 0.012, body.shoulder[1]], elbow, wrist: [elbow[0] + FOREARM * Math.cos(fa), elbow[1] + FOREARM * Math.sin(fa)], hand: fa };
    return {
      ...body, legs,
      arms: [far, { shoulder: [body.shoulder[0] + 0.01, body.shoulder[1]], elbow: near.mid, wrist: near.end, hand: Math.atan2(phone[1] - near.mid[1], phone[0] - near.mid[0]) }],
      phone
    };
  }

  /* ---------- Renderer ---------- */
  function smoothClosed(c, pts) {
    const n = pts.length;
    c.beginPath();
    const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    c.closePath();
  }

  // Organic limb: width profile along the bone plus a bulge on one side (calf, forearm).
  function limb(c, A, B, w0, w1, w2, bulge, bulgeAt, side) {
    const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    const L = [], R = [];
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const w = t < 0.5 ? lerp(w0, w1, smooth(t * 2)) : lerp(w1, w2, smooth((t - 0.5) * 2));
      const b = bulge * Math.exp(-Math.pow((t - bulgeAt) / 0.22, 2));
      const lw = w / 2 + (side < 0 ? b : 0), rw = w / 2 + (side > 0 ? b : 0);
      const px = A[0] + dx * t, py = A[1] + dy * t;
      L.push([px + nx * lw, py + ny * lw]);
      R.push([px - nx * rw, py - ny * rw]);
    }
    // End caps: half-rounds around the tip (left edge to right edge) and around the root.
    const tip = [], root = [];
    for (let k = 1; k < 4; k++) {
      const a = Math.PI * k / 4, ca = Math.cos(a), sa = Math.sin(a);
      tip.push([B[0] + (nx * ca + ux * sa) * w2 / 2, B[1] + (ny * ca + uy * sa) * w2 / 2]);
      root.push([A[0] + (-nx * ca - ux * sa) * w0 / 2, A[1] + (-ny * ca - uy * sa) * w0 / 2]);
    }
    smoothClosed(c, [...L, ...tip, ...R.reverse(), ...root]);
  }

  const shade = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const f = v => Math.round(clamp(v * k, 0, 255));
    return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };

  function draw(c, pose, style, P, U) {
    const px = v => v * U;
    const farK = 0.62;

    const drawShoe = (leg, far) => {
      const k = far ? farK : 1;
      const [ax, ay] = leg.ankle, p = leg.pitch;
      const F = (x, y) => { const r = rot(x, y, p); return P(ax + r[0], ay + r[1]); };
      const upper = [F(-0.046, -0.022), F(-0.05, 0.004), F(-0.036, 0.03), F(0.012, 0.026), F(0.05, 0.004), F(0.098, -0.012), F(0.122, -0.022), F(0.124, -0.03), F(0.08, -0.03), F(0.0, -0.028)];
      c.fillStyle = shade(style.shoe, k);
      smoothClosed(c, upper); c.fill();
      const sole = [F(-0.048, -0.024), F(0.122, -0.026), F(0.126, -0.036), F(0.11, -0.041), F(-0.04, -0.041), F(-0.05, -0.034)];
      c.fillStyle = shade(style.sole, k);
      smoothClosed(c, sole); c.fill();
    };

    const drawLeg = (leg, far) => {
      const k = far ? farK : 1;
      const H = P(leg.hip[0], leg.hip[1]), K = P(leg.knee[0], leg.knee[1]), A = P(leg.ankle[0], leg.ankle[1] + 0.012);
      drawShoe(leg, far);
      c.fillStyle = shade(style.pants, k);
      limb(c, H, K, px(0.108), px(0.086), px(0.064), px(0.008), 0.35, 1); c.fill();
      limb(c, K, A, px(0.062), px(0.058), px(0.05), px(0.012), 0.3, -1); c.fill();
      c.beginPath(); c.arc(K[0], K[1], px(0.031), 0, Math.PI * 2); c.fill();
    };

    const drawRelaxedHand = (arm, far) => {
      const edx = arm.wrist[0] - arm.elbow[0], edy = arm.wrist[1] - arm.elbow[1];
      const el = Math.hypot(edx, edy) || 1;
      const ux = edx / el, uy = edy / el;
      const fx = -uy, fy = ux;
      const H = (u, f) => P(arm.wrist[0] + ux * u + fx * f, arm.wrist[1] + uy * u + fy * f);

      const palm = [
        H(0.006, 0.0125),
        H(0.025, 0.0132),
        H(0.043, 0.0098),
        H(0.059, 0.0055),
        H(0.068, -0.0008),
        H(0.065, -0.0102),
        H(0.048, -0.0152),
        H(0.026, -0.0150),
        H(0.006, -0.0125)
      ];

      c.save();
      c.lineJoin = 'round';
      c.lineCap = 'round';

      smoothClosed(c, palm);
      c.strokeStyle = far ? '#23252b' : '#3f4148';
      c.lineWidth = Math.max(0.85, px(0.003));
      c.stroke();
      c.fillStyle = shade(style.skin, far ? 0.70 : 1);
      c.fill();

      // Natural forward-hanging thumb alongside the palm with a subtle cleft near the tip
      const t0 = H(0.020, 0.0095), t1 = H(0.049, 0.0168);
      const tdx = t1[0] - t0[0], tdy = t1[1] - t0[1], tl = Math.hypot(tdx, tdy) || 1;
      const tnx = -tdy / tl, tny = tdx / tl, tang = Math.atan2(tdy, tdx);
      const r0 = px(0.0058), r1 = px(0.0046);
      const traceThumb = () => {
        c.beginPath();
        c.moveTo(t0[0] - tnx * r0, t0[1] - tny * r0);
        c.lineTo(t1[0] - tnx * r1, t1[1] - tny * r1);
        c.arc(t1[0], t1[1], r1, tang - Math.PI / 2, tang + Math.PI / 2);
        c.lineTo(t0[0] + tnx * r0, t0[1] + tny * r0);
        c.arc(t0[0], t0[1], r0, tang + Math.PI / 2, tang - Math.PI / 2);
        c.closePath();
      };
      c.strokeStyle = far ? '#202228' : '#383a41';
      c.lineWidth = Math.max(0.9, px(0.0032));
      traceThumb();
      c.stroke();
      c.fillStyle = shade(style.skin, far ? 0.78 : 1.04);
      traceThumb();
      c.fill();

      c.restore();
    };

    const traceSleeve = (S, E, W, pass) => {
      limb(c, S, E, px(0.068), px(0.058), px(0.05), px(0.004), 0.3, 1); pass();
      limb(c, E, W, px(0.05), px(0.046), px(0.042), px(0.006), 0.25, -1); pass();
      c.beginPath(); c.arc(E[0], E[1], px(0.025), 0, Math.PI * 2); pass();
    };

    const drawArm = (arm, far, holding, renderHeld) => {
      const k = far ? farK : 1;
      const S = P(arm.shoulder[0], arm.shoulder[1]), E = P(arm.elbow[0], arm.elbow[1]), W = P(arm.wrist[0], arm.wrist[1]);
      if (!holding) drawRelaxedHand(arm, far);
      else if (renderHeld?.underSleeve) renderHeld.underSleeve(c);

      c.save();
      c.lineJoin = 'round';
      c.lineCap = 'round';
      if (!far) {
        c.strokeStyle = 'rgba(0,0,0,.44)';
        c.lineWidth = Math.max(1.9, px(0.0082));
        traceSleeve(S, E, W, () => c.stroke());
      }
      c.strokeStyle = far ? '#2d2f35' : '#3d3f46';
      c.lineWidth = Math.max(far ? 0.95 : 1.15, px(far ? 0.0038 : 0.0048));
      traceSleeve(S, E, W, () => c.stroke());

      const g = c.createLinearGradient(S[0], S[1], W[0], W[1]);
      g.addColorStop(0, shade(style.jacket, far ? 0.78 : 1.22));
      g.addColorStop(1, shade(style.jacket, far ? 0.66 : 1.06));
      c.fillStyle = g;
      traceSleeve(S, E, W, () => c.fill());

      // Straight cuff band clipped cleanly inside the forearm silhouette (no inner circle ring)
      c.save();
      limb(c, E, W, px(0.05), px(0.046), px(0.042), px(0.006), 0.25, -1);
      c.clip();
      const fdx = W[0] - E[0], fdy = W[1] - E[1], fl = Math.hypot(fdx, fdy) || 1;
      const fux = fdx / fl, fuy = fdy / fl, fnx = -fuy, fny = fux;
      const cs = [W[0] - fux * px(0.006), W[1] - fuy * px(0.006)];
      const ce = [W[0] + fux * px(0.03), W[1] + fuy * px(0.03)];
      c.fillStyle = shade(style.jacketCuff || style.jacket, k * 0.85);
      c.beginPath();
      c.moveTo(cs[0] + fnx * px(0.03), cs[1] + fny * px(0.03));
      c.lineTo(cs[0] - fnx * px(0.03), cs[1] - fny * px(0.03));
      c.lineTo(ce[0] - fnx * px(0.03), ce[1] - fny * px(0.03));
      c.lineTo(ce[0] + fnx * px(0.03), ce[1] + fny * px(0.03));
      c.closePath();
      c.fill();
      c.strokeStyle = far ? '#27292f' : '#31333a';
      c.lineWidth = Math.max(0.8, px(0.0026));
      c.beginPath();
      c.moveTo(cs[0] + fnx * px(0.03), cs[1] + fny * px(0.03));
      c.lineTo(cs[0] - fnx * px(0.03), cs[1] - fny * px(0.03));
      c.stroke();
      c.restore();

      c.restore();
      if (holding && renderHeld?.overSleeve) renderHeld.overSleeve(c);
    };

    const drawTorso = () => {
      const T = (x, y) => P(...pose.T(x, y));
      const outline = [
        T(-0.088, -0.05), T(-0.094, 0.06), T(-0.092, 0.16), T(-0.074, 0.245), T(-0.042, 0.285), T(0.004, 0.292),
        T(0.04, 0.272), T(0.076, 0.21), T(0.084, 0.14), T(0.078, 0.06), T(0.084, -0.04), T(0.0, -0.055)
      ];
      const g = c.createLinearGradient(T(-0.1, 0.1)[0], 0, T(0.1, 0.1)[0], 0);
      g.addColorStop(0, shade(style.jacket, 0.82));
      g.addColorStop(1, shade(style.jacket, 1.08));
      c.fillStyle = g;
      smoothClosed(c, outline); c.fill();
      c.save();
      c.clip();
      c.strokeStyle = shade(style.jacket, 1.22);
      c.lineWidth = Math.max(0.8, px(0.0028));
      c.beginPath();
      const z0 = T(0.08, -0.035), z1 = T(0.07, 0.2);
      c.moveTo(z0[0], z0[1]); c.quadraticCurveTo(T(0.088, 0.08)[0], T(0.088, 0.08)[1], z1[0], z1[1]);
      c.stroke();
      c.fillStyle = shade(style.jacket, 0.7);
      smoothClosed(c, [T(-0.095, -0.055), T(0.09, -0.045), T(0.09, -0.02), T(-0.095, -0.025)]); c.fill();
      c.fillStyle = shade(style.jacket, 0.9);
      smoothClosed(c, [T(-0.035, 0.27), T(0.0, 0.3), T(0.03, 0.29), T(0.02, 0.255), T(-0.03, 0.25)]); c.fill();
      c.restore();
    };

    const drawHead = () => {
      const [hx, hy] = pose.head, a = pose.headTilt;
      const Hh = (x, y) => { const r = rot(x, y, a); return P(hx + r[0], hy + r[1]); };
      const N0 = P(...pose.neck0), N1 = P(...pose.neck1);
      c.fillStyle = shade(style.skin, 0.8);
      limb(c, N0, N1, px(0.052), px(0.046), px(0.044), 0, 0.5, 1); c.fill();
      const face = [
        Hh(0.0, 0.066), Hh(0.048, 0.048), Hh(0.062, 0.02), Hh(0.064, 0.006), Hh(0.08, -0.012), Hh(0.066, -0.02),
        Hh(0.068, -0.03), Hh(0.064, -0.04), Hh(0.062, -0.056), Hh(0.04, -0.068), Hh(0.004, -0.06), Hh(-0.03, -0.056),
        Hh(-0.058, -0.022), Hh(-0.066, 0.016), Hh(-0.046, 0.054)
      ];
      c.fillStyle = style.skin;
      smoothClosed(c, face); c.fill();
      c.fillStyle = shade(style.skin, 0.82);
      c.beginPath();
      const ear = Hh(-0.008, -0.006);
      c.ellipse(ear[0], ear[1], px(0.011), px(0.017), -a, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = style.hair;
      smoothClosed(c, [Hh(0.054, 0.04), Hh(0.03, 0.068), Hh(-0.02, 0.074), Hh(-0.064, 0.044), Hh(-0.07, 0.0), Hh(-0.058, -0.04), Hh(-0.036, -0.036), Hh(-0.03, 0.0), Hh(-0.006, 0.026), Hh(0.03, 0.036)]);
      c.fill();
    };

    const [farArm, nearArm] = pose.arms;
    drawArm(farArm, true, false);
    drawLeg(pose.legs[0], true);
    drawLeg(pose.legs[1], false);
    drawTorso();
    drawHead();
    return { drawNearArm: (holding, renderHeld) => drawArm(nearArm, false, holding, renderHeld) };
  }

  NS.figure = { makeGait, walkPose, draw, ANKLE_H };
})();
