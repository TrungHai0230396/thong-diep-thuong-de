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
| Nối sao thành chòm | `#noi-sao` |
| Gõ từ tiếng Anh | `#go-tu` |
| Tập nói tiếng Anh | `#tap-noi` |
| Bầu trời đêm nay | `#troi-dem` |

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

Hiện có tám ngôi sao. Sáu ngôi đầu tả ngay dưới đây, hai ngôi mới nhất — gõ từ tiếng Anh và bầu trời đêm nay — có mục riêng ở cuối:

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

### Sao lục nhạt — tập nói tiếng Anh

Mã ở `assets/english.js` và `assets/nghe.js`, địa chỉ riêng `#tap-noi`. Khác với trò **gõ từ tiếng Anh** ở chỗ đó luyện mặt chữ và từ vựng, còn trò này luyện **câu nói ra miệng trong một tình huống có thật**. Mỗi cảnh là một việc thật ngoài đời: **người ta nói trước, bạn chọn câu đáp** trong ba câu. Sáu cảnh, tổng 27 lượt: gặp lần đầu, mua cà phê, hỏi đường, ở quán ăn, mua quần áo, hỏi thăm bạn.

Mức **A1 theo khung CEFR**: chào hỏi, tự giới thiệu, hỏi đáp thông tin cá nhân đơn giản, mua bán, hỏi đường, gọi món. Câu ngắn, thì hiện tại, từ vựng thông dụng.

Nguyên tắc khi viết nội dung, và đó mới là phần khó chứ không phải phần mã:

- **Hai câu sai phải sai vì lý do dạy được điều gì đó**, không phải sai vu vơ. Ví dụ với câu hỏi *What do you do?* thì câu sai là *"I'm doing my homework"* — đúng ngữ pháp, nhưng đó là trả lời cho *What are you doing?*. Chỗ lẫn này người mới học mắc thật.
- **Mỗi câu sai có một dòng nói vì sao sai**, viết bằng tiếng Việt, ngắn. Chọn sai thì hiện dòng đó rồi cho chọn lại — **không trừ điểm, không đếm giờ, không thua**.
- **Mỗi lượt có một dòng mẹo** rút ra cái dùng lại được: *"Sau `like` thì động từ thêm -ing"*, *"Câu hỏi cho hai lựa chọn thì không trả lời yes được"*.
- Câu tiếng Anh nào cũng có bản dịch ngay bên dưới, vì A1 mà bắt đoán nghĩa thì nản.

**Ba cách chơi**, đổi bằng ba nút ngay đầu màn hình:

| Cách | Bạn làm gì | Cần mạng | Gửi gì đi |
|---|---|---|---|
| Bấm chọn | bấm một trong ba câu | không | không gửi gì |
| **Nói** (mặc định khi máy nghe được) | **nói ra miệng** câu đáp | có | tiếng của bạn, tới Google hoặc Apple |
| Nói tự do | nói gì cũng được, AI đáp lại và sửa câu | có | câu bạn nói, tới Google |

Phải nói thẳng vì README này có hứa "không gửi dữ liệu đi đâu": **hai cách sau phá lời hứa đó**, và app ghi rõ điều ấy ngay dưới ba nút chọn cách chơi chứ không giấu. Máy nhận giọng nói của trình duyệt gửi đoạn tiếng lên máy chủ Google (Chrome) hoặc Apple (Safari) — MDN ghi nguyên văn *"your audio is sent to a web service for recognition processing"*. Cách **Bấm chọn** vẫn chạy offline và không gửi gì, nên ai không muốn thì vẫn học được trọn vẹn.

**Vì sao chế độ Nói không cần AI.** Trong mỗi lượt chỉ có đúng ba câu người học có thể nói. Việc của máy không phải "hiểu" mà chỉ là so câu nghe được với ba câu đã biết — nên `assets/nghe.js` là hàm thuần, kiểm được bằng Node, không khoá, không máy chủ, không tốn đồng nào.

Bộ so khớp: chuẩn hoá (hạ chữ thường, bung viết tắt `I'm`→`i am`, đổi chữ số thành chữ, `$3`→`three dollars`, bỏ dấu câu) rồi chấm bằng **0,58 × Dice trên cặp ký tự + 0,42 × trùng từ**. Nhận ngay khi điểm ≥ 0,75, nhận dè dặt khi ≥ 0,60, và **cả hai đều đòi bỏ câu đứng nhì ít nhất 0,08** — không bỏ xa thì coi như chưa nghe rõ.

