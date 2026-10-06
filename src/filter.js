export const UPSTREAM_URL =
  "https://redbanknj.org/common/modules/iCalendar/iCalendar.aspx?catID=14&feed=calendar";

export const DEFAULT_PATTERN = /zoning|planning board/i;

const CALENDAR_NAME = "Red Bank Zoning & Planning";

export function filterIcs(ics, pattern = DEFAULT_PATTERN) {
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const parts = unfolded.split(/(?=BEGIN:VEVENT)|(?<=END:VEVENT\r?\n)/);
  const kept = parts.filter((part) => {
    if (!part.startsWith("BEGIN:VEVENT")) return true;
    const summary = /^SUMMARY:(.*)$/m.exec(part)?.[1] ?? "";
    return pattern.test(summary);
  });
  return kept
    .join("")
    .replace(/^PRODID:.*$/m, `$&\r\nX-WR-CALNAME:${CALENDAR_NAME}`);
}
