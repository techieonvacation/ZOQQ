/**
 * ===================================
 * ZOQQ WEBSITE - MAIN JAVASCRIPT
 * Professional UI/UX Enhancement
 * ===================================
 * 
 * Features:
 * - Mobile navigation with smooth animations
 * - Optimized scroll performance with RAF
 * - Intersection Observer for lazy animations
 * - Keyboard navigation support
 * - Error handling and fallbacks
 * - Accessibility enhancements
 * - Performance monitoring
 */

'use strict';

/**
 * ===================================
 * CONSTANTS & CONFIGURATION
 * ===================================
 */
const CONFIG = {
    // Scroll thresholds
    NAVBAR_SCROLL_THRESHOLD: 50,
    NAVBAR_HIDE_THRESHOLD: 100,
    
    // Animation settings
    ANIMATION_DURATION: 600,
    STAGGER_DELAY: 100,
    
    // Selectors
    SELECTORS: {
        header: '.header',
        mobileMenuToggle: '.mobile-menu-toggle',
        mobileMenu: '.mobile-menu',
        mobileNavLinks: '.mobile-nav-link',
        navLinks: '.nav-link',
        ctaButton: '.cta-button',
        signupButtons: '.signup-btn, .mobile-signup-btn',
        anchorLinks: 'a[href^="#"]',
        animateElements: '.hero-title, .hero-description, .hero-icon'
    }
};

/**
 * ===================================
 * UTILITY FUNCTIONS
 * ===================================
 */

/**
 * Safely query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null}
 */
const safeQuerySelector = (selector, context = document) => {
    try {
        return context.querySelector(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
    }
};

/**
 * Safely query all selectors with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList}
 */
const safeQuerySelectorAll = (selector, context = document) => {
    try {
        return context.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return [];
    }
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * ===================================
 * MOBILE NAVIGATION MODULE
 * ===================================
 */
const MobileNavigation = {
    // State management
    state: {
        isMenuOpen: false,
        isInitialized: false
    },

    // DOM elements cache
    elements: {},

    /**
     * Initialize mobile navigation
     */
    init() {
        if (this.state.isInitialized) return;

        // Cache DOM elements
        this.cacheElements();
        
        // Bind events if elements exist
        if (this.elements.toggle && this.elements.menu) {
            this.bindEvents();
            this.bindResizeEvents();
            this.state.isInitialized = true;
            console.log('✅ Mobile Navigation initialized');
        } else {
            console.warn('⚠️ Mobile navigation elements not found');
        }
    },

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            toggle: safeQuerySelector(CONFIG.SELECTORS.mobileMenuToggle),
            menu: safeQuerySelector(CONFIG.SELECTORS.mobileMenu),
            links: safeQuerySelectorAll(CONFIG.SELECTORS.mobileNavLinks),
            body: document.body
        };
    },

    /**
     * Bind all navigation events
     */
    bindEvents() {
        // Toggle button click
        this.elements.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        // Navigation link clicks
        this.elements.links.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNav(e);
        });

        // Prevent menu close on menu click
        this.elements.menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Accessibility attributes
        this.elements.toggle.setAttribute('aria-expanded', 'false');
        this.elements.toggle.setAttribute('aria-controls', 'mobile-menu');
        this.elements.menu.setAttribute('id', 'mobile-menu');
    },

    /**
     * Toggle mobile menu
     */
    toggleMenu() {
        this.state.isMenuOpen ? this.closeMenu() : this.openMenu();
    },

    /**
     * Open mobile menu
     */
    openMenu() {
        if (this.state.isMenuOpen) return;

        this.elements.toggle.classList.add('active');
        this.elements.menu.classList.add('active');
        this.elements.body.classList.add('menu-open');
        
        this.state.isMenuOpen = true;

        // Accessibility
        this.elements.toggle.setAttribute('aria-expanded', 'true');
        
        // Focus management
        this.trapFocus();
        
        console.log('📱 Mobile menu opened');
    },

    /**
     * Close mobile menu
     */
    closeMenu() {
        if (!this.state.isMenuOpen) return;

        this.elements.toggle.classList.remove('active');
        this.elements.menu.classList.remove('active');
        this.elements.body.classList.remove('menu-open');
        
        this.state.isMenuOpen = false;

        // Accessibility
        this.elements.toggle.setAttribute('aria-expanded', 'false');
        
        console.log('📱 Mobile menu closed');
    },

    /**
     * Handle outside clicks
     * @param {Event} event - Click event
     */
    handleOutsideClick(event) {
        if (!this.state.isMenuOpen) return;

        const isClickInsideNav = this.elements.toggle.contains(event.target) || 
                                this.elements.menu.contains(event.target);
        
        if (!isClickInsideNav) {
            this.closeMenu();
        }
    },

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNav(event) {
        if (event.key === 'Escape' && this.state.isMenuOpen) {
            this.closeMenu();
            this.elements.toggle.focus();
        }
    },

    /**
     * Trap focus within mobile menu (accessibility)
     */
    trapFocus() {
        const focusableElements = this.elements.menu.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        setTimeout(() => firstElement.focus(), 100);

        // Handle tab navigation
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        this.elements.menu.addEventListener('keydown', handleTabKey);
    },

    /**
     * Bind resize events to handle mobile/desktop view changes
     */
    bindResizeEvents() {
        // Debounced resize handler for performance
        const handleResize = debounce(() => {
            this.handleViewportChange();
        }, 250);

        window.addEventListener('resize', handleResize, { passive: true });
        
        // Also check initial state
        this.handleViewportChange();
    },

    /**
     * Handle viewport changes between mobile and desktop
     */
    handleViewportChange() {
        const isMobileView = window.innerWidth < 768;
        
        // If we're now in desktop view and mobile menu is open, close it
        if (!isMobileView && this.state.isMenuOpen) {
            this.closeMenu();
            console.log('📱➡️💻 Auto-closed mobile menu on desktop resize');
        }
        
        // Ensure proper visibility states
        this.updateMenuVisibility(isMobileView);
    },

    /**
     * Update menu visibility based on viewport
     * @param {boolean} isMobileView - Whether current view is mobile
     */
    updateMenuVisibility(isMobileView) {
        if (isMobileView) {
            // Mobile view: show toggle, hide desktop menu
            this.elements.toggle.style.display = 'flex';
        } else {
            // Desktop view: hide toggle, ensure mobile menu is closed
            this.elements.toggle.style.display = 'none';
            if (this.state.isMenuOpen) {
                this.closeMenu();
            }
        }
    }
};