Chỗ này phải đo chứ không đoán được, vì người Việt nói tiếng Anh bị máy nghe sai nhiều nhất trong sáu nhóm tiếng mẹ đẻ từng được đo (MER 0,143 so với 0,007 của người bản ngữ, tức sai gấp hai chục lần). `node scripts/test-nghe.js` mô phỏng đúng mấy lỗi hay gặp rồi chạy trên cả 81 câu:

| Kiểu méo giọng | Nhận đúng | Nhầm sang câu khác |
|---|---|---|
| Nghe chuẩn | 27/27 lượt phân biệt sạch ba câu | 0 |
| Rụng phụ âm cuối | 87,7% | **0** |
| Thêm th→t | 85,2% | **0** |
| Thêm rụng mạo từ | 85,2% | **0** |
| Thêm rụng hẳn một từ | 82,7% | **0** |

Con số đáng giá nhất là cột cuối: **không lần nào nhận nhầm sang câu khác**. Hỏng thì chỉ là "nói lại nhé", chứ không bao giờ khen sai.

Ba điều cố ý trong chế độ Nói:

- Bong bóng của người học luôn hiện **câu chuẩn trong kịch bản**, không hiện chữ máy nghe ra. Cho người mới học nhìn lại *"ai am from viet nahm"* là dạy họ rằng họ dở.
- Khớp mờ thì vẫn nhận, nhưng kèm một dòng xám *"máy nghe thành…"*. Trò này **không chấm phát âm và không được giả vờ là chấm** — giá trị thật của nó là dám mở miệng nói.
- Nói trượt hai lần thì tự bung ba câu ra cho nhìn mà đọc theo. Mô tả A1 của CEFR có hẳn vế *người kia giúp mình đặt câu*, nên nhìn câu đọc theo là đúng mức chứ không phải gian lận.

Giọng đọc lấy từ bộ đọc sẵn có của trình duyệt qua Web Speech, **không nhúng file tiếng nào**. Máy đọc câu của người kia ngay khi câu hiện ra, tốc độ 0,85; chạm vào bất kỳ bong bóng nào để nghe lại, lúc đó chậm hơn nữa còn 0,72 cho kịp nghe. Nút loa ở góc trên bên trái tắt giọng đọc. Máy nào không có giọng tiếng Anh thì trò vẫn chơi được bình thường, chỉ là im.

Hết cảnh thì hiện lại **mấy câu chính bạn vừa nói**, chạm câu nào nghe câu đó, kèm hai nút tập lại hoặc chọn cảnh khác. Không lưu gì xuống máy, đóng ra là hết.

Nội dung có bài kiểm riêng, `node scripts/test-english.js`: mỗi lượt phải có **đúng một** câu đúng, câu sai nào cũng phải có lời giải thích dài hơn tám ký tự, câu tiếng Anh không được lẫn dấu tiếng Việt, không quá 12 chữ, phải viết hoa chữ đầu và có dấu kết câu. Hiện 27 lượt qua hết 20 phép kiểm, câu dài nhất 9 chữ.

**Chế độ "Nói tự do" và khoá Gemini.** Đây là phần duy nhất trong cả app cần máy chủ. Câu người học nói được gửi tới `/api/noi` (hàm serverless ở **`api/noi.mjs`**), hàm đó gọi Gemini rồi trả về câu đáp trong vai nhân vật, kèm câu sửa và một dòng mẹo tiếng Việt.

Đuôi **`.mjs` là bắt buộc, không phải sở thích**: tài liệu Vercel ghi rõ dự án không dùng framework thì *"you must either add `"type": "module"` to your package.json or change your JavaScript Functions' file extensions from .js to .mjs"*. Chọn `.mjs` để **khỏi phải thêm `package.json`** — ngay khi có file đó ở gốc, Vercel sẽ chạy `npm install` mỗi lần deploy và app mất tính "không phụ thuộc, không build" mà nó đang có. Hàm viết theo Web Handler (`export async function POST(request)`, trả về `Response`), không phải kiểu `(req, res)`.

