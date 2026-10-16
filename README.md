# Thông Điệp Của Thượng Đế

Mỗi ngày mở app, bấm một lần, nhận đúng một thông điệp. Nhận rồi thì để nó đi.

Nội dung lấy cảm hứng từ bộ sách *Đối thoại với Thượng đế* của Neale Donald Walsch.

## Chạy thử

```bash
cd ~/Documents/Project/thong-diep-thuong-de && python3 -m http.server 5179
```

Mở http://127.0.0.1:5179 — không cần cài gì, không cần build.

## Nguyên tắc: không lưu lịch sử

App không giữ lại thông điệp nào. Không lịch sử, không bộ sưu tập, không nhật ký, không tài khoản, không cookie. Đóng tab là thông điệp đi qua, mở lại thì lá úp lại từ đầu.

Để biết có bao nhiêu người dùng, trang đếm lượt mở bằng Vercel Web Analytics — không cookie, không gắn mã nào vào máy, không gửi nội dung gì (xem mục *Đếm lượt truy cập*).

Máy chỉ ghi đúng **ba giá trị**, không có giá trị nào là nội dung và không có gì tích lũy theo thời gian:

| Khoá | Nội dung | Vì sao cần |
|---|---|---|
| `tdtd.seed` | một con số ngẫu nhiên, sinh trong lần mở đầu tiên | để mỗi người có bộ bài riêng |
| `tdtd.day` | ngày gần nhất đã nhận thông điệp, dạng `YYYY-MM-DD` | để một ngày chỉ nhận một lần, tải lại trang không rút lại được |
| `tdtd.tieng` | `1` hoặc `0` | nhớ người dùng đã bật tiếng ở hồ nước hay chưa. Không có khoá này thì coi như tắt |

`tdtd.day` bị ghi đè mỗi ngày nên không tạo thành lịch sử. Thông điệp cũ không lưu ở đâu và không xem lại được. `tdtd.tieng` là một lựa chọn cài đặt, không phải nội dung, và cũng bị ghi đè chứ không cộng dồn.

Cách chọn lá:

- Hạt giống của máy quyết định thứ tự bộ bài. **Hai người mở cùng một ngày nhận hai thông điệp khác nhau.**
- `cardFor(ngày, hạt giống)` đếm số ngày kể từ mốc 01/01/2026 rồi tra vào bộ bài đó. Cùng một người trong cùng một ngày thì luôn ra cùng một lá.
- Đã nhận thông điệp hôm nay rồi thì mở lại app sẽ thấy ngay lá đó, mặt ngửa, không còn nút nhận. Sang ngày mới lá tự úp lại.
- Mỗi vòng 209 ngày đi trọn bộ 209 thông điệp, không lá nào lặp trong vòng đó. Sang vòng mới bộ bài xáo lại.
- Vòng sau được sắp sao cho nửa cuối vòng trước rơi vào nửa sau vòng này, nên hai lần gặp cùng một lá luôn cách nhau ít nhất **106 ngày**. Không bao giờ trùng thông điệp hai hôm liền.
- Trình duyệt chặn lưu trữ (chế độ ẩn danh) thì hạt giống chỉ sống trong phiên đó. App vẫn chạy, chỉ là mở lại sẽ ra bộ bài khác.
- Không có nút xáo lại: bản trước có nút **Xáo lại bộ bài của tôi** trong bảng Giới thiệu (sinh hạt giống mới, lá hôm nay đổi sang lá khác); người dùng bảo bỏ.

Ngày tính theo lịch địa phương của máy và đổi lúc 0:00. Nếu app đang mở lúc nửa đêm, lá tự úp lại.

**Hệ quả:** trong cùng một ngày, một người mở lại bao nhiêu lần cũng chỉ thấy đúng lá đó. Đó là chủ ý, không phải lỗi.

## Mỗi trò một địa chỉ riêng

Gửi cho ai một trong những địa chỉ này là họ mở thẳng vào trò đó, không phải đi tìm ngôi sao:

| Trò | Địa chỉ |
|---|---|
| Mùa Chín | `#mua-chin` |
| Thả đèn hoa đăng | `#tha-den` |
| Hồ sen | `#ho-sen` |
| Hộp thở | `#hoi-tho` |
| Luyện phát âm | `#phat-am` |
| Nối sao thành chòm | `#noi-sao` |
| Bầu trời đêm nay | `#troi-dem` |
| Xem ngày | `#xem-ngay` |
| Thần số học | `#than-so` |
| Nhạc ngủ | `#nhac-ngu` |

Dùng phần sau dấu thăng nên không cần máy chủ định tuyến, và tự chạy được cả khi mất mạng. Bấm ngôi sao thì địa chỉ tự đổi theo, **đóng trò thì địa chỉ trở về trang chủ**. Nút Back của điện thoại cũng đóng trò lại chứ không thoát hẳn khỏi app.

Trong mỗi trò có một nút hình mắt xích cạnh nút đóng, bấm là chép địa chỉ trò đó, hoặc mở thẳng bảng chia sẻ của máy.

Toàn bộ phần này nằm gọn trong `assets/app.js`, không phải sửa file của từng trò. Trò nào cũng có nút đóng và phím Esc riêng, nên thay vì đi sửa năm chỗ, `app.js` ngồi nhìn lớp `hien` của thẻ bọc: mất lớp đó nghĩa là người dùng vừa đóng, thì xoá địa chỉ đi.

## Chia sẻ link một trò

Nút 🔗 trong mỗi trò mở bảng chia sẻ của máy (không có thì chép link).

- **Bấm chia sẻ ra hai link.** Người dùng báo. Bản đầu gửi `text: "<mô tả> — <link>"` cùng `url: <link>`, nên Zalo, Tin nhắn dán ra hai link liền nhau. Giờ link chỉ nằm ở `url`, chữ đi kèm là mô tả trò.
- **Link phát âm đừng hiện "Thông Điệp Của Thượng Đế".** Zalo, Facebook, Tin nhắn hiện tiêu đề của trang mà link trỏ tới, còn phần sau dấu `#` không bao giờ được gửi lên máy chủ — nên mọi link `…/#trò` đều hiện tên app. Trò nào khai `tieuDe` và `trang` trong `SAO` (hiện có phát âm: `tieuDe: 'Luyện phát âm tiếng Anh', trang: 'luyen-phat-am/'`) thì nút chia sẻ gửi link trang riêng: trang tĩnh mang tiêu đề và mô tả riêng (cả thẻ `og:`), mở ra là chuyển ngay vào `/#phat-am`. Đang ở trong trò thì tên thẻ trình duyệt cũng là tên riêng, đóng trò thì trả về tên app.

- **Vẫn hiện "Thông Điệp Của Thượng Đế".** Người dùng gửi ảnh Telegram: bản xem trước của `/phat-am/` mang đúng dòng mô tả của trang chủ — tức trình đọc link đã đi theo thẻ `<meta http-equiv="refresh">` của trang riêng về trang chủ. Giờ trang riêng chỉ chuyển bằng JavaScript (trình đọc link không chạy JS nên dừng ở trang có tên riêng; người thật vẫn được chuyển), tắt JS thì còn link bấm tay. Telegram đã lưu bản xem trước sai của `/phat-am/`, nên nút chia sẻ đổi sang địa chỉ mới `/luyen-phat-am/`; `/phat-am/` vẫn giữ (đã sửa) cho link đã gửi — muốn Telegram cập nhật link cũ thì gửi link đó cho @WebpageBot.

- **Zalo không hiện khung xem trước.** Zalo không công bố cách đọc link; trang chia sẻ có tiêu đề, mô tả mà chưa có ảnh, và nhiều ứng dụng chat không có ảnh thì không hiện khung. Thêm ảnh 1200×630 (`icons/og-phat-am-1.jpg`, 64 KB, vẽ bằng `scripts/lam-trang-chia-se.py`) với `og:image`, kích thước, `twitter:card` cỡ lớn. `icons/` được cache một năm, nên đổi ảnh thì đổi số trong tên.

- **Trò nào cũng có trang riêng và nút Cài app, như phần phát âm.** Người dùng: "mỗi game làm cài app như chỗ luyện âm á, có chú thích khác luôn". Giờ cả 14 trò khai `tieuDe`, `trang`, `nutCai: true` trong `SAO`; mỗi trò một trang chia sẻ mang tên riêng, **một đoạn mô tả riêng** (thẻ `description`, `og:description` — dòng chữ hiện dưới tiêu đề trong khung xem trước của Zalo, Facebook) và một ảnh xem trước riêng:

  | Trò | Trang chia sẻ | Ảnh xem trước |
  |---|---|---|
  | Mùa Chín | `/mua-chin/` | vệt nắng xẻ đôi trái dưa hấu, cam, xoài, măng cụt, bông hoa phải né |
  | Thả đèn hoa đăng | `/tha-den-hoa-dang/` | đèn giấy bay lên, chiếc lớn có chữ "nhẹ lòng" |
  | Hồ sen | `/ho-sen/` | lá sen, ếch, hoa sen, sóng lan, con cá |
  | Hộp thở | `/hop-tho/` | vòng tròn đếm nhịp "Hít vào 3", thở vuông 4 · 4 · 4 · 4 |
  | Nối sao thành chòm | `/noi-sao-thanh-chom/` | Bắc Đẩu theo toạ độ thật trong `constellation.js` |
  | Bầu trời đêm nay | `/bau-troi-dem-nay/` | trăng khuyết, sao, dải Ngân Hà trên chân trời |
  | Luyện phát âm | `/luyen-phat-am/` (viết tay, có từ trước) | lưới ô âm |
  | Xem ngày tốt xấu | `/xem-ngay-tot-xau/` | vòng mười hai giờ, sáu giờ hoàng đạo của ngày Tý đúng như `lich.js` tính |
  | Thần số học | `/than-so-hoc/` | biểu đồ ngày sinh 15/9/1987 như `sohoc.js` tính: số chủ đạo 4, mũi tên Quyết tâm và Hoạt động |
  | Nhạc ngủ | `/nhac-ngu/` | trăng lưỡi liềm, sóng âm nhỏ dần |
  | Thiền bảy luân xa | `/thien-luan-xa/` | người ngồi thiền, bảy chấm đúng màu trong `luanxa.js` |
  | Robot thắp sao | `/robot-thap-sao/` | robot trên khối đá có bậc phải Nhảy, bốn ô lệnh đúng hình và màu trong trò |
  | Đẩy thùng sao | `/day-thung-sao/` | màn 38 thật trong `mansoko.js` |
  | Cờ vua ba người | `/co-vua-ba-nguoi/` | bàn 96 ô chia đúng cách của `coba.js`, quân xếp như lúc bắt đầu ván |

  Trang và ảnh sinh từ một bảng trong `scripts/lam-trang-chia-se.py` (thay `lam-anh-chia-se.py`, vốn chỉ vẽ ảnh phát âm): sửa chữ hay hình ở đó rồi chạy lại. Ảnh đã có thì script không ghi đè vì `icons/` được cache một năm; đổi hình thì tăng số trong tên. Ảnh vẽ gấp đôi rồi thu nhỏ cho nét mịn, mỗi ảnh 47–78 KB. Số liệu trong ảnh lấy từ chính các trò chứ không vẽ bừa.

- **Nút Cài app đè lên đồ của trò.** Nút rộng chừng 94 px, nằm ở hàng trên cùng cạnh 🔗 và ✕. Mở từng trò trên trình duyệt giả điện thoại 375 px rồi đo khung từng phần tử, thấy nút đè lên tim của Mùa Chín, số ếch trong hồ, nút "Phóng ×…" của Trời đêm, cùng tiêu đề và nút ? của Robot thắp sao, Đẩy thùng sao, Cờ ba người. Có nút thì khung trò mang lớp `co-nut-cai`, các thứ đó nhường chỗ: tim và số ếch dời sang trái nút, nút phóng xuống dưới hàng nút; ba trò có thanh tiêu đề thì chừa thêm chỗ bên phải, còn trên điện thoại (hẹp dưới 480 px) không đủ chỗ cho cả tiêu đề lẫn ba nút thì thanh tiêu đề lùi xuống dưới hàng nút, như trò phát âm. Đo lại: không trò nào còn bị đè. Cũng lúc này thấy một lỗi có từ trước: thanh điểm của Mùa Chín chỉ chừa 58 px bên phải, nên hai trên ba trái tim nằm dưới nút 🔗 từ hồi có nút đó; giờ chừa 104 px.

`scripts/test-sao.js` chạy thẳng `linkTro`, `chepLink` cắt ra từ `app.js` cho mọi trò: chữ đi kèm không chứa link, trò nào cũng gửi trang riêng của nó với tên riêng, trò chưa có trang thì vẫn `#trò`; mọi trang riêng có tiêu đề trùng `tieuDe`, không nhắc tên app, chuyển đúng chỗ bằng JS và không có thẻ refresh, `og:url` trỏ đúng chính nó, có mô tả và chữ thay ảnh, không trang nào chép mô tả của trang khác, ảnh xem trước có thật, đúng 1200×630 như khai, dưới 300 KB. Thêm các bài cho nút Cài app ở mọi trò và chỗ nhường của lớp `co-nut-cai`. Đã thử phá cố ý năm chỗ (bỏ lớp `co-nut-cai`, trả thanh điểm về 58 px, chép mô tả trò khác, một trò quên `nutCai`, trang trỏ tới ảnh không có): bài kiểm bắt được cả năm.

## Bầu trời sao

Trên nền có những ngôi sao nhỏ đủ màu, mỗi ngôi là một trò riêng. Chúng rơi vào vị trí ngẫu nhiên mỗi lần tải trang, **không bao giờ đè lên nhau**, cũng không đè chữ.

Thêm một ngôi sao mới chỉ cần thêm một dòng vào mảng `SAO` ở đầu `assets/app.js`:

```js
{ id: 'sao-moi', mau: '#f0b46a', hinh: 'sao4', nhan: 'Mô tả cho trình đọc màn hình',
  mo: () => moTroChoiCuaBan() },
```

`hinh` chọn trong `sao5`, `lap-lanh`, `sao4`, `hoa`, hoặc đưa thẳng một chuỗi path SVG. `mau` nhận mọi mã màu CSS. Thêm `bat: false` để tạm ẩn một ngôi sao mà không xoá dòng.

Cách rải: thuật toán thử nới dần điều kiện, tránh cả chữ, lá bài lẫn các sao đã đặt (cách nhau tối thiểu 18 px). Hết chỗ thì chọn ô đè ít nhất, tính chữ nặng gấp 40 lần lá bài, nên chữ không bao giờ bị che. Đã thử 24 ngôi sao trên màn 375×812, rải 60 lần: không cặp nào đè nhau, không sao nào đè chữ hay lọt ra ngoài màn hình.

Hiện có mười ngôi sao. Sáu ngôi đầu tả ngay dưới đây, bốn ngôi mới nhất — xem ngày, thần số học, nhạc ngủ và bầu trời đêm nay — có mục riêng ở cuối:

### Sao xanh ngọc — Mùa Chín

Trò xả stress, mã nguồn ở `assets/game.js`, độc lập hẳn với phần thông điệp.

Miết ngón tay hoặc rê chuột để một vệt nắng đi qua. Nắng chạm tới đâu thì trái chín tới đó, tách đôi và bắn nước. Trái cây gồm dưa hấu, cam, chanh, thanh long, dừa, xoài, măng cụt. Làm chín liên tiếp trong 320 mili giây được nhân điểm tới 5 lần. Ba mùa, để rơi một quả hoặc chạm phải bông hoa là mất một mùa. Không lưu điểm, đóng là hết.

Bản đầu trò này tên **Đồ Long Đao**, người chơi cầm đao chém trái cây và né quả bom. Đổi đi vì cả app không có kẻ thù nào, trong khi tên đao nghĩa là chém rồng. Nắng thay cho đao, bông hoa thay cho bom: hoa chưa kết trái mà chạm vào thì mất một mùa vì vội quá, chứ không ai nổ ai. Màn hình cũng không rung giật và loé đỏ nữa, chỉ sẫm lại một nhịp rồi cánh hoa rụng xuống.

Thứ phải né thì phải nhìn là biết. Bản trước dùng **trái còn non**: quả tròn xám xanh, vỏ sần, có vòng nét đứt quanh quả. Người chơi báo rất khó phân biệt, và đúng là vậy: nó tròn như mọi trái khác, xanh như chanh và dưa hấu, trên điện thoại còn to ngang trái chanh (26 px so với 25 px). Lúc trái bay vèo qua, mắt nhận ra vật trước hết bằng **hình dáng** rồi mới tới màu, mà vòng nét đứt với vỏ sần thì quá mảnh để kịp thấy.

Giờ là **bông hoa**: năm cánh trắng hồng, nhụy vàng, có quầng sáng dịu, cánh hé ra khép vào rất khẽ. Hình dáng khác hẳn mọi quả tròn, màu không trùng trái nào. Hoa to hơn trái non cũ một chút (32 px, trên điện thoại 28 px) vì năm cánh chiếm ít chỗ hơn một quả tròn cùng cỡ. Vùng tính chạm nhỏ hơn hình vẽ (82%), vì giữa hai cánh là khoảng trống, sượt qua đó thì không nên mất mùa. Dòng gợi ý ở màn mở có vẽ sẵn một bông hoa nhỏ để người chơi biết trước phải né cái gì.

Bấm Esc hoặc nút ✕ để thoát.

### Sao cam — thả đèn hoa đăng

Mã ở `assets/lantern.js`. Gõ ra điều đang nặng lòng rồi bấm Thả đi. Chữ biến thành một chiếc đèn giấy bay lên, chữ mờ dần trước, rồi đèn nhỏ lại và tắt hẳn sau khoảng 17 giây. Vài chiếc đèn khác trôi sẵn trên nền cho đỡ trống.

Ô nhập được xoá ngay lúc bấm thả. Chữ chỉ tồn tại trong bộ nhớ của trang, không ghi xuống máy, không gửi đi đâu. Đóng màn hình là mất sạch.

### Sao xanh nước — hồ nước

Mã ở `assets/pond.js`. **Không có một dòng chữ hướng dẫn nào trong hồ** — chỉ có mặt nước và nút đóng, ai chơi thì tự thấy. Chạm hoặc miết trên mặt nước, sóng lan ra rồi tắt. Mở lên có năm chiếc lá sen rải thưa, không đè nhau, nhún lên khi sóng đi qua — nhưng lá cũng có đời riêng, chỗ nào cũng đổi theo thời gian. Thỉnh thoảng có hạt mưa tự rơi.

Trên lá có bốn con ếch lúc mở màn. Chạm đúng vào con nào thì con đó giật mình phóng sang chiếc lá **xa ngón tay nhất**, nên chạm bên này là đẩy nó qua bên kia. Chạm chỗ khác trên hồ thì chỉ có sóng, ếch vẫn ngồi. Không có nhiệm vụ nào cả: muốn dồn cả đàn vào một lá, muốn rải mỗi con một nơi, hay chỉ ngồi xem cũng được.

- Vùng chạm của mỗi con nới rộng tới 40 px vì ngón tay to hơn con ếch. Con đang bay thì chạm không ăn, con đang bơi thì chạm là nó phóng lên lá gần nhất.
- Chọn lá đích bằng cách chấm điểm: đúng hướng tránh ngón tay được ưu tiên gấp đôi, lá gần hơn được thêm một chút. Giật mình thì cú nhảy nhanh và cao hơn cú nhảy thường.
- Mỗi con tự nhảy sau 5–15 giây; ngồi cùng lá với bạn, hoặc già rồi, thì lười hơn.
- Con trỏ chuột là mũi trỏ thường trên mặt nước, chỉ thành bàn tay khi rê vào đúng một con ếch.

**Lá chìm.** Sức chở của lá chia theo bán kính, mỗi 6 px thêm một con: 26–31 px chịu 2 con, 32–37 px chịu 3, 38–43 px chịu 4, từ 44 px chịu 5. Chiếc lá đầu tiên luôn được rải to (44–50 px). Dồn quá sức thì lá lún dần chừng một giây rưỡi, nước loang lên mặt lá, rồi **con lên sau cùng bị tuột xuống nước**: nó bơi 54 px mỗi giây sang chiếc lá gần nhất còn chỗ rồi trèo lên, thân ngập nước chỉ còn cái đầu nhô lên, hai chân đạp nước và để lại vệt sóng.

**Lá trôi.** Lá không đứng một chỗ. Nước có ba thành phần, cộng lại mới ra kiểu trôi tự nhiên:

- **Gió**: một hướng chung cho cả hồ, sức 0,4–2,4 px mỗi giây, và **hướng gió quay đều** với tốc độ 0,018–0,05 radian mỗi giây (tức một vòng mất 2–6 phút), chiều quay đổi ngẫu nhiên mỗi 25–60 giây.
- **Xoáy**: một vòng quay quanh giữa hồ, sức và chiều ngẫu nhiên trong khoảng ±1,2 px/giây, nên lá đi vòng chứ không đi thẳng một mạch.
- **Đường lượn riêng**: mỗi chiếc lá tự đi theo một hướng của nó, 0,45–1,5 px/giây, hướng đó tự đổi lai rai. Nhờ vế này mà đám lá không trôi thành một cái bè cứng.

Vì sao gió phải **quay đều** chứ không phải đổi hướng ngẫu nhiên: gió quay hết một vòng thì lá cũng đi hết một vòng rồi về gần chỗ cũ, nên **không tích luỹ dạt về phía nào**. Bán kính vòng đi bằng sức gió chia tốc độ quay, cỡ 50–130 px.

Thêm hai lực nữa:

- **Vành ngoài kéo về**: lòng hồ là một hình bầu dục bằng 0,4 lần khung; **bên trong không kéo gì cả** nên lá tha hồ tản ra, chỉ khi dạt ra ngoài vành đó mới bị kéo về, càng xa càng mạnh.
- **Lá đẩy nhau**: từ khoảng cách 1,7 lần tổng bán kính, mỗi pixel xích lại gần sinh 0,12 px/giây đẩy ngược. Lực này **cố ý để mềm, ngang sức gió** — cơn gió mạnh dồn được chúng kề nhau một lúc, hết gió thì chúng tự giãn ra.

Bộ số này tôi phải đo bốn lần mới ra, vì hai đầu đều sai:

| Cách làm | Kết bè | Có cặp kề nhau | Dạt ra vành ngoài | Phủ mặt hồ |
|---|---|---|---|---|
| Gió một chiều, đẩy nhau ở tầm chạm | 0% | 80% | rất nhiều, tâm đám ra sát bờ | — |
| Thêm lực hút về giữa ở **mọi chỗ** | 0% | 85% | 0% | **13%**, co thành một cục giữa hồ |
| Đẩy nhau mạnh và xa | 0% | **2,6%** | ít | 24%, nhưng lá không bao giờ lại gần nhau |
| **Gió quay đều + chỉ vành ngoài kéo về** | **0%** | 4–20% | **22,5%** | **34%** |

Đo dòng cuối trong 40 phút: tâm đám lệch khỏi giữa hồ trung bình 178 px, xa nhất 339 px, và không lúc nào cả đám kết bè.

Ếch ngồi trên lá tự trôi theo, vì mỗi khung hình nó được đặt lại theo tâm lá cộng với chỗ đậu của nó. Cuống nối lá con với lá mẹ giữ **tham chiếu tới lá mẹ** chứ không giữ toạ độ chết, nên lá mẹ trôi thì cuống vẫn dính đúng chỗ; lá mẹ tàn thì cuống rụng theo.

Đo 40 phút với bộ số hiện tại: **không có lúc nào cả đám kết bè** (kẽ nước trung bình giữa các cặp không bao giờ xuống dưới 12 px), nhưng **9,6% thời gian có ít nhất một cặp lá kề sát nhau** trong vòng 26 px — đúng cái "lâu lâu tụ lại". Tâm đám lệch khỏi giữa hồ trung bình 141 px, xa nhất 265 px, và đám lá phủ chừng 23% diện tích mặt hồ. Ếch không con nào lệch khỏi lá của nó.

**Đời của chiếc lá.** Lá không phải cái sân cố định, nó cũng sinh ra rồi tàn đi:

- Mỗi chiếc có cỡ tối đa riêng 26–50 px và **tuổi thọ 4–7 phút**. Năm chiếc lúc mở màn được cho tuổi lệch nhau (10–55% một đời) nên không tàn cùng lúc.
- Lá nào lớn hơn 34 px thì cứ 50–100 giây **đẻ một nhánh**: một mầm 13 px nhú ra cách mép lá mẹ 24–46 px, không đè lá nào, không lọt ra ngoài khung. Mầm còn dính **cuống** với lá mẹ, cuống nhạt dần rồi rụng sau 20 giây.
- Mầm lớn dần, 80 giây thì đạt cỡ tối đa của nó. Mầm dưới 22 px chỉ chở nổi **một** con ếch.
- Quá 78% tuổi thì lá **úa dần** sang vàng nâu. Hết tuổi thì tàn trong 5 giây: úa hẳn, teo lại 16%, chìm xuống, mờ đi rồi mất, để lại một vòng sóng.
- Lá bắt đầu tàn thì **dọn khách**: con nào đang ngồi sẽ nhảy sang chiếc lá còn chỗ, không còn lá nào thì tuột xuống nước mà bơi.
- Nhiều nhất 8 lá cùng lúc. Nếu hồ trắng không còn lá nào thì một mầm mọc lên từ gốc dưới đáy, hồ không bao giờ thành mặt nước trơ.

Chạy thử ba hồ, mỗi hồ 30 phút: số lá trung bình 4,7–7,5 chiếc, mỗi hồ có 22–44 lá sinh ra và 19–42 lá tàn đi; có hồ thưa xuống còn một lá rồi dày lại.

Hai chỗ dễ sai khi lá biến mất, đều đã sửa và có bài kiểm bất biến chạy 30 phút để canh:

- Ếch nhớ **chỉ số** lá trong mảng, nên bỏ một chiếc là mọi chỉ số phía sau phải dời theo, và con nào đang ngồi, **đang bay tới**, hay đang bơi tới chiếc lá vừa mất đều phải cho xuống nước. Thiếu vế "đang bay tới" thì con ếch đáp xuống chỗ trống rồi ngồi trên mặt nước cho tới lần tự nhảy sau.
- Con đang bơi phải **cắm đầu tới chiếc lá đã nhắm**, chỉ nhắm lại khi lá đó mất hẳn. Bản đầu cho nó đổi lá mỗi khi lá đích đầy, thành ra lúc hồ đông thì nó lượn vòng giữa hai chiếc lá đầy tới 25 giây không lên được. Giờ đầy cũng trèo lên, đầy quá thì lá lún và có con khác tuột xuống.

**Tiếng.** Hồ có tiếng, **sinh hết bằng Web Audio, không nhúng file âm thanh nào** — cả app vẫn 168 KB. **Mặc định tắt**; nút loa ở góc trên bên trái để bật, lựa chọn nhớ ở khoá `tdtd.tieng`. Đang tắt thì **không tạo `AudioContext` nào cả**, không tốn gì.

Giọt nước và tiếng dế làm theo tài liệu chứ không mò; tiếng ếch thì cố ý đi chệch tài liệu cho êm (xem dưới bảng):

| Tiếng | Cách sinh | Căn cứ |
|---|---|---|
| Giọt nước | `A·sin(2π f(t)·t)·e^(−βt)` với `f(t) = f0(1+ξt)`, ξ = 0,1 và β = 0,043·f0. Gần như **thuần âm**, cao độ **nhích lên** trong lúc tắt. Bốn cỡ giọt 640 / 820 / 1150 / 1650 Hz; chạm mạnh thì bong bóng to nên chọn giọt trầm, hạt mưa nhỏ thì chọn giọt cao | mô hình bong bóng của van den Doel 2005; cộng hưởng Minnaert `f0 ≈ 3,26/R` cho bong bóng 2 mm ~1600 Hz, 5 mm ~650 Hz |
| Tiếng ộp | f0 **250–390 Hz** cộng ba bậc hài yếu dần (0,5 / 0,24 / 0,08), lọc bỏ phần trên 1,1 kHz. Cao độ vào thấp, nhích lên trong 25 ms rồi trùng xuống. Cổ họng rung 27 nhịp/giây nhưng chỉ sâu 18%. Mỗi tiếng 130 ms, vào mềm 14 ms, tắt về đúng 0; một câu 1–3 tiếng cách nhau 230 ms, tiếng sau nhỏ dần, tiếng cuối hạ giọng | cố ý **không** theo tài liệu, xem dưới |
| Tiếng dế | **hình sin thuần 4,5 và 4,8 kHz**, bốn xung 17 ms cách nhau 18 ms, mỗi xung bọc cửa sổ `sin²` cho khỏi cạch hai đầu | carrier 4,5–4,8 kHz, xung 15–20 ms, nghỉ 15–20 ms, 3–5 xung một tiếng |

**Tiếng ếch làm lại cho êm.** Bản đầu bám đúng tài liệu: bảy sóng hài của f0 420–780 Hz bị băm biên độ 46–68 nhịp mỗi giây. Đúng là tiếng ếch, nhưng người dùng thấy nó "không chill": chói và rè như còi. Hồ này để thư giãn, nên đổi sang một tiếng "ộp" tròn và trầm, như ếch đồng kêu xa xa ngoài ruộng đêm. Đo bằng số vì bài kiểm không nghe được bằng tai: trọng tâm phổ từ **650 Hz xuống 287 Hz**; độ to trong một tiếng không còn chỗ nào sụt quá nửa (bản cũ có 9 chỗ sụt về gần 0 trong 0,1 giây — đó chính là tiếng rè); hai đầu tiếng về đúng 0 nên không có tiếng tách. Vẫn giữ bậc hài 2 và 3 vì loa điện thoại gần như câm dưới 300 Hz, bỏ đi thì trên điện thoại chỉ còn im lặng.

**Vang mặt nước và trái phải.** Mọi tiếng đi qua một lớp vang rất nhẹ (nhiễu tắt dần trong 1,4 giây, càng về sau càng tối, chừa 12 ms đầu trống như tiếng dội về từ bờ bên kia, trộn 22%), và nghiêng trái phải theo chỗ phát ra, tối đa 60% sang một bên. Tiếng dế thì ở đâu đó quanh bờ, nhỏ hơn trước. Vang chỉ là một node cho cả hồ, không tốn thêm gì cho mỗi tiếng.

Thêm tiếng bẹt ướt khi ếch đạp chân rời lá hoặc đáp xuống lá (nhiễu qua một cực thông thấp 250–380 Hz, tắt trong 130–170 ms, kèm một chút cao cho ra cái sột của mặt lá), tiếng cá đớp, và tiếng lưỡi phóng.

**Không có tiếng nền.** Bản đầu tôi cho một vòng nhiễu lọc trầm chạy liên tục; nghe ra tiếng quạt rì rì chứ không ra hồ nước, nghe lâu thì mệt. Hồ đêm thật thì im — chỗ im giữa hai tiếng mới là phần làm nó dịu.

**Kết xuất sẵn thành mẫu.** Bản đầu tôi dựng cả chuỗi lọc cho từng tiếng, mỗi gợn sóng là 6–10 node Web Audio mới, máy yếu gánh không nổi nên thấy lag. Giờ mỗi tiếng được tính ra mẫu **đúng một lần** lúc bật tiếng (sáu bộ mẫu, tính bằng vòng lặp thuần trên `Float32Array`), sau đó phát lại chỉ tốn hai node và có xê dịch `playbackRate` cho khỏi giống nhau. Nhiều nhất 8 tiếng vang cùng lúc, tiếng nước cách nhau tối thiểu 110 ms.

Đo bằng `AnalyserNode` gắn vào mức chung:

| Tiếng | Đỉnh phổ đo được | Khớp với |
|---|---|---|
| Giọt nước | 656 Hz, 0% năng lượng trên 3 kHz | Minnaert cho bong bóng 5 mm: 652 Hz |
| Tiếng ộp | 258 Hz (bản cũ 375 Hz) | giọng trầm nhất 250 Hz |
| Tiếng dế | 4430 Hz, năng lượng gói trong dải 4359–4500 Hz, 100% trên 3 kHz | carrier 4,5 kHz gần như thuần âm |
| Giữa hai tiếng | không một bin nào hữu hạn | đã bỏ tiếng nền |

Chi phí mỗi khung hình: **0,194 ms khi bật tiếng so với 0,192 ms khi tắt**, tức tiếng gần như không tốn gì.

Liều lượng cũng phải đo: bản đầu mỗi con ếch có cơ hội kêu `dt/42000` mỗi khung hình, ra **106 tiếng trong 5 phút** — ồn như cái chợ. Hạ xuống `dt/210000` và nghỉ 9–22 giây sau mỗi tiếng thì còn **2,5 tiếng mỗi phút** với 8 con ếch. Ếch còn **đáp lời nhau**: một con kêu thì một con khác trong vòng 220 px có 40% khả năng kêu đáp sau 0,3–0,9 giây.

Ba chỗ đáng biết:

- **Công tắc im lặng của iPhone tắt Web Audio.** Người gạt nút silent sẽ không nghe gì; nút loa hiện rõ trạng thái nên ít ra người ta biết app có tiếng.
- Tiếng **vào từ từ trong 2 giây** lúc bật, không nổ ra ngay, vì có người mở app lúc nửa đêm.
- Đóng hồ, tắt tiếng, hay chuyển sang tab khác thì `AudioContext` bị `suspend`.

Nguồn: [Minnaert resonance](https://en.wikipedia.org/wiki/Minnaert_resonance), [van den Doel, *Physically based models for liquid sounds*, ACM TAP 2005](https://dl.acm.org/doi/10.1145/1101530.1101554), [Sequential filtering processes shape feature detection in crickets, *Frontiers in Physiology* 2016](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2016.00046/full), [Signal recognition by frogs in chorus-shaped noise, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3002223/).

**Vòng đời.** Ngồi chơi lâu thì thấy trọn một vòng, không có gì phải bấm:

| Chặng | Thời gian | Chuyện gì xảy ra |
|---|---|---|
| Ruồi hoặc muỗi bay vào | 16–34 giây một tốp, chia cho mức mùa | Bay lượn thất thường, hay quẩn quanh mấy chiếc lá, có bóng nhỏ chạy theo dưới nước. Muỗi nhỏ hơn và có chân dài lêu nghêu |
| Ếch ngắm | khi con bọ vào trong 4,2 lần thân | Ếch quay đầu nhìn theo. Con nào no gần đầy (trên 0,92) thì chẳng thèm, để dành cho con đói |
| Phóng lưỡi | 0,3 giây | Vào trong 2,5 lần thân và đầu đã quay tới trong 0,6 radian thì lưỡi phóng ra, dính con bọ ở đầu lưỡi rồi kéo về. Nhảy giữa lúc đó thì nhả lưỡi, con bọ thoát |
| Đẻ trứng | xét lại mỗi 35–60 giây | Tới hẹn mà mức no trên 0,6 thì đẻ một ổ **3–7 trứng** sát mép lá và trả 0,3 mức no. Còn đói thì khoan, mươi giây nữa xét lại. Cả đàn — ếch, nòng nọc, trứng — mà đã bằng số chỗ ngồi đám sen đang có thì cũng khoan |
| Trứng nở | 20–26 giây | Mầm đen mọc đuôi rồi nở ra một đàn nòng nọc |
| Nòng nọc lớn | 40–55 giây | Bơi lượn, thân to dần, quá 62% thời gian thì nhú hai chân sau. Chạm gần thì nó vọt đi tránh ngón tay |
| Thành ếch | | Lớn đủ ngày là lên bờ, không ai chặn. Bơi tới chiếc lá còn chỗ rồi trèo lên; cả hồ hết chỗ thì ở lại dưới nước |

Thang thời gian đặt cho **một phiên chơi 5 phút thấy trọn vòng**. Đo ba phiên: con bọ đầu tiên hiện ở giây thứ 6–9, ếch phóng lưỡi ở giây 9–17, ổ trứng đầu tiên ở giây 44–59, nòng nọc ở giây 68–83, con ếch mới ở phút thứ **1,8–2,1**, và con đầu tiên chết ở phút thứ 2–2,8. Nghĩa là chơi hai phút là đã thấy hết chuỗi, năm phút thì thấy sang lứa sau.

**Đông tới đâu là hồ tự nói.** Trước đây có hai cái trần tôi tự gõ vào: chặn cứng 9 con ếch, và quá 18 mống thì thôi không đẻ. Đo bốn hồ hai tiếng thì thấy trần đó không phải lưới an toàn mà **chính là dân số** — trung vị của hồ đúng bằng 9, 99% mẫu cũng bằng 9, mọi mùa rộ đều bị cắt cụt. Nó cũng không tiết kiệm máy: bỏ trần còn *rẻ hơn* (8,7 giây CPU cho hai tiếng so với 15,2), vì có trần thì mỗi tiếng gần 500 lượt nòng nọc nằm chờ 12 giây rồi chờ lại, tính mãi mà chẳng thành con nào. Và máy chưa bao giờ là vấn đề: lúc hồ trên 30 con, một khung hình tốn 0,187 ms, 99% dưới 0,66 ms, trong khi ngân sách 60 hình một giây là 16,7 ms.

Nay chỉ còn một giới hạn, và nó do thế giới đặt: **cả đàn không quá số chỗ ngồi mà đám sen đang có**. Sen mọc thêm thì nuôi thêm được, sen tàn thì đàn tự thưa. So bốn cách trên bốn hồ hai tiếng mỗi hồ:

| | trung vị | 90% dưới | 99% dưới | đỉnh |
|---|---|---|---|---|
| Trần 9 con + cửa 18 mống (cũ) | 9 | 9 | 9 | 9 |
| Bỏ trần 9, giữ cửa 18 | 9 | 15 | 19 | 23 |
| Bỏ cả hai, không giới hạn gì | 8 | 26 | 44 | 56 |
| **Cửa = số chỗ ngồi trên sen** | **10** | 19 | 24 | 28 |

Đàn đông hơn cũ và biên độ rộng gấp ba, mà đỉnh vẫn còn ra cái hồ. Bỏ sạch mọi giới hạn thì đỉnh lên 44–56 con, nhìn thành một tấm thảm ếch. Bảng này lặp lại được: chạy lại bản chọn trên bốn hồ khác cho đúng trung vị 10, 90% dưới 19, đỉnh 29.

Chỗ thấy rõ nhất là **số ếch lúc dừng**, 16 hồ mỗi bản, mỗi hồ hai tiếng:

```
cũ : 9, 8, 9, 0, 9, 9, 9, 2, 9, 9, 5, 9, 8, 0, 9, 9      ← mười hồ dừng đúng ở trần
mới: 0, 17, 0, 17, 21, 4, 9, 0, 13, 8, 11, 14, 5, 12, 10, 14
```

Còn tuyệt chủng hẳn — hết cả ếch lẫn nòng nọc lẫn trứng, không còn gì gây lại: cũ 2/16, mới 3/16. Mười sáu mẫu thì hai con số đó không phân biệt được, nên không kết luận bản nào bền hơn.

**Hết chỗ trên lá thì ở lại dưới nước.** Mỗi chiếc lá chỉ chở được vài con: mầm mới nhú một con, lá 22–31 px hai con, lớn dần lên ba, bốn, và từ 44 px là năm. Trước đây hết chỗ thì con ếch vẫn cứ trèo lên chiếc lá đã đầy — lá lún xuống, nó tuột ra, lại trèo lên, quẩn mãi một vòng. Nay hết chỗ là **ở lại dưới nước**: nó nổi giữa hồ, khua chân giữ mình khỏi trôi dạt, giữ khoảng với mấy con nổi bên cạnh, hai giây rưỡi ngó quanh một lần xem có lá nào trống ra chưa. Nổi ngay mặt nước nên vẫn với tới con bọ bay thấp, và vẫn đói vẫn già vẫn chết như mọi con trên lá.

Đi kèm hai điều: con ngồi trên lá đến giờ **nhảy chơi** thì chỉ nhảy sang lá còn chỗ, không còn nhảy bừa lên lá đầy để rồi hất con khác xuống — đo thử với hơn ba mươi con trong hồ, số cú nhảy trong 30 giây giảm từ 39 xuống 16–27. Còn **giật mình** vì ngón tay thì vẫn nhảy bừa: hoảng thì không kịp phép tắc. Lá đầy vẫn lún, và con lên sau cùng vẫn bị hất xuống nước như cũ.

Góc phải trên, ngay bên trái nút chép link và dấu x, có một con số mờ đếm số ếch đang sống trong hồ. Chỉ con số trần, không kèm chữ — trong một cái hồ toàn ếch thì nhìn là biết nó đang đếm gì.

**Đói và chết.** Mỗi con có mức no từ 0 tới 1. Sống là tiêu: no đầy mà không ăn gì thì gần 4 phút là kiệt. Một con mồi bù lại 0,4. Đói thì **trước hết là không đẻ**, cạn hẳn mới chết; ngoài ra mỗi con có tuổi thọ riêng 3,5–6 phút, hết tuổi cũng chết. Chết thì ngồi yên, nhắm mắt, màu bạc dần rồi lịm xuống tan vào nước trong 2,6 giây, để lại một vòng sóng — không có xác nổi. Càng đói hoặc càng già thì màu càng bạc, nên nhìn là biết con nào đang yếu.

**Cá.** Mỗi 45–110 giây có một chuyến cá ghé hồ, số con **ngẫu nhiên**: phần lớn một con, chừng ba lần trên mười thì hai con, thỉnh thoảng ba con. Nhiều nhất ba con cùng lúc, đông hơn nữa thì hồ thành cái chậu cá. Đếm 69 chuyến trong lúc chạy thử: 44 chuyến một con, 21 chuyến hai con, 4 chuyến ba con. Mỗi con ở lại 24–44 giây rồi bơi ra mép mà biến. Cá bơi dưới mặt nước nên chỉ là cái bóng mờ, nổi rõ dần khi nó rượt. Thấy nòng nọc trong 130 px thì đuổi, vào 55 px thì phóng một cú nhanh gấp đôi, tới 30 px là đớp; đớp xong lặn xuống nghỉ 5–11 giây. Nòng nọc thấy cá trong 58 px thì cong đuôi chạy, nhưng chỉ vọt được một quãng nên không thắng nổi cú phóng. Mỗi con cá trong một chuyến thường ăn 0–3 con nòng nọc, nên chuyến ba con là một mẻ nòng nọc gần như không con nào qua được.

**Đàn bọ là một quần thể, không phải cái vòi phun.** Trước đây cứ mấy giây hồ lại phun ra một con bọ theo đồng hồ, ăn hay không ăn cũng vậy. Nay đàn bọ có số của nó (`damBo`, để dạng số thực nên lớn lên từng chút):

```
đàn dày thêm = sinh sôi (chậm dần khi gần đầy hồ) + lâu lâu một con bay từ nơi khác tới
đàn vơi đi   = mỗi lần một con ếch nuốt một con
```

Mùa vẫn còn — cứ 50–110 giây hồ đổi mức, ngẫu nhiên 0,35 tới 1,9 lần — nhưng giờ mùa quyết định **sức chứa** của đàn bọ chứ không quyết định thẳng số con bay ra. Nhờ vậy hồ tự có vòng của nó, không chỗ nào gõ tay con số "hồ nuôi nổi mấy con ếch":

> ếch đông → bọ bị ăn sạch → ếch đói, chết bớt → bọ không ai ăn nên dày trở lại → ếch no, đẻ liên tục → lại đông

Số con bay trên mặt nước lấy **phần nguyên** của đàn, không làm tròn. Chỗ này tôi làm sai một lần: làm tròn thì đàn 0,5 con vẫn thả ra một con bay, ếch nuốt xong trừ đi một thành âm rồi bị kéo về 0 — hoá ra hồ đẻ mồi từ không khí và đàn ếch không bao giờ đói.

**Hồ trống thì có ếch lạc tới.** Sạch bóng ếch không phải là hết chuyện: ngoài kia còn hồ khác, còn mương, còn ruộng. Khi hồ không còn mống nào — hết cả ếch lẫn nòng nọc lẫn trứng — thì cứ 40–110 giây có một con lạc đường bơi vào từ mép màn hình. Nó tới đúng lúc đàn bọ đã dày lên vì lâu nay không ai ăn, nên no nhanh và đẻ liên tục.

Đo một lượt: dọn sạch hồ, rồi ngồi xem.

| | |
|---|---|
| giây 15 | 0 ếch, đàn bọ 1,5 |
| giây 45 | 0 ếch, đàn bọ 3,2 |
| giây 60 | **một con lạc bơi vào** |
| giây 150 | 1 ếch, đàn bọ 5,6 — một mình ăn không xuể |
| phút 5 | 23 ếch |
| phút 7 | 6 ếch, bọ cạn — đông quá, hết mồi, rụng bớt |

**Chỗ này chữa một lỗi thật.** Sau khi bỏ trần 20 phút, mỗi lần để tab qua đêm là hồ chạy đủ một ngày, và một ngày thì hồ luôn chết — mở lại lúc nào cũng thấy con số 0. Đo 12 hồ mỗi mốc, trước và sau khi đàn bọ biết sinh sôi và có ếch lạc:

| Rời tab | Cũ: hồ thấy 0 ếch | Mới |
|---|---|---|
| 2 tiếng | 3/12 | 0/12 |
| 8 tiếng | 9/12 | 0/12 |
| 24 tiếng | **12/12** | **0/12**, trung bình 12,2 con |

Số con mỗi tốp cũng **ngẫu nhiên và ăn theo mùa**: mỗi con thêm vào có xác suất `0,34 × mức mùa`, tối đa bốn con. Đếm 177 tốp trong hơn một giờ chạy thử: 102 tốp một con, 51 tốp hai con, 21 tốp ba con, 3 tốp bốn con. Chia theo mùa thì rõ hơn — mùa vắng gần như tốp nào cũng một con (28 tốp một con, 1 tốp hai con), mùa rộ thì 36 tốp một con nhưng có tới 30 tốp hai, 17 tốp ba và 3 tốp bốn.

**Không có ai đỡ.** Hồ tự chạy: mùa rộ thì ếch no, đẻ nhiều, đàn phình lên tới mức chặn 9 con; mùa vắng thì đói, thôi đẻ, rồi chết dần. Không có sàn giữ lại con cuối cùng — hồ **có quyền tuyệt chủng**. Chạy thử ba hồ, mỗi hồ 30 phút: hai hồ phình lên sát mức chặn 9 con và ở đó (trung bình 7,3 và 7,5 con, nòng nọc 5–6 con), **một hồ tuyệt chủng ở phút thứ mười lăm** rồi im luôn tới hết. Thang thời gian rút ngắn làm cả hai đầu đều nhanh hơn: đẻ nhanh hơn mà đói cũng chết nhanh hơn, nên khoảng một phần ba số hồ sẽ chết sạch trong nửa giờ. Chết sạch là hết, không có con nào tự đến. Đóng màn hình là hồ trở về bốn con ban đầu.

Không điểm, không đếm, không thắng thua, không kết thúc.

### Sao tím — hộp thở

Mã ở `assets/breath.js`. Năm kiểu thở, mỗi kiểu cho một hoàn cảnh. Thẻ chọn lấy **trạng thái của người dùng làm dòng chính**, tên kỹ thuật và nhịp chỉ là dòng chú thích bên dưới, vì người ta chọn theo cảm giác lúc đó chứ không theo tên bài thở. **Bấm vào thẻ là thở luôn**, không có màn hình trung gian. Câu dặn của từng kiểu hiện dưới vòng tròn trong vòng đầu tiên rồi tự mờ đi. Vòng tròn phồng xẹp theo nhịp, cung vàng chạy hết một vòng là xong một chu kỳ, có đếm ngược từng giây và đếm số vòng. Máy nào hỗ trợ thì rung nhẹ mỗi lần đổi nhịp.

| Kiểu | Nhịp | Khi nào dùng | Một chu kỳ |
|---|---|---|---|
| Thở ra dài | 4 vào, 6 ra | Chỉ cần dịu lại một chút | 10 giây |
| Thở hai nhịp vào | 2 vào, 1 vào thêm, 6 ra | Đang lo lắng, cần dịu nhanh | 9 giây |
| Thở vuông | 4 · 4 · 4 · 4 | Cần bình tĩnh và tập trung | 16 giây |
| Thở cộng hưởng | 5,5 vào, 5,5 ra | Muốn ngồi yên lâu một chút | 11 giây |
| Thở 4–7–8 | 4 vào, 7 giữ, 8 ra | Khó ngủ | 19 giây, tự dừng sau 4 vòng |

Nhãn từng nhịp ghi rõ hít bằng mũi hay thở ra bằng miệng, vì mỗi kiểu một khác. Riêng 4–7–8 tự dừng sau 4 vòng theo đúng khuyến cáo của tài liệu gốc, và có ghi chú đặt đầu lưỡi chạm nướu sau hai răng cửa trên.

Màn hình có mục **Lưu ý an toàn**: dừng khi chóng mặt, không tập lúc lái xe, các kiểu nín thở không hợp với người mang thai, bệnh hô hấp hoặc huyết áp thấp, và đây không phải cách điều trị y tế.

Nguồn số giây: nghiên cứu của Balban và cộng sự trên *Cell Reports Medicine* năm 2023 cho kiểu thở hai nhịp vào; hướng dẫn 4–7–8 của bác sĩ Andrew Weil; tài liệu về thở cộng hưởng quanh mức 5,5 hơi mỗi phút.

### Sao vàng — luyện phát âm

Mã ở `assets/ipa.js` (trò), `assets/amvi.js` (dựng ra âm) và `assets/khauhinh.js` (vẽ hình),
địa chỉ riêng `#phat-am`. Mười bảy âm, mỗi âm là một **buổi dắt tay năm bước** chứ không phải
một trang tra cứu.

**Tiếng dẫn dắt là giọng NGƯỜI, đọc từ thật.** Đây là chỗ tôi sai và phải sửa lại: bản đầu
tôi cho bước mở đầu và cả bài luyện tai phát **âm rời do máy dựng**. Phổ đo ra khớp số liệu ngữ
âm học trên 47 phép đo — mà người dùng nghe vẫn không hiểu gì. Bài học: **đo đúng phổ không có
nghĩa là tai người nghe ra**, và bộ kiểm thử của tôi không hề canh chỗ đó, vì tôi không nghe
được nên đã lặng lẽ coi "đúng về vật lý" là "nghe hiểu được".

Nên bây giờ: bước mở đầu phát **từ thật** bằng máy đọc của hệ điều hành, mỗi nút một giọng; bài
luyện tai hỏi *"bạn vừa nghe từ nào"* với cặp từ thật (sheep / ship) chứ không hỏi về âm rời.
Bước xem miệng cũng vậy: nút dưới mỗi hình đọc một **từ thật minh hoạ đúng cái âm hình đó
đang vẽ** — hình /l/ đọc *tell*, hình /n/ (vế sai) đọc *ten*. Từ minh hoạ chọn tay chứ không lấy
bừa cặp đầu tiên, vì cặp đầu chưa chắc minh hoạ đúng cái tương phản mà hai hình đang vẽ: cặp đầu
của `/s/ /z/ cuối` là *books / book* (rụng đuôi) trong khi hai hình vẽ /s/ với /z/, nên ở đó
phải là *price / prize*.

Âm rời vẫn còn, nhưng lùi xuống một nút phụ có ghi thẳng *"tiếng máy dựng"*. Chỗ **duy nhất**
còn dùng nó làm tiếng chính là vế sai của `/f/ /v/ cuối`, vì lỗi ở đó đẻ ra *"laip"* — không
phải từ nên máy đọc chịu, mà lại đúng là cái cần cho nghe.

Kèm theo là một lỗi ngầm phải sửa: máy Mac có 30 giọng en-US thì **13 giọng là trò đùa** — Bells,
Boing, Bubbles, Zarvox. Bản trước tôi lấy bừa "giọng en-US đầu tiên gặp"; máy này may nên ra
Samantha, máy khác rơi vào Bubbles là cả bài học thành tiếng ục ục. Giờ có danh sách loại trừ,
danh sách ưu tiên, và gom **năm giọng** để bài nghe đổi giọng được.

**App vẫn tự dựng lấy tiếng cho phần âm rời.** Máy đọc của trình duyệt chỉ đọc được
TỪ — đưa cho nó `θ` thì nó đọc tên chữ cái Hy Lạp. Mà bài học ở đây là chính cái âm, tách khỏi
từ. Nên `amvi.js` dựng âm bằng toán theo lối nguồn–bộ lọc: âm xát là nhiễu Gauss qua bộ cộng
hưởng đặt đúng vùng tần số; nguyên âm là chuỗi xung thanh môn qua ba bộ cộng hưởng F1 F2 F3;
âm tắc là một khoảng ngậm hơi, một tiếng nổ, rồi nguyên âm. Toàn bộ là hàm thuần trả về
`Float32Array`, nên **kiểm thử được bằng Node bằng cách đo phổ** rồi đối chiếu số liệu ngữ âm
học — `scripts/test-amvi.js` có 47 phép đo như vậy.

Cái lợi lớn nhất của việc tự dựng, và là thứ máy đọc vĩnh viễn không làm được: **phát được cả
âm SAI**. "Life" đọc thành "laip" thì máy đọc chịu, vì *laip* không phải từ. Dựng thì nghe được
ngay, đặt cạnh âm đúng. Nghe được cái sai mới tránh được nó.

**Thứ tự các bước theo bằng chứng: TAI ĐI TRƯỚC MIỆNG.** Luyện nghe phân biệt tự nó kéo theo
cải thiện phát âm, và kéo mạnh hơn luyện nói (tri giác d=0,92 so với sản sinh d=0,54; tổng hợp
79 nghiên cứu cho g=0,92). Nên bước hai là **luyện tai**: app đọc một trong hai từ của một cặp
tối thiểu bằng một trong **năm giọng người khác nhau**, bạn chọn vừa nghe từ nào, báo đúng sai
ngay, tám lượt. Năm giọng là cố ý — nghe mãi một mẫu thì người ta nhớ *mẫu* chứ không học được
*âm*.

Và đây là **chỗ duy nhất trong cả trò có điểm số thật**: app biết nó vừa phát âm nào, nên nó
đếm đúng sai được. Máy nhận giọng ở bước cuối thì không — nó chỉ đoán chữ, nên kết quả của nó
được báo nguyên văn "máy nghe ra từ nào", không bao giờ quy thành điểm.

**Hình nhìn thẳng là hình chính, hình cắt dọc chỉ là lớp xem thêm.** Đây là chỗ tôi làm sai sáu
lần liền, và bằng chứng đứng về phía người dùng chứ không về phía tôi: không nghiên cứu nào
chứng minh cho người học nhìn bộ phận *bên trong* tốt hơn cho họ nhìn *mặt người nói* (Nakai
2018); thí nghiệm đối chứng cho thấy hình cắt dọc có lưỡi **không hơn** hình mặt, và khả năng
đọc môi áp đảo khả năng đọc lưỡi (Badin 2010); hình bên trong chỉ bắt đầu có ích **sau khi**
người ta được dạy cách đọc nó (Grauwinkel 2007). Nói cách khác cái hình cắt dọc cần một bài học
riêng trước khi nó dạy được gì — nên nó không được đứng ở chỗ đầu tiên người mới nhìn vào.

Nên giờ: âm nào phân biệt bằng môi và hàm (`/p/ /b/ /f/ /v/ /w/ /θ/`, các nguyên âm) thì hình
chính là **miệng nhìn thẳng như soi gương** — thấy ngay môi khép, răng cắn môi, lưỡi thò ra, và
soi gương là tự kiểm được. Âm nào phân biệt bằng lưỡi bên trong (`/t/ /d/ /k/ /g/ /l/ /r/`, cụm
phụ âm) thì mới lấy hình cắt dọc, kèm hình nhìn thẳng nhỏ bên dưới.

**Hình động, không phải hình tĩnh.** Tổng hợp của Höffler & Leutner: hình động hơn hình tĩnh
d=0,37 nói chung, nhưng **d=1,06 với kiến thức vận động** — mà phát âm chính là vận động. Lưỡi
đi từ tư thế nghỉ tới tư thế đích rồi nhả ra, kèm luồng hơi chạy dọc khoang. Riêng bài "/t/ cuối
phải bật ra" thì thứ cần dạy là một *sự kiện theo thời gian*, hình đứng yên không thể nói được.
Có nút **Chậm lại** (0,4×) vì người học nói thẳng là tốc độ thật quá nhanh để theo dõi.

**Nhãn còn tối đa ba, và viết bằng cảm giác.** Bản trước dán chín nhãn giải phẫu cố định lên
mọi hình — với người chưa học ngữ âm thì đó là quá tải, và là một phần của lời chê "nhìn không
hiểu gì". Giờ chỉ còn nhãn nào đang làm việc cho âm đó, và viết theo kiểu rà lưỡi là thấy: "gờ
cứng sau răng trên" thay cho "lợi", "chỗ mềm tít trong" thay cho "vòm mềm".

**Nhãn tự xuống dòng, và có bài kiểm canh bề rộng CHỮ chứ không chỉ canh nét vẽ.** Người dùng
bắt được lỗi này: nhãn "gờ cứng sau răng trên" viết một dòng thì tràn khỏi khung và bị xén thành
"gờ cứng sau răng t". Bộ kiểm thử lúc đó có bài soát toạ độ nằm trong khung — nhưng nó chỉ soát
toạ độ **nét vẽ**, không soát bề rộng **chữ**, nên nó không thấy gì cả.

Chữa cái lỗi thì dễ. Chữa cái *lỗ hổng trong bộ kiểm* mới là phần đáng kể, và nó dạy hai chuyện:

- Ước bề rộng chữ bằng một hệ số chung cho mọi ký tự thì **không đủ**: chữ `i` rộng 0,25 lần cỡ
  chữ còn chữ `m` rộng 0,87 — chênh hơn ba lần. Hệ số chung 0,58 báo nhầm hai chú thích vốn vừa
  khít. Nên bảng hệ số chia theo loại ký tự, hiệu chỉnh từ mười phép đo thật bằng canvas với đúng
  phông của app; sai số còn dưới 7%, rồi chừa thêm 8% biên trước khi kêu.
- Phép đo đầu tiên tôi viết trong trình duyệt báo "0 nhãn tràn" — **sai**, vì nó khớp mẫu
  `<text x="…" y="…"` nên bỏ sót mọi thẻ viết thuộc tính theo thứ tự khác, trong đó có đúng chú
  thích môi. Thước đo cũng phải bị nghi ngờ như thứ nó đo. Bản sau bắt mọi thẻ `<text>`: 65 hình,
  211 thẻ chữ, 0 tràn.

Và một chỗ bài kiểm mới đã đúng còn tôi đã sai: chú thích "đầu lưỡi thò ra giữa hai hàm răng"
rộng 192px trong khung 200px — vừa khít, nhưng chỉ chừa 4px mỗi bên, phông khác một chút là cắt.
Nên chú thích dưới hình giờ cũng tự xuống dòng, và khung tự cao thêm theo số dòng.

**Nói đúng mà máy đếm 0/5.** Người dùng nói "books", màn hình hiện rõ máy nghe ra *books*, mà
vẫn đếm 0 lần đúng. Nguyên nhân nằm ở chỗ tôi dùng sai một công cụ vốn đúng: máy nhận giọng trả
về tới **năm phương án**, và tôi đem cả danh sách đó đi so với hai từ trong cặp. Với cặp tối
thiểu thì danh sách ấy gần như **luôn chứa cả hai từ** — hai từ vốn giống nhau, đó chính là lý
do chúng được chọn làm một cặp. Thế là phương án này khớp *books* hoàn hảo, phương án kia khớp
*book* hoàn hảo, bộ so khớp thấy hoà bèn báo "không phân biệt được", và người nói đúng bị đếm
sai. Đúng **mãi mãi** 0 điểm.

Thứ đo được thật là máy **quyết** bạn vừa nói từ nào — tức phương án nó xếp đầu. Giờ chỉ xét
phương án đầu.

Hồi còn trò tập nói tiếng Anh, nó dùng chung bộ so khớp ấy nhưng **không** dính lỗi này, và
tôi có kiểm chứ không đoán: nói rõ một câu thì không lần nào nhận nhầm, và khi các phương án là
biến thể của cùng một câu thì 27/27 đúng. Khác nhau ở chỗ ba câu để chọn vốn khác xa nhau, còn
cặp tối thiểu thì cố ý giống nhau. Trò ấy đã gỡ, nhưng 81 câu mẫu của nó được giữ lại trong
`scripts/cau-mau-nghe.json` để `test-nghe.js` vẫn canh bộ so khớp mà trò phát âm đang dùng.

Phần quyết định trước đây dính liền với phần vẽ nên **không có bài kiểm nào** — đó là lý do lỗi
lọt tới tận người dùng. Giờ nó là hàm thuần, có tám bài canh, trong đó có một bài kiểm chứng
rằng **cách làm cũ đúng là trượt** — bài kiểm nào đạt cả trước lẫn sau khi vá thì không canh
được gì.

**Ba chỗ app nói thật dù nói ra thì kém hấp dẫn hơn:**

- **Không có "điểm phát âm" chung chung.** Máy nhận giọng trả về CHỮ chứ không trả về ÂM. Tôi có thử đưa một
  câu cố tình nuốt hết phụ âm cuối cho mô hình nghe: nó chép lại thành câu đúng và khen. Cái đo
  được thật thì hẹp hơn: bạn nói "ship", máy báo nó nghe ra từ nào — tức **máy có phân biệt được
  hai từ hay không**, chứ không phải giọng bạn hay dở. Màn kết quả còn nói thêm rằng giọng người
  Việt bị các máy này chép sai nhiều nhất trong sáu nhóm từng đo (MER 0,143 so với 0,007 của
  người bản ngữ), nên "máy không nghe ra" không đồng nghĩa với "bạn nói sai".
- **Mục nào máy không kiểm được thì nói thẳng.** Lỗi `/f/` cuối đẻ ra "laip"; gặp chuỗi vô nghĩa
  thì máy tự nắn về từ gần nhất và **giấu mất lỗi**. Những mục đó mang cờ `kiemDuoc: false`,
  không có bài nói, và kiểm thử bắt buộc điều này.
- **`/θ/` và `/f/` gần như không phân biệt được bằng tai, kể cả với người bản ngữ.** Thí nghiệm
  Heinz & Stevens 1961 dựng đúng hai âm này cho người bản ngữ nghe và họ cũng chịu; ngay cả với
  giọng người thật, `/θ/` chỉ nhận đúng 58–72%. Nên app **không ra bài nghe cho cặp này** — ra
  bài là bịa một tương phản không tồn tại, người học sẽ "đúng" nhờ đoán. Có một kiểm thử riêng
  chặn việc đó, và bài `/θ/` nói thẳng rằng ở âm này cái đáng tin là *nhìn* chứ không phải *nghe*.

Cũng vì lý do đó mà có bài kiểm **"tương phản có còn khi đổi giọng không"**: lấy dấu vân phổ của
từng âm ở từng giọng rồi thử nhận dạng một âm ở giọng này bằng mẫu lấy từ các giọng khác. Đạt
135 trên 140 lượt. Bài này bắt được ba lỗi thật lúc làm: âm tắc hữu thanh thiếu vạch rung lúc
ngậm hơi (nên `/t/` với `/d/` gần như không phân biệt nổi), tiếng nổ to gấp mười tám lần nguyên
âm theo sau (nghe thành "tách" rồi thều thào), và âm tắc thiếu chuyển tiếp formant (nên `/p/`
`/t/` `/k/` nghe giống nhau — chỗ chặn nằm ở đâu thì tai đọc ra từ đường F2 trượt vào nguyên âm,
chứ tiếng nổ quá ngắn để một mình nó đủ).

Ghi chú tra cứu khi vẽ để ở `content/ghi-chu-khau-hinh-ipa.md`.

#### Máy đo tiếng bạn, ngay trên máy

Người dùng hỏi: trò phát âm chưa cho mình nói rồi chấm. Đúng vậy — phần nói cũ nằm sâu trong từng
cặp từ, chỉ báo máy nhận giọng nghe ra chữ gì, và không chạy được khi mở app từ màn hình chính
iPhone. Giờ **bảy âm có dấu hiệu âm học rõ** được đo thẳng vào tiếng người nói, bằng
`assets/dophatam.js` (hàm thuần, kiểm bằng Node), không cần máy nhận giọng, không gửi gì đi đâu:

| Âm | Nói | Máy đo cái gì |
|---|---|---|
| đuôi `/s/ /z/` | books, cats, eyes, dogs | sau nguyên âm có tiếng rít dải cao không, dài bao lâu |
| `/t/ /d/` và `/k/ /g/` cuối | seat, night, made · back, like, week | âm cuối có được **nhả** (tiếng bật hoặc tiếng xì) hay bị ngậm mất |
| cụm st- sp- sk- | stop, spin, school, star | có `/s/` trước âm bật không, và có chen âm "ơ" vào giữa không ("sờ-top") |
| `/ʃ/` | she → see (nói lần lượt) | tiếng rít của "sh" phải trầm hơn "s" từ 700 Hz |
| `/p/` và `/b/` | pat → bat | luồng hơi từ lúc bật môi tới lúc cổ rung: "p" từ 35 ms, và dài hơn "b" từ 25 ms |
| `/iː/` và `/ɪ/` | sheep → ship | nguyên âm từ thứ nhất dài hơn từ 15% |

Ba phép sau **so hai từ của cùng một người** chứ không so với một con số cố định: tiếng rít giọng nữ
cao hơn giọng nam cả nghìn Hz, người nói nhanh nói chậm khác nhau, nên chỉ sự khác nhau giữa hai
từ của chính người đó mới đáng tin. Kết quả là **từng dấu hiệu đạt hay chưa, kèm con số đo được**
và một câu chỉ cách sửa — không quy ra điểm, không lưu, không cộng dồn qua ngày.

Nút **Nói thử** giờ nằm ngay đầu mọi bước của âm đó, không phải bấm qua bốn bước mới tới.

**Hiệu chỉnh trên tám giọng đọc tiếng Anh** của máy Mac (Mỹ nam nữ, Anh, Úc, Ireland, Nam Phi,
Ấn Độ; `scripts/mau-am.js` tạo bằng lệnh `say`, không bỏ file âm thanh vào kho mã). Điều kiện gắt
nhất: **không bao giờ chấm đạt cho từ sai** — đuôi s: "book" thay "books"; nhả âm cuối: "sea" thay
"seat"; st-: "top" thay "stop" và "sờ-top"; so hai từ: nói đảo thứ tự. Kết quả hiện tại, từ sai
lọt **0** ở mọi phép; từ đúng đạt: đuôi s 32/32, st- 32/32, sh/s 32/32, âm cuối 44/48,
p/b 24/24, i dài/ngắn 34/35. Những chỗ phải sửa trong lúc hiệu chỉnh, đều có trong mã:

- `say` xuất file **im tuyệt đối**, nên "nền ồn" đo ra −120 dB và mọi ngưỡng tương đối lệch hết.
  Mẫu giờ trộn tiếng ồn giống phòng yên (ù trầm −45 dB, tiếng xì của micro −70 dB).
- Nhận nguyên âm chỉ bằng độ tuần hoàn thì giọng nam trầm bị cắt vụn (chỉ đo ra 0,5–0,6); thêm dấu
  hiệu "dải trầm lấn dải cao", và mở dải dò cao độ xuống 50 Hz.
- "sh" giọng nam nằm ở 2–4 kHz, bộ dò ban đầu chỉ nhìn trên 4 kHz nên không thấy.
- Luồng hơi bật của "top" cũng là tiếng xì nên "top" từng được tính là có `/s/`. `/s/` thật thì sau
  nó có chỗ **ngậm** (lặng liền từ 15 ms) rồi mới bật; lấy chỗ tụt ngắn khi chuyển sang âm "ơ" làm
  chỗ ngậm thì "sờ-pin" lọt, nên phải đòi lặng liền.
- `/t/` cuối của giọng Ireland và Úc nhả thành một tiếng xì dài 60–115 ms, trông như `/s/`. Tách
  bằng tỉ lệ dải trên 4 kHz (`/s/` thật 0,9–0,99, tiếng xì của `/t/` 0,4–0,7) và độ dài.
- `/d/` cuối ngậm mà vẫn rung cổ, nên lúc bật độ to chỉ nhích 4 dB; dò thêm theo dải trên 4 kHz.
- Giọng nào không dùng làm mẫu được thì **bỏ và nói lý do**: Rishi (tiếng Anh Ấn Độ vốn không bật
  hơi ở `/p/`) và Daniel (máy đọc rung cổ ngay từ đầu "pat", không có tiếng bật) không dùng cho p/b;
  Karen đọc "sheep" và "ship" dài bằng nhau nên không dùng cho i dài/ngắn.

**Chỗ ồn thì báo ồn, không chấm trượt oan.** Tiếng rít và tiếng bật nằm ở dải cao, tiếng bật cuối
thì rất nhỏ; với nhiễu trắng chỉ thấp hơn giọng 35 dB, "made" nói đúng mà chỉ 3/48 lần được chấm
đạt. Nên đo xem tiếng ồn ở dải trên 4 kHz thấp hơn nguyên âm bao nhiêu; đo trên 431 bản thu trộn
ồn nhiều kiểu nhiều mức thì tiếng rít cần 40 dB (chấm đúng 95–98%), tiếng bật cần 46 dB (đúng 89%).
Dưới ngưỡng thì app nói "chỗ này hơi ồn" và không chấm. Bản đầu lấy "đỉnh dải cao của chính từ đó"
làm thước nên "made", "pat" (ít tiếng cao) bị chặn ngay trong phòng yên — thước phải là tiếng ồn so
với **giọng**, không phụ thuộc từ. Nói nhỏ đi 20 lần thì kết quả y như cũ.

**Thu âm:** tắt bộ lọc ồn, bộ khử vọng và bộ tự chỉnh âm lượng của trình duyệt (bộ lọc ồn coi
tiếng rít `/s/` là tiếng ồn và xoá mất), tự dừng khi lặng 0,6 giây, tối đa 3 giây, rồi **tắt micro
ngay**. Đã thử đường thu thật bằng một "micro" giả phát bản ghi vào: tự dừng sau 1,8 giây, đo đúng,
và micro ở trạng thái đã tắt.

**Giới hạn phải nói ra:** ngưỡng hiệu chỉnh trên giọng máy đọc và tiếng ồn trộn vào, chưa trên
giọng người Việt thật qua micro điện thoại thật. Máy chỉ đo **một dấu hiệu** của mỗi âm — đạt nghĩa
là dấu hiệu đó có mặt, không phải cả giọng đã chuẩn. Mười âm còn lại (l cuối, r, th, v/w...) chưa
có dấu hiệu nào đo được ổn định bằng cách này, nên vẫn dùng máy nhận giọng như cũ.

### Sao trắng ngà — nối sao thành chòm

Mã ở `assets/constellation.js`. Trong đám sao lấm tấm có vài ngôi sáng hơn. **App tự nối từng nét**: chờ một nhịp cho thấy đám sao, rồi đường vàng chạy dần từ ngôi này sang ngôi kia theo thứ tự nét của chòm, như vẽ chòm sao trên bản đồ sao — đầu nét có đốm sáng như ngòi bút, nét dài chạy lâu hơn chút. Nối đủ thì cả chòm bừng sáng, hiện lời giải thích và câu ca dao nếu có. Chạm màn hình thì nối xong ngay, khỏi chờ; máy dặn giảm chuyển động thì hiện cả chòm luôn.

Bản đầu để người xem tự kéo từ ngôi này sang ngôi kia, nối trật thì đường tự tan — nhưng không có gì chỉ ngôi nào nối với ngôi nào. Người dùng: "bạn tự nối luôn đi, chứ người dùng không biết cách nối đâu". Nên bỏ phần tự kéo; chòm Sư Tử nhiều nét nhất (9 nét) nối xong trong chừng 6 giây.

Tám nhóm sao, tên theo cách gọi tiếng Việt:

| Chòm | Sao | Gần nhất – xa nhất | Xoay đi thì |
|---|---|---|---|
| Bắc Đẩu | 7 | 80–123 năm ánh sáng | méo dần |
| Lưỡi Cày | 7 | 243–1300 | vỡ hẳn |
| Tua Rua | 7 | đều 440 | chỉ nghiêng, không vỡ |
| Ngưu Lang Chức Nữ | 3 | 17–2600 | Thiên Tân trôi ra xa |
| Thiên Nga | 5 | 73–2600 | dài ra thành chuỗi |
| Tiên Hậu | 5 | 55–550 | chữ M tan |
| Sư Tử | 9 | 36–1270 | mất hình con sư tử |
| Thần Nông | 7 | 65–700 | ngôi ở chân rời ra |

**Nối xong thì kéo được để xoay.** Mỗi ngôi sao lưu bằng số liệu thiên văn thật, gồm xích kinh, xích vĩ mốc J2000 và khoảng cách tới Trái Đất tính bằng năm ánh sáng. Chương trình dựng vị trí ba chiều rồi chiếu xuống màn hình. Đứng đúng chỗ Trái Đất thì hình hiện ra y như nhìn lên trời, xoay đi thì hình vỡ ra, vì chòm sao vốn chỉ là một góc nhìn chứ không phải một vật có thật.

Bắc Đẩu trải từ 79 tới 123 năm ánh sáng, Lưỡi Cày từ 243 tới 1300, nên xoay vài chục độ là không còn nhận ra. Riêng Tua Rua vẫn dính chùm ở mọi góc, vì đó là cụm sao thật, các ngôi cùng sinh ra một chỗ. Mỗi chòm có một dòng nói về điều nhìn thấy được khi xoay.

Vài khoảng cách còn tranh cãi trong giới thiên văn, rõ nhất là Betelgeuse và Alnilam; file có ghi chú điều này.

Thêm chòm mới chỉ cần thêm một mục vào mảng `CHOM`: tên, lời giải thích, và danh sách sao dạng `[tên, xích kinh giờ, xích vĩ độ, năm ánh sáng]` cùng các cặp cần nối. Không phải căn chỉnh toạ độ màn hình, chương trình tự chiếu và tự co giãn.

Một lưu ý về độ chính xác: Hội Thiên văn Việt Nam nêu rõ Thần Nông chỉ là **nhóm sao** do người xưa đặt tên, không trùng khớp với chòm Thiên Yết trong thiên văn học hiện đại. App ghi đúng như vậy trong phần chú thích chứ không gọi nhầm là chòm sao.

## Con ếch vừa bơi vừa bám lá

Bài kiểm hồ nước hỏng khoảng **một lần trong ba lượt chạy**, luôn ở quanh phút 30, luôn cùng một
câu: `ếch #2 vừa bơi vừa bám lá`. Lúc đầu trông như bài kiểm chập chờn — chạy lại là đạt. Nó
không chập chờn; đó là một lỗi thật, chỉ cần đúng hai việc xảy ra cùng lúc nên mới hiếm.

Hai lỗi ghép lại mới ra:

1. **Đáp xuống lá xong mà không xoá mục tiêu bơi cũ.** Con ếch bơi tới lá `i`, trèo lên, nhảy
   sang lá khác — nhưng `e.dich` vẫn giữ nguyên số `i` mãi mãi. Nhìn vào trạng thái thì nó "đang
   nhắm tới" một chiếc lá mà thực ra nó đã rời từ lâu.
2. **`boLa()` so chỉ số cũ sau khi đã dời chỉ số.** Hàm này gom trước danh sách con nào liên
   quan, rồi `splice` chiếc lá ra khỏi mảng, rồi dời chỉ số của mọi con (`e.la--` nếu `e.la > i`),
   rồi mới so `e.la === i`. Tới lúc so thì `i` đã trỏ sang một chiếc lá khác rồi.

Ghép lại: con ếch ngồi yên trên lá `j > i` nhưng còn mang `dich === i` cũ. Lá `i` tàn và bị gỡ.
Nó bị gom vào danh sách "liên quan" qua cái `dich` cũ đó. Chỉ số của nó bị dời `j → j-1`. Rồi
phép so `e.la === i` trượt, nên nó không được gỡ khỏi lá — mà vẫn bị gán `boi = true`. Thành ra
một con ếch vừa bơi vừa bám lá. Lỗi thứ hai còn có mặt tệ hơn: con nào đang ngồi đúng lá `i+1`
thì bị **đá khỏi chiếc lá hoàn toàn lành lặn**.

Chữa: xoá `e.dich` ngay khi bám được lá; và trong `boLa()` thì so `=== i` **trước** rồi mới dời
chỉ số, đồng thời không bắt con nào còn lá phải xuống nước.

Đi tìm lỗi trên còn lòi ra một bài kiểm **hỏng oan** ngay bên cạnh, và nó đáng nói vì là một
kiểu sai khác hẳn. Bài "hồ trống thì đàn bọ lên rõ" dọn sạch ếch rồi đo đỉnh đàn bọ trong sáu
phút, đòi đỉnh ≥ 2. Nhưng chừng một phút là có ếch lạc bơi tới ăn, mà nó tới lúc nào thì ngẫu
nhiên — nên đỉnh lúc 2,4 lúc 1,92, hỏng chừng một lần trong bốn lượt. Cách chữa dễ là hạ ngưỡng
xuống 1,8, và như thế là sai: hạ ngưỡng chỉ làm bài kiểm im đi chứ không làm nó đo đúng hơn.
Điều cần khẳng định ở đây là "không có gì ăn thì đàn bọ dày lên", nên bây giờ hồ được **dọn sạch
ở mỗi bước đo** — bỏ hẳn cái ngẫu nhiên đi thay vì nới ngưỡng để chiều nó.

Và một bài thứ ba, hỏng theo kiểu thứ ba. Bài "một ngày nợ trả xong trong vài trăm khung" đếm
số khung cần để trả hết một ngày thời gian ẩn tab, đòi dưới 600. Cùng một đoạn mã: máy rảnh ra
5xx khung, máy đang đánh chỉ mục Spotlight ra 7xx. Lý do là lúc đo có cộng giờ thật vào nợ, nên
máy càng chậm thì mỗi khung càng làm nợ dày thêm — một vòng luẩn quẩn, và con số tuyệt đối
không nói lên điều gì về thuật toán.

Tôi thử bỏ hẳn giờ thật đi cho hết ngẫu nhiên, y như cách chữa bài đàn bọ. **Không xong**, và nó
hỏng theo cách nguy hiểm hơn: không có giờ thật thì cơ chế chia ngân sách chẳng bị ép gì, nó trả
sạch nợ trong đúng **một** khung, bài kiểm đạt suông mà không còn khẳng định gì cả. Một bài kiểm
luôn đạt còn tệ hơn một bài kiểm lúc đạt lúc hỏng, vì nó còn giả vờ đang canh giữ.

Cách chữa đúng là **đong bằng chính bài tám tiếng ở ngay trên, đo trên cùng cái máy trong cùng
lượt chạy** — tốc độ máy có mặt ở cả hai vế nên bị khử đi, và cái còn lại đúng là thứ cần đo:
trả một ngày nợ có tốn quá nhiều khung hơn trả tám tiếng không.

Nói cho hết: cách này **giảm** dao động chứ không xoá được nó, vì hai phép đo diễn ra ở hai lúc
khác nhau nên tải máy giữa chúng cũng khác. Đo thật qua nhiều lượt thấy tỉ lệ trải từ 1,8 tới
5,4 lần. Nên ngưỡng đặt ở mười lần — lấy từ phương sai đo được chứ không từ cảm tính, còn gần
gấp đôi chỗ trống so với lượt xấu nhất từng thấy, mà vẫn bắt được hồi quy thật: thuật toán hỏng
thì tỉ lệ vọt lên hàng chục lần chứ không nhích vài phần mười.

Chỗ đáng nói về cách kiểm: tôi không sửa rồi chạy lại cho tới khi xanh — như vậy chỉ chứng minh
được là nó *hiếm*, không chứng minh được là nó *hết*. Thay vào đó dựng thẳng đúng tình huống đó
trong `soatBoLa()` (con #0 ngồi lá 2 mà còn mang `dich` là lá 1, rồi gỡ lá 1), rồi **chạy bài
kiểm mới đó với bản pond.js CHƯA sửa** để chắc rằng nó thật sự báo hỏng. Một bài kiểm đạt cả
trước lẫn sau khi vá thì không chứng minh được gì cả.

## "Bật tiếng lên lâu lâu bị lag"

Hồ ếch có một lớp vang mặt nước phủ lên mọi tiếng, làm bằng một `ConvolverNode` (tiếng dội 1,4 giây, hai kênh) chạy suốt lúc bật tiếng. Đo bằng `OfflineAudioContext` trong Chrome: cùng 20 giây tiếng hồ, không vang tốn **19 ms** CPU, có vang **260–310 ms** — nặng gấp 15 lần, mà Chrome còn tính phần đuôi tiếng dội theo từng đợt ở luồng nền, nên trên điện thoại cứ chốc chốc hồ khựng một cái. Thêm nữa, lúc bật tiếng app tính một mạch 16 mẫu tiếng: 42 ms trên máy tính, trên điện thoại vài trăm ms.

Giờ **vang được nướng sẵn vào từng mẫu**: dựng lại đúng đường tiếng cũ (khô + vang mức 0,22 qua cùng tiếng dội) trong một `OfflineAudioContext` — trình duyệt tự tính ở luồng riêng — rồi thay mẫu khô bằng mẫu đã có đuôi vang. Lúc chơi chỉ còn đọc lại đoạn có sẵn, không còn bộ vang nào chạy liên tục. Mẫu tiếng chia thành bảy việc nhỏ, mỗi việc một lượt, tiếng ếch làm trước. Đo lại: lời gọi bật tiếng còn **2 ms**, luồng chính bị chặn lâu nhất **15 ms**, không còn tác vụ dài; 16 mẫu nướng xong trong chừng 0,3 giây. Mẫu nướng dài thêm 1,4 giây nên cho tới 16 tiếng cùng lúc thay vì 8.

`scripts/test-pond.js` thêm 5 bài với một bộ Web Audio giả: lời gọi bật tiếng không tự tính mẫu; đủ 16 mẫu đều đã nướng; không còn bộ vang chạy thật; mỗi mẫu nướng một lần và có thêm đúng 1,4 giây đuôi. Chạy với `pond.js` cũ thì trượt cả năm.

## Hồ nước: cân bằng cá và nòng nọc

Cú phóng của cá phải bắt đầu **xa hơn** khoảng nòng nọc cong đuôi chạy. Bản trước cá tăng tốc ở 55 pixel còn nòng nọc bỏ chạy từ 62, nên có một vành đai mà nòng nọc nhanh hơn cá: nó thoát ra, cá chậm lại, rồi lặp mãi, không con nào bị bắt.

Nay cá phóng từ 95 pixel, bơi 46–66 px/s, và nòng nọc vọt xong phải nghỉ hơn nửa giây mới vọt tiếp. Đo thử với 10 nòng nọc và 3 con cá trong 30 giây: cá ăn được 9 tới 10 con. Chạy tự nhiên 4 phút thì hồ vẫn cân, ếch từ 4 lên 9 rồi về 6, nòng nọc không bị quét sạch.

Thẻ bọc màn hình lúc đang ẩn có bề rộng bằng 0, mọi toạ độ tính từ đó thành vô định rồi canvas ném lỗi. Cả năm màn hình phủ kín đều đã chặn: lấy tạm kích thước cửa sổ cho tới khi trang bày xong.

## Bộ bài: 209 lá, gộp từ hai nguồn

Bộ đầu là 100 lá đã chạy từ ngày đầu, qua ba lượt sửa v3 → v5 → v6. Sau đó có thêm một file mang tên **365 thông điệp** — nhưng đọc kỹ thì nó chỉ có **120 câu**.

Dòng 101 tới 365, tức 265 dòng, là phần đệm:

- mỗi dòng bị dán thêm đuôi `(Thông điệp ngày N)` vào cuối câu cho trông khác nhau, còn ruột thì chạy vòng lặp **chu kỳ đúng 20 ngày** — câu "Đừng lo lắng về tương lai…" rơi vào ngày 103, 123, 143, … tới 363, mười bốn lần
- cột Ý nghĩa của 265 dòng đó chỉ có **10 câu**, mỗi câu 26–27 lần, đều kết bằng "Hãy áp dụng sự tỉnh thức này vào ngày hôm nay"
- và lời giảng gán **không ăn nhập** với câu: ngày 104 nói "Con là một biểu hiện tuyệt đẹp và độc bản của sự sống", lời giảng lại là "Tiếng nói nhỏ nhẹ bên trong luôn chỉ đúng hướng"

Bê nguyên vào thì người dùng gặp lại đúng một câu sau mỗi 20 ngày, kèm một lời giảng chẳng liên quan. Nên `scripts/build-data.py` bóc cái đuôi ngày ra, gom các dòng trùng ruột về một, bỏ câu đã có trong bộ cũ (so bằng Jaccard trên bộ từ, từ 0,6 trở lên coi như cùng một câu nói khác chữ), và **viết lại 20 lời giảng bị dán mẫu** — bảng `LOI_GIANG` trong script, mỗi câu một lời riêng theo giọng của bộ cũ.

Kết quả: 100 + 109 = **209 lá**. Khoảng cách gần nhất giữa hai lần gặp lại cùng một lá tăng từ 51 lên **106 ngày** (đo 5 hạt giống × 3000 ngày trong `test-core.js`).

**Ngưỡng lọc trùng phải hạ xuống 0,40.** Lúc đầu để 0,6, đọc lại thì thấy lọt 9 cặp nói y hệt điều đã có, chỉ khác chữ: *"Con không bao giờ có thể thua trong trò chơi cuộc đời này"* nằm cạnh *"Con không bao giờ có thể thất bại hoàn toàn trong cuộc chơi này"*. Hạ dần rồi soi từng câu bị bỏ — tới 0,40 thì sạch, mà xuống 0,35 là bắt đầu cắt nhầm: *"Tâm trí con là chiếc máy chiếu, thế giới là màn ảnh"* bị coi là trùng với *"Thế giới bên ngoài chỉ là tấm gương phản chiếu tâm trí"*, trong khi đó là hai hình ảnh riêng. Lá mới cũng phải so với lá mới đã nhận chứ không chỉ so với bộ cũ — hai câu trùng nhau đều nằm trong nguồn mới thì cách so cũ không thấy.

**Đọc tay lại từng lá** thì ra thêm sáu chỗ, sửa trong bảng `SUA_CAU`: lỗi chính tả *"gông cồng"* → *"gông cùm"*; chơi chữ *"Present (Món quà)"* chỉ có trong tiếng Anh nên phải nói rõ ra; mũi tên gõ bằng `->` đổi thành `→`; *"chịu trách nhiệm 100%"* lạc giọng giữa một lá tĩnh tâm nên đổi thành *"trọn vẹn"*; và máy chiếu phim thì chạy cuộn phim chứ không có đĩa. Sáu lá dùng nháy đơn thẳng `'…'` cũng đổi sang nháy kép cong `“…”` cho hợp phông serif.

**Thông điệp không có dấu chấm cuối câu.** Nó in to giữa lá bài như một câu đề từ, nên dấu chấm cuối chỉ làm câu trông cụt. `build-data.py` bỏ dấu chấm cuối của thông điệp (dấu chấm giữa câu, dấu hỏi, dấu chấm than và dấu ba chấm vẫn giữ); lời giảng nhỏ bên dưới là câu văn thường nên vẫn có dấu chấm.

Mười phép thử giữ chỗ này: đủ 209 lá, thông điệp không có dấu chấm cuối câu, không lọt đuôi `(Thông điệp ngày N)`, không lọt lời giảng dán mẫu, không lời giảng nào dùng cho hai lá, không hai lá nào nói lại cùng một điều, không nháy đơn thẳng, không thừa dấu chấm sau ngoặc kép, không mũi tên gõ tay, không con số phần trăm.

**"Lá của tôi với bạn tôi hay bị trùng."** Kiểm lại cách chọn bằng mô phỏng chạy chính `core.js`: mỗi máy tự sinh hạt giống ngẫu nhiên, không đường nào để hai máy dùng chung (link chia sẻ không mang hạt giống). Hai máy riêng ra cùng một lá **cùng ngày** đúng tỉ lệ 1/209 như rút độc lập — một tháng trung bình 0,14 lần, 13% số cặp gặp một lần; ba lần trở lên trong một tháng chỉ 0,05%, gần như không thể là ngẫu nhiên. Còn *lá của người kia hôm nay là lá mình gặp hôm trước* thì tăng dần theo thời gian (14% số ngày sau một tháng, 43% sau ba tháng) vì ai cũng rút trong cùng 209 lá — muốn ít hơn chỉ có cách thêm lá. Trong 400.000 lần xáo, mỗi lá ra đều nhau (chi bình phương 231, ngưỡng 5% là 243). Có một chỗ chưa khéo không gây trùng: phép nhân trong công thức xáo vượt 2^53 nên bị làm tròn, chừng 0,7% hạt giống dồn về cùng thứ tự bài với một hạt khác — để nguyên, vì sửa thì bộ bài của mọi người đổi hết, ai đã lật lá hôm nay sẽ thấy nó biến thành lá khác.

Lúc kiểm thì phát hiện bảng Giới thiệu **không mở được từ 9/9**: khung bảng trượt bị xoá nhầm khỏi `index.html` cùng nút "số may mắn" cũ, `app.js` gọi `$('#sheet-title')` ra `null` rồi ném lỗi — kéo theo nút *Xáo lại bộ bài* cũng không ai bấm được. Đã khôi phục; `scripts/test-sao.js` giờ kiểm mọi `#id` mà `app.js` dùng đều có trong `index.html`. Câu "trong vòng 209 ngày không lá nào lặp lại" ở bảng Giới thiệu cũng nói quá — đúng với ai bắt đầu từ đầu vòng; ai bắt đầu giữa vòng thì một lá có thể quay lại sau ít nhất 105 ngày — đã sửa. Sau đó người dùng bảo bỏ hẳn đoạn nói về bộ bài trong bảng Giới thiệu, nên giờ bảng không còn câu đó.

## Gợi ý cài app lên điện thoại

Người dùng muốn "một cái popup cài app, để mọi người dễ dùng trên điện thoại". Mỗi loại máy một cách cài, nên `assets/caiapp.js` nhận dạng trước rồi bảng hướng dẫn (dùng chung bảng trượt) nói đúng cách cho máy đó:

| Máy | Bảng hiện gì |
|---|---|
| Android Chrome, Edge… có hộp cài (`beforeinstallprompt`) | nút **Cài app** — gọi đúng hộp cài của trình duyệt |
| Android, trình duyệt chưa đưa hộp cài | bấm menu ⋮ → *Cài đặt ứng dụng* / *Thêm vào màn hình chính* |
| iPhone, iPad, Safari | ba bước có hình nút: ⋯ cạnh thanh địa chỉ → **Chia sẻ** (máy đời cũ: nút Chia sẻ ở thanh dưới) → **Thêm vào MH chính** → **Thêm**. Từ iOS 26 nút Chia sẻ nằm trong nút ⋯ ([MacRumors](https://www.macrumors.com/how-to/save-safari-bookmark-web-app-iphone-home-screen/)); iPad đời mới tự xưng là Mac nên nhận ra bằng màn cảm ứng nhiều điểm |
| iPhone, Chrome hay Firefox | từ iOS 16.4 các trình duyệt này cũng thêm được ra màn hình chính ([WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [trợ giúp Chrome](https://support.google.com/chrome/answer/15085120?hl=en&co=GENIE.Platform%3DiOS)): biểu tượng Chia sẻ ở góc phải thanh địa chỉ → **Xem thêm** → Thêm vào MH chính → Thêm (người dùng thử thật: mục này nằm sau nút Xem thêm); kèm dòng "không thấy thì mở bằng Safari" và nút chép link. Máy **cũ hơn iOS 16.4** (đọc từ chuỗi nhận dạng) thì nói thẳng chỉ Safari cài được |
| Mở link trong **Zalo, Facebook, Messenger**, Instagram, TikTok | ở đó không cài được: hướng dẫn mở bằng trình duyệt; Android có nút **Mở bằng Chrome** (link `intent://`, máy không có Chrome thì mở link thường); kèm nút chép link |
| Máy tính | **không hiện gì** — không tự gợi ý, không có nút trong bảng Giới thiệu, kể cả khi Chrome hay Edge trên máy tính có hộp cài (bản đầu thấy hộp cài là gợi ý luôn, nên bảng hiện cả trên máy tính; người dùng chỉ muốn nó ở bản điện thoại) |

**Làm giống dự án Nhớ Nha** (người dùng dặn; `nho-nha/src/lib/pwa.ts`, `src/ui/InstallSheet.tsx`, `EscapeInApp.tsx` — cùng thư mục `Project`):

- **Các bước trên iPhone theo trình duyệt và đời Safari** (`cachChiaSe`, như `shareWay`): Safari 26 — nút ⋯ ở thanh dưới → *Chia sẻ* → **Xem thêm** → *Thêm vào MH chính* → *Thêm*; Safari cũ hơn — *Chia sẻ* ở thanh dưới → kéo xuống; Chrome — *Chia sẻ* góc trên bên phải → Xem thêm (hoặc kéo xuống); Firefox, Edge — menu của trình duyệt; iPad — góc trên bên phải. Safari ghi `Version/` theo đời iOS (iOS 26 vẫn ghi "OS 18_6"). Bước cuối: mở Thông Điệp từ màn hình chính. Chữ và biểu tượng luôn liền một dòng.
- **Trong Zalo, Facebook, Messenger, Instagram, TikTok, LINE, WeChat**: gọi đúng tên app (`tenTrongApp` — Messenger nhận trước Facebook vì chuỗi của nó mang cả dấu hiệu Facebook; Orca-Android là Messenger), nút **Mở bằng Safari** (địa chỉ `x-safari-https://`, iOS 17 trở lên) hay **Mở bằng Chrome** (`intent://`), link để chép, rồi menu ⋯ của chính app đó.
- **Link đưa ra Safari, Chrome giữ đúng trò đang mở** (`linkCaiApp`). Người dùng báo: mở link phát âm trong Zalo, bấm *Mở bằng Safari* thì Safari ra trang chính — bản đầu lấy `origin + pathname`, bỏ mất trò. Giờ đang ở trò nào thì ba nút (Mở bằng Safari, Mở bằng Chrome, Chép link) dùng link của trò đó; trò có trang riêng dùng trang riêng `/luyen-phat-am/`, vì link `intent://…#Intent;…` của Chrome không mang được phần sau dấu `#`.
- **Nhớ là đã cài**: Android đã cài mà mở bằng Chrome thì Chrome thôi đưa hộp cài; bày bước cài tay lúc đó là bắt đi tìm một mục menu không còn — nên báo "App đã cài trên máy này". Chrome lại đưa hộp cài (app bị gỡ) thì thôi nhớ.

**Không tự bật nữa — chỉ có nút.** Người dùng: "không cần hiển thị popup cài app mà làm icon button cài app để người dùng thấy thì tự bấm cài, chứ đang sử dụng hiển thị cài app khó chịu lắm". Bản trước tự bật bảng 3,2 giây sau khi lật lá và 3 giây sau khi vào trò phát âm (tối đa 3 lần, cách nhau 7 ngày). Giờ bỏ hẳn luật tự gợi ý (`goiYCaiApp`, `nenTuHien`), bảng chỉ mở khi người dùng bấm: **nút hình điện thoại có mũi tên trên thanh trên cùng**, cạnh nút **?** (hình điện thoại để khỏi lẫn với nút "↓ Tải về" ảnh), nút **Cài app** trong trò phát âm (trò khai `nutCai: true` trong `SAO` — người vào thẳng từ link không thấy thanh trên cùng), hay **?** → *Cài app vào điện thoại*. Máy đã cài, đang mở từ màn hình chính, hay máy tính thì không có nút; vừa cài xong (`appinstalled`) thì nút ẩn. Thêm nút làm thanh trên cùng chật: ở màn 375 px tên app xuống dòng, nên trên màn tới 420 px chữ thưa bớt (khoảng cách chữ .16em → .1em) cho vừa một hàng; màn 320 px vốn đã hai dòng từ trước. Bảng nâng lên trên màn trò (z-index 35, trò là 30) — không thì mở trong trò sẽ bị che.

**Nút "Cài app" trong trò** — có ở trò phát âm từ trước, giờ ở mọi trò (xem mục "Chia sẻ link một trò"): người dùng thử trong Zalo, đã thấy bảng tự bật một lần nên không hiện lại, mà trong trò không có nút ? để mở lại — nên thêm nút ở góc trên, cạnh nút 🔗. Lúc làm phát hiện lỗi có sẵn: đóng trò bằng Back thì nút 🔗 không được gỡ khỏi trò cũ, mở trò khác thì `themNutChepLink` thấy "đã có" và trò mới mất nút — giờ `goNutTro()` gỡ cả hai nút ở mọi đường đóng trò.

Chỉ ghi một mẩu nhỏ `tdtd.caiApp`: đã cài chưa.

`scripts/test-caiapp.js`: nhận dạng 15 trường hợp theo chuỗi nhận dạng thật (iPhone Safari cả iOS 26, iPad tự xưng Mac mà không nhầm máy Mac thật, Chrome iPhone, Zalo, Facebook, Messenger trên cả hai hệ, Android có và chưa có hộp cài, máy tính, đã cài); không còn luật tự gợi ý; link mở bằng Chrome. `scripts/test-sao.js`: mọi chỗ gọi bảng cài đều là nút bấm (`onclick`), không `setTimeout`; thanh trên cùng có nút, ẩn sẵn; máy đã cài, máy tính thì không hiện, vừa cài thì ẩn. Đã thử trên trình duyệt giả Android cỡ 375 px: lật lá chờ 4,5 giây không có bảng nào bật, vào trò phát âm cũng vậy; bấm nút thì mở bảng; tên app vẫn một hàng.

## Đếm lượt truy cập

Người dùng hỏi "có biết được bao nhiêu lượt cài app không, tôi không biết số người truy cập có nhiều không". Trước đó app không đếm gì nên không có số nào cả. Giờ `assets/thongke.js` gắn [Vercel Web Analytics](https://vercel.com/docs/analytics/quickstart) bản HTML thuần (không cần gói npm): không cookie; Vercel nhận ra người xem bằng một mã băm tạo từ chính lượt truy cập, phiên xem tự bỏ sau 24 giờ, số liệu chỉ để thống kê gộp, không gắn với ai hay địa chỉ IP nào ([Vercel](https://vercel.com/docs/analytics/privacy-policy)). Mỗi lượt kèm thời điểm, địa chỉ trang, trang dẫn tới, vị trí cỡ thành phố, hệ điều hành, trình duyệt, loại máy.

**Phải bật một lần trong Vercel:** vào dự án → thẻ **Analytics** → **Enable**. Lần deploy sau đó Vercel mới mở đường `/_vercel/insights/`; trước khi bật, tệp đếm báo 404 và trang vẫn chạy bình thường. Chỉ đếm từ lúc bật, không có số của trước đó.

**Gói Hobby:** 50.000 lượt một tháng, xem lại được 1 tháng; vượt thì Vercel ngừng đếm tới kỳ sau chứ không tính tiền; không có sự kiện tuỳ chọn ([bảng giá](https://vercel.com/docs/analytics/limits-and-pricing)). Vì vậy mỗi lần mở trang chỉ gửi **một** lượt — đổi qua lại giữa các sao (đổi dấu `#`) bị bộ lọc `beforeSend` bỏ.

**Đọc số ở thẻ Analytics, mục Pages.** Địa chỉ gửi đi được thay bằng một trong ba nhãn:

| Nhãn | Nghĩa |
|---|---|
| `/` | mở bằng trình duyệt |
| `/app` | mở từ biểu tượng app ngoài màn hình chính |
| `/app/moi` | lần đầu mở app trên máy đó — một lượt **cài mới** |

Cột *Visitors* là số người, *Page Views* là số lần mở. Số người dùng app = `/app` + `/app/moi`. iPhone không báo cho trang lúc cài xong (Android chỉ báo khi cài bằng hộp cài), nên lượt cài đếm bằng **lần mở đầu tiên từ màn hình chính**, mốc `moApp` ghi chung vào mẩu `tdtd.caiApp`. Người đã cài từ trước khi có bộ đếm sẽ bị tính là "cài mới" ở lần mở đầu tiên sau đó; ai xoá app rồi cài lại thì đếm lại. Trình chặn quảng cáo có thể chặn bộ đếm, nên số thật có thể cao hơn một chút.

Service worker để đường `/_vercel/` đi thẳng ra mạng: không cất, và mất mạng thì không trả `index.html` thay cho tệp đếm. Chạy thử ở máy (`http://127.0.0.1`) thì không đếm.

`scripts/test-thongke.js`, 20 bài: nhãn từng trường hợp, mỗi lần mở chỉ một lượt, lượt cài không đếm lại, chạy trong trang có/không có `https`, service worker không chặn.

## Xem ngày
## Xem ngày

Một ngôi sao màu son đỏ, `#xem-ngay`. Ba phần trên một màn hình:

1. **Hôm nay tốt hay xấu** — ngày hoàng đạo hay hắc đạo và thần nào cai quản, trực gì cùng danh sách nên và không nên, giờ hoàng đạo, cảnh báo Tam nương / Nguyệt kỵ. Có mũi tên xem ngày trước, ngày sau.
2. **Bạn muốn làm gì?** — gõ việc định làm ("khai trương quán cà phê", "chuyển nhà") hoặc chọn một trong 15 mục, app tìm năm ngày tốt nhất trong 60 ngày tới, kèm lý do và giờ tốt.
3. **Tuổi** (không bắt buộc) — nhập ngày sinh thì tránh luôn ngày xung tuổi. Chỉ lưu trong máy.

**Chọn ngày sinh bằng ba ô Ngày / Tháng / Năm và nút Xong, không dùng ô lịch của máy.** Bản đầu dùng `<input type="date">` và lưu ngay khi ô báo đổi giá trị. Người dùng báo vừa chạm vào ô, chưa chọn gì đã thấy tự chọn: trình duyệt trên điện thoại điền sẵn một ngày ngay khi mở bảng chọn (thường là hôm nay) và báo đổi giá trị, app lưu luôn rồi vẽ lại khung, bảng chọn mất theo. Tôi không có iPhone để chạy lại đúng cảnh đó, nhưng chỗ lưu-ngay-khi-đổi là đủ để sinh ra đúng lỗi ấy. Giờ chỉ lưu khi bấm Xong; ngày không có thật (31/2) hay ngày ở tương lai thì báo lỗi chứ không lưu.

**Bốn thẻ** ở đầu màn: **Ngày** (ba phần trên), **Tháng**, **Ngày lễ**, **Đổi ngày**.

- **Tháng**: lịch cả tháng dạng lưới, tuần bắt đầu từ thứ hai. Mỗi ô có ngày dương, ngày âm (mùng 1 ghi cả tháng), ô vàng là ngày hoàng đạo, chữ xanh là mùng 1 và rằm, chấm đỏ là ngày lễ; bên dưới liệt kê các lễ trong tháng. Bấm một ô là sang thẻ Ngày xem chi tiết ngày đó.
- **Ngày lễ**: các lễ âm lịch, lễ dương lịch, mùng 1 và rằm trong 12 tháng tới, kèm số ngày còn lại. Nút **"＋ Lịch"** ở từng dòng, và hai nút thêm cả loạt (các ngày lễ; mùng 1 và rằm), tạo tệp `.ics` ngay trên máy rồi mở bằng ứng dụng Lịch, **nhắc lúc 9 giờ sáng hôm trước**. Không gửi gì đi đâu. Tệp theo RFC 5545: CRLF, ngày trọn không giờ, dòng dài gập ở 75 **byte** (tiếng Việt có dấu một chữ hai ba byte). Lễ âm lịch theo mục "Theo âm lịch" của bài *Các ngày lễ ở Việt Nam* trên Wikipedia tiếng Việt, thêm Tết Nguyên đán, Giỗ Tổ Hùng Vương, Thất tịch, Tết Hạ nguyên; chỉ tính ở tháng thường, không tính tháng nhuận. Giao thừa ghi đúng "29 Tết" hay "30 Tết" theo tháng Chạp năm đó thiếu hay đủ. Danh sách **mùng 1 và rằm** đủ cả những ngày trùng lễ (rằm tháng Giêng, Vu lan, mùng 1 Tết) — bản đầu rơi mất sáu ngày đó.
- **Đổi ngày**: dương sang âm (kèm can chi, hoàng đạo hay hắc đạo), và âm sang dương có ô *tháng nhuận* chỉ hiện khi năm đó nhuận đúng tháng ấy. Ngày âm nhập vào còn được tính cho **năm nay và hai năm tới** — dùng cho ngày giỗ, sinh nhật âm lịch — đặt tên rồi thêm cả loạt vào lịch điện thoại. `convertLunar2Solar` gặp ngày không có thật (30 của tháng thiếu, tháng nhuận năm không nhuận) vẫn trả ra một ngày; ví dụ "30 tháng Chạp 2029" ra đúng mùng 1 Tết 2030. Nên đổi xong phải đổi ngược lại để chặn. Giỗ ngày 30 mà năm đó tháng thiếu thì lùi về 29 và nói ra.

**Hướng xuất hành** (trong thẻ Ngày): đón Hỷ thần, Tài thần ở hướng nào, tránh hướng nào vì Hạc thần. Hỷ thần và Tài thần theo can của ngày; Hạc thần theo vòng 60 ngày — từ ngày Kỷ Dậu ở Đông Bắc 6 ngày, rồi Đông 5, Đông Nam 6, Nam 5, Tây Nam 6, Tây 5, Tây Bắc 6, Bắc 5, rồi 16 ngày "lên trời" không phải tránh hướng nào. Đối chiếu bốn nguồn (xemlicham.com 30 ngày, lichvannien365.com 14 ngày, và hai bài công bố nguyên bảng ở dongphuonglyso.blogspot.com, ancotnam.vn), và **các nguồn không hoàn toàn nhất trí**:

- Hỷ thần: ba nguồn như nhau; ancotnam đảo Ất/Canh với Bính/Tân. Lấy theo ba nguồn.
- Tài thần: nhất trí ở tám can. Ngày **Mậu**: ba nguồn ghi Bắc, xemlicham ghi Nam — lấy Bắc. Ngày **Quý** các nguồn chia ba: Tây Bắc (lichvannien365, ancotnam), Chính Tây (xemlicham), Đông Nam (dongphuonglyso) — lấy Tây Bắc theo số đông.
- Hạc thần: khớp cả 24 ngày trích được từ xemlicham và bảng của ancotnam.

`scripts/test-lich.js` lên 97 bài: thêm hướng xuất hành (10 can, 24 ngày Hạc thần), đổi âm sang dương (1.565 ngày đổi đi đổi lại, ngày không có thật, các năm nhuận đã biết), ngày lễ (Tết và giao thừa 2027, Trung thu, không ghi trùng rằm với lễ). `scripts/test-sao.js` kiểm tệp `.ics`.

**Không hỏi tên**, vì lịch vạn niên không có luật nào dùng tên người. Cái có luật thật là tuổi: ngày có chi đối với chi năm sinh (Tý–Ngọ, Sửu–Mùi...) là ngày xung. Tuổi tính theo **năm âm** — sinh 20/1/1990 là tuổi Kỷ Tỵ chứ không phải Canh Ngọ, vì Tết năm đó là 27/1.

**Không tự đặt ra luật nào.** Nguồn của từng phần, ghi cả ở đầu `assets/lich.js`:

| Phần | Nguồn |
|---|---|
| Âm lịch, can chi | Thuật toán Hồ Ngọc Đức, [Thuật toán tính âm lịch](https://www.xemamlich.uhm.vn/calrules.html), múi giờ 7.0 — chép lại từng dòng |
| 12 thần hoàng đạo / hắc đạo | saptet.com, khớp xemlicham.com, lichvannien365.com, lichngaytot.com |
| 12 trực | theo **tháng tiết khí**, không theo tháng âm — ja.wikipedia 十二直, zh.wikipedia 建除十二神 |
| Nên / không nên của từng trực | **chỉ lichvannien365.com** |
| Giờ hoàng đạo | tra theo **chi** của ngày, bảng của saptet.com |
| Tam nương, Nguyệt kỵ | mùng 3, 7, 13, 18, 22, 27 / mùng 5, 14, 23 âm lịch |

**Các nguồn cãi nhau, nên chọn một chứ không trộn.** Bốn trang lịch vạn niên đồng ý về âm lịch, can chi, thần và giờ — nhưng danh sách nên / không nên thì mỗi trang một kiểu: trực Khai trang này bảo nên động thổ, trang kia bảo kỵ; trực Bình một trang ghi "tốt mọi việc", trang khác lại có hẳn danh sách xấu. Ở đây lấy trọn của lichvannien365.com vì nó chia sẵn hai danh sách tốt / xấu song song. Một trang khác (viettopreview) tra giờ hoàng đạo theo **can** của ngày — sai với mọi ngày đã đối chiếu, nên bỏ.

**Một chỗ các trang không thống nhất, chọn theo số đông.** Ngày 7/9/2026 tiết Bạch lộ bắt đầu lúc 21 giờ 41. Ba trang coi hôm đó vẫn thuộc tháng cũ (trực Kiến), một trang coi là đã sang tháng mới (trực Bế). App xét tiết vào **giữa trưa** giờ Việt Nam, ra đúng như ba trang — và cũng khớp ngày 4/2/2026, Lập xuân lúc 3 giờ 02, cả bốn trang đều coi là đã sang tháng.

**Đối chiếu với lịch đã công bố**, `scripts/test-lich.js`:

- bảy ngày rải khắp năm 2026 — khớp cả âm lịch, can chi ngày tháng năm, thần, trực, sáu giờ hoàng đạo
- mười lăm ngày tháng 9/2026, từng ngày một với saptet.com — khớp thần lẫn trực
- trực lặp hai ngày liền khi giao tiết (7 và 8/9 cùng Kiến), còn trung khí như Thu phân thì không làm lặp
- mùng một Tết 2024, 2025, 2026
- 3.650 ngày từ 2000 tới 2029 đổi dương sang âm rồi âm về dương vẫn đúng

**Rà lại lần hai (28/9/2026), 30 ngày rải từ 2026 tới 2028** so với xemlicham.com: âm lịch, can chi, giờ hoàng đạo, Tam nương, Nguyệt kỵ khớp hết, kể cả Tết 2027 và **tháng 5 nhuận năm 2028** (23/6 là mùng 1 tháng 5 nhuận, 22/7 là mùng 1 tháng 6). Có ba chỗ lệch, đều đã xử lý:

- **Trực những ngày 1–4/1.** xemlicham tính sang tháng Sửu ngay từ 1/1 mỗi năm, sớm hơn Tiểu hàn vài ngày, nên lệch trực ở 1/1/2027, 3/1/2026, 3/1/2028. Đem sang lichvannien365.com thì nó khớp app ở cả bốn ngày, và trực lặp đúng ở 5–6/1/2026 như luật trực lặp khi giao tiết. Lấy theo lichvannien365; mười ngày đầu tháng 1 nằm trong bài kiểm.
- **Tên tiết ngày giao tiết.** Các trang ghi tên tiết mới ngay từ ngày nó bắt đầu ("Tiểu hàn, từ ngày 5/1"); app trước xét giữa trưa nên tiết bắt đầu buổi chiều tối thì còn ghi tiết cũ. Giờ ngày có tiết bắt đầu thì ghi tiết mới kèm **"bắt đầu hôm nay, khoảng 13 giờ 30"**. Giờ tính bằng kinh độ biểu kiến (thêm quang sai và chương động — `kinhDoTroi` của thuật toán âm lịch là kinh độ hình học và không được đụng vào), lệch với nguồn 1 và 6 phút ở hai mốc đã biết, nên làm tròn 10 phút và nói "khoảng". Trực vẫn xét giữa trưa như cũ.
- **Trực "Thu"** các trang hay viết "Thâu" — cùng một trực, giờ ghi "Trực Thu (còn gọi Thâu)".

`scripts/test-lich.js` lên 73 bài: thêm 12 ngày đối chiếu, mười ngày đầu tháng 1, tháng nhuận 2028, tên và giờ bắt đầu tiết.

**Một lỗi tự bắt được ở phần nhận việc.** Bản đầu dò theo chuỗi con, nên *"tổ chức sự kiện"* ra kiện tụng, *"đi khám phá hang động"* ra khám bệnh, *"thiết kế lại phòng"* ra thi cử (vì "thiết" chứa "thi"), *"đăng ký tài khoản"* ra ký hợp đồng. Giờ dò theo **chữ trọn vẹn**, và gỡ mấy từ ghép hay gây nhầm ra trước khi dò. Chỗ ứng việc hiện đại ("khai trương quán") với chữ cổ trong sách ("mở tiệm", "giá thú") là phần biên soạn của app, không phải của nguồn.

Chưa thử được tháng nhuận — không ngày mẫu nào rơi vào tháng nhuận. Thần của tháng nhuận đang dùng số của tháng nó lặp lại.

## Thần số học

Một ngôi sao màu tím nhạt, `#than-so`. Nhập ngày sinh dương lịch (dùng chung với Xem ngày, chỉ lưu trong máy), app tính theo **thần số học Pythagoras** — phương pháp của David A. Phillips mà bản tiếng Việt *Thay đổi cuộc sống với Nhân số học* (Lê Đỗ Quỳnh Hương) giới thiệu:

- **Số chủ đạo**, kèm từng bước cộng để tự kiểm, tên gọi, thế mạnh và điều nên để ý.
- **Biểu đồ ngày sinh** 3×3 (hàng trên 3-6-9 trí não, giữa 2-5-8 tinh thần, dưới 1-4-7 thể chất) và các **mũi tên**: 8 mũi tên đầy (Kế hoạch, Ý chí, Hoạt động, Thực tế, Cân bằng cảm xúc, Trí tuệ, Quyết tâm, Tâm linh) và 7 mũi tên trống (Uất giận, Thụ động, Thiếu trật tự, Nhạy cảm, Trí nhớ ngắn hạn, Trì hoãn, Hoài nghi). Không có mũi tên trống 1-2-3 vì năm sinh nào cũng có chữ số 1 hoặc 2.
- **Năm cá nhân** năm nay và năm sau.
- **Bốn đỉnh cao**: số, tuổi và năm của từng đỉnh, đánh dấu đỉnh đang ở.
- **Theo họ tên** (mục cuối): nhập họ tên khai sinh, thêm tên thường gọi nếu muốn. Ra ba chỉ số **Linh hồn** (cộng nguyên âm), **Nhân cách** (cộng phụ âm), **Sứ mệnh** (cộng mọi chữ cái), mỗi chữ cái viết kèm số của nó để tự kiểm; **biểu đồ tên** theo tên thường gọi và **biểu đồ tổng hợp** (ngày sinh + tên) kèm mũi tên. **Tên không lưu** — chỉ nằm trong bộ nhớ lúc trang mở.

**Không có sách gốc trong tay** — bản PDF trên mạng là bản sao không rõ quyền nên không dùng. Mọi quy tắc lấy từ chỗ các nguồn đối chiếu được (thansohoconline.com, viettopreview.vn, vietnamworks.com, tracuuthansohoc.com, arena.fpt.edu.vn, tinhte.vn, và một bài blog trích nguyên văn Phillips về 16 mũi tên) **nhất trí**, và chỗ nào lệch nhau thì ghi ra:

- **Số chủ đạo cộng thẳng mọi chữ số**, rút gọn tới khi được 2–11, tổng đúng bằng 22 thì ghi 22/4. Có trang rút gọn riêng ngày, tháng, năm rồi mới cộng; hai cách ra cùng kết quả gần như mọi ngày, chỉ lệch ở 22/4 (sinh 20/2/1971: cộng thẳng ra 22, rút gọn từng phần ra 4). Các trang định nghĩa 22/4 theo "số tổng" bằng 22, nên cộng thẳng. Có trang theo trường phái phương Tây giữ cả 33 và không có số 10 — không theo, vì không phải trường phái của sách.
- **Năm cá nhân** rút về 1–9 theo chu kỳ 9 năm. Có trang giữ 11 và 22 — ghi nhận, không theo.
- **Tuổi đỉnh cao** là 36 trừ số chủ đạo; các trang ghi rõ số 11 thì đỉnh đầu ở 25 tuổi. Với **22/4 không trang nào nói trừ 22 hay trừ 4**; app trừ 22 như với 11, và giao diện nói thẳng chỗ chưa rõ này, kèm bốn tuổi nếu trừ 4.
- Có trang nói 22/4 "chỉ khoảng 1–2%". Đếm thật trên mọi ngày từ 1920 tới 2030 thì ra 3,4% — con số đó không đúng.

Lời giảng các con số viết lại bằng lời của app, ngắn, nói cả thế mạnh lẫn điều nên để ý, không phán chắc; cuối trang nói rõ thần số học không có cơ sở khoa học. Phần **họ tên** theo chỗ các nguồn nhất trí (viettopreview.vn, tracuuthansohoc.com, tracuuthansohoc.net, trathanso.com, bieudothansohoc.vn):

- Bảng Pythagoras: A J S = 1, B K T = 2, C L U = 3, D M V = 4, E N W = 5, F O X = 6, G P Y = 7, H Q Z = 8, I R = 9. Bỏ dấu thanh và dấu mũ (Ơ, Ư, Â… về O, U, A), **Đ tính là D**.
- **Chữ Y**: đứng cạnh một nguyên âm trong cùng chữ thì là phụ âm (Yến, Duyên, Huy, Quỳnh, Nguyễn), còn lại là nguyên âm (Mỹ, Vy, Ý, Thy).
- Cộng cả tên rồi mới rút gọn, **giữ 11 và 22**. Ví dụ có lời giải khớp: *Nguyễn Thị Hòa* tên từng chữ 8, 9, 7, nguyên âm 24 → 6 (trathanso.com); *Nguyên* nguyên âm 3 + 5 = 8, phụ âm 24 → 6 (tracuuthansohoc.net).
- Biểu đồ tên lấy theo **tên thường gọi** (tracuuthansohoc.com); để trống thì lấy chữ cuối của họ tên.
- Có trang đưa ví dụ tính sai chính luật của nó (cộng Y như nguyên âm dù đứng cạnh U) — không dùng ví dụ đó. Chỉ số phụ âm có nơi gọi "Nhân cách", có nơi gọi "Biểu đạt"; app dùng "Nhân cách".

`scripts/test-sohoc.js`, 48 bài: các ví dụ có lời giải trong nguồn (19/8/1991 ra 11; 29/11/1994 và 11/2/1985 ra 9; năm cá nhân của người sinh 31/1 các năm 2022–2026 và 27/2 các năm 2018–2020; chân kim tự tháp của 1/5/1974 và 10/5/2001; số 11 đỉnh đầu 25 tuổi), và các tính chất trên cả 40.542 ngày từ 1920 tới 2030: không có số chủ đạo 1, 22/4 khi và chỉ khi tổng bằng 22, năm cá nhân luôn 1–9, đỉnh 1 và 2 luôn một chữ số. Phần họ tên: hai ví dụ có lời giải ở trên, luật chữ Y trên 10 tên, Đ ra D, giữ 11 (Tuấn, Hương 29 → 11) và 22/4 (Hạnh), tên không có nguyên âm hay không có chữ cái nào.

## Nhạc ngủ

Ngôi sao hình trăng lưỡi liềm, `#nhac-ngu`. Chọn một âm, hẹn giờ, rồi tắt màn hình: âm nhỏ dần rồi tự tắt.

**Bối cảnh người khó ngủ, và app dựa vào đâu.** Tra trước khi làm, không đoán:

- **Nhạc là thứ có bằng chứng nhất.** Tổng hợp Cochrane 2022 (Jespersen và cs.: 13 nghiên cứu, 1.007 người lớn mất ngủ) thấy nghe nhạc *có lẽ* giúp ngủ ngon hơn nhiều so với không làm gì (độ tin cậy vừa); thời gian vào giấc, độ dài giấc ngủ chỉ khá lên chút ít (độ tin cậy thấp). Người ta nghe 25–50 phút mỗi ngày, từ ba ngày tới ba tháng. Tổng quan của Pan và cs. (Frontiers in Sleep 2025) tóm nét chung của nhạc hiệu quả: chậm 60–80 phách mỗi phút, nhẹ, êm, không lời, cấu trúc đơn giản; nghe 30–45 phút trước khi ngủ, âm lượng dễ chịu (nghiên cứu nào ghi thì để 50–60 dB).
- **Tiếng ồn nền (trắng, hồng, nâu) chưa được chứng minh.** Tổng quan 38 nghiên cứu (Riedy và cs., Sleep Medicine Reviews 2021) xếp bằng chứng vào loại rất thấp, và nhắc nó còn có thể hại giấc ngủ, hại tai. Thử nghiệm trong phòng ngủ thí nghiệm của Basner và cs. (tạp chí Sleep, 2026; 25 người, 7 đêm): tiếng ồn hồng 50 dB **mở cả đêm** làm bớt gần 19 phút giấc REM; nút tai chặn tiếng máy bay tốt hơn. Tác giả cảnh báo riêng cho trẻ nhỏ.
- **Nhịp hai tai (binaural beats)**: tổng quan có hệ thống của Ingendoh và cs. (PLOS ONE 2023) xét 14 nghiên cứu xem sóng não có "bắt nhịp" theo không: 5 thấy có, 8 thấy không, 1 lẫn lộn. Một nghiên cứu (Jirakittayakorn & Wongsawat, Frontiers in Human Neuroscience 2018) phát nhịp 3 Hz trên âm nền 250 Hz *lúc người ta đã vào giai đoạn N2* thì giấc sâu N3 đến sớm và dài hơn.
- **432 Hz**: chỉ có một nghiên cứu thí điểm 12 người (Calamassi và cs., Acta Biomedica 2020).
- **Thở chậm** khoảng 6 lần mỗi phút làm nhịp tim dịu lại ngay, nhưng thử nghiệm 20 người trên Scientific Reports (2020) chưa thấy tác dụng chắc chắn lên giấc ngủ.
- **Điều trị thật là hành vi.** Trong hướng dẫn của AASM (Edinger và cs., 2021), CBT-I là cách duy nhất được xếp mức khuyên mạnh; riêng "kiểm soát kích thích" (nằm khoảng 20 phút chưa ngủ được thì dậy, buồn ngủ mới quay lại giường) cũng được khuyên dùng.

**Nên app làm thế này:**

- **Sáu âm**, mỗi âm ghi rõ bằng chứng của nó tới đâu: *Nhạc ru* (60 phách mỗi phút, Fa trưởng, giai điệu chỉ đi trên năm nốt ngũ cung, nền hợp âm, không trống, không nốt cao quá La 5), *Sóng biển* (mỗi con sóng đúng 10 giây — kèm vòng tròn phồng xẹp và chữ "hít vào / thở ra" theo đúng con sóng đang phát, thành 6 nhịp thở mỗi phút), *Mưa nhẹ*, *Tiếng ồn nâu*, *Sóng delta 3 Hz* (đúng thông số nghiên cứu 2018: tai trái 250 Hz, tai phải 253 Hz, ghi "cần tai nghe"), *Tần số 432 Hz* (hợp âm La trưởng chỉnh theo La = 432 Hz, quãng năm 3/2 và quãng ba 5/4 cho khỏi tiếng đập). Không làm 528 Hz hay các "tần số chữa lành" khác: nghiên cứu hay được dẫn về 528 Hz (2018) chỉ có 9 người, đo hormone căng thẳng sau vài phút nghe, không đo giấc ngủ.
- **Luôn tự tắt.** Hẹn 15, 30 (mặc định), 45, 60 hoặc 90 phút; **không có chế độ cả đêm**, vì thử nghiệm năm 2026 ở trên. To dần 6 giây lúc đầu cho khỏi giật mình; nhỏ dần trong 1/6 thời gian cuối (ít nhất 2, nhiều nhất 10 phút) theo hàm mũ, tức đều theo dB, xuống −60 dB rồi tắt hẳn. Có nút +15 phút, tạm dừng (giờ tắt dừng theo), tắt ngay.
- **Phần "Để dễ ngủ hơn"** ở cuối trang: hẹn 30–45 phút, đừng mở suốt đêm, để nhỏ, nằm 20 phút vẫn tỉnh thì dậy, tối màn hình, mất ngủ từ ba đêm mỗi tuần kéo dài hơn ba tháng thì gặp bác sĩ. Ghi nguồn, và nói rõ đây không thay lời khuyên của bác sĩ.
- Màn đang phát gần như đen; chỉ lưu ba lựa chọn (âm, giờ, âm lượng) để tối sau mở ra là sẵn.
- **Quay lại mà không tắt nhạc.** Người dùng báo "không có nút back": màn đang phát chỉ có ✕ (đóng hẳn, tắt nhạc) và Tắt. Giờ có nút **‹ Chọn âm** ở góc trái: về danh sách, nhạc vẫn chạy; đầu danh sách có thanh *Đang phát… còn mm:ss* để quay lại màn phát hoặc tắt. Chọn âm khác thì nút thành *Đổi sang …*: âm cũ nhỏ đi trong 0,4 giây, âm mới to dần như lúc bắt đầu, hẹn giờ tính lại theo số phút đang chọn.

**Kỹ thuật: phải chạy được khi màn hình đã tắt.**

- Khoá màn hình rồi thì trình duyệt bóp JS, nhưng luồng âm thanh vẫn chạy. Nên **không phát từng nốt bằng JS**: mỗi âm được tạo sẵn thành một đoạn 80 giây (24 kHz, hai kênh) nối đầu với đuôi liền mạch, cho nguồn phát tự lặp; to dần, nhỏ dần và lúc dừng thì hẹn trước hết trên đồng hồ của luồng âm thanh (`setValueAtTime`, `linearRampToValueAtTime`, `exponentialRampToValueAtTime`, `stop`) ngay lúc bấm Bắt đầu. Sau đó không cần JS chạy thêm dòng nào.
- Đoạn lặp liền mạch: bộ lọc tiếng ồn chạy *vòng* (cho bộ lọc "ấm" lên bằng 2 giây cuối mảng trước khi lọc từ đầu, nên trạng thái ở mẫu đầu đúng bằng ở mẫu cuối); âm có cao độ chọn tần số để 80 giây chứa tròn chu kỳ; nốt nhạc, giọt mưa ngân quá cuối thì cộng vòng về đầu.
- Tạo âm mất chừng 0,4–1 giây trên máy tính, nên chạy trong **Web Worker** (cùng tệp `rungu.js`) cho màn hình khỏi đứng; máy không chạy được worker thì làm trên luồng chính. Bấm chọn âm là bắt đầu tạo sẵn.
- **iPhone**: Web Audio mặc định bị nút im lặng tắt tiếng và bị dừng khi khoá máy. Từ iOS 17 có `navigator.audioSession.type = 'playback'` để đi đường như app nhạc ([WebKit bug 237322](https://bugs.webkit.org/show_bug.cgi?id=237322)); lỗi vẫn bị dừng dù đã đặt `playback` được sửa ở iOS 17.5 ([bug 261554](https://bugs.webkit.org/show_bug.cgi?id=261554)). iOS cũ hơn: giữ màn hình sáng (nền đen) trong lúc phát và nói thẳng điều đó với người dùng. Có mục trên màn hình khoá (Media Session).
- **Kéo dài giữa chừng** không huỷ lịch cũ — huỷ một đường đang dốc dở làm âm lượng nhảy, nghe "bụp" — mà mở một nhánh gain mới với lịch mới rồi chuyển êm 0,3 giây. Nhánh mới đặt sẵn mức ban đầu, vì mặc định của gain là 1: nếu luồng âm thanh kịp chạy một nhịp trước khi lịch được áp, nó sẽ kêu ở mức đủ. Đối chiếu bằng `OfflineAudioContext` trong Chrome: đường âm lượng thật lệch công thức dưới 1e-7, bấm +15 phút giữa lúc nhỏ dần không còn bước nhảy nào lớn hơn 0,001.
- **Không tự cập nhật giữa giấc ngủ**: app tự tải lại khi có bản mới lúc trang bị ẩn — mà khoá màn hình cũng là trang bị ẩn. Đang phát nhạc ngủ thì không tải; nhạc tự tắt xong (`tdtd-ngu-het`) mà màn hình vẫn khoá thì lúc đó mới tải.
- Đóng trang là tắt nhạc, để không có âm chạy ngầm mà không ai thấy.

`scripts/test-ngu.js`, 53 bài: phổ ồn hồng bằng nhau ở mọi quãng tám 63 Hz–4 kHz (lệch 0,2 dB), ồn nâu dốc −3,3 dB năng lượng mỗi quãng tám; nhịp hai tai đúng 250/253 Hz, không lẫn kênh (59–61 dB); hợp âm có đủ sáu nốt theo 432 Hz và không có 440; nhịp sóng tự tương quan 0,97 ở 10 giây, đúng 8 đỉnh, không bao giờ im hẳn; nhạc 60 phách, mọi nốt trên phách, chỉ năm nốt ngũ cung; mọi âm nối đuôi vào đầu không có tiếng "tách" (xét cả từng mẫu lẫn độ to từng khung 20 ms); lịch nhỏ dần chạy qua một bộ mô phỏng AudioParam theo luật Web Audio ra đúng đường âm lượng, cả khi kéo dài giữa chừng; đường worker. Đã thử phá cố ý (bỏ phần "làm ấm" bộ lọc; bỏ một bước trong lịch): bài kiểm bắt được cả hai. `scripts/test-sao.js` thêm ba tình huống tự cập nhật lúc đang phát nhạc ngủ.

### "1 8 9 là gì, ở đâu ra — sao ở trên là 3, 4"

Người dùng nhìn biểu đồ tên "Hải" mà không hiểu các số từ đâu ra, cũng không hiểu sao ba số tròn ở trên lại là 1, 3, 4. Hai thứ tính khác nhau mà app không nói: ba chỉ số Linh hồn, Nhân cách, Sứ mệnh là **tổng** các chữ của cả họ tên khai sinh, rút về một chữ số (Hồ Trung Hải: nguyên âm 19 → 10 → 1, phụ âm 39 → 12 → 3, cả tên 58 → 13 → 4); còn biểu đồ tên giữ **riêng từng chữ** của tên thường gọi, mỗi số vào ô của nó (Hải: H → 8, A → 1, I → 9). Giờ ngay dưới biểu đồ tên có dòng đổi chữ ra số, câu nói rõ khác ba chỉ số ở chỗ nào, và **nghĩa của từng ô có số** kèm chữ cái làm ra nó; dưới biểu đồ ngày sinh cũng có nghĩa các ô; dưới biểu đồ tổng hợp nói tên **lấp vào ô nào** ngày sinh còn trống ("tên bù cho ngày sinh") và ô nào vẫn trống.

Nghĩa chín ô (`Y_O` trong `sohoc.js`) chỉ lấy chỗ hai nguồn nhất trí — tracuuthansohoc.com (bài biểu đồ ngày sinh, bài biểu đồ tên) và thansohoconline.com (bài biểu đồ ngày sinh) — viết lại ngắn bằng lời của app: 1 cái tôi, cách thể hiện mình; 2 nhạy cảm, trực giác; 3 tâm trí, trí nhớ; 4 thực tế, trật tự; 5 cảm xúc và sự tự do bộc lộ; 6 sáng tạo, trí tuệ, hay lo nghĩ; 7 học qua trải nghiệm; 8 năng động, độc lập, hiểu cảm xúc người khác; 9 lý tưởng, trách nhiệm, uy tín. Cũng theo hai trang đó: biểu đồ ngày sinh là tố chất bẩm sinh, biểu đồ tên là cách thể hiện ra ngoài hình thành qua trải nghiệm. "Số nội cảm" thì các trang nói không thống nhất (có trang không định nghĩa), nên không đưa vào.

`scripts/test-sohoc.js` thêm 5 bài: đủ nghĩa chín ô; biểu đồ tên "Hải" đúng ba ô 8, 1, 9; tên "Hải" không bù ô nào cho ngày sinh 19/8/1991 (đã có sẵn 1, 8, 9), tên "Phong" bù 5, 6, 7; Hồ Trung Hải ra 1, 3, 4.

## Thiền luân xa

Người dùng muốn "một ngôi sao nhạc thiền định để kích hoạt các luân xa, tìm hiểu tài liệu xong mới làm, làm cho đúng". Ngôi sao hoa sen hồng (`#thien-luan-xa`): một buổi thiền đi qua bảy luân xa từ gốc lên đỉnh. Mỗi luân xa có hoa sen vẽ theo kinh văn, chữ chủng tử để tụng, nhịp thở 4 – 6, tiếng đàn tanpura cùng nốt và chuông xoay ngân mỗi ba hơi thở. Chọn 1, 2, 3 hay 5 phút mỗi luân xa; cuối buổi có một phút ngồi yên với ba tiếng chuông.

**Thiền riêng một luân xa.** Người dùng hỏi tiếp: "người dùng không thiền riêng một luân xa đang tắc nghẽn được hả". Giờ có hai cách: *Cả bảy luân xa* (1, 2, 3, 5 phút mỗi luân xa) hoặc *Một luân xa* — chọn trong ô bảy luân xa, hay bấm "Thiền riêng luân xa này" ngay trong phần mô tả của luân xa đó — rồi 5, 10, 15, 20 phút, cộng một phút ngồi yên. App nói thẳng là **không đo được luân xa nào "tắc"** (chưa có cách nào đo điều đó), nên người dùng tự chọn theo cảm nhận; app không làm bài trắc nghiệm đoán luân xa tắc. `lichBuoi(phut, ds)` nhận danh sách luân xa: cả bảy là `[0…6]`, thiền riêng là một phần tử — cùng một đường lịch, cùng trình phát.

**Hình người để hình dung chỗ của từng luân xa.** Người dùng nhắc: "phải vẽ hình, khi bấm vào luân xa nào thì luân xa đó sáng để mọi người dễ hình dung". Đầu màn chọn có hình người ngồi thiền với bảy chấm đánh số; chạm vào đâu trên hình thì luân xa **gần chỗ chạm nhất** sáng lên, phát quang nhịp nhàng, bên cạnh hiện tên, âm tụng, vị trí và hoa sen (bản đầu chỉ nhận chạm trúng chấm — thử bấm thật thì trượt vào khe giữa tim và rốn, không có gì xảy ra). Đang chọn thiền một luân xa thì chạm là chọn luôn. Chọn ở ô bảy luân xa, hay mở một luân xa trong danh sách, hình cũng sáng theo; mỗi luân xa trong danh sách còn có hình nhỏ của riêng nó. Bàn phím: Tab tới từng chấm, Enter để chọn.

Cũng lúc này phát hiện trăng lưỡi liềm giữa hoa sen Svādhiṣṭhāna **dẹt thành không**: cung tròn bên trong bán kính 18 cho dây cung dài 46 — nhỏ hơn nửa dây cung nên trình duyệt tự nới bán kính ra bằng cung ngoài. Giờ vẽ bằng hai vòng cắt nhau thật (r22 tâm gốc, r20 tâm lệch lên 8), và có bài kiểm mọi cung trong mọi hoa sen đủ bán kính.

**Nội dung theo kinh văn, không theo bảng trên mạng.** Hệ bảy luân xa dựa trên Ṣaṭ-cakra-nirūpaṇa của Pūrṇānanda (1577), bản dịch Arthur Avalon 1919 ([wisdomlib.org](https://www.wisdomlib.org/hinduism/book/shat-cakra-nirupana-english)), đối chiếu Wikipedia từng luân xa:

| | Tên | Cánh | Chủng tử | Yếu tố | Kinh văn tả |
|---|---|---|---|---|---|
| 1 | Mūlādhāra | 4 | LAM | đất | cánh đỏ, giữa hình vuông vàng |
| 2 | Svādhiṣṭhāna | 6 | VAM | nước | cánh đỏ son, giữa trăng lưỡi liềm trắng |
| 3 | Maṇipūra | 10 | RAM | lửa | cánh xanh thẫm như mây mưa, giữa tam giác đỏ chĩa xuống |
| 4 | Anāhata | 12 | YAM | gió | cánh đỏ hoa bandhūka (câu 22), giữa hình sáu góc màu khói |
| 5 | Viśuddha | 16 | HAM | không gian | cánh tím khói, giữa tam giác xanh có vòng trăng trắng |
| 6 | Ājñā | 2 | OM | tâm | cánh trắng như trăng, chữ Ha và Kṣa (câu 32) |
| 7 | Sahasrāra | 1000 | im lặng | — | trắng hơn trăng rằm, nhuỵ màu mặt trời mới mọc (câu 40) |

Hoa sen trong app tô **màu kinh văn**. Màu cầu vồng (đỏ ở gốc → tím ở đỉnh) chỉ dùng cho chấm trên hình người ngồi thiền, và được nói rõ là quy ước thời nay: Leadbeater đưa ra năm 1927, ghép đủ với danh sách phẩm chất từ 1977 (Kurt Leland, dẫn trong [Wikipedia "Chakra"](https://en.wikipedia.org/wiki/Chakra)).

**Nói thẳng ba điều** (mục "Nói cho đúng" trong app):
- Khoa học chưa tìm thấy luân xa như một bộ phận cơ thể, nên "kích hoạt" ở đây là luyện chú ý, hơi thở, âm thanh — không hứa tác động vật lý.
- Các tần số 396 – 963 Hz ("solfeggio") do Joseph Puleo tính từ số câu Kinh Thánh khoảng thập niên 1970, Leonard Horowitz phổ biến; không có trong kinh sách cổ, không có bằng chứng chữa bệnh ([Science Feedback](https://science.feedback.org/review/no-evidence-support-claim-solfeggio-frequencies-remove-toxins-from-body/)). App vẫn dùng làm cao độ chuông vì đó là bảng người ta quen gặp (cách gán phổ biến nhất: gốc 396 … đỉnh 963), và đàn lấy cùng nốt hạ vài quãng tám vào 110–220 Hz cho vừa giọng tụng.
- Điều có bằng chứng: thở chậm dưới 10 hơi mỗi phút tăng hoạt động phó giao cảm (Zaccaro và cs. 2018; Laborde và cs. 2022, 223 nghiên cứu); ngồi nghe chuông xoay một giờ, 62 người bớt căng thẳng (Goldsby và cs. 2017, chưa có nhóm đối chứng — Stanhope & Weinstein 2020 cho rằng còn quá ít nghiên cứu để coi là liệu pháp); tụng OM giảm hoạt động vùng limbic ở 12 người ([Kalyani và cs. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3099099/), nghiên cứu thí điểm).

**Âm thanh tạo trên máy** (`assets/luanxa.js`, chạy làm Web Worker):
- *Chuông xoay*: năm tần số riêng theo **số đo một chuông thật** — 472, 1329, 2448, 3738, 5165 Hz, tức 1 : 2,82 : 5,19 : 7,92 : 10,94 (Gołaś & Filipek, Archives of Acoustics 2016, bảng 2), nằm trong khoảng Inácio và cs. (2006) đo trên chuông Tây Tạng. Mỗi tần số tách đôi vài Hz vì chuông không tròn tuyệt đối, nên nghe ngân rung ([Terwagne & Bush 2011](https://arxiv.org/abs/1106.6348)). Độ ngân thì **chưa tìm được số đo**: chọn hằng số tắt 4 giây ở chuông 396 Hz (T60 ≈ 28 giây), chuông tiếng cao ngân ngắn hơn, mỗi tần số riêng tắt theo tỉ lệ nghịch tần số (vật có độ tổn hao không đổi).
- *Tanpura*: bốn dây Pa – Sa – Sa – Sa thấp (lên dây 5-8-8-1), gảy lần lượt, vòng 5 giây, đoạn lặp 20 giây liền mạch (tiếng ngân cuối đoạn cộng vòng về đầu). Jawari mô phỏng **gần đúng**: một đỉnh bồi âm trượt từ bậc 4 lên bậc 22 trong vài giây đầu mỗi lần gảy. Nhịp gảy chọn theo tai.
- Tạo đủ bảy đoạn đàn và bảy tiếng chuông mất ~0,7 giây trên máy tính (0,9 giây trong trình duyệt). Bản đầu mất 3,4 giây; viết dao động thẳng trong vòng lặp thay vì gọi hàm mỗi mẫu thì nhanh gấp năm.

**Cả buổi hẹn trước trên luồng âm thanh** ngay lúc bấm Bắt đầu (`lichBuoi`): bảy đoạn đàn chỉ chạy trong khoảng của mình, chuyển nhau trong 8 giây (đan tuyến tính, cộng lại vẫn đủ), mọi tiếng chuông đặt sẵn đúng giây — luôn rơi vào đầu một nhịp hít vào — và một mẫu lặng ở giây cuối báo hết buổi. Nhắm mắt, tắt màn hình, JS bị bóp cũng không lệch nhịp. Giữ chạy khi khoá màn hình giống nhạc ngủ; đang thiền thì app không tự tải lại bản mới (cả hai cùng báo `tdtd-ngu-het` khi tắt).

`scripts/test-luanxa.js`, 101 bài: nội dung khớp kinh văn (số cánh, chủng tử, màu cánh Maṇipūra xanh thẫm và Anāhata đỏ chứ không theo cầu vồng); đỉnh phổ của chuông đúng từng tần số riêng (lệch dưới 0,5%), nhịp ngân rung đo ra 1,6 Hz, độ tắt đo ra đúng hằng số đã chọn; mỗi dây đàn có đỉnh nốt rõ, đỉnh bồi âm jawari trượt từ bậc 6 lên bậc 20; lịch buổi đúng từng giây với cả bốn lựa chọn phút; trình phát đặt đúng từng mốc lên luồng âm thanh (Web Audio giả), tạm dừng, tắt, hết buổi tự về; hoa sen vẽ đúng số cánh; thiền riêng luân xa nào cũng chỉ có đàn và chuông của chính nó (kiểm cả bảy luân xa × bốn mức phút), trình phát nạp đúng đoạn đàn của luân xa đã chọn. Đã thử trong trình duyệt ở cỡ điện thoại: màn chọn, hoa sen từng luân xa, màn đang thiền đổi chữ theo nhịp thở, Worker tạo âm chạy được, bấm Tắt là đóng hẳn luồng âm thanh.

## Bầu trời đêm nay

Một ngôi sao xanh nhạt, `#troi-dem`. Mở ra là **bầu trời thật, ở chỗ bạn đang đứng, vào đúng lúc này**: Mặt Trời, Mặt Trăng, năm hành tinh mắt thường thấy được, 5.080 sao thật, dải Ngân Hà, và tám chòm sao mượn lại toạ độ thật của trò Nối sao. Kéo để nhìn quanh, chụm hai ngón để phóng to, hoặc bấm *Xoay theo máy* rồi giơ điện thoại lên — hướng máy về phía nào thì thấy bầu trời phía đó.

Đây là trò duy nhất trong app **kiểm chứng được bằng cách bước ra sân ngước lên**.

**Không mạng, không thư viện, không bảng tra sẵn.** Tất cả tính bằng công thức trong `assets/astro.js`:

| Cái gì | Lấy ở đâu |
|---|---|
| Mặt Trời, Mặt Trăng | Jean Meeus, *Astronomical Algorithms* (ấn bản 2, 1998), chương 25 và 47 |
| Năm hành tinh | Bảng phần tử Kepler của JPL, [Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html) |
| Giờ sao, độ cao, phương vị | Công thức chuẩn, Meeus chương 12–13 |
| Khúc xạ khí quyển gần chân trời | Công thức Bennett, Meeus chương 16 |

**Đo lại bằng nguồn ngoài, không tự chấm điểm.** `scripts/test-astro.js` đối chiếu với api.sunrise-sunset.org và lunaf.com:

| Kiểm | Kết quả |
|---|---|
| Mặt Trời mọc, lặn ở TP.HCM | lệch 1,1 và 1,2 phút |
| Chạng vạng dân dụng, hàng hải, thiên văn | lệch 0,2 phút |
| Bốn kỳ trăng non 2026 | lệch 1–3 phút |
| Bốn kỳ trăng tròn 2026 | lệch 3–32 phút |
| Sao Kim không rời Mặt Trời quá 47° | đo được 47,2° |
| Sao Bắc Cực đứng ở độ cao bằng vĩ độ | khớp, xê dịch 1,5° suốt đêm |

**Và một lần thử ngoài dự tính.** Hôm dựng xong trò này là 14/9/2026. Máy tính ra Sao Kim chỉ cách Mặt Trăng **0,48 độ** — sát tới mức nó nấp sau đĩa trăng, nhìn màn hình không thấy đâu. Tra lại thì hôm đó đúng là có **Mặt Trăng che Sao Kim** thật, thấy được từ châu Á, châu Phi, châu Âu, xảy ra lúc 08:30 UT. Máy không hề biết sự kiện này; nó chỉ giải phương trình. Nên chỗ đó được đổi thành một dòng nhắc: *"Sao Kim đang nấp ngay sau Mặt Trăng, cách 0,5°"*.

**Ba chỗ sửa khi vẽ.** Lưỡi liềm lúc đầu vẽ ngược — trăng 12% ra thành trăng khuyết gần tròn, vì tôi lấy sai dấu của nửa elip ranh giới sáng tối; đúng ra nó phải đi qua điểm `x = (1 − 2k)·r`. Bầu trời chạng vạng sáng quá nên đổi sang đường cong bình phương. Và quầng sáng quanh hành tinh vẽ thành một cục đặc, vì `mau.replace('rgb','rgba')` không ăn gì với chuỗi mã hex — phải tự đổi hex sang rgba mới đặt được độ mờ.

Bề sáng của Mặt Trăng luôn quay về phía Mặt Trời, nên ở vĩ độ Việt Nam lưỡi liềm **nằm ngang như cái thuyền** chứ không dựng đứng — cái đó ra được từ phép tính, không phải vẽ sẵn.

### Chiều sâu: sao thật, Ngân Hà, Mặt Trăng hình cầu

Người dùng hỏi *"phần trời đêm làm 3D được không"*. Về kỹ thuật nó vốn đã 3D — đứng giữa một thiên cầu, phép chiếu tâm, kéo hay xoay máy để nhìn quanh — nhưng nhìn phẳng: cả bầu trời chỉ có 50 sao của tám chòm, Mặt Trăng là một cái đĩa, mặt đất là một mảng tối. Giờ:

- **5.080 sao thật** tới cấp 6, lọc từ *Danh mục sao sáng Yale*, bản 5 (Hoffleit & Warren 1991, bản V/50 của [CDS Strasbourg](https://cdsarc.cds.unistra.fr/ftp/V/50/)) bằng `scripts/lam-saosang.py`, gói 8 ký tự mỗi sao vào `assets/saosang.js` (41 KB). Toạ độ J2000 được tính **tuế sai** về hôm nay (Meeus chương 21; tới 2026 sao đã trôi 0,36°, đủ để đường nối chòm lệch khỏi sao khi phóng to — nên chòm sao cũ cũng tính tuế sai theo).
- **Màu sao** theo chỉ số B−V (nhiệt độ theo Ballesteros 2012, ra màu theo cách xấp xỉ vật đen của Tanner Helland), pha nửa với trắng vì mắt người thấy màu sao rất nhạt.
- **Sát chân trời sao mờ đi** vì xuyên nhiều khí quyển: khối khí theo Kasten & Young (1989), mất 0,25 cấp mỗi khối. Sao sáng **lấp lánh**, sát chân trời lấp lánh mạnh hơn (tắt nếu máy bật giảm chuyển động).
- **Thấy tới đâu**: đêm tối không trăng thấy tới cấp 5 (ở thành phố mắt thường thường chỉ tới cấp 3–4); trời còn sáng, trăng sáng trên cao thì mất sao mờ; **chụm hai ngón để phóng to** (12°–110°, như cầm ống nhòm) thì thấy thêm sao tới cấp 6.
- **Ngân Hà**: không có ảnh chụp. 1.500 đám mờ rải dọc xích đạo thiên hà theo đúng toạ độ thiên hà (hằng số J2000 trên Wikipedia), dày về phía tâm thiên hà ở chòm Nhân Mã, sáng thêm ở mây sao Thiên Nga, bị vệt bụi tối Great Rift chẻ đôi từ Thiên Nga tới Bán Nhân Mã. Vị trí đúng; còn độ sáng từng vùng là phỏng theo mô tả, không phải đo.
- **Mặt Trăng hình cầu**: vẽ từng điểm ảnh, sáng theo định luật Lommel–Seeliger (bề mặt bụi: trăng tròn trông phẳng đều, không tối dần ra mép như quả bóng), mặt tối có ánh đất hắt lên. Các **biển** — vệt tối người Việt nhìn ra chú Cuội — lấy vị trí, đường kính từ bài *List of maria on the Moon* trên Wikipedia; biển méo dài (Biển Lạnh, Đại dương Bão tố) ghép vài vùng tròn, mép hơi gồ ghề. Đo trên ảnh trăng tròn: biển chiếm 37% đĩa (Wikipedia: biển phủ 16% toàn Mặt Trăng, hầu hết ở mặt gần, tức khoảng 30% mặt gần — trên đĩa nhỉnh hơn vì biển dồn về giữa). Kết cấu xoay theo cực Bắc hoàng đạo, vì trục Mặt Trăng chỉ lệch cực đó 1,5°. Phóng to thì trăng to theo.
- **Viền cây đồi** ở chân trời (cao nhất 2,7°, chỉ để có chiều sâu khi xoay — không phải cảnh chỗ bạn), **sương mù** sát chân trời vẽ theo độ cao thật, và **vầng cam** phía Mặt Trời vừa lặn lúc chạng vạng.

Ba lỗi bắt được khi tự xem: (1) phóng to rồi ngẩng lên thì cả nửa màn hình sáng thành một mảng — dải sương mù lấy cả điểm sát mép tầm nhìn, phép chiếu ném nó ra xa hàng vạn điểm ảnh; giờ chỉ lấy điểm nằm rõ phía trước, vẽ từng mảnh. (2) Trăng sáng 59% trông chưa tới một nửa — độ chiếu sáng chưa bù gamma của màn hình. (3) Các biển thoạt đầu chỉ chiếm 7% đĩa, trông như mấy đốm tròn; lần đo sau ra 5% là do chính phép đo bỏ qua điểm ảnh hơi trong suốt — và đó lại là lỗi thật: biển đang bị vẽ hơi trong suốt, sao phía sau lấp ló xuyên qua. Giờ phần được chiếu luôn đục.

Vẽ một khung mất dưới 1 ms trên máy tính: sao xếp từ sáng tới mờ và chia theo màu (mỗi màu đặt `fillStyle` một lần, gặp sao mờ hơn ngưỡng là dừng), vector chân trời của sao tính lại hai giây một lần, khung nhìn tính một lần mỗi hướng nhìn.

`scripts/test-astro.js` thêm 14 bài: tuế sai đúng ví dụ 21.b của Meeus tới 0,004 giây cung; tâm, đối tâm, cực thiên hà đúng bảng Wikipedia; khối khí quyển; nhiệt độ Mặt Trời từ B−V; năm sao đối chiếu toạ độ, cấp sáng, màu với danh mục. `scripts/test-troidem.js` thêm 14 bài: Sao Bắc Cực đứng ở độ cao bằng vĩ độ, Ngân Hà dày về tâm thiên hà, ngưỡng sao theo trăng, trời, độ phóng; chụm hai ngón; hướng xoay kết cấu trăng; vị trí các biển; vẽ mọi tư thế không nổ.

### Nhìn từ vũ trụ

Nút **Nhìn từ vũ trụ** dưới đáy màn Trời đêm đổi sang cảnh 3D thứ hai, cũng đúng vị trí **thật lúc này** (`assets/vutru.js`, không thư viện 3D: phép chiếu phối cảnh tự viết, quả cầu tô từng điểm ảnh bằng tia chiếu):

- **Trái Đất – Mặt Trăng.** Quả địa cầu có lục địa từ bản đồ *Natural Earth 1:110m* (public domain), đổi thành mặt nạ đất/biển 720 × 360 bằng `scripts/lam-datlien.py` (tô theo từng vĩ tuyến, luật chẵn lẻ), nén còn 10,6 KB trong `assets/datlien.js`. Trái Đất quay theo giờ sao: nửa quay về Mặt Trời là ban ngày, có dải chạng vạng mềm, biển loá nắng, viền khí quyển. **Chấm chỗ bạn đứng** ghi luôn "ban ngày" hay "ban đêm". Mặt Trăng ở đúng hướng của nó, nửa quay về Mặt Trời sáng — nhìn là hiểu vì sao đêm nay trăng khuyết — và luôn quay **cùng một mặt** về Trái Đất, dùng chung bản đồ biển với trăng ngoài trời. Mặt Trời ở rất xa: trong khung thì vẽ quầng, ngoài khung thì một mũi tên ở mép chỉ về phía nó. Khoảng cách Trái Đất – Mặt Trăng thật là 60 bán kính Trái Đất, vẽ thật thì trăng chỉ còn một chấm, nên **kéo lại gần 15 lần** và nói rõ trên màn; kích cỡ hai quả cầu đúng tỉ lệ.
- **Hệ Mặt Trời.** Sáu hành tinh trên quỹ đạo theo bảng phần tử Kepler của JPL (đã dùng cho vị trí hành tinh trên trời). Khoảng cách tới Mặt Trời **nén theo căn bậc hai** (Sao Thổ xa gấp 25 lần Sao Thuỷ, vẽ thành 5 lần), hành tinh phóng to cho dễ thấy, nửa quay về Mặt Trời sáng. Dòng chữ nói Sao Kim, Sao Thuỷ đang ở phía Đông hay phía Tây Mặt Trời — tức đang là **Sao Hôm** (thấy lúc chiều tối) hay **Sao Mai** (thấy lúc rạng sáng).
- Kéo để xoay, chụm hai ngón (hoặc lăn chuột) để phóng to; nút **Tua** cho thời gian chạy nhanh (1 giờ hay 1 ngày mỗi giây ở cảnh Trái Đất; 1 hay 10 ngày mỗi giây ở Hệ Mặt Trời) để thấy Trái Đất quay, Mặt Trăng đi quanh, hành tinh chạy trên quỹ đạo. Sao nền là 1.500 sao sáng nhất của cùng danh mục, đúng hướng thật.

Ba chỗ sửa khi tự xem: Siberia trắng xoá vì băng tô cho mọi vùng đất trên 64° — giờ chỉ Nam Cực và vùng trên 70° Bắc; Sao Thổ bị cắt ngoài mép và tên các hành tinh gần Mặt Trời đè lên nhau — giờ góc nhìn theo cạnh ngắn của màn, ghi tên theo thứ tự ưu tiên và tránh chỗ đã có chữ; mũi tên chỉ Mặt Trời rơi vào khối chữ dưới đáy — giờ chỉ nằm trong vùng trống.

`scripts/test-troidem.js` thêm 12 bài: mặt nạ đất đúng ở 8 điểm đã biết; chấm chỗ bạn đứng khớp độ cao Mặt Trời ngoài trời suốt 48 giờ (đã thử đảo chiều quay Trái Đất: bài kiểm bắt ngay); phần trăng được chiếu khớp phần đĩa sáng ngoài trời; trăng quay đúng mặt gần; Sao Kim không quá 48°, Sao Thuỷ không quá 28° khỏi Mặt Trời; máy quay, nút tua, giới hạn phóng; vẽ hai cảnh không nổ.

### "Không cho thấy sao hoặc trăng ở dưới chân trời hả", "chỉ thấy hướng Mặt Trời"

Bốn chỗ người dùng chỉ ra sau khi xem, đều đúng:

- **Mặt đất đen đục che mất mọi thứ dưới chân trời.** Trước đó Mặt Trăng, Mặt Trời, hành tinh đã lặn hiện mờ xuyên qua đất; lần thêm viền cây đồi đã tô đất đục 94% và che luôn. Giờ phần dưới chân trời vẽ **sau** mặt đất, bằng chính hình của nó nhưng mờ đi — Mặt Trăng vẫn đúng hình khuyết — kèm chữ "dưới chân trời", cùng sao sáng tới cấp 4,3 và đường chòm sao. Đó là bầu trời của phía bên kia Trái Đất, nên ban ngày ở đây vẫn thấy sao dưới đất là đúng: bên đó đang đêm.
- **Cúi xuống thì đất chỉ còn một dải mỏng, bên dưới lại là màu trời** — lỗi có từ bản đầu: đất tô bằng đa giác nối các điểm chân trời theo phương vị 0° → 360°, nhìn về hướng Bắc thì chuỗi điểm gãy đôi giữa màn và đa giác tự cắt. Giờ dùng một tính chất của phép chiếu tâm: đường chân trời thật là vòng tròn lớn nên luôn hiện thành **đường thẳng nằm ngang**, ở y = H/2 + ti·tan(độ ngẩng); đất là cả phần màn bên dưới. Viền cây đồi vẽ riêng thành dải, đi từ sau lưng vòng ra trước cho các điểm luôn liền.
- **Trời ban ngày có ba sọc ngang, đất đen kịt — "trắng đen".** Sương mù chân trời giờ là 16 dải mỏng giảm dần theo hàm mũ, không còn bậc; đất ban ngày xanh lá sẫm, đêm xanh đen.
- **Ở cảnh vũ trụ chỉ thấy mũi tên chỉ hướng Mặt Trời.** Mặt Trời cách 23.500 lần bán kính Trái Đất, không kéo lại gần được như Mặt Trăng mà không sai. Giờ **chạm vào mũi tên** thì máy quay xoay ra phía sau Trái Đất, lệch 16° với hướng Mặt Trời: thấy Mặt Trời đúng cỡ thật (0,53° — bằng Mặt Trăng nhìn từ Trái Đất, vì nó to gấp chừng 400 lần mà xa gấp chừng 400 lần), còn Trái Đất thành hình lưỡi liềm. Bản đầu vẽ Mặt Trời thành quầng to 80 điểm ảnh — sai cỡ.

Soát lại cảnh vũ trụ còn thấy ba chỗ sai và sửa: **vành Sao Thổ** vẽ thành elip nghiêng cố định — giờ nằm trong mặt phẳng xích đạo thật, trục theo IAU (xích kinh 40,589°, xích vĩ 83,537°), kiểm lại ra đúng độ nghiêng 26,73° so với quỹ đạo; **lớp khí quyển** quanh Trái Đất phủ một lớp xanh 35% lên cả quả cầu (gradient tròn tô phần bên trong vòng đầu bằng màu mốc 0) nên mặt đêm ra xanh nhạt; **tên hành tinh** lúc Sao Kim sát Trái Đất bị tráo chỗ cho nhau — giờ coi các hành tinh là chỗ đã chiếm, tên dời chỗ thì kẻ vạch nối về hành tinh.

Người dùng cũng hỏi Mặt Trăng có tự quay không: có — mỗi vòng quanh Trái Đất (27,3 ngày) nó tự quay đúng một vòng, nên luôn quay một mặt về phía ta. Mô hình vốn làm đúng vậy (kết cấu trăng luôn hướng kinh độ 0 về Trái Đất) nhưng không nói ra; giờ dòng chữ ở cảnh vũ trụ nói rõ, và bấm Tua là thấy. Chưa vẽ sự lắc nhẹ (bình động) khiến ta thấy thêm chừng 9% bề mặt.

`scripts/test-troidem.js` thêm 7 bài: đường chân trời ở đúng chỗ khi nhìn ngang, cúi xuống, cúi hẳn; Mặt Trăng dưới đất vẫn vẽ và chạm được; chạm mũi tên thì máy quay xoay tới khi Mặt Trời nằm trong khung; trục vành Sao Thổ nghiêng 26,73°.

### "Kích thước đúng hết chưa, về độ to nhỏ"

Chưa. Soát lại với số liệu của NASA ([Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/), [Sun Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html), [Saturnian Rings Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/satringfact.html)):

| Cảnh | To nhỏ | Khoảng cách |
|---|---|---|
| Trái Đất – Mặt Trăng | đúng: Mặt Trăng rộng 0,27 lần Trái Đất; Mặt Trời đúng cỡ nhìn thấy 0,53° | Mặt Trăng kéo lại gần 15 lần — có ghi |
| Hệ Mặt Trời | **sai, không nói ra**: cỡ đặt tay, Sao Mộc chỉ gấp 1,6 lần Trái Đất (thật 11,2), Mặt Trời 1,6 lần (thật 109) | nén căn bậc hai — có ghi |
| Bầu trời | Mặt Trăng, Mặt Trời vẽ to hơn thật chừng 15 lần — **không nói ra** | — |

Một hình không thể vừa đúng to nhỏ vừa đúng khoảng cách (Trái Đất chỉ bằng chừng 1/23.500 bề rộng quỹ đạo của nó — bản đầu ghi 1/11.700, nhầm bán kính với bề rộng). Nên:

- **Cảnh mới "So kích thước"** (bấm nút đổi cảnh lần thứ hai): Mặt Trời, sáu hành tinh và Mặt Trăng đặt cạnh nhau, **cùng một tỉ lệ** theo đường kính NASA. Mặt Trời to tới mức chỉ thấy một cung ở trên cùng; Sao Thổ có cả vành, đúng cỡ theo bảng vành (vành B từ 1,526, vành A tới 2,270 lần bán kính, có khe Cassini); dưới mỗi cái ghi "gấp mấy lần Trái Đất". Kéo lên xuống, chụm để phóng.
- **Hệ Mặt Trời**: cỡ nén theo căn bậc ba của đường kính thật — một quy tắc cho tất cả, kể cả Mặt Trời — nên thứ tự to nhỏ đúng (Mặt Trời > Mộc > Thổ > Đất > Kim > Hoả > Thuỷ), Mặt Trời vẫn nằm gọn trong quỹ đạo Sao Thuỷ; dòng chữ nói rõ cách nén và chỉ sang cảnh So kích thước.
- **Bầu trời**: thẻ Mặt Trăng, Mặt Trời ghi *"trên màn vẽ to gấp N lần thật cho dễ thấy (thật rộng 0,5°)"*, N tính theo độ phóng lúc đó (chừng 16 ở góc thường, 9 khi phóng hết cỡ).

Lúc thêm cỡ mới, tên Trái Đất bị mất hẳn: Mặt Trời to ra chiếm chỗ, sáu chỗ thử ghi tên đều vướng. Giờ chỗ thử tỏa xa dần theo tám hướng, dời xa thì kẻ vạch nối, và riêng tên Trái Đất không bao giờ bị bỏ.

`scripts/test-troidem.js` thêm 8 bài: mọi bán kính ở cảnh So kích thước đúng tỉ lệ đường kính NASA; xếp dọc không chồng; thứ tự to nhỏ ở Hệ Mặt Trời; thẻ Mặt Trăng ghi đúng "to gấp N lần", phóng to thì N nhỏ lại.

### "Hệ Mặt Trời đầy đủ chưa hay thiếu"

Thiếu. Cảnh "Hệ Mặt Trời" và "So kích thước" chỉ có 6/8 hành tinh — dừng ở Sao Thổ, không có Thiên Vương, Hải Vương — mà trên màn không nói gì; bảng quỹ đạo trong `astro.js` cũng bỏ hai hàng đó dù bảng JPL có sẵn. Bốn người soát độc lập (độ đầy đủ, số liệu, chữ trên màn, code và test), mỗi phát hiện có một người kiểm chứng lại; 43 phát hiện đứng vững. Số liệu đang có thì đúng: bảng quỹ đạo khớp JPL 72/72 số, đường kính khớp NASA. Làm xong lại cho bốn người soát độc lập đọc bản sửa (thiên văn, chạy trên màn, chữ và số liệu, bài kiểm): 32 phát hiện đứng vững, đã sửa — các ý bên dưới là bản sau cùng. Đã làm:

- **Đủ tám hành tinh.** Thêm Thiên Vương, Hải Vương (bảng 1 của JPL, 1800–2050) vào `astro.js` và cảnh Hệ Mặt Trời. Nén căn bậc hai cũ làm quỹ đạo Hải Vương tràn hai mép điện thoại, nên khoảng cách giờ nén theo luỹ thừa 0,4 (Hải Vương xa gấp 78 lần Sao Thuỷ, vẽ thành 5,7). Cả hệ đặt vào khoảng trống thật giữa nút đóng và khối chữ ở đáy (nightsky.js đo rồi đưa vào), vừa trên 4 cỡ màn đã thử.
- **Vành đai tiểu hành tinh** giữa Sao Hoả và Sao Mộc (2,06–3,28 đvtv, hai khe Kirkwood): 700 chấm, mỗi chấm đi đúng tốc độ quỹ đạo ở khoảng cách của nó — bấm Tua là thấy vành trong quay nhanh hơn vành ngoài. Tua có thêm mức 100 ngày mỗi giây (Hải Vương đi một vòng mất 165 năm, ở mức này chừng mười phút). Quá năm 2050 — hết bảng 1 của JPL — `astro.js` tự đổi sang bảng 2a + 2b (3000 TCN – 3000), nên tua đi được hết vòng Hải Vương; đối chiếu Horizons năm 2390, bảng dài hạn lệch 0,14–0,18°, còn cứ kéo dài bảng 1 ra thì lệch tới 1,1°. Quá năm 3000 thì quay về hôm nay.
- **Mặt Trời co giãn theo khi phóng.** Bản trước vẽ Mặt Trời một cỡ cố định bằng điểm ảnh, thu nhỏ là nó che hết quỹ đạo Sao Thuỷ. Giờ mọi cỡ đo bằng cùng đơn vị với khoảng cách; Mặt Trời luôn nằm trong chỗ gần nhất của quỹ đạo Sao Thuỷ. Mặt Trời cũng được xếp theo độ xa như hành tinh, hết cảnh hành tinh phía sau đè lên đĩa của nó.
- **So kích thước: 14 quả cầu.** Thêm Thiên Vương, Hải Vương, hai hành tinh lùn (Diêm Vương, Ceres) và hai mặt trăng to hơn cả Sao Thuỷ (Ganymede của Sao Mộc, Titan của Sao Thổ). Cỡ cả khối tính để vừa khoảng trống trên khối chữ; màn thấp quá (iPhone SE) thì giữ cỡ tối thiểu — Trái Đất không dưới 2,5 điểm ảnh — phần dưới mờ dần và có dòng "kéo lên để xem tiếp". Xoay máy thì tính lại cỡ.
- **Chạm một hành tinh để xem thông tin.** Ở cảnh Hệ Mặt Trời: lúc này (hay đúng ngày đang tua tới) cách Mặt Trời bao xa (đvtv, triệu km, nắng đi mất bao lâu), cách Trái Đất bao xa, to gấp mấy (nhỏ hơn thì "chỉ bằng"), một vòng quanh Mặt Trời (chu kỳ so với sao — Hải Vương 164,8 năm), một ngày dài bao lâu, nhiệt độ trung bình (fact sheet của NASA). Ở So kích thước: đường kính thật và cùng các số đó. Vật đang chọn có vòng sáng, quỹ đạo sáng lên; chạm chỗ trống để bỏ chọn. Vùng chạm Sao Thổ là elip ôm vành (hình tròn thì trùm cả chữ "Sao Mộc"); hành tinh đang nấp sau Mặt Trời thì không chạm trúng.
- **Sao Hôm / Sao Mai nói đúng lúc thấy, lúc không.** Bản trước không xét chuyện đứng quá sát Mặt Trời: quanh 24/10/2026 Sao Kim ở giữa Trái Đất và Mặt Trời mà app vẫn ghi "thấy lúc rạng sáng" ở 0°. Giờ ghi góc thật tới Mặt Trời; dưới 10° (Sao Kim) hay 14° (Sao Thuỷ) thì báo "chìm trong nắng, không thấy được", kèm đang ở giữa Trái Đất và Mặt Trời hay ở phía bên kia. Dòng Sao Thuỷ (tính xong mà bị bỏ) giờ hiện cùng Sao Kim.
- **Mặt Trăng trên bầu trời trừ thị sai chỗ đứng** (Meeus chương 40). Bản trước tính từ tâm Trái Đất nên Trăng luôn cao hơn thật — tới gần 1° lúc sát chân trời. `thiSai` khớp Horizons tới 0,3 giây cung khi cùng đầu vào; phần lệch còn lại là sai số của chính công thức Mặt Trăng rút gọn: trung bình 0,1°, có lúc tới 0,3° — ngang bán kính đĩa trăng. Vì thế câu báo hành tinh sát Mặt Trăng không tách "bị che" với "sát mép" nữa: trong phạm vi bán kính + 0,2° nó nói "đang bị Mặt Trăng che, hoặc ngay sát mép" (đúng vụ che Sao Kim 14/9/2026 theo Horizons), và Trăng đã lặn thì thôi báo. Ngưỡng mọc lặn tính theo thị sai từng lúc, nên dòng trạng thái khớp giờ mọc lặn in bên cạnh.
- **Hành tinh cùng hệ toạ độ với sao.** Bảng JPL cho toạ độ J2000, còn Mặt Trời, Mặt Trăng, sao thì theo ngày đang xem; để nguyên thì hành tinh lệch 0,37° so với sao nền. Giờ đổi sang xích đạo J2000 rồi tính tuế sai về ngày đó: đối chiếu Horizons ngày 14/10/2026, bảy hành tinh lệch 0,1–1,6 phút cung, riêng Sao Thổ 4,6′ (trong sai số bảng JPL).
- Chữ dưới đáy không còn bị hàng nút đè (hàng nút xuống dòng, khối chữ đặt theo chiều cao đo được, cảnh Hệ Mặt Trời dời và co giãn êm theo); hai cảnh gọi tên tuần trăng chung một cách (`astro.js tenTrang`); "Không hành tinh nào trên trời" thành "không hành tinh nào nhìn được bằng mắt thường"; sửa bài kiểm phóng to (từ khi có cảnh thứ ba nó không kiểm gì) và bài chạm chọn (nó chạm vào Sao Thổ ngoài mép màn, chỉ đỗ nhờ đúng cái lỗi lệch 0,37°). Hai tệp test đặt cứng múi giờ Việt Nam.

Còn lại, chấp nhận: lúc Sao Kim đi giữa Trái Đất và Mặt Trời (chừng 25 ngày mỗi 19 tháng), hai quả cầu Kim – Đất chạm nhau trên sơ đồ — cỡ đã phóng to theo căn bậc ba mà khoảng cách thì nén mạnh; thu nhỏ hành tinh tới mức hết chạm thì chúng chỉ còn hai điểm ảnh.

Bầu trời đêm vẫn chỉ vẽ năm hành tinh mắt thường thấy — đó là chủ ý. `scripts/test-astro.js` từ 73 lên 80 bài, `scripts/test-troidem.js` từ 117 lên 157 bài: đối chiếu Horizons (bảy hành tinh, năm 2120 và 2390, thị sai ở TP.HCM và Hà Nội, vụ che Sao Kim 14/9/2026), trạng thái Trăng khớp giờ mọc lặn từng nửa phút, vừa màn ở 4 cỡ, cỡ tối thiểu ở 5 cỡ, Mặt Trời không che Sao Thuỷ ở mọi độ phóng, chạm chọn, Sao Kim lúc giao hội dưới và trên, đổi cảnh khi đang tua… Thử phá code ở 20 chỗ, bài kiểm bắt cả 20.

### Hiệu ứng toàn cảnh

"Mô phỏng hiệu ứng toàn cảnh" — không làm ngôi sao mới mà là **một chức năng nhỏ trong phần Nhìn từ vũ trụ**: nút **Hiệu ứng toàn cảnh** chỉ hiện khi đang ở cảnh vũ trụ, bấm vào thì phủ lên một hành trình chừng ba phút rưỡi (`assets/toancanh.js`). Bấm ✕ hoặc phím Esc thì về lại đúng cảnh vũ trụ đang xem, bầu trời chạy tiếp (lúc hành trình mở, vòng vẽ bầu trời bên dưới tạm dừng cho đỡ tốn pin).

Đọc trước khi làm: *hiệu ứng toàn cảnh* (overview effect) là tên Frank White đặt năm 1987 sau khi phỏng vấn phi hành gia — cảm giác kinh ngạc, xúc động khi lần đầu thấy cả Trái Đất từ vũ trụ. Yaden và cộng sự (*Psychology of Consciousness*, 2016) mô tả nó là một dạng kinh ngạc (awe) vượt khỏi bản thân: thấy đẹp, thấy Trái Đất mong manh, thấy mình gắn với mọi người. Stepanova và cộng sự (*Frontiers in Digital Humanities*, 2019) làm thực tế ảo về hiệu ứng này và thấy người xem cần thấy an toàn, thấy nơi quen thuộc của mình, có chút hồi hộp. Nên hành trình bắt đầu **từ chính chỗ bạn đứng** và đi ra xa dần:

1. **Rời mặt đất** — được nâng thẳng lên từ chỗ bạn, 30 km tới 417 km: chân trời tụt dần và cong dần.
2. **Trên quỹ đạo** — độ cao 417 km, nghiêng 51,64°, vòng 92,9 phút, 7,67 km/s như Trạm Vũ trụ Quốc tế, tua nhanh 100 lần; đi ngang qua ngày, chạng vạng, đêm có đèn thành phố.
3. **Lớp áo mỏng** — nhìn sát viền: toàn bộ khí quyển mỏng như lớp vỏ táo.
4. **Không có biên giới** — thôi bay ngang, bay thẳng lên từ 417 km tới 9.000 km ngay trên chỗ bạn, thấy cả một mặt địa cầu.
5. **Từ phía Mặt Trăng** — tới đúng chỗ Mặt Trăng đang ở **lúc này**; Trái Đất nhìn từ đó khuyết đúng bằng phần đang được chiếu sáng, rộng chừng 1,9°.
6. **Chấm xanh mờ** — lùi tới 6,06 tỉ km, chỗ Voyager 1 chụp tấm *Pale Blue Dot* năm 1990.
7. **Nhìn lại** — vài dòng kết, nút xem lại.

Cái gì thật, cái gì không — ghi cả trên màn:

- **Thật lúc này:** ngày đêm trên Trái Đất (Mặt Trời theo `astro.js`), vị trí và pha Mặt Trăng, chỗ bạn đứng (nơi đã chọn trong Trời đêm, chưa chọn thì TP.HCM).
- **Ảnh của NASA** (Visible Earth, dùng tự do) trong `assets/traidat/`, làm bằng `scripts/lam-traidat.py`, giữ cỡ to nhất nguồn có (trần 4096 cho điện thoại nào cũng nạp được): mặt đất Blue Marble Next Generation tháng 7/2004, 4096 × 2048 (595 KB, 10 km mỗi điểm ảnh); mây ghép từ vệ tinh năm 2002, 2048 × 1024 (393 KB, nguồn chỉ có cỡ này) — **không phải mây hôm nay**; đèn ban đêm Black Marble 2016, 3600 × 1800 (160 KB). Ảnh chỉ tải khi mở hành trình, không nằm trong bộ nhớ đệm cài sẵn.
- **Ảnh chi tiết quanh chỗ bạn**, tải lúc mở từ GIBS, máy chủ ảnh công khai của NASA (không cần khoá, cho trang khác dùng): một ô 10° × 10°, 2048 điểm ảnh (chừng 540 m mỗi điểm) — Blue Marble Next Generation 500 m nếu ở chỗ bạn đang là ngày, Black Marble nếu đang là đêm, chạng vạng thì cả hai; mỗi ảnh 190–300 KB, cất lại trong kho riêng `tdtd-nasa` nên mở lại ở cùng chỗ khỏi tải. **Tâm ô làm tròn tới 1 độ** (chừng 110 km): máy chủ NASA chỉ biết bạn ở vùng nào. Mất mạng thì vẫn vẽ bằng ảnh có sẵn.
- **Quỹ đạo:** số liệu đúng của Trạm Vũ trụ Quốc tế nhưng đặt cho đi ngang qua chỗ bạn — **không phải** vị trí thật của trạm.
- **Khí quyển:** mật độ giảm theo hàm mũ (thang độ cao 8 km, vỏ 100 km), độ dày tia đi qua tính bằng xấp xỉ Chapman; xanh khi nắng chiếu thẳng, cam đỏ ở dải hoàng hôn. Gần đúng, không phải mô phỏng tán xạ đầy đủ.
- Không thư viện 3D: mỗi điểm ảnh màn hình một tia chiếu, chạy trên card đồ hoạ (WebGL2, mã tự viết); máy không có WebGL2 thì lùi về bản tô bằng bộ xử lý ở độ phân giải thấp. Đo trên máy bàn 60 khung hình mỗi giây ở cỡ điện thoại; máy yếu (dưới chừng 38 khung) tự giảm số điểm ảnh phải tô, tới một nửa là thôi.

Ba chỗ sửa khi tự xem: ở xa, viền Trái Đất lốm đốm như chuỗi hạt vì tia chiếu bắt hụt lớp khí mỏng — giờ xa thì vẽ viền bằng nét liền; từ phía Mặt Trăng, Trái Đất sáng 88% mà biển đen như ban đêm — thêm màu tán xạ của khí quyển phía ban ngày; một lần bấm Esc đóng luôn cả Trời đêm — giờ hành trình nhận phím trước và đánh dấu đã xử lý, Trời đêm thấy vậy thì bỏ qua.

#### "Hình bị mờ"

Hai nguyên nhân chồng lên nhau, đo được chứ không đoán:

- **Tô thô rồi phóng lên.** Bản đầu tô bằng bộ xử lý, tối đa 60 nghìn tia mỗi khung: trên điện thoại 375 × 812 mỗi tia phủ chừng 2,2 điểm ảnh CSS, tức 4–7 điểm ảnh thật. Mép Trái Đất, dải khí quyển, mây đều nhoè. Giờ vẽ trên card đồ hoạ: mỗi điểm ảnh một tia, ảnh lọc theo mipmap (ở xa không lấm tấm) và lọc dị hướng (mặt đất sát chân trời bị nén dẹt vẫn nét), mép đĩa Trái Đất làm mịn theo phần điểm ảnh nằm trên đĩa. Kinh tuyến 180° không thành đường kẻ nhờ lấy đạo hàm của bản toạ độ dời nửa vòng (cách của Tarini). Toạ độ tính theo hướng từ máy tới tâm Trái Đất, không trừ hai số to gần bằng nhau, để số 32 bit của card đồ hoạ vẫn đủ chính xác khi máy lùi ra tới Mặt Trăng. So bản card đồ hoạ với bản bộ xử lý trên cùng một khung, lấy trung bình từng ô của lưới 12 × 24: ở chặng quỹ đạo lệch 0/255, chỉ lệch ở vùng quanh chỗ bạn — nơi giờ dùng ảnh chi tiết.
- **Ảnh nguồn quá thô ở gần.** Ở chặng đầu, mặt đất phía dưới màn chỉ cách 30–200 km; ảnh 10–20 km mỗi điểm ảnh thì một điểm nguồn phủ cả chục điểm màn hình — card đồ hoạ cũng không làm nét được. Nên tải thêm ảnh 500 m của NASA cho riêng vùng quanh chỗ bạn (người dùng chọn cách này). Trong ô đó, lớp mây 20 km của năm 2002 mỏng còn 30%, kẻo phủ vệt nhoè lên ảnh nét; sát mép ô mờ dần sang ảnh thường trong 0,6°, không thấy đường ranh.

#### "Cảm giác đang bay ngang và lên chứ không phải bay lên — thực tế là vậy à?"

Thực tế đúng là tên lửa bay ngang nhiều hơn bay lên: muốn ở lại trên quỹ đạo phải chạy ngang gần 8 km mỗi giây. Theo RussianSpaceWeb (Anatoly Zak), tầng ba đưa tàu Soyuz vào quỹ đạo ở độ cao 205–208 km, **cách bãi phóng 1.640 km**, chưa tới 9 phút sau khi rời bệ.

Nhưng chặng này không mô phỏng tên lửa — máy được nâng thẳng lên, đứng đúng trên đầu bạn. Cảm giác "bay ngang" là do máy quay: nó cúi dần từ 9° xuống 30° đúng lúc chân trời chúc xuống (5,6° ở 30 km, 20,2° ở 417 km). Hai cái bù nhau, chân trời đứng yên trên màn, chỉ có mặt đất trôi xuống — đúng hình ảnh khi bay tới. Giờ máy quay giữ nguyên góc cúi 10° suốt chặng: chân trời từ trên giữa màn 4,4° tụt xuống dưới giữa màn 10,2°, cong dần, mặt đất co về phía dưới. Người dùng chọn giữ cách bay thẳng lên cho dễ hình dung; lời dẫn thêm một dòng về đường bay thật của Soyuz. Lời dẫn mỗi lúc chỉ hiện hai dòng mới nhất, vì bốn dòng chồng lên nhau che mất Trái Đất trên màn điện thoại.

#### "Độ cao chỗ này không tăng lên à, hay bay ngang?"

Bay ngang, và đúng là vậy: lên tới quỹ đạo thì trạm không lên cao nữa mà lao ngang 7,67 km mỗi giây — vừa rơi về phía Trái Đất vừa trượt qua nó, nên độ cao gần như không đổi (trạm thật dao động 413–422 km). Lời dẫn chặng này giờ nói thẳng điều đó.

Ảnh người dùng gửi còn cho thấy một chỗ sai khác: màn tối đen trong khi dòng chữ nói "ánh vàng phía đêm là đèn các thành phố". Lúc đó trạm (tua nhanh 100 lần) đang qua Thái Bình Dương ban đêm — giữa biển không có đèn, tối đen là đúng, chữ thì sai. Giờ khi dòng ấy hiện, app bắn 7 × 7 tia trong khung hình, đếm điểm đang là đêm trên đất liền, đêm trên biển hay ban ngày (đất, biển theo bản đồ Natural Earth), rồi chọn câu: đêm trên đất thì chỉ đèn bên dưới, đêm trên biển thì nói rõ tối vì không có thành phố, còn lại thì nói chung. Dòng đã hiện thì giữ nguyên chữ, không nhảy qua lại khi bay qua bờ biển.

#### "Lỡ một người ở nơi khác thì có ghi TP.HCM là chỗ bạn đang ngồi không?"

Có — đó là lỗi. Hành trình lấy nơi đã chọn trong Trời đêm; bấm "Để sau" thì không có nơi nào, app lấy TP.HCM, và chặng cuối ghi "TP.HCM — chỗ bạn đang ngồi — nằm trên chấm sáng ấy" với cả người ở Hà Nội hay ở nước ngoài. Trong khi chính Trời đêm ghi trung thực là "Xem tạm TP.HCM". Còn chọn vị trí máy thì ra câu lặp "Chỗ bạn đang đứng — chỗ bạn đang ngồi —". Giờ lời theo ba trường hợp: chọn thành phố thì gọi tên thành phố là nơi bạn ở; vị trí máy thì "từ ngay chỗ bạn đứng", "chỗ bạn đang ngồi lúc này"; chưa chọn thì nói là xem tạm TP.HCM, và câu cuối thành "dù bạn đang ngồi ở đâu, chỗ ấy cũng nằm trên chấm sáng này".

#### "Phải giải thích bay ngang chứ, vì mặc định mọi người nghĩ bay thẳng"

Người xem hỏi "hiệu ứng toàn cảnh có khúc bay ngang hả?", rồi "nếu bay ngang thì khi nào bay lên". Hành trình có hai khúc bay lên (chặng 1: 30 → 417 km; chặng 4: lên tiếp) kẹp một khúc bay ngang (chặng 2–3, trên quỹ đạo), nhưng màn không nói lúc nào đổi kiểu, và giữa chặng 3 với chặng 4 chỉ là tối rồi sáng: đang bay ngang ở 417 km, mở mắt ra đã ở 1.200 km. Giờ:

- **Báo trước và giải thích ngay lúc đổi.** Cuối chặng 1: "Tới đây thì thôi bay lên — chặng sau bay ngang." Đầu chặng 2: "Vì sao giờ lại bay ngang? Ở độ cao này mà đứng yên thì sẽ rơi thẳng xuống đất", rồi: phải lao ngang 7,67 km mỗi giây, vẫn rơi nhưng luôn trượt qua mép Trái Đất nên rơi mãi không chạm đất — đó là quỹ đạo. Đầu chặng 4: "Thôi bay ngang. Giờ bay thẳng lên, ngay trên chỗ bạn, nhìn thẳng xuống."
- **Dòng số nhỏ trên cùng ghi luôn đang bay kiểu gì:** "độ cao 94 km · đang bay thẳng lên", "độ cao 417 km · đang bay ngang 7,67 km/giây · tua nhanh 100 lần", "độ cao 2.518 km · đang bay thẳng lên", "cách tâm Trái Đất 172.129 km · đang bay ra xa".
- **Chặng 4 nối liền từ 417 km** thay vì nhảy lên 1.200 km. Bản đầu bắt đầu ở 1.200 km vì thấp hơn thì ảnh 10 km mỗi điểm nhoè khi nhìn thẳng xuống; giờ ngay dưới chỗ bạn có ảnh chi tiết 500 m, nhìn từ 417 km vẫn nét (thử trên màn điện thoại: miền Nam rõ sông, bờ biển, vòng vàng đánh dấu TP.HCM).

Người dùng còn muốn "câu kiểu chào mừng bạn đến với chuyến bay cho vui nhộn": mở đầu như tiếp viên hàng không, chặng cuối cảm ơn "quý khách đã bay cùng chúng tôi — thật ra bạn chưa từng rời khỏi chấm sáng ấy". Bản đầu đặt số hiệu tự chế "TĐ-417"; người dùng hỏi "sao không lấy tàu Apollo" — nhưng Apollo chỉ đúng ở chặng Mặt Trăng: các chuyến Apollo (1968–1972) chỉ quay vòng Trái Đất chừng 185 km chứ không ở 417 km (độ cao của Trạm Vũ trụ Quốc tế, lắp từ 1998), và xa nhất người từng tới là chừng 400.000 km (Apollo 13), còn 6 tỉ km là tàu không người lái Voyager 1. Người dùng chọn gắn mỗi chặng đúng một chuyến có thật: câu chào "Chuyến bay hôm nay ghép từ ba chuyến có thật: Trạm Vũ trụ Quốc tế, Apollo 8, Voyager 1", rồi chặng quỹ đạo, chặng Mặt Trăng, chặng 6 tỉ km mở đầu bằng "Chặng của …". Chặng cuối giờ nói "xa bằng chỗ Voyager 1 quay lại chụp" — máy quay chỉ lùi ra đúng khoảng cách, không đi đúng hướng tàu đã bay.

#### "Sao lại hiển thị câu trước chồng lên câu sau, chữ nhảy khó đọc"

Hai lỗi chồng lên nhau. Lời dẫn giữ hai dòng mới nhất: câu mới tới thì câu cũ bị đẩy lên trên, cả khối chữ nhảy, hai câu sát nhau như chồng lên nhau. Và nhiều câu không đứng đủ lâu để đọc: đo bằng chừng 4 từ mỗi giây cộng 1,2 giây để mắt tìm tới chữ, chặng 1 cần 35 giây chữ mà chỉ dài 22 giây — câu chào 41 từ chỉ đứng 3,5 giây; câu kể của phi hành gia Ả Rập Xê Út cần 11 giây mà có 8.

Giờ mỗi lúc **một câu**: câu cũ mờ đi trong 0,35 giây rồi câu mới hiện dần đúng chỗ đó (thử trên màn điện thoại: luôn một đoạn, mép dưới đứng yên). Chặng 1 dài 38 giây, chặng 4 dài 30 giây, mốc từng câu chia lại; vài câu rút gọn (câu chào, câu "từ 30 km trời đã đen", câu "xem tạm vì chưa chọn nơi ở"). Bài kiểm mới đo mọi câu ở mọi chặng, với cả ba kiểu nơi ở và ba kiểu câu về đèn: câu nào đứng ít hơn thời gian đọc là hỏng — lần đầu chạy nó bắt ngay câu thứ hai của chặng 1 (bản "xem tạm") thiếu 1 giây. Cả hành trình giờ chừng ba phút rưỡi.

`scripts/test-toancanh.js`, 83 bài: quỹ đạo đi đúng qua chỗ bạn, đang lên phía bắc, độ cao không đổi, vĩ độ cao nhất đúng 51,64°, chu kỳ, vận tốc; chân trời từ 417 km thấp hơn mặt phẳng ngang khoảng 20,2°; tỉ lệ mật độ khí giữa 5 km và 60 km đúng e^(55/8); màu trời xanh, hoàng hôn cam, đêm tối; ngày, đêm, đèn, mây với ảnh giả; dòng thời gian các chặng; khoảng cách máy quay tới Mặt Trăng và tới 6,06 tỉ km; Trái Đất rộng 1,9° nhìn từ Mặt Trăng; nút chỉ hiện ở cảnh vũ trụ, không thành ngôi sao riêng, vòng vẽ bầu trời dừng và chạy lại, phím Esc không rơi xuống Trời đêm; máy quay chặng đầu giữ nguyên góc, chỉ đi lên, chân trời tụt từ trên xuống dưới giữa màn; cỡ ba ảnh trong app (đọc từ tệp JPEG); vẽ bằng card đồ hoạ cùng công thức với bản bộ xử lý, có mipmap, lọc dị hướng, xử lý kinh tuyến 180°, tự giảm tải; ảnh chi tiết: tâm làm tròn 1 độ, trưa chỉ xin ảnh ngày, nửa đêm chỉ xin ảnh đèn, chạng vạng cả hai, bỏ qua sát kinh tuyến 180°, địa chỉ đúng chuẩn WMS 1.3.0, kho riêng giữ qua các lần deploy; lời dẫn quỹ đạo nói vì sao độ cao không đổi; đếm đêm trên biển ở giữa Thái Bình Dương, đêm trên đất ở nước Mỹ, ban ngày, và câu về đèn theo đó; lời theo nơi ở: chọn thành phố, vị trí máy, chưa chọn (không gọi TP.HCM là chỗ bạn ngồi); báo trước, giải thích bay ngang đúng lúc đổi; dòng số ghi lên / ngang / lên / ra xa; chặng 4 bắt đầu đúng 417 km ngay trên chỗ bạn và chỉ đi lên; câu chào mừng, câu cảm ơn; mỗi lúc một câu, đổi câu thì mờ ra rồi hiện vào; câu nào cũng đứng đủ thời gian đọc ở mọi chặng.

## Một hàm bị nuốt mất, và cả app đứng hình

Người dùng báo: *"bấm vô ngôi sao thì ko ra"*. Đây là lỗi tôi tự gây ra và tự đẩy lên mạng.

`dong()` của trò phát âm ném lỗi `thoiHinh is not defined` **ngay trước** dòng gỡ lớp `hien`.
Nên màn phát âm mở ra là không bao giờ đóng được, mà nó thì `position:fixed;inset:0;z-index:30`
— phủ kín màn hình. Người dùng bấm ngôi sao nào cũng thấy như không có gì xảy ra, vì trò mới
mở ra *đằng sau* một tấm chắn trong suốt.

Nguyên nhân thì tầm thường mà đáng nhớ: lúc tách hàm `quyet()` ra khỏi `xet()`, tôi thay trọn
đoạn từ `function xet` tới `function thoiNghe` — mà `thoiHinh` lại **nằm lọt giữa hai mốc đó**.
Sửa bằng cách thay cả một khối văn bản thì luôn có rủi ro này, và trình biên dịch không kêu gì
cả vì JavaScript chỉ phát hiện tên không tồn tại lúc CHẠY tới dòng đó.

Chỗ đáng nói không phải cái lỗi, mà là vì sao nó ra được tới người dùng: **không một bài kiểm
nào từng gọi `dong()`**. Chín ngôi sao, hàng trăm phép kiểm nội dung, mà không ai thử đóng một
trò lại bao giờ.

Nên giờ có `scripts/test-sao.js`. Nó không kiểm nội dung trò nào cả — nó đọc danh sách ngôi sao
thẳng từ `app.js` (thêm sao mới là nó tự biết) rồi hỏi đúng mấy câu mà mọi ngôi sao đều phải
trả lời được:

- mở có ném lỗi không;
- đóng có ném lỗi không;
- đóng rồi thì lớp `hien` có thật sự mất không;
- đóng xong mở lại có được không;
- và **đóng lúc chưa từng mở** có nổ không — `app.js` có nhánh gọi `dong()` trước khi trò kịp mở.

Đã kiểm rằng bài này thật sự có răng: gài lại đúng lỗi cũ thì nó báo hỏng ba chỗ; bỏ lỗi ra thì
xanh. Nó còn bắt luôn hai chỗ khác ngay lần chạy đầu — và hoá ra cả hai là lỗi của *giàn kiểm*
chứ không phải của sản phẩm: bộ DOM giả thiếu `blur()`, và cách tôi dò khung đang lấy "phần tử
mang lớp `hien` đầu tiên" nên nó chỉ về khung của một trò khác chưa đóng được, báo oan hai ngôi
sao vô tội.

## Mấy giờ mưa

Người dùng xin thêm. Màn bầu trời giờ có ba dòng mưa, và cả ba đều phải chống lại cùng một cám
dỗ: nói nghe cho chắc chắn hơn thực tế.

**Chọn dịch vụ.** Dùng [Open-Meteo](https://open-meteo.com/) vì nó là cái duy nhất thoả cả ba
ràng buộc của app này cùng lúc: không cần khoá API (nên không có bí mật nào để lộ trong một web
tĩnh công khai), CORS mở thật, miễn phí ở mức dùng cá nhân. **met.no thì không dùng được từ
trình duyệt** — và nó hỏng theo kiểu rất dễ đánh lừa: gọi bằng `curl` không kèm `Origin` thì
thấy `access-control-allow-origin: *`, trông như chạy tốt; nhưng gọi kèm `Origin` (đúng cái
trình duyệt luôn tự gửi) thì trả **403 với mọi origin**. Phải thử đúng cách mới thấy.

**Cái bẫy nguy hiểm nhất: lệch một tiếng.** Open-Meteo trả lượng mưa tại mốc `15:00` là tổng của
khoảng **14:00–15:00**, không phải 15:00–16:00. Hiểu ngược thì sai 100% số trường hợp, sai đúng
một lượng cố định, và nhìn vào giao diện không tài nào thấy được — người dùng chỉ đọc một câu
tiếng Việt trôi chảy. Tôi không tin trí nhớ mà **kiểm bằng thực nghiệm**: lấy dữ liệu 15 phút
gốc ở Berlin rồi cộng bốn mốc lại — cộng bốn mốc *trước* khớp 0,00 mm suốt 22 giờ, cộng bốn mốc
*sau* lệch 5,4 mm. Có bài kiểm canh riêng chỗ này.

**Ba dòng, không hơn**, theo thứ tự quan trọng giảm dần: *khi nào* → *nặng cỡ nào* → *còn bao
lâu và chắc tới đâu*. Và bốn chỗ cố ý không làm, vì làm là nói dối:

- **Không bao giờ viết "không mưa"**, chỉ viết *"bản dự báo không thấy mưa"*. Hai câu đó khác
  nhau, và cái khác nhau ấy chính là thứ app này quan tâm.
- **Không viết "mưa lúc 15:20"**. Dữ liệu chỉ mịn tới từng giờ và ô lưới mô hình rộng chừng
  27 km; viết giờ phút là bịa ra hai chữ số cuối. Luôn viết khoảng giờ.
- **Không viết "70%"**, và cũng không kể *"máy chạy 30 lần, 21 lần thấy có mưa"* như bản trước.
  Người dùng hỏi câu đó để làm gì — họ chỉ cần biết khi nào mưa, mưa cỡ nào, còn bao lâu. Con số
  xác suất của Open-Meteo vẫn được dùng bên trong: quá nửa số lần chạy thấy mưa thì giờ đó tính
  là giờ mưa.
- **Không dùng chữ "mưa phùn"**. Mưa phùn định nghĩa bằng cỡ hạt, mà API chỉ trả về mm. Dải nhẹ
  nhất gọi là *"lất phất vài hạt, chưa ướt áo"*.

**Càng xa càng nói ít đi.** Dưới ba tiếng thì nêu khoảng giờ và nói thẳng *"dự báo ở tầm này
khá sát"*. Ba tới mười hai tiếng thì vẫn nêu giờ nhưng kèm *"giờ giấc có thể xê dịch một hai
tiếng"*. **Quá mười hai tiếng thì bỏ hẳn con số giờ** — ở tầm đó nó chỉ là vẻ ngoài chính xác.

**"15 giờ rồi mà vẫn báo khoảng 14 giờ chiều có dông."** Người dùng báo đúng câu đó, ở TP.HCM,
ngày 24/9/2026. Lấy lại dữ liệu Open-Meteo lúc ấy thì thấy giờ nào cũng từ 50% trở lên, nên cả
24 tiếng gom thành một đợt: từ 14 giờ chiều nay tới 14 giờ chiều mai. Ba lỗi chồng lên nhau:

- **Độ dài đợt lấy bằng hiệu hai con số giờ**: 14 − 14 = 0, nên đợt 24 tiếng bị coi là một
  tiếng và đọc thành *"Khoảng 14 giờ chiều"*. Giờ độ dài tính bằng thời gian thật. Chạy bản cũ
  trên đúng dữ liệu ấy ra lại đúng câu người dùng thấy; dữ liệu đó giờ nằm trong `test-mua.js`.
- **Đợt đã bắt đầu vẫn đọc từ đầu đợt**, nên câu mở bằng giờ đã qua. Giờ bỏ phần đã trôi qua,
  tính từ giờ mưa đầu tiên còn ở phía trước; nếu giờ đó đang diễn ra thì nói *"Từ giờ tới
  khoảng 16 giờ chiều có dông"*. Lượng mưa nặng nhất cũng chỉ tính trên phần còn lại. Hết đợt
  còn quá mười hai tiếng thì không nêu giờ tạnh (*"Từ giờ tới chiều mai còn mưa rải rác, có lúc
  dông"*), cùng lý do không nêu giờ bắt đầu khi còn xa. Có dông ở một giờ nào đó trong đợt dài
  không có nghĩa là dông suốt, nên nói *"có lúc dông"*.
- **Câu chỉ dựng một lần lúc xin dữ liệu**, mười phút một lần, nên qua mốc giờ mà chưa tới lượt
  xin lại thì câu cũ vẫn nằm đó. Giờ app giữ dữ liệu thô và dựng lại câu theo giờ thật mỗi lần
  vẽ; mạng thì vẫn chỉ chạm mười phút một lần.

Dưới dự báo chỉ còn một link nhỏ *"theo Open-Meteo.com"*, không giải thích gì thêm. Không bỏ hẳn
được: giấy phép CC BY 4.0 của Open-Meteo ghi rõ phải có link về họ ngay cạnh chỗ hiện dữ liệu.

Và phải nói ra cái giới hạn thật: **mưa rào đối lưu nhiệt đới là đúng loại thời tiết mà mô hình
toàn cầu dự báo kém nhất**, mà Việt Nam thì không có mô hình khu vực độ phân giải cao nào phủ
tới. Hỏi năm mô hình cùng một câu cho mười hai giờ tới ở TP.HCM: ICON nói 0,0 mm, ECMWF nói
3,5 mm. Đó là mức bất định thật.

Ba chỗ kỹ thuật đáng ghi:

- **Toạ độ làm tròn về hai chữ số thập phân trước khi gửi đi.** Ô lưới mô hình rộng ~11 km nên
  làm tròn tới ~1 km không mất gì, mà vị trí chính xác của người dùng thì không rời khỏi máy.
- **Đừng tin `r.ok`.** Khi mất mạng, service worker của app bắt lỗi rồi trả về `index.html` với
  **status 200** — `r.ok` vẫn `true`, và `JSON.parse` sẽ nuốt phải một trang HTML. Phải soi
  `content-type`. Đã dựng đúng cái bẫy đó trong trình duyệt để chắc nó bị chặn.
- Tệp `nightsky.js` trước đó hứa ngay ở đầu là *"không gọi mạng"*. Thêm mưa là phá lời hứa đó,
  nên lời hứa được sửa lại chứ không để nằm im — **một lời hứa sai trong tài liệu cũng là một
  dạng bịa**. Phần thiên văn thì vẫn đúng như cũ: máy tự giải phương trình, ngoại tuyến vẫn
  chạy; chỉ riêng dòng mưa là đi xin người khác, và giao diện tách bạch hai thứ đó.

## Dự báo mưa theo chỗ đang đứng

Người dùng hỏi dự báo mưa có đoán đúng vị trí hiện tại không. Hai giới hạn khác nhau:

- **Dữ liệu** (không sửa được): Việt Nam chỉ có mô hình toàn cầu; Open-Meteo tự chọn mô hình chi tiết nhất, ô rộng chừng 9 km (ECMWF IFS HRES); phần trăm khả năng mưa lấy từ mô hình tập hợp ô 27 km; số theo giờ — mốc 15 phút ngoài châu Âu, Bắc Mỹ chỉ là nội suy từ số theo giờ ([tài liệu Open-Meteo](https://open-meteo.com/en/docs)). Nên dự báo nói được "khoảng giờ nào vùng quanh bạn dễ mưa", không nói được đúng từng con đường — mưa giông chiều ở Việt Nam thường chỉ vài km.
- **Vị trí** (đã sửa): bản trước lấy vị trí đúng một lần lúc bấm "Dùng vị trí của máy" rồi nhớ luôn — đi sang quận khác, tỉnh khác vẫn dự báo chỗ cũ. Giờ ai đã chọn vị trí máy thì mỗi lần mở bầu trời app lấy lại vị trí (`capNhatViTri`), đi xa hơn 1 km thì đổi sang chỗ mới và xin lại dự báo. Chỉ khi quyền vị trí **đã được cho** (Permissions API báo `granted`): không bao giờ tự bật hộp hỏi quyền — chưa biết hay bị từ chối thì giữ chỗ đã lưu, bấm Đổi nơi để cập nhật tay. Dời chưa tới 1 km thì thôi, khỏi xoá dự báo đang có.

`scripts/test-troidem.js` thêm 9 bài: đo khoảng cách, chọn thành phố thì không động tới định vị, chưa cho quyền thì không hỏi, không có Permissions API thì không hỏi, dời vài trăm mét thì giữ, đi xa thì đổi và xin lại dự báo, lấy vị trí lỗi thì giữ.

## Hỏi nơi ở ngay lần đầu

Trước đây ai chưa bấm **Đổi nơi** đều được gán lặng lẽ là TP.HCM, nên người ở Hà Nội mở ra thấy
dự báo mưa của TP.HCM mà không hề biết. Vị trí Mặt Trời, Mặt Trăng trong nước lệch nhau không
đáng kể, nhưng mưa thì khác hẳn giữa hai nơi.

Giờ lần đầu mở màn này là hiện ngay bảng **"Bạn đang ở đâu?"**: nút *Dùng vị trí của máy* và
mười thành phố. App không tự bật định vị, chỉ hỏi vị trí khi người dùng bấm nút. Bấm *Để sau*
thì bầu trời vẽ tạm theo TP.HCM, dòng chữ ghi rõ *"Xem tạm TP.HCM"*, **không xin dự báo mưa**
cho chỗ tạm đó, và lần mở sau hỏi lại. Chọn rồi thì app nhớ, không hỏi nữa.

## Kéo bầu trời cho êm

Người dùng thấy bầu trời "giật giật xíu". Tính toán không phải thủ phạm: mỗi khung hình vẽ hết
chừng 0,1 ms. Ba chỗ thật sự gây giật:

- **Mỗi giây viết lại cả khối chữ và thẻ thông tin**, dù chữ không đổi. Mỗi lần như thế trình
  duyệt phải dàn trang và vẽ lại, mà thẻ thông tin còn có lớp kính mờ, trên điện thoại là một cú
  khựng nhỏ lặp đều. Giờ chỉ viết lại khi chữ thật sự đổi, thường là mỗi phút một lần; đo trong
  trình duyệt: 0 lần viết lại trong 4,5 giây. Viết lại mỗi giây còn làm rơi cú bấm nếu đúng lúc
  ngón tay đang nhấn nút *"Quay nhìn về phía này"*.
- **Xoay theo máy đưa thẳng số đo cảm biến lên màn hình.** Cảm biến điện thoại lúc nào cũng rung
  nhẹ, nên hình rung theo. Giờ màn hình trôi dần về hướng cảm biến (hằng số thời gian 100 ms):
  thử với cảm biến rung ±2° thì hình chỉ còn rung 0,17°, và vẫn bám kịp hướng máy trong chưa tới
  một giây. Qua mốc 0°/360° thì đi đường ngắn.
- **Nhấc ngón là đứng khựng.** Giờ vuốt nhanh rồi nhấc thì bầu trời trôi thêm một đoạn rồi chậm
  dần mà dừng, như kéo bản đồ; dừng tay rồi mới nhấc thì đứng yên.

Các chuyển động đều tính theo thời gian thật giữa hai khung hình, nên màn 60 Hz hay 120 Hz đều
trôi cùng một tốc độ. Kéo tay trong lúc đang xoay theo máy thì tắt xoay theo máy, và nút cũng tắt
theo (trước đây nút vẫn ghi "Đang xoay theo máy").

## "Xoay theo máy, nhìn mặt trời lag quá"

Hoá ra không lag chút nào. Đo một khung vẽ khi **ngắm thẳng mặt trời**: 0,18 ms — rẻ như không.

Lỗi nằm ở **toạ độ**. Bộ bắt cảm biến lấy `alpha` làm hướng và `beta` làm độ cao, rồi **bỏ hẳn
`gamma`**. Cách ấy đúng tuyệt đối khi máy cầm thẳng đứng không nghiêng — nhưng ngửa máy lên nhìn
mặt trời thì cổ tay luôn nghiêng ít nhiều. Đo ra:

| tình huống | sai hướng |
|---|---|
| ngửa 50°, nghiêng 20° | **30°** |
| ngửa 50°, nghiêng −30° | **42°** |
| chĩa gần thẳng đứng, nghiêng 10° | **64°** |

Và phép đo nói rõ nhất là phép này: giữ nguyên hướng tay, chỉ **xoay cổ tay 40°** — bầu trời
**đứng yên tuyệt đối, 0,0°**. App bỏ qua hoàn toàn cử động đó. Bầu trời bị ghim sai chỗ, người
dùng xoay cách mấy cũng không khớp được vào mặt trời. Rà mãi không tới — và đó chính là cái bị
gọi là "lag".

Chữa bằng cách dựng **cả ma trận quay** `Rz(α)·Rx(β)·Ry(γ)` theo đặc tả W3C rồi lấy trục −Z
(mặt lưng máy, chỗ người ta chĩa vào bầu trời). Giờ cổ tay xoay bao nhiêu, bầu trời đi đúng bấy
nhiêu, một ăn một.

**Phép đo đầu tiên của tôi chỉ sai hướng, và suýt dẫn tới bản sửa tệ hơn.** Đo xong công thức
mới, tôi thấy nó **nhảy nhiều hơn** công thức cũ: 12,3°/khung khi chĩa gần thẳng đứng, so với
1,38° của cách cũ. Nhìn con số đó thì tưởng sửa hỏng. Nhưng đo lại trên **vector hướng** thay vì
trên **góc** thì lòi ra sự thật: vector chỉ nhảy đều 3,9° ở mọi tư thế — đúng bằng biên độ rung
tay. Con số 12,3° kia không phải tay rung mạnh hơn, mà là **méo mó của hệ toạ độ**: chĩa thẳng
lên thì "hướng la bàn" gần như vô nghĩa, cổ tay xoay tí là nó quay cả vòng. Cách cũ "ổn định"
chỉ vì nó **vứt bỏ thông tin**.

Nên phần làm mượt cũng chuyển sang kéo **trên vector** rồi mới đổi ngược về góc. Đo lại sau khi
làm mượt thì ba cách rung ngang nhau (0,2–0,45°/khung) — tức riêng việc đổi sang vector không
làm màn hình êm hơn, và tôi ghi ra đây đúng như vậy chứ không nhận công. Giá trị của nó là
**không thể vỡ**: một cử động nhỏ của tay luôn ra một thay đổi nhỏ trên màn, bất kể đang nhìn
đâu.

Chỗ này sống lâu được vì **máy bàn không bật được cảm biến** — trình duyệt từ chối cấp quyền,
nên không cách nào thử bằng tay. Giờ có móc `_camBien()` cho phép bắn thẳng sự kiện cảm biến
vào bộ xử lý trong Node. Gài lại cách cũ thì bài kiểm báo đúng *"lệch 0°"* — nguyên văn triệu
chứng người dùng gặp.

## "Chỗ bầu trời xoay theo máy bị lag, không có mượt mà"

Lần trước nghi vẽ chậm thì sai; lần này đo lại trước: một khung vẽ ở cỡ điện thoại tốn **0,3–1,1 ms** ở mọi hướng nhìn, kể cả lúc nửa đêm đầy sao — điện thoại có chậm hơn máy tính năm lần vẫn thừa sức 60 khung/giây. Không phải do vẽ. Hai chỗ trễ nằm ở đường đi của số đo cảm biến:

- **Bộ làm mượt trễ cố định 100 ms.** Màn hình trôi về hướng cảm biến với hằng số 100 ms bất kể tay đứng yên hay đang xoay: xoay 90°/giây thì bầu trời luôn chậm sau tay chừng 9°, dừng tay còn trôi thêm ba phần mười giây. Thay bằng **bộ lọc 1€** (Casiez, Roussel, Vogel — CHI 2012, [trang của tác giả](https://cristal.univ-lille.fr/~casiez/1euro)): tần số cắt = 1 Hz + 0,06 × tốc độ xoay (độ/giây). Đứng yên thì lọc mạnh, hết rung; xoay nhanh thì gần như không lọc, hết trễ. Tốc độ xoay tính trên vector hướng, làm mượt có dấu ở 1 Hz — rung tay qua lại triệt tiêu nhau nên lúc đứng yên tốc độ gần 0.
- **iPhone lấy hướng ngang từ la bàn** (`webkitCompassHeading`), mà la bàn iOS lọc rất nặng — chậm và nhảy bậc — trong khi ngửa lên cúi xuống lấy từ con quay nên mượt: xoay ngang giật hơn xoay dọc. Kỹ sư Apple (Dean Jackson, [W3C 2011](https://lists.w3.org/Archives/Public/public-geolocation/2011Jul/0014.html)) nói rõ iOS để app tự trộn: con quay cho nhạy, la bàn để chỉnh trôi. Giờ hướng = alpha của con quay (mốc tuỳ ý) + độ lệch; độ lệch kéo dần về (la bàn − alpha) với hằng số chừng 2 giây, chỉ khi la bàn báo độ chính xác ≤ 30° và máy chưa ngửa quá 80° (ngửa quá thẳng đứng thì hướng "đỉnh máy" lật ngược). Chưa có lúc nào đáng tin thì tạm dùng la bàn như cũ. Android dùng sự kiện `deviceorientationabsolute` (alpha tính từ hướng Bắc) khi có.

Mô phỏng bàn tay thật trong `test-troidem.js` (60 lần đọc mỗi giây, rung ngẫu nhiên như tay người, cùng một chuỗi cho cả hai cách lọc; đứng yên 1 giây, xoay 90°/giây 1 giây, dừng): đang xoay **chậm sau tay 1,7° thay vì 8,2°**; đứng yên rung 0,060°/khung thay vì 0,076°; dừng tay 0,3 giây còn lệch 0,03° thay vì 0,52°. iPhone: la bàn còn chậm mà bầu trời đã đi theo con quay ngay; la bàn bắt kịp thì vẫn khớp; la bàn báo kém thì không kéo theo. Chưa thử được trên điện thoại thật (máy bàn không có cảm biến).

## Bấm vào Mặt Trăng thì không có gì xảy ra

Người dùng nói tiếp: *"bấm vô xem mặt trăng mặt trời thì ko xem đc"*. Soát ra thì app **chưa hề
có** chức năng chạm chọn — biến `chon` khai báo ở `nightsky.js` rồi bỏ đó, không một dòng nào
dùng tới. Canvas chỉ bắt kéo để xoay và lăn để phóng.

Nhưng gốc của lời phàn nàn sâu hơn một phép dò chạm: **quá nửa thời gian trong ngày thì Trăng
hoặc Trời nằm dưới chân trời**, tức không vẽ ra gì để mà chạm. Nên làm ba lớp:

- **Chạm lên bầu trời** để chọn thứ đang thấy. Phân biệt chạm với kéo bằng ngưỡng 9px và 450ms —
  ngón tay trên điện thoại không bao giờ đứng yên tuyệt đối.
- **Thiên thể đã lặn vẽ thành bóng mờ** dưới đường chân trời, viền đứt, ghi rõ *"dưới chân
  trời"*. Nhờ vậy chúc mắt xuống là thấy nó đang nằm đâu dưới đất, và chạm vào được. Kẹp góc
  nhìn nới từ −20° xuống −85° để còn chúc xuống được.
- **Bấm thẳng vào chữ "Mặt Trời" / "Mặt Trăng"** trong dòng chữ dưới đáy thì quay hướng nhìn về
  phía nó. Đây là lối đi luôn dùng được, kể cả khi nó đã lặn.

Ba chỗ hỏng mà bộ kiểm mới bắt được ngay khi vừa viết xong tính năng:

- `chieu()` **trả toạ độ cho cả vật nằm ngoài màn hình** — nó chỉ chặn vật ở sau lưng. Không lọc
  thì chạm sát mép màn có lúc trúng một thiên thể đang nằm ngoài khung; đo thật thấy Mặt Trời
  có mốc chạm ở `y = −54`.
- `dong()` **không buông lựa chọn**. Đóng màn lúc đang chọn rồi mở lại thì vòng kéo hướng nhìn
  lôi mắt về mục tiêu cũ, ghi đè hướng mà `mo()` vừa đặt — người dùng mở ra thấy đang chúi xuống
  đất mà không hiểu vì sao.
- `mocLan()` bị gọi **tám lần mỗi giây**, mỗi lần là vòng lặp 1441 bước tính đầy đủ vị trí thiên
  thể. Đo được 25ms mỗi giây đốt vào việc tính lại đúng mấy con số không đổi. Giờ nhớ lại, và
  gom mọi chỗ đổi nơi về **một cửa duy nhất** `doiNoi()` — ba chỗ vốn gán thẳng vào biến `noi`,
  chỉ cần một chỗ quên xoá bộ nhớ là app hiện giờ mọc của nơi cũ mà không ai thấy sai ở đâu.

Và một cái bẫy đơn vị đáng ghi: `kc` của **Mặt Trăng tính bằng km** (~385 000) còn `kc` của Mặt
Trời và hành tinh tính bằng **đơn vị thiên văn**. Cùng một tên trường, hai thang lệch nhau 150
triệu lần. Viết một dòng hiển thị dùng chung cho cả ba là ra ngay một Mặt Trăng cách Trái Đất
385 nghìn tỉ km. Có bài kiểm canh riêng chỗ này.

Bầu trời trước đó chỉ có bài kiểm phần **tính** (`test-astro.js`), không bài nào chạm tới phần
**nhìn** và phần **chạm** — đúng chỗ đó đẻ ra cả lỗi này lẫn lỗi "chưa lên khỏi chân trời" ở
dưới. Giờ có `test-troidem.js`: dựng DOM và canvas giả, chạy thật vòng vẽ, rồi soi vào đó.

## "Sáng rồi Trăng không chịu lặn, có lúc khuya mà Trăng không mọc"

Người dùng hỏi app tính sai hay mình sai. **Không ai sai.** Đối chiếu với [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) của NASA (TP.HCM, tháng 10/2026, mốc mép trên chạm chân trời thật, có khúc xạ): 38 lần mọc lặn trong 20 ngày lệch nhiều nhất **1,8 phút**, kể cả hai ngày không có mọc (4/10) hay không có lặn (19/10). Hai điều người dùng thấy đều có thật:

| Ngày (TP.HCM) | Trăng mọc | Trăng lặn | Thấy gì |
|---|---|---|---|
| 1–3/10 | 21:32 – 23:38 | 9:46 – 11:52 | sáng ra còn trăng ở phía tây |
| 5–9/10 | 0:40 – 4:18 | 13:44 – 16:38 | trăng cuối tháng: sáng rồi vẫn chưa lặn |
| 10–11/10 | 5:08 – 5:58 | 17:17 – 17:58 | trăng non: cả đêm không có trăng |
| 12–18/10 | 6:48 – 11:56 | 18:40 – 23:38 | trăng đầu tháng: khuya là đã lặn |

Trăng không gắn với ban đêm: mỗi ngày mọc trễ chừng 50 phút, nên giờ mọc trôi qua đủ 24 tiếng trong một tháng âm. Cái thiếu là **lời**, sửa ba chỗ:

- **Trăng mọc tối nay, lặn sáng mai thì không ghi giờ lặn.** `trangThaiMocLan` chỉ nhìn giờ lặn của hôm nay — đã qua — nên 22:00 ngày 1/10 dòng chữ chỉ có "đang ở 6° trên đông bắc"; sáng ra thấy trăng còn treo thì tưởng app sai. Giờ lấy giờ lặn ngày mai và nói rõ buổi: *"lặn lúc 10:49 sáng mai"*; đã lặn thì *"mai mọc lúc 07:39 sáng"*.
- **Ngưỡng chân trời của dòng chữ lệch ngưỡng của giờ mọc lặn.** Giờ mọc Mặt Trời tính ở −0,833° (bán kính đĩa + khúc xạ) nhưng chữ so "trên 0°", nên 2 phút sau giờ mọc (độ cao hình học −0,35°) app vẫn bảo "đang ở dưới chân trời". Giờ dùng chung `NGUONG` với `mocLan`; kiểm từng phút cả ngày: "trên trời" trùng khít khoảng giữa giờ mọc và giờ lặn, cho cả Mặt Trời lẫn Mặt Trăng. Lúc vừa ló hay sắp khuất thì ghi *"đang sát chân trời phía đông"* thay vì "-1°".
- **Không ai nói vì sao.** Thẻ Mặt Trăng thêm một câu theo pha (`nhipTrang`), chia đúng các mốc của tên pha: trăng non cả đêm không có trăng; đầu tháng chỉ thấy đầu hôm ở phía tây; thượng huyền thấy nửa đầu đêm; tròn thấy suốt đêm; khuyết cuối tháng sáng ra vẫn còn ở phía tây; hạ huyền cả buổi sáng vẫn thấy; cuối tháng thấy ở phía đông trước bình minh, sáng rồi vẫn chưa lặn — kèm "mỗi ngày Trăng mọc trễ hơn chừng 50 phút". **Mỗi câu được kiểm trên bầu trời tính được** suốt năm 2026 ở cả TP.HCM lẫn Hà Nội (507 lần kiểm mỗi nơi, chạy thử 2 năm cũng không sai lần nào): câu nói "khuya là đã lặn" thì 0:30 Trăng phải khuất, "phía tây" thì phương vị phải ở nửa tây, v.v.

Kiểm thử: `test-astro.js` thêm 9 bài (bảng Horizons, giờ lặn ngày mai, ngưỡng từng phút), `test-troidem.js` thêm 9 bài (chữ hiển thị, câu giải thích theo pha, thẻ Mặt Trăng sáng 8/10).

## "Sao giờ không thấy mặt trăng?"

Người dùng mở bầu trời lúc gần nửa đêm và hỏi vậy. Bầu trời **vẽ đúng** — lúc đó Trăng ở −41°
dưới chân trời, nó lặn từ 20:45 — nhưng dòng chữ dưới đáy lại bảo *"chưa lên khỏi chân trời"*.

Lỗi nằm ở chỗ chỉ có hai nhánh:

```js
b.trang.cao > 0 ? `đang ở ${…}°` : 'chưa lên khỏi chân trời'
```

Một thiên thể khuất khỏi bầu trời thì có **hai** lý do khác hẳn nhau: chưa mọc, hoặc đã lặn rồi.
Gộp cả hai thành một câu là nói sai nửa số trường hợp, và đúng nửa sai ấy làm người đọc tưởng
app hỏng. Đây không phải lỗi tính toán — phần thiên văn vẫn đúng từng độ — mà là lỗi **nội dung**.

Chữa xong thì dòng chữ trả lời thẳng cả hai câu người dùng hỏi:

> Mặt Trời **đã lặn lúc 17:54, mai mọc 05:43** · trăng lưỡi liềm đầu tháng, sáng 21%, **đã lặn
> lúc 20:45, mai mọc 09:48**

Hai điều phải làm thêm:

- `mocLan()` vốn đóng cứng vào Mặt Trời. Mở nó ra cho cả Trăng, với **ngưỡng độ cao khác**:
  Mặt Trời lấy −0,833° (bán kính đĩa cộng khúc xạ), còn Trăng lấy **+0,125°** vì Trăng ở gần nên
  có thị sai chân trời chừng 0,95° — trừ khúc xạ 0,57 và bán kính đĩa 0,26 thì còn dương. Không
  để ý chỗ này là giờ Trăng mọc lệch vài phút.
- Tách phần **quyết định** (`trangThaiMocLan`, hàm thuần trong `astro.js`) khỏi phần **câu chữ**
  (trong `nightsky.js`). Chính vì trước đây nó nằm lẫn trong đoạn dựng HTML nên **không có bài
  kiểm nào chạm tới được** — đó là lý do lỗi sống tới lúc người dùng nhìn thấy. Cùng một bài học
  với lỗi chấm điểm phát âm ở trên.

Kiểm thử thiên văn: 21 lên 34, trong đó mốc chắc nhất là *đúng thời điểm tính ra là mọc thì độ
cao phải bằng đúng ngưỡng* (lệch 0,000°), và *mỗi ngày Trăng mọc muộn hơn 50–53 phút* — khớp con
số trong sách.

## Hồ vẫn sống khi không nhìn tab

Trình duyệt dừng vòng vẽ khi tab bị ẩn, nên trước đây thời gian trong hồ đứng luôn: chuyển tab đi mười phút, quay lại thì ếch vẫn y nguyên.

Nay lúc trang bị ẩn, hồ ghi mốc thời gian **trong bộ nhớ**, không ghi xuống máy. Mốc lấy từ `performance.now()` chứ không phải `Date.now()`: đồng hồ treo tường nhảy khi máy đồng bộ giờ qua mạng, đổi múi giờ hay người dùng chỉnh tay, còn `performance.now()` chỉ đi tới và không bao giờ lùi. Quay lại thì nó chạy bù quãng đã mất bằng những bước 33 mili giây, đúng bằng bước lúc chạy thật, nên vật lý không lệch. Trong lúc tua thì bỏ toàn bộ phần vẽ và câm tiếng, vì vẽ mấy vạn khung là vô ích còn tiếng thì sẽ dồn cả nghìn cái vào một lúc.

**Bỏ trần 20 phút.** Trước đây ẩn lâu hơn 20 phút cũng chỉ tua 20 phút, nên hồ gần như không già đi. Nay rời đi bao lâu thì hồ đi tới bấy nhiêu: hồ chết vì hết ếch cũng là một kết cục hợp lệ của thế giới đó.

Cái phải giải là máy đơ. Tính tám tiếng liền một mạch mất gần ba giây, và trong ba giây đó trang treo cứng. Nên quãng phải bù được ghi thành một khoản **nợ** (`noTua`), rồi mỗi khung hình chỉ dành một ít thời gian để trả bớt, xong bao nhiêu hay bấy nhiêu, khung sau trả tiếp. Ngân sách là **10 mili giây** một khung, nợ dày quá mười phút thì nới lên **40** — khung hình giật xuống chừng 25 hình một giây trong vài giây, đổi lại không lê thê. Trong lúc trả, khung vẽ vẫn tiến một nhịp bình thường, nên nhìn vào thấy hồ đang sống và đang đuổi theo, chứ không đứng hình.

**Vẫn phải chặn cái đuôi nợ, ở một ngày.** Khác với trần cũ: cũ chặn *quãng ẩn*, đây chặn *khoản chưa trả kịp*. Lý do là nợ cộng vào theo giờ giấc ngoài đời, còn trả nợ thì chỉ trả được lúc người ta đang nhìn — hai bên không cùng một nhịp. Để hồ mở suốt, ẩn một ngày rồi ghé nhìn năm giây, ngày nào cũng vậy: đo thấy nợ dày thêm chừng sáu tiếng mỗi lần, 24 h → 32 h → 38 h → … → 80 h sau mười lần, dòng chữ "thời gian đang trôi nhanh" không bao giờ tắt và mỗi khung hình vĩnh viễn mất ngân sách cho một khoản không đời nào trả xong. Chặn ở một ngày thì hết dồn: cùng phép thử đó, nợ đứng yên ở 24 h và mỗi lần ghé trả được chừng 18 h.

Một ngày là đủ vì ếch sống 3,5–6 phút, nên một ngày trong hồ là chừng **ba trăm đời ếch**. Qua ngần ấy lứa thì hồ đã ngã ngũ từ lâu, thêm nữa cũng không ra cảnh nào mới. Trần cũ 20 phút thì chỉ có bốn đời — đó mới là chỗ khác nhau.

Đo thực tế:

| Quãng ẩn | Cách cũ | Cách mới | Phải nhìn bao lâu để trả xong |
|---|---|---|---|
| 3,2 giây | 96 bước, 2 ms | như cũ, dưới 1,2 giây thì bỏ qua | — |
| 10 phút | 18 181 bước, 130 ms — một cục | 19 khung, khung nặng nhất 11 ms | 0,2 giây |
| 1 tiếng | bị chặn còn 20 phút | 20 khung | 0,6 giây |
| 8 tiếng | bị chặn còn 20 phút | 85 khung | 3,3 giây |
| 24 tiếng | bị chặn còn 20 phút | 199 khung | 7,9 giây |
| 3 ngày | bị chặn còn 20 phút | gom về 24 tiếng, 197 khung | 7,8 giây |

Quãng dưới 1,2 giây vẫn bỏ qua, vì lướt qua lướt lại không đáng tính.

Điều này chỉ đúng khi **trang còn mở**. Đóng hẳn app rồi mở lại thì hồ bắt đầu từ đầu, vì mốc thời gian chỉ nằm trong bộ nhớ. Muốn hồ già cả khi đóng app thì phải ghi mốc xuống máy, nhưng như vậy ngược với nguyên tắc không lưu gì.

## Tua nhanh trong hồ

**Nhấn giữ một chỗ trên mặt hồ chừng nửa giây thì thời gian trôi nhanh gấp tám lần**, thả tay là về nhịp thường. Dùng để xem trọn vòng đời mà không phải ngồi đợi: trứng nở thành nòng nọc, nòng nọc hoá ếch, lá sen mọc rồi tàn.

Không thêm nút nào lên màn hình. Nhích tay quá 14 pixel thì coi như đang vẽ sóng nên huỷ, không đá nhau với thao tác chạm mặt nước. Trong lúc tua có một dòng chữ mờ ở trên báo cho biết.

Cách chạy: mỗi khung hình chạy thêm bảy bước ngầm rồi mới vẽ một lần. Bảy bước ngầm dùng lại đúng cờ `tua` của phần chạy bù khi ẩn tab, nên không vẽ và không phát tiếng. Vật lý y hệt nhịp thường vì bước thời gian không đổi, chỉ là chạy nhiều bước hơn trong một khung.

Đo thử: 120 khung ở nhịp thường cho 2 giây trong hồ, cũng 120 khung khi tua cho 16 giây, đúng 8 lần.

## Chia sẻ ảnh

Nút **Chia sẻ ảnh** vẽ lá thông điệp thành PNG dọc 1080×1920, đúng khổ story của Facebook và Zalo. Mã ở `assets/share.js`.

Ảnh gồm nền trời đêm với các vì sao rải theo chính nội dung thông điệp, nên mỗi lá một bầu trời riêng, khung vàng hai lớp, hoa văn mặt trời, thông điệp bằng chữ có chân, ý nghĩa bên dưới, và chân ảnh **chỉ ghi ngày**. Không ghi tên app, không ghi số lá, không ghi địa chỉ web.

Cỡ chữ tự co giãn từ 84 xuống 46 pixel cho vừa khung, và cả khối nội dung được căn giữa theo chiều dọc, nên lá chữ ngắn hay dài đều cân. Font nạp trước tối đa 2,5 giây, mạng hỏng thì rơi về font hệ thống chứ không treo.

Bấm nút sẽ mở bảng chia sẻ của máy, **chỉ kèm tấm ảnh, không kèm chữ**. Máy không hỗ trợ chia sẻ tệp thì ảnh tự tải về.

Nút **Tải về** nằm cạnh, vẽ đúng tấm ảnh đó rồi lưu thẳng thành tệp `thong-diep-YYYY-MM-DD.png`. Riêng iPhone mở app từ biểu tượng ngoài màn hình chính thì bấm tải tệp là app mở tấm ảnh chiếm cả màn hình mà không có đường quay lại, nên ở đó nút mở bảng chia sẻ và nhắc chọn **"Lưu hình ảnh"** để lưu thẳng vào ứng dụng Ảnh. iPhone mở bằng Safari thì ảnh vào mục Tải về của ứng dụng Tệp.

Chỗ này từng hỏng. Bản đầu gọi `navigator.share({ files, text })` — gửi cả ảnh lẫn câu thông điệp. Zalo, Messenger và Facebook nhận được cả hai thì **chỉ lấy chữ rồi bỏ ảnh**: bấm "Chia sẻ ảnh" mà ra mỗi dòng chữ. MDN nói rõ bên nhận có quyền bỏ qua từng phần của dữ liệu chia sẻ. Nay chỉ gửi `files`. Bản thân tấm ảnh đã có sẵn câu thông điệp, ngày tháng và tên app nên bỏ text đi không mất gì.

## Xem thử ngày khác

Thêm `?ngay=YYYY-MM-DD` vào URL để xem lá của một ngày bất kỳ:

```
http://127.0.0.1:5179/?ngay=2026-12-25
```

Chỉ dùng để kiểm tra. Ngày sai định dạng hoặc không có thật (31/02 chẳng hạn) thì app bỏ qua và quay về ngày hôm nay. Lá hiện ra vẫn theo hạt giống của máy này. Ở chế độ này app không ghi `tdtd.day`, nên xem thử bao nhiêu ngày cũng không ảnh hưởng tới lượt nhận thật của hôm nay.

Xem nhanh 14 ngày liền của một hạt giống bất kỳ bằng dòng lệnh:

```bash
node -e "const C=require('./assets/core.js'),k=require('./data/cards.json'),i=k.map(c=>c.id),m=new Map(k.map(c=>[c.id,c]));const s=42;let d=C.ymd();for(let n=0;n<14;n++){console.log(d,m.get(C.cardFor(i,d,s)).thong_diep.slice(0,60));d=C.addDays(d,1)}"
```

## "Toàn một từ không vậy, cái này chủ yếu là luyện âm tiết mà"

Đúng. Sau hai lần sửa, bước đầu của mỗi bài dẫn bằng TỪ do máy đọc (books, cats), còn âm /s/ đứng
riêng chỉ là một nút phụ phát âm máy dựng — và chính chữ trên nút đó bảo người ta đừng tin nó. Người
học muốn nghe /s/, /z/ đứng một mình bằng giọng người thì không có chỗ nào cho nghe.

Muốn có cả hai thứ — giọng người, và âm đứng riêng — thì chỉ có một cách: một người thật thu âm nó.
Máy đọc của hệ điều hành chỉ đọc được từ; âm dựng bằng toán thì đúng phổ mà tai không nghe ra. Nên
giờ trò này dùng 22 bản thu của các bài IPA trên Wikipedia (Peter Isotalo, Erutuon, Denelson83 —
CC BY-SA 3.0, ghi công ngay dưới mỗi màn và trong `assets/am/NGUON.md`):

- **Bảng từng âm** ở đầu màn: 18 phụ âm, 4 nguyên âm. Bấm một âm là nghe nó đứng riêng ("chỉ âm
  /s/"), nghe nó trong âm tiết ([sa] … [asa]), rồi bấm micro nói theo. Máy không chấm — một âm tiết
  như [sa] không phải chữ nào nên máy nhận giọng chẳng biết gì để chấm. Việc nó làm được thật là
  phát mẫu rồi phát tiếng bạn **ngay sau**, để tai bạn so. Tiếng bạn không lưu, không gửi đi.
- **Bước 1 của mỗi bài** giờ là bản thu người thật của các âm trong bài, vế sai tô đỏ (/l/ cuối nói
  thành /n/ thì nghe /n/ để biết mà tránh). Từ do máy đọc lùi xuống sau.
- Bản "chỉ âm" chỉ có ở 10 âm kéo dài được (s z ʃ f v θ ð m n l). Âm tắc p t k cắt riêng ra chỉ còn
  một tiếng tách, nên chúng chỉ có bản trong âm tiết, và màn hình nói rõ vì sao.

Ba chuyện đáng ghi lại từ lúc làm:

1. **Lần chuyển đổi đầu ra 18 trên 22 file câm hẳn.** Bộ lọc `loudnorm` của ffmpeg cần khoảng 3 giây
   tín hiệu, gặp file ngắn thì trả về im lặng — mà nhìn danh sách thì kích cỡ file vẫn bình thường.
   Tôi chỉ phát hiện ra khi đo đường năng lượng để tìm chỗ cắt. `scripts/kiem-am-nguoi.py` giờ canh
   đúng lỗi này, và đã thử cho nó chạy trên chính bộ file câm đó: nó báo trượt cả 22 file.
2. **Không tin nhãn trên Commons.** Mô tả của file /z/ ở đó ghi "voiceless bilabial". Nên mọi nhãn
   được đo lại: /z/ và /v/ rung dây thanh còn /s/ và /f/ không; /s/ rít cao hơn /ʃ/ (5,3 kHz với 3,5
   kHz); bốn nguyên âm có F1, F2 xếp đúng thứ tự theo vị trí lưỡi. Mỗi phép đo đã được thử trên chỗ
   biết trước đáp án — tráo file /s/ với /z/, /s/ với /ʃ/, /iː/ với /æ/ — và đều bắt được. Hai chỗ
   đo không được thì nói thẳng: /p/ với /b/, /θ/ với /ð/ khác nhau quá ít trong bản thu, máy đo của
   tôi không tách được; nhãn của chúng dựa vào việc đây là file chuẩn của Wikipedia.
3. **Máy đo cũng phải được kiểm.** Lần đầu đo formant ở 16 kHz mà giữ bậc LPC 12, nó ra F1 của /ɪ/
   là 2260 Hz — vô lý. Bậc phải theo tần số lấy mẫu (số kHz + 2); đo ở 10 kHz thì ra 360 Hz, đúng.

Một chỗ chưa thử trên máy thật: trên iPhone, tiếng phát bằng Web Audio thường bị tắt khi gạt công
tắc im lặng (âm máy dựng trước đây cũng đi đường này). Không nghe thấy gì thì gạt công tắc lên trước.

## "Mất phần hướng dẫn bằng hình ảnh, phát âm từng âm như máy đọc, thiếu nhiều âm"

Ba lời chê, cả ba đều đúng:

- **Mất hình.** Màn "Từng âm một" mà tôi đưa lên đầu ở lần trước không có hình nào; hình miệng chỉ
  còn ở bước 3 trong các bài sửa lỗi. Đường vào chính lại là đường không có hình.
- **Như máy đọc.** Bộ bản thu cũ là mẫu ngữ âm của người KHÔNG bản xứ (Peter Isotalo lớn lên ở
  Stockholm và Moskva) đọc [sa] … [asa], nguyên âm chuẩn IPA thu năm 2005, và bản "chỉ âm" là một
  khúc 0,2 giây cắt ra — nghe đúng là không giống người nói. Còn bước 2, 3, 4 của mỗi bài vẫn dùng
  máy đọc của hệ điều hành.
- **Thiếu âm.** Chỉ có 22 âm, trong khi bảng người Việt quen học có 44.

Giờ:

- **Bảng 44 âm** chia ba nhóm như sách: 12 nguyên âm đơn, 8 nguyên âm đôi, 24 phụ âm (ký hiệu
  Anh-Anh). Mỗi ô ghi kèm một từ ví dụ.
- **Mỗi âm một màn có hình**: miệng nhìn thẳng và mặt cắt bên trong, CHẠY ĐỘNG theo tiếng; nguyên
  âm có sơ đồ vị trí lưỡi, nguyên âm đôi có mũi tên đường lướt (/aʊ/ lướt từ [a] sang /ʊ/). Kèm
  cách đặt miệng, lỗi người Việt hay mắc, ghi chú Anh–Mỹ, nghe so với âm hay lẫn, nói theo.
- **Mọi tiếng là người bản xứ.** Không ai, ở đâu, với giấy phép mở, thu riêng đủ 44 âm (đã lùng
  Commons, Lingua Libre, Freesound, Openverse, GitHub, Hugging Face). Nên mỗi âm lấy cái gần nhất:
  nhiều từ tiếng Anh vốn chỉ là một nguyên âm ("ah", "or", "oh", "eye", "ear", "air" — giọng Anh
  không đọc r cuối), thán từ ("shh", "mmm", "uh", "oy"), nhà ngữ âm người Anh Peter Roach đọc [e] [ʌ]
  [ɒ] và [fa] … [afa]. 27 âm có bản như thế; 17 âm còn lại (ʊ p b t d k θ ð z ʒ tʃ dʒ n ŋ l w j)
  nghe qua từ ví dụ — âm tắc tách riêng ra chỉ còn một tiếng tách, còn lại đơn giản là không ai thu.
  Từ ví dụ và mọi từ trong các bài (190 từ, 662 file, phần lớn 3–4 người đọc Mỹ/Anh) lấy từ bản
  thu trên Wiktionary và Lingua Libre. Máy đọc chỉ còn là đường lùi khi mất mạng.
- **Phiên âm quốc tế dưới mỗi từ**, Anh-Anh trước, Anh-Mỹ ghi thêm khi khác (hot /hɒt/ · Mỹ
  /hɑːt/). Anh-Anh theo Britfone, Anh-Mỹ theo CMUdict, đối chiếu Wiktionary, rồi hai người soát
  độc lập cả 190 từ theo đúng nghĩa đang dùng.

Những chuyện đáng ghi lại:

1. **Hình cắt dọc đặt lưỡi ở RĂNG cho /t d n l s z/.** Người soát ngữ âm chỉ ra: bộ vẽ chỉ chặn
   không cho lưỡi vượt quá vòm, chứ không kéo lưỡi lên, nên đầu lưỡi dừng ở mép răng cửa (y≈122),
   cách gờ lợi (y≈100) hai mươi điểm ảnh — đúng thói quen tiếng Việt mà bài muốn sửa. /k g ŋ/ thì
   lưng lưỡi hở vòm mềm gần hai chục điểm ảnh. Giờ lưỡi rướn tới chỗ chạm, âm xát chừa khe hẹp, và
   lưỡi rướn lên dần dần chứ không giật bật giữa chừng hình động. Bài kiểm mới đã thử gỡ bản sửa ra:
   7 bài hỏng ngay.
2. **Máy nghe lại từng file.** Mỗi bản thu từ được faster-whisper nghe lại, phải ra đúng từ mới được
   chọn. Lần đầu tôi gài sai: danh sách "từ đồng âm" có cả cặp tối thiểu (ship/sheep, ice/eyes,
   live/leave), nên một bản "ship" mà máy nghe thành "sheep" lọt qua — đúng vào bài luyện tai phân
   biệt hai từ đó. Giờ danh sách đồng âm nằm riêng ở `content/dong-am.json`, ghi rõ cấm cặp tối thiểu.
3. **Cắt lặng xén mất chữ.** Lần đầu chừa 40 ms trước, 90 ms sau: /p/ cuối "cheap" đến sau một quãng
   ngậm hơi gần như im lặng nên bị xén, máy nghe lại thành "cheers"; /s/ đầu "sing" nhỏ quá cũng bị
   cắt. Giờ chừa 150 ms trước, 300 ms sau, và bộ kiểm nghe lại cả 482 file SAU khi cắt.
4. **/z/ cuối từ gần như không rung.** Đo trên bản thu người bản xứ: đoạn xát của /z/ trong "size",
   "eyes", "dogs" gần như không có năng lượng dưới 500 Hz (0,00–0,05), còn /z/ đầu "zebra" có (0,24).
   Cái làm "eyes" khác "ice" lúc đó là nguyên âm trước nó dài hơn. Bài giờ nói rõ điều này thay vì
   chỉ bảo "rung cổ"; bản "buzz" (z cuối không rung) bị bỏ khỏi phần tiếng mẫu của /z/.
5. **Máy đo cũng phải được kiểm.** Phép đo "rung dây thanh" bằng độ tuần hoàn trên cả file báo /ʃ/
   rung 0,61 — vì đoạn lặng hai đầu có tiếng ù điện 120 Hz, tuần hoàn rất đều. Đổi sang đo tỉ lệ năng
   lượng dưới 500 Hz trong chính đoạn xát. Còn faster-whisper thì không tất định: cùng file "box" có
   lần ra "bux"; giờ chạy với temperature 0.

6. **Bài luyện tai lộ đáp án qua giọng đọc** (người soát tìm ra, đã kiểm chứng): bản thu lấy theo TỪ,
   mà mỗi từ có tập người đọc riêng — "ship" lúc nào cũng giọng Mỹ, "sip" lúc nào cũng giọng Anh, nên
   nghe giọng là chọn đúng mà không cần tai. Giờ hai từ của một cặp luôn do CÙNG một người đọc: đã
   tra thẳng bản thu của từng người đọc lớn (Back ache, Vealhurl, Wodencafe...) cho cả hai từ của
   mọi cặp, và bài kiểm canh rằng cặp nào trong bài luyện tai cũng có người đọc chung.
7. **Giọng Mỹ làm hỏng phép so nguyên âm.** "car rồi hot" giọng Mỹ là /kɑːr/ rồi /hɑːt/: cùng một
   nguyên âm. Từ nào Anh-Mỹ đọc khác thì giờ giọng Anh lên trước; so hai âm thì chọn người giọng Anh
   đọc cả hai từ, không có thì so bằng hai bản thu chính cái âm. Máy nghe (học trên giọng Mỹ) lại hay
   từ chối bản giọng Anh không đọc r — "car" thành "call", "her" thành "huh" — nên mấy bản đó được
   kiểm bằng đo formant thay vì máy nghe, số đo ghi trong `content/chap-nhan.json`.
8. **Tên file trùng khi bỏ qua hoa/thường.** Ổ đĩa macOS coi "When.wav" và "when.wav" là một, nên
   when-3 thành bản sao từng byte của when-2 mà ghi công một người khác. Giờ tên file tạm kèm băm
   của đường dẫn, và bộ kiểm báo nếu hai bản gốc khác nhau ra cùng một file.
9. **Tiếng đã nghe mất sau mỗi lần deploy.** sw.js xoá mọi kho khác phiên bản hiện tại, kể cả mp3.
   Giờ tiếng nằm trong kho riêng `tdtd-tieng`, đường dẫn mang dấu nội dung (`?v=`) để file đổi thì
   địa chỉ đổi.

Làm lại toàn bộ tiếng: `python3 scripts/lam-tieng-nguoi.py`. Kiểm: `python3 scripts/kiem-tieng-nguoi.py
--nghe`. Danh sách nguồn: `content/am44.json`, `content/am-nguoi.json`, `content/tu-nguoi.json`,
`content/tu-ipa.json`. Ghi công từng file: `assets/am/NGUON.md`, `assets/tu/NGUON.md`, và màn
"Nguồn tiếng đọc" trong app.

## "Phần phát âm cuối từ review lại UI/UX chưa? Chưa có chỗ nói thử xem máy có nghe được mình nói gì không"

**Nói thử.** Phần nhận giọng có từ trước, nhưng giấu ở bước 5, dưới dòng "Hoặc thử cách khác", trông như
thẻ chữ, bấm vào lại sang một màn khác — và màn đó chỉ cho nói từ ĐẦU của cặp. Giờ là một khối "Nói thử —
máy nghe ra chữ gì?" dùng chung, đặt ở ba chỗ: đầu bước 5 của mỗi bài, màn của từng âm trong bảng 44 âm, và
một mục riêng ở đầu danh sách (nói từ hay câu bất kỳ). Chọn từ, bấm micro, máy ghi ra chữ nó nghe được và nói
rõ: đúng từ / nghe thành từ kia trong cặp / không khớp, kèm mấy chữ nó còn phân vân và các lượt đã nói. So
khớp NGUYÊN từ, không so "gần giống" ("bucks" gần "books" lắm nhưng là từ khác), có tính từ đồng âm thật và
chữ số ("write" mà máy ghi "right", "five" mà máy ghi "5" vẫn là đúng).

**Soát giao diện năm bài âm cuối** — ba người soát độc lập (người mới học, sư phạm, tương tác), mỗi phát
hiện có người kiểm chứng lại; 36 trên 40 phát hiện là thật. Đã sửa:

1. **Luyện tai lộ đáp án qua thứ tự.** Lịch cũ tính vế bằng `i < 4` và cặp bằng `floor(i/2)`, nên bài có 3
   cặp thì cặp thứ hai LUÔN ra từ đầu, cặp thứ ba LUÔN ra từ sau, có từ không bao giờ được phát — nhớ cặp là
   đúng, khỏi cần tai. Hỏng ở cả 8 bài có 3 cặp, không riêng bài âm cuối. Giờ cặp nào cũng ra đủ hai từ, đúng
   4/4; bài kiểm đã thử đưa lịch cũ trở lại và bắt được ngay. Chọn sai thì dừng lại cho nghe hai từ cạnh nhau
   rồi mới sang lượt; hết 8 lượt thì liệt kê các lượt nghe nhầm để nghe lại.
2. **Dạy âm cuối bằng âm đầu.** Bước 1 bài /k/ /g/ cuối phát "[ga] … [aga]", bài /f/ /v/ cuối phát "[fa] …
   [afa]" và minh hoạ cái sai bằng "pen" (p đầu từ) cùng tiếng máy "pơ". Giờ bước 1 dùng từ có âm đó ở CUỐI
   (back/bag, wife/wipe, hat/had); bài /f/ /v/ có thêm hai cặp thật wife/wipe và safe/save (tải thêm bản thu,
   cùng người đọc cả hai từ) nên có luyện tai và nói thử, thôi là ngõ cụt.
3. **Năm bài nói khác nhau về âm hữu thanh cuối từ.** Người bản xứ đọc /d g z v/ cuối từ rung rất ít; cái tai
   nghe ra là nguyên âm TRƯỚC dài hơn ("had" dài hơn "hat"). Cả năm bài giờ nói đúng điều đó.
4. **Hình động âm tắc cuối từ** nhả bằng cách há hàm như thêm "ơ" — đúng lỗi "hat-ơ" bài dặn tránh. Giờ đi
   từ nguyên âm đứng trước, chặn, rồi nhả nhẹ.
5. **Máy đo đuôi s chấm "Đạt" khi nói "ice" thay "eyes"** — nó không tách được /s/ với /z/. Giờ chỉ đo các
   từ đuôi /s/, và nói thẳng giới hạn đó. Đo xong có thêm "▶ Nghe lại tiếng bạn" và "Mẫu rồi tới bạn".
6. Tương tác: mở bài trên điện thoại thì bước 1 hiện ở tận đáy (không cuộn về đầu); nút micro báo "Đang
   nghe…" khi hộp xin quyền còn hiện; micro đang thu mà vẫn phát mẫu được (máy đo chấm luôn tiếng mẫu); hai
   phần dùng micro chạy chồng nhau; iPhone gạt im lặng thì mọi nút ▶ câm (giờ xin phiên âm thanh "playback"
   như Nhạc ngủ); xong bài thì về đầu danh sách (giờ có "bài tiếp"); bước 4 lặp y hệt bước 1 (giờ là nghe
   so từng cặp); bài đuôi s thiếu quy tắc /s/ /z/ /ɪz/; bài /l/ cuối không dạy "l tối".

Công cụ chọn bản thu trước đây nằm ở thư mục tạm và mất khi máy khởi động lại; phần thêm từ mới giờ nằm
trong repo: `python3 scripts/them-tu-nguoi.py <từ...> --cap a/b ...`.

## "Sao Bảng 44 âm lại khác so với Cuối từ, khi bấm vô học cách bố trí khác nhau hết"

Đúng là khác: bài sửa lỗi làm trước, dắt từng bước; màn 44 âm làm sau, thành một trang dài như tờ tra cứu.
Cùng là "học một âm" mà hai lối, khối giống nhau nằm chỗ khác nhau, có thứ chỉ một bên có (luyện tai chỉ ở
bài, "nói theo rồi nghe lại mình" chỉ ở màn 44 âm). Người dùng chọn gộp về lối từng bước, và dặn giữ kiểu
hình khẩu hình của màn 44 âm.

Giờ một âm trong bảng được gói thành cùng dạng một bài (`baiAm`) rồi đi chung `veBuoc`:

- **Cùng đầu màn**: tên, nút "Nói thử", hàng chip sang âm (hay bài) cùng nhóm, thanh chấm báo bước.
- **Cùng thứ tự bước**: xem miệng → nghe người thật đọc → luyện tai (khi có cặp tối thiểu có một người đọc cả
  hai từ) → nghe so từng cặp (khi có cái để so) → nói. /iː/ đi đủ năm bước; /h/ chỉ ba.
- **Xem miệng theo kiểu màn 44 âm**: hình nhìn thẳng và hình bên trong miệng đặt cạnh nhau, chạy cùng nhịp,
  có sơ đồ lưỡi cho nguyên âm. Bài so hai tư thế (/l/ với /n/...) bấm qua lại giữa hai cặp hình, không bày
  bốn hình chồng nhau dài cả màn trên điện thoại.
- **Bước nói có đủ cả hai**: "nói thử — máy nghe ra chữ gì" và "nói theo mẫu, nghe lại mình" (mẫu chọn ngay
  tại chỗ; không lấy tiếng của vế sai làm mẫu), cộng máy đo ở bài nào có.
- Bấm chip sang âm khác lúc đang xem miệng thì vẫn ở bước xem miệng, để so hai hình; "Sang /y/ →" ở bước
  nghe so mở âm kia đúng ở bước nghe so. Vào âm từ một bài thì nút quay lại về đúng bài, đúng bước.

## "Phần xem miệng làm gì phải ở đầu tiên chứ"

Người dùng hỏi, và đúng. Trước đây mỗi âm đi: nghe người thật đọc → luyện tai → **xem miệng** → nghe so → nói, với ghi chú "tai đi trước miệng" dẫn bằng chứng luyện nghe phân biệt kéo phát âm lên mạnh hơn luyện nói. Nhưng bằng chứng ấy là **tai trước nói** (Bradlow và cs. 1997: luyện nhận /r/ /l/ thì người Nhật nói /r/ /l/ cũng khá lên), không phải tai trước hình miệng. Khung dạy phát âm phổ biến nhất (Celce-Murcia, Brinton & Goodwin, *Teaching Pronunciation*, 2010) đi: mô tả cách tạo âm (hình cơ quan phát âm) → luyện tai phân biệt → luyện có kiểm soát → … → giao tiếp. Và thấy mặt người nói giúp phát âm: Hazan và cs. 2004 cho người Nhật luyện /l/ /r/ có nhìn mặt, phát âm khá lên nhiều hơn nhóm chỉ nghe.

Giờ: **xem miệng → nghe người thật đọc → luyện tai → nghe so → nói**. Luyện tai vẫn đứng trước bước nói. Bước xem miệng tự có tiếng người thật đọc chính âm đó (bản thu GS Peter Roach ở màn 44 âm, từ thật ở bài sửa lỗi), mở âm là phát luôn và hình chạy theo — bước đầu vừa thấy vừa nghe. Lúc làm việc này mới phát hiện một bài kiểm của `sw.js` đỏ từ bản v135 (bài dò nguyên văn `laTieng(new URL(e.request.url))`, mà lần thêm bộ đếm truy cập viết gọn thành `laTieng(u)` — hành vi không đổi); đã sửa bài kiểm.

## Robot thắp sao — 100 bài lập trình cho bé

Người dùng: "làm 1 ngôi sao 100 bài code thiếu nhi", "code dạng game 3D", "ý là hình minh hoạ". Ngôi sao **Robot thắp sao** (`assets/laptrinh.js`, bài học ở `assets/baicode.js`): chú robot đi trên các khối đá bay trong vũ trụ, trẻ xếp ô lệnh để robot thắp sáng những ngôi sao còn tắt.

**Tìm hiểu trước khi làm** (người dùng dặn):

- Dạng trò như **Lightbot**: robot trên các khối hộp nhìn nghiêng ba chiều. Chiều cao là một phần của câu đố — khối cao hơn một nấc phải Nhảy — chứ không chỉ để trang trí.
- **Thứ tự dạy theo Code.org CS Fundamentals** ([code.org/csf](https://code.org/csf)): làm theo thứ tự, vòng lặp, sự kiện, điều kiện, rồi hàm; sửa lỗi xen suốt ("phần lớn thời gian lập trình thật ra là sửa lỗi").
- **Trẻ nhỏ học được bằng khối lệnh có hình, không cần đọc nhiều** ([ScratchJr — MIT Media Lab, Tufts](https://www.media.mit.edu/publications/designing-scratchjr-support-for-early-childhood-learning-through-computer-programming/)). Nghiên cứu thử ScratchJr của Joan Ganz Cooney Center thấy trẻ nhỏ không hiểu biểu tượng trừu tượng, nên mỗi ô lệnh có hình cụ thể (mũi tên, ngôi sao, bậc thang) kèm một chữ ngắn.
- Chương trình Tin học 2018 ở Việt Nam đưa lập trình trực quan vào từ lớp 4: điều khiển một nhân vật chuyển động ([Tạp chí Thiết bị Giáo dục](https://vjol.info.vn/tctbgd/article/download/86766/73783/); chưa đọc được văn bản gốc của chương trình).

Người dùng chọn: **6–10 tuổi** (hình kèm chữ ngắn), **3D nhìn nghiêng xoay được** (nhẹ, chạy mượt mọi điện thoại, không thư viện ngoài), **robot thắp sáng ngôi sao** (hợp với bầu trời sao của app).

**10 chương, 100 bài:**

| Chương | Bài | Học gì |
|---|---|---|
| 1. Đi và Thắp | 1–6 | làm đúng thứ tự |
| 2. Rẽ trái, rẽ phải | 7–18 | quay tại chỗ, trái phải theo hướng robot nhìn |
| 3. Nhảy lên bậc | 19–28 | khối cao hơn một nấc phải Nhảy; nhảy xuống bao nhiêu cũng được |
| 4. Sửa lỗi | 29–36 | chương trình cho sẵn sai một hai chỗ, chạy thử rồi sửa |
| 5. Vòng lặp | 37–48 | Lặp N lần |
| 6. Lặp trong lặp | 49–58 | nhiều lệnh trong vòng lặp, vòng lặp lồng nhau |
| 7. Hàm ★ | 59–68 | viết một lần, gọi nhiều lần |
| 8. Hàm và vòng lặp | 69–78 | hàm trong vòng lặp, vòng lặp trong hàm |
| 9. Nếu… thì… | 79–90 | Lặp đến khi hết sao; Nếu có đường phía trước / bên trái / bên phải, Nếu đứng trên sao — robot tự tìm đường |
| 10. Thử thách | 91–100 | tổng hợp, có bài sửa vòng lặp, sửa hàm, sửa điều kiện |

Đầu mỗi chương có một bảng giới thiệu ngắn (khái niệm mới, ô lệnh mới, gợi ý bài đầu); nút **?** mở lại bất cứ lúc nào. Bài nào cũng mở sẵn (xem mục "Mở full hết" bên dưới); app nhớ một chuỗi 100 ký tự (`tdtd.code`) là số sao từng bài, và một chỗ nhỏ (`tdtd.code.nho`) là bài đang chơi và chương nào đã xem giới thiệu.

**Luật chạy** (như Code.org): Đi chỉ sang khối cùng độ cao; Nhảy lên khối cao hơn đúng một nấc hoặc xuống khối thấp hơn; Thắp chỉ ô sao chưa thắp. Lệnh không làm được thì **robot dừng luôn**, hiện "!" đỏ, ô đó tô đỏ, và nói vì sao (không có đường / khối cao hơn phải Nhảy / chỉ nhảy lên được một nấc / ô này không có sao). Thắp xong ngôi sao cuối là thắng ngay. Vòng lặp không bao giờ xong (hay hàm tự gọi mãi) thì tự dừng sau 800 bước và báo "robot chạy mãi". (Bản đầu cho robot khựng rồi chạy tiếp như Lightbot — xem mục chấm sao bên dưới vì sao bỏ.)

**Mỗi bài có lời giải mẫu, và bản đồ dựng từ chính đường đi đó** (`dungBan`): Đi thì đặt khối cùng độ cao phía trước, Nhảy thì đặt khối cao hơn hay thấp hơn, Thắp thì khối đó là sao — nên bản đồ nào cũng chắc chắn đi được. Chương điều kiện thì vẽ bản đồ bằng đường riêng (`duong`), vì lời giải là "tự nhìn đường". Số ô tối đa của mỗi bài = số ô của lời giải mẫu + vài ô dư (chương đầu dư 3, chương vòng lặp trở đi dư 1).

**Hình minh hoạ kiểu 3D**, vẽ bằng canvas, không thư viện: khối đá nhìn nghiêng có mặt trên sáng, hai mặt bên tối theo ánh sáng từ phía tây bắc, viền sáng mảnh; càng cao khối càng sáng màu; ô đích có vòng tròn khắc, sao tắt mờ xám, sao thắp vàng rực có quầng sáng và nảy lên một nhịp. Robot thân tròn bóng (đổ bóng dưới chân), đầu có kính tối và hai mắt xanh nhìn theo hướng đi — quay lưng thì không thấy mắt — cùng một mũi tên trắng dưới chân chỉ hướng; ăng-ten sáng lên lúc thắp sao; đi thì bước, nhảy thì nảy theo vòng cung, khựng thì nhích tới rồi lùi lại. Bấm ⟲ ⟳ xoay cảnh từng góc 90°. Ô lệnh đang chạy được làm sáng viền trắng.

**Xếp ô lệnh trên điện thoại** (bấm, không cần kéo): bấm ô ở bảng dưới là chèn vào chỗ dấu + xanh; thêm ô Lặp hay Nếu thì ô tiếp theo tự vào bên trong; bấm dấu + ở dòng khác để đổi chỗ; bấm con số của ô Lặp để đổi 2 → 9. Khung chương trình cao cố định, dài thì cuộn, để cảnh 3D không co giãn mỗi lần thêm ô.

#### "Làm UI/UX cho dễ thao tác"

Nhìn lại bằng mắt một bé 6–10 tuổi cầm điện thoại, bản đầu có năm chỗ khó:

- **Không chèn được vào giữa**: ô mới chỉ vào cuối, nên bài sửa lỗi "thiếu một bước ở giữa" phải xoá cả đoạn sau rồi xếp lại. Giờ **chạm một ô để chọn** (viền vàng): ô mới chèn ngay sau nó, dấu + xanh đứng đúng chỗ sẽ chèn.
- **Chạm nhầm là mất ô** (chạm ô đã xếp là xoá luôn). Giờ chạm chỉ để chọn; ô đang chọn mới có **nút × đỏ** để bỏ; và có **↶ Hoàn tác** (nhớ 40 lần sửa gần nhất). "Xoá hết" cũng hoàn tác được.
- **Không thấy robot sai ở lệnh nào**. Giờ có **⏭ Từng bước** — mỗi lần bấm robot làm một lệnh, nút Chạy thành "Chạy tiếp"; robot vướng thì hiện bong bóng "!" đỏ trên đầu; chạy xong, **ô làm robot vướng tô đỏ** (rung nhẹ), lời nhắc "ô tô đỏ là chỗ robot bị vướng"; ô đang chạy tự cuộn vào khung nhìn.
- **Bí không biết làm gì**. Giờ có **💡 Gợi ý**, so chương trình của bé với lời giải mẫu (trải thành dãy, ô chứa thành mở … đóng) và chỉ đúng một bước: thêm ô gì (ô đó nảy lên ở bảng dưới, dấu + nhảy tới đúng chỗ — kể cả vào thân vòng lặp hay phần "không thì"), **thiếu một ô ngay trước ô nào** (bài sửa lỗi), ô nào chưa đúng hay thừa (tự chọn sẵn để bấm ×), đổi số lần lặp, hay "giống lời giải rồi, bấm Chạy". Hai bài đầu tự hướng dẫn: ô cần bấm cứ nhấp nháy cho tới khi bé bấm, rồi tới nút Chạy.
- **Nhãn ô điều kiện quá dài**, chiếm ba hàng: rút còn "Nếu trước có đường", "Nếu trên sao", "Lặp tới hết sao". Chương trình dài thì robot tự chạy nhanh hơn (bỏ nút tua).

Thanh nút dưới cùng: ▶ Chạy · ⏭ Từng bước · ↶ Hoàn tác · 💡 Gợi ý · 🗑 Xoá hết, mỗi nút có chữ nhỏ bên dưới. Đã thử trên trình duyệt cỡ điện thoại: bài 1 tự nhấp nháy Đi → Thắp → Chạy; bài 29 bấm Gợi ý thì dấu + về trước ô Thắp và ô Đi nhấp nháy, chèn vào giữa rồi hoàn tác; chọn ô thì hiện ×; Từng bước đi đúng từng ô rồi chạy tiếp tới thắng; bài 33 chạy chương trình sẵn thì hai ô Đi và ô Thắp tô đỏ.

Ba chỗ sửa khi tự thử trên màn điện thoại: khung chương trình dài ra thì cảnh co lại mà tấm vẽ không co theo, lòi xuống như ô lệnh đè lên cảnh — giờ khung cao cố định và tấm vẽ tự đo lại khi đổi cỡ; nút 🔗 của app đè lên nút ? — chừa chỗ ở góc trên; lời báo "chưa thắp hết" của bài trước còn dính sang bài sau — mở bài mới là xoá, và góc xoay về lại góc quen.

#### Âm thanh, và mở hết 100 bài để thử

"Thêm âm thanh khi thắp sao" — tạo ngay trên máy bằng Web Audio, không tải tệp nào. Thắp sao: tiếng chuông nhỏ, một âm chính kèm hai bồi âm lệch (tỉ lệ 2,76 và 5,4 như chuông kim loại) tắt nhanh; **mỗi sao sau cao hơn sao trước một bậc** (Đô 523 Hz, Mi 659, Son 784, Đố, Mí, Sol) cho bé nghe thấy mình đang tiến tới. Thắng: bốn nốt đi lên rồi một hợp âm. Robot vướng: tiếng "bộp" trầm, nhỏ. Âm thanh được mở ngay lúc bấm Chạy (iPhone chỉ cho mở âm thanh trong lúc người dùng bấm), đóng trò thì ngắt; không ép loa khi máy để im lặng. Bật/tắt ở danh sách bài (☰). Thử trên trình duyệt: bài 5 (ba sao) phát đúng ba tiếng chuông 523 → 659 → 784 Hz rồi nhạc mừng.

"Nếu tôi muốn test bài nào cũng được thì sao" — **mở hết 100 bài** bằng một trong hai cách, chỉ trong lần mở đó, không ghi gì xuống máy và không đánh dấu bài nào là đã xong:

- thêm `?mohet` vào link: `https://thong-diep-thuong-de.vercel.app/?mohet#lap-trinh`;
- hoặc trong app (cả bản đã cài ra màn hình chính): bấm ☰, **chạm 7 lần liền vào chữ "Robot thắp sao"**.

Ở chế độ thử, danh sách bài có thêm nút **Điền lời giải mẫu** cho bài đang mở, để kiểm bài nhanh. (Từ khi bài nào cũng mở sẵn, chế độ thử chỉ còn thêm nút này.)

#### "Màn này tôi giải có 6 ô mà đề ghi 7 ô"

Bài 69: lời giải mẫu đúng 6 ô (Lặp 4 lần [Hàm ★], hàm Đi Đi Thắp Rẽ trái), số ô tối đa là 6 + 1 ô dư = 7. Nhưng nhãn "6/7 ô" đọc lên thành "cần 7 ô". Giờ nhãn ghi **"6 ô · tối đa 7"**, và lúc thắng bảng khen so với lời giải mẫu: ít hơn thì "Còn gọn hơn cả lời giải mẫu", bằng thì "Gọn đúng bằng lời giải mẫu!", nhiều hơn thì "Lời giải mẫu chỉ cần X ô — thử gọn hơn xem?".

#### Chấm sao theo số ô, và rà lại cả 100 bài

Người dùng: "làm tối ưu nhất thì được nhiều sao, càng nhiều ô thì ít sao", rồi "review lại hết luôn". Giờ thắng bài nào cũng được chấm sao: **bằng hoặc gọn hơn lời giải gọn nhất → 3 sao, dư 1–2 ô → 2 sao, dư nhiều hơn → 1 sao**. Bảng khen nói cách gọn nhất cần mấy ô và nút "Làm lại cho được 3 sao"; app nhớ số sao cao nhất của từng bài (vẫn một chuỗi 100 ký tự, giờ là 0–3 thay vì 0/1 — chuỗi cũ vẫn đọc được); danh sách bài hiện sao dưới mỗi số và tổng "★ … / 300".

Chấm như vậy chỉ công bằng khi lời giải mẫu thật sự là cách gọn nhất. Nên có thêm `scripts/tim-loi-giai-gon.js`: với mỗi bài, **thử mọi chương trình ngắn hơn lời giải mẫu** (tăng dần từng ô, chỉ dùng ô có trong bảng của bài, cả hàm, vòng lặp, điều kiện; bỏ bớt dạng thừa như rẽ trái rồi rẽ phải, lặp 2 (lặp 3 X) = lặp 6 X, hàm chỉ gọi một lần). Lần chạy đầu tìm ra **28 bài có cách gọn hơn**, và phần lớn là mẹo lợi dụng luật "khựng rồi chạy tiếp": quay đủ bốn hướng, Đi vướng cũng kệ (bài Chữ L dài: lặp 5 lần (Rẽ trái, lặp 4 lần Đi)); Đi, Nhảy xen kẽ, cái nào vướng thì kệ (Cầu thang có chiếu nghỉ: lặp 7 lần (Đi, Nhảy)); thắp cả chỗ không có sao. Chấm sao theo số ô thì mẹo được 3 sao. Nên **đổi luật: lệnh không làm được là dừng** (như Code.org). Chạy lại còn 25 bài, giờ là cách gọn hơn thật — sửa từng bài:

- **Lấy cách gọn hơn làm lời giải mẫu** khi nó vẫn đúng tinh thần bài: Chữ S (đi tắt qua ô cuối); Gọi hàm, Gấp khúc, Chữ U (đưa luôn chỗ rẽ vào trong hàm, chương trình chỉ còn gọi hàm ba lần); Sao dọc đường gấp (Lặp tới hết sao (Đi, Thắp, Nếu phải có đường thì Rẽ phải)); Kim tự tháp (lặp 8 lần (Nếu trước có đường thì Đi, không thì Nhảy) — vẫn cho tới 8 ô để cách làm thẳng thắn bảy ô được 2 sao); Xoắn ốc lên trời, Hai tầng sao, Bậc thang đôi (vòng lặp lồng gọn hơn hàm).
- **Vẽ lại bản đồ** khi cách gọn hơn né mất điều đang học: chương Vòng lặp bị giải bằng vòng lặp lồng (Chữ L dài, Hàng sao gãy — giờ hai đoạn dài khác nhau); Lên hai xuống một giải chỉ bằng Nhảy (giờ thành Lên, đi, xuống — có chỗ bằng phải Đi); chương Nếu… thì… bị giải bằng "Lặp 8 lần" thay cho "Lặp tới hết sao" (giờ đường dài hơn 9 bước, có nhiều sao — mà ô Lặp chỉ tới 9 lần); và **gần cả chương Hàm và vòng lặp** giải được chỉ bằng vòng lặp lồng — vì gọi hàm trong một vòng lặp không bao giờ gọn hơn đặt thẳng thân hàm vào vòng lặp. Mười bài chương này làm lại sao cho đoạn lặp lại nằm xen giữa những chỗ rẽ khác nhau (rẽ phải rồi rẽ trái, hay 1 lần rồi 2 lần rồi 3 lần) — vòng lặp không gói được, hàm mới là cách ngắn nhất (bài Hàm trong vòng lặp: gọi hàm, rẽ phải, lặp 3 lần gọi hàm).
- **Bài sửa lỗi giữ nguyên** (Sửa hàm, Sửa điều kiện có cách viết lại gọn hơn): sao tính theo chương trình đã sửa.

Kết quả lần chạy cuối (60 giây mỗi bài): **84 bài chứng minh được lời giải mẫu là gọn nhất**; 14 bài lớn (8–10 ô có hàm hoặc điều kiện: Sóng, chín bài chương Hàm và vòng lặp, Bên nào có đường?, Ba sao đường vòng, Nhìn bên phải trước, Mê cung, Thang lên sân thượng, Robot tự đi) chưa thử hết trong thời gian đó nhưng không thấy cách nào gọn hơn; 2 bài sửa lỗi như trên.

Soát bằng mắt cả 100 bản đồ (ghép thành lưới ở cỡ điện thoại): bản đồ nào cũng rõ đường, rõ ô đích; riêng những bài có tháp cao (Tháp xoắn, Thang và sân, Xoắn ốc lên trời, Bậc thang đôi, các cầu thang chương lặp) thì khối cao nhất đứng ngay phía trước che mất các bậc thấp — giờ mỗi bài **tự chọn góc nhìn** trong bốn góc sao cho khối cao nằm phía sau (bản đồ phẳng giữ góc quen; trái phải tính theo hướng robot nên đổi góc không đổi lời giải). Soát chữ: chương Sửa lỗi còn dặn "bấm vào ô sai để bỏ" (cách cũ) — giờ là chạm rồi bấm ×; chương Nếu… thì… gọi tên ô chưa khớp nhãn mới.

#### "Bấm chạy mà còn dấu + xong đứng luôn"

Bài 69, chương trình của người dùng: Đi, Đi, Rẽ phải, Thắp, rồi **Lặp 3 lần còn trống**; Hàm ★ có Đi, Đi, Thắp nhưng **chương trình không gọi**. Chạy thì robot làm bốn lệnh đầu, tới ô Lặp trống thì chẳng có gì làm — chương trình hết, robot đứng im; lời "chưa thắp hết" hiện vài giây rồi tắt nên dễ lỡ; dấu + vẫn nằm trên màn trông như kẹt ở đó. Giờ **kiểm trước khi chạy** (`kiemChuongTrinh`): ô Lặp, Lặp tới hết sao, Nếu (trống cả hai phần) còn trống thì không chạy, tô đỏ ô đó, đưa dấu + vào trong và nói "Ô Lặp đang trống nên robot không biết làm gì…"; Hàm ★ có lệnh mà chương trình chưa gọi, hay gọi Hàm ★ mà hàm trống, cũng báo và chỉ chỗ. Lời báo sau khi chạy **đứng yên** tới khi bé sửa chương trình, chạy lại hay chạm vào nó; đang chạy thì ẩn dấu +.

`scripts/test-laptrinh.js`, 57 bài: đủ 100 bài, 10 chương; bản đồ bài nào cũng dựng được, vừa 10 × 10 ô, có sao; **lời giải mẫu của cả 100 bài đều thắp hết sao**, chỉ dùng ô có trong bảng của bài, không quá số ô tối đa; **chương vòng lặp, hàm, điều kiện, thử thách: xếp từng bước không đủ chỗ** — tìm theo chiều rộng số lệnh từng bước ít nhất, phải lớn hơn số ô tối đa, tức bài buộc dùng đúng điều đang học; 11 bài sửa lỗi có chương trình cho sẵn sai thật; luật khựng, nhảy, thắp, vòng lặp vô tận, hàm tự gọi mãi, điều kiện; gợi ý từng bước (ô tiếp theo, ô sai, ô thừa, thiếu ô ngay trước ô nào, số lần lặp, thêm vào thân vòng lặp lồng, vào Hàm ★, vào phần "không thì"); âm thanh (chuông cao dần, nhạc mừng, tiếng vướng, tắt được, mở lúc bấm); chế độ thử mở tới bài 100, bình thường chỉ tới bài chưa xong đầu tiên; chấm sao (3 / 2 / 1 sao theo số ô, gọn nhất là đủ 3 sao ở mọi bài, số tối đa chừa chỗ cho 2 sao, chuỗi tiến độ cũ vẫn đọc được); kiểm trước khi chạy (ô trống, hàm chưa gọi, hàm trống), lời báo đứng yên, ẩn dấu + khi chạy; gắn vào app, có trong bộ nhớ đệm khi mất mạng. Đã chơi thử trên trình duyệt cỡ điện thoại: bài 1 (thắng, lưu tiến độ), bài 54 (vòng lặp lồng, robot leo cầu thang), bài 83 (robot tự tìm đường bằng Lặp đến khi + Nếu), bài 29 (sửa lỗi, báo còn 1 ngôi sao), bài 59 (khung Hàm ★), danh sách bài, xoay cảnh.

#### "Mở full hết đi, ai muốn chơi màn nào thì chơi", "UI/UX dễ sử dụng", "bấm nhanh nút Đi hai lần là bị phóng to"

**Bài nào cũng mở.** Danh sách không khoá bài nào nữa; dòng đầu ghi "bài nào cũng mở, thích bài nào chơi bài đó. Chương đầu dễ nhất, càng về sau càng khó". Vì bé có thể nhảy cóc, app nhớ thêm hai thứ nhỏ: **bài đang chơi** (mở lại trò là về đúng bài đó, không bị kéo về bài chưa xong đầu tiên) và **chương nào đã xem bảng giới thiệu** — lần đầu vào một chương, dù vào giữa chương (vd nhảy thẳng tới bài 85), vẫn được giới thiệu ô Nếu, ô Lặp tới hết sao, mà chỉ một lần (người chơi từ bản cũ: chương có bài đã xong coi như đã xem).

Chơi thử cả trò bằng mắt một bé cầm điện thoại, trên màn 375×812, 375×667 (iPhone SE) và iPad. Những chỗ khó dùng đã sửa:

- **Màn thấp thì nút ▶ Chạy bị đẩy ra ngoài màn hình.** Cảnh 3D giữ tối thiểu 34% chiều cao, khung chương trình cao cố định, cộng bảng ô lệnh ba hàng (chương Nếu… thì…) là quá chiều cao iPhone SE. Giờ cảnh 3D lấy phần còn lại và co được (tối thiểu 120px), khung chương trình co theo màn (110–260px): nút Chạy luôn nằm trong màn.
- **Bảng ô lệnh ba hàng** (10 ô, ô điều kiện rộng gấp đôi): giờ xếp lưới đều, ô hẹp, chữ tối đa hai dòng — vừa hai hàng trên điện thoại, một hàng trên iPad (ô to hơn cho dễ bấm).
- **Chương trình có ô Nếu dài cả mấy màn**: bài 90 (8 ô, ba tầng lồng nhau) cao 827px trong khung 173px. Phần "không thì" còn trống giờ chỉ là một nút nhỏ "+ không thì" (bấm là mở ra); khung đã có ô mà không phải chỗ đang xếp thì không chừa thêm dấu + một hàng riêng (bấm vào khung là chọn được rồi). Còn 647px.
- **Không có đường chuyển bài nhanh**: thêm hai nút "‹ Bài 89" "Bài 91 ›" ở góc dưới cảnh; bản đồ tự chừa mép trên dưới để nút không đè lên khối đá.
- **Danh sách bài**: mở ra là cuộn tới bài đang chơi; có nút "Làm tiếp bài chưa xong: Bài X — tên bài"; đóng bằng ✕ ở góc (đi theo khi cuộn) hay chạm ra ngoài — bản trước phải cuộn qua 100 bài xuống tận đáy mới có nút Đóng.
- **Số ô ghi cạnh chữ "Chương trình"** ("4 ô · tối đa 8") trong khi chương trình còn trống — số đó là của cả hai khung. Có Hàm ★ thì ghi "4 ô (cả Hàm ★) · tối đa 8".
- **Đang chạy không biết robot ở lần gọi hàm nào, vòng lặp nào**: giờ ngoài ô đang chạy (sáng đậm), các ô chứa nó — ô gọi Hàm ★ trong Chương trình, ô Lặp, ô Nếu — có viền sáng nhạt.
- Nút "■ Dừng" bị xuống hai dòng; bấm liên tục vào ô lệnh thì bôi đen chữ, giữ lâu bật bảng sao chép — đã chặn trong trò.

**Chạm nhanh hai lần là bị phóng to** (iPhone, iPad): Safari hiểu hai lần chạm liền vào cùng một nút — bấm ô "Đi" hai lần — là "chạm đúp để phóng to". Thêm `touch-action: manipulation` cho **mọi phần tử của app** (không riêng trò này): bỏ đúng cử chỉ chạm đúp, vẫn cuộn và vẫn chụm hai ngón để phóng to như thường — không chặn hẳn phóng to, vì người cần chữ to vẫn phải phóng được. Đặt cho mọi phần tử vì thuộc tính này không truyền từ cha xuống con, và trong khung cuộn trình duyệt chỉ xét tới khung cuộn gần nhất; các tấm vẽ tự lo việc chạm (`touch-action: none`) đặt bằng class nên vẫn thắng.

`scripts/test-laptrinh.js` từ 57 lên 71 bài: không bài nào bị khoá, nút chuyển bài, danh sách (làm tiếp, ✕, chạm ra ngoài, cuộn tới bài đang chơi), mở lại về bài đang chơi (kể cả chỗ nhớ hỏng), giới thiệu chương lần đầu, chặn chạm đúp phóng to mà tấm vẽ vẫn giữ `none`, cảnh co được, bảng ô lưới, "+ không thì", bỏ dấu + thừa, mỗi bước chạy biết mình nằm trong ô gọi hàm và vòng lặp nào. Thử phá code ở 8 chỗ, bài kiểm bắt cả 8.

#### "Chèn thêm 1 ô hơi khó, cho kéo thả hoặc kéo di chuyển qua lại được không"

Bấm vẫn như cũ (chạm rồi nhả: ô mới vào chỗ dấu + xanh; chạm ô đã xếp để chọn, × để bỏ). Thêm **kéo thả** (`assets/laptrinh.js`, phần "kéo thả"), dùng Pointer Events nên chạy cả ngón tay lẫn chuột:

- **Kéo một ô từ bảng dưới, thả vào đúng chỗ muốn chèn** — đầu, giữa, cuối chương trình, vào trong vòng lặp, vào phần "thì" hay "không thì" (thả lên nút "+ không thì" hay chữ "không thì" là vào phần đó), sang Hàm ★.
- **Kéo một ô đã xếp sang chỗ khác** để đổi chỗ qua lại; kéo ô Lặp, ô Nếu thì các ô bên trong đi theo. Không thả được ô chứa vào thân của chính nó (báo lý do).
- **Kéo một ô đã xếp về bảng ô bên dưới là bỏ ô** — lúc kéo, bảng hiện chữ đỏ "🗑 Thả vào đây để bỏ ô". Thả ra ngoài (lên cảnh) thì không đổi gì. Mọi lần kéo đều ↶ Hoàn tác được.
- Lúc kéo: ô bóng nổi lên **phía trên** chỗ sẽ thả, chỗ thả cao hơn đầu ngón tay một đoạn — ngón tay không che, và **vạch xanh** chỉ chỗ chèn luôn lộ ra (bản đầu đặt bóng ngay giữa chỗ thả, nó che mất vạch xanh); khung sẽ nhận ô sáng viền xanh; ô gốc mờ đi. Kéo tới mép trên/dưới khung chương trình thì khung **tự cuộn**.
- Chạm mà rê dưới 8px vẫn là bấm. Cú "bấm" trình duyệt sinh ra lúc nhả tay sau khi kéo bị bỏ (chỉ đúng một cú, và lần chạm mới là bấm thật — bản đầu chặn mọi cú bấm trong 450ms, kéo xong bấm ngay Hoàn tác thì không ăn). Ô ở bảng và trong chương trình có `touch-action: none` để chạm-rê là kéo chứ không cuộn; cuộn khung chương trình bằng cách rê ở khoảng trống.

Bảng giới thiệu chương dặn thêm cách kéo thả. Đã thử trên trình duyệt cỡ điện thoại, cả chuột thật lẫn ngón tay giả lập: kéo từ bảng vào chương trình trống, chen vào trước một ô, đổi chỗ, kéo về bảng để bỏ, kéo vào giữa thân vòng lặp, kéo cả khối Lặp, kéo khối vào chính nó (bị từ chối), kéo sang Hàm ★, thả lên chữ "không thì", tự cuộn ở bài 90, hoàn tác ngay sau khi kéo. `scripts/test-laptrinh.js` từ 71 lên 91 bài (đổi chỗ trước/sau, tính lại vị trí khi kéo về sau trong cùng hàng, vào/ra vòng lặp, kéo cả ô chứa, không thả vào chính nó, "không thì" sang "thì", sang Hàm ★, hoàn tác, chỗ chèn theo hàng ô…); thử phá code ở 5 chỗ, bài kiểm bắt cả 5.

## Đẩy thùng sao — Sokoban 100 màn

Người dùng: "làm 1 ngôi sao game Sokoban". Ngôi sao **Đẩy thùng sao** (`assets/sokoban.js`, màn ở `assets/mansoko.js`, mở thẳng bằng `#day-thung`): chú robot của Robot thắp sao đẩy những thùng gỗ có ngôi sao trên nắp vào các ổ vàng; thùng vào ổ thì sao trên nắp sáng lên, mọi thùng đều sáng là xong màn.

**Tìm hiểu trước khi làm** (người dùng dặn):

- Luật gốc (Hiroyuki Imabayashi, Thinking Rabbit, 1982): đi bốn hướng trên lưới; đi vào ô có thùng thì đẩy thùng trượt thêm một ô nếu ô ấy trống; không kéo được, không đẩy hai thùng một lúc; mọi thùng nằm trên ổ là xong.
- Màn ghi theo ký hiệu **XSB** mà chương trình Sokoban nào cũng đọc được (`#` tường, `.` ổ, `$` thùng, `*` thùng trong ổ, `@` người, `+` người đứng trên ổ); lời giải ghi kiểu **LURD** (chữ thường là đi, chữ hoa là đẩy).
- Màn có sẵn thì vướng bản quyền: màn gốc của Thinking Rabbit không rõ quyền dùng; các bộ nổi tiếng (Microban, Sasquatch của David W. Skinner) được nhiều trang chia sẻ lại "có phép, ghi tên tác giả" nhưng không tìm thấy lời cho phép của chính tác giả. Nên **máy tự tạo màn**.
- Cách tạo theo **Joshua Taylor và Ian Parberry, "Procedural Generation of Sokoban Levels"** (GAMEON-NA 2011, tr. 5–12, [bản PDF của tác giả](https://ianparberry.com/pubs/GAMEON-NA_METH_03.pdf)): ghép phòng từ các mẫu 3×3, thử chỗ đặt ổ, rồi **chơi ngược** từ lúc mọi thùng đã nằm trong ổ để tìm thế bày cần nhiều đường đẩy nhất. Thế nào kéo ra được thì đẩy về được, nên màn nào cũng chắc chắn giải được.

Người dùng chọn: **máy tự tạo màn** (có bộ giải kiểm từng màn), **3D nhìn nghiêng như Robot thắp sao**, **robot đẩy thùng sao về ổ cho sáng**.

**Tạo màn** (`scripts/tao-man-sokoban.js`), đúng ba bước của bài báo:

1. **Phòng trống.** Chọn số khối 3×3 theo chiều ngang, dọc; lấp mỗi khối bằng một trong **17 mẫu** — chép từ hình 2 của bài báo (lấy ảnh trong tệp PDF, phóng to, đọc từng ô) — xoay hay lật ngẫu nhiên. Mẫu 5×5: lõi 3×3 và một viền chồng sang khối bên cạnh; ô viền nào có ghi thì phải khớp ô đã có. Không mẫu nào khớp thì bỏ cả phòng làm lại. Rồi loại phòng có sàn rời nhau (ô "người qua được mà thùng không qua" của mẫu 10 tính như tường khi xét chỗ này), có khoảng trống 4×3 hay 3×4 (bài báo: cây trạng thái rậm mà nông, khó tạo mà chẳng khó giải), thiếu sàn, có ô bị tường bao ba mặt.
2. **Đặt ổ:** thử mọi cách đặt, theo thứ tự xáo ngẫu nhiên, có hẹn giờ cho mỗi phòng; hết giờ thì lấy kết quả tốt nhất đã có.
3. **Thế xa nhất:** chơi ngược (người kéo thùng), đo bằng **đường đẩy** — đẩy một thùng bao nhiêu ô theo cùng một hướng vẫn tính là một đường, thước đo bài báo thấy khớp với độ khó nhất; chỗ người đứng gộp thành vùng đi được. Bài báo dùng tìm sâu dần hai lớp cho đỡ tốn bộ nhớ (máy năm 2011, có lúc ngốn 1,5 GB rồi sập); ở đây tìm theo chiều rộng thường, cùng kết quả mà nhanh hơn hẳn: phòng 2×2 khối ba thùng thử hết mọi cách đặt ổ trong vài giây (bài báo đo 2,7 phút), bốn thùng vài chục giây (bài báo: 3,4 giờ). Phòng lớn 4–5 thùng vẫn phải hẹn giờ, 2–4 phút một phòng.

Chọn màn bằng điểm của bài báo: 100 × (số lần đẩy − số màn "anh em" cùng độ xa + 4 × số đường − 12 × số thùng) + ngẫu nhiên 0–300; thùng kẹt cứng −100000, mỗi thùng sát tường −150, thùng sát người +50, thùng sát thùng +30, ổ sát ổ +30; điểm ≤ 0 thì bỏ; trùng màn đã có (kể cả xoay, lật, bỏ qua chỗ người đứng) thì bỏ. Thêm mấy việc bài báo không có: **bộ giải tìm số lần đẩy ít nhất** của từng màn để chấm sao (màn nào không giải xong trong giới hạn thì bỏ); bỏ màn có thùng nằm sẵn trong ổ mà lời giải không đụng tới (thùng chỉ để trang trí); chương làm quen bỏ màn robot đứng sẵn trên ổ, cho người mới thấy ngay ổ ở đâu.

Chạy song song trên máy M2 (7 luồng, chừng một giờ) được **216 màn ứng viên khác nhau** — 1 thùng: 29, 2 thùng: 59, 3 thùng: 58, 4 thùng: 43, 5 thùng: 27 — rồi chọn 100 (`node scripts/tao-man-sokoban.js chon …`): mỗi chương một số thùng; trong chương xếp theo độ khó của bài báo (đường·log đường − đường/lần đẩy) và lấy cách đều từ dễ tới khó; chương làm quen lấy những màn dễ nhất; trùng thì bỏ.

**Bộ giải** (`giaiItDay`, `giaiItBuoc`): duyệt các thế sau mỗi lần đẩy (vị trí các thùng và chỗ robot đứng), theo Dijkstra. Chấm sao dùng `giaiItDay`: mỗi lần đẩy tính một, số bước đi chỉ để phân hoà — ra số lần đẩy ít nhất, và lời giải lưu sẵn là cách ít bước nhất trong số đó. `giaiItBuoc` thì ngược lại (số bước trước, lần đẩy sau), dùng lúc tạo màn. Bỏ qua thế có thùng ở ô chết hay kẹt 2×2 vì không bao giờ giải được. Đối chiếu trên các màn nhỏ: số lần đẩy ít nhất trùng với tìm theo chiều rộng từng lần đẩy, số bước ít nhất trùng với cách dò từng bước một (chậm mà không thể sai). Giải lại cả 100 màn mất chừng 20 giây; có 68 trên 221 màn ứng viên mà cách ít lần đẩy nhất khác hẳn cách ít bước nhất.

**5 chương, 100 màn** (đường đẩy: thước đo độ khó của bài báo):

| Chương | Màn | Đường đẩy | Lần đẩy ít nhất |
|---|---|---|---|
| 1. Một thùng — làm quen | 1–6 | 3 | 4–5 |
| 2. Hai thùng | 7–30 | 5–14 | 5–33 |
| 3. Ba thùng | 31–60 | 11–23 | 17–45 |
| 4. Bốn thùng | 61–85 | 14–26 | 21–58 |
| 5. Năm thùng | 86–100 | 15–37 | 31–59 |

**Chơi:** bấm mũi tên (giữ thì đi liên tục), vuốt trên cảnh (mỗi quãng vuốt một bước), hay **chạm vào một ô** để robot tự đi tới theo đường ngắn nhất, không đẩy gì; chạm thùng ngay cạnh robot là đẩy, chạm thùng ở xa thì robot đi tới sát thùng. Máy tính: phím mũi tên hay WASD, Z hoàn tác, R chơi lại. **↶ Hoàn tác lùi một lần đẩy** (người dùng: "lùi lại cũng lùi tới chỗ thùng đẩy"): bỏ các bước đi sau lần đẩy cuối và bỏ cả lần đẩy đó — robot về đúng chỗ đứng đẩy, thùng về chỗ cũ; chưa đẩy lần nào thì về chỗ xuất phát; giữ nút để lùi tiếp; **↻ Chơi lại** bày lại từ đầu, lỡ tay thì Hoàn tác lấy lại được. ⟲ ⟳ xoay cảnh 90°; mũi tên luôn theo hướng trên màn hình (▲ là đi lên trên màn), dù đang xoay góc nào. Bấm nhanh hơn hình chạy thì nước sau xếp hàng chờ, không mất.

**Thùng kẹt:** đẩy thùng vào chỗ không bao giờ đưa về ổ được nữa — ô chết (góc tường, dọc bức tường không có ổ: tính sẵn bằng cách kéo ngược từ mọi ổ) hay bốn ô 2×2 toàn thùng với tường — thì thùng đỏ lên ngay, kèm lời nhắc bấm ↶. Người mới hay đẩy thùng vào góc rồi loay hoay mãi không hiểu vì sao.

**Không có nút gợi ý.** Bản đầu có 💡 chỉ lần đẩy tiếp theo — người dùng: "cho gợi ý chi vậy, người dùng dùng gợi ý hết sao". Đúng vậy: gợi ý chỉ theo lời giải tốt nhất, bấm từ đầu tới cuối là đủ 3 sao mà chẳng phải nghĩ. Nên bỏ hẳn (cùng bộ giải nhanh chỉ dùng cho nó), Sokoban là tự nghĩ, tự giải. Còn lại hoàn tác, chơi lại, và báo thùng kẹt — báo kẹt chỉ nói đã hết đường chứ không chỉ cách giải. Chế độ thử của người làm app (chạm 7 lần vào tên trò trong danh sách màn) vẫn có nút cho máy tự chơi lời giải để kiểm màn, nhưng máy chơi thì không tính sao.

**Chấm sao theo số lần đẩy, không tính bước chân** (người dùng: "tính sao bằng bước đẩy thùng đi, ai lại tính bước chân"; bản đầu tính theo số bước): đẩy đúng số lần ít nhất → 3 sao; dư không quá một phần tư → 2 sao; dư hơn → 1 sao. Đi bao nhiêu bước cũng được. Bảng khen nói ít nhất là bao nhiêu lần đẩy. Danh sách màn hiện sao từng màn và tổng ★ / 300; màn nào cũng mở, chơi màn nào cũng được.

**Lưu đúng một mục** `tdtd.soko`: số sao từng màn (chuỗi 0–3), màn đang chơi, đã xem cách chơi chưa. Không lưu nước đi — đóng giữa chừng thì lần sau chơi lại màn đó từ đầu.

**Hình 3D**, vẽ bằng canvas như Robot thắp sao (đá xanh lơ lửng giữa trời sao, cùng chú robot), nhưng nhìn từ cao hơn và **thẳng theo lưới**: hàng ô nằm ngang, cột ô đứng dọc, chỉ thấy mặt trên và mặt trước của khối. Bản đầu xoay lệch 18° cho thấy cả mặt bên — người dùng: "làm cho map thẳng đi, nó bị xéo qua một góc người dùng khó chịu". Nhìn thẳng thì tường ở hàng dưới che phần ô ngay sau nó, nên nâng góc nhìn và hạ tường thấp chút: từ che gần nửa ô xuống còn chừng một phần ba, ổ sát tường vẫn nhìn rõ. Bỏ được góc xéo nên ô cũng to hơn: đo cả 100 màn trên điện thoại rộng 375 điểm ảnh, ô trung bình từ 36 lên 45 điểm ảnh, màn có ô nhỏ nhất từ 26 lên 32. Sokoban cần thấy rõ từng ô, và bấm ▲ thì robot phải đi lên chứ không đi chéo. Tường là khối đá; sàn ô cờ tối; ổ là vòng vàng khắc trên sàn có hình ngôi sao, nhấp nháy nhẹ; thùng gỗ có khung ván, ngôi sao trên nắp — vào ổ thì thùng ửng vàng, sao sáng rực có quầng; kẹt thì đỏ. Mỗi màn tự chọn trong bốn hướng (cách nhau 90°, hướng nào cũng thẳng) hướng cho ô to nhất trên màn hình; ⟲ ⟳ xoay 90°, xoay xong vẫn thẳng. Âm thanh tạo bằng Web Audio: tiếng cộc khi đẩy, chuông cao dần mỗi thùng vào ổ, nốt trầm khi thùng rời ổ, "bộp" khi đâm tường, nhạc mừng khi xong; tắt được ở danh sách màn.

`scripts/test-sokoban.js`, 60 bài: luật (đi, đẩy, không đẩy hai thùng, không xuyên tường, hoàn tác trả đúng chỗ, chuỗi LURD chữ hoa phải là đẩy thật, tìm đường vòng qua thùng); ô chết và kẹt 2×2; **bộ giải đối chiếu với cách dò chậm mà chắc** trên 11 màn nhỏ (số lần đẩy ít nhất, số bước ít nhất), màn không giải được thì trả rỗng; bộ tạo: 17 mẫu, 75 biến thể xoay lật, bốn luật lọc phòng, **thế xa nhất của chơi ngược cần đúng ngần ấy đường đẩy khi tìm xuôi**, so trùng qua xoay lật; **cả 100 màn**: đọc được, kín tường, số thùng bằng số ổ, vừa màn điện thoại, lời giải lưu sẵn chơi lại xong màn đúng số lần đẩy đã ghi, **bộ giải giải lại cả 100 màn ra đúng số lần đẩy ít nhất**, lời giải đẩy mọi thùng, không thùng nào kẹt sẵn lúc bày, không màn nào trùng, độ khó không giảm trong mỗi chương; giao diện: **màn nào mở ra cũng thẳng theo lưới**, mũi tên theo màn hình ở mọi góc xoay, đếm bước và lần đẩy, **hoàn tác lùi cả lần đẩy** (bỏ các bước đi sau nó, robot về đúng chỗ đứng đẩy, thùng về chỗ cũ; chưa đẩy thì về chỗ xuất phát), Chơi lại rồi Hoàn tác lấy lại được, **đi thừa bước mà đẩy đúng số lần ít nhất vẫn 3 sao**, thùng kẹt tô đỏ rồi hoàn tác hết đỏ, **chạm giữa ô nào cũng ra đúng ô đó ở cả bốn góc xoay** (hay khối cao chắn trước mặt), chạm để đi, chỉ lưu một mục, **không còn nút gợi ý**, chế độ thử xem lời giải không ghi sao; gắn vào app. Thử phá code ở 13 chỗ (cho đẩy hai thùng, tắt kẹt 2×2, bộ giải ít bước quên bước đi bộ, bộ giải ít lần đẩy lại xếp theo bước, không ô nào chết, mũi tên theo bản đồ thay vì màn hình, nới mức 2 sao, chấm sao theo bước chân, hoàn tác chỉ lùi một bước, Hoàn tác sau Chơi lại, xem lời giải vẫn ghi sao, chạm sàn quên góc xoay, thùng kẹt không đỏ): bài kiểm bắt cả 13.

Đã chơi thử trên trình duyệt cỡ điện thoại: bảng cách chơi hiện đúng lần đầu; màn 1 bằng nút mũi tên, chạm ô để đi, chạm thùng để đẩy — thắng 3 sao; đi thừa bốn bước rồi đẩy đúng 4 lần — vẫn 3 sao, bảng khen "Bạn đẩy 4 lần (đi 16 bước)"; hoàn tác từ "2 lần đẩy · 3 bước" về "1 lần đẩy · 1 bước", robot về chỗ đứng đẩy, bấm nữa về chỗ xuất phát; vuốt để đẩy; xoay cảnh (mũi tên vẫn theo màn hình); đẩy thùng vào góc — thùng đỏ, có lời nhắc, hoàn tác thì hết; danh sách màn; chế độ thử tự chơi lời giải; màn 5 thùng; không còn nút gợi ý. Một khung hình vẽ hết 0,1–0,4 ms trên máy tính.

## Cờ vua ba người

Người dùng: "làm 1 ngôi sao nữa cờ vua cho 3 người chơi, thú vị đặc biệt". Ngôi sao **Cờ vua ba người** (`assets/coba.js`, mở thẳng bằng `#co-ba-nguoi`): Trắng, Đen, Đỏ trên bàn lục giác 96 ô.

**Tìm hiểu trước khi làm** (người dùng dặn):

- Cờ ba người có cả chục kiểu; kiểu phổ biến nhất là bàn lục giác 96 ô ghép từ ba nửa bàn cờ 4×8 — bằng sáng chế của Robert Zubrin (US 3652091, 1971), cùng kiểu với Yalta, Three-Man Chess (George Dekle, 1984), 3-chess.com và bộ cờ bán sẵn của Yellow Mountain Imports ([Wikipedia: Three-player chess](https://en.wikipedia.org/wiki/Three-player_chess), [Three-man chess](https://en.wikipedia.org/wiki/Three-man_chess)).
- **Hình bàn theo đúng lời bằng sáng chế** ([Google Patents](https://patents.google.com/patent/US3652091)): ba cạnh xen kẽ là ba hàng quân; mỗi nhà chia đôi bằng "đường đỉnh" từ giữa cạnh vào tâm; mỗi nửa là một tứ giác chia 4×4 — đường ngang cắt đường đỉnh và cạnh bên ở 1/4, 1/2, 3/4, đường dọc chia mỗi đường ngang thành bốn phần bằng nhau. App dựng ô bằng nội suy song tuyến trên mỗi tứ giác, ra đúng cách chia đó.
- **Đường đi**: cột của mình chạy thẳng sang nhà bên cạnh (cột h của Trắng nối cột a của Đỏ; cột e uốn qua sát tâm sang cột d của Đỏ, chạy tiếp về hàng quân Đỏ). Sáu ô d4, e4 của ba nhà gặp nhau ở tâm ("hoa thị"); đường chéo qua đúng tâm thì rẽ hai nhánh, cùng màu ô (Yalta: tốt, tượng, hậu "được chọn đường khi đi qua tâm"; [3-chess.com](https://3-chess.com/rules): "qua tâm thì chọn nhánh, vẫn cùng màu ô") — nên tốt ở d4 có ba ô ăn chéo (Dekle). Mã gần tâm tới được hơn tám ô (3-chess.com) và luôn sang ô khác màu (Yalta).
- **Luật thắng** khác nhau tuỳ bản: còn vua cuối cùng (Zubrin, 3-chess.com), hay ai chiếu hết trước thì thắng, người thứ ba cùng thua (Dekle, Yellow Mountain).
- **Máy chơi cờ nhiều người**: cách "hoang tưởng" (paranoid) coi mọi đối thủ cùng hợp sức đánh mình; Best-Reply Search (Schadd & Winands, 2011, [bài báo](https://dke.maastrichtuniversity.nl/m.winands/documents/BestReplySearch.pdf)) mỗi lượt chỉ cho một đối thủ — người có nước đáp mạnh nhất — đi. Nghiên cứu ở Đại học Maastricht thấy BRS mạnh hơn trong nhiều trò, và bản cải tiến BRS+ thắng cả maxⁿ lẫn hoang tưởng trong cờ bốn người ([Esser và cộng sự](https://dke.maastrichtuniversity.nl/m.winands/documents/brsplus.pdf)).

Người dùng chọn: **còn vua cuối cùng thì thắng**, **đấu với 2 máy hoặc 3 người chung máy** (sau đổi thành chơi qua mạng, xem mục dưới), **bàn lục giác nhìn từ trên, quân vẽ nổi**, và cả bốn điểm đặc biệt: **hình động đường uốn qua tâm**, **báo nguy**, **máy có tính cách**, **hoàn tác khi đấu với máy**.

**Luật trong app**: như cờ vua thường; **Trắng → Đen → Đỏ** theo chiều kim đồng hồ; hậu bên trái vua ở cả ba nhà. Không được để vua mình bị chiếu. Vua để hở cho người đi trước mình ăn là mất vua (3-chess.com). Bị chiếu hết hay mất vua thì bị loại: quân **hoá đá** (xám, có vết nứt, dải màu trên khung bàn cũng xám) — vẫn chắn đường, ăn được, nhưng không chiếu ai. **Còn vua cuối cùng thì thắng.** Hết nước mà không bị chiếu: còn ba nhà thì bỏ lượt, còn hai nhà thì hoà; còn hai nhà mà không đủ quân chiếu hết, hay 50 vòng không ăn quân không đi tốt: hoà. Tốt sang nhà khác thì tiến về hàng quân nhà đó, tới hàng 1 thì phong cấp (bạn chọn Hậu, Xe, Tượng hay Mã). Nhập thành như thường, không qua ô bị nhắm. Không có bắt tốt qua đường (như bộ threeChess của Đại học Tây Úc) — với ba người, "nước vừa đi" của ai cũng khó định nghĩa.

**Lõi** (`LOI`, viết tự chứa): sáu tứ giác ("diều") quanh tâm, ô trong mỗi diều có toạ độ (p, q) tính từ hai cạnh trong; bước qua cạnh trong thì sang diều bên cạnh, hai trục đổi vai cho nhau. Đường chéo đi theo hai cách (đi trục này trước hay trục kia trước): thường ra cùng một ô, chỉ ở sáu ô hoa thị đi về phía tâm mới ra hai ô — chính là hai nhánh qua tâm. Tia xe, tượng, ô mã, ô vua, ô tốt tiến và ăn tính sẵn hết một lần.

**Hai máy có tính cách**: **Hổ** dùng Best-Reply Search và cộng điểm cho quân đã sang nhà người, quân áp sát vua địch — dám đánh; **Rùa** dùng cách hoang tưởng và cộng điểm cho quân đứng che vua mình — chậm mà chắc. Cả hai tìm theo cây có cắt tỉa alpha–beta, tới đáy thì xét tiếp các nước ăn quân cho khỏi dừng giữa một cuộc đổi quân. Ba mức: **Dễ** (nghĩ 2 nước, chấm điểm có nhiễu), **Vừa** (3 nước), **Khó** (tìm sâu dần tới khi hết 1,5 giây — trên máy tính thường tới 4–5 nước, điện thoại ít hơn). Máy nghĩ ở **luồng riêng** (Web Worker dựng từ chính mã lõi, không tải tệp nào thêm, chạy được cả khi mất mạng), màn hình không đứng; nghĩ nhanh mấy cũng đợi gần nửa giây mới đi cho người xem kịp theo. Thỉnh thoảng nói một câu ngắn trong bong bóng: lúc vào trận, ăn quân, chiếu, mất quân, bị loại, thắng.

**Chơi**: chạm quân của mình thì thấy chấm ở các ô đi được (vòng đỏ là ăn quân); chạm hơi lệch ô nhỏ ở rìa thì tự bắt vào chấm gần nhất.

**Dễ nhìn nước đi** — người dùng: "giờ khó hình dung nước đi quá". Mỗi lượt của mình thì hai nhà kia đã đi hai nước, mà bản trước chỉ tô vàng nhạt hai ô của nước cuối cùng: ô đi ở xa ô đến, đường lại uốn qua tâm nên khó nối; chấm chỗ đi được màu sẫm nên chìm trên ô gỗ tối. Giờ:
- **Mũi tên nước vừa đi của từng nhà**, theo đúng đường quân đã đi (lõi có sẵn `duongDi` cho hình trượt quân; xe, tượng, hậu qua tâm thì cong theo cột, mã thì vòng cung), mỗi nhà một màu — Trắng kem viền nâu, Đỏ đỏ viền trắng, Đen xanh đen viền trắng cho nổi trên gỗ; ô đi, ô đến cũng tô theo màu nhà đó. Nước mới nhất đậm nhất, nước cũ mờ dần; đầu mũi tên dừng trước tâm ô cho khỏi che quân. Hoàn tác thì mũi tên lùi theo; ván qua mạng thì dựng lại cùng ván.
- **Chạm chọn quân là thấy mọi đường nó đi được**, vẽ theo đúng ô trên bàn — hậu ở d1 thì thấy cột d chạy lên, qua tâm rẽ sang nhà bên, hai đường chéo toả sang hai phía. Lúc đang chọn thì mũi tên nước cũ mờ bớt cho khỏi rối.
- **Chấm chỗ đi được** là chấm trắng viền xanh, ăn quân là vòng đỏ viền trắng — rõ trên cả ô sáng lẫn ô tối.
 Quân **trượt theo đúng đường đi** — xe đi qua tâm thì trượt cong theo cột; mã nhảy vòng. **Báo nguy**: vua mình bị chiếu thì vua đỏ rực, và đường đỏ đứt nét chạy từ từng quân đang chiếu tới vua, uốn theo đúng đường quân đó đi — biết ngay ai trong hai đối thủ đang nhắm mình. **Hoàn tác** (đấu với máy) về đầu lượt trước của bạn, bỏ luôn hai nước máy đi sau đó. Bạn bị loại khi đấu với máy thì được chọn xem hai máy đấu tiếp hay ván mới. Nút **?** có cách chơi và **hình động bốn cảnh**: xe đi cột e uốn qua tâm sang nhà Đỏ, tượng rẽ hai nhánh ở tâm, tốt ở d4 với ba ô ăn, mã tới 10 ô gần tâm.

**Hình**: bàn gỗ hai màu, mỗi nhà nhuộm nhẹ màu riêng, khung gỗ có bóng đổ, dải màu ba nhà dọc cạnh hàng quân, ngôi sao đồng nhỏ ở hoa thị; quân vẽ bằng nét (không dùng chữ ♔♕ — máy nào cũng giống nhau) có khối và bóng: Trắng ngà, Đỏ, Đen viền sáng cho nổi trên gỗ; quân ở ô sát tâm to hơn quân ở ô rìa nhỏ. Âm thanh tạo bằng Web Audio: cộc khi đi, trầm khi ăn, hai nốt khi chiếu, chuông trầm khi một nhà bị loại, nhạc khi thắng; tắt được ở bảng ván mới.

**Lưu đúng một mục** `tdtd.coba`: cách chơi, màu quân, mức khó, đã xem hướng dẫn, tên (chơi qua mạng) và phòng đang ở (để mở lại app là vào lại đúng ghế; rời phòng thì xoá). Không lưu ván.

`scripts/test-coba.js`, 68 bài: hình học (ô kề đối xứng, 6 ô góc, hoa thị đúng sáu ô d4/e4; ô kề khác màu, ô chéo cùng màu, mã luôn sang ô khác màu; cột h → cột a nhà bên phải, cột e uốn qua tâm → cột d, cột a, d sang nhà bên trái; chéo từ a1 rẽ hai nhánh ở d4 và chỉ sáu ô hoa thị mới rẽ; tốt ở d4 có đúng ba ô ăn như Dekle; mã đi ngược lại được, gần tâm tới 10 ô; tia xe, tượng đối xứng); luật (20 nước đầu ván mỗi nhà; thứ tự; nhập thành và không nhập thành qua ô bị xe Đỏ nhắm qua đường biên; tốt sang nhà Đỏ phong cấp ở hàng 1 của Đỏ; quân bị ghim qua tâm không được rời cột; Trắng mở đường cho Đen ăn vua Đỏ, Đỏ bị loại ngay, quân hoá đá; đá không chiếu ai nhưng ăn được; chiếu hết thì loại; hết nước thì bỏ lượt; còn vua cuối cùng thì thắng; thiếu quân thì hoà; báo nguy ra đúng quân và đường uốn qua tâm); máy nghĩ (cả hai cách tìm sâu 4 nước trong vài chục mili giây, ăn hậu bỏ không, máy đấu máy 36 nước toàn nước hợp lệ); giao diện (Hổ, Rùa đúng cách tìm; bạn đi rồi hai máy đáp; hoàn tác; chạm chọn quân, chạm ô đích; chạm giữa ô nào cũng ra đúng ô ở cả ba góc nhìn; cầm Đen thì bàn xoay cho Đen nằm dưới; không còn kiểu ba người chung máy; mũi tên nước vừa đi theo đúng đường (hậu qua tâm sang nhà khác), đủ ba nhà theo thứ tự, hoàn tác thì lùi theo; chọn quân thì có đường đi cho từng chỗ đến; chỉ lưu cài đặt; hình động bốn cảnh); gắn vào app. Thử phá code ở 12 chỗ (bỏ nhánh qua tâm, đổi hướng sai khi qua đường biên, cho tự để vua bị chiếu, đá vẫn chiếu, hết nước coi như chiếu hết, ăn vua không loại, đảo thứ tự, nhập thành qua ô bị nhắm, hoàn tác lệch lượt, bàn không xoay, máy coi hậu không đáng giá, tốt không phong): lần đầu bắt được 11 — chỗ "ăn vua không loại" lọt vì nhà mất vua vẫn bị loại một bước sau; thêm bài "loại ngay, không báo nhầm thành chiếu hết", giờ bắt cả 12.

Đã chơi thử trên trình duyệt cỡ điện thoại: bảng cách chơi hiện lần đầu; hình động đường đi; đấu với máy — đi e2–e4, Hổ và Rùa lần lượt đáp, Hổ nói câu chào; báo nguy với hậu Đỏ chiếu vua Trắng qua tâm; quân Đỏ hoá đá; phong cấp chọn Mã; chiếu hết nhà cuối cùng — "Bạn thắng!", Hổ nói "Hổ thua rồi… lần sau gặp lại!"; ba người chung máy — Trắng đi xong bàn xoay cho Đen nằm dưới (kiểu này sau đã bỏ).

### Luật Tam quốc: giết vua là chiếm cả đạo quân

Người dùng: "giờ làm biến thể cho kịch tính đi — nếu bên nào giết vua thì sẽ được bầu 1 quân bên chết làm tướng, tướng đi yếu như vua hiện tại, và các quân còn sống bên chết thuộc về quân giết, kiểu như đánh trận lúc xưa 3 nước thành có thể chiếm qua chiếm lại". Người dùng chọn: **người giết tự chọn tướng** (máy thì tự chọn), **thêm thành kiểu luật để chọn** (bảng ván mới có Thường / Tam quốc; phòng qua mạng thì chủ phòng chọn), và cho cập nhật luật Firebase.

**Luật trong app**: giết vua một nhà — ăn vua, hay chiếu hết — là cướp **mọi đạo quân** nhà đó đang giữ; vua bị chiếu hết thì bị bắt khỏi bàn, người giết là nhà đang chiếu (ưu tiên nhà vừa đi). Người giết **chạm một quân** của đạo quân vừa chiếm (vòng vàng nhấp nháy) để phong **tướng**: tướng đi từng ô như vua, không nhập thành, không phải giữ khỏi bị chiếu. Nhà khác **giết được tướng thì cướp luôn đạo quân**, lại phong tướng mới — chiếm qua chiếm lại. Chọn tướng xong thì ván đi tiếp đúng thứ tự, không ai mất lượt (chiếu hết Đen thì Trắng chọn tướng xong tới lượt Đỏ). Tới lượt mình thì đi một quân bất kỳ trong mọi đạo quân mình giữ. Mất vua của chính mình là thua; còn vua cuối cùng thì thắng. Tốt cướp được vẫn tiến theo hướng tốt của đạo gốc, phong cấp ở hàng 1 của nhà khác như cũ. Chọn tướng là chọn chiến thuật: phong tốt thì giữ được hậu mạnh, nhưng tướng nằm chỗ hở thì nhà kia giết để cướp cả đạo quân.

**Hình**: quân đổi sang màu nhà đang cầm, chân quân có vành màu đạo gốc; tướng đội mũ trụ, cầm cờ hiệu màu đạo quân mình cầm đầu; tướng vừa phong loé sáng một nhịp. Thẻ mỗi nhà ghi "giữ N đạo quân"; dòng lượt báo ai đang chọn tướng; lời báo kiểu "Hổ giết vua Bình! Cả đạo quân Đen về tay Hổ", "Rùa giết tướng, cướp đạo quân Đỏ từ tay Hổ!"; Hổ, Rùa có câu khi cướp được ("Đạo quân này giờ theo Hổ!") và khi bị cướp ("Dám cướp quân của Hổ à!").

**Lõi**: mã quân vẫn là đạo gốc nhân 8 cộng loại, thêm loại 7 là tướng; `t.chu[D]` là nhà đang cầm đạo quân D (luật thường thì luôn là D). Mọi chỗ xét "quân của ai" — sinh nước, ô bị nhắm, chiếu, chấm điểm — đổi sang nhà đang cầm; chỗ nào xét hướng tốt, hàng phong cấp, nhập thành thì vẫn theo đạo gốc. Phong tướng là một nước đặc biệt: ô đi = ô đến, nên ghi lên máy chủ như mọi nước khác (luật Firebase vẫn nhận) và máy người khác tính lại y hệt. Đang chờ chọn tướng thì nước hợp lệ duy nhất là các nước phong tướng. Lúc máy nghĩ thử, cướp được đạo quân thì phong tướng luôn (quân rẻ, không bị nhắm — cũng là cách máy chọn thật) để cây tìm kiếm khỏi phải dừng; đi rồi hoàn lại trả đúng thế cờ. Cướp được đạo quân là điểm vọt lên ngay, nên máy tự biết rình vua, rình tướng.

**Phòng qua mạng nhớ luật**: thêm ô `luat` (chỉ nhận `"tq"`, chỉ ghi lúc tạo phòng) vào `firebase-rules.json` rồi xuất bản lại; thử bằng yêu cầu thật: tạo phòng Tam quốc được, phòng thường vẫn được, đổi luật sau khi tạo bị chặn, luật lạ bị chặn, nước phong tướng ghi được.

`scripts/test-coba.js` thêm 17 bài: ăn vua thì cả đạo quân đổi chủ, lượt ở lại người giết để chọn tướng, lúc đó chỉ có nước phong tướng; phong xong tới đúng nhà kế; đi được quân vừa chiếm, tướng đi như vua; tốt cướp được tiến theo hướng gốc; nhà thứ ba giết tướng thì cướp đạo quân, chọn tướng mới, bỏ qua nhà đã loại; chiếu hết thì vua bị bắt, đạo quân về nhà đang chiếu, chọn tướng xong tới lượt nhà sau nhà vừa bị loại; Trắng mở đường cho xe Đỏ chiếu hết Đen thì đạo quân về Đỏ, Đỏ chọn tướng xong vẫn được đi lượt của mình; luật thường không đổi; máy chọn tốt không bị nhắm, không lấy tốt gần tâm đang bị xe nhắm, cũng không lấy hậu; đi rồi hoàn lại luôn trả đúng thế cờ, máy tự đánh Tam quốc toàn nước hợp lệ (có cướp quân, có phong tướng); trên giao diện: chạm mã Đỏ để phong tướng. Thử phá 5 chỗ (giết vua không cướp quân, giết tướng không cướp đạo quân, chọn tướng xong đi tiếp sai chỗ, máy chọn tướng không tránh quân bị nhắm, nghĩ thử phong tướng mà không ghi để hoàn lại): lần đầu lọt 2 — thế thử cũ có người chiếu cũng là người vừa đi, và quân an toàn tình cờ cũng rẻ nhất; thêm thế mở đường và đổi chỗ quân bị nhắm, giờ bắt cả 5. `scripts/test-phong.js` thêm 3 bài: phòng Tam quốc nhớ luật, không đổi được luật, nước phong tướng qua máy chủ được nhận, nước thường lúc đang chờ chọn tướng thì không.

### Chơi qua mạng: tạo phòng, mỗi người một máy

Người dùng: "cờ vua 3 người làm tạo phòng để chơi nhiều máy đi, đừng làm đánh trên 1 máy". Bỏ kiểu ba người chung máy; bảng ván mới còn **Đấu với 2 máy** và **Chơi qua mạng** (tên, màu quân, mức máy cho ghế trống, **Tạo phòng**, hay gõ **mã phòng** của bạn để vào). Người dùng chọn: dùng **Firebase**, ghế trống thì **máy chơi thay**, giữ đấu với 2 máy.

**Tìm hiểu trước khi chọn chỗ chuyển nước đi** (app là trang tĩnh, chưa có máy chủ):

- **ntfy.sh** (không cần tài khoản): mỗi địa chỉ mạng chỉ 250 tin một ngày, 60 yêu cầu rồi một yêu cầu mỗi 5 giây, vượt nhiều thì bị khoá địa chỉ ([tài liệu](https://docs.ntfy.sh/publish/#limitations)) — ba người chung Wi-Fi chơi một ván dài là gần hết; các máy chủ MQTT công cộng thì ghi rõ chỉ để thử.
- **Firebase Realtime Database**: REST nhận luồng sự kiện EventSource từ trình duyệt — `put` thay cả một chỗ, `patch` thay vài khoá, kèm đường dẫn ([tài liệu](https://firebase.google.com/docs/database/rest/retrieve-data#section-rest-streaming)); gói miễn phí Spark 100 kết nối cùng lúc (chừng 33 ván song song). Không cần thư viện nào.
- **Upstash Redis qua Vercel**: 500 nghìn lệnh mỗi tháng miễn phí, nhưng phải hỏi đi hỏi lại máy chủ.

**Cài Firebase** (người dùng nhờ làm giúp bằng trình duyệt của họ): tài khoản đã hết lượt tạo dự án mới, bốn dự án cũ đều có database ở Mỹ đang dùng cho việc khác (thay luật là có thể làm hỏng app cũ), nên tạo database trong **Default Gemini Project** — vốn chưa có database — đặt ở **Singapore**, chế độ khoá, gói Spark. Địa chỉ nằm trong `assets/phong.js` (địa chỉ, không phải mật khẩu).

**Luật bảo vệ** (`firebase-rules.json`, dán vào thẻ Rules): gốc đóng; ai có mã thì đọc được phòng đó, không ai liệt kê được các phòng; tạo phòng chỉ khi mã chưa có; ghế (`ghe/P/id`) giành một lần, trước khi bắt đầu; nước đi (`nuoc/n`) chỉ thêm, ghi một lần, sau khi bắt đầu, đúng năm số trong khoảng; mốc bắt đầu, hết ván, lời mời ván nữa ghi một lần; giờ phải là giờ máy chủ; khoá lạ bị chặn. Đã gửi thử 30 yêu cầu thật lên database: được và bị chặn đúng từng cái. **Không dọn phòng bằng câu tìm**: định cho người tạo phòng tìm các phòng quá một ngày để xoá, nhưng thử từng vế thì Firebase chỉ cho so `endAt` bằng dấu bằng (`query.endAt == 1000` qua, `query.endAt < 2000` bị chặn với cùng câu tìm), mà mở câu tìm không giới hạn tuổi thì ai cũng lấy được mã các phòng đang chơi. Thay bằng: hết ván ghi mốc `xong`, **đủ 5 phút thì ai rời phòng sau cùng xoá luôn** (đã thử: xoá sớm bị chặn, sau 5 phút xoá được); phòng quá một ngày thì ai mở lại cũng xoá.

**Cách các máy giữ cùng một ván**: máy chủ chỉ giữ danh sách nước đi; máy nào cũng đọc lần lượt từ đầu và tự tính thế cờ bằng chính lõi luật, nên máy chủ không cần hiểu cờ. Mình đi thì áp liền (quân vẫn trượt) rồi ghi vào ô kế tiếp; ai ghi trước vào ô đó thì nước đó được (luật chỉ cho ghi một lần). Nước sai luật — người lạ biết mã ghi bừa — thì máy nào cũng bỏ qua như nhau. Máy mình ghi sau bị từ chối, hay danh sách trên máy chủ lệch với các nước đã áp, thì dựng lại ván từ đầu danh sách (nhanh, không trượt quân). Vào phòng giữa ván hay mở lại app thì áp ngay hết các nước đã có; trang đang ẩn (chuyển sang app khác) cũng áp ngay, khỏi dồn hình động. Firebase trả khoá số liền nhau thành mảng có chỗ `null` (đo thật: `"ghe":[{…},null,{…}]`), `phong.js` đổi hết về đối tượng.

**Ghế trống, người vắng**: chủ phòng bấm Bắt đầu lúc nào cũng được — ghế chưa có ai thì Hổ, Rùa chơi thay; chủ phòng vắng thì người khác bấm được. Máy chơi thay do **máy của người ngồi ghế số nhỏ nhất còn ở đây** nghĩ giùm rồi ghi nước, nên không ai nghĩ trùng. Mỗi 20 giây máy báo "còn ở đây" bằng giờ máy chủ (đo lệch đồng hồ qua dấu giờ của chính mình); im quá 60 giây là vắng. Tới lượt người vắng thì người khác thấy nút **Cho máy đi thay** — máy chơi thay ghế đó; người đó mở lại app thì thấy **Tự đi tiếp**. Người vào sau khi ván đã bắt đầu thì **xem**: thấy ván chạy, không đi được quân.

**Mời bạn**: nút Gửi link mời mở bảng chia sẻ với link `…/co-vua-ba-nguoi/?phong=MÃ` — trang chia sẻ riêng của trò (Zalo, Messenger hiện tên và ảnh của cờ ba người) chuyển thẳng vào `#co-ba-nguoi/MÃ`; `app.js` chỉ xét phần trước dấu `/` để mở đúng trò. Mã 6 ký tự không có I, O, 0, 1 cho khỏi đọc nhầm. **Hết ván**: Chơi ván nữa — ai bấm trước thì giữ chỗ mã phòng mới trong phòng cũ, người khác bấm Vào ván mới và tự ngồi lại ghế cũ. Bảng ván mới nói rõ: nước đi và tên gửi qua máy chủ Firebase của Google, ai có mã phòng thì xem được.

`scripts/test-phong.js`, 35 bài (sau thêm 3 bài phòng Tam quốc), chạy ba "máy" — ba bản app riêng, mỗi bản một kho lưu — trên máy chủ giả `scripts/fb-gia.js` (làm đúng những gì đã đo trên Firebase thật: REST, luồng sự kiện, khoá số thành mảng, giờ máy chủ, luật): mã phòng và đổi dữ liệu Firebase; tốt phong cấp qua mạng nhận Hậu, Xe, Tượng, Mã; tạo phòng, vào bằng mã, hai người bấm cùng một ghế thì đúng một người được; bắt đầu, Hổ chơi thay ghế trống, người thua ghế thành người xem; đi quân, máy An nghĩ giùm Hổ, ba máy cùng thế cờ, máy chủ không phải từ chối lần ghi nào; nước sai luật bị bỏ qua; máy Đen chưa kịp nhận mà ghi trùng ô thì bị từ chối và dựng lại; người vắng hơn 60 giây thì cho máy đi thay, quay lại thì đuổi kịp và tự đi tiếp; hết ván, ván nữa, tự ngồi lại ghế; xoá sớm bị chặn, đủ 5 phút thì dọn; mã sai; phòng quá hạn. Thử phá 7 chỗ: bắt được 5 sau khi thêm bài phong cấp; hai chỗ còn lại không đổi kết quả (dừng ở nước sai luật thì lượt sau chạy tiếp; ghi nước hỏng mà không dựng lại thì bước so danh sách vẫn dựng lại). Chạy lặp 15 lần thì thấy hỏng lác đác: máy chủ giả lấy giờ hai lần trong một yêu cầu, đồng hồ nhích 1 ms là dấu giờ lệch với giờ xét luật nên bị từ chối — sửa cho mỗi yêu cầu một mốc giờ như Firebase; chạy lại 15 lần không hỏng lần nào.

Đã chơi thật trên database với ba thẻ trình duyệt khác địa chỉ (ba kho lưu riêng như ba điện thoại): An tạo phòng, Bình vào bằng link mời, An bấm Bắt đầu, Hổ chơi thay ghế Đỏ; An đi, Bình nhận và đi, Hổ do máy An nghĩ giùm — thế cờ hai máy giống hệt từng ô; thẻ thứ ba vào bằng link thành người xem, cùng thế cờ; Bình đóng thẻ, quá 60 giây An thấy "Cho máy đi thay Bình", Rùa đi thay; Bình mở lại thấy "Tự đi tiếp"; ván nữa thì Bình theo vào và tự ngồi lại ghế Đen. Trong lúc thử còn có một ván chơi trọn qua khung trình duyệt: 99 nước, máy đi thay An lúc An vắng, tới "Rùa thắng!", rồi Chơi ván nữa.

### Tạo phòng, vào phòng: làm lại cho dễ dùng

Người dùng: "chỗ tạo phòng vô phòng khó sài quá, xem lại UIUX đi". Trước khi sửa, đi lại từng bước ở khổ điện thoại 375 px, ghi ra các chỗ vướng:

- Bảng ván mới dồn mọi thứ vào một bảng dài (luật, tên, màu, mức máy, Tạo phòng), ô nhập mã nằm tận cuối — người có mã phải kéo qua hết.
- Ô nhập mã chỉ nhận 6 ký tự: dán link mời vào là bị cắt còn "http:/", không vào được.
- Tạo phòng xong, nút nổi nhất là **Bắt đầu** — bấm nhầm là chơi một mình với hai máy; Gửi link mời chỉ là nút phụ. Mã phòng không có nút chép, bạn ngồi cạnh phải đọc rồi gõ tay.
- Người mở link phải tìm ô tên rồi bấm "Ngồi đây" trên từng dòng ghế.
- Bấm Rời phòng giữa ván là rời luôn, không hỏi.

Giờ:

- **Ván mới**: ba thẻ lớn có hình và một dòng giải thích — Đấu với 2 máy · Tạo phòng, mời bạn · Vào phòng của bạn; mỗi lối một màn ngắn có nút Quay lại, vừa một màn hình.
- **Vào phòng**: ô nhập mã to; dán cả link hay nguyên tin nhắn mời cũng được, ô tự rút còn 6 ký tự; nút Vào phòng chỉ sáng khi mã đúng khuôn.
- **Phòng chờ** đổi theo người đang xem:
  - Chủ phòng, chưa ai vào: mã phòng to có nút **Chép mã**, ba ghế một hàng, **Gửi link mời** là nút chính, **Hiện mã QR** cho bạn ngồi cạnh quét; Bắt đầu là nút phụ ở dưới, ghi rõ "máy chơi thay 2 ghế trống".
  - Có bạn vào rồi: Bắt đầu thành nút chính; đủ ba người thì thôi nút mời và mã QR.
  - Người mở link: "An mời bạn chơi cờ ba người", mỗi ghế trống một nút **Vào chơi quân Đen / Vào chơi quân Đỏ** — một chạm là ngồi; ghế trống ghi "Chờ bạn".
  - Người được mời đã ngồi: "Chờ An bấm Bắt đầu…", không có nút Bắt đầu. Chủ phòng vắng quá một phút — có khi chỉ đang ở Zalo gửi link — mới hiện Bắt đầu, mà là nút phụ, cho khỏi bấm nhầm lúc người thứ ba chưa kịp vào.
- **Rời phòng giữa ván** thì hỏi lại; ghế đứng yên, mở lại link là ngồi lại đúng ghế. **Rời phòng chờ** cũng nhớ ghế: ghế đã giành thì máy chủ không cho xoá, trước đây không nhớ nên chính ghế cũ của mình chặn mình.
- **Tải lại trang** thì báo "còn ở đây" ngay lượt kiểm đầu (≤5 giây) thay vì đợi 20 giây — trước đây trong lúc đó người khác thấy mình vắng, người được mời lại thấy nút Bắt đầu.

**Mã QR tự vẽ** (`assets/maqr.js`, không thư viện, chạy cả khi mất mạng): theo ISO/IEC 18004 — kiểu byte UTF-8, mức sửa lỗi M (chịu chừng 15% ô hỏng), phiên bản 1–6; link mời trên trang thật 69 ký tự rơi vào phiên bản 5 (37×37 ô). Cách đặt chuỗi định dạng, mặt nạ và điểm phạt theo bản cài mẫu của Nayuki. `scripts/test-maqr.js`, 12 bài: chuỗi định dạng mức M đúng bảng trong chuẩn, đa thức sinh 10 mã sửa lỗi, mã sửa lỗi của ví dụ "HELLO WORLD" 1-M (bài hướng dẫn QR của Thonky), bảng khối mức M; rồi đọc ngược bằng một bộ đọc viết riêng theo định nghĩa trong chuẩn (hai bản chuỗi định dạng, công thức mặt nạ theo hàng i cột j, đọc zíc zắc, tách khối, soát mã sửa lỗi, giải kiểu byte): link mời, chữ có dấu, sát sức chứa từng phiên bản, 300 chữ ngẫu nhiên đi qua đủ 8 mặt nạ, SVG vẽ đúng từng ô. Thử phá 12 chỗ (mặt nạ đảo hàng cột, bỏ ô luôn đen, bản định dạng thứ hai lệch một ô, đa thức sinh sai gốc, zíc zắc sai chiều, ô căn chỉnh sai chỗ, mã sửa lỗi không xen kẽ, sức chứa tính sai, BCH sai đa thức, lề 3 ô, độ dài 9 bit, mặt nạ 1 theo cột): bắt cả 12. Trên trình duyệt quét bằng BarcodeDetector: phiên bản 1, 3, 5, 6 đọc đúng, mã trong phòng chờ ra đúng link mời.

`scripts/test-phong.js` thêm 10 bài (giờ 48): chủ phòng chưa ai vào thì Gửi link mời là nút chính, Bắt đầu nút phụ nằm dưới; bấm hiện mã QR thì mã chính là link mời, bấm lần nữa thì ẩn; người mở link thấy mỗi ghế trống một nút theo đúng thứ tự đi; có bạn vào thì Bắt đầu lên nút chính; người được mời chờ chủ phòng, chủ phòng vắng thì Bắt đầu chỉ là nút phụ; đủ ba người thì thôi mời; rời phòng chờ rồi mở lại link thì ngồi lại đúng ghế; tải lại trang thì báo còn ở đây ngay; ô nhập mã nhận mã trần, link, nguyên tin nhắn mời, chặn mã sai khuôn. Thử phá 7 chỗ trong phòng chờ: bắt cả 7; bỏ hai chỗ sửa (nhớ ghế khi rời phòng chờ, báo ngay khi tải lại) thì đúng bài tương ứng hỏng.

Đã thử trên trình duyệt khổ 375 px với hai địa chỉ khác nhau như hai máy, trên database thật: tạo phòng, hiện mã QR, mở link ở máy kia, một chạm vào ghế Đen, chủ phòng thấy Bắt đầu lên nút chính; rời phòng chờ, dán nguyên tin nhắn mời vào ô mã, vào lại đúng ghế. Lúc thử tìm ra và sửa thêm: ô nhập mã rộng hơn khung làm bảng lệch ngang khi gõ; chữ "Bắt đầu — máy chơi thay 1 ghế trống" gãy hai dòng trong nút cao cố định (giờ là "Bắt đầu" kèm dòng nhỏ bên dưới).

### Xem nước đi từng quân, quân đã mất

Người dùng: "trong lúc chờ cho nhấn để xem nước đi từng con (option trước khi vô phòng), cho biết quân mình bị mất con nào nữa". Làm cả hai cách hiểu chữ "lúc chờ": chờ trong phòng chờ trước khi vào ván, và chờ tới lượt mình trong ván.

- **Xem cách đi từng quân** (nút ở phòng chờ — cả lúc chưa vào ghế — và ở bảng Cách chơi): bàn trống, một quân của nhà mình; hàng nút Vua, Hậu, Xe, Tượng, Mã, Tốt, luật Tam quốc thêm Tướng. Mỗi quân đặt sẵn ở ô cho thấy rõ cái lạ của bàn ba người: xe ở e1 (cột e qua tâm uốn sang nhà Đỏ, 14 ô), tượng ở a1 (tới ô sát tâm rẽ hai nhánh), mã ở d4 (10 ô), tốt ở e2 (tô đỏ hai ô ăn chéo), vua, hậu, tướng ở d4. Vẽ mọi đường đi theo đúng đường uốn; chạm chấm thì quân trượt tới theo đường, chạm ô khác thì đặt quân vào đó; dòng dưới ghi quân đang ở ô nào, đi được mấy ô, và cách đi. Đang xem mà phòng đổi thì bảng phòng chờ không bật lại — chỉ báo "Chi vừa vào chơi quân Đỏ", dòng dưới tên trò ghi "Phòng … · 3/3 người · chờ An bắt đầu"; chủ phòng bấm Bắt đầu thì bảng xem tự đóng, vào ván luôn. Mở từ Cách chơi giữa ván thì ván vẫn chạy phía sau: nước mới áp ngay, không kẹt chờ hình động.
- **Trong ván, lúc chưa tới lượt mình** (hay chạm quân nhà khác lúc tới lượt): chạm quân nào cũng thấy quân đó đi được đâu theo thế cờ lúc này — đường màu tím (xanh là quân mình đang đi), kèm lời báo kiểu "Mã đen của Hổ: 3 nước đi được (chỉ xem)". Chạm chấm không đi; có nước mới thì thôi xem.
- **Quân đã mất**: thẻ mỗi nhà có một hàng hình quân nhỏ, vẽ bằng chính nét quân trên bàn, quân quý trước, cùng loại xếp chồng. Quân mất ghi cho nhà đang cầm quân lúc bị ăn — luật Tam quốc thì quân cướp được bị ăn tính cho người đang cầm, bị chiếu hết thì vua bị bắt khỏi bàn cũng ghi là mất vua. Quân mình bị ăn thì báo "Hổ ăn mã của bạn."; chạm thẻ thì báo bằng chữ, như "Bạn (Trắng) đã mất: hậu, 2 tốt."; hoàn tác thì quân mất cũng lùi về.

**Sửa kèm**, tìm ra lúc làm:

- Luật Tam quốc: tới lượt mình mà chạm quân của đạo quân vừa chiếm thì không chọn được — giao diện chỉ cho chạm quân đạo gốc, dù luật cho đi mọi đạo quân mình giữ.
- Nước phong tướng (ô đi trùng ô đến) bị tính như ăn chính quân vừa phong, nên "ăn N điểm" cộng sai — lộ ra khi thẻ người phong tướng hiện mất một quân.
- Mở Cách chơi từ phòng chờ rồi bấm Chơi thì về bảng Ván mới thay vì về phòng chờ.
- Lời báo và câu nói của máy cùng hiện trên đầu bàn nên che nhau ("Xin nhé!" che mất "Hổ ăn mã của bạn"): giờ có lời báo thì bong bóng tắt, câu nói tới lúc đang báo thì đợi báo tắt.
- `scripts/test-phong.js` lâu lâu hỏng bài "Rùa chơi thay ghế Đen" (2/10 lần ở bản đang chạy): bài chỉ chờ hai máy rảnh rồi so thế cờ, có lúc người xem chưa nhận nước cuối (luồng sự kiện tới sau vài mili giây). Không phải lỗi app; sửa cho chờ tới khi hai máy khớp, chạy lại 25 lần không hỏng.

`scripts/test-coba.js` thêm 22 bài (giờ 90): xem cách đi — xe e1 đủ 14 ô dù ván đang có quân chắn, luật thường không có Tướng, mã d4 đủ 10 ô, chạm chấm thì trượt rồi đứng ở ô mới, chạm ô khác thì đặt quân, tốt e2 đếm cả ô ăn chéo, bấm Xong về lại Cách chơi và nút của ván hiện lại, đang xem mà hai máy đi thì nước áp ngay; chạm xem — mã Đen ra đúng các nước của nó, chạm chấm không đi, quân mình lúc tới lượt vẫn chọn để đi, lúc máy đang nghĩ thì chỉ xem, máy đi xong thì thôi xem, Tam quốc chọn được quân vừa chiếm; quân đã mất — Hổ ăn mã thì thẻ bạn ghi mã và có lời báo, bong bóng không che lời báo, chạm thẻ báo bằng chữ, hoàn tác lùi về, ăn vua ghi đúng nhà mà phong tướng không tính điểm, chiếu hết Tam quốc ghi mất vua, ván Tam quốc có Tướng. `scripts/test-phong.js` thêm 4 bài: mở Cách chơi từ phòng chờ rồi bấm Chơi thì về phòng chờ, bấm xem thì bảng phòng chờ ẩn, Chi vào lúc đang xem thì chỉ báo, chủ phòng bắt đầu thì bảng xem tự đóng. Thử phá 19 chỗ (không ghi quân mất, ghi cho người ăn, quên vua bị bắt, hoàn tác không lùi, phong tướng lại tính là ăn, không báo, chọn quân theo đạo gốc, chạm chấm của quân đang xem cũng đi, tính nước theo nhà tới lượt, chưa tới lượt thì chạm không làm gì, bàn xem lấy thế cờ của ván, trượt xong không đổi ô, nước máy kẹt chờ hình động, Xong không trả nút, phòng đổi thì bật lại bảng, bắt đầu không đóng bảng xem, Chơi về Ván mới như cũ, báo mà không tắt bong bóng, bong bóng không đợi): bắt cả 19.

Đã thử trên trình duyệt khổ 375 px: xem xe, mã, tốt, chạm cho mã trượt sang nhà Đỏ, Xong về lại Cách chơi; mở từ phòng chờ trên database thật thì dòng dưới tên trò ghi tình hình phòng, Về phòng chờ thì bảng hiện lại; trong ván với hai máy, chạm mã của Hổ lúc tới lượt mình thì hiện đường tím, Hổ ăn mã thì thẻ bạn có hình mã và lời báo hiện rõ. Lúc thử rút gọn chữ trên nút (bản đầu "Trong lúc chờ: xem cách đi từng quân" gãy hai dòng) và chữ tình hình phòng (bị cắt), tăng cỡ hình quân mất từ 15 lên 17 px.

### Chép link mời

Người dùng: "gửi link mời cho sao chép link nữa". Trên điện thoại, "Gửi link mời" mở bảng chia sẻ của máy; muốn dán link vào chỗ khác (nhóm chat, ghi chú) thì phải tìm nút sao chép trong bảng đó. Giờ cạnh "Gửi link mời" có nút **Chép link**; máy không có bảng chia sẻ (trình duyệt trong Zalo, Messenger, máy tính) thì chỉ một nút **Chép link mời**. Chép bằng clipboard; không được thì bằng cách cũ (textarea + execCommand — trình duyệt trong app chat có lúc chỉ chạy cách này); cả hai đều không được thì hiện link trong ô cho chạm giữ mà chép. Bấm xong nút đổi thành "Đã chép ✓". Bảng phòng giữa ván cũng có "Chép link xem ván".

**Sửa kèm**: lời báo nằm dưới bảng, nên lúc bảng phòng chờ đang mở thì không thấy — bấm Chép mã, vào ghế bị người khác giành trước, mất mạng lúc bắt đầu đều không thấy báo gì. Giờ đang có bảng thì lời báo dời xuống cuối màn hình, nằm trên bảng.

`scripts/test-phong.js` thêm 5 bài (giờ 57): điện thoại có hai nút; bấm Chép link thì chép đúng link mời, nút đổi chữ, lời báo nằm trên bảng; máy không có bảng chia sẻ thì một nút Chép link mời; chép không được thì hiện ô link; bấm Xong về lại phòng chờ. Đã thử trên trình duyệt khổ 375 px với database thật: hai nút cạnh nhau, bấm Chép link thì nút thành "Đã chép ✓" và lời báo hiện rõ ở cuối màn hình.

### Quân cờ vẽ lại theo dáng Staunton

Người dùng: "làm UIUX quân cờ đẹp hơn được không". Tìm hiểu trước khi vẽ: [chuẩn thiết bị cờ của FIDE](https://handbook.fide.com/chapter/ChessEquipmentWithoutElectronicComponenets032026) (bản có hiệu lực từ 1/3/2026; [bản 2022](https://handbook.fide.com/chapter/StandardsOfChessEquipment2022) cùng số liệu) quy định quân theo dáng Staunton; thứ tự cao thấp vua > hậu > tượng > mã > xe > tốt, chuẩn 95 / 85 / 70 / 60 / 55 / 50 mm, được lệch tối đa 10%; đế rộng 40–50% chiều cao; đầu vua phải khác hẳn đầu hậu, đầu tượng khác đầu tốt (thường là khe chéo); mặt mờ, không bóng loáng; hai bên phân biệt được cả với người mù màu. Bản trước quân nào cũng cao gần bằng nhau (tốt gần bằng hậu), tô một dải chéo.

- **Dáng**: thân tiện đối xứng vẽ bằng đường cong mượt qua các điểm điều khiển — đế có gờ, thân thắt eo, khấc cổ. Vua đội vương miện có thập tự; hậu đội vương miện năm mũi có hạt; tượng đội mũ có khe chéo và hạt trên đỉnh; xe có răng thành; mã là đầu ngựa có tai, mắt, lỗ mũi, bờm; tốt đầu tròn trên vành cổ. Tướng (Tam quốc) đội mũ trụ, cầm cờ hiệu màu đạo quân.
- **Cỡ**: vua 1,10 thì hậu 1,01, tượng 0,88, mã 0,76, xe 0,70, tốt 0,63 — đổi ra mm với vua 95 là 87 / 76 / 66 / 60 / 54, đều trong khoảng FIDE cho phép, nghiêng về phía cao để quân nhỏ khỏi bé quá trên ô nhỏ. Đế rộng hơn chuẩn (51–73% chiều cao thay vì 40–50%, quân thấp rộng hơn) cho dễ nhận ra trên điện thoại. Cả bộ to hơn bản trước chừng 12%.
- **Tô**: như gỗ tiện mặt mờ — sáng bên trái, tối dần sang phải, mép ngoài tối nhất, trên sáng dưới tối, vạch rãnh ở các khấc; bóng đổ mềm dưới đế. Trắng màu ngà, Đỏ sơn mài trầm, Đen gỗ mun viền tối (bản trước viền sáng trông như miếng dán) — ba độ sáng khác nhau cho người mù màu. Hàng quân mất trên thẻ (nền tối) vẫn vẽ quân Đen viền sáng.
- **Quân đang chọn nhấc lên khỏi bàn**, bóng ở lại dưới, vẽ sau cùng nên nằm trên đường đi (trước đây đường đi vẽ đè lên quân).

Đo trên trình duyệt: vẽ cả bàn 48 quân chừng 0,85 ms một khung hình. `scripts/test-coba.js` thêm 3 bài (giờ 93): thứ tự cao thấp đúng FIDE, đổi ra mm thì quân nào cũng trong khoảng ± 10%, vẽ đủ bảy loại × ba màu và quân đá × vành đạo gốc × nhấc lên vào một khung ghi lại không ra số hỏng và save/restore cân nhau. Thử phá 4 chỗ (tốt cao như cũ, mã cao quá khoảng, quên trả save, thiếu bán kính đế tướng): bắt 3; chỗ còn lại không đổi gì vì đã có giá trị dự phòng.

### Cài app từ trò nào thì mở app là vào thẳng trò đó

Người dùng hỏi: "khi tải app trong mỗi game là vô app có tự động vô game không hay bay ra trang chủ". Bản trước: ra trang chủ, cài từ trò nào cũng vậy. Tìm hiểu: trang mở đầu của app lấy theo manifest lúc cài — Chrome trên Android mở `start_url` ([web.dev: WebAPK](https://web.dev/webapks/)); Safari trên iPhone lúc "Thêm vào MH chính" cũng lấy `start_url` của manifest chứ không lấy trang đang xem ([một báo lỗi của GitLab](https://gitlab.com/gitlab-org/gitlab/-/issues/427560) gặp đúng chuyện này). Manifest có `start_url: "."` nên app mở trang chủ. Người dùng chọn: vào thẳng trò đã cài (vẫn một app Thông Điệp; các lựa chọn khác là mỗi trò một app riêng có biểu tượng riêng, hay mở lại chỗ dùng lần trước).

- **Mỗi trò một manifest** (`<trò>/app.webmanifest`, 14 tệp, viết bằng `scripts/lam-ke-khai.py` từ danh sách trò trong `assets/app.js`): giống hệt `manifest.webmanifest`, chỉ khác `start_url` = `/?tro=<trò>`. Cùng `id: "/"` (thêm vào manifest chính, trùng id ngầm định cũ nên app đã cài không bị coi là app khác), nên vẫn là một app — Chrome nhận ra là đã cài, không mời cài lần nữa. Vercel trả đúng kiểu `application/manifest+json`.
- **Đang ở trò nào thì trang gắn manifest của trò đó**, về trang chủ thì manifest chính — cài lúc đang chơi cờ thì trang mở đầu của app là cờ. (Safari không đọc lại manifest khi thẻ đổi, nên trên iPhone cách này không ăn — xem *Thêm vào MH chính trên iPhone* bên dưới.)
- **iPhone**: app trên màn hình chính có kho lưu riêng, tách hẳn Safari ([WebKit làm vậy có chủ ý](https://bugs.webkit.org/show_bug.cgi?id=181849)), nên chỉ trang mở đầu mang được trò sang. **Android**: app dùng chung kho lưu với Chrome, nên lúc cài xong (sự kiện `appinstalled`, cài bằng nút Cài app hay menu Chrome) ghi thêm trò đang mở — phòng khi Chrome cài theo manifest đã đọc từ trước.
- **App mở với `?tro=`** thì nhớ trò vào kho của app; lần mở app sau vào thẳng trò; bấm ✕ là về trang chủ. Tải lại trang (app tự cập nhật bản mới) thì giữ chỗ đang đứng, không tự mở lại trò. Trong app luôn gắn manifest của trò đã cài, kẻo Chrome kiểm bản cập nhật đúng lúc đang ở trò khác rồi đổi trang mở đầu theo trò đó. Link `?tro=<trò>` mở ngoài app cũng vào thẳng trò, nhưng không nhớ gì.
- Ai đã cài trước bản này thì app vẫn mở trang chủ như cũ; gỡ biểu tượng rồi cài lại từ trong trò là được.

`scripts/test-sao.js` thêm 12 bài (giờ 209): 14 manifest riêng đúng id, start_url, scope, tên, biểu tượng; Vercel trả đúng kiểu; chạy nguyên khối trong app.js trên trình duyệt giả — app mở lần đầu với ?tro thì nhớ trò, gắn manifest của trò, vào thẳng trò; mở lần sau vẫn vào; tải lại thì không tự mở lại; địa chỉ có #trò khác thì theo địa chỉ; trong app ở trò khác vẫn giữ manifest của trò đã cài; trong trình duyệt manifest đổi theo trò; cài xong ghi trò (Android); trò lạ thì bỏ; link ?tro ngoài app; gắn đúng chỗ vào moSao, goNutTro, init. Thử phá 6 chỗ: bắt cả 6. Đã thử trên trình duyệt: mở cờ thì manifest thành `co-vua-ba-nguoi/app.webmanifest` (trang mở đầu `/?tro=co-ba-nguoi`), đóng thì về manifest chính; link `?tro=co-ba-nguoi` vào thẳng cờ. Chưa thử được trên iPhone, Android thật (khung trình duyệt không giả được chế độ app đã cài) — cần cài thử.

Sửa kèm: dòng chữ của ngôi sao cờ ba người còn ghi "3 người chung máy" (đã bỏ từ khi có chơi qua mạng), giờ ghi "mỗi người một máy qua mạng".

### Phòng mở: tìm phòng đang chờ, vào chơi không cần mã

Người dùng: "làm tìm phòng trống không có mật khẩu để mọi người tự vô chơi nữa". Phòng riêng vẫn như cũ — mã 6 ký tự như mật khẩu, luật Firebase không cho ai liệt kê các phòng.

- **Tạo phòng** có thêm "Ai được vào": *Bạn bè có link* (mặc định, như cũ) hay *Mọi người*. Chủ phòng đổi được ngay trong phòng chờ ("Cho người lạ tìm thấy phòng này" / "Thôi cho người lạ vào") — bạn bè không tới thì mở cho người lạ.
- **Bảng Ván mới** có thêm *Tìm phòng đang chờ*: danh sách phòng mở — "Phòng của An · Luật thường · còn 2 ghế · vừa tạo" — tự làm mới mỗi 4 giây; chạm là vào thẳng phòng chờ (ghi "Phòng mở · Phòng của An"), chọn quân là chơi. Chưa có phòng nào thì có nút *Tạo phòng mở*.
- **Cách làm**: chủ phòng mở ghi một dòng ngắn vào `/sanh/<mã>` — tên, luật, số ghế trống, dấu giờ — sửa ngay khi có người vào, báo "còn ở đây" cùng nhịp với ghế của mình; vào đủ người, bắt đầu ván, đổi về phòng riêng hay chủ phòng rời đi thì xoá dòng. Chủ phòng tắt app thì dòng thôi hiện sau 90 giây; người tìm phòng dọn giùm dòng đã im quá 10 phút; chủ phòng quay lại thì máy tự ghi lại dòng.
- **Luật Firebase** thêm `sanh`: ai cũng đọc được cả danh sách (chỉ danh sách này); ghi dòng chỉ khi phòng có thật và chưa bắt đầu, đúng khuôn (tên 1–20 chữ, ghế trống 1–2, luật chỉ "tq", giờ là giờ máy chủ, không khoá lạ); ai cũng xoá được dòng (để dọn dòng đã im). Người dùng cho cập nhật bằng Chrome của họ; đã xuất bản rồi gửi 16 yêu cầu thật: đọc danh sách được; dòng cho phòng không có thật, thiếu tên, ghế trống 3, khoá lạ, giờ giả đều bị chặn; dòng đúng khuôn ghi được, sửa vài khoá được; dòng đã mất mà chỉ sửa vài khoá thì bị chặn (nên máy ghi lại cả dòng); phòng đã bắt đầu bị chặn; `/coba` vẫn không liệt kê được.
- Giới hạn biết trước: ai biết mã một phòng riêng thì cũng ghi được dòng cho phòng đó (không có tài khoản nên luật không biết ai là chủ phòng) — nhưng biết mã thì vốn đã vào được phòng.

`scripts/fb-gia.js` (máy chủ giả) làm thêm luật `sanh`. `scripts/test-phong.js` thêm 11 bài: phòng riêng không hiện; phòng mở có dòng đúng; người khác thấy trong danh sách, chạm là vào, thấy "Phòng của An"; có người vào thì số ghế đổi ngay; đủ người thì thôi hiện; luật chặn đúng 6 kiểu ghi bậy; bỏ dòng im 90 giây, dọn dòng im 10 phút; đổi riêng ↔ mở; bắt đầu ván thì thôi hiện và luật chặn ghi lại; chủ phòng rời thì thôi hiện. Thử phá 8 chỗ: lần đầu lọt 1 (số ghế không đổi ngay mà vẫn qua, vì nhịp báo còn ở đây 5 giây sau cũng sửa) — bài kiểm hoãn nhịp đó lại, giờ bắt cả 8. Đã thử trên database thật với hai thẻ khác địa chỉ: tạo phòng mở, thẻ kia thấy trong Tìm phòng, chạm vào, ngồi ghế Đen thì dòng còn 1 ghế, chủ phòng rời thì dòng mất; giữa chừng phiên dừng qua đêm, dòng cũ được dọn, chủ phòng mở lại thẻ thì dòng tự hiện lại.

Người dùng hỏi thêm: "trong app bạn nhắc đến cờ tải lên firebase chi vậy, ẩn mấy chú thích đó đi" — bỏ câu "Nước đi và tên gửi qua máy chủ Firebase của Google…" dưới nút Tạo phòng. `scripts/test-phong.js` thêm 1 bài (cùng 11 bài trên, giờ 69): không còn chữ nào nhắc Firebase hiện ra cho người chơi (bỏ ghi chú trong mã rồi mới tìm — bản đầu chỉ xét từng dòng nên lọt chữ nằm trong chuỗi HTML nhiều dòng).

### Tìm phòng nhanh: một chạm là vào chơi

Người dùng: "thêm 1 nút tìm phòng nhanh đi".

- **Bảng Ván mới** có thêm *Tìm phòng nhanh* (hình tia chớp). Mục danh sách đổi tên thành *Xem phòng đang chờ* cho khỏi lẫn; màn danh sách cũng có nút *Tìm phòng nhanh* ở trên cùng, ngay dưới ô tên — gõ tên rồi bấm luôn.
- **Một chạm**: đọc `/sanh`, chọn phòng mở sắp đủ người nhất (còn ít ghế trống nhất; bằng nhau thì phòng có chủ vừa báo còn ở đây), đọc lại phòng thật rồi ngồi luôn ghế trống đầu tiên theo thứ tự đi (Trắng → Đen → Đỏ), mang tên đã lưu; phòng chờ ghi "Phòng mở". Dòng danh sách đã cũ (phòng thật đủ người hay đã bắt đầu), hay ghế vừa bị người khác giành (luật không cho ghi đè ghế đã có người), thì thử phòng kế — tối đa 4 phòng.
- **Không còn phòng nào**: tự tạo phòng mở theo cài đặt lần trước (quân, mức máy, luật), báo "Chưa có phòng nào đang chờ — đã tạo phòng mở, chờ người vào." — ai bấm tìm nhanh sau đó sẽ vào phòng này.
- Mấy câu nhắc tới danh sách (phòng chờ của chủ phòng mở, màn Tạo phòng, lúc đổi riêng ↔ mở) giờ gọi đúng hai tên mới.

`scripts/test-phong.js` thêm 4 bài (giờ 73): bảng Ván mới và màn danh sách có nút, không chữ nào còn gọi tên cũ; bấm tìm nhanh thì bỏ qua dòng của phòng đã đủ người, vào phòng còn 1 ghế chứ không vào phòng còn 2 ghế, ngồi đúng ghế trống còn lại với tên mình; vào đủ ba người thì phòng thôi hiện, người vào thấy "Phòng mở"; không còn phòng thì tự tạo phòng mở, có trong danh sách, có báo. Thử phá 5 chỗ (đảo thứ tự ưu tiên phòng, bỏ tự tạo phòng, bỏ dấu "phòng mở" sau khi vào, bỏ nút trên bảng Ván mới, đổi một câu về tên cũ) — bắt cả 5. Đã thử trên database thật với hai thẻ khác địa chỉ: thẻ thứ nhất bấm tìm nhanh lúc chưa có phòng nào → tự tạo phòng mở, có trong danh sách (còn 2 ghế); thẻ thứ hai gõ tên rồi bấm tìm nhanh → vào đúng phòng đó, ngồi ghế Đen, dòng danh sách còn 1 ghế, chủ phòng thấy tên người vào; chủ phòng rời thì dòng mất.

### Nút chép link, nút đóng bấm được cả lúc bảng Ván mới đang mở

Người dùng: "khi ở cờ vua, chưa vô ván thì không bấm chia sẻ link được vì lúc nào cũng có popup". Bảng của trò (`.cb-tin`, z-index 9) phủ cả khung, nằm trên hàng nút của app — Cài app, chép link, ✕ (z-index 8). Lúc chưa vào ván thì bảng Ván mới luôn mở, nên không chép được link — cả nút ✕ cũng không bấm được (trên iPhone đã cài app thì không thoát ra được, trừ khi vào ván).

- Ba nút đó giờ nằm trên bảng (z-index 10), sáng rõ trên lớp mờ.
- Bảng chừa hàng nút ở trên: cách mép trên 58 px cộng phần tai thỏ (nút cách mép 14 px, cao 34 px). Bảng cao tối đa vừa chỗ còn lại, dài thì cuộn trong bảng — trước đây cao 88vh nên bảng dài có thể lên sát mép trên.
- Chỉ sửa ở cờ ba người. Các trò khác chỉ hiện bảng lúc chọn bài hay thắng bài, bảng có nút ✕ riêng để đóng.

`scripts/test-coba.js` thêm 1 bài (giờ 94): nút nằm trên bảng, bảng chừa đủ hàng nút (đọc vị trí và cỡ nút ngay trong CSS), bảng cao không quá chỗ còn lại. Thử phá 5 chỗ (bỏ nâng nút, nút ngang bảng, bảng không chừa hàng nút, chừa thiếu, bảng cao lại 88vh) — bắt cả 5. Đã thử trong trình duyệt ở cỡ điện thoại 375×812: bấm ngay tâm từng nút thì trúng nút; bấm nút chép link lúc bảng Ván mới đang mở thì gửi đúng link `…/co-vua-ba-nguoi/`, bảng vẫn mở; bảng Ván mới bắt đầu ở 120 px, Tạo phòng ở 81 px, Cách chơi (dài, cuộn) ở 58 px — đều dưới hàng nút (kết thúc ở 48 px).

### Đồng hồ: cài giờ khi tạo phòng

Người dùng: "thêm tạo phòng có config trước khi vô nữa vd như giây, phút". Hỏi lại, người dùng chọn: có cả hai kiểu (giây mỗi nước, phút cả ván); hết giờ thì máy đi giùm (không loại ai vì lỡ tay); cho cập nhật luật Firebase bằng Chrome của họ.

- **Màn Tạo phòng** có hàng *Đồng hồ*: Không đếm giờ (mặc định) · 30 giây · 1 phút mỗi nước (hàng trên) · 5 phút · 10 phút cả ván (hàng dưới); chọn rồi thì có một dòng nói hết giờ thì sao. Máy nhớ lựa chọn; Tìm phòng nhanh (lúc tự tạo phòng) và Chơi ván nữa dùng lại. Thêm hàng này thì màn dài hơn điện thoại 375×812 tới 121 px, nút Tạo phòng bị đẩy khỏi màn hình: bỏ câu thừa "Tạo xong có link và mã QR để mời." (bấm là thấy link ngay), câu đồng hồ rút còn một dòng, nút Tạo phòng nổi ở đáy bảng — đo lại: nút ở 721–769 px, chỉ hàng mức máy (chọn sẵn Vừa) nằm dưới, cuộn 59 px là thấy.
- **Ai cũng biết trước khi vào**: phòng chờ ghi "Phòng chờ · Luật thường · 30 giây/nước"; người mở link thấy "Đồng hồ: Mỗi lượt 30 giây; hết giờ thì máy đi giùm nước đó, người chơi vẫn chơi tiếp." trước khi chọn quân; danh sách phòng mở và dòng dưới tên trò cũng ghi.
- **Trong ván**: đồng hồ ở góc phải thẻ từng nhà, ngang hàng tên (dòng trạng thái bên dưới vẫn rộng hết thẻ — bản đầu để đồng hồ chiếm cả hai dòng, chữ "đang đi" bị cắt còn "đan…"); ghế máy chơi thì không có. Giây mỗi nước: chỉ người tới lượt có đồng hồ, đi xong lượt sau đếm lại từ đầu. Phút cả ván: ai cũng có, cộng dồn, chỉ chạy lúc tới lượt mình. Còn 10 giây: đồng hồ đỏ, báo "Còn 10 giây!" (có tiếng, rung).
- **Hết giờ**: giây mỗi nước — người đó không đi được nữa (chạm quân chỉ để xem), dòng dưới ghi "Hết giờ — máy đang đi giùm bạn…", máy đi giùm nước đó (nghĩ như Rùa, ở mức máy của phòng) rồi người đó chơi tiếp; ai cũng được báo ("Hết giờ — máy đã đi giùm bạn nước này." / "Bình hết giờ — máy đi giùm nước này."). Phút cả ván — máy chơi thay ghế đó tới hết ván (như nút "Cho máy đi thay"), không có nút "Tự đi tiếp", cả phòng được báo.
- **Cách làm**: phòng có ô `gio` (chỉ ghi lúc tạo phòng); mỗi nước ghi kèm giờ máy chủ `luc`; lượt đầu tính từ `batDau`. Máy nào cũng tính đồng hồ từ danh sách nước (bỏ nước sai luật) nên ra cùng một số, không ai phải giữ giờ. Hết giờ thì máy của người ngồi ghế số nhỏ nhất còn ở đây làm việc sau 1 giây; máy kế chờ thêm 5 giây mỗi bậc (phòng khi máy trước đã tắt); ô nước chỉ ghi được một lần nên ai ghi trước thì được, người kịp đi trước thì máy đi giùm thôi, không báo lỗi. Nước không có giờ (bản app cũ) thì tính lúc nhận.
- **Luật Firebase** thêm `gio` cho phòng và cho dòng danh sách phòng mở (chỉ 4 kiểu n30, n60, v5, v10), `luc` cho nước (phải đúng giờ máy chủ; không bắt buộc, để bản app cũ vẫn đi được). So bản đang chạy trên Firebase với bản trong git (giống hệt) rồi mới dán bản mới, xuất bản, gửi 14 yêu cầu thật: tạo phòng có đồng hồ được; đồng hồ sai kiểu, là số, đổi sau khi tạo đều bị chặn; dòng danh sách có đồng hồ ghi được, sửa thành kiểu sai bị chặn; nước mang giờ giả bị chặn, mang giờ máy chủ được, không có giờ vẫn được, có khoá lạ bị chặn; đọc lại đúng.
- Giới hạn biết trước: luật không biết một nước có đi sau khi hết giờ hay không (phải cộng giờ cả ván) — máy người chơi tự chặn lúc hết giờ, nên chỉ ai sửa app mới đi muộn được.

`scripts/fb-gia.js` làm thêm các luật trên. `scripts/test-phong.js` thêm 16 bài (giờ 89), không phải chờ thật — vặn đồng hồ cả máy chủ giả lẫn các máy cùng lúc: hàng Đồng hồ, máy nhớ lựa chọn; phòng mang `gio`, phòng chờ, danh sách, màn mời đều ghi; luật chặn đúng; vào ván thì chỉ người tới lượt có đồng hồ, hai máy ra cùng một số; nước mang giờ máy chủ; nước sai luật không làm đồng hồ tính lại; còn 10 giây thì báo, hết giờ thì không đi được, máy ghế bậc hai chưa tự làm; hết 30 giây thì máy ghế số nhỏ nhất đi giùm đúng một nước, ghế vẫn là người, người đó được báo; lượt sau đồng hồ lại 0:30; phút cả ván: nghĩ 40 giây thì còn 4:20 trên cả hai máy, hết 5 phút thì máy chơi thay tới hết ván, không có Tự đi tiếp, cả phòng được báo; người vào sau tính lại đúng đồng hồ của từng người từ danh sách nước. Thử phá 12 chỗ (đi giùm không chờ theo bậc, giây mỗi nước mà cho máy chơi thay luôn, nước sai luật cũng tính giờ, phút cả ván không trừ giờ đang chạy, lượt đầu không tính từ lúc bắt đầu, nước không mang giờ, hết giờ vẫn đi được, không báo còn 10 giây, không báo người bị đi giùm, hết giờ vẫn cho tự đi tiếp, danh sách và tạo phòng quên đồng hồ) — bắt cả 12. Đã thử trên database thật với hai thẻ khác địa chỉ, phòng 30 giây/nước, không ai đi: mỗi lượt người dài 31,7–31,9 giây (30 giây, chờ 1 giây, máy nghĩ) rồi máy đi giùm, ghế vẫn là người; Hổ (ghế máy) đi trong 0,8 giây; thẻ người bị đi giùm thấy đủ "Còn 10 giây!", đồng hồ đỏ, "Hết giờ — máy đang đi giùm bạn…", "Hết giờ — máy đã đi giùm bạn nước này."; thẻ kia thấy "Bình giờ hết giờ — máy đi giùm nước này.". Lúc thử thấy thêm hai chỗ, đã sửa: lúc quân của nước đi giùm còn trượt, dòng dưới chớp lại "Lượt của bạn"; đổi lượt rồi mà đồng hồ cũ còn hiện thêm một nhịp.

### Thêm vào MH chính trên iPhone: thêm từ trò nào thì mở app vào trò đó

Người dùng báo: "Sao vô game thêm màn hình chính toàn ra trang chủ không vậy". Bản trước đổi thẻ `<link rel="manifest">` theo trò đang mở. Chrome đọc lại manifest mỗi lần thẻ đổi (`LinkManifest::Process` → `ManifestManager::DidChangeManifest` bỏ bản đã đọc), Safari thì không: WebKit tải manifest ngay khi gặp thẻ lúc dựng trang (`HTMLLinkElement::process`), rồi `DocumentLoader::loadApplicationManifest` thấy đã có bộ tải thì trả lại bản cũ cho tới khi rời trang ([mã WebKit](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/loader/DocumentLoader.cpp)). Trang nào cũng mở từ `index.html` với manifest trang chủ (link của trò cũng chỉ chuyển về `/#trò`), nên "Thêm vào MH chính" ở đâu cũng lấy `start_url` của trang chủ. Mọi trình duyệt trên iPhone, iPad đều chạy WebKit, nên Chrome trên iPhone cũng vậy.

- **WebKit không gắn manifest.** Thẻ manifest giờ do một đoạn mã đầu `index.html` gắn, chỉ cho trình duyệt không phải WebKit của Apple (nhận bằng `GestureEvent`, thêm chữ iPhone/iPad và iPad tự xưng là Mac cho chắc). Không có manifest thì Safari nhận "không có" (`_getApplicationManifestWithCompletionHandler` trả `nil`) và lưu địa chỉ đang xem — kiểu "Thêm vào MH chính" có từ trước khi có manifest. Biểu tượng, chạy toàn màn hình vẫn nhờ `apple-touch-icon`, `apple-mobile-web-app-capable`; thêm `apple-mobile-web-app-title` = "Thông Điệp", không thì Safari lấy tên thẻ — vào trò là tên trò.
- **Địa chỉ trong trò mang `?tro=<trò>`** (chỉ khi không có manifest, ngoài app): `/?tro=co-ba-nguoi#co-ba-nguoi`, về trang chủ thì bỏ. Không trông vào phần sau `#` vì chưa chắc Safari giữ nó khi lưu; `?tro` thì app đã biết đọc — mở app với `?tro` là vào thẳng trò và nhớ trò.
- **Nút Back.** Hai địa chỉ khác nhau cả phần trước `#` thì Safari không báo `hashchange` (`FrameLoader::loadInSameDocument`), nên Back từ trò về trang chủ sẽ không đóng trò. App nghe thêm `popstate` — Safari báo cho mọi lần Back, Forward từ 2010 ([WebKit bug 41372](https://bugs.webkit.org/show_bug.cgi?id=41372)). Thử trên trình duyệt thì Chromium cũng không báo `hashchange` trong trường hợp này.
- **Thêm lúc đang trong phòng cờ**: địa chỉ lưu có cả mã phòng (`#co-ba-nguoi/MÃ`). Mở app từ biểu tượng (không phải tải lại) với `?tro` mà sau `#` là chính trò đó thì vào thẳng trò, bỏ mã phòng — không thì lần nào mở app cũng vào lại một phòng đã tan. Tải lại trang thì vẫn giữ phòng.
- Android, máy tính giữ cách cũ (manifest đổi theo trò, địa chỉ không đổi).
- Biểu tượng đã thêm trước bản này vẫn mở trang chủ: xoá biểu tượng, mở trò trong Safari (mở trang rồi đợi vài giây cho bản mới tự tải lại), rồi thêm lại.

`scripts/test-sao.js` thêm 14 bài (giờ 223): `index.html` không còn thẻ manifest viết sẵn; đoạn mã đầu trang gắn manifest cho Chrome Android, Samsung, Chrome máy tính, không gắn cho Safari iPhone, Chrome iPhone, iPhone không có `GestureEvent`, iPad, Safari máy Mac; tên "Thông Điệp"; không manifest thì vào trò địa chỉ có `?tro`, giữ mã phòng và `?ngay=`, về trang chủ bỏ `?tro`, trò lạ không gắn, tải lại thì bỏ rồi gắn lại khi mở trò; mở app iPhone với `?tro` (có hay không phần sau `#`) thì vào thẳng trò và nhớ, trong app không đổi địa chỉ; thêm lúc đang trong phòng thì mở app bỏ mã phòng, tải lại thì giữ; `?tro` mà `#` là trò khác thì theo địa chỉ; init nghe `popstate`; `theoDiaChi` gọi hai lần không mở, đóng lại. Thử phá 8 chỗ: bắt cả 8. Đã thử trên trình duyệt: Chrome — đúng một thẻ manifest, vào cờ thì đổi sang manifest của cờ, Back thì về manifest chính, địa chỉ không đổi; giả Safari (gỡ thẻ manifest, chặn `hashchange` khi khác phần trước `#`) — bấm sao cờ thì địa chỉ `/?tro=co-ba-nguoi#co-ba-nguoi`, Back đóng cờ về `/` (không có `hashchange` nào, `popstate` đóng), Forward mở lại, cờ tự đóng thì về `/`; không lỗi console. Người dùng đã thử trên iPhone thật (16/10/2026): thêm vào MH chính từ trong trò, mở app là vào thẳng trò đó.

## Cấu trúc

```
index.html                 giao diện, một màn hình duy nhất
assets/core.js             lõi thuần: ngày tháng, xáo bài, chọn lá của ngày (test bằng Node)
assets/khauhinh.js         vẽ hình khẩu hình: hàm thuần, trả về chuỗi SVG (test bằng Node)
assets/amvi.js             dựng âm vị tiếng Anh bằng toán: hàm thuần, trả về Float32Array
assets/app.js              điều khiển giao diện
assets/app.css             giao diện
data/cards.json            209 lá dùng trong app (49 KB)
sw.js, manifest.webmanifest, icons/     phần PWA, chạy offline, cài lên màn hình chính được
icons/og-*.jpg             ảnh xem trước 1200×630 của trang chia sẻ từng trò
<trò>/index.html           trang chia sẻ riêng của từng trò (mua-chin/, ho-sen/, co-vua-ba-nguoi/…), sinh bởi scripts/lam-trang-chia-se.py
scripts/lam-trang-chia-se.py  tạo trang chia sẻ và ảnh xem trước cho mọi trò, từ một bảng tên, mô tả, hình
<trò>/app.webmanifest      manifest riêng của từng trò (start_url ?tro=<trò>): cài từ trò nào thì mở app vào thẳng trò đó (Chrome; Safari không có manifest, địa chỉ trong trò mang ?tro)
scripts/lam-ke-khai.py     viết các <trò>/app.webmanifest từ manifest.webmanifest và danh sách trò trong assets/app.js
scripts/build-data.py      gộp hai CSV nguồn -> data/cards.json
scripts/test-core.js       39 kiểm thử lõi
scripts/test-pond.js       48 kiểm thử hồ nước, chạy hồ ngoài trình duyệt, đo cả phổ tiếng ếch
scripts/test-astro.js      73 kiểm thử thiên văn, đối chiếu số liệu ngoài (có giờ mọc lặn Trăng theo JPL Horizons)
assets/saosang.js          5.080 sao tới cấp 6 từ Danh mục sao sáng Yale, sinh bởi scripts/lam-saosang.py
scripts/lam-saosang.py     lọc danh mục BSC5 (CDS V/50) thành saosang.js
scripts/test-troidem.js    117 kiểm thử bầu trời: chạm chọn, quay nhìn, xoay theo máy, đổi nơi, bẫy đơn vị, sao thật, Ngân Hà, nhìn từ vũ trụ
assets/vutru.js            cảnh nhìn từ vũ trụ: Trái Đất – Mặt Trăng, Hệ Mặt Trời (8 hành tinh), So kích thước; phép chiếu tự viết
assets/toancanh.js         hiệu ứng toàn cảnh: hành trình từ chỗ bạn đứng ra tới chấm xanh mờ, tia chiếu tự viết
assets/traidat/            ba ảnh Trái Đất của NASA: đất 4096×2048, mây 2048×1024, đèn đêm 3600×1800, sinh bởi scripts/lam-traidat.py
scripts/lam-traidat.py     thu nhỏ ảnh Visible Earth của NASA thành assets/traidat/
scripts/test-toancanh.js   83 kiểm thử hiệu ứng toàn cảnh: quỹ đạo, khí quyển, màu, các chặng, lời dẫn, card đồ hoạ, ảnh chi tiết NASA
assets/datlien.js          mặt nạ đất/biển 720×360 từ Natural Earth, sinh bởi scripts/lam-datlien.py
scripts/lam-datlien.py     đổi bản đồ Natural Earth 1:110m thành datlien.js
assets/mua.js              đọc dự báo mưa thành câu tiếng Việt: hàm thuần, không đụng mạng
scripts/test-mua.js        58 kiểm thử phần đọc mưa, nặng nhất là bẫy lệch một tiếng
scripts/test-chomsao.js    10 kiểm thử Nối sao thành chòm: tự nối đúng thứ tự nét, chạm để xong ngay, giảm chuyển động, xoay sau khi xong
scripts/test-sao.js        223 kiểm thử vòng đời MỌI ngôi sao, trang chia sẻ từng trò, nút Cài app, mở app vào thẳng trò đã cài, tự tải lại khi có bản mới, tệp lịch .ics
scripts/test-phatam.js     192 kiểm thử trò phát âm: nội dung, bài nghe, hình vẽ, hình động
assets/dophatam.js         đo phát âm bằng âm học: hàm thuần, nhận mẫu âm thanh trả về kết quả
scripts/test-dophatam.js   26 kiểm thử máy đo: tín hiệu dựng, tám giọng mẫu, chỗ ồn, nói nhỏ
scripts/mau-am.js          tạo giọng mẫu bằng lệnh `say` của macOS, trộn tiếng ồn
scripts/test-lich.js       97 kiểm thử lịch vạn niên, đối chiếu lịch đã công bố
assets/sohoc.js            thần số học: hàm thuần, ngày sinh vào, các con số ra
assets/thanso.js           giao diện ngôi sao thần số học
scripts/test-sohoc.js      48 kiểm thử thần số học, theo ví dụ có lời giải trong nguồn
assets/caiapp.js           gợi ý cài app: nhận dạng máy, khi nào tự gợi ý, bắt hộp cài của trình duyệt
scripts/test-caiapp.js     38 kiểm thử cài app (có các trường hợp lấy từ Nhớ Nha)
assets/thongke.js          đếm lượt truy cập bằng Vercel Web Analytics: mỗi lần mở một lượt, tách trình duyệt / app / cài mới
scripts/test-thongke.js    20 kiểm thử đếm lượt truy cập
assets/rungu.js            nhạc ngủ: tạo âm thành đoạn lặp liền mạch, tính hẹn giờ; chạy được làm Web Worker
assets/nhacngu.js          giao diện ngôi sao nhạc ngủ, phát bằng Web Audio
scripts/test-ngu.js        53 kiểm thử nhạc ngủ: phổ, tần số, mối nối, lịch nhỏ dần
assets/luanxa.js           thiền luân xa: bảy luân xa theo kinh văn, tạo âm tanpura và chuông xoay, lịch buổi thiền; chạy được làm Web Worker
assets/thienluanxa.js      giao diện ngôi sao thiền luân xa: hoa sen, nhịp thở, phát bằng Web Audio
scripts/test-luanxa.js     101 kiểm thử thiền luân xa: nội dung, phổ chuông, đàn, lịch, thiền riêng, hình, trình phát
assets/laptrinh.js         Robot thắp sao: chạy chương trình, dựng bản đồ từ lời giải, cảnh 3D nhìn nghiêng, xếp ô lệnh
assets/baicode.js          100 bài, 10 chương của Robot thắp sao, viết bằng cú pháp gọn, mỗi bài có lời giải mẫu
scripts/test-laptrinh.js   57 kiểm thử Robot thắp sao: cả 100 bài giải được, buộc dùng điều đang học, luật chạy, gợi ý, chấm sao
scripts/tim-loi-giai-gon.js  thử mọi chương trình ngắn hơn lời giải mẫu, báo bài nào có cách gọn hơn (chạy tay khi sửa bài)
assets/sokoban.js          Đẩy thùng sao (Sokoban): luật đi đẩy, bộ giải ít lần đẩy / ít bước nhất, ô chết, cảnh 3D nhìn nghiêng
assets/mansoko.js          100 màn của Đẩy thùng sao (ký hiệu XSB), mỗi màn có số lần đẩy ít nhất và một lời giải, sinh bởi scripts/tao-man-sokoban.js
scripts/tao-man-sokoban.js tạo màn theo Taylor & Parberry 2011 (17 mẫu phòng, đặt ổ, chơi ngược), chạy song song nhiều luồng, chọn 100 màn
assets/coba.js             Cờ vua ba người: bàn lục giác 96 ô (bằng sáng chế Zubrin), luật, máy nghĩ (Best-Reply Search, hoang tưởng) ở luồng riêng, giao diện
scripts/test-coba.js       94 kiểm thử cờ ba người: hình học bàn, luật thường và Tam quốc, máy nghĩ, giao diện, mũi tên nước đi, xem cách đi từng quân, quân đã mất
assets/phong.js            chơi qua mạng: đọc ghi Firebase Realtime Database bằng REST và luồng sự kiện, không thư viện
assets/maqr.js             mã QR tự vẽ cho phòng chờ (ISO/IEC 18004, kiểu byte, mức M, phiên bản 1–6), không thư viện
scripts/test-maqr.js       12 kiểm thử mã QR: số liệu chuẩn, đọc ngược bằng bộ đọc riêng, sát sức chứa, 300 chữ ngẫu nhiên
firebase-rules.json        luật bảo vệ database (dán vào thẻ Rules của Firebase)
scripts/fb-gia.js          máy chủ giả của Firebase cho bài kiểm thử
scripts/test-phong.js      89 kiểm thử chơi qua mạng: ba máy chung một phòng trên máy chủ giả, phòng chờ theo từng người xem
scripts/test-sokoban.js    60 kiểm thử Đẩy thùng sao: luật, bộ giải đối chiếu dò từng bước, bộ tạo, cả 100 màn, giao diện
assets/nghe.js             so khớp câu nói với phương án máy nghe ra: hàm thuần, trò phát âm dùng
scripts/test-nghe.js       17 kiểm thử bộ so khớp, chạy trên scripts/cau-mau-nghe.json
scripts/test-amvi.js       47 phép đo phổ bộ dựng âm, đối chiếu số liệu ngữ âm học
content/raw/               CSV nguồn (v3, v5, v6 và bản 365)
content/ghi-chu-co-che-game.json        cột "Cơ chế game" trong CSV, giữ làm ghi chú, không dùng trong app
content/cards/, content/topics.json     bản nội dung theo chủ đề từ CSV v3, hiện không dùng
scripts/validate-cards.py  kiểm tra nội dung của bản v3 nói trên
```

## Lệnh

```bash
python3 scripts/build-data.py    # dựng lại data/cards.json từ CSV
node scripts/test-core.js        # chạy 39 kiểm thử lõi (Node 18+)
node scripts/test-pond.js        # chạy 48 kiểm thử hồ, gồm một tiếng mô phỏng
node scripts/test-astro.js       # chạy 73 kiểm thử thiên văn
node scripts/test-troidem.js     # chạy 117 kiểm thử bầu trời đêm
node scripts/test-toancanh.js    # chạy 83 kiểm thử hiệu ứng toàn cảnh
node scripts/test-mua.js         # chạy 58 kiểm thử phần đọc dự báo mưa
node scripts/test-chomsao.js     # chạy 10 kiểm thử Nối sao thành chòm
node scripts/test-sao.js         # chạy kiểm thử vòng đời mọi ngôi sao, trang chia sẻ, nút Cài app
python3 scripts/lam-trang-chia-se.py   # tạo lại trang chia sẻ và ảnh xem trước của mọi trò (ảnh đã có thì giữ)
python3 scripts/lam-ke-khai.py         # viết lại manifest riêng của từng trò (thêm trò mới, hay sửa manifest.webmanifest)
node scripts/test-lich.js        # chạy 97 kiểm thử lịch vạn niên
node scripts/test-sohoc.js       # chạy 48 kiểm thử thần số học
node scripts/test-caiapp.js      # chạy 38 kiểm thử cài app
node scripts/test-thongke.js     # chạy 20 kiểm thử đếm lượt truy cập
node scripts/test-ngu.js         # chạy 53 kiểm thử nhạc ngủ
node scripts/test-luanxa.js      # chạy 101 kiểm thử thiền luân xa
node scripts/test-laptrinh.js    # chạy 57 kiểm thử Robot thắp sao (cả 100 bài)
node scripts/tim-loi-giai-gon.js 1 100 60   # tìm cách giải gọn hơn lời giải mẫu (lâu: tới 60 giây mỗi bài)
node scripts/test-coba.js        # chạy 94 kiểm thử Cờ vua ba người
node scripts/test-phong.js       # chạy 89 kiểm thử chơi qua mạng (ba máy, máy chủ giả)
node scripts/test-maqr.js        # chạy 12 kiểm thử mã QR
node scripts/test-sokoban.js     # chạy 60 kiểm thử Đẩy thùng sao (giải lại cả 100 màn, chừng nửa phút)
node scripts/tao-man-sokoban.js tao ung-vien.jsonl 7 [4,5]   # tạo màn liên tục, 7 luồng, ghi mỗi màn một dòng (tuỳ chọn: chỉ số thùng này)
node scripts/tao-man-sokoban.js chon ung-vien.jsonl          # chọn 100 màn từ các ứng viên, ghi assets/mansoko.js
node scripts/test-nghe.js        # chạy 17 kiểm thử bộ so khớp câu nói
node scripts/test-phatam.js      # chạy 192 kiểm thử trò luyện phát âm
node scripts/test-dophatam.js    # chạy 26 kiểm thử máy đo phát âm (phần giọng mẫu cần macOS)
node scripts/test-amvi.js        # chạy 47 phép đo bộ dựng âm vị
python3 scripts/kiem-tieng-nguoi.py  # đo lại ~700 file tiếng người (cần ffmpeg, numpy); thêm --nghe để máy nghe lại từng từ
```

## Sửa chính tả trong nguồn

`scripts/build-data.py` tự sửa mấy lỗi phát hiện trong CSV, khai báo ở biến `FIXES`:

| Lá | Sửa |
|---|---|
| 1 | "Thượng đế tính là" → "Thượng đế chính là" |
| 94 | "dành cho con lúc nãy" → "dành cho con lúc này" |
| 47, 60, 70 | "HEBs" → "Các sinh mệnh tiến hóa cao" |

## Tự nhận bản mới

App tự cập nhật, người dùng không phải xoá cache hay thêm `?v=` gì cả.

Khi mở app, và mỗi lần quay lại app sau khi chuyển sang cửa sổ khác, trình duyệt dò xem `sw.js` có đổi không. Nếu có, service worker mới cài rồi chiếm quyền ngay. Lần cài đầu tiên thì không tải lại, vì lúc đó chưa có bản cũ nào để thay.

**Tải lại lúc nào.** Người dùng báo "mở trang chủ lâu lâu bị reset 2 lần". Bản trước gắn chỗ nghe tin có bản mới *sau* khi tải xong bộ bài (trong khi trình duyệt tự dò bản mới ngay lúc mở trang), không có gì chặn một trang vừa tự tải lại khỏi tải lại lần nữa (dự án này có ngày đưa lên mấy bản sát nhau), và tin tới giữa lúc đang dùng cũng tải lại ngay. Giờ:

- nghe tin có bản mới ngay từ lúc trang mở;
- trang vừa mở chưa tới 5 giây và chưa chạm gì thì tải lại luôn, như một phần của lúc mở;
- đang dùng dở (đã lật bài, đang mở một ngôi sao) thì **đợi lúc chuyển sang app khác** mới lặng lẽ tải lại;
- trong 15 giây sau một lần tự tải lại thì không tải lại trước mặt người dùng nữa, cũng đợi lúc chuyển đi;
- đang phát nhạc ngủ thì khoá màn hình không tính là "chuyển đi" (tải lại là tắt nhạc của người đang ngủ); đợi nhạc tự tắt xong mới tải.

`scripts/test-sao.js` chạy nguyên đoạn này trên một trình duyệt giả, kích các tình huống có bản mới rồi đếm số lần tải lại; bản cũ trượt đúng hai tình huống người dùng gặp.

Kiểm bằng Chrome thật: cài bản `tdtd-v52`, đổi số phiên bản trên máy chủ thành `tdtd-v53`, gọi dò bản mới. Trang tự tải lại, cache chuyển sang `tdtd-v53` và cache cũ bị xoá.

Vẫn phải tăng số phiên bản trong `sw.js` mỗi lần đổi mã, vì đó chính là tín hiệu để trình duyệt biết có bản mới.

## Đưa lên mạng

Web tĩnh thuần, không cần build. Xem [DEPLOY.md](DEPLOY.md) để biết cách đưa lên Vercel.
