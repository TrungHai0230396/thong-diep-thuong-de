#!/usr/bin/env python3
"""Dựng toàn bộ tiếng NGƯỜI THẬT cho ngôi sao luyện phát âm, từ bốn file danh sách trong content/:

  content/am44.json      44 âm: mô tả, từ ví dụ, tham số khẩu hình
  content/am-nguoi.json  bản thu chính cái âm (đứng riêng, hoặc gần như đứng riêng) — người bản xứ
  content/tu-nguoi.json  bản thu từng từ (lấy từ trang Wiktionary của từ đó), kèm chữ máy nghe lại
  content/tu-ipa.json    phiên âm Anh-Anh và Anh-Mỹ của từng từ

Ra:  assets/am/*.mp3, assets/tu/*.mp3, assets/amnguoi.js, assets/tunguoi.js, assets/am/NGUON.md,
     assets/tu/NGUON.md. File mp3 nào không còn trong danh sách thì xoá.

Dùng:  python3 scripts/lam-tieng-nguoi.py [thư mục giữ bản gốc đã tải]
Cần:   ffmpeg, numpy. Thiếu bản gốc thì tự tải từ Wikimedia Commons (có User-Agent, chậm rãi).
Kiểm:  python3 scripts/kiem-tieng-nguoi.py

Sửa gì so với bản gốc (giấy phép CC BY / CC BY-SA bắt phải nói rõ):
  1. cắt bớt khoảng lặng hai đầu, theo mức ồn nền của CHÍNH file đó, và chừa rộng để không xén mất
     tiếng bật cuối từ hay tiếng xát nhỏ đầu từ
  2. cân độ to: phần có tiếng về cùng -20 dBFS, đỉnh không quá -1 dBFS, để bấm từ này sang từ kia
     không lúc to lúc nhỏ
  3. trộn về một kênh, MP3 64 kbps
"""
import hashlib, json, os, re, subprocess, sys, tempfile, time, urllib.request
import numpy as np

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
UA = 'ThongDiepThuongDe/1.0 (https://thong-diep-thuong-de.vercel.app; educational)'
GIAY_PHEP_URL = {
    'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
    'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
    'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
    'CC BY 3.0 us': 'https://creativecommons.org/licenses/by/3.0/us/',
    'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
    'CC BY 2.5': 'https://creativecommons.org/licenses/by/2.5/',
    'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
    'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'Public domain': '',
}

def doc_json(ten):
    return json.load(open(os.path.join(GOC, 'content', ten), encoding='utf-8'))

def tai(url, duong):
    if os.path.exists(duong) and os.path.getsize(duong) > 0: return
    for lan in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                open(duong, 'wb').write(r.read())
            time.sleep(.5); return
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(5 + 5 * lan); continue
            raise
    raise RuntimeError('không tải được ' + url)

def doc_pcm(duong):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', duong, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)

def gon(x):
    """Cắt lặng theo ồn nền của chính file, rồi cân độ to. Trả về None nếu không còn gì."""
    H = int(SR * .01)
    n = len(x) // H
    if n < 5: return None
    e = np.sqrt(np.mean(x[:n * H].reshape(n, H) ** 2, axis=1)) + 1e-9
    db = 20 * np.log10(e)
    nen, dinh = np.percentile(db, 10), db.max()
    nguong = max(nen + 8, dinh - 50)
    tren = np.where(db > nguong)[0]
    if not len(tren): return None
    # Chừa RỘNG: 150 ms trước, 300 ms sau. Bản đầu chừa 40/90 ms thì xén mất tiếng bật cuối từ — /p/
    # trong "cheap" đến SAU một quãng ngậm hơi gần như im lặng, nên "cheap" còn 0,43 giây và máy nghe
    # lại thành "cheers"; /s/ đầu "sing" nhỏ hơn nguyên âm nhiều nên bị coi là lặng và cắt mất.
    dau, cuoi = max(0, tren[0] - 15), min(n, tren[-1] + 30)
    y = x[dau * H:cuoi * H].copy()
    co_tieng = e[dau:cuoi][db[dau:cuoi] > nguong]
    rms = np.sqrt(np.mean(co_tieng ** 2))
    y *= min(10 ** (-20 / 20) / rms, 10 ** (-1 / 20) / (np.abs(y).max() + 1e-9))
    v = min(len(y) // 2, int(SR * .008))
    w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, v))
    y[:v] *= w; y[-v:] *= w[::-1]
    return y

