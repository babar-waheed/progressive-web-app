self.addEventListener('install', function(event){
    console.log('[Service Worker Installing]', event);
})

self.addEventListener('activate', function(event){
    console.log('[Service Worker Activating]', event);
    return self.clients.claim();
})

self.addEventListener('fetch', function(event) {
    console.log('[Service Worker] Fetching something ....', event);
    event.respondWith(fetch(event.request));
  });