/**
 * ===================================
 * SCROLL EFFECTS MODULE
 * ===================================
 */
const ScrollEffects = {
    // State management
    state: {
        lastScrollTop: 0,
        ticking: false,
        isInitialized: false
    },

    // DOM elements cache
    elements: {},

    /**
     * Initialize scroll effects
     */
    init() {
        if (this.state.isInitialized) return;

        // Cache DOM elements
        this.cacheElements();
        
        // Bind scroll events if header exists
        if (this.elements.header) {
            this.bindEvents();
            this.state.isInitialized = true;
            console.log('✅ Scroll Effects initialized');
        } else {
            console.warn('⚠️ Navbar element not found');
        }
    },

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            header: safeQuerySelector(CONFIG.SELECTORS.header)
        };
    },

    /**
     * Bind scroll events with performance optimization
     */
    bindEvents() {
        // Use passive listeners for better performance
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', debounce(this.handleResize.bind(this), 250), { passive: true });
    },

    /**
     * Handle scroll events with RAF optimization
     */
    handleScroll() {
        if (!this.state.ticking) {
            requestAnimationFrame(this.updateScrollEffects.bind(this));
            this.state.ticking = true;
        }
    },

    /**
     * Update scroll effects
     */
    updateScrollEffects() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navbar scroll effects
        this.updateNavbarStyles(scrollTop);
        
        // Hide/show navbar on scroll direction
        this.updateNavbarVisibility(scrollTop);
        
        // Update last scroll position
        this.state.lastScrollTop = scrollTop;
        this.state.ticking = false;
    },

    /**
     * Update navbar styles based on scroll position
     * @param {number} scrollTop - Current scroll position
     */
    updateNavbarStyles(scrollTop) {
        if (scrollTop > CONFIG.NAVBAR_SCROLL_THRESHOLD) {
            this.elements.header.classList.add('scrolled');
        } else {
            this.elements.header.classList.remove('scrolled');
        }
    },

    /**
     * Update navbar visibility based on scroll direction
     * @param {number} scrollTop - Current scroll position
     */
    updateNavbarVisibility(scrollTop) {
        const isScrollingDown = scrollTop > this.state.lastScrollTop;
        const isScrolledPastThreshold = scrollTop > CONFIG.NAVBAR_HIDE_THRESHOLD;

        if (isScrollingDown && isScrolledPastThreshold) {
            this.elements.header.style.transform = 'translateY(-100%)';
        } else {
            this.elements.header.style.transform = 'translateY(0)';
        }
    },

    /**
     * Handle window resize
     */
    handleResize() {
        // Reset scroll position
        this.state.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }
};

