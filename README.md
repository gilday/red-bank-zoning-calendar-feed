# Red Bank Zoning Calendar Feed

An iCalendar feed of Red Bank, NJ Zoning Board of Adjustment and Planning Board meetings.

The borough files these meetings under its "Main Calendar" category (`catID=14`) alongside every other board, and the "Planning & Zoning" category (`catID=33`) is empty. A Cloudflare Worker fetches the Main Calendar feed, keeps the events whose summary matches `zoning` or `planning board` (case-insensitive), and serves the result as `text/calendar`. Subscribe to the Worker URL in any calendar app.

## Usage

Requires [Node](https://nodejs.org), [just](https://just.systems), and [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged in to Cloudflare.

```
just test     # run the unit tests
just live     # filter the live borough feed and list the events kept
just dev      # serve the Worker locally
just deploy   # run tests, then deploy to Cloudflare
```

After `just deploy`, Wrangler prints the `*.workers.dev` URL. Add it as a calendar subscription (Apple Calendar: File → New Calendar Subscription).

## Design

- `src/filter.js` holds the pure filtering function and the upstream URL.
- `src/worker.js` is the Worker entry point; it fetches, filters, and responds.
- Responses are cached for an hour, so the borough site sees at most one request per hour per Cloudflare location.
- Matching is by event title. A board that renames its meetings needs a change to `DEFAULT_PATTERN`.
- If the borough moves these meetings into the Planning & Zoning category, subscribe to `https://redbanknj.org/common/modules/iCalendar/iCalendar.aspx?catID=33&feed=calendar` directly and retire this Worker.
