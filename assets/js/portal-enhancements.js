// Portal Status Monitoring and Recently Visited Tracking
class PortalEnhancements {
    constructor() {
        this.recentlyVisitedKey = 'msportals-recently-visited';
        this.maxRecentItems = 10;
        this.statusCache = new Map();
        this.statusCheckTimeout = 30000; // 30 seconds
        
        this.init();
    }

    init() {
        this.initRecentlyVisited();
        this.initStatusMonitoring();
        this.initLoadingStates();
        this.initSkipLinks();
    }

    // Recently Visited Functionality
    initRecentlyVisited() {
        // Track portal clicks
        document.addEventListener('click', (e) => {
            const portalLink = e.target.closest('.portal-url a');
            if (portalLink && portalLink.href) {
                this.addToRecentlyVisited({
                    name: this.getPortalName(portalLink),
                    url: portalLink.href,
                    timestamp: Date.now()
                });
            }
        });

        // Add recently visited section to pages with search
        if (document.getElementById('search')) {
            this.displayRecentlyVisited();
        }
    }

    getPortalName(linkElement) {
        const portal = linkElement.closest('.portal');
        const nameElement = portal?.querySelector('.portal-title');
        return nameElement?.textContent?.trim() || 'Unknown Portal';
    }

    addToRecentlyVisited(portal) {
        let recent = this.getRecentlyVisited();
        
        // Remove existing entry for this URL
        recent = recent.filter(item => item.url !== portal.url);
        
        // Add to beginning
        recent.unshift(portal);
        
        // Limit to max items
        recent = recent.slice(0, this.maxRecentItems);
        
        localStorage.setItem(this.recentlyVisitedKey, JSON.stringify(recent));
    }

    getRecentlyVisited() {
        try {
            return JSON.parse(localStorage.getItem(this.recentlyVisitedKey)) || [];
        } catch {
            return [];
        }
    }

    displayRecentlyVisited() {
        const recent = this.getRecentlyVisited();
        if (recent.length === 0) return;

        const container = document.querySelector('.container');
        const searchForm = document.querySelector('#search').closest('form');
        
        if (!container || !searchForm) return;

        const recentSection = document.createElement('div');
        recentSection.className = 'recently-visited';
        recentSection.innerHTML = `
            <details style="margin: 10px 0; color: #b5e853;">
                <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">
                    🕒 Recently Visited (${recent.length})
                </summary>
                <div class="recent-items" style="display: flex; flex-wrap: wrap; gap: 8px; margin-left: 20px;">
                    ${recent.map(item => `
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer"
                           class="recent-item"
                           style="display: inline-block; padding: 4px 8px; background: rgba(0,255,0,0.1); 
                                  border: 1px solid rgba(0,255,0,0.3); border-radius: 4px; 
                                  text-decoration: none; font-size: 0.85em; color: inherit;
                                  transition: all 0.2s ease;"
                           title="Visited ${this.formatTimestamp(item.timestamp)}">
                            ${item.name}
                        </a>
                    `).join('')}
                </div>
            </details>
        `;

        searchForm.parentNode.insertBefore(recentSection, searchForm.nextSibling);

        // Add hover effects
        recentSection.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(0,255,0,0.2)';
                this.style.transform = 'translateY(-1px)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(0,255,0,0.1)';
                this.style.transform = 'translateY(0)';
            });
        });
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Portal Status Monitoring
    async initStatusMonitoring() {
        if (!document.querySelector('.portal')) return;

        // Add status indicators to portals
        document.querySelectorAll('.portal').forEach(portal => {
            const urlElement = portal.querySelector('.portal-url a');
            if (urlElement) {
                this.addStatusIndicator(portal, urlElement.href);
            }
        });

        // Check status for visible portals
        await this.checkPortalStatuses();
    }

    addStatusIndicator(portalElement, url) {
        const nameElement = portalElement.querySelector('.portal-name');
        if (!nameElement) return;

        const indicator = document.createElement('span');
        indicator.className = 'status-indicator status-unknown';
        indicator.title = 'Checking status...';
        indicator.setAttribute('aria-label', 'Portal status: checking');
        nameElement.appendChild(indicator);
    }

    async checkPortalStatuses() {
        const portals = document.querySelectorAll('.portal:not([hidden])');
        const batchSize = 5; // Check 5 at a time to avoid overwhelming

        for (let i = 0; i < portals.length; i += batchSize) {
            const batch = Array.from(portals).slice(i, i + batchSize);
            await Promise.all(batch.map(portal => this.checkPortalStatus(portal)));
            
            // Small delay between batches
            if (i + batchSize < portals.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async checkPortalStatus(portalElement) {
        const urlElement = portalElement.querySelector('.portal-url a');
        const indicator = portalElement.querySelector('.status-indicator');
        
        if (!urlElement || !indicator) return;

        const url = urlElement.href;
        
        // Check cache first
        if (this.statusCache.has(url)) {
            const cachedStatus = this.statusCache.get(url);
            if (Date.now() - cachedStatus.timestamp < this.statusCheckTimeout) {
                this.updateStatusIndicator(indicator, cachedStatus.status);
                return;
            }
        }

        try {
            // Use a simple approach - try to fetch the favicon or check if domain resolves
            const domain = new URL(url).hostname;
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
            
            const response = await fetch(faviconUrl, { 
                method: 'HEAD',
                mode: 'no-cors',
                timeout: 5000
            });
            
            // If we get here without error, assume online
            const status = 'online';
            this.statusCache.set(url, { status, timestamp: Date.now() });
            this.updateStatusIndicator(indicator, status);
            
        } catch (error) {
            // If we can't reach the favicon service, assume unknown
            const status = 'unknown';
            this.statusCache.set(url, { status, timestamp: Date.now() });
            this.updateStatusIndicator(indicator, status);
        }
    }

    updateStatusIndicator(indicator, status) {
        indicator.className = `status-indicator status-${status}`;
        
        const statusText = {
            online: 'Portal appears to be online',
            offline: 'Portal may be offline or unreachable',
            unknown: 'Portal status unknown'
        };

        indicator.title = statusText[status] || statusText.unknown;
        indicator.setAttribute('aria-label', `Portal status: ${status}`);
    }

    // Loading States
    initLoadingStates() {
        // Add loading states to search
        const searchInput = document.getElementById('search');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                document.body.classList.add('searching');
                
                searchTimeout = setTimeout(() => {
                    document.body.classList.remove('searching');
                }, 300);
            });
        }
    }

    // Skip Links for Better Accessibility
    initSkipLinks() {
        if (document.querySelector('.skip-link')) return; // Already exists

        const skipLink = document.createElement('a');
        skipLink.href = '#main_content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PortalEnhancements());
} else {
    new PortalEnhancements();
}

// Add CSS for new features
const style = document.createElement('style');
style.textContent = `
    /* Searching animation */
    body.searching .quickfilter {
        border-color: #00ff00;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }

    /* Enhanced status indicators */
    .status-indicator {
        animation: pulse 2s infinite;
    }

    .status-indicator.status-online {
        animation: none;
    }

    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }

    /* Loading button animation */
    .loading {
        position: relative;
        overflow: hidden;
    }

    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: loading-sweep 1s ease-in-out infinite;
    }

    @keyframes loading-sweep {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    /* Recently visited responsive design */
    @media (max-width: 768px) {
        .recent-items {
            flex-direction: column !important;
        }
        
        .recent-item {
            width: 100% !important;
            text-align: center;
        }
    }
`;

document.head.appendChild(style);