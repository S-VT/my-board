/* SMM, page 1: a passer-by walks down a street full of advertising without looking up from the phone.
   Every moving part is a function of continuous time, so the loop has no cut. */
(() => {
  const NS = window.SmmStreet;
  const section = document.getElementById('sec-smm');
  const stage = section && section.querySelector('.smm-street');
  const canvas = stage && stage.querySelector('.smm-street-canvas');
  if (!NS || !NS.figure || !NS.ads || !canvas) return;
  const { figure: FIG, ads: ADS } = NS;
  const ctx = canvas.getContext('2d');
  const lens = stage.querySelector('.smm-lens');
  const feed = stage.querySelector('.smm-feed');
  const countEl = stage.querySelector('[data-smm-count]');
  const page = stage.querySelector('.smm-page--street') || stage;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  // Units: U = the walker's height. A 1.75 m person makes 1 U; a shop storey is ~2 U.
  const GAIT = 1.08, STRIDE = 0.66, STANCE = 0.6, SPEED = STRIDE / GAIT;
  const STREET_K = 0.86, FAR_K = 0.2, FRONT_K = 1.4;
  const STREET_L = 26, FAR_L = 9, FRONT_L = 7.5, JOINT = 0.5;
  const gait = FIG.makeGait(STRIDE, STANCE);

  const COPY = {
    ru: {
      pharmacy: 'АПТЕКА', ticker: 'КРУГЛОСУТОЧНО · СКИДКА 10% ПЕНСИОНЕРАМ · ДОСТАВКА ЛЕКАРСТВ · ',
      notes: ['КУПЛЮ ГАРАЖ', 'СДАМ КОМНАТУ', 'РЕМОНТ ХОЛОДИЛЬНИКОВ', 'ПОТЕРЯЛСЯ КОТ'],
      stop: 'ОСТАНОВКА', routes: 'А 12 · 45 · Т 7',
      rent: 'СДАЁТСЯ', rentSub: 'аренда от собственника',
      clothes: 'ОДЕЖДА · ОБУВЬ', liq: 'ЛИКВИДАЦИЯ', liqSub: 'МЫ ЗАКРЫВАЕМСЯ', tech: 'ТЕХНИКА', techSticker: 'РАССРОЧКА 0%',
      coffee: 'КОФЕЙНЯ', board: 'КАПУЧИНО', boardPrice: '190 ₽', open: 'ОТКРЫТО', shoes: 'РЕМОНТ ОБУВИ', shoes2: 'ключи · часы · сумки', enter: 'ВХОД ↓',
      fit1: 'ФИТНЕС-КЛУБ «ФОРМА»', fit2: 'ПЕРВАЯ НЕДЕЛЯ БЕСПЛАТНО', fit3: 'годовая карта −50% до конца месяца',
      mini: ['ГРУЗЧИКИ', 'ВОДИТЕЛЬ', 'ЙОГА', 'ПРОДАМ', 'СДАМ', 'РЕПЕТИТОР', 'МАНИКЮР', 'РЕМОНТ', 'ОБУЧЕНИЕ', 'ТАКСИ', 'КУПЛЮ', 'НЯНЯ'],
      law1: 'ЮРИСТ', law2: 'НА ЧАС', lawList: ['договоры', 'споры с застройщиком', 'наследство'], law3: 'КОНСУЛЬТАЦИЯ 1500 ₽', law4: 'первые 15 минут бесплатно',
      hand1: 'МАСТЕР', hand2: 'НА ЧАС', handList: ['сантехника', 'электрика', 'сборка мебели'], hand3: 'ВЫЕЗД ЗА 60 МИНУТ',
      liq1: 'ЛИКВИДАЦИЯ', liq2: 'МЫ ЗАКРЫВАЕМСЯ', liq3: 'всё должно уйти',
      sneak1: 'НОВАЯ КОЛЛЕКЦИЯ', sneak2: 'кеды из натуральной кожи',
      rep1: 'РЕМОНТ', rep2: 'ТЕЛЕФОНОВ', rep3: 'МИНУТ', rep4: 'замена экрана и батареи при вас',
      all1: 'ВСЁ ПО', all2: 'каждый день', all3: '99 ₽',
      flats1: 'НОВЫЙ ЖК', flats2: 'У ПАРКА', flats3: 'старт продаж · от 4,2 млн ₽',
      scr1: 'НОВАЯ СЫВОРОТКА', scr1s: 'увлажнение на 24 часа', scr2: 'СИЯНИЕ ЗА 7 ДНЕЙ', scr2s: 'клинически проверено',
      scr3: '−30% ТОЛЬКО СЕГОДНЯ', scr3s: 'в аптеках города', scrWave: 'ЭЙ, ПРИВЕТ!', scrWaveS: 'загляни, тут скидка'
    },
    en: {
      pharmacy: 'PHARMACY', ticker: 'OPEN 24/7 · 10% OFF FOR PENSIONERS · MEDICINE DELIVERY · ',
      notes: ['GARAGE WANTED', 'ROOM TO LET', 'FRIDGE REPAIRS', 'LOST CAT'],
      stop: 'BUS STOP', routes: 'A 12 · 45 · T 7',
      rent: 'TO LET', rentSub: 'direct from the owner',
      clothes: 'CLOTHING · SHOES', liq: 'CLOSING DOWN', liqSub: 'EVERYTHING MUST GO', tech: 'ELECTRONICS', techSticker: '0% INSTALMENTS',
      coffee: 'COFFEE HOUSE', board: 'CAPPUCCINO', boardPrice: '₽190', open: 'OPEN', shoes: 'SHOE REPAIR', shoes2: 'keys · watches · bags', enter: 'ENTRANCE ↓',
      fit1: 'FORMA FITNESS CLUB', fit2: 'FIRST WEEK FREE', fit3: 'annual pass −50% until the end of the month',
      mini: ['MOVERS', 'DRIVER', 'YOGA', 'FOR SALE', 'TO LET', 'TUTOR', 'NAILS', 'REPAIRS', 'LESSONS', 'TAXI', 'WANTED', 'NANNY'],
      law1: 'LAWYER', law2: 'BY THE HOUR', lawList: ['contracts', 'property disputes', 'inheritance'], law3: 'CONSULTATION ₽1500', law4: 'first 15 minutes free',
      hand1: 'HANDYMAN', hand2: 'BY THE HOUR', handList: ['plumbing', 'electrics', 'furniture assembly'], hand3: 'AT YOUR DOOR IN 60 MIN',
      liq1: 'CLOSING DOWN', liq2: 'EVERYTHING MUST GO', liq3: 'last days',
      sneak1: 'NEW COLLECTION', sneak2: 'full-grain leather sneakers',
      rep1: 'PHONE', rep2: 'REPAIRS', rep3: 'MINUTES', rep4: 'screen and battery replaced while you wait',
      all1: 'ALL AT', all2: 'every day', all3: '₽99',
      flats1: 'NEW HOMES', flats2: 'BY THE PARK', flats3: 'now selling · from ₽4.2M',
      scr1: 'NEW SERUM', scr1s: '24-hour hydration', scr2: 'GLOW IN 7 DAYS', scr2s: 'clinically tested',
      scr3: '−30% TODAY ONLY', scr3s: 'at city pharmacies', scrWave: 'HEY, HI THERE!', scrWaveS: 'come in, it’s on sale'
    }
  };
  // Strip positions (U) of every ad carrier, used for the "ads passed" counter.
  const CARRIERS = [1.1, 3.26, 7.65, 9.7, 11.95, 15.6, 18.9, 23.3];
  const CAT_X = 5.42;

  const imgs = {};
  const load = (key, file) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { postersDirty = true; if (!running) draw(); };
    im.src = `./assets/smm/${file}?v=hq2`;
    imgs[key] = im;
  };

  let W = 0, H = 0, dpr = 1, U = 1, groundY = 0, streetY = 0, walkerX = 0, vpY = 0, fs = 1;
  let farCache, streetCache, groundCache, skyGrad, groundGrad;
  let walkerCv, rimCv;
  let posters = null, prismFaces = null, postersDirty = true, cachedLang = '';
  let lensAnchor = null, feedStep = 0, feedCount = 0;
  let streetOff0 = 0, t = 0, running = false, raf = 0, prevTs = 0, loaded = false;
  let passed = 0, prevRel = null, waveMix = 0, waveTarget = 0;
  let wasCurrent = false, enterTimer = 0, enterT0 = 0;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = k => k * k * (3 - 2 * k);
  const mod = (a, n) => ((a % n) + n) % n;
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ru');
  const { fit, font } = ADS;

  function rng(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mk(w, h) {
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h));
    return cv;
  }
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function glowText(c, text, x, y, px, maxW, weight = 700, color = '#ececf0', blur = 0.6) {
    c.save();
    fit(c, text, weight, px, maxW);
    c.shadowColor = 'rgba(255,255,255,.6)';
    c.shadowBlur = px * blur;
    c.fillStyle = color;
    c.fillText(text, x, y);
    c.restore();
  }

  /* ---------- Layout ---------- */
  const lensVisible = () => !!lens && lens.offsetWidth > 0 && getComputedStyle(lens).display !== 'none';

  function resize() {
    const r = (page || stage).getBoundingClientRect();
    if (r.width < 20 || r.height < 20) return;
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const hasLens = lensVisible();
    U = hasLens ? Math.min(H * 0.41, W * 0.5) : Math.min(H * 0.34, W * 0.44);
    groundY = hasLens ? H * 0.93 : H * 0.855;
    streetY = groundY - 0.32 * U;
    vpY = (streetY - STREET_K * groundY) / (1 - STREET_K);
    walkerX = hasLens ? W * 0.42 : W * 0.5;
    streetOff0 = 0.3 * U - (walkerX + 0.6 * U);
    fs = Math.min(dpr, 1.5, 15000 / (STREET_L * U));

    skyGrad = ctx.createLinearGradient(0, 0, 0, streetY);
    skyGrad.addColorStop(0, '#030304'); skyGrad.addColorStop(1, '#0d0d10');
    groundGrad = ctx.createLinearGradient(0, streetY, 0, H);
    groundGrad.addColorStop(0, '#141416'); groundGrad.addColorStop(1, '#08080a');

    walkerCv = mk(1.0 * U * fs, 1.16 * U * fs);
    rimCv = mk(1.0 * U * fs, 1.16 * U * fs);
    buildCaches();
    measureLens();
    prevRel = null;
    if (!running) draw();
  }

  function measureLens() {
    lensAnchor = null;
    if (lensVisible()) {
      const lr = lens.querySelector('.smm-lens-phone').getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      lensAnchor = [lr.left - cr.left, lr.top - cr.top + lr.height * 0.4];
    }
    if (feed) {
      const posts = feed.children;
      feedCount = posts.length / 2;
      feedStep = posts.length > 1 ? posts[1].offsetTop - posts[0].offsetTop : 0;
    }
  }

  function buildPosters() {
    const L = COPY[lang()];
    const pw = 0.7 * U * fs, ph = 1.05 * U * fs;
    posters = ['sneakers', 'lawyer', 'liquidation', 'handyman'].map(k => ADS.renderPoster(k, pw, ph, L, imgs.sneakers));
    prismFaces = ['repair', 'all99', 'flats'].map(k => ADS.renderPoster(k, 2.4 * U * fs, 1.0 * U * fs, L));
    postersDirty = false;
  }

  /* ---------- Static caches ---------- */
  function buildCaches() {
    const L = COPY[lang()];
    cachedLang = lang();
    buildFar();
    const sw = STREET_L * U;
    streetCache = streetCache || document.createElement('canvas');
    streetCache.width = Math.ceil(sw * fs); streetCache.height = Math.ceil(streetY * fs);
    const c = streetCache.getContext('2d');
    c.setTransform(fs, 0, 0, fs, 0, 0);
    c.clearRect(0, 0, sw, streetY);
    drawFacades(c, L);
    groundCache = groundCache || document.createElement('canvas');
    groundCache.width = Math.ceil(sw * fs); groundCache.height = Math.ceil((H - streetY) * fs);
    const g = groundCache.getContext('2d');
    g.setTransform(fs, 0, 0, fs, 0, 0);
    g.clearRect(0, 0, sw, H - streetY);
    drawGroundLights(g);
    buildPosters();
  }

  function buildFar() {
    const w = FAR_L * U, h = streetY;
    farCache = farCache || document.createElement('canvas');
    farCache.width = Math.ceil(w * fs); farCache.height = Math.ceil(h * fs);
    const c = farCache.getContext('2d');
    c.setTransform(fs, 0, 0, fs, 0, 0);
    c.clearRect(0, 0, w, h);
    const rand = rng(17);
    let x = 0;
    while (x < w) {
      const bw = (0.9 + rand() * 1.6) * U, bh = (2.6 + rand() * 2.6) * U, top = h - bh;
      c.fillStyle = rand() > 0.5 ? '#0b0b0d' : '#0d0d10';
      c.fillRect(x, top, Math.min(bw, w - x) + 1, bh);
      for (let row = top + 0.25 * U; row < h - 0.3 * U; row += 0.42 * U) {
        for (let wx = x + 0.12 * U; wx < x + bw - 0.2 * U; wx += 0.3 * U) {
          if (rand() > 0.13) continue;
          c.fillStyle = rand() > 0.5 ? '#232428' : '#1a1b1e';
          c.fillRect(wx, row, 0.12 * U, 0.17 * U);
        }
      }
      x += bw;
    }
    c.fillStyle = 'rgba(3,3,4,.35)';
    c.fillRect(0, 0, w, h);
  }

  // Facade helpers work in strip coordinates: X in U from the strip start, heights in U above the pavement.
  function drawFacades(c, L) {
    const X = u => u * U, Y = u => streetY - u * U;
    const rand = rng(5);

    const wall = (x0, x1, height, top, bottom) => {
      const yTop = height === Infinity ? 0 : Y(height);
      const g = c.createLinearGradient(0, yTop, 0, streetY);
      g.addColorStop(0, top); g.addColorStop(1, bottom);
      c.fillStyle = g;
      c.fillRect(X(x0), yTop, X(x1 - x0) + 1, streetY - yTop);
      if (height !== Infinity) {
        c.fillStyle = 'rgba(255,255,255,.07)';
        c.fillRect(X(x0), yTop, X(x1 - x0), Math.max(1, 0.012 * U));
      }
    };
    const upperWindows = (x0, x1, from) => {
      for (let y = from; Y(y) > -U; y += 1.75) {
        for (let x = x0 + 0.35; x < x1 - 0.7; x += 1.05) {
          const lit = rand() < 0.3;
          c.fillStyle = '#060607';
          c.fillRect(X(x) - 0.03 * U, Y(y + 0.95) - 0.03 * U, 0.66 * U, 1.01 * U);
          if (lit) {
            const g = c.createLinearGradient(0, Y(y + 0.95), 0, Y(y));
            g.addColorStop(0, '#34353a'); g.addColorStop(1, '#1f2023');
            c.fillStyle = g;
          } else c.fillStyle = '#0f1012';
          c.fillRect(X(x), Y(y + 0.95), 0.6 * U, 0.95 * U);
          c.fillStyle = '#060607';
          c.fillRect(X(x + 0.29), Y(y + 0.95), 0.02 * U, 0.95 * U);
          c.fillRect(X(x), Y(y + 0.62), 0.6 * U, 0.02 * U);
          c.fillStyle = 'rgba(255,255,255,.05)';
          c.fillRect(X(x) - 0.05 * U, Y(y) , 0.7 * U, 0.04 * U);
        }
      }
    };
    const cornice = (x0, x1, h) => {
      c.fillStyle = '#1c1d20';
      c.fillRect(X(x0), Y(h + 0.12), X(x1 - x0), 0.12 * U);
      c.fillStyle = 'rgba(255,255,255,.06)';
      c.fillRect(X(x0), Y(h + 0.12), X(x1 - x0), Math.max(1, 0.01 * U));
    };
    const plinth = (x0, x1) => {
      c.fillStyle = '#0b0b0c';
      c.fillRect(X(x0), Y(0.16), X(x1 - x0), 0.16 * U);
    };
    const glass = (x, y, w, h, top = '#3c3d42', bottom = '#1b1c1f') => {
      c.fillStyle = '#070708';
      c.fillRect(X(x) - 0.04 * U, Y(y + h) - 0.04 * U, X(w) + 0.08 * U, X(h) + 0.08 * U);
      const g = c.createLinearGradient(0, Y(y + h), 0, Y(y));
      g.addColorStop(0, top); g.addColorStop(1, bottom);
      c.fillStyle = g;
      c.fillRect(X(x), Y(y + h), X(w), X(h));
    };
    const reflect = (x, y, w, h) => {
      const g = c.createLinearGradient(X(x), Y(y + h), X(x + w), Y(y));
      g.addColorStop(0.18, 'rgba(255,255,255,0)'); g.addColorStop(0.28, 'rgba(255,255,255,.06)');
      g.addColorStop(0.36, 'rgba(255,255,255,0)'); g.addColorStop(0.6, 'rgba(255,255,255,.035)'); g.addColorStop(0.66, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(X(x), Y(y + h), X(w), X(h));
    };
    const door = (x, w, h, glassy) => {
      c.fillStyle = '#0a0a0b';
      c.fillRect(X(x) - 0.04 * U, Y(h) - 0.04 * U, X(w) + 0.08 * U, X(h) + 0.04 * U);
      c.fillStyle = glassy ? '#26272b' : '#18181b';
      c.fillRect(X(x), Y(h), X(w), X(h));
      if (glassy) {
        c.fillStyle = '#0a0a0b';
        c.fillRect(X(x + w / 2) - 0.012 * U, Y(h), 0.024 * U, X(h));
      }
      c.fillStyle = '#8e8f93';
      c.fillRect(X(x + w * (glassy ? 0.42 : 0.82)), Y(h * 0.52), 0.018 * U, 0.16 * U);
    };
    const signBox = (x, w, y, h, text, px, lit = true) => {
      c.fillStyle = '#050506';
      c.fillRect(X(x), Y(y + h), X(w), X(h));
      c.fillStyle = 'rgba(255,255,255,.05)';
      c.fillRect(X(x), Y(y + h), X(w), Math.max(1, 0.01 * U));
      if (!text) return;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      if (lit) glowText(c, text, X(x + w / 2), Y(y + h / 2), px * U, X(w) * 0.82);
      else { fit(c, text, 700, px * U, X(w) * 0.82); c.fillStyle = '#3a3b3e'; c.fillText(text, X(x + w / 2), Y(y + h / 2)); }
    };
    const lampPost = x => {
      c.fillStyle = '#16171a';
      c.fillRect(X(x) - 0.03 * U, Y(2.55), 0.06 * U, 2.55 * U);
      c.fillRect(X(x) - 0.05 * U, Y(0.14), 0.1 * U, 0.14 * U);
      c.fillRect(X(x), Y(2.55), 0.42 * U, 0.035 * U);
      rr(c, X(x + 0.3), Y(2.55), 0.22 * U, 0.07 * U, 0.03 * U);
      c.fillStyle = '#1d1e21'; c.fill();
      const g = c.createRadialGradient(X(x + 0.41), Y(2.48), 0, X(x + 0.41), Y(2.48), 0.9 * U);
      g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(0.2, 'rgba(255,255,255,.07)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(X(x + 0.41) - 0.9 * U, Y(2.48) - 0.9 * U, 1.8 * U, 1.8 * U);
      c.fillStyle = '#f0f0f3';
      c.fillRect(X(x + 0.33), Y(2.485), 0.16 * U, 0.012 * U);
    };

    // A patch of small paper notices glued over each other, filling an otherwise empty wall.
    const posterCluster = (x0, x1, y0, y1, seed) => {
      const r = rng(seed);
      const words = L.mini;
      let x = x0, wi = seed % words.length;
      while (x < x1 - 0.1) {
        let y = y0 + r() * 0.08;
        const w = Math.min(0.13 + r() * 0.1, x1 - x);
        while (y < y1 - 0.12) {
          const h = Math.min(w * (1.15 + r() * 0.35), y1 - y);
          const a = (r() - 0.5) * 0.12;
          c.save();
          c.translate(X(x + w / 2), Y(y + h / 2));
          c.rotate(a);
          const tone = 120 + Math.floor(r() * 60);
          c.fillStyle = `rgb(${tone},${tone + 1},${tone + 4})`;
          c.fillRect(-X(w) / 2, -X(h) / 2, X(w), X(h));
          c.fillStyle = 'rgba(0,0,0,.18)';
          c.fillRect(-X(w) / 2, X(h) / 2 - 1, X(w), 1);
          if (r() > 0.45) {
            c.fillStyle = '#18181a'; c.textAlign = 'center'; c.textBaseline = 'top';
            const word = words[wi]; wi = (wi + 5) % words.length;
            fit(c, word, 800, 0.032 * U, X(w) * 0.84);
            c.fillText(word, 0, -X(h) / 2 + X(0.02));
          }
          c.fillStyle = 'rgba(20,20,22,.45)';
          for (let k = 0; k < 3; k++) c.fillRect(-X(w) * 0.36, -X(h) / 2 + X(0.075 + k * 0.03), X(w) * (0.5 + r() * 0.22), Math.max(1, 0.008 * U));
          if (h > 0.16 && r() > 0.4) {
            c.fillStyle = 'rgba(0,0,0,.35)';
            for (let k = 1; k < 5; k++) c.fillRect(-X(w) / 2 + X(w) * k / 5, X(h) / 2 - X(0.045), 1, X(0.045));
          }
          c.fillStyle = 'rgba(225,226,230,.35)';
          c.fillRect(-X(0.025), -X(h) / 2 - X(0.008), X(0.05), X(0.016));
          c.restore();
          y += h + 0.02 + r() * 0.04;
        }
        x += w + 0.015 + r() * 0.03;
      }
    };
    const litterBin = x => {
      const w = 0.19 * U, h = 0.32 * U, bx = X(x) - w / 2, top = streetY - h;
      c.fillStyle = '#18191c';
      c.beginPath();
      c.moveTo(bx + w * 0.06, streetY); c.lineTo(bx + w * 0.94, streetY);
      c.lineTo(bx + w, top + h * 0.12); c.lineTo(bx, top + h * 0.12); c.closePath(); c.fill();
      c.fillStyle = '#2a2b2f'; rr(c, bx - w * 0.04, top, w * 1.08, h * 0.15, w * 0.06); c.fill();
      c.fillStyle = '#050506'; c.fillRect(bx + w * 0.2, top + h * 0.045, w * 0.6, h * 0.05);
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(bx + w * 0.12, top + h * 0.2, w * 0.08, h * 0.72);
      c.fillStyle = '#26272b'; c.fillRect(bx + w * 0.1, top + h * 0.45, w * 0.8, h * 0.05);
    };
    // Photocopied face of the same cat that sits at the bus stop.
    const catFace = (cx, cy, r) => {
      const s2 = r / 0.3;
      c.fillStyle = '#4c4d51';
      [-1, 1].forEach(side => {
        c.beginPath();
        c.moveTo(cx + side * 0.07 * s2, cy - 0.11 * s2);
        c.quadraticCurveTo(cx + side * 0.19 * s2, cy - 0.38 * s2, cx + side * 0.24 * s2, cy - 0.36 * s2);
        c.quadraticCurveTo(cx + side * 0.29 * s2, cy - 0.2 * s2, cx + side * 0.27 * s2, cy - 0.08 * s2);
        c.closePath(); c.fill();
      });
      c.beginPath(); c.ellipse(cx, cy, 0.3 * s2, 0.25 * s2, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2e2f32';
      [-0.06, 0, 0.06].forEach(fx => { c.beginPath(); c.ellipse(cx + fx * s2, cy - 0.19 * s2, 0.014 * s2, 0.045 * s2, 0, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = '#9d9ea2';
      c.beginPath(); c.ellipse(cx, cy + 0.09 * s2, 0.15 * s2, 0.1 * s2, 0, 0, Math.PI * 2); c.fill();
      [-0.12, 0.12].forEach(ex => {
        c.fillStyle = '#0e0e10'; c.beginPath(); c.ellipse(cx + ex * s2, cy - 0.02 * s2, 0.068 * s2, 0.078 * s2, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#e6e6ea'; c.beginPath(); c.arc(cx + (ex - 0.022) * s2, cy - 0.045 * s2, 0.024 * s2, 0, Math.PI * 2); c.fill();
      });
      c.fillStyle = '#2a2a2d';
      c.beginPath(); c.moveTo(cx - 0.028 * s2, cy + 0.045 * s2); c.lineTo(cx + 0.028 * s2, cy + 0.045 * s2); c.lineTo(cx, cy + 0.075 * s2); c.closePath(); c.fill();
    };

    /* Building A: pharmacy and residential entrance. */
    wall(0, 4.6, Infinity, '#141416', '#111113');
    upperWindows(0, 4.6, 2.45);
    cornice(0, 4.6, 2.12);
    plinth(0, 4.6);
    glass(0.25, 0.2, 1.7, 1.1, '#4a4b50', '#26272a');
    c.save();
    c.beginPath(); c.rect(X(0.25), Y(1.3), X(1.7), X(1.1)); c.clip();
    for (let row = 0; row < 4; row++) {
      const y = 0.32 + row * 0.25;
      c.fillStyle = '#18191b'; c.fillRect(X(0.25), Y(y), X(1.7), 0.025 * U);
      for (let x = 0.3; x < 1.9; x += 0.075) {
        const h = 0.08 + rand() * 0.1;
        c.fillStyle = rand() > 0.5 ? '#77787d' : '#5c5d61';
        c.fillRect(X(x), Y(y + h), 0.055 * U, h * U);
      }
    }
    c.restore();
    reflect(0.25, 0.2, 1.7, 1.1);
    door(2.15, 0.6, 1.25, true);
    c.fillStyle = '#050506'; c.fillRect(X(0.25), Y(1.5), X(1.7), 0.14 * U);
    signBox(0.2, 2.6, 1.54, 0.3, L.pharmacy, 0.16);
    c.save();
    c.shadowColor = 'rgba(255,255,255,.7)'; c.shadowBlur = 0.12 * U;
    c.fillStyle = '#f0f0f3';
    const cx = X(0.42), cy = Y(1.69), arm = 0.04 * U, len = 0.105 * U;
    c.fillRect(cx - arm, cy - len, arm * 2, len * 2); c.fillRect(cx - len, cy - arm, len * 2, arm * 2);
    c.restore();
    door(3.62, 0.56, 1.25, false);
    c.fillStyle = '#1c1d20'; c.fillRect(X(3.5), Y(1.42), X(0.8), 0.06 * U);
    const bulb = c.createRadialGradient(X(3.9), Y(1.34), 0, X(3.9), Y(1.34), 0.6 * U);
    bulb.addColorStop(0, 'rgba(255,255,255,.2)'); bulb.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = bulb; c.fillRect(X(3.3), Y(1.34) - 0.6 * U, 1.2 * U, 1.2 * U);
    // Notice board: paper notices with tear-off tabs.
    c.fillStyle = '#0d0d0e'; c.fillRect(X(3.02), Y(1.32), X(0.5), X(0.56));
    const notes = [[3.05, 1.29, 0.22, 0.24, -0.04], [3.28, 1.3, 0.21, 0.2, 0.03], [3.06, 1.02, 0.2, 0.22, 0.02], [3.29, 1.06, 0.2, 0.26, -0.03]];
    notes.forEach(([x, y, w, h, a], i) => {
      c.save();
      c.translate(X(x + w / 2), Y(y));
      c.rotate(a);
      c.fillStyle = i === 3 ? '#a9aaae' : '#8c8d91';
      c.fillRect(-X(w) / 2, 0, X(w), X(h));
      c.fillStyle = '#141416'; c.textAlign = 'center'; c.textBaseline = 'top';
      const words = L.notes[i].split(' ');
      words.forEach((wd, j) => { fit(c, wd, 800, 0.04 * U, X(w) * 0.86); c.fillText(wd, 0, X(0.025 + j * 0.045)); });
      if (i === 3) catFace(0, X(0.165), X(0.05));
      c.fillStyle = 'rgba(0,0,0,.4)';
      for (let k = 0; k < 6; k++) if (k !== 1 && k !== 4) c.fillRect(-X(w) / 2 + X(w) * k / 6 + 1, X(h) - X(0.05), X(w) / 6 - 2, 1);
      c.restore();
    });
    litterBin(2.88);
    posterCluster(4.22, 4.56, 0.5, 1.22, 13);
    lampPost(4.75);

    /* Building B: low pavilion with the bus stop and the prism billboard. */
    wall(4.6, 11.2, 2.05, '#151518', '#101012');
    for (let x = 4.6; x < 11.2; x += 1.1) { c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(X(x), Y(2.05), 1, 2.05 * U); }
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(X(4.6), Y(1.05), X(6.6), 1);
    plinth(4.6, 11.2);
    // Shelter: back glass, roof, bench, route sign; the citylight panel is animated separately.
    c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(X(5.2), Y(1.4), X(2.05), 1.25 * U);
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = Math.max(1, 0.01 * U);
    c.strokeRect(X(5.2), Y(1.4), X(2.05), 1.25 * U);
    c.fillStyle = '#1a1b1e';
    [5.16, 6.22, 7.25, 8.06].forEach(x => c.fillRect(X(x), Y(1.46), 0.045 * U, 1.46 * U));
    c.fillStyle = '#202125'; c.fillRect(X(5.05), Y(1.56), X(3.15), 0.1 * U);
    c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(X(5.05), Y(1.56), X(3.15), Math.max(1, 0.01 * U));
    c.fillStyle = '#18191c'; c.fillRect(X(5.4), Y(0.48), X(1.6), 0.05 * U);
    [5.5, 6.85].forEach(x => c.fillRect(X(x), Y(0.48), 0.03 * U, 0.48 * U));
    // Light strip under the roof.
    c.fillStyle = '#d8d9dd'; c.fillRect(X(5.3), Y(1.47), X(1.85), Math.max(1, 0.012 * U));
    const strip = c.createLinearGradient(0, Y(1.46), 0, streetY);
    strip.addColorStop(0, 'rgba(255,255,255,.1)'); strip.addColorStop(0.6, 'rgba(255,255,255,.03)'); strip.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = strip; c.fillRect(X(5.2), Y(1.46), X(2.05), 1.46 * U);
    c.fillStyle = '#060607'; c.fillRect(X(7.3) - 0.04 * U, Y(1.29) - 0.04 * U, 0.78 * U, 1.13 * U);
    c.fillStyle = '#16171a'; c.fillRect(X(4.95), Y(1.84), 0.035 * U, 1.84 * U);
    c.fillStyle = '#d6d7db'; c.fillRect(X(4.83), Y(1.84), 0.28 * U, 0.2 * U);
    c.fillStyle = '#111113'; c.textAlign = 'center'; c.textBaseline = 'middle';
    fit(c, L.stop, 800, 0.045 * U, 0.24 * U); c.fillText(L.stop, X(4.97), Y(1.78));
    fit(c, L.routes, 600, 0.04 * U, 0.24 * U); c.fillText(L.routes, X(4.97), Y(1.7));
    // Prism billboard frame.
    c.fillStyle = '#050506'; c.fillRect(X(8.42), Y(1.83), X(2.56), X(1.16));
    c.fillStyle = '#1c1d20';
    [8.9, 10.5].forEach(x => { c.fillRect(X(x), Y(1.98), 0.03 * U, 0.16 * U); c.fillRect(X(x) - 0.06 * U, Y(1.99), 0.16 * U, 0.03 * U); });
    // A single wide paper poster pasted under the prism billboard.
    c.save();
    c.translate(X(9.7), Y(0.41));
    c.rotate(-0.012);
    const pw = 2.2 * U, ph = 0.4 * U;
    const paper = c.createLinearGradient(-pw / 2, 0, pw / 2, 0);
    paper.addColorStop(0, '#bdbec2'); paper.addColorStop(0.5, '#cfd0d4'); paper.addColorStop(1, '#b4b5b9');
    c.fillStyle = paper; c.fillRect(-pw / 2, -ph / 2, pw, ph);
    c.fillStyle = '#121214'; c.fillRect(-pw / 2, -ph / 2, pw * 0.3, ph);
    c.fillStyle = '#e9e9ec'; c.textAlign = 'center'; c.textBaseline = 'middle';
    fit(c, '−50%', 900, 0.17 * U, pw * 0.26); c.fillText('−50%', -pw / 2 + pw * 0.15, 0);
    c.fillStyle = '#111113'; c.textAlign = 'left';
    fit(c, L.fit1, 900, 0.085 * U, pw * 0.62); c.fillText(L.fit1, -pw / 2 + pw * 0.34, -ph * 0.22);
    fit(c, L.fit2, 800, 0.06 * U, pw * 0.62); c.fillText(L.fit2, -pw / 2 + pw * 0.34, ph * 0.06);
    c.fillStyle = '#3a3b3f'; fit(c, L.fit3, 500, 0.038 * U, pw * 0.62); c.fillText(L.fit3, -pw / 2 + pw * 0.34, ph * 0.3);
    // Paste creases and a peeled corner.
    c.fillStyle = 'rgba(0,0,0,.08)';
    [0.22, 0.58].forEach(k => c.fillRect(-pw / 2 + pw * k, -ph / 2, 1, ph));
    c.fillStyle = '#0f0f11';
    c.beginPath(); c.moveTo(pw / 2, ph / 2); c.lineTo(pw / 2 - 0.08 * U, ph / 2); c.lineTo(pw / 2, ph / 2 - 0.08 * U); c.closePath(); c.fill();
    c.fillStyle = '#9fa0a4';
    c.beginPath(); c.moveTo(pw / 2 - 0.08 * U, ph / 2); c.lineTo(pw / 2, ph / 2 - 0.08 * U); c.lineTo(pw / 2 - 0.07 * U, ph / 2 - 0.07 * U); c.closePath(); c.fill();
    c.restore();
    litterBin(8.27);

    /* Building C: a wall of notices behind the digital screen and a narrow vacant shop. */
    wall(11.2, 14.4, 2.6, '#131315', '#0f0f11');
    cornice(11.2, 14.4, 2.48);
    plinth(11.2, 14.4);
    posterCluster(11.25, 12.6, 0.22, 1.42, 31);
    glass(12.74, 0.2, 1.0, 1.1, '#6d6e72', '#55565a');
    c.fillStyle = 'rgba(0,0,0,.12)';
    for (let x = 12.74; x < 13.74; x += 0.25) c.fillRect(X(x), Y(1.3), 1, 1.1 * U);
    c.save();
    c.translate(X(13.24), Y(0.86));
    c.fillStyle = '#e9e9ec'; c.fillRect(-0.42 * U, -0.2 * U, 0.84 * U, 0.4 * U);
    c.fillStyle = '#111113'; c.textAlign = 'center'; c.textBaseline = 'middle';
    fit(c, L.rent, 900, 0.13 * U, 0.74 * U); c.fillText(L.rent, 0, -0.05 * U);
    fit(c, L.rentSub, 500, 0.04 * U, 0.74 * U); c.fillText(L.rentSub, 0, 0.1 * U);
    c.restore();
    door(13.84, 0.48, 1.25, true);
    signBox(12.68, 1.68, 1.5, 0.3, '', 0);

    /* Building D: three shops under one modern facade. */
    wall(14.4, 24.2, Infinity, '#121215', '#0f0f12');
    upperWindows(14.4, 24.2, 2.45);
    cornice(14.4, 24.2, 2.12);
    plinth(14.4, 24.2);
    const shop = (x, kind) => {
      glass(x + 0.15, 0.2, 2.2, 1.12, kind === 'tech' ? '#45464b' : '#3f4044', '#1c1d20');
      c.save();
      c.beginPath(); c.rect(X(x + 0.15), Y(1.32), X(2.2), X(1.12)); c.clip();
      if (kind === 'clothes') {
        [0.55, 1.15, 1.8].forEach((mx, i) => {
          const cx = X(x + mx), base = Y(0.2);
          c.fillStyle = '#141416';
          c.fillRect(cx - 0.008 * U, base - 0.3 * U, 0.016 * U, 0.3 * U);
          c.fillRect(cx - 0.09 * U, base - 0.018 * U, 0.18 * U, 0.018 * U);
          c.fillStyle = ['#2a2b2f', '#1f2023', '#333438'][i];
          c.beginPath();
          c.moveTo(cx - 0.1 * U, base - 0.92 * U);
          c.quadraticCurveTo(cx, base - 0.97 * U, cx + 0.1 * U, base - 0.92 * U);
          c.lineTo(cx + (i === 1 ? 0.16 : 0.1) * U, base - 0.3 * U);
          c.lineTo(cx - (i === 1 ? 0.16 : 0.1) * U, base - 0.3 * U);
          c.closePath(); c.fill();
          c.fillStyle = '#58595d';
          c.beginPath(); c.ellipse(cx, base - 1.02 * U, 0.05 * U, 0.06 * U, 0, 0, Math.PI * 2); c.fill();
        });
        c.save();
        c.translate(X(x + 1.25), Y(1.05));
        c.rotate(-0.08);
        c.fillStyle = '#ececf0'; c.fillRect(-0.95 * U, -0.17 * U, 1.9 * U, 0.34 * U);
        c.fillStyle = '#0d0d0f'; c.textAlign = 'center'; c.textBaseline = 'middle';
        fit(c, `${L.liq} −90%`, 900, 0.17 * U, 1.75 * U); c.fillText(`${L.liq} −90%`, 0, 0.005 * U);
        c.restore();
        c.fillStyle = '#0d0d0f'; c.fillRect(X(x + 0.15), Y(0.5), X(2.2), 0.16 * U);
        c.fillStyle = '#ececf0'; c.textAlign = 'center'; c.textBaseline = 'middle';
        fit(c, L.liqSub, 800, 0.08 * U, X(2.0)); c.fillText(L.liqSub, X(x + 1.25), Y(0.42));
      } else if (kind === 'tech') {
        for (let row = 0; row < 2; row++) {
          const y = 1.1 - row * 0.34;
          c.fillStyle = '#121214'; c.fillRect(X(x + 0.15), Y(y - 0.26), X(2.2), 0.03 * U);
          for (let k = 0; k < (row === 0 ? 4 : 7); k++) {
            const w = row === 0 ? 0.42 : 0.18, tx = x + 0.25 + k * (row === 0 ? 0.52 : 0.29);
            c.fillStyle = '#08080a';
            c.fillRect(X(tx), Y(y), X(w), X(row === 0 ? 0.26 : 0.2));
          }
        }
      } else {
        c.fillStyle = '#161618'; c.fillRect(X(x + 0.15), Y(0.62), X(2.2), 0.42 * U);
        c.fillStyle = '#26272b'; c.fillRect(X(x + 1.45), Y(0.95), 0.42 * U, 0.33 * U);
        for (let k = 0; k < 6; k++) { c.fillStyle = '#8f9094'; rr(c, X(x + 0.3 + k * 0.13), Y(0.74), 0.08 * U, 0.1 * U, 0.015 * U); c.fill(); }
        // Two customers at the window counter, also looking at their phones.
        [[x + 0.55, -1], [x + 1.95, 1]].forEach(([px, side]) => {
          c.fillStyle = '#0c0c0e';
          c.beginPath(); c.ellipse(X(px), Y(0.88), 0.075 * U, 0.08 * U, 0, 0, Math.PI * 2); c.fill();
          rr(c, X(px) - 0.13 * U, Y(0.82), 0.26 * U, 0.42 * U, 0.1 * U); c.fill();
          const sx = X(px) + side * 0.07 * U;
          const g = c.createRadialGradient(sx, Y(0.72), 0, sx, Y(0.72), 0.12 * U);
          g.addColorStop(0, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = g; c.fillRect(sx - 0.12 * U, Y(0.72) - 0.12 * U, 0.24 * U, 0.24 * U);
        });
        [0.5, 1.2, 1.9].forEach(lx => {
          c.fillStyle = '#111113'; c.fillRect(X(x + lx), Y(1.32), 0.008 * U, 0.2 * U);
          const g = c.createRadialGradient(X(x + lx), Y(1.1), 0, X(x + lx), Y(1.1), 0.32 * U);
          g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(0.12, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = g; c.fillRect(X(x + lx) - 0.32 * U, Y(1.42), 0.64 * U, 0.64 * U);
        });
      }
      c.restore();
      reflect(x + 0.15, 0.2, 2.2, 1.12);
      door(x + 2.48, 0.55, 1.25, true);
      const title = kind === 'clothes' ? L.clothes : kind === 'tech' ? L.tech : L.coffee;
      signBox(x + 0.1, 3.0, 1.5, 0.3, title, 0.14);
      if (kind === 'coffee') {
        for (let k = 0; k < 10; k++) {
          c.fillStyle = k % 2 ? '#1c1d20' : '#2c2d31';
          c.beginPath();
          c.moveTo(X(x + 0.1 + k * 0.3), Y(1.48)); c.lineTo(X(x + 0.4 + k * 0.3), Y(1.48));
          c.lineTo(X(x + 0.44 + k * 0.3), Y(1.33)); c.lineTo(X(x + 0.06 + k * 0.3), Y(1.33));
          c.closePath(); c.fill();
        }
        c.fillStyle = '#a1a1a6'; c.textAlign = 'center'; c.textBaseline = 'middle';
        fit(c, L.open, 700, 0.045 * U, 0.4 * U, true); c.fillText(L.open, X(x + 2.755), Y(1.05));
      }
    };
    shop(14.5, 'clothes');
    shop(17.75, 'tech');
    shop(21.0, 'coffee');
    posterCluster(17.55, 17.88, 0.48, 1.18, 59);
    posterCluster(20.8, 21.13, 0.5, 1.2, 61);
    litterBin(20.96);
    lampPost(17.62);
    // Café A-board on the pavement.
    const ax = X(23.2), base = streetY;
    c.strokeStyle = '#1c1d20'; c.lineWidth = 0.022 * U;
    c.beginPath(); c.moveTo(ax + 0.03 * U, base); c.lineTo(ax + 0.12 * U, base - 0.6 * U); c.moveTo(ax + 0.33 * U, base); c.lineTo(ax + 0.24 * U, base - 0.6 * U); c.stroke();
    rr(c, ax, base - 0.58 * U, 0.36 * U, 0.48 * U, 0.02 * U);
    c.fillStyle = '#111113'; c.fill();
    c.strokeStyle = '#3a3b3f'; c.lineWidth = Math.max(1, 0.008 * U); c.stroke();
    c.fillStyle = '#d6d7db'; c.textAlign = 'center'; c.textBaseline = 'middle';
    fit(c, L.board, 700, 0.05 * U, 0.3 * U); c.fillText(L.board, ax + 0.18 * U, base - 0.47 * U);
    fit(c, L.boardPrice, 900, 0.09 * U, 0.3 * U); c.fillText(L.boardPrice, ax + 0.18 * U, base - 0.33 * U);
    c.fillStyle = 'rgba(214,215,219,.35)';
    c.fillRect(ax + 0.07 * U, base - 0.22 * U, 0.22 * U, 1); c.fillRect(ax + 0.1 * U, base - 0.18 * U, 0.16 * U, 1);

    /* Building E: brick wall with a basement shoe-repair shop. */
    wall(24.2, 26, Infinity, '#141417', '#101012');
    c.fillStyle = 'rgba(0,0,0,.28)';
    for (let row = 0, y = 0.16; Y(y) > 0; row++, y += 0.085) {
      c.fillRect(X(24.2), Y(y), X(1.8), 1);
      for (let x = 24.2 + (row % 2) * 0.09; x < 26; x += 0.18) c.fillRect(X(x), Y(y + 0.085), 1, 0.085 * U);
    }
    upperWindows(24.2, 26, 2.45);
    cornice(24.2, 26, 2.12);
    plinth(24.2, 26);
    c.fillStyle = '#1e1f22'; c.fillRect(X(24.3), 0, 0.05 * U, streetY);
    c.fillRect(X(24.28), Y(0.12), 0.12 * U, 0.06 * U);
    // Sunken door: only its upper part shows above the pavement.
    c.fillStyle = '#070708'; c.fillRect(X(24.62), Y(0.92), 0.74 * U, 0.92 * U);
    c.fillStyle = '#1d1e21'; c.fillRect(X(24.68), Y(0.86), 0.62 * U, 0.86 * U);
    c.fillStyle = '#4a4b50'; c.fillRect(X(24.74), Y(0.8), 0.5 * U, 0.3 * U);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(X(24.74), Y(0.8), 0.5 * U, 0.02 * U);
    // Lightbox with a boot and a key.
    c.save();
    c.shadowColor = 'rgba(255,255,255,.5)'; c.shadowBlur = 0.12 * U;
    c.fillStyle = '#e6e6ea'; c.fillRect(X(24.48), Y(1.4), 1.02 * U, 0.34 * U);
    c.restore();
    c.fillStyle = '#111113';
    c.beginPath();
    c.moveTo(X(24.555), Y(1.335)); c.lineTo(X(24.635), Y(1.335));
    c.lineTo(X(24.64), Y(1.215));
    c.quadraticCurveTo(X(24.7), Y(1.205), X(24.745), Y(1.175));
    c.quadraticCurveTo(X(24.765), Y(1.155), X(24.76), Y(1.13));
    c.lineTo(X(24.6), Y(1.13)); c.lineTo(X(24.6), Y(1.145)); c.lineTo(X(24.575), Y(1.145)); c.lineTo(X(24.575), Y(1.13));
    c.lineTo(X(24.55), Y(1.13)); c.closePath(); c.fill();
    c.fillStyle = '#e6e6ea'; c.fillRect(X(24.565), Y(1.3), 0.06 * U, Math.max(1, 0.008 * U));
    c.textAlign = 'left'; c.textBaseline = 'middle';
    fit(c, L.shoes, 900, 0.085 * U, 0.66 * U); c.fillText(L.shoes, X(24.8), Y(1.29));
    c.fillStyle = '#3a3b3f'; fit(c, L.shoes2, 600, 0.045 * U, 0.66 * U); c.fillText(L.shoes2, X(24.8), Y(1.16));
    // Railing round the stairwell, with a small arrow sign.
    c.fillStyle = '#5a5b60';
    c.fillRect(X(24.5), Y(0.5), 1.0 * U, 0.025 * U);
    [24.52, 24.86, 25.2, 25.48].forEach(x => c.fillRect(X(x), Y(0.5), 0.02 * U, 0.5 * U));
    c.fillStyle = '#e6e6ea'; c.fillRect(X(24.82), Y(0.47), 0.36 * U, 0.12 * U);
    c.fillStyle = '#111113'; c.textAlign = 'center';
    fit(c, L.enter, 800, 0.05 * U, 0.32 * U); c.fillText(L.enter, X(25.0), Y(0.41));
    posterCluster(25.56, 25.98, 0.5, 1.3, 77);
    litterBin(25.7);
    lampPost(25.98);
  }

  // Reflections of lit windows and lamp pools on the pavement, in the street layer's coordinates.
  function drawGroundLights(g) {
    const X = u => u * U;
    const depth = H - streetY;
    const refl = (x0, x1, a) => {
      const gr = g.createLinearGradient(0, 0, 0, depth * 0.85);
      gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(X(x0), 0); g.lineTo(X(x1), 0);
      g.lineTo(X(x1) + 0.15 * U, depth * 0.85); g.lineTo(X(x0) - 0.15 * U, depth * 0.85);
      g.closePath(); g.fill();
    };
    refl(0.25, 1.95, 0.07); refl(7.3, 8.0, 0.09); refl(8.42, 10.98, 0.05); refl(12.74, 13.74, 0.06); refl(11.55, 12.35, 0.08); refl(24.48, 25.5, 0.05);
    refl(14.65, 16.85, 0.06); refl(17.9, 20.1, 0.07); refl(21.15, 23.35, 0.08);
    [4.75 + 0.41, 17.62 + 0.41, 25.98 + 0.41].forEach(x => {
      g.save();
      g.translate(X(x), depth * 0.45);
      g.scale(1, 0.32);
      const p = g.createRadialGradient(0, 0, 0, 0, 0, 1.3 * U);
      p.addColorStop(0, 'rgba(255,255,255,.09)'); p.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = p;
      g.beginPath(); g.arc(0, 0, 1.3 * U, 0, Math.PI * 2); g.fill();
      g.restore();
    });
  }

  /* ---------- Dynamic street parts ---------- */
  function drawDynamic(x0, L, now) {
    const X = u => x0 + u * U, Y = u => streetY - u * U;
    const vis = (a, b) => X(b) > -0.5 * U && X(a) < W + 0.5 * U;
    if (vis(0.25, 1.95)) ADS.drawTicker(ctx, L.ticker, X(0.27), Y(1.49), 1.66 * U, 0.12 * U, now, 0.55 * U);
    if (vis(7.3, 8.0) && posters) ADS.drawScroller(ctx, posters, X(7.3), Y(1.25), 0.7 * U, 1.05 * U, now);
    if (vis(8.42, 10.98) && prismFaces) ADS.drawPrism(ctx, prismFaces, X(8.5), Y(1.75), 2.4 * U, 1.0 * U, now + 2.2, 16);
    if (vis(11.4, 12.6)) {
      const cx = X(11.95);
      // The greeting wipes in once the walker is close and out after he has passed.
      const dx = cx - walkerX;
      waveTarget = dx < 1.3 * U && dx > -0.7 * U ? 1 : 0;
      ctx.fillStyle = '#121214';
      ctx.fillRect(X(11.85), Y(0.24), 0.2 * U, 0.24 * U);
      rr(ctx, X(11.5), Y(1.72), 0.9 * U, 1.52 * U, 0.04 * U);
      ctx.fillStyle = '#060607'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1; ctx.stroke();
      ADS.drawScreen(ctx, imgs, X(11.55), Y(1.67), 0.8 * U, 1.42 * U, now, waveMix, L);
      const glow = ctx.createRadialGradient(cx, Y(1.0), 0, cx, Y(1.0), 1.4 * U);
      glow.addColorStop(0, 'rgba(255,255,255,.07)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(cx - 1.4 * U, Y(2.4), 2.8 * U, 2.4 * U);
    }
    if (vis(17.9, 20.2)) {
      for (let row = 0; row < 2; row++) {
        const y = 1.1 - row * 0.34;
        for (let k = 0; k < (row === 0 ? 4 : 7); k++) {
          const w = row === 0 ? 0.42 : 0.18, tx = 17.75 + 0.25 + k * (row === 0 ? 0.52 : 0.29);
          const flick = 0.5 + 0.5 * Math.sin(now * (row === 0 ? 0.9 : 1.6) + k * 1.9 + row * 2.3);
          const g = ctx.createLinearGradient(X(tx), Y(y), X(tx + w), Y(y - 0.2));
          g.addColorStop(0, `rgba(210,211,216,${0.32 + flick * 0.3})`);
          g.addColorStop(1, `rgba(120,121,126,${0.18 + flick * 0.2})`);
          ctx.fillStyle = g;
          const ins = 0.015 * U;
          ctx.fillRect(X(tx) + ins, Y(y) + ins, w * U - ins * 2, (row === 0 ? 0.26 : 0.2) * U - ins * 2);
        }
      }
      // Window sticker sits on the glass, in front of the screens.
      ctx.fillStyle = '#ececf0'; ctx.fillRect(X(18.05), Y(0.38), 1.1 * U, 0.14 * U);
      ctx.fillStyle = '#111113'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      fit(ctx, L.techSticker, 900, 0.08 * U, 1.0 * U); ctx.fillText(L.techSticker, X(18.1), Y(0.31));
    }
    if (vis(CAT_X - 0.4, CAT_X + 0.4)) drawCat(X(CAT_X), streetY + 0.035 * U, now);
  }

  /* ---------- Cat at the bus stop ---------- */
  // The cat from the "lost cat" notice sits at the open end of the shelter and follows the walker with its eyes.
  function drawCat(x, ground, now) {
    const s = 0.26 * U;
    const look = clamp((walkerX - x) / (2.2 * U), -1, 1);
    const blink = mod(now + 0.8, 4.6) < 0.16;
    const tilt = Math.sin(now * 0.55) * 0.07 - look * 0.05;
    const twitch = mod(now, 5.9) < 0.22 ? Math.sin(mod(now, 5.9) / 0.22 * Math.PI) * 0.35 : 0;
    const sway = Math.sin(now * 1.5) * 0.6 + Math.sin(now * 0.63) * 0.3;
    const fur = '#6c6d72', light = '#b3b4b9', dark = '#4b4c51', inner = '#9a9b9f';
    ctx.save();
    ctx.translate(x, ground);

    ctx.save();
    ctx.scale(1, 0.22);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.55 * s);
    sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 0.55 * s, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Fluffy tail curled round the front paws, tip swaying.
    ctx.lineCap = 'round';
    ctx.strokeStyle = fur; ctx.lineWidth = 0.13 * s;
    ctx.beginPath();
    ctx.moveTo(-0.22 * s, -0.06 * s);
    ctx.bezierCurveTo(-0.5 * s, -0.02 * s, -0.42 * s, 0.05 * s, 0.05 * s, 0.02 * s);
    ctx.quadraticCurveTo((0.32 + sway * 0.04) * s, 0, (0.36 + sway * 0.06) * s, (-0.1 - Math.abs(sway) * 0.04) * s);
    ctx.stroke();
    ctx.strokeStyle = light; ctx.lineWidth = 0.1 * s;
    ctx.beginPath();
    ctx.moveTo((0.3 + sway * 0.05) * s, (-0.04 - Math.abs(sway) * 0.02) * s);
    ctx.lineTo((0.36 + sway * 0.06) * s, (-0.1 - Math.abs(sway) * 0.04) * s);
    ctx.stroke();

    // Body: a soft pear with a light bib.
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.moveTo(-0.28 * s, -0.02 * s);
    ctx.bezierCurveTo(-0.33 * s, -0.36 * s, -0.2 * s, -0.56 * s, 0, -0.56 * s);
    ctx.bezierCurveTo(0.2 * s, -0.56 * s, 0.33 * s, -0.36 * s, 0.28 * s, -0.02 * s);
    ctx.quadraticCurveTo(0, 0.02 * s, -0.28 * s, -0.02 * s);
    ctx.fill();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.ellipse(0, -0.3 * s, 0.13 * s, 0.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    [-0.2, 0.2].forEach(sx => { ctx.beginPath(); ctx.ellipse(sx * s, -0.32 * s, 0.035 * s, 0.1 * s, sx > 0 ? -0.3 : 0.3, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = light;
    [-0.08, 0.08].forEach(px => { ctx.beginPath(); ctx.ellipse(px * s, -0.025 * s, 0.065 * s, 0.045 * s, 0, 0, Math.PI * 2); ctx.fill(); });

    // Head: big and round, gently tilting towards the walker.
    ctx.translate(look * 0.03 * s, -0.74 * s);
    ctx.rotate(tilt);
    const ear = (side, extra) => {
      ctx.save();
      ctx.translate(side * 0.17 * s, -0.17 * s);
      ctx.rotate(side * (0.22 + extra));
      ctx.fillStyle = fur;
      ctx.beginPath();
      ctx.moveTo(-0.1 * s, 0.06 * s);
      ctx.quadraticCurveTo(-0.06 * s, -0.2 * s, 0, -0.22 * s);
      ctx.quadraticCurveTo(0.06 * s, -0.2 * s, 0.1 * s, 0.06 * s);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.moveTo(-0.05 * s, 0.03 * s);
      ctx.quadraticCurveTo(-0.03 * s, -0.13 * s, 0, -0.15 * s);
      ctx.quadraticCurveTo(0.03 * s, -0.13 * s, 0.05 * s, 0.03 * s);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    ear(-1, 0); ear(1, twitch);
    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(0, 0, 0.3 * s, 0.25 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = dark;
    [-0.06, 0, 0.06].forEach(fx => { ctx.beginPath(); ctx.ellipse(fx * s, -0.19 * s, 0.014 * s, 0.045 * s, 0, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = light;
    ctx.beginPath(); ctx.ellipse(0, 0.09 * s, 0.15 * s, 0.1 * s, 0, 0, Math.PI * 2); ctx.fill();

    const ex = look * 0.03 * s;
    if (blink) {
      ctx.strokeStyle = '#1a1a1c'; ctx.lineWidth = Math.max(1.2, 0.022 * s);
      [-0.12, 0.12].forEach(cx => {
        ctx.beginPath(); ctx.arc(cx * s, -0.02 * s, 0.05 * s, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      });
    } else {
      [-0.12, 0.12].forEach(cx => {
        ctx.fillStyle = '#121214';
        ctx.beginPath(); ctx.ellipse(cx * s + ex, -0.02 * s, 0.068 * s, 0.078 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f4f4f6';
        ctx.beginPath(); ctx.arc(cx * s + ex - 0.022 * s, -0.045 * s, 0.024 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx * s + ex + 0.024 * s, 0.012 * s, 0.011 * s, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.fillStyle = '#d7c2c6';
    ctx.beginPath();
    ctx.moveTo(-0.028 * s, 0.045 * s); ctx.lineTo(0.028 * s, 0.045 * s); ctx.lineTo(0, 0.075 * s);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a3a3d'; ctx.lineWidth = Math.max(1, 0.012 * s);
    ctx.beginPath();
    ctx.moveTo(0, 0.075 * s); ctx.quadraticCurveTo(-0.02 * s, 0.11 * s, -0.045 * s, 0.095 * s);
    ctx.moveTo(0, 0.075 * s); ctx.quadraticCurveTo(0.02 * s, 0.11 * s, 0.045 * s, 0.095 * s);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235,235,240,.55)'; ctx.lineWidth = 1;
    ctx.beginPath();
    [-1, 1].forEach(side => {
      ctx.moveTo(side * 0.13 * s, 0.07 * s); ctx.lineTo(side * 0.38 * s, 0.03 * s);
      ctx.moveTo(side * 0.13 * s, 0.095 * s); ctx.lineTo(side * 0.37 * s, 0.11 * s);
    });
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- People ---------- */
  const WALKER_STYLE = { jacket: '#1f2024', jacketCuff: '#17181b', pants: '#25272c', shoe: '#cfd0d4', sole: '#ededf0', skin: '#77777b', hair: '#09090a' };

  // Draws a figure into its own canvas so light can be composited on the silhouette only.
  function renderFigure(cv, pose, style, dir, buildHeld) {
    const c = cv.getContext('2d');
    const cw = cv.width / fs, ch = cv.height / fs;
    const ox = cw * 0.5, oy = 1.1 * U;
    const P = (x, y) => [ox + dir * x * U, oy - y * U];
    c.setTransform(fs, 0, 0, fs, 0, 0);
    c.clearRect(0, 0, cw, ch);
    const parts = FIG.draw(c, pose, style, P, U);
    const held = buildHeld ? buildHeld(P) : null;
    parts.drawNearArm(!!pose.phone, held);

    // Rim light from the lit shop windows behind, then the phone glow on face and hands.
    const r = rimCv.getContext('2d');
    r.setTransform(1, 0, 0, 1, 0, 0);
    r.clearRect(0, 0, rimCv.width, rimCv.height);
    r.drawImage(cv, 0, 0);
    r.globalCompositeOperation = 'source-in';
    r.fillStyle = 'rgba(155,158,166,.12)';
    r.fillRect(0, 0, rimCv.width, rimCv.height);
    r.globalCompositeOperation = 'destination-out';
    r.drawImage(cv, 0.0032 * U * fs * dir, 0.003 * U * fs);
    r.globalCompositeOperation = 'source-over';
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.drawImage(rimCv, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.setTransform(fs, 0, 0, fs, 0, 0);
    return { c, P, ox, oy, cw, ch };
  }

  const FEED_PERIOD = 2.8;

  // Right hand holding the phone in clean side profile, with periodic thumb swipe synced to the feed:
  // 1) underSleeve: wrist root + lower palm & curled fingers cradling the phone from underneath;
  // 2) overSleeve: angled phone slab + near-side right thumb that views the post, reaches onto the screen, swipes up, and relaxes.
  function buildRightHandPhone(P, pose, style, now) {
    const wrist = pose.arms[1].wrist;
    const n = [pose.head[0] - (wrist[0] + 0.02), pose.head[1] - wrist[1]];
    const nl = Math.hypot(n[0], n[1]) || 1, nx = n[0] / nl, ny = n[1] / nl, ax = ny, ay = -nx;
    const Q = (u, v) => P(wrist[0] + ax * u + nx * v, wrist[1] + ay * u + ny * v);

    const u0 = 0.026, u1 = 0.118, vBot = -0.0025, vTop = 0.013;
    const screenAnchor = Q(0.078, vTop + 0.016);

    const restB = [0.019, -0.0050], restM = [0.039, 0.0065], restT = [0.058, 0.0148];
    const touchB = [0.022, -0.0040], touchM = [0.035, 0.0048], touchT = [0.047, 0.0132];
    const flickB = [0.026, -0.0020], flickM = [0.053, 0.0132], flickT = [0.081, 0.0225];
    const mix2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

    let tb = restB, tm = restM, tt = restT;
    if (!reduced.matches && typeof now === 'number') {
      const local = mod(now, FEED_PERIOD) / FEED_PERIOD;
      if (local >= 0.60 && local < 0.72) {
        const k = smooth((local - 0.60) / 0.12);
        tb = mix2(restB, touchB, k);
        tm = mix2(restM, touchM, k);
        tt = mix2(restT, touchT, k);
      } else if (local >= 0.72 && local < 0.90) {
        const k = smooth((local - 0.72) / 0.18);
        const arc = 0.0028 * Math.sin(Math.PI * k);
        tb = mix2(touchB, flickB, k);
        tm = mix2(touchM, flickM, k);
        tt = mix2(touchT, flickT, k);
        tm[1] += arc * 0.55;
        tt[1] += arc;
      } else if (local >= 0.90) {
        const k = smooth((local - 0.90) / 0.10);
        tb = mix2(flickB, restB, k);
        tm = mix2(flickM, restM, k);
        tt = mix2(flickT, restT, k);
      }
    }

    const smoothPoly = (c, pts) => {
      const m = pts.length;
      c.beginPath();
      c.moveTo((pts[m - 1][0] + pts[0][0]) * 0.5, (pts[m - 1][1] + pts[0][1]) * 0.5);
      for (let i = 0; i < m; i++) {
        const p = pts[i], q = pts[(i + 1) % m];
        c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) * 0.5, (p[1] + q[1]) * 0.5);
      }
      c.closePath();
    };

    return {
      screen: screenAnchor,
      underSleeve(c) {
        // Lower palm heel & supporting fingers emerging out of the sleeve cuff under the phone
        const palm = [
          Q(0.004, 0.008),
          Q(0.024, 0.006),
          Q(0.058, -0.001),
          Q(0.090, -0.001),
          Q(0.096, 0.002),
          Q(0.094, -0.010),
          Q(0.074, -0.017),
          Q(0.044, -0.0185),
          Q(0.020, -0.0145),
          Q(0.004, -0.012)
        ];
        c.save();
        smoothPoly(c, palm);
        c.strokeStyle = '#3f4148';
        c.lineWidth = Math.max(0.8, 0.003 * U);
        c.stroke();
        c.fillStyle = '#6c6d72';
        c.fill();
        c.restore();
      },
      overSleeve(c) {
        c.save();
        c.lineJoin = 'round';
        c.lineCap = 'round';

        // 1. Smartphone chassis in side profile
        const p0 = Q(u0, vBot), p1 = Q(u1, vBot), p2 = Q(u1, vTop), p3 = Q(u0, vTop);
        c.beginPath();
        c.moveTo(p0[0], p0[1]);
        c.lineTo(p1[0], p1[1]);
        c.lineTo(p2[0], p2[1]);
        c.lineTo(p3[0], p3[1]);
        c.closePath();
        c.fillStyle = '#0a0a0c';
        c.fill();
        c.strokeStyle = 'rgba(220,224,232,.78)';
        c.lineWidth = Math.max(1, 0.0036 * U);
        c.stroke();

        // Bright screen edge facing the walker's eyes
        const s0 = Q(u0 + 0.005, vTop + 0.0012), s1 = Q(u1 - 0.005, vTop + 0.0012);
        c.strokeStyle = '#ffffff';
        c.lineWidth = Math.max(1.3, 0.0062 * U);
        c.beginPath();
        c.moveTo(s0[0], s0[1]);
        c.lineTo(s1[0], s1[1]);
        c.stroke();

        // 2. Right thumb on the near (camera) side, synced with periodic upward feed swipes
        const tBase = Q(tb[0], tb[1]);
        const tMid = Q(tm[0], tm[1]);
        const tTip = Q(tt[0], tt[1]);
        const rBase = 0.0074 * U, rTip = 0.0056 * U;
        const tdx = tTip[0] - tBase[0], tdy = tTip[1] - tBase[1], tl = Math.hypot(tdx, tdy) || 1;
        const tnx = -tdy / tl, tny = tdx / tl;
        const along = Math.atan2(tdy, tdx);

        const traceThumb = () => {
          c.beginPath();
          c.moveTo(tBase[0] - tnx * rBase, tBase[1] - tny * rBase);
          c.quadraticCurveTo(tMid[0] - tnx * rTip * 1.08, tMid[1] - tny * rTip * 1.08, tTip[0] - tnx * rTip, tTip[1] - tny * rTip);
          c.arc(tTip[0], tTip[1], rTip, along - Math.PI / 2, along + Math.PI / 2);
          c.quadraticCurveTo(tMid[0] + tnx * rTip, tMid[1] + tny * rTip, tBase[0] + tnx * rBase * 0.9, tBase[1] + tny * rBase * 0.9);
          c.arc(tBase[0], tBase[1], rBase * 0.95, along + Math.PI / 2, along - Math.PI / 2);
          c.closePath();
        };

        c.strokeStyle = 'rgba(0,0,0,.46)';
        c.lineWidth = Math.max(1.2, 0.0042 * U);
        traceThumb();
        c.stroke();

        c.fillStyle = style.skin || '#77777b';
        traceThumb();
        c.fill();

        c.restore();
      }
    };
  }

  function drawWalker(now) {
    const ph = mod(now / GAIT, 1);
    const pose = FIG.walkPose(gait, ph, 1);
    let screen = null;
    const out = renderFigure(walkerCv, pose, WALKER_STYLE, 1, P => {
      const held = buildRightHandPhone(P, pose, WALKER_STYLE, now);
      screen = held.screen;
      return held;
    });
    const { c, ox, oy, cw, ch } = out;
    c.globalCompositeOperation = 'source-atop';
    const light = c.createRadialGradient(screen[0], screen[1], 0, screen[0], screen[1], 0.155 * U);
    light.addColorStop(0, 'rgba(228,232,240,.46)'); light.addColorStop(0.32, 'rgba(228,232,240,.11)'); light.addColorStop(1, 'rgba(228,232,240,0)');
    c.fillStyle = light; c.fillRect(0, 0, cw, ch);
    c.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.translate(walkerX, groundY);
    ctx.scale(1, 0.12);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.36 * U);
    sh.addColorStop(0, 'rgba(0,0,0,.6)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 0.36 * U, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const left = walkerX - ox, top = groundY - oy;
    ctx.drawImage(walkerCv, left, top, cw, ch);
    const sx = left + screen[0], sy = top + screen[1];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 0.13 * U);
    glow.addColorStop(0, 'rgba(255,255,255,.26)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(sx - 0.13 * U, sy - 0.13 * U, 0.26 * U, 0.26 * U);
    ctx.restore();
    return [sx, sy];
  }


  // Headlights of a car passing on the road out of frame sweep across the street now and then.
  function drawSweep() {
    const period = 13, dur = 2.6, local = mod(t + 6, period);
    if (local > dur) return;
    const p = local / dur, cx = W * (1.25 - 1.5 * smooth(p)), a = 0.075 * Math.sin(Math.PI * p);
    const cy = streetY * 0.72, r = 2.4 * U;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.45, `rgba(255,255,255,${a * 0.35})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.restore();
  }

  /* ---------- Frame ---------- */
  function drawGround(streetOff) {
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, streetY, W, H - streetY);
    blitStrip(groundCache, streetOff, streetY, H - streetY);
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.fillRect(0, streetY, W, Math.max(1, 0.008 * U));
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0, streetY + 0.03 * U, W, 0.02 * U);

    // Paving joints in perspective: at the walker's line they move at exactly the ground speed.
    const J = JOINT * U, dist = t * SPEED * U, first = -mod(dist, J);
    const fTop = (streetY - vpY) / (groundY - vpY), fBot = (H - vpY) / (groundY - vpY);
    ctx.strokeStyle = 'rgba(255,255,255,.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = first - 6 * J; x < W + 6 * J; x += J) {
      ctx.moveTo(walkerX + (x - walkerX) * fTop, streetY);
      ctx.lineTo(walkerX + (x - walkerX) * fBot, H);
    }
    [0.28, 0.6].forEach(k => { const y = lerp(streetY, H, k); ctx.moveTo(0, y); ctx.lineTo(W, y); });
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.05)';
    ctx.fillRect(0, H - 0.05 * U, W, 1);
  }

  // Draws a horizontally repeating cache at a scroll offset, copying only the visible part.
  function blitStrip(cache, off, y, h) {
    const L = STREET_L * U, o = mod(off, L);
    let dx = 0, sx = o;
    while (dx < W) {
      const w = Math.min(L - sx, W - dx);
      ctx.drawImage(cache, sx * fs, 0, w * fs, h * fs, dx, y, w, h);
      dx += w; sx = 0;
    }
  }

  function drawFront(off) {
    const L = FRONT_L * U, o = mod(off, L);
    for (let n = -1; n <= 1; n++) {
      const x = 3.6 * U - o + n * L;
      if (x < -0.2 * U || x > W + 0.2 * U) continue;
      ctx.fillStyle = 'rgba(2,2,3,.95)';
      ctx.fillRect(x - 0.035 * U, 0, 0.07 * U, H);
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.fillRect(x + 0.022 * U, 0, 0.008 * U, H);
    }
  }

  // The dotted link grows from the walker's phone to the big phone once that has landed.
  function drawLensLink(screen) {
    if (!lensAnchor) return;
    const entered = stage.classList.contains('is-entered');
    const prog = reduced.matches ? 1 : entered ? clamp((performance.now() - enterT0 - 1650) / 700, 0, 1) : 0;
    if (prog <= 0) return;
    const [lx, ly] = lensAnchor;
    const e = 1 - Math.pow(1 - prog, 3);
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.min(screen[0], lx) - 4, 0, Math.abs(lx - screen[0]) * e + 8, H);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,.24)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(screen[0], screen[1]);
    ctx.bezierCurveTo(screen[0] + (lx - screen[0]) * 0.45, screen[1], lx - (lx - screen[0]) * 0.35, ly, lx, ly);
    ctx.stroke();
    ctx.setLineDash([]);
    if (prog >= 1) {
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function updateFeed() {
    if (!feed || !feedStep || !feedCount) return;
    const k = Math.floor(t / FEED_PERIOD), local = mod(t, FEED_PERIOD) / FEED_PERIOD;
    const e = local < 0.72 ? 0 : local < 0.93 ? smooth((local - 0.72) / 0.21) : 1;
    feed.style.transform = `translate3d(0, ${(-mod((k + e) * feedStep, feedCount * feedStep)).toFixed(2)}px, 0)`;
  }

  function updateCounter(streetOff) {
    const L = STREET_L * U;
    if (!prevRel) prevRel = CARRIERS.map(() => null);
    CARRIERS.forEach((ax, i) => {
      const rel = mod(ax * U - streetOff - walkerX, L);
      if (prevRel[i] !== null && rel > prevRel[i] + L / 2) passed++;
      prevRel[i] = rel;
    });
    if (countEl && countEl.textContent !== String(passed)) countEl.textContent = String(passed);
  }

  function draw() {
    if (!streetCache) return;
    if (cachedLang !== lang()) buildCaches();
    else if (postersDirty) buildPosters();
    const L = COPY[lang()];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, streetY);
    const dist = t * SPEED * U;
    const fw = FAR_L * U, fo = mod(dist * FAR_K, fw);
    for (let x = -fo; x < W; x += fw) ctx.drawImage(farCache, x, 0, fw, streetY);

    const streetOff = dist * STREET_K + streetOff0;
    blitStrip(streetCache, streetOff, 0, streetY);
    const LU = STREET_L * U, o = mod(streetOff, LU);
    for (let n = -1; n <= 1; n++) {
      const x0 = -o + n * LU;
      if (x0 > W || x0 + LU < 0) continue;
      drawDynamic(x0, L, t);
    }
    drawGround(streetOff);
    drawSweep();
    const screen = drawWalker(t);
    drawFront(dist * FRONT_K);
    drawLensLink(screen);
    updateFeed();
    updateCounter(streetOff);
  }

  function frame(ts) {
    if (!running) return;
    const dt = prevTs ? Math.min(0.05, (ts - prevTs) / 1000) : 0;
    prevTs = ts;
    t += dt;
    waveMix = clamp(waveMix + (waveTarget ? dt : -dt) / 0.6, 0, 1);
    waveTarget = 0;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function ensureAssets() {
    if (loaded) return;
    loaded = true;
    load('hold', 'street-woman-hold.jpg');
    load('wave', 'street-woman-wave.jpg');
    load('serum', 'street-serum.jpg');
    load('sneakers', 'street-sneakers.jpg');
  }

  // Entrance choreography is CSS-driven; this only restarts it each time the page is opened.
  // Leaving keeps the entered state, so page 1 stays intact while it slides away. When page 1 slides back in,
  // copy and phone are cleared first and fly in once the slide starts filling.
  function replayEntrance(sectionOn) {
    const active = page.classList.contains('is-active'), shown = page.classList.contains('is-shown');
    if (sectionOn && active && !shown) {
      clearTimeout(enterTimer);
      stage.classList.remove('is-entered');
      wasCurrent = false;
      return;
    }
    const want = sectionOn && shown;
    if (want === wasCurrent) return;
    wasCurrent = want;
    clearTimeout(enterTimer);
    if (!want) return;
    stage.classList.remove('is-entered');
    void stage.offsetWidth;
    enterTimer = setTimeout(() => { stage.classList.add('is-entered'); enterT0 = performance.now(); }, reduced.matches ? 0 : 200);
  }

  function sync() {
    const sectionOn = section.classList.contains('is-current');
    const pageVisible = page.classList.contains('is-active') || page.classList.contains('is-leaving');
    replayEntrance(sectionOn);
    if (sectionOn) ensureAssets();
    if (sectionOn && pageVisible) {
      const pr = (page || stage).getBoundingClientRect();
      if (pr.width >= 20 && pr.height >= 20 && (Math.abs(Math.round(pr.width) - W) > 1 || Math.abs(Math.round(pr.height) - H) > 1)) {
        resize();
      }
    }
    const on = sectionOn && pageVisible && !document.hidden && !reduced.matches;
    if (on && !running) {
      running = true;
      prevTs = 0;
      measureLens();
      raf = requestAnimationFrame(frame);
    } else if (!on && running) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!on && sectionOn && pageVisible) {
      draw();
    }
  }

  t = 0.4;
  let resizeTimer = 0;
  const stageRo = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, streetCache ? 120 : 0); });
  stageRo.observe(stage);
  if (page !== stage) stageRo.observe(page);
  new MutationObserver(sync).observe(section, { attributes: true, attributeFilter: ['class'] });
  if (page !== stage) new MutationObserver(sync).observe(page, { attributes: true, attributeFilter: ['class'] });
  lens?.querySelector('.smm-lens-phone')?.addEventListener('transitionend', e => { if (e.propertyName === 'transform') measureLens(); });
  new MutationObserver(() => { if (!running) draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener?.('change', sync);
  document.fonts?.ready.then(() => { if (streetCache) { buildCaches(); if (!running) draw(); } });
  resize();
  sync();
})();