/**
 * ===================================
 * STATS COUNTER ANIMATION MODULE
 * ===================================
 */
const StatsCounter = {
    // State management
    state: {
        observer: null,
        isInitialized: false,
        animatedStats: new Set()
    },

    /**
     * Initialize stats counter
     */
    init() {
        if (this.state.isInitialized) return;
        
        try {
            this.setupObserver();
            this.state.isInitialized = true;
            console.log('✅ StatsCounter module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing StatsCounter:', error);
        }
    },

    /**
     * Setup intersection observer for stats counters
     */
    setupObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('⚠️ IntersectionObserver not supported, using fallback');
            this.fallbackAnimation();
            return;
        }

        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        this.state.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.animatedStats.has(entry.target)) {
                    this.animateCounter(entry.target);
                    this.state.animatedStats.add(entry.target);
                }
            });
        }, options);

        const statsValues = safeQuerySelectorAll('.stats-value[data-target]');
        if (statsValues.length > 0) {
            statsValues.forEach(stat => this.state.observer.observe(stat));
            console.log(`📊 Observing ${statsValues.length} stats counters`);
        }
    },

    /**
     * Animate counter from 0 to target value
     * @param {Element} element - Stats value element
     */
    animateCounter(element) {
        const target = parseFloat(element.dataset.target);
        const duration = parseInt(element.dataset.duration) || 2000;
        const decimals = parseInt(element.dataset.decimals) || 0;
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        
        if (isNaN(target)) {
            console.error('❌ Invalid target value for counter:', element);
            return;
        }
        
        const startTime = performance.now();
        const startValue = 0;
        
        element.classList.add('counting');
        console.log(`🔢 Starting counter animation: ${startValue} → ${target}`);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation (easeOutQuart)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (target - startValue) * easeOutQuart;
            
            // Format the number based on decimals
            const formattedValue = decimals > 0 
                ? currentValue.toFixed(decimals)
                : Math.floor(currentValue);
            
            element.textContent = `${prefix}${formattedValue}${suffix}`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Animation completed
                element.classList.remove('counting');
                element.classList.add('completed');
                
                console.log(`✅ Counter animation completed: ${prefix}${target}${suffix}`);
                
                // Remove completed class after animation
                setTimeout(() => {
                    element.classList.remove('completed');
                }, 600);
            }
        };

        requestAnimationFrame(updateCounter);
    },

    /**
     * Fallback animation for browsers without IntersectionObserver
     */
    fallbackAnimation() {
        const statsValues = safeQuerySelectorAll('.stats-value[data-target]');
        statsValues.forEach((stat, index) => {
            setTimeout(() => this.animateCounter(stat), 500 + (index * 200));
        });
    }
};

/**
 * ===================================
 * ANIMATION MODULE
 * ===================================
 */
