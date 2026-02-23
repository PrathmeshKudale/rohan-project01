/* ==========================================
   BUILDSURGE IRRIGATION — JAVASCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- DOM Elements ----------
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.btn)');
  const quoteForm = document.getElementById('quoteForm');
  const formSuccess = document.getElementById('formSuccess');
  const sections = document.querySelectorAll('section[id]');

  // ---------- Header Scroll Effect ----------
  let lastScroll = 0;

  function handleHeaderScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Initial check

  // ---------- Mobile Navigation ----------
  function toggleMobileNav() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    mobileOverlay.classList.toggle('show');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  }

  function closeMobileNav() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    mobileOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  // Close nav on link click (mobile)
  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileNav();
      }
    });
  });

  // Also close on CTA button click
  const navCta = document.querySelector('.nav-cta a');
  if (navCta) {
    navCta.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  // ---------- Active Nav Link on Scroll ----------
  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ---------- Scroll Animations (Intersection Observer) ----------
  const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: just make everything visible
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  // ---------- Contact Form Handling ----------
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!name || !phone || !email) {
        alert('Please fill in all required fields (Name, Phone, and Email).');
        return;
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Phone format check (at least 10 digits)
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        alert('Please enter a valid phone number (at least 10 digits).');
        return;
      }

      // Send data to backend or Netlify Forms
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocalhost) {
        // LOCAL: Send to Node.js backend
        const formData = {
          name,
          company: document.getElementById('company').value.trim(),
          phone,
          email,
          pipeSize: document.getElementById('pipeSize').value,
          quantity: document.getElementById('quantity').value.trim(),
          message: document.getElementById('message').value.trim()
        };

        fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              quoteForm.style.display = 'none';
              formSuccess.classList.add('show');
            } else {
              alert(data.message || 'Something went wrong. Please try again.');
              submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Inquiry';
              submitBtn.disabled = false;
            }
          })
          .catch(err => {
            console.error('Submission error:', err);
            alert('Could not connect to server. Please try again later.');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Inquiry';
            submitBtn.disabled = false;
          });
      } else {
        // NETLIFY: Submit via Netlify Forms
        const formDataObj = new FormData(quoteForm);
        // Ensure form-name is explicitly included (required by Netlify)
        formDataObj.set('form-name', 'inquiry');

        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formDataObj).toString()
        })
          .then(res => {
            if (res.ok) {
              quoteForm.style.display = 'none';
              formSuccess.classList.add('show');
            } else {
              throw new Error('Submission failed');
            }
          })
          .catch(err => {
            console.error('Submission error:', err);
            alert('Could not submit form. Please try again.');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Inquiry';
            submitBtn.disabled = false;
          });
      }
    });
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---------- Keyboard Accessibility ----------
  // ESC to close mobile nav
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileNav();
    }
  });

});
