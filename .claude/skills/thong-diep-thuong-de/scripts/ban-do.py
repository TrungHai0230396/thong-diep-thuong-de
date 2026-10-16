#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bản đồ sống của repo thong-diep-thuong-de, đọc thẳng từ mã — khỏi phải mở app.js, index.html, sw.js để biết trò nào
nằm ở đâu, và bắt luôn chỗ thiếu khi thêm hay đổi một ngôi sao.

    python3 .claude/skills/thong-diep-thuong-de/scripts/ban-do.py            # bản đồ + kiểm
    python3 .claude/skills/thong-diep-thuong-de/scripts/ban-do.py --fetch    # git fetch trước, để so V với origin cho đúng
    python3 .claude/skills/thong-diep-thuong-de/scripts/ban-do.py an-gi bida # chỉ mấy trò này (theo duong hay id)

In ra: mỗi trò (id, #duong, khung, mô-đun, tệp định nghĩa mô-đun, các bài kiểm có nạp tệp đó, trang chia sẻ, manifest,
ảnh xem trước); các mô-đun dùng chung; số V của sw.js ở thư mục làm việc, HEAD, origin; tệp chưa commit. Cuối cùng là
danh sách CẢNH BÁO: tệp trong index.html mà thiếu trong SHELL của sw.js, trò chưa có trong TEP của test-sao.js, trang
chia sẻ thiếu hay sai tên, trang riêng (cũng là thanh địa chỉ lúc trò mở) chưa cất sẵn trong SHELL…
"""
import json
import re
import subprocess
import sys
from pathlib import Path

GOC = Path(__file__).resolve().parents[4]          # .claude/skills/<tên>/scripts/ban-do.py → gốc repo
doc = lambda p: (GOC / p).read_text(encoding='utf-8') if (GOC / p).exists() else ''


def git(*a):
    r = subprocess.run(['git', '-C', str(GOC), *a], capture_output=True, text=True)
    return r.stdout.rstrip('\n') if r.returncode == 0 else ''        # giữ khoảng trắng đầu dòng của git status --short


def doc_sao():
    app = doc('assets/app.js')
    i = app.find('const SAO = [')
    khoi = app[i:app.find('];', i)] if i >= 0 else ''
    ds = []
    for m in re.finditer(r'\{[^{}]*\}', khoi):
        k = m.group(0)
        lay = lambda t: (re.search(t + r":\s*'([^']*)'", k) or [None, None])[1]
        bat = lambda t: bool(re.search(t + r':\s*true', k))
        if lay('id'):
            ds.append({'id': lay('id'), 'duong': lay('duong'), 'khung': (lay('khung') or '').lstrip('.'), 'mun': lay('mun'),
                       'tieuDe': lay('tieuDe'), 'tenApp': lay('tenApp'), 'trang': lay('trang'), 'hinh': lay('hinh'),
                       'mau': lay('mau'), 'nutCai': bat('nutCai'),
                       'tat': bool(re.search(r'bat:\s*false', k))})
    return ds


def mo_dun():
    """TDTD_X → tệp trong assets/ gán nó (self.TDTD_X = …, root.TDTD_X = …)."""
    ra = {}
    for f in sorted((GOC / 'assets').glob('*.js')):
        for m in re.finditer(r'(?:self|root|global|window)\.(TDTD_[A-Z_]+)\s*=', f.read_text(encoding='utf-8')):
            ra.setdefault(m.group(1), f.name)
    return ra


def bai_kiem_nap(ten_tep):
    """Các scripts/test-*.js nhắc tới tệp này (nạp nó), trừ test-sao.js vốn nạp mọi tệp."""
    ra = []
    for f in sorted((GOC / 'scripts').glob('test-*.js')):
        if f.name != 'test-sao.js' and re.search(r"['\"/]" + re.escape(ten_tep) + r"['\"]", f.read_text(encoding='utf-8')):
            ra.append(f.name)
    return ra


def v_cua(noi):
    m = re.search(r"const V = '([^']+)'", noi or '')
    return m.group(1) if m else '?'


def main(args):
    if '--fetch' in args:
        git('fetch', '-q', 'origin')
        args = [a for a in args if a != '--fetch']
    sao, md = doc_sao(), mo_dun()
    app = doc('assets/app.js'); i = app.find('const HINH_SAO = {')
    hinh = set(re.findall(r"^\s*'?([A-Za-z0-9_-]+)'?\s*:", app[i:app.find('};', i)], re.M)) if i >= 0 else set()
    html, sw, test_sao, css = doc('index.html'), doc('sw.js'), doc('scripts/test-sao.js'), doc('assets/app.css')
    script = re.findall(r'<script src="assets/([^"]+)"', html)
    shell = re.findall(r"'([^']+)'", (re.search(r'const SHELL = \[([\s\S]*?)\];', sw) or [None, ''])[1])
    tep = re.findall(r"'([^']+\.js)'", (re.search(r'const TEP = \[([\s\S]*?)\];', test_sao) or [None, ''])[1])
    canh = []
    chon = [s for s in sao if not args or s['duong'] in args or s['id'] in args]
    ten_kiem = {f.name for f in (GOC / 'scripts').glob('test-*.js')}
    tep_tro = {x['id']: md.get(x['mun'] or '', '?') for x in sao}
    loi_cua, ai_dung = {}, {}
    for x in sao:                                  # lõi = tệp gán TDTD_* mà mô-đun trò nhắc tới (trừ chính nó, app.js)
        noi = doc('assets/' + tep_tro[x['id']]) if tep_tro[x['id']] != '?' else ''
        loi_cua[x['id']] = sorted({md[g] for g in set(re.findall(r'TDTD_[A-Z_]+', noi)) - {x['mun']}
                                   if g in md and md[g] not in (tep_tro[x['id']], 'app.js')})
        for t in loi_cua[x['id']]:
            ai_dung.setdefault(t, set()).add(x['id'])

    print(f'Gốc repo: {GOC}')
    print(f'{len(sao)} ngôi sao trong SAO (assets/app.js). Thứ tự <script> trong index.html: {" ".join(script)}\n')
    for s in chon:
        f = tep_tro[s['id']]
        dung = loi_cua[s['id']]
        # lõi riêng của trò: mọi bài kiểm nạp nó; lõi dùng chung (phong.js, maqr.js, lich.js…): chỉ bài kiểm riêng test-<lõi>.js
        kiem = set(bai_kiem_nap(f) if f != '?' else [])
        for t in dung:
            kiem |= set(bai_kiem_nap(t)) if len(ai_dung[t]) == 1 else ({'test-' + t} & ten_kiem)
        kiem = sorted(kiem)
        dong = [f"#{s['duong']}" + (f"  → địa chỉ /{s['trang']}" if s['trang'] else ''),
                f"khung .{s['khung']}, mô-đun {s['mun']} trong assets/{f}" + ('' if f in script else '  (KHÔNG có trong index.html!)'),
                f"tên \"{s['tieuDe']}\", tên app \"{s['tenApp']}\", hình {s['hinh']}, màu {s['mau']}" + (', đang tắt (bat: false)' if s['tat'] else ''),
                'lõi nó dùng: ' + (', '.join(dung) if dung else '(không)'),
                'bài kiểm (nạp tệp trò hay lõi của nó): ' + (', '.join(kiem) if kiem else '(không có — chỉ test-sao.js)')]
        if s['trang']:
            trang = doc(s['trang'] + 'index.html')
            anh = (re.search(r'og:image" content="https://[^/]+/([^"]+)"', trang) or [None, None])[1]
            tieu = (re.search(r'<title>([^<]*)</title>', trang) or [None, None])[1]
            co_mf = (GOC / s['trang'] / 'app.webmanifest').exists()
            dong.append(f"trang chia sẻ {s['trang']}index.html" + ('' if trang else ' (THIẾU)') + f", manifest {'có' if co_mf else 'THIẾU'}"
                        + (f", ảnh {anh}" + ('' if (GOC / anh).exists() else ' (THIẾU tệp)') if anh else ''))
            if not trang: canh.append(f"{s['id']}: thiếu {s['trang']}index.html — chạy python3 scripts/lam-trang-chia-se.py {s['duong']}")
            elif tieu != s['tieuDe']: canh.append(f"{s['id']}: <title> trang chia sẻ \"{tieu}\" ≠ tieuDe \"{s['tieuDe']}\" — chạy lại lam-trang-chia-se.py")
            if not co_mf: canh.append(f"{s['id']}: thiếu {s['trang']}app.webmanifest — chạy python3 scripts/lam-ke-khai.py")
            if anh and not (GOC / anh).exists(): canh.append(f"{s['id']}: ảnh xem trước {anh} không có")
            if s['trang'] not in shell: canh.append(f"{s['id']}: '{s['trang']}' (thanh địa chỉ lúc trò mở) chưa có trong SHELL của sw.js — mất mạng mà tải lại là hỏng")
        if f != '?' and f not in tep: canh.append(f"{s['id']}: assets/{f} chưa có trong TEP của scripts/test-sao.js")
        if f != '?' and f not in script: canh.append(f"{s['id']}: assets/{f} chưa có thẻ <script> trong index.html")
        for t in dung:                             # lõi thiếu thẻ script thì trò nổ lúc mở trên trang thật (test-sao không thấy)
            if t not in script: canh.append(f"{s['id']}: lõi assets/{t} chưa có thẻ <script> trong index.html")
        if s['hinh'] and s['hinh'] not in hinh and not re.match(r'^M[\d.\s-]', s['hinh']): canh.append(f"{s['id']}: hình '{s['hinh']}' không có trong HINH_SAO (sao sẽ trống)")
        if not s['nutCai']: canh.append(f"{s['id']}: thiếu nutCai: true (test-sao đòi ở mọi trò)")
        if f == '?': canh.append(f"{s['id']}: không tìm thấy tệp nào gán self.{s['mun']}")
        if s['khung'] and not re.search(r'\.' + re.escape(s['khung']) + r'[\s.{,:\[]', css): canh.append(f"{s['id']}: app.css chưa có luật cho .{s['khung']}")
        print(f"• {s['id']}")
        for d in dong:
            print('    ' + d)
    if not args:
        rieng = {v for s in sao for k, v in md.items() if k == s['mun']}
        chung = [f"{t} ({', '.join(k for k, v in md.items() if v == t)})" for t in script if t not in rieng and t in md.values()]
        print('\nMô-đun dùng chung / lõi của trò (không phải khung trò): ' + '; '.join(chung))
    for khoa, ten in [('mau', 'màu'), ('tenApp', 'tên app'), ('tieuDe', 'tên'), ('duong', 'đường'), ('trang', 'trang')]:
        gap = {}
        for x in sao: gap.setdefault(x[khoa], []).append(x['id']) if x[khoa] else None
        for v, ids in gap.items():
            if len(ids) > 1: canh.append(f"{ten} '{v}' trùng nhau: {', '.join(ids)}")
    for x in sao:
        if x['tenApp'] and len(x['tenApp']) > 13: canh.append(f"{x['id']}: tenApp '{x['tenApp']}' quá 13 chữ (test-sao)")
    for t in script:
        if 'assets/' + t not in shell: canh.append(f"assets/{t} có trong index.html mà thiếu trong SHELL của sw.js (mất mạng sẽ hỏng)")
    for t in shell:
        if t.endswith('.js') and t.startswith('assets/') and t[7:] not in script: canh.append(f"{t} có trong SHELL mà index.html không nạp")

    v_wt, v_head, v_ori = v_cua(sw), v_cua(git('show', 'HEAD:sw.js')), v_cua(git('show', 'origin/main:sw.js'))
    print(f"\nsw.js V: thư mục làm việc {v_wt}, HEAD {v_head}, origin/main {v_ori}"
          + ('' if '--fetch' in sys.argv else ' (origin theo lần fetch gần nhất; thêm --fetch để cập nhật)'))
    so = lambda v: int(re.sub(r'\D', '', v) or 0)
    print(f"Commit tới cần V cao hơn cả HEAD lẫn origin: tdtd-v{max(so(v_head), so(v_ori)) + 1} (nếu chưa phiên nào nhận số đó — hỏi các phiên khác)")
    print('git: ' + (git('status', '-sb').splitlines() or ['?'])[0] + ' · HEAD ' + git('log', '-1', '--format=%h %s'))
    bd = [l for l in git('status', '--short').splitlines()]
    if bd:
        print(f'Chưa commit ({len(bd)}): ' + ', '.join(l[3:] for l in bd[:25]) + (' …' if len(bd) > 25 else ''))
        print('  (có thể là của phiên khác — đừng git add cả tệp chung; xem references/nhieu-phien.md)')
    print('\nCẢNH BÁO:' if canh else '\nKhông thấy chỗ thiếu nào.')
    for c in canh:
        print('  ! ' + c)


if __name__ == '__main__':
    main(sys.argv[1:])
