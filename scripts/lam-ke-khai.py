# -*- coding: utf-8 -*-
"""Manifest riêng cho từng trò: cài app từ trò nào thì mở app là vào thẳng trò đó.

Người dùng hỏi "tải app trong mỗi game là vô app có tự động vô game không hay bay ra trang chủ", rồi chọn "vào thẳng
trò đã cài". Chrome mở start_url của manifest lúc cài, và đọc lại manifest mỗi lần thẻ <link> đổi. Nên mỗi trò có một
manifest giống hệt manifest.webmanifest, chỉ khác start_url = ?tro=<duong>; id vẫn "/" nên vẫn là một app Thông Điệp
(Chrome nhận ra là app đã cài, không mời cài lần nữa). assets/app.js gắn manifest của trò đang mở (keKhaiCua) rồi đọc
?tro khi app mở. Safari (iPhone, iPad) đọc manifest một lần lúc tải trang rồi giữ, nên index.html không gắn manifest
cho nó — Safari lưu địa chỉ đang xem, mà địa chỉ trong trò đã mang ?tro=<duong>.

Cách chạy:  python3 scripts/lam-ke-khai.py
Đọc danh sách trò (duong, trang) thẳng từ assets/app.js, ghi <trang>app.webmanifest. scripts/test-sao.js kiểm từng tệp.
"""
import json
import os
import re

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

with open(os.path.join(GOC, 'assets', 'app.js'), encoding='utf-8') as f:
    nguon = f.read()
khoi = nguon[nguon.index('const SAO = ['):]
khoi = khoi[:khoi.index('];')]
TRO = re.findall(r"duong:\s*'([^']+)'[^}]*?trang:\s*'([^']+)'", khoi)
assert len(TRO) >= 14, 'không đọc được danh sách trò trong app.js'

with open(os.path.join(GOC, 'manifest.webmanifest'), encoding='utf-8') as f:
    goc = json.load(f)
assert goc.get('id') == '/', 'manifest.webmanifest phải có id "/" (cùng một app với mọi manifest của trò)'

for duong, trang in TRO:
    len_ = '../' * trang.strip('/').count('/') + '../'               # từ thư mục trò về gốc
    m = dict(goc)
    m['start_url'] = len_ + '?tro=' + duong
    m['scope'] = len_
    m['icons'] = [dict(i, src=len_ + i['src']) for i in goc['icons']]
    with open(os.path.join(GOC, trang, 'app.webmanifest'), 'w', encoding='utf-8') as f:
        json.dump(m, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('ghi', trang + 'app.webmanifest')
