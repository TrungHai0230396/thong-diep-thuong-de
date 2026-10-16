# Từng trò: làm gì, nằm ở đâu, có gì đáng nhớ

Viết ngày 2026-10-16. Tệp, lõi, bài kiểm của mỗi trò thì chạy `scripts/ban-do.py <đường>` để có bản đúng lúc này;
ở đây chỉ ghi những thứ script không đọc ra được: trò làm gì, cơ chế đặc biệt, lưu gì, mục README cần đọc trước khi sửa
(tìm bằng `grep -n "^## <tên>\|^### <tên>" README.md`).

## Phần chung

- **Trang chính** — `core.js` (ngày, xáo bài, chọn lá theo ngày + hạt giống `tdtd.seed`; ngày đã nhận `tdtd.day`;
  `test-core.js`), `data/cards.json` 209 lá (dựng từ CSV `content/raw/` bằng `scripts/build-data.py`), `share.js` vẽ ảnh
  lá để chia sẻ / tải. `?ngay=YYYY-MM-DD` để xem thử ngày khác. README: "Nguyên tắc: không lưu lịch sử", "Bộ bài",
  "Chia sẻ ảnh", "Xem thử ngày khác".
- **app.js** — `SAO`, `HINH_SAO`, rải sao không đè chữ, mở/đóng trò, định tuyến (thanh địa chỉ là trang riêng
  `/<trang>`, `#đường` chỉ là lối vào, mã phòng `?phong=MÃ` — README "Địa chỉ không có dấu # — mọi trò"),
  link chia sẻ (`linkTro`, nút 🔗), nút Cài app trong trò, manifest theo trò (`datKeKhai`), `?tro=` cho iPhone
  (`datTroDiaChi`), mở app vào thẳng trò đã cài (`vaoTroDaCai`, `tdtd.troCai`), tự nhận bản mới không tải lại giữa lúc
  dùng (`tuCapNhat`, `nenTaiLai`, `tdtd.taiLai`). Móc kiểm thử `TDTD_SAO`. README: "Mỗi trò một địa chỉ riêng",
  "Chia sẻ link một trò", "Bầu trời sao", "Gợi ý cài app…", "Cài app từ trò nào…", "Thêm vào MH chính trên iPhone",
  "Tự nhận bản mới".
- **caiapp.js** — nhận dạng máy (`loaiMay` trả `daCai`, `daCaiTrinhDuyet`, `nhacCai`, `iosSafari`, `androidTay`, `mayTinh`… — app.js chọn bảng hướng dẫn theo đó), bắt hộp cài của Chrome, link mở
  bằng Safari / Chrome cho trình duyệt trong Zalo, Facebook; `tdtd.caiApp`. `test-caiapp.js`.
- **thongke.js** — Vercel Web Analytics, đúng một lượt mỗi lần mở trang, địa chỉ thay bằng nhãn `/`, `/app`,
  `/app/moi`; chỉ chạy trên https. `test-thongke.js`. README "Đếm lượt truy cập".
- **phong.js** — chơi qua mạng: Firebase Realtime Database bằng REST (`goi`) và EventSource (`nghe`), mã phòng 6 ký tự
  không I O 0 1 (`maMoi`, `laMa`), `chuan` đổi mảng Firebase về đối tượng. Bài kiểm đặt `TDTD_FB_THU` để chạy trên
  `scripts/fb-gia.js`. `test-phong.js`. **maqr.js** — mã QR tự vẽ (ISO 18004), `test-maqr.js`.
- **lich.js** — âm lịch theo thuật toán Hồ Ngọc Đức, can chi, thần, trực, giờ hoàng đạo, lễ. Dùng nhiều nhất:
  `convertSolar2Lunar(dd, mm, yy, 7)` → `[ngày, tháng, năm, nhuận]`, `convertLunar2Solar`, `TEN_THANG`, `xemNgay`,
  `timNgay`, `amSangDuong`, `leSapToi`. Dùng chung bởi Xem ngày và Ăn gì. `test-lich.js`.
- **Service worker** `sw.js` — `V` (tăng mỗi lần đổi mã), `SHELL` (cất sẵn để mất mạng vẫn mở), kho riêng không xoá
  theo V: `tdtd-tieng` (mp3 tiếng người), `tdtd-nasa` (ảnh NASA GIBS); để Firebase và `/_vercel/` đi thẳng mạng.

## Các ngôi sao

