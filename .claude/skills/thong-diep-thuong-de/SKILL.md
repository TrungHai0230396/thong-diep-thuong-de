---
name: thong-diep-thuong-de
description: Bản đồ và cách làm việc trong repo thong-diep-thuong-de — app "Thông Điệp Của Thượng Đế", PWA tĩnh tiếng Việt, mỗi ngôi sao trên nền là một trò (Mùa Chín, hồ sen, phát âm, bầu trời đêm, xem ngày, thần số học, nhạc ngủ, luân xa, Robot thắp sao, Sokoban, cờ ba người, bida, ăn gì, buôn lậu…). Đọc skill này TRƯỚC khi mở mã nguồn, cho mọi việc trong repo này — thêm hay sửa một ngôi sao, sửa app.js, index.html, app.css, sw.js, viết bài kiểm, trang chia sẻ và ảnh xem trước, manifest cài app, soát trên trình duyệt, commit khi nhiều phiên Claude cùng sửa một thư mục, push lên Vercel — kể cả khi người dùng chỉ nhắc tên một trò, nói "thêm ngôi sao", "game mới", "sửa lỗi trò X", "deploy", "commit". Có script in bản đồ trò đọc thẳng từ mã, khỏi phải đọc lại cả repo.
---

# Thông Điệp Của Thượng Đế — bản đồ repo

Skill này thay cho việc đọc lại mã mỗi phiên. Phần kiến trúc, quy ước, quy trình dưới đây ít đổi. Phần hay đổi — trò
nào, tệp nào, bài kiểm nào, số V của sw.js, ai đang sửa gì — thì đừng tin bản ghi: chạy script, nó đọc thẳng từ mã.

## Bắt đầu mỗi việc

1. `python3 .claude/skills/thong-diep-thuong-de/scripts/ban-do.py` — chừng một màn hình: mỗi trò (#đường, khung,
   mô-đun, tệp, lõi nó dùng, bài kiểm, trang chia sẻ, manifest, ảnh), mô-đun dùng chung, V của sw.js ở thư mục làm
   việc / HEAD / origin, tệp chưa commit, và **CẢNH BÁO** chỗ thiếu (tệp có trong index.html mà thiếu trong SHELL, trò
   chưa có trong TEP của test-sao…). Thêm tên trò để lọc (`ban-do.py an-gi bida`), `--fetch` trước khi commit.
2. Chỉ mở tệp của trò mình đụng tới (script đã chỉ ra). Ghi chú từng trò, cơ chế đặc biệt, mục README cần đọc:
   [references/cac-tro.md](references/cac-tro.md).
3. `README.md` (~400 KB) là nhật ký thiết kế, ghi cả câu người dùng nói và vì sao làm vậy. Đừng đọc hết:
   `grep -n "^## \|^### " README.md` rồi đọc đúng mục của trò. Trước khi sửa một chỗ có lịch sử (cài app, iPhone,
   hồ ếch, phòng qua mạng), đọc mục đó — nhiều cách làm "lạ" là sửa cho một lỗi người dùng đã gặp.
4. Có thể có phiên Claude khác đang sửa cùng thư mục: liệt kê phiên (`ListAgents`; không có thì công cụ list_sessions
   của app), nhắn bằng `SendMessage`, báo vùng tệp trước khi đụng tệp chung
   ([references/nhieu-phien.md](references/nhieu-phien.md)).

## Dự án gọn trong mấy dòng

- **Web tĩnh thuần**, không build, không npm, không thư viện ngoài: `index.html` + `assets/*.js` (mỗi tệp một IIFE gán
  `self.TDTD_*`) + `assets/app.css` + `data/cards.json`. Chạy thử: `python3 -m http.server 5179` ở gốc repo.
- **Trang chính**: mỗi ngày một lá thông điệp (`core.js` chọn lá theo ngày và hạt giống máy; `share.js` vẽ ảnh chia
  sẻ). Nguyên tắc của app: không lưu lịch sử, không tài khoản, không cookie.
