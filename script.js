document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. Scroll Reveal Animations
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('article, section h2, section > div');
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
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav ul li a');

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
     3. Code snippet typing animation in Hero
     ------------------------------------------------------------------------ */
  const codeBox = document.querySelector('div[aria-hidden="true"] > div');
  if (codeBox) {
    const rawCode = codeBox.innerHTML;
    codeBox.style.opacity = '0';
    
    setTimeout(() => {
      codeBox.style.transition = 'opacity 1s ease';
      codeBox.style.opacity = '1';
    }, 300);
  }

  /* ------------------------------------------------------------------------
     4. Interactive Skill Tag Highlight Effect
     ------------------------------------------------------------------------ */
  const skillBadges = document.querySelectorAll('ul[aria-label="Technical skills"] li');
  const projectArticles = document.querySelectorAll('article');

  skillBadges.forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.addEventListener('click', () => {
      const selectedSkill = badge.textContent.trim().toLowerCase();
      
      // Toggle highlight on clicked badge
      badge.classList.toggle('active-skill');

      projectArticles.forEach(article => {
        const projectTags = Array.from(article.querySelectorAll('div:nth-of-type(2) span'))
                                 .map(tag => tag.textContent.trim().toLowerCase());
        
        if (projectTags.some(tag => tag.includes(selectedSkill))) {
          article.style.borderColor = 'var(--accent-cyan)';
          article.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.4)';
        } else {
          article.style.borderColor = 'var(--border-color)';
          article.style.boxShadow = 'none';
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     5. Copy Email / Phone to Clipboard Feedback
     ------------------------------------------------------------------------ */
  const contactLinks = document.querySelectorAll('section:nth-of-type(4) a');
  contactLinks.forEach(link => {
    if (link.getAttribute('href').includes('mailto') || link.getAttribute('href').includes('tel')) {
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