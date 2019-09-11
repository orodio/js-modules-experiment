importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

workbox.routing.registerRoute(/\.mjs$/, new workbox.strategies.CacheFirst());
workbox.routing.registerRoute(/\.css$/, new workbox.strategies.CacheFirst());
workbox.routing.registerRoute(/\.html$/, new workbox.strategies.CacheFirst());
workbox.routing.registerRoute(
  /^https:\/\/unpkg.com/,
  new workbox.strategies.CacheFirst({
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      })
    ]
  })
);
