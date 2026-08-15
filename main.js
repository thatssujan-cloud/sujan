/* ==========================================================================
   main.js — Shared behavior for the portfolio site

   1. Mobile navigation toggle
   2. Footer year
   3. Contact form validation (contact.html only — safely no-ops elsewhere)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  setFooterYear();
  initContactForm();
});

/**
 * Toggles the mobile navigation menu and keeps its ARIA state in sync.
 * Closes the menu when a link is clicked or Escape is pressed, and
 * returns focus to the toggle button on close for keyboard users.
 */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-active');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
}

/** Keeps the footer copyright year current without hand-editing it every year. */
function setFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * Validates the contact form on submit, announces errors accessibly via
 * role="alert" text next to each field, and moves focus to the first
 * invalid field. Safely does nothing on pages without a #contactForm.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');

  const fields = {
    name: {
      el: document.getElementById('name'),
      validate: (value) => (value.trim().length > 1 ? '' : 'Please enter your name.'),
    },
    email: {
      el: document.getElementById('email'),
      validate: (value) =>
        (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.'),
    },
    message: {
      el: document.getElementById('message'),
      validate: (value) =>
        (value.trim().length > 9 ? '' : 'Please add a few more details (10+ characters).'),
    },
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    let firstInvalidField = null;

    Object.entries(fields).forEach(([key, field]) => {
      const errorEl = document.getElementById(`${key}Error`);
      const errorMessage = field.validate(field.el.value);

      if (errorMessage) {
        field.el.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = errorMessage;
        if (!firstInvalidField) firstInvalidField = field.el;
      } else {
        field.el.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();
      statusEl.textContent = 'Please fix the highlighted fields and try again.';
      statusEl.className = 'form-status form-status--error';
      return;
    }

    // ----------------------------------------------------------------------
    // Static HTML can't send email on its own — connect a real endpoint here.
    // Two common options:
    //   1. A form backend service (Formspree, Getform, Netlify Forms, etc.)
    //      — swap the fetch URL below for the endpoint they give you.
    //   2. Your own serverless function or API route that sends the email.
    // ----------------------------------------------------------------------
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';

    try {
      // Example wiring — replace 'YOUR_FORM_ENDPOINT' with a real endpoint:
      // const response = await fetch('YOUR_FORM_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(Object.fromEntries(new FormData(form))),
      // });
      // if (!response.ok) throw new Error('Request failed');

      // Simulated delay until a real endpoint is connected above.
      await new Promise((resolve) => setTimeout(resolve, 600));

      statusEl.textContent = "Thanks! Your message is on its way — I'll reply within a couple of days.";
      statusEl.className = 'form-status form-status--success';
      form.reset();
    } catch (error) {
      statusEl.textContent = 'Something went wrong sending your message. Please email me directly instead.';
      statusEl.className = 'form-status form-status--error';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
    }
  });
}
