# -*- coding: utf-8 -*-
"""Ảnh xem trước 1200×630 cho bàn bida tặng anh Biển (bida-anh-bien/).

Người dùng: "cho tôi 1 đường dẫn mới, ko tạo sao nha — bida-anh-bien, lấy hình trên làm background tặng anh Biển cho
vui". Trang bida-anh-bien/index.html viết tay (không phải một ngôi sao, không sinh bằng lam-trang-chia-se.py), nhưng gửi
link qua Zalo, Messenger thì cũng cần ảnh xem trước như các trò khác: chữ bên trái, ảnh anh Biển đánh bida bên phải.
Dùng lại bút vẽ (Ve, ft, màu chữ) của scripts/lam-trang-chia-se.py cho cùng một dáng.

Cách chạy:  python3 scripts/lam-qua-bida.py
Đọc bida-anh-bien/anh-bien.jpg, ghi bida-anh-bien/og-1.jpg. Đổi hình thì tăng số (og-2.jpg) và sửa thẻ og:image trong
trang — Zalo, Facebook giữ ảnh cũ theo địa chỉ.
"""
import importlib.util
import os
from PIL import Image, ImageDraw

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
spec = importlib.util.spec_from_file_location('chia_se', os.path.join(GOC, 'scripts', 'lam-trang-chia-se.py'))
cs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cs)
W, H, S = cs.W, cs.H, cs.S

THU_MUC = os.path.join(GOC, 'bida-anh-bien')
anh = Image.open(os.path.join(THU_MUC, 'anh-bien.jpg')).convert('RGB')
im = Image.new('RGB', (W * S, H * S))
v = cs.Ve(im)
v.doc((0, 0, W, H), (34, 36, 42), (14, 15, 19))                  # nền xám tối như phòng bida trong ảnh
# ảnh: ô vuông có cả hai người và bi chủ, đặt bên phải, mép trái mờ dần vào nền
vuong = anh.crop((100, 170, 896, 966)).resize((630 * S, 630 * S), Image.LANCZOS)
mat = Image.new('L', vuong.size, 255)
d = ImageDraw.Draw(mat)
for x in range(0, 170 * S):
    d.line([(x, 0), (x, vuong.size[1])], fill=round(255 * (x / (170 * S)) ** 1.5))
im.paste(vuong, ((W - 630) * S, 0), mat)
VANG = (232, 195, 122)
c1 = 74
v.chu((80, 96), 'Bàn bida', cs.ft(c1, cs.serif), cs.CHU)
v.chu((80, 96 + c1 * 1.13), 'của anh Biển', cs.ft(c1, cs.serif), VANG)
y = 96 + c1 * 2.26 + 40
for s in ['Nỉ xám in hình anh Biển', 'Đấu với Ghẹ, Cua, Mực', 'Hay rủ nhau chơi qua mạng']:
    v.chu((84, y), s, cs.ft(30), cs.MO)
    y += 50
v.chu((84, 520), 'Quà tặng · bida lỗ 8 bi, 9 bi', cs.ft(24), cs.NHAT)
ra = im.resize((W, H), Image.LANCZOS)
duong = os.path.join(THU_MUC, 'og-1.jpg')
ra.save(duong, quality=86, optimize=True, progressive=True)
print('ảnh', duong, os.path.getsize(duong) // 1024, 'KB')
