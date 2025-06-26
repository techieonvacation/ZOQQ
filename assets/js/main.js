/**
 * ===================================
 * ZOQQ WEBSITE - MAIN JAVASCRIPT
 * Production Build v2.1.0
 * ===================================
 * 
 * Optimized Features:
 * - Lightweight mobile navigation (3KB)
 * - RAF-optimized scroll effects
 * - Efficient intersection observers
 * - Minimal memory footprint
 * - Error boundaries & fallbacks
 * - Zero console outputs
 * ===================================
 */

'use strict';

// Production configuration - Optimized object
const CONFIG = Object.freeze({
    NAVBAR_SCROLL_THRESHOLD: 50,
    NAVBAR_HIDE_THRESHOLD: 100,
    ANIMATION_DURATION: 600,
    STAGGER_DELAY: 100,
    SELECTORS: Object.freeze({
        header: '.header',
        mobileMenuToggle: '.mobile-menu-toggle',
        mobileMenu: '.mobile-menu',
        mobileNavLinks: '.mobile-nav-link',
        navLinks: '.nav-link',
        ctaButton: '.cta-button',
        signupButtons: '.signup-btn, .mobile-signup-btn',
        anchorLinks: 'a[href^="#"]',
        animateElements: '.hero-title, .hero-description, .hero-icon'
    })
});

// Ultra-fast DOM utilities
const $ = (s, c = document) => {
    try { return c.querySelector(s); } catch { return null; }
};
const $$ = (s, c = document) => {
    try { return c.querySelectorAll(s); } catch { return []; }
};

// Performance utilities
const debounce = (fn, ms) => {
    let t; return (...a) => (clearTimeout(t), t = setTimeout(() => fn(...a), ms));
};
const throttle = (fn, ms) => {
    let l = 0; return (...a) => { 
        const n = Date.now(); 
        if (n - l >= ms) { l = n; fn(...a); }
    };
};

// Mobile Navigation - Ultra Lightweight
const MobileNav = (() => {
    let isOpen = false, initialized = false;
    let toggle, menu, links, body;

    const init = () => {
        if (initialized) return;
        
        toggle = $(CONFIG.SELECTORS.mobileMenuToggle);
        menu = $(CONFIG.SELECTORS.mobileMenu);
        links = $$(CONFIG.SELECTORS.mobileNavLinks);
        body = document.body;

        if (!toggle || !menu) return;

        bindEvents();
        initialized = true;
    };

    const bindEvents = () => {
        toggle.addEventListener('click', handleToggle, { passive: false });
        
        links.forEach(link => {
            link.addEventListener('click', close, { passive: true });
        });

        document.addEventListener('click', handleOutsideClick, { passive: true });
        document.addEventListener('keydown', handleKeydown, { passive: true });
        menu.addEventListener('click', e => e.stopPropagation(), { passive: true });

        // Accessibility
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('id', 'mobile-menu');

        // Optimized resize handler
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth >= 768 && isOpen) close();
        }, 250), { passive: true });
    };

    const handleToggle = e => {
        e?.preventDefault();
        isOpen ? close() : open();
    };

    const open = () => {
        if (isOpen) return;
        
        toggle.classList.add('active');
        menu.classList.add('active');
        body.classList.add('menu-open');
        toggle.setAttribute('aria-expanded', 'true');
        
        isOpen = true;
        trapFocus();
    };

    const close = () => {
        if (!isOpen) return;
        
        toggle.classList.remove('active');
        menu.classList.remove('active');
        body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        
        isOpen = false;
    };

    const handleOutsideClick = e => {
        if (isOpen && !toggle.contains(e.target) && !menu.contains(e.target)) {
            close();
        }
    };

    const handleKeydown = e => {
        if (e.key === 'Escape' && isOpen) {
            close();
            toggle.focus();
        }
    };

    const trapFocus = () => {
        const focusable = menu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        setTimeout(() => first.focus(), 100);

        menu.addEventListener('keydown', e => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        });
    };

    return { init, toggle: handleToggle, close, open };
})();