- **Ngôi sao**: nút rải ngẫu nhiên trên nền, không đè chữ (`app.js`: mảng `SAO`, `HINH_SAO`, `datCacSao`). Bấm là mở
  một trò phủ kín màn hình.
- **PWA**: `sw.js` cache-first — tăng `V` mỗi lần đổi mã, nếu không máy người dùng không bao giờ nhận bản mới. Mỗi trò
  có manifest riêng: cài app từ trò nào thì mở app vào thẳng trò đó; Chrome và Safari làm khác nhau (`caiapp.js`,
  `app.js` datKeKhai / datTroDiaChi / vaoTroDaCai — đọc README mục "Cài app…" trước khi đụng).
- **Trang chia sẻ** từng trò `<trang>/index.html` cùng ảnh `icons/og-<duong>-<so>.jpg` do
  `scripts/lam-trang-chia-se.py` sinh; manifest `<trang>/app.webmanifest` do `scripts/lam-ke-khai.py` sinh.
- **Chơi qua mạng** (cờ ba người, bida, buôn lậu): `assets/phong.js` nói chuyện Firebase Realtime Database bằng REST và
  EventSource; luật ở `firebase-rules.json` (một văn bản, người dùng tự xuất bản); bài kiểm chạy trên máy chủ giả
  `scripts/fb-gia.js`.
- **Đưa lên mạng**: push `main` lên GitHub là Vercel tự deploy, chừng một phút. `vercel.json` đặt cache (`icons/`
  cache một năm; index.html, sw.js, assets/, data/, manifest thì không cache). `.vercelignore` bỏ `scripts/`,
  `README.md`, `DEPLOY.md`, `content/` — nhưng không bỏ `.claude/`: commit thư mục skill thì thêm `.claude/` vào
  `.vercelignore` cho khỏi lên site.
- **Tiếng Việt khắp nơi**: tên biến, hàm, chú thích, dòng thông báo của bài kiểm. Viết tiếp theo đúng giọng đó.

## Hợp đồng giữa app.js và một ngôi sao

Một dòng trong `SAO` (assets/app.js):

```js
{ id: 'sao-x', mau: '#rrggbb', hinh: '<khoá HINH_SAO>', nhan: 'mô tả cho trình đọc màn hình',
  duong: 'x', khung: '.x', mun: 'TDTD_X', tieuDe: 'Tên trò — phụ đề', tenApp: 'Tên ngắn', trang: 'thu-muc-x/', nutCai: true },
```

- `duong`: địa chỉ `#x` (phần sau `/` là của trò, như mã phòng `#co-ba-nguoi/MÃ`). `khung`: lớp của khung trò.
  `mun`: tên mô-đun toàn cục. `tieuDe`: tên thẻ trình duyệt, tiêu đề trang chia sẻ, tên trong manifest (phần trước
  " — "). `tenApp`: tên dưới biểu tượng khi cài (≤ 13 chữ, không trùng trò khác —
  test-sao kiểm). `trang`: thư mục trang chia sẻ. `nutCai: true` ở mọi trò.
  `diaChiTrang: true` (tuỳ): lúc trò mở, thanh địa chỉ là `/<trang>` chứ không `#x` — xem dưới. `bat: false`: tạm ẩn.
- Mỗi trò là một dòng `{ id: '…', … }` không lồng `{}`, giá trị trong nháy đơn: `test-sao.js`, `lam-ke-khai.py`,
  `ban-do.py` đều đọc SAO bằng regex.
- Mô-đun trò: `self.TDTD_X = { mo, dong, …móc _x cho bài kiểm }`. `mo()` dựng khung lần đầu (`dungKhung`: một
  `div.x` gắn vào `body`), thêm lớp `hien` vào khung và `khoa-cuon` vào `body`. `dong()` gỡ hai lớp đó, dừng
  requestAnimationFrame, âm thanh, hẹn giờ; phải gọi được cả khi chưa từng `mo()`. Phím Esc đóng trò.
