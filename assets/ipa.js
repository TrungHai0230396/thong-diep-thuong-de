/* Luyện phát âm: mỗi âm một hình khẩu hình, vài từ ví dụ, và phần tập bằng CẶP TỐI THIỂU.

   Chuyện quan trọng nhất phải nói trước: trò này KHÔNG chấm điểm phát âm, và cố ý không làm vậy.
   Máy nhận giọng nói chỉ trả về CHỮ, không trả về âm, nên mọi "điểm phát âm" dựng trên nó đều là
   điểm giả. Thử cho Gemini nghe audio cũng vậy: câu cố tình nuốt hết phụ âm cuối vẫn bị nó chép
   lại thành câu đúng.

   Thứ đo được thật là: khi bạn nói một từ trong cặp tối thiểu (ship/sheep), máy nghe ra từ nào.
   Nếu máy nghe đúng thì ít ra hai âm của bạn đã KHÁC NHAU đủ để máy phân biệt. App ghi đúng
   chừng đó, không hứa hơn. */
(() => {
'use strict';

/* uuTien: 10 là sai thì người nghe không hiểu, 5 là sai thì nghe hơi lạ.
   Tham số khẩu hình theo mô tả cấu âm, xem assets/khauhinh.js. */
/* Thứ tự ở đây theo bằng chứng, không theo cảm giác:

   - Lỗi PHỤ ÂM tương quan mạnh với việc người nghe có hiểu hay không (r = -0,56 đến -0,79);
     lỗi NGUYÊN ÂM thì không có tương quan có ý nghĩa (Na, ICPhS 2023). Nên phụ âm đứng trước.
   - Lỗi nặng nhất của người Việt là lỗi HỆ THỐNG ở cuối âm tiết: xảy ra ở mọi từ chứ không vài từ,
     và nó chở luôn ngữ pháp (số nhiều, thì quá khứ). /l/ cuối tệ nhất: đúng 25%, bỏ hẳn 50%.
   - /θ/ và /ð/ (hai âm "th") bị xếp THẤP, dù người học sợ chúng nhất. Chúng hiếm khi làm hỏng nghĩa;
     Lingua Franca Core miễn trừ hẳn hai âm này. Để trong bài vì người học sẽ đi tìm, nhưng nói thật
     rằng sửa chúng ít lợi hơn sửa phụ âm cuối.

   kiemDuoc = false nghĩa là phần nói không kiểm được mục này: lỗi thường gặp đẻ ra một chuỗi KHÔNG
   phải từ (life → "laip"), mà gặp chuỗi vô nghĩa thì máy tự nắn về từ gần nhất và GIẤU lỗi đi.
   Mục đó chỉ có hình. */
const AM = [
  /* ---- cuối âm tiết: nhóm quan trọng nhất ---- */
  { ipa: '/l/ cuối', ten: 'l cuối bị nuốt hoặc thành n', nhom: 'Cuối từ', uuTien: 10, kiemDuoc: true,
    viSao: 'Âm hỏng nhiều nhất khi đo trên người Việt: chỉ 25% đúng, 50% mất hẳn. Tiếng Việt có "l" ở đầu từ nhưng tuyệt đối không có ở cuối, nên "call" thành "co", "tell" thành "ten". Người miền Bắc còn sẵn thói lẫn l/n ngay trong tiếng Việt, mang luôn sang.',
    cach: 'Đầu lưỡi chạm CHẮC vào lợi sau răng trên rồi GIỮ nguyên ở đó, cho hơi thoát ra hai bên cạnh lưỡi. Tự kiểm: bịt mũi lại mà vẫn kêu được thì đúng; bịt mũi mà tắc tiếng là bạn đang nói thành "n".',
    tu: ['feel', 'call', 'school', 'tell'],
    cap: [['tell', 'ten', 'kể / số mười'], ['well', 'when', 'tốt / khi nào'], ['feel', 'fee', 'cảm thấy / phí']],
    kh: { luoiSau: .55, luoiCao: .45, dauLuoi: 1, moiTron: .1, hamMo: .25, rung: true, mui: false, chamO: 'loi' }, moi: 'trung',
    nhan1: '/l/ — hơi ra hai bên lưỡi', kh2: { luoiSau: .2, luoiCao: .4, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: true, mui: true, chamO: 'loi' }, nhan2: 'thành /n/ — hơi lên mũi (sai)', moi2: 'trung' },

  { ipa: '/s/ /z/ cuối', ten: 'đuôi s của số nhiều', nhom: 'Cuối từ', uuTien: 10, kiemDuoc: true,
    viSao: 'Người Việt bỏ /s/ cuối gần như mọi lúc. Mất đuôi s là mất dấu số nhiều và mất chia động từ: "two books" thành "two book". Tiếng Việt cũng không có /z/ ở cuối, nên "eyes" dễ thành "ice" — khác nghĩa hẳn.',
    cach: 'Đầu lưỡi nâng gần lợi, hai hàm răng gần khít, hơi rít qua một rãnh nhỏ giữa lưỡi. /s/ là tiếng rắn kêu, /z/ là tiếng ong bay — /z/ phải bật giọng cho cổ rung. Đặt tay lên cổ, nói "s" rồi "z", phải thấy khác.',
    tu: ['books', 'cats', 'eyes', 'dogs'],
    cap: [['books', 'book', 'nhiều sách / một cuốn'], ['eyes', 'ice', 'đôi mắt / nước đá'], ['prize', 'price', 'giải thưởng / giá tiền']],
    kh: { luoiSau: .05, luoiCao: .5, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'loi' }, moi: 'trung',
    nhan1: '/s/ — không rung', kh2: { luoiSau: .05, luoiCao: .5, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: true, mui: false, chamO: 'loi' }, nhan2: '/z/ — cùng chỗ, có rung', moi2: 'trung' },

  { ipa: '/t/ /d/ cuối', ten: 'bật ra, đừng nuốt', nhom: 'Cuối từ', uuTien: 10, kiemDuoc: true,
    viSao: 'Tiếng Việt CÓ /t/ cuối nhưng ngậm luôn, không nhả hơi — người bản ngữ nghe như bạn chưa nói xong. Nặng hơn: đuôi quá khứ -ed cũng chính là âm này (worked, played), nuốt mất là người nghe không biết chuyện xảy ra lúc nào.',
    cach: 'Chặn đầu lưỡi lên lợi sau răng trên, ngậm hơi lại, rồi NHẢ cho hơi bật ra một tiếng nhỏ. Đừng thêm "ơ" phía sau. Tự kiểm: để tờ giấy mỏng trước miệng, nói "eat" — cuối từ tờ giấy phải nhúc nhích.',
    tu: ['eat', 'night', 'played', 'made'],
    cap: [['write', 'ride', 'viết / cưỡi'], ['hat', 'had', 'cái mũ / đã có'], ['seat', 'sea', 'chỗ ngồi / biển']],
    kh: { luoiSau: .05, luoiCao: .3, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: false, mui: false, chamO: 'loi' }, moi: 'trung',
    nhan1: '/t/ — chặn rồi bật ra', kh2: { luoiSau: .05, luoiCao: .3, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: true, mui: false, chamO: 'loi' }, nhan2: '/d/ — cùng chỗ, có rung', moi2: 'trung' },

  { ipa: '/k/ /g/ cuối', ten: 'work hay bị nghe thành word', nhom: 'Cuối từ', uuTien: 7, kiemDuoc: true,
    viSao: 'Cuối từ, /k/ và /g/ hay bị đổi chỗ cho nhau hoặc rơi mất. Có ghi nhận "work" bị nghe thành "word".',
    cach: 'Nâng phần SAU của lưỡi lên chạm vòm mềm, chặn hơi lại rồi thả ra. Đầu lưỡi không làm gì cả. /g/ thì cổ họng rung, /k/ thì không.',
    tu: ['back', 'work', 'bag', 'big'],
    cap: [['back', 'bag', 'lưng / cái túi'], ['pick', 'pig', 'chọn / con heo']],
    kh: { luoiSau: 1, luoiCao: .7, dauLuoi: 0, moiTron: 0, hamMo: .2, rung: false, mui: false, chamO: 'vom-mem' }, moi: 'trung' },

  { ipa: '/f/ /v/ cuối', ten: 'life hay thành laip', nhom: 'Cuối từ', uuTien: 6, kiemDuoc: false,
    viSao: 'Cuối từ, /f/ và /v/ hay bị đổi thành /p/ hoặc rơi mất: "life" thành "laip", "five" thành "fai". "Laip" không phải từ tiếng Anh, nên máy sẽ tự nắn về "life" và giấu mất lỗi — mục này chỉ học bằng hình.',
    cach: 'Cắn nhẹ môi DƯỚI vào hàm răng TRÊN rồi đẩy hơi qua khe đó. Môi tuyệt đối không khép kín lại như /p/. Lưỡi nằm yên, không tham gia.',
    tu: ['life', 'five', 'safe', 'love'],
    cap: [],
    kh: { luoiSau: .2, luoiCao: .25, dauLuoi: .1, moiTron: 0, hamMo: .15, rung: false, mui: false, chamO: 'rang' }, moi: 'trung',
    nhan1: '/f/ — môi dưới chạm răng', kh2: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: false, mui: false, chamO: 'moi' }, nhan2: 'thành /p/ — hai môi khép kín (sai)', moi2: 'trung' },

  /* ---- cụm phụ âm ---- */
  { ipa: 'cụm st- sp- sk-', ten: 'đừng bỏ chữ đầu', nhom: 'Cụm phụ âm', uuTien: 8, kiemDuoc: true,
    viSao: 'Gặp hai phụ âm dính nhau, người Việt gần như luôn bỏ phụ âm THỨ NHẤT — đo được 55 trên 56 trường hợp. "Stop" thành "top", "spin" thành "pin", và cả hai đều là từ có thật nên người nghe hiểu sang nghĩa khác.',
    cach: 'Giữ âm /s/ cho kêu rõ trước đã, rồi mới sang phụ âm sau. Đừng chèn nguyên âm vào giữa — "sờ-top" cũng sai, vì nó đẻ ra hai âm tiết.',
    tu: ['stop', 'spin', 'sky', 'street'],
    cap: [['stop', 'top', 'dừng / đỉnh'], ['spin', 'pin', 'quay / cái ghim'], ['school', 'cool', 'trường học / mát']],
    kh: { luoiSau: .05, luoiCao: .55, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'loi' }, moi: 'det' },

  { ipa: 'cụm -st -nd -ld', ten: 'hai phụ âm cuối', nhom: 'Cụm phụ âm', uuTien: 7, kiemDuoc: true,
    viSao: 'Nhóm lì nhất, vẫn hỏng sau nhiều tuần luyện. Tiếng Việt không bao giờ có hai phụ âm cuối liền nhau nên miệng chưa từng phải làm việc đó.',
    cach: 'Làm chậm lại: phát đủ âm thứ nhất rồi mới sang âm thứ hai. Thà chậm mà đủ còn hơn nhanh mà mất. Nói chậm lại là cách rẻ nhất để người nghe hiểu bạn.',
    tu: ['cold', 'find', 'last', 'hand'],
    cap: [['cold', 'coal', 'lạnh / than'], ['find', 'fine', 'tìm / ổn']],
    kh: { luoiSau: .1, luoiCao: .4, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: true, mui: false, chamO: 'loi' }, moi: 'trung' },

  /* ---- phụ âm đầu hay lẫn ---- */
  { ipa: '/p/ và /b/', ten: 'pat hay thành bat', nhom: 'Phụ âm đầu', uuTien: 9, kiemDuoc: true,
    viSao: 'Tiếng Việt không có /p/ ở ĐẦU từ, nên nó hay trượt thành /b/ — có ghi nhận "people" đọc thành "bi-bồ". Đây là cặp đứng đầu bảng những lẫn lộn làm hỏng nghĩa nhiều nhất.',
    cach: 'Hai môi khép kín, dồn hơi, rồi bật ra. /p/ phải có một luồng hơi PHỤT mạnh và cổ họng không rung. Tự kiểm: để tờ giấy trước miệng, nói "pat" thì giấy bay, nói "bat" thì giấy đứng yên.',
    tu: ['pat', 'pie', 'people', 'pull'],
    cap: [['pat', 'bat', 'vỗ nhẹ / con dơi'], ['pie', 'buy', 'bánh nướng / mua']],
    kh: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: false, mui: false, chamO: 'moi' }, moi: 'trung',
    nhan1: '/p/ — không rung, phụt hơi', kh2: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: true, mui: false, chamO: 'moi' }, nhan2: '/b/ — cùng chỗ, có rung', moi2: 'trung' },

  { ipa: '/p/ và /f/', ten: 'funny hay thành punny', nhom: 'Phụ âm đầu', uuTien: 8, kiemDuoc: true,
    viSao: 'Người Việt hay đọc "funny", "famous" bằng âm /p/. Cặp này đứng thứ hai trong bảng những lẫn lộn làm hỏng nghĩa.',
    cach: '/f/ thì răng trên chạm môi dưới và hơi xì ra LIÊN TỤC kéo dài được; /p/ thì hai môi khép kín rồi bật ra một cái, không kéo dài được. Thử ngân dài: ngân được là /f/.',
    tu: ['fat', 'full', 'funny', 'famous'],
    cap: [['fat', 'pat', 'béo / vỗ nhẹ'], ['full', 'pull', 'đầy / kéo']],
    kh: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: false, mui: false, chamO: 'moi' }, moi: 'trung',
    nhan1: '/p/ — hai môi khép kín rồi bật một cái', kh2: { luoiSau: .2, luoiCao: .3, dauLuoi: .1, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'rang' }, nhan2: '/f/ — răng chạm môi, hơi xì kéo dài', moi2: 'trung' },

  { ipa: '/n/ và /l/', ten: 'night hay thành light', nhom: 'Phụ âm đầu', uuTien: 8, kiemDuoc: true,
    viSao: 'Cặp lẫn lộn quen thuộc, nhất là với người miền Bắc vốn đã lẫn l/n trong tiếng Việt. Cả hai lỗi đều đẻ ra từ CÓ THẬT nên người nghe hiểu sang nghĩa khác chứ không đoán lại được.',
    cach: 'Lưỡi đặt cùng một chỗ cho cả hai — khác nhau ở chỗ hơi thoát ra: /n/ cho hơi ra đằng MŨI, /l/ cho hơi ra hai bên lưỡi. Tự kiểm: bịt mũi lại, kêu được là /l/, tắc tiếng là /n/.',
    tu: ['night', 'light', 'no', 'low'],
    cap: [['night', 'light', 'đêm / ánh sáng'], ['no', 'low', 'không / thấp']],
    kh: { luoiSau: .2, luoiCao: .4, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: true, mui: true, chamO: 'loi' }, moi: 'trung',
    nhan1: '/n/ — hơi lên mũi', kh2: { luoiSau: .55, luoiCao: .45, dauLuoi: 1, moiTron: .1, hamMo: .25, rung: true, mui: false, chamO: 'loi' }, nhan2: '/l/ — hơi ra hai bên lưỡi', moi2: 'trung' },

  { ipa: '/r/', ten: 'r kiểu Anh Mỹ', nhom: 'Phụ âm đầu', uuTien: 8, kiemDuoc: true,
    viSao: 'Chữ "r" tiếng Việt khác hẳn: miền Bắc đọc thành "z" (rice thành "zai"), miền Nam rung đầu lưỡi. /r/ tiếng Anh thì đầu lưỡi KHÔNG chạm vào đâu cả. Đọc sai thì "right" nghe ra "light".',
    cach: 'Chu môi ra một chút như sắp huýt sáo. Cuộn đầu lưỡi lên nhưng để LƠ LỬNG, không chạm vòm miệng. Thân lưỡi gồng nhẹ và kéo lùi về phía cổ. Tuyệt đối không rung đầu lưỡi như "r" tiếng Việt.',
    tu: ['red', 'rice', 'room', 'right'],
    cap: [['right', 'light', 'đúng / ánh sáng'], ['grass', 'glass', 'cỏ / ly thuỷ tinh']],
    kh: { luoiSau: .7, luoiCao: .65, dauLuoi: .7, moiTron: .75, hamMo: .3, rung: true, mui: false, chamO: 'khong' }, moi: 'tron',
    nhan1: '/r/ — đầu lưỡi lơ lửng, không chạm', kh2: { luoiSau: .55, luoiCao: .45, dauLuoi: 1, moiTron: .1, hamMo: .25, rung: true, mui: false, chamO: 'loi' }, nhan2: '/l/ — đầu lưỡi chạm hẳn vào lợi', moi2: 'trung' },

  { ipa: '/v/ và /w/', ten: 'vet hay thành wet', nhom: 'Phụ âm đầu', uuTien: 7, kiemDuoc: true,
    viSao: 'Chữ "v" tiếng Việt đọc khác /v/ tiếng Anh; người miền Nam còn hay đọc thành "d/gi" (very thành "gia-ry"). Quên bật giọng thì /v/ thành /f/: "save" nghe ra "safe", nghĩa ngược nhau.',
    cach: '/v/ thì răng trên cắn nhẹ môi dưới, rung cổ họng, hơi rít qua kẽ răng. /w/ thì răng KHÔNG chạm gì cả, hai môi chu tròn lại rồi mở ra.',
    tu: ['very', 'vet', 'five', 'love'],
    cap: [['vet', 'wet', 'bác sĩ thú y / ướt'], ['vest', 'west', 'áo gi-lê / phía tây'], ['save', 'safe', 'cứu / an toàn']],
    kh: { luoiSau: .2, luoiCao: .25, dauLuoi: .1, moiTron: 0, hamMo: .15, rung: true, mui: false, chamO: 'rang' }, moi: 'trung',
    nhan1: '/v/ — răng chạm môi dưới', kh2: { luoiSau: .85, luoiCao: .6, dauLuoi: .05, moiTron: 1, hamMo: .2, rung: true, mui: false, chamO: 'khong' }, nhan2: '/w/ — môi chu, răng không chạm', moi2: 'tron' },

  { ipa: '/ʃ/', ten: 'sh trong she', nhom: 'Phụ âm đầu', uuTien: 6, kiemDuoc: true,
    viSao: 'Nhiều vùng tiếng Việt không phân biệt s/x nên "she" thành "see", "ship" thành "sip" — đều ra từ có thật, nghĩa đổi hẳn. Máy nhận giọng nói cũng nhầm y như người nghe.',
    cach: 'Kéo lưỡi lùi lại một chút so với /s/, nâng phần giữa lưỡi lên gần vòm. Chu môi ra. Tiếng nghe trầm và dày như khi bảo ai đó im lặng: "suỵt".',
    tu: ['she', 'ship', 'wash', 'fish'],
    cap: [['she', 'see', 'cô ấy / nhìn'], ['sheet', 'seat', 'tờ giấy / chỗ ngồi'], ['ship', 'sip', 'con tàu / nhấp một ngụm']],
    kh: { luoiSau: .4, luoiCao: .72, dauLuoi: .6, moiTron: .75, hamMo: .2, rung: false, mui: false, chamO: 'sau-loi' }, moi: 'tron',
    nhan1: '/ʃ/ — lưỡi lùi sau, môi chu', kh2: { luoiSau: .05, luoiCao: .5, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'loi' }, nhan2: '/s/ — lưỡi sát lợi, môi bẹt', moi2: 'det' },

  { ipa: '/θ/ /ð/', ten: 'hai âm "th"', nhom: 'Phụ âm đầu', uuTien: 4, kiemDuoc: true,
    viSao: 'Người học sợ âm này nhất, nhưng nó lại ÍT làm hỏng nghĩa nhất — "think" đọc thành "tink" thì người nghe vẫn hiểu. Sửa phụ âm cuối có lợi hơn nhiều. Để đây vì bạn sẽ đi tìm, không phải vì nó gấp.',
    cach: 'Thè nhẹ đầu lưỡi ra, kẹp hờ giữa hai hàm răng, thổi hơi qua khe đó. Soi gương phải THẤY đầu lưỡi. /θ/ (think) không rung cổ họng; /ð/ (this) thì rung, hơi ra ít hơn, tiếng trầm và mượt hơn.',
    tu: ['think', 'three', 'this', 'mother'],
    cap: [['think', 'sink', 'nghĩ / chìm'], ['three', 'tree', 'số ba / cái cây'], ['they', 'day', 'họ / ngày']],
    kh: { luoiSau: .2, luoiCao: .45, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: false, mui: false, chamO: 'rang' }, moi: 'trung',
    nhan1: '/θ/ — think, không rung', kh2: { luoiSau: .2, luoiCao: .45, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: true, mui: false, chamO: 'rang' }, nhan2: '/ð/ — this, có rung', moi2: 'trung' },

  /* ---- nguyên âm: có ích, nhưng ít cấp hơn phụ âm ---- */
  { ipa: '/ə/', ten: 'âm ơ nhẹ, schwa', nhom: 'Nguyên âm', uuTien: 6, kiemDuoc: false, bieu: 'ə',
    viSao: 'Âm hay gặp nhất trong tiếng Anh, nằm ở mọi âm tiết KHÔNG có trọng âm. Người Việt đọc rõ đều từng chữ nên câu nghe cứng và sai nhịp. Máy không kiểm được vì nó nằm chìm trong từ, không đứng riêng để đo.',
    cach: 'Thả lỏng hoàn toàn: không kéo môi, không chu môi, lưỡi nằm giữa, hàm hé nhẹ. Âm rất ngắn và mờ, nghe như đang lười nói.',
    tu: ['about', 'banana', 'teacher', 'problem'],
    cap: [],
    kh: { luoiSau: .45, luoiCao: .45, dauLuoi: .1, moiTron: .4, hamMo: .4, rung: true, mui: false, chamO: 'khong' }, moi: 'trung' },

  { ipa: '/iː/ và /ɪ/', ten: 'sheep hay ship', nhom: 'Nguyên âm', uuTien: 5, kiemDuoc: true, bieu: 'iː',
    viSao: 'Cặp nguyên âm người Việt lẫn nhiều nhất. Chúng khác nhau ở VỊ TRÍ LƯỠI chứ không chỉ ở chỗ dài hay ngắn — nên kéo dài âm i tiếng Việt ra vẫn không thành /iː/.',
    cach: '/iː/: cười nhẹ, kéo hai khoé môi sang ngang, lưỡi đẩy lên cao và ra trước gần chạm vòm. /ɪ/: bắt đầu như /iː/ rồi thả lỏng hết — hạ lưỡi xuống, lùi vào, môi buông ra không cười, âm rất ngắn.',
    tu: ['sheep', 'ship', 'feet', 'fit'],
    cap: [['sheep', 'ship', 'con cừu / con tàu'], ['feet', 'fit', 'bàn chân / vừa vặn'], ['cheap', 'chip', 'rẻ / miếng khoai chiên']],
    kh: { luoiSau: .05, luoiCao: .95, dauLuoi: .2, moiTron: 0, hamMo: .15, rung: true, mui: false, chamO: 'khong' }, moi: 'det',
    nhan1: '/iː/ — lưỡi cao và ra trước', kh2: { luoiSau: .25, luoiCao: .72, dauLuoi: .15, moiTron: .35, hamMo: .3, rung: true, mui: false, chamO: 'khong' }, nhan2: '/ɪ/ — thả lỏng, hạ và lùi', moi2: 'trung' },

  { ipa: '/æ/', ten: 'a bẹt, cat', nhom: 'Nguyên âm', uuTien: 4, kiemDuoc: true, bieu: 'æ',
    viSao: 'Hay bị đọc thành "e". "Bad" thành "bed", "man" thành "men" — đổi nghĩa hẳn.',
    cach: 'Mở hàm to hẳn ra, lưỡi ở phía trước nhưng hạ thấp xuống. Miệng bẹt sang hai bên, nghe như đang giữa "a" và "e".',
    tu: ['cat', 'bad', 'apple', 'man'],
    cap: [['bad', 'bed', 'tệ / cái giường'], ['man', 'men', 'đàn ông / nhiều đàn ông']],
    kh: { luoiSau: .15, luoiCao: .05, dauLuoi: .05, moiTron: 0, hamMo: 1, rung: true, mui: false, chamO: 'khong' }, moi: 'mo' },
];

