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
- Mỗi vòng 100 ngày đi trọn bộ 100 thông điệp, không lá nào lặp trong vòng đó. Sang vòng mới bộ bài xáo lại.
- Vòng sau được sắp sao cho nửa cuối vòng trước rơi vào nửa sau vòng này, nên hai lần gặp cùng một lá luôn cách nhau ít nhất 51 ngày. Không bao giờ trùng thông điệp hai hôm liền.
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
| Nối sao thành chòm | `#noi-sao` |
| Gõ từ tiếng Anh | `#go-tu` |

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

Hiện có năm ngôi sao:

### Sao xanh ngọc — Mùa Chín

Trò xả stress, mã nguồn ở `assets/game.js`, độc lập hẳn với phần thông điệp.

Miết ngón tay hoặc rê chuột để một vệt nắng đi qua. Nắng chạm tới đâu thì trái chín tới đó, tách đôi và bắn nước. Trái cây gồm dưa hấu, cam, chanh, thanh long, dừa, xoài, măng cụt. Làm chín liên tiếp trong 320 mili giây được nhân điểm tới 5 lần. Ba mùa, để rơi một quả hoặc chạm phải trái còn non là mất một mùa. Không lưu điểm, đóng là hết.

Bản đầu trò này tên **Đồ Long Đao**, người chơi cầm đao chém trái cây và né quả bom. Đổi đi vì cả app không có kẻ thù nào, trong khi tên đao nghĩa là chém rồng. Nắng thay cho đao, trái còn non thay cho bom: chạm vào thì mất một mùa vì vội quá, chứ không ai nổ ai. Màn hình cũng không rung giật và loé đỏ nữa, chỉ sẫm xanh lại một nhịp rồi vài mảnh xanh rơi xuống.

Trái non phải nhìn là biết đừng chạm, nếu không người chơi tưởng nó cũng là trái chín. Ba dấu hiệu tách hẳn nó khỏi trái chín: màu xám xanh đục không bắt sáng, vỏ sần chứ không bóng, và một vòng nét đứt thở đều quanh quả. Trái chín thì căng, bóng, có đốm sáng.

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

Ba tiếng chính đều làm theo tài liệu chứ không mò:

| Tiếng | Cách sinh | Căn cứ |
|---|---|---|
| Giọt nước | `A·sin(2π f(t)·t)·e^(−βt)` với `f(t) = f0(1+ξt)`, ξ = 0,1 và β = 0,043·f0. Gần như **thuần âm**, cao độ **nhích lên** trong lúc tắt. Bốn cỡ giọt 640 / 820 / 1150 / 1650 Hz; chạm mạnh thì bong bóng to nên chọn giọt trầm, hạt mưa nhỏ thì chọn giọt cao | mô hình bong bóng của van den Doel 2005; cộng hưởng Minnaert `f0 ≈ 3,26/R` cho bong bóng 2 mm ~1600 Hz, 5 mm ~650 Hz |
| Tiếng ộp | bảy sóng hài của f0 (420–780 Hz) bị **băm biên độ 46–68 nhịp mỗi giây**, mỗi tiếng dài 190 ms, một câu có 1–3 tiếng | tiếng ếch là sóng hài bị băm biên độ 40–130 nhịp/giây, dải trội 400–4000 Hz |
| Tiếng dế | **hình sin thuần 4,5 và 4,8 kHz**, bốn xung 17 ms cách nhau 18 ms, mỗi xung bọc cửa sổ `sin²` cho khỏi cạch hai đầu | carrier 4,5–4,8 kHz, xung 15–20 ms, nghỉ 15–20 ms, 3–5 xung một tiếng |

Thêm tiếng bẹt ướt khi ếch đạp chân rời lá hoặc đáp xuống lá (nhiễu qua một cực thông thấp 250–380 Hz, tắt trong 130–170 ms, kèm một chút cao cho ra cái sột của mặt lá), tiếng cá đớp, và tiếng lưỡi phóng.

**Không có tiếng nền.** Bản đầu tôi cho một vòng nhiễu lọc trầm chạy liên tục; nghe ra tiếng quạt rì rì chứ không ra hồ nước, nghe lâu thì mệt. Hồ đêm thật thì im — chỗ im giữa hai tiếng mới là phần làm nó dịu.

