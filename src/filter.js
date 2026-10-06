export const UPSTREAM_URL =
  "https://redbanknj.org/common/modules/iCalendar/iCalendar.aspx?catID=14&feed=calendar";

export const DEFAULT_PATTERN = /zoning/i;

const CALENDAR_NAME = "Red Bank Zoning Board";

export const DEFAULT_LOCATION = "90 Monmouth St, Red Bank, NJ";

function withLocation(event) {
  if (/^LOCATION[;:][ \t]*\S/m.test(event)) return event;
  const bare = event.replace(/^LOCATION[;:].*\r?\n/m, "");
  return bare.replace(/^END:VEVENT/m, `LOCATION:${DEFAULT_LOCATION}\r\n$&`);
}

export function filterIcs(ics, pattern = DEFAULT_PATTERN) {
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const parts = unfolded.split(/(?=BEGIN:VEVENT)|(?<=END:VEVENT\r?\n)/);
  const kept = parts.filter((part) => {
    if (!part.startsWith("BEGIN:VEVENT")) return true;
    const summary = /^SUMMARY:(.*)$/m.exec(part)?.[1] ?? "";
    return pattern.test(summary);
  });
  return kept
    .map((part) => (part.startsWith("BEGIN:VEVENT") ? withLocation(part) : part))
    .join("")
    .replace(/^PRODID:.*$/m, `$&\r\nX-WR-CALNAME:${CALENDAR_NAME}`);
}
