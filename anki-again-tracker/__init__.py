"""
Again Tracker
=============

Logs every card you answer "Again" on and compiles them so you can drill
practice problems on your weak spots.

Features
--------
* Automatic logging: every Again press is recorded (card, deck, tags, how
  many times, first/last time) to a JSON file in this addon's user_files
  folder, per profile. Nothing about your scheduling is changed.
* Tools -> Again Tracker...: a dialog listing the compiled cards with
  filters (last N days, minimum Again count), sortable columns, and:
    - Open in Browser        (inspect / re-study the exact cards)
    - Create Practice Deck   (filtered deck, reschedule OFF, so practicing
                              does not touch your real intervals)
    - Export CSV / Markdown  (take the list to UWorld, a notes app, etc.)
    - Remove Selected / Clear All
* Optional note tagging on every Again press (see config).

Requires Anki 2.1.45+.
"""

from __future__ import annotations

import csv
import json
import os
import time

from aqt import gui_hooks, mw
from aqt.qt import (
    QDialog,
    QFileDialog,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QPushButton,
    QSpinBox,
    Qt,
    QTableWidget,
    QTableWidgetItem,
    QVBoxLayout,
)
from aqt.utils import askUser, showInfo, tooltip

try:
    from anki.utils import strip_html
except ImportError:  # older Anki
    from anki.utils import stripHTML as strip_html

ADDON_DIR = os.path.dirname(__file__)
USER_FILES = os.path.join(ADDON_DIR, "user_files")

EASE_AGAIN = 1
CARD_TYPE_REVIEW = 2

# card id -> card type as it was when the question was shown, so we can tell
# whether an Again press happened on a review card (the answer mutates the
# card object before the did-answer hook fires)
_pre_answer_type: dict[int, int] = {}

# in-memory log cache: {str(card_id): entry-dict}
_log: dict | None = None


# ---------------------------------------------------------------------------
# storage
# ---------------------------------------------------------------------------

def _config() -> dict:
    return mw.addonManager.getConfig(__name__) or {}


def _log_path() -> str:
    os.makedirs(USER_FILES, exist_ok=True)
    profile = mw.pm.name if mw.pm and mw.pm.name else "default"
    safe = "".join(c if (c.isalnum() or c in "-_") else "_" for c in profile)
    return os.path.join(USER_FILES, f"again_log_{safe}.json")


def _load_log() -> dict:
    global _log
    if _log is not None:
        return _log
    path = _log_path()
    _log = {}
    if os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as f:
                _log = json.load(f)
        except Exception:
            # corrupt file: keep a backup rather than silently destroying it
            try:
                os.replace(path, path + ".corrupt")
            except OSError:
                pass
            _log = {}
    return _log


