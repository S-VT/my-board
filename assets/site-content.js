/* Local content layer: bilingual application catalogue and shared copy rules. */
(() => {
  'use strict';
  const app = (id, mark, color, ru, en, purposeRu, purposeEn, useRu, useEn, source) =>
    ({ id, mark, color, ru, en, purposeRu, purposeEn, useRu, useEn, source });
  const groups = [
    { id: 'microsoft', ru: 'Семейство Microsoft', en: 'Microsoft family',
      subRu: 'Документы, расчёты и совместная работа', subEn: 'Documents, calculations and teamwork', color: '#80a9dd',
      apps: [
        app('excel','X','#57b785','Microsoft Excel','Microsoft Excel','Таблицы, формулы и анализ данных.','Spreadsheets, formulas and data analysis.','Расчёт бюджета, сводные отчёты, проверка показателей и финансовые модели.','Budget calculations, pivot reports, metric checks and financial models.'),
        app('word','W','#6a9be2','Microsoft Word','Microsoft Word','Подготовка и оформление документов.','Document writing and formatting.','Технические задания, инструкции, регламенты и договоры с единым оформлением.','Specifications, instructions, procedures and consistently formatted contracts.'),
        app('powerpoint','P','#d68b72','Microsoft PowerPoint','Microsoft PowerPoint','Создание презентаций и наглядных отчётов.','Presentations and visual reports.','Представление проекта, защита предложения и объяснение результатов работы.','Project presentations, proposals and clear explanations of results.'),
        app('outlook','O','#72b4df','Microsoft Outlook','Microsoft Outlook','Рабочая почта, календарь и встречи.','Business email, calendars and meetings.','Переписка, планирование встреч и контроль договорённостей в одном месте.','Correspondence, meeting schedules and follow-up on commitments.'),
        app('teams','T','#a19bdc','Microsoft Teams','Microsoft Teams','Командное общение и видеовстречи.','Team communication and video meetings.','Обсуждение задач, общие файлы и рабочие встречи с участниками проекта.','Task discussions, shared files and meetings with project participants.'),
        app('visio','V','#7cadd6','Microsoft Visio','Microsoft Visio','Схемы процессов и организационных связей.','Process and organisational diagrams.','Описание последовательности действий, ролей сотрудников и движения документов.','Mapping actions, team responsibilities and document flows.'),
      ] },
    { id: 'adobe', ru: 'Семейство Adobe', en: 'Adobe family',
      subRu: 'Графика, видео, звук и вёрстка', subEn: 'Graphics, video, audio and layout', color: '#bc9bdf',
      apps: [
        app('photoshop','Ps','#7eb8e6','Adobe Photoshop','Adobe Photoshop','Обработка фотографий и растровой графики.','Photo editing and raster graphics.','Ретушь, цветокоррекция, коллажи и подготовка изображений для публикации.','Retouching, colour correction, composites and publication-ready images.'),
        app('illustrator','Ai','#e4b375','Adobe Illustrator','Adobe Illustrator','Создание векторной графики.','Vector graphic design.','Логотипы, иконки, иллюстрации и макеты, которые сохраняют чёткость при масштабировании.','Logos, icons, illustrations and designs that stay sharp at any size.'),
        app('premiere','Pr','#b29be8','Adobe Premiere Pro','Adobe Premiere Pro','Монтаж и подготовка видеороликов.','Video editing and delivery.','Сборка сцен, работа со звуком и цветом, экспорт версий под разные экраны.','Assembling scenes, adjusting sound and colour, and exporting for different screens.'),
        app('aftereffects','Ae','#a59ee6','Adobe After Effects','Adobe After Effects','Анимация и визуальные эффекты.','Motion graphics and visual effects.','Титры, анимированные элементы, совмещение кадров и оформление ролика.','Titles, animated elements, compositing and video graphics.'),
        app('audition','Au','#80c7b9','Adobe Audition','Adobe Audition','Запись, монтаж и обработка звука.','Audio recording, editing and processing.','Очистка речи от шума, сведение дорожек и выравнивание громкости.','Speech cleanup, track mixing and consistent loudness.'),
        app('indesign','Id','#dc91ae','Adobe InDesign','Adobe InDesign','Вёрстка многостраничных материалов.','Multi-page document layout.','Каталоги, буклеты, брендбуки и подготовка документов к печати.','Catalogues, brochures, brand guides and print-ready documents.'),
      ] },
    { id: 'analytics', ru: 'Профессиональная аналитика', en: 'Professional analytics',
      subRu: 'Учёт и отчётность · решения для России и не только', subEn: 'Accounting and reporting · solutions for Russia and beyond', color: '#d0b579',
      apps: [
        app('erp','1С','#e0bc68','1С:ERP','1C:ERP','Управление ресурсами предприятия и анализ его работы.','Enterprise resource management and performance analysis.','Планирование производства и закупок, анализ себестоимости, запасов и финансового результата.','Production and purchasing plans, cost analysis, stock levels and financial results.','https://v8.1c.ru/erp/'),
        app('trade','1С','#d8b66b','1С:Управление торговлей','1C:Trade Management','Оперативный учёт торговой деятельности.','Operational accounting for trading businesses.','Анализ продаж, валовой прибыли, остатков и взаиморасчётов с клиентами.','Sales, gross profit, inventory and customer settlement analysis.','https://v8.1c.ru/trade/analiz-deyatelnosti/'),
        app('accounting','1С','#d9b16e','1С:Бухгалтерия','1C:Accounting','Бухгалтерский и налоговый учёт.','Financial and tax accounting.','Проверка оборотов и остатков по счетам, расчётов с контрагентами и подготовка отчётности.','Checking account balances, transactions and counterparty settlements, and preparing reports.','https://v8.1c.ru/buhv8/'),
        app('holding','1С','#d4b679','1С:Управление холдингом','1C:Holding Management','Финансовое управление группой компаний.','Financial management across a group of companies.','Консолидация отчётности, бюджетирование и сравнение плана с фактическими результатами.','Consolidated reporting, budgeting and comparison of plans with actual results.','https://v8.1c.ru/cpm/'),
        app('visiology','Vi','#bb9bd8','Visiology','Visiology','Платформа для анализа и визуализации данных.','A data analysis and visualisation platform.','Объединение данных из разных систем, управленческие панели и регулярные отчёты.','Combining data from different systems, management dashboards and recurring reports.','https://ru.visiology.su/products/dashboards/'),
        app('datalens','DL','#7bb6c3','Yandex DataLens','Yandex DataLens','Аналитические отчёты и интерактивные диаграммы.','Analytical reports and interactive charts.','Подключение источников, настройка показателей и наглядное представление динамики данных.','Connecting sources, defining metrics and visualising data trends.','https://yandex.cloud/ru/docs/datalens/'),
      ] },
    { id: 'logistics', ru: 'Профессиональная логистика', en: 'Professional logistics',
      subRu: 'Склад, транспорт и доставка', subEn: 'Warehousing, transport and delivery', color: '#7fb7a7',
      apps: [
        app('warehouse','1С','#d8b56d','1С:WMS Логистика','1C:WMS Logistics','Управление операциями на складе.','Warehouse operations management.','Приёмка, размещение, пополнение ячеек, подбор заказов и отгрузка товаров.','Receiving, put-away, replenishment, order picking and shipping.','https://solutions.1c.ru/catalog/wms4'),
        app('transport','1С','#d9b776','1С:TMS Логистика','1C:TMS Logistics','Планирование и контроль грузовых перевозок.','Freight planning and transport control.','Распределение заявок, составление рейсов, учёт затрат и контроль исполнения перевозок.','Allocating requests, planning trips, tracking costs and monitoring transport execution.','https://solutions.1c.ru/catalog/tms/'),
        app('fleet','1С','#d1b573','1С:Управление автотранспортом','1C:Motor Transport Management','Учёт работы собственного автопарка.','Fleet operations accounting.','Путевые листы, расход топлива, ремонты, обслуживание и затраты на транспорт.','Trip sheets, fuel consumption, repairs, maintenance and vehicle costs.','https://solutions.1c.ru/catalog/atp/'),
        app('axewms','W','#8ebcb0','AXELOT WMS','AXELOT WMS','Управление адресным складом.','Location-based warehouse management.','Задания сотрудникам, работа с терминалами сбора данных и контроль складских операций.','Staff task allocation, handheld terminals and warehouse operation control.','https://www.axelot.ru/'),
        app('axetms','T','#8cb8ad','AXELOT TMS','AXELOT TMS','Управление перевозками и транспортным парком.','Transport and fleet management.','Планирование доставки, выбор перевозчиков и контроль рейсов и транспортных расходов.','Delivery planning, carrier selection, trip monitoring and transport cost control.','https://www.axelot.ru/'),
        app('routing','Я','#d6bc7e','Яндекс Маршрутизация','Yandex Routing','Построение маршрутов доставки.','Delivery route planning.','Распределение заказов по машинам с учётом пробок, загрузки и интервалов доставки.','Allocating orders to vehicles while accounting for traffic, capacity and delivery windows.','https://yandex.ru/routing/doc/ru/vrp/'),
      ] },
  ];
  let lang = 'ru';
  let activeGroup = null;
  let groupToken = 0;
  let currentGroupAnim = null;
  let overviewScroll = 0;
  const root = document.querySelector('#tools-catalog');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label = (ru, en) => lang === 'ru' ? ru : en;
  const logo = a => `<span class="tool-app-icon" aria-hidden="true">${a.mark === 'Я' ? label('Я','Y') : a.mark === '1С' ? label('1С','1C') : a.mark}</span>`;
  const groupArt = id => ({
    microsoft:'<rect x="4" y="4" width="14" height="14"/><rect x="22" y="4" width="14" height="14"/><rect x="4" y="22" width="14" height="14"/><rect x="22" y="22" width="14" height="14"/>',
    adobe:'<path d="M6 34 18 6h4L10 34Zm18-17 10 17H20l-3-6h7l-4-7Z"/>',
    analytics:'<path d="M6 34V22h6v12Zm11 0V14h6v20Zm11 0V6h6v28Z"/>',
    logistics:'<path fill="none" stroke="currentColor" stroke-width="2" d="m5 12 15-7 15 7-15 8Zm0 0v17l15 7 15-7V12M20 20v16M12 8l15 8"/>',
  })[id];

  function renderTools() {
    if (!root) return;
    if (!activeGroup) {
      root.innerHTML = `<div class="tool-family-grid">${groups.map((g, i) => `
        <button type="button" class="tool-family" data-tool-group="${g.id}" aria-controls="tools-catalog" aria-expanded="false" style="--family-order:${i}">
          <span class="tool-family-top"><span class="mono">${i + 1} / ${label('ПОДБОРКА','COLLECTION')}</span><span class="tool-family-arrow" aria-hidden="true"><svg viewBox="0 0 16 16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" d="M5.25 10.75 10.75 5.25M6.25 5.25h4.5v4.5"/></svg></span></span>
          <span class="tool-family-identity"><svg viewBox="0 0 40 40" aria-hidden="true">${groupArt(g.id)}</svg><span><strong>${label(g.ru,g.en)}</strong><span class="tool-family-sub">${label(g.subRu,g.subEn)}</span></span></span>
          <span class="tool-app-grid">${g.apps.map((a,j) => `<span class="tool-app-tile" style="--app-order:${j}">${logo(a)}<span>${label(a.ru,a.en)}</span></span>`).join('')}</span>
          <span class="tool-family-foot mono"><span>${label('6 ПРИЛОЖЕНИЙ','6 APPLICATIONS')}</span><span>${label('СМОТРЕТЬ ПОДРОБНЕЕ','EXPLORE APPLICATIONS')} <i aria-hidden="true">→</i></span></span>
        </button>`).join('')}</div>`;
    } else {
      const g = groups.find(item => item.id === activeGroup);
      root.innerHTML = `<div class="tool-detail">
        <div class="tool-detail-top"><button class="tool-back" type="button" data-tool-back><i aria-hidden="true">←</i><span>${label('Все инструменты','All tools')}</span></button><span class="mono">${label('6 ПРИЛОЖЕНИЙ','6 APPLICATIONS')}</span></div>
        <div class="tool-detail-heading"><h3 tabindex="-1" id="tool-detail-title">${label(g.ru,g.en)}</h3><p>${label(g.subRu,g.subEn)}</p></div>
        <div class="tool-detail-grid">${g.apps.map((a,i) => `<article class="tool-detail-app"><div class="tool-detail-app-head">${logo(a)}<h4>${label(a.ru,a.en)}</h4><span class="mono">${i+1}</span></div><p class="tool-purpose">${label(a.purposeRu,a.purposeEn)}</p><p>${label(a.useRu,a.useEn)}</p></article>`).join('')}</div>
      </div>`;
    }
  }
  async function showGroup(id, moveFocus = true) {
    if (!root || id === activeGroup) return;
    const token = ++groupToken;
    try { currentGroupAnim?.cancel(); } catch (_) {}
    currentGroupAnim = null;
    const previous = activeGroup;
    const section = root.closest('section');
    const isCompact = matchMedia('(max-width: 1180px)').matches;
    const scrollHost = !isCompact && root.scrollHeight > root.clientHeight + 2 ? root : section;
    if (!previous) overviewScroll = scrollHost?.scrollTop || 0;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const direction = id ? 1 : -1;
    const outgoing = root.firstElementChild;
    activeGroup = id;
    root.setAttribute('aria-busy','true');
    try {
      if (outgoing && !reduceMotion) {
        currentGroupAnim = outgoing.animate([
          {opacity:1,transform:'translate3d(0,0,0)',filter:'blur(0px)'},
          {opacity:0,transform:`translate3d(${-direction*18}px,4px,0)`,filter:'blur(6px)'},
        ],{duration:140,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
        await currentGroupAnim.finished.catch(()=>{});
        if (token !== groupToken) return;
      }
      renderTools();
      root.scrollTo?.({top:id ? 0 : overviewScroll, behavior:'instant'});
      section?.scrollTo({top:id ? 0 : overviewScroll, behavior:'instant'});
      const incoming = root.firstElementChild;
      if (incoming && !reduceMotion) {
        incoming.style.animation = 'none';
        currentGroupAnim = incoming.animate([
          {opacity:0,transform:`translate3d(${direction*18}px,4px,0)`,filter:'blur(5px)'},
          {opacity:1,transform:'translate3d(0,0,0)',filter:'blur(0px)'},
        ],{duration:280,easing:'cubic-bezier(.16,1,.3,1)'});
        await currentGroupAnim.finished.catch(()=>{});
        if (token !== groupToken) return;
      }
      if (moveFocus && section?.classList.contains('is-current')) {
        (id ? root.querySelector('#tool-detail-title') : root.querySelector(`[data-tool-group="${previous}"]`))?.focus({preventScroll:true});
      }
    } finally {
      if (token === groupToken) {
        root.removeAttribute('aria-busy');
        currentGroupAnim = null;
      }
    }
  }
  root?.addEventListener('click', event => {
    const card = event.target.closest('[data-tool-group]');
    if (card) showGroup(card.dataset.toolGroup);
    else if (event.target.closest('[data-tool-back]')) showGroup(null);
  });
  root?.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeGroup) {
      event.preventDefault(); event.stopPropagation();
      showGroup(null);
    }
  });

  const dictionary = new Map();
  const cleanNumber = value => String(value).replace(/(?<![\w\d:.+\-])0([1-9])(?=$|[^\d:.,\-])/g, '$1');
  const key = value => cleanNumber(value).replace(/\bAI\b/g,'ИИ').replace(/\bWeb\b/g,'Веб').replace(/\s*\/\/\s*/g,' · ').replace(/\s+/g,' ').trim();
  function addPairs(pairs) {
    pairs.forEach(([ru,en]) => { dictionary.set(key(ru), [ru,en]); dictionary.set(key(en), [ru,en]); });
  }
  function translate(value, target = lang) {
    const pair = dictionary.get(key(value));
    let result = pair ? pair[target === 'ru' ? 0 : 1] : value;
    result = cleanNumber(result);
    if (target === 'ru') {
      const names = ['Google AI Studio','Vertex AI','VERTEX AI','Google AI','GOOGLE AI','Claude AI','CLAUDE AI','Cloud AI','CLOUD AI','Adobe Podcast AI','Spline AI','Notion AI','Workspace AI','Jules AI','Whisk / ImageFX','Web Agent','Web Search'];
      const protectedNames = [];
      names.forEach(name => { result = result.replaceAll(name, () => { protectedNames.push(name); return `\uE000${protectedNames.length-1}\uE001`; }); });
      result = result.replace(/\bAI\b/g,'ИИ').replace(/\bWeb\b/g,'Веб');
      result = result.replace(/\uE000(\d+)\uE001/g,(_,index) => protectedNames[Number(index)]);
    }
    return result;
  }
  const attrOriginals = new WeakMap();
  const textOriginals = new WeakMap();
  function applyLang(next) {
    const changed = next !== lang;
    lang = next;
    if (changed || !root?.children.length) renderTools();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement.closest('script,style,[data-no-localize],.ph-ai-prod-name,.ph-ai-vendor-pills,.ph-ai-docked-title small,input,textarea')) continue;
      const value = node.nodeValue;
      if (!value.trim()) continue;
      if (!textOriginals.has(node)) textOriginals.set(node,value.trim());
      const original = textOriginals.get(node);
      const translated = translate(dictionary.has(key(value)) ? value.trim() : original);
      if (translated !== value.trim()) node.nodeValue = value.replace(value.trim(),translated);
    }
    document.querySelectorAll('[aria-label],[title],[placeholder],[alt],[data-tip-title],[data-tip-desc],[data-tip-role]').forEach(el => {
      let originals = attrOriginals.get(el);
      if (!originals) { originals={}; attrOriginals.set(el, originals); }
      ['aria-label','title','placeholder','alt','data-tip-title','data-tip-desc','data-tip-role'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        if (!(attr in originals)) originals[attr] = el.getAttribute(attr);
        el.setAttribute(attr, translate(originals[attr]));
      });
    });
    document.title = label('МОЁ ДОСЬЕ — Досье специалиста','MY DOSSIER — Specialist portfolio');
    document.querySelectorAll('.ph-rail button').forEach((button,index) => button.setAttribute('aria-label', label(`Раздел ${index+1}`,`Section ${index+1}`)));
  }
  function stepTools(direction) {
    if (activeGroup && direction !== 0) { showGroup(null); return true; }
    return false;
  }
  window.DossierSite = { applyLang, translate, addPairs, groups, isToolsOpen: () => !!activeGroup, stepTools };
  renderTools();
})();
