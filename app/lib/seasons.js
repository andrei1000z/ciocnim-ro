import { getOrthodoxEaster } from "./easterUtils";

export function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const easter = getOrthodoxEaster(year);
  const easterEnd = new Date(easter);
  easterEnd.setDate(easterEnd.getDate() + 7);

  const prevEaster = getOrthodoxEaster(year - 1);
  const prevEnd = new Date(prevEaster);
  prevEnd.setDate(prevEnd.getDate() + 7);

  // Season runs from 2 weeks before Easter to 1 week after
  const seasonStart = new Date(easter);
  seasonStart.setDate(seasonStart.getDate() - 14);

  const isActive = now >= seasonStart && now <= easterEnd;

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
      : now < seasonStart
        ? `Începe pe ${formatDate(seasonStart)}`
        : "Sezon Încheiat",
  };
}
