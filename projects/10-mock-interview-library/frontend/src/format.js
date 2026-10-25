// Small display helpers shared by the pages.

// "2026-10-25" → "25.10.2026"
export function formatDate(isoDate) {
  return isoDate.split("-").reverse().join(".");
}
