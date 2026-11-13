/* Compact layouts reuse the same descriptions as the desktop diagrams. */
(() => {
  const narrow = matchMedia('(max-width:1180px)');
  const escape = text => String(text || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const translate = (text, lang) => window.DossierSite.translate(text, lang);
  window.DossierSite.addPairs([['Поставщики ИИ','AI providers']]);
  const text = (ru, en, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-ru="${escape(ru)}" data-en="${escape(en)}">${escape(document.documentElement.lang === 'en' ? en : ru)}</${tag}>`;
  const fromTip = (value, tag) => text(translate(value, 'ru'), translate(value, 'en'), tag);
  const pageTabs = index => `<div class="mobile-page-tabs">${[7,8].map((i,n)=>`<button type="button" data-goto="${i}" class="${i===index?'is-active':''}" aria-current="${i===index?'page':'false'}">${text(n?'2 · Создание контента':'1 · Система работы',n?'2 · Content production':'1 · Workflow')}</button>`).join('')}</div>`;
  const skillPanel = document.querySelector('#skill-detail-panel');
  if (skillPanel) {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'mobile-skills-back';
    back.innerHTML = text('↑ К списку компетенций','↑ Back to competencies');
    back.addEventListener('click',()=>{
      skillPanel.closest('section').scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
      document.querySelector('#skill-filter-group button.is-active')?.focus({preventScroll:true});
    });
    skillPanel.append(back);
  }
  const groupNames = [['Планирование','Planning'],['Рабочая среда','Workspace'],['Работа команды','Teamwork'],['Выпуск продукта','Product delivery']];
  document.querySelectorAll('.ph-stack').forEach((section, page) => {
    const nodes = [...section.querySelectorAll('.bp-node[data-tip-title]')];
    let buckets;
    if (page === 0) buckets = groupNames.map(([ru,en], i) => ({ru,en,nodes:nodes.filter(node => node.dataset.nodeTier === String(i))}));
    else buckets = [
      {ru:'Создание видео',en:'Video production',nodes:nodes.slice(0,9)},
      {ru:'Посты и оформление бренда',en:'Posts and brand design',nodes:nodes.slice(9,18)},
      {ru:'Готовый продукт',en:'Final product',nodes:nodes.slice(18)}
    ];
    const mobile = document.createElement('div');
    mobile.className = 'mobile-blueprint';
    mobile.innerHTML = pageTabs(page+7) +
      text('Нажмите на этап, чтобы прочитать описание.','Tap a stage to read its description.','p','mobile-caption') +
      buckets.map((bucket,i) => `<details class="mobile-process-group" ${i===0?'open':''}>
        <summary><span class="mobile-step-number">${i+1}</span>${text(bucket.ru,bucket.en,'strong')}</summary>
        <div class="mobile-process-list">${bucket.nodes.map(node => `<details class="mobile-process-node">
          <summary>${fromTip(node.dataset.tipTitle,'span')}</summary><div>${fromTip(node.dataset.tipDesc,'p')}
          ${node.hasAttribute('data-goto') ? `<button class="mobile-inline-link" type="button" data-goto="${Number(node.dataset.goto)}">${text('Открыть раздел →','Open section →')}</button>` : ''}</div>
        </details>`).join('')}</div></details>`).join('');
    section.append(mobile);
  });

  // On compact screens a provider switch avoids a single 48-item wall of text.
  const matrix = document.querySelector('#ai-matrix-grid');
  if (matrix) {
    const columns = [...matrix.querySelectorAll('.ph-ai-col')];
    const names = ['Google','OpenAI','Claude'];
    const tabs = document.createElement('div');
    tabs.className = 'mobile-provider-tabs';
    tabs.setAttribute('role','tablist');
    tabs.setAttribute('aria-label',document.documentElement.lang==='en'?'AI providers':'Поставщики ИИ');
    tabs.innerHTML = names.map((name,i)=>`<button type="button" role="tab" id="mobile-provider-${i}" aria-controls="mobile-models-${i}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}" data-provider="${i}" class="${i===0?'is-active':''}">${name}</button>`).join('');
    matrix.before(tabs);
    columns.forEach((col,i) => {col.id=`mobile-models-${i}`;col.dataset.mobileSelected=String(i===0);});
    function select(index, focus=false) {
      columns.forEach((col,i) => {col.dataset.mobileSelected=String(i===index);});
      [...tabs.children].forEach((button,i)=>{button.classList.toggle('is-active',i===index);button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
      if(focus) tabs.children[index].focus();
    }
    tabs.addEventListener('click',e=>{const button=e.target.closest('[data-provider]');if(button)select(Number(button.dataset.provider));});
    tabs.addEventListener('keydown',e=>{
      const index=Number(e.target.dataset.provider);
      if(!Number.isInteger(index))return;
      let next;
      if(e.key==='ArrowRight')next=(index+1)%3;
      else if(e.key==='ArrowLeft')next=(index+2)%3;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=2;
      if(next!==undefined){e.preventDefault();e.stopPropagation();select(next,true);}
    });
  }

  // Touch scrolling should stay native, including over a 3D product preview.
  function syncViewport() {
    document.querySelectorAll('.ph-video-brief video, .ph-prod-video-frame video').forEach(video=>{video.playsInline=true;});
    document.querySelectorAll('#video-wide,#video-vert').forEach(video=>{video.controls=narrow.matches;});
  }
  narrow.addEventListener('change',syncViewport);
  syncViewport();
})();
