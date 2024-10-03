importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const appVersion = "v24.9.0";
workbox.setConfig({debug: false});
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const googleAnalytics = workbox.googleAnalytics;
const cacheNameMapper = {
  "static-cache": `static-cache-${appVersion}`,
  "images-cache": `images-cache-${appVersion}`,
};
const currCacheNameArray = Object.values(cacheNameMapper);

googleAnalytics.initialize();
registerRoute(/\.(?:js|css|html)$/, new NetworkFirst({ cacheName: cacheNameMapper["static-cache"] }));
registerRoute(/\.(?:png|jpg|jpeg|svg|gif|ico)$/,
    new CacheFirst({
        cacheName: cacheNameMapper["images-cache"],
        plugins: [
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ]
    })
);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currCacheNameArray.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data.action === "getAppVersion") {
    event.source.postMessage({ action: "sendAppVersion", payload: appVersion });
  }
});
