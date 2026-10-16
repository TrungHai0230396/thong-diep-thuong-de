# -*- coding: utf-8 -*-
"""Trang chia sẻ riêng cho từng trò, kèm ảnh xem trước 1200×630.

Zalo, Facebook, Telegram hiện tiêu đề, mô tả, ảnh của trang mà link trỏ tới; phần sau dấu # không được gửi lên máy
chủ, nên link …/#trò lúc nào cũng hiện tên app. Mỗi trò có một trang tĩnh mang tên riêng (tieuDe trong
assets/app.js), mô tả riêng, ảnh riêng, mở ra là chuyển vào trò bằng JavaScript (luyen-phat-am/index.html kể vì sao
không dùng thẻ refresh). Bắt đầu từ phần phát âm; người dùng: "mỗi game làm cài app như chỗ luyện âm, có chú thích
khác luôn". Zalo không hiện khung xem trước khi trang chưa có ảnh (người dùng báo), nên trang nào cũng có ảnh.

Cách chạy (cần Pillow; font Georgia và Arial Unicode có sẵn trên macOS):
    python3 scripts/lam-trang-chia-se.py                  # mọi trò
    python3 scripts/lam-trang-chia-se.py ho-sen noi-sao   # chỉ mấy trò này (theo duong)
    python3 scripts/lam-trang-chia-se.py --thu <thư mục>  # vẽ thử ảnh vào thư mục khác, không ghi trang
Ghi <trang>/index.html (hai trang phát âm viết tay, không ghi) và icons/og-<duong>-<so>.jpg. icons/ được cache một
năm (vercel.json) nên ảnh đã có thì KHÔNG ghi đè: đổi hình thì tăng `so` của trò đó, chạy lại, xoá ảnh cũ.
scripts/test-sao.js kiểm mọi trang: tên trùng tieuDe, chuyển đúng chỗ, ảnh có thật, đúng 1200×630, dưới 300 KB.
Số liệu trong ảnh lấy từ chính các trò, không vẽ bừa: toạ độ Bắc Đẩu (constellation.js), một màn thật
(mansoko.js), cách chia ô bàn cờ (coba.js), giờ hoàng đạo ngày Tý (lich.js), biểu đồ một ngày sinh (sohoc.js),
màu luân xa (luanxa.js), màu ô lệnh (laptrinh.js, app.css).
"""
import html
import math
import os
import random
import re
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
TEN_MIEN = 'https://thong-diep-thuong-de.vercel.app/'
W, H, S = 1200, 630, 2                    # vẽ gấp đôi rồi thu về cho nét mịn
UNI = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
SERIF = '/System/Library/Fonts/Supplemental/Georgia.ttf'
NGHIENG = '/System/Library/Fonts/Supplemental/Georgia Italic.ttf'
CHU, MO, NHAT = (244, 239, 230), (185, 178, 204), (150, 142, 170)
VANG = (232, 195, 122)
O_NEN, O_VIEN = (26, 22, 40), (90, 82, 112)   # ô tối viền tím, như lưới âm của phát âm


def co_chu(path, chu):
    ft = ImageFont.truetype(path, 48)

    def anh(c):
        im = Image.new('L', (80, 80)); ImageDraw.Draw(im).text((10, 5), c, font=ft, fill=255); return im.tobytes()
    thieu = anh('\U0010FFFD')
    return all(anh(c) != thieu for c in chu)


assert co_chu(UNI, 'ɪʌæθðʃŋʒəɜː♚♛♜♝♞♟'), 'Arial Unicode thiếu IPA hay quân cờ'
serif = SERIF if co_chu(SERIF, 'ệẤằữọ') else UNI
nghieng = NGHIENG if co_chu(NGHIENG, 'ệẤằữọ') else serif

_FT = {}


def ft(co, path=UNI):
    k = (path, co)
    if k not in _FT:
        _FT[k] = ImageFont.truetype(path, round(co * S))
    return _FT[k]


def hex2(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def tron(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def mo(mau, a):
    return tuple(mau[:3]) + (round(a * 255),)


class Ve:
    """bút vẽ nhận toạ độ của ảnh 1200×630, vẽ lên ảnh gấp S lần"""

    def __init__(s, im):
        s.im = im
        s.d = ImageDraw.Draw(im, 'RGBA' if im.mode == 'RGB' else None)

    def tron(s, cx, cy, r, fill=None, outline=None, w=1):
        s.d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S], fill=fill, outline=outline, width=round(w * S))

    def elip(s, cx, cy, rx, ry, fill=None, outline=None, w=1):
        s.d.ellipse([(cx - rx) * S, (cy - ry) * S, (cx + rx) * S, (cy + ry) * S], fill=fill, outline=outline, width=round(w * S))

    def hcn(s, box, r=0, fill=None, outline=None, w=1):
        s.d.rounded_rectangle([v * S for v in box], radius=r * S, fill=fill, outline=outline, width=round(w * S))

    def da_giac(s, pts, fill=None, outline=None, w=1):
        s.d.polygon([(x * S, y * S) for x, y in pts], fill=fill, outline=outline, width=round(w * S) if outline else 1)

    def net(s, pts, fill, w=1, dau_tron=False):
        s.d.line([(x * S, y * S) for x, y in pts], fill=fill, width=round(w * S), joint='curve')
        if dau_tron:
            for x, y in (pts[0], pts[-1]):
                s.tron(x, y, w / 2, fill=fill)

    def cung(s, box, a0, a1, fill, w):
        s.d.arc([v * S for v in box], a0, a1, fill=fill, width=round(w * S))

    def chu(s, xy, t, f, fill, anchor='la', vien=0, mau_vien=None):
        s.d.text((xy[0] * S, xy[1] * S), t, font=f, fill=fill, anchor=anchor,
                 stroke_width=round(vien * S), stroke_fill=mau_vien)

    def dai(s, t, f):
        return s.d.textlength(t, font=f) / S

    def doc(s, box, tren, duoi):
        """dải màu dọc trong khung chữ nhật"""
        x0, y0, x1, y1 = [round(v * S) for v in box]
        for y in range(y0, y1):
            s.d.line([(x0, y), (x1 - 1, y)], fill=tron(tren, duoi, (y - y0) / max(1, y1 - y0 - 1)))

    def lop(s, ve_hinh):
        """mặt nạ đen trắng cỡ ảnh: ve_hinh vẽ bằng màu 255 lên một Ve khác"""
        m = Image.new('L', s.im.size, 0); ve_hinh(Ve(m)); return m

    def phu(s, mat_na, mau, a=1.0):
        if a != 1:
            mat_na = mat_na.point(lambda v: round(v * a))
        s.im.paste(Image.new('RGB', s.im.size, mau), (0, 0), mat_na)

    def toa(s, ve_hinh, mau, a=1.0, nhoe=20):
        """quầng sáng: vẽ hình lên mặt nạ, làm nhoè, phủ màu"""
        s.phu(s.lop(ve_hinh).filter(ImageFilter.GaussianBlur(nhoe * S)), mau, a)

    def to_doc(s, ve_hinh, box, tren, duoi):
        """tô dải màu dọc bên trong một hình"""
        nen = Image.new('RGB', s.im.size); Ve(nen).doc(box, tren, duoi)
        s.im.paste(nen, (0, 0), s.lop(ve_hinh))


def elip_xoay(cx, cy, rx, ry, goc, n=40):
    a = math.radians(goc); c, sn = math.cos(a), math.sin(a)
    return [(cx + rx * math.cos(t) * c - ry * math.sin(t) * sn, cy + rx * math.cos(t) * sn + ry * math.sin(t) * c)
            for t in (2 * math.pi * k / n for k in range(n))]


def sao_nhon(cx, cy, r, r2, n=5, goc=-90):
    return [(cx + (r if k % 2 == 0 else r2) * math.cos(math.radians(goc + 180 * k / n)),
             cy + (r if k % 2 == 0 else r2) * math.sin(math.radians(goc + 180 * k / n))) for k in range(2 * n)]


# ---------- path SVG → đường gấp khúc (để vẽ biểu tượng ô lệnh đúng như trong trò) ----------
_SO = re.compile(r'[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?')


