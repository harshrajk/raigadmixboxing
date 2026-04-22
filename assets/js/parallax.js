/**
 * parallax.js — Hero parallax + particle canvas effect
 * Raigad Mix Boxing Association
 *
 * Features:
 *  - Video background subtle translateY parallax
 *  - Glove stage secondary parallax (depth split)
 *  - Hero box counter-scroll
 *  - Particle / smoke canvas ambient effect
 *  - Fully disabled under prefers-reduced-motion
 */
(function () {
  'use strict';

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ── Parallax ─────────────────────────────────────────────── */
  var bgVideo   = null;
  var gloveStage = null;
  var heroBox    = null;
  var rafId      = null;
  var lastScroll = 0;

  function onScroll() {
    lastScroll = window.scrollY;
    if (!rafId) {
      rafId = requestAnimationFrame(applyParallax);
    }
  }

  function applyParallax() {
    rafId = null;
    var y = lastScroll;

    if (bgVideo) {
      bgVideo.style.transform = 'translateY(' + (y * 0.3) + 'px)';
    }
    if (gloveStage) {
      gloveStage.style.transform = 'translateY(calc(-50% + ' + (y * 0.12) + 'px))';
    }
    if (heroBox) {
      heroBox.style.transform = 'translateY(' + (y * -0.08) + 'px)';
    }
  }

  function initParallax() {
    if (reducedMotion()) return;

    bgVideo    = document.querySelector('.bg-video');
    gloveStage = document.querySelector('.glove-stage');
    heroBox    = document.querySelector('.hero-box');

    if (!bgVideo && !gloveStage && !heroBox) return;

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Particle canvas ─────────────────────────────────────── */
  var canvas = null;
  var ctx    = null;
  var particles = [];
  var animFrame = null;

  var PARTICLE_COUNT = 28;
  var MAX_SPEED      = 0.35;
  var MIN_RADIUS     = 1.5;
  var MAX_RADIUS     = 4.5;

  function createParticle(w, h) {
    var angle = Math.random() * Math.PI * 2;
    var speed = (Math.random() * MAX_SPEED) + 0.08;
    return {
      x:   Math.random() * w,
      y:   Math.random() * h,
      vx:  Math.cos(angle) * speed,
      vy:  Math.sin(angle) * speed - 0.12,   /* slight upward drift */
      r:   MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS),
      life: Math.random(),
      decay: 0.0012 + Math.random() * 0.0018
    };
  }

  function drawParticle(p) {
    var alpha = p.life * 0.18;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,38,38,' + alpha + ')';
    ctx.fill();
  }

  function animateParticles() {
    animFrame = requestAnimationFrame(animateParticles);
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
        particles[i] = createParticle(w, h);
        particles[i].life = 0.05 + Math.random() * 0.25;
      } else {
        drawParticle(p);
      }
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    var hero = canvas.parentElement;
    canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }

  function initParticles() {
    if (reducedMotion()) return;

    var hero = document.querySelector('.hero');
    if (!hero) return;

    canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:absolute',
      'top:0', 'left:0',
      'width:100%', 'height:100%',
      'pointer-events:none',
      'z-index:1',
      'opacity:0.65'
    ].join(';');

    hero.appendChild(canvas);
    ctx = canvas.getContext('2d');

    resizeCanvas();

    var w = canvas.width;
    var h = canvas.height;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = createParticle(w, h);
      p.life = Math.random();
      particles.push(p);
    }

    animateParticles();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 200);
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    initParallax();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
