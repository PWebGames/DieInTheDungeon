const CACHE_NAME = "die-in-the-dungeon-v1";

// All files required to run fully offline
const OFFLINE_ASSETS = [
  "./",
  "./Die in the Dungeon.html",
  "./manifest.json",

  "./Die in the Dungeon 1.6.2f [WEB].framework.js",

  "./Build/Die in the Dungeon 1.6.2f [WEB].data.gz",
  "./Build/Die in the Dungeon 1.6.2f [WEB].framework.js.gz",
  "./Build/Die in the Dungeon 1.6.2f [WEB].wasm.gz",

  "./Die in the Dungeon_files/Die in the Dungeon 1.6.2f [WEB].framework.js.gz",
  "./Die in the Dungeon_files/Die in the Dungeon 1.6.2f [WEB].loader.js",
  "./Die in the Dungeon_files/htmlgame.js"
];

// Install: cache everything
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first (Unity-safe)
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Cache new successful requests
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Optional offline fallback (if needed)
          return caches.match("./Die in the Dungeon.html");
        });
    })
  );
});