def doc_svg(d, n=10):
    i, L = 0, len(d)
    doan, cur = [], []
    x = y = sx = sy = 0.0
    lc, kx, ky, lenh = '', 0.0, 0.0, None

    def bo():
        nonlocal i
        while i < L and d[i] in ' ,\t\n':
            i += 1

    def so():
        nonlocal i
        bo(); m = _SO.match(d, i); i = m.end(); return float(m.group())

    def co():
        nonlocal i
        bo(); c = d[i]; i += 1; return c == '1'

    while True:
        bo()
        if i >= L:
            break
        if d[i].isalpha():
            lenh = d[i]; i += 1
        up, rel = lenh.upper(), lenh.islower()
        ox, oy = (x, y) if rel else (0.0, 0.0)
        if up == 'Z':
            if cur:
                cur.append(cur[0]); doan.append(cur); cur = []
            x, y, lc = sx, sy, 'Z'
            continue
        if up == 'M':
            x, y = so() + ox, so() + oy
            if cur:
                doan.append(cur)
            cur, sx, sy = [(x, y)], x, y
            lenh = 'l' if rel else 'L'
        elif up == 'L':
            x, y = so() + ox, so() + oy; cur.append((x, y))
        elif up == 'H':
            x = so() + ox; cur.append((x, y))
        elif up == 'V':
            y = so() + oy; cur.append((x, y))
        elif up in 'CS':
            if up == 'C':
                x1, y1 = so() + ox, so() + oy
            else:
                x1, y1 = (2 * x - kx, 2 * y - ky) if lc in 'CS' else (x, y)
            x2, y2, x3, y3 = so() + ox, so() + oy, so() + ox, so() + oy
            for k in range(1, n + 1):
                t = k / n; u = 1 - t
                cur.append((u ** 3 * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3,
                            u ** 3 * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3))
            kx, ky, x, y = x2, y2, x3, y3
        elif up == 'A':
            rx, ry, phi = so(), so(), so()
            fa, fs = co(), co()
            x2, y2 = so() + ox, so() + oy
            cur.extend(cung_svg(x, y, rx, ry, phi, fa, fs, x2, y2, n * 2))
            x, y = x2, y2
        lc = up
    if cur:
        doan.append(cur)
    return doan


def cung_svg(x1, y1, rx, ry, phi, fa, fs, x2, y2, n):
    """cung elip theo hai đầu mút (SVG 1.1, phụ lục F.6.5)"""
    if rx == 0 or ry == 0:
        return [(x2, y2)]
    c, s = math.cos(math.radians(phi)), math.sin(math.radians(phi))
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    xp, yp = c * dx + s * dy, -s * dx + c * dy
    rx, ry = abs(rx), abs(ry)
    lam = xp * xp / (rx * rx) + yp * yp / (ry * ry)
    if lam > 1:
        rx, ry = rx * math.sqrt(lam), ry * math.sqrt(lam)
    tu = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp
    mau = rx * rx * yp * yp + ry * ry * xp * xp
    k = math.sqrt(max(0.0, tu / mau)) * (-1 if fa == fs else 1)
    cxp, cyp = k * rx * yp / ry, -k * ry * xp / rx
    cx, cy = c * cxp - s * cyp + (x1 + x2) / 2, s * cxp + c * cyp + (y1 + y2) / 2

    def goc(ux, uy, vx, vy):
        return math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
    t1 = goc(1, 0, (xp - cxp) / rx, (yp - cyp) / ry)
    dt = goc((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry)
    if not fs and dt > 0:
        dt -= 2 * math.pi
    elif fs and dt < 0:
        dt += 2 * math.pi
    out = []
    for j in range(1, n + 1):
        t = t1 + dt * j / n
        px, py = rx * math.cos(t), ry * math.sin(t)
        out.append((c * px - s * py + cx, s * px + c * py + cy))
    return out


def bieu_tuong(v, d, x, y, co, mau, w):
    """biểu tượng nét (viewBox 24×24) ở góc trái trên (x, y), cạnh co"""
    for doan in doc_svg(d):
        v.net([(x + px * co / 24, y + py * co / 24) for px, py in doan], mau, w, dau_tron=True)


# ======================================================================================================
#  HÌNH MINH HOẠ BÊN PHẢI — mỗi trò một hình, trong khung x 640–1130, y 100–515
# ======================================================================================================

def ve_phat_am(v, tro):
    am = [('iː', 'see'), ('ɪ', 'it'), ('æ', 'cat'), ('ʌ', 'cup'), ('ɜː', 'bird'), ('ə', 'about'),
          ('θ', 'think'), ('ð', 'this'), ('ʃ', 'she'), ('ʒ', 'measure'), ('ŋ', 'sing'), ('r', 'red')]
    x0, y0, o, kc = 640, 120, 112, 14
    for k, (ky, vd) in enumerate(am):
        cx, cy = x0 + (k % 4) * (o + kc), y0 + (k // 4) * (o + kc)
        sang = ky in ('θ', 'ʌ')
        v.hcn([cx, cy, cx + o, cy + o], 18, fill=O_NEN, outline=VANG if sang else O_VIEN, w=3 if sang else 2)
        v.chu((cx + o / 2, cy + 16), ky, ft(46), CHU, 'ma')
        v.chu((cx + o / 2, cy + 76), vd, ft(20), MO, 'ma')


def ve_mua_chin(v, tro):
    # vệt nắng thon dần từ đuôi tới mặt trời, như màn mở đầu của trò
    x0, y0, x1, y1 = 680, 400, 1045, 165
    dx, dy = x1 - x0, y1 - y0; L = math.hypot(dx, dy); nx, ny = -dy / L, dx / L
    vet = [(x0, y0), (x1 + nx * 13, y1 + ny * 13), (x1 - nx * 13, y1 - ny * 13)]
    v.toa(lambda g: g.da_giac(vet, fill=255), (255, 200, 110), .55, 16)
    v.da_giac(vet, fill=(255, 236, 196, 210))
    v.toa(lambda g: g.tron(x1, y1, 62, fill=255), (255, 214, 130), .7, 26)
    for k in range(8):
        a = math.radians(k * 45 + 22)
        v.net([(x1 + 44 * math.cos(a), y1 + 44 * math.sin(a)), (x1 + 56 * math.cos(a), y1 + 56 * math.sin(a))],
              (255, 220, 150, 200), 3, dau_tron=True)
    v.tron(x1, y1, 30, fill=(255, 244, 214))

    # dưa hấu vừa chín, tách đôi ngay trên vệt nắng
    cx, cy, r = 855, 292, 58
    at = math.degrees(math.atan2(dy, dx))

    def nua(tu, lech):
        ox, oy = cx + nx * lech, cy + ny * lech
        def ban(rr):
            return [(ox, oy)] + [(ox + rr * math.cos(math.radians(a)), oy + rr * math.sin(math.radians(a)))
                                 for a in [tu + 180 * k / 40 for k in range(41)]]
        v.da_giac(ban(r), fill=(52, 128, 66))
        v.da_giac(ban(r * .9), fill=(236, 240, 206))
        v.da_giac(ban(r * .84), fill=(232, 72, 82))
        for k in range(5):
            a = math.radians(tu + 25 + k * 32)
            v.elip(ox + r * .52 * math.cos(a), oy + r * .52 * math.sin(a), 3.6, 3.6, fill=(40, 18, 22))
    nua(at, 12)
    nua(at + 180, -12)
    for k, (t, lech, rr) in enumerate([(.36, 6, 5), (.42, -16, 4), (.5, 22, 3.5), (.31, -26, 3)]):
        v.tron(x0 + dx * t + nx * lech, y0 + dy * t + ny * lech, rr, fill=(240, 96, 104, 220))

    # cam
    v.tron(735, 455, 40, fill=(244, 148, 44))
    v.tron(722, 442, 15, fill=(255, 196, 120, 130))
    v.elip(752, 418, 13, 6, fill=(86, 150, 72))
    v.tron(737, 417, 3, fill=(96, 70, 40))
    # xoài
    v.da_giac(elip_xoay(990, 420, 46, 31, -25), fill=(250, 186, 56))
    v.da_giac(elip_xoay(1002, 428, 30, 20, -25), fill=(240, 120, 60, 120))
    v.da_giac(elip_xoay(974, 408, 16, 8, -25), fill=(255, 232, 150, 150))
    v.net([(1030, 401), (1040, 392)], (110, 82, 44), 3, dau_tron=True)
    v.da_giac(elip_xoay(1054, 392, 15, 6, -10), fill=(86, 150, 72))
    # măng cụt
    v.tron(1085, 285, 34, fill=(96, 32, 78))
    v.tron(1074, 275, 11, fill=(150, 80, 130, 120))
    for k in range(4):
        a = math.radians(-90 + (k - 1.5) * 38)
        v.da_giac(elip_xoay(1085 + 15 * math.cos(a), 252 + 9 * math.sin(a) + 4, 10, 5.5, math.degrees(a)), fill=(92, 142, 72))
    # bông hoa chưa kết trái — thứ phải né
    hx, hy = 745, 190
    v.toa(lambda g: g.tron(hx, hy, 34, fill=255), (255, 190, 210), .35, 14)
    for k in range(5):
        a = -90 + k * 72
        v.da_giac(elip_xoay(hx + 13 * math.cos(math.radians(a)), hy + 13 * math.sin(math.radians(a)), 15, 9, a), fill=(255, 226, 236))
    v.tron(hx, hy, 7, fill=(250, 206, 90))


def den_giay(v, cx, cy, w, h, chu=None):
    r = w * .16
    pts = [(cx - w * .34, cy + h / 2)]
    pts += [(cx - w / 2 + r - r * math.cos(math.radians(a)), cy - h / 2 + r - r * math.sin(math.radians(a))) for a in range(0, 91, 10)]
    pts += [(cx + w / 2 - r + r * math.cos(math.radians(a)), cy - h / 2 + r - r * math.sin(math.radians(a))) for a in range(90, -1, -10)]
    pts += [(cx + w * .34, cy + h / 2)]
    v.toa(lambda g: g.da_giac(pts, fill=255), (255, 160, 70), .55, w * .32)
    v.to_doc(lambda g: g.da_giac(pts, fill=255), (cx - w, cy - h / 2, cx + w, cy + h / 2), (236, 132, 58), (255, 210, 130))
    v.toa(lambda g: g.elip(cx, cy + h * .36, w * .2, h * .14, fill=255), (255, 246, 200), .9, w * .08)
    for t in (-.17, .17):
        v.net([(cx + w * t * 1.15, cy - h / 2 + 3), (cx + w * t * .82, cy + h / 2 - 2)], (190, 96, 40, 110), max(1.2, w / 60))
    if chu:
        v.chu((cx, cy - h * .08), chu, ft(w * .17, nghieng), (150, 66, 26, 170), 'mm')


def ve_tha_den(v, tro):
    rd = random.Random(5)
    for _ in range(60):
        x, y = rd.uniform(645, 1130), rd.uniform(100, 515)
        v.tron(x, y, rd.uniform(.7, 1.7), fill=(240, 232, 214, rd.randint(50, 150)))
    for cx, cy, w, h in [(975, 118, 40, 50), (1095, 300, 46, 58), (700, 430, 48, 60)]:
        den_giay(v, cx, cy, w, h)
    den_giay(v, 728, 210, 70, 88)
    den_giay(v, 1050, 196, 82, 102)
    den_giay(v, 880, 300, 128, 158, 'nhẹ lòng')


def la_sen(v, cx, cy, r, khe):
    pts = [(cx, cy)] + [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
                        for a in [khe + 14 + k * 332 / 48 for k in range(49)]]
    v.da_giac(pts, fill=(62, 138, 90))
    v.da_giac([(cx, cy)] + [(cx + r * .78 * math.cos(math.radians(a)), cy + r * .78 * math.sin(math.radians(a)))
                            for a in [khe + 30 + k * 300 / 30 for k in range(31)]], fill=(78, 156, 100))
    for k in range(7):
        a = math.radians(khe + 40 + k * 280 / 6)
        v.net([(cx, cy), (cx + r * .9 * math.cos(a), cy + r * .9 * math.sin(a))], (46, 108, 72, 170), 1.4)


def con_ech(v, cx, cy, k=1.0):
    v.elip(cx - 19 * k, cy + 12 * k, 9 * k, 6 * k, fill=(88, 160, 84))
    v.elip(cx + 19 * k, cy + 12 * k, 9 * k, 6 * k, fill=(88, 160, 84))
    v.elip(cx, cy, 25 * k, 20 * k, fill=(108, 188, 98))
    v.elip(cx, cy + 6 * k, 15 * k, 10 * k, fill=(176, 220, 140))
    for s in (-1, 1):
        ex, ey = cx + s * 11 * k, cy - 16 * k
        v.tron(ex, ey, 8.5 * k, fill=(116, 196, 104))
        v.tron(ex, ey, 5.5 * k, fill=(250, 250, 240))
        v.tron(ex + s * .8 * k, ey + .6 * k, 3 * k, fill=(20, 24, 20))
    v.cung([cx - 8 * k, cy - 8 * k, cx + 8 * k, cy + 1 * k], 20, 160, (40, 90, 46), max(1.2, 1.6 * k))


def bang(v, box, r, ve_trong, bong=True):
    """khung bo góc chứa một cảnh riêng (hồ, bầu trời): vẽ cảnh lên bản sao rồi dán qua mặt nạ bo góc"""
    if bong:
        v.toa(lambda g: g.hcn([box[0], box[1] + 10, box[2], box[3] + 10], r, fill=255), (0, 0, 0), .5, 18)
    ban = v.im.copy(); ve_trong(Ve(ban))
    v.im.paste(ban, (0, 0), v.lop(lambda g: g.hcn(box, r, fill=255)))
    v.hcn(box, r, outline=(255, 255, 255, 38), w=1.5)


def ve_ho_sen(v, tro):
    box = (650, 100, 1130, 512)

    def canh(g):
        g.doc(box, (24, 62, 76), (10, 32, 44))
        for rr, a in [(34, .5), (68, .34), (104, .2), (142, .1)]:
            g.elip(925, 328, rr, rr * .46, outline=(170, 226, 240, round(a * 255)), w=2)
        g.elip(1078, 330, 16, 7, outline=(170, 226, 240, 90), w=1.5)
        g.elip(1078, 330, 30, 13, outline=(170, 226, 240, 45), w=1.5)
        g.da_giac(elip_xoay(905, 468, 20, 8, -12), fill=(240, 140, 60, 210))
        g.da_giac([(887, 472), (872, 462), (874, 480)], fill=(240, 140, 60, 210))
        g.elip(911, 466, 6, 4, fill=(250, 240, 230, 200))
        la_sen(g, 765, 205, 58, 40)
        la_sen(g, 1042, 205, 48, 200)
        la_sen(g, 792, 418, 50, 300)
        la_sen(g, 1052, 428, 40, 130)
        con_ech(g, 765, 205, 1.1)
        con_ech(g, 792, 414, .85)
        for k in range(6):                       # hoa sen trên lá bên phải
            a = -90 + (k - 2.5) * 26
            g.da_giac(elip_xoay(1042 + 13 * math.cos(math.radians(a)), 196 + 13 * math.sin(math.radians(a)), 17, 8, a),
                      fill=(246, 172, 202) if k % 2 else (252, 196, 218))
        g.tron(1042, 200, 7, fill=(250, 218, 110))
    bang(v, box, 30, canh)


def ve_hop_tho(v, tro):
    cx, cy, r = 885, 288, 168
    v.toa(lambda g: g.tron(cx, cy, 130, fill=255), hex2(tro['mau']), .45, 30)
    v.tron(cx, cy, 128, fill=(184, 168, 232, 50))
    v.tron(cx, cy, 98, fill=(184, 168, 232, 36))
    v.tron(cx, cy, r, outline=(184, 168, 232, 70), w=2)
    v.toa(lambda g: g.cung([cx - r, cy - r, cx + r, cy + r], -90, 150, 255, 8), VANG, .6, 6)
    v.cung([cx - r, cy - r, cx + r, cy + r], -90, 150, VANG, 6)
    a = math.radians(150)
    v.tron(cx + r * math.cos(a), cy + r * math.sin(a), 8, fill=(255, 226, 160))
    v.chu((cx, cy - 34), 'Hít vào', ft(30), CHU, 'mm')
    v.chu((cx, cy + 28), '3', ft(92, serif), CHU, 'mm')
    v.chu((cx, 492), 'Thở vuông · 4 · 4 · 4 · 4', ft(22), MO, 'mm')


# Bắc Đẩu: xích kinh (giờ), xích vĩ (độ) và các nét nối — chép từ assets/constellation.js
BAC_DAU = [('Thiên Xu', 11.0621, 61.751, 8), ('Thiên Toàn', 11.0307, 56.382, 7), ('Thiên Cơ', 11.8972, 53.695, 7),
           ('Thiên Quyền', 12.2571, 57.033, 5.5), ('Ngọc Hành', 12.9005, 55.960, 8), ('Khai Dương', 13.3987, 54.925, 7.5),
           ('Dao Quang', 13.7924, 49.313, 7.5)]          # số cuối: cỡ chấm theo độ sáng thật (cấp 1,8 tới 3,3)
BAC_DAU_NOI = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]]


