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

Máy chỉ ghi đúng **hai giá trị**, không có giá trị nào là nội dung và không có gì tích lũy theo thời gian:

| Khoá | Nội dung | Vì sao cần |
|---|---|---|
| `tdtd.seed` | một con số ngẫu nhiên, sinh trong lần mở đầu tiên | để mỗi người có bộ bài riêng |
| `tdtd.day` | ngày gần nhất đã nhận thông điệp, dạng `YYYY-MM-DD` | để một ngày chỉ nhận một lần, tải lại trang không rút lại được |

`tdtd.day` bị ghi đè mỗi ngày nên không tạo thành lịch sử. Thông điệp cũ không lưu ở đâu và không xem lại được.

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

### Sao xanh ngọc — Đồ Long Đao

Game chém trái cây để xả stress, mã nguồn ở `assets/game.js`, độc lập hẳn với phần thông điệp.

Miết ngón tay hoặc rê chuột để vung đao. Vệt đao là dải vàng có quầng sáng, mô phỏng lưỡi Đồ Long. Trái cây gồm dưa hấu, cam, chanh, thanh long, dừa, xoài, măng cụt, chém trúng thì đứt đôi và bắn nước. Chém liên tiếp trong 320 mili giây được nhân điểm tới 5 lần. Ba mạng, để rơi một quả hoặc chém trúng bom là mất một mạng. Không lưu điểm, đóng là hết.

Bấm Esc hoặc nút ✕ để thoát.

### Sao cam — thả đèn hoa đăng

Mã ở `assets/lantern.js`. Gõ ra điều đang nặng lòng rồi bấm Thả đi. Chữ biến thành một chiếc đèn giấy bay lên, chữ mờ dần trước, rồi đèn nhỏ lại và tắt hẳn sau khoảng 17 giây. Vài chiếc đèn khác trôi sẵn trên nền cho đỡ trống.

Ô nhập được xoá ngay lúc bấm thả. Chữ chỉ tồn tại trong bộ nhớ của trang, không ghi xuống máy, không gửi đi đâu. Đóng màn hình là mất sạch.

### Sao xanh nước — hồ nước

Mã ở `assets/pond.js`. Chạm hoặc miết trên mặt nước, sóng lan ra rồi tắt. Năm chiếc lá sen rải thưa, không đè nhau, nhún lên khi sóng đi qua. Thỉnh thoảng có hạt mưa tự rơi.

Trên lá có bốn con ếch lúc mở màn. Chạm đúng vào con nào thì con đó giật mình phóng sang chiếc lá **xa ngón tay nhất**, nên chạm bên này là đẩy nó qua bên kia. Chạm chỗ khác trên hồ thì chỉ có sóng, ếch vẫn ngồi. Không có nhiệm vụ nào cả: muốn dồn cả đàn vào một lá, muốn rải mỗi con một nơi, hay chỉ ngồi xem cũng được.

- Vùng chạm của mỗi con nới rộng tới 40 px vì ngón tay to hơn con ếch. Con đang bay thì chạm không ăn, con đang bơi thì chạm là nó phóng lên lá gần nhất.
- Chọn lá đích bằng cách chấm điểm: đúng hướng tránh ngón tay được ưu tiên gấp đôi, lá gần hơn được thêm một chút. Giật mình thì cú nhảy nhanh và cao hơn cú nhảy thường.
- Mỗi con tự nhảy sau 5–15 giây; ngồi cùng lá với bạn, hoặc già rồi, thì lười hơn.
- Con trỏ chuột là mũi trỏ thường trên mặt nước, chỉ thành bàn tay khi rê vào đúng một con ếch.

**Lá chìm.** Sức chở của lá chia theo bán kính, mỗi 6 px thêm một con: 26–31 px chịu 2 con, 32–37 px chịu 3, 38–43 px chịu 4, từ 44 px chịu 5. Chiếc lá đầu tiên luôn được rải to (44–50 px). Dồn quá sức thì lá lún dần chừng một giây rưỡi, nước loang lên mặt lá, rồi **con lên sau cùng bị tuột xuống nước**: nó bơi 54 px mỗi giây sang chiếc lá gần nhất còn chỗ rồi trèo lên, thân ngập nước chỉ còn cái đầu nhô lên, hai chân đạp nước và để lại vệt sóng.

**Vòng đời.** Ngồi chơi lâu thì thấy trọn một vòng, không có gì phải bấm:

| Chặng | Thời gian | Chuyện gì xảy ra |
|---|---|---|
| Ruồi hoặc muỗi bay qua | 16–34 giây một con, chia cho mức mùa | Bay lượn thất thường, hay quẩn quanh mấy chiếc lá, có bóng nhỏ chạy theo dưới nước. Muỗi nhỏ hơn và có chân dài lêu nghêu |
| Ếch ngắm | khi con bọ vào trong 4,2 lần thân | Ếch quay đầu nhìn theo. Con nào no gần đầy (trên 0,92) thì chẳng thèm, để dành cho con đói |
| Phóng lưỡi | 0,3 giây | Vào trong 2,5 lần thân và đầu đã quay tới trong 0,6 radian thì lưỡi phóng ra, dính con bọ ở đầu lưỡi rồi kéo về. Nhảy giữa lúc đó thì nhả lưỡi, con bọ thoát |
| Đẻ trứng | xét lại mỗi 35–60 giây | Tới hẹn mà mức no trên 0,6 thì đẻ một ổ **3–7 trứng** sát mép lá và trả 0,3 mức no. Còn đói thì khoan, mươi giây nữa xét lại |
| Trứng nở | 20–26 giây | Mầm đen mọc đuôi rồi nở ra một đàn nòng nọc |
| Nòng nọc lớn | 40–55 giây | Bơi lượn, thân to dần, quá 62% thời gian thì nhú hai chân sau. Chạm gần thì nó vọt đi tránh ngón tay |
| Thành ếch | | Bơi tới chiếc lá còn chỗ rồi trèo lên. Hồ đã đủ 9 con thì nó chờ, mỗi lần 12 giây, chờ hết ba lần vẫn chật thì không qua được |

Thang thời gian đặt cho **một phiên chơi 5 phút thấy trọn vòng**. Đo ba phiên: con bọ đầu tiên hiện ở giây thứ 6–9, ếch phóng lưỡi ở giây 9–17, ổ trứng đầu tiên ở giây 44–59, nòng nọc ở giây 68–83, con ếch mới ở phút thứ **1,8–2,1**, và con đầu tiên chết ở phút thứ 2–2,8. Nghĩa là chơi hai phút là đã thấy hết chuỗi, năm phút thì thấy sang lứa sau.

**Đói và chết.** Mỗi con có mức no từ 0 tới 1. Sống là tiêu: no đầy mà không ăn gì thì gần 4 phút là kiệt. Một con mồi bù lại 0,4. Đói thì **trước hết là không đẻ**, cạn hẳn mới chết; ngoài ra mỗi con có tuổi thọ riêng 3,5–6 phút, hết tuổi cũng chết. Chết thì ngồi yên, nhắm mắt, màu bạc dần rồi lịm xuống tan vào nước trong 2,6 giây, để lại một vòng sóng — không có xác nổi. Càng đói hoặc càng già thì màu càng bạc, nên nhìn là biết con nào đang yếu.

**Cá.** Hồ chỉ có nhiều nhất **một con cá** cùng lúc. Mỗi 45–110 giây có một con ghé, ở lại 24–44 giây rồi bơi ra mép mà biến. Nó bơi dưới mặt nước nên chỉ là cái bóng mờ, nổi rõ dần khi nó rượt. Thấy nòng nọc trong 130 px thì đuổi, vào 55 px thì phóng một cú nhanh gấp đôi, tới 30 px là đớp; đớp xong lặn xuống nghỉ 5–11 giây. Nòng nọc thấy cá trong 58 px thì cong đuôi chạy, nhưng chỉ vọt được một quãng nên không thắng nổi cú phóng. Mỗi chuyến cá ghé thường mất 0–3 con nòng nọc.

**Mùa con trùng.** Cứ 50–110 giây hồ đổi mức mùa, ngẫu nhiên từ 0,35 tới 1,9 lần. Mùa rộ thì 8–18 giây một con bọ và cùng lúc có tới bốn con; mùa vắng thì gần hai phút mới có một con. Đó là cái làm đàn ếch phồng lên rồi xẹp xuống.

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
content/raw/               CSV nguồn (v3 và v5)
content/ghi-chu-co-che-game.json        cột "Cơ chế game" trong CSV, giữ làm ghi chú, không dùng trong app
content/cards/, content/topics.json     bản nội dung theo chủ đề từ CSV v3, hiện không dùng
scripts/validate-cards.py  kiểm tra nội dung của bản v3 nói trên
```

## Lệnh

```bash
python3 scripts/build-data.py    # dựng lại data/cards.json từ CSV
node scripts/test-core.js        # chạy 29 kiểm thử lõi (Node 18+)
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
