/**
 * StudyHub International - 21st Century Creative Studio
 * Premium Scroll-Driven Website with Lenis, GSAP ScrollTrigger
 */

const FRAME_COUNT = 121;
const FRAMES = [];
let currentFrame = 0;
let framesLoaded = 0;
const framesToPreload = 15;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWrap = document.querySelector('.canvas-wrap');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const scrollContainer = document.getElementById('scroll-container');
const heroSection = document.querySelector('.hero-standalone');
const header = document.querySelector('.site-header');
const darkOverlay = document.getElementById('dark-overlay');
const marqueeWrap = document.querySelector('.marquee-wrap');

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.8
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Set canvas size
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const isMobile = window.innerWidth <= 768;
  const canvasWidth = isMobile ? window.innerWidth : window.innerWidth * 0.6667;
  const canvasHeight = window.innerHeight;

  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Draw frame with padded cover mode
const IMAGE_SCALE = 0.88;

function drawFrame(index) {
  const img = FRAMES[index];
  if (!img || !img.complete) return;

  const isMobile = window.innerWidth <= 768;
  const canvasWidth = isMobile ? window.innerWidth : window.innerWidth * 0.6667;
  const canvasHeight = window.innerHeight;

  const scale = Math.max(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight) * IMAGE_SCALE;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;

  // Clear and fill background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw image centered
  ctx.drawImage(img, (canvasWidth - dw) / 2, (canvasHeight - dh) / 2, dw, dh);
}

// Load frames
function loadFrames() {
  return new Promise((resolve) => {
    const promises = [];
    for (let i = 0; i < Math.min(framesToPreload, FRAME_COUNT); i++) {
      promises.push(loadFrame(i));
    }
    Promise.all(promises).then(() => {
      updateLoader();
      for (let i = framesToPreload; i < FRAME_COUNT; i++) {
        loadFrame(i).then(updateLoader);
      }
      resolve();
    });
  });
}

function loadFrame(index) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `frames/frame_${String(index + 1).padStart(4, '0')}.webp`;
    img.onload = () => { FRAMES[index] = img; framesLoaded++; resolve(); };
    img.onerror = () => { framesLoaded++; resolve(); };
  });
}

function updateLoader() {
  const percent = Math.round((framesLoaded / FRAME_COUNT) * 100);
  loaderBar.style.width = percent + '%';
  loaderPercent.textContent = percent + '%';

  if (framesLoaded >= FRAME_COUNT) {
    setTimeout(() => {
      loader.classList.add('hidden');
      initAnimations();
    }, 500);
  }
}

// Initialize all animations
function initAnimations() {
  initHeroEntrance();
  initHeroTransition();
  initFrameScroll();
  initSectionAnimations();
  initCounters();
  initHeaderReveal();
  initMarquee();
}

// Hero entrance animation with word split
function initHeroEntrance() {
  const words = document.querySelectorAll('.hero-heading .word');
  const tl = gsap.timeline({ delay: 0.3 });

  tl.fromTo('.hero-label',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
  )
  .fromTo(words,
    { opacity: 0, y: 100, rotateX: -60 },
    { opacity: 1, y: 0, rotateX: 0, duration: 1.2, stagger: 0.1, ease: 'power3.out' },
    '-=0.4'
  )
  .fromTo('.hero-tagline',
    { opacity: 0, y: 30, filter: 'blur(8px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
    '-=0.8'
  )
  .fromTo('.cta-button',
    { opacity: 0, y: 20, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
    '-=0.6'
  )
  .fromTo('.scroll-indicator',
    { opacity: 0 },
    { opacity: 1, duration: 0.6 },
    '-=0.3'
  );
}

// Hero to canvas circle-wipe transition
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Hero fade out as scroll begins
      const heroOpacity = Math.max(0, 1 - p * 12);
      const heroY = -50 * Math.min(1, p * 10);
      heroSection.style.opacity = heroOpacity;
      heroSection.style.transform = `translateY(${heroY}px)`;

      // Canvas circle-wipe reveal
      const wipeProgress = Math.min(1, Math.max(0, (p - 0.005) / 0.08));
      const radius = wipeProgress * 80;
      canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;

      // Marquee fade in
      if (p > 0.1 && p < 0.9) {
        marqueeWrap.classList.add('visible');
      } else {
        marqueeWrap.classList.remove('visible');
      }
    }
  });
}

// Frame scroll binding with FRAME_SPEED 2.0
function initFrameScroll() {
  const FRAME_SPEED = 2.0;

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.2,
    onUpdate: (self) => {
      const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
      const frameIndex = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);

      if (frameIndex !== currentFrame) {
        currentFrame = frameIndex;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }
  });
}