def ve_noi_sao(v, tro):
    rd = random.Random(7)
    for _ in range(80):
        v.tron(rd.uniform(650, 1125), rd.uniform(105, 505), rd.uniform(.7, 1.8), fill=(236, 230, 210, rd.randint(40, 140)))
    k = 18.2
    xy = [((12.4 - ra) * 15 * math.cos(math.radians(55.5)), -(de - 55.5)) for _, ra, de, _ in BAC_DAU]
    ox = 885 - (max(p[0] for p in xy) + min(p[0] for p in xy)) / 2 * k
    oy = 292 - (max(p[1] for p in xy) + min(p[1] for p in xy)) / 2 * k
    pts = [(ox + x * k, oy + y * k) for x, y in xy]

    def cac_net(g, mau, w):
        for a, b in BAC_DAU_NOI:
            g.net([pts[a], pts[b]], mau, w, dau_tron=True)
    v.toa(lambda g: cac_net(g, 255, 6), VANG, .55, 6)
    cac_net(v, VANG + (235,), 3)
    for (ten, _, _, r), (x, y) in zip(BAC_DAU, pts):
        v.toa(lambda g: g.tron(x, y, r * 2.2, fill=255), (255, 246, 222), .65, r * .9)
        v.tron(x, y, r * .62, fill=(255, 252, 240))
    v.chu((pts[0][0] + 14, pts[0][1] - 14), 'Thiên Xu', ft(16), NHAT, 'ls')
    v.chu((pts[6][0], pts[6][1] + 30), 'Dao Quang', ft(16), NHAT, 'mt')
    v.chu((885, 470), 'Bắc Đẩu', ft(30, nghieng), MO, 'mm')


