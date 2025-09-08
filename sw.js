// Service Worker for MSPortals.io
// Provides basic offline functionality and caching

const CACHE_NAME = 'msportals-v1';
const STATIC_CACHE = 'msportals-static-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/assets/css/style.css',
  '/assets/js/favorites.js',
  '/assets/js/portal-enhancements.js',
  '/assets/js/performance.js',
  '/images/O365_Admin_Green.png'
];

// Install event - cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Don't cache if not successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache pages and assets
          if (event.request.url.includes('.html') || 
              event.request.url.includes('.css') || 
              event.request.url.includes('.js') ||
              event.request.url.includes('.json')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // If network fails and we don't have a cache, return offline page
          if (event.request.destination === 'document') {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>MSPortals.io - Offline</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: #1e1e1e; 
                    color: #fff; 
                  }
                  .offline-icon { font-size: 4em; margin-bottom: 20px; }
                  .retry-btn { 
                    background: #b5e853; 
                    color: #000; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-size: 1.1em;
                  }
                </style>
              </head>
              <body>
                <div class="offline-icon">📡</div>
                <h1>You're Offline</h1>
                <p>MSPortals.io requires an internet connection to load the latest portal information.</p>
                <button class="retry-btn" onclick="location.reload()">Try Again</button>
              </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        });
      })
  );
});

// Background sync for future enhancement
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    // Could implement background portal status checks here
    console.log('Background sync triggered');
  }
});

// Push notifications for future enhancement
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/O365_Admin_Green.png',
      badge: '/images/O365_Admin_Green.png',
      tag: 'msportals-notification'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});