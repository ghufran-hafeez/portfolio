/* ==========================================================================
   PORTFOLIO SCRIPTS - Premium Interactions (2026 Standards)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       LENIS SMOOTH SCROLLING
       ========================================================================== */
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom exponential easing
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1.0,
            smoothTouch: false,
            touchMultiplier: 2.0,
            infinite: false
        });

        // Synchronize scroll updates with GSAP ScrollTrigger
        lenis.on('scroll', () => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.update();
            }
        });

        // Connect Lenis frame loop into GSAP ticker
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Reduce lag in animation timing calculations
        gsap.ticker.lagSmoothing(0);
    }

    /* ==========================================================================
       SCROLL INDICATORS & STICKY HEADER
       ========================================================================== */
    const header = document.getElementById('mainHeader');
    const scrollThreshold = 50;

    const handleScrollEffects = () => {
        const currentScroll = window.scrollY;
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link on scroll sync
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScrollEffects);
    handleScrollEffects(); // Trigger initially on load

    /* ==========================================================================
       MOBILE NAVIGATION MENU
       ========================================================================== */
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navMenuLinks = document.querySelectorAll('.nav-menu .nav-link');

    if (navToggle && navMenu) {
        const toggleMenu = () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Toggle Lenis scroll state to prevent background scrolling when menu is active
            if (lenis) {
                if (navMenu.classList.contains('active')) {
                    lenis.stop();
                } else {
                    lenis.start();
                }
            }
        };

        navToggle.addEventListener('click', toggleMenu);

        // Close menu when clicking a link
        navMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }

    /* ==========================================================================
       CUSTOM LAGGING CURSOR MECHANICS (GSAP)
       ========================================================================== */
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');
    const cursorText = document.getElementById('cursorText');
    const hoverElements = document.querySelectorAll('[data-cursor-hover]');
    const clickableLinks = document.querySelectorAll('a, button, input[type="submit"], .filter-btn');

    // Only active on hoverable desktop platforms
    if (cursorDot && cursorOutline && window.matchMedia('(hover: hover)').matches) {
        
        // Define positioning quickTo targets
        const xDotTo = gsap.quickTo(cursorDot, "x", { duration: 0.1, ease: "power3" });
        const yDotTo = gsap.quickTo(cursorDot, "y", { duration: 0.1, ease: "power3" });
        
        const xOutTo = gsap.quickTo(cursorOutline, "x", { duration: 0.4, ease: "power3.out" });
        const yOutTo = gsap.quickTo(cursorOutline, "y", { duration: 0.4, ease: "power3.out" });

        // Set initial coordinates out of screen
        gsap.set([cursorDot, cursorOutline], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

        window.addEventListener('mousemove', (e) => {
            xDotTo(e.clientX);
            yDotTo(e.clientY);
            xOutTo(e.clientX);
            yOutTo(e.clientY);
        });

        // Hide default body cursor
        document.body.style.cursor = 'none';

        // Hover elements with custom text labels (e.g. data-cursor-hover="play")
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                const label = el.getAttribute('data-cursor-hover');
                cursorOutline.classList.add('hovered');
                cursorText.innerText = label || '';
            });

            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hovered');
                cursorText.innerText = '';
            });
        });

        // Default difference-mode scaling for basic links / interactive controls
        clickableLinks.forEach(link => {
            // Skip elements that already have specific custom actions
            if (link.hasAttribute('data-cursor-hover')) return;

            link.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('difference-mode');
                gsap.to(cursorOutline, { scale: 1.5, duration: 0.2 });
                gsap.to(cursorDot, { scale: 0, duration: 0.2 });
            });

            link.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('difference-mode');
                gsap.to(cursorOutline, { scale: 1.0, duration: 0.2 });
                gsap.to(cursorDot, { scale: 1.0, duration: 0.2 });
            });
        });

        // Document mouse leave/enter viewports
        document.addEventListener('mouseleave', () => {
            gsap.to([cursorDot, cursorOutline], { opacity: 0, duration: 0.3 });
        });
        document.addEventListener('mouseenter', () => {
            gsap.to([cursorDot, cursorOutline], { opacity: 1, duration: 0.3 });
        });
    }

    /* ==========================================================================
       MAGNETIC PROXIMITY ATTRACTION
       ========================================================================== */
    const magneticElements = document.querySelectorAll('.magnetic');

    if (window.matchMedia('(hover: hover)').matches) {
        magneticElements.forEach(element => {
            const strengthAttr = element.getAttribute('data-magnetic-strength') || 0.2;
            const strength = parseFloat(strengthAttr);
            
            element.addEventListener('mousemove', (e) => {
                const bound = element.getBoundingClientRect();
                const x = e.clientX - bound.left - (bound.width / 2);
                const y = e.clientY - bound.top - (bound.height / 2);
                
                // Pull element relative to cursor position inside boundaries
                gsap.to(element, {
                    x: x * strength,
                    y: y * strength,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                // Also pull inner child text if present for premium organic feel
                const innerText = element.querySelector('span');
                if (innerText) {
                    gsap.to(innerText, {
                        x: x * (strength * 0.5),
                        y: y * (strength * 0.5),
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });

            element.addEventListener('mouseleave', () => {
                // Return to static coordinates
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
                
                const innerText = element.querySelector('span');
                if (innerText) {
                    gsap.to(innerText, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: "elastic.out(1, 0.3)"
                    });
                }
            });
        });
    }

    /* ==========================================================================
       GSAP SCROLL TRIGGER REVEALS
       ========================================================================== */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 1. Text reveals
        const revealTexts = document.querySelectorAll('.reveal-text');
        revealTexts.forEach(text => {
            gsap.from(text, {
                y: 50,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%",
                    toggleActions: "play none none none"
                }
            });
        });

        // 2. Card reveals (Staggered inside their respective parents for organic entry)
        const cardContainers = [
            { parent: '.services-grid', selector: '.service-card' },
            { parent: '.stats-grid', selector: '.stat-card' },
            { parent: '.contact-methods', selector: '.contact-method-card' }
        ];

        cardContainers.forEach(group => {
            const parentEl = document.querySelector(group.parent);
            if (parentEl) {
                const cards = parentEl.querySelectorAll(group.selector);
                if (cards.length > 0) {
                    gsap.from(cards, {
                        y: 50,
                        opacity: 0,
                        duration: 1.0,
                        ease: "power3.out",
                        stagger: 0.15,
                        scrollTrigger: {
                            trigger: parentEl,
                            start: "top 85%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            }
        });

        // Animate any other reveal-cards that are not in the predefined groups
        const allRevealCards = document.querySelectorAll('.reveal-card');
        allRevealCards.forEach(card => {
            if (!card.closest('.services-grid') && !card.closest('.stats-grid') && !card.closest('.contact-methods')) {
                gsap.from(card, {
                    y: 50,
                    opacity: 0,
                    duration: 1.0,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            }
        });

        // 3. Visual content overlays (Glows, frames)
        const revealVisuals = document.querySelectorAll('.reveal-visual');
        revealVisuals.forEach(visual => {
            gsap.from(visual, {
                scale: 0.95,
                opacity: 0,
                duration: 1.4,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: visual,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        });

        // 4. Button reveals
        const revealBtns = document.querySelectorAll('.reveal-btn');
        revealBtns.forEach(btn => {
            gsap.from(btn, {
                scale: 0.9,
                opacity: 0,
                duration: 1.0,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: btn,
                    start: "top 95%",
                    toggleActions: "play none none none"
                }
            });
        });
        
        // 5. Odometer Statistics Counter Trig
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const targetVal = parseInt(stat.getAttribute('data-target'));
            
            gsap.fromTo(stat, 
                { textContent: 0 },
                {
                    textContent: targetVal,
                    duration: 2.5,
                    ease: "power2.out",
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: stat,
                        start: "top 90%",
                        once: true
                    },
                    onUpdate: function() {
                        // Keep text layout clean on rendering ticks
                        stat.innerHTML = Math.ceil(this.targets()[0].textContent);
                    }
                }
            );
        });

        // 6. Testimonial cards parallax tilt skew on scroll
        const testimonials = document.querySelectorAll('.testimonial-card');
        testimonials.forEach(card => {
            gsap.from(card, {
                opacity: 0,
                x: 40,
                duration: 1.0,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            });
        });
    }

    /* ==========================================================================
       PORTFOLIO GALLERY FILTER MECHANICS
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioGrid = document.getElementById('portfolioGrid');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Sync active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterCategory = btn.getAttribute('data-filter');

            // Collect active items
            const itemsToHide = [];
            const itemsToShow = [];

            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterCategory === 'all' || itemCategory === filterCategory) {
                    itemsToShow.push(item);
                } else {
                    itemsToHide.push(item);
                }
            });

            // Animate items out
            if (itemsToHide.length > 0) {
                gsap.to(itemsToHide, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.35,
                    stagger: 0.05,
                    ease: "power2.in",
                    onComplete: () => {
                        itemsToHide.forEach(item => {
                            item.classList.remove('show');
                        });
                        // Recalculate ScrollTrigger measurements
                        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    }
                });
            }

            // Animate items in
            itemsToShow.forEach(item => {
                // Ensure class is active prior to animating in
                item.classList.add('show');
            });

            gsap.fromTo(itemsToShow, 
                { scale: 0.8, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.08,
                    ease: "power3.out",
                    delay: itemsToHide.length > 0 ? 0.35 : 0,
                    onComplete: () => {
                        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    }
                }
            );
        });
    });

    /* ==========================================================================
       TESTIMONIALS SLIDER INTERACTION
       ========================================================================== */
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');
    const cards = document.querySelectorAll('.testimonial-card');
    
    let currentIndex = 0;
    let cardWidth = 0;
    let gap = 30; // Matches CSS gap
    
    const calculateSizes = () => {
        if (cards.length > 0) {
            const firstCard = cards[0];
            cardWidth = firstCard.offsetWidth;
        }
    };
    
    calculateSizes();

    const getSlidesCount = () => {
        const width = window.innerWidth;
        if (width <= 768) return 1;
        if (width <= 1024) return 2;
        return 3;
    };

    const getMaxIndex = () => {
        const visibleSlides = getSlidesCount();
        return Math.max(0, cards.length - visibleSlides);
    };

    // Build Dots dynamically
    const buildDots = () => {
        dotsContainer.innerHTML = '';
        const maxIndex = getMaxIndex();
        
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    };

    const updateControls = () => {
        const maxIndex = getMaxIndex();
        
        // Bound checks
        if (currentIndex <= 0) {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }

        if (currentIndex >= maxIndex) {
            nextBtn.style.opacity = '0.3';
            nextBtn.style.pointerEvents = 'none';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        }

        // Active Dot
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, idx) => {
            dot.classList.remove('active');
            if (idx === currentIndex) {
                dot.classList.add('active');
            }
        });
    };

    const goToSlide = (index) => {
        const maxIndex = getMaxIndex();
        currentIndex = Math.min(Math.max(0, index), maxIndex);
        
        // Translate target coordinates
        const moveAmount = currentIndex * (cardWidth + gap);
        gsap.to(track, {
            x: -moveAmount,
            duration: 0.7,
            ease: "power3.out"
        });
        
        updateControls();
    };

    if (track && prevBtn && nextBtn) {
        // Initial setup
        setTimeout(() => {
            calculateSizes();
            buildDots();
            updateControls();
        }, 100);
        
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });

        // Recalculate on viewport resizes
        window.addEventListener('resize', () => {
            calculateSizes();
            goToSlide(currentIndex);
            buildDots();
            updateControls();
        });
    }

    /* ==========================================================================
       CINEMATIC MODAL & SHOWREEL EVENT TRIGGER
       ========================================================================== */
    const showreelTrigger = document.getElementById('showreelTrigger');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxClose = document.getElementById('lightboxClose');
    const mockPlayBtn = document.getElementById('mockPlayBtn');
    const modalMediaPlaceholder = document.getElementById('modalMediaPlaceholder');

    if (showreelTrigger && lightboxModal && lightboxClose) {
        
        const openModal = () => {
            lightboxModal.classList.add('active');
            lightboxModal.setAttribute('aria-hidden', 'false');
            
            // Stop scroll behavior
            if (lenis) lenis.stop();
        };

        const closeModal = () => {
            lightboxModal.classList.remove('active');
            lightboxModal.setAttribute('aria-hidden', 'true');
            
            // Restore scroll updates
            if (lenis) lenis.start();
        };

        showreelTrigger.addEventListener('click', openModal);
        lightboxClose.addEventListener('click', closeModal);

        // Close when clicking modal backdrop overlay bounds
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeModal();
            }
        });

        // Close on escape keypress
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
                closeModal();
            }
        });

        // Mock video playback simulation inside placeholder lightbox
        if (mockPlayBtn && modalMediaPlaceholder) {
            mockPlayBtn.addEventListener('click', () => {
                modalMediaPlaceholder.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <div class="color-wheel" style="width: 80px; height: 80px; margin-bottom: 20px;"></div>
                        <h4 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 10px;">Showreel Playing</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">(Simulation Frame: Replace wrapper with HTML5 Video Tag for production assets)</p>
                    </div>
                `;
            });
        }
    }

    /* ==========================================================================
       CONTACT FORM SUBMISSION WITH SIMULATED LOADER
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && formStatus && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get values
            const name = document.getElementById('formName').value.trim();
            const email = document.getElementById('formEmail').value.trim();
            const subject = document.getElementById('formSubject').value.trim();
            const message = document.getElementById('formMessage').value.trim();
            
            if (!name || !email || !subject || !message) {
                formStatus.className = 'form-status error';
                formStatus.innerText = 'Please fill out all required fields.';
                return;
            }

            // Enter loading state
            submitBtn.disabled = true;
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                <span class="submit-btn-text">Processing Project...</span>
                <div class="loader-dots" style="display: flex; gap: 4px;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #000; display: inline-block; animation: pulse 0.6s infinite alternate;"></span>
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #000; display: inline-block; animation: pulse 0.6s infinite alternate 0.2s;"></span>
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #000; display: inline-block; animation: pulse 0.6s infinite alternate 0.4s;"></span>
                </div>
            `;

            // Clear status
            formStatus.className = 'form-status';
            formStatus.innerText = '';

            // Simulate form submission API response
            setTimeout(() => {
                formStatus.className = 'form-status success';
                formStatus.innerText = 'Success! Your creative proposal was transmitted. We will reply within 12 hours.';
                
                // Clear fields
                contactForm.reset();
                
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                
                // Reset status text after 6 seconds
                setTimeout(() => {
                    formStatus.innerText = '';
                }, 6000);
            }, 180000 / 100); // 1.8 seconds processing time delay

        });
    }

});
