/* Tools Page 2 controller: two-page stage inside #sec-tools and interactive MCP & Autonomous AI Agent workbench. */
(() => {
  'use strict';

  const section = document.getElementById('sec-tools');
  const stage = section && section.querySelector('.tools-stage');
  if (!section || !stage) return;

  const pages = [...stage.querySelectorAll('.tools-page')];
  const tabs = [...section.querySelectorAll('[data-tools-page]')];
  const mcpRoot = document.getElementById('tools-mcp');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 1180px)');
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ru');

  const EASE = 'cubic-bezier(.65, 0, .35, 1)';
  const DURATION = 780;

  let current = 0;
  let busy = false;
  let pending = null;
  let entry = null;
  let wasCurrent = false;

  window.DossierSite?.addPairs?.([
    ['Страницы раздела Инструменты', 'Tools section pages'],
    ['Сценарий работы MCP-агента', 'MCP agent workflow scenario'],
    ['Подключённые пакеты MCP', 'Connected MCP app suites'],
    ['Схема шины MCP и единого ИИ-агента', 'MCP bus and unified AI agent diagram']
  ]);

  const STAGES = [
    ['ПРОФЕССИОНАЛЬНЫЕ ИНСТРУМЕНТЫ', 'PROFESSIONAL TOOLS'],
    ['ИНСТРУМЕНТЫ · MCP-АГЕНТ', 'TOOLS · MCP AGENT']
  ];
  const stageLabel = document.getElementById('ph-stage-label');

  function syncStageLabel() {
    const [ru, en] = STAGES[current] || STAGES[0];
    section.dataset.stageRu = ru;
    section.dataset.stageEn = en;
    if (stageLabel && section.classList.contains('is-current')) {
      stageLabel.textContent = lang() === 'en' ? en : ru;
    }
  }

  /* ---------- MCP Workbench Data (4 families x 6 apps = 24 apps) ---------- */
  const CONTOUR_ORDER = ['analytics', 'logistics', 'microsoft', 'adobe'];

  const CONTOURS = {
    analytics: {
      mark: ['1С', '1C'],
      title: ['1С и аналитика', '1C & analytics'],
      proto: [
        'mcp://1c-erp · OData + DataLens',
        'mcp://1c-erp · OData + DataLens'
      ],
      apps: [
        ['1С:ERP', '1C:ERP'],
        ['1С:УТ', '1C:Trade'],
        ['1С:Бухгалтерия', '1C:Accounting'],
        ['1С:УХ', '1C:Holding'],
        ['Visiology', 'Visiology'],
        ['DataLens', 'DataLens']
      ],
      call: '1c_erp.read(margin, cost, debt)',
      tag: ['6 БАЗ', '6 APPS'],
      desc: [
        'Забирает себестоимость, маржу и долги из 1С:ERP, УТ и Бухгалтерии в DataLens.',
        'Pulls unit cost, margin and payables from 1C:ERP, Trade and Accounting into DataLens.'
      ],
      offDesc: [
        'На паузе. Нажмите, чтобы вернуть 1С в расчёт.',
        'Paused. Tap to include 1C in the report.'
      ]
    },
    logistics: {
      mark: ['WMS', 'WMS'],
      title: ['Склад и доставка', 'WMS & delivery'],
      proto: [
        'mcp://wms-tms · AXELOT + рейсы',
        'mcp://wms-tms · AXELOT + routes'
      ],
      apps: [
        ['1С:WMS', '1C:WMS'],
        ['1С:TMS', '1C:TMS'],
        ['1С:Автопарк', '1C:Fleet'],
        ['AXELOT WMS', 'AXELOT WMS'],
        ['AXELOT TMS', 'AXELOT TMS'],
        ['Маршрутизация', 'Yandex Routing']
      ],
      call: 'wms_tms.check(bins, fleet, routes)',
      tag: ['6 БАЗ', '6 APPS'],
      desc: [
        'Сверяет ячейки 1С:WMS и AXELOT с рейсами TMS и загрузкой автопарка.',
        'Matches 1C:WMS and AXELOT bin stock with TMS trips and fleet load.'
      ],
      offDesc: [
        'На паузе. Нажмите, чтобы подключить склад.',
        'Paused. Tap to reconnect warehouse apps.'
      ]
    },
    microsoft: {
      mark: ['MS', 'MS'],
      title: ['Microsoft Office', 'Microsoft Office'],
      proto: [
        'mcp://ms-office · Excel, Word, PPTX',
        'mcp://ms-office · Excel, Word, PPTX'
      ],
      apps: [
        ['Excel', 'Excel'],
        ['Word', 'Word'],
        ['PowerPoint', 'PowerPoint'],
        ['Outlook', 'Outlook'],
        ['Teams', 'Teams'],
        ['Visio', 'Visio']
      ],
      call: 'office.write(excel, pptx, teams)',
      tag: ['6 СРЕД', '6 APPS'],
      desc: [
        'Заносит проверенные цифры в финмодель Excel, слайды PowerPoint и сводку Teams.',
        'Writes verified numbers into Excel models, PowerPoint slides and Teams briefs.'
      ],
      offDesc: [
        'На паузе. Нажмите для подключения Office.',
        'Paused. Tap to connect Office.'
      ]
    },
    adobe: {
      mark: ['Ai', 'Ai'],
      title: ['Пакет Adobe', 'Adobe suite'],
      proto: [
        'mcp://adobe · InDesign, PS, Premiere',
        'mcp://adobe · InDesign, PS, Premiere'
      ],
      apps: [
        ['Photoshop', 'Photoshop'],
        ['Illustrator', 'Illustrator'],
        ['Premiere Pro', 'Premiere Pro'],
        ['After Effects', 'After Effects'],
        ['Audition', 'Audition'],
        ['InDesign', 'InDesign']
      ],
      call: 'adobe.fill(indesign, ps, premiere)',
      tag: ['6 СРЕД', '6 APPS'],
      desc: [
        'Подставляет цены и артикулы из 1С в каталоги InDesign и титры Premiere Pro.',
        'Fills live 1C prices and SKUs into InDesign catalogs and Premiere titles.'
      ],
      offDesc: [
        'На паузе. Нажмите для обновления макетов.',
        'Paused. Tap to update layouts.'
      ]
    }
  };

  const PRESETS = {
    all: {
      contours: ['analytics', 'logistics', 'microsoft', 'adobe'],
      reportHead: [
        'ОТЧЁТ АГЕНТА · ВСЕ 24 ПРОГРАММЫ',
        'AGENT REPORT · ALL 24 APPS'
      ],
      delivTitle: [
        'Готовые цифры из 4 систем без ручного сведения',
        'Verified figures from 4 suites without manual merges'
      ],
      delivBody: [
        'Агент сам опросил 1С:ERP, склад WMS, таблицы Excel и макеты. Специалист сразу работает с маржой, закупками и планом.',
        'The agent queried 1C:ERP, WMS stock, Excel sheets and layouts on its own. The specialist works directly with margin and plans.'
      ],
      status: [
        'Подключены все 24 программы: сверка идёт сама',
        'All 24 apps live: checks run automatically'
      ]
    },
    erp: {
      contours: ['analytics', 'microsoft'],
      reportHead: [
        'ОТЧЁТ АГЕНТА · 1С:ERP + OFFICE',
        'AGENT REPORT · 1C:ERP + OFFICE'
      ],
      delivTitle: [
        '1С:ERP передаёт регистры агенту и выдаёт чистый срез',
        '1C:ERP streams registers to the agent for a clean brief'
      ],
      delivBody: [
        'Из 1С:ERP, УТ и Бухгалтерии сняты себестоимость, прибыль и долги. Строки сверены без ручного ввода и выведены в Excel.',
        'Unit cost, profit and payables are pulled from 1C:ERP, Trade and Accounting, checked across all rows and written to Excel.'
      ],
      status: [
        'Связка 1С:ERP и Office (12 программ): отчёт готов',
        '1C:ERP + Office (12 apps): report ready'
      ]
    },
    logistics: {
      contours: ['analytics', 'logistics'],
      reportHead: [
        'ОТЧЁТ АГЕНТА · 1С:ERP + СКЛАД',
        'AGENT REPORT · 1C:ERP + WMS'
      ],
      delivTitle: [
        'Остатки ячеек и маршруты под контролем без ручных таблиц',
        'Bin stock and routes checked without manual spreadsheets'
      ],
      delivBody: [
        'План продаж из 1С:ERP сверен с ячейками 1С:WMS и AXELOT, проверены рейсы и собран список товаров к пополнению.',
        '1C:ERP sales plans are matched against 1C:WMS and AXELOT bins, routes are checked, and restock items are listed.'
      ],
      status: [
        'Связка 1С:ERP и склада (12 программ): остатки сверены',
        '1C:ERP + WMS (12 apps): stock reconciled'
      ]
    },
    creative: {
      contours: ['microsoft', 'adobe'],
      reportHead: [
        'ОТЧЁТ АГЕНТА · OFFICE + ADOBE',
        'AGENT REPORT · OFFICE + ADOBE'
      ],
      delivTitle: [
        'Цены из Excel сразу в каталогах и роликах без перевёрстки',
        'Excel prices pushed straight to catalogs and video titles'
      ],
      delivBody: [
        'При смене прайса в Excel агент сверяет артикулы и переносит новые цены в полосы InDesign, Photoshop и Premiere Pro.',
        'When Excel prices update, the agent checks SKUs and pushes clean values into InDesign pages, Photoshop and Premiere Pro.'
      ],
      status: [
        'Связка Office и Adobe (12 программ): макеты обновлены',
        'Office + Adobe (12 apps): layouts updated'
      ]
    }
  };

  let activeSet = new Set(CONTOUR_ORDER);
  let activePreset = 'all';
  let statusMode = 'preset';
  let stepIdx = 0;
  let autoTimer = 0;
  let runTimers = [];
  let swapTimer = 0;

  const presetBtns = mcpRoot ? [...mcpRoot.querySelectorAll('[data-mcp-preset]')] : [];
  const connectAllBtn = mcpRoot && mcpRoot.querySelector('[data-mcp-connect-all]');
  const runBtn = mcpRoot && mcpRoot.querySelector('[data-mcp-run]');
  const sourceListEl = mcpRoot && mcpRoot.querySelector('[data-mcp-sources]');
  const traceListEl = mcpRoot && mcpRoot.querySelector('[data-mcp-trace]');
  const countEl = mcpRoot && mcpRoot.querySelector('[data-mcp-count]');
  const reportHeadEl = mcpRoot && mcpRoot.querySelector('[data-mcp-report-head]');
  const reportCardEl = mcpRoot && mcpRoot.querySelector('.mcp-report-card');
  const delivTitleEl = mcpRoot && mcpRoot.querySelector('[data-mcp-deliv-title]');
  const delivBodyEl = mcpRoot && mcpRoot.querySelector('[data-mcp-deliv-body]');
  const statusEl = mcpRoot && mcpRoot.querySelector('[data-mcp-status]');
  const stepEls = mcpRoot ? [...mcpRoot.querySelectorAll('[data-mcp-step]')] : [];
  const laneGroups = mcpRoot ? [...mcpRoot.querySelectorAll('[data-bus-lane]')] : [];
  const svgLabels = mcpRoot ? [...mcpRoot.querySelectorAll('[data-svg-en]')] : [];

  function detectMatchingPreset() {
    for (const [key, cfg] of Object.entries(PRESETS)) {
      if (cfg.contours.length === activeSet.size && cfg.contours.every(id => activeSet.has(id))) {
        return key;
      }
    }
    return 'custom';
  }

  function buildCustomDeliverable(idx) {
    const names = CONTOUR_ORDER.filter(id => activeSet.has(id)).map(id => CONTOURS[id].title[idx]);
    const appsCount = activeSet.size * 6;
    if (idx === 1) {
      return {
        head: `AGENT REPORT · ${appsCount} APPS`,
        title: `Direct MCP link: ${names.join(' + ')}`,
        body: `The agent queries ${appsCount} apps by schema, checks every row without manual errors and delivers verified figures.`,
        status: `${appsCount} of 24 apps active`
      };
    }
    return {
      head: `ОТЧЁТ АГЕНТА · ${appsCount} ПРОГРАММ`,
      title: `Прямая связка по MCP: ${names.join(' + ')}`,
      body: `Агент опрашивает ${appsCount} программ по схеме, сверяет строки без ручных ошибок и отдаёт проверенные цифры для работы.`,
      status: `В работе ${appsCount} из 24 программ`
    };
  }

  function renderMcp(animateSwap = false) {
    if (!mcpRoot) return;
    const isEn = lang() === 'en';
    const idx = isEn ? 1 : 0;
    const appsCount = activeSet.size * 6;

    // 1. Preset buttons
    presetBtns.forEach(btn => {
      const on = btn.dataset.mcpPreset === activePreset;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    // 2. Left 4 family MCP cards
    if (sourceListEl) {
      sourceListEl.innerHTML = CONTOUR_ORDER.map(id => {
        const c = CONTOURS[id];
        const on = activeSet.has(id);
        const badgeText = on ? 'MCP · 6/6' : (isEn ? 'PAUSED' : 'ПАУЗА');
        return `
          <button type="button" class="mcp-source-card${on ? '' : ' is-off'}" data-mcp-toggle="${id}" aria-pressed="${on}" data-no-localize>
            <span class="mcp-source-top">
              <span class="mcp-source-id">
                <span class="mcp-source-mark" aria-hidden="true">${c.mark[idx]}</span>
                <b>${c.title[idx]}</b>
              </span>
              <span class="mcp-source-badge mono"><i aria-hidden="true"></i>${badgeText}</span>
            </span>
            <span class="mcp-source-proto mono">${c.proto[idx]}</span>
            <span class="mcp-source-apps">
              ${c.apps.map(pair => `<span>${pair[idx]}</span>`).join('')}
            </span>
          </button>`;
      }).join('');
    }

    // 3. SVG bus lanes & SVG bilingual labels
    laneGroups.forEach(g => {
      const id = g.dataset.busLane;
      g.classList.toggle('is-off', !activeSet.has(id));
    });
    svgLabels.forEach(el => {
      if (el.dataset.svgRu === undefined) el.dataset.svgRu = el.textContent;
      el.textContent = isEn ? el.dataset.svgEn : el.dataset.svgRu;
    });

    // 4. Connected apps counter & autonomous step highlight
    if (countEl) countEl.textContent = `${appsCount} / 24`;
    stepEls.forEach((li, i) => li.classList.toggle('is-active', i === stepIdx));

    // 5. Right-hand MCP call trace (active contours first so live work stays top-of-list)
    if (traceListEl) {
      const sortedIds = [
        ...CONTOUR_ORDER.filter(id => activeSet.has(id)),
        ...CONTOUR_ORDER.filter(id => !activeSet.has(id))
      ];
      const activeArr = CONTOUR_ORDER.filter(id => activeSet.has(id));
      const highlightedId = activeArr.length ? activeArr[stepIdx % activeArr.length] : null;
      traceListEl.innerHTML = sortedIds.map(id => {
        const c = CONTOURS[id];
        const on = activeSet.has(id);
        const hi = on && id === highlightedId;
        return `
          <li class="mcp-trace-item${on ? '' : ' is-muted'}${hi ? ' is-highlighted' : ''}" data-trace-id="${id}" data-no-localize>
            <div class="mcp-trace-call">
              <code>${c.call}</code>
              <em class="mono">${on ? c.tag[idx] : (isEn ? 'OFFLINE' : 'ОТКЛЮЧЕНО')}</em>
            </div>
            <p class="mcp-trace-desc">${on ? c.desc[idx] : c.offDesc[idx]}</p>
          </li>`;
      }).join('');
    }

    // 6. Deliverable summary & status bar
    const presetCfg = PRESETS[activePreset];
    const custom = presetCfg ? null : buildCustomDeliverable(idx);
    if (reportHeadEl) reportHeadEl.textContent = presetCfg ? presetCfg.reportHead[idx] : custom.head;
    if (delivTitleEl) delivTitleEl.textContent = presetCfg ? presetCfg.delivTitle[idx] : custom.title;
    if (delivBodyEl) delivBodyEl.textContent = presetCfg ? presetCfg.delivBody[idx] : custom.body;

    if (statusEl) {
      if (statusMode === 'synced') {
        statusEl.textContent = isEn
          ? `Snapshot refreshed (${appsCount} of 24 apps): 0 discrepancies`
          : `Срез обновлён (${appsCount} из 24 программ): 0 расхождений`;
      } else {
        statusEl.textContent = presetCfg ? presetCfg.status[idx] : custom.status;
      }
    }

    if (animateSwap && reportCardEl && !reduced.matches) {
      reportCardEl.classList.remove('is-syncing');
      void reportCardEl.offsetWidth;
      reportCardEl.classList.add('is-syncing');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => reportCardEl.classList.remove('is-syncing'), 360);
    }
  }

  function applyPreset(key) {
    const cfg = PRESETS[key];
    if (!cfg) return;
    activeSet = new Set(cfg.contours);
    activePreset = key;
    statusMode = 'preset';
    stepIdx = 0;
    renderMcp(true);
    syncMcpAuto();
  }

  function toggleContour(id) {
    if (!CONTOURS[id]) return;
    if (activeSet.has(id)) {
      if (activeSet.size <= 1) return; // Keep at least one MCP contour active
      activeSet.delete(id);
    } else {
      activeSet.add(id);
    }
    activePreset = detectMatchingPreset();
    statusMode = 'preset';
    renderMcp(true);
    syncMcpAuto();
  }

  function runManualAudit() {
    runTimers.forEach(clearTimeout);
    runTimers = [];
    stepIdx = 0;
    statusMode = 'preset';
    renderMcp(true);
    [1, 2].forEach((s, idx) => {
      runTimers.push(setTimeout(() => {
        stepIdx = s;
        if (s === 2) statusMode = 'synced';
        renderMcp(false);
      }, (idx + 1) * 240));
    });
    syncMcpAuto();
  }

  function isMcpLive() {
    return section.classList.contains('is-current') && current === 1 && !document.hidden && !reduced.matches;
  }

  function syncMcpAuto() {
    clearInterval(autoTimer);
    autoTimer = 0;
    if (!isMcpLive()) return;
    autoTimer = setInterval(() => {
      if (!isMcpLive()) return;
      stepIdx = (stepIdx + 1) % 3;
      renderMcp(false);
    }, 3000);
  }

  if (mcpRoot) {
    presetBtns.forEach(btn => btn.addEventListener('click', () => {
      applyPreset(btn.dataset.mcpPreset || 'all');
    }));

    if (connectAllBtn) {
      connectAllBtn.addEventListener('click', () => applyPreset('all'));
    }

    if (runBtn) {
      runBtn.addEventListener('click', runManualAudit);
    }

    if (sourceListEl) {
      sourceListEl.addEventListener('click', e => {
        const card = e.target.closest('[data-mcp-toggle]');
        if (card) toggleContour(card.dataset.mcpToggle);
      });
    }

    if (traceListEl) {
      traceListEl.addEventListener('click', e => {
        const row = e.target.closest('[data-trace-id]');
        if (row) toggleContour(row.dataset.traceId);
      });
    }

    const busSvg = mcpRoot.querySelector('.mcp-bus-svg');
    if (busSvg) {
      busSvg.addEventListener('click', e => {
        const lane = e.target.closest('[data-bus-lane]');
        if (lane) toggleContour(lane.dataset.busLane);
      });
    }
  }

  /* ---------- Two-Page Stage Navigation ---------- */
  function activate(i) {
    section.dataset.toolsActive = String(i);
    pages.forEach((p, k) => {
      const on = k === i;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-hidden', String(!on));
      p.inert = !on;
    });
    tabs.forEach((t, k) => {
      const on = Number(t.dataset.toolsPage) === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (pages[k]?.id) t.setAttribute('aria-controls', pages[k].id);
    });
    syncStageLabel();
    syncMcpAuto();
  }

  function jump(i) {
    current = i;
    activate(i);
    if (compact.matches) section.scrollTo({ top: 0, behavior: 'instant' });
  }

  function go(i) {
    if (i === current || i < 0 || i >= pages.length) return;
    if (busy) { pending = i; return; }
    if (i === 1 && window.DossierSite?.isToolsOpen?.()) {
      window.DossierSite.stepTools(-1);
    }
    if (reduced.matches || compact.matches || !pages[current]?.animate) {
      jump(i);
      return;
    }
    const from = pages[current];
    const to = pages[i];
    const dir = i > current ? 1 : -1;
    current = i;
    busy = true;
    activate(i);
    from.classList.add('is-leaving');
    const out = from.animate([
      { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      { transform: `translate3d(0, ${-dir * 105}%, 0)`, opacity: .45 }
    ], { duration: DURATION, easing: EASE, fill: 'both' });
    const inn = to.animate([
      { transform: `translate3d(0, ${dir * 105}%, 0)`, opacity: .82 },
      { transform: 'translate3d(0, 0, 0)', opacity: 1 }
    ], { duration: DURATION, easing: EASE, fill: 'both' });
    inn.finished.catch(() => {}).then(() => {
      out.cancel();
      inn.cancel();
      from.classList.remove('is-leaving');
      busy = false;
      if (pending !== null && pending !== current) {
        const n = pending;
        pending = null;
        go(n);
      }
      pending = null;
    });
  }

  function step(dir) {
    if (!section.classList.contains('is-current')) return false;
    if (busy) return true;
    if (current === 0 && window.DossierSite?.stepTools?.(dir)) return true;
    const next = current + dir;
    if (next < 0 || next >= pages.length) return false;
    go(next);
    return true;
  }

  function enterFrom(dir) {
    entry = dir < 0 ? pages.length - 1 : 0;
  }

  tabs.forEach(t => {
    const idx = Number(t.dataset.toolsPage);
    if (pages[idx]) pages[idx].setAttribute('aria-labelledby', t.id || (t.id = `tools-tab-${idx}`));
    t.addEventListener('click', () => go(idx));
  });

  new MutationObserver(() => {
    const now = section.classList.contains('is-current');
    if (now && !wasCurrent) {
      jump(entry ?? 0);
      entry = null;
      requestAnimationFrame(syncStageLabel);
    } else if (!now && wasCurrent) {
      runTimers.forEach(clearTimeout);
      runTimers = [];
      syncMcpAuto();
    }
    wasCurrent = now;
  }).observe(section, { attributes: true, attributeFilter: ['class'] });

  new MutationObserver(() => {
    syncStageLabel();
    renderMcp(false);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  document.addEventListener('visibilitychange', syncMcpAuto);
  reduced.addEventListener?.('change', syncMcpAuto);

  window.ToolsPages = { step, enterFrom, go, get page() { return current; } };
  renderMcp(false);
  activate(0);
})();
