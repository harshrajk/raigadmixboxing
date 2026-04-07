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
    }, { threshold: 0.15 });

    targets.forEach(function (el) {
      el.classList.add('reveal-enter');
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
    }
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


  function injectPicoRuntime() {
    if (!document.querySelector('link[data-pico-theme="true"]')) {
      var theme = document.createElement('link');
      theme.rel = 'stylesheet';
      theme.href = 'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css';
      theme.setAttribute('data-pico-theme', 'true');
      document.head.appendChild(theme);
    }
  }

  function applyInformationLayout() {
    var sectionLike = document.querySelectorAll('.about-us, .bio-section, .panel, .details, .table-container, .contact-box, .calendar, .month');
    sectionLike.forEach(function (node) {
      node.classList.add('p-4', 'md:p-6');
    });

    document.querySelectorAll('h1, h2, h3').forEach(function (h) {
      if (!h.style.marginBottom) {
        h.style.marginBottom = '0.6rem';
      }
    });
  }

  function init() {
    normalizeMediaAttrs();
    injectPicoRuntime();
    stylePageShell();
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
    applyInformationLayout();
    upgradeButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
