"use client";
import { useT } from "@/app/i18n/useT";

export default function Footer() {
  const t = useT();
  return (
    <footer className="w-full py-6 px-6 mt-auto">
      <p className="text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} {t('footer.copyright')}
      </p>
    </footer>
  );
}
