/* Hôm nay ăn gì — dữ liệu món và phần tính toán. Hàm THUẦN: không DOM, không mạng; kiểm bằng Node
   (scripts/test-angi.js). Giao diện ở assets/angi.js.

   Vì sao người ta kẹt ở câu "ăn gì", và app đáp lại ra sao (README, mục Hôm nay ăn gì):
   - Hỏi bất chợt thì không nhớ ra món nào → app đưa sẵn món hợp bữa, hợp trời, hợp túi tiền.
   - Nhiều lựa chọn quá thì càng khó chọn → mỗi vòng chỉ tám món, khác nhóm nhau.
   - Biết rõ mình KHÔNG muốn gì hơn là muốn gì → lọc "không ăn", gạch món, né món đã ăn mấy hôm nay.
   - Đi nhóm thì ai cũng "gì cũng được" rồi lại chê → mỗi người tim hay gạch riêng, vòng quay quyết thay.
   - Hôm qua ăn rồi → nhớ món đã chốt hai ngày gần nhất (chỉ mã món và ngày, quá bảy ngày thì tự xoá).

   Vòng quay CÔNG BẰNG: chọn món trước bằng số ngẫu nhiên theo đúng diện tích từng miếng, rồi giải ngược vận tốc đầu
   để bánh xe — chạy đúng phép tính ma sát như lúc vuốt tay — dừng ở chỗ đã chọn. Xác suất mỗi món đúng bằng phần bánh
   xe của nó, còn chuyển động vẫn thật. */
