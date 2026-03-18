"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "🥚", label: "Joc" },
  { href: "/traditii", icon: "📖", label: "Tradiții" },
  { href: "/retete", icon: "🍳", label: "Rețete" },
  { href: "/urari", icon: "🕊️", label: "Urări" },
  { href: "/calendar", icon: "📅", label: "Calendar" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show in game rooms
  if (pathname?.startsWith("/joc/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9998] md:hidden bg-[#141111]/95 backdrop-blur-xl border-t border-white/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.4)]" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90 min-w-[56px] ${
                isActive
                  ? "text-red-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
              <span className={`text-[10px] font-bold leading-none ${isActive ? "text-red-400" : ""}`}>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0 w-6 h-0.5 bg-red-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