def ghi_mp3(y, duong):
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        t.write(y.astype(np.float32).tobytes()); t.flush()
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', t.name,
                        '-c:a', 'libmp3lame', '-b:a', '64k', duong], check=True)

def trang(tep):
    return 'https://commons.wikimedia.org/wiki/File:' + tep.replace(' ', '_')

def dung(ds, thu_muc, goc, ten_file):
    """ds: {khoá: [bản thu]}. Dựng mp3, trả về {khoá: [mục cho JS]} và các dòng ghi công."""
    ra_dir = os.path.join(GOC, 'assets', thu_muc)
    os.makedirs(ra_dir, exist_ok=True)
    bang, dong, con = {}, [], set()
    for k in sorted(ds):
        for i, b in enumerate(ds[k], 1):
            # Tên file tạm phải khác nhau cả khi bỏ qua hoa/thường: ổ đĩa macOS mặc định coi "When.wav" và
            # "when.wav" là MỘT file, nên bản thu thứ hai không được tải và when-3 thành bản sao của when-2.
            duong = os.path.join(goc, hashlib.sha1(b['url'].encode()).hexdigest()[:12] + '-' + re.sub(r'[^A-Za-z0-9._-]', '_', b['tep']))
            tai(b['url'], duong)
            y = gon(doc_pcm(duong))
            if y is None: print('BỎ (không có tiếng):', k, b['tep']); continue
            f = ten_file(k, i)
            ghi_mp3(y, os.path.join(ra_dir, f)); con.add(f)
            # dấu nội dung trong đường dẫn: sw.js giữ tiếng đã nghe qua các lần deploy, nên file nào đổi
            # nội dung thì phải đổi địa chỉ, không thì máy cứ phát bản cũ
            dau = hashlib.md5(open(os.path.join(ra_dir, f), 'rb').read()).hexdigest()[:8]
            muc = {'f': f'assets/{thu_muc}/{f}?v={dau}', 'giong': b['giong'], 'tacGia': b['tacGia'],
                   'giayPhep': b['giayPhep'], 'nguon': trang(b['tep'])}
            if 'nhan' in b: muc.update({'nhan': b['nhan'], 'phu': b['phu']})
            if 'nguoi' in b: muc['nguoi'] = b['nguoi']      # mã người đọc: để đọc hai từ của một cặp bằng CÙNG một người
            bang.setdefault(k, []).append(muc)
            dong.append(f"| {k} | `{f}` | {b.get('nhan', '')} | {b['giong']} | {b['tacGia']} | {b['giayPhep']} | [{b['tep']}]({trang(b['tep'])}) |")
    for f in os.listdir(ra_dir):
        if f.endswith('.mp3') and f not in con: os.remove(os.path.join(ra_dir, f))
    return bang, dong

def ghi_nguon(thu_muc, tieu_de, gioi_thieu, dong):
    open(os.path.join(GOC, 'assets', thu_muc, 'NGUON.md'), 'w', encoding='utf-8').write(
        f"# {tieu_de}\n\n{gioi_thieu}\n\n"
        "Đã sửa gì: cắt khoảng lặng hai đầu, cân độ to, trộn về một kênh, đổi sang MP3. Mỗi file giữ đúng giấy\n"
        "phép của bản gốc ghi trong bảng (bản gốc CC BY-SA thì bản sửa cũng CC BY-SA).\n"
        "Làm lại: `python3 scripts/lam-tieng-nguoi.py`. Kiểm: `python3 scripts/kiem-tieng-nguoi.py`.\n\n"
        "| Mục | File | Nhãn | Giọng | Người đọc | Giấy phép | Bản gốc |\n|---|---|---|---|---|---|---|\n" + '\n'.join(dong) + '\n')

