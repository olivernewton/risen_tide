/* ================================================
   RISEN TIDE CHARTER CO. — Main JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHero();
  initScrollReveal();
  initReviews();
  initGallery();
  initWeather();
  initFloatingCta();
  initContactForm();
});

/* === NAVIGATION === */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    floatingCtaCheck();
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open');
    document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
  });

  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (navLinks?.classList.contains('is-open') &&
        !navLinks.contains(e.target) && !hamburger?.contains(e.target)) {
      hamburger?.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
}

/* === HERO PARALLAX === */
function initHero() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
}

/* === SCROLL REVEAL === */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal--left, .reveal--right');
  if (!revealEls.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

/* === REVIEWS CAROUSEL === */
function initReviews() {
  const track = document.querySelector('.reviews-track');
  if (!track) return;

  const cards = track.querySelectorAll('.review-card');
  const dotsContainer = document.querySelector('.reviews-dots');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');

  let current = 0;
  let perView = getPerView();
  const total = cards.length;
  const maxIndex = Math.max(0, total - perView);

  function getPerView() {
    return window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const dotCount = Math.ceil(total / perView);
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'reviews-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i * perView));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dotIndex = Math.floor(current / perView);
    dotsContainer.querySelectorAll('.reviews-dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === dotIndex);
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex));
    const cardWidth = cards[0].offsetWidth + 14;
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  buildDots();

  /* Auto-rotate every 5 seconds */
  let autoplay = setInterval(() => {
    const next = current + 1 > maxIndex ? 0 : current + 1;
    goTo(next);
  }, 5000);

  track.parentElement?.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.parentElement?.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => {
      const next = current + 1 > maxIndex ? 0 : current + 1;
      goTo(next);
    }, 5000);
  });

  /* Recalculate on resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      perView = getPerView();
      buildDots();
      goTo(0);
    }, 200);
  });

  /* Touch/swipe */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });
}

/* === GALLERY LIGHTBOX === */
function initGallery() {
  const items = document.querySelectorAll('.gallery__item');
  if (!items.length) return;

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  if (!lightbox || !lightboxImg) return;

  const images = [];
  let currentIdx = 0;

  items.forEach((item, i) => {
    const img = item.querySelector('img');
    if (img) images.push(img.src);
    item.addEventListener('click', () => openLightbox(i));
  });

  function openLightbox(idx) {
    currentIdx = idx;
    lightboxImg.src = images[idx];
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIdx];
  });
  document.getElementById('lightboxNext')?.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % images.length;
    lightboxImg.src = images[currentIdx];
  });

  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { currentIdx = (currentIdx - 1 + images.length) % images.length; lightboxImg.src = images[currentIdx]; }
    if (e.key === 'ArrowRight') { currentIdx = (currentIdx + 1) % images.length; lightboxImg.src = images[currentIdx]; }
  });
}

