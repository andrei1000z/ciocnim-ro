import { getOrthodoxEaster } from "./easterUtils";

export function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const easter = getOrthodoxEaster(year);
  const easterEnd = new Date(easter);
  easterEnd.setDate(easterEnd.getDate() + 7);

  const seasonStart = new Date(easter);
  seasonStart.setDate(seasonStart.getDate() - 14);

  const isActive = now >= seasonStart && now <= easterEnd;

  // If season ended, show next year's season
  if (now > easterEnd) {
    const nextYear = year + 1;
    const nextEaster = getOrthodoxEaster(nextYear);
    const nextStart = new Date(nextEaster);
    nextStart.setDate(nextStart.getDate() - 14);

    const formatDate = (d) =>
      d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

    return {
      name: `Paște ${nextYear}`,
      year: nextYear,
      start: nextStart,
      end: new Date(nextEaster.getTime() + 7 * 86400000),
      easterDate: nextEaster,
      isActive: false,
      label: `Începe pe ${formatDate(nextStart)}`,
    };
  }

  const formatDate = (d) =>
    d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

  return {
    name: `Paște ${year}`,
    year,
    start: seasonStart,
    end: easterEnd,
    easterDate: easter,
    isActive,
    label: isActive
      ? "Sezon Activ"
      : `Începe pe ${formatDate(seasonStart)}`,
  };
}
