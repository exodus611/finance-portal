/* Unified language navigation for calculator pages. */
(function(){
  const pill = document.querySelector('.langpill');
  if (!pill) return;
  const pathname = location.pathname;
  const lang = /\/fr\//.test(pathname) ? 'fr' : /\/en\//.test(pathname) ? 'en' : 'ru';
  const messages = {ru:'Французской версии этой страницы пока нет',fr:'Cette page n’existe pas encore en français',en:'This page is not yet available in French'};
  const styles = document.createElement('style');
  styles.textContent = '.langpill{position:static!important;inset:auto!important;display:inline-flex!important;flex:0 0 auto!important;align-items:center!important;gap:0!important;padding:3px!important;border-radius:10px!important;background:#0d2430!important;border:1px solid #54716e!important;box-shadow:none!important;line-height:1!important;font-family:system-ui,sans-serif!important;z-index:auto!important}.langpill a,.langpill button.unavailable{display:inline-flex!important;align-items:center;justify-content:center;min-width:37px;min-height:32px;padding:5px 7px!important;color:#d9e5e3!important;text-decoration:none!important;font-size:11px!important;letter-spacing:.04em!important;font-weight:750!important;border-radius:7px}.langpill a.on{color:#162b27!important;background:#f2ce7a!important}.langpill a.on::after{display:none!important}.langpill button.unavailable{opacity:.5;cursor:help;background:transparent;border:0}.langpill a:focus-visible,.langpill button:focus-visible{outline:3px solid #ca8d14!important;outline-offset:2px!important}.language-nav-host{flex-wrap:wrap!important}.language-nav-fallback{display:flex;justify-content:flex-end;padding:8px 14px;background:#f4f1e9;border-bottom:1px solid #ddd6c7}@media(max-width:420px){.langpill a,.langpill button.unavailable{min-width:33px;min-height:30px}}';
  document.head.appendChild(styles);
  pill.setAttribute('role','navigation');
  pill.setAttribute('aria-label',lang === 'fr' ? 'Langue' : lang === 'en' ? 'Language' : 'Язык');
  pill.querySelectorAll('a').forEach(a => {
    const name = a.textContent.trim().toLowerCase();
    if (['ru','fr','en'].includes(name)) a.setAttribute('hreflang',name);
    if (a.classList.contains('on')) a.setAttribute('aria-current','page');
    const href = a.getAttribute('href') || '';
    if (name === 'fr' && /(?:^|\/)fr\/?$/.test(href)) {
      const unavailable = document.createElement('button'); unavailable.type = 'button';
      unavailable.textContent = 'FR'; unavailable.className = 'unavailable';
      unavailable.setAttribute('title',messages[lang]); unavailable.setAttribute('aria-label',messages[lang]); unavailable.addEventListener('click', () => alert(messages[lang]));
      a.replaceWith(unavailable);
    }
  });
  // Replace the old two-language control if present; its links may point to the wrong locale.
  const old = Array.from(document.querySelectorAll('span')).find(el => {
    if (pill.contains(el) || !/inline-flex/i.test(el.getAttribute('style') || '')) return false;
    const parts=Array.from(el.children).filter(c=>['A','B','STRONG'].includes(c.tagName)).map(c=>c.textContent.trim());
    return parts.length === 2 && parts.includes('RU') && parts.includes('FR');
  });
  if (old) { old.replaceWith(pill); return; }
  const host = document.querySelector('header .header-actions, header .controls, header .topbar, .topbar .header-actions, header .header-container, .topbar');
  if (host) { host.classList.add('language-nav-host'); host.appendChild(pill); return; }
  const bar=document.createElement('div');bar.className='language-nav-fallback';bar.appendChild(pill);document.body.insertBefore(bar,document.body.firstChild);
})();
