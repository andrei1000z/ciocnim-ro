"use client";

import { useEffect, useRef } from "react";
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

function detectOS() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return "windows";
  if (/Android/.test(ua)) return "android";
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Mac/.test(ua)) return "macos";
  if (/Linux/.test(ua)) return "linux";
  return "other";
}

function detectDisplayMode() {
  if (typeof window === "undefined") return "browser";
  if (window.matchMedia("(display-mode: standalone)").matches) return "standalone";
  if (navigator.standalone) return "standalone";
  return "browser";
}

function getLanguage() {
  if (typeof navigator === "undefined") return "unknown";
  return (navigator.language || "unknown").slice(0, 10);
}

function getTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"; } catch { return "unknown"; }
}

function getScreenSize() {
  if (typeof window === "undefined") return "unknown";
  const w = window.screen?.width || 0;
  const h = window.screen?.height || 0;
  return `${w}x${h}`;
}

function getViewport() {
  if (typeof window === "undefined") return "unknown";
  // Bucket viewports for less cardinality
  const w = window.innerWidth || 0;
  if (w < 380) return "xs (<380)";
  if (w < 640) return "sm (380-640)";
  if (w < 768) return "md (640-768)";
  if (w < 1024) return "lg (768-1024)";
  if (w < 1440) return "xl (1024-1440)";
  return "2xl (1440+)";
}

function getOrientation() {
  if (typeof window === "undefined") return "unknown";
  if (window.innerWidth > window.innerHeight) return "landscape";
  return "portrait";
}

function getConnection() {
  if (typeof navigator === "undefined") return "unknown";
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return "unknown";
  return c.effectiveType || "unknown";
}

function getColorScheme() {
  if (typeof window === "undefined") return "unknown";
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  return "no-pref";
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

function getReferrerFull() {
  if (typeof document === "undefined" || !document.referrer) return "";
  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return "";
    // Limit la 280 chars
    return document.referrer.slice(0, 280);
  } catch {
    return "";
  }
}

function getUTM() {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
      utmContent: params.get("utm_content") || "",
      utmTerm: params.get("utm_term") || "",
    };
  } catch {
    return {};
  }
}

function getNavigationTime() {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return 0;
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return 0;
    return Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd || 0);
  } catch { return 0; }
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

// Export pentru a putea trimite events din alte componente
export function trackEvent(eventType, extra = {}) {
  const visitorId = getVisitorId();
  const jucator = safeLS.get("c_nume") || "";
  track({
    actiune: "analytics-track",
    eventType,
    visitorId,
    jucator,
    locale: window.location.pathname.match(/^\/(ro|bg|el|en)/)?.[1] || "ro",
    ...extra,
  });
}

export default function Analytics() {
  const pathname = usePathname();
  const pageEnterTimeRef = useRef(Date.now());

  // Pageview track + capture timp pe pagină (când plecăm)
  useEffect(() => {
    const visitorId = getVisitorId();
    const locale = pathname.match(/^\/(ro|bg|el|en)/)?.[1] || "ro";
    const jucator = safeLS.get("c_nume") || "";

    // Trimite event "time-on-page" pentru pagina anterioară
    const prevTime = pageEnterTimeRef.current;
    const timeOnPrev = Date.now() - prevTime;
    if (timeOnPrev > 1000 && timeOnPrev < 3600000) {
      track({
        actiune: "analytics-track",
        eventType: "time-on-page",
        visitorId,
        jucator,
        locale,
        timeOnPage: timeOnPrev,
      });
    }
    pageEnterTimeRef.current = Date.now();

    // Pageview cu toate metadata posibile
    const utm = getUTM();
    track({
      actiune: "analytics-track",
      eventType: "pageview",
      visitorId,
      pathname,
      locale,
      jucator,
      displayMode: detectDisplayMode(),
      deviceType: detectDevice(),
      browser: detectBrowser(),
      os: detectOS(),
      referrer: getReferrer(),
      referrerFull: getReferrerFull(),
      ...utm,
      language: getLanguage(),
      timezone: getTimezone(),
      screenSize: getScreenSize(),
      viewport: getViewport(),
      orientation: getOrientation(),
      connection: getConnection(),
      colorScheme: getColorScheme(),
      loadTime: getNavigationTime(),
    });
  }, [pathname]);

  // Time-on-page la închidere/refresh tab
  useEffect(() => {
    const onUnload = () => {
      const timeOnPage = Date.now() - pageEnterTimeRef.current;
      if (timeOnPage <= 1000 || timeOnPage >= 3600000) return;
      const visitorId = getVisitorId();
      const jucator = safeLS.get("c_nume") || "";
      const payload = JSON.stringify({
        actiune: "analytics-track",
        eventType: "time-on-page",
        visitorId,
        jucator,
        locale: pathname.match(/^\/(ro|bg|el|en)/)?.[1] || "ro",
        timeOnPage,
      });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/ciocnire", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/ciocnire", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
        }
      } catch {}
    };
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
    };
  }, [pathname]);

  // PWA install events
  useEffect(() => {
    const onPromptShown = () => trackEvent("pwa-prompt-shown");
    const onInstall = () => trackEvent("pwa-install");
    window.addEventListener("beforeinstallprompt", onPromptShown);
    window.addEventListener("appinstalled", onInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPromptShown);
      window.removeEventListener("appinstalled", onInstall);
    };
  }, []);

  // JS error tracking (simple)
  useEffect(() => {
    const onError = (e) => {
      const msg = (e.message || e.error?.message || "unknown").slice(0, 200);
      trackEvent("js-error", { error: msg });
    };
    window.addEventListener("error", onError);
    return () => window.removeEventListener("error", onError);
  }, []);

  return null;
}
