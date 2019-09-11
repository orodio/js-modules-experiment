importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js"
);

workbox.core.setCacheNameDetails({
  prefix: "datum",
  suffix: "v1.0.0"
});

workbox.routing.registerRoute("/", new workbox.strategies.CacheFirst());
workbox.routing.registerRoute(
  "/js-modules-experiment",
  new workbox.strategies.CacheFirst()
);
workbox.routing.registerRoute(
  "/js-modules-experiment/",
  new workbox.strategies.CacheFirst()
);
workbox.routing.registerRoute(
  /\.(?:mjs|css|html)$/,
  new workbox.strategies.CacheFirst()
);
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