**Kết xuất sẵn thành mẫu.** Bản đầu tôi dựng cả chuỗi lọc cho từng tiếng, mỗi gợn sóng là 6–10 node Web Audio mới, máy yếu gánh không nổi nên thấy lag. Giờ mỗi tiếng được tính ra mẫu **đúng một lần** lúc bật tiếng (sáu bộ mẫu, tính bằng vòng lặp thuần trên `Float32Array`), sau đó phát lại chỉ tốn hai node và có xê dịch `playbackRate` cho khỏi giống nhau. Nhiều nhất 8 tiếng vang cùng lúc, tiếng nước cách nhau tối thiểu 110 ms.

Đo bằng `AnalyserNode` gắn vào mức chung:

| Tiếng | Đỉnh phổ đo được | Khớp với |
|---|---|---|
| Giọt nước | 656 Hz, 0% năng lượng trên 3 kHz | Minnaert cho bong bóng 5 mm: 652 Hz |
| Tiếng ộp | 375 Hz, 0% trên 3 kHz | dải trội quanh 400 Hz |
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

**Mùa con trùng.** Cứ 50–110 giây hồ đổi mức mùa, ngẫu nhiên từ 0,35 tới 1,9 lần. Mùa rộ thì 8–18 giây một tốp và cùng lúc có tới bốn con; mùa vắng thì gần hai phút mới có một con. Đó là cái làm đàn ếch phồng lên rồi xẹp xuống.

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

## Hồ nước: cân bằng cá và nòng nọc

Cú phóng của cá phải bắt đầu **xa hơn** khoảng nòng nọc cong đuôi chạy. Bản trước cá tăng tốc ở 55 pixel còn nòng nọc bỏ chạy từ 62, nên có một vành đai mà nòng nọc nhanh hơn cá: nó thoát ra, cá chậm lại, rồi lặp mãi, không con nào bị bắt.

Nay cá phóng từ 95 pixel, bơi 46–66 px/s, và nòng nọc vọt xong phải nghỉ hơn nửa giây mới vọt tiếp. Đo thử với 10 nòng nọc và 3 con cá trong 30 giây: cá ăn được 9 tới 10 con. Chạy tự nhiên 4 phút thì hồ vẫn cân, ếch từ 4 lên 9 rồi về 6, nòng nọc không bị quét sạch.

Thẻ bọc màn hình lúc đang ẩn có bề rộng bằng 0, mọi toạ độ tính từ đó thành vô định rồi canvas ném lỗi. Cả năm màn hình phủ kín đều đã chặn: lấy tạm kích thước cửa sổ cho tới khi trang bày xong.

## Gõ từ tiếng Anh

Một ngôi sao hồng nhạt, `#go-tu`. Chọn cấp rồi gõ luôn, mỗi lượt hai mươi từ. Một từ tiếng Anh hiện giữa màn hình, nghĩa tiếng Việt ngay dưới; gõ đúng chữ nào thì chữ đó sáng hồng, chữ đang tới có gạch chân nhấp nháy. **Gõ sai thì chữ không chạy**, chỉ rung một cái — không chặn đường, gõ lại chữ đúng là qua, nên không ai kẹt ở một từ. Hết hai mươi từ thì xem lại: ký tự mỗi phút, từ mỗi phút, tỉ lệ gõ đúng, và **mấy từ vấp nhiều nhất kèm nghĩa** để ngó lại một lượt trước khi gõ tiếp.

Có nút loa đọc từ lên bằng giọng máy sẵn trong trình duyệt (`speechSynthesis`, giọng `en-US`, tốc độ 0,85). Không nhúng file âm thanh nào, máy nào không có thì nút tự im chứ không lỗi.

