/**
 * contact-form.js — Formspree AJAX submit + toast notification
 * Raigad Mix Boxing Association
 *
 * Replace mailto: form action with Formspree endpoint.
 * Shows a success/error toast and resets the form on success.
 */
(function () {
  'use strict';

  /* ── Toast ────────────────────────────────────────────────── */
  function showToast(message, type) {
    var existing = document.querySelector('.toast');
    if (existing) {
      existing.remove();
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type === 'success' ? 'success' : 'error');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);

    /* Force reflow before adding visible class */
    toast.getBoundingClientRect();
    toast.classList.add('toast-visible');

    setTimeout(function () {
      toast.classList.remove('toast-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 4500);
  }

  /* ── Form handler ─────────────────────────────────────────── */
  function initContactForm() {
    var form = document.querySelector('form[data-formspree]');
    if (!form) return;

    var endpoint = form.getAttribute('data-formspree') || form.getAttribute('action');
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.setAttribute('disabled', 'true');
      }

      var data = {};
      var inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(function (input) {
        if (!input.name) return;
        if (input.type === 'radio' || input.type === 'checkbox') {
          if (input.checked) data[input.name] = input.value;
        } else {
          data[input.name] = input.value;
        }
      });

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(function (response) {
          if (response.ok) {
            showToast('✅ Message sent! We will get back to you soon.', 'success');
            form.reset();
          } else {
            return response.json().then(function (json) {
              throw new Error((json.errors || []).map(function (e) { return e.message; }).join(', ') || 'Send failed');
            });
          }
        })
        .catch(function (err) {
          showToast('❌ Could not send message. Please email us directly at raigadmixboxing@gmail.com', 'error');
          console.warn('[contact-form] Error:', err);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.removeAttribute('disabled');
          }
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
