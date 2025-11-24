const CACHE_NAME = "furduncinho-v1";
const urlsToCache = ["/", "/logo.png", "/manifest.json"];

// Instalação do Service Worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Estratégia: Network First (Tenta internet, se falhar, tenta cache)
// Isso evita que o usuário veja uma versão velha do site se tiver internet
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