**Vốn từ không tự bịa.** Lấy từ [NGSL 1.2](https://www.newgeneralservicelist.com/) — New General Service List của Browne, Culligan & Phillips, bản tháng 4/2023: 2 801 từ gốc rút từ 273 triệu từ của Cambridge English Corpus, phủ hơn 92% văn bản tiếng Anh thông thường. Danh sách chia sẵn ba dải tần suất 1000 / 2000 / 3000 nên **ba cấp ở đây chính là ba dải đó**, giữ nguyên thứ tự tần suất, cấp một là những từ hay gặp nhất. Mỗi cấp lấy 120 từ đầu dải sau khi bỏ:

- từ chức năng (`the`, `of`, `to`, `and`…) — dịch lẻ ra thì vô nghĩa mà gõ cũng chẳng học được gì
- từ dưới ba chữ cái — gõ một hai phím thì không thành bài tập
- vài từ không hợp giọng một app tĩnh tâm

Nghĩa tiếng Việt lấy nghĩa thông dụng nhất; từ nào hai nghĩa hay dùng ngang nhau thì ghi cả hai, ngăn bằng dấu chấm phẩy — `content` là "nội dung; hài lòng", `pupil` là "học trò; con ngươi". `scripts/test-typing.js` soát lại toàn bộ 360 từ: không dòng hỏng, không trùng từ trong một cấp, không từ nào xuất hiện ở hai cấp.

**Đo tốc độ cho thành thật.** Bấm giờ từ phím đầu tiên tới phím cuối cùng, rồi **trừ đi** mấy quãng 380 mili giây nghỉ giữa các từ — quãng đó là app chèn vào cho kịp nhìn chữ vừa xong sáng lên, tính vào thì hoá ra chê người ta gõ chậm. Và ghi thẳng cái đo được chứ không mượn quy ước "năm ký tự là một từ" của mấy bài test gõ tiếng Anh: mượn thì con số không khớp với cái tên tiếng Việt bên dưới nó.

**Bàn phím điện thoại.** Một ô nhập ẩn giữ tiêu điểm để gọi bàn phím lên; cỡ chữ đặt 16px để iOS đừng tự phóng to trang. Ô đó nhận **cả chuỗi** chứ không chỉ chữ cuối, vì bàn phím điện thoại gõ vuốt hay chọn gợi ý thì chèn nguyên một từ trong một lần — lấy mỗi chữ cuối là mất sạch phần đầu.

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

Ảnh gồm nền trời đêm với các vì sao rải theo chính nội dung thông điệp, nên mỗi lá một bầu trời riêng, khung vàng hai lớp, hoa văn mặt trời, thông điệp bằng chữ có chân, ý nghĩa bên dưới, và chân ảnh chỉ ghi tên app cùng ngày. Không ghi số lá, không ghi địa chỉ web.

Cỡ chữ tự co giãn từ 84 xuống 46 pixel cho vừa khung, và cả khối nội dung được căn giữa theo chiều dọc, nên lá chữ ngắn hay dài đều cân. Font nạp trước tối đa 2,5 giây, mạng hỏng thì rơi về font hệ thống chứ không treo.

Bấm nút sẽ mở bảng chia sẻ của máy kèm ảnh và một dòng chữ. Máy không hỗ trợ chia sẻ tệp thì ảnh tự tải về.

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

## Cấu trúc

```
index.html                 giao diện, một màn hình duy nhất
assets/core.js             lõi thuần: ngày tháng, xáo bài, chọn lá của ngày (test bằng Node)
assets/app.js              điều khiển giao diện
assets/app.css             giao diện
data/cards.json            100 lá dùng trong app (31 KB)
sw.js, manifest.webmanifest, icons/     phần PWA, chạy offline, cài lên màn hình chính được
scripts/build-data.py      CSV -> data/cards.json
scripts/test-core.js       29 kiểm thử lõi
scripts/test-pond.js       26 kiểm thử hồ nước, chạy hồ ngoài trình duyệt
scripts/test-typing.js     27 kiểm thử trò gõ từ, gồm soát lại toàn bộ vốn từ
content/raw/               CSV nguồn (v3 và v5)
content/ghi-chu-co-che-game.json        cột "Cơ chế game" trong CSV, giữ làm ghi chú, không dùng trong app
content/cards/, content/topics.json     bản nội dung theo chủ đề từ CSV v3, hiện không dùng
scripts/validate-cards.py  kiểm tra nội dung của bản v3 nói trên
```

## Lệnh

```bash
python3 scripts/build-data.py    # dựng lại data/cards.json từ CSV
node scripts/test-core.js        # chạy 29 kiểm thử lõi (Node 18+)
node scripts/test-pond.js        # chạy 26 kiểm thử hồ, gồm một tiếng mô phỏng
node scripts/test-typing.js      # chạy 27 kiểm thử trò gõ từ
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

Khi mở app, và mỗi lần quay lại app sau khi chuyển sang cửa sổ khác, trình duyệt dò xem `sw.js` có đổi không. Nếu có, service worker mới cài rồi chiếm quyền ngay, và trang tự tải lại **đúng một lần**. Lần cài đầu tiên thì không tải lại, vì lúc đó chưa có bản cũ nào để thay.

Kiểm bằng Chrome thật: cài bản `tdtd-v52`, đổi số phiên bản trên máy chủ thành `tdtd-v53`, gọi dò bản mới. Trang tự tải lại, cache chuyển sang `tdtd-v53` và cache cũ bị xoá.

Vẫn phải tăng số phiên bản trong `sw.js` mỗi lần đổi mã, vì đó chính là tín hiệu để trình duyệt biết có bản mới.

## Đưa lên mạng

Web tĩnh thuần, không cần build. Xem [DEPLOY.md](DEPLOY.md) để biết cách đưa lên Vercel.
