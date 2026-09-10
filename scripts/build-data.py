#!/usr/bin/env python3
"""Dựng data/cards.json từ hai nguồn CSV.

Nguồn 1 — 100-thong-diep-thuong-de-v6.csv: bộ 100 lá đã chạy từ đầu, đã qua ba lượt
sửa v3 → v5 → v6, giữ nguyên.

Nguồn 2 — 365-thong-diep-thuong-de.csv: mang tiếng 365 nhưng thật ra chỉ có 120 câu.
Dòng 101 tới 365 là phần đệm: mỗi dòng bị dán thêm đuôi "(Thông điệp ngày N)" vào
cuối câu cho khác nhau, còn ruột thì chạy vòng lặp chu kỳ đúng 20 ngày — câu "Đừng lo
lắng về tương lai..." rơi vào ngày 103, 123, 143, ... tới 363, mười bốn lần. Cột Ý nghĩa
của 265 dòng đó cũng chỉ có 10 câu, mỗi câu 26–27 lần, đều kết bằng "Hãy áp dụng sự
tỉnh thức này vào ngày hôm nay", và gán không ăn nhập với câu Thông điệp: ngày 104 nói
"Con là một biểu hiện tuyệt đẹp và độc bản của sự sống" mà lời giảng lại là "Tiếng nói
nhỏ nhẹ bên trong luôn chỉ đúng hướng".

Nên script bóc cái đuôi ngày ra, gom các dòng trùng ruột về một, bỏ câu đã có trong
nguồn 1, và thay 20 lời giảng bị dán mẫu bằng lời viết riêng cho từng câu (bảng
LOI_GIANG bên dưới). Kết quả: 100 + 119 = 219 lá.
"""
import csv, json, os, re, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CU = os.path.join(ROOT, "content/raw/100-thong-diep-thuong-de-v6.csv")
MOI = os.path.join(ROOT, "content/raw/365-thong-diep-thuong-de.csv")
OUT = os.path.join(ROOT, "data/cards.json")
NOTES = os.path.join(ROOT, "content/ghi-chu-co-che-game.json")

DUOI_NGAY = re.compile(r"\s*\(Thông điệp ngày \d+\)\s*$")
MAU_TINH_THUC = "Hãy áp dụng sự tỉnh thức này"

# Sửa lỗi chính tả / diễn đạt phát hiện trong nguồn (id nguồn -> (tìm, thay))
FIXES = {
    95: [("tử tế with mình", "tử tế với mình")],
}