const AnimationModule = {
    // State management
    state: {
        observer: null,
        transactionObserver: null,
        isInitialized: false,
        hasTransactionAnimated: false
    },

    /**
     * Initialize animations
     */
    init() {
        if (this.state.isInitialized) return;

        // Setup Intersection Observer
        this.setupIntersectionObserver();
        
        // Setup Transaction Animation Observer
        this.setupTransactionObserver();
        
        // Observe elements
        this.observeElements();
        
        this.state.isInitialized = true;
        console.log('✅ Animations initialized');
    },

    /**
     * Setup Intersection Observer for animations
     */
    setupIntersectionObserver() {
        // Check if IntersectionObserver is supported
        if (!window.IntersectionObserver) {
            console.warn('⚠️ IntersectionObserver not supported, using fallback');
            this.fallbackAnimation();
            return;
        }

        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.state.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
    },

    /**
     * Setup specialized observer for transaction section
     */
    setupTransactionObserver() {
        if (!window.IntersectionObserver) return;

        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        };

        this.state.transactionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !this.state.hasTransactionAnimated) {
                    this.animateTransactionSection(entry.target);
                    this.state.hasTransactionAnimated = true;
                }
            });
        }, options);

        // Observe transaction section
        const transactionSection = safeQuerySelector('.expense-sec-right');
        if (transactionSection) {
            this.state.transactionObserver.observe(transactionSection);
        }
    },

    /**
     * Animate transaction section with sophisticated effects
     * @param {Element} section - Transaction section element
     */
    animateTransactionSection(section) {
        console.log('🔄 Starting transaction animation sequence');

        // First, trigger the transaction items to appear one by one
        const transactionItems = safeQuerySelectorAll('.transaction-item');
        transactionItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animationPlayState = 'running';
                
                // Add subtle pulse effect
                setTimeout(() => {
                    item.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        item.style.transform = 'scale(1)';
                    }, 150);
                }, 400);
            }, index * 200);
        });

        // Then animate the circles
        setTimeout(() => {
            this.animateCircles();
        }, transactionItems.length * 200 + 500);

        // Finally start the infinite scroll after all elements appear
        setTimeout(() => {
            const transactionList = safeQuerySelector('.transaction-list');
            if (transactionList) {
                transactionList.style.animationPlayState = 'running';
                console.log('♾️ Transaction infinite scroll started');
            }
        }, transactionItems.length * 200 + 2000);
    },

    /**
     * Animate avatar circles with creative effects
     */
    animateCircles() {
        const circles = safeQuerySelectorAll('.circle');
        circles.forEach((circle, index) => {
            setTimeout(() => {
                circle.style.animationPlayState = 'running';
                
                // Add special effects for active circle
                if (circle.classList.contains('active')) {
                    setTimeout(() => {
                        // Add extra glow animation
                        circle.style.animation += ', activeGlow 2s ease-in-out infinite alternate';
                        
                        // Start the rotating gradient border
                        const afterElement = circle.querySelector('::after');
                        if (afterElement) {
                            afterElement.style.animationPlayState = 'running';
                        }
                    }, 800);
                }
                
                // Add interactive hover listeners
                this.addCircleInteractions(circle, index);
            }, index * 200);
        });
        
        console.log('👤 Avatar circles animation started');
    },

    /**
     * Add interactive effects to avatar circles
     * @param {Element} circle - Circle element
     * @param {number} index - Circle index
     */
    addCircleInteractions(circle, index) {
        // Add click handler for avatar selection
        circle.addEventListener('click', () => {
            this.selectAvatar(circle, index);
        });

        // Add mouse enter effect
        circle.addEventListener('mouseenter', () => {
            // Create ripple effect
            this.createRippleEffect(circle);
        });

        // Add double-click for special animation
        circle.addEventListener('dblclick', () => {
            this.triggerSpecialAnimation(circle);
        });
    },

    /**
     * Select avatar and update active state
     * @param {Element} selectedCircle - Selected circle element
     * @param {number} index - Circle index
     */
    selectAvatar(selectedCircle, index) {
        // Remove active class from all circles
        const allCircles = safeQuerySelectorAll('.circle');
        allCircles.forEach(circle => {
            circle.classList.remove('active');
        });

        // Add active class to selected circle
        selectedCircle.classList.add('active');

        // Trigger selection animation
        selectedCircle.style.animation = 'avatarAppear 0.5s ease-out, activeGlow 2s ease-in-out infinite alternate';

        console.log(`👤 Avatar ${index + 1} selected`);
    },

    /**
     * Create ripple effect on hover
     * @param {Element} circle - Circle element
     */
    createRippleEffect(circle) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(139, 92, 246, 0.3);
            transform: translate(-50%, -50%);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        circle.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    },

    /**
     * Trigger special animation on double-click
     * @param {Element} circle - Circle element
     */
    triggerSpecialAnimation(circle) {
        circle.style.animation = 'bounce 0.6s ease-in-out, avatarAppear 0.8s ease-out';
        
        // Reset animation after completion
        setTimeout(() => {
            circle.style.animation = circle.classList.contains('active') 
                ? 'activeGlow 2s ease-in-out infinite alternate'
                : '';
        }, 800);
    },

    /**
     * Observe elements for animation
     */
    observeElements() {
        const elements = safeQuerySelectorAll(CONFIG.SELECTORS.animateElements);
        
        elements.forEach((element, index) => {
            // Add staggered delay
            element.style.animationDelay = `${index * CONFIG.STAGGER_DELAY}ms`;
            
            if (this.state.observer) {
                this.state.observer.observe(element);
            }
        });
    },

    /**
     * Animate element when it enters viewport
     * @param {Element} element - Element to animate
     */
    animateElement(element) {
        element.classList.add('animate-in');
        
        // Unobserve after animation to improve performance
        if (this.state.observer) {
            this.state.observer.unobserve(element);
        }
    },

    /**
     * Fallback animation for browsers without IntersectionObserver
     */
    fallbackAnimation() {
        const elements = safeQuerySelectorAll(CONFIG.SELECTORS.animateElements);
        
        // Simple timeout-based animation
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * CONFIG.STAGGER_DELAY);
        });

        // Fallback for transaction animation
        setTimeout(() => {
            this.animateTransactionSection();
        }, 2000);
    },

    /**
     * Utility function for custom animations
     * @param {Element} element - Element to animate
     * @param {string} animation - Animation name
     * @param {number} duration - Animation duration
     * @returns {Promise}
     */
    customAnimate(element, animation, duration = CONFIG.ANIMATION_DURATION) {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }

            element.style.animation = `${animation} ${duration}ms ease-out`;
            
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    },

    /**
     * Restart transaction animation (useful for demos)
     */
    restartTransactionAnimation() {
        this.state.hasTransactionAnimated = false;
        const transactionSection = safeQuerySelector('.expense-sec-right');
        if (transactionSection) {
            this.animateTransactionSection(transactionSection);
        }
    }
};

