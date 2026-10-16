# Thêm một ngôi sao mới (hay đổi tên, đổi trang của một trò)

Làm theo thứ tự, mỗi bước một chỗ. Xong thì `ban-do.py` phải in "Không thấy chỗ thiếu nào" và `scripts/test-sao.js`
phải qua hết. Ví dụ đầy đủ, mới nhất: trò Ăn gì (`assets/monan.js`, `assets/angi.js`, `scripts/test-angi.js`, mục
"## Ăn gì" trong README), commit `5609682` và `f86c6f0`.

Nếu có phiên khác cũng đang thêm trò, các chỗ chèn bên dưới đụng nhau (dòng SAO, thẻ script, SHELL, TEP, khối cuối
app.css, dòng TRO): nhắn nhau thứ tự trước (xem nhieu-phien.md).

## 0. Thiết kế

Trò lớn thì tìm hiểu trước (luật, số liệu, nguồn), ghi lại để viết vào README. Người dùng quen kiểu: phân tích vấn đề
→ thiết kế → làm → kiểm → soát giao diện → báo lại cả chỗ chưa làm, chưa thử. Màu sao không trùng sao khác (ban-do.py
in màu mọi sao), hình sao là một path SVG khung 24×24, tô kín, nhìn ra ở cỡ 17 px.

## 1. Tệp mới

**Lõi thuần** `assets/<lõi>.js` — mọi phép tính, không DOM, không mạng, có bài kiểm:

```js
/* <Tên trò> — <lõi làm gì>. Hàm THUẦN: không DOM, không mạng; kiểm bằng Node (scripts/test-<trò>.js). */
(function () {
'use strict';
/* … dữ liệu, hàm … */
const API = { /* … */ };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else self.TDTD_<LÕI> = API;
})();
```

**Giao diện** `assets/<trò>.js`:

```js
/* <Tên trò> — giao diện ngôi sao. Phép tính ở assets/<lõi>.js. Lưu đúng một mục tdtd.<trò>: … */
(() => {
'use strict';
const L = () => self.TDTD_<LÕI>;
const KHOA = 'tdtd.<trò>';
let tam = null;

function docLuu() { try { const o = JSON.parse(localStorage.getItem(KHOA) || 'null'); /* gạt giá trị lạ */ return o || {}; } catch (e) { return {}; } }
function luu(o) { try { localStorage.setItem(KHOA, JSON.stringify(o)); } catch (e) {} }

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = '<khung>';
  tam.innerHTML = `<button class="<tiền tố>-dong" type="button" aria-label="Đóng">✕</button> …`;
  document.body.appendChild(tam);
  tam.addEventListener('click', bam);          // một chỗ nghe, chia việc theo data-viec
}
function bam(e) { /* const t = e.target.closest('button, [data-viec]') … */ }

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  /* đọc kho, vẽ */
}
function dong() {                              // gọi được cả khi chưa mo()
  /* cancelAnimationFrame, tắt tiếng (am.suspend()), xoá hẹn giờ */
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}
addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });

self.TDTD_<TRÒ> = { mo, dong /* , _ss: () => ss, _lam: … — móc cho bài kiểm */ };
})();
```

Phải sống được trong DOM giả của test-sao.js: không gọi `navigator.x` khi chưa hỏi `typeof navigator !== 'undefined'`,
không dựa vào `querySelectorAll` trả phần tử, không đọc kích thước thật (`offsetHeight` có thể `undefined`).

**Bài kiểm** `scripts/test-<trò>.js`:

```js
/* Kiểm thử <Tên trò>: node scripts/test-<trò>.js
   <kiểm những gì, một đoạn>. */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../assets/<lõi>.js');
let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const hat = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };   // ngẫu nhiên có hạt giống

console.log('\n— <phần> —');
ok('<điều phải đúng, viết như câu nói>', /* điều kiện */ true);

/* Giao diện trên DOM giả: chép nut() của scripts/test-angi.js (querySelector nhớ nút theo bộ chọn, classList thật,
   setAttribute nhớ giá trị), đặt global.document, localStorage (có thể ném lỗi để thử ẩn danh), requestAnimationFrame
   giữ hàm khung để tự gọi với thời gian giả; nạp tệp bằng new Function(fs.readFileSync(…))(). */

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
process.exitCode = fail ? 1 : 0;
```

