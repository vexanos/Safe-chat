// Safe Chat service worker: shows push notifications when the site is closed.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) {}
  const d = p.data || p.notification || p;
  const title = d.title || "Safe Chat";
  const body = d.body || "You have a new message";
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (list.some(c => c.visibilityState === "visible")) return; // you are already looking at the app
    await self.registration.showNotification(title, {
      body,
      tag: d.tag || "safe-chat",
      renotify: true,
      icon: "icon.png",
      badge: "icon.png",
    });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if ("focus" in c) { await c.focus(); c.postMessage({ type: "open-chat" }); return; }
    }
    await self.clients.openWindow(self.registration.scope + "#chat");
  })());
});
