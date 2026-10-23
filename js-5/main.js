document.addEventListener('DOMContentLoaded', () => {

  // Відео в картках "What you get": вантажимо при появі на екрані, ставимо на паузу поза ним
  const lazyVideos = document.querySelectorAll('video.lazy-gif');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.dataset.src) {
            video.src = video.dataset.src;
            video.removeAttribute('data-src');
            video.load();
          }
          video.play().catch(() => {});
        } else if (video.src) {
          video.pause();
        }
      });
    }, { threshold: 0.2 });

    lazyVideos.forEach((video) => {
      video.addEventListener('playing', () => video.classList.add('is-playing'));
      videoObserver.observe(video);
    });
  }

  // Липкий футер з'являється після 200px скролу
  const footer = document.getElementById('footer-bg');
  if (footer) {
    const toggleFooter = () => footer.classList.toggle('active', window.scrollY >= 200);
    window.addEventListener('scroll', toggleFooter, { passive: true });
    toggleFooter();
  }

  // Таймер на 60 хвилин, що перезапускається
  const timerValues = document.querySelectorAll('.footer-timer .timer-box');
  if (timerValues.length >= 3) {
    const TOTAL_TIME = 60 * 60 * 1000;
    const storageKey = 'footerTimer60mStartTime';
    let startTime;
    try { startTime = parseInt(localStorage.getItem(storageKey), 10); } catch (e) {}
    if (!startTime) {
      startTime = Date.now();
      try { localStorage.setItem(storageKey, startTime); } catch (e) {}
    }

    const updateTimer = () => {
      const now = Date.now();
      let elapsed = now - startTime;
      if (elapsed >= TOTAL_TIME || elapsed < 0) {
        startTime = now;
        try { localStorage.setItem(storageKey, startTime); } catch (e) {}
        elapsed = 0;
      }
      const remaining = TOTAL_TIME - elapsed;
      timerValues[0].textContent = String(Math.floor(remaining / 3600000)).padStart(2, '0');
      timerValues[1].textContent = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
      timerValues[2].textContent = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    };
    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // FAQ-акордеон: відкрита лише одна відповідь, висота анімується
  const faqItems = document.querySelectorAll('.faq__item');
  const setOpen = (item, open) => {
    const answer = item.querySelector('.faq__answer');
    item.classList.toggle('active', open);
    item.querySelector('.faq__q').setAttribute('aria-expanded', open);
    answer.style.maxHeight = open ? answer.scrollHeight + 'px' : null;
  };
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq__q');
    const toggle = () => {
      const open = !item.classList.contains('active');
      faqItems.forEach((other) => other !== item && setOpen(other, false));
      setOpen(item, open);
    };
    question.addEventListener('click', toggle);
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // Слайдер відгуків: 7 точок за макетом, активна показує прогрес по всіх слайдах
  const sliderEl = document.querySelector('.reviews__slider');
  const dotsEl = document.querySelector('.reviews__dots');
  if (sliderEl && window.Swiper) {
    const DOTS = 7;
    dotsEl.innerHTML = '<span class="reviews__dot"></span>'.repeat(DOTS);
    const dots = dotsEl.children;

    const updateDots = (swiper) => {
      const total = swiper.slides.length;
      const active = swiper.isEnd ? DOTS - 1 : Math.min(DOTS - 1, Math.floor(swiper.activeIndex * DOTS / total));
      Array.from(dots).forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    // відступ 20px макета в rem, щоб масштабувався разом зі сторінкою
    const gap = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 2;
    const swiper = new Swiper(sliderEl, {
      slidesPerView: 'auto',
      spaceBetween: gap(),
      navigation: { nextEl: '.reviews__btn--next', prevEl: '.reviews__btn--prev' },
      on: { init: updateDots, slideChange: updateDots, reachEnd: updateDots },
    });
    window.addEventListener('resize', () => {
      swiper.params.spaceBetween = gap();
      swiper.update();
    });
  }
});
