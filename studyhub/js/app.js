// StudyHub International - Split Screen Scroll-Driven Website
// Video on right 2/3, Text on left 1/3

const FRAME_COUNT = 121;
const FRAME_SPEED = 1.5;
const IMAGE_SCALE = 0.95;
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

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Set canvas size - Right side only
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const canvasWidth = window.innerWidth * 0.6667; // 2/3 width
  const canvasHeight = window.innerHeight;

  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  canvas.style.width = canvasWidth + 'px';
  canvas.style.height = canvasHeight + 'px';
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Draw frame to canvas - centered in right panel
function drawFrame(index) {
  const img = FRAMES[index];
  if (!img || !img.complete) return;

  const canvasWidth = window.innerWidth * 0.6667;
  const canvasHeight = window.innerHeight;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // Scale to fit with padding
  const scale = Math.min(canvasWidth / iw, canvasHeight / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (canvasWidth - dw) / 2;
  const dy = (canvasHeight - dh) / 2;

  // Clear with black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw image centered
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Load frames
function loadFrames() {
  return new Promise((resolve) => {
    const initialPromises = [];
    for (let i = 0; i < Math.min(framesToPreload, FRAME_COUNT); i++) {
      initialPromises.push(loadFrame(i));
    }

    Promise.all(initialPromises).then(() => {
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
    img.onload = () => {
      FRAMES[index] = img;
      framesLoaded++;
      resolve();
    };
    img.onerror = () => {
      framesLoaded++;
      resolve();
    };
  });
}

function updateLoader() {
  const percent = Math.round((framesLoaded / FRAME_COUNT) * 100);
  loaderBar.style.width = percent + '%';
  loaderPercent.textContent = percent + '%';

  if (framesLoaded >= FRAME_COUNT) {
    setTimeout(() => {
      loader.classList.add('hidden');
      canvasWrap.classList.add('visible');
      initAnimations();
    }, 500);
  }
}

// Initialize all animations
function initAnimations() {
  initHeroTransition();
  initFrameScroll();
  initSectionAnimations();
  initCounters();
  initHeaderReveal();
}

// Hero fade out as user starts scrolling
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      // Hero fades out quickly as scroll begins
      if (heroSection) {
        heroSection.style.opacity = Math.max(0, 1 - p * 8);
        heroSection.style.transform = `translateY(${p * 50}px)`;
      }
    }
  });
}

// Frame-to-scroll binding - sync with text sections
// Video plays in reverse (from last frame to first) with pauses at section points
function initFrameScroll() {
  // Define section points where frames should pause/hold
  // Format: [scroll %, frame index]
  const sectionPoints = [
    { scroll: 0.00, frame: 120 },   // Hero - start at last frame
    { scroll: 0.12, frame: 100 },   // Section 1 - What We Do
    { scroll: 0.32, frame: 75 },    // Section 2 - Countries
    { scroll: 0.52, frame: 55 },    // Section 3 - About
    { scroll: 0.69, frame: 35 },    // Section 4 - How It Works
    { scroll: 0.75, frame: 15 },    // Section 5 - Why Choose Us (hold from 75%)
    { scroll: 0.96, frame: 15 },    // Section 5 - Hold until 96%
    { scroll: 0.98, frame: 0 }      // Section 6 - Counsellors
  ];

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    onUpdate: (self) => {
      const p = self.progress;
      let frameIndex;

      // Find which section range we're in
      for (let i = 0; i < sectionPoints.length - 1; i++) {
        const curr = sectionPoints[i];
        const next = sectionPoints[i + 1];

        if (p >= curr.scroll && p <= next.scroll) {
          // Hold frame if current and next have same frame (pause point)
          if (curr.frame === next.frame) {
            frameIndex = curr.frame;
          } else {
            // Calculate progress within this section range
            const rangeProgress = (p - curr.scroll) / (next.scroll - curr.scroll);
            // Interpolate frame index (handle reverse playback)
            if (curr.frame > next.frame) {
              frameIndex = Math.round(curr.frame - (rangeProgress * (curr.frame - next.frame)));
            } else {
              frameIndex = Math.round(curr.frame + (rangeProgress * (next.frame - curr.frame)));
            }
          }
          break;
        }
      }

      // Default to last frame if beyond all points
      if (frameIndex === undefined) {
        frameIndex = sectionPoints[sectionPoints.length - 1].frame;
      }

      // Clamp to valid range
      frameIndex = Math.max(0, Math.min(FRAME_COUNT - 1, frameIndex));

      if (frameIndex !== currentFrame) {
        currentFrame = frameIndex;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    }
  });
}

