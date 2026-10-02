# -*- coding: utf-8 -*-
"""Đổi bản đồ lục địa Natural Earth 1:110m thành mặt nạ đất/biển cho quả địa cầu ở Trời đêm.

Nguồn: Natural Earth, ne_110m_land (public domain) —
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
Cách chạy:  python3 scripts/lam-datlien.py đường/dẫn/ne_110m_land.geojson > assets/datlien.js

Lưới phẳng kinh vĩ 720 × 360 (mỗi ô nửa độ), ô (x, y) có tâm ở kinh độ −180 + (x + 0,5)/2,
vĩ độ 90 − (y + 0,5)/2. Tô theo từng hàng: tìm chỗ đường vĩ tuyến cắt mọi cạnh đa giác, xếp lại,
tô xen kẽ (luật chẵn lẻ — vòng trong của đa giác là hồ thì tự thành lỗ).
Mỗi hàng nén thành các đoạn dài liên tiếp, bắt đầu bằng biển: "12.40.3" nghĩa là 12 ô biển,
40 ô đất, 3 ô biển...; số viết cơ số 36, hàng cách nhau bằng "|".
"""
import json
import sys

RONG, CAO = 720, 360
B36 = '0123456789abcdefghijklmnopqrstuvwxyz'


def co36(n):
    s = ''
    while True:
        s = B36[n % 36] + s
        n //= 36
        if n == 0:
            return s


def cac_vong(geo):
    for f in geo['features']:
        g = f['geometry']
        da = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for poly in da:
            for vong in poly:
                yield vong


def main():
    geo = json.load(open(sys.argv[1], encoding='utf-8'))
    canh = []
    for vong in cac_vong(geo):
        for i in range(len(vong) - 1):
            (x1, y1), (x2, y2) = vong[i][:2], vong[i + 1][:2]
            if y1 != y2:
                canh.append((x1, y1, x2, y2))
    hang = []
    dat_tong = 0
    for y in range(CAO):
        vi = 90 - (y + 0.5) / 2
        cat = []
        for x1, y1, x2, y2 in canh:
            if (y1 <= vi < y2) or (y2 <= vi < y1):
                cat.append(x1 + (vi - y1) * (x2 - x1) / (y2 - y1))
        cat.sort()
        o = [0] * RONG
        for k in range(0, len(cat) - 1, 2):
            a, b = cat[k], cat[k + 1]
            for x in range(RONG):
                kinh = -180 + (x + 0.5) / 2
                if a <= kinh < b:
                    o[x] = 1
        dat_tong += sum(o)
        doan, cur, dem = [], 0, 0
        for v in o:
            if v == cur:
                dem += 1
            else:
                doan.append(dem)
                cur, dem = v, 1
        doan.append(dem)
        hang.append('.'.join(co36(n) for n in doan))
    du = '|'.join(hang)
    print('/* Mặt nạ đất/biển 720 × 360 (nửa độ một ô) từ Natural Earth 1:110m (public domain), sinh bởi\n'
          '   scripts/lam-datlien.py — đừng sửa tay. Mỗi hàng là các đoạn biển, đất xen kẽ, số cơ số 36. */')
    print("(function () { const X = { rong: %d, cao: %d, du: '%s' };" % (RONG, CAO, du))
    print("if (typeof module !== 'undefined' && module.exports) module.exports = X; else self.TDTD_DATLIEN = X; })();")
    sys.stderr.write('%d cạnh, %.1f%% ô là đất\n' % (len(canh), dat_tong * 100 / (RONG * CAO)))


if __name__ == '__main__':
    main()