**Khoá API không nằm trong mã** và không được phép nằm trong mã: repo này công khai, trang web cũng công khai, nhét khoá vào file JS là ai mở trang cũng đọc được. Khoá đặt ở biến môi trường **`GEMINI_API_KEY`** trong phần Settings → Environment Variables của dự án trên Vercel. Chưa đặt thì hàm trả về `503 {"loi":"chua-cau-hinh"}`, app báo rõ và hai cách chơi kia vẫn chạy bình thường.

Hàm tự giữ mình: chỉ nhận `POST`, chặn lời gọi từ nguồn khác bằng cách so `Origin` với `Host`, cắt câu dài quá 240 ký tự, chỉ gửi lại 14 lượt gần nhất, và chặn thô 20 lượt một phút cho mỗi IP. Lời dặn cho model nằm ở phía máy chủ nên người dùng không sửa được thành chuyện khác.

Model dùng `gemini-3.5-flash-lite`, đo được **1,1 giây một lượt**, tốn chừng 72 token vào và 45 token ra. `gemini-2.5-flash` đã ngừng nhận người dùng mới.

**Ba điều nên biết trước khi bật khoá:**

- **Mức miễn phí đổi bằng dữ liệu.** Điều khoản của bậc Free ghi rõ Google được dùng nội dung để cải thiện sản phẩm, và *"human reviewers may read, annotate, and process your API input and output"*. Với trò tập nói thì thứ gửi đi là câu người học vừa nói ra. Muốn tránh thì phải lên bậc trả tiền, hoặc đơn giản là dùng hai cách chơi kia.
- **Gói Hobby của Vercel không tính tiền vượt hạn mức, mà khoá dự án 30 ngày.** Hạn mức là 1.000.000 lượt gọi hàm mỗi tháng, và không có cách trả tiền để mở lại sớm — lối thoát duy nhất là nâng lên Pro 20 USD/tháng. Hàm này công khai, nên nếu có ai nghịch thì rủi ro là mất trang 30 ngày chứ không phải mất tiền. Hàm đã chặn thô 20 lượt một phút mỗi IP và cắt `maxOutputTokens` xuống 300, nhưng bộ đếm nằm trong bộ nhớ của từng thực thể hàm nên không chắc chắn.
- **Đổi biến môi trường xong phải deploy lại.** Tài liệu Vercel: *"Any change you make to environment variables are not applied to previous deployments, they only apply to new deployments."*

Một điều đáng biết trước khi dựa vào chế độ này: khung CEFR mô tả A1 là *người kia nói chậm, nhắc lại, và giúp mình đặt câu* — **hội thoại tự do vốn là mô tả bậc B1**. Nên chế độ Nói theo kịch bản mới là phần chính, còn Nói tự do để dành cho lúc đã quen.

Thêm cảnh mới chỉ cần thêm một mục vào mảng `CANH`, không phải sửa gì khác:

```js
{ id: 'san-bay', ten: 'Ở sân bay', ai: 'Nhân viên', moTa: 'Làm thủ tục, hỏi cổng', hinh: '✈️',
  luot: [
    { ho: "Good morning. Your passport, please.", hoVi: 'Chào buổi sáng. Cho xem hộ chiếu ạ.',
      meo: '"Here you are" dùng khi đưa đồ cho ai đó.',
      chon: [
        { en: "Here you are.", vi: 'Của bạn đây.', dung: true },
        { en: "I'm fine, thank you.", vi: 'Mình khỏe, cảm ơn.', viSao: 'Câu này để đáp "How are you?".' },
      ] } ] }
```

Một chỗ suýt sai lúc làm: tôi đặt class cho bong bóng của người kia là `ho`, **trùng với class `.ho` của hồ nước** (`position:fixed;inset:0`), nên bong bóng nhảy ra phủ kín màn hình. Class trong app này phải có tiền tố riêng của từng trò.

### Sao vàng — luyện phát âm

Mã ở `assets/ipa.js` (trò), `assets/amvi.js` (dựng ra âm) và `assets/khauhinh.js` (vẽ hình),
địa chỉ riêng `#phat-am`. Mười bảy âm, mỗi âm là một **buổi dắt tay năm bước** chứ không phải
một trang tra cứu.

