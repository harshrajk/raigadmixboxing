(function () {
  var imageSelector = [
    '.gallery-item img',
    '.member-card img',
    '.member img',
    '.profile-card img',
    '.champion-card img',
    '.about-us img',
    '.bio-section img'
  ].join(', ');

  /* ── Theme Toggle ───────────────────────────────────────── */
  function initThemeToggle() {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    var saved = localStorage.getItem('rmba-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'dark');

    applyTheme(theme);

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || 'dark';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('rmba-theme', next);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  /* ── Scroll-shrink Navbar ───────────────────────────────── */
  function initScrollNavShrink() {
    var nav = document.querySelector('.page-top-nav');
    if (!nav) return;

    var rafId = null;
    window.addEventListener('scroll', function () {
      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          rafId = null;
          if (window.scrollY > 60) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
        });
      }
    }, { passive: true });
  }

  /* ── Stat Counters ──────────────────────────────────────── */
  function initStatCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    if (hasReducedMotion()) {
      el.textContent = el.getAttribute('data-count');
      return;
    }
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* ── Also animate .achievement-number[data-target] ─────── */
  function initAchievementCounters() {
    var counters = document.querySelectorAll('.achievement-number[data-target]');
    if (!counters.length) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute('data-target');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateAchievement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      el.textContent = '0';
      observer.observe(el);
    });
  }

  function animateAchievement(el) {
    if (hasReducedMotion()) {
      el.textContent = el.getAttribute('data-target');
      return;
    }
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = 1000;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.ceil(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  var glightboxReady = false;
  var glightboxInstance = null;

  function currentPageName() {
    return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function hasReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function ensureLightboxAssets(callback) {
    if (!document.querySelector('link[data-glightbox="true"]')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css';
      css.setAttribute('data-glightbox', 'true');
      document.head.appendChild(css);
    }

    if (window.GLightbox) {
      glightboxReady = true;
      callback();
      return;
    }

    var existing = document.querySelector('script[data-glightbox="true"]');
    if (existing) {
      existing.addEventListener('load', function () {
        glightboxReady = true;
        callback();
      }, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js';
    script.setAttribute('data-glightbox', 'true');
    script.onload = function () {
      glightboxReady = true;
      callback();
    };
    document.body.appendChild(script);
  }

  function openLightboxForImage(clickedImage) {
    var images = Array.from(document.querySelectorAll(imageSelector)).filter(function (img) {
      return img && img.src;
    });

    if (!images.length || !window.GLightbox) {
      return;
    }

    var dynamicElements = images.map(function (img, index) {
      return {
        href: img.currentSrc || img.src,
        type: 'image',
        title: img.alt || ('Image ' + (index + 1))
      };
    });

    var startIndex = Math.max(0, images.indexOf(clickedImage));

    if (glightboxInstance) {
      glightboxInstance.destroy();
      glightboxInstance = null;
    }

    glightboxInstance = GLightbox({
      elements: dynamicElements,
      touchNavigation: true,
      loop: true,
      zoomable: true,
      openEffect: 'zoom',
      closeEffect: 'fade'
    });

    glightboxInstance.openAt(startIndex);
  }

  function setupLightboxTriggers() {
    if (!document.querySelector(imageSelector)) {
      return;
    }

    document.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest(imageSelector) : null;
      if (!target) {
        return;
      }

      event.preventDefault();
      var open = function () {
        openLightboxForImage(target);
      };

      if (glightboxReady) {
        open();
      } else {
        ensureLightboxAssets(open);
      }
    });
  }

  function markZoomableImages() {
    document.querySelectorAll(imageSelector).forEach(function (img) {
      img.classList.add('zoomable-image');
    });
  }

  function warmupLightboxInIdle() {
    var warmup = function () {
      ensureLightboxAssets(function () {});
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(warmup, { timeout: 1800 });
    } else {
      setTimeout(warmup, 1200);
    }
  }

  function applyRevealAnimations() {
    if (hasReducedMotion()) {
      return;
    }

    var galleryItems = document.querySelectorAll('.gallery-item').length;
    var heavyPage = galleryItems > 40;
    var selector = heavyPage
      ? '.hero-box, .about-us, .bio-section, .profile-card, .member-card, .panel, .admin-card, .contact-box, .timeline-item, .gallery-item:nth-child(-n+12)'
      : '.hero-box, .about-us, .bio-section, .profile-card, .member-card, .gallery-item, .panel, .admin-card, .contact-box, .timeline-item';

    var targets = document.querySelectorAll(selector);
    if (!targets.length) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('reveal-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el, i) {
      /* Assign reveal variant by element type */
      if (el.classList.contains('about-us') || el.classList.contains('bio-section') || el.classList.contains('panel')) {
        el.classList.add('reveal-enter-left');
      } else if (el.classList.contains('profile-card') || el.classList.contains('admin-card') ||
                 el.classList.contains('hero-box')) {
        el.classList.add('reveal-enter-scale');
      } else {
        el.classList.add('reveal-enter');
      }

      /* Staggered delay, capped at 0.5s */
      var delay = Math.min(i * 0.07, 0.5);
      el.style.transitionDelay = delay + 's';

      observer.observe(el);
    });
  }

  function enhanceMediaCards() {
    var mediaNodes = document.querySelectorAll('.gallery-item, .member-card, .profile-card, .champion-card');
    var maxAnimated = mediaNodes.length > 80 ? 24 : mediaNodes.length;

    mediaNodes.forEach(function (node, i) {
      if (i < maxAnimated && !node.style.animationDelay) {
        node.style.animationDelay = (i % 12) * 0.03 + 's';
      }
      node.classList.add('transition', 'duration-300');
    });
  }

  function upgradeButtons() {
    var controls = document.querySelectorAll('button, .btn, .box, nav a');
    controls.forEach(function (el) {
      el.classList.add('focus:outline-none', 'focus:ring-2', 'focus:ring-red-500/60', 'focus:ring-offset-0');
    });
  }

  function setupPageNav() {
    var pageNav = document.querySelector('.page-top-nav');
    if (!pageNav) {
      return;
    }

    var toggle = pageNav.querySelector('.page-nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = pageNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      /* Close drawer when a link is clicked */
      var links = pageNav.querySelectorAll('.page-nav-links a');
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          pageNav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* Close on outside click */
    document.addEventListener('click', function (e) {
      if (!pageNav.contains(e.target)) {
        pageNav.classList.remove('open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function highlightActiveNavLink() {
    var current = currentPageName();
    document.querySelectorAll('nav a[href]').forEach(function (link) {
      var href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
      if (!href) {
        return;
      }
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function stylePageShell() {
    document.body.classList.add('ui-page');

    var wrappers = document.querySelectorAll('.content, .overlay');
    wrappers.forEach(function (node) {
      node.classList.add('ui-shell');
    });

    document.querySelectorAll('.contact-bar').forEach(function (bar) {
      bar.classList.add('ui-contact-bar');
    });
  }

  function setupAccessibleAccordions() {
    var buttons = document.querySelectorAll('.accordion button');
    buttons.forEach(function (btn, i) {
      var panel = btn.nextElementSibling;
      if (!panel || !panel.classList.contains('panel')) {
        return;
      }

      var panelId = panel.id || ('accordion-panel-' + i);
      panel.id = panelId;
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      });
    });
  }

  function optimizeEmbeds() {
    document.querySelectorAll('iframe').forEach(function (frame) {
      if (!frame.hasAttribute('loading')) {
        frame.setAttribute('loading', 'lazy');
      }
      if (!frame.hasAttribute('referrerpolicy')) {
        frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      }
    });
  }

  function tuneAutoplayVideos() {
    if (!hasReducedMotion()) {
      return;
    }

    document.querySelectorAll('video[autoplay]').forEach(function (video) {
      video.removeAttribute('autoplay');
      video.pause();
      video.controls = true;
    });
  }

  function normalizeMediaAttrs() {
    var allImages = Array.from(document.querySelectorAll('img'));

    allImages.forEach(function (img, index) {
      if (!img.alt) {
        img.alt = 'Raigad Mixboxing media';
      }
      var inLargeGallery = !!img.closest('.gallery-item');
      if (!img.hasAttribute('loading')) {
        img.loading = inLargeGallery ? 'lazy' : index < 2 ? 'eager' : 'lazy';
      }
      if (!img.hasAttribute('fetchpriority') && index === 0) {
        img.setAttribute('fetchpriority', 'high');
      }
      img.decoding = 'async';
    });

    document.querySelectorAll('video').forEach(function (video, index) {
      video.playsInline = true;
      if (!video.getAttribute('preload')) {
        video.setAttribute('preload', index === 0 ? 'metadata' : 'none');
      }
    });
  }

  function init() {
    normalizeMediaAttrs();
    stylePageShell();
    initThemeToggle();
    initScrollNavShrink();
    setupPageNav();
    markZoomableImages();
    setupLightboxTriggers();
    warmupLightboxInIdle();
    setupAccessibleAccordions();
    optimizeEmbeds();
    tuneAutoplayVideos();
    enhanceMediaCards();
    applyRevealAnimations();
    highlightActiveNavLink();
    upgradeButtons();
    initStatCounters();
    initAchievementCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