DAU_AM = """/* SINH TỰ ĐỘNG bởi scripts/lam-tieng-nguoi.py từ content/am44.json và content/am-nguoi.json — đừng sửa tay.

   44 âm tiếng Anh theo bảng người Việt hay học (ký hiệu Anh-Anh): 12 nguyên âm đơn, 8 nguyên âm đôi,
   24 phụ âm. Mỗi âm có: cách đặt miệng, lỗi người Việt hay mắc, ba từ ví dụ, tham số khẩu hình cho
   assets/khauhinh.js, và `am` — các bản thu NGƯỜI THẬT của chính cái âm đó.

   Vì sao bản thu lại khác nhau giữa các âm: không có ai, ở bất cứ đâu với giấy phép mở, thu riêng đủ 44
   âm bằng giọng bản xứ (đã lùng Commons, Lingua Libre, Freesound, Openverse, GitHub, Hugging Face).
   Nên mỗi âm lấy cái gần nhất có được, theo thứ tự ưu tiên:
     1. âm đứng riêng do người bản xứ đọc: "ah", "or", "uh", "oh", "eye", "ear", "air", "shh", "mmm"...
        — nhiều từ tiếng Anh vốn CHỈ gồm một nguyên âm (giọng Anh không đọc r ở cuối: "or" là /ɔː/)
     2. âm đứng riêng do một nhà ngữ âm người Anh đọc (GS Peter Roach): [e] [ʌ] [ɒ], [fa] … [afa]
     3. một từ mà âm đó đứng đầu hoặc gần như chiếm trọn: "he", "who", "how", "it", "egg"
   Âm nào không có thứ nào ở trên thì `am` rỗng, và màn học dùng từ ví dụ do người bản xứ đọc. Lần dựng
   này: SO_CO âm có bản thu riêng; SO_RONG âm nghe qua từ ví dụ: DS_RONG. Âm tắc p t k b d g thì tách riêng
   ra chỉ còn một tiếng tách; các âm còn lại đơn giản là không ai thu.

   Bộ cũ (Peter Isotalo đọc [sa] … [asa], Denelson83 đọc nguyên âm chuẩn IPA) đã bỏ: người dùng nghe
   thấy "khó nghe, như máy đọc" — người đọc không phải người bản xứ, và đọc kiểu mẫu phòng thí nghiệm.

   Ghi công từng file: assets/am/NGUON.md, và màn "Nguồn tiếng đọc" trong app. */
"""

DAU_TU = """/* SINH TỰ ĐỘNG bởi scripts/lam-tieng-nguoi.py từ content/tu-nguoi.json và content/tu-ipa.json — đừng sửa tay.
   TU: mỗi từ vài bản thu người thật trên Wiktionary (Wikimedia Commons), kèm giọng, người đọc, giấy phép.
       Mỗi bản đã được máy nghe lại (faster-whisper) và phải nghe ra đúng từ đó mới được chọn.
   IPA: phiên âm theo lối từ điển cho người học — Anh-Anh theo Britfone, Anh-Mỹ theo CMUdict, đối chiếu
        với Wiktionary; chỗ các nguồn lệch nhau đã soát tay.
   Ghi công đầy đủ: assets/tu/NGUON.md, và màn "Nguồn tiếng đọc" trong app. */
"""