# Hai mươi câu nằm trong phần đệm của nguồn 2: câu thì được, nhưng lời giảng bị dán
# chung một trong mười câu mẫu nên chẳng ăn nhập gì. Viết lại từng câu, theo giọng của
# bộ cũ: nói thẳng, cụ thể, việc làm được trong ngày hôm nay.
LOI_GIANG = {
    "Hãy nhớ rằng con luôn được nâng đỡ trong từng bước đi.":
        "Việc khó đến mấy cũng không phải một mình con gánh. Cứ bước đi, sẽ có chỗ đỡ chân.",
    "Sự bình an thật sự không đến từ bên ngoài, nó bắt đầu từ bên trong.":
        "Đừng chờ hoàn cảnh yên rồi mới thấy yên. Bên trong lặng thì ngoài kia ồn cũng không sao.",
    "Đừng lo lắng về tương lai, hãy làm tốt việc của khoảnh khắc này.":
        "Tương lai chưa tới, lo cũng không đổi được gì. Làm cho xong việc trước mắt là đủ.",
    "Con là một biểu hiện tuyệt đẹp và độc bản của sự sống.":
        "Không ai trên đời giống con. Đừng cố sửa mình thành bản sao của người khác.",
    "Mọi rào cản chỉ là cơ hội để con rèn luyện sức mạnh nội tâm.":
        "Chỗ khó là chỗ con lớn lên. Qua được một lần thì lần sau nhẹ hơn.",
    "Hãy đối xử nhẹ nhàng với bản thân khi gặp khó khăn.":
        "Lúc vấp ngã, hãy nói với mình như nói với một người bạn đang buồn.",
    "Không có lỗi lầm nào không thể chuyển hóa thành bài học.":
        "Sai rồi thì sửa. Cái sai chỉ thành mất mát khi con không học được gì từ nó.",
    "Hãy để tình yêu dẫn dắt mọi lời nói và việc làm hôm nay.":
        "Trước khi nói hay làm điều gì, thử hỏi: điều này đến từ thương hay từ sợ?",
    "Cuộc đời là một món quà, hãy mở nó ra với sự háo hức.":
        "Ngày hôm nay không ai hứa trước với con. Nhận lấy nó như nhận một món quà.",
    "Hãy tin vào hành trình của riêng con, đừng so sánh với ai.":
        "Mỗi người một nhịp. So với người khác chỉ làm con quên mất đường của mình.",
    "Sự tĩnh lặng giúp con kết nối lại với sức mạnh sâu thẳm.":
        "Tắt bớt tiếng ồn đi, ngồi yên một lát. Câu trả lời thường đến trong lúc đó.",
    "Mọi câu trả lời con cần đều đã có sẵn trong tim con.":
        "Đừng hỏi mãi bên ngoài. Cái con thật sự biết nằm sâu hơn cái con nghĩ.",
    "Hãy dũng cảm sống là chính mình mà không cần xin lỗi ai.":
        "Sống thật thì sẽ có người không ưa. Đó là cái giá của việc không phải giả vờ.",
    "Mỗi ngày là một cơ hội để con bắt đầu lại từ đầu.":
        "Hôm qua thế nào thì cũng đã qua rồi. Sáng nay là một trang còn trắng.",
    "Hãy tha thứ và giải phóng cho quá khứ lùi vào quên lãng.":
        "Giữ mối hận là tự xích mình vào chuyện cũ. Buông ra thì con mới đi tiếp được.",
    "Niềm vui đơn sơ đến từ việc trân trọng những gì đang có.":
        "Không cần đợi điều lớn lao. Bữa cơm còn nóng, một câu hỏi thăm, đã là nhiều rồi.",
    "Hãy mở lòng đón nhận những điều bất ngờ dễ thương của cuộc sống.":
        "Đừng xếp kín lịch quá. Chừa một khoảng trống cho điều chưa đoán trước được.",
    "Con không một mình, vũ trụ luôn đồng hành cùng con.":
        "Những lúc thấy trơ trọi nhất, thật ra vẫn có nhiều thứ đang lặng lẽ đỡ lấy con.",
    "Hãy sống chậm lại để cảm nhận sự kỳ diệu quanh con.":
        "Đi chậm lại một nhịp thôi. Nhiều thứ đẹp chỉ hiện ra khi con không vội.",
    "Sức mạnh của con nằm ở sự lựa chọn cách ứng xử hôm nay.":
        "Chuyện xảy đến thì con không chọn được, nhưng cách con đáp lại thì có.",
}


def clean(s):
    return re.sub(r"\s+", " ", (s or "").strip())


def cham(s):
    return s if not s or s.endswith((".", "!", "?", "…")) else s + "."


def tu(s):
    """Bộ từ đã bỏ dấu câu, để so hai câu có phải một không."""
    return set(re.sub(r"[^\w\s]", "", unicodedata.normalize("NFC", s.lower())).split())


def giong_nhau(a, b):
    """Jaccard trên bộ từ. Từ 0,6 trở lên thì coi như cùng một câu nói khác chữ."""
    A, B = tu(a), tu(b)
    return len(A & B) / max(1, len(A | B))


def doc_csv(path):
    with open(path, encoding="utf-8-sig") as fh:
        return [r for r in csv.DictReader(fh) if (r.get("ID") or "").strip()]


cards, notes, warn = [], [], []

