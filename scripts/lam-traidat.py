# -*- coding: utf-8 -*-
"""Thu nhỏ ba ảnh Trái Đất của NASA (Visible Earth, dùng tự do) thành assets/traidat/ cho Hiệu ứng toàn cảnh.

Ảnh gốc, tải tay về một thư mục rồi chạy:  python3 scripts/lam-traidat.py <thư-mục-ảnh-gốc> assets/traidat
  https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74393/world.topo.200407.3x5400x2700.jpg  (Blue Marble NG, 7/2004)
  https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg           (mây ghép, 2002)
  https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg      (Black Marble 2016)
Cần Pillow."""
import sys, os
from PIL import Image, ImageOps
vao, ra = sys.argv[1], sys.argv[2]
# Mỗi ảnh giữ cỡ to nhất mà nguồn có (card đồ hoạ vẽ được ảnh không phải lũy thừa của 2), trần 4096 điểm cho
# điện thoại nào cũng nạp được: mặt đất 5400 -> 4096 (10 km mỗi điểm ảnh), mây chỉ có bản 2048, đèn để nguyên 3600.
# mặt đất ban ngày: giữ màu
ngay = Image.open(os.path.join(vao, 'world.topo.200407.3x5400x2700.jpg')).convert('RGB').resize((4096, 2048), Image.LANCZOS)
ngay.save(os.path.join(ra, 'ngay-4096.jpg'), quality=80, optimize=True, progressive=True)
# mây: độ sáng là độ dày mây
may = Image.open(os.path.join(vao, 'cloud_combined_2048.jpg')).convert('L').resize((2048, 1024), Image.LANCZOS)
may.save(os.path.join(ra, 'may.jpg'), quality=72, optimize=True, progressive=True)
# đèn ban đêm: bỏ nền đất xanh thẫm, chỉ giữ ánh đèn
dem = Image.open(os.path.join(vao, 'BlackMarble_2016_01deg.jpg')).convert('RGB')
W, H = dem.size
den = Image.new('L', (W, H))
den.putdata([max(0, min(255, int((r * .5 + g * .5 - b * .55) * 1.6 + max(0, max(r, g, b) - 140) * 1.2))) for r, g, b in dem.getdata()])
den.save(os.path.join(ra, 'dem-3600.jpg'), quality=75, optimize=True, progressive=True)
for t in ('ngay-4096.jpg', 'may.jpg', 'dem-3600.jpg'):
    p = os.path.join(ra, t); im = Image.open(p); print(t, im.size, im.mode, os.path.getsize(p) // 1024, 'KB')