const NHOM = ['Cuối từ', 'Cụm phụ âm', 'Phụ âm đầu', 'Nguyên âm'];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let tam, oTrong, am = null, capDang = null, luot = [], mayNghe = null, dangNghe = false, docBat = true, giong = null;
let daBaoGui = false;   // câu báo "giọng bạn được gửi đi" chỉ hiện trước lần bấm micro đầu tiên mỗi buổi

/* iPhone đã cài lên màn hình chính thì WebKit không cho dùng micro — không phải lỗi người dùng. */
const IOS_CAI = !!(self.navigator && self.navigator.standalone);
const coNghe = () => !IOS_CAI && !!(self.SpeechRecognition || self.webkitSpeechRecognition);

/* ---- máy đọc ---- */
function timGiong() {
  if (!self.speechSynthesis) return;
  const ds = speechSynthesis.getVoices() || [];
  giong = ds.find(v => /^en[-_]us/i.test(v.lang)) || ds.find(v => /^en/i.test(v.lang)) || null;
}
if (self.speechSynthesis) { timGiong(); speechSynthesis.addEventListener('voiceschanged', timGiong); }
function doc(chu, cham) {
  if (!docBat || !self.speechSynthesis || !chu) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(chu);
    u.lang = 'en-US'; u.rate = cham ? .6 : .8;
    if (giong) u.voice = giong;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---- khung ---- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'phatam';
  tam.innerHTML = `<button class="pa-dong" aria-label="Đóng">✕</button><div class="pa-trong"></div>`;
  document.body.appendChild(tam);
  oTrong = tam.querySelector('.pa-trong');
  tam.querySelector('.pa-dong').onclick = dong;
}

