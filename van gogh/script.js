// script.js — lightbox e interação da galeria
document.addEventListener('DOMContentLoaded', () => {
  // carregar imagens de `images.json` (se existir) e montar a galeria dinamicamente
  async function loadImagesManifest(){
    try{
      const res = await fetch('images.json', {cache: 'no-store'});
      if(!res.ok) throw new Error('manifest not found');
      const data = await res.json();
      if(!Array.isArray(data) || data.length === 0) throw new Error('empty manifest');
      const grid = document.querySelector('.gallery-grid');
      grid.innerHTML = data.map((img, i) => {
        const full = img.full || img.url || '';
        const thumb = img.thumb || img.full || img.url || '';
        const title = (img.title || img.caption || '').replace(/"/g, '&quot;');
        const caption = img.caption || img.title || '';
        // thumbnails: loading=lazy, decoding=async, low priority; lightbox will load full image on demand
        return `\n          <figure class="card" tabindex="0" data-full="${full}" data-thumb="${thumb}" aria-label="${title}">\n            <img src="${thumb}" alt="${title}" loading="lazy" decoding="async" fetchpriority="low" />\n            <figcaption>${caption}</figcaption>\n          </figure>`;
      }).join('');
    } catch(e) {
      // se não existir manifest, manter os placeholders existentes no HTML
      // console.info('images.json não encontrada ou inválida — mantendo placeholders');
    }
  }

  // construir galeria a partir do manifest (se houver) antes de inicializar o lightbox
  loadImagesManifest().then(initGallery);

  // items e imagens serão capturados dentro de initGallery, após possível montagem dinâmica
  function initGallery(){
    const items = Array.from(document.querySelectorAll('.gallery-grid .card'));
    const allImgs = Array.from(document.querySelectorAll('img'));
    const lightbox = document.getElementById('lightbox');
    const lbImg = lightbox.querySelector('.lb-content img');
    const lbCaption = lightbox.querySelector('.lb-caption');
    const btnClose = lightbox.querySelector('.lb-close');
    const btnNext = lightbox.querySelector('.lb-next');
    const btnPrev = lightbox.querySelector('.lb-prev');
  let currentIndex = -1;
  // para retorno de foco
  let lastFocused = null;

  // menu mobile
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-navigation');
  if(navToggle && primaryNav){
    navToggle.addEventListener('click', () => {
      const isVisible = primaryNav.getAttribute('data-visible') === 'true';
      primaryNav.setAttribute('data-visible', String(!isVisible));
      navToggle.setAttribute('aria-expanded', String(!isVisible));
      // trocar label
      navToggle.setAttribute('aria-label', isVisible ? 'Abrir menu' : 'Fechar menu');
    });
  }

    function openLightbox(index){
      const item = items[index];
      // prioriza data-local, depois data-thumb, depois data-full
      const full = item.dataset.local || item.dataset.full || item.dataset.thumb || '';
      // ao abrir, priorizar carregamento rápido: pedir high priority e eager
      try{ if('fetchPriority' in HTMLImageElement.prototype) lbImg.fetchPriority = 'high'; }catch(e){}
      lbImg.loading = 'eager';
      lbImg.decoding = 'async';
      lbImg.src = full || '';
      lbImg.alt = item.getAttribute('aria-label') || (item.querySelector('figcaption') ? item.querySelector('figcaption').textContent : '');
      lbCaption.textContent = item.querySelector('figcaption') ? item.querySelector('figcaption').textContent : lbImg.alt;
      lightbox.setAttribute('aria-hidden','false');
      currentIndex = index;
      document.body.style.overflow = 'hidden';
      // guardar foco para retornar depois
      lastFocused = document.activeElement;
      btnClose.focus();
      // trap de foco simples
      trapFocus(lightbox);
    }

  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src = '';
    currentIndex = -1;
    document.body.style.overflow = '';
    // restaurar foco
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function showNext(){
    if(currentIndex < items.length - 1) openLightbox(currentIndex + 1);
    else openLightbox(0);
  }
  function showPrev(){
    if(currentIndex > 0) openLightbox(currentIndex - 1);
    else openLightbox(items.length - 1);
  }

    items.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
      // permitir abrir com Enter/Space quando em foco
      item.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });

  // fallback: se imagem remota falhar, usar placeholder SVG embutido
  const placeholderSVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <rect width='100%' height='100%' fill='%23fff8ec' />
      <g fill='%232a3b4b' font-family='Arial, Helvetica, sans-serif' font-size='28'>
        <text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle'>Imagem indisponível</text>
        <text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-size='20'>Clique para tentar abrir em alta resolução</text>
      </g>
    </svg>
  `);

  function attachImgFallback(img){
    if(!img) return;
    img.addEventListener('error', () => {
      if(img.dataset.fallback) return; // evita loop
      img.dataset.fallback = '1';
      // Tentativa de fallback em ordem: local -> thumb -> full -> placeholder
      try{
        if(img.dataset && img.dataset.local && img.dataset.local !== img.src){
          img.src = img.dataset.local;
          return;
        }
        if(img.dataset && img.dataset.thumb && img.dataset.thumb !== img.src){
          img.src = img.dataset.thumb;
          return;
        }
        if(img.dataset && img.dataset.full && img.dataset.full !== img.src){
          img.src = img.dataset.full;
          return;
        }
        img.src = placeholderSVG;
      } catch(e){ img.src = placeholderSVG; }
    });
  }

    // anexar a todas as imagens no documento
    allImgs.forEach(attachImgFallback);

    btnClose.addEventListener('click', closeLightbox);
    btnNext.addEventListener('click', showNext);
    btnPrev.addEventListener('click', showPrev);

    // Fechar clicando fora da imagem
    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) closeLightbox();
    });

    // Navegação por teclado
    document.addEventListener('keydown', (e) => {
      if(lightbox.getAttribute('aria-hidden') === 'false'){
        if(e.key === 'Escape') closeLightbox();
        if(e.key === 'ArrowRight') showNext();
        if(e.key === 'ArrowLeft') showPrev();
      }
    });
  }

  // fim do DOMContentLoaded

  // função simples para trap de foco (mantém foco dentro do lightbox)
  function trapFocus(container){
    const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if(!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length -1];

    function handle(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey){
        if(document.activeElement === first){ e.preventDefault(); last.focus(); }
      } else {
        if(document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }

    container.addEventListener('keydown', handle);
    // remover listener ao fechar
    const observer = new MutationObserver((mut) => {
      if(container.getAttribute('aria-hidden') === 'true'){
        container.removeEventListener('keydown', handle);
        observer.disconnect();
      }
    });
    observer.observe(container, { attributes: true, attributeFilter: ['aria-hidden'] });
  }
});