- **Mùa Chín** (`#mua-chin`, `game.js`) — miết tay cho vệt nắng làm trái chín, né bông hoa, ba mùa, không lưu điểm.
  README "### Sao xanh ngọc — Mùa Chín" (vì sao đổi từ "Đồ Long Đao", vì sao bông hoa thay trái non).
- **Thả đèn hoa đăng** (`#tha-den`, `lantern.js`) — gõ điều nặng lòng thành đèn bay lên rồi tắt; không lưu, không gửi.
- **Hồ sen và đàn ếch** (`#ho-sen`, `pond.js`, ~1700 dòng) — hồ sống: ếch nhảy giữa lá, lá trôi, chìm khi quá tải, cá,
  nòng nọc, mưa, tiếng (`tdtd.tieng`, mặc định tắt), sống tiếp khi không nhìn thẻ, tua nhanh. `test-pond.js` chạy ~3
  phút, đo bằng CPU thời gian; tái hiện một lần chạy phải đặt hạt giống `Math.random` VÀ đồng hồ `performance.now()`
  giả về 0. Móc `TDTD_HO._khung(t)`. Nhiều mục README: "Con ếch vừa bơi vừa bám lá", "Hồ nước: cân bằng…", "Lá năm chỗ
  chở mười con", "Xoay máy, kéo cửa sổ…", "Hồ vẫn sống khi không nhìn tab", "Tua nhanh trong hồ".
- **Hộp thở** (`#hoi-tho`, `breath.js`) — năm kiểu thở, vòng tròn phồng xẹp, rung khi đổi nhịp.
- **Nối sao thành chòm** (`#noi-sao`, `constellation.js`) — tám chòm tên Việt, app tự nối nét, kéo xoay thấy sao gần sao
  xa. `test-chomsao.js` (Node 24).
- **Bầu trời đêm nay** (`#troi-dem`, `nightsky.js`) — trời thật ở chỗ đứng: `astro.js` (thiên văn, đối chiếu JPL),
  `saosang.js` (5.080 sao danh mục Yale, sinh bởi `scripts/lam-saosang.py`), `datlien.js` (đất/biển Natural Earth),
  `vutru.js` (nhìn từ vũ trụ, Hệ Mặt Trời), `toancanh.js` (hiệu ứng toàn cảnh, ảnh NASA), `mua.js` (đọc dự báo mưa
  Open-Meteo thành câu). Nơi ở `tdtd.troi.noi` = `{ten, vi, kinh}` — trò khác chỉ đọc. Xoay theo máy (cảm biến), Mặt
  Trăng mọc lặn. Bài kiểm: test-troidem, test-astro, test-toancanh, test-mua. Rất nhiều mục README từ "## Bầu trời đêm
  nay" tới "Sao giờ không thấy mặt trăng?".
- **Luyện phát âm tiếng Anh** (`#phat-am`, `ipa.js`) — bảng 44 âm, khẩu hình (`khauhinh.js` vẽ SVG), dựng âm vị
  (`amvi.js`), tiếng người thật (`amnguoi.js`, `tunguoi.js` + mp3 trong `assets/am`, `assets/tu`, nguồn Wikimedia
  Commons; `scripts/lam-tieng-nguoi.py`, `kiem-tieng-nguoi.py`, `them-tu-nguoi.py`), đo phát âm bằng âm học
  (`dophatam.js`), so khớp câu nói (`nghe.js`). Trang chia sẻ `luyen-phat-am/`; `phat-am/` cũ giữ cho link đã gửi (hai
  trang viết tay, `viet=False`). Bài kiểm: test-phatam, test-amvi, test-dophatam, test-nghe.
- **Xem ngày tốt xấu** (`#xem-ngay`, `almanac.js` + `lich.js`) — hoàng đạo / hắc đạo, trực, giờ tốt, tìm ngày cho việc
  định làm, ngày lễ, đổi âm dương, tệp `.ics` (test-sao kiểm). Ngày sinh `tdtd.lich.sinh` dùng chung với Thần số học.
  README "## Xem ngày" (nguồn từng phần, chỗ các trang lịch cãi nhau và chọn theo đâu).
- **Thần số học** (`#than-so`, `thanso.js` + `sohoc.js`) — Pythagoras: số chủ đạo, biểu đồ ngày sinh, mũi tên, năm cá
  nhân, đỉnh cao, chỉ số theo tên (tên không lưu). `test-sohoc.js`.