**App tự dựng lấy tiếng, không dùng máy đọc để phát âm.** Máy đọc của trình duyệt chỉ đọc được
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
79 nghiên cứu cho g=0,92). Nên bước hai là **luyện tai**: app phát một trong hai âm bằng một
trong **năm giọng tổng hợp khác nhau**, bạn chọn vừa nghe âm nào, báo đúng sai ngay, tám lượt.
Năm giọng là cố ý — nghe mãi một mẫu thì người ta nhớ *mẫu* chứ không học được *âm*.

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

**Ba chỗ app nói thật dù nói ra thì kém hấp dẫn hơn:**

- **Không có điểm phát âm.** Máy nhận giọng trả về CHỮ chứ không trả về ÂM. Tôi có thử đưa một
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

Chín phép thử giữ chỗ này: đủ 209 lá, không lọt đuôi `(Thông điệp ngày N)`, không lọt lời giảng dán mẫu, không lời giảng nào dùng cho hai lá, không hai lá nào nói lại cùng một điều, không nháy đơn thẳng, không thừa dấu chấm sau ngoặc kép, không mũi tên gõ tay, không con số phần trăm.

## Bầu trời đêm nay

Một ngôi sao xanh nhạt, `#troi-dem`. Mở ra là **bầu trời thật, ở chỗ bạn đang đứng, vào đúng lúc này**: Mặt Trời, Mặt Trăng, năm hành tinh mắt thường thấy được, và tám chòm sao mượn lại toạ độ thật của trò Nối sao. Kéo để nhìn quanh, hoặc bấm *Xoay theo máy* rồi giơ điện thoại lên — hướng máy về phía nào thì thấy bầu trời phía đó.

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

Ảnh gồm nền trời đêm với các vì sao rải theo chính nội dung thông điệp, nên mỗi lá một bầu trời riêng, khung vàng hai lớp, hoa văn mặt trời, thông điệp bằng chữ có chân, ý nghĩa bên dưới, và chân ảnh **chỉ ghi ngày**. Không ghi tên app, không ghi số lá, không ghi địa chỉ web.

Cỡ chữ tự co giãn từ 84 xuống 46 pixel cho vừa khung, và cả khối nội dung được căn giữa theo chiều dọc, nên lá chữ ngắn hay dài đều cân. Font nạp trước tối đa 2,5 giây, mạng hỏng thì rơi về font hệ thống chứ không treo.

Bấm nút sẽ mở bảng chia sẻ của máy, **chỉ kèm tấm ảnh, không kèm chữ**. Máy không hỗ trợ chia sẻ tệp thì ảnh tự tải về.

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
scripts/test-core.js       37 kiểm thử lõi
scripts/test-pond.js       38 kiểm thử hồ nước, chạy hồ ngoài trình duyệt
scripts/test-typing.js     27 kiểm thử trò gõ từ, gồm soát lại toàn bộ vốn từ
scripts/test-astro.js      21 kiểm thử thiên văn, đối chiếu số liệu ngoài
scripts/test-phatam.js     65 kiểm thử trò phát âm: nội dung, bài nghe, hình vẽ, hình động
scripts/test-amvi.js       47 phép đo phổ bộ dựng âm, đối chiếu số liệu ngữ âm học
content/raw/               CSV nguồn (v3, v5, v6 và bản 365)
content/ghi-chu-co-che-game.json        cột "Cơ chế game" trong CSV, giữ làm ghi chú, không dùng trong app
content/cards/, content/topics.json     bản nội dung theo chủ đề từ CSV v3, hiện không dùng
scripts/validate-cards.py  kiểm tra nội dung của bản v3 nói trên
```

## Lệnh

```bash
python3 scripts/build-data.py    # dựng lại data/cards.json từ CSV
node scripts/test-core.js        # chạy 37 kiểm thử lõi (Node 18+)
node scripts/test-pond.js        # chạy 38 kiểm thử hồ, gồm một tiếng mô phỏng
node scripts/test-typing.js      # chạy 27 kiểm thử trò gõ từ
node scripts/test-astro.js       # chạy 21 kiểm thử thiên văn
node scripts/test-english.js     # chạy 20 kiểm thử nội dung trò tập nói
node scripts/test-nghe.js        # chạy 17 kiểm thử bộ so khớp câu nói
node scripts/test-phatam.js      # chạy 65 kiểm thử trò luyện phát âm
node scripts/test-amvi.js        # chạy 47 phép đo bộ dựng âm vị
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
