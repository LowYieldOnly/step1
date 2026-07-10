# Again Tracker — configuration

- **only_review_cards** (default `false`): when `true`, only "Again" presses on
  cards that were in the *review* state (graduated cards you lapsed on) are
  logged. New/learning/relearning presses are ignored.

- **tag_notes** (default `false`): when `true`, the note is tagged with
  `tag_name` every time you press Again, so you can find these notes with a
  plain tag search or build your own filtered decks. Note: tagging modifies
  the note, which shows up in sync.

- **tag_name** (default `"again-tracker"`): the tag applied when `tag_notes`
  is enabled.

- **practice_deck_name** (default `"Again Practice"`): the name of the
  filtered deck created by the "Create Practice Deck" button. If a filtered
  deck with this name already exists it is reused and rebuilt.

- **practice_deck_limit** (default `999`): maximum number of cards pulled into
  the practice deck.

- **front_preview_chars** (default `300`): how many characters of the card's
  first field are stored in the log as a preview.
