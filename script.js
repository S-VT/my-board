/* ==========================================================================
   МОЁ ДОСЬЕ — ДОСЬЕ СПЕЦИАЛИСТА (SYSTEM ENGINE)
   Stationary observer deck, 16:9 Monitor -> 9:16 Phone 3D emergence,
   15-competency matrix with smooth auto-cycling sector illumination, and WebGL 3D.
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TAU = Math.PI * 2;
  const BG = 5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const isMobileViewport = () => window.innerWidth <= 1180;
  function centerScrollableButton(container, btn, smooth = true) {
    if (!container || !btn || container.scrollWidth <= container.clientWidth + 2) return;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const targetLeft = clamp(btn.offsetLeft - (container.clientWidth - btn.offsetWidth) / 2, 0, maxScroll);
    try {
      container.scrollTo({ left: targetLeft, behavior: smooth ? 'smooth' : 'auto' });
    } catch (_) {
      container.scrollLeft = targetLeft;
    }
  }

  /* ---------------- 1. LANGUAGE ENGINE (DEFAULT: RU) ---------------- */
  const LANG_KEY = 'personal-dossier-lang-v2';
  let curLang = 'ru';
  const readLang = () => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      return saved === 'en' ? 'en' : 'ru';
    } catch (_) {
      return 'ru';
    }
  };
  let updateHUD = () => {};
  let refreshSkillsLang = () => {};
  let refreshVideoLang = () => {};
  let refreshAnalyticsLang = () => {};

  /* ---------------- SVG BLUEPRINT LOCALIZATION MAP ---------------- */
  const SVG_TRANSLATIONS = {
    'ГЛАВНАЯ ЗАДАЧА: РЕАЛИЗАЦИЯ И ЗАПУСК ПРОЕКТА': 'MAIN OBJECTIVE: PROJECT IMPLEMENTATION & LAUNCH',
    'ВЕРШИНА ИЕРАРХИИ // ПОСТАНОВКА ЦЕЛИ': 'TOP OF HIERARCHY // OBJECTIVE DEFINITION',
    '01 // БАЗОВЫЙ ЭТАП': '01 // BASE STAGE',
    'СОЗДАНИЕ ПЛАНА': 'PLAN CREATION',
    'ДЕКОМПОЗИЦИЯ ЗАДАЧИ': 'TASK DECOMPOSITION',
    '02 // ПРОЕКЦИЯ': '02 // PROJECTION',
    'РЕФЕРЕНСЫ': 'REFERENCES',
    'ЧЕРНОВАЯ ВИЗУАЛИЗАЦИЯ': 'ROUGH VISUALIZATION',
    '03 // РЕГЛАМЕНТ': '03 // REGULATIONS',
    'УТВЕРЖДЕНИЕ СМЫСЛА': 'CORE CONCEPT APPROVAL',
    'КЛЮЧЕВАЯ ИДЕЯ И ТЕМЫ': 'CORE IDEA & THEMES',
    '04 // КОНТРОЛЬ': '04 // CONTROL',
    'ТАЙМ-ТРЕКИНГ И СРОКИ': 'TIME TRACKING & TIMELINES',
    'КОНТРОЛЬ ЭТАПОВ И ТЕМПА': 'MILESTONE & PACING CONTROL',
    '05 // ПОКАЗАТЕЛИ': '05 // METRICS',
    'ТЕНДЕНЦИЯ': 'MARKET TRENDS',
    'АНАЛИЗ ЦИФР И ГРАФИКОВ': 'NUMERICAL & TREND ANALYSIS',
    '06 // СТРУКТУРА': '06 // STRUCTURE',
    'СИСТЕМНЫЙ УЧЁТ И ПОРЯДОК': 'SYSTEM ACCOUNTING & ORDER',
    'ЭКОНОМИКА ПРОЕКТА': 'PROJECT ECONOMICS',
    'СОЗДАНИЕ ИНСТРУКЦИЙ': 'OPERATING INSTRUCTIONS',
    'ПОШАГОВЫЕ ПРАВИЛА РАБОТЫ': 'STEP-BY-STEP PROCEDURES',
    'ПРОКСИ И ИЗОЛЯЦИЯ': 'PROXIES & ISOLATION',
    'РАБОТА БЕЗ БЛОКИРОВОК': 'SECURE WORKFLOW WITHOUT BANS',
    'СОЗДАНИЕ И ЗАКУПКА': 'CREATION & PROCURING',
    'АККАУНТОВ': 'ACCOUNTS',
    '4 СОСТАВЛЯЮЩИЕ СПРАВА ───►': '4 CORE ASSETS ON THE RIGHT ───►',
    '1. ПОЧТА (НОВАЯ / КОРП.)': '1. EMAIL (NEW / CORP)',
    'РАБОЧИЕ ПОЧТОВЫЕ ЯЩИКИ': 'WORK INBOXES',
    '2. GMAIL И ЛОГИН': '2. GMAIL & WORKSPACE LOGIN',
    'БАЗА ДОСТУПОВ': 'CREDENTIALS STORE',
    '3. ВЕРИФИКАЦИЯ (2FA)': '3. VERIFICATION (2FA)',
    'БЕЗОПАСНОСТЬ СЕССИЙ': 'SESSION SECURITY',
    '4. НОМЕР (АКТИВАЦИЯ)': '4. PHONE (ACTIVATION)',
    'ГОЛОСОВОЙ ЧЕК И АКТИВАЦИЯ': 'VOICE CHECK & ACTIVATION',
    'УСТАНОВКА АККАУНТОВ': 'ACCOUNT DEPLOYMENT',
    'СТРУКТУРА РЕКВИЗИТОВ': 'CREDENTIALS STRUCTURE',
    'БАЗА ДАННЫХ (БД)': 'CENTRAL DATABASE (DB)',
    'УЧЁТ ДОСТУПОВ И КЛЮЧЕЙ': 'ACCESS & API KEY LEDGER',
    'ИСХОДЯЩАЯ ВЫГОДА': 'OUTBOUND VALUE',
    'ВЫГОДНЕЕ И ДЕШЕВЛЕ': 'MAXIMUM ROI & LOWER COST',
    'ЕДИНАЯ РАБОЧАЯ БАЗА // СИНХРОНИЗАЦИЯ ДОСТУПОВ И ПРОЦЕССОВ': 'UNIFIED WORKSPACE // PROCESS & ACCESS SYNCHRONIZATION',
    'ПОЗВОЛЯЕТ РАБОТАТЬ НАД ПРОЕКТОМ НЕ ОДНОМУ, А СРАЗУ НЕСКОЛЬКИМ ЛЮДЯМ ПАРАЛЛЕЛЬНО': 'ENABLES PARALLEL MULTI-OPERATOR WORKFLOW WITHOUT COLLISION',
    'ЕДИНАЯ БАЗА ИНСТРУМЕНТОВ': 'UNIFIED TOOLKIT BASE',
    'НАСТРОЙКА РАБОЧИХ МЕСТ': 'WORKSTATION CONFIGURATION',
    'ЕДИНАЯ ПОНЯТНАЯ СИСТЕМА': 'UNIFIED INTUITIVE SYSTEM',
    'ДЛЯ РАБОТЫ КОМАНДЫ': 'FOR TEAM OPERATIONS',
    'ПЛАН → ГЕНЕРАЦИЯ': 'PLAN → GENERATION',
    'ГРАФИЧЕСКОЕ СОЗДАНИЕ ВИДЕО': 'GRAPHIC VIDEO CREATION',
    'ГЕНЕРАЦИЯ ВИДЕОПЛАНА И СЦЕН ↓': 'SCENE & TIMELINE SYNTHESIS ↓',
    'АДАПТАЦИЯ РОЛИКА ПОД ФОРМАТЫ ВСЕХ ПЛОЩАДОК (16:9 И 9:16)': 'MULTI-PLATFORM VIDEO ADAPTATION (16:9 & 9:16)',
    'ГОТОВЫЙ МАСТЕР-РОЛИК И ВЕРСИИ ПОД ВСЕ ПЛОЩАДКИ': 'FINAL MASTER VIDEO & PLATFORM DELIVERABLES',
    'ПОСТЫ · БРЕНДИНГ · ПЛАКАТЫ': 'POSTS · BRANDING · POSTERS',
    'АЙДЕНТИКА И ПРОМО-ГРАФИКА ↓': 'IDENTITY & PROMO GRAPHICS ↓',
    'ИТОГОВЫЙ ПРОДУКТ': 'FINAL DELIVERABLE',
    'ГОТОВАЯ СИСТЕМА ПОСТОВ, БРЕНДИНГА И ПЛАКАТОВ ПОД КЛЮЧ': 'TURNKEY BRANDING, SOCIALS & KEY ART ASSETS',
    'ЕДИНЫЙ ВЫПУСК: ГРАФИЧЕСКОЕ ВИДЕО + ПОСТЫ, БРЕНДИНГ И ПЛАКАТЫ → СТРАНИЦА «ПРОДУКТЫ»': 'UNIFIED RELEASE: VIDEO + POSTS, BRANDING & POSTERS → PRODUCTS PAGE',
    'ПЕРЕЙТИ НА СТРАНИЦУ «ПРОДУКТЫ» ↗': 'PROCEED TO PRODUCTS PAGE ↗',
    'УРОВЕНЬ I // ПЛАНИРОВАНИЕ, РЕФЕРЕНСЫ, ТАЙМ-ТРЕКИНГ, ТЕНДЕНЦИЯ И СИСТЕМНЫЙ УЧЁТ': 'LEVEL I // PLANNING, REFERENCES, TIME TRACKING, TRENDS & ACCOUNTING',
    'УРОВЕНЬ II // ИНСТРУКЦИИ, ПРОКСИ, СОЗДАНИЕ АККАУНТОВ, БАЗА ДАННЫХ И ИСХОДЯЩАЯ ВЫГОДА': 'LEVEL II // INSTRUCTIONS, PROXIES, ACCOUNTS, DATABASE & OUTBOUND VALUE',
    'УРОВЕНЬ III // ЕДИНАЯ РАБОЧАЯ БАЗА И БАЗА ИНСТРУМЕНТОВ (> 1 ЧЕЛОВЕКА)': 'LEVEL III // UNIFIED WORKSPACE & TOOLKIT (> 1 OPERATOR)',
    'УРОВЕНЬ IV // ГЕНЕРАЦИЯ РОЛИКА, АДАПТАЦИЯ ПОД ПЛОЩАДКИ, ПОСТЫ И ИТОГОВЫЙ ПРОДУКТ': 'LEVEL IV // VIDEO GENERATION, PLATFORM ADAPTATION, POSTS & DELIVERABLE',
    'СХЕМА А // ПРОДОЛЖЕНИЕ ЛИНИИ ОТ «ГРАФИЧЕСКОЕ СОЗДАНИЕ ВИДЕО»': 'SCHEMA A // WORKFLOW CONTINUATION FROM GRAPHIC VIDEO CREATION',
    'СХЕМА Б // ПРОДОЛЖЕНИЕ ЛИНИИ ОТ «ПОСТЫ · БРЕНДИНГ · ПЛАКАТЫ»': 'SCHEMA B // WORKFLOW CONTINUATION FROM POSTS, BRANDING & POSTERS',
    'СОЗДАНИЕ ВИДЕОРОЛИКА: ЭТАПЫ, СЕРВИСЫ': 'VIDEO ASSET PRODUCTION: STAGES & ENGINES',
    'СОЗДАНИЕ ПОСТОВ, БРЕНДИНГ, ПЛАКАТЫ': 'POSTS, BRANDING & PROMO DESIGN STAGES',
    '01 // ВИЗУАЛЬНАЯ БАЗА И ПРОСТРАНСТВО': '01 // VISUAL FOUNDATION & SPACE',
    'РЕФЕРЕНЦИАЛ 3D–2D': '3D–2D REFERENTIAL PIPELINE',
    'КОНЦЕПТ-КАДРЫ · 3D/2D СРЕДА · КОМПОЗИЦИЯ': 'CONCEPT FRAMES · 3D/2D SCENE · COMPOSITION',
    '02 // СМЫСЛОВАЯ И ПРОМПТ-МАТРИЦА': '02 // PROMPT MATRIX & SEMANTICS',
    'ГЕНЕРАЦИЯ И АНАЛИЗ ПРОМПТОВ': 'PROMPT GENERATION & ANALYSIS',
    'СТРУКТУРА СЦЕН · АНАЛИЗ ЛОГИКИ · ТАЙМКОДЫ': 'SCENE STRUCTURE · LOGIC ANALYSIS · TIMECODES',
    '03 // IMAGE-TO-VIDEO & MOTION SYNTHESIS': '03 // IMAGE-TO-VIDEO & MOTION SYNTHESIS',
    'ГЕНЕРАЦИЯ И СОЗДАНИЕ ВИДЕОФОРМАТА': 'VIDEO FORMAT GENERATION & SYNTHESIS',
    'ДВИЖЕНИЕ КАМЕРЫ · ФИЗИКА · ДИНАМИКА': 'CAMERA MOVEMENT · PHYSICS · DYNAMICS',
    '04 // АУДИО-МАСТЕРИНГ И SFX': '04 // AUDIO MASTERING & SFX',
    'МУЗЫКА И САУНД-ДИЗАЙН': 'MUSIC & SOUND DESIGN',
    'САУНДТРЕК · SFX-ПЕРЕХОДЫ · БАЛАНС': 'ORIGINAL SCORE · SFX TRANSITIONS · BALANCING',
    '05 // 3D-СРЕДА И НЕЙРО-КОНТРОЛЬ': '05 // 3D ENVIRONMENT & NEURAL CONTROL',
    '3D-МОДЕЛИ И VFX-ДИНАМИКА': '3D MESHES & VFX DYNAMICS',
    'КАМЕРА-КОНТРОЛЬ · ТРЕКИНГ · 3D-СРЕДА': 'CAMERA CONTROL · 3D TRACKING · ENVIRONMENT',
    '06 // РЕЧЬ И ДИКТОРСКИЙ ГОЛОС': '06 // SPEECH & VOICE SYNTHESIS',
    'СИНТЕЗ РЕЧИ И ОЗВУЧКА': 'SPEECH SYNTHESIS & VOICEOVER',
    'ТЕМБР · ИНТОНАЦИИ · ЧИСТКА ЧАСТОТ': 'TIMBRE · INFLECTION · EQ POLISHING',
    '07 // СБОРКА ТАЙМЛАЙНА, МОУШН-ГРАФИКА И ФИНАЛЬНАЯ ОБРАБОТКА': '07 // TIMELINE ASSEMBLY, MOTION GRAPHICS & MASTERING',
    'МОНТАЖ, КОМПОЗИНГ, МАСТЕРИНГ': 'EDITING, COMPOSITING & MASTERING',
    'ЦВЕТОКОРРЕКЦИЯ · ДИНАМИЧЕСКИЕ СКЛЕЙКИ · ЧИСТОВАЯ СБОРКА': 'COLOR GRADING · MATCH CUTS · FINAL POLISH',
    '08 // РЕЗУЛЬТАТ СХЕМЫ А · ВЫХОД ВИДЕОКОНВЕЙЕРА': '08 // SCHEMA A RESULT · VIDEO PIPELINE OUTPUT',
    '01 // СМЫСЛОВАЯ БАЗА И СТРУКТУРА': '01 // CONTENT FOUNDATION & STRUCTURE',
    'ГЕНЕРАЦИЯ И АНАЛИЗ МАТЕРИАЛА': 'MATERIAL GENERATION & ANALYSIS',
    'РАЗБОР ФАКТУРЫ · ТЕЗИСЫ · КОНТЕНТ-МАТРИЦА': 'FACT CHECKING · THESIS · CONTENT MATRIX',
    '02 // ФИРМЕННЫЙ КОД И ВЕКТОР': '02 // BRAND CODE & VECTOR',
    'РАЗРАБОТКА БРЕНДИНГА И СТИЛЯ': 'BRAND IDENTITY DEVELOPMENT',
    'ЛОГОТИПЫ · ПАЛИТРА · ДИЗАЙН-СИСТЕМА': 'LOGOS · PALETTE · DESIGN SYSTEM',
    '03 // KEY ART & POSTER SYNTHESIS': '03 // KEY ART & POSTER SYNTHESIS',
    'ГЕНЕРАЦИЯ ПЛАКАТОВ И ОБЛОЖЕК': 'POSTER & COVER GENERATION',
    'РЕКЛАМНЫЕ ПЛАКАТЫ · ТИПОГРАФИКА · БАННЕРЫ': 'COMMERCIAL POSTERS · TYPOGRAPHY · BANNERS',
    '04 // 3D-СИМВОЛЫ И УПАКОВКА': '04 // 3D ASSETS & PACKAGING',
    '3D-АЙДЕНТИКА И РЕНДЕР ПРОДУКТА': '3D IDENTITY & PRODUCT RENDERING',
    'ОБЪЁМНАЯ ГРАФИКА · МАТЕРИАЛЫ · СВЕТ': 'VOLUMETRIC ASSETS · SHADERS · LIGHTING',
    '05 // ПУБЛИКАЦИИ, СТАТЬИ И МЕДИА-КОНТЕНТ': '05 // ARTICLES & MEDIA CONTENT',
    'СОЗДАНИЕ ПОСТОВ (СТАТЬИ И СОЦСЕТИ)': 'POST CREATION (ARTICLES & CHANNELS)',
    'СТАТЬИ И ЛОНГРИДЫ · ПОСТЫ · ПОДВОДКИ К ПРОДУКТУ': 'LONG-FORM PROSE · CAROUSELS · COPYWRITING',
    '06 // МОДУЛЬНАЯ СЕТКА И РЕЛИЗ': '06 // MODULAR GRID & PUBLISHING',
    'ВЁРСТКА МАКЕТОВ И АВТОПОСТИНГ': 'LAYOUT PUBLISHING & AUTOMATION',
    'КАРУСЕЛИ · КАРТОЧКИ · ПЛАКАТЫ · РЕЛИЗ': 'CAROUSELS · CARDS · GRAPHICS · RELEASE',
    '07 // ФИНАЛЬНАЯ УПАКОВКА БРЕНДА, ПОСТОВ И ПРОМО-ГРАФИКИ': '07 // FINAL PACKAGING OF BRAND, POSTS & PROMO ASSETS',
    'СОЦСЕТИ (TELEGRAM) И УПАКОВКА': 'SOCIAL CHANNELS (TELEGRAM) & PACKAGING',
    'СОЦСЕТИ И СТАТЬИ · ПЛАКАТЫ · АЙДЕНТИКА · ПРОМО-МАТЕРИАЛЫ': 'SOCIALS & ARTICLES · POSTERS · BRAND ASSETS',
    '08 // РЕЗУЛЬТАТ СХЕМЫ Б · ВЫХОД КОНТУРА АЙДЕНТИКИ': '08 // SCHEMA B RESULT · IDENTITY CONTOUR OUTPUT',
    'БРЕНДБУК, СЕРИЯ ПЛАКАТОВ И КОНТЕНТ-СЕТКА СОЦСЕТЕЙ': 'BRANDBOOK, POSTER SERIES & SOCIAL CONTENT CALENDAR',
    'СИНХРОНИЗАЦИЯ ДВУХ ЛИНИЙ ПРОИЗВОДСТВА // СХЕМА А + СХЕМА Б': 'DUAL PRODUCTION LINE SYNCHRONIZATION // SCHEMA A + SCHEMA B',
    'ЕДИНЫЙ ВИЗУАЛЬНЫЙ КОД · ПЛАКАТЫ · ПОСТЫ ПОД КЛЮЧ': 'UNIFIED VISUAL CODE · POSTERS · TURNKEY CAMPAIGNS'
  };

  window.DossierSite?.addPairs(Object.entries(SVG_TRANSLATIONS).filter(([ru,en]) => ru !== en));

  function refreshSvgLang() {
    const isEn = curLang === 'en';
    const norm = s => (s || '').replace(/\s*[·/]+\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const map = {};
    Object.keys(SVG_TRANSLATIONS).forEach(k => {
      map[norm(k)] = SVG_TRANSLATIONS[k];
    });

    $$('.ph-blueprint-svg text').forEach(el => {
      const txt = el.textContent.trim();
      if (!txt) return;
      if (el.dataset.ru === undefined) el.dataset.ru = txt;
      const k = norm(el.dataset.ru);
      if (isEn && map[k]) {
        el.textContent = map[k];
      } else if (!isEn && el.dataset.ru) {
        el.textContent = el.dataset.ru;
      }
    });
  }

  function applyLang(next) {
    curLang = next === 'en' ? 'en' : 'ru';
    document.documentElement.lang = curLang;
    $$('[data-en]').forEach(el => {
      if (el.dataset.ru === undefined) el.dataset.ru = el.innerHTML;
      el.innerHTML = curLang === 'en' ? el.dataset.en : el.dataset.ru;
    });
    $$('[data-lang]').forEach(btn => {
      const on = btn.dataset.lang === curLang;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem(LANG_KEY, curLang); } catch (_) {}
    refreshSkillsLang();
    refreshVideoLang();
    refreshAnalyticsLang();
    refreshSvgLang();
    updateHUD();
    window.DossierSite?.applyLang(curLang);
  }
  $$('[data-lang]').forEach(btn => btn.addEventListener('click', () => applyLang(btn.dataset.lang)));

  /* ---------------- 2. MOBILE MENU ---------------- */
  const menuBtn = $('.ph-menu');
  const setMenu = open => {
    document.body.classList.toggle('ph-menu-open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
  };
  menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('ph-menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- 3. 15 CORE COMPETENCIES & SMOOTH AUTO-CYCLING SECTORS ---------------- */
  const SKILLS_DATA = [
    {
      code: 'SPECIFICATION // COMMERCIAL VIDEO',
      titleRu: 'Создание рекламных видео',
      titleEn: 'Commercial Video Production',
      descRu: 'Производство рекламных роликов от раскадровки до финального мастера. Сразу собираю горизонтальную (16:9) и вертикальную (9:16) версии с перекомпоновкой кадра, титров и динамики под конкретную площадку.',
      descEn: 'Commercial video production from storyboard to final master. Simultaneous delivery of 16:9 widescreen and 9:16 vertical cuts with frame recomposition, titles, and pacing tailored to each platform.',
      listRu: [
        'Захват внимания в первые 2–3 секунды за счёт плотного монтажа и смены планов',
        'Одновременная сдача мастер-версий 16:9 и 9:16 без потери композиции',
        'Полный цикл: идея, съёмка или генерация, монтаж, цвет, диктор и саунд-дизайн'
      ],
      listEn: [
        'Opening-second hook in the first 2–3 seconds via tight cutting and shot variety',
        'Simultaneous 16:9 and 9:16 master delivery without cropping key details',
        'End-to-end build: concept, shoot or AI generation, edit, color, voiceover, and SFX'
      ],
      tags: ['FORMAT-FREE', '16:9 & 9:16', 'COMMERCIAL', 'FULL CYCLE']
    },
    {
      code: 'SPECIFICATION // SCRIPTWRITING',
      titleRu: 'Создание сценариев',
      titleEn: 'Script Development & Dramaturgy',
      descRu: 'Сценарии для рекламных роликов, продуктовых интеграций и презентаций. Строю текст вокруг задачи продукта: хук на старте, наглядная демонстрация ценности и чёткий призыв к действию без воды.',
      descEn: 'Scripts for commercials, product integrations, and presentations. Built around the product goal: strong opening hook, clear demonstration of value, and direct call to action.',
      listRu: [
        'Покадровый сценарий: тайминг, видеоряд, крупности планов и задачи для монтажа',
        'Синхронизация закадрового текста и титров со сменой сцен по секундам',
        'Несколько вариантов вступления (хуков) под тест разных сегментов аудитории'
      ],
      listEn: [
        'Shot-by-shot script: timing, visuals, camera framing, and editing notes',
        'Second-by-second sync of voiceover copy and on-screen titles with scene cuts',
        'Multiple opening hooks prepared for A/B testing across audience segments'
      ],
      tags: ['DRAMATURGY', 'STORYBOARD', 'NARRATIVE', 'TIMING']
    },
    {
      code: 'SPECIFICATION // PRODUCT PROMOTION',
      titleRu: 'Продвижение продукта',
      titleEn: 'Mass-Market Product Promotion',
      descRu: 'Вывод продукта на широкую аудиторию по пошаговому медиаплану. Разбираю рынок и конкурентов, формулирую понятное торговое предложение и связываю видеокреативы, посадочные страницы и рекламные каналы в одну воронку.',
      descEn: 'Step-by-step product rollout to the mass market. Competitor analysis, clear value proposition, and a unified funnel connecting video creatives, landing pages, and ad channels.',
      listRu: [
        'Медиаплан запуска: сегменты аудитории, бюджеты, площадки и целевые метрики',
        'Связка рекламных роликов, сайта и аналитики для контроля стоимости заявки',
        'Масштабирование рабочих связок и отключение неэффективных объявлений по цифрам'
      ],
      listEn: [
        'Launch media plan: audience segments, budgets, channels, and target metrics',
        'Connecting video ads, landing pages, and analytics to track cost per lead',
        'Scaling profitable ad sets and cutting underperforming creatives based on data'
      ],
      tags: ['PRODUCT LAUNCH', 'INDUSTRY POSITIONING', 'GO-TO-MARKET', 'GROWTH']
    },
    {
      code: 'SPECIFICATION // POST-PRODUCTION & AUDIO',
      titleRu: 'Монтаж, озвучка, пакет Adobe',
      titleEn: 'Editing, Voiceover & Adobe Suite',
      descRu: 'Нелинейный монтаж, моушн-графика, цветокоррекция и сведение звука в Adobe Premiere Pro, After Effects, Audition и Photoshop. Собираю чистый исходник, выравниваю цвет и делаю разборчивую дикторскую дорожку.',
      descEn: 'Non-linear editing, motion graphics, color grading, and audio mixing in Adobe Premiere Pro, After Effects, Audition, and Photoshop.',
      listRu: [
        'Монтаж и анимация титров, плашек, кеинга и трекинга в Premiere Pro и After Effects',
        'Чистка дикторского голоса от шумов, компрессия, эквализация и баланс с музыкой в Audition',
        'Подготовка мастеров по техтребованиям площадок (битрейт, кодек, громкость LUFS)'
      ],
      listEn: [
        'Editing and animating titles, lower thirds, keying, and tracking in Premiere & After Effects',
        'Dialogue cleanup, compression, EQ, and music/SFX mixing in Adobe Audition',
        'Master exports matched to platform specs (bitrate, codec, LUFS loudness)'
      ],
      tags: ['PREMIERE PRO', 'AFTER EFFECTS', 'AUDITION', 'VOICEOVER & SFX']
    },
    {
      code: 'SPECIFICATION // SOCIAL MEDIA & CAMPAIGNS',
      shortRu: 'Соцсети и реклама',
      titleRu: 'Ведение соцсетей и рекламной кампании',
      titleEn: 'Social Media & Ad Campaigns',
      descRu: 'Автономное ведение каналов бренда и запуск рекламных кампаний. Беру на себя контент-план, оформление площадок, регулярный выпуск видео и постов, закупку трафика и контроль отдачи.',
      descEn: 'Autonomous management of brand channels and ad campaigns: content calendar, visual packaging, regular video and post production, media buying, and performance tracking.',
      listRu: [
        'Контент-сетка на месяц вперёд: Shorts, Reels, Telegram-посты, карточки и длинные ролики',
        'Настройка рекламных кабинетов, подбор площадок для посевов и тест креативов',
        'Стабильный график публикаций без срывов и еженедельный срез по охватам и заявкам'
      ],
      listEn: [
        'Monthly content grid: Shorts, Reels, Telegram posts, carousels, and long-form video',
        'Ad account setup, channel seeding selection, and creative A/B testing',
        'Consistent publishing schedule and weekly reach and lead reports'
      ],
      tags: ['SOCIAL MEDIA', 'CONTENT STRATEGY', 'PACKAGING', 'DISTRIBUTION']
    },
    {
      code: 'SPECIFICATION // WORKFLOW ARCHITECTURE',
      titleRu: 'Организация структур работы',
      titleEn: 'Workflow & Systems Architecture',
      descRu: 'Построение понятной рабочей системы для проекта с нуля. Определяю этапы производства, зоны ответственности, структуру папок и правила приёмки, чтобы команда работала по чёткому порядку без простоев.',
      descEn: 'Building clear project workflows from scratch: defining production stages, ownership, folder hierarchy, and acceptance criteria so the team works without stalls.',
      listRu: [
        'Разбивка проекта на этапы с конкретными сроками и критериями готовности',
        'Единый стандарт хранения исходников, версий файлов, доступов и шаблонов',
        'Короткие рабочие инструкции и чек-листы для быстрого ввода новых людей'
      ],
      listEn: [
        'Breaking projects into stages with fixed deadlines and definition of done',
        'Unified standard for storing source files, versions, credentials, and templates',
        'Concise SOPs and checklists for onboarding new team members quickly'
      ],
      tags: ['OPERATIONAL SYSTEMS', 'PIPELINE', 'REGULATIONS', 'STRUCTURE']
    },
    {
      code: 'SPECIFICATION // TEAM OPERATIONS',
      titleRu: 'Обеспечение командной работы',
      titleEn: 'Teamwork Support & Coordination',
      descRu: 'Координация смежных специалистов на сложных задачах. Стыкую между собой монтажёров, дизайнеров, разработчиков и подрядчиков, вовремя передаю исходники и убираю узкие места в процессе.',
      descEn: 'Coordinating cross-functional specialists on complex tasks. Aligning editors, designers, developers, and contractors, handing off assets on time, and removing bottlenecks.',
      listRu: [
        'Постановка задач с полным комплектом вводных: ТЗ, референсы, исходники и дедлайн',
        'Синхронизация параллельных потоков работы, чтобы этапы не блокировали друг друга',
        'Быстрое решение технических и организационных заминок по ходу проекта'
      ],
      listEn: [
        'Clear task briefs with specs, references, source assets, and deadlines',
        'Synchronizing parallel workstreams so stages never block each other',
        'Fast resolution of technical and organizational blockers during production'
      ],
      tags: ['TEAM SYNC', 'OPERATIONS', 'COORDINATION', 'RELIABILITY']
    },
    {
      code: 'SPECIFICATION // 1C ENTERPRISE BASE',
      titleRu: 'Работа с системой 1С',
      titleEn: 'Working with 1C Systems',
      descRu: 'Прикладная работа со справочниками, документами, номенклатурой и отчётами в 1С. Использую логику учётных контуров 1С при составлении производственных планов, смет, таблиц движения товаров и сверке данных.',
      descEn: 'Hands-on work with directories, documents, nomenclature, and reports in 1C. Applying 1C accounting logic to production plans, budgets, inventory sheets, and data reconciliation.',
      listRu: [
        'Работа с карточками номенклатуры, первичными документами, остатками и отчётами в 1С',
        'Построение таблиц учёта и планов проекта по правилам учётной структуры 1С',
        'Выгрузка и сверка данных между 1С, Excel и аналитическими дашбордами'
      ],
      listEn: [
        'Working with nomenclature cards, primary documents, stock balances, and 1C reports',
        'Structuring project tracking tables and plans around 1C accounting logic',
        'Exporting and reconciling data across 1C, Excel, and BI dashboards'
      ],
      tags: ['1C ENTERPRISE', 'PLANNING LOGIC', 'NOMENCLATURE', 'SYSTEM INTEGRATION']
    },
    {
      code: 'SPECIFICATION // ACCOUNTING & CONTROL',
      titleRu: 'Ведение учёта',
      titleEn: 'Systematic Accounting & Control',
      descRu: 'Точный учёт бюджетов, подрядчиков, лицензий, аккаунтов и выпущенных материалов. Все расходы, статусы оплат и рабочие активы сведены в актуальные таблицы без потерянных файлов и расхождений.',
      descEn: 'Accurate tracking of budgets, contractors, licenses, accounts, and delivered assets. All expenses, payment statuses, and working assets kept in clean, up-to-date ledgers.',
      listRu: [
        'Реестры расходов, смет, подписок, рабочих аккаунтов и цифровых материалов',
        'Контроль сроков оплат, закрывающих документов и выполнения обязательств',
        'Сводные отчёты по затратам и остаткам бюджета для руководителя проекта'
      ],
      listEn: [
        'Ledgers for expenses, budgets, subscriptions, work accounts, and digital assets',
        'Tracking payment dates, closing documents, and contractor deliverables',
        'Clear summary sheets on spend and remaining budget'
      ],
      tags: ['ACCOUNTING', 'RESOURCE CONTROL', 'DOCUMENTATION', 'REPORTING']
    },
    {
      code: 'SPECIFICATION // TIME-TRACKING & CHARTS',
      titleRu: 'Мониторинг и тайм-трекинг',
      titleEn: 'Monitoring, Time-Tracking & Charts',
      descRu: 'Отслеживание сроков, загрузки команды и выполнения плана по графикам. Фиксирую фактическое время на каждый этап, строю наглядные диаграммы Ганта и вовремя замечаю, где темп начинает проседать.',
      descEn: 'Tracking deadlines, team workload, and plan execution via charts. Logging actual time per stage, maintaining Gantt schedules, and spotting schedule drift early.',
      listRu: [
        'Учёт рабочего времени по задачам и расчёт реальной трудоёмкости производства',
        'Построение графиков нагрузки, календарных планов и диаграмм темпа работ',
        'Раннее предупреждение сдвигов дедлайна и перераспределение ресурсов'
      ],
      listEn: [
        'Task-level time tracking and calculation of actual production effort',
        'Building workload charts, calendar schedules, and pacing diagrams',
        'Early detection of deadline slips and timely resource reallocation'
      ],
      tags: ['TIME-TRACKING', 'NUMERICAL CHARTS', 'MONITORING', 'SCHEDULES']
    },
    {
      code: 'SPECIFICATION // DATA ANALYTICS',
      titleRu: 'Аналитика',
      titleEn: 'Data & Performance Analytics',
      descRu: 'Разбор эффективности контента, рекламы и продаж на основе точных цифр. Считаю удержание аудитории по секундам, CTR, стоимость лида (CPL), конверсию в покупку и окупаемость затрат (ROMI).',
      descEn: 'Evaluating content, ad, and sales performance from hard numbers: second-by-second audience retention, CTR, CPL, sale conversion rate, and ROMI.',
      listRu: [
        'Сквозная связка данных из Яндекс Метрики, GA4, рекламных кабинетов и CRM',
        'Анализ кривых удержания видео и отсева пользователей на каждом шаге воронки',
        'Конкретные выводы по цифрам: что докрутить в ролике, оффере или на посадочной странице'
      ],
      listEn: [
        'End-to-end data link across Yandex Metrica, GA4, ad accounts, and CRM',
        'Analyzing video retention curves and funnel drop-off at every step',
        'Actionable fixes for video hooks, offers, and landing pages backed by metrics'
      ],
      tags: ['RETENTION METRICS', 'CTR & FUNNELS', 'DATA-DRIVEN', 'OPTIMIZATION']
    },
    {
      code: 'SPECIFICATION // CREATIVE WEB SYSTEMS',
      titleRu: 'Разработка креативных сайтов',
      titleEn: 'Creative Web Systems Development',
      descRu: 'Создание быстрых продуктовых сайтов, лендингов и интерактивных презентаций. Пишу чистый код на HTML5, CSS3, JavaScript и WebGL с 3D-сценами, плавной анимацией и адаптацией под компьютеры и смартфоны.',
      descEn: 'Building fast product websites, landing pages, and interactive presentations in clean HTML5, CSS3, JavaScript, and WebGL with 3D scenes and responsive layouts.',
      listRu: [
        'Вёрстка и программирование интерфейсов без тяжёлых конструкторов и лишних библиотек',
        'Встраивание интерактивных 3D-моделей, шейдеров, видео и кастомной графики в браузер',
        'Выкладка готового сайта на хостинг или облачную платформу с настройкой домена и аналитики'
      ],
      listEn: [
        'Custom frontend code without bloated page builders or unnecessary dependencies',
        'Embedding interactive 3D models, shaders, video, and custom graphics in the browser',
        'Cloud deployment with custom domain, SSL, and analytics setup'
      ],
      tags: ['WEBGL 3D', 'INTERACTIVE UI', 'FRONTEND', 'AUTONOMOUS DEPLOY']
    },
    {
      code: 'SPECIFICATION // 3D ENGINEERING',
      titleRu: 'Разработка 3D-моделей',
      titleEn: '3D Modeling & Technical Assets',
      descRu: 'Моделирование продуктов, упаковки и технических объектов в Blender и Unreal Engine 5. Делаю чистую сетку, UV-развёртки, физически корректные материалы (PBR), свет и рендер под видео или веб.',
      descEn: 'Modeling products, packaging, and hard-surface objects in Blender and Unreal Engine 5: clean topology, UV unwrapping, PBR materials, lighting, and rendering.',
      listRu: [
        'Точная геометрия по чертежам, фотореференсам или реальным образцам продукта',
        'Настройка шейдеров металла, стекла, пластика и этикеток с быстрой сменой дизайна',
        'Экспорт оптимизированных 3D-сцен для рекламных роликов, движков и WebGL-витрин'
      ],
      listEn: [
        'Accurate geometry built from blueprints, photo references, or physical samples',
        'Metal, glass, plastic, and label shaders set up for rapid skin swapping',
        'Optimized 3D asset export for commercial video, real-time engines, and WebGL'
      ],
      tags: ['BLENDER 3D', 'UNREAL ENGINE 5', 'PBR MATERIALS', 'HARD-SURFACE']
    },
    {
      code: 'SPECIFICATION // APPLIED AI STACK',
      titleRu: 'Опытный пользователь AI',
      titleEn: 'Advanced Applied AI Specialist',
      descRu: 'Ежедневная работа со связками моделей OpenAI, Anthropic, Google, Runway, Midjourney и ElevenLabs. Использую ИИ как ускоритель продакшена: от написания кода и раскадровок до генерации видеосцен, фонов и озвучки.',
      descEn: 'Daily production workflows combining OpenAI, Anthropic, Google, Runway, Midjourney, and ElevenLabs models for coding, storyboards, video synthesis, key art, and voiceover.',
      listRu: [
        'Текст, код и аналитика: GPT-4o, OpenAI o1 / o3-mini, Claude 3.7 Sonnet, Gemini 2.5 Pro',
        'Графика и видео: Midjourney v6.1, Flux.1, Runway Gen-3 / Gen-4, Sora, Veo 2, Luma',
        'Звук и речь: синтез и чистка голоса в ElevenLabs, Adobe Podcast AI, музыка в Suno и Udio'
      ],
      listEn: [
        'Text, code & analysis: GPT-4o, OpenAI o1 / o3-mini, Claude 3.7 Sonnet, Gemini 2.5 Pro',
        'Visuals & video: Midjourney v6.1, Flux.1, Runway Gen-3 / Gen-4, Sora, Veo 2, Luma',
        'Audio & voice: speech synthesis and cleanup in ElevenLabs, Adobe Podcast AI, Suno, Udio'
      ],
      tags: ['GPT-4O / CLAUDE 3.7', 'RUNWAY / LUMA', 'FLUX / MIDJOURNEY', 'GEMINI 2.5 PRO']
    },
    {
      code: 'SPECIFICATION // TECHNICAL WORKSTATION',
      titleRu: 'Опытный пользователь ПК',
      titleEn: 'Advanced PC & Systems Power User',
      descRu: 'Свободное владение Windows, железом, сетями, кодеками, прокси и командной строкой. Сам настраиваю рабочие станции под тяжёлый рендер, поднимаю локальные сервисы и быстро разбираюсь в новом профильном софте.',
      descEn: 'Deep command of Windows, PC hardware, networking, codecs, proxies, and CLI tools. Configuring workstations for heavy rendering, running local services, and mastering new software fast.',
      listRu: [
        'Настройка GPU-ускорения, кодеков, памяти и дисковых подсистем под монтаж и 3D',
        'Конфигурация прокси, изолированных профилей, корпоративных почт, DNS и скриптов',
        'Быстрая диагностика и устранение любых сбоев ОС, драйверов или рабочего ПО'
      ],
      listEn: [
        'Tuning GPU acceleration, codecs, memory, and storage for video editing and 3D',
        'Configuring proxies, isolated browser profiles, corporate email, DNS, and scripts',
        'Fast diagnostics and resolution of OS, driver, and software issues'
      ],
      tags: ['HARDWARE & OS', 'OPTIMIZATION', 'AUTOMATION', 'TROUBLESHOOTING']
    }
  ];

  const SECTOR_SPECS = {
    all: {
      code: 'SPECIFICATION // MULTIDISCIPLINARY MATRIX',
      titleRu: 'Полный контур компетенций',
      titleEn: 'Full Competency Matrix',
      descRu: '15 прикладных навыков в одной связке: рекламный видеопродакшн, сценарии, монтаж в Adobe, 3D и сайты, нейросети, ведение соцсетей, вывод продукта на рынок, сквозная аналитика, учёт в 1С и координация команды.',
      descEn: '15 practical skills combined: commercial video production, scriptwriting, Adobe post-production, 3D and web development, applied AI, social media, product rollout, analytics, 1C accounting, and team coordination.',
      listRu: [
        'Производство контента и технологий своими руками: от сценария и 3D до готового сайта и ролика',
        'Системный порядок в делах: регламенты, учёт в 1С, контроль времени и смет',
        'Продвижение продукта и соцсетей с опорой на метрики удержания, конверсии и окупаемости'
      ],
      listEn: [
        'Hands-on content and tech production: from script and 3D to finished website and video',
        'Operational order: clear SOPs, 1C accounting, time-tracking, and budget control',
        'Product and social media growth driven by retention, conversion, and ROMI metrics'
      ],
      tags: ['SYSTEMS', 'TECHNOLOGIES', 'MEDIA', 'ANALYTICS']
    },
    media: {
      code: 'SECTOR // MEDIA & PRODUCTION',
      titleRu: 'Медиа и продакшн',
      titleEn: 'Media & Production',
      descRu: 'Полный цикл создания коммерческого видео: сценарий, раскадровка, съёмка и ИИ-генерация, монтаж, цветокоррекция, дикторская озвучка и саунд-дизайн в пакете Adobe под горизонтальные (16:9) и вертикальные (9:16) экраны.',
      descEn: 'Full-cycle commercial video creation: script, storyboard, shoot and AI generation, editing, color grading, voiceover, and sound design in Adobe for 16:9 and 9:16 screens.',
      listRu: [
        'Плотная режиссура монтажа с удержанием внимания с первых секунд ролика',
        'Точный расчёт хронометража, закадрового текста и визуальных акцентов',
        'Чистый звук, сведение голоса с эффектами и выпуск мастеров под все площадки'
      ],
      listEn: [
        'Tight editorial pacing engineered to hold viewer attention from the first seconds',
        'Precision timing of voiceover copy and visual accents',
        'Clean dialogue mixing, sound design, and master exports for every platform'
      ],
      tags: ['COMMERCIAL VIDEO', 'SCRIPTWRITING', 'ADOBE SUITE', 'VOICEOVER']
    },
    promo: {
      code: 'SECTOR // PROMOTION, SMM & ANALYTICS',
      titleRu: 'Продвижение и соцсети',
      titleEn: 'Promotion, SMM & Analytics',
      descRu: 'Разработка плана вывода продукта в массовую индустрию, автономное ведение соцсетей и рекламных кампаний, сквозная аналитика трафика, удержания и продаж.',
      descEn: 'Mass-market product rollout planning, autonomous social media and ad campaign management, and end-to-end traffic, retention, and sales analytics.',
      listRu: [
        'Пошаговый план продвижения продукта: оффер, креативы, посевы и таргет',
        'Бесперебойный выпуск контента и ведение каналов бренда без ручного микроконтроля',
        'Оценка результатов по цифрам: CTR, стоимость лида (CPL), конверсия в заказ и ROMI'
      ],
      listEn: [
        'Step-by-step product promotion plan: offer, creatives, seeding, and targeted ads',
        'Uninterrupted content release and autonomous channel management',
        'Data-backed evaluation: CTR, cost per lead (CPL), sale conversion, and ROMI'
      ],
      tags: ['PRODUCT PROMOTION', 'SOCIAL MEDIA', 'DATA ANALYTICS', 'INDUSTRY']
    },
    tech: {
      code: 'SECTOR // 3D, WEB & APPLIED AI',
      titleRu: 'Технологии, 3D и AI',
      titleEn: 'Technologies, 3D & Applied AI',
      descRu: 'Разработка интерактивных сайтов с 3D-графикой (WebGL), моделирование объектов в Blender и Unreal Engine 5, рабочие пайплайны на базе ИИ-моделей и настройка сложных систем ПК.',
      descEn: 'Interactive WebGL website development, 3D modeling in Blender and Unreal Engine 5, production AI pipelines, and advanced PC workstation configuration.',
      listRu: [
        'Создание и выкладка быстрых продуктовых сайтов с 3D-сценами и анимацией',
        'Твердотельное 3D-моделирование, PBR-материалы и рендер упаковки и продуктов',
        'Практическая связка LLM, видео- и аудио-нейросетей с классическим продакшеном'
      ],
      listEn: [
        'Building and deploying fast product websites with 3D scenes and custom motion',
        'Hard-surface 3D modeling, PBR shaders, and product/packaging rendering',
        'Combining LLMs, generative video, and audio AI with traditional production'
      ],
      tags: ['WEBGL & SITES', '3D MODELING', 'APPLIED AI', 'TECHNICAL PC']
    },
    ops: {
      code: 'SECTOR // SYSTEMS, 1C & MONITORING',
      titleRu: 'Управление, 1С и учёт',
      titleEn: 'Systems, 1C & Monitoring',
      descRu: 'Построение рабочих процессов, координация команды, учёт ресурсов и бюджетов, прикладная работа в 1С и контроль сроков по графикам и тайм-трекингу.',
      descEn: 'Workflow structuring, team coordination, resource and budget accounting, hands-on 1C work, and schedule tracking via charts and time logs.',
      listRu: [
        'Прозрачная структура задач, папок и регламентов без хаоса и простоев',
        'Использование базы 1С и сводных таблиц для учёта номенклатуры, смет и отчётности',
        'Мониторинг загрузки команды, таймингов и выполнения плана по диаграммам'
      ],
      listEn: [
        'Clear task, folder, and SOP structure without chaos or downtime',
        'Using 1C and pivot sheets to track nomenclature, budgets, and reporting',
        'Monitoring team workload, timing, and schedule adherence via charts'
      ],
      tags: ['WORKFLOW SYSTEMS', '1C BASE', 'TIME-TRACKING', 'ACCOUNTING']
    }
  };

  let activeSkillIdx = -1;
  let activeCatFilter = 'all';
  const skillCards = $$('.ph-skill-card');
  const filterBtns = $$('[data-skill-filter]');
  const elSkillPanel = $('#skill-detail-panel');
  const elSkillCode = $('#skill-detail-code');
  const elSkillTitle = $('#skill-detail-title');
  const elSkillDesc = $('#skill-detail-desc');
  const elSkillList = $('#skill-detail-list');
  const elSkillTags = $('#skill-detail-tags');

  function updateDetailPanelDOM(specObj, smoothFade = false) {
    const ru = curLang === 'ru';
    const write = () => {
      if (elSkillCode) elSkillCode.textContent = ru ? `КОМПЕТЕНЦИЯ // ${(specObj.shortRu || specObj.titleRu).toUpperCase()}` : specObj.code;
      if (elSkillTitle) elSkillTitle.textContent = window.DossierSite.translate(ru ? specObj.titleRu : specObj.titleEn,curLang);
      if (elSkillDesc) elSkillDesc.textContent = window.DossierSite.translate(ru ? specObj.descRu : specObj.descEn,curLang);
      if (elSkillList) {
        const arr = ru ? specObj.listRu : specObj.listEn;
        elSkillList.innerHTML = arr.map(item => `<li>${window.DossierSite.translate(item,curLang)}</li>`).join('');
      }
      if (elSkillTags) {
        elSkillTags.innerHTML = specObj.tags.map(t => `<span>${window.DossierSite?.translate(t,curLang) || t}</span>`).join('');
      }
    };
    if (smoothFade && elSkillPanel) {
      elSkillPanel.classList.add('is-switching');
      setTimeout(() => {
        write();
        elSkillPanel.classList.remove('is-switching');
      }, 160);
    } else {
      write();
    }
  }

  function renderSkillDetail(idx, smoothFade = false) {
    activeSkillIdx = clamp(idx, 0, SKILLS_DATA.length - 1);
    skillCards.forEach((c, i) => c.classList.toggle('is-active', i === activeSkillIdx));
    updateDetailPanelDOM(SKILLS_DATA[activeSkillIdx], smoothFade);
  }

  const skillsSecEl = $('.ph-skills');
  const skillFilterGroup = $('#skill-filter-group');
  const skillLiquidPill = $('#ph-skill-liquid-pill');
  const skillLiquidHover = $('#ph-skill-liquid-hover');
  let prevSkillPillLeft = null;
  let skillPillStretchTimer = 0;

  function syncSkillLiquidPill(animateStretch = true) {
    if (!skillFilterGroup || !skillLiquidPill) return;
    const activeBtn = filterBtns.find(b => b.classList.contains('is-active')) || filterBtns[0];
    if (!activeBtn) return;
    const x = activeBtn.offsetLeft;
    const w = activeBtn.offsetWidth;
    if (w < 10) return;

    skillLiquidPill.style.setProperty('--pill-x', `${x}px`);
    skillLiquidPill.style.setProperty('--pill-w', `${w}px`);
    if (isMobileViewport()) {
      centerScrollableButton(skillFilterGroup, activeBtn, animateStretch);
    }

    if (animateStretch && prevSkillPillLeft !== null && Math.abs(x - prevSkillPillLeft) > 4) {
      skillLiquidPill.style.setProperty('--glint-x', x > prevSkillPillLeft ? '48%' : '-48%');
      skillLiquidPill.classList.add('is-stretching');
      clearTimeout(skillPillStretchTimer);
      skillPillStretchTimer = setTimeout(() => {
        skillLiquidPill.style.setProperty('--glint-x', '0%');
        skillLiquidPill.classList.remove('is-stretching');
      }, 220);
    }
    prevSkillPillLeft = x;
  }

  if (skillFilterGroup && skillLiquidHover) {
    filterBtns.forEach(btn => {
      btn.addEventListener('pointerenter', () => {
        const x = btn.offsetLeft;
        const w = btn.offsetWidth;
        skillLiquidHover.style.setProperty('--hover-x', `${x}px`);
        skillLiquidHover.style.setProperty('--hover-w', `${w}px`);
        skillLiquidHover.style.setProperty('--hover-op', btn.classList.contains('is-active') ? '0' : '1');
      });
    });
    skillFilterGroup.addEventListener('pointerleave', () => {
      skillLiquidHover.style.setProperty('--hover-op', '0');
    });
  }

  function applyCategoryFilter(cat, smoothFade = true) {
    activeCatFilter = cat;
    activeSkillIdx = -1;
    filterBtns.forEach(b => {
      const on = b.dataset.skillFilter === cat;
      b.classList.toggle('is-active', on);
    });
    if (skillLiquidPill) skillLiquidPill.style.setProperty('--cat-p', '0');
    syncSkillLiquidPill(smoothFade);
    if (skillLiquidHover) skillLiquidHover.style.setProperty('--hover-op', '0');
    skillCards.forEach(card => {
      const match = cat === 'all' || card.dataset.cat === cat;
      card.classList.remove('is-active');
      card.classList.toggle('is-dimmed', !match);
      card.classList.toggle('is-cat-highlighted', cat !== 'all' && match);
    });
    const spec = SECTOR_SPECS[cat] || SECTOR_SPECS.all;
    updateDetailPanelDOM(spec, smoothFade);
  }

  refreshSkillsLang = () => {
    if (activeSkillIdx >= 0) {
      renderSkillDetail(activeSkillIdx, false);
    } else {
      updateDetailPanelDOM(SECTOR_SPECS[activeCatFilter] || SECTOR_SPECS.all, false);
    }
    requestAnimationFrame(() => syncSkillLiquidPill(false));
  };

  // Timeline auto-switching of category tabs (smoothly flips from tab to tab without individual card blinking)
  const CAT_ORDER = ['all', 'media', 'promo', 'tech', 'ops'];
  const CAT_DURATION = 2.8; // smooth timeline cadence per category tab
  let catElapsed = 0;
  let skillsManualPauseUntil = 0;

  function stepSkillsAutoCycle(dt, isCurrentSlide) {
    if (!isCurrentSlide || isMobileViewport()) return;
    if (performance.now() < skillsManualPauseUntil) return;
    if (isMobileViewport() && skillsSecEl && skillsSecEl.scrollTop > 48) return;

    catElapsed += dt;
    const progressRatio = clamp(catElapsed / CAT_DURATION, 0, 1);
    if (skillLiquidPill) skillLiquidPill.style.setProperty('--cat-p', progressRatio.toFixed(3));

    if (catElapsed >= CAT_DURATION) {
      catElapsed = 0;
      const curPos = CAT_ORDER.indexOf(activeCatFilter);
      const nextCat = CAT_ORDER[(curPos + 1) % CAT_ORDER.length];
      applyCategoryFilter(nextCat, true);
    }
  }

  skillCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      skillsManualPauseUntil = performance.now() + (isMobileViewport() ? 14000 : 5000);
      renderSkillDetail(idx, true);
      if (isMobileViewport() && elSkillPanel) {
        try { elSkillPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
      }
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillsManualPauseUntil = performance.now() + (isMobileViewport() ? 10000 : 4500);
      catElapsed = 0;
      applyCategoryFilter(btn.dataset.skillFilter, true);
    });
  });

  /* ---------------- 4. DUAL-TERMINAL 16:9 MONITOR -> 9:16 PHONE VIDEO ENGINE (SILENT, FRAME-LOCKED) ---------------- */
  const AD_PROJECTS = [
    {
      id: 0,
      codeRu: 'ВИДЕОПРОЕКТ // КРЕМЛЬ (FOV)',
      codeEn: 'ACTIVE EXPOSITION // KREMLIN (FOV)',
      titleRu: 'Кремль (FOV) — динамичное видео от первого лица в центре Москвы',
      titleEn: 'Kremlin (FOV) — Dynamic First-Person Video in Moscow Center',
      wideTitleRu: 'Кремль (FOV) — 16:9 Оригинал',
      wideTitleEn: 'Kremlin (FOV) — 16:9 Master',
      vertTitleRu: 'Кремль (FOV) — 9:16 Адаптация',
      vertTitleEn: 'Kremlin (FOV) — 9:16 Vertical',
      descRu: 'Ролик «Кремль (FOV)» с перспективой от первого лица в центре Москвы: кадр открывается с акцента на часах на руке и переходит к виду на Кремль, Красную площадь и Кремлёвскую набережную. Оба экрана (16:9 и 9:16) воспроизводят поток кадр-в-кадр в полной синхронизации.',
      descEn: '“Kremlin (FOV)” first-person video in the center of Moscow: the frame opens on the wristwatch and transitions to the view of the Kremlin, Red Square, and the Kremlin embankment. Both screens (16:9 and 9:16) play the stream frame-by-frame in full sync.',
      srcVert: './assets/ad3_vert.mp4?v=hq2',
      srcWide: './assets/ad3_wide.mp4?v=hq2',
      poster: './assets/poster_ad3.jpg?v=hq2',
      keyStart: 0.0,
      keyEnd: 13.1,
      hotspots: [
        { sec: 0.0, labelRu: '[00:00 Часы на руке]', labelEn: '[00:00 Watch on Wrist]' },
        { sec: 3.0, labelRu: '00:03 Кремль и площадь', labelEn: '00:03 Kremlin & Square' },
        { sec: 5.7, labelRu: '00:06 Детали / Кофе', labelEn: '00:06 Coffee & Details' },
        { sec: 10.2, labelRu: '00:10 Набережная Кремля', labelEn: '00:10 Kremlin Embankment' }
      ],
      switchCtaRu: 'ПЕРЕКЛЮЧИТЬ НА «ТИЗЕР» НА ОБОИХ ЭКРАНАХ [⇄]',
      switchCtaEn: 'SWITCH TO “TEASER” ON BOTH TERMINALS [⇄]'
    },
    {
      id: 1,
      codeRu: 'ВИДЕОПРОЕКТ // ТИЗЕР',
      codeEn: 'ACTIVE EXPOSITION // TEASER',
      titleRu: 'Тизер — динамический и импульсный видеоряд, снятый для компании Lastword по специальному заказу в рамках рекламной кампании',
      titleEn: 'Teaser — Dynamic & Impulsive Video Sequence Shot for Lastword for an Ad Campaign',
      wideTitleRu: 'Тизер — 16:9 Оригинал',
      wideTitleEn: 'Teaser — 16:9 Master',
      vertTitleRu: 'Тизер — 9:16 Адаптация',
      vertTitleEn: 'Teaser — 9:16 Vertical',
      descRu: 'Концентрированный проект «Тизер» (13.7 секунд): вырезка из полноценного видеопродакшена, где акцент идёт на графическом импульсе кардиомонитора (ЭКГ) и последующем переходе к пробуждению героя в палате. Видеоряд идёт в кадр-в-кадр синхронизации на экранах 16:9 и 9:16.',
      descEn: 'Concentrated “Teaser” cut (13.7 seconds): an excerpt from full video production focusing on the graphic ECG pulse and the transition to the hero awakening in the ward. Frame-accurate sync across 16:9 and 9:16 screens.',
      srcVert: './assets/ad2_vert.mp4?v=hq2',
      srcWide: './assets/ad2_wide.mp4?v=hq2',
      poster: './assets/poster_1024.jpg?v=hq2',
      keyStart: 0.0,
      keyEnd: 13.5,
      hotspots: [
        { sec: 0.0, labelRu: '[00:00 Крупный план и ЭКГ]', labelEn: '[00:00 Close-up & ECG]' },
        { sec: 3.5, labelRu: '00:04 Снятие маски', labelEn: '00:04 Mask Removal' },
        { sec: 7.2, labelRu: '00:07 Уведомление на экране', labelEn: '00:07 Screen Notification' },
        { sec: 10.8, labelRu: '00:11 Чтение со смартфона', labelEn: '00:11 Reading on Phone' }
      ],
      switchCtaRu: 'ПЕРЕКЛЮЧИТЬ НА «СЮЖЕТНЫЙ РОЛИК» НА ОБОИХ ЭКРАНАХ [⇄]',
      switchCtaEn: 'SWITCH TO “NARRATIVE VIDEO” ON BOTH TERMINALS [⇄]'
    },
    {
      id: 2,
      codeRu: 'ВИДЕОПРОЕКТ // СЮЖЕТНЫЙ РОЛИК',
      codeEn: 'ACTIVE EXPOSITION // NARRATIVE VIDEO',
      titleRu: 'Сюжетный ролик — городская драматургия и динамика кадра, изготовленная по специальному заказу компании Lastword в рамках рекламной кампании',
      titleEn: 'Narrative Video — Urban Dramaturgy & Frame Dynamics Produced for Lastword for an Ad Campaign',
      wideTitleRu: 'Сюжетный ролик — 16:9 Оригинал',
      wideTitleEn: 'Narrative Video — 16:9 Master',
      vertTitleRu: 'Сюжетный ролик — 9:16 Адаптация',
      vertTitleEn: 'Narrative Video — 9:16 Vertical',
      descRu: 'Небольшой отрывок «Сюжетный ролик» с выверенной драматургией: выход из интерьера, работа с мобильным устройством и переход в городскую среду. Экспозиция открывается выходом из домашней среды, переход сделан синхронно и точно.',
      descEn: 'Short “Narrative Video” excerpt with precise dramaturgy: departure from the interior, mobile device interaction, and transition into the urban environment. Exposition opens from the home interior with a synchronous, accurate cut.',
      srcVert: './assets/ad1_vert.mp4?v=hq2',
      srcWide: './assets/ad1_wide.mp4?v=hq2',
      poster: './assets/poster_00_16_compressed_smaller_h264.jpg?v=hq2',
      keyStart: 0.0,
      keyEnd: 8.95,
      hotspots: [
        { sec: 0.0, labelRu: '[00:00 Выход / Смартфон]', labelEn: '[00:00 Departure / Phone]' },
        { sec: 2.2, labelRu: '00:02 Переход во двор', labelEn: '00:02 Courtyard Cut' },
        { sec: 4.8, labelRu: '00:05 Панорама фасада', labelEn: '00:05 Facade Panorama' },
        { sec: 7.2, labelRu: '00:07 Финальный план', labelEn: '00:07 Final Shot' }
      ],
      switchCtaRu: 'ВЕРНУТЬСЯ К РОЛИКУ «КРЕМЛЬ (FOV)» НА ОБОИХ ЭКРАНАХ [⇄]',
      switchCtaEn: 'SWITCH BACK TO “KREMLIN (FOV)” [⇄]'
    }
  ];

  const morphStage = $('#morph-video-stage');
  const videoWide = $('#video-wide');
  const videoVert = $('#video-vert');
  const sourceWide = $('#source-wide');
  const sourceVert = $('#source-vert');
  const wideHudTitle = $('#wide-hud-title');
  const wideTimeTag = $('#wide-time-tag');
  const vertHudTag = $('#vert-hud-tag');
  const vertHudSub = $('#vert-hud-sub');
  const wideTitleEl = $('#wide-title');
  const vertTitleEl = $('#vert-title');
  const briefCaseId = $('#brief-case-id');
  const briefCaseTitle = $('#brief-case-title');
  const briefCaseDesc = $('#brief-case-desc');
  const hotspotBtnsWrap = $('#hotspot-btns');
  const snapSwitchBtn2 = $('#snap-switch-btn-2');
  const highlightModeBtn = $('#toggle-highlight-mode');

  let curAdIdx = 0;
  let highlightMode = false;
  let emergeTimer = 0;
  let videoSlideEnteredOnce = false;
  let syncSeekToken = 0;

  function formatTimecode(sec) {
    const s = Math.max(0, Math.floor(sec || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function isTimeSeekable(vid, targetSec) {
    if (!vid) return false;
    if (targetSec <= 0.05) return vid.readyState >= 1;
    if (!vid.seekable || vid.seekable.length === 0) return false;
    for (let i = 0; i < vid.seekable.length; i++) {
      if (targetSec >= vid.seekable.start(i) - 0.1 && targetSec <= vid.seekable.end(i) + 0.1) {
        return true;
      }
    }
    return false;
  }

  function waitVideoCanPlayAt(vid, targetSec, token) {
    return new Promise(resolve => {
      if (!vid) { resolve(); return; }
      vid.muted = true;
      vid.playbackRate = 1.0;

      const applySeek = () => {
        if (token !== syncSeekToken) { resolve(); return; }
        if (Math.abs((vid.currentTime || 0) - targetSec) > 0.04) {
          try { vid.currentTime = targetSec; } catch (_) {}
        }
        if (!vid.seeking && vid.readyState >= 3) {
          resolve();
          return;
        }
        const onReady = () => {
          if (!vid.seeking && vid.readyState >= 2) {
            cleanup();
            resolve();
          }
        };
        const cleanup = () => {
          vid.removeEventListener('seeked', onReady);
          vid.removeEventListener('canplay', onReady);
          clearTimeout(fallbackTimer);
        };
        const fallbackTimer = setTimeout(() => {
          cleanup();
          resolve();
        }, 420);
        vid.addEventListener('seeked', onReady);
        vid.addEventListener('canplay', onReady);
      };

      if (vid.readyState >= 1 && isTimeSeekable(vid, targetSec)) {
        applySeek();
      } else {
        const onLoaded = () => {
          if (vid.readyState >= 1 && isTimeSeekable(vid, targetSec)) {
            vid.removeEventListener('loadeddata', onLoaded);
            vid.removeEventListener('canplay', onLoaded);
            vid.removeEventListener('progress', onLoaded);
            clearTimeout(loadTimeout);
            applySeek();
          }
        };
        const loadTimeout = setTimeout(() => {
          vid.removeEventListener('loadeddata', onLoaded);
          vid.removeEventListener('canplay', onLoaded);
          vid.removeEventListener('progress', onLoaded);
          applySeek();
        }, 700);
        vid.addEventListener('loadeddata', onLoaded);
        vid.addEventListener('canplay', onLoaded);
        vid.addEventListener('progress', onLoaded);
      }
    });
  }

  function syncBothVideosTo(timeSec) {
    const token = ++syncSeekToken;
    const target = Math.max(0, Number(timeSec) || 0);
    if (videoWide) { videoWide.muted = true; videoWide.pause(); }
    if (videoVert) { videoVert.muted = true; videoVert.pause(); }

    Promise.all([
      waitVideoCanPlayAt(videoWide, target, token),
      waitVideoCanPlayAt(videoVert, target, token)
    ]).then(() => {
      if (token !== syncSeekToken) return;
      if (videoWide) {
        videoWide.muted = true;
        videoWide.playbackRate = 1.0;
        videoWide.play()?.catch?.(() => {});
      }
      if (videoVert) {
        requestAnimationFrame(() => {
          if (token !== syncSeekToken || targetIdx !== 2) return;
          videoVert.muted = true;
          videoVert.playbackRate = 1.0;
          videoVert.play()?.catch?.(() => {});
        });
      }
    });
  }

  function updateHotspotButtons() {
    const p = AD_PROJECTS[curAdIdx];
    const ru = curLang === 'ru';
    if (!hotspotBtnsWrap) return;
    hotspotBtnsWrap.innerHTML = p.hotspots.map((h, i) => {
      const active = Math.abs(h.sec - p.keyStart) < 1.5 ? ' class="is-active"' : '';
      return `<button data-seek="${h.sec}" data-hidx="${i}" type="button"${active}>${ru ? h.labelRu : h.labelEn}</button>`;
    }).join('');
    $$('button[data-seek]', hotspotBtnsWrap).forEach(btn => {
      btn.addEventListener('click', () => {
        const sec = parseFloat(btn.dataset.seek || '0');
        $$('button[data-seek]', hotspotBtnsWrap).forEach(b => b.classList.toggle('is-active', b === btn));
        syncBothVideosTo(sec);
      });
    });
  }

  function updateVideoCopy() {
    const p = AD_PROJECTS[curAdIdx];
    const ru = curLang === 'ru';
    if (briefCaseId) briefCaseId.textContent = ru ? p.codeRu : p.codeEn;
    if (briefCaseTitle) briefCaseTitle.textContent = ru ? p.titleRu : p.titleEn;
    if (briefCaseDesc) briefCaseDesc.textContent = ru ? p.descRu : p.descEn;
    if (wideTitleEl) wideTitleEl.textContent = ru ? p.wideTitleRu : p.wideTitleEn;
    if (vertTitleEl) vertTitleEl.textContent = ru ? p.vertTitleRu : p.vertTitleEn;
    if (wideHudTitle) wideHudTitle.textContent = ru ? '16:9 ГОРИЗОНТАЛЬНОЕ ВИДЕО' : '16:9 DESKTOP MASTER';
    if (vertHudTag) vertHudTag.textContent = ru ? '9:16 ВЕРТИКАЛЬНОЕ ВИДЕО' : '9:16 MOBILE STREAM';
    if (snapSwitchBtn2) snapSwitchBtn2.innerHTML = `<span>${ru ? p.switchCtaRu : p.switchCtaEn}</span>`;
    $$('[data-video-case]').forEach(b => {
      b.classList.toggle('is-active', parseInt(b.dataset.videoCase, 10) === curAdIdx);
    });
    if (highlightModeBtn) {
      highlightModeBtn.textContent = ru
        ? (highlightMode ? 'РЕЖИМ: КЛЮЧЕВЫЕ КАДРЫ' : 'РЕЖИМ: ПОЛНЫЙ РОЛИК')
        : (highlightMode ? 'MODE: KEY FRAMES' : 'MODE: FULL VIDEO');
      highlightModeBtn.classList.toggle('is-active', highlightMode);
    }
    updateHotspotButtons();
  }
  refreshVideoLang = updateVideoCopy;

  function loadAdProject(idx, withSnapEffect = false) {
    curAdIdx = clamp(idx, 0, AD_PROJECTS.length - 1);
    const p = AD_PROJECTS[curAdIdx];
    const token = ++syncSeekToken;
    if (morphStage) morphStage.dataset.activeAd = String(curAdIdx);

    if (withSnapEffect) {
      document.body.classList.remove('is-snapping');
      requestAnimationFrame(() => {
        document.body.classList.add('is-snapping');
      });
      setTimeout(() => document.body.classList.remove('is-snapping'), 450);
      if (morphStage && morphStage.dataset.choreo !== 'phone-emerge') {
        morphStage.dataset.choreo = 'phone-emerge';
      }
    }

    const startSec = highlightMode ? p.keyStart : 0;
    updateVideoCopy();

    if (videoWide) { videoWide.pause(); videoWide.poster = p.poster; }
    if (videoVert) { videoVert.pause(); videoVert.poster = p.poster; }

    // Never decode or play dual videos while the user is not on Slide 02 (idx === 2)!
    if (targetIdx !== 2 || token !== syncSeekToken) return;

    const wideUrl = p.srcWide;
    const vertUrl = p.srcVert;
    if (videoWide) {
      videoWide.preload = 'auto';
      videoWide.loop = false;
      if (sourceWide && sourceWide.getAttribute('src') !== wideUrl) sourceWide.setAttribute('src', wideUrl);
      if (videoWide.getAttribute('src') !== wideUrl) {
        videoWide.setAttribute('src', wideUrl);
        videoWide.muted = true;
        videoWide.load();
      }
    }
    if (videoVert) {
      videoVert.preload = 'auto';
      videoVert.loop = false;
      if (sourceVert && sourceVert.getAttribute('src') !== vertUrl) sourceVert.setAttribute('src', vertUrl);
      if (videoVert.getAttribute('src') !== vertUrl) {
        videoVert.setAttribute('src', vertUrl);
        videoVert.muted = true;
        videoVert.load();
      }
    }
    syncBothVideosTo(startSec);
  }

  // Restart both 16:9 and 9:16 streams together at loop end without mid-stream playbackRate changes
  videoVert?.addEventListener('ended', () => {
    if (targetIdx !== 2) return;
    const p = AD_PROJECTS[curAdIdx];
    const startSec = highlightMode ? p.keyStart : 0;
    if (startSec === 0 && videoWide && videoVert && videoWide.readyState >= 2 && videoVert.readyState >= 2) {
      try { videoWide.currentTime = 0; } catch (_) {}
      try { videoVert.currentTime = 0; } catch (_) {}
      videoWide.playbackRate = 1.0;
      videoVert.playbackRate = 1.0;
      videoWide.play()?.catch?.(() => {});
      videoVert.play()?.catch?.(() => {});
    } else {
      syncBothVideosTo(startSec);
    }
  });

  // Keep 16:9 and 9:16 streams synchronized at locked 1.0x cadence without fighting the hardware video decoder
  let lastSyncCheckMs = 0;
  let lastHardResyncMs = 0;
  function checkDualVideoSync() {
    if (!videoWide || !videoVert) return;
    const now = performance.now();
    if (now - lastSyncCheckMs < 250) return;
    lastSyncCheckMs = now;

    const p = AD_PROJECTS[curAdIdx];
    const ct = videoVert.currentTime || videoWide.currentTime || 0;
    const tc = formatTimecode(ct);

    if (wideTimeTag) {
      const nextWideText = `${tc} // ${curLang === 'ru' ? (highlightMode ? 'КЛЮЧЕВОЙ ФРАГМЕНТ' : 'ПОЛНОЕ ВИДЕО') : (highlightMode ? 'KEY SEQUENCE' : 'FULL STREAM')}`;
      if (wideTimeTag.__t !== nextWideText) {
        wideTimeTag.__t = nextWideText;
        wideTimeTag.textContent = nextWideText;
      }
    }
    if (vertHudSub) {
      const nextVertText = curLang === 'en'
        ? `${tc} // SYNCED FRAME`
        : `${tc} // СИНХРОННЫЙ КАДР`;
      if (vertHudSub.__t !== nextVertText) {
        vertHudSub.__t = nextVertText;
        vertHudSub.textContent = nextVertText;
      }
    }

    if (highlightMode && ct >= p.keyEnd) {
      syncBothVideosTo(p.keyStart);
      return;
    }

    if (videoWide.playbackRate !== 1.0) videoWide.playbackRate = 1.0;
    if (videoVert.playbackRate !== 1.0) videoVert.playbackRate = 1.0;

    // Only recover from genuine large drift (> 0.55s) away from loop boundaries and with a 3s cooldown
    if (!videoWide.seeking && !videoVert.seeking && !videoVert.ended && !videoWide.ended && videoWide.readyState >= 3 && videoVert.readyState >= 3) {
      const wTime = videoWide.currentTime || 0;
      const vTime = videoVert.currentTime || 0;
      const vDur = videoVert.duration || 0;
      const awayFromLoopEdge = vTime > 0.45 && (!vDur || vTime < vDur - 0.45);
      const absDiff = Math.abs(vTime - wTime);

      if (awayFromLoopEdge && absDiff > 0.55 && (now - lastHardResyncMs > 3000) && isTimeSeekable(videoWide, vTime)) {
        lastHardResyncMs = now;
        try { videoWide.currentTime = vTime; } catch (_) {}
      }

      if (!videoVert.paused && videoWide.paused && (!videoWide.duration || vTime < videoWide.duration - 0.15)) {
        videoWide.play()?.catch?.(() => {});
      }
    }
  }

  // Trigger the Apple Continuity Monitor (16:9) -> iPhone (9:16) emergence from behind the monitor
  let videoStartTimer = 0;
  function runMonitorToPhoneDeployment() {
    if (!morphStage) return;
    clearTimeout(emergeTimer);
    clearTimeout(videoStartTimer);
    morphStage.classList.add('is-choreo-reset');
    morphStage.dataset.choreo = 'monitor-only';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        morphStage.classList.remove('is-choreo-reset');
      });
    });
    // Defer video decoder seek by 200ms so the slide transition itself starts at a locked 120 FPS
    videoStartTimer = setTimeout(() => {
      if (targetIdx !== 2) return;
      loadAdProject(curAdIdx, false);
    }, 200);
    // Hold on the solo 16:9 monitor for ~1 s after the slide has landed, then the phone slides out from behind it
    emergeTimer = setTimeout(() => {
      if (targetIdx !== 2) return;
      morphStage.dataset.choreo = 'phone-emerge';
    }, 1350);
  }

  // Switch between projects on snap trigger
  function triggerSnapSwitch() {
    const nextIdx = (curAdIdx + 1) % AD_PROJECTS.length;
    loadAdProject(nextIdx, true);
  }

  $('#snap-switch-btn')?.addEventListener('click', triggerSnapSwitch);
  $('#snap-switch-btn-2')?.addEventListener('click', triggerSnapSwitch);
  $('#bridge-snap-trigger')?.addEventListener('click', triggerSnapSwitch);
  $('#viewport-wide')?.addEventListener('click', triggerSnapSwitch);
  $('#viewport-vert')?.addEventListener('click', triggerSnapSwitch);

  $$('[data-video-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.videoCase, 10);
      if (idx !== curAdIdx) loadAdProject(idx, true);
    });
  });

  highlightModeBtn?.addEventListener('click', () => {
    highlightMode = !highlightMode;
    const p = AD_PROJECTS[curAdIdx];
    syncBothVideosTo(highlightMode ? p.keyStart : 0);
    updateVideoCopy();
  });

  $('#replay-emerge-btn')?.addEventListener('click', () => {
    runMonitorToPhoneDeployment();
  });

  // Custom local file loaders for 16:9 and 9:16
  $('#upload-wide-input')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || !videoWide) return;
    videoWide.src = URL.createObjectURL(file);
    videoWide.play()?.catch?.(() => {});
    if (morphStage) morphStage.dataset.choreo = 'phone-emerge';
  });
  $('#upload-vert-input')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file || !videoVert) return;
    videoVert.src = URL.createObjectURL(file);
    videoVert.play()?.catch?.(() => {});
    if (morphStage) morphStage.dataset.choreo = 'phone-emerge';
  });

  /* ---------------- 4B. AI ARCHITECTURE, NEURAL THREADS & MULTI-USER ACCOUNT SYSTEM ---------------- */
  const AI_TIER_SPECS = {
    all: {
      code: 'ARCHITECTURE // FULL PRODUCT HIERARCHY',
      titleRu: 'Полная иерархия: от главной задачи до итогового продукта',
      titleEn: 'Complete Product Hierarchy: From Main Objective to Final Product',
      descRu: 'Инженерная система реализации проекта: наверху ставится Главная задача, которая декомпозируется на создание плана, визуализацию, согласование тем, мониторинг, анализ цифр и структуру (1С). Далее разворачивается технический этап (закупка доменов, создание почт и аккаунтов, верификация, выгодные подписки), формирующий единую рабочую систему для команды (>1 чел.). На базе плана пишется первый сценарий, выпускаются ролики под все площадки (Instagram, Telegram, VK Видео, YouTube, Shorts, TikTok) и брендинг (посты, плакаты), которые сходятся в Итоговый продукт.',
      descEn: 'End-to-end engineering system: starting from the Main Task, decomposing into planning, visualization, topic alignment, monitoring, data analysis, and 1C structure, followed by the technical multi-user account stage (>1 person), multi-platform media production, branding, and final product conversion.',
      listRu: [
        'Контур I: Главная задача → План (прямая связь в сценарий), визуализация, темы, мониторинг, анализ и структура',
        'Контур II: Домены, новые почты, закупка и верификация аккаунтов, выгодные подписки → Система для команды (>1 чел.)',
        'Контур III–IV: Первый сценарий из плана → Видео во всех форматах (IG, TG, VK, YT, Shorts, TikTok) + Посты/Брендинг/Плакаты → Итоговый продукт'
      ],
      listEn: [
        'Contour I: Main Task → Plan (direct link to script), visualization, topics, monitoring, analytics, and 1C structure',
        'Contour II: Domains, new emails, account procurement & verification, cost-effective subscriptions → Multi-user system (>1 person)',
        'Contour III–IV: First script from plan → All video formats (IG, TG, VK, YT, Shorts, TikTok) + Posts/Branding/Posters → Final Product'
      ],
      tags: ['ПЛАН → СЦЕНАРИЙ', 'СИСТЕМА >1 ЧЕЛ.', 'МЕДИАХОЛДИНГ', 'ИТОГОВЫЙ ПРОДУКТ']
    },
    '0': {
      code: 'CONTOUR I // ЗАДАЧА · ПЛАН · МОНИТОРИНГ · АНАЛИЗ · СТРУКТУРА',
      titleRu: 'Главная задача, создание плана, мониторинг и структура',
      titleEn: 'Main Task, Master Plan, Monitoring & Operational Structure',
      descRu: 'Верхний аналитический уровень системы: главная задача реализации продукта раскладывается на последовательную цепочку — создание генерального плана, визуализацию концепции, утверждение тем, тайм-трекинг и мониторинг, глубокий анализ графиков и показателей и построение рабочей структуры с опорой на 1С. От узла «Создание плана» идёт прямая линия-связка вниз к «Первому сценарию».',
      descEn: 'Top analytical contour: the main product objective is decomposed into master planning, concept visualization, approved topics, time-tracking/monitoring, numerical analytics, and 1C-backed structure, with a direct link from the Plan to the First Script.',
      listRu: [
        'Создание плана (с прямой сквозной линией-связкой в разработку первого сценария ролика)',
        'Визуализация проекта, фиксация обговорённых тем, тайм-трекинг и мониторинг показателей',
        'Аналитика графиков и показателей и формирование чёткой рабочей структуры (с использованием базы 1С)'
      ],
      listEn: [
        'Master plan creation (with a direct reference link down to the first video script)',
        'Project visualization, approved topics alignment, time-tracking, and metric monitoring',
        'Numerical chart analysis and structured workflow architecture (backed by 1C fundamentals)'
      ],
      tags: ['ГЛАВНАЯ ЗАДАЧА', 'СОЗДАНИЕ ПЛАНА', 'МОНИТОРИНГ И АНАЛИЗ', 'СТРУКТУРА И 1С']
    },
    '1': {
      code: 'CONTOUR II // ТЕХНИЧЕСКИЙ ЭТАП И СИСТЕМА АККАУНТОВ (>1 ЧЕЛ.)',
      titleRu: 'Техническая подготовка и единая система доступов команды',
      titleEn: 'Technical Provisioning & Unified Multi-User Account System',
      descRu: 'Инфраструктурный этап подготовки проекта: закупка доменов, развёртывание новых рабочих почт, создание и регистрация профильных аккаунтов, их установка, почтовая и номерная верификация (2FA), сведение реквизитов в базу данных и подбор оптимальной архитектуры подписок (чтобы система обходилась финансово выгоднее и дешевле). Всё это объединяется в единую рабочую систему для параллельной работы команды (>1 человека).',
      descEn: 'Technical preparation stage: domain procurement, deploying new corporate emails, creating and installing specialized accounts, email/SMS verification, database logging, and cost-optimized subscription pooling—converging into a unified multi-user workspace (>1 person).',
      listRu: [
        'Закупка доменов, создание новых почт (@), регистрация, установка и верификация аккаунтов с базой данных',
        'Финансовая оптимизация подписок и тарифов: максимум мощностей ИИ и продакшена значительно дешевле и выгоднее',
        'Сведение всех узлов в Единую рабочую систему, позволяющую работать над проектом сразу нескольким специалистам (>1 чел.)'
      ],
      listEn: [
        'Domain procurement, new email creation (@), account registration, setup, verification, and credential database',
        'Cost-effective subscription architecture: maximizing AI and production capacity at significantly lower cost',
        'Convergence into a Unified Operational System enabling seamless parallel work for multiple team members (>1 person)'
      ],
      tags: ['ДОМЕНЫ И ПОЧТЫ', 'ВЕРИФИКАЦИЯ И БД', 'ВЫГОДНЫЕ ПОДПИСКИ', 'РАБОТА >1 ЧЕЛ.']
    },
    '2': {
      code: 'CONTOUR III // КРЕАТИВНЫЙ ЭТАП, ВИДЕОФОРМАТЫ И БРЕНДИНГ',
      titleRu: 'Первый сценарий (из плана), мультиформат видео и брендинг',
      titleEn: 'First Script (from Plan), Multi-Platform Video & Branding',
      descRu: 'Креативно-производственный и медиахолдинговый контур: первый сценарий формируется не из воздуха, а по прямой связи из утверждённого плана Контура I. На базе сценария и командной системы ИИ создаётся видеоконтент во всех вариациях с адаптацией под каждую площадку (Instagram, Telegram, VK Видео, YouTube, Shorts, TikTok), а параллельно выпускаются посты, брендинг и плакаты.',
      descEn: 'Creative production & media-holding stage: the first script is derived directly from the approved Plan in Contour I. Video assets are produced and adapted for every platform format alongside parallel social media posts, branding, and posters.',
      listRu: [
        'Первый сценарий напрямую из плана → Контент-мейкинг, AI-синтез, 3D, дикторская озвучка и монтаж в Adobe',
        'Адаптация под все форматы площадок: Instagram (9:16), Telegram, VK Видео (16:9/9:16), YouTube (16:9), Shorts (9:16), TikTok (9:16)',
        'Параллельное ведение соцсетей (особенно Telegram): целевые посты, фирменный брендинг, плакаты и постеры'
      ],
      listEn: [
        'First script linked directly from the Plan → Content creation, AI synthesis, 3D, voiceover, and Adobe editing',
        'Platform-native video formats: Instagram (9:16), Telegram, VK Video (16:9/9:16), YouTube (16:9), Shorts (9:16), TikTok (9:16)',
        'Parallel social media & visual identity (especially Telegram): posts, branding, posters, and key art'
      ],
      tags: ['IG · TG · VK · YT · TIKTOK', 'ФОРМАТЫ 16:9 & 9:16', 'ПОСТЫ В TELEGRAM', 'БРЕНДИНГ И ПЛАКАТЫ']
    },
    '3': {
      code: 'CONTOUR IV // ИТОГОВЫЙ ПРОДУКТ И ПРЯМАЯ ССЫЛКА',
      titleRu: 'Схождение всех потоков в Итоговый продукт',
      titleEn: 'Convergence of All Streams into the Final Product',
      descRu: 'Нижний результирующий узел всей иерархии: все 6 потоков видеодистрибуции (Instagram, Telegram, VK Видео, YouTube, YouTube Shorts, TikTok) и весь контур визуальной упаковки (посты в Telegram, брендинг, плакаты) синхронно ведут аудиторию по прямой ссылке в Итоговый продукт, обеспечивая целевую конверсию и продвижение продукта в индустрию.',
      descEn: 'Bottom target node of the hierarchy: all 6 video distribution channels and all visual branding/post streams converge via direct links into the Final Product, driving targeted industry promotion and conversion.',
      listRu: [
        'Единая точка конверсии: каждый видеоролик (16:9 и 9:16), пост и плакат работает на прямую ссылку Итогового продукта',
        'Полная связность цепочки: от Главной задачи, плана и учёта 1С до командных аккаунтов, медиахолдинга и результата',
        'Системный вывод и продвижение конкретного продукта в индустрию с прозрачной аналитикой цифр'
      ],
      listEn: [
        'Single conversion target: every video asset (16:9 & 9:16), post, and poster drives traffic directly to the Final Product link',
        'Complete end-to-end traceability: from Main Task, Plan, and 1C structure to multi-user accounts, media holding, and product',
        'Systematic industry product rollout backed by transparent numerical analytics'
      ],
      tags: ['ИТОГОВЫЙ ПРОДУКТ', 'ПРЯМАЯ ССЫЛКА', 'КОНВЕРСИЯ ТРАФИКА', 'ВЫВОД В ИНДУСТРИЮ']
    }
  };

  let activeAiTier = 'all';
  const aiBlueprintStage = $('#ai-blueprint-stage');
  const aiTierBtns = $$('[data-ai-tier]');
  const aiNodes = $$('[data-node-tier]');
  const elAiTooltip = $('#ai-hover-tooltip');
  const elAiTipRole = $('#ai-tip-role');
  const elAiTipTitle = $('#ai-tip-title');
  const elAiTipDesc = $('#ai-tip-desc');

  const aiTierTabsEl = $('#ai-tier-tabs');
  function applyAiTier(tier) {
    activeAiTier = String(tier);
    if (aiBlueprintStage) aiBlueprintStage.dataset.activeTier = activeAiTier;
    let activeTierBtn = null;
    aiTierBtns.forEach(b => {
      const on = b.dataset.aiTier === activeAiTier;
      b.classList.toggle('is-active', on);
      if (on) activeTierBtn = b;
      else b.style.setProperty('--cat-p', '0');
    });
    if (isMobileViewport() && activeTierBtn) {
      centerScrollableButton(aiTierTabsEl, activeTierBtn, true);
    }
  }

  const AI_TIER_ORDER = ['all', '0', '1', '2', '3'];
  const AI_TIER_DURATION = 3.4;
  let aiElapsed = 0;
  let aiManualPauseUntil = 0;
  const aiPageStage = $('#ai-page-stage');

  function clearStageReadyTimers(stageEl) {
    if (!stageEl || !stageEl.__readyTimers) return;
    while (stageEl.__readyTimers.length) {
      clearTimeout(stageEl.__readyTimers.pop());
    }
  }

  function finishBlueprintFlyIn(stageEl) {
    if (!stageEl) return;
    clearStageReadyTimers(stageEl);
    stageEl.classList.remove('is-fly-reset', 'is-fly-running');
    $$('.bp-node', stageEl).forEach(node => {
      node.__readyAt = 0;
      node.classList.remove('is-fly-pending');
    });
  }

  function finishTechStagedReveal() {
    finishBlueprintFlyIn(aiBlueprintStage);
  }

  // Assigns strictly sequential process-flow intervals & smooth motion-video vectors to all blocks & wires
  function prepareBlueprintFlyInSchedule(stageEl) {
    if (!stageEl) return;
    const nodes = $$('.bp-node', stageEl);

    if (stageEl.id === 'ai-blueprint-stage') {
      // STRICT SEQUENTIAL PROCESS ORDER FOR TECHNOLOGIES PAGE 1 (#ai-blueprint-stage)
      // Every node and wire is scheduled strictly along the causal workflow chain:
      // Root -> Level I (1..6 left-to-right) -> Level II (Instructions -> Proxy -> Account Hub -> 4 Capsules top-to-bottom -> Setup -> DB -> Benefit) -> Level III (Unified Tool Base) -> Left Bypass + Level IV (Video -> Formats -> Posts/Branding -> Final Product) -> Bottom Exit Links
      const STEP = 0.052;

      const classifyTech1Node = (x, y) => {
        // Directional Apple fly-in vectors matching AI tab: left blocks fly from left (-38px), center from bottom-center (0px), right from right (+38px)
        const dirX = x < 500 ? -38 : (x > 940 ? 38 : 0);
        // 0. Top Root: Главная задача (y=14)
        if (y < 80) return { order: 0, fx: 0, fy: -24 };
        // 1..6. Level I: 6 planning blocks (y=106, x=76..1326)
        if (y < 200) {
          const colIdx = Math.round((x - 76) / 250); // 0..5
          return { order: 1 + clamp(colIdx, 0, 5), fx: dirX, fy: 18 };
        }
        // Left vertical bypass badge "ПЛАН → ГЕНЕРАЦИЯ" (x=20, y=330) — animates right before Level IV!
        if (x < 50) {
          return { order: 18, fx: -36, fy: 20 };
        }
        // 7..16. Level II: Technical & Account Provisioning (y=218..414)
        if (y < 450) {
          if (x < 320) {
            return { order: y < 300 ? 7 : 8, fx: -38, fy: 20 };
          }
          if (x < 680) {
            return { order: 9, fx: -24, fy: 22 };
          }
          if (x < 1020) {
            const capIdx = clamp(Math.round((y - 218) / 58), 0, 3);
            return { order: 10 + capIdx, fx: 0, fy: 18 };
          }
          if (x < 1300) {
            return { order: y < 300 ? 14 : 15, fx: 32, fy: 20 };
          }
          return { order: 16, fx: 40, fy: 20 };
        }
        // 17. Level III: Единая база инструментов (x=426, y=480)
        if (y < 580) {
          return { order: 17, fx: 0, fy: 26 };
        }
        // 19..22. Level IV main blocks (y=614, x=76, 356, 956, 1256)
        if (y < 695) {
          if (x < 250) return { order: 19, fx: -38, fy: 22 };
          if (x < 700) return { order: 20, fx: -18, fy: 22 };
          if (x < 1150) return { order: 21, fx: 24, fy: 22 };
          return { order: 22, fx: 38, fy: 22 };
        }
        // 23..24. Bottom exit badges to Page 2 (y=704)
        return { order: x < 600 ? 23 : 24, fx: x < 600 ? -24 : 24, fy: 16 };
      };

      let maxDelay = 0;
      nodes.forEach(node => {
        if (!node.dataset.goto) {
          node.removeAttribute('tabindex');
          node.removeAttribute('role');
        }
        const rect = node.querySelector('rect');
        const x = parseFloat(rect?.getAttribute('x') || '700');
        const y = parseFloat(rect?.getAttribute('y') || '200');
        const { order, fx, fy } = classifyTech1Node(x, y);
        const d = 0.04 + order * STEP;
        if (d > maxDelay) maxDelay = d;
        node.__flyDelaySec = d;
        node.style.setProperty('--fly-x', `${fx}px`);
        node.style.setProperty('--fly-y', `${fy}px`);
        node.style.setProperty('--fly-delay', `${d.toFixed(3)}s`);
      });

      // Schedule every wire strictly by its TARGET block arrival (targetOrder - 0.15) so no wire or port ever hangs in empty space
      const classifyTech1WireOrder = dStr => {
        const s = (dStr || '').replace(/\s+/g, ' ').trim();
        if (s.startsWith('M 806 64')) return 0.85;
        if (s.startsWith('M 286 142')) return 1.85;
        if (s.startsWith('M 536 142')) return 2.85;
        if (s.startsWith('M 786 142')) return 3.85;
        if (s.startsWith('M 1036 142')) return 4.85;
        if (s.startsWith('M 1286 142')) return 5.85;
        if (s.startsWith('M 1431 178')) return 6.85;
        if (s.startsWith('M 192 312')) return 7.85;
        if (s.startsWith('M 308 272') || s.startsWith('M 308 382')) return 8.85;
        if (s.includes('240') && s.startsWith('M 640 327')) return 9.85;
        if (s.includes('298') && s.startsWith('M 640 327')) return 10.85;
        if (s.includes('356') && s.startsWith('M 640 327')) return 11.85;
        if (s.includes('414') && s.startsWith('M 640 327')) return 12.85;
        if (s.startsWith('M 994 240') || s.startsWith('M 994 298')) return 13.85;
        if (s.startsWith('M 994 356') || s.startsWith('M 994 414')) return 14.85;
        if (s.startsWith('M 1276')) return 15.85;
        if (s.startsWith('M 1436 391')) return 16.85;
        if (s.startsWith('M 76 142') || s.startsWith('M 540 564')) return 18.85;
        if (s.startsWith('M 316 652') || s.startsWith('M 636 564')) return 19.85;
        if (s.startsWith('M 916 652') || s.startsWith('M 1086 564')) return 20.85;
        if (s.startsWith('M 1216 652')) return 21.85;
        if (s.startsWith('M 196 690')) return 22.85;
        if (s.startsWith('M 1086 690')) return 23.85;
        return 10.0;
      };

      $$('.bp-wire, .bp-carrier', stageEl).forEach(el => {
        const wOrder = classifyTech1WireOrder(el.getAttribute('d'));
        const wDelay = 0.04 + wOrder * STEP;
        el.__wireOrder = wOrder;
        el.__wireDelaySec = wDelay;
        el.style.setProperty('--wire-delay', `${wDelay.toFixed(3)}s`);
      });

      $$('[data-tier-guide]', stageEl).forEach(el => {
        const tGuide = parseInt(el.getAttribute('data-tier-guide') || '0', 10);
        const guideOrders = [0.4, 6.6, 16.6, 18.2];
        const gOrder = guideOrders[clamp(tGuide, 0, 3)];
        const gDelay = 0.04 + gOrder * STEP;
        el.style.setProperty('--wire-delay', `${gDelay.toFixed(3)}s`);
      });

      stageEl.__maxFlyDurationMs = Math.round((maxDelay + 0.65) * 1000);
      return;
    }

    // STRICT SEQUENTIAL STEP-BY-STEP SCHEDULE FOR TECHNOLOGIES PAGE 2 (#ai-page-stage)
    // Animates both Schema A (Left) and Schema B (Right) strictly along their numbered stages:
    // 0: Top Headers -> 1..6: Stages 01..06 in causal sequence -> 7: Stage 07 -> 8: Stage 08 -> 9: Unified Output -> 10: Exit Badge
    const STEP_P2 = 0.072;

    const classifyTech2NodeOrder = (x, y) => {
      if (y < 95) return 0; // Top Headers (Схема А & Схема Б)
      if (y < 460) {
        if (x < 800) {
          const isRightCol = x > 350;
          const row = y < 200 ? 0 : (y < 320 ? 1 : 2);
          return isRightCol ? (4 + row) : (1 + row);
        }
        const isRightColB = x > 1100;
        const rowB = y < 200 ? 0 : (y < 320 ? 1 : 2);
        return 1 + rowB * 2 + (isRightColB ? 1 : 0);
      }
      if (y < 565) return 7; // Stage 07 (y=480)
      if (y < 650) return 8; // Stage 08 (y=588)
      if (y < 710) return 9; // Unified Release (y=666)
      return 10;             // Bottom Exit Badge (y=728)
    };

    let maxDelay = 0;
    nodes.forEach(node => {
      if (!node.dataset.goto) {
        node.removeAttribute('tabindex');
        node.removeAttribute('role');
      }
      const rect = node.querySelector('rect');
      const x = parseFloat(rect?.getAttribute('x') || '700');
      const y = parseFloat(rect?.getAttribute('y') || '200');
      const order = classifyTech2NodeOrder(x, y);
      const d = 0.04 + order * STEP_P2;
      if (d > maxDelay) maxDelay = d;

      // Left schema (Схема А) flies in from left (-36px), Right schema (Схема Б) flies in from right (+36px), bottom unified hub emerges from center (0px, 24px)
      const fx = y > 650 ? 0 : (x < 780 ? -36 : 36);
      const fy = y < 95 ? -18 : 22;

      node.__flyDelaySec = d;
      node.style.setProperty('--fly-x', `${fx}px`);
      node.style.setProperty('--fly-y', `${fy}px`);
      node.style.setProperty('--fly-delay', `${d.toFixed(3)}s`);
    });

    const classifyTech2WireOrder = dStr => {
      const s = (dStr || '').replace(/\s+/g, ' ').trim();
      if (s.startsWith('M 196 0') || s.startsWith('M 1086 0')) return 0.05;
      if (s.startsWith('M 420 102') && s.endsWith('232 132')) return 0.85;
      if (s.startsWith('M 420 102') && s.endsWith('608 132')) return 3.85;
      if (s.startsWith('M 232 214')) return 1.85;
      if (s.startsWith('M 232 330')) return 2.85;
      if (s.startsWith('M 232 446')) return 6.85;
      if (s.startsWith('M 608 214')) return 4.85;
      if (s.startsWith('M 608 330')) return 5.85;
      if (s.startsWith('M 608 446')) return 6.85;

      if (s.startsWith('M 1180 102') && s.endsWith('992 132')) return 0.85;
      if (s.startsWith('M 1180 102') && s.endsWith('1368 132')) return 1.85;
      if (s.startsWith('M 992 214')) return 2.85;
      if (s.startsWith('M 1368 214')) return 3.85;
      if (s.startsWith('M 992 330')) return 4.85;
      if (s.startsWith('M 1368 330')) return 5.85;
      if (s.startsWith('M 992 446') || s.startsWith('M 1368 446')) return 6.85;

      if (s.startsWith('M 420 562') || s.startsWith('M 1180 562')) return 7.85;
      if (s.startsWith('M 420 644') || s.startsWith('M 1180 644')) return 8.85;
      if (s.startsWith('M 800 720')) return 9.85;
      return 5.0;
    };

    $$('.bp-wire, .bp-carrier', stageEl).forEach(el => {
      const wOrder = classifyTech2WireOrder(el.getAttribute('d'));
      const wDelay = 0.04 + wOrder * STEP_P2;
      el.__wireOrder = wOrder;
      el.__wireDelaySec = wDelay;
      el.style.setProperty('--wire-delay', `${wDelay.toFixed(3)}s`);
    });

    $$('[data-tier-guide]', stageEl).forEach(el => {
      el.style.setProperty('--wire-delay', '0.040s');
    });

    stageEl.__maxFlyDurationMs = Math.round((maxDelay + 0.65) * 1000);
  }

  function triggerBlueprintFlyIn(stageEl) {
    if (!stageEl) return;
    $$('.ph-bp-tooltip').forEach(tip => tip.classList.remove('is-visible'));
    clearStageReadyTimers(stageEl);
    stageEl.__readyTimers = [];

    const now = performance.now();
    $$('.bp-node', stageEl).forEach(node => {
      const delaySec = node.__flyDelaySec || 0;
      const unlockMs = Math.round((delaySec + 0.52) * 1000);
      node.__readyAt = now + unlockMs;
      node.classList.add('is-fly-pending');
      stageEl.__readyTimers.push(setTimeout(() => {
        node.classList.remove('is-fly-pending');
      }, unlockMs));
    });

    stageEl.classList.remove('is-fly-running');
    stageEl.classList.add('is-fly-reset');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        stageEl.classList.remove('is-fly-reset');
        stageEl.classList.add('is-fly-running');
      });
    });

    const totalMs = stageEl.__maxFlyDurationMs || 1800;
    if (stageEl === aiBlueprintStage) {
      aiManualPauseUntil = performance.now() + totalMs + 1000;
    }
  }

  // Convert industrial 90° polyline schematics into Apple Keynote / Apple Silicon Fluid Conduits & Liquid Glass Bento Modules
  function smoothSvgPathToAppleFluid(dStr) {
    if (!dStr) return dStr;
    const tokens = dStr.trim().replace(/,/g, ' ').split(/\s+/);
    const pts = [];
    let i = 0;
    while (i < tokens.length) {
      const cmd = tokens[i];
      if (cmd === 'M' || cmd === 'L') {
        const x = parseFloat(tokens[i + 1]);
        const y = parseFloat(tokens[i + 2]);
        if (!Number.isNaN(x) && !Number.isNaN(y)) {
          pts.push({ x, y });
        }
        i += 3;
      } else {
        return dStr;
      }
    }
    if (pts.length < 2) return dStr;

    // 4-point horizontal step fan-out / fan-in -> Smooth Apple Cubic Bézier S-Curve
    if (pts.length === 4) {
      const [p0, p1, p2, p3] = pts;
      const isHorizStep =
        Math.abs(p0.y - p1.y) < 0.5 &&
        Math.abs(p1.x - p2.x) < 0.5 &&
        Math.abs(p2.y - p3.y) < 0.5 &&
        Math.abs(p3.x - p0.x) <= 135 &&
        Math.abs(p3.y - p0.y) <= 165 &&
        ((p0.x < p1.x && p1.x < p3.x) || (p0.x > p1.x && p1.x > p3.x));
      if (isHorizStep) {
        const xm = p1.x;
        return `M ${p0.x} ${p0.y} C ${xm} ${p0.y}, ${xm} ${p3.y}, ${p3.x} ${p3.y}`;
      }
    }

    if (pts.length === 2) {
      return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
    }

    // Multi-segment orthogonal path -> Smooth Apple Rounded Corner Fillets (Quadratic Bézier Q)
    let out = `M ${pts[0].x} ${pts[0].y}`;
    for (let j = 1; j < pts.length - 1; j++) {
      const prev = pts[j - 1];
      const curr = pts[j];
      const next = pts[j + 1];
      const v1x = curr.x - prev.x;
      const v1y = curr.y - prev.y;
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      if (len1 < 2 || len2 < 2) {
        out += ` L ${curr.x} ${curr.y}`;
        continue;
      }
      const r = Math.min(16, len1 * 0.42, len2 * 0.42);
      const startX = curr.x - (v1x / len1) * r;
      const startY = curr.y - (v1y / len1) * r;
      const endX = curr.x + (v2x / len2) * r;
      const endY = curr.y + (v2y / len2) * r;
      out += ` L ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${curr.x} ${curr.y} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    out += ` L ${last.x} ${last.y}`;
    return out;
  }

  function upgradeSchemaToAppleDesign(stageEl) {
    if (!stageEl || stageEl.__appleUpgraded) return;
    stageEl.__appleUpgraded = true;
    const svgNS = 'http://www.w3.org/2000/svg';

    // 1. Convert every .bp-wire into a smooth Apple Fluid Conduit and generate a 1-to-1 synchronized Optical Comet Stream (.bp-pulse-trail + .bp-pulse) & Port (.bp-apple-port)
    // PERFORMANCE: the endlessly animated light streams live in a separate, isolated overlay <svg> layer.
    // Re-rastering that layer each frame only touches thin lines — the main schematic (text, gradients, cards)
    // is rastered once and never repainted by the streams.
    const mainSvg = stageEl.querySelector('svg.ph-blueprint-svg');
    let flowLayer = null;
    if (mainSvg) {
      const flowSvg = document.createElementNS(svgNS, 'svg');
      flowSvg.setAttribute('class', 'ph-blueprint-flow');
      flowSvg.setAttribute('aria-hidden', 'true');
      flowSvg.setAttribute('viewBox', mainSvg.getAttribute('viewBox') || '0 0 1600 740');
      flowSvg.setAttribute('preserveAspectRatio', mainSvg.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
      flowLayer = document.createElementNS(svgNS, 'g');
      // Clip the streams out of every card so light never runs over block text (cards were drawn above wires originally)
      const vb = (mainSvg.getAttribute('viewBox') || '0 0 1600 740').split(/\s+/).map(Number);
      let clipD = `M${vb[0]} ${vb[1]}H${vb[0] + vb[2]}V${vb[1] + vb[3]}H${vb[0]}Z`;
      $$('.bp-node', stageEl).forEach(node => {
        const r = node.querySelector('rect');
        if (!r) return;
        const x = parseFloat(r.getAttribute('x') || '0');
        const y = parseFloat(r.getAttribute('y') || '0');
        const w = parseFloat(r.getAttribute('width') || '0');
        const h = parseFloat(r.getAttribute('height') || '0');
        if (w > 0 && h > 0) clipD += ` M${x + 1} ${y + 1}h${w - 2}v${h - 2}h${-(w - 2)}Z`;
      });
      const clipId = `bp-flow-clip-${stageEl.id || Math.random().toString(36).slice(2)}`;
      const defs = document.createElementNS(svgNS, 'defs');
      const clip = document.createElementNS(svgNS, 'clipPath');
      clip.setAttribute('id', clipId);
      clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
      const clipPath = document.createElementNS(svgNS, 'path');
      clipPath.setAttribute('d', clipD);
      clipPath.setAttribute('clip-rule', 'evenodd');
      clip.appendChild(clipPath);
      defs.appendChild(clip);
      flowSvg.appendChild(defs);
      flowLayer.setAttribute('clip-path', `url(#${clipId})`);
      flowSvg.appendChild(flowLayer);
      mainSvg.insertAdjacentElement('afterend', flowSvg);
      stageEl.__flowSvg = flowSvg;
      stageEl.__mainSvg = mainSvg;
    }
    $$('.bp-threads', stageEl).forEach(group => {
      // Remove legacy spanning .bp-pulse paths that cut across blocks
      $$('.bp-pulse, .bp-pulse-glow, .bp-pulse-trail, .bp-apple-port', group).forEach(el => el.remove());

      const wires = $$('.bp-wire', group);
      const portCoords = new Set();

      wires.forEach((wire, wIdx) => {
        const rawD = wire.getAttribute('d');
        if (!rawD) return;
        const smoothD = smoothSvgPathToAppleFluid(rawD);
        wire.setAttribute('d', smoothD);

        let len = 120;
        try { len = Math.max(24, Math.ceil(wire.getTotalLength())); } catch (_) {}
        wire.style.setProperty('--wire-len', `${len}`);

        const wDelaySec = wire.__wireDelaySec ?? 0.1;
        const flowDelaySec = wDelaySec + 0.22;
        const tierWire = wire.getAttribute('data-tier-wire');

        // Create Coaxial Soft Trail (.bp-pulse-trail) + Pure White Core (.bp-pulse) per conduit for crisp continuous stream animation
        const trail = document.createElementNS(svgNS, 'path');
        trail.setAttribute('d', smoothD);
        trail.setAttribute('class', 'bp-pulse-trail');
        if (tierWire !== null) trail.setAttribute('data-tier-wire', tierWire);
        trail.style.setProperty('--wire-delay', `${wDelaySec.toFixed(3)}s`);
        trail.style.setProperty('--flow-delay', `${flowDelaySec.toFixed(3)}s`);

        const head = document.createElementNS(svgNS, 'path');
        head.setAttribute('d', smoothD);
        head.setAttribute('class', 'bp-pulse bp-pulse--white');
        if (tierWire !== null) head.setAttribute('data-tier-wire', tierWire);
        head.style.setProperty('--wire-delay', `${wDelaySec.toFixed(3)}s`);
        head.style.setProperty('--flow-delay', `${flowDelaySec.toFixed(3)}s`);
        head.__trailEl = trail;
        head.__wireLen = len;
        head.__wireOrder = wire.__wireOrder ?? wIdx;

        const streamHost = flowLayer || group;
        streamHost.appendChild(trail);
        streamHost.appendChild(head);

        // Create Circular Apple Glass Port at conduit origin with identical --wire-delay
        const m = /^M\s*([-\d.]+)\s+([-\d.]+)/i.exec(smoothD.trim());
        if (m) {
          const px = parseFloat(m[1]);
          const py = parseFloat(m[2]);
          const key = `${Math.round(px)},${Math.round(py)}`;
          if (!portCoords.has(key)) {
            portCoords.add(key);
            const port = document.createElementNS(svgNS, 'circle');
            port.setAttribute('cx', String(px));
            port.setAttribute('cy', String(py));
            port.setAttribute('r', '3.1');
            port.setAttribute('class', 'bp-apple-port');
            if (tierWire !== null) port.setAttribute('data-tier-wire', tierWire);
            port.style.setProperty('--wire-delay', `${wDelaySec.toFixed(3)}s`);
            group.appendChild(port);
          }
        }
      });
    });

    // 2. Upgrade every .bp-node into an Apple Liquid Glass Bento Module with top specular rim
    $$('.bp-node', stageEl).forEach(node => {
      const outerRect = node.querySelector('rect');
      if (!outerRect) return;
      const x = parseFloat(outerRect.getAttribute('x') || '0');
      const y = parseFloat(outerRect.getAttribute('y') || '0');
      const w = parseFloat(outerRect.getAttribute('width') || '0');
      const h = parseFloat(outerRect.getAttribute('height') || '0');

      // Highlight key architectural hubs with brighter Apple Glass Hub fill
      if ((w >= 290 && h >= 80) || y < 90 || (y > 600 && h >= 44 && w >= 240)) {
        node.classList.add('is-apple-hub');
      }

      if (w > 48 && h >= 32) {
        const specLine = document.createElementNS(svgNS, 'line');
        const inset = Math.min(18, w * 0.12);
        specLine.setAttribute('x1', String((x + inset).toFixed(1)));
        specLine.setAttribute('y1', String((y + 1).toFixed(1)));
        specLine.setAttribute('x2', String((x + w - inset).toFixed(1)));
        specLine.setAttribute('y2', String((y + 1).toFixed(1)));
        specLine.setAttribute('class', 'bp-apple-specular');
        node.appendChild(specLine);
      }
    });

    // 3. Replace industrial CAD slashes '//' with clean Apple middle dots '·' inside SVG labels
    $$('text', stageEl).forEach(tEl => {
      if (tEl.textContent && tEl.textContent.includes('//')) {
        tEl.textContent = tEl.textContent.replace(/\s*\/\/\s*/g, ' · ');
      }
    });
  }

  // Calibrate Coaxial Optical Light Streams (.bp-pulse-trail + .bp-pulse) with 100% identical phase & dasharray so they never split
  function initStrictStreamFlows(stageEl) {
    if (!stageEl) return;
    [stageEl].forEach(group => {
      $$('.bp-pulse', group).forEach((head, idx) => {
        const trail = head.__trailEl;
        const len = head.__wireLen || 120;

        // Proportional optical light beam length & generous spacing so both short (34px) and long (1300px) conduits look clean
        const pulseDash = Math.round(clamp(len * 0.24, 10, 26));
        const pulseGap = Math.round(clamp(len * 0.68, 48, 280));
        const period = pulseDash + pulseGap;

        const speedPxPerSec = 128; // calm, legible Apple Keynote optical flow velocity
        const dur = clamp(period / speedPxPerSec, 0.90, 2.15);
        // Phase-align delay with causal wire order so packets flow sequentially down the hierarchy
        const wOrder = head.__wireOrder ?? idx;
        const delay = -((wOrder * 0.20) % dur);

        const setPulseVars = el => {
          if (!el) return;
          el.style.setProperty('--pulse-dash', `${pulseDash}`);
          el.style.setProperty('--pulse-gap', `${pulseGap}`);
          el.style.setProperty('--pulse-period', `${period}`);
          el.style.setProperty('--pulse-dur', `${dur.toFixed(2)}s`);
          el.style.setProperty('--pulse-delay', `${delay.toFixed(2)}s`);
        };

        setPulseVars(head);
        setPulseVars(trail);
      });
    });
  }

  function stepAiArchAutoCycle(dt, isCurrentSlide) {
    // Keep the full blueprint diagram 100% illuminated after sequential reveal; only filter when user clicks a tab
    void dt;
    void isCurrentSlide;
  }

  aiTierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      finishTechStagedReveal();
      aiManualPauseUntil = performance.now() + 5500;
      aiElapsed = 0;
      applyAiTier(btn.dataset.aiTier);
    });
  });

  /* ---------------- 4B-2. AI 2-PAGE 3D & MOTION CONTROLLER (SLIDES 05 & 06: GOOGLE · OPENAI · CLAUDE) ---------------- */
  const aiVendorsP1 = $('#ai-vendors-p1');
  const aiVendorsP2 = $('#ai-vendors-p2');
  const aiAutoProgressFill = $('#ai-auto-progress-fill');
  const aiStatusText = $('#ai-auto-status-text');
  const AI_SHOWCASE_DURATION = 5.40;
  let aiAutoElapsed = 0;
  let aiAutoActive = false;
  let aiDockTriggered = false;
  let aiInspectPaused = false;
  let aiQuickMorphTimer = 0;
  let aiIntroCleanupTimer = 0;
  let aiHighlightTimer = 0;
  let lastAiDragEndMs = 0;
  // Exit time of the outgoing page (ms). The deck transition writes it, the AI entry animations
  // use it as their start offset so nothing plays while the section is still transparent.
  let aiEnterDelayMs = 0;
  // Last column finishes at +180 ms delay + 720 ms; the glow starts after a short rest.
  const AI_MATRIX_SHOW_MS = 1250;

  function updateAiInspectUI() {
    if (aiStatusText) {
      if (isMobileViewport()) {
        aiStatusText.textContent = curLang === 'en'
          ? 'TAP ANY PROVIDER CARD OR THE BUTTON BELOW TO OPEN THE 48-MODEL STACK'
          : 'НАЖМИТЕ НА ЛЮБУЮ КАРТОЧКУ ИЛИ КНОПКУ НИЖЕ ДЛЯ ОТКРЫТИЯ СПИСКА (48 МОДЕЛЕЙ)';
      } else {
        if (curLang === 'en') {
          aiStatusText.textContent = aiInspectPaused
            ? '3D SCENE ACTIVE // ROTATE WITH MOUSE OR CLICK A CARD TO OPEN THE 48-MODEL LIST'
            : '3D SCENE ACTIVE (DRAG TO ROTATE) → PROCEED TO FULL MODEL LIST (48)';
        } else {
          aiStatusText.textContent = aiInspectPaused
            ? '3D-СЦЕНА АКТИВНА // ВРАЩАЙТЕ МЫШЬЮ ИЛИ НАЖМИТЕ НА КАРТОЧКУ ДЛЯ ОТКРЫТИЯ 48 МОДЕЛЕЙ'
            : '3D-СЦЕНА ПОСТАВЩИКОВ ИИ (ТЯНИТЕ МЫШЬЮ ДЛЯ ВРАЩЕНИЯ) → ПЕРЕХОД К СПИСКУ (48 МОДЕЛЕЙ)';
        }
      }
    }
  }

  function startAiVendorsShowcase(pauseAutoTimer = false) {
    clearTimeout(aiQuickMorphTimer);
    clearTimeout(aiIntroCleanupTimer);
    if (pauseAutoTimer || isMobileViewport()) {
      aiInspectPaused = true;
    }
    aiAutoElapsed = 0;
    aiAutoActive = !aiInspectPaused;
    aiDockTriggered = false;
    if (aiAutoProgressFill) aiAutoProgressFill.style.setProperty('--ai-p', '0');
    if (aiVendorsP1) {
      aiVendorsP1.style.setProperty('--ai-enter-delay', `${aiEnterDelayMs}ms`);
      aiVendorsP1.classList.remove('is-docking-up', 'is-ai-intro');
      void aiVendorsP1.offsetWidth;
      aiVendorsP1.classList.add('is-ai-intro');
    }
    updateAiInspectUI();
  }

  function stopAiVendorsShowcase(keepDockState = false) {
    clearTimeout(aiQuickMorphTimer);
    clearTimeout(aiIntroCleanupTimer);
    aiAutoActive = false;
    if (!keepDockState && aiVendorsP1) {
      aiVendorsP1.classList.remove('is-docking-up', 'is-ai-intro');
    }
  }

  function resetAiPage2Highlight() {
    clearTimeout(aiHighlightTimer);
    aiVendorsP2?.classList.remove('is-ai-hl-loop');
  }

  // Page show first (all 48 models), then the looped highlight: newest rows, older rows, pause.
  function triggerAiPage2Reveal(enterDelay = aiEnterDelayMs) {
    if (!aiVendorsP2) return;
    resetAiPage2Highlight();
    aiVendorsP2.style.setProperty('--ai-enter-delay', `${enterDelay}ms`);
    aiVendorsP2.classList.remove('is-ai-matrix-reveal');
    void aiVendorsP2.offsetWidth;
    aiVendorsP2.classList.add('is-ai-matrix-reveal');
    if (reduce) return;
    aiHighlightTimer = setTimeout(() => aiVendorsP2.classList.add('is-ai-hl-loop'), enterDelay + AI_MATRIX_SHOW_MS);
  }

  function triggerImmediateAiDockToPage2() {
    clearTimeout(aiQuickMorphTimer);
    aiAutoActive = false;
    aiDockTriggered = true;
    if (aiAutoProgressFill) aiAutoProgressFill.style.setProperty('--ai-p', '1');
    if (aiVendorsP1) aiVendorsP1.classList.remove('is-docking-up');
    goTo(6, { fromAiAutoMorph: true });
  }

  function stepAiVendorsAutoMorph(dt, isCurrentSlide) {
    if (!isCurrentSlide || !aiAutoActive || aiInspectPaused) return;
    aiAutoElapsed += dt;
    const ratio = clamp(aiAutoElapsed / AI_SHOWCASE_DURATION, 0, 1);
    if (aiAutoProgressFill) {
      aiAutoProgressFill.style.setProperty('--ai-p', ratio.toFixed(3));
    }
    if (aiAutoElapsed >= AI_SHOWCASE_DURATION) {
      aiAutoActive = false;
      aiDockTriggered = true;
      goTo(6, { fromAiAutoMorph: true });
    }
  }

  $('#ai-replay-intro-btn')?.addEventListener('click', () => {
    aiInspectPaused = false;
    aiEnterDelayMs = 0;
    startAiVendorsShowcase(false);
  });

  $('#ai-skip-to-p2-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    triggerImmediateAiDockToPage2();
  });

  $$('.ph-ai-vendor-card', aiVendorsP1 || document).forEach(card => {
    card.addEventListener('click', () => {
      if (performance.now() - lastAiDragEndMs < 200) return;
      triggerImmediateAiDockToPage2();
    });
  });

  $('#ai-replay-from-p2-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    goTo(5);
  });

  /* ---------------- 4B-3. REAL-TIME 3D ENGINES FOR TECHNOLOGIES & AI (STRICT MONOCHROME) ---------------- */
  const techAndAi3dEngine = (() => {
    const cvTech1 = document.getElementById('canvas-tech-3d-p1');
    const cvTech2 = document.getElementById('canvas-tech-3d-p2');
    const cvAi1 = document.getElementById('canvas-ai-3d-p1');
    const cvAi2 = document.getElementById('canvas-ai-3d-p2');
    const aiTriadStage = document.getElementById('ai-triad-stage');
    const aiTelemetryEl = document.getElementById('ai-3d-telemetry');
    const cardCanvases = $$('.ph-ai-card-3d').map(cv => ({
      cv,
      ctx: cv.getContext('2d'),
      vendor: cv.dataset.vendor3d || 'openai',
      w: 0,
      h: 0,
      dpr: 1
    }));

    let t = 0;
    let techMouseX = 0, techMouseY = 0;
    let techTargetX = 0, techTargetY = 0;
    let aiYaw = 0, aiPitch = 0.24;
    let targetYaw = 0, targetPitch = 0.24;
    let draggingAi = false, dragStartX = 0, dragStartY = 0, dragMoved = false;

    // Smooth mouse-reactive 3D camera parallax ONLY on the 3D background canvas (#canvas-tech-3d-p1 & #canvas-tech-3d-p2)
    // NEVER mutate SVG CSS transforms on pointermove so the SVG schematic stays 100% stationary, crisp, and unblurred!
    [aiBlueprintStage, aiPageStage].forEach(stageEl => {
      if (!stageEl) return;
      stageEl.addEventListener('pointermove', e => {
        const rect = stageEl.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 100) return;
        techTargetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        techTargetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }, { passive: true });
      stageEl.addEventListener('pointerleave', () => {
        techTargetX = 0;
        techTargetY = 0;
      }, { passive: true });
    });

    // Interactive 360° orbit drag on AI Page 1 (#ai-triad-stage)
    if (aiTriadStage) {
      aiTriadStage.addEventListener('pointerdown', e => {
        if (isMobileViewport() || e.target.closest('button')) return;
        draggingAi = true;
        dragMoved = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      });
      addEventListener('pointermove', e => {
        if (!draggingAi) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          dragMoved = true;
          // Auto-pause timer while user is actively orbiting the 3D AI scene
          if (!aiInspectPaused) {
            aiInspectPaused = true;
            aiAutoActive = false;
            aiVendorsP1?.classList.remove('is-docking-up');
            updateAiInspectUI();
          }
        }
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        targetYaw += dx * 0.0085;
        targetPitch = clamp(targetPitch + dy * 0.005, 0.06, 0.52);
      });
      const stopDrag = () => {
        if (draggingAi && dragMoved) {
          lastAiDragEndMs = performance.now();
        }
        draggingAi = false;
      };
      addEventListener('pointerup', stopDrag);
      addEventListener('pointercancel', stopDrag);
    }

    const stageItems = new Map();
    [cvTech1, cvTech2, cvAi1, cvAi2].forEach(cv => {
      if (cv) stageItems.set(cv, { cv, ctx: cv.getContext('2d'), w: 0, h: 0, dpr: 1 });
    });

    function measureItem(item) {
      if (!item || !item.cv || !item.cv.parentElement) return null;
      const cw = item.cv.parentElement.clientWidth;
      const ch = item.cv.parentElement.clientHeight;
      if (cw < 24 || ch < 24) return null;
      const pw = Math.round(cw);
      const ph = Math.round(ch);
      if (item.cv.width !== pw || item.cv.height !== ph) {
        item.cv.width = pw;
        item.cv.height = ph;
      }
      item.w = pw;
      item.h = ph;
      item.dpr = 1;
      return item;
    }

    function resize() {
      stageItems.forEach(item => measureItem(item));
      cardCanvases.forEach(item => measureItem(item));
    }

    function ensureCanvasSize(cv) {
      const item = stageItems.get(cv);
      if (!item) return null;
      if (item.w < 24 || item.h < 24) return measureItem(item);
      return item;
    }

    // 1. Render Apple Space Black Volumetric Studio Lighting behind Technologies Schemas (Slides 03 & 04)
    function renderTech3DBackdrop(cv, time, dt, isPage2) {
      const info = ensureCanvasSize(cv);
      if (!info) return;
      const { ctx, w, h, dpr } = info;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const lerpK = Math.min(1, dt * 6);
      techMouseX += (techTargetX - techMouseX) * lerpK;
      techMouseY += (techTargetY - techMouseY) * lerpK;

      // Living drifting Apple Keynote volumetric light orbs that shift organically with time & mouse parallax
      const driftX = Math.sin(time * 0.45) * w * 0.08;
      const driftY = Math.cos(time * 0.38) * h * 0.07;
      const orbs = isPage2
        ? [
            { x: w * 0.26 + driftX + techMouseX * 26, y: h * 0.34 + driftY + techMouseY * 18, r: Math.max(w, h) * 0.44, a: 0.068 },
            { x: w * 0.74 - driftX - techMouseX * 26, y: h * 0.34 - driftY - techMouseY * 18, r: Math.max(w, h) * 0.44, a: 0.068 },
            { x: w * 0.50 + driftY + techMouseX * 16, y: h * 0.82 - driftX + techMouseY * 14, r: Math.max(w, h) * 0.40, a: 0.058 }
          ]
        : [
            { x: w * 0.50 + driftX + techMouseX * 28, y: h * 0.18 + driftY + techMouseY * 16, r: Math.max(w, h) * 0.46, a: 0.072 },
            { x: w * 0.34 - driftX - techMouseX * 22, y: h * 0.48 - driftY + techMouseY * 18, r: Math.max(w, h) * 0.42, a: 0.058 },
            { x: w * 0.68 + driftY + techMouseX * 20, y: h * 0.76 + driftX - techMouseY * 14, r: Math.max(w, h) * 0.44, a: 0.062 }
          ];

      orbs.forEach(orb => {
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        g.addColorStop(0, `rgba(255, 255, 255, ${orb.a})`);
        g.addColorStop(0.55, `rgba(255, 255, 255, ${(orb.a * 0.35).toFixed(4)})`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // Subtle floating Apple Spatial Glass dust motes
      for (let i = 0; i < 18; i++) {
        const seed = i * 1.732;
        const px = ((Math.sin(seed * 3.1 + time * 0.08) * 0.46 + 0.5) * w + techMouseX * (10 + (i % 4) * 5) + w) % w;
        const py = ((Math.cos(seed * 2.7 + time * 0.06) * 0.46 + 0.5) * h + techMouseY * (8 + (i % 3) * 4) + h) % h;
        const alpha = 0.06 + 0.06 * Math.sin(time * 1.1 + seed);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, (i % 3 === 0) ? 1.4 : 0.95, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Render Per-Card 3D Rotating Holographic Emblem (Google Geodesic Sphere, OpenAI Tesseract, Claude Octahedron)
    // Strictly clipped & scaled inside the circular border so NO line or vertex ever overflows outside the circle!
    function renderCard3DEmblem(item, time) {
      if (item.w < 24 || item.h < 24) {
        if (!measureItem(item)) return;
      }
      const { ctx, w, h } = item;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const vendor = item.vendor;

      const cx = w * 0.5;
      const cy = h * 0.5;
      const maxRadius = Math.max(10, Math.min(cx, cy) - 9);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.clip();

      const scale = Math.min(w, h) * 0.235;
      const ry = time * 0.65 + aiYaw * 0.9;
      const rx = time * 0.38 + aiPitch * 0.7;
      const cyA = Math.cos(ry), syA = Math.sin(ry);
      const cxA = Math.cos(rx), sxA = Math.sin(rx);

      const proj = (x, y, z) => {
        const x1 = x * cyA - z * syA;
        const z1 = x * syA + z * cyA;
        const y2 = y * cxA - z1 * sxA;
        const z2 = y * sxA + z1 * cxA + 3.4;
        const k = (scale * 3.4) / z2;
        return { sx: cx + x1 * k, sy: cy + y2 * k, z2 };
      };

      ctx.lineWidth = vendor === 'openai' ? 1.1 : 1.0;

      if (vendor === 'openai') {
        // 3D Nested Hypercube (Tesseract) + Gyroscopic Rings for Flagship OpenAI (strictly within circle radius)
        const verts = [];
        for (let r = 0; r < 2; r++) {
          const s = r === 0 ? 0.78 : 0.45;
          const aOff = r === 0 ? 0 : time * 0.8;
          const ca = Math.cos(aOff), sa = Math.sin(aOff);
          for (let i = 0; i < 8; i++) {
            const vx = (i & 1 ? s : -s);
            const vy = (i & 2 ? s : -s);
            const vz = (i & 4 ? s : -s);
            const rxV = vx * ca - vz * sa;
            const rzV = vx * sa + vz * ca;
            verts.push(proj(rxV, vy, rzV));
          }
        }
        const edges = [
          [0,1],[1,3],[3,2],[2,0],
          [4,5],[5,7],[7,6],[6,4],
          [0,4],[1,5],[2,6],[3,7]
        ];
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        edges.forEach(([a, b]) => {
          ctx.moveTo(verts[a].sx, verts[a].sy);
          ctx.lineTo(verts[b].sx, verts[b].sy);
          ctx.moveTo(verts[a + 8].sx, verts[a + 8].sy);
          ctx.lineTo(verts[b + 8].sx, verts[b + 8].sy);
        });
        for (let i = 0; i < 8; i++) {
          ctx.moveTo(verts[i].sx, verts[i].sy);
          ctx.lineTo(verts[i + 8].sx, verts[i + 8].sy);
        }
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc(verts[i].sx, verts[i].sy, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (vendor === 'google') {
        // 3D Geodesic Orbital Sphere for Google
        ctx.strokeStyle = 'rgba(255,255,255,0.24)';
        for (let ring = 0; ring < 3; ring++) {
          const tilt = (ring * Math.PI) / 3;
          const ct = Math.cos(tilt), st = Math.sin(tilt);
          ctx.beginPath();
          const segs = 28;
          for (let j = 0; j <= segs; j++) {
            const a = (j / segs) * Math.PI * 2;
            const lx = Math.cos(a) * 0.92;
            const ly = Math.sin(a) * 0.92 * ct;
            const lz = Math.sin(a) * 0.92 * st;
            const p = proj(lx, ly, lz);
            if (j === 0) ctx.moveTo(p.sx, p.sy);
            else ctx.lineTo(p.sx, p.sy);
          }
          ctx.stroke();
        }
      } else {
        // 3D Crystalline Octahedron & Star Lattice for Claude
        const oVerts = [
          proj(0, 0.94, 0), proj(0, -0.94, 0),
          proj(0.92, 0, 0), proj(-0.92, 0, 0),
          proj(0, 0, 0.92), proj(0, 0, -0.92)
        ];
        const oEdges = [
          [0,2],[0,3],[0,4],[0,5],
          [1,2],[1,3],[1,4],[1,5],
          [2,4],[4,3],[3,5],[5,2]
        ];
        ctx.strokeStyle = 'rgba(255,255,255,0.26)';
        ctx.beginPath();
        oEdges.forEach(([a, b]) => {
          ctx.moveTo(oVerts[a].sx, oVerts[a].sy);
          ctx.lineTo(oVerts[b].sx, oVerts[b].sy);
        });
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        oVerts.forEach(v => {
          ctx.beginPath();
          ctx.arc(v.sx, v.sy, 1.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    }

    // 3. Render Main Interactive 3D AI Triad Stage (#canvas-ai-3d-p1 & #canvas-ai-3d-p2)
    function renderAi3DStage(cv, time, dt, isPage2) {
      const info = ensureCanvasSize(cv);
      if (!info) return;
      const { ctx, w, h, dpr } = info;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (!draggingAi) {
        targetYaw += dt * 0.14;
      }
      const orbitLerp = Math.min(1, dt * 8);
      aiYaw += (targetYaw - aiYaw) * orbitLerp;
      aiPitch += (targetPitch - aiPitch) * orbitLerp;

      if (!isPage2 && aiTelemetryEl) {
        const degY = (((aiYaw * 180) / Math.PI) % 360).toFixed(1);
        const degP = ((aiPitch * 180) / Math.PI).toFixed(1);
        aiTelemetryEl.textContent = curLang === 'ru' ? `КАМЕРА: ПОВОРОТ ${degY}° · НАКЛОН +${degP}°` : `CAMERA: ORBIT ${degY}° · TILT +${degP}°`;
      }

      const cx = w * 0.5;
      const cy = h * (isPage2 ? 0.24 : 0.54);
      const fov = Math.min(w, h) * 0.92;
      const cyA = Math.cos(aiYaw), syA = Math.sin(aiYaw);
      const cpA = Math.cos(aiPitch), spA = Math.sin(aiPitch);
      const camDist = isPage2 ? 6.8 : 5.8;

      const project = (x, y, z) => {
        const x1 = x * cyA - z * syA;
        const z1 = x * syA + z * cyA;
        const y2 = y * cpA - z1 * spA;
        const z2 = y * spA + z1 * cpA + camDist;
        if (z2 < 0.3) return null;
        const k = fov / z2;
        return { sx: cx + x1 * k, sy: cy + y2 * k, k, z2 };
      };

      // 3D Topographic / Architectural Horizon Grid Plane (Zero full-screen fillRect overdraw for locked 120 FPS!)
      const floorY = isPage2 ? 1.85 : 1.42;
      ctx.lineWidth = 1;
      for (let gz = -3.6; gz <= 3.6; gz += 0.45) {
        ctx.beginPath();
        let started = false;
        for (let gx = -4.5; gx <= 4.5; gx += 0.45) {
          const wave = Math.sin(gx * 1.4 + time * 1.2) * Math.cos(gz * 1.4 - time * 0.9) * 0.08;
          const p = project(gx, floorY + wave, gz);
          if (p) {
            if (!started) { ctx.moveTo(p.sx, p.sy); started = true; }
            else ctx.lineTo(p.sx, p.sy);
          }
        }
        const alpha = clamp(0.16 - Math.abs(gz) * 0.032, 0.02, 0.16);
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.stroke();
      }

      // 3D Rotating Pyramid / Monolith Pedestals & Parabolic Neural Particle Arcs between Google (-2.2), OpenAI (0), and Claude (+2.2)
      const hubs = [
        { x: -2.15, y: 0.18, z: 0, r: 0.62, tiers: 3 },
        { x: 0.0, y: -0.05, z: 0.22, r: 0.92, tiers: 5 },
        { x: 2.15, y: 0.18, z: 0, r: 0.62, tiers: 3 }
      ];

      hubs.forEach((hub, hIdx) => {
        const isFlagship = hIdx === 1;
        for (let ti = 0; ti < hub.tiers; ti++) {
          const tr = hub.r * (1 - ti * 0.14);
          const ty = floorY - ti * 0.22;
          const rot = time * (isFlagship ? 0.55 : 0.35) * (ti % 2 === 0 ? 1 : -1);
          const sides = isFlagship ? 6 : 4;
          ctx.beginPath();
          for (let s = 0; s <= sides; s++) {
            const a = rot + (s / sides) * Math.PI * 2;
            const p = project(hub.x + Math.cos(a) * tr, ty, hub.z + Math.sin(a) * tr);
            if (!p) continue;
            if (s === 0) ctx.moveTo(p.sx, p.sy);
            else ctx.lineTo(p.sx, p.sy);
          }
          ctx.strokeStyle = isFlagship ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.15)';
          ctx.stroke();
        }
      });

      // 3D Neural Data Streams Arcing from OpenAI Center to Google (Left) and Claude (Right)
      [-1, 1].forEach(dir => {
        const targetHub = dir < 0 ? hubs[0] : hubs[2];
        ctx.beginPath();
        const steps = 28;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const ax = hubs[1].x + (targetHub.x - hubs[1].x) * u;
          const az = hubs[1].z + (targetHub.z - hubs[1].z) * u;
          const ay = hubs[1].y - Math.sin(u * Math.PI) * 0.78;
          const p = project(ax, ay, az);
          if (!p) continue;
          if (i === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.stroke();

        // Moving 3D Photon Packets along the Arcs
        for (let pk = 0; pk < 3; pk++) {
          const u = (time * 0.48 + pk / 3) % 1;
          const ax = hubs[1].x + (targetHub.x - hubs[1].x) * u;
          const az = hubs[1].z + (targetHub.z - hubs[1].z) * u;
          const ay = hubs[1].y - Math.sin(u * Math.PI) * 0.78;
          const p = project(ax, ay, az);
          if (p) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    }

    let techBackdropAcc = 1;
    function step(dt, activeSlideIdx, isTransitioning) {
      void isTransitioning;
      if (activeSlideIdx < 5 || activeSlideIdx > 8) return;
      t += dt;
      if (activeSlideIdx === 7 || activeSlideIdx === 8) {
        // Soft drifting studio light needs no more than ~40 fps: halves fill-rate cost on 120 Hz displays
        techBackdropAcc += dt;
        if (techBackdropAcc < 1 / 40) return;
        const stepDt = techBackdropAcc;
        techBackdropAcc = 0;
        renderTech3DBackdrop(activeSlideIdx === 7 ? cvTech1 : cvTech2, t, stepDt, activeSlideIdx === 8);
      } else if (activeSlideIdx === 5) {
        renderAi3DStage(cvAi1, t, dt, false);
        cardCanvases.forEach(item => renderCard3DEmblem(item, t));
      } else if (activeSlideIdx === 6) {
        renderAi3DStage(cvAi2, t, dt, true);
      }
    }

    return { step, resize };
  })();

  function bindStageTooltips(stageEl, tooltipEl, roleEl, titleEl, descEl) {
    if (!stageEl || !tooltipEl) return;
    const positionTip = e => {
      const rect = stageEl.getBoundingClientRect();
      const sl = stageEl.scrollLeft || 0;
      const st = stageEl.scrollTop || 0;
      const viewW = stageEl.clientWidth || rect.width;
      const viewH = stageEl.clientHeight || rect.height;
      const tw = tooltipEl.offsetWidth || (isMobileViewport() ? 250 : 320);
      const th = tooltipEl.offsetHeight || 110;
      const vx = (e.clientX ?? (rect.left + viewW / 2)) - rect.left;
      const vy = (e.clientY ?? (rect.top + viewH / 2)) - rect.top;
      let x = sl + vx + 18;
      let y = st + vy + 18;
      if (vx + tw + 30 > viewW) x = sl + vx - tw - 16;
      if (vy + th + 30 > viewH) y = st + vy - th - 16;
      x = clamp(x, sl + 10, Math.max(sl + 10, sl + viewW - tw - 10));
      y = clamp(y, st + 10, Math.max(st + 10, st + viewH - th - 10));
      tooltipEl.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    };

    stageEl.addEventListener('scroll', () => {
      if (isMobileViewport()) tooltipEl.classList.remove('is-visible');
    }, { passive: true });
    stageEl.addEventListener('click', e => {
      if (!e.target.closest('.bp-node')) tooltipEl.classList.remove('is-visible');
    });

    $$('.bp-node', stageEl).forEach(node => {
      const showNodeTip = e => {
        if (node.classList.contains('is-fly-pending') || performance.now() < (node.__readyAt || 0)) {
          tooltipEl.classList.remove('is-visible');
          return;
        }
        const tTitle = node.dataset.tipTitle;
        if (!tTitle) return;
        if (roleEl) roleEl.textContent = node.dataset.tipRole || (curLang === 'ru' ? 'ЭЛЕМЕНТ СХЕМЫ' : 'SYSTEM NODE');
        if (titleEl) titleEl.textContent = tTitle;
        if (descEl) descEl.textContent = node.dataset.tipDesc || '';
        positionTip(e);
        tooltipEl.classList.add('is-visible');
      };

      node.addEventListener('pointerenter', showNodeTip);
      node.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        if (node.classList.contains('is-fly-pending') || performance.now() < (node.__readyAt || 0)) {
          tooltipEl.classList.remove('is-visible');
          return;
        }
        if (tooltipEl.classList.contains('is-visible')) positionTip(e);
        else showNodeTip(e);
      });
      node.addEventListener('pointerleave', e => {
        if (e.pointerType === 'touch') return;
        tooltipEl.classList.remove('is-visible');
      });
      if (!node.dataset.goto) {
        node.addEventListener('click', e => {
          if (!isMobileViewport()) return;
          e.stopPropagation();
          showNodeTip(e);
        });
      }
    });
  }

  prepareBlueprintFlyInSchedule(aiBlueprintStage);
  prepareBlueprintFlyInSchedule(aiPageStage);
  upgradeSchemaToAppleDesign(aiBlueprintStage);
  upgradeSchemaToAppleDesign(aiPageStage);
  initStrictStreamFlows(aiBlueprintStage);
  initStrictStreamFlows(aiPageStage);

  bindStageTooltips(aiBlueprintStage, elAiTooltip, elAiTipRole, elAiTipTitle, elAiTipDesc);
  bindStageTooltips(
    aiPageStage,
    $('#ai-page-tooltip'),
    $('#ai-page-tip-role'),
    $('#ai-page-tip-title'),
    $('#ai-page-tip-desc')
  );

  /* ---------------- 4C. PRODUCTS 3-PAGE SHOWCASE (SLIDES 6, 7, 8) + EXACT 3D JAR MODEL ---------------- */
  const vidCake1 = $('#prod-vid-cake1');
  const vidCake2 = $('#prod-vid-cake2');
  const vidCan = $('#prod-vid-can');
  const vidEv1 = $('#prod-vid-everest1');
  const vidEv2 = $('#prod-vid-everest2');
  const monEvClean = $('#prod-mon-ev-clean');
  const monEvStorm = $('#prod-mon-ev-storm');
  const skinCards = $$('[data-skin-seek]');
  let activeCanSkinIdx = 0;

  function pauseAllProductVideos() {
    [vidCake1, vidCake2, vidCan, vidEv1, vidEv2].forEach(v => {
      if (v) {
        v.muted = true;
        try { v.pause(); } catch (_) {}
      }
    });
  }

  function startEverestFreezePlayback(forceRewind = false) {
    if (monEvClean) monEvClean.classList.remove('is-frozen');
    if (monEvStorm) monEvStorm.classList.remove('is-frozen');
    [vidEv2, vidEv1].forEach((v, idx) => {
      if (!v) return;
      v.preload = 'auto';
      v.muted = true;
      const wasFrozen = Boolean(v.__frozen);
      v.__frozen = false;
      if (forceRewind || wasFrozen || (v.currentTime || 0) > 0.06) {
        try { v.currentTime = 0; } catch (_) {}
      }
      if (idx === 0) v.play()?.catch?.(() => {});
      else requestAnimationFrame(() => { if (targetIdx === 10) v.play()?.catch?.(() => {}); });
    });
  }

  function bindEverestFreezeOnEnd(videoEl, monitorEl) {
    if (!videoEl) return;
    const freezeNow = () => {
      if (videoEl.__frozen) return;
      videoEl.__frozen = true;
      try { videoEl.pause(); } catch (_) {}
      if (videoEl.duration && videoEl.currentTime >= videoEl.duration) {
        try { videoEl.currentTime = Math.max(0, videoEl.duration - 0.04); } catch (_) {}
      }
      if (monitorEl) monitorEl.classList.add('is-frozen');
    };

    videoEl.addEventListener('timeupdate', () => {
      if (videoEl.duration && videoEl.currentTime >= videoEl.duration - 0.06) {
        freezeNow();
      }
    });
    videoEl.addEventListener('ended', freezeNow);
    monitorEl?.addEventListener('click', () => {
      startEverestFreezePlayback(true);
    });
  }

  bindEverestFreezeOnEnd(vidEv2, monEvClean);
  bindEverestFreezeOnEnd(vidEv1, monEvStorm);

  $('#prod-everest-replay-btn')?.addEventListener('click', () => {
    startEverestFreezePlayback(true);
  });

  let prodVideoTimer = 0;
  let prodWarmTimer = 0;
  function syncProductPageVideos(slideIdx) {
    clearTimeout(prodVideoTimer);
    clearTimeout(prodWarmTimer);
    pauseAllProductVideos();
    if (slideIdx !== 10 && slideIdx !== 11 && slideIdx !== 12) return;

    const targetVids = slideIdx === 10 ? [vidEv2, vidEv1] : slideIdx === 11 ? [vidCake1, vidCake2] : [vidCan];
    targetVids.forEach(v => {
      if (v && v.preload !== 'auto') v.preload = 'auto';
    });

    // Defer video decoder start by 180ms so the slide transition begins cleanly at full frame rate
    prodVideoTimer = setTimeout(() => {
      if (targetIdx !== slideIdx) return;
      if (slideIdx === 10) {
        startEverestFreezePlayback(false);
      } else if (slideIdx === 11) {
        [vidCake1, vidCake2].forEach((v, idx) => {
          if (!v) return;
          v.muted = true;
          if ((v.currentTime || 0) > 0.06) {
            try { v.currentTime = 0; } catch (_) {}
          }
          if (idx === 0) v.play()?.catch?.(() => {});
          else requestAnimationFrame(() => { if (targetIdx === 11) v.play()?.catch?.(() => {}); });
        });
      } else if (slideIdx === 12) {
        if (vidCan) {
          vidCan.muted = true;
          vidCan.play()?.catch?.(() => {});
        }
      }
    }, 180);

    // Pre-warm sibling product clips after transition settles so page switches play without buffer stalls
    prodWarmTimer = setTimeout(() => {
      if (targetIdx < 10 || targetIdx > 12) return;
      [vidEv2, vidEv1, vidCake1, vidCake2, vidCan].forEach(v => {
        if (v && v.preload !== 'auto') v.preload = 'auto';
      });
    }, 1200);
  }

  // Clicking either Cake video monitor on Page 2 resyncs & replays both Cake videos from 0.0s
  [vidCake1, vidCake2].forEach(v => {
    v?.parentElement?.addEventListener('click', () => {
      [vidCake1, vidCake2].forEach(cv => {
        if (!cv) return;
        cv.muted = true;
        try { cv.currentTime = 0; } catch (_) {}
        cv.play()?.catch?.(() => {});
      });
    });
  });

  // Page 2 (Cake): Toggle between full browser screenshot and close-up cake reference photo
  const refImgWrap = $('#prod-ref-imgwrap');
  const refZoomBtn = $('#prod-ref-zoom-btn');
  refZoomBtn?.addEventListener('click', () => {
    if (!refImgWrap) return;
    const isZoom = refImgWrap.dataset.crop === 'zoom';
    refImgWrap.dataset.crop = isZoom ? 'full' : 'zoom';
    refZoomBtn.textContent = curLang === 'ru' ? (isZoom ? 'ПОКАЗАТЬ ТОРТ КРУПНО' : 'ПОКАЗАТЬ СКРИНШОТ БРАУЗЕРА') : (isZoom ? 'SHOW CAKE CLOSE-UP' : 'SHOW BROWSER SCREENSHOT');
  });

  // Page 3 (Can): Interactive 4 skin cards seek & PAUSE so user can inspect the selected packaging design in detail
  skinCards.forEach(card => {
    card.addEventListener('click', () => {
      const sec = parseFloat(card.dataset.skinSeek || '0');
      const sIdx = parseInt(card.dataset.skinIdx || '0', 10);
      activeCanSkinIdx = clamp(sIdx, 0, 3);
      if (vidCan) {
        vidCan.muted = true;
        vidCan.pause();
        try { vidCan.currentTime = sec; } catch (_) {}
      }
      skinCards.forEach(c => c.classList.toggle('is-active', c === card));
    });
  });

  // Clicking the video monitor on Page 3 toggles play/pause so user can resume after inspecting a paused skin
  vidCan?.parentElement?.addEventListener('click', () => {
    if (!vidCan) return;
    vidCan.muted = true;
    if (vidCan.paused) {
      vidCan.play()?.catch?.(() => {});
    } else {
      vidCan.pause();
    }
  });

  vidCan?.addEventListener('timeupdate', () => {
    if (vidCan.paused) return;
    const t = vidCan.currentTime || 0;
    if (t < 3.05 || t >= 5.45) activeCanSkinIdx = 0;
    else if (t < 3.98) activeCanSkinIdx = 1;
    else if (t < 4.48 || t >= 5.0) activeCanSkinIdx = 2;
    else activeCanSkinIdx = 3;
    skinCards.forEach((c, i) => c.classList.toggle('is-active', i === activeCanSkinIdx));
  });

  function triggerProductsShowcaseAnim(secEl) {
    if (!secEl) return;
    if (secEl.__prodRevealTimer) clearTimeout(secEl.__prodRevealTimer);
    secEl.classList.remove('is-prod-reveal');
    requestAnimationFrame(() => {
      secEl.classList.add('is-prod-reveal');
    });
  }

  /* 3D Star-Particle Constellation Jar Renderer (#canvas-can-3d)
     Exact 1:1 physical dimensions & silhouette of the jar from prod_can_skins.mp4,
     built purely from glowing dots with delicate micro-star glints on a pure #000000 background. */
  const can3dWidget = (() => {
    const cv = document.getElementById('canvas-can-3d');
    if (!cv) return null;
    const ctx = cv.getContext('2d', { alpha: false });
    let w = 0, h = 0, dpr = 1;
    let yaw = 0.08, pitch = 0.02, t = 0;
    let dragging = false, lastX = 0, lastY = 0;

    // 41-point exact radius profile measured directly from the video jar (ny from +1.00 top to -1.00 bottom, step 0.05)
    const MEASURED_RADII = [
      0.3850, // +1.00 (cap top bevel)
      0.4217, // +0.95 (cap upper)
      0.4254, // +0.90 (cap body)
      0.4254, // +0.85
      0.4254, // +0.80
      0.4254, // +0.75
      0.4217, // +0.70 (cap bottom edge)
      0.3959, // +0.65 (neck groove under cap)
      0.4438, // +0.60 (neck collar ring)
      0.4825, // +0.55 (upper shoulder curve)
      0.4954, // +0.50 (lower shoulder curve)
      0.4991, // +0.45 (cylinder body top)
      0.4991, // +0.40
      0.4991, // +0.35
      0.4991, // +0.30
      0.4991, // +0.25
      0.4991, // +0.20
      0.4991, // +0.15
      0.4991, // +0.10
      0.4991, // +0.05
      0.4991, //  0.00 (cylinder center)
      0.4991, // -0.05
      0.4991, // -0.10
      0.4991, // -0.15
      0.4991, // -0.20
      0.4991, // -0.25
      0.4991, // -0.30
      0.4991, // -0.35
      0.4991, // -0.40
      0.4991, // -0.45
      0.4991, // -0.50
      0.4991, // -0.55
      0.4991, // -0.60
      0.4991, // -0.65
      0.4991, // -0.70
      0.4991, // -0.75
      0.4991, // -0.80 (cylinder body bottom)
      0.4917, // -0.85 (lower rounded corner)
      0.4494, // -0.90 (foot bevel upper)
      0.3978, // -0.95 (foot bevel lower)
      0.3450  // -1.00 (flat bottom base)
    ];

    function jarRadius(ny) {
      const u = clamp((1.0 - ny) * 0.5, 0, 1) * (MEASURED_RADII.length - 1);
      const i0 = Math.floor(u);
      const i1 = Math.min(MEASURED_RADII.length - 1, i0 + 1);
      const f = u - i0;
      // Scale radial profile by 0.985 to compensate for particle glow sprite radius so outer W/H = 0.498 (1:1 with video jar)
      return (MEASURED_RADII[i0] * (1 - f) + MEASURED_RADII[i1] * f) * 0.985;
    }

    // 1. Pre-bake glowing particle dot sprite
    function makeDotSprite(size, coreCol, midCol, outerCol) {
      const sc = document.createElement('canvas');
      sc.width = size;
      sc.height = size;
      const sctx = sc.getContext('2d');
      const r = size * 0.5;
      const g = sctx.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0.0, coreCol);
      g.addColorStop(0.26, midCol);
      g.addColorStop(0.64, outerCol);
      g.addColorStop(1.0, 'rgba(0,0,0,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, size, size);
      return sc;
    }

    // 2. Pre-bake sparkling star-particle sprite with compact, shorter micro-rays
    function makeStarSprite(size) {
      const sc = document.createElement('canvas');
      sc.width = size;
      sc.height = size;
      const sctx = sc.getContext('2d');
      const r = size * 0.5;
      const g = sctx.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
      g.addColorStop(0.20, 'rgba(235, 245, 255, 0.82)');
      g.addColorStop(0.50, 'rgba(165, 205, 255, 0.18)');
      g.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, size, size);

      // Shorter, delicate 4-point micro-rays (only ~54% of radius so rays don't stick out too far)
      const rayHalf = r * 0.54;
      const hGrad = sctx.createLinearGradient(r - rayHalf, r, r + rayHalf, r);
      hGrad.addColorStop(0, 'rgba(255,255,255,0)');
      hGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
      hGrad.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.strokeStyle = hGrad;
      sctx.lineWidth = 0.9;
      sctx.beginPath();
      sctx.moveTo(r - rayHalf, r);
      sctx.lineTo(r + rayHalf, r);
      sctx.stroke();

      const vGrad = sctx.createLinearGradient(r, r - rayHalf, r, r + rayHalf);
      vGrad.addColorStop(0, 'rgba(255,255,255,0)');
      vGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
      vGrad.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.strokeStyle = vGrad;
      sctx.beginPath();
      sctx.moveTo(r, r - rayHalf);
      sctx.lineTo(r, r + rayHalf);
      sctx.stroke();
      return sc;
    }

    const spriteBody = makeDotSprite(
      14,
      'rgba(255, 255, 255, 1)',
      'rgba(215, 232, 255, 0.54)',
      'rgba(130, 175, 235, 0.10)'
    );
    const spriteStar = makeStarSprite(16);

    const surfacePts = [];

    // Build 3D star-particle lattice across the entire jar surface (ny in [-1.0 .. +1.0])
    // Precomputes nx, nz, sinPhase, cosPhase so frame(dt) executes with zero trig/pow calls per particle (locked 60fps)
    (() => {
      let rng = 4242;
      const rand = () => {
        rng = (rng * 16807) % 2147483647;
        return (rng - 1) / 2147483646;
      };

      const N_RINGS = 58;
      const FEATURE_YS = [0.985, 0.68, 0.60, 0.26, -0.68, -0.85, -0.985];

      for (let i = 0; i < N_RINGS; i++) {
        const v = i / (N_RINGS - 1);
        const ny = -0.992 + v * 1.984;
        const r = jarRadius(ny);
        const isFeature = FEATURE_YS.some(fy => Math.abs(ny - fy) < 0.015);
        const nRad = Math.round(r * (isFeature ? 92 : 68));
        const offset = (i % 2) * (Math.PI / nRad);

        for (let j = 0; j < nRad; j++) {
          const theta = (j / nRad) * Math.PI * 2 + offset + (rand() - 0.5) * 0.010;
          const yJit = ny + (rand() - 0.5) * 0.005;
          const isStar = rand() < (isFeature ? 0.28 : 0.15);
          const phase = rand() * Math.PI * 2;
          const nx = Math.sin(theta);
          const nz = -Math.cos(theta);
          const sizeMul = 0.88 + 0.44 * Math.pow(rand(), 1.35);
          const baseRad = isStar ? 3.15 : (isFeature ? 2.85 : 2.45);
          surfacePts.push({
            x: r * nx,
            y: yJit,
            z: r * nz,
            nx,
            nz,
            isFeature,
            isStar,
            sinP: Math.sin(phase),
            cosP: Math.cos(phase),
            rBase: baseRad * sizeMul
          });
        }
      }

      // Top cap concentric dot rings at ny = +0.992
      for (let ri = 1; ri <= 8; ri++) {
        const rCap = (0.045 + (ri / 8) * 0.36) * 0.985;
        const nC = Math.max(8, Math.round(rCap * 64));
        for (let j = 0; j < nC; j++) {
          const theta = (j / nC) * Math.PI * 2;
          const isFeature = ri === 8;
          const isStar = rand() < 0.18;
          const phase = rand() * Math.PI * 2;
          const nx = Math.sin(theta);
          const nz = -Math.cos(theta);
          const sizeMul = 0.88 + 0.35 * rand();
          const baseRad = isStar ? 3.15 : (isFeature ? 2.85 : 2.45);
          surfacePts.push({
            x: rCap * nx,
            y: 0.992,
            z: rCap * nz,
            nx,
            nz,
            isFeature,
            isStar,
            sinP: Math.sin(phase),
            cosP: Math.cos(phase),
            rBase: baseRad * sizeMul
          });
        }
      }
    })();

    function resize() {
      const parent = cv.parentElement;
      if (!parent) return;
      const cw = parent.clientWidth;
      const ch = parent.clientHeight;
      if (cw < 40 || ch < 40) return;
      dpr = 1;
      w = Math.round(cw);
      h = Math.round(ch);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
    }
    resize();

    cv.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw += dx * 0.012;
      pitch = clamp(pitch + dy * 0.005, -0.06, 0.18);
    });
    const endDrag = () => { dragging = false; };
    cv.addEventListener('pointerup', endDrag);
    cv.addEventListener('pointercancel', endDrag);

    function frame(dt) {
      if (w < 40 || h < 40) {
        resize();
        if (w < 40 || h < 40) return;
      }
      t += dt;
      if (!dragging) {
        yaw += dt * 0.44;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Pure #000000 black background without any lines or gradients
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Match the exact 1:1 physical pixel height, width, and vertical alignment of the jar in the right-hand video monitor:
      const vidScale = Math.max(w / 1920, h / 1080);
      const vt = clamp(vidCan ? (vidCan.currentTime || 0.2) : 0.2, 0, 5.75);
      const halfHeight1080 = 351.0 + 20.35 * vt;
      const cx = w * 0.5;
      const cy = h * 0.5 + (546.0 - 540.0) * vidScale;
      const scale = halfHeight1080 * vidScale;
      const invScale = 1.0 / scale;
      const cyA = Math.cos(yaw), syA = Math.sin(yaw);
      const cpA = Math.cos(pitch), spA = Math.sin(pitch);
      const sinT = Math.sin(t * 3.4), cosT = Math.cos(t * 3.4);
      // Telephoto studio camera distance (dist = 18) so width/height ratio stays 1:1 identical to the studio video
      const dist = 18.0;
      const scaleDist = scale * dist;

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Fast zero-trig particle loop for locked 60fps rendering
      const nPts = surfacePts.length;
      for (let i = 0; i < nPts; i++) {
        const p = surfacePts[i];
        const x1 = p.x * cyA - p.z * syA;
        const z1 = p.x * syA + p.z * cyA;
        const y2 = p.y * cpA + z1 * spA;
        const z2 = -p.y * spA + z1 * cpA;
        const k = scaleDist / (dist + z2);
        const sx = cx + x1 * k;
        const sy = cy - y2 * k;

        const nxC = p.nx * cyA - p.nz * syA;
        const nzC = p.nx * syA + p.nz * cyA;
        const front = nzC < 0;
        const absNx = nxC < 0 ? -nxC : nxC;
        const rim = absNx * absNx * (0.62 + 0.38 * absNx);
        const light = nxC * -0.38 + nzC * -0.88;
        const posLight = light > 0 ? light : 0;
        const twinkle = 0.84 + 0.16 * (sinT * p.cosP + cosT * p.sinP);

        let alpha = front ? (0.26 + 0.45 * posLight + 0.64 * rim) : (0.09 + 0.15 * rim);
        if (p.isFeature && front) alpha *= 1.22;
        alpha *= twinkle;

        const rPx = p.rBase * (k * invScale);
        ctx.globalAlpha = alpha > 1 ? 1 : (alpha < 0.05 ? 0.05 : alpha);
        ctx.drawImage(
          p.isStar && front ? spriteStar : spriteBody,
          sx - rPx,
          sy - rPx,
          rPx * 2,
          rPx * 2
        );
      }

      ctx.restore();
    }

    return { resize, frame };
  })();

  function stepProduct3DWidgets(dt, activeSlideIdx) {
    if (activeSlideIdx === 12 && can3dWidget) can3dWidget.frame(dt);
  }

  /* ---------------- 5. PROFILE & CONTACTS CONFIGURATION ---------------- */
  const PROFILE_KEY = 'personal-dossier-profile-v2';
  const profileModal = $('#profile-modal');
  const profileForm = $('#profile-form');

  function loadProfileData() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.name && $('#profile-name-badge')) {
        $('#profile-name-badge').textContent = d.name;
        $('#profile-name-badge').dataset.ru = d.name;
        $('#profile-name-badge').dataset.en = d.name;
        if ($('#inp-name')) $('#inp-name').value = d.name;
      }
      if (d.brand && $('#brand-name')) {
        $('#brand-name').textContent = d.brand;
        if ($('#inp-brand')) $('#inp-brand').value = d.brand;
      }
      if (d.tg) {
        if ($('#contact-tg-text')) $('#contact-tg-text').textContent = d.tg;
        if ($('#contact-tg-link')) {
          const clean = d.tg.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
          $('#contact-tg-link').href = d.tg.startsWith('http') ? d.tg : `https://t.me/${clean}`;
        }
        if ($('#inp-tg')) $('#inp-tg').value = d.tg;
      }
      if (d.hh) {
        if ($('#contact-hh-link')) $('#contact-hh-link').href = d.hh;
        if ($('#inp-hh')) $('#inp-hh').value = d.hh;
      }
      if (d.email) {
        if ($('#contact-email-text')) $('#contact-email-text').textContent = d.email;
        if ($('#inp-email')) $('#inp-email').value = d.email;
      }
      if (d.phone) {
        if ($('#contact-phone-text')) $('#contact-phone-text').textContent = d.phone;
        if ($('#inp-phone')) $('#inp-phone').value = d.phone;
      }
    } catch (_) {}
  }

  const openModal = () => {
    if (!profileModal) return;
    profileModal.hidden = false;
    profileModal.setAttribute('aria-hidden', 'false');
  };
  const closeModal = () => {
    if (!profileModal) return;
    profileModal.hidden = true;
    profileModal.setAttribute('aria-hidden', 'true');
  };
  $('#open-profile-editor')?.addEventListener('click', openModal);
  $('#open-profile-editor-2')?.addEventListener('click', openModal);
  $('#close-profile-modal')?.addEventListener('click', closeModal);
  $('#cancel-profile-modal')?.addEventListener('click', closeModal);
  profileModal?.addEventListener('click', e => {
    if (e.target === profileModal) closeModal();
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && profileModal && !profileModal.hidden) closeModal();
  });

  profileForm?.addEventListener('submit', e => {
    e.preventDefault();
    const d = {
      name: $('#inp-name')?.value?.trim() || 'ПЕРСОНАЛЬНЫЙ ПРОФИЛЬ // ДОСЬЕ СПЕЦИАЛИСТА',
      brand: $('#inp-brand')?.value?.trim() || 'МОЁ ДОСЬЕ',
      tg: $('#inp-tg')?.value?.trim() || '@specialist_contact',
      hh: $('#inp-hh')?.value?.trim() || 'https://hh.ru/',
      email: $('#inp-email')?.value?.trim() || 'dossier@specialist.ru',
      phone: $('#inp-phone')?.value?.trim() || '+7 (999) 000-00-00'
    };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(d)); } catch (_) {}
    loadProfileData();
    closeModal();
  });

  function copyContactCredentials() {
    const email = $('#contact-email-text')?.textContent || '';
    const phone = $('#contact-phone-text')?.textContent || '';
    navigator.clipboard?.writeText(`${email} | ${phone}`).catch(() => {});
    const lbl = $('#copy-status-label');
    if (lbl) {
      const prev = lbl.textContent;
      lbl.textContent = curLang === 'ru' ? 'РЕКВИЗИТЫ СКОПИРОВАНЫ [OK]' : 'CREDENTIALS COPIED [OK]';
      setTimeout(() => { lbl.textContent = prev; }, 2000);
    }
  }
  $('#copy-email-card')?.addEventListener('click', copyContactCredentials);
  $('#copy-email-card')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copyContactCredentials();
    }
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- 7. STATIONARY STREAM DECK CONTROLLER ---------------- */
  const sections = $$('.ph-deck > section');
  const depthItems = sections.map(sec => $$('[data-depth]', sec).map(el => ({ el, k: parseFloat(el.dataset.depth || '1') })));
  const swipeItems = sections.map(sec => $$('[data-swipe]', sec).map(el => ({ el, k: parseFloat(el.dataset.swipe || '1') })));
  const splitItems = sections.map(sec => $$('[data-split]', sec).map(el => ({ el, dir: parseFloat(el.dataset.split || '1') })));
  const rail = $('#ph-rail');
  const progress = $('.ph-progress i');
  const stageLabel = $('#ph-stage-label');
  const prevBtn = $('#ph-prev');
  const nextBtn = $('#ph-next');
  const navBtns = $$('#ph-nav button[data-goto]');
  const total = sections.length;

  const railBtns = sections.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Раздел ${i + 1}`);
    b.addEventListener('click', () => goTo(i));
    rail?.appendChild(b);
    return b;
  });

  let targetIdx = 0;
  let fromIdx = 0;
  let transProgress = 1;
  let transDir = 1;
  let pos = 0;
  let deckSettled = false;
  let specArmed = false;

  const navEl = $('#ph-nav');
  const navLiquidPill = $('#ph-nav-liquid-pill');
  const navLiquidHover = $('#ph-nav-liquid-hover');
  let prevPillLeft = null;
  let pillStretchTimer = 0;

  function syncNavLiquidPill(animateStretch = true) {
    if (!navEl || !navLiquidPill) return;
    if (!isMobileViewport() && navEl.scrollWidth <= navEl.clientWidth + 4 && navEl.scrollLeft !== 0) {
      navEl.scrollLeft = 0;
    }
    const activeBtn = navBtns.find(b => b.classList.contains('is-active')) || navBtns[0];
    if (!activeBtn) return;
    const x = activeBtn.offsetLeft;
    const w = activeBtn.offsetWidth;
    if (w < 10) return;

    if (!animateStretch) {
      navLiquidPill.style.transition = 'none';
    }
    navLiquidPill.style.setProperty('--pill-x', `${x}px`);
    navLiquidPill.style.setProperty('--pill-w', `${w}px`);
    if (!animateStretch) {
      void navLiquidPill.offsetWidth;
      navLiquidPill.style.transition = '';
    }
    if (isMobileViewport() || (navEl.scrollWidth > navEl.clientWidth + 4)) {
      centerScrollableButton(navEl, activeBtn, animateStretch);
      requestAnimationFrame(() => centerScrollableButton(navEl, activeBtn, false));
    }

    if (animateStretch && prevPillLeft !== null && Math.abs(x - prevPillLeft) > 4) {
      navLiquidPill.style.setProperty('--glint-x', x > prevPillLeft ? '48%' : '-48%');
      navLiquidPill.classList.add('is-stretching');
      clearTimeout(pillStretchTimer);
      pillStretchTimer = setTimeout(() => {
        navLiquidPill.style.setProperty('--glint-x', '0%');
        navLiquidPill.classList.remove('is-stretching');
      }, 210);
    }
    prevPillLeft = x;
  }

  if (navEl && navLiquidHover) {
    navBtns.forEach(btn => {
      btn.addEventListener('pointerenter', () => {
        const x = btn.offsetLeft;
        const w = btn.offsetWidth;
        navLiquidHover.style.setProperty('--hover-x', `${x}px`);
        navLiquidHover.style.setProperty('--hover-w', `${w}px`);
        navLiquidHover.style.setProperty('--hover-op', btn.classList.contains('is-active') ? '0' : '1');
      });
    });
    navEl.addEventListener('pointerleave', () => {
      navLiquidHover.style.setProperty('--hover-op', '0');
    });
  }
  if (navEl && typeof ResizeObserver === 'function') {
    new ResizeObserver(() => syncNavLiquidPill(false)).observe(navEl);
  }
  document.fonts?.ready?.then(() => {
    syncNavLiquidPill(false);
    syncSkillLiquidPill(false);
  });

  updateHUD = () => {
    document.body.dataset.activeSlide = String(targetIdx);
    const sec = sections[targetIdx];
    const title = curLang === 'ru' ? (sec?.dataset.stageRu || '') : (sec?.dataset.stageEn || '');
    if (stageLabel) stageLabel.textContent = window.DossierSite?.translate(title,curLang) || title || (curLang === 'ru' ? 'ДОСЬЕ СПЕЦИАЛИСТА' : 'SPECIALIST DOSSIER');
    if (progress) progress.style.setProperty('--p', total > 1 ? String(targetIdx / (total - 1)) : '0');
    if (prevBtn) prevBtn.disabled = targetIdx <= 0;
    if (nextBtn) nextBtn.disabled = targetIdx >= total - 1;
    railBtns.forEach((b, i) => b.classList.toggle('is-active', i === targetIdx));
    sections.forEach((s, i) => s.classList.toggle('is-current', i === targetIdx));
    navBtns.forEach(btn => {
      if (btn.dataset.navSlides) {
        const group = btn.dataset.navSlides.split(',').map(n => parseInt(n.trim(), 10));
        btn.classList.toggle('is-active', group.includes(targetIdx));
      } else {
        const idx = parseInt(btn.dataset.goto, 10);
        btn.classList.toggle('is-active', idx === targetIdx);
      }
    });
    syncNavLiquidPill(true);
    if (targetIdx === 1) {
      requestAnimationFrame(() => syncSkillLiquidPill(false));
    }
    if (navLiquidHover) navLiquidHover.style.setProperty('--hover-op', '0');
  };

  function goTo(idx, opts = {}) {
    syncUrlHash(idx);
    const next = clamp(idx, 0, total - 1);
    if (next === targetIdx) {
      syncNavLiquidPill(false);
      return false;
    }
    fromIdx = targetIdx;
    transDir = next > fromIdx ? 1 : -1;
    targetIdx = next;
    setMenu(false);
    $$('.ph-bp-tooltip').forEach(tip => tip.classList.remove('is-visible'));
    pos = targetIdx;

    // Start the compositor-driven slide transition first (unhides the target slide so layout is valid for entry hooks)
    playDeckTransition(fromIdx, targetIdx, transDir);
    const nextSec = sections[targetIdx];
    if (nextSec && nextSec.__vis !== true) {
      nextSec.__vis = true;
      nextSec.classList.remove('is-offscreen');
      nextSec.style.visibility = 'visible';
    }
    if (nextSec && nextSec.scrollTop) {
      nextSec.scrollTop = 0;
    }

    // Reset Competencies timeline cleanly when entering Slide 02 (idx 1)
    if (targetIdx === 1) {
      catElapsed = 0;
      applyCategoryFilter('all', false);
    }

    // Trigger 16:9 Monitor -> 9:16 Phone Apple Continuity emergence every time Slide 02 (idx 2) is entered, pause when leaving
    if (targetIdx === 2) {
      videoSlideEnteredOnce = true;
      runMonitorToPhoneDeployment();
    } else {
      clearTimeout(emergeTimer);
      clearTimeout(videoStartTimer);
      // Keep the current choreo state (phone stays deployed) so the slide leaves exactly as the user saw it.
      // The reset to 'monitor-only' happens on the next entry in runMonitorToPhoneDeployment().
      try { videoVert?.pause(); } catch (_) {}
      try { videoWide?.pause(); } catch (_) {}
    }

    // Reset Systems timeline & trigger strict sequential block fly-in when entering Systems Page 1 (idx 7)
    if (targetIdx === 7) {
      techAndAi3dEngine.resize();
      aiElapsed = 0;
      applyAiTier('all', false);
      triggerBlueprintFlyIn(aiBlueprintStage);
    }

    // Trigger strict sequential block fly-in on Systems Page 2 (idx 8)
    if (targetIdx === 8) {
      techAndAi3dEngine.resize();
      triggerBlueprintFlyIn(aiPageStage);
    }

    // AI 2-Page Motion Controller (Slide 05 = Verified Providers Showcase, Slide 06 = Docked Icons + Full Product Matrix)
    if (targetIdx === 5) {
      resetAiPage2Highlight();
      techAndAi3dEngine.resize();
      techAndAi3dEngine.step(0.016, 5, false);
      startAiVendorsShowcase(fromIdx === 6);
    } else if (targetIdx === 6) {
      techAndAi3dEngine.resize();
      techAndAi3dEngine.step(0.016, 6, false);
      stopAiVendorsShowcase(false);
      triggerAiPage2Reveal();
    } else {
      resetAiPage2Highlight();
      stopAiVendorsShowcase(false);
    }

    // Analytics scene (Slide 07): growth chart → iceberg → dive → metrics → CTS. Entering from the next tab resumes at the end.
    if (targetIdx === AN_IDX) anScene?.enter(!!opts.anFromEnd);
    else anScene?.leave();

    // Activate Products Showcase videos & signature Cinema-Shutter reveal when entering any of the 3 Products Pages (idx 10, 11, 12)
    syncProductPageVideos(targetIdx);
    if (targetIdx === 10 || targetIdx === 11 || targetIdx === 12) {
      triggerProductsShowcaseAnim(sections[targetIdx]);
    }
    if (targetIdx === 12) can3dWidget?.resize();

    updateHUD();
    return true;
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest?.('[data-goto]');
    if (!btn || btn.id === 'ai-skip-to-p2-btn' || btn.id === 'ai-replay-from-p2-btn') return;
    const idx = parseInt(btn.getAttribute('data-goto'), 10);
    if (!Number.isNaN(idx)) {
      if (idx === 6 && targetIdx === 6) {
        triggerAiPage2Reveal(0);
      } else if (idx === AN_IDX && targetIdx === AN_IDX) {
        anScene?.enter(false);
      } else if (idx === 4 && targetIdx === 4) {
        window.SmmPages?.go(0);
      } else if (idx === 9 && targetIdx === 9) {
        window.ToolsPages?.go(0);
      } else {
        goTo(idx);
      }
    }
  });

  // Motion-video quintic ease-out / smooth-step for 60fps two-slide transitions without intermediate slide flashing
  function easeMotionVideo(t) {
    const x = clamp(t, 0, 1);
    return 1 - Math.pow(1 - x, 3.35);
  }

  /* A short defocus closes the current page before the next one appears.
     The incoming section is measurable for its scene setup, but fully transparent
     until the outgoing animation ends. No readable layers overlap. */
  const DECK_EASE_IN = 'cubic-bezier(0.16, 1, 0.3, 1)';
  let deckAnims = [];
  let deckToken = 0;

  function resetProductPartials(sec) {
    if (!sec || !sec.classList?.contains('ph-products')) return;
    const head = sec.querySelector('.ph-prod-head');
    const layout = sec.querySelector('.ph-prod-layout');
    if (head) head.style.opacity = '';
    if (layout) {
      layout.style.opacity = '';
      layout.style.transform = '';
      layout.style.filter = '';
    }
  }

  function hideDeckSection(sec) {
    resetProductPartials(sec);
    sec.__vis = false;
    sec.inert = true;
    sec.classList.add('is-offscreen');
    sec.style.visibility = 'hidden';
    sec.style.opacity = '0';
    sec.style.transform = '';
    sec.style.filter = '';
    sec.style.zIndex = '';
  }

  function showDeckSection(sec) {
    resetProductPartials(sec);
    sec.__vis = true;
    sec.inert = false;
    sec.classList.remove('is-offscreen');
    sec.style.visibility = 'visible';
    sec.style.opacity = '1';
    sec.style.transform = '';
    sec.style.filter = '';
  }

  function playDeckTransition(prevIdx, nextIdx, dir) {
    const token = ++deckToken;
    const inSec = sections[nextIdx];
    const outSec = prevIdx !== nextIdx ? sections[prevIdx] : null;
    if (!inSec) return;
    aiEnterDelayMs = 0;

    const isProdSwitch = (prevIdx >= 10 && prevIdx <= 12) && (nextIdx >= 10 && nextIdx <= 12);
    const outLayoutEl = isProdSwitch && outSec ? outSec.querySelector('.ph-prod-layout') : null;
    const curOutStyle = transProgress < 1
      ? (isProdSwitch ? (outLayoutEl ? getComputedStyle(outLayoutEl) : null) : (outSec ? getComputedStyle(outSec) : null))
      : null;
    const outFrame = curOutStyle
      ? { opacity: curOutStyle.opacity, transform: curOutStyle.transform }
      : (outSec ? { opacity: '1', transform: 'none' } : null);

    deckAnims.forEach(a => a.cancel());
    deckAnims = [];
    sections.forEach(sec => { if (sec !== inSec && sec !== outSec) hideDeckSection(sec); });
    showDeckSection(inSec);
    inSec.style.zIndex = '2';

    if (reduce || typeof inSec.animate !== 'function') {
      if (outSec) hideDeckSection(outSec);
      inSec.style.zIndex = '';
      transProgress = 1;
      return;
    }

    transProgress = 0;

    // Stationary header & mini-cards when switching between Products pages (Everest / Cake / Can):
    // Only the lower showcase stage (.ph-prod-layout) transitions while .ph-prod-head stays locked in place.
    if (isProdSwitch) {
      const outHead = outSec ? outSec.querySelector('.ph-prod-head') : null;
      const inLayout = inSec.querySelector('.ph-prod-layout');
      const exitDur = outFrame && Number(outFrame.opacity) > 0.01 ? (isMobileViewport() ? 120 : 150) : 0;

      if (outSec && outLayoutEl && exitDur) {
        showDeckSection(outSec);
        outSec.inert = true;
        outSec.style.zIndex = '1';
        if (outHead) outHead.style.opacity = '0';
        const outgoing = outLayoutEl.animate([
          { opacity: Number(outFrame.opacity) || 1, transform: outFrame.transform === 'none' ? 'translate3d(0,0,0)' : outFrame.transform },
          { opacity: 0, transform: `translate3d(0, ${-dir * 16}px, 0)` }
        ], { duration: exitDur, easing: 'cubic-bezier(.32,0,.67,1)', fill: 'forwards' });
        deckAnims.push(outgoing);
        outgoing.onfinish = () => {
          if (token !== deckToken) return;
          hideDeckSection(outSec);
          outgoing.cancel();
          deckAnims = deckAnims.filter(a => a !== outgoing);
        };
      } else if (outSec) {
        hideDeckSection(outSec);
      }

      if (inLayout) {
        const incoming = inLayout.animate([
          { opacity: 0, transform: `translate3d(0, ${dir * 18}px, 0)` },
          { opacity: 1, offset: 0.72 },
          { opacity: 1, transform: 'translate3d(0,0,0)' }
        ], { duration: isMobileViewport() ? 300 : 400, delay: exitDur, easing: DECK_EASE_IN, fill: 'backwards' });
        deckAnims.push(incoming);
        incoming.onfinish = () => {
          if (token !== deckToken) return;
          sections.forEach(sec => { if (sec !== inSec) hideDeckSection(sec); });
          inSec.style.zIndex = '';
          resetProductPartials(inSec);
          incoming.cancel();
          deckAnims = [];
          transProgress = 1;
        };
      } else {
        inSec.style.zIndex = '';
        transProgress = 1;
      }
      return;
    }

    /* AI section path (SMM -> AI, AI page 1 <-> page 2, AI -> Systems, Systems -> AI).
       Opacity + translate only: no blur and no scale, so type stays the same size from the first
       to the last frame. The outgoing page leaves first; the incoming section fades in without
       moving because its inner blocks run their own entry (see --ai-enter-delay in styles.css). */
    const isAiIdx = i => i === 5 || i === 6;
    const isTechIdx = i => i === 7 || i === 8;
    const isAiPath = isAiIdx(nextIdx) || (isAiIdx(prevIdx) && isTechIdx(nextIdx));
    if (isAiPath) {
      const mobile = isMobileViewport();
      const isPageFlip = isAiIdx(prevIdx) && isAiIdx(nextIdx);
      const exitDur = outFrame && Number(outFrame.opacity) > 0.01
        ? (isPageFlip ? (mobile ? 180 : 240) : (mobile ? 220 : 320))
        : 0;
      const exitTravel = isPageFlip ? 18 : 24;
      aiEnterDelayMs = exitDur;

      if (outSec && exitDur) {
        showDeckSection(outSec);
        outSec.inert = true;
        outSec.style.zIndex = '1';
        const outgoing = outSec.animate([
          { opacity: Number(outFrame.opacity) || 1, transform: 'translate3d(0, 0, 0)' },
          { opacity: 0, transform: `translate3d(0, ${-dir * exitTravel}px, 0)` }
        ], { duration: exitDur, easing: 'cubic-bezier(0.4, 0, 0.8, 0.5)', fill: 'forwards' });
        deckAnims.push(outgoing);
        outgoing.onfinish = () => {
          if (token !== deckToken) return;
          hideDeckSection(outSec);
          outgoing.cancel();
          deckAnims = deckAnims.filter(a => a !== outgoing);
        };
      } else if (outSec) {
        hideDeckSection(outSec);
      }

      // AI pages animate their own blocks, so the section itself only fades. Technologies pages
      // (when leaving AI backwards) get a short rise to match the outgoing direction.
      const incomingFrames = isAiIdx(nextIdx)
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: `translate3d(0, ${dir * 22}px, 0)` },
            { opacity: 1, transform: 'translate3d(0, 0, 0)' }
          ];
      const incoming = inSec.animate(incomingFrames, {
        duration: isAiIdx(nextIdx) ? (mobile ? 280 : 380) : (mobile ? 360 : 520),
        delay: exitDur,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      });
      deckAnims.push(incoming);
      incoming.onfinish = () => {
        if (token !== deckToken) return;
        sections.forEach(sec => { if (sec !== inSec) hideDeckSection(sec); });
        inSec.style.zIndex = '';
        incoming.cancel();
        deckAnims = [];
        transProgress = 1;
        if (targetIdx !== 5 && aiVendorsP1) aiVendorsP1.classList.remove('is-docking-up');
      };
      return;
    }

    const useBlur = false;
    const travel = 28;
    const exitDuration = outFrame && Number(outFrame.opacity) > 0.01 ? (isMobileViewport() ? 140 : 180) : 0;
    if (outSec && exitDuration) {
      showDeckSection(outSec);
      outSec.inert = true;
      outSec.style.zIndex = '1';
      const outKeyframes = useBlur
        ? [
            outFrame,
            { opacity: 0, transform: `translate3d(0, ${-dir * 18}px, 0)`, filter: isMobileViewport() ? 'blur(5px)' : 'blur(12px)' }
          ]
        : [
            { opacity: Number(outFrame.opacity) || 1, transform: outFrame.transform === 'none' ? 'translate3d(0,0,0)' : outFrame.transform },
            { opacity: 0, transform: `translate3d(0, ${-dir * 18}px, 0)` }
          ];
      const outgoing = outSec.animate(outKeyframes, { duration: exitDuration, easing: 'cubic-bezier(.32,0,.67,1)', fill: 'forwards' });
      deckAnims.push(outgoing);
      outgoing.onfinish = () => {
        if (token !== deckToken) return;
        hideDeckSection(outSec);
        outgoing.cancel();
        deckAnims = deckAnims.filter(a => a !== outgoing);
      };
    } else if (outSec) hideDeckSection(outSec);

    const inKeyframes = useBlur
      ? [
          { opacity: 0, transform: `translate3d(0, ${dir * travel}px, 0)`, filter: isMobileViewport() ? 'blur(3px)' : 'blur(8px)' },
          { opacity: 1, filter: 'blur(0px)', offset: 0.72 },
          { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0px)' }
        ]
      : [
          { opacity: 0, transform: `translate3d(0, ${dir * travel}px, 0)` },
          { opacity: 1, offset: 0.72 },
          { opacity: 1, transform: 'translate3d(0,0,0)' }
        ];
    const incoming = inSec.animate(inKeyframes, { duration: isMobileViewport() ? 320 : 440, delay: exitDuration, easing: DECK_EASE_IN, fill: 'backwards' });
    deckAnims.push(incoming);
    incoming.onfinish = () => {
      if (token !== deckToken) return;
      sections.forEach(sec => { if (sec !== inSec) hideDeckSection(sec); });
      inSec.style.zIndex = '';
      incoming.cancel();
      deckAnims = [];
      transProgress = 1;
      if (targetIdx !== 5 && aiVendorsP1) aiVendorsP1.classList.remove('is-docking-up');
    };
  }

  // Kept for the main loop / init: only performs the one-time initial visibility setup now.
  function renderDeck(dt) {
    void dt;
    if (deckSettled) return;
    deckSettled = true;
    fromIdx = targetIdx;
    pos = targetIdx;
    sections.forEach((s, i) => {
      if (i === targetIdx) showDeckSection(s);
      else hideDeckSection(s);
    });
    if (transProgress >= 1 && targetIdx !== 5 && aiVendorsP1) {
      aiVendorsP1.classList.remove('is-docking-up');
    }
  }

  /* ---------------- 7c. ANALYTICS SCENE (SLIDE 07): GROWTH CHART → LIQUID-GLASS ICEBERG → DIVE → METRICS → CTS ----------------
     One continuous scene in 6 chapters. Wheel / keys / buttons walk the chapters first, then leave the tab.
     Stability rules: no CSS filters / backdrop-filter; the camera is a single compositor translate of the world layer;
     SVG strokes are drawn once (dashoffset) and never animate while the camera is moving. */
  const anSec = $('#sec-analytics');
  const AN_IDX = sections.indexOf(anSec);
  const anScene = (() => {
    if (!anSec || AN_IDX < 0) return null;
    const vp = $('#ph-an-viewport');
    const world = $('#ph-an-world');
    const svg = $('#ph-an-svg');
    const layer = $('#ph-an-layer');
    const depthEl = $('#ph-an-depth');
    const depthLayerEl = $('#ph-an-depth-layer');
    const metricsEl = $('#ph-an-metrics');
    const switchEl = $('#ph-an-switch');
    const switchPill = $('#ph-an-switch-pill');
    const switchBtns = $$('[data-an-go]', anSec);
    if (!vp || !world || !svg || !layer) return null;

    const CH_MAX = 5;
    const AXIS = 0.80;            // waterline / chart X-axis: share of the viewport height from the top
    let ch = -1;
    let W = 0, H = 0, worldH = 0;
    let cams = [0, 0, 0, 0, 0, 0];
    let lockUntil = 0;
    let depthRaf = 0;
    let shownDepth = 0;
    let prevSwitchX = null;
    const L = (ru, en) => (curLang === 'en' ? en : ru);

    /* Graph: x = share of width, h = height above the waterline as a share of the viewport height.
       Segment A only ever rises and stops dead at the middle; segment B climbs to the crown and drops to the water. */
    const PATH_A = [[0.03, 0.04], [0.09, 0.06], [0.11, 0.10], [0.18, 0.12], [0.20, 0.16], [0.27, 0.175], [0.29, 0.215], [0.36, 0.23], [0.38, 0.27], [0.45, 0.285], [0.47, 0.325], [0.50, 0.335]];
    const MARKERS = [2, 4, 6, 8, 10];
    const PATH_B = [[0.50, 0.335], [0.53, 0.43], [0.555, 0.51], [0.58, 0.61], [0.60, 0.67], [0.625, 0.63], [0.655, 0.52], [0.69, 0.39], [0.73, 0.25], [0.77, 0.12], [0.81, 0.0]];
    const BODY = [[0.81, 0], [0.88, -0.13], [0.91, -0.40], [0.89, -0.74], [0.86, -1.04], [0.83, -1.32], [0.63, -1.52], [0.48, -1.62], [0.33, -1.54], [0.13, -1.32], [0.10, -1.06], [0.075, -0.76], [0.045, -0.42], [0.035, -0.14], [0.03, 0]];
    const CORE = [0.48, -1.70];

    const TOP5 = [
      ['Яндекс Метрика', 'Yandex Metrica', 'Посещаемость, отказы, Вебвизор', 'Traffic, bounce rate, Webvisor'],
      ['Яндекс Вордстат', 'Yandex Wordstat', 'Объём спроса и сезонность в РФ', 'Demand volume & seasonality in RU'],
      ['Яндекс Директ', 'Yandex Direct', 'Прогноз бюджета, CTR и CPC', 'Budget, CTR & CPC forecast'],
      ['Google Analytics 4', 'Google Analytics 4', 'Воронки, события и когорты (GA4)', 'Funnels, events & cohorts (GA4)'],
      ['Google Trends', 'Google Trends', 'Мировые и локальные тренды спроса', 'Global & local demand trends']
    ];
    const LAYERS = [
      { m: 10, h: -0.24, ch: 2, t: 'SEO, спрос и видимость', te: 'SEO, demand & visibility', tools: [
        ['Яндекс Вебмастер', 'Yandex Webmaster', 'Индексация, ИКС и позиции в Яндексе', 'Indexing, SQI & Yandex rankings'],
        ['Букварикс · Key Collector', 'Bukvarix · Key Collector', 'Семантика и частотность запросов РФ', 'RU semantics & query frequency'],
        ['Google Search Console', 'Google Search Console', 'Показы, клики и органический CTR', 'Impressions, clicks & organic CTR'],
        ['Exploding Topics', 'Exploding Topics', 'Мировые тренды до пика спроса', 'Global trends before they peak']
      ] },
      { m: 40, h: -0.50, ch: 2, t: 'Конкурентная и маркетплейс-аналитика', te: 'Competitor & marketplace intel', tools: [
        ['Keys.so', 'Keys.so', 'Ключи, объявления и бюджеты конкурентов', 'Competitor keywords, ads & budgets'],
        ['MPStats', 'MPStats', 'Продажи, ниши и карточки WB · Ozon', 'Sales, niches & SKUs on WB · Ozon'],
        ['SimilarWeb', 'SimilarWeb', 'Трафик и источники любого сайта в мире', 'Global traffic & sources of any website'],
        ['AdHeart · TikTok CC', 'AdHeart · TikTok CC', 'Мировые библиотеки рекламных креативов', 'Global ad creative libraries']
      ] },
      { m: 120, h: -0.76, ch: 2, t: 'Медиа, соцсети и поведение', te: 'Media, social & behaviour', tools: [
        ['TGStat · Telemetr', 'TGStat · Telemetr', 'Охват, ERR и проверка Telegram-каналов', 'Reach, ERR & Telegram channel checks'],
        ['TargetHunter · LiveDune', 'TargetHunter · LiveDune', 'Аудитория ВК, вовлечённость и соцсети РФ', 'VK audience, engagement & RU social'],
        ['Яндекс Аудитории · Взгляд', 'Yandex Audiences · Vzglyad', 'Сегменты look-alike и опросы аудитории', 'Look-alike segments & user surveys'],
        ['Microsoft Clarity', 'Microsoft Clarity', 'Тепловые карты кликов и записи сессий', 'Click heatmaps & session recordings']
      ] },
      { m: 220, h: -1.04, ch: 3, t: 'Продуктовая и мобильная аналитика', te: 'Product & mobile analytics', tools: [
        ['AppMetrica', 'AppMetrica', 'Мобильная аналитика РФ, когорты и LTV', 'RU mobile analytics, cohorts & LTV'],
        ['MyTracker', 'MyTracker', 'Мультиплатформенная атрибуция и ARPU', 'Multi-platform attribution & ARPU'],
        ['Amplitude · PostHog', 'Amplitude · PostHog', 'Продуктовые воронки, Retention и DAU/MAU', 'Product funnels, Retention & DAU/MAU']
      ] },
      { m: 300, h: -1.32, ch: 3, t: 'Сквозная аналитика, CRM и BI', te: 'End-to-end, CRM & BI', tools: [
        ['Roistat · Calltouch', 'Roistat · Calltouch', 'Сквозная аналитика, коллтрекинг и ROMI', 'End-to-end analytics, call tracking & ROMI'],
        ['AmoCRM · Bitrix24', 'AmoCRM · Bitrix24', 'Воронка сделок, продажи, AOV и LTV в CRM', 'Deal pipeline, sales, AOV & LTV in CRM'],
        ['Yandex DataLens · Power BI', 'Yandex DataLens · Power BI', 'Интерактивные BI-дашборды и отчёты', 'Interactive BI dashboards & reporting'],
        ['Excel · Google Sheets · UTM', 'Excel · Google Sheets · UTM', 'Unit-экономика, точка безубыточности и UTM', 'Unit economics, break-even point & UTM']
      ] }
    ];
    const DEPTH_BY_CH = [0, 0, 120, 300, 300, 300];
    // Time on each chapter before the scene moves on by itself (animation + time to read). The last chapter stays.
    const DWELL = [7200, 7400, 8800, 7800, 13000, 0];
    const switchProg = $('#ph-an-switch-prog');
    let autoTimer = 0;
    let progAnim = null;

    /* Metrics, sorted along the funnel and grouped by stage (no arbitrary example numbers — pure analytical meaning):
       [abbr, name RU, name EN, formula RU, formula EN, purpose RU, purpose EN, source RU, source EN] */
    const METRIC_GROUPS = [
      { k: '01', t: 'Трафик и реклама', te: 'Traffic & ads', rows: [
        ['Impr', 'Показы объявления', 'Ad impressions', 'Видимые показы в сети', 'Visible ad views', 'Оценка объёма охвата', 'Audience reach volume', 'Директ · VK · TGStat', 'Direct · VK · TGStat'],
        ['CPM', 'Цена пакета показов', 'Cost per impressions', 'Расход ÷ Показы', 'Spend ÷ Impressions', 'Сравнение цены охвата', 'Comparing reach cost', 'Директ · MyTracker', 'Direct · MyTracker'],
        ['Clicks', 'Переходы по UTM', 'Visits via UTM tags', 'Визиты по UTM-меткам', 'Tagged source visits', 'Точный учёт трафика', 'Traffic attribution', 'Метрика · GA4 · UTM', 'Metrica · GA4 · UTM'],
        ['CTR', 'Кликабельность', 'Click-through rate', 'Clicks ÷ Impr', 'Clicks ÷ Impr', 'Сила оффера и креатива', 'Offer & ad strength', 'Директ · GSC · Keys.so', 'Direct · GSC · Keys.so'],
        ['CPC', 'Стоимость клика', 'Cost per click', 'Расход ÷ Clicks', 'Spend ÷ Clicks', 'Контроль цены трафика', 'Traffic cost control', 'Директ · DataLens', 'Direct · DataLens']
      ] },
      { k: '02', t: 'Сайт и продукт', te: 'Site & product', rows: [
        ['BR', 'Показатель отказов', 'Bounce rate', 'Быстрые уходы ÷ Визиты', 'Quick exits ÷ Visits', 'Релевантность посадки', 'Landing relevance', 'Метрика · Clarity', 'Metrica · Clarity'],
        ['CR₁', 'Конверсия в заявку', 'Lead conversion rate', 'Заявки ÷ Clicks', 'Leads ÷ Clicks', 'Сила упаковки и оффера', 'Offer & UX efficiency', 'Метрика · GA4', 'Metrica · GA4'],
        ['CPL', 'Стоимость заявки', 'Cost per lead', 'Расход ÷ Заявки', 'Spend ÷ Leads', 'Цена привлечения лида', 'Lead cost economics', 'Roistat · Calltouch', 'Roistat · Calltouch'],
        ['DAU/MAU', 'Активность базы', 'Audience stickiness', 'Дневная ÷ Месячная', 'Daily ÷ Monthly users', 'Вовлечённость продукта', 'Product engagement', 'AppMetrica · Amplitude', 'AppMetrica · Amplitude'],
        ['Ret', 'Удержание (Retention)', 'User retention rate', 'Вернувшиеся ÷ Когорта', 'Returned ÷ Cohort', 'Возврат пользователей', 'Cohort retention', 'AppMetrica · PostHog', 'AppMetrica · PostHog']
      ] },
      { k: '03', t: 'Продажи и CRM', te: 'Sales & CRM', rows: [
        ['CR₂', 'Конверсия в оплату', 'Sale conversion rate', 'Продажи ÷ Заявки', 'Sales ÷ Leads', 'Качество лидов и продаж', 'Lead & sales quality', 'AmoCRM · Bitrix24', 'AmoCRM · Bitrix24'],
        ['CTS', 'Конверсия клика в чек', 'Click-to-sale rate', 'Продажи ÷ Clicks', 'Sales ÷ Clicks', 'Связка клика с кассой', 'Click-to-sale link', 'Roistat · AmoCRM', 'Roistat · AmoCRM'],
        ['CAC', 'Стоимость клиента', 'Customer acq. cost', 'Расход ÷ Продажи', 'Spend ÷ Sales', 'Цена платящего клиента', 'Buyer acquisition cost', 'Roistat · Calltouch', 'Roistat · Calltouch'],
        ['AOV', 'Средний чек заказа', 'Average order value', 'Выручка ÷ Продажи', 'Revenue ÷ Sales', 'База маржи с покупки', 'Order margin basis', 'AmoCRM · Bitrix24', 'AmoCRM · Bitrix24'],
        ['ARPU', 'Доход на юзера', 'Avg. revenue per user', 'Выручка ÷ Активная база', 'Revenue ÷ Active base', 'Монетизация аудитории', 'User monetisation', 'MyTracker · Amplitude', 'MyTracker · Amplitude']
      ] },
      { k: '04', t: 'Unit-экономика и BI', te: 'Unit economics & BI', rows: [
        ['LTV', 'Ценность клиента', 'Lifetime value', 'AOV × Частота × Срок', 'AOV × Freq × Lifespan', 'Доход за весь цикл', 'Total client revenue', 'AmoCRM · DataLens', 'AmoCRM · DataLens'],
        ['ДРР', 'Доля рекл. расходов', 'Ad cost of sales', 'Расход ÷ Выручка', 'Spend ÷ Revenue', 'Доля рекламы в обороте', 'Ad share of revenue', 'DataLens · Power BI', 'DataLens · Power BI'],
        ['ROAS', 'Окупаемость рекламы', 'Return on ad spend', 'Выручка ÷ Расход', 'Revenue ÷ Spend', 'Возврат оборота с рекламы', 'Revenue return on ads', 'Roistat · DataLens', 'Roistat · DataLens'],
        ['ROMI', 'Рентабельность маржи', 'Marketing ROI', 'Чистая маржа ÷ Расход', 'Net margin ÷ Spend', 'Прибыльность маркетинга', 'Net marketing profit', 'Excel · Google Sheets', 'Excel · Google Sheets'],
        ['BEP', 'Точка безубыточности', 'Break-even point', 'AOV × Маржа × CTS', 'AOV × Margin × CTS', 'Предел цены клика и лида', 'Break-even CPC ceiling', 'Excel · Google Sheets', 'Excel · Google Sheets']
      ] }
    ];

    /* Conclusions: 4 practical diagnostic scenarios backed by specific metrics & tools (no red, no fake example numbers) */
    const CASES = [
      { n: ['01 // Малый отклик на рекламу', '01 // Low response to ads'], tag: ['ПЕРЕСБОРКА ОФФЕРА', 'REBUILD OFFER'],
        data: [['Impr', 'Охват есть', 'Reach ok'], ['CTR', 'Мало кликов', 'Low CTR'], ['CPC', 'Дорогой клик', 'High CPC']],
        src: ['Директ · Keys.so', 'Direct · Keys.so'],
        c: ['Показы идут, но подача и оффер не цепляют целевой сегмент', 'Ads get views, but the offer fails to hook the audience'],
        p: ['Пересобрать заголовки, креативы и минусовать семантику', 'Rebuild headlines, creatives & cut irrelevant queries'],
        r: ['РОСТ ОТКЛИКА', 'RESPONSE UP'] },
      { n: ['02 // Большой охват без заявок', '02 // High traffic, few leads'], tag: ['ДОРАБОТКА ПОСАДКИ', 'FIX LANDING'],
        data: [['Clicks', 'Трафик идёт', 'Traffic ok'], ['BR', 'Рост отказов', 'High bounce'], ['CR₁', 'Мало заявок', 'Low leads']],
        src: ['Метрика · GA4 · Clarity', 'Metrica · GA4 · Clarity'],
        c: ['Переходы есть, но первый экран сайта не отвечает запросу', 'Visits flow in, but the first screen misses user intent'],
        p: ['Усилить оффер первого экрана и упростить форму заявки', 'Strengthen above-the-fold offer & simplify the form'],
        r: ['РОСТ КОНВЕРСИИ', 'CONVERSION UP'] },
      { n: ['03 // Заявки не переходят в оплату', '03 // Leads do not convert to sales'], tag: ['СИНХРОНИЗАЦИЯ CRM', 'SYNC CRM'],
        data: [['CPL', 'Лиды в норме', 'Leads ok'], ['CR₂', 'Мало оплат', 'Low sales'], ['CTS', 'Срыв сделок', 'Deal drop']],
        src: ['Roistat · AmoCRM · Bitrix24', 'Roistat · AmoCRM · Bitrix24'],
        c: ['Реклама даёт лиды, но сделки теряются при обработке в CRM', 'Ads bring leads, but deals stall during CRM follow-up'],
        p: ['Ускорить ответ в CRM, выровнять квалификацию и скрипты', 'Speed up CRM reply, align lead qualification & scripts'],
        r: ['РОСТ ПРОДАЖ', 'SALES UP'] },
      { n: ['04 // Удержание и масштабирование', '04 // Retention & scaling'], tag: ['МАСШТАБИРОВАНИЕ', 'SCALE'],
        data: [['LTV > CAC', 'Запас маржи', 'Margin ok'], ['Ret', 'Возврат базы', 'Retention'], ['ROMI', 'Окупаемость', 'Profitable']],
        src: ['AppMetrica · DataLens', 'AppMetrica · DataLens'],
        c: ['Экономика сходится: точка роста — масштаб и повторные чеки', 'Unit economics work: growth lies in scale & repeat sales'],
        p: ['Масштабировать связки и запустить возврат по когортам', 'Scale winning channels & launch cohort retention flows'],
        r: ['РОСТ ПРИБЫЛИ', 'PROFIT UP'] }
    ];

    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const t2 = (ru, en, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-en="${esc(en)}">${esc(ru)}</${tag}>`;

    /* ---- DOM (built once, before the language engine runs, so data-en swaps work) ---- */
    layer.innerHTML = [
      `<div class="ph-an-legend mono">${t2('РОСТ ПРОЕКТА', 'PROJECT GROWTH', 'b')}${t2('ТРАФИК → ЗАЯВКИ → ВЫРУЧКА', 'TRAFFIC → LEADS → REVENUE')}</div>`,
      TOP5.map((t, k) => `<div class="ph-an-card ph-an-glass" data-k="${k}" style="--i:${k}"><em class="mono">0${k + 1}</em>${t2(t[0], t[1], 'b')}${t2(t[2], t[3])}</div>`).join(''),
      TOP5.map((t, k) => `<div class="ph-an-pill ph-an-glass" data-k="${k}" style="--i:${k}"><em class="mono">0${k + 1}</em>${t2(t[0], t[1], 'b')}</div>`).join(''),
      `<div class="ph-an-dot" aria-hidden="true"><i></i></div>`,
      `<div class="ph-an-q">${t2('5 базовых инструментов', '5 basic tools', 'b')}${t2('КОТОРЫЕ ЗНАЮТ ВСЕ', 'THAT EVERYONE KNOWS', 'span', 'mono')}</div>`,
      `<div class="ph-an-tipcap">${t2('ВЕРХУШКА · 5 ИНСТРУМЕНТОВ (РФ И МИР)', 'THE TIP · 5 TOOLS (RU & GLOBAL)', 'span', 'mono')}${t2('Максимальный охват цифр.', 'The widest reach of numbers.', 'b')}</div>`,
      `<div class="ph-an-teaser">${t2('А что под водой?', 'And what is under the water?', 'b')}${t2('Ещё 19 связок инструментов · РФ и мир', '19 more tool stacks · RU & global', 'span', 'mono')}</div>`,
      LAYERS.map((l, li) => `<div class="ph-an-row" data-l="${li}" data-ch="${l.ch}" style="--l:${l.ch === 2 ? li : li - 3}">
        <div class="ph-an-row-k mono"><i>−${l.m} ${L('м', 'm')}</i>${t2(l.t, l.te)}</div>
        <div class="ph-an-chips">${l.tools.map((t, i) => `<div class="ph-an-chip ph-an-glass" style="--i:${i}">${t2(t[0], t[1], 'b')}${t2(t[2], t[3])}</div>`).join('')}</div>
      </div>`).join(''),
      `<div class="ph-an-core" aria-hidden="true"><i></i></div>`,
      `<div class="ph-an-endcap">${t2('ВСЁ ЭТО — ЦИФРЫ', 'ALL OF THIS IS NUMBERS', 'span', 'mono')}${t2('Цифры → данные.', 'Numbers → data.', 'b')}<button type="button" class="ph-an-cta ph-an-glass mono" data-an-go="4">${t2('Смотреть данные', 'See the data')} ↓</button></div>`
    ].join('');

    const mobileSummary = document.createElement('div');
    mobileSummary.className = 'mobile-an-summary';
    const mobileTool = t => `<article class="mobile-an-tool">${t2(t[0], t[1], 'strong')}${t2(t[2], t[3])}</article>`;
    mobileSummary.innerHTML = `<div class="mobile-an-panel" data-ch="0">
      ${t2('5 базовых инструментов', '5 basic tools', 'h3')}
      ${t2('Трафик, спрос и эффективность рекламы.', 'Traffic, demand and advertising performance.', 'p')}
      <div class="mobile-an-tools">${TOP5.map(mobileTool).join('')}</div>
      ${t2('Далее — 19 связок инструментов для подробного анализа.', 'Next: 19 tool stacks for deeper analysis.', 'p')}</div>` +
      [2,3].map(chapter => `<div class="mobile-an-panel" data-ch="${chapter}">${LAYERS.filter(l => l.ch === chapter).map(l =>
        `<div class="mobile-an-layer">${t2(l.t,l.te,'h4')}<div class="mobile-an-tools">${l.tools.map(mobileTool).join('')}</div></div>`
      ).join('')}</div>`).join('');
    vp.prepend(mobileSummary);

    if (metricsEl) {
      let ri = 0;
      const head = `<div class="ph-an-mhead mono">${t2('Метрика', 'Metric')}${t2('Что это', 'What it is')}${t2('Формула', 'Formula')}${t2('Зачем нужна', 'Purpose')}${t2('Источник', 'Source')}</div>`;
      const group = g => `<div class="ph-an-mgroup mono"><i>${g.k}</i>${t2(g.t, g.te)}</div>` + g.rows.map(m => `
          <div class="ph-an-mrow" style="--i:${ri++}">
            <b class="ph-an-mabbr">${esc(m[0])}</b>
            ${t2(m[1], m[2], 'span', 'ph-an-mname')}
            ${t2(m[3], m[4], 'code', 'ph-an-mf')}
            ${t2(m[5], m[6], 'span', 'ph-an-mnorm')}
            ${t2(m[7], m[8], 'span', 'ph-an-msrc')}
          </div>`).join('');
      metricsEl.innerHTML = `
        <div class="ph-an-panel-head">
          <div>${t2('05 // АНАЛИТИКА — КАК ЦИФРЫ СТАНОВЯТСЯ ДАННЫМИ', '05 // ANALYTICS — HOW NUMBERS BECOME DATA', 'span', 'mono ph-an-panel-k')}
          ${t2('Цифры → данные', 'Numbers → data', 'h3')}</div>
          <div class="ph-an-panel-legend mono">${t2('20 МЕТРИК · ПО ВОРОНКЕ: ТРАФИК → ПРОДУКТ → CRM → UNIT-ЭКОНОМИКА', '20 METRICS · ALONG THE FUNNEL: TRAFFIC → PRODUCT → CRM → UNIT ECONOMICS')}</div>
        </div>
        <div class="ph-an-mcols">
          <div class="ph-an-mcol">${head}${group(METRIC_GROUPS[0])}${group(METRIC_GROUPS[1])}</div>
          <div class="ph-an-mcol">${head}${group(METRIC_GROUPS[2])}${group(METRIC_GROUPS[3])}</div>
        </div>`;
    }

    const ctsEl = document.createElement('div');
    ctsEl.className = 'ph-an-cts';
    ctsEl.setAttribute('aria-label', 'Выводы и предложения');
    const lbl = (ru, en) => t2(ru, en, 'span', 'ph-an-case-l mono');
    ctsEl.innerHTML = `
      <div class="ph-an-panel-head">
        <div>${t2('06 // ВЫВОДЫ И ПРЕДЛОЖЕНИЯ', '06 // CONCLUSIONS & PROPOSALS', 'span', 'mono ph-an-panel-k')}
        ${t2('Данные → выводы', 'Data → conclusions', 'h3')}</div>
        <div class="ph-an-panel-legend mono">${t2('4 ТИПОВЫХ СЦЕНАРИЯ РЕШЕНИЙ НА БАЗЕ СОБРАННЫХ ДАННЫХ', '4 DIAGNOSTIC DECISION SCENARIOS BACKED BY COLLECTED DATA')}</div>
      </div>
      ${t2('Каждое предложение опирается на конкретный вид правильно собранных данных', 'Every proposal rests on a specific kind of correctly collected data', 'p', 'ph-an-concl-sub')}
      <div class="ph-an-cases">${CASES.map((c, i) => `
        <div class="ph-an-case ph-an-glass" style="--i:${i}">
          <div class="ph-an-case-top">${t2(c.n[0], c.n[1], 'b')}<em class="mono" data-en="${esc(c.tag[1])}">${esc(c.tag[0])}</em></div>
          <div class="ph-an-case-row">${lbl('Данные', 'Data')}<span class="ph-an-case-data">${c.data.map(d => `<span class="ph-an-dchip"><i>${esc(d[0])}</i><b data-en="${esc(d[2])}">${esc(d[1])}</b></span>`).join('')}</span>${t2(c.src[0], c.src[1], 'span', 'ph-an-case-src mono')}</div>
          <div class="ph-an-case-row">${lbl('Вывод', 'Conclusion')}${t2(c.c[0], c.c[1], 'span', 'ph-an-case-c')}</div>
          <div class="ph-an-case-row is-prop">${lbl('Предложение', 'Proposal')}${t2(c.p[0], c.p[1], 'span', 'ph-an-case-p')}${t2(c.r[0], c.r[1], 'span', 'ph-an-case-r mono')}</div>
        </div>`).join('')}
      </div>`;
    vp.appendChild(ctsEl);

    const cards = $$('.ph-an-card', layer);
    const pills = $$('.ph-an-pill', layer);
    const rows = $$('.ph-an-row', layer);
    const dotEl = $('.ph-an-dot', layer);
    const qEl = $('.ph-an-q', layer);
    const tipCap = $('.ph-an-tipcap', layer);
    const teaser = $('.ph-an-teaser', layer);
    const legend = $('.ph-an-legend', layer);
    const coreEl = $('.ph-an-core', layer);
    const endCap = $('.ph-an-endcap', layer);

    let curAxis = AXIS, curHScale = 1, curDScale = 1;
    const X = x => Math.round(x * W);
    const Y = h => Math.round((curAxis - (h >= 0 ? h * curHScale : h * curDScale)) * H);
    const ptsOf = arr => arr.map(([x, h]) => `${X(x)},${Y(h)}`).join(' ');
    const dOf = arr => 'M' + arr.map(([x, h]) => `${X(x)} ${Y(h)}`).join(' L');
    // Horizontal span of the iceberg body at a given depth (linear interpolation along the outline)
    function bodySpan(h) {
      const xs = [];
      for (let i = 0; i < BODY.length - 1; i++) {
        const [x1, h1] = BODY[i], [x2, h2] = BODY[i + 1];
        if ((h1 - h) * (h2 - h) <= 0 && h1 !== h2) xs.push(x1 + (x2 - x1) * ((h - h1) / (h2 - h1)));
      }
      return xs.length >= 2 ? [Math.min(...xs), Math.max(...xs)] : [0.2, 0.8];
    }
    const place = (el, x, y) => { el.style.left = `${Math.round(x)}px`; el.style.top = `${Math.round(y)}px`; };

    function buildSvg(fans) {
      const peak = PATH_B[4];
      const tipPts = [...PATH_A, ...PATH_B.slice(1), [0.03, 0]];
      const tipShade = [peak, ...PATH_B.slice(5), [0.60, 0]];
      const bodyShade = [[0.48, 0], ...BODY.slice(0, 8), [0.48, -1.60]];
      const S1 = [0.50, -0.45], S2 = [0.47, -1.05];
      const facets = [];
      BODY.slice(1, -1).forEach(p => facets.push([p, p[1] > -0.75 ? S1 : S2]));
      facets.push([S1, S2], [S1, [0.30, 0]], [S1, [0.62, 0]], [S2, [0.25, -1.36]], [S2, [0.71, -1.30]]);
      const tipFacets = [[PATH_A[4], [0.24, 0]], [PATH_A[8], [0.42, 0]], [peak, [0.52, 0]], [peak, [0.70, 0]], [PATH_B[6], [0.70, 0]], [PATH_B[2], [0.52, 0]]];
      const line = ([a, b], cls) => `<line class="${cls}" x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}"/>`;
      const rx = W - 16;
      let ruler = `<line class="an-ruler" x1="${rx}" y1="${Y(0)}" x2="${rx}" y2="${Y(-1.62)}"/>`;
      for (let k = 1; k <= 32; k++) {
        const y = Y(0) + (Y(-1.62) - Y(0)) * (k / 32);
        ruler += `<line class="an-tick${k % 4 === 0 ? ' is-major' : ''}" x1="${rx - (k % 4 === 0 ? 9 : 5)}" y1="${Math.round(y)}" x2="${rx}" y2="${Math.round(y)}"/>`;
      }
      const strata = LAYERS.map(l => `<line class="an-stratum s${l.ch}" x1="${X(0.012)}" y1="${Y(l.h)}" x2="${rx - 14}" y2="${Y(l.h)}"/>`).join('');
      const rays = [[0.18, 0.24, 0.42, 0.30], [0.44, 0.48, 0.62, 0.54], [0.64, 0.70, 0.86, 0.78]]
        .map(([a, b, c, d]) => `<polygon class="an-ray" points="${X(a)},${Y(0)} ${X(b)},${Y(0)} ${X(c)},${Y(-1.1)} ${X(d)},${Y(-1.1)}" fill="url(#anRayG)"/>`).join('');
      // Gentle static wave along the waterline (static: an animated SVG child would re-raster the whole world layer)
      let wave = `M${X(0.012)} ${Y(0)}`;
      for (let x = 0.012; x < 0.985; x += 0.02) wave += ` Q${X(x + 0.005)} ${Y(0) - 3} ${X(x + 0.01)} ${Y(0)} T${X(x + 0.02)} ${Y(0)}`;
      const markers = MARKERS.map((mi, k) => `<circle class="an-marker" style="--i:${k}" cx="${X(PATH_A[mi][0])}" cy="${Y(PATH_A[mi][1])}" r="4.5"/>`).join('');
      const grid = [0.2, 0.4, 0.6].map(h => `<line class="an-grid" x1="${X(0.012)}" y1="${Y(h)}" x2="${X(0.985)}" y2="${Y(h)}"/>`).join('');
      const leaders = (fans.leaders || []).map(([x1, y1, x2, y2], k) => `<line class="an-leader" style="--i:${k}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('');
      const fanPaths = (fans.paths || []).map(([d, l], k) => `<path class="an-fan" style="--i:${k};--l:${l}" pathLength="1000" d="${d}"/>`).join('');

      svg.setAttribute('width', W);
      svg.setAttribute('height', worldH);
      svg.setAttribute('viewBox', `0 0 ${W} ${worldH}`);
      svg.innerHTML = `
        <defs>
          <linearGradient id="anTipG" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(0.67)}" x2="0" y2="${Y(0)}">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
            <stop offset="0.55" stop-color="#dfe6f2" stop-opacity="0.13"/>
            <stop offset="1" stop-color="#c8d2e2" stop-opacity="0.07"/>
          </linearGradient>
          <linearGradient id="anBodyG" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(0)}" x2="0" y2="${Y(-1.6)}">
            <stop offset="0" stop-color="#d6deea" stop-opacity="0.17"/>
            <stop offset="0.4" stop-color="#bcc6d8" stop-opacity="0.085"/>
            <stop offset="1" stop-color="#b4bfd2" stop-opacity="0.025"/>
          </linearGradient>
          <linearGradient id="anWaterG" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(0)}" x2="0" y2="${worldH}">
            <stop offset="0" stop-color="#8ca0be" stop-opacity="0.11"/>
            <stop offset="0.3" stop-color="#6e82a0" stop-opacity="0.05"/>
            <stop offset="1" stop-color="#000000" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="anRayG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.075"/>
            <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="anFanG" gradientUnits="userSpaceOnUse" x1="0" y1="${Y(-0.2)}" x2="0" y2="${Y(CORE[1])}">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/>
            <stop offset="1" stop-color="#ffffff" stop-opacity="0.55"/>
          </linearGradient>
        </defs>
        <rect class="an-water" x="0" y="${Y(0)}" width="${W}" height="${worldH - Y(0)}" fill="url(#anWaterG)"/>
        <g class="an-rays">${rays}</g>
        <g class="an-grids">${grid}</g>
        <g class="an-body-g">
          <polygon points="${ptsOf(BODY)}" fill="url(#anBodyG)"/>
          <polygon points="${ptsOf(bodyShade)}" fill="#000" fill-opacity="0.2"/>
          ${facets.map(f => line(f, 'an-facet')).join('')}
          <polygon class="an-edge" points="${ptsOf(BODY)}"/>
        </g>
        <g class="an-tip-g">
          <polygon points="${ptsOf(tipPts)}" fill="url(#anTipG)"/>
          <polygon points="${ptsOf(tipShade)}" fill="#000" fill-opacity="0.22"/>
          ${tipFacets.map(f => line(f, 'an-facet')).join('')}
        </g>
        <g class="an-strata">${strata}</g>
        <g class="an-ruler-g">${ruler}</g>
        <line class="an-axis" x1="${X(0.012)}" y1="${Y(0)}" x2="${X(0.985)}" y2="${Y(0)}"/>
        <path class="an-wave" d="${wave}"/>
        <g class="an-fans">${fanPaths}</g>
        <g class="an-leaders">${leaders}</g>
        <path class="an-glow an-a" pathLength="1000" d="${dOf(PATH_A)}"/>
        <path class="an-line an-a" pathLength="1000" d="${dOf(PATH_A)}"/>
        <path class="an-glow an-b" pathLength="1000" d="${dOf(PATH_B)}"/>
        <path class="an-line an-b" pathLength="1000" d="${dOf(PATH_B)}"/>
        <g class="an-markers">${markers}</g>`;
    }

    function layout(force = false) {
      const w = vp.clientWidth, h = vp.clientHeight;
      if (!w || !h) return false;
      if (w < 760 && (anSec.dataset.anCh === '4' || anSec.dataset.anCh === '5')) return true;
      if (!force && w === W && h === H) return true;
      W = w; H = h;

      if (W < 760) {
        curAxis = 0.80;
        curHScale = 0.58;
        curDScale = 1.24;
        worldH = Math.round((curAxis + 1.95 * curDScale) * H);
        world.style.height = `${worldH}px`;

        place(legend, 12, 12);
        const cwTarget = Math.max(130, Math.floor((W - 28) / 2));
        layer.style.setProperty('--an-card-w', `${cwTarget}px`);
        place(qEl, 12, 48);
        place(tipCap, 12, 54);

        const cardStartY = 48 + (qEl.offsetHeight || 36) + 8;
        const pillStartY = 54 + (tipCap.offsetHeight || 42) + 8;
        let curCardY = cardStartY;
        for (let r = 0; r < 3; r++) {
          const c0 = cards[r * 2], c1 = cards[r * 2 + 1];
          const rh = Math.max(c0 ? c0.offsetHeight : 0, c1 ? c1.offsetHeight : 0, 52);
          if (c0) { c0.__mx = 10; c0.__my = curCardY; }
          if (c1) { c1.__mx = Math.max(10, W - (c1.offsetWidth || cwTarget) - 10); c1.__my = curCardY; }
          curCardY += rh + 6;
        }

        const leaders = [];
        cards.forEach((card, k) => {
          const [mx, mh] = PATH_A[MARKERS[k]];
          const cx = X(mx), my = Y(mh);
          const cw = card.offsetWidth || cwTarget, chh = card.offsetHeight || 52;
          const ax = card.__mx, ay = card.__my;
          const pill = pills[k];
          pill.style.maxWidth = `${cwTarget}px`;
          const pw = pill.offsetWidth || cwTarget, ph = pill.offsetHeight || 28;
          const pCol = k % 2, pRow = Math.floor(k / 2);
          const bx = pCol === 0 ? 10 : Math.max(10, W - pw - 10);
          const by = pillStartY + pRow * (ph + 6);
          card.style.setProperty('--ax', `${ax}px`); card.style.setProperty('--ay', `${ay}px`);
          card.style.setProperty('--bx', `${Math.round(bx + pw / 2 - cw / 2)}px`); card.style.setProperty('--by', `${Math.round(by + ph / 2 - chh / 2)}px`);
          pill.style.setProperty('--ax', `${Math.round(ax + cw / 2 - pw / 2)}px`); pill.style.setProperty('--ay', `${Math.round(ay + chh / 2 - ph / 2)}px`);
          pill.style.setProperty('--bx', `${bx}px`); pill.style.setProperty('--by', `${by}px`);
          leaders.push([cx, my - 6, Math.round(ax + cw / 2), ay + chh]);
        });

        const end = PATH_A[PATH_A.length - 1];
        place(dotEl, X(end[0]) - 9, Y(end[1]) - 9);
        place(teaser, 12, Y(0) + 14);

        const fanPaths = [];
        let prevBottom = Y(0) + 46;
        const rowTops = [];
        const rowBottoms = [];
        rows.forEach((row, li) => {
          const lay = LAYERS[li];
          const left = 10, width = Math.max(200, W - 28);
          row.style.left = `${left}px`;
          row.style.width = `${width}px`;
          const chipsBox = $('.ph-an-chips', row);
          const idealTop = Math.round(Y(lay.h) - (chipsBox.offsetTop + chipsBox.offsetHeight / 2));
          const top = Math.max(prevBottom + (li === 3 ? 28 : 10), idealTop);
          row.style.top = `${top}px`;
          const rh = row.offsetHeight || 140;
          prevBottom = top + rh;
          rowTops[li] = top;
          rowBottoms[li] = prevBottom;
        });

        const coreY = Math.max(Y(-1.56), (rowBottoms[4] || Y(-1.4)) + 34);
        const corePx = [X(CORE[0]), coreY];
        rows.forEach((row, li) => {
          const left = 10, top = rowTops[li];
          $$('.ph-an-chip', row).forEach(chip => {
            const sx = left + chip.offsetLeft + chip.offsetWidth / 2;
            const sy = top + chip.offsetTop + chip.offsetHeight;
            const [px, py] = corePx;
            const k = (py - sy);
            fanPaths.push([`M${Math.round(sx)} ${Math.round(sy)} C${Math.round(sx)} ${Math.round(sy + k * 0.55)} ${px} ${Math.round(py - k * 0.45)} ${px} ${py}`, li]);
          });
        });

        place(coreEl, corePx[0] - 11, corePx[1] - 11);
        const endW = endCap.offsetWidth || 220;
        const endX = clamp(corePx[0] - endW / 2, 12, Math.max(12, W - endW - 12));
        const endY = corePx[1] + 22;
        place(endCap, endX, endY);
        const endBottom = endY + (endCap.offsetHeight || 86);
        worldH = Math.max(worldH, endBottom + 40);
        world.style.height = `${worldH}px`;

        const cam2 = Math.max(0, rowTops[0] - 64);
        const ch3Span = endBottom - rowTops[3];
        const cam3 = ch3Span > H - 72
          ? Math.max(0, rowTops[3] - 64)
          : Math.max(0, rowTops[3] - 64);
        cams = [0, 0, cam2, cam3, cam3, cam3];

        buildSvg({ leaders, paths: fanPaths });
        world.style.transform = `translate3d(0, ${-cams[Math.max(0, ch)]}px, 0)`;
        return true;
      }

      curAxis = AXIS;
      curHScale = 1;
      curDScale = 1;
      pills.forEach(p => { p.style.maxWidth = ''; });
      worldH = Math.round((AXIS + 1.95) * H);
      world.style.height = `${worldH}px`;
      const deep = Math.round((AXIS + 0.92) * H);
      cams = [0, 0, Math.round((AXIS - 0.10) * H), deep, deep, deep];

      place(legend, X(0.03), Math.round(H * 0.045));

      // Chapter 1 cards above the five growth steps (alternating heights) and chapter 2 pills just below them, inside the ice.
      // Card width never exceeds the step spacing, so neighbouring cards can't overlap.
      layer.style.setProperty('--an-card-w', `${clamp(Math.round(0.105 * W) - 10, 145, 224)}px`);
      const leaders = [];
      cards.forEach((card, k) => {
        const [mx, mh] = PATH_A[MARKERS[k]];
        const cx = X(mx), my = Y(mh);
        const cw = card.offsetWidth, chh = card.offsetHeight;
        const gap = k % 2 === 0 ? 34 : 34 + chh + 16;
        const ax = Math.round(clamp(cx - cw / 2, 6, W - cw - 6));
        const ay = Math.round(my - gap - chh);
        const pill = pills[k];
        const pw = pill.offsetWidth, ph = pill.offsetHeight;
        // Pill hangs just under its marker and extends to the right, where the growth line only climbs away from it
        const bx = Math.round(clamp(cx - 16, 6, W - pw - 6));
        const by = Math.round(my + 15);
        card.style.setProperty('--ax', `${ax}px`); card.style.setProperty('--ay', `${ay}px`);
        card.style.setProperty('--bx', `${Math.round(bx + pw / 2 - cw / 2)}px`); card.style.setProperty('--by', `${Math.round(by + ph / 2 - chh / 2)}px`);
        pill.style.setProperty('--ax', `${Math.round(ax + cw / 2 - pw / 2)}px`); pill.style.setProperty('--ay', `${Math.round(ay + chh / 2 - ph / 2)}px`);
        pill.style.setProperty('--bx', `${bx}px`); pill.style.setProperty('--by', `${by}px`);
        leaders.push([cx, my - 8, cx, ay + chh]);
      });

      const end = PATH_A[PATH_A.length - 1];
      place(dotEl, X(end[0]) - 9, Y(end[1]) - 9);
      place(qEl, X(end[0]) + 22, Y(end[1]) - 6);
      place(tipCap, X(0.665), Y(0.66));
      place(teaser, X(0.36), Y(-0.07));

      // Underwater depth rows: each row sits on its stratum line, chips centred inside the body span at that depth
      const fanPaths = [];
      const corePx = [X(CORE[0]), Y(CORE[1])];
      rows.forEach((row, li) => {
        const lay = LAYERS[li];
        const [a, b] = bodySpan(lay.h);
        const left = X(Math.min(a + 0.02, 0.10)), width = Math.max(260, X(Math.max(b - 0.02, 0.86)) - left);
        row.style.left = `${left}px`;
        row.style.width = `${width}px`;
        const rh = row.offsetHeight;
        const chipsBox = $('.ph-an-chips', row);
        const top = Math.round(Y(lay.h) - (chipsBox.offsetTop + chipsBox.offsetHeight / 2));
        row.style.top = `${top}px`;
        void rh;
        $$('.ph-an-chip', row).forEach(chip => {
          const sx = left + chip.offsetLeft + chip.offsetWidth / 2;
          const sy = top + chip.offsetTop + chip.offsetHeight;
          const [px, py] = corePx;
          const k = (py - sy);
          fanPaths.push([`M${Math.round(sx)} ${Math.round(sy)} C${Math.round(sx)} ${Math.round(sy + k * 0.55)} ${px} ${Math.round(py - k * 0.45)} ${px} ${py}`, li]);
        });
      });
      place(coreEl, corePx[0] - 11, corePx[1] - 11);
      place(endCap, corePx[0] - endCap.offsetWidth / 2, corePx[1] + 26);

      buildSvg({ leaders, paths: fanPaths });
      world.style.transform = `translate3d(0, ${-cams[Math.max(0, ch)]}px, 0)`;
      return true;
    }

    function syncSwitch(animate = true) {
      if (!switchEl || !switchPill) return;
      const btn = switchBtns.find(b => b.classList.contains('is-active') && b.closest('#ph-an-switch'));
      if (!btn || btn.offsetWidth < 8) return;
      const x = btn.offsetLeft, w = btn.offsetWidth;
      switchPill.style.setProperty('--pill-x', `${x}px`);
      switchPill.style.setProperty('--pill-w', `${w}px`);
      if (isMobileViewport()) {
        centerScrollableButton(switchEl, btn, animate);
      }
      if (animate && prevSwitchX !== null && Math.abs(prevSwitchX - x) > 4) {
        switchPill.style.setProperty('--glint-x', x > prevSwitchX ? '48%' : '-48%');
        switchPill.classList.add('is-stretching');
        setTimeout(() => { switchPill.style.setProperty('--glint-x', '0%'); switchPill.classList.remove('is-stretching'); }, 220);
      }
      prevSwitchX = x;
    }

    function depthLabel(c) {
      if (c <= 1) return L('ЛИНИЯ ВОДЫ', 'WATERLINE');
      if (c === 2) return L('SEO · КОНКУРЕНТЫ · МЕДИА', 'SEO · COMPETITORS · MEDIA');
      return L('ПРОДУКТ · CRM · BI · СВЕДЕНИЕ', 'PRODUCT · CRM · BI · CONVERGENCE');
    }
    function animateDepth(to, instant) {
      cancelAnimationFrame(depthRaf);
      const fmt = v => (v === 0 ? '0' : `−${v}`);
      if (instant || reduce) { shownDepth = to; if (depthEl) depthEl.textContent = fmt(to); return; }
      const from = shownDepth, t0 = performance.now(), dur = 1250;
      const tick = now => {
        const t = clamp((now - t0) / dur, 0, 1);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        shownDepth = Math.round(from + (to - from) * e);
        if (depthEl) depthEl.textContent = fmt(shownDepth);
        if (t < 1) depthRaf = requestAnimationFrame(tick);
      };
      depthRaf = requestAnimationFrame(tick);
    }

    function applyState(next, instant) {
      const prevCh = ch;
      ch = next;
      anSec.dataset.anCh = String(next);
      for (let k = 0; k <= CH_MAX; k++) anSec.classList.toggle(`an-c${k}`, next >= k);
      if (isMobileViewport() && next >= 0 && next <= 3 && (prevCh >= 4 || !W)) {
        layout(true);
      }
      if (isMobileViewport() && !instant && (prevCh >= 4 || next >= 4) && anSec.scrollTop > 0) {
        anSec.scrollTop = 0;
      }
      switchBtns.forEach(b => {
        if (!b.closest('#ph-an-switch')) return;
        const on = parseInt(b.dataset.anGo, 10) === next;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      syncSwitch(!instant);
      world.style.transform = `translate3d(0, ${-cams[Math.max(0, next)]}px, 0)`;
      if (depthLayerEl) depthLayerEl.textContent = depthLabel(next);
      animateDepth(DEPTH_BY_CH[Math.max(0, next)], instant);
      armAuto();
    }

    function stopAuto() {
      clearTimeout(autoTimer);
      autoTimer = 0;
      try { progAnim?.cancel(); } catch (_) {}
      progAnim = null;
    }
    function armAuto() {
      stopAuto();
      if (targetIdx !== AN_IDX || ch < 0 || ch >= CH_MAX) return;
      if (isMobileViewport()) return;
      const ms = DWELL[ch];
      if (!ms) return;
      autoTimer = setTimeout(() => {
        autoTimer = 0;
        if (targetIdx === AN_IDX && ch < CH_MAX) setCh(ch + 1);
      }, ms);
      if (switchProg && typeof switchProg.animate === 'function' && !reduce) {
        progAnim = switchProg.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: ms, easing: 'linear', fill: 'forwards' });
      }
    }
    function leave() { stopAuto(); }

    // Jump to a chapter with every transition disabled (used on entry), then re-enable transitions next frame
    function setInstant(next) {
      anSec.classList.add('is-an-instant');
      applyState(next, true);
      void anSec.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => anSec.classList.remove('is-an-instant')));
    }

    function setCh(next) {
      next = clamp(next, 0, CH_MAX);
      if (next === ch) return false;
      layout();
      applyState(next, false);
      lockUntil = performance.now() + 700;
      return true;
    }

    function enter(fromEnd) {
      layout(true);
      if (fromEnd) { setInstant(CH_MAX); return; }
      // Start from a blank chart so the growth line draws in from the left on every entry
      setInstant(-1);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (targetIdx !== AN_IDX) return;
        applyState(0, false);
      }));
    }

    function step(dir) {
      if (targetIdx !== AN_IDX) return false;
      const next = ch + dir;
      if (next < 0 || next > CH_MAX) return false;
      if (performance.now() < lockUntil) return true;
      return setCh(next) || true;
    }

    switchBtns.forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      if (targetIdx !== AN_IDX) return;
      setCh(parseInt(b.dataset.anGo, 10));
    }));

    function refreshLang() {
      if (depthLayerEl) depthLayerEl.textContent = depthLabel(Math.max(0, ch));
      $$('.ph-an-row-k i', layer).forEach((el, li) => { el.textContent = `−${LAYERS[li].m} ${L('м', 'm')}`; });
      if (targetIdx === AN_IDX) requestAnimationFrame(() => { layout(true); syncSwitch(false); });
      else W = 0;
    }

    function resize() {
      if (targetIdx !== AN_IDX) { W = 0; return; }
      layout();
      syncSwitch(false);
    }

    return { enter, leave, step, resize, refreshLang, get chapter() { return ch; } };
  })();
  refreshAnalyticsLang = () => anScene?.refreshLang();

  // Single entry point for "next / previous" from wheel, keys, touch and the footer arrows
  function deckStep(dir) {
    // Nested views get first refusal before moving to another section.
    if (sections[targetIdx]?.id === 'sec-tools' && (window.ToolsPages ? window.ToolsPages.step(dir) : window.DossierSite?.stepTools(dir))) return true;
    if (sections[targetIdx]?.id === 'sec-smm' && window.SmmPages?.step(dir)) return true;
    if (anScene && anScene.step(dir)) return true;
    const next = targetIdx + dir;
    if (sections[next]?.id === 'sec-tools') window.ToolsPages?.enterFrom(dir);
    if (sections[next]?.id === 'sec-smm') window.SmmPages?.enterFrom(dir);
    return goTo(next, { anFromEnd: dir < 0 && next === AN_IDX });
  }

  /* ---------------- 8. INPUT TRIGGERS (WHEEL, KEYS, TOUCH, BUTTONS) ---------------- */
  let lastWheelTime = 0, wheelGestureHandled = false, wheelDistance = 0;
  addEventListener('wheel', e => {
    if (document.body.classList.contains('ph-menu-open') || document.body.classList.contains('ph-proj-open') || !profileModal?.hidden || e.ctrlKey) return;
    if (Math.abs(e.deltaY) < Math.abs(e.deltaX) || !e.deltaY) return;
    const toolsOpen = sections[targetIdx]?.id === 'sec-tools' && window.DossierSite?.isToolsOpen();
    if (isMobileViewport() && !toolsOpen) return;
    const now = performance.now();
    if (now - lastWheelTime > 220) {
      wheelGestureHandled = false;
      wheelDistance = 0;
    }
    lastWheelTime = now;
    const scrollBox = e.target?.closest?.(isMobileViewport() ? '.ph-ai-prod-list, #sec-tools, #sec-smm' : (toolsOpen ? '.ph-ai-prod-list, .tools-page--catalog, #sec-tools' : '.ph-ai-prod-list, .smm-rp-viewport'));
    if (scrollBox && scrollBox.scrollHeight > scrollBox.clientHeight + 2) {
      const canUp = e.deltaY < 0 && scrollBox.scrollTop > 1;
      const canDown = e.deltaY > 0 && scrollBox.scrollTop + scrollBox.clientHeight < scrollBox.scrollHeight - 1;
      if (canUp || canDown) {
        // Reaching an edge while reading must not also close the view.
        wheelGestureHandled = true;
        return;
      }
    }
    e.preventDefault();
    if (wheelGestureHandled) return;
    if (transProgress < 1) { wheelGestureHandled = true; return; }
    if (Math.sign(wheelDistance) !== Math.sign(e.deltaY)) wheelDistance = 0;
    wheelDistance += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    if (Math.abs(wheelDistance) < 32) return;
    // Consume the entire gesture, including trackpad inertia after returning.
    wheelGestureHandled = true;
    deckStep(Math.sign(wheelDistance));
  }, { passive: false });

  addEventListener('keydown', e => {
    if (document.body.classList.contains('ph-menu-open') || document.body.classList.contains('ph-proj-open') || !profileModal?.hidden || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (e.key === ' ' && (tag === 'button' || tag === 'a')) return;
    if (e.target.closest?.('#tools-catalog, #tools-mcp') && ['ArrowDown','ArrowUp','PageDown','PageUp'].includes(e.key)) {
      e.preventDefault();
      deckStep(['ArrowUp','PageUp'].includes(e.key) ? -1 : 1);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); deckStep(1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); deckStep(-1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
  });

  let touchY = null;
  addEventListener('touchstart', e => {
    if (isMobileViewport()) { touchY = null; return; }
    if (document.body.classList.contains('ph-proj-open') || !profileModal?.hidden) return;
    if (e.touches.length === 1) touchY = e.touches[0].clientY;
  }, { passive: true });
  addEventListener('touchend', e => {
    if (isMobileViewport()) { touchY = null; return; }
    if (document.body.classList.contains('ph-proj-open') || !profileModal?.hidden) return;
    if (touchY === null || !e.changedTouches.length) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) > 36) deckStep(Math.sign(dy));
  }, { passive: true });

  $$('.ph-scroll').forEach(btn => btn.addEventListener('click', () => deckStep(1)));
  prevBtn?.addEventListener('click', () => deckStep(-1));
  nextBtn?.addEventListener('click', () => deckStep(1));
  $('#ph-restart')?.addEventListener('click', () => goTo(0));

  /* ---------------- URL HASH ROUTING & DEEP LINKING ---------------- */
  const HASH_MAP = [
    'profile',
    'competencies',
    'video',
    'analytics',
    'smm',
    'ai',
    'ai-models',
    'systems',
    'systems-pipeline',
    'tools',
    'products-everest',
    'products-cake',
    'products-can',
    'contacts'
  ];

  const HASH_ALIASES = {
    automation: 'smm',
    technologies: 'systems',
    'tech-pipeline': 'systems-pipeline'
  };

  function syncUrlHash(idx) {
    const slug = HASH_MAP[idx];
    if (!slug) return;
    try {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + slug);
      }
    } catch (_) {}
  }

  function resolveHashIndex(rawHash) {
    const raw = (rawHash || '').replace(/^#/, '').trim().toLowerCase();
    if (!raw) return -1;
    return HASH_MAP.indexOf(HASH_ALIASES[raw] || raw);
  }

  function activateInitialSlideHooks(idx) {
    if (idx === 2) {
      videoSlideEnteredOnce = true;
      loadAdProject(curAdIdx, false);
      runMonitorToPhoneDeployment();
    } else if (idx === 5) {
      techAndAi3dEngine.resize();
      techAndAi3dEngine.step(0.016, 5, false);
      startAiVendorsShowcase(false);
    } else if (idx === 6) {
      techAndAi3dEngine.resize();
      techAndAi3dEngine.step(0.016, 6, false);
      triggerAiPage2Reveal();
    } else if (idx === 7) {
      techAndAi3dEngine.resize();
      triggerBlueprintFlyIn(aiBlueprintStage);
    } else if (idx === 8) {
      techAndAi3dEngine.resize();
      triggerBlueprintFlyIn(aiPageStage);
    } else if (idx === AN_IDX) {
      anScene?.enter(false);
    } else if (idx >= 10 && idx <= 12) {
      syncProductPageVideos(idx);
      triggerProductsShowcaseAnim(sections[idx]);
      if (idx === 12) can3dWidget?.resize();
    }
  }

  /* Initialize */
  loadProfileData();
  applyCategoryFilter('all', false);
  applyAiTier('all', false);
  const initialHashIdx = resolveHashIndex(window.location.hash);
  if (initialHashIdx > 0 && initialHashIdx < total) {
    targetIdx = initialHashIdx;
    fromIdx = initialHashIdx;
    pos = initialHashIdx;
  }
  loadAdProject(0, false);
  applyLang(readLang());
  renderDeck(0.016);
  updateHUD();
  if (targetIdx > 0) {
    activateInitialSlideHooks(targetIdx);
  }

  let last = performance.now();
  function loop(now) {
    if (document.hidden || (isMobileViewport() && now - last < 1000 / 30)) {
      if (document.hidden) last = now;
      requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000) * (reduce ? 0.6 : 1);
    last = now;
    renderDeck(dt);
    const isTransitioning = transProgress < 1;
    if (!isMobileViewport()) techAndAi3dEngine.step(dt, targetIdx, isTransitioning);
    stepProduct3DWidgets(dt, targetIdx);
    if (!isTransitioning) {
      stepSkillsAutoCycle(dt, targetIdx === 1);
      if (targetIdx === 2) checkDualVideoSync();
      if (!isMobileViewport()) stepAiArchAutoCycle(dt, targetIdx === 7);
      stepAiVendorsAutoMorph(dt, targetIdx === 5);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  let rz = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      techAndAi3dEngine.resize();
      can3dWidget?.resize();
      syncNavLiquidPill(false);
      syncSkillLiquidPill(false);
      anScene?.resize();
    });
  });

  window.addEventListener('popstate', () => {
    const idx = resolveHashIndex(window.location.hash);
    if (idx >= 0 && typeof goTo === 'function') {
      goTo(idx);
    }
  });
})();
