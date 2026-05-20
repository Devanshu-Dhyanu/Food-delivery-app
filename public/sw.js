const SHELL_CACHE_NAME = 'the-vajra-shell-v3';
const IMAGE_CACHE_NAME = 'the-vajra-images-v1';
const APP_SHELL = ['/', '/site.webmanifest', '/the-vajra-mark.svg'];

const isCacheableImageRequest = (request, url) => {
  if (request.destination !== 'image') {
    return false;
  }

  if (!url.protocol.startsWith('http')) {
    return false;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    return false;
  }

  return true;
};

const shouldCacheResponse = (response) =>
  response &&
  response.status !== 206 &&
  response.status !== 304 &&
  (response.ok || response.type === 'opaque');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE_NAME, IMAGE_CACHE_NAME].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (isCacheableImageRequest(request, url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const networkResponsePromise = fetch(request)
          .then((response) => {
            if (shouldCacheResponse(response)) {
              void cache.put(request, response.clone());
            }

            return response;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkResponsePromise;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (shouldCacheResponse(response)) {
            const responseClone = response.clone();
            void caches.open(SHELL_CACHE_NAME).then((cache) => cache.put('/', responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match('/');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const responseClone = response.clone();
          void caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }

        return response;
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }

      return undefined;
    })
  );
});
