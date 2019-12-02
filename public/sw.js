var STATIC_CACHE = 'static-v6';
var DYNAMIC_CACHE = 'dynamic';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

function trimCache(cacheName, maxItems){
    cache.open(cacheName)
        .then(function(){
            return cache.keys();
        })
        .then(function(keys){
            if(key.length > maxItems){
                cache.delete(keys[0])
                    .then(trimCache(cacheName, maxItems))
            }
        })
}

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
      console.log('matched ', string);
      cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
      cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
  }

self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then(function(cache) {
          console.log('[Service Worker] Precaching App Shell');
          cache.addAll(STATIC_FILES);
        })
    )
  });

self.addEventListener('activate', function(event){
    console.log('[Service Worker Activating]', event);

    event.waitUntil(
        caches.keys()
        .then(function(keyList){
            return Promise.all(keyList.map(function(key){
                if(key !== STATIC_CACHE && key !== DYNAMIC_CACHE){
                    console.log("[Removing old cache]", key)
                    return caches.delete(key);
                }
            }));
        })
    )
    return self.clients.claim();
})

//cache, then network!
self.addEventListener('fetch', function (event) {
    var url = 'https://httpbin.org/get';
    if (event.request.url.indexOf(url) > -1) {
      event.respondWith(
        caches.open(DYNAMIC_CACHE)
          .then(function (cache) {
            return fetch(event.request) 
              .then(function (res) {
                cache.put(event.request, res.clone());
                return res;
              });
          })
      );

    } else if (isInArray(event.request.url, STATIC_FILES)){  
        event.respondWith(
            caches.match(event.request)
        );
    } else {
      event.respondWith(
        caches.match(event.request)
          .then(function (response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                .then(function (res) {
                  return caches.open(DYNAMIC_CACHE)
                    .then(function (cache) {
                      cache.put(event.request.url, res.clone());
                      return res;
                    })
                })
                .catch(function (err) {
                  return caches.open(STATIC_CACHE)
                    .then(function (cache) {
                        if(event.request.header.get('accept').includes('text/html')){
                            return cache.match('/offline.html');
                        }                  
                    });
                });
            }
          })
      );
    }
  });

// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response){
//                 if(response){
//                     //return cache
//                     return response;
//                 }else{
//                     //network
//                     //return dynamic cache
//                     return fetch(event.request)
//                         .then(function(res){
//                             return caches.open(DYNAMIC_CACHE)
//                                 .then(function(cache){
//                                     cache.put(event.request.url, res.clone())
//                                     return res;
//                                 })
//                         })
//                         .catch(function(err){
//                             console.log('error');
//                             //if cache not found fallback to offline.html
//                              return caches.open(STATIC_CACHE)
//                                 .then(function(cache){
//                                     return cache.match('/offline.html')
//                                 })
//                         })
//                 }
//             })
//     );
//  });


 // Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });