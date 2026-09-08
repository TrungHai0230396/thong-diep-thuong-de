#!/usr/bin/env python3
"""Kiểm tra nội dung lá bài trong content/cards/*.json theo chuẩn dự án.
Dùng:  python3 scripts/validate-cards.py            # kiểm tra tất cả file
       python3 scripts/validate-cards.py content/cards/nhat-the.json   # chỉ báo lỗi của file này (vẫn đối chiếu chéo với các file khác)
Exit code 1 nếu có lỗi (FAIL). WARN không làm fail.
"""
import json, re, sys, glob, os, math, difflib, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = {c["id"]: c for c in json.load(open(os.path.join(ROOT, "content/raw/cards-raw.json"), encoding="utf-8"))}
CONTEXTS = {"cong-viec","tien-bac","gia-dinh","moi-quan-he","suc-khoe","sang-tao-hoc-tap","cong-dong","thien-nhien","noi-tam","thoi-gian-lich-trinh"}
FORBIDDEN = ["Kiên", "{MSG}", "sinh hóa", "sinh hoá", "HEBs"]
REQ = {"id": int, "topic": str, "tieu_de": str, "thong_diep": str, "loi_giang": str, "hanh_dong": str,
       "cau_hoi": str, "khang_dinh": str, "tu_khoa": list, "boi_canh": str}

def sentences(s):
    return [x.strip() for x in re.split(r"(?<=[.!?…])\s+", s.strip()) if x.strip()]

def words(s): return len(s.split())

def contains_run(hay, needle, n=7):
    """True nếu 'hay' chứa một đoạn >= n từ liên tiếp của 'needle'."""
    w = needle.split()
    for i in range(0, max(1, len(w) - n + 1)):
        if " ".join(w[i:i+n]) in hay: return True
    return False

targets = sys.argv[1:] or sorted(glob.glob(os.path.join(ROOT, "content/cards/*.json")))
targets = [os.path.abspath(t) for t in targets]
all_files = sorted(glob.glob(os.path.join(ROOT, "content/cards/*.json")))
cards_by_file, problems = {}, collections.defaultdict(list)

for f in all_files:
    try:
        data = json.load(open(f, encoding="utf-8"))
        assert isinstance(data, list)
        cards_by_file[f] = data
    except Exception as e:
        problems[f].append(("FAIL", None, f"JSON không hợp lệ hoặc không phải mảng: {e}"))
        cards_by_file[f] = []

def add(f, level, cid, msg): problems[f].append((level, cid, msg))

# ---- kiểm tra từng file ----
for f, cards in cards_by_file.items():
    slug = os.path.splitext(os.path.basename(f))[0]
    expected_ids = {cid for cid, c in RAW.items() if c["topic"] == slug}
    got_ids = [c.get("id") for c in cards if isinstance(c, dict)]
    if set(got_ids) != expected_ids:
        add(f, "FAIL", None, f"Tập ID không khớp raw. Thiếu: {sorted(expected_ids-set(got_ids))} Thừa: {sorted(set(got_ids)-expected_ids)}")
    if len(got_ids) != len(set(got_ids)): add(f, "FAIL", None, "ID trùng trong file")
    ctx_count = collections.Counter(); sleepish = 0
    for c in cards:
        if not isinstance(c, dict): add(f, "FAIL", None, "Phần tử không phải object"); continue
        cid = c.get("id")
        for k, t in REQ.items():
            if k not in c: add(f, "FAIL", cid, f"thiếu trường '{k}'")
            elif not isinstance(c[k], t): add(f, "FAIL", cid, f"trường '{k}' sai kiểu (cần {t.__name__})")
        if any(k not in c or not isinstance(c[k], REQ[k]) for k in REQ): continue
        raw = RAW.get(cid)
        if raw is None: continue
        if c["topic"] != slug: add(f, "FAIL", cid, f"topic '{c['topic']}' khác tên file '{slug}'")
        if c["thong_diep"] != raw["thong_diep"]: add(f, "FAIL", cid, "thong_diep KHÔNG giữ nguyên văn so với CSV gốc")
        td = c["tieu_de"].strip()
        if not (2 <= words(td) <= 5) or len(td) > 34: add(f, "FAIL", cid, f"tieu_de phải 2–5 từ, ≤34 ký tự (hiện {words(td)} từ, {len(td)} ký tự)")
        if td.endswith((".", "!", "?")): add(f, "FAIL", cid, "tieu_de không kết thúc bằng dấu câu")
        lg = c["loi_giang"].strip(); n_lg = len(sentences(lg))
        if not (150 <= len(lg) <= 340): add(f, "FAIL", cid, f"loi_giang phải 150–340 ký tự (hiện {len(lg)})")
        if not (2 <= n_lg <= 3): add(f, "FAIL", cid, f"loi_giang phải 2–3 câu (hiện {n_lg})")
        hd = c["hanh_dong"].strip(); n_hd = len(sentences(hd))
        if not (90 <= len(hd) <= 240): add(f, "FAIL", cid, f"hanh_dong phải 90–240 ký tự (hiện {len(hd)})")
        if not (1 <= n_hd <= 2): add(f, "FAIL", cid, f"hanh_dong phải 1–2 câu (hiện {n_hd})")
        ch = c["cau_hoi"].strip()
        if not (40 <= len(ch) <= 170): add(f, "FAIL", cid, f"cau_hoi phải 40–170 ký tự (hiện {len(ch)})")
        if not ch.endswith("?"): add(f, "FAIL", cid, "cau_hoi phải kết thúc bằng '?'")
        if len(sentences(ch)) != 1: add(f, "FAIL", cid, "cau_hoi chỉ 1 câu")
        kd = c["khang_dinh"].strip()
        if not (30 <= len(kd) <= 150): add(f, "FAIL", cid, f"khang_dinh phải 30–150 ký tự (hiện {len(kd)})")
        if not kd.startswith("Tôi"): add(f, "FAIL", cid, "khang_dinh phải bắt đầu bằng 'Tôi'")
        if len(sentences(kd)) != 1: add(f, "FAIL", cid, "khang_dinh chỉ 1 câu")
        tk = c["tu_khoa"]
        if not (2 <= len(tk) <= 3) or any(not isinstance(x, str) or not (1 <= words(x) <= 3) for x in tk):
            add(f, "FAIL", cid, "tu_khoa phải là 2–3 chuỗi, mỗi chuỗi 1–3 từ")
        if any(x != x.lower() for x in tk if isinstance(x, str)): add(f, "WARN", cid, "tu_khoa nên viết thường")
        if c["boi_canh"] not in CONTEXTS: add(f, "FAIL", cid, f"boi_canh '{c['boi_canh']}' không thuộc {sorted(CONTEXTS)}")
        ctx_count[c["boi_canh"]] += 1
        for fld in ("loi_giang", "hanh_dong", "cau_hoi", "khang_dinh"):
            if contains_run(c[fld], raw["thong_diep"]): add(f, "FAIL", cid, f"{fld} trích lại nguyên văn (≥7 từ liên tiếp) thong_diep")
        blob = " ".join(str(c[k]) for k in ("tieu_de", "loi_giang", "hanh_dong", "cau_hoi", "khang_dinh"))
        for bad in FORBIDDEN:
            if bad in blob: add(f, "FAIL", cid, f"chứa chuỗi cấm '{bad}'")
        if re.search(r"\b(ngủ|mệt mỏi|lo âu|mất ngủ)\b", hd, re.I): sleepish += 1
        if re.search(r"[A-Za-z]{4,}", re.sub(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", "", blob.lower())) and re.search(r"\b(the|and|you|your|with|game|level|gauge|karma)\b", blob.lower()):
            add(f, "WARN", cid, "có vẻ lọt từ tiếng Anh trong nội dung hiển thị")
    n = len(cards)
    if n:
        cap = max(2, math.ceil(n * 0.35))
        for ctx, k in ctx_count.items():
            if k > cap: add(f, "FAIL", None, f"boi_canh '{ctx}' dùng {k}/{n} lá, vượt mức tối đa {cap} — cần đa dạng hoá")
        if n >= 5 and sleepish / n > 0.3: add(f, "FAIL", None, f"{sleepish}/{n} hanh_dong xoay quanh ngủ/mệt/lo âu — quá lệch một hoàn cảnh")

# ---- kiểm tra chéo toàn bộ ----
allc = [(f, c) for f, cs in cards_by_file.items() for c in cs if isinstance(c, dict) and all(k in c for k in REQ)]
titles = collections.defaultdict(list)
for f, c in allc: titles[c["tieu_de"].strip().lower()].append((f, c["id"]))
for t, lst in titles.items():
    if len(lst) > 1:
        for f, cid in lst: add(f, "FAIL", cid, f"tieu_de '{t}' trùng với lá {[x[1] for x in lst if x[1] != cid]}")
sent_map = collections.defaultdict(list)
for f, c in allc:
    for fld in ("loi_giang", "hanh_dong", "cau_hoi", "khang_dinh"):
        for s in sentences(c[fld]):
            if len(s) >= 40: sent_map[s.lower()].append((f, c["id"], fld))
for s, lst in sent_map.items():
    if len({x[1] for x in lst}) > 1:
        for f, cid, fld in lst: add(f, "FAIL", cid, f"câu trong {fld} lặp lại y nguyên ở lá {[x[1] for x in lst if x[1] != cid]}: “{s[:60]}…”")
for i in range(len(allc)):
    for j in range(i + 1, len(allc)):
        (fa, a), (fb, b) = allc[i], allc[j]
        for fld in ("loi_giang", "hanh_dong"):
            r = difflib.SequenceMatcher(None, a[fld].lower(), b[fld].lower()).ratio()
            if r > 0.72:
                add(fa, "FAIL", a["id"], f"{fld} quá giống lá {b['id']} (độ giống {r:.2f}) — viết lại cho khác hẳn")
                add(fb, "FAIL", b["id"], f"{fld} quá giống lá {a['id']} (độ giống {r:.2f}) — viết lại cho khác hẳn")

# ---- báo cáo ----
fails = 0
for f in sorted(set(list(cards_by_file) + list(problems))):
    if f not in targets: continue
    items = problems.get(f, [])
    nf = sum(1 for lv, _, _ in items if lv == "FAIL")
    print(f"\n== {os.path.relpath(f, ROOT)}  ({len(cards_by_file.get(f, []))} lá)  FAIL={nf} WARN={len(items)-nf}")
    for lv, cid, msg in items:
        print(f"  [{lv}] {'#'+str(cid) if cid is not None else '(file)'}: {msg}")
    fails += nf
total = sum(len(v) for v in cards_by_file.values())
print(f"\nTổng lá đã có: {total}/100 — {'ĐẠT' if fails == 0 else 'CHƯA ĐẠT (' + str(fails) + ' lỗi)'}")
sys.exit(1 if fails else 0)
