const CACHE_NAME = "die-in-the-dungeon-v3";

const OFFLINE_ASSETS = [
  "Die in the Dungeon.html",
  "manifest.json",
  
  "icons/512.png",
  "icons/192.png",

  "Die in the Dungeon 1.6.2f [WEB].framework.js",

  "Build/Die in the Dungeon 1.6.2f [WEB].data.gz",
  "Build/Die in the Dungeon 1.6.2f [WEB].framework.js.gz",
  "Build/Die in the Dungeon 1.6.2f [WEB].wasm.gz",

  "Die in the Dungeon_files/Die in the Dungeon 1.6.2f [WEB].framework.js.gz",
  "Die in the Dungeon_files/Die in the Dungeon 1.6.2f [WEB].loader.js",
  "Die in the Dungeon_files/htmlgame.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const asset of OFFLINE_ASSETS) {
        try {
          const response = await fetch(asset, { cache: "no-cache" });
          if (!response.ok) {
            console.warn("[SW] Skipping (bad status):", asset);
            continue;
          }
          await cache.put(asset, response);
          console.log("[SW] Cached:", asset);
        } catch (err) {
          console.warn("[SW] Failed to cache:", asset, err);
        }
      }
    })()
  );

  self.skipWaiting();
});

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

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
