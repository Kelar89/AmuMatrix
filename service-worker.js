self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("amu-matrix-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "style-landing.css",
        "geo-field.js",
        "app.js",
        "icons/icon-192.png",
        "icons/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
