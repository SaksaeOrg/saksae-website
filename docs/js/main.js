// Refonte 2027 : comportement de la v2 (header, méga-menus, bandeau du hero,
// révélations). Sans framework, comme le site actuel.
(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header : fond blanc après 40 px, caché en descendant, revient en remontant
  const header = document.querySelector('.site-header');
  let lastY = scrollY;
  const onScroll = () => {
    if (!header) return;
    const y = scrollY;
    header.classList.toggle('is-solid', y > 40);
    const menuOpen = document.querySelector('.mega.is-open') || document.body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > 240 && y > lastY);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Méga-menus : ouverture au clic et au survol (desktop), Échap pour fermer
  const triggers = [...document.querySelectorAll('[data-mega]')];
  const closeAll = (except) => {
    triggers.forEach((t) => {
      if (t === except) return;
      t.setAttribute('aria-expanded', 'false');
      document.getElementById(t.dataset.mega).classList.remove('is-open');
    });
  };
  const open = (t) => {
    closeAll(t);
    t.setAttribute('aria-expanded', 'true');
    document.getElementById(t.dataset.mega).classList.add('is-open');
    header?.classList.add('is-solid');
  };
  let hoverTimer;
  triggers.forEach((t) => {
    const panel = document.getElementById(t.dataset.mega);
    t.addEventListener('click', () => (t.getAttribute('aria-expanded') === 'true' ? closeAll() : open(t)));
    const enter = () => { clearTimeout(hoverTimer); if (matchMedia('(hover: hover)').matches) open(t); };
    const leave = () => { hoverTimer = setTimeout(() => closeAll(), 160); };
    t.addEventListener('mouseenter', enter);
    t.addEventListener('mouseleave', leave);
    panel.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
    panel.addEventListener('mouseleave', leave);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAll(); toggleMobile(false); } });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-mega], .mega')) closeAll(); });

  // --- Menu mobile plein écran
  const burger = document.querySelector('[data-burger]');
  const mobile = document.getElementById('menu-mobile');
  const toggleMobile = (force) => {
    if (!mobile) return;
    const on = force ?? mobile.hidden;
    mobile.hidden = !on;
    burger.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('menu-open', on);
    document.body.style.overflow = on ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => toggleMobile());
  mobile?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMobile(false)));

  // --- Bandeau du hero : défilement continu, tuiles recyclées (≈ 50 px/s)
  const track = document.querySelector('.marquee-track');
  if (track && !reduce) {
    let x = 0;
    let last = performance.now();
    const step = (now) => {
      const speed = innerWidth < 768 ? 30 : 50;
      const dt = Math.min(now - last, 64);
      last = now;
      if (!document.hidden) {
        x -= (speed * dt) / 1000;
        const first = track.firstElementChild;
        const w = first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
        if (-x >= w) { track.appendChild(first); x += w; }
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // --- Carrousels : boutons Précédent / Suivant, désactivés aux extrémités
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('.carousel-track');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const stepSize = () => {
      const item = track.firstElementChild;
      return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
    };
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -stepSize(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: stepSize(), behavior: reduce ? 'auto' : 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  });

  // --- Onglets : clic et flèches du clavier, soulignement qui suit l'onglet actif
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const indicator = root.querySelector('.tab-indicator');
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active', on);
      });
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
      });
    });
    const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    select(current);
    addEventListener('resize', () => select(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  });

  // --- La boucle : s'allume une seule fois quand le schéma entre à l'écran
  const loopIo = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-on'); loopIo.unobserve(e.target); } }),
    { threshold: 0.35 },
  );
  document.querySelectorAll('.loop').forEach((el) => (reduce ? el.classList.add('is-on') : loopIo.observe(el)));

  // --- Tarifs : bascule mensuel / annuel (annuel par défaut, -20 %)
  const billing = document.querySelector('.billing');
  if (billing) {
    const setCycle = (annual) => {
      billing.querySelectorAll('[data-billing]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.billing === 'annual') === annual)));
      document.querySelectorAll('.price-card[data-monthly]').forEach((card) => {
        card.querySelector('[data-price]').textContent = (billing.dataset.tPrice || '{p} €').replace('{p}', annual ? card.dataset.annual : card.dataset.monthly);
        card.querySelector('[data-saving]').textContent = annual ? billing.dataset.tAnnual.replace('{m}', card.dataset.monthly) : billing.dataset.tMonthly;
        const link = card.querySelector('[data-signup-plan]');
        if (link) link.href = `https://app.saksae.com/signup?plan=${card.dataset.plan}&cycle=${annual ? 'annual' : 'monthly'}`;
      });
    };
    billing.addEventListener('click', (e) => { const b = e.target.closest('[data-billing]'); if (b) setCycle(b.dataset.billing === 'annual'); });
    setCycle(true);
  }

  // --- Infobulles ✦ (rôle de l'IA) : placées par rapport à l'écran pour n'être
  // jamais coupées par un tableau qui défile ; survol, clavier ou appui.
  const tips = [...document.querySelectorAll('.ai-tip')];
  const place = (tip) => {
    const btn = tip.querySelector('.ai-tip-btn');
    const bubble = tip.querySelector('.ai-tip-bubble');
    const r = btn.getBoundingClientRect();
    const w = Math.min(260, innerWidth * 0.72);
    bubble.classList.add('is-fixed');
    Object.assign(bubble.style, { position: 'fixed', width: `${w}px`, right: 'auto', bottom: 'auto' });
    bubble.style.left = `${Math.min(Math.max(8, r.right - w + 6), innerWidth - w - 8)}px`;
    const h = bubble.offsetHeight;
    bubble.style.top = `${r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8}px`;
  };
  tips.forEach((tip) => {
    tip.addEventListener('mouseenter', () => place(tip));
    tip.addEventListener('focusin', () => place(tip));
    tip.querySelector('.ai-tip-btn').addEventListener('click', (e) => {
      e.preventDefault();
      const open = !tip.classList.contains('is-open');
      tips.forEach((t) => t.classList.remove('is-open'));
      if (open) { place(tip); tip.classList.add('is-open'); }
    });
  });
  if (tips.length) {
    document.addEventListener('click', (e) => { if (!e.target.closest('.ai-tip')) tips.forEach((t) => t.classList.remove('is-open')); });
    const refresh = () => tips.filter((t) => t.matches(':hover, :focus-within, .is-open')).forEach(place);
    addEventListener('scroll', refresh, { passive: true });
    document.querySelectorAll('.overflow-x-auto').forEach((el) => el.addEventListener('scroll', refresh, { passive: true }));
  }

  // --- Révélations au défilement, depuis un état toujours lisible sans JS
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -10% 0px' },
  );
  document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; io.observe(el); });
})();