def ve_troi_dem(v, tro):
    box = (650, 100, 1130, 512)
    tren, duoi = (8, 14, 34), (30, 44, 86)

    def canh(g):
        g.doc(box, tren, duoi)
        dai = [(650, 470), (1130, 150)]
        g.toa(lambda m: m.net(dai, 255, 110), (150, 160, 210), .32, 34)
        g.toa(lambda m: m.net(dai, 255, 40), (190, 196, 236), .2, 14)
        rd = random.Random(11)
        for i in range(190):
            if i < 70:                          # dày hơn dọc dải Ngân Hà
                t = rd.random(); x = 650 + 480 * t; y = 470 - 320 * t + rd.gauss(0, 26)
            else:
                x, y = rd.uniform(655, 1125), rd.uniform(105, 470)
            mau = rd.choice([(255, 255, 255), (255, 255, 255), (255, 226, 190), (196, 214, 255)])
            g.tron(x, y, rd.uniform(.6, 2.1) if rd.random() < .92 else 2.6, fill=mau + (rd.randint(120, 255),))
        g.toa(lambda m: m.tron(1035, 185, 52, fill=255), (240, 232, 200), .45, 20)
        khuyet = g.lop(lambda m: m.tron(1035, 185, 32, fill=255))
        khuyet.paste(0, (0, 0), g.lop(lambda m: m.tron(1050, 177, 30, fill=255)))
        g.phu(khuyet, (248, 240, 214))
        g.toa(lambda m: m.tron(772, 248, 10, fill=255), (255, 246, 220), .8, 6)
        g.tron(772, 248, 4.5, fill=(255, 250, 230))
        g.chu((786, 248), 'Sao Kim', ft(16), (200, 206, 232), 'lm')
        g.chu((1035, 232), 'Mặt Trăng', ft(16), (200, 206, 232), 'mm')
        doi = [(x, 456 + 14 * math.sin(x / 70) + 8 * math.sin(x / 23 + 1)) for x in range(650, 1131, 6)]
        g.da_giac(doi + [(1130, 512), (650, 512)], fill=(6, 10, 20))
        for x, ten in [(700, 'Tây'), (885, 'Nam'), (1075, 'Đông')]:
            g.chu((x, 494), ten, ft(15), (120, 132, 170), 'mm')
    bang(v, box, 30, canh)


# giờ hoàng đạo của ngày Tý, đúng như lich.js tính (THAN[thanGio(0, h)].tot)
GIO = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']
KHUNG_GIO = ['23–1h', '1–3h', '3–5h', '5–7h', '7–9h', '9–11h', '11–13h', '13–15h', '15–17h', '17–19h', '19–21h', '21–23h']
GIO_TOT_NGAY_TY = {'Tý', 'Sửu', 'Mão', 'Ngọ', 'Thân', 'Dậu'}


def ve_xem_ngay(v, tro):
    cx, cy, R, r = 885, 300, 186, 104
    mau = hex2(tro['mau'])
    v.tron(cx, cy, R, fill=O_NEN, outline=O_VIEN, w=2)
    for h, ten in enumerate(GIO):
        a = -90 + h * 30
        if ten in GIO_TOT_NGAY_TY:
            v.d.pieslice([(cx - R + 3) * S, (cy - R + 3) * S, (cx + R - 3) * S, (cy + R - 3) * S], a - 15, a + 15, fill=mo(mau, .2))
        v.net([(cx + r * math.cos(math.radians(a + 15)), cy + r * math.sin(math.radians(a + 15))),
               (cx + R * math.cos(math.radians(a + 15)), cy + R * math.sin(math.radians(a + 15)))], O_VIEN, 1.5)
    v.tron(cx, cy, r, fill=(20, 17, 32), outline=O_VIEN, w=2)
    for h, ten in enumerate(GIO):
        a = math.radians(-90 + h * 30); tot = ten in GIO_TOT_NGAY_TY
        x, y = cx + 146 * math.cos(a), cy + 146 * math.sin(a)
        v.chu((x, y - 9), ten, ft(21), mau if tot else MO, 'mm')
        v.chu((x, y + 13), KHUNG_GIO[h], ft(12.5), CHU if tot else NHAT, 'mm')
    v.chu((cx, cy - 18), 'Giờ', ft(28, serif), CHU, 'mm')
    v.chu((cx, cy + 14), 'hoàng đạo', ft(26, serif), mau, 'mm')
    v.chu((cx, cy + 46), 'ngày Tý', ft(15), NHAT, 'mm')


# biểu đồ ngày sinh 15/9/1987, đúng như sohoc.js tính: số chủ đạo 4, mũi tên Quyết tâm (1-5-9) và Hoạt động (7-8-9)
NGAY_SINH = '15/9/1987'
O_SO = [[3, 6, 9], [2, 5, 8], [1, 4, 7]]


def ve_than_so(v, tro):
    dem = {c: NGAY_SINH.count(str(c)) for c in range(1, 10)}
    mau = hex2(tro['mau'])
    x0, y0, o, kc = 650, 128, 100, 14

    def tam(so):
        for i, hang in enumerate(O_SO):
            if so in hang:
                j = hang.index(so); return x0 + j * (o + kc) + o / 2, y0 + i * (o + kc) + o / 2
    for hang in O_SO:
        for so in hang:
            x, y = tam(so)
            co = dem[so] > 0
            v.hcn([x - o / 2, y - o / 2, x + o / 2, y + o / 2], 18, fill=O_NEN, outline=mau if co else O_VIEN, w=2.5 if co else 2)

    def mui(g, mau_net, w):
        g.net([tam(1), tam(5), tam(9)], mau_net, w, dau_tron=True)
        g.net([tam(7), tam(8), tam(9)], mau_net, w, dau_tron=True)
    v.toa(lambda g: mui(g, 255, 10), VANG, .45, 8)
    mui(v, VANG + (150,), 4)
    for hang in O_SO:
        for so in hang:
            x, y = tam(so)
            if dem[so]:
                v.chu((x, y), str(so) * dem[so], ft(40, serif), CHU, 'mm', vien=3, mau_vien=O_NEN)
            else:
                v.chu((x, y), str(so), ft(26, serif), (90, 82, 112), 'mm')
    bx = 1000
    v.chu((bx + 64, 140), 'Sinh ' + NGAY_SINH, ft(16), NHAT, 'mm')
    v.hcn([bx, 166, bx + 128, 300], 20, fill=O_NEN, outline=VANG, w=3)
    v.chu((bx + 64, 192), 'Số chủ đạo', ft(15), MO, 'mm')
    v.chu((bx + 64, 252), '4', ft(64, serif), VANG, 'mm')
    v.chu((bx + 64, 328), '1+5+9+1+9+8+7', ft(14), NHAT, 'mm')
    v.chu((bx + 64, 350), '= 40 → 4', ft(14), NHAT, 'mm')
    v.chu((bx + 64, 400), 'Mũi tên', ft(15), MO, 'mm')
    v.chu((bx + 64, 424), 'Quyết tâm', ft(17), VANG, 'mm')
    v.chu((bx + 64, 448), 'Hoạt động', ft(17), VANG, 'mm')


def ve_nhac_ngu(v, tro):
    mau = hex2(tro['mau'])
    cx, cy = 985, 200
    v.toa(lambda g: g.tron(cx, cy, 80, fill=255), mau, .4, 30)
    trang = v.lop(lambda g: g.tron(cx, cy, 64, fill=255))
    trang.paste(0, (0, 0), v.lop(lambda g: g.tron(cx + 28, cy - 16, 58, fill=255)))
    v.phu(trang, mau)
    for x, y, r in [(760, 160, 9), (840, 230, 6), (1100, 120, 7), (720, 270, 5)]:
        v.da_giac(sao_nhon(x, y, r, r * .3, 4), fill=mau + (200,))
    for i, (y0, a) in enumerate([(372, 220), (404, 150), (436, 90)]):
        pts = []
        for x in range(660, 1112, 4):
            bien = (22 - i * 4) * (1 - (x - 660) / 452 * .88)
            pts.append((x, y0 + bien * math.sin((x - 660) / 34 + i)))
        v.net(pts, mau + (a,), 3)
    v.hcn([742, 470, 1028, 512], 21, fill=O_NEN, outline=O_VIEN, w=2)
    v.chu((885, 491), 'Hẹn 30 phút · nhỏ dần rồi tắt', ft(18), MO, 'mm')


# màu chấm bảy luân xa, chép từ assets/luanxa.js (gốc → đỉnh)
MAU_LUAN_XA = ['#e0584f', '#ef8a3c', '#f2c94c', '#5fbf77', '#4fa3e0', '#5b6ad0', '#a97ddb']


def ve_luan_xa(v, tro):
    cx = 885
    mau = hex2(tro['mau'])

    def than(g, f):
        g.tron(cx, 164, 30, fill=f)
        g.hcn([cx - 11, 186, cx + 11, 216], 8, fill=f)
        g.elip(cx, 232, 64, 20, fill=f)
        g.da_giac([(cx - 60, 236), (cx + 60, 236), (cx + 50, 300), (cx + 64, 370), (cx - 64, 370), (cx - 50, 300)], fill=f)
        for s in (-1, 1):
            g.net([(cx + s * 54, 240), (cx + s * 76, 318), (cx + s * 104, 374)], f, 24, dau_tron=True)
        g.elip(cx, 398, 160, 40, fill=f)
    v.toa(lambda g: g.tron(cx, 166, 70, fill=255), mau, .22, 30)
    v.toa(lambda g: than(g, 255), mau, .3, 14)
    than(v, (58, 44, 90))
    for i, y in enumerate([382, 348, 310, 266, 222, 162, 120]):
        m = hex2(MAU_LUAN_XA[i])
        v.toa(lambda g: g.tron(cx, y, 20, fill=255), m, .9, 9)
        v.tron(cx, y, 8.5, fill=tron(m, (255, 255, 255), .25))
    v.tron(cx, 120, 19, outline=hex2(MAU_LUAN_XA[6]) + (150,), w=2)


def khoi(v, x, y, a, h, tren=(78, 86, 186), trai=(52, 57, 132), phai=(36, 40, 98)):
    v.da_giac([(x - a, y), (x, y + a / 2), (x, y + a / 2 + h), (x - a, y + h)], fill=trai)
    v.da_giac([(x, y + a / 2), (x + a, y), (x + a, y + h), (x, y + a / 2 + h)], fill=phai)
    v.da_giac([(x, y - a / 2), (x + a, y), (x, y + a / 2), (x - a, y)], fill=tren, outline=(116, 126, 226), w=1.5)


def robot(v, x, y, k=1.0):
    v.elip(x, y + 4 * k, 26 * k, 9 * k, fill=(0, 0, 0, 90))
    v.elip(x, y - 22 * k, 20 * k, 24 * k, fill=(232, 236, 248))
    v.elip(x - 6 * k, y - 30 * k, 7 * k, 10 * k, fill=(255, 255, 255, 160))
    v.tron(x, y - 58 * k, 19 * k, fill=(240, 243, 252))
    v.elip(x, y - 57 * k, 14 * k, 9 * k, fill=(28, 32, 58))
    v.tron(x - 5.5 * k, y - 57 * k, 2.8 * k, fill=(120, 224, 255))
    v.tron(x + 5.5 * k, y - 57 * k, 2.8 * k, fill=(120, 224, 255))
    v.net([(x, y - 77 * k), (x, y - 88 * k)], (200, 206, 228), 2 * k)
    v.toa(lambda g: g.tron(x, y - 90 * k, 8 * k, fill=255), (255, 200, 90), .7, 4 * k)
    v.tron(x, y - 90 * k, 4 * k, fill=(255, 210, 110))


# biểu tượng và màu ô lệnh, chép từ assets/laptrinh.js và app.css (.lt-xanh, .lt-vang, .lt-cam)
O_LENH = [('Đi', 'M12 19V6M6.5 11.5L12 6l5.5 5.5', ('#4f8ef0', '#2f63c4'), (255, 255, 255)),
          ('Nhảy', 'M4 19h5v-5h5V9h6M8 11c1-4 4-6 8-6M13.5 3.5L16 5l-1.5 2.5', ('#4f8ef0', '#2f63c4'), (255, 255, 255)),
          ('Thắp', 'M12 3.5l2.4 5 5.4.6-4 3.7 1.1 5.4L12 15.5l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z', ('#f2c04a', '#d18f1c'), (42, 26, 0)),
          ('Lặp', 'M5 12a7 7 0 0 1 12-5l2 2M19 4v5h-5M19 12a7 7 0 0 1-12 5l-2-2M5 20v-5h5', ('#f2944a', '#cc5f1d'), (255, 255, 255))]


def ve_robot(v, tro):
    a, hz, cx, cy = 52, 30, 885, 238
    o = [(0, 0, 0), (1, 0, 0), (2, 0, 1), (3, 0, 1)]
    vi = lambda i, j, z: (cx + (i - j - 1.5) * a, cy + (i + j - 1.5) * a / 2 - z * hz + 10)
    for i, j, z in sorted(o, key=lambda t: (t[0] + t[1], t[2])):
        x, y = vi(i, j, z)
        khoi(v, x, y, a, 46 + z * hz)
    x, y = vi(3, 0, 1)
    v.toa(lambda g: g.da_giac(sao_nhon(x, y - 6, 28, 12), fill=255), (255, 200, 80), .8, 12)
    v.da_giac(sao_nhon(x, y - 6, 22, 9.5), fill=(255, 214, 102))
    x, y = vi(0, 0, 0)
    robot(v, x, y + 4)
    w, kc = 70, 14
    x0 = 885 - (4 * w + 3 * kc) / 2
    for k, (ten, d, (m1, m2), mc) in enumerate(O_LENH):
        x = x0 + k * (w + kc); box = (x, 420, x + w, 420 + w)
        v.toa(lambda g: g.hcn(box, 16, fill=255), (0, 0, 0), .45, 8)
        v.to_doc(lambda g: g.hcn(box, 16, fill=255), box, hex2(m1), hex2(m2))
        bieu_tuong(v, d, x + w / 2 - 14, 428, 28, mc, 2.6)
        v.chu((x + w / 2, 474), ten, ft(13.5), mc, 'mm')


# màn 38 trong assets/mansoko.js (3 thùng, ba ổ nằm một hàng)
MAN_SOKO = ['########', '#   #  #', '#    $ #', '####   #', '#...$$##', '# # @  #', '#      #', '########']


def ve_sokoban(v, tro):
    rows = [r.ljust(max(map(len, MAN_SOKO))) for r in MAN_SOKO]
    R, C, o, cao = len(rows), len(rows[0]), 47, 14       # cao: mặt trước của tường, cho tường nổi lên như trong trò
    x0, y0 = 885 - C * o / 2, 312 - R * o / 2
    ngoi = next((i, j) for i, r in enumerate(rows) for j, ch in enumerate(r) if ch in '@+')
    trong, ds = {ngoi}, [ngoi]                    # ô trong tường: loang từ chỗ robot đứng
    while ds:
        i, j = ds.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (i + di, j + dj)
            if 0 <= n[0] < R and 0 <= n[1] < C and n not in trong and rows[n[0]][n[1]] != '#':
                trong.add(n); ds.append(n)
    v.toa(lambda g: [g.hcn([x0 + j * o, y0 + i * o, x0 + (j + 1) * o, y0 + (i + 1) * o + 8], 0, fill=255)
                     for i in range(R) for j in range(C) if rows[i][j] == '#' or (i, j) in trong], (0, 0, 0), .55, 14)
    for (i, j) in trong:
        x, y = x0 + j * o, y0 + i * o
        v.d.rectangle([x * S, y * S, (x + o) * S, (y + o) * S], fill=(36, 40, 88), outline=(50, 56, 112), width=S)
    for (i, j) in trong:
        if rows[i][j] in '.*+':
            x, y = x0 + j * o + o / 2, y0 + i * o + o / 2
            v.tron(x, y, o * .34, fill=(26, 28, 62), outline=VANG + (210,), w=2.5)
            v.da_giac(sao_nhon(x, y + 1, o * .18, o * .075), outline=VANG + (210,), w=1.5)
    for i in range(R):
        for j in range(C):
            ch = rows[i][j]
            x, y = x0 + j * o, y0 + i * o
            if ch == '#':
                if i + 1 >= R or rows[i + 1][j] != '#':
                    v.d.rectangle([x * S, (y + o - cao) * S, (x + o) * S, (y + o) * S], fill=(74, 82, 164))
                v.d.rectangle([x * S, (y - cao) * S, (x + o) * S, (y + o - cao) * S], fill=(152, 162, 240), outline=(178, 186, 248), width=S)
            elif ch in '$*':
                sang = ch == '*'
                v.hcn([x + 5, y - 6, x + o - 5, y + o - 5], 7, fill=(178, 120, 62), outline=(222, 168, 102), w=2)
                v.hcn([x + 5, y + o - 16, x + o - 5, y + o - 5], 5, fill=(126, 80, 40))
                if sang:
                    v.toa(lambda g: g.da_giac(sao_nhon(x + o / 2, y + o / 2 - 8, 22, 10), fill=255), (255, 214, 110), .9, 9)
                v.da_giac(sao_nhon(x + o / 2, y + o / 2 - 8, 13, 5.5), fill=(255, 228, 140) if sang else (222, 182, 112))
            elif ch in '@+':
                robot(v, x + o / 2, y + o * .8, .55)


# bàn bida, số đo chép từ assets/bida.js (WPA): mặt bàn 2,54 × 1,27 m, bi 57,15 mm, miệng lỗ góc 4⅝", lỗ giữa 5⅛";
# màu bi theo bộ Aramith. Ảnh vẽ nửa bàn phía chân (gần, bi to cho đọc được số): tam giác 15 bi ở chấm chân bàn, bi 8 giữa
# hàng ba, hai góc hàng cuối một trơn một sọc; bi chủ, đường ngắm và cơ sắp phá.
MAU_BIDA = ['#f4f1e8', '#f3bf12', '#1b4fb4', '#d4291e', '#56288c', '#f06c15', '#0d7a44', '#7b1e1a', '#151515']
TAM_GIAC = [[1], [9, 2], [10, 8, 3], [11, 4, 12, 5], [13, 6, 14, 15, 7]]


