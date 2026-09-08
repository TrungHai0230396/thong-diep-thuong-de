#!/usr/bin/env python3
"""Chuyển CSV v6 -> data/cards.json cho app."""
import csv, json, os, re, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "content/raw/100-thong-diep-thuong-de-v6.csv")
OUT = os.path.join(ROOT, "data/cards.json")

# Sửa lỗi chính tả / diễn đạt phát hiện trong nguồn (id -> (tìm, thay))
FIXES = {
    95: [("tử tế with mình", "tử tế với mình")],
}

def clean(s):
    return re.sub(r"\s+", " ", (s or "").strip())

cards, notes, seen, warn = [], [], {}, []
with open(SRC, encoding="utf-8-sig") as fh:
    for r in csv.DictReader(fh):
        if not (r.get("ID") or "").strip():
            continue
        cid = int(r["ID"])
        msg, mean = clean(r["Thông điệp"]), clean(r["Ý nghĩa"])
        for find, rep in FIXES.get(cid, []):
            msg = msg.replace(find, rep)
            mean = mean.replace(find, rep)
        if not msg.endswith((".", "!", "?", "…")):
            msg += "."
        if mean and not mean.endswith((".", "!", "?", "…")):
            mean += "."
        key = msg.lower()
        if key in seen:
            warn.append(f"#{cid} trùng thông điệp với #{seen[key]}")
        seen[key] = cid
        if not mean:
            warn.append(f"#{cid} thiếu Ý nghĩa")
        cards.append({"id": cid, "thong_diep": msg, "y_nghia": mean})
        notes.append({"id": cid, "co_che_game": clean(r.get("Cơ chế game", ""))})

cards.sort(key=lambda c: c["id"])
ids = [c["id"] for c in cards]
assert ids == list(range(1, len(cards) + 1)), f"ID không liên tục: {ids[:5]}..."
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(cards, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
NOTES = os.path.join(ROOT, "content/ghi-chu-co-che-game.json")
json.dump(notes, open(NOTES, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

L = [len(c["thong_diep"]) for c in cards]
print(f"✓ {len(cards)} lá -> data/cards.json")
print(f"  thông điệp: {min(L)}–{max(L)} ký tự (trung vị {sorted(L)[len(L)//2]})")
print(f"  ý nghĩa   : {min(len(c['y_nghia']) for c in cards)}–{max(len(c['y_nghia']) for c in cards)} ký tự")
print(f"  ghi chú cơ chế game -> content/ghi-chu-co-che-game.json (không nằm trong bundle app)")
print(f"  kích thước data/cards.json: {os.path.getsize(OUT)//1024} KB")
for w in warn:
    print("  ⚠", w)
