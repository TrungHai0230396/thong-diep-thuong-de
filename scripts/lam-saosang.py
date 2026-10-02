# -*- coding: utf-8 -*-
"""Lọc Danh mục sao sáng Yale (BSC5) thành assets/saosang.js cho ngôi sao Trời đêm.

Nguồn: Hoffleit & Warren (1991), The Bright Star Catalogue, 5th Revised Ed., bản V/50 của CDS
Strasbourg — https://cdsarc.cds.unistra.fr/ftp/V/50/ (tệp catalog.gz và ReadMe).
Cách chạy:  python3 scripts/lam-saosang.py đường/dẫn/catalog > assets/saosang.js

Lấy cột theo đúng ReadMe (byte tính từ 1):
  76-77 RAh, 78-79 RAm, 80-83 RAs   — xích kinh J2000
  84 DE-, 85-86 DEd, 87-88 DEm, 89-90 DEs — xích vĩ J2000
  103-107 Vmag, 110-114 B-V
Bỏ các dòng không có toạ độ J2000 (vài thiên thể không phải sao, như cụm sao, tân tinh cũ).

Mỗi sao gói thành 8 ký tự cơ số 36, xếp từ sáng tới mờ:
  3 ký tự  xích kinh ×100 (độ)        — sai tối đa 0,005°
  3 ký tự  (xích vĩ + 90) ×100 (độ)
  1 ký tự  (V + 1,5) ×4               — bước 0,25 cấp
  1 ký tự  (B−V + 0,4) ×10, kẹp 0..35  — không có B−V thì lấy 0,6 (sao vàng như Mặt Trời)
"""
import sys

GIOI_HAN = 6.0
B36 = '0123456789abcdefghijklmnopqrstuvwxyz'


def coso36(n, rong):
    s = ''
    for _ in range(rong):
        s = B36[n % 36] + s
        n //= 36
    assert n == 0, 'tràn ô'
    return s


def doc(duong):
    sao = []
    with open(duong, encoding='latin-1') as f:
        for dong in f:
            dong = dong.rstrip('\n').ljust(197)
            rah, ram, ras = dong[75:77].strip(), dong[77:79].strip(), dong[79:83].strip()
            dau, ded, dem, des = dong[83], dong[84:86].strip(), dong[86:88].strip(), dong[88:90].strip()
            v, bv = dong[102:107].strip(), dong[109:114].strip()
            if not (rah and ded and v):
                continue
            ra = (int(rah) + int(ram) / 60 + float(ras) / 3600) * 15
            de = int(ded) + int(dem) / 60 + int(des) / 3600
            if dau == '-':
                de = -de
            v = float(v)
            if v > GIOI_HAN:
                continue
            sao.append((v, ra, de, float(bv) if bv else None, int(dong[0:4])))
    sao.sort(key=lambda s: (s[0], s[4]))
    return sao


def main():
    sao = doc(sys.argv[1])
    goi = []
    for v, ra, de, bv, _ in sao:
        goi.append(coso36(round(ra * 100) % 36000, 3) + coso36(round((de + 90) * 100), 3)
                   + coso36(max(0, min(35, round((v + 1.5) * 4))), 1)
                   + coso36(max(0, min(35, round(((bv if bv is not None else 0.6) + 0.4) * 10))), 1))
    du = ''.join(goi)
    print('/* Sao sáng tới cấp %s lấy từ Danh mục sao sáng Yale, bản 5 (Hoffleit & Warren 1991), bản V/50 của\n'
          '   CDS Strasbourg. Sinh bởi scripts/lam-saosang.py — đừng sửa tay. %d sao, xếp từ sáng tới mờ;\n'
          '   mỗi sao 8 ký tự cơ số 36: xích kinh, xích vĩ (J2000, ×100 độ), cấp sáng V, chỉ số màu B−V. */'
          % (str(GIOI_HAN).replace('.', ','), len(sao)))
    print("(function () { const X = { dem: %d, du: '%s' };" % (len(sao), du))
    print("if (typeof module !== 'undefined' && module.exports) module.exports = X; else self.TDTD_SAOSANG = X; })();")


if __name__ == '__main__':
    main()