- **Nhạc ngủ** (`#nhac-ngu`, `nhacngu.js` + `rungu.js`, tạo âm trong Web Worker) — hẹn giờ nhỏ dần rồi tắt; app không
  tự tải lại bản mới khi nhạc đang phát (`dangPhat`, sự kiện `tdtd-ngu-het`). `tdtd.ngu`. `test-ngu.js`.
- **Thiền bảy luân xa** (`#thien-luan-xa`, `thienluanxa.js` + `luanxa.js` = `TDTD_LUANXA_AM`, Worker) — tụng theo đàn
  tanpura, chuông xoay; cũng chặn tự tải lại khi đang phát. `tdtd.luanxa`. `test-luanxa.js`.
- **Robot thắp sao** (`#lap-trinh`, `laptrinh.js` + `baicode.js` 100 bài) — lập trình kéo thả cho bé 6–10 tuổi, cảnh 3D
  nghiêng, chấm sao theo số ô. `tdtd.code`, `tdtd.code.nho`. `test-laptrinh.js`; `scripts/tim-loi-giai-gon.js`.
- **Đẩy thùng sao** (`#day-thung`, `sokoban.js` + `mansoko.js` 100 màn XSB do `scripts/tao-man-sokoban.js` tạo) — bộ giải
  ít lần đẩy, ô chết, chấm sao theo số lần đẩy. `tdtd.soko`. `test-sokoban.js` (~nửa phút).
- **Cờ vua ba người** (`#co-ba-nguoi`, `coba.js` + `phong.js`, `maqr.js`, máy nghĩ ở Worker) — bàn lục giác 96 ô, luật
  Tam quốc, phòng qua mạng (địa chỉ và link mời `…/co-vua-ba-nguoi/?phong=MÃ`), phòng mở, tìm phòng nhanh, đồng
  hồ. `tdtd.coba`. test-coba, test-phong (Node 24, ba "máy" trên fb-gia.js), test-maqr. Nhiều mục con trong "## Cờ vua
  ba người".
- **Bida lỗ** (`#bida`, `bida.js`, máy đánh ở Worker) — bàn 9 feet WPA, vật lý trượt–lăn–xoáy, 8 bi, 9 bi, đấu máy hay
  qua mạng (nhánh `bida`, `sanhbida` của Firebase, `…/bida-lo/?phong=MÃ`). Vật lý là hàm tự chứa `function LOI()` đầu bida.js
  (không có tệp lõi riêng); Worker của máy đánh dựng từ `LOI.toString()`, nên trong `LOI` không được dùng biến nào ở
  ngoài — bài kiểm chạy trên Node không có Worker nên không bắt được, phải thử đấu máy trên trình duyệt. Vật lý phải
  tất định từng bit (chơi qua mạng máy nào cũng chạy lại từng cú; chỉ cộng trừ nhân chia, căn bậc hai). test-bida kiểm
  cả trang `bida-anh-bien/`. Thường có phiên đang làm bida: hỏi trước khi sửa. Có trang tặng riêng `bida-anh-bien/` (không phải ngôi
  sao; `scripts/lam-qua-bida.py`). `tdtd.bida`. test-bida, test-bida-phong (Node 24). README "## Bida lỗ".
- **Ăn gì?** (`#an-gi`, `/an-gi/`; `angi.js` + `monan.js`) — vòng quay tám món theo bữa (giờ
  máy), trời (Open-Meteo, chỉ khi đã có `tdtd.troi.noi` hay bấm lấy vị trí), miền, túi tiền, ngày rằm/mùng 1 (lịch âm);
  vòng quay công bằng (rút món theo diện tích rồi giải ngược ω0 của ma sát có lời giải đóng); cả nhóm chuyền máy (tim,
  gạch); mâm cơm ba món như máy xèng, đi chợ. Dữ liệu món là bảng dòng `|` trong `monan.js`. `tdtd.angi`.
  `test-angi.js` (chạy cả Node 16). Trang cũ `hom-nay-an-gi/` giữ cho link đã gửi. README "## Ăn gì".
- **Buôn lậu phố cổ** (`#buon-lau`, `/buon-lau-pho-co/`, `buonlau.js`, Worker, phòng qua mạng nhánh `buonlau`,
  `sanhbuonlau`) — trốn tìm có dấu vết trên bản đồ phố cổ; bí mật của tay buôn không lên máy chủ (mã cam kết). README
  "## Buôn lậu phố cổ". test-buonlau, test-buonlau-phong (Node 24).
