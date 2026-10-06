import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/worker.js";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("serves the filtered feed as text/calendar", async () => {
  const upstream = [
    "BEGIN:VCALENDAR",
    "PRODID:x",
    "BEGIN:VEVENT",
    "SUMMARY:Zoning Board of Adjustment Meeting",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "SUMMARY:Municipal Council Meeting",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  globalThis.fetch = async () => new Response(upstream);

  const res = await worker.fetch(new Request("https://feed.example/"));

  assert.equal(res.status, 200);
  assert.match(res.headers.get("Content-Type"), /^text\/calendar/);
  const body = await res.text();
  assert.match(body, /Zoning Board/);
  assert.doesNotMatch(body, /Municipal Council/);
});

test("returns 502 when the borough site fails", async () => {
  globalThis.fetch = async () => new Response("nope", { status: 500 });
  const res = await worker.fetch(new Request("https://feed.example/"));
  assert.equal(res.status, 502);
});

test("redirects /subscribe to a webcal URL for the same host", async () => {
  globalThis.fetch = async () => {
    throw new Error("must not call upstream");
  };
  const res = await worker.fetch(new Request("https://feed.example/subscribe"));
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("Location"), "webcal://feed.example/");
});
