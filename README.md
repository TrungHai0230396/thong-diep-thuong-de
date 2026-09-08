# Thông Điệp Của Thượng Đế

Mỗi ngày mở app, bấm một lần, nhận đúng một thông điệp. Không hơn.

Nội dung lấy cảm hứng từ bộ sách *Đối thoại với Thượng đế* của Neale Donald Walsch.

## Chạy thử

```bash
cd ~/Documents/Project/thong-diep-thuong-de
python3 -m http.server 5179
```

Mở http://127.0.0.1:5179 — không cần cài gì, không cần build.

## Cách hoạt động

- **Mỗi ngày một lá.** Ngày tính theo lịch địa phương của máy, đổi lúc 0:00. Rút rồi thì lá đó ở lại tới hết ngày.
- **Không lặp lá** cho tới khi đi hết 100 lá. Hết một vòng thì bộ bài tự xáo lại theo thứ tự mới.
- **Kết quả cố định.** Lần đầu mở, app sinh một hạt giống ngẫu nhiên và lưu lại. Thứ tự bộ bài suy ra hoàn toàn từ hạt giống đó, nên đóng mở app hay tải lại trang đều không đổi lá.
- **Dữ liệu nằm trên máy.** Lịch sử, yêu thích và nhật ký lưu trong `localStorage`, không có tài khoản, không gửi đi đâu.
- **Chạy offline.** Service worker cache toàn bộ app; cài lên màn hình chính dùng như app thật.

## Cấu trúc

```
index.html              giao diện
assets/core.js          lõi thuần: ngày tháng, xáo bài, chọn lá, chuỗi ngày (test được bằng Node)
assets/app.js           điều khiển giao diện, lưu trữ, chia sẻ
assets/app.css          giao diện
data/cards.json         100 lá dùng trong app (31 KB)
sw.js, manifest.webmanifest, icons/      phần PWA
content/raw/            CSV nguồn
content/ghi-chu-co-che-game.json         cột "Cơ chế game" trong CSV, giữ lại làm ghi chú, không dùng trong app
content/cards/, content/topics.json      bản nội dung theo chủ đề từ CSV v3 (chưa dùng)
scripts/build-data.py   CSV -> data/cards.json
scripts/test-core.js    kiểm thử lõi
```

## Lệnh

```bash
python3 scripts/build-data.py    # dựng lại data/cards.json từ CSV
node scripts/test-core.js        # chạy 34 kiểm thử lõi (cần Node 18+)
```

## Sửa chính tả trong nguồn

`scripts/build-data.py` tự sửa mấy lỗi phát hiện trong CSV, khai báo ở biến `FIXES`:

| Lá | Sửa |
|---|---|
| 1 | "Thượng đế tính là" → "Thượng đế chính là" |
| 94 | "dành cho con lúc nãy" → "dành cho con lúc này" |
| 47, 60, 70 | "HEBs" → "Các sinh mệnh tiến hóa cao" |

## Đưa lên mạng

Đây là web tĩnh thuần, kéo cả thư mục lên Netlify / Vercel / GitHub Pages là chạy.
