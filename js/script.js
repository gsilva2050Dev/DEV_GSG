(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pad = n => String(n).padStart(2, '0');

  // ---------- Theme ----------
  const applyTheme = theme => {
    root.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  };

  applyTheme(localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light'));

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // ---------- Mobile menu ----------
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const dock = document.querySelector('.dock');
  const setMenu = open => {
    navLinks.classList.toggle('open', open);
    dock.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Timecode (time on page) ----------
  const timecode = document.getElementById('timecode');
  const startedAt = Date.now();
  const tick = () => {
    const s = Math.floor((Date.now() - startedAt) / 1000);
    timecode.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  setInterval(tick, 1000);

  // ---------- Scroll progress ----------
  const bar = document.getElementById('progress-bar');
  const updateProgress = () => {
    const max = root.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ---------- Active section + counter ----------
  const sections = [...document.querySelectorAll('main > section')];
  const links = [...navLinks.querySelectorAll('a')];
  const current = document.getElementById('section-current');
  document.getElementById('section-total').textContent = pad(sections.length);

  const setActive = section => {
    current.textContent = pad(section.dataset.index);
    links.forEach(a => a.classList.toggle('active', a.dataset.section === section.id));
  };
  setActive(sections[0]);

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  // ---------- Reveal on scroll + stat count-up ----------
  const countUp = el => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (reducedMotion) return;
    const duration = 1400;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('in'));
  } else {
    // Stagger siblings that enter together.
    revealItems.forEach(el => {
      const idx = [...el.parentElement.children].filter(c => c.classList.contains('reveal')).indexOf(el);
      el.style.setProperty('--d', `${Math.max(idx, 0) * 90}ms`);
    });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        const num = e.target.querySelector('[data-count]');
        if (num) countUp(num);
        revealObserver.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    revealItems.forEach(el => revealObserver.observe(el));
  }

  // ---------- Experience carousel ----------
  const track = document.getElementById('exp-track');
  const jobs = [...track.querySelectorAll('.job')];
  const expCurrent = document.getElementById('exp-current');
  document.getElementById('exp-total').textContent = pad(jobs.length);

  const jobStep = () => jobs[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
  const goTo = i => {
    const idx = Math.max(0, Math.min(jobs.length - 1, i));
    track.scrollTo({ left: idx * jobStep(), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const currentJob = () => Math.round(track.scrollLeft / jobStep());
  document.getElementById('exp-prev').addEventListener('click', () => goTo(currentJob() - 1));
  document.getElementById('exp-next').addEventListener('click', () => goTo(currentJob() + 1));
  track.addEventListener('scroll', () => {
    expCurrent.textContent = pad(currentJob() + 1);
  }, { passive: true });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentJob() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentJob() - 1); }
  });

  // Drag to scroll with a mouse.
  let drag = null;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) {
      drag.moved = true;
      track.classList.add('dragging');
    }
    track.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    if (drag.moved) goTo(currentJob());
    drag = null;
    track.classList.remove('dragging');
  });

  // ---------- Photo bands: reveal + scroll/cursor parallax ----------
  const bands = [...document.querySelectorAll('.band')].map(el => ({
    el,
    img: el.querySelector('.band-img'),
    x: 0, y: 0, visible: true,
  }));
  const pointer = { x: 0, y: 0 };

  if (reducedMotion || !('IntersectionObserver' in window)) {
    bands.forEach(b => b.el.classList.add('in'));
  } else {
    window.addEventListener('pointermove', e => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    const bandObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const b = bands.find(x => x.el === e.target);
        b.visible = e.isIntersecting;
        if (e.isIntersecting) b.el.classList.add('in');
      });
    }, { threshold: 0.12 });
    bands.forEach(b => bandObserver.observe(b.el));

    const bandLoop = () => {
      bands.forEach(b => {
        if (!b.visible) return;
        const r = b.el.getBoundingClientRect();
        const progress = ((r.top + r.height / 2) - window.innerHeight / 2) / window.innerHeight;
        b.x += (-pointer.x * 34 - b.x) * 0.08;
        b.y += (-progress * 70 - pointer.y * 16 - b.y) * 0.08;
        b.img.style.transform = `translate3d(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px, 0) scale(1.18)`;
      });
      requestAnimationFrame(bandLoop);
    };
    bandLoop();
  }

  // Cursor spotlight on the photo bands.
  if (finePointer && !reducedMotion) {
    bands.forEach(b => {
      b.el.addEventListener('pointermove', e => {
        const r = b.el.getBoundingClientRect();
        b.el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        b.el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // ---------- Pointer effects (fine pointers only) ----------
  if (finePointer && !reducedMotion) {
    const cursor = document.getElementById('cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    document.body.classList.add('has-cursor');
    window.addEventListener('pointermove', e => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.classList.add('visible');
    });
    document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('a, button, .job, .spot').forEach(el => {
      el.addEventListener('pointerenter', () => cursor.classList.add('active'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('active'));
    });

    // Spotlight glow that follows the pointer inside cards.
    document.querySelectorAll('.spot').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    // Magnetic buttons.
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.25;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();