def bi_bida(v, x, y, r, so):
    nga, mau = hex2(MAU_BIDA[0]), hex2(MAU_BIDA[so if so <= 8 else so - 8])
    v.toa(lambda g: g.tron(x + r * .3, y + r * .4, r * 1.02, fill=255), (0, 0, 0), .5, r * .3)
    if so >= 9:                                       # bi sọc: trắng, dải màu ngang giữa bi
        v.tron(x, y, r, fill=nga)
        t0 = math.asin(.56)
        cung = [-t0 + 2 * t0 * i / 20 for i in range(21)]
        v.da_giac([(x + r * math.cos(a), y + r * math.sin(a)) for a in cung] + [(x - r * math.cos(a), y - r * math.sin(a)) for a in cung], fill=mau)
    else:
        v.tron(x, y, r, fill=mau)
    if so > 0:
        v.tron(x, y, r * .5, fill=nga)
        v.chu((x, y + r * .03), str(so), ft(r * (.64 if so < 10 else .52)), (24, 22, 22), 'mm')
    else:
        v.tron(x + r * .25, y - r * .1, r * .16, fill=(200, 36, 40))   # chấm đỏ của bi chủ
    v.toa(lambda g: g.tron(x - r * .38, y - r * .42, r * .32, fill=255), (255, 255, 255), .75, r * .14)


def ve_bida(v, tro):
    k, DB = 600, 0.05715                              # cận cảnh: 600 điểm ảnh một mét, bi to cỡ 34 điểm
    r = DB / 2 * k
    ra = lambda x, y: (1140 - (2.54 - x) * k, 315 - (y - .635) * k)
    X0 = 600                                          # nỉ bắt đầu từ đây (bên trái là chữ)
    from PIL import ImageChops
    cat = v.lop(lambda g: g.d.rectangle([X0 * S, 0, 1140 * S, H * S], fill=255))
    def den(cx, cy, rx, ry, mau, a, nhoe):            # quầng sáng chỉ trên nỉ, không tràn sang chữ
        m = v.lop(lambda g: g.elip(cx, cy, rx, ry, fill=255)).filter(ImageFilter.GaussianBlur(nhoe * S))
        v.phu(ImageChops.multiply(m, cat), mau, a)
    v.d.rectangle([X0 * S, 0, 1140 * S, H * S], fill=hex2('#125a3a'))
    cx, cy = ra(1.98, .635)
    den(cx - 40, cy, 360, 270, hex2('#2fa36e'), .8, 95)       # đèn rọi xuống bàn
    den(cx - 40, cy, 170, 130, hex2('#45c086'), .35, 70)
    for i in range(50):                               # mép trái nỉ chìm dần vào nền
        v.d.rectangle([(X0 + i * 2) * S, 0, (X0 + i * 2 + 2) * S, H * S], fill=(20, 17, 38, round(255 * (1 - i / 50) ** 1.8)))
    # băng chân bàn và khung gỗ bên phải, ba chấm ngắm
    v.to_doc(lambda g: g.d.rectangle([1140 * S, 0, 1167 * S, H * S], fill=255), (1140, 0, 1167, H), hex2('#1b8052'), hex2('#135c3b'))
    v.d.line([(1140 * S, 0), (1140 * S, H * S)], fill=(150, 230, 180, 90), width=2 * S)
    v.to_doc(lambda g: g.d.rectangle([1167 * S, 0, W * S, H * S], fill=255), (1167, 0, W, H), hex2('#6e4024'), hex2('#4a2a12'))
    for y in (.3175, .635, .9525):
        X, Y = ra(2.54 + .095, y)
        v.da_giac([(X, Y - 7), (X + 4.5, Y), (X, Y + 7), (X - 4.5, Y)], fill=(240, 230, 208))
    # tam giác 15 bi ở chấm chân bàn, bi chủ, đường ngắm tới bóng bi chủ, cơ
    K = DB + .0004
    vt = {}
    for h, hang in enumerate(TAM_GIAC):
        for i, so in enumerate(hang):
            vt[so] = (1.905 + h * K * math.sqrt(3) / 2, .635 + (i - h / 2) * K)
    cai = (1.745, .49)
    tx, ty = 1.905 - DB, .635
    A, Bm = ra(*cai), ra(tx, ty)
    for t in range(16):
        p0, p1 = t / 16, (t + .5) / 16
        v.net([(A[0] + (Bm[0] - A[0]) * p0, A[1] + (Bm[1] - A[1]) * p0), (A[0] + (Bm[0] - A[0]) * p1, A[1] + (Bm[1] - A[1]) * p1)], (255, 255, 255, 200), 2.5)
    v.tron(Bm[0], Bm[1], r, outline=(255, 255, 255, 235), w=2.5)
    for so in sorted(vt, key=lambda s: vt[s][0]):
        bi_bida(v, *ra(*vt[so]), r, so)
    bi_bida(v, *A, r, 0)
    ux, uy = tx - cai[0], ty - cai[1]
    n = math.hypot(ux, uy); ux, uy = ux / n, uy / n
    for (t0, t1, mau) in [(.018, .026, (61, 120, 201)), (.026, .05, (241, 236, 224)), (.05, .9, (228, 198, 142))]:
        a, b = ra(cai[0] - ux * (DB / 2 + t0), cai[1] - uy * (DB / 2 + t0)), ra(cai[0] - ux * (DB / 2 + t1), cai[1] - uy * (DB / 2 + t1))
        if b[0] < X0 - 35:                            # cơ thò ra khỏi mép nỉ một chút rồi thôi
            b = (X0 - 35, a[1] + (b[1] - a[1]) * (a[0] - X0 + 35) / max(1e-6, a[0] - b[0]))
        v.net([a, b], mau, (.0066 + t1 * .006) * 2 * k)


# hình bàn cờ, chép từ assets/coba.js: lục giác đỉnh ở 240° + 60°·i, Trắng ở cạnh dưới; diều n gồm tâm, trung điểm
# M_{n−1}, đỉnh V_n, trung điểm M_n; ô (p, q) lấy bốn góc theo nội suy song tuyến (đúng bằng sáng chế Zubrin).
DINH = [(math.cos(math.radians(240 + 60 * i)), math.sin(math.radians(240 + 60 * i))) for i in range(6)]
GIUA = [((DINH[i][0] + DINH[(i + 1) % 6][0]) / 2, (DINH[i][1] + DINH[(i + 1) % 6][1]) / 2) for i in range(6)]
MAU_QUAN = [((255, 253, 246), (59, 47, 34)), ((224, 71, 58), (58, 11, 7)), ((54, 61, 82), (223, 230, 251))]  # Trắng, Đỏ, Đen
TONG_NHA = ['#f6e7c8', '#e06a5a', '#56607c']
HANG_QUAN = '♜♞♝♛♚♝♞♜'                       # xe mã tượng hậu vua tượng mã xe, hậu bên trái vua


def diem_dieu(n, p, q):
    u, w = p / 4, q / 4
    M1, M0, V = GIUA[n], GIUA[(n + 5) % 6], DINH[n]
    return (u * (1 - w) * M1[0] + (1 - u) * w * M0[0] + u * w * V[0], u * (1 - w) * M1[1] + (1 - u) * w * M0[1] + u * w * V[1])


def ve_co_ba(v, tro):
    cx, cy, R = 885, 306, 196
    ra = lambda p: (cx + p[0] * R, cy - p[1] * R)
    vanh = [ra((x * 1.075, y * 1.075)) for x, y in DINH]
    v.toa(lambda g: g.da_giac([(x, y + 10) for x, y in vanh], fill=255), (0, 0, 0), .6, 16)
    v.to_doc(lambda g: g.da_giac(vanh, fill=255), (cx - R, cy - R, cx + R, cy + R), hex2('#7a5034'), hex2('#4a2e1b'))
    for P in range(3):
        a, b = DINH[2 * P], DINH[2 * P + 1]
        v.da_giac([ra((a[0] * 1.065, a[1] * 1.065)), ra((b[0] * 1.065, b[1] * 1.065)),
                   ra((b[0] * 1.012, b[1] * 1.012)), ra((a[0] * 1.012, a[1] * 1.012))],
                  fill=[hex2('#efe6d2'), hex2('#e0473a'), hex2('#363d52')][P])
    quan = []
    for c in range(96):
        P, f, r = c >> 5, c & 7, ((c >> 3) & 3) + 1
        n, p, q = (2 * P, 4 - r, 3 - f) if f < 4 else (2 * P + 1, f - 4, 4 - r)
        goc = [ra(diem_dieu(n, p, q)), ra(diem_dieu(n, p + 1, q)), ra(diem_dieu(n, p + 1, q + 1)), ra(diem_dieu(n, p, q + 1))]
        toi = (f + r) & 1
        v.da_giac(goc, fill=tron(hex2('#b48b62' if toi else '#ecdcb9'), hex2(TONG_NHA[P]), .13 if P else .06),
                  outline=(70, 45, 25, 90), w=1)
        if r <= 2:
            t = ra(diem_dieu(n, p + .5, q + .5))
            co = min(math.hypot(goc[k][0] - goc[(k + 1) % 4][0], goc[k][1] - goc[(k + 1) % 4][1]) for k in range(4))
            quan.append((t[1], t[0], HANG_QUAN[f] if r == 1 else '♟', P, co))
    v.da_giac(sao_nhon(cx, cy, R * .045, R * .045 * .45, 6), fill=hex2('#e8c070'), outline=hex2('#7a5a22'), w=1)
    for y, x, kt, P, co in sorted(quan):
        than, vien = MAU_QUAN[P]
        v.chu((x, y - co * .08), kt, ft(co * 1.02), than, 'mm', vien=1.4, mau_vien=vien)