/* === LIVE WEATHER — Open-Meteo (free, no API key) === */
function initWeather() {
  const widget = document.getElementById('weatherWidget');
  if (!widget) return;

  // St. Marys, GA / Camden County coordinates
  const LAT = 30.7318;
  const LON = -81.5479;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,windspeed_10m,winddirection_10m,weathercode,relative_humidity_2m,precipitation&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FNew_York`;

  const WMO = {
    0:  { desc: 'Clear Sky',       icon: '☀️' },
    1:  { desc: 'Mainly Clear',    icon: '🌤️' },
    2:  { desc: 'Partly Cloudy',   icon: '⛅' },
    3:  { desc: 'Overcast',        icon: '☁️' },
    45: { desc: 'Foggy',           icon: '🌫️' },
    48: { desc: 'Icing Fog',       icon: '🌫️' },
    51: { desc: 'Light Drizzle',   icon: '🌦️' },
    53: { desc: 'Drizzle',         icon: '🌦️' },
    55: { desc: 'Heavy Drizzle',   icon: '🌧️' },
    61: { desc: 'Light Rain',      icon: '🌧️' },
    63: { desc: 'Rain',            icon: '🌧️' },
    65: { desc: 'Heavy Rain',      icon: '🌧️' },
    71: { desc: 'Light Snow',      icon: '❄️' },
    73: { desc: 'Snow',            icon: '❄️' },
    75: { desc: 'Heavy Snow',      icon: '❄️' },
    77: { desc: 'Snow Grains',     icon: '❄️' },
    80: { desc: 'Light Showers',   icon: '🌦️' },
    81: { desc: 'Showers',         icon: '🌧️' },
    82: { desc: 'Heavy Showers',   icon: '⛈️' },
    95: { desc: 'Thunderstorm',    icon: '⛈️' },
    96: { desc: 'Thunderstorm',    icon: '⛈️' },
    99: { desc: 'Thunderstorm',    icon: '⛈️' },
  };

  function getWmo(code) {
    return WMO[code] || { desc: 'Conditions Vary', icon: '🌊' };
  }

  function windDir(deg) {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  function fishingRating(code, wind, temp) {
    if ([95,96,99,65,82].includes(code)) return { rating: 'Poor', color: '#e74c3c' };
    if (wind > 20) return { rating: 'Rough', color: '#e67e22' };
    if ([0,1,2].includes(code) && wind < 12 && temp > 55 && temp < 95) return { rating: 'Excellent', color: '#27ae60' };
    if ([3,51,53,61,63].includes(code) || wind > 12) return { rating: 'Fair', color: '#f39c12' };
    return { rating: 'Good', color: '#2ecc71' };
  }

  fetch(url)
    .then(r => r.json())
    .then(data => {
      const c = data.current;
      const temp     = Math.round(c.temperature_2m);
      const feels    = Math.round(c.apparent_temperature);
      const wind     = Math.round(c.windspeed_10m);
      const windDeg  = c.winddirection_10m;
      const humidity = Math.round(c.relative_humidity_2m);
      const precip   = c.precipitation;
      const code     = c.weathercode;
      const wmo      = getWmo(code);
      const fish     = fishingRating(code, wind, temp);
      const now      = new Date();
      const timeStr  = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

      widget.innerHTML = `
        <div class="weather-widget__loc">
          <span>📍</span> St. Marys, GA — Camden County
        </div>
        <div class="weather-widget__main">
          <div class="weather-widget__icon">${wmo.icon}</div>
          <div class="weather-widget__temps">
            <div class="weather-widget__temp">${temp}<sup>°F</sup></div>
            <div class="weather-widget__cond">${wmo.desc}</div>
            <div class="weather-widget__feels">Feels like ${feels}°F · Updated ${timeStr}</div>
          </div>
        </div>
        <div class="weather-widget__details">
          <div class="weather-detail">
            <span class="weather-detail__icon">💨</span>
            <span class="weather-detail__val">${wind} mph</span>
            <span class="weather-detail__lbl">Wind ${windDir(windDeg)}</span>
          </div>
          <div class="weather-detail">
            <span class="weather-detail__icon">💧</span>
            <span class="weather-detail__val">${humidity}%</span>
            <span class="weather-detail__lbl">Humidity</span>
          </div>
          <div class="weather-detail">
            <span class="weather-detail__icon">🎣</span>
            <span class="weather-detail__val" style="color:${fish.color}">${fish.rating}</span>
            <span class="weather-detail__lbl">Fishing</span>
          </div>
        </div>
      `;
    })
    .catch(() => {
      widget.innerHTML = `
        <div class="weather-error">
          <div style="font-size:48px;margin-bottom:12px">🌊</div>
          <div class="weather-error__text">Weather data temporarily unavailable.<br>Check back soon for current conditions.</div>
        </div>
      `;
    });
}

/* === FLOATING CTA === */
function floatingCtaCheck() {
  const floatingCta = document.getElementById('floatingCta');
  if (!floatingCta) return;
  const heroH = document.querySelector('.hero')?.offsetHeight || 600;
  floatingCta.classList.toggle('is-visible', window.scrollY > heroH * 0.7);
}

function initFloatingCta() {
  floatingCtaCheck();
}

/* === CONTACT FORM === */
function initContactForm() {
  const form = document.getElementById('charterForm');
  if (!form) return;
  const success = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form__submit-btn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    /* Simulate submission — in production wire to Formspree/Netlify/EmailJS */
    setTimeout(() => {
      form.style.display = 'none';
      success?.classList.add('is-visible');
    }, 1200);
  });
}
