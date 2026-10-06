import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LOCATION, filterIcs } from "../src/filter.js";

const event = (uid, summary) =>
  ["BEGIN:VEVENT", `UID:${uid}`, `SUMMARY:${summary}`, "END:VEVENT"].join("\r\n");

const calendar = (...events) =>
  [
    "BEGIN:VCALENDAR",
    "PRODID:iCalendar-Ruby",
    "VERSION:2.0",
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "END:VTIMEZONE",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");

const summaries = (ics) => [...ics.matchAll(/^SUMMARY:(.*)$/gm)].map((m) => m[1].trim());

test("keeps zoning board meetings and drops planning board meetings", () => {
  const out = filterIcs(
    calendar(
      event(1, "Zoning Board of Adjustment Meeting"),
      event(2, "Planning Board Meeting"),
    ),
  );
  assert.deepEqual(summaries(out), ["Zoning Board of Adjustment Meeting"]);
});

test("drops other boards and holidays", () => {
  const out = filterIcs(
    calendar(
      event(1, "Municipal Council Meeting"),
      event(2, "Zoning Board of Adjustment Meeting"),
      event(3, "Veterans Day - Borough Offices Closed"),
    ),
  );
  assert.deepEqual(summaries(out), ["Zoning Board of Adjustment Meeting"]);
});

test("matches case-insensitively", () => {
  const out = filterIcs(calendar(event(1, "ZONING BOARD special session")));
  assert.equal(summaries(out).length, 1);
});

test("keeps the calendar wrapper and timezone definition", () => {
  const out = filterIcs(calendar(event(1, "Municipal Council Meeting")));
  assert.match(out, /^BEGIN:VCALENDAR/);
  assert.match(out, /BEGIN:VTIMEZONE[\s\S]*END:VTIMEZONE/);
  assert.match(out, /END:VCALENDAR\r\n$/);
  assert.deepEqual(summaries(out), []);
});

test("names the calendar", () => {
  const out = filterIcs(calendar(event(1, "Zoning Board of Adjustment Meeting")));
  assert.match(out, /^X-WR-CALNAME:Red Bank Zoning Board$/m);
});

test("unfolds a summary wrapped across lines before matching", () => {
  const folded = [
    "BEGIN:VEVENT",
    "UID:1",
    "SUMMARY:Zoning Board of Adjust",
    " ment Meeting",
    "END:VEVENT",
  ].join("\r\n");
  const out = filterIcs(calendar(folded));
  assert.deepEqual(summaries(out), ["Zoning Board of Adjustment Meeting"]);
});

test("accepts a custom pattern", () => {
  const out = filterIcs(
    calendar(event(1, "Rent Leveling Board"), event(2, "Planning Board Meeting")),
    /rent leveling/i,
  );
  assert.deepEqual(summaries(out), ["Rent Leveling Board"]);
});

const locations = (ics) => [...ics.matchAll(/^LOCATION:(.*)$/gm)].map((m) => m[1].trim());

test("fills in the default location when an event has none", () => {
  const out = filterIcs(calendar(event(1, "Zoning Board of Adjustment Meeting")));
  assert.deepEqual(locations(out), [DEFAULT_LOCATION]);
});

test("fills in the default location when the upstream location is empty", () => {
  const blank = [
    "BEGIN:VEVENT",
    "UID:1",
    "SUMMARY:Zoning Board Meeting",
    "LOCATION:",
    "END:VEVENT",
  ].join("\r\n");
  assert.deepEqual(locations(filterIcs(calendar(blank))), [DEFAULT_LOCATION]);
});

test("prefers the upstream location, including when folded", () => {
  const folded = [
    "BEGIN:VEVENT",
    "UID:1",
    "SUMMARY:Zoning Board Meeting",
    "LOCATION:Council Cham",
    " bers",
    "END:VEVENT",
  ].join("\r\n");
  assert.deepEqual(locations(filterIcs(calendar(folded))), ["Council Chambers"]);
});