// Section animations - sync with book turning
function initSectionAnimations() {
  const sections = document.querySelectorAll('.scroll-section');

  sections.forEach((section) => {
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const animationType = section.dataset.animation;
    const persist = section.dataset.persist === 'true';

    const children = section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .section-link, .service-list li, .cta-button, .stat, .step, .contact-info'
    );

    // Set initial state
    gsap.set(section, { opacity: 0, y: 30 });
    gsap.set(children, { opacity: 0 });

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const fadeRange = 0.015;

        let sectionOpacity = 0;
        let sectionY = 30;
        let progress = 0;

        // Calculate visibility based on scroll position
        if (p >= enter - fadeRange && p <= enter) {
          // Entering
          const enterProgress = (p - (enter - fadeRange)) / fadeRange;
          sectionOpacity = enterProgress;
          sectionY = 30 * (1 - enterProgress);
          progress = enterProgress;
        } else if (p > enter && p < leave) {
          // Active
          sectionOpacity = 1;
          sectionY = 0;
          progress = 1;
        } else if (p >= leave && p <= leave + fadeRange && !persist) {
          // Exiting
          const exitProgress = 1 - (p - leave) / fadeRange;
          sectionOpacity = exitProgress;
          sectionY = -30 * (1 - exitProgress);
          progress = 0;
        } else if (p > leave + fadeRange && !persist) {
          // Hidden
          sectionOpacity = 0;
          sectionY = -30;
          progress = 0;
        } else if (persist && p >= leave) {
          // Persist
          sectionOpacity = 1;
          sectionY = 0;
          progress = 1;
        }

        // Apply to section
        section.style.opacity = sectionOpacity;
        section.style.transform = `translateY(${sectionY}px)`;

        if (sectionOpacity > 0.1) {
          section.classList.add('visible');
        } else {
          section.classList.remove('visible');
        }

        // Animate children
        animateChildren(children, animationType, progress);
      }
    });
  });
}

function animateChildren(children, type, progress) {
  const stagger = 0.12;
  const totalDuration = children.length * stagger;
  const currentTime = progress * totalDuration;

  children.forEach((child, i) => {
    const childStart = i * stagger;
    let childProgress = 0;

    if (currentTime > childStart) {
      childProgress = Math.min(1, (currentTime - childStart) / stagger);
    }

    let transform = '';
    let opacity = childProgress;

    switch (type) {
      case 'fade-up':
        transform = `translateY(${(1 - childProgress) * 40}px)`;
        break;
      case 'slide-left':
        transform = `translateX(${(1 - childProgress) * -60}px)`;
        break;
      case 'scale-up':
        const scale = 0.9 + childProgress * 0.1;
        transform = `scale(${scale})`;
        break;
      case 'stagger-up':
        transform = `translateY(${(1 - childProgress) * 50}px)`;
        break;
      case 'clip-reveal':
        child.style.clipPath = `inset(${(1 - childProgress) * 100}% 0 0 0)`;
        break;
    }

    if (type !== 'clip-reveal') {
      child.style.transform = transform;
    }
    child.style.opacity = opacity;
  });
}

// Counter animations - sync with stats section
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');

  counters.forEach((counter) => {
    const target = parseFloat(counter.dataset.value);
    const decimals = parseInt(counter.dataset.decimals || '0');

    ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const statsEnter = 0.43;
        const statsLeave = 0.58;

        if (p >= statsEnter && p <= statsLeave) {
          const progress = Math.min(1, (p - statsEnter) / 0.1);
          const value = target * progress;
          counter.textContent = value.toFixed(decimals);
        }
      }
    });
  });
}

// Header reveal after hero
function initHeaderReveal() {
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      if (self.progress > 0.05) {
        header.classList.add('visible');
      } else {
        header.classList.remove('visible');
      }
    }
  });
}

// Start loading
loadFrames();

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target);
    }
  });
});

console.log('StudyHub International website initialized - Split screen layout');