- `app.js` nhìn lớp `hien` của khung (MutationObserver): trò tự đóng (✕, Esc) là app tự bỏ địa chỉ và gỡ nút. App gắn
  vào khung nút 🔗 `#nut-chep-link` (top: safe-area + 14px, right: 58px) và nút "Cài app" `#nut-cai-app` (right: 100px;
  khung có thêm lớp `co-nut-cai`, thanh tiêu đề của trò phải chừa chỗ). Nút ✕ của trò: top safe-area + 14px, right
  16px, 34×34.
- Địa chỉ: `theoDiaChi` mở trò theo `#duong`, Back đóng trò. Trò khai `diaChiTrang` thì `datDiaChiTrang` pushState
  sang `/<trang>`; `index.html` gắn `<base>` về thư mục app lúc mở trang, và `GOC_APP` trong app.js là thư mục đó. Đang
  ở trò như vậy thì đừng dựng đường dẫn từ `location.pathname`; dùng `GOC_APP` hay `new URL('x/', document.baseURI)`.
- Bài kiểm `scripts/test-sao.js` mở rồi đóng mọi trò trên DOM giả: `querySelector` tự sinh nút giả,
  `querySelectorAll` trả `[]`, `innerHTML` chỉ là chuỗi, `fetch` luôn hỏng, có thể không có `navigator`. Trò không
  được nổ ở đó: bọc `localStorage` trong try/catch, hỏi `typeof navigator` trước khi dùng.
- Lưu trong máy: đúng một khoá `tdtd.<tên trò>` (JSON); đọc ra thì gạt giá trị lạ, kho hỏng hay bị chặn vẫn chạy.

## Quy ước viết mã

- Chú thích nói **vì sao**, thường kèm câu người dùng đã nói trong ngoặc kép; không kể lại code. Mật độ chú thích,
  cách đặt tên như mã xung quanh.
- Tách **lõi thuần** (không DOM, không mạng) ra tệp riêng, cuối tệp:
  `if (typeof module !== 'undefined' && module.exports) module.exports = API; else self.TDTD_<LÕI> = API;` — để bài
  kiểm `require` thẳng bằng Node. Giao diện ở tệp khác, có móc `_x` cho bài kiểm lái.
- CSS mỗi trò một khối có tiền tố riêng (`.ag-`, `.bd-`, `.cb-`…): khung `position:fixed;inset:0;z-index:30;
  display:none` và `.x.hien{display:block}` (dưới bảng chung `.sheet-wrap` 35 và `.toast` 40 của app — bảng cài app
  phải nổi trên trò); nền tối; chữ tiêu đề `"Cormorant Garamond"`, chữ thường `"Be Vietnam Pro"`
  (Cormorant có số kiểu cổ: thêm `font-variant-numeric:lining-nums` chỗ có số); tôn trọng `prefers-reduced-motion`;
  thử cỡ 375×812 và máy tính.
- Âm thanh: Web Audio tự tạo, không tải tệp (mẫu `amThanh()` / `not()` trong bida.js, sokoban.js, angi.js), tạo
  AudioContext trong cú chạm; có nút tắt tiếng. Rung chỉ Android có (`navigator.vibrate`).
- Không thêm thư viện, CDN, bước build.

## Thêm hay đổi một ngôi sao

Danh sách đủ các chỗ phải chạm, khung mẫu cho mô-đun, lõi, bài kiểm, dòng SAO, dòng TRO của trang chia sẻ, và những gì
test-sao.js đòi ở trang chia sẻ: [references/them-tro.md](references/them-tro.md). Tóm tắt: tệp mới (lõi, giao diện,
bài kiểm) → `SAO` + `HINH_SAO` → thẻ `<script>` trong index.html → `SHELL` trong sw.js → `TEP` trong test-sao.js →
khối CSS → hàm vẽ và dòng `TRO` trong lam-trang-chia-se.py, chạy nó, chạy lam-ke-khai.py → mục README (trước
`## Cấu trúc`, thêm dòng trong `## Cấu trúc` và `## Lệnh`) → `ban-do.py` hết cảnh báo → bài kiểm → soát trên trình
duyệt.

