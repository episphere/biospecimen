importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
importScripts('./appVersion.js');

workbox.setConfig({debug: false});
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
const { CacheableResponse, CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;
const { BackgroundSyncPlugin } = workbox.backgroundSync
const googleAnalytics = workbox.googleAnalytics;

googleAnalytics.initialize();
registerRoute(/\.(?:js|css)$/, new NetworkFirst({cacheName: 'static-cache'}));
registerRoute(/\.(?:png|jpg|jpeg|svg|gif|ico)$/,
    new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 30,
                maxAgeSeconds: 7 * 24 * 60 * 60,
            })
        ]
    })
);

registerRoute(
    new RegExp('https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/.+'),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            })
        ]
    }),
    'GET'
);


const bgSyncPlugin = new BackgroundSyncPlugin('connectBiospecimen', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
    new RegExp('https://us-central1-nih-nci-dceg-connect-dev.cloudfunctions.net/.+'),
    new NetworkOnly({
      plugins: [bgSyncPlugin]
    }),
    'POST'
);

registerRoute(
  /index\.html$/,
  new NetworkFirst({
    cacheName: 'index-html-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

const cacheVersionName = `app-version-cache`;
const precacheVersionAssets = ['/appVersion.js'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheVersionName)
            .then((cache) => {
                return cache.keys()
                    .then((keys) => {
                        const deletionPromises = keys
                            .filter(key => key.url.includes('app-version-cache'))
                            .map(key => cache.delete(key));
                            return Promise.all(deletionPromises);
            })
            .then(() => cache.addAll(precacheVersionAssets));
            })
            .then(() => {
                self.skipWaiting(); // Forces the waiting service worker to become the active service worker
            })
            .catch(error => {
                console.error('Cache update failed:', error);
            })
    );
});