// Section animations with variety
function initSectionAnimations() {
  const sections = document.querySelectorAll('.scroll-section');

  sections.forEach((section) => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const animationType = section.dataset.animation;
    const persist = section.dataset.persist === 'true';
    const hasDarkOverlay = section.dataset.darkOverlay === 'true';

    const children = section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .service-item, .country-item, .step-item, .feature-item, .stat-item, .counsellor-item, .cta-button, .stats-grid, .university-partner, .contact-details'
    );

    // Create GSAP timeline for entrance animation
    const tl = gsap.timeline({ paused: true });

    switch (animationType) {
      case 'fade-up':
        tl.from(children, {
          y: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: 'power3.out'
        });
        break;
      case 'slide-left':
        tl.from(children, {
          x: -80,
          opacity: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: 'power3.out'
        });
        break;
      case 'slide-right':
        tl.from(children, {
          x: 80,
          opacity: 0,
          stagger: 0.12,
          duration: 0.9,
          ease: 'power3.out'
        });
        break;
      case 'scale-up':
        tl.from(children, {
          scale: 0.85,
          opacity: 0,
          stagger: 0.1,
          duration: 1,
          ease: 'power2.out'
        });
        break;
      case 'rotate-in':
        tl.from(children, {
          y: 40,
          rotation: 3,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: 'power3.out'
        });
        break;
      case 'stagger-up':
        tl.from(children, {
          y: 70,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out'
        });
        break;
      case 'clip-reveal':
        tl.from(children, {
          clipPath: 'inset(100% 0 0 0)',
          opacity: 0,
          stagger: 0.12,
          duration: 1.1,
          ease: 'power4.inOut'
        });
        break;
    }

    // Scroll-driven visibility with proper ranges
    const fadeRange = 0.06;
    const visibleStart = enter - fadeRange;
    const visibleEnd = persist ? 1 : leave + fadeRange;

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        let sectionOpacity = 0;
        let progress = 0;

        if (p >= visibleStart && p <= visibleEnd) {
          if (p < enter) {
            // Entering
            const enterProgress = (p - visibleStart) / fadeRange;
            sectionOpacity = Math.min(1, enterProgress);
            progress = sectionOpacity;
          } else if (p >= enter && p <= leave) {
            // Fully visible
            sectionOpacity = 1;
            progress = 1;
          } else if (!persist && p > leave) {
            // Exiting
            const exitProgress = 1 - (p - leave) / fadeRange;
            sectionOpacity = Math.max(0, exitProgress);
            progress = 1;
          } else {
            sectionOpacity = 1;
            progress = 1;
          }
        }

        section.style.opacity = sectionOpacity;
        section.style.pointerEvents = sectionOpacity > 0.3 ? 'auto' : 'none';

        // Play timeline based on progress
        tl.progress(progress);

        // Dark overlay for stats section
        if (hasDarkOverlay) {
          const overlayRange = 0.05;
          let overlayOpacity = 0;

          if (p >= visibleStart - overlayRange && p <= visibleEnd + overlayRange) {
            if (p < enter) {
              overlayOpacity = (p - (visibleStart - overlayRange)) / overlayRange;
            } else if (p > leave) {
              overlayOpacity = 1 - (p - leave) / overlayRange;
            } else {
              overlayOpacity = 0.9;
            }
          }
          darkOverlay.style.opacity = Math.max(0, Math.min(0.9, overlayOpacity));
        }
      }
    });
  });
}

// Counter animations with count up
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');

  counters.forEach((counter) => {
    const target = parseFloat(counter.dataset.value);
    const decimals = parseInt(counter.dataset.decimals || '0');

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          textContent: target,
          duration: 2,
          ease: 'power1.out',
          snap: { textContent: decimals === 0 ? 1 : 0.1 },
          onUpdate: function() {
            const val = parseFloat(counter.textContent);
            counter.textContent = decimals === 0 ? Math.round(val) : val.toFixed(decimals);
          }
        });
      }
    });
  });
}

// Header reveal on scroll
function initHeaderReveal() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (self.progress > 0.05) {
        header.classList.add('visible');
      } else {
        header.classList.remove('visible');
      }
    }
  });
}

// Horizontal marquee on scroll
function initMarquee() {
  const marqueeText = document.querySelector('.marquee-text');
  if (!marqueeText) return;

  gsap.to(marqueeText, {
    xPercent: -35,
    ease: 'none',
    scrollTrigger: {
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true
    }
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, {
        offset: 0,
        duration: 1.5
      });
    }
  });
});

// Start loading frames
loadFrames();

console.log('🎨 StudyHub 21st Century Creative Studio');
console.log('✨ Premium scroll-driven animations active');
