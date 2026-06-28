# cron-expression-parser

Parse, validate, describe, and schedule standard 5-field cron expressions.

## Features

- Parse standard 5-field cron expressions (minute, hour, day-of-month, month, day-of-week)
- Validate syntax and value ranges
- Convert expressions to human-readable descriptions
- Calculate next N run times from any starting point
- Supports ranges, steps, lists, wildcards, and day/month name aliases
- Usable as both CLI tool and importable library

## Installation

```bash
npm install
npm run build
```

## CLI Usage

```bash
# Parse and describe an expression
npx cron-parser "0 9 * * 1-5"
# Output: At 9:00 AM, on Monday, Tuesday, Wednesday, Thursday, Friday

# Show next 10 run times
npx cron-parser "*/15 * * * *" --next 10

# Validate only
npx cron-parser "0 0 1 * *" --validate
```

## Library Usage

```typescript
import { parseCron, validateCron, describeCron, getNextRunTimes } from "cron-expression-parser";

// Validate
const result = validateCron("0 9 * * 1-5");
console.log(result.valid); // true

// Parse
const parsed = parseCron("0 9 * * 1-5");
console.log(parsed.hour.values); // [9]

// Describe
const description = describeCron(parsed);
console.log(description); // "At 9:00 AM, on Monday, Tuesday, ..."

// Next runs
const nextRuns = getNextRunTimes(parsed, 5);
nextRuns.forEach(date => console.log(date.toISOString()));
```

## Cron Expression Format

```
* * * * *
| | | | |
| | | | +-- Day of week (0-6, Sun-Sat)
| | | +---- Month (1-12, Jan-Dec)
| | +------ Day of month (1-31)
| +-------- Hour (0-23)
+---------- Minute (0-59)
```



<sub><sup>Originally developed and tested locally during learning. Later organized and pushed to GitHub for portfolio visibility.</sup></sub>
