# AeroGuesser

Guess the airport from ground-level photos — curb, taxi rank, terminal interior.

## Play

```bash
npm install
npm run ingest   # builds public/data/airports.json from Wikimedia Commons
npm run dev
```

## How it works

1. See one photo
2. Guess via airport name / IATA autocomplete
3. **Reveal** up to 2 more photos (3 total) if stuck
4. **Skip** resets your streak
5. Fewer reveals = more miles; streaks hit bonuses at 5 / 10 / 20

Photos are hotlinked from Wikimedia Commons. Attribution (author, license, source) is stored at ingest and shown in-app.

## Airport bank

~50 major hubs in `public/data/airports.json`. Expand or refresh with:

```bash
npm run ingest                 # skip airports that already have ≥2 photos
node scripts/clean-bank.mjs    # drop known-bad titles and refill gaps
```