def _save_log() -> None:
    if _log is None:
        return
    path = _log_path()
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(_log, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def _reset_cache() -> None:
    global _log
    _save_log()
    _log = None
    _pre_answer_type.clear()


# ---------------------------------------------------------------------------
# logging Again presses
# ---------------------------------------------------------------------------

def _front_preview(note) -> str:
    if not note.fields:
        return ""
    text = strip_html(note.fields[0]).replace("\n", " ").strip()
    limit = int(_config().get("front_preview_chars", 300))
    return text[:limit]


def _on_show_question(card) -> None:
    _pre_answer_type[card.id] = card.type


def _on_answer(reviewer, card, ease: int) -> None:
    if ease != EASE_AGAIN:
        return

    cfg = _config()
    pre_type = _pre_answer_type.pop(card.id, card.type)
    if cfg.get("only_review_cards") and pre_type != CARD_TYPE_REVIEW:
        return

    try:
        note = card.note()
        deck_id = card.odid or card.did  # original deck if inside a filtered deck
        deck = mw.col.decks.name(deck_id)
        front = _front_preview(note)
        tags = list(note.tags)
    except Exception:
        return

    log = _load_log()
    now = int(time.time())
    key = str(card.id)
    entry = log.get(key)
    if entry is None:
        entry = {
            "cid": card.id,
            "nid": card.nid,
            "count": 0,
            "first": now,
        }
        log[key] = entry
    entry["count"] = int(entry.get("count", 0)) + 1
    entry["last"] = now
    entry["deck"] = deck
    entry["front"] = front
    entry["tags"] = tags
    _save_log()

    if cfg.get("tag_notes"):
        _tag_note(note, cfg.get("tag_name") or "again-tracker")


def _tag_note(note, tag: str) -> None:
    try:
        if note.has_tag(tag):
            return
        note.add_tag(tag)
    except AttributeError:  # older Anki
        if note.hasTag(tag):
            return
        note.addTag(tag)
    try:
        mw.col.update_note(note)
    except AttributeError:
        note.flush()


# ---------------------------------------------------------------------------
# actions on the compiled list
# ---------------------------------------------------------------------------

def _open_in_browser(cids: list[int]) -> None:
    if not cids:
        tooltip("Nothing to show.")
        return
    import aqt.dialogs

    query = "cid:" + ",".join(str(c) for c in cids)
    browser = aqt.dialogs.open("Browser", mw)
    try:
        browser.search_for(query)
    except AttributeError:
        browser.form.searchEdit.lineEdit().setText(query)
        browser.onSearchActivated()


def _create_practice_deck(cids: list[int]) -> None:
    """Build (or rebuild) a filtered deck from the given cards.

    reschedule is turned OFF so answering in the practice deck never touches
    the cards' real intervals — it is pure practice.
    """
    if not cids:
        tooltip("Nothing to practice.")
        return

    cfg = _config()
    name = cfg.get("practice_deck_name") or "Again Practice"
    limit = int(cfg.get("practice_deck_limit", 999))
    search = "cid:" + ",".join(str(c) for c in cids)

    deck_id = 0
    try:
        existing = mw.col.decks.id_for_name(name)
        if existing and mw.col.decks.is_filtered(existing):
            deck_id = existing
    except Exception:
        deck_id = 0

    try:
        deck = mw.col.sched.get_or_create_filtered_deck(deck_id=deck_id)
    except Exception as e:
        showInfo(
            "Could not create a filtered deck (this needs Anki 2.1.45 or "
            f"newer):\n{e}"
        )
        return

    deck.name = name
    deck.config.reschedule = False
    del deck.config.search_terms[:]
    term = deck.config.search_terms.add()
    term.search = search
    term.limit = limit
    term.order = 0  # oldest seen first

    try:
        mw.col.sched.add_or_update_filtered_deck(deck)
    except Exception as e:
        showInfo(
            "Could not build the practice deck. Note that suspended cards "
            f"and cards already in another filtered deck are excluded.\n\n{e}"
        )
        return

    mw.reset()
    tooltip(f"Practice deck “{name}” ready.")


def _fmt_ts(ts) -> str:
    try:
        return time.strftime("%Y-%m-%d %H:%M", time.localtime(int(ts)))
    except Exception:
        return ""


def _export_rows(rows: list[dict], path: str, markdown: bool) -> None:
    if markdown:
        lines = [
            "# Again Tracker — cards to practice",
            "",
            "| # Again | Card | Deck | Tags | Last pressed |",
            "|---:|---|---|---|---|",
        ]
        for r in rows:
            front = r["front"].replace("|", "\\|")
            lines.append(
                f"| {r['count']} | {front} | {r['deck']} "
                f"| {' '.join(r['tags'])} | {_fmt_ts(r['last'])} |"
            )
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
    else:
        with open(path, "w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(
                ["card_id", "note_id", "front", "deck", "tags",
                 "again_count", "first_pressed", "last_pressed"]
            )
            for r in rows:
                w.writerow(
                    [r["cid"], r["nid"], r["front"], r["deck"],
                     " ".join(r["tags"]), r["count"],
                     _fmt_ts(r["first"]), _fmt_ts(r["last"])]
                )


# ---------------------------------------------------------------------------
# dialog
# ---------------------------------------------------------------------------

COLUMNS = ["Card (front)", "Deck", "Tags", "# Again", "Last pressed", "First pressed"]


class AgainTrackerDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent or mw)
        self.setWindowTitle("Again Tracker")
        self.resize(950, 550)
        self._rows: list[dict] = []

        root = QVBoxLayout(self)

        # --- filter bar -----------------------------------------------------
        bar = QHBoxLayout()
        bar.addWidget(QLabel("Last"))
        self.days = QSpinBox()
        self.days.setRange(0, 3650)
        self.days.setValue(0)
        self.days.setSpecialValueText("all")
        self.days.setSuffix(" days")
        bar.addWidget(self.days)

        bar.addSpacing(16)
        bar.addWidget(QLabel("Min # Again"))
        self.min_count = QSpinBox()
        self.min_count.setRange(1, 999)
        self.min_count.setValue(1)
        bar.addWidget(self.min_count)

        refresh = QPushButton("Refresh")
        refresh.clicked.connect(self.reload)
        bar.addWidget(refresh)

        bar.addStretch()
        self.summary = QLabel("")
        bar.addWidget(self.summary)
        root.addLayout(bar)

        # --- table ----------------------------------------------------------
        self.table = QTableWidget(0, len(COLUMNS))
        self.table.setHorizontalHeaderLabels(COLUMNS)
        self.table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableWidget.SelectionMode.ExtendedSelection)
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        for col in range(1, len(COLUMNS)):
            header.setSectionResizeMode(col, QHeaderView.ResizeMode.ResizeToContents)
        self.table.setSortingEnabled(True)
        self.table.itemDoubleClicked.connect(self._on_double_click)
        root.addWidget(self.table)

        # --- buttons ---------------------------------------------------------
        btns = QHBoxLayout()

        b_browser = QPushButton("Open in Browser")
        b_browser.setToolTip("Open the selected cards (or all listed) in Anki's browser.")
        b_browser.clicked.connect(lambda: _open_in_browser(self._target_cids()))
        btns.addWidget(b_browser)

        b_deck = QPushButton("Create Practice Deck")
        b_deck.setToolTip(
            "Build a filtered deck from the selected cards (or all listed).\n"
            "Rescheduling is OFF: practicing there won't change real intervals."
        )
        b_deck.clicked.connect(lambda: _create_practice_deck(self._target_cids()))
        btns.addWidget(b_deck)

        b_csv = QPushButton("Export CSV")
        b_csv.clicked.connect(lambda: self._export(markdown=False))
        btns.addWidget(b_csv)

        b_md = QPushButton("Export Markdown")
        b_md.clicked.connect(lambda: self._export(markdown=True))
        btns.addWidget(b_md)

        btns.addStretch()

        b_remove = QPushButton("Remove Selected")
        b_remove.clicked.connect(self._remove_selected)
        btns.addWidget(b_remove)

        b_clear = QPushButton("Clear All")
        b_clear.clicked.connect(self._clear_all)
        btns.addWidget(b_clear)

        b_close = QPushButton("Close")
        b_close.clicked.connect(self.accept)
        btns.addWidget(b_close)
        root.addLayout(btns)

        self.days.valueChanged.connect(self.reload)
        self.min_count.valueChanged.connect(self.reload)
        self.reload()

    # -- data ---------------------------------------------------------------

    def _visible_entries(self) -> list[dict]:
        log = _load_log()
        days = self.days.value()
        min_count = self.min_count.value()
        cutoff = int(time.time()) - days * 86400 if days else 0
        rows = []
        for entry in log.values():
            if int(entry.get("count", 0)) < min_count:
                continue
            if cutoff and int(entry.get("last", 0)) < cutoff:
                continue
            rows.append(entry)
        rows.sort(key=lambda e: (-int(e.get("count", 0)), -int(e.get("last", 0))))
        return rows

    def reload(self) -> None:
        self._rows = self._visible_entries()
        self.table.setSortingEnabled(False)
        self.table.setRowCount(len(self._rows))
        for i, e in enumerate(self._rows):
            front = QTableWidgetItem(e.get("front", ""))
            front.setData(Qt.ItemDataRole.UserRole, int(e["cid"]))
            self.table.setItem(i, 0, front)
            self.table.setItem(i, 1, QTableWidgetItem(e.get("deck", "")))
            self.table.setItem(i, 2, QTableWidgetItem(" ".join(e.get("tags", []))))
            count = QTableWidgetItem()
            count.setData(Qt.ItemDataRole.DisplayRole, int(e.get("count", 0)))
            self.table.setItem(i, 3, count)
            self.table.setItem(i, 4, QTableWidgetItem(_fmt_ts(e.get("last"))))
            self.table.setItem(i, 5, QTableWidgetItem(_fmt_ts(e.get("first"))))
        self.table.setSortingEnabled(True)
        total = sum(int(e.get("count", 0)) for e in self._rows)
        self.summary.setText(f"{len(self._rows)} cards · {total} Again presses")

    # -- helpers ------------------------------------------------------------

    def _selected_cids(self) -> list[int]:
        cids = []
        for index in self.table.selectionModel().selectedRows():
            item = self.table.item(index.row(), 0)
            if item is not None:
                cids.append(int(item.data(Qt.ItemDataRole.UserRole)))
        return cids

    def _target_cids(self) -> list[int]:
        """Selected cards if any are selected, otherwise everything listed."""
        return self._selected_cids() or [int(e["cid"]) for e in self._rows]

    def _on_double_click(self, item) -> None:
        row_item = self.table.item(item.row(), 0)
        if row_item is not None:
            _open_in_browser([int(row_item.data(Qt.ItemDataRole.UserRole))])

    # -- button handlers ------------------------------------------------------

    def _export(self, markdown: bool) -> None:
        if not self._rows:
            tooltip("Nothing to export.")
            return
        ext = "md" if markdown else "csv"
        path, _ = QFileDialog.getSaveFileName(
            self, "Export Again list", f"again-cards.{ext}",
            f"{ext.upper()} files (*.{ext})"
        )
        if not path:
            return
        _export_rows(self._rows, path, markdown)
        tooltip(f"Exported {len(self._rows)} cards.")

    def _remove_selected(self) -> None:
        cids = self._selected_cids()
        if not cids:
            tooltip("Select some rows first.")
            return
        log = _load_log()
        for cid in cids:
            log.pop(str(cid), None)
        _save_log()
        self.reload()

    def _clear_all(self) -> None:
        if not askUser("Delete the entire Again log? This cannot be undone."):
            return
        log = _load_log()
        log.clear()
        _save_log()
        self.reload()


# ---------------------------------------------------------------------------
# wiring
# ---------------------------------------------------------------------------

def _show_dialog() -> None:
    if mw.col is None:
        showInfo("Open a profile first.")
        return
    AgainTrackerDialog(mw).exec()


def _setup_menu() -> None:
    action = mw.form.menuTools.addAction("Again Tracker…")
    action.triggered.connect(_show_dialog)


gui_hooks.reviewer_did_show_question.append(_on_show_question)
gui_hooks.reviewer_did_answer_card.append(_on_answer)
gui_hooks.profile_will_close.append(_reset_cache)
gui_hooks.main_window_did_init.append(_setup_menu)
