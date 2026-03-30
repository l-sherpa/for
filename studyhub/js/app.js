/**
 * StudyHub International - Modern Animated Website
 * GSAP-style animations with IntersectionObserver
 * 21st.dev inspired interactions
 */

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const contactForm = document.getElementById('contactForm');

    // ============================================
    // Navigation Scroll Effect with Blur
    // ============================================
    let lastScroll = 0;
    function handleNavScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show nav on scroll direction
        if (scrollY > lastScroll && scrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    navbar.style.transition = 'transform 0.4s ease, background-color 0.3s ease, backdrop-filter 0.3s';

    // ============================================
    // Mobile Menu Toggle with Animation
    // ============================================
    function toggleMobileMenu() {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on link click with smooth animation
    document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ============================================
    // Smooth Scroll with Offset & Easing
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // GSAP-style Scroll Reveal Animations
    // ============================================
    const revealOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;

                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, parseInt(delay));

                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal-up').forEach(el => {
        revealObserver.observe(el);
    });

    // ============================================
    // Staggered Card Reveals
    // ============================================
    const cardGroups = [
        '.service-card',
        '.destination-card',
        '.team-card'
    ];

    cardGroups.forEach(selector => {
        const cards = document.querySelectorAll(selector);

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 120);
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
            cardObserver.observe(card);
        });
    });

    // ============================================
    // Process Steps Staggered Animation
    // ============================================
    const processSteps = document.querySelectorAll('.process-step');

    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 180);
                processObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    processSteps.forEach(step => {
        processObserver.observe(step);
    });

    // ============================================
    // Magnetic Button Effect
    // ============================================
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    if (!window.matchMedia('(pointer: coarse)').matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const maxMove = 8;
                const moveX = (x / rect.width) * maxMove;
                const moveY = (y / rect.height) * maxMove;

                btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ============================================
    // Section Headers Reveal with Blur
    // ============================================
    const sectionHeaders = document.querySelectorAll('.section-header, .destinations-header, .process-header');

    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.filter = 'blur(0)';
                headerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sectionHeaders.forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(30px)';
        header.style.filter = 'blur(10px)';
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease';
        headerObserver.observe(header);
    });

    // ============================================
    // Hero Parallax Effect
    // ============================================
    const heroImage = document.querySelector('.hero-image');
    const heroContent = document.querySelector('.hero-content');

    if (heroImage && !window.matchMedia('(pointer: coarse)').matches) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const imageTranslate = scrollY * 0.12;
                    const contentTranslate = scrollY * 0.06;
                    const opacity = 1 - (scrollY / 700);

                    heroImage.style.transform = `translateY(${imageTranslate}px) perspective(1000px) rotateY(-5deg) rotateX(5deg)`;
                    heroContent.style.opacity = Math.max(0.3, opacity);
                    heroContent.style.transform = `translateY(${contentTranslate}px)`;

                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // Contact Form Handler with Animation
    // ============================================
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Animate button
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.disabled = true;

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Simple validation
            if (!data.name || !data.email) {
                showNotification('Please fill in all required fields.', 'error');
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;
                return;
            }

            // Simulate sending
            setTimeout(() => {
                showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.disabled = false;

                // Success animation
                submitBtn.style.background = 'linear-gradient(135deg, #2a9d8f, #3dbbae)';
                setTimeout(() => {
                    submitBtn.style.background = '';
                }, 1000);
            }, 1500);
        });
    }

    // ============================================
    // Notification System with Animation
    // ============================================
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
        const colors = {
            success: 'linear-gradient(135deg, #2a9d8f, #3dbbae)',
            error: 'linear-gradient(135deg, #e76f51, #e85d3e)',
            info: 'linear-gradient(135deg, #f4a261, #e76f51)'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${colors[type]};
            color: white;
            padding: 1.25rem 1.5rem;
            border-radius: 16px;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            font-weight: 500;
            max-width: 400px;
            animation: notificationSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }
            @keyframes notificationSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%) scale(0.9);
                }
            }
            .notification-icon {
                width: 28px;
                height: 28px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }
            .notification-message {
                flex: 1;
                line-height: 1.5;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                color: inherit;
                display: flex;
                align-items: center;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .notification-close:hover {
                opacity: 1;
            }
            .notification-close svg {
                width: 20px;
                height: 20px;
            }
        `;
        document.head.appendChild(style);

        // Add to DOM
        document.body.appendChild(notification);

        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'notificationSlideOut 0.4s ease forwards';
            setTimeout(() => notification.remove(), 400);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.4s ease forwards';
                setTimeout(() => notification.remove(), 400);
            }
        }, 5000);
    }

    // ============================================
    // Counter Animation with Easing
    // ============================================
    function animateCounter(element, target, suffix = '') {
        const duration = 2500;
        const startTime = performance.now();

        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const current = Math.floor(easedProgress * target);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // Observe stats for animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach((stat, index) => {
                    const text = stat.textContent;
                    const value = parseInt(text.replace(/[^0-9]/g, ''));
                    const suffix = text.replace(/[0-9]/g, '');
                    stat.textContent = '0';

                    setTimeout(() => {
                        animateCounter(stat, value, suffix);
                    }, index * 200);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }

    // ============================================
    // Back to Top with Progress
    // ============================================
    const backToTop = document.querySelector('.back-to-top');

    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();

            // Smooth scroll with easing
            const startPosition = window.pageYOffset;
            const duration = 800;
            const startTime = performance.now();

            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

            const animateScroll = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutCubic(progress);

                window.scrollTo(0, startPosition * (1 - easedProgress));

                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                }
            };

            requestAnimationFrame(animateScroll);
        });
    }

    // ============================================
    // Form Input Focus Glow
    // ============================================
    document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(input => {
        const formGroup = input.closest('.form-group');
        const label = formGroup?.querySelector('label');

        input.addEventListener('focus', () => {
            if (label) {
                label.style.color = '#f4a261';
                label.style.transform = 'translateY(-2px)';
            }
        });

        input.addEventListener('blur', () => {
            if (label) {
                label.style.color = '';
                label.style.transform = '';
            }
        });
    });

    // ============================================
    // Image Load Animations
    // ============================================
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease';
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });

    // ============================================
    // Mouse Trail Effect (Desktop Only)
    // ============================================
    if (!window.matchMedia('(pointer: coarse)').matches) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        trail.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(244, 162, 97, 0.3), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(trail);

        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;
        let isMoving = false;
        let moveTimeout;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMoving = true;
            trail.style.opacity = '1';

            clearTimeout(moveTimeout);
            moveTimeout = setTimeout(() => {
                isMoving = false;
                trail.style.opacity = '0';
            }, 100);
        });

        function animateTrail() {
            if (isMoving) {
                trailX += (mouseX - trailX) * 0.15;
                trailY += (mouseY - trailY) * 0.15;
                trail.style.left = trailX - 10 + 'px';
                trail.style.top = trailY - 10 + 'px';
            }
            requestAnimationFrame(animateTrail);
        }

        animateTrail();
    }

    // ============================================
    // Console Welcome Message
    // ============================================
    console.log('%c🎓 StudyHub International', 'background: linear-gradient(135deg, #f4a261, #e76f51); color: #0a1628; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log('%cYour Gateway to Global Education', 'color: #f4a261; font-size: 14px; font-weight: 600;');
    console.log('%cDesigned with passion for student success ✨', 'color: rgba(248, 245, 240, 0.6); font-size: 12px;');

})();
