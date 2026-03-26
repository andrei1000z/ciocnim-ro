import Link from "next/link";

const navLinks = [
  { href: "/traditii", label: "Tradiții" },
  { href: "/retete", label: "Rețete" },
  { href: "/urari", label: "Urări" },
  { href: "/vopsit-natural", label: "Vopsit" },
  { href: "/calendar", label: "Calendar" },
  { href: "/ghid", label: "Ghid" },
  { href: "/clasament", label: "Clasament" },
];

export default function ContentNav({ current }) {
  return (
    <nav aria-label="Pagini educaționale" className="w-full overflow-x-auto scrollbar-hide border-b border-red-900/10 bg-card">
      <div className="flex items-center gap-1 px-4 py-2 max-w-4xl mx-auto">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              current === link.href
                ? "bg-red-700 text-white"
                : "text-dim hover:text-heading hover:bg-elevated"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
