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
- Nút **Xáo lại bộ bài của tôi** trong phần giới thiệu sinh hạt giống mới nếu người dùng muốn đổi.

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

Mã ở `assets/constellation.js`. Trong đám sao lấm tấm có vài ngôi sáng hơn. Kéo từ ngôi này sang ngôi kia để nối. Nối trúng thì đường vàng sáng lên và dính lại, nối trật thì đường tự tan, không báo sai, không đếm giờ, không thua. Nối đủ thì cả chòm bừng sáng, hiện lời giải thích và câu ca dao nếu có.

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

Vùng bắt điểm khi chạm cũng tự co theo từng chòm: chòm nào có hai ngôi nằm sát nhau ngoài trời thật, như hai sao giữa lưỡi cày cách nhau 33 pixel, thì bán kính bắt nhỏ lại thay vì kéo giãn hình cho dễ bấm.

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

Lúc kiểm thì phát hiện bảng Giới thiệu **không mở được từ 9/9**: khung bảng trượt bị xoá nhầm khỏi `index.html` cùng nút "số may mắn" cũ, `app.js` gọi `$('#sheet-title')` ra `null` rồi ném lỗi — kéo theo nút *Xáo lại bộ bài* cũng không ai bấm được. Đã khôi phục; `scripts/test-sao.js` giờ kiểm mọi `#id` mà `app.js` dùng đều có trong `index.html`. Câu "trong vòng 209 ngày không lá nào lặp lại" ở bảng Giới thiệu cũng nói quá — đúng với ai bắt đầu từ đầu vòng; ai bắt đầu giữa vòng thì một lá có thể quay lại sau ít nhất 105 ngày — đã sửa.

## Gợi ý cài app lên điện thoại

Người dùng muốn "một cái popup cài app, để mọi người dễ dùng trên điện thoại". Mỗi loại máy một cách cài, nên `assets/caiapp.js` nhận dạng trước rồi bảng hướng dẫn (dùng chung bảng trượt) nói đúng cách cho máy đó:

| Máy | Bảng hiện gì |
|---|---|
| Android Chrome, Edge… có hộp cài (`beforeinstallprompt`) | nút **Cài app** — gọi đúng hộp cài của trình duyệt |
| Android, trình duyệt chưa đưa hộp cài | bấm menu ⋮ → *Cài đặt ứng dụng* / *Thêm vào màn hình chính* |
| iPhone, iPad, Safari | ba bước có hình nút: ⋯ cạnh thanh địa chỉ → **Chia sẻ** (máy đời cũ: nút Chia sẻ ở thanh dưới) → **Thêm vào MH chính** → **Thêm**. Từ iOS 26 nút Chia sẻ nằm trong nút ⋯ ([MacRumors](https://www.macrumors.com/how-to/save-safari-bookmark-web-app-iphone-home-screen/)); iPad đời mới tự xưng là Mac nên nhận ra bằng màn cảm ứng nhiều điểm |
| iPhone, Chrome hay Firefox | nút Chia sẻ trên thanh địa chỉ → Thêm vào MH chính |
| Mở link trong **Zalo, Facebook, Messenger**, Instagram, TikTok | ở đó không cài được: hướng dẫn mở bằng trình duyệt; Android có nút **Mở bằng Chrome** (link `intent://`, máy không có Chrome thì mở link thường); kèm nút chép link |
| Máy tính | không tự gợi ý; mở từ nút ? thì chỉ cách mở trên điện thoại |

**Khi nào hiện:** không chặn ngay lúc vào. Tự gợi ý **3,2 giây sau khi lật lá hôm nay** — đọc xong thông điệp rồi — chỉ trên điện thoại, chỉ ở trang chính (không đang mở ngôi sao hay bảng khác), **tối đa 3 lần, cách nhau ít nhất 7 ngày**; đã cài (hoặc đang mở từ biểu tượng ngoài màn hình chính) thì thôi. Lúc nào cũng mở lại được từ nút **?** → *Cài app vào điện thoại*. Chỉ ghi một mẩu nhỏ `tdtd.caiApp`: số lần đã gợi ý, lần cuối, đã cài chưa.

`scripts/test-caiapp.js`, 24 bài: nhận dạng 15 trường hợp theo chuỗi nhận dạng thật (iPhone Safari cả iOS 26, iPad tự xưng Mac mà không nhầm máy Mac thật, Chrome iPhone, Zalo, Facebook, Messenger trên cả hai hệ, Android có và chưa có hộp cài, máy tính, đã cài); quy tắc tự gợi ý; link mở bằng Chrome. Đã thử trên trình duyệt: nút Cài app gọi hộp cài đúng một lần, đóng bảng, ghi đã cài; lật lá xong 3 giây thì bảng tự hiện.

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

`scripts/test-sohoc.js`, 43 bài: các ví dụ có lời giải trong nguồn (19/8/1991 ra 11; 29/11/1994 và 11/2/1985 ra 9; năm cá nhân của người sinh 31/1 các năm 2022–2026 và 27/2 các năm 2018–2020; chân kim tự tháp của 1/5/1974 và 10/5/2001; số 11 đỉnh đầu 25 tuổi), và các tính chất trên cả 40.542 ngày từ 1920 tới 2030: không có số chủ đạo 1, 22/4 khi và chỉ khi tổng bằng 22, năm cá nhân luôn 1–9, đỉnh 1 và 2 luôn một chữ số. Phần họ tên: hai ví dụ có lời giải ở trên, luật chữ Y trên 10 tên, Đ ra D, giữ 11 (Tuấn, Hương 29 → 11) và 22/4 (Hạnh), tên không có nguyên âm hay không có chữ cái nào.

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

Một hình không thể vừa đúng to nhỏ vừa đúng khoảng cách (Trái Đất chỉ bằng 1/11.700 bề rộng quỹ đạo của nó). Nên:

- **Cảnh mới "So kích thước"** (bấm nút đổi cảnh lần thứ hai): Mặt Trời, sáu hành tinh và Mặt Trăng đặt cạnh nhau, **cùng một tỉ lệ** theo đường kính NASA. Mặt Trời to tới mức chỉ thấy một cung ở trên cùng; Sao Thổ có cả vành, đúng cỡ theo bảng vành (vành B từ 1,526, vành A tới 2,270 lần bán kính, có khe Cassini); dưới mỗi cái ghi "gấp mấy lần Trái Đất". Kéo lên xuống, chụm để phóng.
- **Hệ Mặt Trời**: cỡ nén theo căn bậc ba của đường kính thật — một quy tắc cho tất cả, kể cả Mặt Trời — nên thứ tự to nhỏ đúng (Mặt Trời > Mộc > Thổ > Đất > Kim > Hoả > Thuỷ), Mặt Trời vẫn nằm gọn trong quỹ đạo Sao Thuỷ; dòng chữ nói rõ cách nén và chỉ sang cảnh So kích thước.
- **Bầu trời**: thẻ Mặt Trăng, Mặt Trời ghi *"trên màn vẽ to gấp N lần thật cho dễ thấy (thật rộng 0,5°)"*, N tính theo độ phóng lúc đó (chừng 16 ở góc thường, 9 khi phóng hết cỡ).

Lúc thêm cỡ mới, tên Trái Đất bị mất hẳn: Mặt Trời to ra chiếm chỗ, sáu chỗ thử ghi tên đều vướng. Giờ chỗ thử tỏa xa dần theo tám hướng, dời xa thì kẻ vạch nối, và riêng tên Trái Đất không bao giờ bị bỏ.

`scripts/test-troidem.js` thêm 8 bài: mọi bán kính ở cảnh So kích thước đúng tỉ lệ đường kính NASA; xếp dọc không chồng; thứ tự to nhỏ ở Hệ Mặt Trời; thẻ Mặt Trăng ghi đúng "to gấp N lần", phóng to thì N nhỏ lại.

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
- **Cùng thứ tự bước**: nghe người thật đọc → luyện tai (khi có cặp tối thiểu có một người đọc cả hai từ)
  → xem miệng → nghe so từng cặp (khi có cái để so) → nói. /iː/ đi đủ năm bước; /h/ chỉ ba.
- **Xem miệng theo kiểu màn 44 âm**: hình nhìn thẳng và hình bên trong miệng đặt cạnh nhau, chạy cùng nhịp,
  có sơ đồ lưỡi cho nguyên âm. Bài so hai tư thế (/l/ với /n/...) bấm qua lại giữa hai cặp hình, không bày
  bốn hình chồng nhau dài cả màn trên điện thoại.
- **Bước nói có đủ cả hai**: "nói thử — máy nghe ra chữ gì" và "nói theo mẫu, nghe lại mình" (mẫu chọn ngay
  tại chỗ; không lấy tiếng của vế sai làm mẫu), cộng máy đo ở bài nào có.
- Bấm chip sang âm khác lúc đang xem miệng thì vẫn ở bước xem miệng, để so hai hình; "Sang /y/ →" ở bước
  nghe so mở âm kia đúng ở bước nghe so. Vào âm từ một bài thì nút quay lại về đúng bài, đúng bước.

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
scripts/build-data.py      gộp hai CSV nguồn -> data/cards.json
scripts/test-core.js       38 kiểm thử lõi
scripts/test-pond.js       43 kiểm thử hồ nước, chạy hồ ngoài trình duyệt, đo cả phổ tiếng ếch
scripts/test-astro.js      64 kiểm thử thiên văn, đối chiếu số liệu ngoài
assets/saosang.js          5.080 sao tới cấp 6 từ Danh mục sao sáng Yale, sinh bởi scripts/lam-saosang.py
scripts/lam-saosang.py     lọc danh mục BSC5 (CDS V/50) thành saosang.js
scripts/test-troidem.js    92 kiểm thử bầu trời: chạm chọn, quay nhìn, xoay theo máy, đổi nơi, bẫy đơn vị, sao thật, Ngân Hà, nhìn từ vũ trụ
assets/vutru.js            cảnh nhìn từ vũ trụ: Trái Đất – Mặt Trăng và Hệ Mặt Trời, phép chiếu tự viết
assets/datlien.js          mặt nạ đất/biển 720×360 từ Natural Earth, sinh bởi scripts/lam-datlien.py
scripts/lam-datlien.py     đổi bản đồ Natural Earth 1:110m thành datlien.js
assets/mua.js              đọc dự báo mưa thành câu tiếng Việt: hàm thuần, không đụng mạng
scripts/test-mua.js        58 kiểm thử phần đọc mưa, nặng nhất là bẫy lệch một tiếng
scripts/test-sao.js        75 kiểm thử vòng đời MỌI ngôi sao, tự tải lại khi có bản mới, tệp lịch .ics
scripts/test-phatam.js     97 kiểm thử trò phát âm: nội dung, bài nghe, hình vẽ, hình động
assets/dophatam.js         đo phát âm bằng âm học: hàm thuần, nhận mẫu âm thanh trả về kết quả
scripts/test-dophatam.js   26 kiểm thử máy đo: tín hiệu dựng, tám giọng mẫu, chỗ ồn, nói nhỏ
scripts/mau-am.js          tạo giọng mẫu bằng lệnh `say` của macOS, trộn tiếng ồn
scripts/test-lich.js       97 kiểm thử lịch vạn niên, đối chiếu lịch đã công bố
assets/sohoc.js            thần số học: hàm thuần, ngày sinh vào, các con số ra
assets/thanso.js           giao diện ngôi sao thần số học
scripts/test-sohoc.js      43 kiểm thử thần số học, theo ví dụ có lời giải trong nguồn
assets/caiapp.js           gợi ý cài app: nhận dạng máy, khi nào tự gợi ý, bắt hộp cài của trình duyệt
scripts/test-caiapp.js     24 kiểm thử gợi ý cài app
assets/rungu.js            nhạc ngủ: tạo âm thành đoạn lặp liền mạch, tính hẹn giờ; chạy được làm Web Worker
assets/nhacngu.js          giao diện ngôi sao nhạc ngủ, phát bằng Web Audio
scripts/test-ngu.js        53 kiểm thử nhạc ngủ: phổ, tần số, mối nối, lịch nhỏ dần
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
node scripts/test-core.js        # chạy 38 kiểm thử lõi (Node 18+)
node scripts/test-pond.js        # chạy 43 kiểm thử hồ, gồm một tiếng mô phỏng
node scripts/test-astro.js       # chạy 64 kiểm thử thiên văn
node scripts/test-troidem.js     # chạy 92 kiểm thử bầu trời đêm
node scripts/test-mua.js         # chạy 58 kiểm thử phần đọc dự báo mưa
node scripts/test-sao.js         # chạy kiểm thử vòng đời mọi ngôi sao
node scripts/test-lich.js        # chạy 97 kiểm thử lịch vạn niên
node scripts/test-sohoc.js       # chạy 43 kiểm thử thần số học
node scripts/test-caiapp.js      # chạy 24 kiểm thử gợi ý cài app
node scripts/test-ngu.js         # chạy 53 kiểm thử nhạc ngủ
node scripts/test-nghe.js        # chạy 17 kiểm thử bộ so khớp câu nói
node scripts/test-phatam.js      # chạy 182 kiểm thử trò luyện phát âm
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
