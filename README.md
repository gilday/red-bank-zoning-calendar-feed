# Red Bank Zoning Calendar Feed

An iCalendar feed of Red Bank, NJ Zoning Board of Adjustment and Planning Board meetings.

The borough lists these meetings in its "Main Calendar" alongside every other board, and its "Planning & Zoning" calendar is empty. A Cloudflare Worker fetches the Main Calendar feed, keeps the events whose title contains `zoning` or `planning board` (case-insensitive), and serves the result as `text/calendar`. Subscribe to the Worker URL in any calendar app.

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

- `src/filter.js` holds the filtering function and the upstream URL.
- `src/worker.js` is the Worker entry point. It fetches the feed, filters it, and responds.
- The Worker caches responses for an hour, so the borough site gets at most one request per hour per Cloudflare location.
- Matching uses the event title. If a board renames its meetings, change `DEFAULT_PATTERN`.
- If the borough starts listing these meetings in its Planning & Zoning calendar, subscribe to [that feed](https://redbanknj.org/common/modules/iCalendar/iCalendar.aspx?catID=33&feed=calendar) directly and retire this Worker.
