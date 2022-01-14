if (workbox) {
  console.log(`Workbox is loaded`);
  workbox.setConfig({ debug: true });
  workbox.precaching.precacheAndRoute(self.__precacheManifest);
  // workbox.routing.registerRoute(
  //   '/employees',
  //   new workbox.strategies.CacheFirst({
  //     cacheName: 'haroons-cache',
  //   }),
  // );
  workbox.routing.registerRoute(
    new RegExp('/images/.*.jpg'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'haroons-image-cache',
    }),
  );
} else {
  console.log(`Workbox didn't load`);
}

self.skipWaiting();

self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body.message,
    icon: 'img/icons/employees_192x192.png',
  });
});