// Scroll Effects - High Performance
const ScrollFX = (() => {
    let lastScroll = 0, ticking = false, header;

    const init = () => {
        header = $(CONFIG.SELECTORS.header);
        if (!header) return;

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    };

    const update = () => {
        const scrollTop = window.pageYOffset;
        const isScrollingDown = scrollTop > lastScroll;
        
        // Batch DOM updates
        header.classList.toggle('scrolled', scrollTop > CONFIG.NAVBAR_SCROLL_THRESHOLD);
        
        if (scrollTop > CONFIG.NAVBAR_HIDE_THRESHOLD) {
            header.style.transform = isScrollingDown ? 'translateY(-100%)' : 'translateY(0)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = scrollTop;
        ticking = false;
    };

    return { init };
})();

// Stats Counter - Memory Efficient
const StatsCounter = (() => {
    const animated = new WeakSet();
    let observer;

    const init = () => {
        if (!window.IntersectionObserver) {
            fallback();
            return;
        }

        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated.has(entry.target)) {
                    animate(entry.target);
                    animated.add(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

        $$('.stats-value[data-target]').forEach(el => observer.observe(el));
    };

    const animate = el => {
        const target = parseFloat(el.dataset.target);
        const duration = parseInt(el.dataset.duration) || 2000;
        const decimals = parseInt(el.dataset.decimals) || 0;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        
        if (isNaN(target)) return;
        
        const start = performance.now();
        
        const update = now => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = target * eased;
            
            el.textContent = `${prefix}${decimals ? current.toFixed(decimals) : Math.floor(current)}${suffix}`;
            
            if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    };

    const fallback = () => {
        $$('.stats-value[data-target]').forEach((el, i) => {
            setTimeout(() => animate(el), 500 + i * 200);
        });
    };

    return { init };
})();

// Animation System - Minimal
const Animations = (() => {
    let observer, transactionObserver, transactionAnimated = false;

    const init = () => {
        if (!window.IntersectionObserver) {
            fallback();
            return;
        }

        setupMainObserver();
        setupTransactionObserver();
        observeElements();
    };

    const setupMainObserver = () => {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    };

    const setupTransactionObserver = () => {
        transactionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !transactionAnimated) {
                    animateTransactions();
                    transactionAnimated = true;
                    transactionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3, rootMargin: '0px 0px -100px 0px' });

        const section = $('.expense-sec-right');
        if (section) transactionObserver.observe(section);
    };

    const animateTransactions = () => {
        const items = $$('.transaction-item');
        items.forEach((item, i) => {
            setTimeout(() => item.style.animationPlayState = 'running', i * 200);
        });

        setTimeout(() => animateCircles(), items.length * 200 + 500);
        
        setTimeout(() => {
            const list = $('.transaction-list');
            if (list) list.style.animationPlayState = 'running';
        }, items.length * 200 + 2000);
    };

    const animateCircles = () => {
        $$('.circle').forEach((circle, i) => {
            setTimeout(() => {
                circle.style.animationPlayState = 'running';
                addCircleEvents(circle);
            }, i * 200);
        });
    };

    const addCircleEvents = circle => {
        circle.addEventListener('click', () => {
            $$('.circle').forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
        }, { passive: true });
    };

    const observeElements = () => {
        $$(CONFIG.SELECTORS.animateElements).forEach((el, i) => {
            el.style.animationDelay = `${i * CONFIG.STAGGER_DELAY}ms`;
            if (observer) observer.observe(el);
        });
    };

    const fallback = () => {
        $$(CONFIG.SELECTORS.animateElements).forEach((el, i) => {
            setTimeout(() => el.classList.add('animate-in'), i * CONFIG.STAGGER_DELAY);
        });
        setTimeout(animateTransactions, 2000);
    };

    const restart = () => {
        transactionAnimated = false;
        const section = $('.expense-sec-right');
        if (section) animateTransactions();
    };

    return { init, restart };
})();

