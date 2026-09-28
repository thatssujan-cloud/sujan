document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. Scroll Reveal Animations
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.project-card, .section-intro, .hero-visual, .about-text, .about-side, .subsection, .exp-item, .exp-card, .gallery-item, .contact-card');
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------------------
     2. Active Navigation Highlight on Scroll
     ------------------------------------------------------------------------ */
  const sections = document.querySelectorAll('main section');
  const navLinks = document.querySelectorAll('.primary-nav a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (pageYOffset >= sectionTop) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. Mobile Navigation Toggle
     ------------------------------------------------------------------------ */
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.querySelector('.primary-nav');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Interactive Skill Tag Highlight Effect
     ------------------------------------------------------------------------ */
  const skillBadges = document.querySelectorAll('.skill-list li');
  const projectCards = document.querySelectorAll('.project-card');

  skillBadges.forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.addEventListener('click', () => {
      const selectedSkill = badge.textContent.trim().toLowerCase();

      // Toggle highlight on clicked badge
      badge.classList.toggle('active-skill');

      projectCards.forEach(card => {
        const projectTags = Array.from(card.querySelectorAll('.tag-list span'))
                                 .map(tag => tag.textContent.trim().toLowerCase());

        if (projectTags.some(tag => tag.includes(selectedSkill))) {
          card.style.borderColor = 'var(--blueprint)';
          card.style.boxShadow = '0 0 15px rgba(47, 102, 144, 0.25)';
        } else {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     5. Field Work Gallery Lightbox
     ------------------------------------------------------------------------ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let lastFocused = null;

  const openLightbox = (img, captionText) => {
    lastFocused = document.activeElement;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = captionText;
    lightbox.hidden = false;
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = '';
    if (lastFocused) lastFocused.focus();
  };

  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    const caption = item.querySelector('figcaption');
    const trigger = () => openLightbox(img, caption ? caption.textContent : '');

    item.addEventListener('click', trigger);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ------------------------------------------------------------------------
     6. Copy Email / Phone to Clipboard Feedback
     ------------------------------------------------------------------------ */
  const contactLinks = document.querySelectorAll('.contact-card a');
  contactLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.includes('mailto') || href.includes('tel'))) {
      link.addEventListener('click', (e) => {
        const textToCopy = link.textContent.trim();
        navigator.clipboard.writeText(textToCopy);

        const originalText = link.textContent;
        link.textContent = 'Copied to clipboard! ✓';
        setTimeout(() => {
          link.textContent = originalText;
        }, 2000);
      });
    }
  });

});

function initTypewriter() {
  const text = "I Study the Ground Beneath What We Build.";
  const target = document.getElementById("typing-text");

  // Safety check: exit if element doesn't exist on page
  if (!target) return;

  let index = 0;
  let isDeleting = false;

  const typeSpeed = 65;
  const deleteSpeed = 35;
  const pauseEnd = 2000;
  const pauseStart = 500;

  function typeLoop() {
    if (!document.getElementById("typing-text")) return;

    if (!isDeleting) {
      target.textContent = text.substring(0, index + 1);
      index++;

      if (index === text.length) {
        isDeleting = true;
        setTimeout(typeLoop, pauseEnd);
        return;
      }
      setTimeout(typeLoop, typeSpeed);
    } else {
      target.textContent = text.substring(0, index - 1);
      index--;

      if (index === 0) {
        isDeleting = false;
        setTimeout(typeLoop, pauseStart);
        return;
      }
      setTimeout(typeLoop, deleteSpeed);
    }
  }

  target.textContent = "";
  setTimeout(typeLoop, pauseStart);
}

// Run on page load or immediate execution if ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTypewriter);
} else {
  initTypewriter();
}

// Restart animation when returning via browser back/forward buttons
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    initTypewriter();
  }
});