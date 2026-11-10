/* Dust Hunter offline support: always try the network first (so updates arrive straight away),
   and fall back to the saved copy when offline. Firebase data has its own offline store. */
const CACHE = "dust-hunter";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url), mine = u.origin === location.origin;
  const lib = u.hostname === "www.gstatic.com" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  if (!mine && !lib) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(mine && r.mode === "navigate" ? "./index.html" : r, copy)); }
      return res;
    }).catch(() => caches.match(mine && r.mode === "navigate" ? "./index.html" : r).then(m => m || Response.error()))
  );
});
