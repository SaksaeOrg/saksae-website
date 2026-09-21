/* SAKSAE — static site behaviour. No framework, no build step beyond Tailwind. */
(function () {
  'use strict';

  document.documentElement.classList.add('js-on');

  var EN = window.SAKSAE_EN || {};
  var DYN = window.SAKSAE_DYN;
  var lang = 'fr';

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var reflow = function (el) {
    return el.offsetHeight;
  };
  var swapClasses = function (el, remove, add) {
    if (remove) el.classList.remove.apply(el.classList, remove.split(' '));
    if (add) el.classList.add.apply(el.classList, add.split(' '));
  };

  /* ====================================================================
     i18n — French lives in the DOM, English comes from SAKSAE_EN
     ==================================================================== */

  var frSnapshot = new Map();
  var frLabels = new Map();

  function snapshotFrench() {
    $$('[data-i18n]').forEach(function (el) {
      frSnapshot.set(el, el.textContent);
    });
    $$('[data-i18n-html]').forEach(function (el) {
      frSnapshot.set(el, el.innerHTML);
    });
    // Les aria-label des maquettes décoratives vivent dans l'attribut, pas
    // dans le contenu : ils ont leur propre instantané.
    $$('[data-i18n-label]').forEach(function (el) {
      frLabels.set(el, el.getAttribute('aria-label'));
    });
  }

  function applyLanguage(next) {
    lang = next === 'en' ? 'en' : 'fr';
    document.documentElement.lang = lang;

    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (lang === 'en' && EN[key] != null) {
        // Keys may carry entities (&amp;) or newlines; innerHTML keeps both intact.
        el.innerHTML = EN[key];
      } else {
        el.textContent = frSnapshot.get(el);
      }
    });

    $$('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      el.innerHTML = lang === 'en' && EN[key] != null ? EN[key] : frSnapshot.get(el);
    });

    $$('[data-i18n-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-label');
      el.setAttribute(
        'aria-label',
        lang === 'en' && EN[key] != null ? EN[key] : frLabels.get(el)
      );
    });

    $$('[data-lang-toggle]').forEach(function (btn) {
      btn.textContent = lang;
      btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
    });

    try {
      localStorage.setItem('saksae-lang', lang);
    } catch (e) {
      /* private mode, blocked storage — the page still works */
    }

    renderStepCounters();
    renderPricing();
    renderCalculator();
    startTyping();
  }

  function t() {
    return DYN[lang];
  }

  /* ====================================================================
     Scroll reveals — replaces framer-motion whileInView
     ==================================================================== */

  function initReveals() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0 }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ====================================================================
     Panels — replaces <AnimatePresence mode="wait">
     ==================================================================== */

  function activatePanel(panel) {
    panel.classList.remove('is-active');
    reflow(panel);
    panel.classList.add('is-active');
    $$('.stagger', panel).forEach(function (group) {
      group.classList.remove('is-playing');
      reflow(group);
      group.classList.add('is-playing');
    });
    if (panel.classList.contains('stagger')) {
      panel.classList.remove('is-playing');
      reflow(panel);
      panel.classList.add('is-playing');
    }
  }

  function showPanel(container, key, duration) {
    var current = $('.panel:not([hidden])', container);
    var next = container.querySelector('.panel[data-panel="' + key + '"]');
    if (!next || current === next) return;

    var enter = function () {
      next.classList.add('is-entering');
      next.hidden = false;
      reflow(next);
      next.classList.remove('is-entering');
      activatePanel(next);
    };

    if (!current) {
      enter();
      return;
    }
    current.classList.add('is-leaving');
    window.setTimeout(function () {
      current.hidden = true;
      current.classList.remove('is-leaving', 'is-active');
      enter();
    }, duration);
  }

  /** Play the initially-visible panel's animations when its group scrolls in. */
  function initPanelGroups() {
    var groups = $$('[data-panels]');
    if (!('IntersectionObserver' in window)) {
      groups.forEach(function (g) {
        var p = $('.panel:not([hidden])', g);
        if (p) activatePanel(p);
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var panel = $('.panel:not([hidden])', entry.target);
          if (panel) activatePanel(panel);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    groups.forEach(function (g) {
      io.observe(g);
    });
  }

  /* ====================================================================
     Tab bars — replaces framer-motion layoutId for the moving underline
     ==================================================================== */

  function positionUnderline(bar) {
    var underline = $('[data-underline]', bar);
    if (!underline) return;
    var active = bar.querySelector('[data-tab][aria-selected="true"]');
    if (!active) return;
    var inset = Number(bar.getAttribute('data-underline-inset') || 0);
    underline.style.transform = 'translateX(' + (active.offsetLeft + inset) + 'px)';
    underline.style.width = Math.max(0, active.offsetWidth - inset * 2) + 'px';
    underline.classList.add('is-ready');
  }

  function initTabs(name, config) {
    var bar = $('[data-tabs="' + name + '"]');
    var panels = $('[data-panels="' + name + '"]');
    if (!bar) return null;

    var select = function (key) {
      $$('[data-tab]', bar).forEach(function (btn) {
        var on = btn.getAttribute('data-tab') === key;
        btn.setAttribute('aria-selected', String(on));
        swapClasses(btn, on ? config.inactive : config.active, on ? config.active : config.inactive);
      });
      positionUnderline(bar);
      if (panels) showPanel(panels, key, config.duration);
      if (config.onSelect) config.onSelect(key);
    };

    bar.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-tab]');
      if (!btn || !bar.contains(btn)) return;
      if (config.onInteract) config.onInteract();
      select(btn.getAttribute('data-tab'));
    });

    window.addEventListener('resize', function () {
      positionUnderline(bar);
    });
    positionUnderline(bar);

    return { select: select, bar: bar };
  }

  /* ====================================================================
     Header
     ==================================================================== */

  /**
   * Les maquettes produit portent role="img" et un aria-label : elles doivent
   * s'annoncer comme une seule illustration. La spec ARIA prévoit que role="img"
   * rende ses descendants présentationnels, mais Chrome ne l'applique pas —
   * vérifié : le contenu interne reste exposé. On masque donc explicitement les
   * enfants, le libellé restant porté par le parent.
   */
  function hideDecorativeSubtrees() {
    $$('[role="img"][data-i18n-label]').forEach(function (el) {
      Array.prototype.forEach.call(el.children, function (child) {
        child.setAttribute('aria-hidden', 'true');
      });
    });
  }

  function initHeader() {
    var toggle = $('#mobile-menu-toggle');
    var menu = $('#mobile-menu');
    if (!toggle || !menu) return;

    var setOpen = function (open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      $('[data-menu-open]', toggle).hidden = open;
      $('[data-menu-close]', toggle).hidden = !open;
    };

    toggle.addEventListener('click', function () {
      setOpen(menu.hidden);
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    $$('[data-i18n-label]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-label');
      el.setAttribute(
        'aria-label',
        lang === 'en' && EN[key] != null ? EN[key] : frLabels.get(el)
      );
    });

    $$('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLanguage(lang === 'fr' ? 'en' : 'fr');
      });
    });
  }

  /* ====================================================================
     Hero — ambient action popups
     ==================================================================== */

  function initHeroPopups() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    $$('#hero-popups .hero-popup').forEach(function (el) {
      var positions;
      try {
        positions = JSON.parse(el.getAttribute('data-positions'));
      } catch (e) {
        return;
      }
      var delay = parseFloat(el.getAttribute('data-delay')) || 0;
      var index = 0;

      var place = function () {
        el.style.left = '';
        el.style.right = '';
        var pos = positions[index];
        Object.keys(pos).forEach(function (prop) {
          el.style[prop] = pos[prop];
        });
      };

      var show = function () {
        place();
        el.classList.remove('is-out');
        el.classList.add('is-in');
        window.setTimeout(function () {
          el.classList.remove('is-in');
          el.classList.add('is-out');
          window.setTimeout(function () {
            el.classList.remove('is-out');
            index = (index + 1) % positions.length;
          }, 400);
        }, 2800);
      };

      place();
      window.setTimeout(function () {
        show();
        window.setInterval(show, (delay + 3.6) * 1000 + 3600);
      }, delay * 1000);
    });
  }

  /* ====================================================================
     [01] Platform
     ==================================================================== */

  var PLATFORM_ACTIVE_ITEM = {
    crm: 'clients',
    services: 'missions',
    produits: 'catalogue',
    management: 'projets',
    finance: 'facturation',
    equipe: 'collaborateurs',
  };
  var NAV_ON = 'bg-white text-[#0A0A0A] font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.04)]';
  var NAV_OFF = 'text-[#4B5563] hover:bg-white/60';

  function initPlatform() {
    initTabs('platform', {
      active: 'text-[#0A0A0A] font-semibold',
      inactive: 'text-[#6E6E77] hover:text-[#52525B]',
      duration: 200,
      onSelect: function (key) {
        var wanted = PLATFORM_ACTIVE_ITEM[key];
        $$('.platform-nav').forEach(function (item) {
          var on = item.getAttribute('data-item') === wanted;
          swapClasses(item, on ? NAV_OFF : NAV_ON, on ? NAV_ON : NAV_OFF);
        });
      },
    });
    // Paint the initial highlight without animating the panel.
    var wanted = PLATFORM_ACTIVE_ITEM.crm;
    $$('.platform-nav').forEach(function (item) {
      var on = item.getAttribute('data-item') === wanted;
      swapClasses(item, on ? NAV_OFF : NAV_ON, on ? NAV_ON : NAV_OFF);
    });
  }

  /* ====================================================================
     [02] Onboarding carousel
     ==================================================================== */

  var ONB_STEPS = 4;
  var onbTimer = null;
  var onbStep = 0;

  function renderStepCounters() {
    $$('[data-step-counter]').forEach(function (el) {
      var panel = el.closest('.panel');
      var index = panel ? Number(panel.getAttribute('data-panel')) : 0;
      el.textContent = t().stepCounter(index + 1, ONB_STEPS);
    });
  }

  function initOnboarding() {
    var bar = $('[data-tabs="onb"]');
    var panels = $('[data-panels="onb"]');
    if (!bar || !panels) return;

    var select = function (index) {
      onbStep = index;
      $$('[data-tab]', bar).forEach(function (btn) {
        var on = Number(btn.getAttribute('data-tab')) === index;
        btn.setAttribute('aria-selected', String(on));
        if (btn.classList.contains('onb-bar')) {
          swapClasses(btn, on ? 'bg-[#E5E7EB]' : 'bg-[#0A0A0A]', on ? 'bg-[#0A0A0A]' : 'bg-[#E5E7EB]');
        } else {
          swapClasses(
            btn,
            on ? 'text-[#6B7280]' : 'text-[#0A0A0A] font-medium',
            on ? 'text-[#0A0A0A] font-medium' : 'text-[#6B7280]'
          );
        }
      });
      showPanel(panels, String(index), 300);
    };

    var start = function () {
      window.clearInterval(onbTimer);
      onbTimer = window.setInterval(function () {
        select((onbStep + 1) % ONB_STEPS);
      }, 3000);
    };

    bar.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-tab]');
      if (!btn) return;
      select(Number(btn.getAttribute('data-tab')));
      start();
    });

    start();
  }

  /* ====================================================================
     [03] AI tools
     ==================================================================== */

  function initTools() {
    initTabs('tools', {
      active: 'text-[#0A0A0A]',
      inactive: 'text-[#6E6E77] hover:text-[#52525B]',
      duration: 250,
    });
  }

  /* ====================================================================
     [04] AI — typing headline and expandable action cards
     ==================================================================== */

  var typeTimer = null;

  function startTyping() {
    var target = $('#ai-typed');
    if (!target) return;
    var text = t().greeting;
    window.clearInterval(typeTimer);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.textContent = text;
      return;
    }

    var i = 0;
    target.textContent = '';
    typeTimer = window.setInterval(function () {
      if (i < text.length) {
        target.textContent = text.slice(0, ++i);
      } else {
        window.clearInterval(typeTimer);
      }
    }, 28);
  }

  function initCursor() {
    var cursor = $('#ai-cursor');
    if (!cursor) return;
    window.setInterval(function () {
      cursor.classList.toggle('opacity-0');
    }, 530);
  }

  var CARD_OFF = 'border-[#E4E4E7] hover:border-[#D4D4D8]';
  var CARD_ON_REV = 'border-[#059669]/30 shadow-[0_1px_8px_rgba(5,150,105,0.06)]';
  var CARD_ON_OP = 'border-[#3B82F6]/30 shadow-[0_1px_8px_rgba(59,130,246,0.06)]';

  function closeAccordion(btn) {
    var panel = btn.parentElement.querySelector('[data-accordion-panel]');
    btn.setAttribute('aria-expanded', 'false');
    swapClasses(btn, btn.classList.contains('ai-card-op') ? CARD_ON_OP : CARD_ON_REV, CARD_OFF);
    var chevron = $('[data-chevron]', btn);
    if (chevron) chevron.classList.remove('rotate-180');
    panel.style.height = panel.scrollHeight + 'px';
    reflow(panel);
    panel.style.height = '0px';
    panel.style.opacity = '0';
  }

  function openAccordion(btn) {
    var panel = btn.parentElement.querySelector('[data-accordion-panel]');
    btn.setAttribute('aria-expanded', 'true');
    swapClasses(btn, CARD_OFF, btn.classList.contains('ai-card-op') ? CARD_ON_OP : CARD_ON_REV);
    var chevron = $('[data-chevron]', btn);
    if (chevron) chevron.classList.add('rotate-180');
    panel.style.height = panel.scrollHeight + 'px';
    panel.style.opacity = '1';
    panel.addEventListener('transitionend', function once(event) {
      if (event.propertyName !== 'height') return;
      panel.removeEventListener('transitionend', once);
      if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
    });
  }

  function initAccordions() {
    $$('[data-accordion]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        // Only one card open per group, matching the original single-index state.
        var group = btn.closest('.space-y-2');
        if (group) {
          $$('[data-accordion][aria-expanded="true"]', group).forEach(function (other) {
            if (other !== btn) closeAccordion(other);
          });
        }
        if (open) closeAccordion(btn);
        else openAccordion(btn);
      });
    });
  }

  /* ====================================================================
     [05] Pricing
     ==================================================================== */

  var annual = true;
  var BILL_ON = 'bg-white text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)]';
  var BILL_OFF = 'text-[#6E6E77] hover:text-[#52525B]';

  function renderPricing() {
    var toggle = $('#billing-toggle');
    if (!toggle) return;

    $$('[data-billing]', toggle).forEach(function (btn) {
      var on = (btn.getAttribute('data-billing') === 'annual') === annual;
      swapClasses(btn, on ? BILL_OFF : BILL_ON, on ? BILL_ON : BILL_OFF);
    });

    var note = $('#annual-note');
    if (note) note.hidden = !annual;

    $$('[data-plan]').forEach(function (card) {
      var price = $('[data-price]', card);
      var per = $('[data-per]', card);
      var saving = $('[data-saving]', card);
      var custom = card.hasAttribute('data-custom');

      if (custom) {
        price.textContent = annual ? t().entAnnual : t().entMonthly;
        if (per) per.hidden = annual;
      } else {
        price.textContent = '€' + card.getAttribute(annual ? 'data-annual' : 'data-monthly');
        if (per) per.hidden = false;
        if (saving) {
          saving.hidden = !annual;
          saving.textContent = t().instead(card.getAttribute('data-monthly'));
        }
      }
      if (per && !per.hidden) {
        var unit = $('[data-i18n="pricing.mo"]', per);
        if (unit) unit.textContent = t().perMonth;
      }
    });
  }

  function initPricing() {
    var toggle = $('#billing-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-billing]');
      if (!btn) return;
      annual = btn.getAttribute('data-billing') === 'annual';
      renderPricing();
    });
    renderPricing();
  }

  /* ====================================================================
     Savings calculator
     ==================================================================== */

  var MARKET_TOOLS = [
    { name: 'Zoom', price: 15 },
    { name: 'Otter.ai', price: 17 },
    { name: 'Asana', price: 25 },
    { name: 'Monday', price: 30 },
    { name: 'Calendly', price: 12 },
    { name: 'DocuSign', price: 25 },
    { name: 'PandaDoc', price: 35 },
    { name: 'Notion', price: 10 },
    { name: 'Slack', price: 12 },
    { name: 'PayFit', price: 50 },
  ];
  var SAKSAE_PRICE = 63;
  var selectedTools = {};
  var TOOL_ON = 'border-[#0A0A0A] bg-[#0A0A0A] text-white';
  var TOOL_OFF = 'border-[#E5E7EB] hover:border-[#0A0A0A]';

  function renderCalculator() {
    var list = $('#calc-tools');
    if (!list) return;

    list.innerHTML = '';
    MARKET_TOOLS.forEach(function (tool) {
      var on = !!selectedTools[tool.name];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'p-3 rounded-lg border text-left transition-all ' + (on ? TOOL_ON : TOOL_OFF);
      btn.setAttribute('aria-pressed', String(on));
      btn.dataset.tool = tool.name;

      var name = document.createElement('p');
      name.className = 'text-sm font-medium';
      name.textContent = tool.name;

      var price = document.createElement('p');
      price.className = 'text-xs ' + (on ? 'text-white/60' : 'text-[#6B7280]');
      price.textContent = '€' + tool.price + '/' + t().perUser;

      btn.appendChild(name);
      btn.appendChild(price);
      list.appendChild(btn);
    });

    var total = MARKET_TOOLS.reduce(function (sum, tool) {
      return sum + (selectedTools[tool.name] ? tool.price : 0);
    }, 0);
    var monthly = Math.max(0, total - SAKSAE_PRICE);

    $('#calc-current').textContent = '€' + total + '/' + t().perUser;
    $('#calc-saksae').textContent = '€' + SAKSAE_PRICE + '/' + t().perUser;
    $('#calc-monthly').textContent = '€' + monthly + '/' + t().perMonth;
    $('#calc-yearly').textContent = '= €' + monthly * 12 + '/' + t().perYear;
  }

  function initCalculator() {
    var modal = $('#calculator');
    var open = $('#open-calculator');
    var list = $('#calc-tools');
    if (!modal || !open) return;

    var lastFocus = null;

    var setOpen = function (show) {
      if (show) {
        lastFocus = document.activeElement;
        modal.hidden = false;
        reflow(modal);
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        $('[data-close-calculator]', modal).focus();
      } else {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        window.setTimeout(function () {
          modal.hidden = true;
        }, 200);
        if (lastFocus) lastFocus.focus();
      }
    };

    open.addEventListener('click', function () {
      setOpen(true);
    });
    modal.addEventListener('click', function (event) {
      if (event.target === modal || event.target.closest('[data-close-calculator]')) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) setOpen(false);
    });
    list.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-tool]');
      if (!btn) return;
      var name = btn.dataset.tool;
      selectedTools[name] = !selectedTools[name];
      renderCalculator();
    });

    renderCalculator();
  }

  /* ====================================================================
     Boot
     ==================================================================== */

  function init() {
    snapshotFrench();

    var saved = null;
    try {
      saved = localStorage.getItem('saksae-lang');
    } catch (e) {
      /* ignore */
    }
    applyLanguage(saved === 'en' ? 'en' : 'fr');

    var year = $('#footer-year');
    if (year) year.textContent = String(new Date().getFullYear());

    hideDecorativeSubtrees();
    initHeader();
    initReveals();
    initPanelGroups();
    initHeroPopups();
    initPlatform();
    initOnboarding();
    initTools();
    initAccordions();
    initCursor();
    initPricing();
    initCalculator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