/**
 * ===================================
 * SMOOTH SCROLL MODULE
 * ===================================
 */
const SmoothScroll = {
    /**
     * Initialize smooth scrolling
     */
    init() {
        this.bindEvents();
        console.log('✅ Smooth Scroll initialized');
    },

    /**
     * Bind anchor link events
     */
    bindEvents() {
        const anchorLinks = safeQuerySelectorAll(CONFIG.SELECTORS.anchorLinks);
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleAnchorClick(e, link);
            });
        });
    },

    /**
     * Handle anchor link clicks
     * @param {Event} event - Click event
     * @param {Element} link - Anchor link element
     */
    handleAnchorClick(event, link) {
        const targetId = link.getAttribute('href');
        
        // Skip if not a valid anchor
        if (!targetId || targetId === '#') return;

        const targetElement = safeQuerySelector(targetId);
        
        if (targetElement) {
            event.preventDefault();
            this.scrollToElement(targetElement);
        }
    },

    /**
     * Scroll to specific element
     * @param {Element} element - Target element
     */
    scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

/**
 * ===================================
 * NAVIGATION ACTIVE STATES MODULE
 * ===================================
 */
const NavigationStates = {
    // State management
    state: {
        currentActive: null,
        isInitialized: false
    },

    /**
     * Initialize navigation active states
     */
    init() {
        if (this.state.isInitialized) return;

        this.bindDesktopNavigation();
        this.bindMobileNavigation();
        this.setInitialActiveState();
        
        this.state.isInitialized = true;
        console.log('✅ Navigation States initialized');
    },

    /**
     * Bind desktop navigation events
     */
    bindDesktopNavigation() {
        const navLinks = safeQuerySelectorAll(CONFIG.SELECTORS.navLinks);
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavLinkClick(e, link, navLinks);
            });
        });
    },

    /**
     * Bind mobile navigation events
     */
    bindMobileNavigation() {
        const mobileNavLinks = safeQuerySelectorAll(CONFIG.SELECTORS.mobileNavLinks);
        
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleMobileNavLinkClick(e, link, mobileNavLinks);
            });
        });
    },

    /**
     * Handle desktop nav link clicks
     * @param {Event} event - Click event
     * @param {Element} clickedLink - Clicked nav link
     * @param {NodeList} allLinks - All nav links
     */
    handleNavLinkClick(event, clickedLink, allLinks) {
        // Don't prevent default if it's a real link
        if (clickedLink.getAttribute('href') === '#') {
            event.preventDefault();
        }

        // Remove active class from all links
        allLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        clickedLink.classList.add('active');
        
        // Sync with mobile navigation
        this.syncMobileNavigation(clickedLink.textContent.trim());
        
        // Store current active
        this.state.currentActive = clickedLink.textContent.trim();
        
        console.log(`🔗 Desktop nav: ${clickedLink.textContent.trim()} activated`);
    },

    /**
     * Handle mobile nav link clicks
     * @param {Event} event - Click event
     * @param {Element} clickedLink - Clicked mobile nav link
     * @param {NodeList} allLinks - All mobile nav links
     */
    handleMobileNavLinkClick(event, clickedLink, allLinks) {
        // Don't prevent default if it's a real link
        if (clickedLink.getAttribute('href') === '#') {
            event.preventDefault();
        }

        // Remove active class from all mobile links
        allLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        clickedLink.classList.add('active');
        
        // Sync with desktop navigation
        this.syncDesktopNavigation(clickedLink.textContent.trim());
        
        // Store current active
        this.state.currentActive = clickedLink.textContent.trim();
        
        console.log(`📱 Mobile nav: ${clickedLink.textContent.trim()} activated`);
    },

    /**
     * Sync mobile navigation with desktop
     * @param {string} activeText - Text of active link
     */
    syncMobileNavigation(activeText) {
        const mobileNavLinks = safeQuerySelectorAll(CONFIG.SELECTORS.mobileNavLinks);
        
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.textContent.trim() === activeText) {
                link.classList.add('active');
            }
        });
    },

    /**
     * Sync desktop navigation with mobile
     * @param {string} activeText - Text of active link
     */
    syncDesktopNavigation(activeText) {
        const navLinks = safeQuerySelectorAll(CONFIG.SELECTORS.navLinks);
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.textContent.trim() === activeText) {
                link.classList.add('active');
            }
        });
    },

    /**
     * Set initial active state from HTML
     */
    setInitialActiveState() {
        // Find initially active desktop link
        const activeDesktopLink = safeQuerySelector(`${CONFIG.SELECTORS.navLinks}.active`);
        if (activeDesktopLink) {
            this.state.currentActive = activeDesktopLink.textContent.trim();
            this.syncMobileNavigation(this.state.currentActive);
        }

        // Find initially active mobile link if no desktop active
        if (!this.state.currentActive) {
            const activeMobileLink = safeQuerySelector(`${CONFIG.SELECTORS.mobileNavLinks}.active`);
            if (activeMobileLink) {
                this.state.currentActive = activeMobileLink.textContent.trim();
                this.syncDesktopNavigation(this.state.currentActive);
            }
        }
    },

    /**
     * Programmatically set active navigation item
     * @param {string} itemText - Text of the nav item to activate
     */
    setActive(itemText) {
        // Update desktop navigation
        const navLinks = safeQuerySelectorAll(CONFIG.SELECTORS.navLinks);
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.textContent.trim() === itemText) {
                link.classList.add('active');
            }
        });

        // Update mobile navigation
        const mobileNavLinks = safeQuerySelectorAll(CONFIG.SELECTORS.mobileNavLinks);
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.textContent.trim() === itemText) {
                link.classList.add('active');
            }
        });

        this.state.currentActive = itemText;
        console.log(`🎯 Navigation set to: ${itemText}`);
    }
};

