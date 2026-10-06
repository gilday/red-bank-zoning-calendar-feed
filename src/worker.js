import { UPSTREAM_URL, filterIcs } from "./filter.js";

export default {
  async fetch() {
    const upstream = await fetch(UPSTREAM_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!upstream.ok) {
      return new Response("upstream error", { status: 502 });
    }
    return new Response(filterIcs(await upstream.text()), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
};