/* ---- màn chọn âm ---- */
function veDanhSach() {
  am = null; capDang = null; thoiNghe();
  oTrong.innerHTML = `
    <div class="pa-man">
      <p class="pa-tua">Luyện phát âm</p>
      <p class="pa-phu">Mỗi âm có hình miệng cắt dọc để thấy đặt lưỡi ở đâu. Chọn âm nào hay sai nhất mà tập trước.</p>
      ${NHOM.map(n => `
        <p class="pa-nhom">${esc(n)}</p>
        <div class="pa-ds">
          ${AM.map((a, i) => a.nhom !== n ? '' : `
            <button class="pa-the" data-i="${i}">
              <span class="pa-ipa">${esc(a.ipa)}</span>
              <span class="pa-the-chu"><b>${esc(a.ten)}</b><i>${esc(a.viSao.split('.')[0])}.</i></span>
              <span class="pa-sao" title="mức quan trọng">${'●'.repeat(Math.round(a.uuTien / 3.4))}</span>
            </button>`).join('')}
        </div>`).join('')}
      <p class="pa-thua">Xếp theo mức đáng sửa trước, không theo mức khó. Phụ âm cuối đứng đầu vì sai ở đó là
        người nghe hiểu sai nghĩa; hai âm "th" xuống cuối vì sai ở đó người ta vẫn hiểu.</p>
    </div>`;
  oTrong.querySelectorAll('.pa-the').forEach(n => { n.onclick = () => moAm(AM[+n.dataset.i]); });
}

