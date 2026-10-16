# Soát trên trình duyệt (khung Browser của app desktop)

## Server

- Thường đã có `python3 -m http.server 5179` của phiên khác ở gốc repo: `curl -sI http://127.0.0.1:5179/`.
- Không có thì `preview_start` với `name: "thong-diep"` (`.claude/launch.json`). Nếu nó lỗi `PermissionError` ở
  `os.getcwd()` (macOS chặn tiến trình con đọc ~/Documents): chép repo (bỏ `.git`, `assets/am`, `assets/tu`) vào
  scratchpad, thêm tạm một cấu hình `/bin/sh -c "cd <scratch> && exec python3 -m http.server 5180 --bind 127.0.0.1"`,
  chạy, rồi trả `launch.json` về như cũ ngay (nó nằm trong git).
- Trang con: `http.server` tự chuyển `/an-gi` sang `/an-gi/`; Vercel trả thẳng cả hai.

## Thẻ riêng

Khung Browser dùng chung cho mọi phiên của app: phiên khác có thể đang lái đúng thẻ mình đang thử (đã gặp thẻ bị chuyển
sang `#buon-lau` giữa chừng). Mở thẻ riêng: `preview_start` với `url: "http://127.0.0.1:5179/?v=<gì đó>#<trò>"`, giữ
`tabId` trả về và truyền vào mọi lệnh (`javascript_tool`, `computer`, `find`, `navigate`).

## Cache

Service worker không đăng ký được trong khung này (console báo "An unknown error occurred when fetching the script" —
là của SW, không phải lỗi app), nhưng cache HTTP vẫn có thể trả tệp cũ. Sau khi sửa:

```js
for (const f of ['/', '/index.html', '/assets/app.js', '/assets/app.css', '/assets/<trò>.js']) await fetch(f, {cache: 'reload'});
location.reload();
```

rồi kiểm đúng bản mới (ví dụ `TDTD_X.mo.toString()` có đoạn vừa sửa).

## Thao tác

- `find` lấy `ref` rồi bấm theo ref — chắc hơn toạ độ. Toạ độ bấm tính theo khung của ảnh chụp gần nhất (viewport
  375×812 chụp ra ảnh 750×1624: toạ độ theo ảnh đó).
- Ảnh chụp ngay sau cú bấm có khi còn là khung cũ: `wait` một giây hay chụp lại trước khi kết luận "không mở".
- Khung Browser bị ẩn thì `requestAnimationFrame` không chạy (hoạt cảnh đứng); một lần chụp màn hình ép trang vẽ. Lái
  tay được bằng móc của trò (ví dụ `TDTD_HO._khung(t)`, `TDTD_ANGI._lam('…')`).
- Cỡ điện thoại: `resize_window` preset `mobile` (375×812), xong thì đặt lại `desktop`. Thử cả hai.
- `history.back()` trong `javascript_tool` làm trang chuyển, kịch bản bị cắt ngang: làm từng bước một.
- Lỗi trong console: `read_console_messages` với `onlyErrors`.

## Dọn

Dữ liệu thử ghi vào `localStorage` của 127.0.0.1:5179 (món của tôi, lọc, phòng…) thì xoá đi khi xong
(`localStorage.removeItem('tdtd.<trò>')`) — khung Browser giữ kho lâu dài, phiên sau và người dùng sẽ thấy.