/**
 * ===================================
 * SEARCH INTERFACE MODULE
 * ===================================
 */
const SearchInterface = {
    // State management
    state: {
        isInitialized: false,
        hasInteracted: false,
        animationSequence: 0
    },

    // DOM elements cache
    elements: {},

    /**
     * Initialize search interface
     */
    init() {
        if (this.state.isInitialized) return;

        // Cache DOM elements
        this.cacheElements();
        
        // Initialize if elements exist
        if (this.elements.searchInterface && this.elements.suggestions) {
            this.bindEvents();
            this.startAnimationSequence();
            this.state.isInitialized = true;
            console.log('✅ Search Interface initialized');
        }
    },

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            searchInput: safeQuerySelector('#searchInput'),
            searchInputFinal: safeQuerySelector('#searchInputFinal'),
            suggestions: safeQuerySelector('#searchSuggestions'),
            searchInterface: safeQuerySelector('#searchInterface'),
            suggestionItems: safeQuerySelectorAll('.suggestion-item'),
            searchWrapper: safeQuerySelector('.search-input-wrapper'),
            phaseIcon: safeQuerySelector('#phaseIcon'),
            phaseInput: safeQuerySelector('#phaseInput'),
            phaseProcessing: safeQuerySelector('#phaseProcessing'),
            phaseResults: safeQuerySelector('#phaseResults')
        };
    },

    /**
     * Bind search interface events
     */
    bindEvents() {
        // Input events
        this.elements.searchInput.addEventListener('input', this.handleInput.bind(this));
        this.elements.searchInput.addEventListener('focus', this.handleFocus.bind(this));
        this.elements.searchInput.addEventListener('blur', this.handleBlur.bind(this));

        // Suggestion item clicks
        this.elements.suggestionItems.forEach((item, index) => {
            item.addEventListener('click', () => this.handleSuggestionClick(item, index));
            item.addEventListener('mouseenter', () => this.handleSuggestionHover(item));
        });

        // Add ripple effect on wrapper click
        if (this.elements.searchWrapper) {
            this.elements.searchWrapper.addEventListener('click', this.createRippleEffect.bind(this));
        }
    },

    /**
     * Start the creative animation sequence
     */
    startAnimationSequence() {
        // Phase 1: Search Icon (0.5s delay, 2.5s duration)
        this.showPhase('phaseIcon');
        
        // Phase 2: Input Field (3s delay)
        setTimeout(() => {
            this.hidePhase('phaseIcon');
            this.showPhase('phaseInput');
            this.startTypingAnimation();
        }, 3000);
        
        // Phase 3: AI Processing (5.5s delay)
        setTimeout(() => {
            this.hidePhase('phaseInput');
            this.showPhase('phaseProcessing');
        }, 5500);
        
        // Phase 4: Results (7.5s delay)
        setTimeout(() => {
            this.hidePhase('phaseProcessing');
            this.showPhase('phaseResults');
            this.showSuggestions();
        }, 7500);
    },

    /**
     * Show specific phase
     */
    showPhase(phaseId) {
        const phase = document.getElementById(phaseId);
        if (phase) {
            phase.style.display = 'block';
        }
    },

    /**
     * Hide specific phase
     */
    hidePhase(phaseId) {
        const phase = document.getElementById(phaseId);
        if (phase) {
            setTimeout(() => {
                phase.style.display = 'none';
            }, 500);
        }
    },

    /**
     * Start typing animation
     */
    startTypingAnimation() {
        const searchInput = document.getElementById('searchInput');
        const targetText = "Jack I";
        let currentText = "";
        let index = 0;

        if (!searchInput) return;

        const typeInterval = setInterval(() => {
            if (index < targetText.length) {
                currentText += targetText[index];
                searchInput.value = currentText;
                index++;
            } else {
                clearInterval(typeInterval);
            }
        }, 200);
    },

    /**
     * Show suggestions with enhanced animation
     */
    showSuggestions() {
        // Animate suggestion items with staggered entrance
        this.elements.suggestionItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
                
                // Add entrance sound effect (visual feedback)
                this.addEntranceEffect(item);
            }, 800 + (index * 300));
        });
    },

    /**
     * Add visual entrance effect to suggestion items
     */
    addEntranceEffect(item) {
        // Create a temporary glow effect
        const originalTransform = item.style.transform;
        item.style.transform = originalTransform + ' scale(1.05)';
        item.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.3)';
        
        setTimeout(() => {
            item.style.transform = originalTransform;
            item.style.boxShadow = '';
        }, 300);
    },

    /**
     * Handle input events
     */
    handleInput(event) {
        const value = event.target.value;
        this.state.hasInteracted = true;
        
        // Add subtle animation on input
        if (this.elements.searchWrapper) {
            this.elements.searchWrapper.style.transform = 'translateY(-1px)';
            setTimeout(() => {
                this.elements.searchWrapper.style.transform = '';
            }, 200);
        }
    },

    /**
     * Handle focus events
     */
    handleFocus(event) {
        if (this.elements.searchWrapper) {
            this.elements.searchWrapper.classList.add('focused');
        }
    },

    /**
     * Handle blur events
     */
    handleBlur(event) {
        if (this.elements.searchWrapper) {
            this.elements.searchWrapper.classList.remove('focused');
        }
    },

    /**
     * Handle suggestion item clicks
     */
    handleSuggestionClick(item, index) {
        // Add click animation
        item.style.transform = 'translateX(10px) translateY(-4px) scale(0.98)';
        setTimeout(() => {
            item.style.transform = 'translateX(5px) translateY(-2px)';
        }, 150);

        // Populate search input
        const suggestionText = item.querySelector('h4').textContent;
        this.elements.searchInput.value = suggestionText;

        console.log('Suggestion clicked:', suggestionText);
    },

    /**
     * Handle suggestion hover
     */
    handleSuggestionHover(item) {
        // Add subtle pulse to status badge
        const status = item.querySelector('.suggestion-status');
        if (status) {
            status.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                status.style.animation = '';
            }, 600);
        }
    },

    /**
     * Create ripple effect
     */
    createRippleEffect(event) {
        const wrapper = event.currentTarget;
        const rect = wrapper.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        wrapper.style.position = 'relative';
        wrapper.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    },

    /**
     * Reset search interface
     */
    reset() {
        this.elements.searchInput.value = '';
        this.elements.suggestions.style.opacity = '0';
        this.elements.suggestions.style.transform = 'translateY(20px) scale(0.95)';
        
        this.elements.suggestionItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
        });
        
        this.state.hasInteracted = false;
    }
};

