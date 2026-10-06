default:
    @just --list

test:
    npm test

dev:
    wrangler dev

deploy: test
    wrangler deploy

# Run the filter against the live borough feed and list the events it keeps
live:
    curl -sL -A "Mozilla/5.0" "https://redbanknj.org/common/modules/iCalendar/iCalendar.aspx?catID=14&feed=calendar" \
      | node --input-type=module -e 'import { filterIcs } from "./src/filter.js"; let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(filterIcs(s)))' \
      | grep -E '^(SUMMARY|DTSTART)'