/* ---- màn một âm ---- */
function moAm(a) {
  am = a; capDang = null; luot = [];
  const K = self.TDTD_KHAUHINH;
  oTrong.innerHTML = `
    <div class="pa-man">
      <div class="pa-dau">
        <button class="pa-quay" aria-label="Quay lại">‹</button>
        <span class="pa-ten">${esc(a.ipa)} · ${esc(a.ten)}</span>
      </div>
      <div class="pa-doi-hinh">
        <figure class="pa-hinh">
          ${K ? K.ve(a.kh, { nhan: 'Khẩu hình ' + (a.nhan1 || a.ipa) }) : ''}
          <div class="pa-moi">${K ? K.veMoi(a.moi) : ''}</div>
          ${a.nhan1 ? `<figcaption>${esc(a.nhan1)}</figcaption>` : ''}
        </figure>
        ${a.kh2 ? `<figure class="pa-hinh">
          ${K ? K.ve(a.kh2, { nhan: 'Khẩu hình ' + a.nhan2 }) : ''}
          <div class="pa-moi">${K ? K.veMoi(a.moi2 || a.moi) : ''}</div>
          <figcaption${/sai\)/.test(a.nhan2) ? ' class="pa-sai"' : ''}>${esc(a.nhan2)}</figcaption>
        </figure>` : ''}
      </div>
      <div class="pa-khoi">
        <p class="pa-nhan">Cách đặt miệng</p>
        <p class="pa-chu">${esc(a.cach)}</p>
      </div>
      <div class="pa-khoi">
        <p class="pa-nhan">Vì sao người Việt hay sai</p>
        <p class="pa-chu">${esc(a.viSao)}</p>
      </div>
      ${a.bieu && K ? `<div class="pa-khoi"><p class="pa-nhan">Chỗ của âm này trong miệng</p>
        <div class="pa-bieu">${K.veNguyenAm(a.bieu)}</div>
        <p class="pa-chu pa-nho">Trái là lưỡi đưa ra trước, phải là lưỡi lùi về sau; trên là lưỡi nâng cao, dưới là hạ thấp.</p></div>` : ''}
      <div class="pa-khoi">
        <p class="pa-nhan">Nghe thử</p>
        <div class="pa-tu">${a.tu.map(t => `<button class="pa-tu-nut" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      </div>
      ${a.cap.length && coNghe() ? `<div class="pa-khoi">
        <p class="pa-nhan">Tập phân biệt</p>
        <p class="pa-chu pa-nho">Bạn nói một từ, máy nghe rồi báo nó nghe ra từ nào. Việc này đo <b>máy có phân biệt được hai từ hay không</b>, không phải chấm giọng bạn hay dở.</p>
        <div class="pa-cap">${a.cap.map((c, i) => `<button class="pa-cap-nut" data-i="${i}">${esc(c[0])} / ${esc(c[1])}<i>${esc(c[2])}</i></button>`).join('')}</div>
      </div>` : !a.kiemDuoc ? `<div class="pa-khoi pa-mo">
        <p class="pa-nhan">Mục này không có phần nói</p>
        <p class="pa-chu pa-nho">Lỗi thường gặp ở đây đẻ ra một chuỗi không phải từ tiếng Anh. Gặp chuỗi vô nghĩa
          thì máy tự nắn về từ gần nhất, nên nó sẽ báo bạn nói đúng kể cả khi bạn nói sai. Thà không đo còn hơn đo bịa.</p>
      </div>` : a.cap.length ? `<div class="pa-khoi pa-mo">
        <p class="pa-nhan">Mục này có phần nói, nhưng máy này không mở được micro</p>
        <p class="pa-chu pa-nho">${IOS_CAI
          ? 'iPhone khi mở từ biểu tượng ngoài màn hình chính thì không cho trang web dùng micro. Mở lại trang này trong Safari là tập nói được.'
          : 'Trình duyệt này không có phần nhận giọng nói. Chrome, Edge hay Safari thì chạy được.'}
          Phần hình và phần nghe mẫu ở trên vẫn dùng bình thường.</p>
      </div>` : ''}
    </div>`;
  oTrong.querySelector('.pa-quay').onclick = veDanhSach;
  oTrong.querySelectorAll('.pa-tu-nut').forEach(n => { n.onclick = () => doc(n.dataset.t, true); });
  oTrong.querySelectorAll('.pa-cap-nut').forEach(n => { n.onclick = () => moCap(a.cap[+n.dataset.i]); });
}

/* ---- tập cặp tối thiểu ---- */
function moCap(c) {
  capDang = c; luot = [];
  veCap();
}

function veCap() {
  const c = capDang;
  const dung = luot.filter(l => l.dung).length;
  oTrong.innerHTML = `
    <div class="pa-man">
      <div class="pa-dau">
        <button class="pa-quay" aria-label="Quay lại">‹</button>
        <span class="pa-ten">${esc(c[0])} / ${esc(c[1])}</span>
      </div>
      <p class="pa-chu">${esc(c[2])}</p>
      <div class="pa-doi">
        ${[0, 1].map(k => `<button class="pa-doi-nut" data-t="${esc(c[k])}"><b>${esc(c[k])}</b><i>nghe mẫu</i></button>`).join('')}
      </div>
      <div class="pa-khoi">
        <p class="pa-nhan">Tới lượt bạn</p>
        <p class="pa-chu pa-nho">Nhấn nút rồi nói <b>${esc(c[0])}</b>. Nói mỗi một từ thôi, đừng đặt vào câu —
          đặt vào câu thì máy đoán được từ còn thiếu và phép thử mất ý nghĩa.</p>
        ${daBaoGui ? '' : `<p class="pa-gui">Bấm nút này là giọng bạn được gửi lên máy chủ của hãng trình duyệt
          để nhận ra chữ. Phần hình ở trên thì không gửi gì đi đâu cả.</p>`}
        <p class="pa-loi" hidden></p>
        <button class="pa-mic">Nhấn rồi nói "${esc(c[0])}"</button>
      </div>
      ${luot.length ? `<div class="pa-khoi">
        <p class="pa-nhan">Máy nghe được ${dung}/${luot.length} lần đúng</p>
        <div class="pa-luot">${luot.map(l => `<span class="${l.dung ? 'dung' : 'sai'}">${esc(l.nghe || '—')}</span>`).join('')}</div>
        <p class="pa-chu pa-nho">${dung >= 4 ? 'Máy phân biệt được hai từ của bạn. Đáng mừng — dù nó chỉ nói rằng hai âm của bạn đã KHÁC nhau, không nói rằng giọng bạn đã chuẩn.'
          : dung <= 1 ? 'Máy chưa phân biệt được. Có thể bạn phát âm hai từ chưa khác nhau — mà cũng có thể là tại máy.'
          : 'Lúc được lúc không. Nghe lại mẫu rồi thử tiếp.'}</p>
        <p class="pa-chu pa-nho pa-thua">Đo trên máy nhận giọng nói, giọng người Việt bị chép sai nhiều nhất trong
          sáu nhóm từng được đo — khoảng một phần bảy số từ bị chép sai kể cả khi nói tốt. Một buổi không kết luận
          được gì, và app này cố ý không cộng dồn điểm qua ngày: cộng dồn nhiễu thì chỉ ra một đường tiến bộ giả.</p>
      </div>` : ''}
    </div>`;
  oTrong.querySelector('.pa-quay').onclick = () => moAm(am);
  oTrong.querySelectorAll('.pa-doi-nut').forEach(n => { n.onclick = () => doc(n.dataset.t, true); });
  oTrong.querySelector('.pa-mic').onclick = nghe;
}

function bao(chu, nang) {
  const n = oTrong.querySelector('.pa-loi');
  if (!n) return;
  n.hidden = !chu; n.textContent = chu || '';
  n.classList.toggle('nang', !!nang);
}

function nghe() {
  if (dangNghe) return;
  const RS = self.SpeechRecognition || self.webkitSpeechRecognition;
  const nut = oTrong.querySelector('.pa-mic');
  if (IOS_CAI) { bao('iPhone mở từ biểu tượng ngoài màn hình chính thì không cho dùng micro. Mở trang này trong Safari là nói được.', true); return; }
  if (!RS) { bao('Trình duyệt này không nghe được. Vẫn xem hình và nghe mẫu được bình thường.', true); return; }
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
  try { if (mayNghe) mayNghe.abort(); } catch (e) {}

  mayNghe = new RS();
  mayNghe.lang = 'en-US'; mayNghe.continuous = false; mayNghe.interimResults = false; mayNghe.maxAlternatives = 5;
  let ds = [];
  daBaoGui = true;
  dangNghe = true; nut.classList.add('dang'); nut.textContent = 'Đang nghe…'; bao('');

  mayNghe.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      for (let k = 0; k < r.length; k++) ds.push(r[k].transcript);
    }
  };
  mayNghe.onerror = (e) => {
    dangNghe = false;
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') bao('Máy chưa cho dùng micro. Bật quyền micro cho trang này rồi thử lại.', true);
    else if (e.error === 'no-speech') bao('Không nghe thấy gì. Nói to hơn một chút.');
    else if (e.error === 'network') bao('Nhận giọng nói cần mạng, mà mạng đang trục trặc.', true);
    else if (e.error !== 'aborted') bao('Nghe không được (' + e.error + ').');
  };
  mayNghe.onend = () => {
    dangNghe = false;
    const n = oTrong.querySelector('.pa-mic');
    if (n) { n.classList.remove('dang'); n.textContent = `Nhấn rồi nói "${capDang[0]}"`; }
    if (ds.length) xet(ds);
  };
  try { mayNghe.start(); } catch (e) { dangNghe = false; bao('Không mở được micro.', true); }
}

function xet(ds) {
  const N = self.TDTD_NGHE;
  const kq = N ? N.chonCau(ds, [capDang[0], capDang[1]]) : { chi: -1 };
  luot.push({ nghe: ds[0], dung: kq.chi === 0 });
  if (luot.length > 5) luot.shift();
  veCap();
  if (kq.chi === 1) bao(`Máy nghe ra "${capDang[1]}" chứ không phải "${capDang[0]}".`);
  else if (kq.chi < 0) bao(`Máy nghe thành "${ds[0]}", không khớp từ nào trong cặp.`);
}

function thoiNghe() { if (mayNghe) { try { mayNghe.abort(); } catch (e) {} mayNghe = null; } dangNghe = false; }

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  timGiong();
  veDanhSach();
}
function dong() {
  thoiNghe();
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });

self.TDTD_PHATAM = { mo, dong, _am: AM,
  _moAm: (i) => moAm(AM[i]),
  _cap: (i, k) => { moAm(AM[i]); moCap(AM[i].cap[k]); },
  _xet: (ds) => xet(ds),
  _trangThai: () => ({ am: am ? am.ipa : null, cap: capDang ? capDang[0] + '/' + capDang[1] : null, luot: luot.length,
                       dung: luot.filter(l => l.dung).length, nghe: coNghe() }) };
})();