/**
 * ===================================
 * BUTTON HANDLERS MODULE
 * ===================================
 */
const ButtonHandlers = {
    /**
     * Initialize button handlers
     */
    init() {
        this.bindCTAButton();
        this.bindSignupButtons();
        console.log('✅ Button Handlers initialized');
    },

    /**
     * Bind CTA button events
     */
    bindCTAButton() {
        const ctaButton = safeQuerySelector(CONFIG.SELECTORS.ctaButton);
        
        if (ctaButton) {
            ctaButton.addEventListener('click', this.handleCTAClick.bind(this));
        }
    },

    /**
     * Bind signup button events
     */
    bindSignupButtons() {
        const signupButtons = safeQuerySelectorAll(CONFIG.SELECTORS.signupButtons);
        
        signupButtons.forEach(button => {
            button.addEventListener('click', this.handleSignupClick.bind(this));
        });
    },

    /**
     * Handle CTA button click
     * @param {Event} event - Click event
     */
    handleCTAClick(event) {
        event.preventDefault();
        
        // Add your CTA functionality here
        console.log('🚀 Start Now clicked');
        
        // Example implementations:
        // window.location.href = '/signup';
        // this.showModal('signup');
        // this.trackEvent('cta_clicked');
    },

    /**
     * Handle signup button click
     * @param {Event} event - Click event
     */
    handleSignupClick(event) {
        event.preventDefault();
        
        // Add your signup functionality here
        console.log('📝 Sign Up clicked');
        
        // Example implementations:
        // window.location.href = '/register';
        // this.showModal('register');
        // this.trackEvent('signup_clicked');
    }
};