def main():
    goc = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), 'tdtd-tieng-goc')
    os.makedirs(goc, exist_ok=True)
    am44, am_nguoi = doc_json('am44.json'), doc_json('am-nguoi.json')
    tu_nguoi, tu_ipa = doc_json('tu-nguoi.json'), doc_json('tu-ipa.json')

    bang_am, dong_am = dung(am_nguoi, 'am', goc, lambda k, i: f'{k}-{i}.mp3')
    bang_tu, dong_tu = dung(tu_nguoi, 'tu', goc, lambda k, i: f'{k}-{i}.mp3')

    ds = []
    for a in am44:
        a = dict(a)
        a['am'] = bang_am.get(a['ma'], [])
        ds.append(a)
    rong = [a['ipa'] for a in ds if not a['am']]
    dau_am = DAU_AM.replace('SO_CO', str(len(ds) - len(rong))).replace('SO_RONG', str(len(rong))).replace('DS_RONG', ' '.join(rong))
    js = (dau_am + "(function (root) {\n'use strict';\n"
          f"const DS = {json.dumps(ds, ensure_ascii=False, indent=1)};\n"
          "const NHOM = [['don', 'Nguyên âm đơn'], ['doi', 'Nguyên âm đôi'], ['phu', 'Phụ âm']];\n"
          "/* Mã âm trong bài sửa lỗi có khi khác: 'l-toi' là /l/ cuối từ — cùng âm /l/, chỉ khác chỗ đứng. */\n"
          "const DOI_MA = { 'l-toi': 'l' };\n"
          "const BANG = {};\nfor (const a of DS) BANG[a.ma] = a;\n"
          "function tim(ma) { return BANG[DOI_MA[ma] || ma] || null; }\n"
          "const api = { DS, NHOM, DOI_MA, BANG, tim };\n"
          "if (typeof module !== 'undefined' && module.exports) module.exports = api;\n"
          "else root.TDTD_AMNGUOI = api;\n"
          "})(typeof self !== 'undefined' ? self : this);\n")
    open(os.path.join(GOC, 'assets', 'amnguoi.js'), 'w', encoding='utf-8').write(js)

    js = (DAU_TU + "(function (root) {\n'use strict';\n"
          f"const TU = {json.dumps(bang_tu, ensure_ascii=False, indent=0, sort_keys=True)};\n"
          f"const IPA = {json.dumps({k: [v['anh'], v['my']] for k, v in sorted(tu_ipa.items())}, ensure_ascii=False)};\n"
          f"const GIAY_PHEP_URL = {json.dumps(GIAY_PHEP_URL, ensure_ascii=False)};\n"
          "const chuan = (chu) => String(chu || '').toLowerCase().trim();\n"
          "function tim(chu) { return TU[chuan(chu)] || null; }\n"
          "function ipa(chu) { return IPA[chuan(chu)] || null; }\n"
          "const api = { TU, IPA, GIAY_PHEP_URL, tim, ipa };\n"
          "if (typeof module !== 'undefined' && module.exports) module.exports = api;\n"
          "else root.TDTD_TUNGUOI = api;\n"
          "})(typeof self !== 'undefined' ? self : this);\n")
    open(os.path.join(GOC, 'assets', 'tunguoi.js'), 'w', encoding='utf-8').write(js)

    ghi_nguon('am', 'Nguồn tiếng đọc từng âm',
              'Bản thu người thật trên Wikimedia Commons: người đóng góp Lingua Libre (Back ache, Vealhurl, Wodencafe,\n'
              'Grendelkhan, Pvanp7), Association Shtooka (Judith Franck), GS ngữ âm Peter Roach, Mova2016, Erutuon.',
              dong_am)
    ghi_nguon('tu', 'Nguồn tiếng đọc từ',
              'Bản thu người thật lấy từ trang Wiktionary của từng từ (lưu trên Wikimedia Commons), phần lớn từ dự án\n'
              'Lingua Libre và Association Shtooka.', dong_tu)
    print(sum(len(v) for v in bang_am.values()), 'file âm,', sum(len(v) for v in bang_tu.values()), 'file từ,',
          len(bang_tu), 'từ')

if __name__ == '__main__':
    main()