(function () {
'use strict';

/* ---------- món ăn ngoài, gọi về ----------
   Mỗi dòng một món, các cột cách nhau bằng dấu |:
     mã | tên | tên ngắn trên vòng quay | nhóm | bữa | dấu | đạm | giá | vùng | phổ biến | mô tả
   nhóm   bun · soi (phở, mì, hủ tiếu, bánh canh, miến) · com · banh (bánh mì, bánh cuốn, bánh xèo…) · chao (cháo, xôi)
          · lau (lẩu, ốc: ngồi lâu) · vat (ăn vặt) · ngoai (món nước ngoài)
   bữa    S sáng · T trưa · C chiều · O tối · K khuya
   dấu    n món nước · c cay sẵn trong món · m nóng hổi, hợp trời mưa, lạnh · t mát, hợp trời nóng · d nhiều dầu mỡ
          · g hợp đi đông, ngồi lâu
   đạm    thứ có sẵn trong bát mặc định (có nhiều kiểu thì lấy kiểu hay gặp nhất): b bò · h heo · g gà · v vịt, ngan
          · c cá, lươn · s tôm, cua, mực, ốc · * tự chọn món · trống là không có thịt cá · chay là món chay
   giá    1 dưới 40k · 2 khoảng 40–80k · 3 trên 80k, một người ở quán bình thường trong thành phố, năm 2026 — chỉ để lọc thô
   vùng   B, T, N gốc miền Bắc, Trung, Nam · Q món nước ngoài · trống là đâu cũng có
   phổ biến  1 ít quán · 2 hay gặp · 3 đâu cũng có — món phổ biến lên vòng nhiều hơn */
const NGOAI_THO = `
bun-bo-hue|Bún bò Huế|Bún bò Huế|bun|STO|ncm|bh|2|T|3|Nước dùng sả, mắm ruốc, cay nồng; bắp bò, giò heo, chả cua
bun-cha|Bún chả|Bún chả|bun|TO||h|2|B|3|Chả viên, chả miếng nướng than hoa, nước chấm chua ngọt, rau sống
bun-rieu|Bún riêu cua|Bún riêu|bun|STO|nm|sh|1|B|3|Riêu cua đồng, cà chua, đậu phụ rán, giò; chấm thêm mắm tôm
bun-thit-nuong|Bún thịt nướng|Bún thịt nướng|bun|TOC|t|h|1|N|3|Thịt heo nướng sả, chả giò, đồ chua, mỡ hành, nước mắm chua ngọt
bun-dau|Bún đậu mắm tôm|Bún đậu|bun|TOC|dg|h|2|B|3|Đậu phụ rán giòn, chả cốm, thịt luộc; chấm mắm tôm đánh chanh
bun-mam|Bún mắm|Bún mắm|bun|TO|nm|chs|2|N|2|Nước lèo mắm cá linh, cá sặc; tôm, mực, heo quay, cà tím
bun-moc|Bún mọc|Bún mọc|bun|ST|n|h|1|B|2|Nước dùng xương trong, mọc viên, sườn non, nấm hương
bun-ca|Bún cá|Bún cá|bun|ST|n|c|1||2|Cá chiên giòn, cà chua, thì là, nước dùng chua nhẹ
bun-cha-ca|Bún chả cá Nha Trang|Bún chả cá|bun|ST|n|c|1|T|2|Chả cá chiên, chả hấp, nước dùng ngọt thanh nấu từ cá
bun-thang|Bún thang|Bún thang|bun|ST|n|gh|2|B|1|Gà xé, trứng tráng thái chỉ, giò lụa, nước dùng thanh, chút mắm tôm
bun-ngan|Bún ngan|Bún ngan|bun|STO|nm|v|2|B|2|Thịt ngan chặt miếng, măng khô, nước dùng ngọt, chấm gừng
bun-mang-vit|Bún măng vịt|Bún măng vịt|bun|TO|nm|v|2|N|2|Vịt luộc chấm nước mắm gừng, măng tươi, nước dùng thanh
bun-oc|Bún ốc|Bún ốc|bun|ST|nt|s|1|B|2|Ốc nhồi, nước dùng chua nhẹ vị dấm bỗng, cà chua, rau sống
bun-bo-nam-bo|Bún bò Nam Bộ|Bún bò Nam Bộ|bun|TO|t|b|2|B|2|Bún trộn bò xào, lạc rang, hành phi, rau thơm — tên Nam Bộ mà quê Hà Nội
bun-chay|Bún chay|Bún chay|bun|STO|n|chay|1||1|Nước dùng rau củ ngọt thanh, đậu hũ, nấm, chả chay
pho-bo|Phở bò|Phở bò|soi|STOK|nm|b|2|B|3|Nước dùng xương ninh quế hồi, bánh phở mềm, tái, nạm, gầu
pho-ga|Phở gà|Phở gà|soi|STO|nm|g|2|B|3|Gà ta xé, nước dùng trong và ngọt, lá chanh thái chỉ
pho-cuon|Phở cuốn|Phở cuốn|soi|TOC|t|b|2|B|1|Bánh phở lá cuộn bò xào, rau thơm, chấm nước mắm chua ngọt
pho-xao|Phở xào bò|Phở xào|soi|TOK|d|b|2|B|2|Bánh phở xào lửa to với bò và rau cải, thơm mùi chảo
pho-chay|Phở chay|Phở chay|soi|ST|nm|chay|1||1|Nước dùng củ quả, nấm đông cô, đậu hũ non, rau thơm
hu-tieu-nam-vang|Hủ tiếu Nam Vang|Hủ tiếu Nam Vang|soi|STOK|n|hs|2|N|3|Nước dùng xương heo ngọt thanh, tôm, gan, thịt bằm, trứng cút
hu-tieu-go|Hủ tiếu gõ|Hủ tiếu gõ|soi|CK|n|h|1|N|2|Hủ tiếu xe đẩy gõ lóc cóc, tô nhỏ, rẻ, ăn khuya là hợp
hu-tieu-chay|Hủ tiếu chay|Hủ tiếu chay|soi|STO|n|chay|1|N|1|Nước lèo củ sắn, su su, nấm; đậu hũ, chả chay
mi-quang|Mì Quảng|Mì Quảng|soi|STO||hs|2|T|3|Sợi mì vàng, ít nước, tôm thịt, bánh tráng mè, đậu phộng
cao-lau|Cao lầu|Cao lầu|soi|TO||h|2|T|1|Sợi mì dai của Hội An, xá xíu, tóp mỡ, rau sống Trà Quế
banh-canh-cua|Bánh canh cua|Bánh canh cua|soi|STO|nm|s|2|N|2|Sợi bánh canh dai, nước dùng sánh, càng cua, chả cua, tôm
banh-canh-ca-loc|Bánh canh cá lóc|Bánh canh cá|soi|ST|nm|c|1|T|2|Sợi bột gạo, cá lóc đồng, nước dùng ngọt, rắc ớt bột
mi-vit-tiem|Mì vịt tiềm|Mì vịt tiềm|soi|TOK|nm|v|3|N|2|Đùi vịt tiềm thuốc bắc mềm rục, mì trứng, cải ngọt
mi-hoanh-thanh|Mì hoành thánh|Mì hoành thánh|soi|STOK|n|hs|2|N|2|Mì trứng sợi nhỏ, hoành thánh nhân tôm thịt, xá xíu
mien-ga|Miến gà|Miến gà|soi|STO|nm|g|2|B|2|Sợi miến dong, gà ta xé, lòng gà, nước dùng trong
mien-luon|Miến lươn|Miến lươn|soi|STO|nm|c|2|B|1|Lươn chiên giòn hoặc xào săn, miến dong, nước dùng ngọt
mi-xao|Mì xào hải sản|Mì xào|soi|TOK|d|s|2||2|Mì xào giòn hoặc mềm với tôm, mực, cải ngọt, cà rốt
mi-xao-chay|Mì xào chay|Mì xào chay|soi|TOK|d|chay|1||1|Mì xào nấm, đậu hũ, cải ngọt, cà rốt, thơm vị xì dầu
banh-da-cua|Bánh đa cua Hải Phòng|Bánh đa cua|soi|STO|n|sh|2|B|1|Bánh đa đỏ, riêu cua, chả lá lốt, rau muống chẻ
com-tam|Cơm tấm sườn bì chả|Cơm tấm|com|STOK||h|2|N|3|Sườn nướng, bì, chả trứng, mỡ hành, nước mắm pha ngọt
com-binh-dan|Cơm bình dân|Cơm bình dân|com|TO||*|1||3|Chọn món mặn, rau xào, canh trong tủ kính — nhanh, rẻ, đủ bữa
com-ga-xoi-mo|Cơm gà xối mỡ|Cơm gà xối mỡ|com|TO|d|g|2|N|2|Gà chiên giòn da, cơm chiên đỏ, đồ chua, nước mắm tỏi ớt
com-ga-hai-nam|Cơm gà Hải Nam|Cơm gà Hải Nam|com|TO||g|2|Q|2|Gà luộc mướt da, cơm nấu nước gà, chấm gừng ớt
com-ga-hoi-an|Cơm gà Hội An|Cơm gà Hội An|com|TO||g|2|T|1|Cơm nghệ nấu nước gà, gà xé trộn rau răm, hành tây
com-chien|Cơm chiên Dương Châu|Cơm chiên|com|TOK|d|hs|2||2|Cơm chiên tơi hạt với trứng, lạp xưởng, tôm, đậu Hà Lan
com-bo-luc-lac|Cơm bò lúc lắc|Bò lúc lắc|com|TO||b|3|N|2|Bò thái quân cờ lắc chảo lửa to, khoai tây chiên, xà lách
com-rang-dua-bo|Cơm rang dưa bò|Cơm rang dưa bò|com|TOK|d|b|2|B|2|Cơm rang săn hạt, bò xào dưa cải chua, thêm quả trứng
com-hen|Cơm hến|Cơm hến|com|ST|c|s|1|T|1|Cơm nguội trộn hến xào, tóp mỡ, đậu phộng, rau sống, chan nước hến
com-nieu|Cơm niêu cá kho|Cơm niêu|com|O|g|c|3|N|1|Cơm niêu đất cháy giòn, cá kho tộ, canh chua — hợp đi cả nhà
com-chay|Cơm chay|Cơm chay|com|TO||chay|1||2|Đậu hũ, nấm, rau củ, chả chay — nhẹ bụng mà vẫn no
banh-mi|Bánh mì thịt|Bánh mì|banh|STCK||h|1||3|Pa tê, chả lụa, thịt nguội, đồ chua, ngò, ớt, bơ trứng
banh-mi-chao|Bánh mì chảo|Bánh mì chảo|banh|ST|d|h|2|N|2|Chảo gang nóng: ốp la, pa tê, xíu mại, xé bánh mì chấm
banh-mi-xiu-mai|Bánh mì xíu mại|Bánh mì xíu mại|banh|S|m|h|1|T|2|Xíu mại sốt cà chua nóng hổi, xé bánh mì chấm — sáng Đà Lạt
banh-mi-chay|Bánh mì chay|Bánh mì chay|banh|S||chay|1||1|Pa tê chay, chả chay, đồ chua, tương — tiện cho ngày rằm
banh-cuon|Bánh cuốn|Bánh cuốn|banh|SO||h|1|B|3|Bánh tráng mỏng hấp, nhân thịt mộc nhĩ, chả quế, nước mắm pha
banh-xeo|Bánh xèo|Bánh xèo|banh|CO|dmg|hs|2|N|2|Vỏ vàng giòn, tôm thịt giá, cuốn cải bẹ xanh chấm nước mắm
banh-khot|Bánh khọt|Bánh khọt|banh|CO|dm|s|2|N|2|Bánh nhỏ giòn rụm nhân tôm, cuốn rau sống chấm nước mắm
banh-beo|Bánh bèo chén|Bánh bèo|banh|C||s|1|T|1|Bánh bèo hấp trong chén, tôm chấy, tóp mỡ, chan nước mắm ngọt
banh-bao|Bánh bao|Bánh bao|banh|SC|m|h|1||2|Vỏ bột xốp mềm, nhân thịt, trứng cút, lạp xưởng, ăn nóng
banh-gio|Bánh giò|Bánh giò|banh|SCK|m|h|1|B|2|Bột gạo nhân thịt mộc nhĩ gói lá chuối, bóc ra còn nóng hổi
xoi-man|Xôi mặn|Xôi mặn|chao|SK||h|1||3|Xôi dẻo, lạp xưởng, chả lụa, trứng cút, ruốc, hành phi
xoi-xeo|Xôi xéo|Xôi xéo|chao|S|||1|B|2|Xôi nghệ, đỗ xanh nghiền thái mỏng, hành phi giòn
chao-long|Cháo lòng|Cháo lòng|chao|SOK|nm|h|1||2|Cháo nấu nước luộc lòng, dồi, tim, gan, ăn kèm quẩy
chao-ga|Cháo gà|Cháo gà|chao|SOK|nm|g|1||2|Cháo gà xé, gừng, hành, rau răm — dễ ăn khi mệt
chao-suon|Cháo sườn sụn|Cháo sườn|chao|SC|nm|h|1|B|2|Cháo bột mịn, sườn sụn, ruốc bông, quẩy giòn
chao-ca|Cháo cá|Cháo cá|chao|SO|nm|c|1||1|Cháo cá lóc hoặc cá chép, gừng, thì là — nhẹ bụng
chao-vit|Cháo vịt, gỏi vịt|Cháo vịt|chao|OK|nmg|v|2|N|2|Cháo nóng, gỏi vịt bắp cải, chấm nước mắm gừng
lau-thai|Lẩu Thái|Lẩu Thái|lau|O|ncmg|s|3|Q|3|Nước lẩu chua cay vị sả, lá chanh; hải sản, nấm, rau
lau-bo|Lẩu bò|Lẩu bò|lau|O|nmg|b|3|N|2|Bò nhúng, gân, sách, bò viên; nước dùng ngọt xương bò
lau-ga-la-e|Lẩu gà lá é|Lẩu gà lá é|lau|O|nmg|g|3|T|2|Gà ta, lá é thơm the, măng chua, chấm muối ớt xanh
lau-mam|Lẩu mắm|Lẩu mắm|lau|O|nmg|chs|3|N|2|Nước lẩu mắm cá linh, cá sặc; cá, tôm, cà tím và cả rổ rau
lau-nam|Lẩu nấm chay|Lẩu nấm|lau|O|nmg|chay|3||1|Nước lẩu ngọt từ nấm và rau củ, chục loại nấm để nhúng
oc|Đi ăn ốc|Ốc|lau|COK|g|s|2|N|3|Ốc hương rang muối, sò điệp mỡ hành, nghêu hấp sả — ngồi lai rai
goi-cuon|Gỏi cuốn|Gỏi cuốn|vat|TC|t|hs|1|N|2|Bánh tráng cuốn tôm, thịt luộc, bún, rau sống, chấm tương đậu
goi-cuon-chay|Gỏi cuốn chay|Gỏi cuốn chay|vat|TC|t|chay|1||1|Bánh tráng cuốn đậu hũ chiên, bún, rau sống, chấm tương
bot-chien|Bột chiên|Bột chiên|vat|COK|d||1|N|2|Bột gạo chiên giòn với trứng, đu đủ ngâm, xì dầu chua ngọt
banh-trang-tron|Bánh tráng trộn|Bánh tráng trộn|vat|C|ct|bs|1|N|3|Bánh tráng trộn khô bò, khô mực, xoài xanh, rau răm, sa tế
banh-trang-nuong|Bánh tráng nướng|Bánh tráng nướng|vat|CK||h|1|T|2|Bánh tráng nướng than với trứng, hành, xúc xích, tương ớt
che|Chè|Chè|vat|COK|t|chay|1||3|Chè thái, chè khúc bạch, chè bưởi — mát lạnh, ngọt vừa
tao-pho|Tào phớ, tàu hũ nước đường|Tào phớ|vat|SC|t|chay|1||2|Đậu hũ non mịn, nước đường gừng, thêm trân châu
ca-vien-chien|Cá viên chiên|Cá viên chiên|vat|CK|d|c|1|N|2|Cá viên, bò viên, xúc xích chiên vàng, chấm tương ớt
nem-chua-ran|Nem chua rán|Nem chua rán|vat|CK|d|h|1|B|2|Nem chua tẩm bột chiên giòn, chấm tương ớt, ăn kèm dưa chuột
bo-bia|Bò bía|Bò bía|vat|C|t|hs|1|N|1|Bánh tráng cuốn lạp xưởng, trứng, củ sắn, tôm khô, chấm tương
hot-vit-lon|Hột vịt lộn|Hột vịt lộn|vat|COK||v|1||2|Trứng vịt lộn luộc, rau răm, gừng, chấm muối tiêu chanh
sup-cua|Súp cua|Súp cua|vat|CK|nm|s|1|N|2|Súp sánh nóng với thịt cua, trứng bắc thảo, nấm, ngò
tokbokki|Tokbokki|Tokbokki|vat|CK|c|c|1|Q|2|Bánh gạo Hàn sốt cay ngọt, chả cá, trứng luộc
mi-cay|Mì cay Hàn Quốc|Mì cay|ngoai|TOK|ncm|s|2|Q|3|Mì dai, nước lẩu cay chọn cấp độ, hải sản, xúc xích
com-tron-han|Cơm trộn Hàn Quốc|Cơm trộn Hàn|ngoai|TO||b|2|Q|2|Cơm, rau trộn, bò xào, trứng lòng đào, tương ớt Hàn
kimbap|Kimbap|Kimbap|ngoai|TC||h|1|Q|2|Cơm cuộn rong biển, trứng, xúc xích, rau củ — ăn nhanh, mang đi
nuong-han|Thịt nướng Hàn Quốc|Nướng Hàn|ngoai|O|dg|h|3|Q|2|Ba chỉ, nạc vai nướng tại bàn, cuốn xà lách, kim chi
sushi|Sushi|Sushi|ngoai|TO|t|cs|3|Q|2|Cơm giấm cuộn cá hồi, cá ngừ, trứng cá — mát, nhẹ
ramen|Mì ramen|Ramen|ngoai|TOK|nm|h|3|Q|2|Nước dùng xương hầm đậm, thịt xá xíu, trứng lòng đào, rong biển
ca-ri-nhat|Cơm cà ri Nhật|Cà ri Nhật|ngoai|TO|m|h|2|Q|1|Cà ri sệt ngọt dịu, heo chiên xù, cơm Nhật dẻo
ga-ran|Gà rán|Gà rán|ngoai|TOC|d|g|2|Q|3|Gà tẩm bột chiên giòn, khoai tây chiên, nước ngọt
pizza|Pizza|Pizza|ngoai|TO|dg|h|3|Q|2|Đế nướng, phô mai kéo sợi, xúc xích, nấm — gọi về ăn chung
burger|Hamburger|Burger|ngoai|TO|d|b|2|Q|2|Bò xay nướng, phô mai, rau, sốt — nhanh mà no lâu
mi-y|Mì Ý sốt bò bằm|Mì Ý|ngoai|TO||b|2|Q|2|Mì spaghetti, sốt cà chua bò bằm, phô mai bào
salad|Salad ức gà|Salad|ngoai|TO|t|g|2|Q|1|Rau xanh, ức gà áp chảo, sốt dầu giấm — nhẹ bụng, ít béo
dimsum|Dimsum|Dimsum|ngoai|ST|g|hs|3|Q|1|Há cảo, xíu mại, bánh bao kim sa — gọi nhiều xửng nhỏ ăn chung
bun-thai|Bún Thái hải sản|Bún Thái|ngoai|TO|ncm|s|2|Q|2|Nước dùng chua cay kiểu tom yum, tôm, mực, nghêu, nấm
`;

/* ---------- nấu ở nhà: mâm cơm ba món ----------
     mã | tên | loại | đạm | phút | cách nấu | nguyên liệu chính (canh, rau) | cần mua
   loại   man món mặn · canh · rau rau xào, luộc
   đạm    như trên; chay là món chay; trống là không thịt cá (trứng)
   phút   nấu chừng bao lâu, kể cả sơ chế — để lọc "nấu nhanh" (mỗi món không quá 30 phút)
   cách   kho, xao, chien, luoc, hap, sot, nuong; canh: chua, thanh, dang (khổ qua)
   chính  thứ rau, củ chính, nối bằng +: canh và rau không trùng thứ rau (canh rau ngót thì rau xào đừng là rau ngót)
   cần mua  không ghi gia vị nhà nào cũng có: nước mắm, muối, đường, dầu ăn, tiêu */
const NHA_THO = `
thit-kho-trung|Thịt kho trứng|man|h|70|kho||thịt ba chỉ, trứng vịt, nước dừa tươi, hành tím
ca-kho-to|Cá kho tộ|man|c|45|kho||cá basa hoặc cá lóc, hành tím, ớt
suon-xao-chua-ngot|Sườn xào chua ngọt|man|h|40|xao||sườn non, cà chua, hành tây, tỏi
ga-rang-gung|Gà rang gừng|man|g|35|xao||thịt gà, gừng, hành tím
ga-xao-sa-ot|Gà xào sả ớt|man|g|30|xao||thịt gà, sả, ớt, hành tím
thit-luoc|Thịt luộc|man|h|30|luoc||thịt ba chỉ hoặc nạc vai, dưa cải chua
ga-luoc|Gà luộc lá chanh|man|g|45|luoc||gà ta, lá chanh, gừng
bo-xao-hanh-tay|Bò xào hành tây|man|b|20|xao||thịt bò thăn, hành tây, cần tây, tỏi
thit-rang-chay-canh|Thịt rang cháy cạnh|man|h|30|xao||thịt ba chỉ, hành tím, hành lá
thit-kho-tieu|Thịt kho tiêu|man|h|40|kho||thịt nạc dăm, hành tím
suon-ram|Sườn ram mặn|man|h|40|kho||sườn non, tỏi, hành tím
trung-hap-thit|Trứng hấp thịt băm|man|h|30|hap||thịt nạc băm, trứng gà, mộc nhĩ, miến
dau-nhoi-thit|Đậu phụ nhồi thịt sốt cà|man|h|40|sot||đậu phụ, thịt nạc băm, cà chua, hành lá
nem-ran|Nem rán|man|hs|60|chien||thịt nạc băm, bánh đa nem, miến, mộc nhĩ, cà rốt, trứng gà
canh-ga-chien-mam|Cánh gà chiên nước mắm|man|g|30|chien||cánh gà, tỏi, ớt
ca-chien|Cá rô phi chiên giòn|man|c|25|chien||cá rô phi, gừng, tỏi, ớt
ca-thu-sot-ca|Cá thu sốt cà chua|man|c|30|sot||cá thu cắt khúc, cà chua, hành lá
tom-rim|Tôm rim mặn ngọt|man|s|25|kho||tôm thẻ, tỏi, hành tím
muc-xao|Mực xào cần tây|man|s|20|xao||mực ống, cần tây, hành tây, cà chua
trung-chien|Trứng chiên|man||10|chien||trứng gà, hành lá
dau-phu-sot-ca|Đậu phụ sốt cà chua|man|chay|20|sot||đậu phụ, cà chua, hành lá
dau-phu-ran|Đậu phụ rán|man|chay|15|chien||đậu phụ
dau-hu-chien-sa|Đậu hũ chiên sả ớt|man|chay|20|chien||đậu hũ, sả, ớt
nam-kho-tieu|Nấm kho tiêu|man|chay|25|kho||nấm đùi gà hoặc nấm rơm, xì dầu
canh-chua-ca|Canh chua cá lóc|canh|c|35|chua|dau-bap+gia|cá lóc, me chua, thơm, cà chua, đậu bắp, giá, bạc hà, ngò om
canh-bi-dao-tom|Canh bí đao nấu tôm|canh|s|20|thanh|bi-dao|bí đao, tôm tươi, hành lá
canh-rau-ngot|Canh rau ngót thịt băm|canh|h|15|thanh|rau-ngot|rau ngót, thịt nạc băm
canh-mong-toi|Canh mồng tơi nấu tôm|canh|s|15|thanh|mong-toi|mồng tơi, mướp, tôm tươi
canh-cua-rau-day|Canh cua rau đay|canh|s|40|thanh|rau-day|cua đồng xay, rau đay, mồng tơi, mướp
canh-kho-qua|Canh khổ qua nhồi thịt|canh|h|45|dang|kho-qua|khổ qua, thịt nạc băm, nấm mèo, hành lá
canh-bi-do|Canh bí đỏ thịt băm|canh|h|25|thanh|bi-do|bí đỏ, thịt nạc băm, hành lá
canh-ca-chua-trung|Canh cà chua trứng|canh||10|thanh|ca-chua|cà chua, trứng gà, hành lá
canh-suon-cu-qua|Canh sườn hầm củ quả|canh|h|60|thanh|cu-qua|sườn non, cà rốt, khoai tây, su hào
canh-ngao-chua|Canh ngao nấu chua|canh|s|20|chua|ngao|ngao, cà chua, me hoặc sấu, thì là
canh-chua-chay|Canh chua chay|canh|chay|20|chua|dau-bap+gia|đậu hũ, thơm, cà chua, đậu bắp, giá, bạc hà
canh-nam-dau-hu|Canh nấm đậu hũ non|canh|chay|15|thanh|cai|nấm kim châm, đậu hũ non, cải ngọt
canh-rau-cu-chay|Canh rau củ chay|canh|chay|25|thanh|cu-qua+bong-cai+su-su|cà rốt, su su, bắp ngọt, bông cải
rau-muong-xao-toi|Rau muống xào tỏi|rau|chay|10|xao|rau-muong|rau muống, tỏi
rau-muong-luoc|Rau muống luộc|rau|chay|10|luoc|rau-muong|rau muống, chanh
cai-thia-xao-nam|Cải thìa xào nấm|rau|chay|10|xao|cai|cải thìa, nấm đông cô, tỏi
cai-ngong-xao|Cải ngồng xào tỏi|rau|chay|10|xao|cai|cải ngồng, tỏi
bong-cai-xao|Bông cải xào tỏi|rau|chay|10|xao|bong-cai|bông cải xanh, cà rốt, tỏi
dau-que-xao|Đậu que xào tỏi|rau|chay|10|xao|dau-que|đậu que, tỏi
bap-cai-luoc|Bắp cải luộc|rau|chay|10|luoc|bap-cai|bắp cải
rau-lang-xao|Rau lang xào tỏi|rau|chay|10|xao|rau-lang|rau lang, tỏi
su-su-xao|Su su xào tỏi|rau|chay|10|xao|su-su|su su, cà rốt, tỏi
dau-bap-luoc|Đậu bắp luộc|rau|chay|10|luoc|dau-bap|đậu bắp
rau-cu-luoc|Rau củ luộc|rau|chay|15|luoc|cu-qua+bong-cai+su-su+dau-que|bông cải, cà rốt, su su, đậu que
ca-tim-nuong|Cà tím nướng mỡ hành|rau|chay|25|nuong|ca-tim|cà tím, hành lá, đậu phộng rang
`;

/* Cặp kinh điển: gặp nhau thì app nói ra, và quay mâm thì cặp này dễ ra hơn. */
const CAP = [
  ['ca-kho-to', 'canh-chua-ca', 'Cá kho tộ với canh chua: cặp kinh điển của mâm cơm miền Nam, kho mặn mòi, canh chua thanh.'],
  ['thit-kho-trung', 'canh-kho-qua', 'Thịt kho trứng với canh khổ qua: mâm cơm ngày Tết miền Nam, ăn khổ qua cho cái khổ qua đi.'],
  ['dau-phu-ran', 'canh-cua-rau-day', 'Canh cua rau đay với đậu phụ rán: bữa cơm mùa hè miền Bắc, thêm đĩa cà pháo là đủ bộ.'],
];

const BUA = ['S', 'T', 'C', 'O', 'K'];
const TEN_BUA = { S: 'sáng', T: 'trưa', C: 'chiều', O: 'tối', K: 'khuya' };
const NHAN_BUA = { S: 'Bữa sáng', T: 'Bữa trưa', C: 'Xế chiều', O: 'Bữa tối', K: 'Ăn khuya' };
const NHOM = { bun: 'Bún', soi: 'Phở, mì, hủ tiếu', com: 'Cơm', banh: 'Bánh', chao: 'Cháo, xôi', lau: 'Lẩu, ốc', vat: 'Ăn vặt', ngoai: 'Món nước ngoài' };
const DAM = { b: 'Bò', h: 'Heo', g: 'Gà', v: 'Vịt', c: 'Cá', s: 'Hải sản' };
const VUNG = { B: 'Món Bắc', T: 'Món Trung', N: 'Món Nam', Q: 'Món nước ngoài' };
const GIA = { 1: 'Dưới 40k', 2: 'Khoảng 40–80k', 3: 'Trên 80k' };
const LOAI_NHA = { man: 'Món mặn', canh: 'Món canh', rau: 'Món rau' };

function docNgoai(tho) {
  return tho.trim().split('\n').map(d => {
    const [id, ten, ngan, nhom, bua, dau, dam, gia, vung, pho, mota] = d.split('|').map(s => s.trim());
    return { id, ten, ngan: ngan || ten, nhom, bua, dau, dam: dam === 'chay' ? '' : dam, chay: dam === 'chay',
             gia: +gia, vung, pho: +pho, mota };
  });
}
function docNha(tho) {
  return tho.trim().split('\n').map(d => {
    const [id, ten, loai, dam, phut, vi, chinh, can] = d.split('|').map(s => s.trim());
    return { id, ten, loai, dam: dam === 'chay' ? '' : dam, chay: dam === 'chay', phut: +phut, vi,
             chinh: chinh ? chinh.split('+') : [], can: can.split(',').map(s => s.trim()).filter(Boolean) };
  });
}
const NGOAI = docNgoai(NGOAI_THO);
const NHA = docNha(NHA_THO);

/* ---------- hoàn cảnh: bữa nào, ngày gì, trời ra sao, ở miền nào ---------- */

/* Bữa theo giờ máy. Ranh giới theo nếp ăn ở Việt Nam: sáng tới 10 giờ, trưa tới 14 giờ, xế chiều tới 17 giờ,
   tối tới 21 giờ, sau đó là ăn khuya tới 4 giờ sáng. */
function buaLuc(d) {
  const p = d.getHours() * 60 + d.getMinutes();
  if (p >= 240 && p < 600) return 'S';
  if (p >= 600 && p < 840) return 'T';
  if (p >= 840 && p < 1020) return 'C';
  if (p >= 1020 && p < 1260) return 'O';
  return 'K';
}
/* Ở nhà thì câu hỏi là bữa chính kế tiếp: sáng, trưa tính chuyện nấu bữa trưa; chiều, tối tính bữa tối; khuya rồi thì
   tính cho mai (còn kịp đi chợ sáng). */
const LUC_NAU = { S: 'Trưa nay', T: 'Trưa nay', C: 'Tối nay', O: 'Tối nay', K: 'Mai' };
function cauHoi(bua, tab) {
  if (tab === 'nha') return `${LUC_NAU[bua] || 'Hôm nay'} nấu gì?`;
  if (bua === 'K') return 'Khuya rồi, ăn gì?';
  return `${{ S: 'Sáng', T: 'Trưa', C: 'Chiều', O: 'Tối' }[bua] || 'Hôm'} nay ăn gì?`;
}

/* Mùng 1, ngày rằm âm lịch: nhiều nhà ăn chay. Âm lịch lấy từ assets/lich.js (của Xem ngày), không tính lại. */
function ngayChay(dd, mm, yy, lich) {
  if (!lich || !lich.convertSolar2Lunar) return null;
  const [ad, am, , nhuan] = lich.convertSolar2Lunar(dd, mm, yy, 7);
  if (ad !== 1 && ad !== 15) return null;
  const tenThang = (lich.TEN_THANG && lich.TEN_THANG[am]) || String(am);
  return { ngay: ad, thang: am, nhuan: !!nhuan, ten: `${ad === 1 ? 'Mùng 1' : 'Rằm'} tháng ${tenThang}${nhuan ? ' nhuận' : ''}` };
}

/* Trời lúc này, đọc từ Open-Meteo (tham số current). Mưa: có lượng mưa, hay mã thời tiết WMO là mưa phùn, mưa, mưa
   rào, dông. Nóng: cảm giác từ 34 độ, hay nhiệt độ từ 33. Lạnh: từ 20 độ trở xuống (mùa đông miền Bắc). Dữ liệu lạ thì
   trả null — không đoán. */
function docThoiTiet(j) {
  const c = j && j.current;
  if (!c || typeof c.temperature_2m !== 'number' || !isFinite(c.temperature_2m)) return null;
  const t = c.temperature_2m, cam = typeof c.apparent_temperature === 'number' ? c.apparent_temperature : t;
  const ma = Number(c.weather_code) || 0, mm = Number(c.precipitation) || 0;
  const mua = mm >= 0.1 || (ma >= 51 && ma <= 67) || (ma >= 80 && ma <= 82) || ma >= 95;
  const loai = mua ? 'mua' : (cam >= 34 || t >= 33) ? 'nong' : t <= 20 ? 'lanh' : '';
  return { loai, nhiet: Math.round(t) };
}

/* Miền theo toạ độ, chỉ trong lãnh thổ Việt Nam (ngoài đó thì không đoán). Bắc: từ Thanh Hoá trở ra; Trung: tới
   Bình Thuận và Tây Nguyên; Nam: từ Đồng Nai, TP.HCM trở vào. */
function mienTheoViTri(vi, kinh) {
  if (typeof vi !== 'number' || typeof kinh !== 'number' || vi < 8 || vi > 23.5 || kinh < 102 || kinh > 110) return '';
  return vi >= 19.5 ? 'B' : vi >= 11.4 ? 'T' : 'N';
}

/* Ngày dạng YYYY-MM-DD → số ngày (để trừ nhau, không vướng giờ mùa hè hay múi giờ). */
const soNgay = (s) => { const [y, m, d] = String(s).split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
function ngayCua(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
/* Món đã chốt trong soNgayNe ngày gần nhất (kể cả hôm nay): không đưa lên vòng nữa. */
function monGanDay(chot, homNay, soNgayNe = 2) {
  const n = soNgay(homNay), ra = new Map();
  for (const c of chot || []) {
    const cach = n - soNgay(c.ngay);
    if (cach >= 0 && cach <= soNgayNe) ra.set(c.id, cach);
  }
  return ra;                          // mã món → cách hôm nay mấy ngày
}
/* Danh sách chốt giữ gọn: bỏ món quá 7 ngày, mỗi món một lần (lần mới nhất), nhiều nhất 12 món. */
function gonChot(chot, homNay) {
  const n = soNgay(homNay), thay = new Set();
  return (chot || []).filter(c => c && c.id && /^\d{4}-\d{2}-\d{2}$/.test(c.ngay))
    .sort((a, b) => soNgay(b.ngay) - soNgay(a.ngay))
    .filter(c => { const cach = n - soNgay(c.ngay); if (cach < 0 || cach > 7 || thay.has(c.id)) return false; thay.add(c.id); return true; })
    .slice(0, 12);
}

/* ---------- chọn tám món cho vòng quay ---------- */

/* dk: { bua, chay, tui (1–3), khong: ['b','h','g','v','c','s','cay','mo'], troi: 'mua'|'nong'|'lanh'|'', mien, nhom,
         bo: Set mã món không đưa lên (đã có trên vòng, đã bỏ), ganDay: Set mã món mới chốt mấy hôm nay } */
/* "Bản chay" của một món mặn (bún chay, canh chua chay…): tên đã nói là chay. Khác món vốn không thịt (chè, đậu phụ
   rán, rau xào) — món đó ai cũng ăn. */
const banChay = (m) => !!m.chay && /(^|\s)chay(\s|$)/i.test(m.ten);

function hopNgoai(m, dk) {
  if (!m.bua.includes(dk.bua)) return false;
  if (dk.chay && !m.chay) return false;
  if (m.gia > (dk.tui || 3)) return false;
  for (const k of dk.khong || []) {
    if (k === 'cay') { if (m.dau.includes('c')) return false; }
    else if (k === 'mo') { if (m.dau.includes('d')) return false; }
    else if (k.length === 1 && m.dam.includes(k)) return false;
  }
  if (dk.ganDay && dk.ganDay.has(m.id)) return false;
  return !(dk.bo && dk.bo.has(m.id));
}

/* Món phổ biến lên vòng nhiều hơn; trời mưa thì món nóng hổi, trời nóng thì món mát; món khác miền ít hơn (vẫn có:
   thành phố nào cũng có quán món miền khác); lẩu, ốc là chuyện ngồi lâu — trưa đi làm ít khi, đi nhóm buổi tối thì hợp. */
function trongSo(m, dk) {
  let w = [0, 0.5, 1, 1.6][m.pho] || 1;
  const co = (k) => m.dau.includes(k);
  if (dk.troi === 'mua') w *= co('m') ? 1.7 : co('t') ? 0.6 : 1;
  else if (dk.troi === 'nong') w *= (co('t') ? 1.6 : co('m') ? 0.7 : 1) * (co('d') ? 0.85 : 1);
  else if (dk.troi === 'lanh') w *= co('m') ? 1.8 : co('t') ? 0.5 : 1;
  if (dk.mien && m.vung && 'BTN'.includes(m.vung) && m.vung !== dk.mien) w *= 0.55;
  if (co('g')) w *= dk.nhom ? 1.6 : dk.bua === 'T' ? 0.35 : 0.8;
  if (!dk.chay && banChay(m)) w *= 0.35;           // không ăn chay thì thỉnh thoảng mới gặp bản chay, cho đổi vị
  return w;
}

function chonTheoTrongSo(w, rnd) {
  const tong = w.reduce((a, b) => a + b, 0);
  let r = rnd() * tong;
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; }
  return w.length - 1;
}

/* Rút n món không lặp, theo trọng số. Cho đa dạng: món cùng nhóm với món vừa rút bị giảm trọng số còn 35%, cùng loại
   thịt còn 80%, mỗi nhóm nhiều nhất 3 món — trừ khi không còn món nào khác để rút. */
function rutMon(ung, dk, n, rnd) {
  let con = ung.map(m => ({ m, w: trongSo(m, dk) })), du = [];
  const ra = [], dem = {};
  while (ra.length < n && (con.length || du.length)) {
    if (!con.length) { con = du; du = []; }
    const i = chonTheoTrongSo(con.map(x => x.w), rnd);
    const { m } = con.splice(i, 1)[0];
    ra.push(m);
    dem[m.nhom] = (dem[m.nhom] || 0) + 1;
    for (const x of con) {
      if (x.m.nhom === m.nhom) x.w *= 0.35;
      if (m.dam && [...m.dam].some(k => k !== '*' && x.m.dam.includes(k))) x.w *= 0.8;
    }
    du = du.concat(con.filter(x => dem[x.m.nhom] >= 3));
    con = con.filter(x => !(dem[x.m.nhom] >= 3));
  }
  return ra;
}

/* Tám món cho vòng quay. Lọc quá chặt (còn dưới 2 món) thì nới dần, theo thứ tự ít quan trọng trước: món mới ăn,
   túi tiền, dầu mỡ, cay — và báo lại đã nới gì. Không bao giờ nới bữa hay chay. */
function vongNgoai(ds, dk, n = 8, rnd = Math.random) {
  const noi = [];
  let d = { ...dk };
  let ung = ds.filter(m => hopNgoai(m, d));
  const thu = [
    ['ne', 'không né món đã ăn mấy hôm nay', () => { d = { ...d, ganDay: null }; }],
    ['tui', 'bỏ giới hạn túi tiền', () => { d = { ...d, tui: 3 }; }],
    ['mo', 'có cả món dầu mỡ', () => { d = { ...d, khong: (d.khong || []).filter(k => k !== 'mo') }; }],
    ['cay', 'có cả món cay', () => { d = { ...d, khong: (d.khong || []).filter(k => k !== 'cay') }; }],
  ];
  for (const [ma, loi, lam] of thu) {
    if (ung.length >= Math.min(2, n)) break;
    lam();
    const moi = ds.filter(m => hopNgoai(m, d));
    if (moi.length > ung.length) { ung = moi; noi.push({ ma, loi }); }
  }
  return { mon: rutMon(ung, d, n, rnd), noi, du: ung.length };
}

/* Một món thay cho miếng đang chọn: món hợp điều kiện mà chưa có trên vòng. */
function monThay(ds, dk, dangCo, rnd = Math.random) {
  const bo = new Set([...(dk.bo || []), ...dangCo]);
  const r = rutMon(ds.filter(m => hopNgoai(m, { ...dk, bo })), dk, 1, rnd);
  return r[0] || null;
}

/* ---------- vòng quay ----------
   Góc tính bằng radian, chiều kim đồng hồ, 0 là hướng 12 giờ. Kim đứng yên ở đỉnh; bánh xe quay một góc θ thì chỗ
   bánh xe nằm dưới kim là (−θ) mod 2π.
   Ma sát: dω/dt = −a − b·ω (a: ma sát khô của trục và lá gảy, b: cản theo vận tốc). Có lời giải đóng:
     ω(t) = (ω0 + a/b)·e^(−bt) − a/b,   dừng lúc T = ln(1 + bω0/a)/b,
     góc đi được tới lúc dừng S(ω0) = ω0/b − (a/b²)·ln(1 + bω0/a).
   Nhờ có lời giải đóng mà mỗi khung hình tính thẳng góc theo thời gian, không cộng dồn sai số, và giải ngược được
   ω0 cho một góc dừng muốn có. a = 1,2, b = 0,55: quay 3–5 vòng mất chừng 4–5 giây, cuối cùng bò chậm qua vài miếng
   cho hồi hộp. Người chọn "giảm chuyển động" thì ma sát lớn hơn, dừng sau chừng một giây. */
const VONG = 2 * Math.PI;
const MA_SAT = { a: 1.2, b: 0.55 };
const MA_SAT_NHANH = { a: 6, b: 2.2 };

function cacMieng(w) {
  const tong = w.reduce((s, x) => s + x, 0);
  let a = 0;
  return w.map((x, i) => {
    const dau = a;
    a = i === w.length - 1 ? VONG : a + x / tong * VONG;
    return { dau, cuoi: a };
  });
}
const quyGoc = (g) => ((g % VONG) + VONG) % VONG;
function miengDuoiKim(mieng, goc) {
  const p = quyGoc(-goc);
  for (let i = 0; i < mieng.length; i++) if (p < mieng[i].cuoi) return i;
  return mieng.length - 1;
}
const thoiGianQuay = (w0, ms = MA_SAT) => Math.log(1 + ms.b * w0 / ms.a) / ms.b;
const quangDuong = (w0, ms = MA_SAT) => w0 / ms.b - ms.a / (ms.b * ms.b) * Math.log(1 + ms.b * w0 / ms.a);
function gocSau(w0, t, ms = MA_SAT) {
  const T = thoiGianQuay(w0, ms);
  if (t >= T) return quangDuong(w0, ms);
  if (t <= 0) return 0;
  const k = w0 + ms.a / ms.b;
  return k * (1 - Math.exp(-ms.b * t)) / ms.b - ms.a / ms.b * t;
}
const vanTocSau = (w0, t, ms = MA_SAT) => Math.max(0, (w0 + ms.a / ms.b) * Math.exp(-ms.b * t) - ms.a / ms.b);
/* S(ω0) tăng ngặt nên chia đôi là chắc ăn. */
function w0ChoQuangDuong(S, ms = MA_SAT) {
  let lo = 0, hi = 1;
  while (quangDuong(hi, ms) < S) hi *= 2;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (quangDuong(mid, ms) < S) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/* Cú quay bằng nút: rút món theo trọng số (diện tích miếng), chọn chỗ kim dừng trong miếng — chừa 15% mỗi mép cho
   khỏi lấp lửng — rồi giải ngược ω0 để quay thêm soVong vòng trọn cộng phần lẻ tới đúng chỗ đó. */
function cuQuay(w, gocNay, rnd = Math.random, ms = MA_SAT, soVong = [3, 5]) {
  const mieng = cacMieng(w);
  const chiSo = chonTheoTrongSo(w, rnd);
  const { dau, cuoi } = mieng[chiSo];
  const p = dau + (cuoi - dau) * (0.15 + 0.7 * rnd());
  const le = quyGoc(-p - gocNay);
  const vong = soVong[0] + Math.floor(rnd() * (soVong[1] - soVong[0] + 1));
  const S = le + vong * VONG;
  const w0 = w0ChoQuangDuong(S, ms);
  return { chiSo, w0, huong: 1, quangDuong: S, thoiGian: thoiGianQuay(w0, ms), gocCuoi: gocNay + S, ms };
}
/* Cú vuốt tay: vật lý thật theo vận tốc ngón tay (kẹp trong 12–28 rad/s cho vuốt nào cũng ra một vòng quay đàng
   hoàng), cộng ±12% như ma sát mỗi lần mỗi khác — vuốt khéo mấy cũng không nhắm được món. */
function cuVuot(wTay, gocNay, w, rnd = Math.random, ms = MA_SAT) {
  const huong = wTay < 0 ? -1 : 1;
  const w0 = Math.min(28, Math.max(12, Math.abs(wTay))) * (0.88 + 0.24 * rnd());
  const S = quangDuong(w0, ms), gocCuoi = gocNay + huong * S;
  return { chiSo: miengDuoiKim(cacMieng(w), gocCuoi), w0, huong, quangDuong: S, thoiGian: thoiGianQuay(w0, ms), gocCuoi, ms };
}

/* ---------- cả nhóm: mỗi người tim món thèm, gạch món không muốn ----------
   phieu: [{ tim: [chỉ số], khong: [chỉ số] }, …]. Món bị ai gạch thì loại (ai cũng có quyền nói "không"); gạch hết
   thì giữ những món bị gạch ít nhất. Món còn lại lên vòng với miếng to theo số tim: 1 + số tim. */
function gopPhieu(soMon, phieu) {
  const tim = Array(soMon).fill(0), khong = Array(soMon).fill(0);
  for (const p of phieu || []) {
    for (const i of new Set(p.tim || [])) if (i >= 0 && i < soMon) tim[i]++;
    for (const i of new Set(p.khong || [])) if (i >= 0 && i < soMon) khong[i]++;
  }
  let con = [...Array(soMon).keys()].filter(i => !khong[i]), hetSach = false;
  if (!con.length && soMon) {
    const it = Math.min(...khong);
    con = [...Array(soMon).keys()].filter(i => khong[i] === it);
    hetSach = true;
  }
  return { tim, khong, con, trongSo: con.map(i => 1 + tim[i]), hetSach };
}

/* ---------- nấu ở nhà ---------- */

function hopNha(m, dk) {
  if (dk.chay && !m.chay) return false;
  if (!dk.chay && banChay(m)) return false;        // mâm thường thì nấu canh chua cá, không nấu canh chua chay
  if (dk.nhanh && m.phut > 30) return false;
  for (const k of dk.khong || []) if (k.length === 1 && m.dam.includes(k)) return false;
  return true;
}
const capCua = (man, canh) => (man && canh ? CAP.find(c => c[0] === man.id && c[1] === canh.id) : null);
const trungRau = (a, b) => !!(a && b && a.chinh.some(k => b.chinh.includes(k)));
const trungDam = (a, b) => !!(a && b && a.dam && [...a.dam].some(k => b.dam.includes(k)));

/* Canh hợp món mặn: cặp kinh điển dễ ra hơn; món kho đi với canh chua cho cân vị; mặn và canh cùng một thứ thịt cá
   thì ít khi (trừ cặp kinh điển). */
function trongSoCanh(man, canh) {
  if (capCua(man, canh)) return 2.2;
  let w = 1;
  if (man && man.vi === 'kho' && canh.vi === 'chua') w *= 1.5;
  if (trungDam(man, canh)) w *= 0.3;
  return w;
}

/* khoa: { man, canh, rau } — món đang khoá thì giữ. cu: mâm đang có — món không khoá thì đổi sang món khác nếu còn. */
function chonMam(ds, dk = {}, khoa = {}, cu = {}, rnd = Math.random) {
  const lay = (loai) => {
    const hop = ds.filter(m => m.loai === loai && hopNha(m, dk));
    const khac = hop.filter(m => !cu[loai] || m.id !== cu[loai].id);
    return khac.length ? khac : hop.length ? hop : ds.filter(m => m.loai === loai);
  };
  const rut = (ds2, w) => ds2[chonTheoTrongSo(ds2.map(w), rnd)];
  const man = khoa.man || rut(lay('man'), () => 1);
  const canh = khoa.canh || rut(lay('canh'), c => trongSoCanh(man, c));
  let rauDs = lay('rau');
  const khongTrung = rauDs.filter(r => !trungRau(r, canh));
  if (khongTrung.length) rauDs = khongTrung;
  const rau = khoa.rau || rut(rauDs, () => 1);
  return { man, canh, rau };
}

/* Một câu về cặp món, nếu có gì đáng nói. */
function loiCap(mam) {
  const c = capCua(mam.man, mam.canh);
  if (c) return c[2];
  if (mam.man && mam.canh && mam.man.vi === 'kho' && mam.canh.vi === 'chua') return 'Món kho mặn đi với canh chua cho cân vị.';
  return '';
}

/* Danh sách đi chợ: gộp thứ cần mua của ba món, bỏ trùng, giữ thứ tự mặn → canh → rau. */
function diCho(mam) {
  const thay = new Set(), ra = [];
  for (const m of [mam.man, mam.canh, mam.rau]) {
    for (const c of (m && m.can) || []) {
      const k = c.toLowerCase();
      if (!thay.has(k)) { thay.add(k); ra.push(c); }
    }
  }
  return ra;
}

/* Link tìm quán trên Google Maps: ứng dụng Maps tự tìm quanh chỗ người dùng đang đứng. */
const linkTimQuan = (ten) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(String(ten).trim());

/* Mấy dòng nhãn cho món vừa quay ra: món nước, cay, giá, miền, và lý do hợp với lúc này. */
function nhanMon(m, dk = {}) {
  if (!m || m.rieng) return [];
  const ra = [];
  if (m.dau.includes('n')) ra.push('Món nước');
  if (m.dau.includes('c')) ra.push('Cay');
  if (m.chay) ra.push('Món chay');
  ra.push(GIA[m.gia]);
  if (VUNG[m.vung]) ra.push(VUNG[m.vung]);
  if ((dk.troi === 'mua' || dk.troi === 'lanh') && m.dau.includes('m')) ra.push(dk.troi === 'mua' ? 'Hợp trời mưa' : 'Ấm bụng ngày lạnh');
  if (dk.troi === 'nong' && m.dau.includes('t')) ra.push('Mát, hợp trời nóng');
  return ra;
}

/* Món của người dùng (quán quen, món nhà làm…): chữ do người dùng gõ, làm thành một món. */
function monRieng(ten) {
  const t = String(ten || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  return t ? { id: 'r:' + t.toLowerCase(), ten: t, ngan: t, rieng: true, nhom: 'rieng', dam: '', dau: '', bua: BUA.join(''), gia: 0, vung: '', pho: 2, mota: '' } : null;
}

const API = {
  NGOAI, NHA, CAP, BUA, TEN_BUA, NHAN_BUA, LUC_NAU, NHOM, DAM, VUNG, GIA, LOAI_NHA, MA_SAT, MA_SAT_NHANH, VONG,
  docNgoai, docNha, buaLuc, cauHoi, ngayChay, docThoiTiet, mienTheoViTri, ngayCua, soNgay, monGanDay, gonChot,
  banChay, hopNgoai, trongSo, chonTheoTrongSo, rutMon, vongNgoai, monThay,
  cacMieng, quyGoc, miengDuoiKim, thoiGianQuay, quangDuong, gocSau, vanTocSau, w0ChoQuangDuong, cuQuay, cuVuot,
  gopPhieu, hopNha, capCua, trungRau, trungDam, trongSoCanh, chonMam, loiCap, diCho, linkTimQuan, nhanMon, monRieng,
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else self.TDTD_MONAN = API;
})();
