# -*- coding: utf-8 -*-
"""Vẽ ảnh xem trước 1200×630 cho link chia sẻ phần Luyện phát âm (icons/og-phat-am-1.jpg).

Người dùng báo gửi link qua Zalo không thấy khung xem trước: trang chia sẻ có tiêu đề, mô tả nhưng chưa có
ảnh (og:image). Zalo không công bố cách đọc link; nhiều ứng dụng chat không có ảnh thì không hiện khung.
Cách chạy (cần Pillow, font Arial Unicode và Georgia có sẵn trên macOS):
    python3 scripts/lam-anh-chia-se.py && mv og-phat-am.jpg icons/og-phat-am-N.jpg
Thư mục icons/ được cache một năm (vercel.json), nên đổi ảnh thì đổi số N trong tên và trong hai trang chia sẻ.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1200, 630
UNI = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
SERIF = '/System/Library/Fonts/Supplemental/Georgia.ttf'
def co_chu(path, chu):
    ft = ImageFont.truetype(path, 48)
    def anh(c):
        im = Image.new('L', (80, 80)); ImageDraw.Draw(im).text((10, 5), c, font=ft, fill=255); return im.tobytes()
    thieu = anh('\U0010FFFD')
    return all(anh(c) != thieu for c in chu)
assert co_chu(UNI, 'ɪʌæθðʃŋʒəɜː'), 'Arial Unicode thiếu IPA'
serif = SERIF if co_chu(SERIF, 'ệẤằữọ') else UNI
print('serif:', serif)

img = Image.new('RGB', (W, H))
d = ImageDraw.Draw(img)
for y in range(H):                     # nền tối như app, hơi sáng ở trên
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(30 - 17 * t), int(24 - 13 * t), int(52 - 26 * t)))
glow = Image.new('RGB', (W, H), (0, 0, 0)); g = ImageDraw.Draw(glow)
g.ellipse([760, -160, 1320, 400], fill=(110, 80, 30))
img = Image.blend(img, Image.composite(glow, img, glow.convert('L').point(lambda v: 255 if v else 0)).filter(ImageFilter.GaussianBlur(120)), 0.35)
d = ImageDraw.Draw(img)

VANG = (232, 195, 122); CHU = (244, 239, 230); MO = (185, 178, 204)
ft_tieu = ImageFont.truetype(serif, 76)
ft_phu = ImageFont.truetype(UNI, 31)
ft_ipa = ImageFont.truetype(UNI, 46)
ft_vd = ImageFont.truetype(UNI, 20)
d.text((80, 92), 'Luyện phát âm', font=ft_tieu, fill=CHU)
d.text((80, 178), 'tiếng Anh', font=ft_tieu, fill=VANG)
dong = ['Bảng 44 âm · giọng người bản xứ', 'Xem miệng và lưỡi đặt ở đâu', 'Nói thử cho máy nghe']
for i, s in enumerate(dong):
    d.text((84, 300 + i * 50), s, font=ft_phu, fill=MO)

# lưới ô âm như trong app
am = [('iː', 'see'), ('ɪ', 'it'), ('æ', 'cat'), ('ʌ', 'cup'), ('ɜː', 'bird'), ('ə', 'about'),
      ('θ', 'think'), ('ð', 'this'), ('ʃ', 'she'), ('ʒ', 'measure'), ('ŋ', 'sing'), ('r', 'red')]
x0, y0, o, kc = 640, 120, 112, 14
for k, (ky, vd) in enumerate(am):
    cx, cy = x0 + (k % 4) * (o + kc), y0 + (k // 4) * (o + kc)
    vien = VANG if ky in ('θ', 'ʌ') else (90, 82, 112)
    d.rounded_rectangle([cx, cy, cx + o, cy + o], radius=18, fill=(26, 22, 40), outline=vien, width=3 if vien == VANG else 2)
    bw = d.textlength(ky, font=ft_ipa); d.text((cx + (o - bw) / 2, cy + 16), ky, font=ft_ipa, fill=CHU)
    vw = d.textlength(vd, font=ft_vd); d.text((cx + (o - vw) / 2, cy + 76), vd, font=ft_vd, fill=MO)
d.text((84, 520), 'Miễn phí · không cần tài khoản', font=ImageFont.truetype(UNI, 24), fill=(150, 142, 170))
img.save('og-phat-am.jpg', quality=88, optimize=True, progressive=True)
import os; print(os.path.getsize('og-phat-am.jpg'), 'byte')