# ======================================================================================================
#  BẢNG CÁC TRÒ — tieuDe phải trùng assets/app.js; mô tả là "chú thích" riêng của từng trò
# ======================================================================================================

TRO = [
    dict(duong='phat-am', trang='luyen-phat-am/', so=1, viet=False, mau='#e8c37a', ve=ve_phat_am,
         tieu=('Luyện phát âm', 'tiếng Anh'),
         dong=['Bảng 44 âm · giọng người bản xứ', 'Xem miệng và lưỡi đặt ở đâu', 'Nói thử cho máy nghe']),
    dict(duong='mua-chin', trang='mua-chin/', so=1, mau='#8fd6c2', ve=ve_mua_chin,
         tieuDe='Mùa Chín — đưa nắng cho trái chín', tieu=('Mùa Chín', 'đưa nắng cho trái chín'),
         dong=['Miết tay cho vệt nắng đi qua', 'Nắng tới đâu, trái chín tới đó', 'Né bông hoa chưa kết trái'],
         moTa='Miết ngón tay cho vệt nắng đi qua: nắng chạm tới đâu, trái chín tới đó — dưa hấu, cam, xoài, thanh long, '
              'măng cụt. Chín liền tay được nhân điểm, nhớ né bông hoa chưa kết trái. Miễn phí, không cần tài khoản.',
         alt='Mùa Chín: vệt nắng đi qua, trái dưa hấu tách đôi', mo='Mở trò Mùa Chín'),
    dict(duong='tha-den', trang='tha-den-hoa-dang/', so=1, mau='#f0a860', ve=ve_tha_den,
         tieuDe='Thả đèn hoa đăng', tieu=('Thả đèn', 'hoa đăng'),
         dong=['Gõ ra điều đang nặng lòng', 'Chữ thành đèn giấy bay lên', 'Không lưu, không gửi đi đâu'],
         moTa='Gõ ra điều đang nặng lòng rồi bấm Thả đi: chữ thành chiếc đèn giấy bay lên, mờ dần rồi tắt. Không lưu '
              'lại, không gửi đi đâu, đóng màn hình là mất sạch. Miễn phí, không cần tài khoản.',
         alt='Thả đèn hoa đăng: những chiếc đèn giấy bay lên trời đêm', mo='Mở phần thả đèn hoa đăng'),
    dict(duong='ho-sen', trang='ho-sen/', so=1, mau='#7ec8e3', ve=ve_ho_sen,
         tieuDe='Hồ sen và đàn ếch', tieu=('Hồ sen', 'và đàn ếch'),
         dong=['Chạm nước cho sóng lan ra', 'Chạm ếch, ếch phóng sang lá khác', 'Không nhiệm vụ, ngồi xem cũng vui'],
         moTa='Chạm mặt nước cho sóng lan ra, chạm vào chú ếch để nó phóng sang lá sen khác. Lá trôi theo gió, chở quá '
              'sức thì chìm; có cá, nòng nọc, lâu lâu mưa rơi. Không có nhiệm vụ, ngồi xem cũng được.',
         alt='Hồ sen: ếch ngồi trên lá sen, sóng lan trên mặt nước', mo='Mở hồ sen'),
    dict(duong='hoi-tho', trang='hop-tho/', so=1, mau='#b8a8e8', ve=ve_hop_tho,
         tieuDe='Hộp thở — thở cho dịu lại', tieu=('Hộp thở', 'thở cho dịu lại'),
         dong=['Năm kiểu thở cho từng lúc', 'Vòng tròn phồng xẹp theo nhịp', 'Thở vuông, 4–7–8, thở cộng hưởng'],
         moTa='Năm kiểu thở cho từng lúc: cần dịu lại, đang lo lắng, cần tập trung, muốn ngồi yên lâu, khó ngủ. Vòng '
              'tròn phồng xẹp theo nhịp, đếm từng giây, máy rung nhẹ khi đổi nhịp. Miễn phí, không cần tài khoản.',
         alt='Hộp thở: vòng tròn đếm nhịp hít vào', mo='Mở hộp thở'),
    dict(duong='noi-sao', trang='noi-sao-thanh-chom/', so=1, mau='#f2ead0', nhan='#e8c37a', ve=ve_noi_sao,
         tieuDe='Nối sao thành chòm', tieu=('Nối sao', 'thành chòm'),
         dong=['Tám chòm sao, gọi theo tên Việt', 'App tự nối từng nét', 'Kéo để xoay, thấy sao gần sao xa'],
         moTa='Xem từng nét nối thành Bắc Đẩu, Tua Rua, Ngưu Lang Chức Nữ, Sư Tử… kèm lời giải thích và ca dao. Nối xong '
              'kéo để xoay: sao gần sao xa khác nhau nên chòm méo đi, vỡ ra. Miễn phí, không cần tài khoản.',
         alt='Nối sao thành chòm: bảy ngôi Bắc Đẩu nối bằng nét vàng', mo='Mở phần nối sao thành chòm'),
    dict(duong='troi-dem', trang='bau-troi-dem-nay/', so=1, mau='#aebff0', ve=ve_troi_dem,
         tieuDe='Bầu trời đêm nay', tieu=('Bầu trời', 'đêm nay'),
         dong=['Mặt Trời, Mặt Trăng, năm hành tinh', '5.080 sao thật và dải Ngân Hà', 'Giơ máy lên, thấy trời phía đó'],
         moTa='Bầu trời thật ở chỗ bạn đứng, đúng lúc này: Mặt Trời, Mặt Trăng, năm hành tinh, 5.080 ngôi sao và dải '
              'Ngân Hà. Giơ điện thoại lên, hướng về đâu thấy trời phía đó. Tính ngay trên máy bằng công thức thiên văn.',
         alt='Bầu trời đêm nay: trăng, sao và dải Ngân Hà trên chân trời', mo='Mở bầu trời đêm nay'),
    dict(duong='xem-ngay', trang='xem-ngay-tot-xau/', so=1, mau='#e58a7a', ve=ve_xem_ngay,
         tieuDe='Xem ngày tốt xấu', tieu=('Xem ngày', 'tốt xấu'),
         dong=['Hoàng đạo hay hắc đạo, giờ tốt', 'Nên và không nên làm gì', 'Tìm ngày tốt cho việc định làm'],
         moTa='Hôm nay hoàng đạo hay hắc đạo, nên và không nên làm gì, giờ hoàng đạo. Gõ việc định làm — khai trương, '
              'chuyển nhà, cưới hỏi — app tìm năm ngày tốt nhất trong 60 ngày tới, tránh ngày xung tuổi.',
         alt='Xem ngày tốt xấu: vòng mười hai giờ, sáu giờ hoàng đạo sáng lên', mo='Mở phần xem ngày tốt xấu'),
    dict(duong='than-so', trang='than-so-hoc/', so=1, mau='#b99ae8', ve=ve_than_so,
         tieuDe='Thần số học', tieu=('Thần số học', 'Pythagoras'),
         dong=['Số chủ đạo, cộng từng bước', 'Biểu đồ ngày sinh và mũi tên', 'Linh hồn · Nhân cách · Sứ mệnh'],
         moTa='Nhập ngày sinh để xem số chủ đạo kèm từng bước cộng, biểu đồ ngày sinh và các mũi tên, năm cá nhân, bốn '
              'đỉnh cao. Thêm họ tên để xem chỉ số Linh hồn, Nhân cách, Sứ mệnh. Theo thần số học Pythagoras.',
         alt='Thần số học: biểu đồ ngày sinh 3×3 và mũi tên', mo='Mở phần thần số học'),
    dict(duong='nhac-ngu', trang='nhac-ngu/', so=1, mau='#f3dfa0', ve=ve_nhac_ngu,
         tieuDe='Nhạc ngủ — hẹn giờ tự tắt', tieu=('Nhạc ngủ', 'hẹn giờ tự tắt'),
         dong=['Sáu âm: nhạc ru, sóng biển, mưa…', 'Hẹn 15 đến 90 phút', 'Âm nhỏ dần rồi tự tắt'],
         moTa='Sáu âm ru ngủ: nhạc ru 60 nhịp mỗi phút, sóng biển, mưa nhẹ, tiếng ồn nâu, sóng delta, 432 Hz. Hẹn 15 đến '
              '90 phút rồi tắt màn hình: âm nhỏ dần rồi tự tắt, không mở suốt đêm. Miễn phí, không cần tài khoản.',
         alt='Nhạc ngủ: trăng lưỡi liềm và sóng âm nhỏ dần', mo='Mở nhạc ngủ'),
    dict(duong='thien-luan-xa', trang='thien-luan-xa/', so=1, mau='#f2a7c3', ve=ve_luan_xa,
         tieuDe='Thiền bảy luân xa', tieu=('Thiền', 'bảy luân xa'),
         dong=['Từ luân xa gốc lên đỉnh đầu', 'Tụng theo đàn tanpura, chuông xoay', 'Hoặc thiền riêng một luân xa'],
         moTa='Một buổi thiền qua bảy luân xa từ gốc lên đỉnh: tụng chủng tử theo đàn tanpura, chuông xoay ngân theo '
              'hơi thở, nhịp thở 4 – 6. Hoặc chọn thiền riêng một luân xa từ 5 đến 20 phút. Miễn phí, không cần tài khoản.',
         alt='Thiền bảy luân xa: bảy điểm sáng dọc thân người ngồi thiền', mo='Mở phần thiền bảy luân xa'),
    dict(duong='lap-trinh', trang='robot-thap-sao/', so=1, mau='#8fd0ff', ve=ve_robot,
         tieuDe='Robot thắp sao — lập trình cho bé', tieu=('Robot thắp sao', 'lập trình cho bé'),
         dong=['100 bài cho bé 6–10 tuổi', 'Xếp ô lệnh có hình, ít chữ', 'Vòng lặp, hàm, điều kiện'],
         moTa='100 bài lập trình cho bé 6–10 tuổi: xếp ô lệnh có hình để chú robot đi trên các khối đá bay, thắp sáng '
              'những ngôi sao còn tắt. Học thứ tự, vòng lặp, hàm, điều kiện và cách sửa lỗi. Miễn phí, không cần tài khoản.',
         alt='Robot thắp sao: chú robot trên khối đá và các ô lệnh', mo='Mở Robot thắp sao'),
    dict(duong='day-thung', trang='day-thung-sao/', so=1, mau='#f2c46b', ve=ve_sokoban,
         tieuDe='Đẩy thùng sao — Sokoban', tieu=('Đẩy thùng sao', 'Sokoban 100 màn'),
         dong=['Đẩy thùng vào ổ cho sao sáng lên', 'Màn nào cũng giải được', 'Đẩy càng ít, càng nhiều sao'],
         moTa='Sokoban 100 màn do máy tự tạo, màn nào cũng giải được: chú robot đẩy thùng sao vào ổ, mọi thùng sáng là '
              'xong màn. Từ một tới năm thùng, đẩy càng ít lần càng được nhiều sao. Miễn phí, không cần tài khoản.',
         alt='Đẩy thùng sao: một màn Sokoban với thùng sao và ổ', mo='Mở Đẩy thùng sao'),
    dict(duong='co-ba-nguoi', trang='co-vua-ba-nguoi/', so=2, mau='#e9b3a8', ve=ve_co_ba,
         tieuDe='Cờ vua ba người', tieu=('Cờ vua', 'ba người'),
         dong=['Trắng, Đen, Đỏ trên bàn lục giác', 'Tạo phòng, mỗi người một máy', 'Còn vua cuối cùng thì thắng'],
         moTa='Trắng, Đen, Đỏ trên bàn lục giác 96 ô. Tạo phòng mời bạn bè, mỗi người một máy, ghế trống thì máy chơi '
              'thay; hoặc đấu với hai máy. Luật Tam quốc: giết vua là chiếm cả đạo quân. Miễn phí, không cần tài khoản.',
         alt='Cờ vua ba người: bàn lục giác với quân Trắng, Đen, Đỏ', mo='Mở Cờ vua ba người',
         # link mời vào phòng (…/co-vua-ba-nguoi/?phong=MÃ) thì chuyển thẳng vào phòng đó
         chuyen="var m = /[?&]phong=([A-HJ-NP-Z2-9]{6})/.exec(location.search); location.replace('../#co-ba-nguoi' + (m ? '/' + m[1] : ''));"),
    dict(duong='bida', trang='bida-lo/', so=1, mau='#a6e07c', ve=ve_bida,
         tieuDe='Bida lỗ — 8 bi, 9 bi', tieu=('Bida lỗ', '8 bi · 9 bi'),
         dong=['Bi trượt, lăn, xoáy như bàn thật', 'Tạo phòng, mỗi người một máy', 'Hay đấu với máy Sóc, Cú, Cáo'],
         moTa='Bida lỗ 8 bi và 9 bi trên bàn 9 feet đúng cỡ: bi trượt rồi lăn, đánh đâm, kéo, đẩy, xoáy ngang như thật. Tạo '
              'phòng mời bạn bè, mỗi người một máy, ghế trống thì máy chơi thay; hoặc đấu với máy. Miễn phí, không cần tài khoản.',
         alt='Bida lỗ: tam giác 15 bi trên bàn nỉ xanh, bi chủ và cơ sắp phá', mo='Mở Bida lỗ',
         # link mời vào phòng (…/bida-lo/?phong=MÃ) thì chuyển thẳng vào phòng đó
         chuyen="var m = /[?&]phong=([A-HJ-NP-Z2-9]{6})/.exec(location.search); location.replace('../#bida' + (m ? '/' + m[1] : ''));"),
]