## Kiểm thử

- `node` mặc định là v16. Bài nào cần `fetch` / `navigator` (test-chomsao, test-phong, test-bida-phong…) chạy bằng
  `/Users/haiht1/.nvm/versions/node/v24.14.1/bin/node`. Dùng luôn Node 24 cho chắc.
- Đụng app.js, index.html, sw.js, trang chia sẻ, manifest thì chạy `scripts/test-sao.js` (vòng đời mọi trò, trang
  chia sẻ, manifest, cài app, tự nhận bản mới). Đụng trò nào thì chạy bài kiểm của trò đó (ban-do.py liệt kê).
- Giọng của bài kiểm: `ok('câu tiếng Việt nói điều phải đúng', điềuKiện, 'chi tiết khi hỏng')`, dòng cuối
  `✓ N đạt, M lỗi`, `process.exitCode`. Số ngẫu nhiên có hạt giống. DOM giả: xem `nut()` trong scripts/test-angi.js
  hay scripts/test-sokoban.js.
- Thói quen của repo: **thử phá** — sửa hỏng từng chỗ trên một bản sao trong scratchpad, chạy lại bài kiểm, ghi
  "thử phá N chỗ, bắt M" (kể cả chỗ lọt và vì sao) vào README.
- `scripts/test-pond.js` chạy chừng 3 phút.

## Soát trên trình duyệt

Thường đã có server 5179 của phiên khác (`curl -sI http://127.0.0.1:5179/`). Mở thẻ riêng bằng `preview_start` có
`url` rồi luôn truyền `tabId` (khung Browser dùng chung giữa các phiên). Tệp vừa sửa có thể bị cache: fetch lại với
`{cache: 'reload'}` rồi tải lại trang. Lỗi service worker trong console là bình thường ở khung này. Chi tiết:
[references/trinh-duyet.md](references/trinh-duyet.md).

## Commit và push

Chỉ commit, push khi người dùng bảo. Thư mục làm việc thường có hunk của nhiều phiên trong cùng tệp chung: chỉ stage
phần của mình, V của sw.js cao hơn cả HEAD lẫn origin (ghi cả vào thư mục làm việc), kiểm bản stage bằng cách xuất
index ra thư mục tạm rồi chạy bài kiểm ở đó, push đúng mã commit của mình (`git push origin <sha>:main`), không amend
hay rebase commit đã lên origin, nhắn số V cho các phiên khác, kiểm Vercel bằng curl. Cách làm từng bước, mẫu lời
commit: [references/nhieu-phien.md](references/nhieu-phien.md).

## Bẫy hay gặp

- zsh: `echo ====` báo lỗi (`=` đầu từ là mở rộng lệnh) — dùng `---`. Glob không khớp cũng báo lỗi: đặt
  `--include='*.js'` trong nháy.
- macOS: `sed -i ''`; `xargs -I{}` không nhận lệnh dài quá 255 byte (đường dẫn scratchpad rất dài) — viết kịch bản nhỏ.
- `icons/` cache một năm: đổi ảnh xem trước thì tăng `so` trong dòng TRO, chạy lại, xoá ảnh cũ.
- `lam-ke-khai.py` ghi lại manifest của mọi trò (kể cả trò của phiên khác — nội dung đọc từ app.js nên y hệt).
- Đừng mở trang thật (vercel.app) trong trình duyệt chỉ để kiểm: bộ đếm lượt truy cập sẽ đếm. Dùng curl.
- Con số bài kiểm ghi trong README có thể đã cũ; con số thật là kết quả chạy.

## Khi nào sửa skill này

Thêm trò thì không cần sửa gì (ban-do.py tự đọc), chỉ thêm vài dòng vào references/cac-tro.md nếu trò có cơ chế
đáng nhớ. Khi đổi hợp đồng giữa app.js và trò, đổi cách định tuyến, đổi quy trình commit hay deploy, thì sửa SKILL.md
hay tệp tham khảo tương ứng ngay trong việc đó.