## 2. assets/app.js

- Thêm hình vào `HINH_SAO` (khoá ngắn, path 24×24).
- Thêm dòng vào `SAO` (cuối mảng; phiên khác thêm sau thì nhắn thứ tự):

```js
  { id: 'sao-<trò>', mau: '#rrggbb', hinh: '<khoá>', nhan: '<Tên>: <mô tả cho trình đọc màn hình>',
    duong: '<trò>', khung: '.<khung>', mun: 'TDTD_<TRÒ>', tieuDe: '<Tên trò — phụ đề>', tenApp: '<≤ 13 chữ, không trùng>', trang: '<thu-muc>/', nutCai: true },
```

Giá trị trong nháy đơn, không có dấu `'` hay `{` `}` bên trong (SAO được đọc bằng regex). Lúc trò mở, thanh địa chỉ
là `/<thu-muc>/` (app.js tự làm, không khai gì): nhớ đưa `'<thu-muc>/'` vào SHELL của sw.js. Trò có mã phòng thì đọc
`?phong=MÃ` lúc `mo()` và ghi mã bằng `?phong=` — chép `maTrenDiaChi`, `datDiaChi` của coba.js.

## 3. index.html, sw.js, test-sao.js

- `index.html`: `<script src="assets/<lõi>.js"></script>` rồi `<script src="assets/<trò>.js"></script>`, trước
  `caiapp.js`, `thongke.js`, `app.js` (lõi trước trò dùng nó).
- `sw.js`: thêm `'assets/<lõi>.js', 'assets/<trò>.js'` vào `SHELL` (mất mạng vẫn mở được), và `'<thu-muc>/'` vào nhóm
  trang riêng cuối `SHELL` (tải lại lúc mất mạng ở thanh địa chỉ của trò). Tăng `V` lúc commit (nhieu-phien.md).
- `scripts/test-sao.js`: thêm `'<lõi>.js', '<trò>.js'` vào mảng `TEP` (thứ tự như index.html) — test-sao chỉ thấy
  mô-đun được nạp từ đây.

## 4. assets/app.css

Một khối có tiêu đề `/* ---------- <tên trò> (assets/<trò>.js) ---------- */`, tiền tố riêng, thường ở cuối tệp.
Khung: `.<khung>{position:fixed;inset:0;z-index:30;display:none;…}` `.<khung>.hien{display:block}`; lớp `[hidden]` cho
chắc: `.<khung> [hidden]{display:none!important}` (luật `display:flex` của mình đè mất `hidden`). Nội dung cuộn trong
một lớp con `position:absolute;inset:0;overflow-y:auto`, chừa trên `calc(env(safe-area-inset-top,0px) + 58px)` cho
hàng nút. Nếu trò có thanh tiêu đề riêng ở hàng nút: thêm luật `.co-nut-cai .<thanh>{padding-right:204px}` như các trò
khác (khối `.co-nut-cai` trong app.css). `@keyframes up` (trượt lên) đã có sẵn.

## 5. Trang chia sẻ, ảnh xem trước, manifest

Trong `scripts/lam-trang-chia-se.py`:

- Hàm vẽ `ve_<trò>(v, tro)` đặt cạnh các hàm `ve_*` khác, vẽ hình minh hoạ bên phải trong khung x 640–1130, y 100–515
  (ảnh 1200×630; bút `Ve` nhận toạ độ ảnh, tự vẽ gấp đôi rồi thu nhỏ). Bút có: `tron`, `elip`, `hcn`, `da_giac`,
  `net`, `cung`, `chu(xy, chữ, ft(cỡ, font), màu, anchor)`, `dai` (đo chữ), `doc` (dải màu dọc), `toa` (quầng sáng),
  `to_doc`, `lop`/`phu` (mặt nạ). Màu: `hex2('#…')`, `tron(a, b, t)`, `mo(màu, a)`. Font: `UNI` (Arial Unicode),
  `serif` (Georgia). Số liệu trong ảnh lấy từ chính trò, không vẽ bừa. Chữ xoay: vẽ ngang lên mặt nạ `Image.new('L')`,
  `rotate(..., center=…)`, `v.im.paste(…)` — xem `ve_an_gi`.