/**
 * ===================================
 * MAIN APPLICATION
 * ===================================
 */
const ZOQQApp = {
    // Application state
    state: {
        isInitialized: false,
        modules: []
    },

    /**
     * Initialize the application
     */
    init() {
        if (this.state.isInitialized) return;

        try {
            // Initialize all modules
            this.initModules();
            
            // Set initialized state
            this.state.isInitialized = true;
            
            console.log('🎉 ZOQQ App fully initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize ZOQQ App:', error);
        }
    },

    /**
     * Initialize all modules
     */
    initModules() {
        const modules = [
            { name: 'MobileNavigation', module: MobileNavigation },
            { name: 'ScrollEffects', module: ScrollEffects },
            { name: 'StatsCounter', module: StatsCounter },
            { name: 'AnimationModule', module: AnimationModule },
            { name: 'SmoothScroll', module: SmoothScroll },
            { name: 'NavigationStates', module: NavigationStates },
            { name: 'SearchInterface', module: SearchInterface },
            { name: 'ButtonHandlers', module: ButtonHandlers }
        ];

        modules.forEach(({ name, module }) => {
            try {
                module.init();
                this.state.modules.push(name);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name}:`, error);
            }
        });
    },

    /**
     * Public API methods
     */
    toggleMobileMenu() {
        if (MobileNavigation.state.isInitialized) {
            MobileNavigation.toggleMenu();
        }
    },

    setActiveNavItem(itemText) {
        if (NavigationStates.state.isInitialized) {
            NavigationStates.setActive(itemText);
        }
    },

    getCurrentActiveNav() {
        return NavigationStates.state.currentActive;
    },

    animateElement(element, animation, duration) {
        return AnimationModule.customAnimate(element, animation, duration);
    },

    scrollTo(selector) {
        const element = safeQuerySelector(selector);
        if (element) {
            SmoothScroll.scrollToElement(element);
        }
    },

    restartTransactionAnimation() {
        if (AnimationModule.state.isInitialized) {
            AnimationModule.restartTransactionAnimation();
        }
    }
};

/**
 * ===================================
 * INITIALIZATION
 * ===================================
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ZOQQApp.init();
});

// Fallback for already loaded DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ZOQQApp.init.bind(ZOQQApp));
} else {
    ZOQQApp.init();
}

// Export to global scope for external access
window.ZOQQApp = ZOQQApp;

/**
 * ===================================
 * ERROR HANDLING & MONITORING
 * ===================================
 */

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});

/**
 * ===================================
 * DEVELOPMENT HELPERS
 * ===================================
 */

// Development mode helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Add development tools
    window.ZOQQ_DEBUG = {
        config: CONFIG,
        modules: {
            MobileNavigation,
            ScrollEffects,
            StatsCounter,
            AnimationModule,
            SmoothScroll,
            NavigationStates,
            ButtonHandlers
        },
        utils: {
            safeQuerySelector,
            safeQuerySelectorAll,
            debounce
        }
    };
    
    console.log('🔧 Development mode active. Access window.ZOQQ_DEBUG for debugging tools.');
}


  AOS.init();