# ---- nguồn 1: bộ 100 lá đang chạy, giữ nguyên thứ tự và nội dung ----
for r in doc_csv(CU):
    cid = int(r["ID"])
    msg, mean = clean(r["Thông điệp"]), clean(r["Ý nghĩa"])
    for find, rep in FIXES.get(cid, []):
        msg, mean = msg.replace(find, rep), mean.replace(find, rep)
    cards.append({"id": len(cards) + 1, "thong_diep": cham(msg), "y_nghia": cham(mean)})
    notes.append({"id": len(cards), "nguon": f"v6#{cid}", "co_che_game": clean(r.get("Cơ chế game", ""))})

so_cu = len(cards)

# ---- nguồn 2: bóc đuôi ngày, gom trùng, bỏ câu đã có, thay lời giảng bị dán mẫu ----
da_co, bo_trung, bo_dup, thay_giang = [c["thong_diep"] for c in cards], 0, 0, 0
thay_ngay = 0
seen = set()
for r in doc_csv(MOI):
    goc = clean(r["Thông điệp"])
    msg = DUOI_NGAY.sub("", goc)
    if msg != goc:
        thay_ngay += 1
    key = msg.lower()
    if key in seen:
        bo_dup += 1
        continue
    seen.add(key)
    if any(giong_nhau(msg, c) >= .6 for c in da_co):
        bo_trung += 1
        continue
    mean = clean(r["Ý nghĩa"])
    if MAU_TINH_THUC in mean:
        rieng = LOI_GIANG.get(cham(msg)) or LOI_GIANG.get(msg)
        if not rieng:
            warn.append(f"nguồn 2 #{r['ID']} lời giảng bị dán mẫu mà chưa có bản viết riêng: {msg}")
            continue
        mean, thay_giang = rieng, thay_giang + 1
    cards.append({"id": len(cards) + 1, "thong_diep": cham(msg), "y_nghia": cham(mean)})
    notes.append({"id": len(cards), "nguon": f"365#{r['ID']}", "co_che_game": clean(r.get("Cơ chế game", ""))})

# ---- soát lại ----
thay = {}
for c in cards:
    k = c["thong_diep"].lower()
    if k in thay:
        warn.append(f"#{c['id']} trùng nguyên văn với #{thay[k]}")
    thay[k] = c["id"]
    if not c["y_nghia"]:
        warn.append(f"#{c['id']} thiếu Ý nghĩa")
    if MAU_TINH_THUC in c["y_nghia"]:
        warn.append(f"#{c['id']} còn sót lời giảng dán mẫu")
    if DUOI_NGAY.search(c["thong_diep"]):
        warn.append(f"#{c['id']} còn sót đuôi (Thông điệp ngày N)")

ids = [c["id"] for c in cards]
assert ids == list(range(1, len(cards) + 1)), f"ID không liên tục: {ids[:5]}..."

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(cards, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(notes, open(NOTES, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

L = sorted(len(c["thong_diep"]) for c in cards)
print(f"✓ {len(cards)} lá -> data/cards.json  ({so_cu} lá cũ + {len(cards) - so_cu} lá mới)")
print(f"  nguồn 2: bóc {thay_ngay} cái đuôi \"(Thông điệp ngày N)\", "
      f"gom {bo_dup} dòng trùng ruột, bỏ {bo_trung} câu đã có trong bộ cũ")
print(f"           viết lại {thay_giang} lời giảng bị dán mẫu")
print(f"  thông điệp: {L[0]}–{L[-1]} ký tự (trung vị {L[len(L)//2]})")
print(f"  ý nghĩa   : {min(len(c['y_nghia']) for c in cards)}–{max(len(c['y_nghia']) for c in cards)} ký tự")
print(f"  ghi chú cơ chế game -> content/ghi-chu-co-che-game.json (không nằm trong bundle app)")
print(f"  kích thước data/cards.json: {os.path.getsize(OUT)//1024} KB")
for w in warn:
    print("  ⚠", w)