def ve_anh(tro):
    mau = hex2(tro['mau'])
    nhan = hex2(tro.get('nhan', tro['mau']))   # màu dòng tên thứ hai (sao trắng ngà thì lấy vàng cho khỏi lẫn chữ)
    im = Image.new('RGB', (W * S, H * S))
    v = Ve(im)
    v.doc((0, 0, W, H), (30, 24, 52), (13, 11, 26))          # nền tối như app, hơi sáng ở trên
    v.toa(lambda g: g.tron(1040, 120, 280, fill=255), tron((0, 0, 0), mau, .5), .35, 120)
    t1, t2 = tro['tieu']
    c1 = 76
    while v.dai(t1, ft(c1, serif)) > 540:
        c1 -= 2
    c2 = c1
    while v.dai(t2, ft(c2, serif)) > 540:
        c2 -= 2
    v.chu((80, 92), t1, ft(c1, serif), CHU)
    v.chu((80, 92 + c1 * 1.13), t2, ft(c2, serif), nhan)
    y = 92 + c1 * 1.13 + c2 * 1.13 + 39
    for s in tro['dong']:
        c = 31
        while v.dai(s, ft(c)) > 530:
            c -= 1
        v.chu((84, y), s, ft(c), MO)
        y += 50
    v.chu((84, 520), 'Miễn phí · không cần tài khoản', ft(24), NHAT)
    tro['ve'](v, tro)
    return im.resize((W, H), Image.LANCZOS)


TRANG = '''<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Trang chia sẻ riêng của trò này: tạo bằng scripts/lam-trang-chia-se.py — sửa ở đó rồi chạy lại.
     Vì sao có trang riêng và vì sao chỉ chuyển bằng JavaScript (không thẻ refresh): xem luyen-phat-am/index.html. -->
<title>{tieuDe}</title>
<meta name="description" content="{moTa}">
<meta property="og:type" content="website">
<meta property="og:title" content="{tieuDe}">
<meta property="og:description" content="{moTa}">
<meta property="og:url" content="{mien}{trang}">
<meta property="og:locale" content="vi_VN">
<meta property="og:image" content="{anh}">
<meta property="og:image:secure_url" content="{anh}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{anh}">
<meta name="theme-color" content="#0d0b1a">
<script>{chuyen}</script>
<style>body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#0d0b1a;color:#f4efe6;font:16px system-ui,sans-serif}}a{{color:{mau}}}</style>
</head>
<body>
<p><a href="../#{duong}">{mo}</a></p>
</body>
</html>
'''


def ten_anh(tro):
    return 'og-%s-%d.jpg' % (tro['duong'], tro['so'])


def viet_trang(tro):
    e = lambda s: html.escape(s, quote=True)
    chuyen = tro.get('chuyen', "location.replace('../#%s');" % tro['duong'])
    noi_dung = TRANG.format(tieuDe=e(tro['tieuDe']), moTa=e(tro['moTa']), alt=e(tro['alt']), mo=e(tro['mo']), chuyen=chuyen,
                            mien=TEN_MIEN, trang=tro['trang'], duong=tro['duong'], mau=tro['mau'],
                            anh=TEN_MIEN + 'icons/' + ten_anh(tro))
    thu_muc = os.path.join(GOC, tro['trang'])
    os.makedirs(thu_muc, exist_ok=True)
    with open(os.path.join(thu_muc, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(noi_dung)


def main(args):
    thu = None
    if '--thu' in args:
        k = args.index('--thu'); thu = args[k + 1]; args = args[:k] + args[k + 2:]
    chon = [t for t in TRO if not args or t['duong'] in args]
    for t in chon:
        if thu:
            os.makedirs(thu, exist_ok=True)
            ve_anh(t).save(os.path.join(thu, ten_anh(t)), quality=88, optimize=True, progressive=True)
            print('vẽ thử', ten_anh(t))
            continue
        if t.get('viet', True):
            viet_trang(t)
            print('trang', t['trang'])
        duong_anh = os.path.join(GOC, 'icons', ten_anh(t))
        if os.path.exists(duong_anh):
            print('đã có', ten_anh(t), '(đổi hình thì tăng so)')
            continue
        ve_anh(t).save(duong_anh, quality=88, optimize=True, progressive=True)
        print('ảnh', ten_anh(t), os.path.getsize(duong_anh) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1:])
