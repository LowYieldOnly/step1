# Again Tracker — Anki addon

Every time you press **Again (1)** in the reviewer, this addon quietly logs the
card. Over time you get a compiled list of your weakest cards — the ones worth
doing practice problems on — without changing anything about your scheduling.

## What you get

Open **Tools → Again Tracker…** to see the compiled list:

- Every card you've pressed Again on, with deck, tags, how many times, and
  when (first/last). Sortable columns; filter by "last N days" and
  "minimum Again count".
- **Open in Browser** — jump to the exact cards in Anki's card browser
  (double-clicking a row does this for one card).
- **Create Practice Deck** — builds a filtered deck (default name
  `Again Practice`) from the selected cards (or all listed). Rescheduling is
  **off**, so drilling that deck never touches the cards' real intervals —
  it's pure practice.
- **Export CSV / Export Markdown** — take the list elsewhere, e.g. to pick
  UWorld/practice-question topics or paste into a notes app.
- **Remove Selected / Clear All** — prune the log once you've mastered
  something.

Buttons act on the **selected rows**, or on **everything currently listed**
if nothing is selected.

## Install

Requires Anki **2.1.45 or newer**.

**Option A — .ankiaddon file:** run `./build.sh` (or zip the contents of this
folder — not the folder itself — and rename the zip to
`again-tracker.ankiaddon`), then in Anki: *Tools → Add-ons → Install from
file…* and pick it.

**Option B — copy the folder:** in Anki, *Tools → Add-ons → View Files* to
open your `addons21` directory, then copy this folder into it (name the copy
`again_tracker`). Restart Anki.

## Configuration

*Tools → Add-ons → Again Tracker → Config.* Options (details in
[config.md](config.md)):

| option | default | meaning |
|---|---|---|
| `only_review_cards` | `false` | only log lapses on graduated (review) cards, ignore new/learning |
| `tag_notes` | `false` | also tag the note on every Again press |
| `tag_name` | `again-tracker` | the tag used when `tag_notes` is on |
| `practice_deck_name` | `Again Practice` | name of the generated filtered deck |
| `practice_deck_limit` | `999` | max cards pulled into the practice deck |
| `front_preview_chars` | `300` | preview length stored per card |

## Notes & limitations

- The log lives in `user_files/again_log_<profile>.json` inside the addon
  folder (one file per Anki profile). It survives addon updates. Delete it or
  use **Clear All** to start fresh.
- The log records what you actually pressed; undoing a review in Anki does
  not remove the log entry (use **Remove Selected** if you care).
- Filtered decks can't pull in suspended cards or cards already in another
  filtered deck — Anki excludes those from the practice deck.
- Deck/tag/preview info shown is a snapshot from the last time you pressed
  Again on that card; cards you've since deleted simply won't match when
  opening the browser or building the practice deck.
