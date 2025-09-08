// Performance optimizations and loading experience
(function() {
    'use strict';

    // Intersection Observer for lazy loading portal groups
    const portalGroupObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const group = entry.target;
                group.classList.add('loaded');
                
                // Animate portal items in the group
                const portals = group.querySelectorAll('.portal');
                portals.forEach((portal, index) => {
                    setTimeout(() => {
                        portal.style.opacity = '1';
                        portal.style.transform = 'translateY(0)';
                    }, index * 50);
                });
                
                portalGroupObserver.unobserve(group);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Image lazy loading for icons
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    // Initialize performance optimizations
    function initPerformanceOptimizations() {
        // Add loading animation styles
        const style = document.createElement('style');
        style.textContent = `
            .portal-group:not(.loaded) .portal {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .portal-group.loaded .portal {
                opacity: 1;
                transform: translateY(0);
            }
            
            /* Page loading overlay */
            .page-loading {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 1;
                transition: opacity 0.5s ease;
            }
            
            .page-loading.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(181, 232, 83, 0.3);
                border-top: 3px solid #b5e853;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-text {
                margin-left: 15px;
                color: #b5e853;
                font-family: Monaco, "Bitstream Vera Sans Mono", "Lucida Console", Terminal, monospace;
            }
        `;
        document.head.appendChild(style);

        // Add loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'page-loading';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading portals...</div>
        `;
        document.body.appendChild(loadingOverlay);

        // Observe portal groups for lazy loading
        document.querySelectorAll('.portal-group').forEach(group => {
            portalGroupObserver.observe(group);
        });

        // Observe images for lazy loading
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Hide loading overlay when everything is ready
        Promise.all([
            new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            }),
            new Promise(resolve => setTimeout(resolve, 500)) // Minimum loading time
        ]).then(() => {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 500);
        });
    }

    // Prefetch important resources
    function prefetchResources() {
        const criticalResources = [
            '/assets/js/favorites.js',
            '/assets/css/style.css'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    // Optimize search performance with debouncing
    function optimizeSearch() {
        const searchInput = document.getElementById('search');
        if (!searchInput) return;

        let searchTimeout;
        const originalHandler = searchInput.onkeyup;

        searchInput.onkeyup = function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (originalHandler) {
                    originalHandler.call(this, e);
                }
            }, 150); // Debounce search by 150ms
        };
    }

    // Cache management for better performance
    const cache = {
        searchResults: new Map(),
        maxCacheSize: 50,

        get(key) {
            return this.searchResults.get(key);
        },

        set(key, value) {
            if (this.searchResults.size >= this.maxCacheSize) {
                const firstKey = this.searchResults.keys().next().value;
                this.searchResults.delete(firstKey);
            }
            this.searchResults.set(key, value);
        },

        clear() {
            this.searchResults.clear();
        }
    };

    // Memory usage monitoring (for development)
    function monitorMemory() {
        if (performance.memory && console.log) {
            const logMemory = () => {
                const memory = performance.memory;
                console.log(`Memory: ${Math.round(memory.usedJSHeapSize / 1048576)}MB used / ${Math.round(memory.totalJSHeapSize / 1048576)}MB total`);
            };

            // Log memory usage every 30 seconds
            setInterval(logMemory, 30000);
        }
    }

    // Service Worker registration for offline capability
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service Worker registered for offline capability');
            }).catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }
    }

    // Initialize all optimizations
    function init() {
        initPerformanceOptimizations();
        prefetchResources();
        optimizeSearch();
        
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            monitorMemory();
        }
        
        // Register service worker only in production
        if (location.protocol === 'https:') {
            registerServiceWorker();
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose cache for debugging
    window.msportalsCache = cache;
})();