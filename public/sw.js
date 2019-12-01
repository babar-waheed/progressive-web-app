self.addEventListener('install', function(event){
    //console.log('[Service Worker Installing]', event);

    event.waitUntil(
        caches.open('static')
        .then(function(cache){
            console.log('[service worker install]');
            cache.add('/src/js/app.js');
        })
    );
})

self.addEventListener('activate', function(event){
    //console.log('[Service Worker Activating]', event);
    return self.clients.claim();
})

self.addEventListener('fetch', function(event) {
    //console.log('[Service Worker] Fetching something ....', event);
    event.respondWith(
        caches.match(event.request)
            .then(function(response){
                if(response){
                    return response;
                }else{
                    return fetch(event.request);
                }
            })
    );
 });