// Smooth Scrolling - Lightweight
const SmoothScroll = (() => {
    const init = () => {
        $$(CONFIG.SELECTORS.anchorLinks).forEach(link => {
            link.addEventListener('click', e => {
                const target = $(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, { passive: false });
        });
    };

    return { init };
})();

// Navigation States - Efficient
const NavStates = (() => {
    let current = null;

    const init = () => {
        bindEvents();
        setInitial();
    };

    const bindEvents = () => {
        $$(CONFIG.SELECTORS.navLinks).forEach(link => {
            link.addEventListener('click', e => {
                if (link.getAttribute('href') === '#') e.preventDefault();
                setActive(link.textContent.trim());
            }, { passive: false });
        });

        $$(CONFIG.SELECTORS.mobileNavLinks).forEach(link => {
            link.addEventListener('click', e => {
                if (link.getAttribute('href') === '#') e.preventDefault();
                setActive(link.textContent.trim());
            }, { passive: false });
        });
    };

    const setActive = text => {
        // Batch DOM updates
        requestAnimationFrame(() => {
            $$(CONFIG.SELECTORS.navLinks).forEach(link => {
                link.classList.toggle('active', link.textContent.trim() === text);
            });

            $$(CONFIG.SELECTORS.mobileNavLinks).forEach(link => {
                link.classList.toggle('active', link.textContent.trim() === text);
            });
        });

        current = text;
    };

    const setInitial = () => {
        const activeDesktop = $(CONFIG.SELECTORS.navLinks + '.active');
        const activeMobile = $(CONFIG.SELECTORS.mobileNavLinks + '.active');
        
        if (activeDesktop) {
            current = activeDesktop.textContent.trim();
            setActive(current);
        } else if (activeMobile) {
            current = activeMobile.textContent.trim();
            setActive(current);
        }
    };

    return { init, setActive, getCurrent: () => current };
})();

// Search Interface - Performance Optimized
const SearchUI = (() => {
    let elements = {};

    const init = () => {
        elements = {
            input: $('#searchInput'),
            interface: $('#searchInterface'),
            items: $$('.suggestion-item'),
            wrapper: $('.search-input-wrapper')
        };

        if (!elements.interface) return;

        bindEvents();
        startSequence();
    };

    const bindEvents = () => {
        const { input, items, wrapper } = elements;
        
        if (input) {
            input.addEventListener('input', throttle(handleInput, 100), { passive: true });
            input.addEventListener('focus', () => wrapper?.classList.add('focused'), { passive: true });
            input.addEventListener('blur', () => wrapper?.classList.remove('focused'), { passive: true });
        }

        items.forEach(item => {
            item.addEventListener('click', () => selectSuggestion(item), { passive: true });
        });
    };

    const handleInput = () => {
        if (elements.wrapper) {
            elements.wrapper.style.transform = 'translateY(-1px)';
            setTimeout(() => elements.wrapper.style.transform = '', 200);
        }
    };

    const selectSuggestion = item => {
        const text = item.querySelector('h4')?.textContent;
        if (text && elements.input) {
            elements.input.value = text;
        }
    };

    const startSequence = () => {
        const phases = ['#phaseIcon', '#phaseInput', '#phaseProcessing', '#phaseResults'];
        
        phases.forEach((phaseId, i) => {
            setTimeout(() => {
                if (i > 0) $(phases[i - 1])?.style.setProperty('display', 'none');
                $(phaseId)?.style.setProperty('display', 'block');
                
                if (i === 1) typeText();
                if (i === 3) showSuggestions();
            }, i * 2000 + 500);
        });
    };

    const typeText = () => {
        const input = $('#searchInput');
        if (!input) return;
        
        const text = "Jack I";
        let i = 0;
        
        const type = () => {
            if (i < text.length) {
                input.value += text[i++];
                setTimeout(type, 200);
            }
        };
        
        type();
    };

    const showSuggestions = () => {
        elements.items.forEach((item, i) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 800 + i * 300);
        });
    };

    return { init };
})();

// Button Handlers - Minimal
const Buttons = (() => {
    const init = () => {
        const cta = $(CONFIG.SELECTORS.ctaButton);
        if (cta) {
            cta.addEventListener('click', e => {
                e.preventDefault();
                // Add CTA logic here
            }, { passive: false });
        }

        $$(CONFIG.SELECTORS.signupButtons).forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                // Add signup logic here
            }, { passive: false });
        });
    };

    return { init };
})();

// Main Application - Production Ready
const ZOQQApp = (() => {
    const modules = [
        MobileNav,
        ScrollFX, 
        StatsCounter,
        Animations,
        SmoothScroll,
        NavStates,
        SearchUI,
        Buttons
    ];

    const init = () => {
        try {
            // Use requestIdleCallback for non-critical modules
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    modules.forEach(module => module.init?.());
                });
            } else {
                modules.forEach(module => module.init?.());
            }
        } catch (error) {
            // Silent error handling in production
            if (typeof reportError === 'function') {
                reportError(error);
            }
        }
    };

    // Public API - Minimized
    return {
        init,
        toggleMenu: () => MobileNav.toggle(),
        setNavActive: text => NavStates.setActive(text),
        getCurrentNav: () => NavStates.getCurrent(),
        scrollTo: selector => {
            const el = $(selector);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        restartAnimation: () => Animations.restart()
    };
})();

// Initialize on DOM ready
const initApp = () => ZOQQApp.init();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export to global scope
window.ZOQQApp = ZOQQApp;

// AOS initialization (if available)
if (typeof AOS !== 'undefined') {
    AOS.init();
}
