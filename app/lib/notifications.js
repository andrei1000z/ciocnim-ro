export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function getNotificationStatus() {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function sendLocalNotification(title, body, url = "/") {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      body,
      icon: "/icon-512x512.png",
      badge: "/apple-touch-icon.png",
      data: { url },
      vibrate: [100, 50, 100],
    });
  } catch {}
}
