# AeroGuesser

Guess the airport from ground-level photos — curb, taxi rank, or terminal interior. No aerial shots, no runway silhouettes, no airport codes in the picture.

**Play:** [guess-the-airport.vercel.app](https://guess-the-airport.vercel.app)

## How to play

1. You see one photo of an airport.
2. Type a guess (airport name, city, or IATA code) using autocomplete.
3. Stuck? Reveal up to two more photos of the same airport (three total).
4. Skip if you need to move on — that resets your streak.
5. Fewer reveals earn more miles. Streak bonuses kick in at 5, 10, and 20 correct in a row.

A session is a short run of rounds. Miles and best streak stay on your device.

## Photos and licensing

All photos originate from [Wikimedia Commons](https://commons.wikimedia.org/). Copies are stored under `public/images/` and served from this app (not hotlinked from Commons at play time).

Each image is used under the license chosen by its uploader. That is usually one of:

- Creative Commons Attribution (CC BY)
- Creative Commons Attribution-ShareAlike (CC BY-SA)
- CC0 / public domain
- Other free licenses Commons accepts

For every photo shown, the game displays:

- Title (with a link back to the Commons file page)
- Author / photographer credit
- License name

That credit appears in the app so photographers and license terms stay visible while you play. If you reuse a photo elsewhere, follow the license on its Commons file page (credit the author, link the license, and share-alike when the license requires it).

This project does not claim ownership of the photographs.

### Refreshing the image bank

```bash
npm run ingest          # discover + download new airports (skips those with ≥2 photos)
npm run mirror-images   # download any remaining remote thumbs into public/images/
```
