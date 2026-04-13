"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { safeLS } from "@/app/lib/utils";

function detectDevice() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Edg/.test(ua)) return "edge";
  if (/OPR|Opera/.test(ua)) return "opera";
  if (/Chrome/.test(ua) && !/Chromium/.test(ua)) return "chrome";
  if (/Firefox/.test(ua)) return "firefox";
  if (/Safari/.test(ua)) return "safari";
  return "other";
}

function detectDisplayMode() {
  if (typeof window === "undefined") return "browser";
  if (window.matchMedia("(display-mode: standalone)").matches) return "standalone";
  if (navigator.standalone) return "standalone"; // iOS Safari
  return "browser";
}

function getReferrer() {
  if (typeof document === "undefined" || !document.referrer) return "direct";
  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return "internal";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
}

function getVisitorId() {
  let vid = safeLS.get("c_visitorId");
  if (!vid) {
    try { vid = sessionStorage.getItem("c_visitorId"); } catch {}
  }
  if (!vid) {
    vid = `v-${Math.random().toString(36).substring(2, 10)}`;
    safeLS.set("c_visitorId", vid);
  }
  return vid;
}

async function track(payload) {
  try {
    await fetch("/api/ciocnire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {}
}

export default function Analytics() {
  const pathname = usePathname();

  // Pageview track — once per pathname change
  useEffect(() => {
    const visitorId = getVisitorId();
    const locale = pathname.match(/^\/(ro|bg|el|en)/)?.[1] || "ro";
    track({
      actiune: "analytics-track",
      eventType: "pageview",
      visitorId,
      pathname,
      locale,
      displayMode: detectDisplayMode(),
      deviceType: detectDevice(),
      browser: detectBrowser(),
      referrer: getReferrer(),
    });
  }, [pathname]);

  // PWA install event
  useEffect(() => {
    const onInstall = () => {
      const visitorId = getVisitorId();
      track({
        actiune: "analytics-track",
        eventType: "pwa-install",
        visitorId,
        locale: pathname.match(/^\/(ro|bg|el|en)/)?.[1] || "ro",
      });
    };
    window.addEventListener("appinstalled", onInstall);
    return () => window.removeEventListener("appinstalled", onInstall);
  }, [pathname]);

  return null;
}
