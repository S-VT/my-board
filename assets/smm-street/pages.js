/* SMM pages: five slides inside one frame. Slides glide at 1:1 scale on GPU layers while inner blocks
   rise in measured sequence and section media (videos, rich post, funnel) run autonomously without freeze frames. */
(() => {
  const section = document.getElementById('sec-smm');
  const frame = section && section.querySelector('.smm-street');
  if (!frame) return;
  const pages = [...frame.querySelectorAll('.smm-page')];
  const tabs = [...section.querySelectorAll('[data-smm-page]')];
  const subtabs = [...frame.querySelectorAll('[data-smm-goto]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 1180px)');
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ru');
  const tabPages = t => (t.dataset.smmPages ? t.dataset.smmPages.split(',').map(Number) : [Number(t.dataset.smmPage)]);
  const EASE = 'cubic-bezier(.65, 0, .35, 1)';
  const DURATION = 980;
  const UNDERLINE_DELAY = 1000;

  let current = 0, busy = false, pending = null, entry = null, wasCurrent = false;
  let underlineTimer = 0;

  window.DossierSite?.addPairs?.([
    ['Страницы раздела СММ', 'SMM section pages'],
    ['Кого позволяет нанять разница в 145 000 ₽', 'Roles covered by the ₽145,000 launch saving'],
    ['Страницы раздела Контент', 'Content section pages'],
    ['Сегменты B2B, B2C и B2G', 'B2B, B2C and B2G segments'],
    ['Блоки rich-поста', 'Rich post blocks'],
    ['Предыдущее фото', 'Previous photo'],
    ['Следующее фото', 'Next photo'],
    ['Закрыть чат', 'Close chat'],
    ['Новостройки премиум-класса: корпуса квартала среди парка', 'Premium new-build residences set in a park'],
    ['Вид из квартиры на высоте до 21 этажа', 'Apartment view from up to the 21st floor'],
    ['Пешеходные аллеи и зелёные дворики квартала', 'Pedestrian alleys and green courtyards'],
    ['Световой маршрут: 5 минут пешком до метро', 'Lit walking route: 5 minutes to the metro'],
    ['Ролик для СНГ: «Покупай онлайн»', 'CIS commercial: Buy online'],
    ['Карточка антивозрастного ночного крема POLY', 'POLY anti-ageing night face cream card'],
    ['Карточка новостроек премиум-класса', 'Premium-class new residential complex card'],
    ['Точки касания', 'Touchpoints']
  ]);

  /* ---------- Page 2: 12-month profit conversion curve ---------- */
  const bars = frame.querySelector('.smm-chart-bars');
  if (bars) {
    // Months 1-2: paper ads lead; Month 3: exact tie; Months 4-12: paper sinks while own channel climbs.
    const STREET = [0.54, 0.48, 0.42, 0.36, 0.31, 0.27, 0.23, 0.19, 0.16, 0.13, 0.10, 0.08];
    const FEED   = [0.22, 0.32, 0.42, 0.50, 0.57, 0.64, 0.71, 0.77, 0.83, 0.89, 0.93, 0.97];
    bars.innerHTML = STREET.map((s, i) => (
      `<div class="smm-chart-col" style="--i:${i}"><i class="is-street" style="--h:${s.toFixed(3)}"></i><i class="is-feed" style="--h:${FEED[i].toFixed(3)}"></i><span class="mono">${i + 1}</span></div>`
    )).join('');
  }

  /* ---------- Page 3 & 4: autonomous videos and conversion funnel ---------- */
  const videos = [...frame.querySelectorAll('.smm-page--videos video')];
  const soundLabel = on => (lang() === 'en' ? (on ? 'SOUND ON' : 'SOUND OFF') : (on ? 'ЗВУК ВКЛ' : 'ЗВУК ВЫКЛ'));
  const syncSoundButtons = () => frame.querySelectorAll('.smm-sound').forEach((b, i) => {
    const on = videos[i] && !videos[i].muted;
    b.textContent = soundLabel(on);
    b.setAttribute('aria-pressed', String(on));
  });

  function isSectionLive() {
    return section.classList.contains('is-current') && !document.hidden;
  }

  function isVideosPageVisible() {
    return isSectionLive() && Boolean(
      current === 2 ||
      pages[2]?.classList.contains('is-active') ||
      pages[2]?.classList.contains('is-leaving')
    );
  }

  function isFunnelPageVisible() {
    return isSectionLive() && Boolean(
      current === 4 ||
      pages[4]?.classList.contains('is-active') ||
      pages[4]?.classList.contains('is-leaving')
    );
  }

  // Keep videos playing smoothly while Content Page 1 is visible or transitioning, and pause when off-page.
  videos.forEach(v => {
    v.loop = true;
    v.addEventListener('pause', () => {
      if (isVideosPageVisible() && !reduced.matches && !v.ended) v.play().catch(() => {});
    });
  });

  frame.querySelectorAll('.smm-sound').forEach((btn, i) => btn.addEventListener('click', () => {
    const v = videos[i];
    if (!v) return;
    const turnOn = v.muted;
    videos.forEach(o => { o.muted = true; });
    v.muted = !turnOn;
    if (turnOn) { v.currentTime = 0; v.play().catch(() => {}); }
    syncSoundButtons();
  }));

  /* ---------- Content Page 2: one set of facts in three rich post formats ---------- */
  const rp = frame.querySelector('.smm-page--tg [data-rp]');
  const rpViewport = rp && rp.querySelector('[data-rp-viewport]');
  const rpList = rp && rp.querySelector('[data-rp-list]');
  const rpCount = rp && rp.querySelector('[data-rp-count]');
  const rpDm = rp && rp.querySelector('[data-rp-dm]');
  const rpBody = rp && rp.querySelector('[data-rp-body]');
  const rpProgressBox = rp && rp.querySelector('.smm-rp-progress');
  const rpFunnel = rp ? [...rp.querySelectorAll('[data-rp-funnel]')] : [];
  const rpFitBtn = rp && rp.querySelector('[data-rp-fit]');
  const rpKind = rp && rp.querySelector('[data-rp-kind]');
  const rpCompare = rp && rp.querySelector('[data-rp-compare]');
  const rpPicks = rp ? [...rp.querySelectorAll('[data-rp-pick]')] : [];
  const rpArticles = rp ? [...rp.querySelectorAll('[data-rp-post]')] : [];
  const rpField = key => rp && rp.querySelector(`[data-rp-i="${key}"]`);
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = n => String(n).padStart(2, '0');
  const escAttr = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Every block type used across the three formats: name in the list, rich tag and what it does for sales.
  const RB = {
    carousel: {
      tag: '<tg-slideshow>',
      name: ['Карусель фото', 'Photo carousel'],
      title: ['Карусель фото, как в Instagram', 'Instagram-style photo carousel'],
      what: [
        'Четыре кадра листаются прямо в посте: фасад, вид из окна, двор и путь до метро. Человек смотрит квартал целиком, не уходя на сайт застройщика.',
        'Four frames swipe inside the post: facade, window view, courtyard and the walk to the metro. The reader sees the whole district without leaving for the developer’s site.'
      ],
      how: [
        'Первый кадр с крупной надписью останавливает скролл ленты. Каждый следующий снимает отдельное сомнение покупателя: вид, двор, дорога.',
        'The first frame with large lettering stops the feed scroll. Each next frame removes one buyer doubt: the view, the courtyard, the commute.'
      ],
      funnel: [0]
    },
    caption: {
      tag: '<figcaption>',
      name: ['Подпись к медиа', 'Media caption'],
      title: ['Подпись под медиа', 'Media caption'],
      what: [
        'Одна строка под каруселью называет объект и перечисляет, что в кадрах: фасады, террасы, парк и маршрут к метро.',
        'One line under the carousel names the property and lists what the frames show: facades, terraces, the park and the route to the metro.'
      ],
      how: [
        'Глаз падает на неё сразу после фото. За секунду человек понимает, что перед ним премиум-квартал, и решает читать дальше.',
        'The eye lands on it right after the photos. In a second the reader knows this is a premium district and decides to keep reading.'
      ],
      funnel: [0, 1]
    },
    headline: {
      tag: '<h2>',
      name: ['Громкий заголовок', 'Headline'],
      title: ['Громкий заголовок', 'Headline'],
      what: [
        'Крупный заголовок продаёт образ жизни и задаёт тон всему посту. Он отделяет медиа от текста, и пост читается как страница журнала.',
        'A large headline sells a way of life and sets the tone for the whole post. It separates media from text, so the post reads like a magazine page.'
      ],
      how: [
        'Работает на массовую аудиторию: короткая фраза из трёх слов запоминается и цепляет даже тех, кто не искал квартиру.',
        'Built for a mass audience: a short three-word phrase sticks and hooks even people who were not looking for a flat.'
      ],
      funnel: [0]
    },
    offer: {
      tag: '<mark> · <tg-emoji>',
      name: ['Оффер с маркером', 'Highlighted offer'],
      title: ['Главный оффер с маркером', 'Highlighted main offer'],
      what: [
        'Первая строка текста отвечает на вопрос «что происходит»: открыта продажа квартир. Маркер фона и анимированная иконка выделяют её в потоке.',
        'The first line of text answers “what is happening”: apartment sales are open. A background marker and an animated icon make it stand out in the feed.'
      ],
      how: [
        'Тот, кто дочитал только до этой строки, уже знает повод купить сейчас. Остальной текст объясняет, почему именно здесь.',
        'Someone who reads only this far already knows why to buy now. The rest of the text explains why here.'
      ],
      funnel: [1]
    },
    aside: {
      tag: '<aside> · <code>',
      name: ['Цитата с цифрами', 'Pull quote with numbers'],
      title: ['Выносная цитата с цифрами', 'Pull quote with numbers'],
      what: [
        'Врезка по центру собирает два главных факта: до 21 этажа и 5 минут до метро. Цифры выделены моноширинным шрифтом и читаются как характеристики.',
        'A centred pull quote holds the two key facts: up to 21 floors and 5 minutes to the metro. The numbers are set in monospace and read like specifications.'
      ],
      how: [
        'Цифры запоминаются лучше эпитетов. Именно их покупатель пересказывает близким, когда обсуждает квартиру.',
        'Numbers stick better than adjectives. They are what a buyer repeats to family when discussing the flat.'
      ],
      funnel: [1, 2]
    },
    sections: {
      tag: '<h3> · <blockquote>',
      name: ['Разделы преимуществ', 'Benefit sections'],
      title: ['Разделы преимуществ', 'Benefit sections'],
      what: [
        'Каждое преимущество вынесено в свой раздел с иконкой: виды и фасады, закрытый парк, время до метро. Внутри подчёркнутые термины, цитата с подсветкой и бейдж «для резидентов».',
        'Each benefit gets its own section with an icon: views and facades, the private park, time to the metro. Inside are underlined terms, a highlighted quote and a “for residents” badge.'
      ],
      how: [
        'Разные покупатели ищут разное: одному важен вид, другому двор без машин, третьему дорога. Разделы дают каждому найти свой аргумент за пару секунд.',
        'Different buyers look for different things: the view, a car-free courtyard, the commute. Sections let each of them find their argument in seconds.'
      ],
      funnel: [1, 2]
    },
    table: {
      tag: '<details> · <table>',
      name: ['Таблица в посте', 'In-post table'],
      title: ['Скрытая таблица параметров', 'Hidden specification table'],
      what: [
        'Таблица спрятана в раскрывающийся блок и по нажатию плавно разворачивается прямо в посте. Класс, этажность, остекление, террасы, парк и путь до метро в шести строках.',
        'The table sits inside a collapsible block and unfolds right in the post on tap. Class, height, glazing, terraces, park and the metro route in six rows.'
      ],
      how: [
        'Для тех, кто сравнивает варианты: все параметры в одном месте, без переписки с менеджером. Для остальных пост остаётся коротким.',
        'For people comparing options: every parameter in one place, with no back-and-forth with a manager. For everyone else the post stays short.'
      ],
      funnel: [2]
    },
    locked: {
      tag: '<details>',
      name: ['Закрытый блок', 'Locked section'],
      title: ['Закрытый каталог', 'Locked catalogue'],
      what: [
        'Раскрывающийся блок не показывает планировки, а объясняет, как их получить: каталог, подбор видовых лотов и запись на просмотр выдаются в личных сообщениях.',
        'The collapsible block does not show the floor plans; it explains how to get them: the catalogue, a view-lot selection and viewing bookings come via private messages.'
      ],
      how: [
        'Ограниченный доступ создаёт ценность и повод написать первым. Каждый, кто запросил каталог, становится тёплым лидом в личке отдела продаж.',
        'Restricted access creates value and a reason to write first. Everyone who requests the catalogue becomes a warm lead in the sales team’s inbox.'
      ],
      funnel: [2, 3]
    },
    cta: {
      tag: '<tg-button-row>',
      name: ['Кнопка заявки', 'Lead button'],
      title: ['Кнопка заявки', 'Lead button'],
      what: [
        'Кнопка внутри поста открывает личные сообщения с отделом продаж в одно касание. Под ней подвал с названием канала и статусом продаж.',
        'A button inside the post opens a private chat with the sales team in one tap. Below it, a footer with the channel name and sales status.'
      ],
      how: [
        'От интереса до заявки одно нажатие: человек не ищет контакты и не заполняет формы. Нажмите кнопку в посте, чтобы увидеть ответ отдела продаж.',
        'One tap from interest to enquiry: no searching for contacts, no forms. Tap the button in the post to see the sales team reply.'
      ],
      funnel: [3]
    },
    miniOffer: {
      tag: '<mark> · <code>',
      name: ['Оффер с цифрами', 'Offer with numbers'],
      title: ['Оффер и цифры в одном абзаце', 'Offer and numbers in one paragraph'],
      what: [
        'В MINI оффер и главные цифры собраны в один абзац: открыта продажа, панорама до 21 этажа, витражные лобби и 5 минут до метро.',
        'In MINI the offer and key numbers share one paragraph: sales are open, views up to the 21st floor, glass lobbies and 5 minutes to the metro.'
      ],
      how: [
        'Читатель получает суть поста, даже если не раскроет ни одного раздела ниже. Отдельная выносная цитата здесь не нужна.',
        'The reader gets the point even without opening a single section below. A separate pull quote is not needed here.'
      ],
      funnel: [1, 2]
    },
    miniList: {
      tag: '<details> · <ul>',
      name: ['Свёрнутые преимущества', 'Folded benefits'],
      title: ['Преимущества в одном разделе', 'Benefits in one section'],
      what: [
        'Архитектура, закрытый парк и маршрут спрятаны в один раздел с бейджем «4 решения». Внутри короткий список вместо трёх развёрнутых секций ULTRA.',
        'Architecture, the private park and the route sit in one section with a “4 solutions” badge. Inside is a short list instead of the three full ULTRA sections.'
      ],
      how: [
        'Бейдж с цифрой подогревает любопытство и приглашает нажать. Пост остаётся коротким, а аргументы доступны в одно касание.',
        'A badge with a number sparks curiosity and invites a tap. The post stays short while the arguments are one tap away.'
      ],
      funnel: [1, 2]
    },
    basicTitle: {
      tag: '<h3> · <tg-emoji>',
      name: ['Заголовок с иконкой', 'Headline with icon'],
      title: ['Заголовок с иконкой', 'Headline with icon'],
      what: [
        'Без отдельной подписи под фото: заголовок с анимированной иконкой сразу продолжает карусель.',
        'No separate caption under the photos: a headline with an animated icon follows the carousel directly.'
      ],
      how: [
        'Меньше уровней текста, быстрее чтение. Иконка сохраняет фирменный стиль канала даже в простом посте.',
        'Fewer text levels, faster reading. The icon keeps the channel’s signature style even in a simple post.'
      ],
      funnel: [0]
    },
    basicText: {
      tag: '<mark>',
      name: ['Абзац с акцентом', 'Accented paragraph'],
      title: ['Один абзац с акцентом', 'One accented paragraph'],
      what: [
        'Один абзац: «Открыта продажа квартир» выделено маркером, дальше фасады, окна в пол и витражные лобби с выходом в сад.',
        'One paragraph: “Apartment sales are open” is highlighted, followed by facades, floor-to-ceiling windows and glass lobbies opening onto the garden.'
      ],
      how: [
        'Достаточно, чтобы быстро решить «интересно или нет». Кто заинтересовался, сразу переходит по кнопке.',
        'Enough to decide quickly whether it is interesting. Anyone hooked goes straight to a button.'
      ],
      funnel: [1]
    },
    basicQuote: {
      tag: '<blockquote> · <code>',
      name: ['Цитата с цифрами', 'Quote with numbers'],
      title: ['Цитата с главными цифрами', 'Quote with the key numbers'],
      what: [
        'Цитата с подсветкой собирает 21 этаж, аллеи с живым огнём и 5 минут до метро. Это те же факты, что в ULTRA и MINI.',
        'A highlighted quote holds the 21 floors, alleys with a live fire and 5 minutes to the metro. These are the same facts as in ULTRA and MINI.'
      ],
      how: [
        'Цифры остаются якорем доверия даже в короткой подаче: одна и та же информация работает во всех форматах.',
        'Numbers stay an anchor of trust even in a short post: the same information works in every format.'
      ],
      funnel: [1, 2]
    },
    basicButtons: {
      tag: '<tg-button-row>',
      name: ['Две кнопки действия', 'Two action buttons'],
      title: ['Две кнопки действия', 'Two action buttons'],
      what: [
        'В одной строке две кнопки: каталог лотов и запись на показ. Каждая открывает личные сообщения с отделом продаж.',
        'Two buttons in one row: the lot catalogue and a viewing booking. Each opens a private chat with the sales team.'
      ],
      how: [
        'Покупатель сам выбирает следующий шаг: посмотреть лоты или сразу записаться. Две точки входа вместо одной.',
        'The buyer picks the next step: browse lots or book right away. Two entry points instead of one.'
      ],
      funnel: [3]
    }
  };

  const RP_FORMATS = {
    ultra: {
      blocks: ['carousel', 'caption', 'headline', 'offer', 'aside', 'sections', 'table', 'locked', 'cta'],
      dwell: [3600, 3000, 3000, 3200, 3400, 3800, 4200, 3800, 4200],
      cta: 8,
      label: ['ULTRA', 'ULTRA'],
      kind: ['ULTRA-пост · официальный канал', 'ULTRA post · official channel'],
      summary: {
        num: ['ИТОГ · ULTRA', 'RESULT · ULTRA'],
        tag: ['9 блоков · rich message', '9 blocks · rich message'],
        title: ['ULTRA-пост целиком', 'The ULTRA post in full'],
        what: [
          'Максимальная версия: карусель, подпись, заголовок, оффер, цитата с цифрами, три раздела преимуществ, таблица, закрытый каталог и кнопка заявки. Скрытые блоки свёрнуты и раскрываются по нажатию.',
          'The full version: carousel, caption, headline, offer, pull quote, three benefit sections, a table, a locked catalogue and a lead button. Hidden blocks stay folded until tapped.'
        ],
        how: [
          'Официальный канал проекта, закреплённый пост и старт продаж: там, где читатель готов разобраться в деталях.',
          'The project’s official channel, a pinned post and a sales launch: wherever the reader is ready to dig into details.'
        ],
        plus: [
          ['Раскрывает каждое преимущество', 'Отвечает на вопросы до звонка', 'Выглядит как мини-лендинг'],
          ['Unpacks every benefit', 'Answers questions before a call', 'Looks like a mini landing page']
        ],
        minus: [
          ['Длинный для быстрой ленты', 'Требует внимания читателя', 'Дольше в подготовке'],
          ['Long for a fast feed', 'Asks for reader attention', 'Takes longer to produce']
        ]
      }
    },
    mini: {
      blocks: ['carousel', 'caption', 'headline', 'miniOffer', 'miniList', 'table', 'locked', 'cta'],
      dwell: [3600, 3000, 3000, 3400, 4000, 4200, 3800, 4200],
      cta: 7,
      label: ['MINI', 'MINI'],
      kind: ['MINI-пост · лента и посевы', 'MINI post · feed and seeding'],
      summary: {
        num: ['ИТОГ · MINI', 'RESULT · MINI'],
        tag: ['8 блоков · rich message', '8 blocks · rich message'],
        title: ['MINI-пост целиком', 'The MINI post in full'],
        what: [
          'Та же информация в сжатом виде: карусель, подпись, заголовок и оффер с цифрами на виду, а преимущества, таблица и каталог спрятаны в три свёрнутых раздела.',
          'The same information, condensed: carousel, caption, headline and an offer with numbers up front, while benefits, the table and the catalogue sit in three folded sections.'
        ],
        how: [
          'Регулярная лента канала и посевы в чужих каналах: пост занимает один экран, а подробности открывает тот, кому интересно.',
          'The channel’s regular feed and seeding in other channels: the post fits one screen and details open for whoever is interested.'
        ],
        plus: [
          ['Помещается в один экран', 'Цифры видны сразу в оффере', 'Таблица и каталог те же'],
          ['Fits one screen', 'Numbers visible right in the offer', 'Same table and catalogue']
        ],
        minus: [
          ['Преимущества скрыты за нажатием', 'Нет выносной цитаты', 'Меньше визуальных акцентов'],
          ['Benefits hidden behind a tap', 'No pull quote', 'Fewer visual accents']
        ]
      }
    },
    basic: {
      blocks: ['carousel', 'basicTitle', 'basicText', 'basicQuote', 'basicButtons'],
      dwell: [3600, 3000, 3200, 3400, 4200],
      cta: 4,
      label: ['ОБЫЧНЫЙ', 'BASIC'],
      kind: ['Обычный пост · быстрые новости', 'Basic post · quick news'],
      summary: {
        num: ['ИТОГ · ОБЫЧНЫЙ', 'RESULT · BASIC'],
        tag: ['5 блоков · rich message', '5 blocks · rich message'],
        title: ['Обычный пост с каруселью', 'Basic post with a carousel'],
        what: [
          'Простая подача: карусель, заголовок, абзац и цитата с главными цифрами. Две кнопки ведут в каталог лотов и на запись к показу.',
          'A simple layout: carousel, headline, one paragraph and a quote with the key numbers. Two buttons lead to the lot catalogue and a viewing booking.'
        ],
        how: [
          'Быстрые новости, анонсы и площадки с короткой подачей: читается за десять секунд и сразу даёт два действия.',
          'Quick news, announcements and short-form platforms: read in ten seconds with two actions right away.'
        ],
        plus: [
          ['Читается за секунды', 'Две кнопки вместо одной', 'Подходит любому каналу'],
          ['Read in seconds', 'Two buttons instead of one', 'Fits any channel']
        ],
        minus: [
          ['Нет таблицы параметров', 'Нет закрытого каталога', 'Меньше аргументов для сомневающихся'],
          ['No specification table', 'No locked catalogue', 'Fewer arguments for doubters']
        ]
      }
    }
  };

  // Auto showcase presents each format in ~3s (ULTRA -> MINI -> BASIC -> ULTRA) until a format pill is switched.
  const RP_ORDER = ['ultra', 'mini', 'basic'];
  const RP_AUTO_MS = 2600;
  const RP_FOLD_MS = 210;
  const RP_BUILD_SPAN_MS = 860;
  const RP_STEP_BY_FMT = { ultra: 165, mini: 145, basic: 160 };
  const RP_SETTLE_BY_FMT = { ultra: 220, mini: 190, basic: 180 };
  const RP_REVEAL_BY_FMT = { ultra: 860, mini: 1250, basic: 1450 };
  const RP_MANUAL_OVERVIEW_MS = 2600;
  const rpPill = rp && rp.querySelector('.smm-rp-formats');
  const rpPillLens = rp && rp.querySelector('.smm-rp-formats-pill');
  const rpPillGlint = rp && rp.querySelector('.smm-rp-formats-glint');
  const rpCycle = rp ? [...rp.querySelectorAll('.smm-rp-cycle b')] : [];

  let rpFormat = 'ultra';
  let rpPickIdx = 0;
  let rpManual = false;
  let rpPost = null, rpBlocks = [], rpHrs = [], rpLayers = [], rpProgress = [];
  let rpTrack = null, rpCounter = null, rpDots = [], rpSlides = 0;
  let rpIdx = -1;
  let rpFit = false;
  let rpActive = false;
  let rpNeedsBuild = true;
  let rpCarouselHover = false;
  let rpSlide = 0;
  let rpAutoOpen = -1;
  let rpSwitching = false;
  let rpRenderedKey = '';
  let rpBuildTimer = 0, rpTourTimer = 0, rpAutoTimer = 0, rpSlideTimer = 0, rpDmTimer = 0, rpRevealTimer = 0, rpGlintTimer = 0, rpFitRaf = 0;
  let smmVidTimer = 0;

  const rpFmt = () => RP_FORMATS[rpFormat];
  const rpCanAnimate = () => rpActive && !reduced.matches;
  const rpAssembling = () => Boolean(rpPost?.classList.contains('is-assembling'));
  const rpIsProgressive = (key = rpFormat) => Boolean(RP_FORMATS[key]) && !reduced.matches;
  const rpStepMs = (key = rpFormat) => RP_STEP_BY_FMT[key] || 160;
  const rpSettleMs = (key = rpFormat) => RP_SETTLE_BY_FMT[key] || 200;
  const rpRevealMs = (key = rpFormat) => RP_REVEAL_BY_FMT[key] || 1100;
  const rpCycleDuration = (key = rpFormat) => rpIsProgressive(key)
    ? (Math.max(0, RP_FORMATS[key].blocks.length - 1) * rpStepMs(key) + rpSettleMs(key) + rpRevealMs(key))
    : RP_AUTO_MS;

  function rpClearTimers() {
    clearTimeout(rpBuildTimer);
    clearTimeout(rpTourTimer);
    clearTimeout(rpAutoTimer);
    clearInterval(rpSlideTimer);
    clearTimeout(rpDmTimer);
    clearTimeout(rpRevealTimer);
    clearTimeout(rpGlintTimer);
    cancelAnimationFrame(rpFitRaf);
    rpBuildTimer = rpTourTimer = rpAutoTimer = rpSlideTimer = rpDmTimer = rpRevealTimer = rpGlintTimer = rpFitRaf = 0;
    rp?.classList.remove('is-touring');
    rpPillLens?.classList.remove('is-stretching');
    if (rpSwitching) {
      rpSwitching = false;
      rpArticles.forEach(a => a.classList.remove('is-leaving'));
    }
    rpArticles.forEach(a => a.classList.remove('is-instant'));
  }

  function rpSetCount(n) {
    if (rpCount) rpCount.textContent = `${n} / ${rpBlocks.length}`;
  }

  function rpRenderKind() {
    if (rpKind) rpKind.textContent = rpFmt().kind[lang() === 'en' ? 1 : 0];
  }

  function rpSetFormatPill(nextIdx, animate = true) {
    if (!rpPill) return;
    const prev = rpPickIdx;
    rpPickIdx = nextIdx;
    rpPill.style.setProperty('--pick', nextIdx);
    if (Number(rpPill.style.getPropertyValue('--hover-pick')) === nextIdx) {
      rpPill.style.setProperty('--hover-op', '0');
    }
    if (!animate || prev === nextIdx || reduced.matches || !rpPillLens) return;
    clearTimeout(rpGlintTimer);
    const dir = nextIdx >= prev ? 1 : -1;
    if (rpPillGlint) {
      rpPillGlint.style.transition = 'none';
      rpPillGlint.style.setProperty('--glint-x', dir > 0 ? '-65%' : '65%');
      void rpPillGlint.offsetWidth;
      rpPillGlint.style.transition = '';
      rpPillGlint.style.setProperty('--glint-x', dir > 0 ? '65%' : '-65%');
    }
    rpPillLens.classList.add('is-stretching');
    rpGlintTimer = setTimeout(() => {
      rpPillLens.classList.remove('is-stretching');
      rpGlintTimer = 0;
    }, 440);
  }

  // Swaps the visible article and rebuilds the block list for the chosen format.
  function rpMount(key, { animatePill = false } = {}) {
    if (!rp || !RP_FORMATS[key]) return;
    rpFormat = key;
    rpIdx = -1;
    rpAutoOpen = -1;
    const f = rpFmt();
    const L = lang() === 'en' ? 1 : 0;
    rpArticles.forEach(a => { a.hidden = a.dataset.rpVariant !== key; });
    rpPost = rpArticles.find(a => a.dataset.rpVariant === key) || null;
    rpBlocks = rpPost ? [...rpPost.querySelectorAll('[data-rp-block]')] : [];
    rpHrs = rpPost ? [...rpPost.querySelectorAll('.smm-rp-hr')] : [];
    rpTrack = rpPost?.querySelector('[data-rp-track]') || null;
    rpCounter = rpPost?.querySelector('[data-rp-counter]') || null;
    rpDots = rpPost ? [...rpPost.querySelectorAll('.smm-rp-dots i')] : [];
    rpSlides = rpTrack ? rpTrack.children.length : 0;
    rpBlocks.forEach((b, i) => {
      b.style.setProperty('--k', i);
      b.style.setProperty('--kr', rpBlocks.length - 1 - i);
    });
    if (rpList) {
      rpList.innerHTML = f.blocks.map((k, i) => {
        const b = RB[k];
        return `<li style="--k:${i}"><button type="button" data-rp-go="${i}" aria-pressed="false"><span class="smm-rp-num mono">${pad2(i + 1)}</span><span class="smm-rp-name"><b data-ru="${escAttr(b.name[0])}" data-en="${escAttr(b.name[1])}">${escAttr(b.name[L])}</b><code>${escAttr(b.tag)}</code></span><i class="smm-rp-check" aria-hidden="true"></i></button></li>`;
      }).join('');
      rpLayers = [...rpList.querySelectorAll('[data-rp-go]')];
    }
    if (rpProgressBox) {
      rpProgressBox.innerHTML = '<i></i>'.repeat(f.blocks.length);
      rpProgress = [...rpProgressBox.children];
    }
    rpPicks.forEach(btn => {
      const on = btn.dataset.rpPick === key;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    rpSetFormatPill(RP_ORDER.indexOf(key), animatePill);
    rpRenderKind();
  }

  // Smooth linear sweep across the active format bar while auto-rotation is running.
  function rpStartAutoCycle(durationMs = rpCycleDuration(), { armSwitch = true } = {}) {
    clearTimeout(rpAutoTimer);
    rpAutoTimer = 0;
    const at = RP_ORDER.indexOf(rpFormat);
    rpCycle.forEach((bar, k) => {
      try { bar.__anim?.cancel(); } catch (_) {}
      bar.__anim = null;
      bar.style.transition = 'none';
      bar.style.transform = `scaleX(${k < at ? 1 : 0})`;
    });
    if (!rpCanAnimate() || rpManual) {
      if (rpCycle[at]) rpCycle[at].style.transform = 'scaleX(1)';
      return;
    }
    const activeBar = rpCycle[at];
    if (activeBar && typeof activeBar.animate === 'function') {
      activeBar.__anim = activeBar.animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: durationMs, easing: 'linear', fill: 'forwards' }
      );
    }
    if (armSwitch) {
      rpAutoTimer = setTimeout(() => {
        rpAutoTimer = 0;
        if (rpCanAnimate() && !rpManual) rpSwitch(rpNextFormat());
      }, durationMs);
    }
  }

  function rpSetManualCycle(ratio = 1) {
    const at = RP_ORDER.indexOf(rpFormat);
    rpCycle.forEach((bar, k) => {
      try { bar.__anim?.cancel(); } catch (_) {}
      bar.__anim = null;
      bar.style.transition = '';
      bar.style.transform = `scaleX(${k === at ? clampN(ratio, 0, 1).toFixed(3) : 0})`;
    });
  }

  function rpSwitch(key) {
    if (!rp || !RP_FORMATS[key]) return;
    rpClearTimers();
    rpSetDm(false);
    const old = rpPost;
    rpSwitching = true;
    const start = (keepAuto = false) => {
      rpSwitching = false;
      old?.classList.remove('is-leaving');
      rpMount(key, { animatePill: false });
      if (rpActive) rpBuild({ keepAutoCycle: keepAuto });
      else { rpPrepare(); rpNeedsBuild = true; }
    };
    if (!old || !rpActive || reduced.matches) {
      rpSetFormatPill(RP_ORDER.indexOf(key), Boolean(rpActive && !reduced.matches));
      start(false);
      return;
    }
    // Switch pill, inspector and cycle bar synchronously while the outgoing post folds away.
    rpIdx = -1;
    rpFit = false;
    rpBlocks.forEach(b => b.classList.remove('is-on', 'is-attaching'));
    rpLayers.forEach(b => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
    rpFormat = key;
    rpPicks.forEach(btn => {
      const on = btn.dataset.rpPick === key;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    rpSetFormatPill(RP_ORDER.indexOf(key), true);
    rpRenderKind();
    rpRender(true);
    const progNext = rpIsProgressive(key);
    if (!rpManual) rpStartAutoCycle(RP_FOLD_MS + rpCycleDuration(key), { armSwitch: !progNext });
    else rpSetManualCycle(progNext ? 1 / RP_FORMATS[key].blocks.length : .12);
    old.classList.add('is-leaving');
    rpBuildTimer = setTimeout(() => start(!rpManual), RP_FOLD_MS);
  }

  const rpNextFormat = () => RP_ORDER[(RP_ORDER.indexOf(rpFormat) + 1) % RP_ORDER.length];

  function rpSetSlide(i) {
    if (!rpSlides || !rpTrack) return;
    rpSlide = (i + rpSlides) % rpSlides;
    rpTrack.style.transform = `translate3d(${-rpSlide * 100}%, 0, 0)`;
    if (rpCounter) rpCounter.textContent = `${rpSlide + 1}/${rpSlides}`;
    rpDots.forEach((d, k) => d.classList.toggle('is-on', k === rpSlide));
  }

  function rpScheduleSlides() {
    clearInterval(rpSlideTimer);
    rpSlideTimer = 0;
    if (!rpCanAnimate()) return;
    rpSlideTimer = setInterval(() => {
      if (rpCanAnimate() && !rpCarouselHover) rpSetSlide(rpSlide + 1);
    }, 2800);
  }

  // Layout offsets ignore the overview scale transform, so targets stay exact while it animates.
  function rpBlockTop(b) {
    return rpPost.offsetTop + b.offsetTop;
  }

  let rpScrollRaf = 0;
  function rpStopScroll() {
    cancelAnimationFrame(rpScrollRaf);
    rpScrollRaf = 0;
  }
  function rpScrollTo(top, smooth = true) {
    if (!rpViewport || !rpPost || compact.matches) return;
    rpStopScroll();
    const padBottom = parseFloat(getComputedStyle(rpViewport).paddingBottom) || 0;
    const max = Math.max(0, rpPost.offsetTop + rpPost.offsetHeight + padBottom - rpViewport.clientHeight);
    const target = clampN(top, 0, max);
    const from = rpViewport.scrollTop;
    if (!smooth || reduced.matches || Math.abs(target - from) < 2) { rpViewport.scrollTop = target; return; }
    const t0 = performance.now();
    const dur = clampN(Math.abs(target - from) * .65, 360, 560);
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      rpViewport.scrollTop = from + (target - from) * e;
      rpScrollRaf = k < 1 ? requestAnimationFrame(step) : 0;
    };
    rpScrollRaf = requestAnimationFrame(step);
  }

  // Predicts final post-accordion offsets upfront so block transitions glide once with zero second-scroll jitter.
  function rpReveal(b, closingIdx = -1, openingSelf = false) {
    if (!b || !rpViewport || compact.matches) return;
    let top = rpBlockTop(b);
    let h = b.offsetHeight;
    const idx = rpBlocks.indexOf(b);
    if (closingIdx >= 0 && closingIdx < idx) {
      const prevPanel = rpBlocks[closingIdx]?.querySelector('.smm-rp-panel');
      if (prevPanel) top -= prevPanel.offsetHeight;
    }
    if (openingSelf) {
      const panel = b.querySelector('.smm-rp-panel');
      const inner = b.querySelector('.smm-rp-panel-in');
      if (panel && inner) h += Math.max(0, inner.scrollHeight - panel.offsetHeight);
    }
    const vh = rpViewport.clientHeight;
    rpScrollTo(h + 52 > vh ? top - 28 : top - (vh - h) / 2);
  }

  const rpDetails = i => rpBlocks[i]?.querySelector('[data-rp-details]');
  const rpIsOpen = i => Boolean(rpDetails(i)?.classList.contains('is-open'));

  function rpSetOpen(i, open) {
    const d = rpDetails(i);
    if (!d) return;
    d.classList.toggle('is-open', open);
    d.querySelector('[data-rp-toggle]')?.setAttribute('aria-expanded', String(open));
  }

  function rpSetDm(open) {
    if (!rpDm) return;
    clearTimeout(rpDmTimer);
    rpDm.classList.toggle('is-open', open);
    rpDm.setAttribute('aria-hidden', String(!open));
    rpDm.inert = !open;
  }

  function rpRender(swap) {
    if (!rp) return;
    const L = lang() === 'en' ? 1 : 0;
    const f = rpFmt();
    const put = (key, value) => { const el = rpField(key); if (el) el.textContent = value; };
    const overview = rpIdx < 0;
    const nextKey = overview ? `sum:${rpFormat}:${L}` : `blk:${rpFormat}:${rpIdx}:${L}`;
    const bodyChanged = nextKey !== rpRenderedKey;
    rpRenderedKey = nextKey;
    rp.classList.toggle('is-summary', overview);
    if (overview) {
      const s = f.summary;
      put('num', rpFit && !rpAssembling() ? s.num[L] : `${L ? 'ASSEMBLY' : 'СБОРКА'} · ${f.label[L]}`);
      put('tag', s.tag[L]);
      put('title', s.title[L]);
      put('what', s.what[L]);
      put('howlabel', L ? 'WHERE IT WORKS BEST' : 'ГДЕ РАБОТАЕТ ЛУЧШЕ');
      put('how', s.how[L]);
      put('plus-label', L ? 'STRONGER' : 'СИЛЬНЕЕ');
      put('minus-label', rpFormat === 'ultra' ? (L ? 'TRADE-OFFS' : 'ЦЕНА ПОДРОБНОСТИ') : (L ? 'GIVES WAY TO ULTRA' : 'УСТУПАЕТ ULTRA'));
      const fill = (key, items) => {
        const el = rpField(key);
        if (el) el.innerHTML = items.map(t => `<li>${escAttr(t)}</li>`).join('');
      };
      fill('plus', s.plus[L]);
      fill('minus', s.minus[L]);
      rpFunnel.forEach(el => el.classList.add('is-on'));
    } else {
      const info = RB[f.blocks[rpIdx]];
      put('num', `${pad2(rpIdx + 1)} / ${pad2(f.blocks.length)}`);
      put('tag', info.tag);
      put('title', info.title[L]);
      put('what', info.what[L]);
      put('howlabel', L ? 'HOW IT BRINGS CLIENTS' : 'КАК ПРИВОДИТ КЛИЕНТОВ');
      put('how', info.how[L]);
      rpFunnel.forEach((el, k) => el.classList.toggle('is-on', info.funnel.includes(k)));
    }
    if (rpCompare) rpCompare.hidden = !overview;
    if (swap && bodyChanged && rpBody && !reduced.matches && typeof rpBody.animate === 'function') {
      rpBody.animate(
        [{ opacity: 0, transform: 'translate3d(0, 5px, 0)' }, { opacity: 1, transform: 'translate3d(0, 0, 0)' }],
        { duration: 220, easing: 'cubic-bezier(.16, 1, .3, 1)' }
      );
    }
  }

  // Block-by-block tour runs only after the user picks a format tab manually (never overrides the 3s showcase).
  function rpScheduleTour(delay) {
    clearTimeout(rpTourTimer);
    rpTourTimer = 0;
    rp?.classList.remove('is-touring');
    if (!rpCanAnimate() || !rpManual) return;
    if (rpIdx < 0) {
      if (rpFit) rpTourTimer = setTimeout(() => rpSelect(0), delay || RP_MANUAL_OVERVIEW_MS);
      return;
    }
    const wait = delay || rpFmt().dwell[rpIdx] || 3400;
    rp.style.setProperty('--dwell', `${wait}ms`);
    const now = rpProgress[rpIdx];
    if (now) { now.classList.remove('is-now'); void now.offsetWidth; now.classList.add('is-now'); }
    rp.classList.add('is-touring');
    rpTourTimer = setTimeout(() => {
      if (rpIdx + 1 < rpBlocks.length) rpSelect(rpIdx + 1);
      else rpOverview();
    }, wait);
  }

  function rpMeasureFit() {
    if (!rpViewport || !rpPost) return;
    const cs = getComputedStyle(rpViewport);
    const room = rpViewport.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const h = rpPost.offsetHeight || 1;
    const fit = h <= room + 2 ? 1 : Math.min(1, room / h);
    const fitY = Math.round(Math.max(0, (room - h * fit) / 2));
    rpViewport.style.setProperty('--fit', fit.toFixed(4));
    rpViewport.style.setProperty('--fit-y', `${fitY}px`);
  }

  function rpSetFit(on, { instant = false } = {}) {
    if (!rpViewport || !rp) return;
    cancelAnimationFrame(rpFitRaf);
    rpFitRaf = 0;
    rpFit = on;
    const scaled = on && !compact.matches;
    if (instant && rpPost) rpPost.classList.add('is-instant');
    rpViewport.classList.toggle('is-fit', scaled);
    if (scaled) {
      rpStopScroll();
      rpViewport.scrollTop = 0;
      rpMeasureFit();
    }
    rp.classList.toggle('is-overview', on);
    rpFitBtn?.setAttribute('aria-pressed', String(on));
    if (instant && rpPost) {
      rpFitRaf = requestAnimationFrame(() => {
        rpFitRaf = requestAnimationFrame(() => {
          rpPost?.classList.remove('is-instant');
          rpFitRaf = 0;
        });
      });
    }
  }

  // Shows the finished post as subscribers see it: every block visible, hidden sections folded.
  function rpOverview({ user = false, fromBuild = false } = {}) {
    if (!rp || !rpPost) return;
    clearTimeout(rpRevealTimer);
    const hadOpen = rpBlocks.some((_, k) => rpIsOpen(k));
    rpBlocks.forEach((_, k) => rpSetOpen(k, false));
    rpAutoOpen = -1;
    rpSetDm(false);
    const changed = rpIdx >= 0 || !rpFit;
    rpIdx = -1;
    rpBlocks.forEach(b => b.classList.remove('is-on'));
    rpLayers.forEach(b => {
      b.classList.remove('is-on');
      b.setAttribute('aria-pressed', 'false');
    });
    rpProgress.forEach(el => { el.classList.add('is-done'); el.classList.remove('is-now'); });
    rpFit = true;
    rpRender(changed);
    if (rpManual) rpSetManualCycle(1);
    rp.classList.add('is-overview');
    if (fromBuild && !hadOpen && rpViewport?.classList.contains('is-fit')) {
      rpScheduleTour(user ? 8000 : 0);
      return;
    }
    const apply = () => {
      if (!rpFit || rpIdx >= 0) return;
      rpSetFit(true);
    };
    const needWait = (hadOpen ? 500 : 0) || (rpViewport && rpViewport.scrollTop > 2 && !compact.matches ? 380 : 0);
    if (rpViewport && rpViewport.scrollTop > 2 && !compact.matches) rpScrollTo(0);
    if (needWait) rpRevealTimer = setTimeout(apply, needWait);
    else apply();
    rpScheduleTour(user ? 8000 : 0);
  }

  function rpCenterLayer(i) {
    const btn = rpLayers[i];
    if (!compact.matches || !rpList || !btn) return;
    const left = btn.offsetLeft - (rpList.clientWidth - btn.offsetWidth) / 2;
    rpList.scrollTo({ left: Math.max(0, left), behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  function rpSelect(i, { scroll = true, user = false } = {}) {
    if (!rpBlocks[i] || !rpPost) return;
    const changed = i !== rpIdx;
    if (rpFit) rpSetFit(false);
    clearTimeout(rpRevealTimer);
    let closingIdx = -1;
    if (rpAutoOpen >= 0 && rpAutoOpen !== i && rpIsOpen(rpAutoOpen)) {
      closingIdx = rpAutoOpen;
      rpSetOpen(rpAutoOpen, false);
      rpAutoOpen = -1;
    }
    const ctaIdx = rpFmt().cta;
    if (i !== ctaIdx) rpSetDm(false);
    rpIdx = i;
    rpBlocks.forEach((b, k) => b.classList.toggle('is-on', k === i));
    rpLayers.forEach((b, k) => {
      const on = k === i;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    rpProgress.forEach((el, k) => {
      el.classList.toggle('is-done', k < i);
      el.classList.toggle('is-now', k === i);
    });
    let opened = false;
    if (rpDetails(i) && !rpIsOpen(i)) { rpSetOpen(i, true); rpAutoOpen = i; opened = true; }
    if (i === ctaIdx && !user && rpCanAnimate()) {
      rpDmTimer = setTimeout(() => { if (rpIdx === ctaIdx && rpActive) rpSetDm(true); }, 950);
    }
    rpRender(changed);
    if (rpManual) rpSetManualCycle((i + 1) / rpBlocks.length);
    rpCenterLayer(i);
    if (scroll) rpReveal(rpBlocks[i], closingIdx, opened);
    rpScheduleTour(user ? 7500 : 0);
  }

  function rpPrepare() {
    if (!rp || !rpPost) return;
    rpClearTimers();
    rpBlocks.forEach((_, k) => rpSetOpen(k, false));
    rpAutoOpen = -1;
    rpSetDm(false);
    rpSetSlide(0);
    rpIdx = -1;
    const prog = rpIsProgressive();
    rpPost.classList.toggle('is-assembling', !reduced.matches);
    rpPost.classList.toggle('is-progressive', prog);
    rpViewport?.classList.toggle('is-progressive', prog);
    rpPost.style.setProperty('--follow-y', '0px');
    rpSetFit(!prog, { instant: true });
    rpBlocks.forEach(b => b.classList.remove('is-placed', 'is-on', 'is-attaching'));
    rpHrs.forEach(hr => hr.classList.remove('is-placed'));
    rpLayers.forEach(b => {
      b.classList.remove('is-placed', 'is-on', 'is-snap');
      b.setAttribute('aria-pressed', 'false');
    });
    rpProgress.forEach(el => el.classList.remove('is-done', 'is-now'));
    if (prog && rpBlocks[0]) {
      rpBlocks[0].classList.add('is-placed', 'is-attaching');
      rpLayers[0]?.classList.add('is-placed');
      rpProgress[0]?.classList.add('is-now');
      rpSetCount(1);
    } else {
      rpSetCount(0);
    }
    rpRender(true);
    if (rpList) rpList.scrollLeft = 0;
  }

  function rpFinish() {
    clearTimeout(rpBuildTimer);
    rpBuildTimer = 0;
    rpBlocks.forEach(b => {
      b.classList.add('is-placed');
      b.classList.remove('is-attaching');
    });
    rpHrs.forEach(hr => hr.classList.add('is-placed'));
    rpLayers.forEach(b => b.classList.add('is-placed'));
    rpSetCount(rpBlocks.length);
    rpPost?.classList.remove('is-assembling', 'is-progressive');
    rpViewport?.classList.remove('is-progressive');
    rpPost?.style.setProperty('--follow-y', '0px');
    rpNeedsBuild = false;
  }

  function rpBuild({ keepAutoCycle = false } = {}) {
    if (!rp || !rpPost) return;
    const savedAutoTimer = keepAutoCycle ? rpAutoTimer : 0;
    if (keepAutoCycle) rpAutoTimer = 0;
    rpPrepare();
    const prog = rpIsProgressive();
    if (savedAutoTimer) rpAutoTimer = savedAutoTimer;
    else if (!rpManual && !keepAutoCycle) rpStartAutoCycle(rpCycleDuration(), { armSwitch: !prog });
    else if (rpManual) rpSetManualCycle(prog ? 1 / rpBlocks.length : .12);
    rpNeedsBuild = false;
    const settle = () => {
      rpFinish();
      rpOverview({ fromBuild: true });
      rpScheduleSlides();
      if (prog && !rpManual && rpCanAnimate()) {
        clearTimeout(rpAutoTimer);
        rpAutoTimer = setTimeout(() => {
          rpAutoTimer = 0;
          if (rpCanAnimate() && !rpManual) rpSwitch(rpNextFormat());
        }, rpRevealMs());
      }
    };
    if (reduced.matches) { settle(); return; }
    if (prog) {
      const stepDelay = rpStepMs();
      const settleDelay = rpSettleMs();
      const cs = (!compact.matches && rpViewport) ? getComputedStyle(rpViewport) : null;
      const room = cs ? (rpViewport.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) : 0;
      const firstLayer = rpLayers[0];
      if (firstLayer) {
        firstLayer.classList.add('is-snap');
        setTimeout(() => firstLayer.classList.remove('is-snap'), 420);
      }
      let k = 1;
      const attachNext = () => {
        if (!rpPost || k >= rpBlocks.length) { settle(); return; }
        rpBlocks[k - 1]?.classList.remove('is-attaching');
        rpProgress[k - 1]?.classList.remove('is-now');
        rpProgress[k - 1]?.classList.add('is-done');
        const b = rpBlocks[k];
        const prevEl = b.previousElementSibling;
        if (prevEl && prevEl.classList.contains('smm-rp-hr')) prevEl.classList.add('is-placed');
        b.classList.add('is-placed', 'is-attaching');
        rpProgress[k]?.classList.add('is-now');
        const layer = rpLayers[k];
        if (layer) {
          layer.classList.add('is-placed', 'is-snap');
          rpCenterLayer(k);
          setTimeout(() => layer.classList.remove('is-snap'), 420);
        }
        rpSetCount(k + 1);
        if (rpManual) rpSetManualCycle((k + 1) / rpBlocks.length);
        if (room > 0) {
          const h = rpPost.offsetHeight;
          const followY = h > room ? -(h - room) : 0;
          rpPost.style.setProperty('--follow-y', `${Math.round(followY)}px`);
        }
        k += 1;
        rpBuildTimer = k < rpBlocks.length
          ? setTimeout(attachNext, stepDelay)
          : setTimeout(settle, settleDelay);
      };
      rpBuildTimer = rpBlocks.length > 1 ? setTimeout(attachNext, stepDelay) : setTimeout(settle, settleDelay);
      return;
    }
    let k = 0;
    const stepMs = Math.round(RP_BUILD_SPAN_MS / Math.max(1, rpBlocks.length - 1));
    const place = () => {
      const b = rpBlocks[k], layer = rpLayers[k];
      const prevEl = b.previousElementSibling;
      if (prevEl && prevEl.classList.contains('smm-rp-hr')) prevEl.classList.add('is-placed');
      b.classList.add('is-placed');
      if (layer) {
        layer.classList.add('is-placed', 'is-snap');
        rpCenterLayer(k);
        setTimeout(() => layer.classList.remove('is-snap'), 440);
      }
      rpSetCount(k + 1);
      if (rpManual) rpSetManualCycle((k + 1) / rpBlocks.length);
      k += 1;
      rpBuildTimer = k < rpBlocks.length ? setTimeout(place, stepMs) : setTimeout(settle, 180);
    };
    rpBuildTimer = setTimeout(place, 32);
  }

  // Runs on every SMM state change: assemble once the page is in view, pause off-screen, reset once another page is shown.
  function syncRich() {
    if (!rp) return;
    if (!isSectionLive() || current !== 3) {
      if (rpActive) { rpActive = false; rpClearTimers(); rpSetDm(false); }
      if (current !== 3) {
        rpManual = false;
        rpNeedsBuild = true;
        if (section.classList.contains('is-current') && !pages[3]?.classList.contains('is-leaving')) rpPrepare();
      }
      return;
    }
    if (busy) {
      if (!rpActive && rpNeedsBuild) {
        if (rpFormat !== RP_ORDER[0]) rpMount(RP_ORDER[0]);
        else if (rpPost?.dataset.rpVariant !== rpFormat) rpMount(rpFormat);
        rpPrepare();
      }
      return;
    }
    if (rpActive) return;
    rpActive = true;
    if (rpNeedsBuild || (rpIdx < 0 && !rpFit)) {
      if (rpNeedsBuild && rpFormat !== RP_ORDER[0]) rpMount(RP_ORDER[0]);
      else if (rpPost?.dataset.rpVariant !== rpFormat) rpMount(rpFormat);
      rpBuild();
    } else {
      if (!rpManual) rpStartAutoCycle(rpCycleDuration());
      else rpScheduleTour();
      rpScheduleSlides();
    }
  }

  function rpToggle(i) {
    if (rpAssembling()) rpFinish();
    const wasOpen = rpIsOpen(i);
    if (rpIdx !== i) {
      rpSelect(i, { user: true });
      if (wasOpen) rpSetOpen(i, false);
    } else {
      rpSetOpen(i, !wasOpen);
      if (rpIsOpen(i)) rpReveal(rpBlocks[i], -1, true);
      rpScheduleTour(7500);
    }
    rpAutoOpen = -1;
    if (!rpManual) rpStartAutoCycle(RP_AUTO_MS);
  }

  function rpOpenChat(btn) {
    if (rpAssembling()) rpFinish();
    const ctaIdx = rpFmt().cta;
    if (rpIdx !== ctaIdx) rpSelect(ctaIdx, { user: true });
    else rpScheduleTour(7500);
    rpSetDm(true);
    if (!rpManual) rpStartAutoCycle(RP_AUTO_MS);
    if (!reduced.matches) {
      btn.classList.remove('is-pulse');
      void btn.offsetWidth;
      btn.classList.add('is-pulse');
    }
  }

  if (rp && rpArticles.length) {
    rp.addEventListener('click', e => {
      const t = e.target;
      const pick = t.closest('[data-rp-pick]');
      if (pick) {
        const next = pick.dataset.rpPick;
        const wasAuto = !rpManual;
        rpManual = true;
        clearTimeout(rpAutoTimer);
        rpAutoTimer = 0;
        if (next !== rpFormat) rpSwitch(next);
        else if (wasAuto) {
          if (rpAssembling()) rpFinish();
          rpSetManualCycle(1);
          rpOverview({ user: true });
        }
        return;
      }
      if (rpSwitching) return;
      const go = t.closest('[data-rp-go]');
      if (go) {
        if (rpAssembling()) rpFinish();
        rpSelect(Number(go.dataset.rpGo), { user: true });
        if (!rpManual) rpStartAutoCycle(RP_AUTO_MS);
        rpScheduleSlides();
        return;
      }
      const toggle = t.closest('[data-rp-toggle]');
      if (toggle) { rpToggle(Number(toggle.dataset.rpToggle)); return; }
      if (t.closest('[data-rp-prev]')) { rpSetSlide(rpSlide - 1); rpScheduleSlides(); return; }
      if (t.closest('[data-rp-next]')) { rpSetSlide(rpSlide + 1); rpScheduleSlides(); return; }
      const cta = t.closest('[data-rp-cta]');
      if (cta) { rpOpenChat(cta); return; }
      if (t.closest('[data-rp-dm-close]')) { rpSetDm(false); return; }
      if (t.closest('[data-rp-fit]')) {
        if (rpAssembling()) rpFinish();
        if (rpFit && rpIdx < 0) rpSelect(0, { user: true });
        else rpOverview({ user: true });
        if (!rpManual) rpStartAutoCycle(RP_AUTO_MS);
        return;
      }
      if (t.closest('[data-rp-replay]')) { if (rpActive) rpBuild(); return; }
      const block = t.closest('[data-rp-block]');
      if (block && !t.closest('button') && !rpAssembling()) {
        rpSelect(rpBlocks.indexOf(block), { scroll: rpFit, user: true });
        if (!rpManual) rpStartAutoCycle(RP_AUTO_MS);
      }
    });

    if (rpPill) {
      rpPill.addEventListener('pointerover', e => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        const btn = e.target.closest('[data-rp-pick]');
        if (!btn) return;
        const idx = RP_ORDER.indexOf(btn.dataset.rpPick);
        if (idx < 0) return;
        rpPill.style.setProperty('--hover-pick', idx);
        rpPill.style.setProperty('--hover-op', btn.classList.contains('is-active') ? '0' : '1');
      });
      rpPill.addEventListener('pointerleave', () => {
        rpPill.style.setProperty('--hover-op', '0');
      });
    }

    rp.querySelectorAll('[data-rp-carousel]').forEach(car => {
      let startX = null;
      car.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') rpCarouselHover = true; });
      car.addEventListener('pointerleave', () => { rpCarouselHover = false; });
      car.addEventListener('pointerdown', e => { if (!e.target.closest('button')) startX = e.clientX; });
      car.addEventListener('pointerup', e => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 36) { rpSetSlide(rpSlide + (dx < 0 ? 1 : -1)); rpScheduleSlides(); }
      });
      car.addEventListener('pointercancel', () => { startX = null; });
    });

    // Manual reading wins over an automatic scroll in progress.
    ['wheel', 'touchstart', 'pointerdown'].forEach(type => rpViewport?.addEventListener(type, rpStopScroll, { passive: true }));

    if (rpViewport && typeof ResizeObserver === 'function') {
      new ResizeObserver(() => { if (rpFit && rpIdx < 0 && !compact.matches) rpMeasureFit(); }).observe(rpViewport);
    }

    rpMount('ultra');
    rpPrepare();
  }

  new MutationObserver(() => { syncSoundButtons(); syncStageLabel(); rpRender(false); rpRenderKind(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  syncSoundButtons();

  function muteIfAwayFromVideos() {
    if (current !== 2) {
      videos.forEach(v => { v.muted = true; });
      syncSoundButtons();
    }
  }

  function syncAutonomous() {
    const videosOn = isVideosPageVisible();
    clearTimeout(smmVidTimer);
    if (videosOn) {
      videos.forEach(v => {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        if (v.preload !== 'auto') v.preload = 'auto';
        if (current !== 2) v.muted = true;
      });
      if (!reduced.matches) {
        const startDelay = busy ? 160 : 0;
        smmVidTimer = setTimeout(() => {
          if (!isVideosPageVisible()) return;
          const [v0, v1] = videos;
          if (v0 && v0.paused) v0.play().catch(() => {});
          if (v1 && v1.paused) requestAnimationFrame(() => { if (isVideosPageVisible() && v1.paused) v1.play().catch(() => {}); });
        }, startDelay);
      }
    } else {
      videos.forEach(v => {
        v.muted = true;
        if (!v.paused) v.pause();
      });
    }
    syncSoundButtons();
    syncRich();
    window.SmmFunnel?.run(isFunnelPageVisible());
  }

  /* ---------- Activation ---------- */
  function activate(i) {
    section.dataset.smmActive = String(i);
    frame.dataset.smmActive = String(i);
    pages.forEach((p, k) => {
      const on = k === i;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-hidden', String(!on));
      p.inert = !on;
    });
    tabs.forEach(t => {
      const owned = tabPages(t);
      const on = owned.includes(i);
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const targetIdx = on ? i : owned[0];
      if (pages[targetIdx]?.id) t.setAttribute('aria-controls', pages[targetIdx].id);
    });
    subtabs.forEach(b => {
      const on = Number(b.dataset.smmGoto) === i;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-current', String(on));
    });
    muteIfAwayFromVideos();
    syncStageLabel();
    syncRich();
  }

  // The footer label follows the slide, so "SMM // ..." always names what is on screen.
  const STAGES = [
    ['СММ // ВНИМАНИЕ В ЛЕНТЕ', 'SMM // ATTENTION IS IN THE FEED'],
    ['СММ // СЕТЬ ПРОДУКТА', 'SMM // PRODUCT NETWORK'],
    ['СММ // КОНТЕНТ: ПРОДАКШН И B2B/B2C/B2G', 'SMM // CONTENT: PRODUCTION & B2B/B2C/B2G'],
    ['СММ // КОНТЕНТ: RICH-ПОСТ ПО БЛОКАМ', 'SMM // CONTENT: RICH POST BLOCK BY BLOCK'],
    ['СММ // КОНВЕРСИЯ В ПОКУПКУ', 'SMM // CONVERSION TO SALE']
  ];
  const stageLabel = document.getElementById('ph-stage-label');
  function syncStageLabel() {
    const [ru, en] = STAGES[current] || STAGES[0];
    section.dataset.stageRu = ru;
    section.dataset.stageEn = en;
    if (stageLabel && section.classList.contains('is-current')) stageLabel.textContent = lang() === 'en' ? en : ru;
  }

  function scheduleUnderline(i, delayMs) {
    clearTimeout(underlineTimer);
    if (i !== 1 || !pages[1]) return;
    if (reduced.matches || delayMs <= 0) {
      pages[1].classList.add('is-underlined');
    } else {
      underlineTimer = setTimeout(() => {
        if (current === 1) pages[1]?.classList.add('is-underlined');
      }, delayMs);
    }
  }

  function show(i) {
    pages.forEach((p, k) => p.classList.toggle('is-shown', k === i));
    syncAutonomous();
  }

  function jump(i) {
    current = i;
    clearTimeout(underlineTimer);
    pages.forEach(p => p.classList.remove('is-underlined'));
    activate(i);
    show(i);
    if (compact.matches) section.scrollTo({ top: 0, behavior: 'instant' });
    scheduleUnderline(i, 1200);
  }

  function go(i) {
    if (i === current || i < 0 || i >= pages.length) return;
    if (busy) { pending = i; return; }
    const from = pages[current], to = pages[i], dir = i > current ? 1 : -1;
    current = i;
    if (reduced.matches || compact.matches || !from.animate) { jump(i); return; }
    busy = true;
    clearTimeout(underlineTimer);
    pages.forEach(p => {
      if (p !== from) {
        p.classList.remove('is-shown', 'is-underlined');
      }
    });
    from.classList.add('is-leaving');
    activate(i);
    syncAutonomous();
    // Trigger inner staggered entrance as the incoming slide moves into the centre at 1:1 scale.
    const fill = setTimeout(() => to.classList.add('is-shown'), DURATION * 0.28);
    const out = from.animate([
      { transform: 'translate3d(0, 0, 0)', opacity: 1 },
      { transform: `translate3d(0, ${-dir * 100}%, 0)`, opacity: 0.48 }
    ], { duration: DURATION, easing: EASE, fill: 'both' });
    const inn = to.animate([
      { transform: `translate3d(0, ${dir * 100}%, 0)`, opacity: 0.82 },
      { transform: 'translate3d(0, 0, 0)', opacity: 1 }
    ], { duration: DURATION, easing: EASE, fill: 'both' });
    inn.finished.catch(() => {}).then(() => {
      clearTimeout(fill);
      out.cancel(); inn.cancel();
      from.classList.remove('is-leaving', 'is-shown', 'is-underlined');
      busy = false;
      show(current);
      // Draw the double underline under 145 000 ₽ 1 second after the slide transition finishes.
      scheduleUnderline(current, UNDERLINE_DELAY);
      if (pending !== null && pending !== current) { const n = pending; pending = null; go(n); }
      pending = null;
    });
  }

  // Called by the deck before every "next/previous"; returns true when the step stays inside SMM.
  function step(dir) {
    if (!section.classList.contains('is-current')) return false;
    if (busy) return true;
    const next = current + dir;
    if (next < 0 || next >= pages.length) return false;
    go(next);
    return true;
  }

  // Coming back from the next section lands on the last slide, as if scrolling continued backwards.
  function enterFrom(dir) { entry = dir < 0 ? pages.length - 1 : 0; }

  pages.forEach((p, k) => { p.id = `smm-panel-${k}`; });
  tabs.forEach((t, k) => {
    t.id = `smm-tab-${k}`;
    const owned = tabPages(t);
    owned.forEach(idx => {
      if (pages[idx]) pages[idx].setAttribute('aria-labelledby', t.id);
    });
    if (pages[owned[0]]) t.setAttribute('aria-controls', pages[owned[0]].id);
    t.addEventListener('click', () => go(Number(t.dataset.smmPage)));
  });
  subtabs.forEach(b => {
    b.addEventListener('click', () => go(Number(b.dataset.smmGoto)));
  });

  new MutationObserver(() => {
    const now = section.classList.contains('is-current');
    if (now && !wasCurrent) {
      jump(entry ?? 0);
      entry = null;
      requestAnimationFrame(syncStageLabel);
    } else if (!now && wasCurrent) {
      clearTimeout(underlineTimer);
      syncAutonomous();
    }
    wasCurrent = now;
  }).observe(section, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('visibilitychange', syncAutonomous);
  reduced.addEventListener?.('change', syncAutonomous);

  window.SmmPages = { step, enterFrom, go, get page() { return current; } };
  activate(0);
  if (section.classList.contains('is-current')) {
    wasCurrent = true;
    jump(entry ?? 0);
    entry = null;
    requestAnimationFrame(syncStageLabel);
  }
})();