- Một dòng trong `TRO`:

```python
    dict(duong='<trò>', trang='<thu-muc>/', so=1, mau='#rrggbb', ve=ve_<trò>,
         tieuDe='<y hệt tieuDe trong SAO>', tieu=('<dòng tiêu đề 1>', '<dòng 2, màu sao>'),
         dong=['<ý 1>', '<ý 2>', '<ý 3>'],
         moTa='<60–230 ký tự, không trùng chú thích của trò khác>',
         alt='<chữ thay ảnh, ≥ 10 ký tự>', mo='<chữ của link khi tắt JavaScript>'),
```

  Tuỳ chọn: `phong=True` cho trò có mã phòng (trang chuyển `?phong=MÃ` thành `#<trò>/MÃ`, giữ `?tro`, `?ngay` — xem
  `chuyen_vao`), `chuyen="…"` thay hẳn lệnh chuyển (hiếm khi cần), `nhan=` màu dòng tiêu đề thứ hai, `viet=False`
  (trang viết tay, không ghi đè).
- Vẽ thử: `python3 scripts/lam-trang-chia-se.py <trò> --thu <thư mục scratchpad>` rồi mở ảnh xem. Ghi thật:
  `python3 scripts/lam-trang-chia-se.py <trò>`. Ảnh đã có thì không ghi đè: đổi hình thì tăng `so`, chạy lại, xoá ảnh
  cũ (icons/ cache một năm).
- `python3 scripts/lam-ke-khai.py` — ghi `<thu-muc>/app.webmanifest` (start_url `?tro=<trò>`, tên = tieuDe trước " — ",
  short_name = tenApp).

Những gì test-sao.js đòi ở mỗi trang chia sẻ: `<title>` và `og:title` đúng `tieuDe`, không có chữ "Thông Điệp"; chuyển
vào app bằng JavaScript — test-sao chạy thật lệnh chuyển: không `?…` thì `../#<trò>`, `?tro=…&ngay=…` giữ nguyên, trò
có phòng thì `?phong=MÃ` thành `#<trò>/MÃ` —, không thẻ `http-equiv` refresh, có `href="../#<trò>"`; `og:url` là `https://thong-diep-thuong-de.vercel.app/<thu-muc>/`; `description` trùng
`og:description`, 60–230 ký tự, không trùng trò khác; `og:image:alt` ≥ 10 ký tự; ảnh có thật, đúng 1200×630, dưới
300 KB. Manifest: id "/", start_url `?tro=<trò>`, scope là cả trang, biểu tượng như manifest chính.

## 6. README.md

Mục `## <Tên trò>` ngay trước `## Cấu trúc`, kể: người dùng nói gì (nguyên văn), tìm hiểu được gì (nguồn), thiết kế,
luật, cách tính; lưu gì trong máy; ảnh xem trước; bài kiểm (số bài, kiểm gì, "thử phá N chỗ, bắt M"); đã thử trên
trình duyệt những gì; chưa làm, chưa thử được gì. Thêm dòng trong `## Cấu trúc` (mỗi tệp mới một dòng) và
`## Lệnh` (lệnh chạy bài kiểm).

## 7. Kiểm

`ban-do.py <trò>` (hết cảnh báo) → bài kiểm của trò → `scripts/test-sao.js` bằng Node 24 → soát trên trình duyệt cỡ
điện thoại và máy tính (trinh-duyet.md): mở từ ngôi sao (thanh địa chỉ thành `/<thu-muc>/`), đóng bằng ✕, Esc, Back,
mở thẳng `#<trò>` và trang `/<thu-muc>/`, tải lại khi đang mở, nút 🔗, nút Cài app không đè tiêu đề.
