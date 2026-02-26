const CACHE_NAME = "furduncinho-v3";
const urlsToCache = ["/", "/logo.webp", "/manifest.json"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      // limpa caches antigos
      const keys = await caches.keys();
      await Promise.all(
        keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Não intercepta API
  if (url.pathname.startsWith("/api/")) return;

  // Assets do Vite: tenta rede primeiro e cai pro cache se falhar.
  // Se não existir no cache, devolve um Response 503 (válido).
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;

        // fallback para navegação (SPA) se for request de página
        if (req.mode === "navigate") {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }

        return new Response("", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }
    })()
  );
});
