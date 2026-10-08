/* Luyện phát âm: mỗi âm một hình khẩu hình, vài từ ví dụ, và phần tập nói.

   Chuyện quan trọng nhất phải nói trước: trò này KHÔNG có "điểm phát âm" chung chung. Máy nhận
   giọng nói chỉ trả về CHỮ, không trả về âm, nên mọi điểm số dựng trên nó đều là điểm giả. Thử cho
   Gemini nghe audio cũng vậy: câu cố tình nuốt hết phụ âm cuối vẫn bị nó chép lại thành câu đúng.

   Có hai thứ đo được thật, và app chỉ nói đúng chừng đó:
   - Bảy âm có dấu hiệu âm học rõ (đuôi s, âm cuối có nhả hay bị nuốt, st-, sh/s, p/b, i dài/ngắn)
     thì đo thẳng vào tiếng bạn, ngay trên máy, không gửi đi đâu — xem assets/dophatam.js. Kết quả
     là từng dấu hiệu đạt hay chưa, kèm con số đo được, không quy ra điểm.
   - Các âm còn lại: khi bạn nói một từ trong cặp tối thiểu (ship/sheep), máy nhận giọng nghe ra
     từ nào. Nghe đúng thì ít ra hai âm của bạn đã KHÁC NHAU đủ để máy phân biệt. */
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
  /* ---- cuối âm tiết: nhóm quan trọng nhất ----
     Một điều cả năm bài phải nói cho thống nhất: ở CUỐI từ, người bản xứ đọc /d/ /g/ /z/ /v/ rung rất
     ít (đo trên bản thu: đoạn xát của /z/ trong "eyes", "dogs" gần như không có năng lượng dưới 500 Hz).
     Cái làm "had" khác "hat", "bag" khác "back", "eyes" khác "ice" lúc đó là nguyên âm đứng TRƯỚC:
     trước âm hữu thanh thì kéo dài hơn. Bảo người học "rung cổ ở cuối từ" là dạy một thứ người bản xứ
     không làm. */
  { ipa: '/l/ cuối', ten: 'l cuối bị nuốt hoặc thành n', nhom: 'Cuối từ', uuTien: 10, kiemDuoc: true,
    tuA: 'tell', tuB: 'ten',
    am: 'l-toi', am2: 'n', sai2: true,
    viSao: 'Âm hỏng nhiều nhất khi đo trên người Việt: chỉ 25% đúng, 50% mất hẳn. Tiếng Việt có "l" ở đầu từ nhưng tuyệt đối không có ở cuối, nên "call" thành "co", "tell" thành "ten". Người miền Bắc còn sẵn thói lẫn l/n ngay trong tiếng Việt, mang luôn sang.',
    cach: 'Đầu lưỡi chạm CHẮC vào lợi sau răng trên rồi GIỮ nguyên ở đó, cho hơi thoát ra hai bên cạnh lưỡi. Ở cuối từ là "l tối": phần sau lưỡi nâng lên một chút nên nghe như có "ô" mờ chen vào ("tell" gần như "teo-l"), nhưng đầu lưỡi VẪN phải chạm lợi. Tự kiểm: nói "tell" rồi đứng yên miệng — đầu lưỡi phải đang chạm lợi; lưỡi nằm dưới là đã nuốt mất /l/. Bịt mũi mà tắc tiếng là đang nói thành "n".',
    tu: ['feel', 'call', 'school', 'tell'],
    cap: [['tell', 'ten', 'kể / số mười'], ['well', 'when', 'tốt / khi nào'], ['feel', 'fee', 'cảm thấy / phí']],
    kh: { luoiSau: .55, luoiCao: .45, dauLuoi: 1, moiTron: .2, hamMo: .25, rung: true, mui: false, chamO: 'loi' }, moi: 'trung',
    nhan1: '/l/ — hơi ra hai bên lưỡi', kh2: { luoiSau: .2, luoiCao: .4, dauLuoi: 1, moiTron: .2, hamMo: .2, rung: true, mui: true, chamO: 'loi' }, nhan2: 'thành /n/ — hơi lên mũi (sai)', moi2: 'trung' },

  { ipa: '/s/ /z/ cuối', ten: 'đuôi s của số nhiều', nhom: 'Cuối từ', uuTien: 10, kiemDuoc: true,
    tuA: 'price', tuB: 'prize',
    am: 's', am2: 'z',
    viSao: 'Người Việt bỏ /s/ cuối gần như mọi lúc. Mất đuôi s là mất dấu số nhiều và mất chia động từ: "two books" thành "two book". Đuôi -s có ba cách đọc: /s/ sau âm không rung (books, cats), /z/ sau âm rung (dogs, eyes), /ɪz/ sau s, z, sh, ch, j (buses, watches). Tiếng Việt cũng không có /z/ ở cuối, nên "eyes" dễ thành "ice" — khác nghĩa hẳn.',
    cach: 'Đầu lưỡi nâng sát lợi (không chạm hẳn), hai hàm răng gần khít, hơi rít qua một rãnh nhỏ giữa lưỡi. /s/ là tiếng rắn kêu, /z/ là tiếng ong bay — đặt tay lên cổ, nói "s" rồi "z" thật dài, phải thấy khác. Riêng ở cuối từ, người bản xứ rung rất nhẹ — cái nghe ra rõ hơn là nguyên âm đứng trước /z/ được kéo dài: "eyes" dài hơn "ice". Tuyệt đối đừng bỏ tiếng rít cuối.',
    tu: ['books', 'cats', 'eyes', 'dogs'],
    cap: [['books', 'book', 'nhiều sách / một cuốn'], ['eyes', 'ice', 'đôi mắt / nước đá'], ['prize', 'price', 'giải thưởng / giá tiền']],
    kh: { luoiSau: .05, luoiCao: .5, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'loi', khe: 4 }, moi: 'trung',
    nhan1: '/s/ — không rung', kh2: { luoiSau: .05, luoiCao: .5, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: true, mui: false, chamO: 'loi', khe: 4 }, nhan2: '/z/ — cùng chỗ; nguyên âm trước dài hơn', moi2: 'trung' },

  { ipa: '/t/ /d/ cuối', ten: 'chặn rồi nhả, đừng nuốt', nhom: 'Cuối từ', uuTien: 10, kiemDuoc: true,
    tuA: 'hat', tuB: 'had',
    am: 't', am2: 'd', tac: true, kieu: 'cuoi',
    viSao: 'Tiếng Việt CÓ /t/ cuối nhưng ngậm luôn, nuốt hơi, nên người nghe tiếng Anh dễ không nhận ra có /t/. Nặng hơn: đuôi quá khứ -ed cũng chính là âm này (worked, played), nuốt mất là người nghe không biết chuyện xảy ra lúc nào.',
    cach: 'Chặn đầu lưỡi lên lợi sau răng trên (không phải lên răng), giữ một nhịp, rồi nhả nhẹ — một tiếng bật nhỏ, KHÔNG thêm "ơ" phía sau. Người bản xứ nói nhanh có khi không nhả, nhưng vẫn chặn gọn chứ không bao giờ bỏ hẳn. Ở cuối từ, /t/ với /d/ khác nhau chủ yếu ở nguyên âm đứng trước: "had" kéo dài hơn "hat".',
    tu: ['eat', 'night', 'played', 'made'],
    cap: [['write', 'ride', 'viết / cưỡi'], ['hat', 'had', 'cái mũ / đã có'], ['seat', 'sea', 'chỗ ngồi / biển']],
    kh: { luoiSau: .05, luoiCao: .3, dauLuoi: 1, moiTron: .2, hamMo: .2, rung: false, mui: false, chamO: 'loi' }, moi: 'trung',
    nhan1: '/t/ — chặn rồi nhả', kh2: { luoiSau: .05, luoiCao: .3, dauLuoi: 1, moiTron: .2, hamMo: .2, rung: true, mui: false, chamO: 'loi' }, nhan2: '/d/ — cùng chỗ; nguyên âm trước dài hơn', moi2: 'trung' },

  { ipa: '/k/ /g/ cuối', ten: 'back hay thành bag, hay mất hẳn', nhom: 'Cuối từ', uuTien: 7, kiemDuoc: true,
    tuA: 'back', tuB: 'bag',
    am: 'k', am2: 'g', tac: true, kieu: 'cuoi',
    viSao: 'Cuối từ, /k/ và /g/ hay bị nuốt mất hoặc lẫn vào nhau: "back" (lưng) nghe thành "bag" (cái túi), "pick" (chọn) thành "pig" (con heo). Tiếng Việt có "c" cuối (các, bác) nhưng ngậm luôn không nhả, nên tai người nghe tiếng Anh dễ không nhận ra.',
    cach: 'Nâng phần SAU của lưỡi lên chạm vòm mềm, chặn hơi lại rồi nhả nhẹ, không thêm "ơ". Đầu lưỡi không làm gì cả. Ở cuối từ, /k/ với /g/ khác nhau chủ yếu ở nguyên âm đứng trước: "bag" kéo dài hơn "back".',
    tu: ['back', 'work', 'bag', 'big'],
    cap: [['back', 'bag', 'lưng / cái túi'], ['pick', 'pig', 'chọn / con heo']],
    kh: { luoiSau: 1, luoiCao: 1, dauLuoi: 0, moiTron: .2, hamMo: .1, rung: false, mui: false, chamO: 'vom-mem' }, moi: 'trung',
    nhan1: '/k/ — sau lưỡi chặn rồi nhả', kh2: { luoiSau: 1, luoiCao: 1, dauLuoi: 0, moiTron: .2, hamMo: .1, rung: true, mui: false, chamO: 'vom-mem' }, nhan2: '/g/ — cùng chỗ; nguyên âm trước dài hơn', moi2: 'trung' },

  /* "life" thành "laip" là chuỗi không phải từ, máy nhận giọng sẽ tự nắn về "life" — nên phần nói thử
     dùng hai cặp TỪ THẬT có cùng lỗi: wife/wipe (f thành p) và safe/save (quên rung /v/). */
  { ipa: '/f/ /v/ cuối', ten: 'life hay thành laip', nhom: 'Cuối từ', uuTien: 6, kiemDuoc: true,
    tuA: 'wife', tuB: 'wipe',
    am: 'f', am2: 'p', sai2: true,
    viSao: 'Cuối từ, /f/ và /v/ hay bị đổi thành /p/ hoặc rơi mất: "life" thành "laip", "wife" (vợ) nghe ra "wipe" (lau chùi), "five" thành "fai". Quên rung cổ ở /v/ thì "save" (cứu) thành "safe" (an toàn).',
    cach: 'Cắn nhẹ môi DƯỚI vào hàm răng TRÊN rồi đẩy hơi qua khe đó. Môi tuyệt đối không khép kín lại như /p/. Lưỡi nằm yên, không tham gia. /v/ cuối thì cùng chỗ đó, và nguyên âm trước kéo dài hơn: "save" dài hơn "safe".',
    tu: ['life', 'five', 'safe', 'love'],
    cap: [['wife', 'wipe', 'vợ / lau chùi'], ['safe', 'save', 'an toàn / cứu']],
    kh: { luoiSau: .2, luoiCao: .25, dauLuoi: .1, moiTron: 0, hamMo: .15, rung: false, mui: false, chamO: 'rang' }, moi: 'trung',
    nhan1: '/f/ — môi dưới chạm răng', kh2: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: false, mui: false, chamO: 'moi' }, nhan2: 'thành /p/ — hai môi khép kín (sai)', moi2: 'trung' },

  /* ---- cụm phụ âm ---- */
  { ipa: 'cụm st- sp- sk-', ten: 'đừng bỏ chữ đầu', nhom: 'Cụm phụ âm', uuTien: 8, kiemDuoc: true,
    tuA: 'stop', tuB: 'top',
    am: ['s', 't'], am2: 't', sai2: true, tac: true,
    viSao: 'Gặp hai phụ âm dính nhau, người Việt gần như luôn bỏ phụ âm THỨ NHẤT — đo được 55 trên 56 trường hợp. "Stop" thành "top", "spin" thành "pin", và cả hai đều là từ có thật nên người nghe hiểu sang nghĩa khác.',
    cach: 'Giữ âm /s/ cho kêu rõ trước đã, rồi mới sang phụ âm sau. Đừng chèn nguyên âm vào giữa — "sờ-top" cũng sai, vì nó đẻ ra hai âm tiết.',
    tu: ['stop', 'spin', 'sky', 'street'],
    cap: [['stop', 'top', 'dừng / đỉnh'], ['spin', 'pin', 'quay / cái ghim'], ['school', 'cool', 'trường học / mát']],
    kh: { luoiSau: .05, luoiCao: .55, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'loi' }, moi: 'det' },

  { ipa: 'cụm -st -nd -ld', ten: 'hai phụ âm cuối', nhom: 'Cụm phụ âm', uuTien: 7, kiemDuoc: true,
    tuA: 'cold', tuB: 'coal',
    am: ['l-toi', 'd'], am2: 'l-toi', sai2: true, tac: true,
    viSao: 'Nhóm lì nhất, vẫn hỏng sau nhiều tuần luyện. Tiếng Việt không bao giờ có hai phụ âm cuối liền nhau nên miệng chưa từng phải làm việc đó.',
    cach: 'Làm chậm lại: phát đủ âm thứ nhất rồi mới sang âm thứ hai. Thà chậm mà đủ còn hơn nhanh mà mất. Nói chậm lại là cách rẻ nhất để người nghe hiểu bạn.',
    tu: ['cold', 'find', 'last', 'hand'],
    cap: [['cold', 'coal', 'lạnh / than'], ['find', 'fine', 'tìm / ổn']],
    kh: { luoiSau: .1, luoiCao: .4, dauLuoi: 1, moiTron: .2, hamMo: .2, rung: true, mui: false, chamO: 'loi' }, moi: 'trung' },

  /* ---- phụ âm đầu hay lẫn ---- */
  { ipa: '/p/ và /b/', ten: 'pat hay thành bat', nhom: 'Phụ âm đầu', uuTien: 9, kiemDuoc: true,
    tuA: 'pat', tuB: 'bat',
    am: 'p', am2: 'b', tac: true,
    viSao: 'Tiếng Việt không có /p/ ở ĐẦU từ, nên nó hay trượt thành /b/ — có ghi nhận "people" đọc thành "bi-bồ". Đây là cặp đứng đầu bảng những lẫn lộn làm hỏng nghĩa nhiều nhất.',
    cach: 'Hai môi khép kín, dồn hơi, rồi bật ra. /p/ phải có một luồng hơi PHỤT mạnh và cổ họng không rung. Tự kiểm: để tờ giấy trước miệng, nói "pat" thì giấy bay, nói "bat" thì giấy đứng yên.',
    tu: ['pat', 'pie', 'people', 'pull'],
    cap: [['pat', 'bat', 'vỗ nhẹ / con dơi'], ['pie', 'buy', 'bánh nướng / mua']],
    kh: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: false, mui: false, chamO: 'moi' }, moi: 'trung',
    nhan1: '/p/ — không rung, phụt hơi', kh2: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: true, mui: false, chamO: 'moi' }, nhan2: '/b/ — cùng chỗ, có rung', moi2: 'trung' },

  { ipa: '/p/ và /f/', ten: 'funny hay thành punny', nhom: 'Phụ âm đầu', uuTien: 8, kiemDuoc: true,
    tuA: 'pat', tuB: 'fat',
    am: 'p', am2: 'f', tac: true,
    viSao: 'Người Việt hay đọc "funny", "famous" bằng âm /p/. Cặp này đứng thứ hai trong bảng những lẫn lộn làm hỏng nghĩa.',
    cach: '/f/ thì răng trên chạm môi dưới và hơi xì ra LIÊN TỤC kéo dài được; /p/ thì hai môi khép kín rồi bật ra một cái, không kéo dài được. Thử ngân dài: ngân được là /f/.',
    tu: ['fat', 'full', 'funny', 'famous'],
    cap: [['fat', 'pat', 'béo / vỗ nhẹ'], ['full', 'pull', 'đầy / kéo']],
    kh: { luoiSau: .2, luoiCao: .2, dauLuoi: .1, moiTron: 0, hamMo: 0, rung: false, mui: false, chamO: 'moi' }, moi: 'trung',
    nhan1: '/p/ — hai môi khép kín rồi bật một cái', kh2: { luoiSau: .2, luoiCao: .3, dauLuoi: .1, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'rang' }, nhan2: '/f/ — răng chạm môi, hơi xì kéo dài', moi2: 'trung' },

  { ipa: '/n/ và /l/', ten: 'night hay thành light', nhom: 'Phụ âm đầu', uuTien: 8, kiemDuoc: true,
    tuA: 'night', tuB: 'light',
    am: 'n', am2: 'l',
    viSao: 'Cặp lẫn lộn quen thuộc, nhất là với người miền Bắc vốn đã lẫn l/n trong tiếng Việt. Cả hai lỗi đều đẻ ra từ CÓ THẬT nên người nghe hiểu sang nghĩa khác chứ không đoán lại được.',
    cach: 'Lưỡi đặt cùng một chỗ cho cả hai — khác nhau ở chỗ hơi thoát ra: /n/ cho hơi ra đằng MŨI, /l/ cho hơi ra hai bên lưỡi. Tự kiểm: bịt mũi lại, kêu được là /l/, tắc tiếng là /n/.',
    tu: ['night', 'light', 'no', 'low'],
    cap: [['night', 'light', 'đêm / ánh sáng'], ['no', 'low', 'không / thấp']],
    kh: { luoiSau: .2, luoiCao: .4, dauLuoi: 1, moiTron: .2, hamMo: .2, rung: true, mui: true, chamO: 'loi' }, moi: 'trung',
    nhan1: '/n/ — hơi lên mũi', kh2: { luoiSau: .55, luoiCao: .45, dauLuoi: 1, moiTron: .2, hamMo: .25, rung: true, mui: false, chamO: 'loi' }, nhan2: '/l/ — hơi ra hai bên lưỡi', moi2: 'trung' },

  { ipa: '/r/', ten: 'r kiểu Anh Mỹ', nhom: 'Phụ âm đầu', uuTien: 8, kiemDuoc: true,
    tuA: 'right', tuB: 'light',
    am: 'r', am2: 'l',
    viSao: 'Chữ "r" tiếng Việt khác hẳn: miền Bắc đọc thành "z" (rice thành "zai"), miền Nam rung đầu lưỡi. /r/ tiếng Anh thì đầu lưỡi KHÔNG chạm vào đâu cả. Đọc sai thì "right" nghe ra "light".',
    cach: 'Chu môi ra một chút như sắp huýt sáo. Đầu lưỡi KHÔNG chạm vào đâu cả, thân lưỡi gồng nhẹ và kéo lùi về phía cổ. Tuyệt đối không rung đầu lưỡi như "r" tiếng Việt.',
    luuY: 'Người bản ngữ có tới tám kiểu đặt lưỡi khác nhau cho âm này — kiểu cuộn đầu lưỡi và kiểu gồ thân lưỡi nghe gần như y hệt nhau. Hình dưới vẽ một kiểu; bạn làm kiểu khác mà ra đúng tiếng thì vẫn đúng. Cái phải đúng là đầu lưỡi không chạm và tiếng nghe trầm xuống.',
    tu: ['red', 'rice', 'room', 'right'],
    cap: [['right', 'light', 'đúng / ánh sáng'], ['grass', 'glass', 'cỏ / ly thuỷ tinh']],
    kh: { luoiSau: .7, luoiCao: .65, dauLuoi: .7, moiTron: .75, hamMo: .3, rung: true, mui: false, chamO: 'khong' }, moi: 'tron',
    nhan1: '/r/ — đầu lưỡi lơ lửng, không chạm', kh2: { luoiSau: .55, luoiCao: .45, dauLuoi: 1, moiTron: .2, hamMo: .25, rung: true, mui: false, chamO: 'loi' }, nhan2: '/l/ — đầu lưỡi chạm hẳn vào lợi', moi2: 'trung' },

  { ipa: '/v/ và /w/', ten: 'vine hay thành wine', nhom: 'Phụ âm đầu', uuTien: 7, kiemDuoc: true,
    tuA: 'vine', tuB: 'wine',
    am: 'v', am2: 'w',
    viSao: 'Chữ "v" giọng Bắc khá gần /v/ tiếng Anh, nhưng giọng Nam hay đọc thành "d/gi" (very thành "gia-ry"). Quên bật giọng thì /v/ thành /f/: "save" nghe ra "safe", nghĩa ngược nhau.',
    cach: '/v/ thì răng trên cắn nhẹ môi dưới, rung cổ họng, hơi rít qua kẽ răng. /w/ thì răng KHÔNG chạm gì cả, hai môi chu tròn lại rồi mở ra.',
    tu: ['very', 'vote', 'five', 'love'],
    cap: [['vine', 'wine', 'cây nho / rượu vang'], ['vest', 'west', 'áo gi-lê / phía tây'], ['save', 'safe', 'cứu / an toàn']],
    kh: { luoiSau: .2, luoiCao: .25, dauLuoi: .1, moiTron: 0, hamMo: .15, rung: true, mui: false, chamO: 'rang' }, moi: 'trung',
    nhan1: '/v/ — răng chạm môi dưới', kh2: { luoiSau: .85, luoiCao: .6, dauLuoi: .05, moiTron: 1, hamMo: .2, rung: true, mui: false, chamO: 'khong' }, nhan2: '/w/ — môi chu, răng không chạm', moi2: 'tron' },

  { ipa: '/ʃ/', ten: 'sh trong she', nhom: 'Phụ âm đầu', uuTien: 6, kiemDuoc: true,
    tuA: 'she', tuB: 'see',
    am: 'sh', am2: 's', sai2: true,
    viSao: 'Nhiều vùng tiếng Việt không phân biệt s/x nên "she" thành "see", "ship" thành "sip" — đều ra từ có thật, nghĩa đổi hẳn. Máy nhận giọng nói cũng nhầm y như người nghe.',
    cach: 'Kéo lưỡi lùi lại một chút so với /s/, nâng phần giữa lưỡi lên gần vòm. Chu môi ra. Tiếng nghe trầm và dày như khi bảo ai đó im lặng: "suỵt".',
    tu: ['she', 'ship', 'wash', 'fish'],
    cap: [['she', 'see', 'cô ấy / nhìn'], ['sheet', 'seat', 'tờ giấy / chỗ ngồi'], ['shoe', 'sue', 'chiếc giày / kiện ra toà']],
    kh: { luoiSau: .4, luoiCao: .72, dauLuoi: .6, moiTron: .75, hamMo: .2, rung: false, mui: false, chamO: 'sau-loi' }, moi: 'tron',
    nhan1: '/ʃ/ — lưỡi lùi sau, môi chu', kh2: { luoiSau: .05, luoiCao: .5, dauLuoi: .85, moiTron: 0, hamMo: .18, rung: false, mui: false, chamO: 'loi' }, nhan2: '/s/ — lưỡi sát lợi, môi bẹt', moi2: 'det' },

  { ipa: '/θ/ /ð/', ten: 'hai âm "th"', nhom: 'Phụ âm đầu', uuTien: 4, kiemDuoc: true,
    tuA: 'think', tuB: 'this',
    am: 'th', am2: 'dh',
    viSao: 'Người học sợ âm này nhất, nhưng nó lại ÍT làm hỏng nghĩa nhất — "think" đọc thành "tink" thì người nghe vẫn hiểu. Sửa phụ âm cuối có lợi hơn nhiều. Để đây vì bạn sẽ đi tìm, không phải vì nó gấp.',
    cach: 'Thè nhẹ đầu lưỡi ra, kẹp hờ giữa hai hàm răng, thổi hơi qua khe đó. Soi gương phải THẤY đầu lưỡi. /θ/ (think) không rung cổ họng; /ð/ (this) thì rung, hơi ra ít hơn, tiếng trầm và mượt hơn.',
    luuY: 'Một sự thật ít ai nói: /θ/ và /f/ gần như KHÔNG thể phân biệt bằng tai. Thí nghiệm kinh điển năm 1961 dựng đúng hai âm này rồi cho người bản ngữ nghe, họ cũng không tách được; ngay cả với giọng người thật, /θ/ chỉ được nhận đúng khoảng 58 đến 72 phần trăm. Đó là lý do "three" và "free" lẫn nhau với cả người Anh Mỹ. Nên với âm này, cái đáng tin là NHÌN — soi gương thấy đầu lưỡi thò ra hay không — chứ không phải nghe.',
    tu: ['think', 'three', 'this', 'mother'],
    cap: [['think', 'sink', 'nghĩ / chìm'], ['three', 'tree', 'số ba / cái cây'], ['they', 'day', 'họ / ngày']],
    kh: { luoiSau: .2, luoiCao: .45, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: false, mui: false, chamO: 'rang' }, moi: 'trung',
    nhan1: '/θ/ — think, không rung', kh2: { luoiSau: .2, luoiCao: .45, dauLuoi: 1, moiTron: 0, hamMo: .2, rung: true, mui: false, chamO: 'rang' }, nhan2: '/ð/ — this, có rung', moi2: 'trung' },

  /* ---- nguyên âm: có ích, nhưng ít cấp hơn phụ âm ---- */
  { ipa: '/ə/', ten: 'âm ơ nhẹ, schwa', nhom: 'Nguyên âm', uuTien: 6, kiemDuoc: false, bieu: 'ə',
    tuA: 'about',
    am: 'uh',
    viSao: 'Âm hay gặp nhất trong tiếng Anh, nằm ở mọi âm tiết KHÔNG có trọng âm. Người Việt đọc rõ đều từng chữ nên câu nghe cứng và sai nhịp. Máy không kiểm được vì nó nằm chìm trong từ, không đứng riêng để đo.',
    cach: 'Thả lỏng hoàn toàn: không kéo môi, không chu môi, lưỡi nằm giữa, hàm hé nhẹ. Âm rất ngắn và mờ, nghe như đang lười nói.',
    tu: ['about', 'banana', 'teacher', 'problem'],
    cap: [],
    kh: { luoiSau: .45, luoiCao: .45, dauLuoi: .1, moiTron: .4, hamMo: .4, rung: true, mui: false, chamO: 'khong' }, moi: 'trung' },

  { ipa: '/iː/ và /ɪ/', ten: 'sheep hay ship', nhom: 'Nguyên âm', uuTien: 5, kiemDuoc: true, bieu: 'iː',
    tuA: 'sheep', tuB: 'ship',
    am: 'ii', am2: 'i',
    viSao: 'Cặp nguyên âm người Việt lẫn nhiều nhất. Chúng khác nhau ở VỊ TRÍ LƯỠI chứ không chỉ ở chỗ dài hay ngắn — nên kéo dài âm i tiếng Việt ra vẫn không thành /iː/.',
    cach: '/iː/: cười nhẹ, kéo hai khoé môi sang ngang, lưỡi đẩy lên cao và ra trước gần chạm vòm. /ɪ/: bắt đầu như /iː/ rồi thả lỏng hết — hạ lưỡi xuống, lùi vào, môi buông ra không cười, âm rất ngắn.',
    tu: ['sheep', 'ship', 'feet', 'fit'],
    cap: [['sheep', 'ship', 'con cừu / con tàu'], ['feet', 'fit', 'bàn chân / vừa vặn'], ['cheap', 'chip', 'rẻ / miếng khoai chiên']],
    kh: { luoiSau: .05, luoiCao: .95, dauLuoi: .2, moiTron: 0, hamMo: .15, rung: true, mui: false, chamO: 'khong' }, moi: 'det',
    nhan1: '/iː/ — lưỡi cao và ra trước', kh2: { luoiSau: .25, luoiCao: .72, dauLuoi: .15, moiTron: .35, hamMo: .3, rung: true, mui: false, chamO: 'khong' }, nhan2: '/ɪ/ — thả lỏng, hạ và lùi', moi2: 'trung' },

  { ipa: '/æ/', ten: 'a bẹt, cat', nhom: 'Nguyên âm', uuTien: 4, kiemDuoc: true, bieu: 'æ',
    tuA: 'cat',
    am: 'ae',
    viSao: 'Hay bị đọc thành "e". "Bad" thành "bed", "man" thành "men" — đổi nghĩa hẳn.',
    cach: 'Mở hàm to hẳn ra, lưỡi ở phía trước nhưng hạ thấp xuống. Miệng bẹt sang hai bên, nghe như đang giữa "a" và "e".',
    tu: ['cat', 'bad', 'apple', 'man'],
    cap: [['bad', 'bed', 'tệ / cái giường'], ['man', 'men', 'đàn ông / nhiều đàn ông']],
    kh: { luoiSau: .15, luoiCao: .05, dauLuoi: .05, moiTron: 0, hamMo: 1, rung: true, mui: false, chamO: 'khong' }, moi: 'mo' },
];

/* Âm nào đo được bằng âm học ngay trên máy, và bằng từ nào. CHỈ dùng những từ đã hiệu chỉnh trên
   tám giọng mẫu trong scripts/test-dophatam.js — từ khác thì ngưỡng chưa được kiểm. */
const DO_AM = {
  '/s/ /z/ cuối': { kieu: 'duoiS', tu: ['books', 'cats'] },     // chỉ từ đuôi /s/: máy đo này không tách được /s/ với /z/
  '/t/ /d/ cuối': { kieu: 'bat', tu: ['seat', 'night', 'made'] },
  '/k/ /g/ cuối': { kieu: 'bat', tu: ['back', 'like', 'week'] },
  'cụm st- sp- sk-': { kieu: 'cumS', tu: ['stop', 'spin', 'school', 'star'] },
  '/ʃ/': { kieu: 'xuyt', cap: [['she', 'see'], ['ship', 'sip'], ['sheet', 'seat'], ['shoe', 'sue']] },
  '/p/ và /b/': { kieu: 'vot', cap: [['pat', 'bat'], ['pie', 'buy'], ['pea', 'bee'], ['pack', 'back']] },
  '/iː/ và /ɪ/': { kieu: 'doDai', cap: [['sheep', 'ship'], ['feet', 'fit'], ['cheap', 'chip'], ['seat', 'sit'], ['leave', 'live']] },
};
for (const a of AM) if (DO_AM[a.ipa]) a.do = DO_AM[a.ipa];

const TA_DO = {
  duoiS: 'Nói một từ. Máy nghe xem cuối từ có tiếng rít /s/ không, và dài bao lâu. Máy đo này không tách được /s/ với /z/ — chỗ đó nhờ tai ở bước 2 và phần nói thử ở trên.',
  bat: 'Nói một từ. Máy nghe xem âm cuối có được NHẢ ra (một tiếng bật nhỏ) hay bị ngậm mất.',
  cumS: 'Nói một từ. Máy nghe xem có /s/ ở đầu không, và có chen âm "ơ" vào giữa không ("sờ-top").',
  xuyt: 'Nói lần lượt hai từ. Máy so tiếng rít của hai từ: "sh" phải trầm hơn "s" rõ rệt.',
  vot: 'Nói lần lượt hai từ. Máy đo luồng hơi bật ra sau "p" — tiếng Anh cần một luồng hơi rõ, "b" thì không.',
  doDai: 'Nói lần lượt hai từ. Máy so độ dài nguyên âm: từ thứ nhất phải dài hơn rõ.',
};

const NHOM = ['Cuối từ', 'Cụm phụ âm', 'Phụ âm đầu', 'Nguyên âm'];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let tam, oTrong, am = null, capDang = null, luot = [], mayNghe = null, dangNghe = false, docBat = true;
let daBaoGui = false;   // câu báo "giọng bạn được gửi đi" chỉ hiện trước lần bấm micro đầu tiên mỗi buổi
/* phần máy đo: từ đang chọn, các lần đã đo (chỉ trong buổi này, không lưu), bước của phép so hai từ */
let doTu = 0, doLuot = [], doBuoc = 0, doMau1 = null, doKq = null, dangThu = false, mauGia = [], doTieng = null;

/* iPhone đã cài lên màn hình chính thì WebKit không cho dùng micro — không phải lỗi người dùng. */
const IOS_CAI = !!(self.navigator && self.navigator.standalone);
const coNghe = () => !IOS_CAI && !!(self.SpeechRecognition || self.webkitSpeechRecognition);

/* ---- đọc một từ ----
   Đọc bằng BẢN THU NGƯỜI THẬT (assets/tunguoi.js — bản thu trên Wiktionary, mỗi từ 1–3 giọng).
   Người dùng đã chê máy đọc ba lần ("khó nghe", "đâu phải người đọc"), và máy đọc trên mỗi máy
   mỗi khác: Mac có Samantha, máy Windows cũ chỉ có giọng rè. Bản thu thì ai nghe cũng như nhau.
   Máy đọc chỉ còn là đường lùi: khi mất mạng mà từ đó chưa nghe lần nào nên chưa có sẵn trong máy.

   Phần máy đọc dưới đây có hai chuyện phải lo:
   1. Trên máy Mac có 30 giọng en-US thì 13 giọng là TRÒ ĐÙA — Bells, Boing, Bubbles, Zarvox...
      Bản trước tôi lấy bừa "giọng en-US đầu tiên gặp", máy này may nên ra Samantha, máy khác
      rơi vào Bubbles là cả bài học thành tiếng ục ục.
   2. Lấy được NHIỀU giọng thì bài luyện tai mới đổi giọng được, để người học nghe ra cái chung
      giữa các giọng chứ không nhớ thuộc một mẫu. */
const GIONG_DUA = /bad news|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|bahh|deranged|hysterical|pipe|albert|fred|junior|kathy|princess|ralph|agnes|bruce|vicki|victoria/i;
const GIONG_TOT = /samantha|^alex$|ava|allison|susan|zoe|evan|nathan|joelle|google us english|aria|jenny|guy|michelle|steffan/i;
let dsGiong = [];

function timGiong() {
  if (!self.speechSynthesis) return;
  const ds = speechSynthesis.getVoices() || [];
  const sach = (v) => !GIONG_DUA.test(v.name);
  const my = ds.filter(v => /^en[-_]us/i.test(v.lang) && sach(v));
  const anh = ds.filter(v => /^en/i.test(v.lang) && sach(v));
  const xep = [
    ...my.filter(v => GIONG_TOT.test(v.name)),
    ...anh.filter(v => GIONG_TOT.test(v.name)),
    ...my, ...anh,
  ];
  const da = new Set();
  dsGiong = xep.filter(v => !da.has(v.name) && da.add(v.name)).slice(0, 5);
}
if (self.speechSynthesis) { timGiong(); speechSynthesis.addEventListener('voiceschanged', timGiong); }

/* iGiong xoay vòng qua các bản thu của từ đó — bài luyện tai cần nhiều giọng để người học nghe
   ra cái âm chung chứ không nhớ thuộc một mẫu. nut: nút vừa bấm, sáng lên lúc đang kêu. */
function doc(chu, cham, iGiong, nut) {
  if (!docBat || !chu) return;
  const ds = banThu(chu);
  if (ds && ds.length && moLoa()) {
    const b = ds[((iGiong | 0) % ds.length + ds.length) % ds.length];
    phatChuoi([b.f], nut, () => docMay(chu, cham, iGiong));
    return;
  }
  docMay(chu, cham, iGiong);
}
/* Các bản thu của một từ, theo thứ tự sẽ phát. Từ nào Anh và Mỹ đọc KHÁC nhau (hot, car, go...) thì
   giọng Anh lên trước: bảng 44 âm dùng ký hiệu Anh-Anh, và phiên âm dưới nút in giọng Anh trước. Nếu
   giọng Mỹ lên trước thì "car rồi hot" ra cùng một nguyên âm /ɑː/, nút so hai âm thành vô nghĩa. */
function banThu(chu) {
  const TN = self.TDTD_TUNGUOI, ds = TN ? TN.tim(chu) : null;
  if (!ds || !ds.length) return ds;
  const p = TN.ipa(chu);
  if (!p || p[0] === p[1]) return ds;
  const hang = { 'Anh': 0, 'Úc': 1 };
  const h = (g) => (hang[g] !== undefined ? hang[g] : 2);
  return ds.slice().sort((a, b) => h(a.giong) - h(b.giong));
}

/* Cặp từ: lấy bản thu của CÙNG MỘT NGƯỜI cho cả hai từ. Khác người thì tai bắt cái khác giọng chứ
   không bắt cái khác âm — và bài luyện tai còn lộ đáp án: bản trước "ship" lúc nào cũng giọng Mỹ,
   "sip" lúc nào cũng giọng Anh, nghe giọng là chọn đúng 8/8 mà không cần phân biệt /ʃ/ với /s/. */
function chungNguoi(a, b) {
  const A = banThu(a), B = banThu(b);
  if (!A || !B) return [];
  return A.map(x => [x, B.find(y => y.nguoi === x.nguoi)]).filter(p => p[1]);
}
/* Đọc từ thứ `ben` (0 hoặc 1) của một cặp, người đọc thứ `i` trong số người đọc chung.
   Không có người đọc chung thì dùng CÙNG một giọng máy cho cả hai từ — giọng không được lộ đáp án. */
function docCap(cap, ben, i, nut, cham) {
  const ds = chungNguoi(cap[0], cap[1]);
  if (ds.length && moLoa()) {
    const p = ds[((i | 0) % ds.length + ds.length) % ds.length];
    phatChuoi([p[ben].f], nut, () => docMay(cap[ben], cham, i));
    return;
  }
  if (self.speechSynthesis) docMay(cap[ben], cham, i);
  else doc(cap[ben], cham, i, nut);
}

/* Phiên âm quốc tế dưới mỗi từ. Anh-Anh đứng trước, vì bảng 44 âm dùng ký hiệu Anh-Anh;
   Anh-Mỹ chỉ ghi thêm khi khác (hot /hɒt/ · Mỹ /hɑːt/). Tiếng đọc có cả hai giọng, nên phải
   cho người học biết giọng Mỹ khác ở đâu, không thì nghe một đằng nhìn một nẻo. */
function phienAmCap(c) {
  const TN = self.TDTD_TUNGUOI, a = TN && TN.ipa(c[0]), b = TN && TN.ipa(c[1]);
  return a && b ? `<i class="pa-pa">${esc(a[0])} · ${esc(b[0])}</i>` : '';
}
function phienAm(tu, gon) {
  const TN = self.TDTD_TUNGUOI, p = TN && TN.ipa(tu);
  if (!p) return '';
  const my = p[1] && p[1] !== p[0] ? p[1] : '';
  return `<i class="pa-pa">${esc(p[0])}${my ? (gon ? ` · ${esc(my)}` : `<span> · Mỹ ${esc(my)}</span>`) : ''}</i>`;
}
function docMay(chu, cham, iGiong) {
  if (!self.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(chu);
    u.lang = 'en-US'; u.rate = cham ? .62 : .82;
    const g = dsGiong.length ? dsGiong[((iGiong | 0) % dsGiong.length + dsGiong.length) % dsGiong.length] : null;
    if (g) { u.voice = g; if (g.lang) u.lang = g.lang; }
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
  am = null; amLe = null; quayVe = null; capDang = null; thoiNghe(); thoiHinh(); roiMan();
  const AN = self.TDTD_AMNGUOI;
  oTrong.innerHTML = `
    <div class="pa-man">
      <p class="pa-tua">Luyện phát âm</p>
      <p class="pa-phu">Nghe người thật đọc từng âm, nói theo, rồi sửa những lỗi người Việt hay mắc.</p>
      <button class="pa-the pa-nt-vao" type="button">
        <span class="pa-ipa">●</span>
        <span class="pa-the-chu"><b>Nói thử: máy nghe ra chữ gì?</b>
          <i>Nói một từ hay một câu tiếng Anh, máy ghi ra chữ nó nghe được — như một người nghe không quen giọng bạn.</i></span>
      </button>
      ${AN ? `
      <p class="pa-muc">Bảng ${AN.DS.length} âm tiếng Anh</p>
      <p class="pa-phu pa-trai">Bấm một âm để học theo từng bước, y như các bài sửa lỗi bên dưới: nghe người thật đọc,
        luyện tai, xem miệng đặt thế nào, nghe so với âm hay lẫn, rồi nói thử.</p>
      ${AN.NHOM.map(([k, ten]) => { const ds = AN.DS.filter(x => x.nhom === k); return ds.length ? `
        <p class="pa-nhom">${esc(ten)} · ${ds.length}</p>
        <div class="pa-bang">${ds.map(x =>
          `<button class="pa-am-o" data-ma="${esc(x.ma)}" aria-label="Âm /${esc(x.ipa)}/, như trong ${esc(x.vd[0].tu)}">
            <b>${esc(x.ipa)}</b><i>${esc(x.vd[0].tu)}</i></button>`).join('')}</div>` : ''; }).join('')}
      <button class="pa-phu-nut pa-nguon-nut" type="button">Nguồn tiếng đọc và giấy phép</button>
      <p class="pa-muc">Sửa lỗi người Việt hay gặp</p>
      <p class="pa-phu pa-trai">Mỗi bài có hình miệng, bài luyện tai và phần nói thử. Chọn lỗi nào bạn hay mắc nhất mà sửa trước.</p>` : ''}
      ${NHOM.map(n => `
        <p class="pa-nhom">${esc(n)}</p>
        <div class="pa-ds">
          ${AM.map((a, i) => a.nhom !== n ? '' : `
            <button class="pa-the" data-i="${i}">
              <span class="pa-ipa">${esc(a.ipa)}</span>
              <span class="pa-the-chu"><b>${esc(a.ten)}</b><i>${esc(a.viSao.split('.')[0])}.</i>
                ${a.do ? '<span class="pa-do-nhan">có máy đo âm</span>' : ''}</span>
              <span class="pa-sao" title="mức quan trọng">${'●'.repeat(Math.round(a.uuTien / 3.4))}</span>
            </button>`).join('')}
        </div>`).join('')}
      <p class="pa-thua">Xếp theo mức đáng sửa trước, không theo mức khó. Phụ âm cuối đứng đầu vì sai ở đó là
        người nghe hiểu sai nghĩa; hai âm "th" xuống cuối vì sai ở đó người ta vẫn hiểu.</p>
    </div>`;
  oTrong.querySelectorAll('.pa-the').forEach(n => { n.onclick = () => moAm(AM[+n.dataset.i]); });
  oTrong.querySelectorAll('.pa-am-o').forEach(n => { n.onclick = () => veLe(n.dataset.ma); });
  const ng = oTrong.querySelector('.pa-nguon-nut');
  if (ng) ng.onclick = () => veNguon();
  oTrong.querySelector('.pa-nt-vao').onclick = () => veNoiTuDo();
}

/* ---- màn nói thử tự do ----
   Nói bất cứ gì, xem máy ghi ra chữ gì. Có sẵn vài cặp từ người Việt hay nói lẫn để thử cho nhanh. */
const CAP_THU = [['sheep', 'ship'], ['books', 'book'], ['eyes', 'ice'], ['tell', 'ten'], ['right', 'light'], ['vine', 'wine']];
function veNoiTuDo() {
  am = null; amLe = null; quayVe = null; thoiNghe(); thoiHinh(); roiMan();
  taoNoiThu('tudo', [], CAP_THU, '', '', true);
  oTrong.innerHTML = `<div class="pa-man">
    <div class="pa-dau"><button class="pa-quay" aria-label="Quay lại">‹</button><span class="pa-ten">Nói thử</span></div>
    ${veNoiThu()}
    <p class="pa-chu pa-nho">Muốn luyện kỹ một âm thì vào bảng 44 âm hoặc các bài sửa lỗi — mỗi chỗ đều có phần nói thử riêng.</p>
    <div class="pa-lai"><button class="pa-lui">← Danh sách</button></div>
  </div>`;
  oTrong.scrollTop = 0;
  oTrong.querySelector('.pa-quay').onclick = veDanhSach;
  oTrong.querySelector('.pa-lui').onclick = veDanhSach;
  ganNoiThu();
}

/* ---- màn ghi công: ai đọc, giấy phép gì, bản gốc ở đâu ----
   CC BY và CC BY-SA bắt phải ghi tên người thu, nguồn, giấy phép cho TỪNG file. Gom về một màn
   để các màn học không bị ngập trong chữ nhỏ. */
function veNguon() {
  const AN = self.TDTD_AMNGUOI, TN = self.TDTD_TUNGUOI;
  /* nhớ chỗ đang học để nút quay lại về đúng chỗ đó, không đá người ta về danh sách */
  const noiVe = am ? { a: am, b: buoc, qua: daQua, quay: quayVe } : null;
  am = null; amLe = null; thoiNghe(); thoiHinh(); roiMan();
  const dongAm = AN ? AN.DS.flatMap(x => (x.am || []).map(b => ({ chu: '/' + x.ipa + '/ — ' + b.nhan, b }))) : [];
  const dongTu = TN ? Object.keys(TN.TU).sort().flatMap(t => TN.TU[t].map(b => ({ chu: t + ' (' + b.giong + ')', b }))) : [];
  const hang = (d) => `<li><span>${esc(d.chu)}</span> — ${esc(d.b.tacGia)},
    ${d.b.nguon ? `<a href="${esc(d.b.nguon)}" target="_blank" rel="noopener">bản gốc</a>` : ''},
    ${(TN && TN.GIAY_PHEP_URL[d.b.giayPhep]) ? `<a href="${TN.GIAY_PHEP_URL[d.b.giayPhep]}" target="_blank" rel="noopener">${esc(d.b.giayPhep)}</a>` : esc(d.b.giayPhep)}</li>`;
  oTrong.innerHTML = `<div class="pa-man">
    <div class="pa-dau"><button class="pa-quay" aria-label="Quay lại">‹</button><span class="pa-ten">Nguồn tiếng đọc</span></div>
    <p class="pa-chu pa-nho">Mọi tiếng đọc trong phần luyện phát âm là bản thu NGƯỜI THẬT trên Wikimedia Commons,
      do người đóng góp cho Wiktionary, Lingua Libre và Wikimedia Commons thu. App đã cắt bớt khoảng lặng hai đầu,
      cân độ to cho đều, trộn về một kênh và đổi sang MP3. Mỗi file giữ giấy phép của bản gốc
      (bản gốc CC BY-SA thì bản đã sửa cũng CC BY-SA).</p>
    <p class="pa-nhom">Tiếng đọc từng âm · ${dongAm.length}</p><ul class="pa-nguon-ds">${dongAm.map(hang).join('')}</ul>
    <p class="pa-nhom">Tiếng đọc từ · ${dongTu.length}</p><ul class="pa-nguon-ds">${dongTu.map(hang).join('')}</ul>
    <div class="pa-lai"><button class="pa-lui">${noiVe ? '← Quay lại' : '← Danh sách'}</button></div>
  </div>`;
  oTrong.scrollTop = 0;
  const ve = () => {
    if (!noiVe) { veDanhSach(); return; }
    am = noiVe.a; amLe = am.le || null; buoc = noiVe.b; daQua = noiVe.qua; quayVe = noiVe.quay;
    veBuoc();
  };
  oTrong.querySelector('.pa-quay').onclick = ve;
  oTrong.querySelector('.pa-lui').onclick = ve;
}

/* ---- một âm trong bảng 44 âm ----
   Người dùng hỏi: "sao Bảng 44 âm lại khác so với Cuối từ, khi bấm vô học cách bố trí khác nhau hết".
   Đúng là vậy: bài sửa lỗi làm trước, dắt từng bước; màn 44 âm làm sau, thành một trang dài như tờ
   tra cứu — cùng là "học một âm" mà hai chỗ hai lối, khối giống nhau nằm chỗ khác nhau, có thứ chỉ
   một bên có. Giờ một âm của bảng được gói thành cùng dạng một bài sửa lỗi rồi đi CHUNG một lối từng
   bước (veBuoc): nghe → luyện tai → xem miệng → nghe so → nói. Chỉ nội dung khác (một âm thay vì một
   cặp lỗi); khung, thứ tự bước, hình khẩu hình và nút bấm thì như nhau. */
let amLe = null, tiengMinh = null, dangThuLe = false, quayVe = null, mauLe = null;
const luotVd = {};

function baiAm(x) {
  const AN = self.TDTD_AMNGUOI;
  /* Luyện tai chỉ lấy cặp tối thiểu khai báo sẵn (sheep/ship), và chỉ cặp có MỘT người đọc cả hai từ.
     Ghép bừa từ ví dụ của hai âm (cup/car) thì hai từ khác nhau đủ đường, chẳng cần tai nghe âm;
     hai người đọc thì giọng lộ đáp án. */
  const cap = Object.entries(x.soCap || {}).map(([m, c]) => {
    const y = AN.tim(m);
    return y && chungNguoi(c[0], c[1]).length ? [c[0], c[1], '/' + x.ipa + '/ · /' + y.ipa + '/'] : null;
  }).filter(Boolean);
  return { le: x, ipa: '/' + x.ipa + '/', ten: x.ten, nhom: x.nhom, cap, kiemDuoc: true,
           tu: x.vd.map(v => v.tu), kh: x.kh, kh2: x.kh2, tac: x.tac, cach: x.goiY };
}

/* ten: bước muốn mở. Bấm sang âm bên cạnh lúc đang xem miệng thì vẫn ở bước xem miệng — để so hai hình. */
function veLe(ma, ten) {
  const AN = self.TDTD_AMNGUOI, x = AN && AN.tim(ma);
  if (!x) { veDanhSach(); return; }
  if (am && !am.le) quayVe = { a: am, b: buoc, qua: daQua };   // vào từ một bài sửa lỗi thì nút quay lại về đúng bài đó
  moAm(baiAm(x), ten);
}

/* Cặp từ để so âm x với âm y: dùng cặp tối thiểu khai báo sẵn (sing/sin — cùng chỗ đứng trong từ) nếu
   có, không thì lấy từ ví dụ đầu của mỗi âm. Lấy bừa vd[0] thì "sing rồi no": ng ở cuối, n ở đầu,
   không luyện được đúng cái lỗi đang nói. */
function capSo(x, y) {
  return (x.soCap && x.soCap[y.ma]) || [x.vd[0].tu, y.vd[0].tu];
}

/* Mẫu để nói theo: tiếng chính cái âm (nếu có người thu), rồi các từ ví dụ, mỗi thứ một bản thu.
   Không lấy tiếng của vế SAI (/n/ trong bài /l/ cuối) — đó là cái cần tránh, không phải cái để bắt chước. */
function dsMau(a) {
  const ra = [], them = (f, nhan) => { if (f && !ra.some(m => m.f === f)) ra.push({ f, nhan }); };
  if (a.le) (a.le.am || []).forEach(b => them(b.f, b.nhan));
  else dsNguoi(a).filter(d => !d.laSai).forEach(({ x }) =>
    (x.am || []).filter(b => a.nhom !== 'Cuối từ' || /cuối/.test(b.phu || '')).forEach(b => them(b.f, b.nhan)));
  for (const t of [a.tuA].concat(a.tu)) { const ds = t && banThu(t); if (ds && ds.length) them(ds[0].f, t); }
  return ra.slice(0, 5);
}

/* Khung hình động cho một âm. Nguyên âm đôi: đi tới tư thế đầu, giữ một nhịp, LƯỚT sang tư thế
   cuối. Âm tắc xát (tʃ dʒ): chặn lại như /t/, rồi nhả ra thành tiếng xát như /ʃ/. */
function khungLe(x) {
  const K = self.TDTD_KHAUHINH, N = K.NGHI;
  const vs = (p, hoi) => Object.assign({}, p, { hoi });
  if (x.kh2 && x.tac) return [{ p: N, g: .4 }, { p: vs(x.kh, 0), g: .3 }, { p: vs(x.kh, 0), g: .18 },
    { p: vs(x.kh2, .9), g: .55 }, { p: vs(x.kh2, .9), g: .4 }, { p: N, g: .3 }];
  if (x.kh2) return [{ p: N, g: .4 }, { p: vs(x.kh, .5), g: .3 }, { p: vs(x.kh, .5), g: .55 },
    { p: vs(x.kh2, .5), g: .35 }, { p: vs(x.kh2, .5), g: .4 }, { p: N, g: .3 }];
  return khungHinh(x.kh, x.tac);
}

/* Khối "nói theo mẫu, nghe lại mình" — trước chỉ màn 44 âm có, giờ bước nói của mọi bài đều có. */
function veNoiTheo(a) {
  const coMic = !IOS_CAI && !!(self.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const mau = dsMau(a);
  if (!mau.some(m => m.f === mauLe)) mauLe = mau.length ? mau[0].f : null;
  return `<div class="pa-khoi pa-noi-theo">
    <p class="pa-nhan">Nói theo mẫu, nghe lại mình</p>
    ${mau.length ? `<div class="pa-nt-chon">${mau.map(m =>
      `<button class="pa-nt-tu${m.f === mauLe ? ' dang' : ''}" data-mau="${esc(m.f)}" type="button"><b>▶ ${esc(m.nhan)}</b></button>`).join('')}</div>` : ''}
    ${coMic ? `<p class="pa-chu pa-nho">Chọn một mẫu ở trên, bấm micro rồi nói theo. Máy phát mẫu rồi phát tiếng bạn ngay sau,
      để chính tai bạn so — nghe mình sát cạnh mẫu thì mới nghe ra mình lệch chỗ nào. Không có máy chấm ở đây.</p>
    <button class="pa-mic pa-le-thu">● Bấm rồi nói theo mẫu</button>
    <div class="pa-do-muc"><i></i></div>
    <div class="pa-le-so" hidden>
      <button class="pa-le-phat" data-phat="so">▶ Mẫu rồi tới bạn</button>
      <button class="pa-le-phat" data-phat="minh">▶ Chỉ tiếng bạn</button>
    </div>
    <p class="pa-chu pa-nho">Tiếng bạn chỉ nằm trong máy lúc này, không lưu, không gửi đi đâu.</p>` : `<p class="pa-chu pa-nho">${IOS_CAI
      ? 'iPhone khi mở từ biểu tượng ngoài màn hình chính thì không cho trang web dùng micro. Mở trang này trong Safari là thu được.'
      : 'Trình duyệt này không cho thu âm.'} Vẫn tập được: nghe mẫu, nói to theo, rồi nghe lại mẫu.</p>`}
    <p class="pa-le-bao" role="status"></p>
  </div>`;
}

async function thuLe() {
  if (dangThuLe) return;
  const a = am, the = phienMan;
  const nut = oTrong.querySelector('.pa-le-thu'), muc = oTrong.querySelector('.pa-noi-theo .pa-do-muc i');
  imLang();
  moLoa();                           // mở loa ngay trong cú chạm, lát nữa mới phát lại được trên iPhone
  dangThuLe = true;
  nut.classList.add('dang'); nut.textContent = 'Đang mở micro…';
  baoLe('');
  let kq = null, loi = null, moRoi = false;
  try { kq = await thuAm(v => { if (!moRoi) { moRoi = true; nut.textContent = 'Đang nghe… nói đi'; } if (muc) muc.style.width = Math.round(v * 100) + '%'; }, .9, 4); }
  catch (e) { loi = e; }
  dangThuLe = false;
  if (the !== phienMan || am !== a) return;       // đã rời màn này trong lúc thu
  nut.classList.remove('dang'); nut.textContent = '● Nói lại';
  if (muc) muc.style.width = '0';
  if (loi) {
    baoLe(loi && (loi.name === 'NotAllowedError' || loi.name === 'SecurityError')
      ? 'Trang này chưa được phép dùng micro. Cho phép trong phần cài đặt trang của trình duyệt rồi bấm lại.'
      : 'Máy này không mở được micro.');
    return;
  }
  const y = gonTieng(kq.x, kq.sr);
  if (!y || !ac) { baoLe('Chưa nghe thấy gì. Nói to hơn, hoặc để máy gần miệng hơn.'); return; }
  const b = ac.createBuffer(1, y.length, kq.sr);
  b.getChannelData(0).set(y);
  tiengMinh = b;
  oTrong.querySelector('.pa-le-so').hidden = false;
  if (mauLe) phatChuoi([mauLe, tiengMinh], oTrong.querySelector('[data-phat="so"]'));
}

/* ---- âm máy dựng ----
   Tiếng chính giờ là bản thu người thật (phần ngay dưới). Âm dựng bằng toán (assets/amvi.js) chỉ
   còn một chỗ dùng mà bản thu không thay được: phát cái âm SAI không phải từ. "Life" đọc thành
   "laip" thì máy đọc chịu, vì laip không phải từ, và cũng không ai thu sẵn nó; còn dựng thì được. */
let ac = null, kho = {};

/* iPhone đang gạt im lặng thì Web Audio câm hẳn, không báo gì — trong khi Nhạc ngủ (nhacngu.js) vẫn
   kêu vì nó xin phiên âm thanh kiểu "playback". Làm y như vậy ở đây. Lúc thu âm thì đổi sang
   "play-and-record" (xem thuAm), xong lại về "playback". */
function phienPhat() {
  try { const n = self.navigator; if (n && n.audioSession && !dangThuLe && !dangThu) n.audioSession.type = 'playback'; } catch (e) {}
}
function moLoa() {
  phienPhat();
  if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; }
  const AC = self.AudioContext || self.webkitAudioContext;
  if (!AC) return null;
  try {
    ac = new AC();
    const im = ac.createBufferSource();          // một mẫu lặng phát NGAY trong cú chạm: iPhone mới chịu mở tiếng
    im.buffer = ac.createBuffer(1, 1, 22050); im.connect(ac.destination); im.start(0);
  } catch (e) { return null; }
  return ac;
}

function layMau(ten, kieu, giong) {
  const khoa = ten + '|' + (kieu || '') + '|' + (giong || 0);
  if (kho[khoa]) return kho[khoa];
  const a = self.TDTD_AMVI.mau(ten, ac.sampleRate, kieu, giong || 0);
  if (!a) return null;
  const b = ac.createBuffer(1, a.length, ac.sampleRate);
  b.getChannelData(0).set(a);
  kho[khoa] = b;
  return b;
}

/* Phát một âm, hoặc một chuỗi âm nối nhau (dùng cho cụm phụ âm như st-). */
function phatAm(ten, kieu, muc, giong) {
  if (!moLoa()) return 0;
  const ds = [].concat(ten);
  let khi = ac.currentTime + .02, tong = 0;
  for (const t of ds) {
    const b = layMau(t, kieu, giong);
    if (!b) continue;
    const s = ac.createBufferSource(); s.buffer = b;
    const g = ac.createGain(); g.gain.value = muc === undefined ? .85 : muc;
    s.connect(g); g.connect(ac.destination);
    s.start(khi);
    const d = b.duration * (ds.length > 1 ? .72 : 1);   // trong cụm thì chồng lên nhau một chút
    khi += d; tong += d;
  }
  return tong;
}

/* ---- tiếng người thật: bản thu từng âm, xem assets/amnguoi.js ----
   Phát bằng Web Audio chứ không bằng thẻ <audio>, vì cần nối hai tiếng sát nhau: mẫu rồi tới
   tiếng bạn, /s/ rồi tới /z/. */
const khoNguoi = {};                     // đường dẫn → Promise<AudioBuffer>
let dangKeu = [], phienMan = 0, phatLan = 0, daPhat = [];

function taiNguoi(url) {
  if (!khoNguoi[url]) khoNguoi[url] = fetch(url).then(r => {
    /* Mất mạng mà file chưa từng tải thì sw.js trả về index.html với mã 200, r.ok vẫn là true.
       Phải soi loại nội dung, không thì đem một trang HTML đi giải mã thành tiếng. */
    if (!r.ok || /html/i.test(r.headers.get('content-type') || '')) throw new Error('khongTai');
    return r.arrayBuffer();
  }).then(b => new Promise((ok, loi) => ac.decodeAudioData(b, ok, loi)))
    .catch(e => { delete khoNguoi[url]; throw e; });
  return khoNguoi[url];
}

function imLang() {
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
  for (const s of dangKeu) { try { s.stop(); } catch (e) {} }
  dangKeu = [];
  if (oTrong) oTrong.querySelectorAll('.keu').forEach(n => n.classList.remove('keu'));
}
/* Rời một màn: tắt tiếng đang kêu, và mọi việc đang chờ (tải tiếng, thu âm) của màn cũ tự bỏ. */
function roiMan() {
  phienMan++; imLang();
  try { if (mayNghe) mayNghe.abort(); } catch (e) {}
  if (huyThu) huyThu();             // đang thu dở mà rời màn: tắt micro luôn, đừng để nó chạy nốt 4 giây
  dangThuLe = false;
}

function baoLe(chu) {
  const n = oTrong && oTrong.querySelector('.pa-le-bao');
  if (n) n.textContent = chu;
}

/* Phát liền một chuỗi: mỗi phần là đường dẫn file hoặc một AudioBuffer (tiếng bạn vừa thu),
   nghỉ 0,4 giây giữa hai phần. nut: nút vừa bấm, sáng lên trong lúc kêu. khiLoi: tải không được
   thì gọi cái này thay vì báo lỗi (đọc từ thì lùi về máy đọc). */
async function phatChuoi(ds, nut, khiLoi) {
  if (!moLoa()) { baoLe('Trình duyệt này không phát được tiếng.'); return 0; }
  imLang();
  const the = phienMan, lan = ++phatLan;
  daPhat.push(ds.map(x => typeof x === 'string' ? x : 'tieng-ban'));
  baoLe('');
  let bufs;
  try { bufs = await Promise.all(ds.map(x => typeof x === 'string' ? taiNguoi(x) : x)); }
  catch (e) {
    if (the !== phienMan || lan !== phatLan) return 0;
    if (khiLoi) khiLoi();
    else baoLe('Chưa tải được tiếng đọc. Máy đang mất mạng, và âm này chưa nghe lần nào nên chưa có sẵn trong máy.');
    return 0;
  }
  if (the !== phienMan || lan !== phatLan) return 0;   // đã rời màn, hoặc đã bấm nút khác lúc chờ tải
  let khi = ac.currentTime + .03;
  for (const b of bufs) {
    const s = ac.createBufferSource(); s.buffer = b;
    const g = ac.createGain(); g.gain.value = .9;
    s.connect(g); g.connect(ac.destination);
    s.start(khi); dangKeu.push(s);
    khi += b.duration + .4;
  }
  const tong = khi - .4 - ac.currentTime;
  if (nut) {
    nut.classList.add('keu');
    setTimeout(() => { if (lan === phatLan) nut.classList.remove('keu'); }, tong * 1000);
  }
  return tong;
}

/* Gọt tiếng bạn vừa thu: bỏ đoạn lặng ở đầu (micro dành 0,25 giây đầu để nghe tiếng ồn nền) và ở
   cuối, rồi nâng cho to ngang bản mẫu — so hai tiếng một to một nhỏ thì tai nghe ra độ to chứ không
   nghe ra âm. Trả về null khi không có gì đáng nghe. */
function gonTieng(x, sr) {
  const n = Math.round(sr * .02), m = Math.floor(x.length / n);
  if (m < 3) return null;
  const e = new Float32Array(m);
  for (let k = 0; k < m; k++) {
    let q = 0; for (let i = k * n; i < (k + 1) * n; i++) q += x[i] * x[i];
    e[k] = Math.sqrt(q / n);
  }
  const nen = Array.from(e).sort((a, b) => a - b)[Math.floor(m * .1)];   // ồn nền: khung êm thứ 10%
  let dinh = 0; for (let k = 0; k < m; k++) dinh = Math.max(dinh, e[k]);
  if (dinh < .004 || dinh < nen * 4) return null;
  const nguong = Math.max(nen * 3, dinh * .06);
  let dau = 0; while (dau < m && e[dau] < nguong) dau++;
  let cuoi = m - 1; while (cuoi > dau && e[cuoi] < nguong) cuoi--;
  const y = x.slice(Math.max(0, (dau - 3) * n), Math.min(x.length, (cuoi + 6) * n));
  let pk = 0; for (let i = 0; i < y.length; i++) pk = Math.max(pk, Math.abs(y[i]));
  const g = Math.min(.8 / pk, 20);
  const vuot = Math.min(Math.round(sr * .01), y.length >> 1);
  for (let i = 0; i < y.length; i++) {
    const w = i < vuot ? i / vuot : i >= y.length - vuot ? (y.length - 1 - i) / vuot : 1;
    y[i] *= g * w;
  }
  return y;
}

/* Những âm của một bài sửa lỗi có bản thu người thật. Âm của vế sai (am2 khi sai2) được đánh dấu
   để tô khác đi: /l/ cuối mà nói thành /n/ thì /n/ là cái cần nghe để tránh. */
function dsNguoi(a) {
  const AN = self.TDTD_AMNGUOI;
  if (!AN) return [];
  const ra = [], da = new Set();
  /* tu: từ minh hoạ khi âm không có bản thu đứng riêng. Lấy từ dưới hình của CHÍNH bài này (tell,
     had, prize...) chứ không lấy từ ví dụ chung của âm: bài "/t/ /d/ cuối" mà minh hoạ bằng "ten",
     "day" là đem âm ở ĐẦU từ ra dạy chuyện CUỐI từ. */
  const them = (ma, laSai, tu) => {
    const x = AN.tim(ma);
    if (x && !da.has(x.ma)) { da.add(x.ma); ra.push({ x, laSai, tu: tu || x.vd[0].tu }); }
  };
  [].concat(a.am || []).forEach(m => them(m, false, a.tuA));
  [].concat(a.am2 || []).forEach(m => them(m, !!a.sai2, a.tuB));
  return ra;
}


/* ---- hình động ----
   Cấu âm là một CHUYỂN ĐỘNG. Bài "/t/ cuối phải bật ra" dạy một sự kiện theo thời gian —
   hình đứng yên không nói được. Nên: đi từ miệng lúc nghỉ tới tư thế của âm, rồi với âm tắc
   thì NHẢ ra kèm một luồng hơi bật. */
let quay = null, chamLai = false;
const TOC = () => (chamLai ? .4 : 1);

function khungHinh(kh, tac, kieu) {
  const K = self.TDTD_KHAUHINH;
  const dich = Object.assign({}, kh);
  if (tac && kieu === 'cuoi') {
    /* Âm tắc CUỐI từ: miệng đang ở nguyên âm đứng trước, lưỡi chặn lại, giữ, rồi nhả NHẸ (hàm gần như
       không mở thêm). Bản trước dùng chung hình của âm tắc đầu từ: nhả bằng cách há hàm to như thêm
       "ơ" — đúng cái lỗi "hat-ơ" mà bài đang dặn tránh. */
    const nguyen = Object.assign({}, K.NGHI, { hamMo: .55, luoiCao: .3, hoi: .5 });
    const nha = Object.assign({}, dich, { chamO: 'khong', camDo: 0, hamMo: (dich.hamMo || 0) + .05, hoi: .8 });
    return [{ p: nguyen, g: .45 }, { p: Object.assign({}, dich, { hoi: 0 }), g: .35 }, { p: Object.assign({}, dich, { hoi: 0 }), g: .3 },
            { p: nha, g: .25 }, { p: Object.assign({}, nha, { hoi: .1 }), g: .55 }];
  }
  const mo = Object.assign({}, K.NGHI, { hamMo: .5, luoiCao: .25, hoi: 1 });
  return tac
    ? [{ p: K.NGHI, g: .45 },                                  // miệng nghỉ
       { p: Object.assign({}, dich, { hoi: 0 }), g: .4 },      // đưa lưỡi tới, chặn lại
       { p: Object.assign({}, dich, { hoi: 0 }), g: .35 },     // ngậm hơi
       { p: mo, g: .3 },                                       // NHẢ — hơi bật ra
       { p: Object.assign({}, K.NGHI, { hoi: .15 }), g: .5 }]
    : [{ p: K.NGHI, g: .45 },
       { p: Object.assign({}, dich, { hoi: .9 }), g: 1.5 },    // giữ, hơi thoát đều
       { p: K.NGHI, g: .45 }];
}

function chayHinh(svgs, khung) {
  const K = self.TDTD_KHAUHINH;
  const ds = [].concat(svgs).filter(Boolean);
  if (!ds.length || !K || !khung.length) return;
  const svg = ds[0];
  const tong = khung.reduce((s, k) => s + k.g, 0);
  let t0 = null, pha = 0, truoc = 0;
  const buoc = (nay) => {
    if (!svg.isConnected) { quay = null; return; }
    if (t0 === null) t0 = nay;
    const dt = Math.min(.05, (nay - truoc) / 1000 || 0); truoc = nay;
    pha += dt * .8;
    let t = ((nay - t0) / 1000 * TOC()) % tong, i = 0;
    while (i < khung.length - 1 && t > khung[i].g) { t -= khung[i].g; i++; }
    const a = khung[i].p, b = khung[Math.min(i + 1, khung.length - 1)].p;
    const p = K.tron(a, b, t / khung[i].g);
    p.pha = pha;
    for (const e of ds) { if (e.dataset.truoc) K.capNhatTruoc(e, p); else K.capNhat(e, p); }
    quay = requestAnimationFrame(buoc);
  };
  if (quay) cancelAnimationFrame(quay);
  quay = requestAnimationFrame(buoc);
}
function dungHinh() { if (quay) { cancelAnimationFrame(quay); quay = null; } }

/* Dừng vòng chạy hình. Hàm này từng bị xoá nhầm lúc tôi tách hàm quyet() ra khỏi xet():
   phép thay thế lấy trọn đoạn từ "function xet" tới "function thoiNghe", mà thoiHinh lại nằm
   lọt giữa hai mốc đó. Hậu quả: dong() ném lỗi ngay trước dòng gỡ lớp "hien", nên màn phát âm
   mở ra là không bao giờ đóng được, phủ kín màn hình và làm mọi ngôi sao khác bấm như không. */
function thoiHinh() { dungHinh(); }

/* ---- màn một âm: dắt tay từng bước, không phải một trang dài cuộn xuống ---- */
let buoc = 0;

/* Thứ tự này theo bằng chứng, không theo thói quen: TAI ĐI TRƯỚC MIỆNG.
   Luyện nghe phân biệt tự nó kéo theo cải thiện phát âm, và kéo mạnh hơn là luyện nói
   (tri giác d=0,92 so với sản sinh d=0,54; tổng hợp 79 nghiên cứu cho g=0,92).
   Ngoài ra bước luyện tai là chỗ DUY NHẤT trong cả trò có điểm số thật — vì app biết đáp án.
   Máy nhận giọng thì không: nó chỉ đoán chữ, nên không bao giờ được quy thành điểm. */
function cacBuoc(a) {
  const ds = ['nghe'];
  if (a.cap.length) ds.push('tai');
  ds.push('mieng');
  /* nghe so từng cặp: chỉ khi có cặp để so — bản trước bài không có cặp thì bước này lặp lại y hệt
     khối "Trong từ" của bước 1 */
  if (a.le ? a.le.doi.length : a.cap.length) ds.push('so');
  ds.push('noi');
  return ds;
}

/* ---- bước luyện tai ---- */
const TAI_SO = 8;
let taiLich = [], taiVi = 0, taiKQ = [], taiSai = [], taiNghe = 0, taiChot = false;
/* Thẻ phiên: mỗi lần vào lại bước luyện tai thì tăng một. Các hẹn giờ đang treo mang thẻ cũ sẽ
   tự bỏ qua. Không có nó thì bấm trả lời rồi bấm ngay "Bỏ qua bước này" là màn luyện tai vẽ đè
   lên bước vừa chuyển sang, và tiếng của lượt cũ vẫn kêu. */
let phienTai = 0;

function xepLich(a) {
  /* Bốn lượt từ này, bốn lượt từ kia, trộn lên; cặp từ và giọng đọc thì xoay vòng.
     Xoay là để người học nghe ra cái ÂM chung giữa các giọng và các từ, chứ không nhớ thuộc
     một mẫu. Đây là chỗ đổi lớn so với bản trước: bản trước phát ÂM RỜI do máy dựng — đúng
     về phổ nhưng tai người nghe không ra chữ gì, nên bài tập thành vô nghĩa. */
  /* LỊCH CHIA ĐỀU. Bản trước tính cặp bằng floor(i/2) và vế bằng i < 4 — nên với 3 cặp, cặp thứ hai
     lúc nào cũng ra từ đầu, cặp thứ ba lúc nào cũng ra từ sau, có từ không bao giờ được phát: nhớ
     cặp là đoán đúng, khỏi cần tai. Giờ cặp xoay theo i, vế đổi theo (vòng + cặp), nên cặp nào cũng
     có cả hai từ, và tổng vẫn đúng 4 lượt từ này, 4 lượt từ kia. */
  const soG = 3;                    // doc() tự quay vòng trong số bản thu thật sự có của từng từ
  const n = a.cap.length, ds = [];
  for (let i = 0; i < TAI_SO; i++) {
    const c = i % n, vong = Math.floor(i / n);
    ds.push({ b: (vong + c) % 2 === 0, g: i % soG, c });
  }
  for (let i = ds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = ds[i]; ds[i] = ds[j]; ds[j] = t;
  }
  return ds;
}

function veTai() {
  const a = am, xong = taiVi >= taiLich.length;
  const dung = taiKQ.filter(x => x).length;
  let than;
  if (xong) {
    const tot = dung >= TAI_SO * .75, kem = dung <= TAI_SO * .5;
    than = `
      <p class="pa-buoc">Tai bạn nghe ra ${dung} trên ${TAI_SO}</p>
      <div class="pa-o">${taiKQ.map(x => `<i class="${x ? 'dung' : 'sai'}"></i>`).join('')}</div>
      ${taiSai.length ? `<div class="pa-khoi"><p class="pa-nhan">Mấy lượt nghe nhầm — nghe lại cạnh nhau</p>
        ${taiSai.map(x => { const c = a.cap[x.c]; return `<div class="pa-tai-cap">${[0, 1].map(k =>
          `<button class="pa-le-phat${(k === 0) === x.b ? ' that' : ''}" data-xem="${x.c}:${k}">▶ ${esc(c[k])}${phienAm(c[k], true)}<i>${(k === 0) === x.b ? 'máy đã phát từ này' : 'bạn đã chọn'}</i></button>`).join('')}</div>`; }).join('')}
      </div>` : ''}
      <div class="pa-khoi">
        <p class="pa-chu">${tot
          ? 'Tai bạn tách được hai âm này. Đây là con số thật: app phát ra âm nào thì app biết, nên nó đếm được đúng sai — khác hẳn phần máy nghe giọng bạn ở bước cuối.'
          : kem
          ? 'Tai chưa tách được hai âm này, và điều đó bình thường — chưa nghe ra thì chưa nói khác nhau được. Nên làm lại bước này vài lần trước khi tập nói, vì tập nói khi tai chưa phân biệt được thì rất dễ luyện chắc thêm cái sai.'
          : 'Được hơn một nửa. Làm lại một lượt nữa rồi hãy đi tiếp.'}</p>
      </div>
      <button class="pa-to pa-nho-to" data-lam="1">Nghe lại một lượt nữa</button>`;
  } else {
    const l = taiLich[taiVi], da = taiKQ.length > taiVi;
    than = `
      <p class="pa-buoc">Bước 2 — nghe rồi chọn, lượt ${taiVi + 1} trên ${TAI_SO}</p>
      <div class="pa-o">${taiLich.map((_, i) =>
        `<i class="${i < taiKQ.length ? (taiKQ[i] ? 'dung' : 'sai') : i === taiVi ? 'nay' : ''}"></i>`).join('')}</div>
      <button class="pa-to" data-lai="1">▶ Nghe lại${taiNghe >= 2 ? ' (hết lượt nghe lại)' : ''}</button>
      <p class="pa-chu pa-nho pa-giua">Bạn vừa nghe từ nào?</p>
      <div class="pa-chon">
        <button class="pa-chon-nut" data-b="0">${esc(a.cap[l.c][0])}${phienAm(a.cap[l.c][0])}</button>
        <button class="pa-chon-nut" data-b="1">${esc(a.cap[l.c][1])}${phienAm(a.cap[l.c][1])}</button>
      </div>
      <p class="pa-bao"></p>
      <div class="pa-tai-sai" hidden></div>`;
  }
  oTrong.innerHTML = `<div class="pa-man">${dauMan()}${than}
    <div class="pa-lai">
      <button class="pa-lui">← Bước trước</button>
      ${xong ? '<button class="pa-toi">Bước tiếp →</button>' : '<button class="pa-toi pa-mo-nut">Bỏ qua bước này</button>'}
    </div></div>`;
  if (!taiVi && !taiKQ.length) oTrong.scrollTop = 0;
  daQua.add(buoc);
  gocMan();
  const lai = oTrong.querySelector('[data-lai]');
  if (lai) lai.onclick = () => {
    if (taiNghe >= 2) return;
    taiNghe++;
    docLuot(taiLich[taiVi]);
    veTaiNut();
  };
  const lam = oTrong.querySelector('[data-lam]');
  if (lam) lam.onclick = () => { batTai(am); };
  oTrong.querySelectorAll('[data-xem]').forEach(n => {
    const [c, k] = n.dataset.xem.split(':').map(Number);
    n.onclick = () => docCap(am.cap[c], k, 0, n, true);
  });
  oTrong.querySelectorAll('.pa-chon-nut').forEach(n => { n.onclick = () => chonTai(+n.dataset.b === 0); });
  if (!xong && !taiChot) {
    const the = phienTai;
    setTimeout(() => {
      if (the !== phienTai || !am) return;
      docLuot(taiLich[taiVi]);
    }, 260);
  }
}
/* Nối hình đang hiện trên màn với vòng chạy: cả hình nhìn thẳng lẫn hình bên trong của tư thế đang
   xem chạy cùng một nhịp. Gọi lại được sau khi đổi tư thế hay đổi tốc độ, không cần vẽ lại cả màn. */
function noiHinh() {
  const a = am;
  if (!a) return;
  const k = [...oTrong.querySelectorAll('.pa-hinh-tu')].find(k => !k.hidden);
  if (!k) return;
  const svgs = [...k.querySelectorAll('.pa-hinh svg')];
  svgs.forEach(sv => { sv.dataset.truoc = sv.parentNode.classList.contains('pa-truoc') ? '1' : ''; });
  const hai = k.dataset.tu === '2';
  chayHinh(svgs, a.le ? khungLe(a.le) : khungHinh(hai ? a.kh2 : a.kh, a.tac, a.kieu));
}

/* Đọc từ của lượt này, bằng giọng người, chậm lại một chút cho nghe rõ chỗ khác nhau. */
function docLuot(l) { docCap(am.cap[l.c], l.b ? 0 : 1, l.g, null, true); }

function veTaiNut() {
  const n = oTrong.querySelector('[data-lai]');
  if (n && taiNghe >= 2) n.textContent = '▶ Nghe lại (hết lượt nghe lại)';
}

function chonTai(chonA) {
  if (taiChot) return;
  const l = taiLich[taiVi], dung = chonA === l.b;
  taiChot = true;
  taiKQ.push(dung);
  const bao = oTrong.querySelector('.pa-bao');
  if (bao) {
    bao.textContent = dung ? 'Đúng.' : `Chưa đúng — vừa rồi là "${am.cap[l.c][l.b ? 0 : 1]}".`;
    bao.className = 'pa-bao ' + (dung ? 'dung' : 'sai');
  }
  oTrong.querySelectorAll('.pa-chon-nut').forEach((n, i) => {
    if ((i === 0) === l.b) n.classList.add('that');
    n.disabled = true;
  });
  if (!dung) taiSai.push({ c: l.c, b: l.b });
  const sang = () => { taiVi++; taiNghe = 0; taiChot = false; veTai(); };
  if (dung) {
    const the = phienTai;
    setTimeout(() => { if (the === phienTai && am) sang(); }, 800);
    return;
  }
  /* Chọn sai thì DỪNG lại: cho nghe lại hai từ cạnh nhau (cùng một người đọc) rồi tự bấm sang lượt.
     Bản trước tự nhảy sau 1,3 giây — người học chưa kịp nghe ra mình sai ở đâu. */
  const c = am.cap[l.c], hop = oTrong.querySelector('.pa-tai-sai');
  if (hop) {
    hop.hidden = false;
    hop.innerHTML = `<div class="pa-tai-cap">${[0, 1].map(k => `<button class="pa-le-phat" data-sai="${k}">▶ ${esc(c[k])}${phienAm(c[k], true)}</button>`).join('')}</div>
      <button class="pa-toi pa-tai-tiep" type="button">${taiVi + 1 >= taiLich.length ? 'Xem kết quả →' : 'Lượt tiếp →'}</button>`;
    hop.querySelectorAll('[data-sai]').forEach(n => { n.onclick = () => docCap(c, +n.dataset.sai, l.g, n, true); });
    hop.querySelector('.pa-tai-tiep').onclick = sang;
  }
}

function batTai(a) {
  phienTai++;
  taiLich = xepLich(a); taiVi = 0; taiKQ = []; taiSai = []; taiNghe = 0; taiChot = false;
  veTai();
}

let daQua = new Set(), hinhTu = 1;     // hinhTu: bài so hai tư thế thì đang xem hình nào (1 hay 2)
function moAm(a, ten) {
  am = a; amLe = a.le || null; capDang = null; luot = []; daQua = new Set(); doTieng = null; hinhTu = 1;
  doTu = 0; doLuot = []; doBuoc = 0; doMau1 = null; doKq = null; tiengMinh = null; mauLe = null;
  /* mở thẳng tới bước `ten` nếu bài này có bước đó — trừ luyện tai: đang luyện dở mà bấm sang âm
     khác thì không nên quăng người ta vào một lượt nghe mới ngay */
  const i = ten && ten !== 'tai' ? cacBuoc(a).indexOf(ten) : -1;
  buoc = i > 0 ? i : 0;
  veBuoc();
}

const coNoiThu = (a) => a.le ? coNghe() : (!!a.do || (a.cap.length > 0 && a.kiemDuoc && coNghe()));

/* Tên ngắn của một bài trên hàng chip: "/s/ /z/ cuối" → "s z", "cụm st- sp- sk-" → "st- sp- sk-". */
const tenNgan = (b) => b.ipa.replace(/ cuối$/, '').replace(/^cụm /, '').replace(/ và /, ' ').replace(/\//g, '');

/* Đầu màn — giống hệt nhau cho bài sửa lỗi và âm trong bảng 44 âm: tên, nút nói thử, hàng chip để
   sang âm (hay bài) cùng nhóm, và thanh chấm báo đang ở bước nào. */
function dauMan() {
  const a = am, ds = cacBuoc(a), AN = self.TDTD_AMNGUOI;
  const noiThu = coNoiThu(a) && ds[buoc] !== 'noi';
  const chip = a.le
    ? AN.DS.filter(y => y.nhom === a.le.nhom).map(y =>
        `<button class="pa-le-o${y === a.le ? ' nay' : ''}" data-chip="${esc(y.ma)}" aria-label="Âm /${esc(y.ipa)}/">${esc(y.ipa)}</button>`)
    : AM.map((b, i) => b.nhom !== a.nhom ? '' :
        `<button class="pa-le-o${b === a ? ' nay' : ''}" data-chip="${i}" aria-label="Bài ${esc(b.ipa)}">${esc(tenNgan(b))}</button>`);
  return `
    <div class="pa-dau">
      <button class="pa-quay" aria-label="Quay lại">‹</button>
      <span class="pa-ten">${esc(a.ipa)} · ${esc(a.ten)}</span>
      ${noiThu ? '<button class="pa-noithu" type="button">Nói thử</button>' : ''}
    </div>
    <div class="pa-le-cham">${chip.join('')}</div>
    <div class="pa-cham">${ds.map((_, i) =>
      `<i class="${i === buoc ? 'nay' : daQua.has(i) ? 'roi' : ''}"></i>`).join('')}</div>`;
}
/* Nút quay lại ở đầu màn: âm mở ra từ một bài sửa lỗi thì về đúng bài, đúng bước đó; không thì về danh sách. */
function veVe() {
  phienTai++;
  if (!quayVe) { veDanhSach(); return; }
  const q = quayVe; quayVe = null;
  am = q.a; amLe = null; buoc = q.b; daQua = q.qua || new Set(); hinhTu = 1;
  veBuoc();
}
function gocMan() {
  const a = am, AN = self.TDTD_AMNGUOI;
  oTrong.querySelector('.pa-quay').onclick = veVe;
  const noiThu = oTrong.querySelector('.pa-noithu');
  if (noiThu) noiThu.onclick = () => { phienTai++; buoc = cacBuoc(a).indexOf('noi'); veBuoc(); };
  const lui = oTrong.querySelector('.pa-lui');
  if (lui) lui.onclick = () => { phienTai++; if (buoc > 0) { buoc--; veBuoc(); } else veVe(); };
  const toi = oTrong.querySelector('.pa-toi');
  if (toi) toi.onclick = () => {
    phienTai++;
    if (buoc < cacBuoc(a).length - 1) { buoc++; veBuoc(); return; }
    if (a.le) veLe(AN.DS[(AN.DS.indexOf(a.le) + 1) % AN.DS.length].ma);
    else moAm(AM[(AM.indexOf(a) + 1) % AM.length]);
  };
  const veDs = oTrong.querySelector('.pa-ve-ds');
  if (veDs) veDs.onclick = () => { phienTai++; veDanhSach(); };
  oTrong.querySelectorAll('[data-chip]').forEach(n => {
    n.onclick = () => {
      phienTai++;
      const ten = cacBuoc(a)[buoc];
      if (a.le) veLe(n.dataset.chip, ten);
      else { quayVe = null; moAm(AM[+n.dataset.chip], ten); }
    };
  });
  /* hàng chip dài hơn màn điện thoại: cuộn sao cho chip đang chọn nằm giữa */
  const hang = oTrong.querySelector('.pa-le-cham'), nay = hang && hang.querySelector('.nay');
  if (nay && hang.clientWidth) hang.scrollLeft = Math.max(0, nay.offsetLeft - (hang.clientWidth - nay.offsetWidth) / 2);
}

function veBuoc() {
  const a = am, x = a.le, K = self.TDTD_KHAUHINH, AN = self.TDTD_AMNGUOI, ds = cacBuoc(a), ten = ds[buoc];
  const cuoi = buoc >= ds.length - 1, so = (t) => ds.indexOf(t) + 1;
  roiMan();
  if (ten === 'tai') { dungHinh(); batTai(a); return; }
  const dau = dauMan();
  const khoi = (nhan, chu, phu) => `<div class="pa-khoi${phu ? ' pa-mo' : ''}"><p class="pa-nhan">${esc(nhan)}</p>
    <p class="pa-chu${phu ? ' pa-nho' : ''}">${esc(chu)}</p></div>`;

  let than = '';
  if (ten === 'noi') {
    /* Bài có cặp tối thiểu: cho nói cả HAI từ của cặp (bản trước chỉ cho nói từ đầu). Bài lỗi đẻ ra
       chuỗi không phải từ (life → "laip") thì máy hay tự sửa giùm — vẫn cho nói thử, nhưng nói thẳng ra. */
    if (x) taoNoiThu('le:' + x.ma, x.vd.map(v => v.tu), Object.values(x.soCap || {}), a.ipa);
    else taoNoiThu('bai:' + a.ipa, a.cap.length ? [] : a.tu, a.cap.map(c => [c[0], c[1]]), a.ipa,
      a.kiemDuoc ? '' : 'Với bài này máy hay "sửa giùm": bạn nói "laip" nó vẫn có thể ghi "life", vì "laip" không phải từ. '
        + 'Máy ghi đúng chưa chắc bạn đã nói đúng — nghe kỹ mẫu và soi gương ở bước xem miệng.');
  }
  if (ten === 'nghe') {
    /* Dẫn bằng chính cái ÂM, do NGƯỜI THẬT đọc — đứng riêng và trong âm tiết. Hai bản trước đều
       trượt: bản đầu dẫn bằng âm máy dựng (đúng phổ mà tai không nghe ra chữ gì), bản sau dẫn bằng
       từ do máy đọc (nghe được, nhưng cả bài thành luyện từ chứ không còn luyện âm). Bản thu người
       thật là cách duy nhất có được cả hai: giọng người, và âm đứng một mình. */
    const hang = x ? [{ x, laSai: false, tu: x.vd[0].tu }] : dsNguoi(a);
    than = `
      <p class="pa-buoc">Bước 1 — nghe người thật đọc âm này</p>
      <p class="pa-le-to${a.ipa.length > 6 ? ' dai' : ''}">${esc(a.ipa)}</p>
      <div class="pa-nguoi">${hang.map(({ x: y, laSai, tu }) => `
        <div class="pa-nguoi-hang${laSai ? ' sai' : ''}">
          ${x ? '' : `<span class="pa-nguoi-ipa">/${esc(y.ipa)}/${laSai ? '<i>cái sai hay gặp</i>' : ''}</span>`}
          <span class="pa-nguoi-nut">
            ${(() => {
              /* Bài âm CUỐI từ thì minh hoạ bằng từ có âm đó ở cuối (hat, bag, wipe) — bản thu "[ga] … [aga]"
                 hay "[fa] … [afa]" là âm ở đầu và giữa, dạy sai chỗ. Chỉ giữ bản thu nào chính là âm cuối từ ("hiss"). */
              const cuoiTu = a.nhom === 'Cuối từ', ban = (y.am || []).filter(b => !cuoiTu || /cuối/.test(b.phu || ''));
              return ban.length
                ? ban.map(b => `<button class="pa-le-phat" data-nguoi="${esc(b.f)}">▶ ${esc(b.nhan)}<i>${esc(b.phu || '')}</i></button>`).join('')
                : `<button class="pa-le-phat" data-vd="${esc(tu)}">▶ ${esc(tu)}${phienAm(tu)}<i>${x
                    ? 'âm này chưa ai thu đứng riêng — nghe nó trong từ' : 'người bản xứ đọc'}</i></button>`;
            })()}
            ${x ? '' : `<button class="pa-phu-nut" data-sang="${esc(y.ma)}">Xem âm /${esc(y.ipa)}/ trong bảng 44 âm →</button>`}
          </span></div>`).join('')}</div>
      <p class="pa-le-bao" role="status"></p>
      <div class="pa-khoi">
        <p class="pa-nhan">Trong từ — người bản xứ đọc</p>
        <div class="pa-vd">${(x ? x.vd : a.tu.map(t => ({ tu: t }))).map(v => `
          <button class="pa-vd-nut" data-vd="${esc(v.tu)}"><b>▶ ${esc(v.tu)}</b>${phienAm(v.tu)}
            ${v.nghia ? `<i>${esc(v.nghia)}</i>` : ''}<span class="pa-vd-giong"></span></button>`).join('')}</div>
        <p class="pa-chu pa-nho">Bấm lại cùng một từ để nghe người khác đọc (từ nào có nhiều bản thu) — nghe nhiều giọng
          thì mới nhận ra cái âm chung.</p>
      </div>
      ${x ? (x.loi ? khoi('Người Việt hay sai', x.loi) : '') + (x.ghiChu ? khoi('Lưu ý', x.ghiChu, true) : '')
          : khoi('Vì sao phải học âm này', a.viSao)}
      <p class="pa-nguon">Mọi tiếng đọc ở đây là bản thu người thật trên Wikimedia Commons.
        <button class="pa-lien" type="button" data-nguon="1">Ai đọc, giấy phép gì</button></p>`;
  } else if (ten === 'mieng') {
    /* Hình theo đúng kiểu của màn 44 âm (người dùng chọn giữ kiểu này): miệng nhìn thẳng và bên trong
       miệng đặt CẠNH NHAU, chạy cùng một nhịp — soi gương được bằng hình trái, hiểu lưỡi làm gì bằng
       hình phải. Bài so hai tư thế (/l/ với /n/, /s/ với /z/...) thì có hai nút bấm qua lại giữa hai
       hình, chứ không bày bốn hình chồng nhau dài cả màn trên điện thoại. */
    const hai = !x && !!a.kh2;
    const nguyen = x ? x.nhom !== 'phu' : !!a.bieu;
    const chuTruoc = x && x.luot ? `bắt đầu như /${x.luot[0]}/, lướt sang /${x.luot[1]}/` : undefined;
    /* Nút dưới hình đọc một TỪ THẬT bằng giọng người (hay chính cái âm, ở màn 44 âm), chọn sao cho
       đúng cái âm hình đang vẽ. Chỗ duy nhất còn dùng âm máy dựng là vế sai không đẻ ra từ nào. */
    const nutNghe = (thu, sai) => {
      const lop = 'pa-le-phat' + (sai ? ' sai' : '');
      if (x) {
        const b = (x.am || [])[0];
        return b ? `<button class="${lop}" data-hinh="1" data-f="${esc(b.f)}">▶ ${esc(b.nhan)}<i>${esc(b.phu || '')}</i></button>`
          : `<button class="${lop}" data-hinh="1" data-t="${esc(x.vd[0].tu)}" data-g="0">▶ ${esc(x.vd[0].tu)}${phienAm(x.vd[0].tu)}</button>`;
      }
      const t = thu === 2 ? a.tuB : a.tuA;
      return t
        ? `<button class="${lop}" data-hinh="${thu}" data-t="${esc(t)}" data-g="${thu === 2 ? 1 : 0}">▶ ${esc(t)}${phienAm(t)}</button>`
        : `<button class="${lop}" data-hinh="${thu}">▶ nghe (tiếng máy dựng)</button>`;
    };
    const tuThe = (kh, thu, nhan, sai) => `
      <div class="pa-hinh-tu" data-tu="${thu}"${thu === hinhTu ? '' : ' hidden'}>
        <div class="pa-le-hinh">
          <figure class="pa-hinh pa-truoc">${K ? K.veMatTruoc(kh, { nhan: 'Miệng nhìn thẳng khi đọc ' + nhan, chu: chuTruoc }) : ''}
            <figcaption>nhìn thẳng, như soi gương</figcaption></figure>
          <figure class="pa-hinh pa-canh">${K ? K.ve(kh, { nhan: 'Bên trong miệng khi đọc ' + nhan }) : ''}
            <figcaption>bên trong miệng, nhìn từ bên hông</figcaption></figure>
        </div>
        <div class="pa-nut-hang">${nutNghe(thu, sai)}</div>
      </div>`;
    than = `
      <p class="pa-buoc">Bước ${so('mieng')} — xem miệng làm gì</p>
      ${hai ? `<div class="pa-hinh-chon">${[1, 2].map(t => `
        <button class="pa-hinh-nut${t === hinhTu ? ' dang' : ''}${t === 2 && a.sai2 ? ' sai' : ''}" data-chon-hinh="${t}"
          type="button" aria-pressed="${t === hinhTu}">${esc(t === 1 ? a.nhan1 : a.nhan2)}</button>`).join('')}</div>`
        : !x && a.nhan1 ? `<p class="pa-chu pa-nho pa-giua">${esc(a.nhan1)}</p>` : ''}
      ${tuThe(a.kh, 1, x ? a.ipa : (a.nhan1 || a.ipa), false)}
      ${hai ? tuThe(a.kh2, 2, a.nhan2, a.sai2) : ''}
      ${nguyen && K ? `<div class="pa-bieu pa-le-bieu">${x ? (x.luot ? K.veNguyenAm(x.luot[0], x.luot[1], x.ipa) : K.veNguyenAm(x.ipa)) : K.veNguyenAm(a.bieu)}</div>
        <p class="pa-chu pa-nho pa-giua">${x && x.luot ? 'Mũi tên là đường lưỡi lướt đi trong lúc đọc.' : 'Chấm vàng là chỗ của lưỡi.'}
          Trái là lưỡi đưa ra trước, phải là lùi về sau; trên là lưỡi nâng cao, dưới là hạ thấp.</p>` : ''}
      <div class="pa-nut-hang"><button class="pa-phu-nut pa-cham-nut${chamLai ? ' bat' : ''}">${chamLai ? 'Hình chạy tốc độ thường' : 'Cho hình chạy chậm'}</button></div>
      <p class="pa-le-bao" role="status"></p>
      <div class="pa-khoi">
        <p class="pa-nhan">Cách đặt miệng</p>
        <p class="pa-chu">${esc(a.cach)}</p>
      </div>
      ${a.luuY ? khoi('Một điều cần nói thật', a.luuY, true) : ''}
      ${x ? '' : `<p class="pa-chu pa-nho pa-giua">${hai ? 'Bấm hai nút trên hình để xem qua lại hai tư thế. ' : ''}Nút dưới hình đọc từ thật bằng giọng người.${a.sai2
        ? ' Hình thứ hai là lỗi hay gặp — bấm nghe cái sai, nghe được nó thì mới tránh được nó.' : ''}</p>`}`;
  } else if (ten === 'so') {
    /* Nghe SO từng cặp: hai từ liền nhau, cùng một người đọc — đúng cái tai cần để chuẩn bị nói ở
       bước sau. Bài sửa lỗi so các cặp của bài; âm trong bảng thì so với từng âm hay bị lẫn với nó. */
    const hang = x
      ? x.doi.map(m => AN.tim(m)).filter(Boolean).map(y => { const c = capSo(x, y); return `
        <div class="pa-le-cap-hang">
          <button class="pa-le-phat" data-cap="${esc(y.ma)}">▶ ${esc(c[0])} rồi ${esc(c[1])}${phienAmCap(c)}<i>/${esc(x.ipa)}/ rồi /${esc(y.ipa)}/</i></button>
          <button class="pa-phu-nut" data-sang="${esc(y.ma)}">Sang /${esc(y.ipa)}/ →</button>
        </div>`; })
      : a.cap.map((c, i) => `
        <div class="pa-le-cap-hang pa-so-cap">
          <button class="pa-le-phat" data-socap="${i}">▶ ${esc(c[0])} rồi ${esc(c[1])}${phienAmCap(c)}<i>${esc(c[2])}</i></button>
        </div>`);
    than = `
      <p class="pa-buoc">Bước ${so('so')} — nghe so từng cặp</p>
      <div class="pa-khoi">
        <p class="pa-chu pa-nho">Mỗi nút đọc hai từ liền nhau, cùng một người đọc. Bấm lại thì sang người khác.
          Nghe xem chỗ khác nhau nằm ở đâu — ${x ? esc(a.ipa) + ' với âm hay bị lẫn với nó' : esc(a.ipa)}.</p>
        <div class="pa-le-cap">${hang.join('')}</div>
      </div>
      <p class="pa-le-bao" role="status"></p>`;
  } else {
    const baiHoc = x ? AM.map((b, i) => ({ b, i })).filter(({ b }) => dsNguoi(b).some(d => d.x.ma === x.ma)) : [];
    than = `
      <p class="pa-buoc">Bước ${ds.length} — tới lượt bạn: nói thử</p>
      ${veNoiThu()}
      ${veNoiTheo(a)}
      ${a.do ? `<p class="pa-nhan pa-giua pa-hoac">Đo kỹ hơn: máy đo âm cuối ngay trên máy</p>${veDo(a)}` : ''}
      ${baiHoc.length ? `<div class="pa-khoi">
        <p class="pa-nhan">Bài sửa lỗi có âm này</p>
        <div class="pa-tu">${baiHoc.map(({ b, i }) =>
          `<button class="pa-tu-nut" data-bai="${i}">${esc(b.ipa)} · ${esc(b.ten)}</button>`).join('')}</div></div>` : ''}`;
  }

  const ke = x ? AN.DS[(AN.DS.indexOf(x) + 1) % AN.DS.length] : AM[(AM.indexOf(a) + 1) % AM.length];
  oTrong.innerHTML = `<div class="pa-man">${dau}${than}
    <div class="pa-lai">
      <button class="pa-lui">${buoc > 0 ? '← Bước trước' : quayVe ? '← Về bài ' + esc(quayVe.a.ipa) : '← Danh sách'}</button>
      ${cuoi ? `<button class="pa-toi pa-xong">Xong · ${x ? 'âm tiếp: /' + esc(ke.ipa) + '/' : 'bài tiếp: ' + esc(ke.ipa)} →</button>`
             : '<button class="pa-toi">Bước tiếp →</button>'}
    </div>
    ${cuoi ? `<p class="pa-giua"><button class="pa-lien pa-ve-ds" type="button">hoặc về danh sách</button></p>` : ''}</div>`;
  /* Đổi bước thì cuộn về đầu màn. Không có dòng này thì trên điện thoại, bấm một bài ở cuối danh
     sách là bước 1 hiện ra ở đúng chỗ cuộn cũ — tận đáy, mất đầu màn, mất nút "Nói thử". */
  oTrong.scrollTop = 0;
  daQua.add(buoc);

  dungHinh();
  gocMan();
  const nutCham = oTrong.querySelector('.pa-cham-nut');
  if (nutCham) nutCham.onclick = () => {
    chamLai = !chamLai;
    nutCham.textContent = chamLai ? 'Hình chạy tốc độ thường' : 'Cho hình chạy chậm';
    nutCham.classList.toggle('bat', chamLai);
    noiHinh();
  };
  /* bản thu chính cái âm */
  oTrong.querySelectorAll('[data-nguoi]').forEach(n => { n.onclick = () => phatChuoi([n.dataset.nguoi], n); });
  /* từ do người bản xứ đọc: bấm lại cùng một từ thì sang người khác, và ghi rõ đang nghe giọng nào */
  oTrong.querySelectorAll('[data-vd]').forEach(n => {
    n.onclick = () => {
      const tu = n.dataset.vd, i = luotVd[tu] = (luotVd[tu] === undefined ? 0 : luotVd[tu] + 1);
      const ds2 = banThu(tu), b = ds2 && ds2.length ? ds2[i % ds2.length] : null;
      const g = n.querySelector('.pa-vd-giong');
      if (g) g.textContent = b ? 'giọng ' + b.giong + (ds2.length > 1 ? ` · người ${i % ds2.length + 1}/${ds2.length}` : ' · chỉ có một bản thu') : '';
      doc(tu, false, i, n);
    };
  });
  /* bước xem miệng: bấm qua lại hai tư thế */
  oTrong.querySelectorAll('[data-chon-hinh]').forEach(n => {
    n.onclick = () => {
      hinhTu = +n.dataset.chonHinh;
      oTrong.querySelectorAll('[data-chon-hinh]').forEach(m => {
        const bat = +m.dataset.chonHinh === hinhTu;
        m.classList.toggle('dang', bat); m.setAttribute('aria-pressed', bat ? 'true' : 'false');
      });
      oTrong.querySelectorAll('.pa-hinh-tu').forEach(k => { k.hidden = +k.dataset.tu !== hinhTu; });
      const nut = oTrong.querySelector(`.pa-hinh-tu[data-tu="${hinhTu}"] [data-hinh]`);
      if (nut) nut.click(); else noiHinh();
    };
  });
  /* nút dưới hình: đọc bằng giọng người (hoặc phát âm máy dựng nếu không có từ),
     đồng thời cho hình chạy lại từ đầu để tai và mắt khớp nhau */
  oTrong.querySelectorAll('[data-hinh]').forEach(n => {
    n.onclick = () => {
      const hai = n.dataset.hinh === '2';
      if (n.dataset.f) phatChuoi([n.dataset.f], n);
      else if (n.dataset.t && !x && a.tuA && a.tuB) docCap([a.tuA, a.tuB], hai ? 1 : 0, 0, n, true);
      else if (n.dataset.t) doc(n.dataset.t, true, +(n.dataset.g || 0), n);
      else phatAm(hai ? a.am2 : a.am, a.kieu);
      noiHinh();
    };
  });
  /* bước nghe so: bài sửa lỗi */
  oTrong.querySelectorAll('[data-socap]').forEach(n => {
    const c = a.cap[+n.dataset.socap], kh = 'so:' + c[0] + '|' + c[1];
    n.onclick = () => {
      const ds2 = chungNguoi(c[0], c[1]), i = luotVd[kh] = luotVd[kh] === undefined ? 0 : luotVd[kh] + 1;
      if (ds2.length) { const p = ds2[i % ds2.length]; phatChuoi([p[0].f, p[1].f], n); return; }
      const A = banThu(c[0]), B = banThu(c[1]);
      if (A && B) phatChuoi([A[0].f, B[0].f], n);
    };
  });
  /* bước nghe so: âm trong bảng, so với âm hay lẫn */
  oTrong.querySelectorAll('[data-cap]').forEach(n => {
    const y = AN.tim(n.dataset.cap), c = capSo(x, y), kh = c.join('|');
    n.onclick = () => {
      /* hai từ do CÙNG MỘT NGƯỜI đọc, giọng Anh trước nếu Anh-Mỹ khác nhau; bấm lại thì sang người khác */
      const ds2 = chungNguoi(c[0], c[1]), i = luotVd[kh] = luotVd[kh] === undefined ? 0 : luotVd[kh] + 1;
      /* Anh-Mỹ đọc khác mà không có người giọng Anh nào đọc cả hai từ: giọng Mỹ thì "car rồi hot" ra
         cùng một nguyên âm. Lúc đó so bằng hai bản thu chính cái âm (đều giọng Anh) cho đúng. */
      const TN = self.TDTD_TUNGUOI, khac = c.some(t => { const p = TN && TN.ipa(t); return p && p[0] !== p[1]; });
      const anh = ds2.filter(p => p[0].giong === 'Anh');
      if (khac && !anh.length && x.am.length && y.am.length) { phatChuoi([x.am[0].f, y.am[0].f], n); return; }
      const dung = khac ? anh : ds2;
      if (dung.length) { const p = dung[i % dung.length]; phatChuoi([p[0].f, p[1].f], n); return; }
      const A = banThu(c[0]), B = banThu(c[1]);
      if (A && B) phatChuoi([A[0].f, B[0].f], n);
    };
  });
  /* sang một âm trong bảng: từ bài sửa lỗi thì mở từ đầu; từ bước nghe so thì mở đúng bước nghe so của âm kia */
  oTrong.querySelectorAll('[data-sang]').forEach(n => { n.onclick = () => { phienTai++; veLe(n.dataset.sang, x ? 'so' : undefined); }; });
  oTrong.querySelectorAll('[data-bai]').forEach(n => { n.onclick = () => { phienTai++; quayVe = null; moAm(AM[+n.dataset.bai]); }; });
  const nguonNut = oTrong.querySelector('[data-nguon]');
  if (nguonNut) nguonNut.onclick = () => veNguon();
  /* bước nói: chọn mẫu, thu, nghe lại */
  oTrong.querySelectorAll('[data-mau]').forEach(n => {
    n.onclick = () => {
      mauLe = n.dataset.mau;
      oTrong.querySelectorAll('[data-mau]').forEach(m => m.classList.toggle('dang', m === n));
      phatChuoi([mauLe], n);
    };
  });
  const thu = oTrong.querySelector('.pa-le-thu');
  if (thu) thu.onclick = () => thuLe();
  oTrong.querySelectorAll('[data-phat]').forEach(n => {
    n.onclick = () => {
      const k = n.dataset.phat;
      if (k === 'so' && tiengMinh && mauLe) phatChuoi([mauLe, tiengMinh], n);
      else if (k === 'minh' && tiengMinh) phatChuoi([tiengMinh], n);
    };
  });
  if (ten === 'noi') { ganNoiThu(); if (a.do) ganDo(a); }
  noiHinh();
  if (ten === 'nghe') {
    /* mở bước 1 là nghe ngay nút đầu tiên — đúng cái người học đang nhìn */
    const d = oTrong.querySelector('.pa-nguoi .pa-le-phat');
    if (d) d.click();
  }
}

/* ---- máy đo tiếng bạn, ngay trên máy ----
   Thu thẳng từ micro rồi đưa cho assets/dophatam.js. Ba chỗ phải làm đúng:
   - TẮT bộ lọc ồn, bộ khử vọng và bộ tự chỉnh âm lượng của trình duyệt: bộ lọc ồn coi tiếng rít
     /s/ là tiếng ồn và xoá mất, đúng cái cần đo.
   - Tự dừng khi bạn nói xong (lặng lại 0,6 giây), tối đa 3 giây, rồi TẮT micro ngay — đèn báo micro
     trên máy tắt theo, không nghe lén gì thêm.
   - Không lưu bản thu, không gửi đi đâu. Mẫu âm thanh chỉ nằm trong bộ nhớ lúc đo rồi bỏ. */

const hai = (a) => !!a.do.cap;
const tuDo = (a) => hai(a) ? a.do.cap[doTu % a.do.cap.length] : [a.do.tu[doTu % a.do.tu.length]];

function veDo(a) {
  const ds = hai(a) ? a.do.cap.map(c => c.join(' / ')) : a.do.tu;
  const tu = tuDo(a), noi = tu[hai(a) ? doBuoc : 0];
  const dat = doLuot.filter(l => l.dat).length;
  const kq = doKq;
  return `<div class="pa-khoi pa-do">
      <p class="pa-nhan">Máy đo tiếng bạn</p>
      <p class="pa-chu pa-nho">${esc(TA_DO[a.do.kieu])}</p>
      <div class="pa-do-chon">${ds.map((t, i) =>
        `<button class="pa-do-tu${i === doTu % ds.length ? ' dang' : ''}" data-i="${i}" type="button">${esc(t)}</button>`).join('')}</div>
      ${hai(a) ? `<div class="pa-do-hai">${tu.map((t, i) =>
        `<span class="${i === doBuoc ? 'nay' : i < doBuoc ? 'xong' : ''}">${i + 1}. ${esc(t)}</span>`).join('<i>→</i>')}</div>` : ''}
      <div class="pa-do-mau">${tu.map((t, i) => `<button class="pa-phu-nut pa-do-nghe" data-t="${esc(t)}" data-g="${i}" type="button">▶ nghe "${esc(t)}"${phienAm(t, true)}</button>`).join('')}</div>
      <p class="pa-loi" hidden></p>
      <button class="pa-mic pa-do-mic" type="button">Nhấn rồi nói "${esc(noi)}"</button>
      <div class="pa-do-muc" hidden><i></i></div>
      ${kq ? `<div class="pa-do-kq ${kq.loi ? 'loi' : kq.dat ? 'dat' : 'chua'}">
        <b>${kq.loi ? 'Chưa đo được' : kq.dat ? 'Đạt' : 'Chưa đạt'}</b><span>${esc(kq.chu)}</span></div>` : ''}
      ${doTieng ? `<div class="pa-le-so">
        <button class="pa-le-phat pa-do-minh" type="button">▶ Nghe lại tiếng bạn<i>"${esc(doTieng.tu)}" vừa nói</i></button>
        <button class="pa-le-phat pa-do-so" type="button">▶ Mẫu rồi tới bạn<i>người bản xứ, rồi bạn</i></button></div>` : ''}
      ${doLuot.length ? `<div class="pa-luot">${doLuot.map(l =>
        `<span class="${l.dat ? 'dung' : 'sai'}">${esc(l.tu)}</span>`).join('')}</div>
        <p class="pa-chu pa-nho">Đạt ${dat} trong ${doLuot.length} lần gần nhất.</p>` : ''}
      <p class="pa-chu pa-nho pa-thua">Tiếng bạn được đo ngay trên máy này, không gửi đi đâu và không lưu lại.
        Máy chỉ đo một dấu hiệu âm học của âm này — đạt nghĩa là dấu hiệu đó có mặt, chứ không phải
        cả giọng bạn đã chuẩn.</p>
    </div>`;
}

function ganDo(a) {
  const minh = oTrong.querySelector('.pa-do-minh'), so = oTrong.querySelector('.pa-do-so');
  if (minh) minh.onclick = () => { if (!dangThu && doTieng) phatChuoi([doTieng.b], minh); };
  if (so) so.onclick = () => {
    if (dangThu || !doTieng) return;
    const ds = banThu(doTieng.tu);
    if (ds && ds.length) phatChuoi([ds[0].f, doTieng.b], so); else phatChuoi([doTieng.b], so);
  };
  oTrong.querySelectorAll('.pa-do-tu').forEach(n => {
    n.onclick = () => { if (dangThu) return; doTu = +n.dataset.i; doBuoc = 0; doMau1 = null; doKq = null; veBuoc(); };
  });
  oTrong.querySelectorAll('.pa-do-nghe').forEach(n => {
    n.onclick = () => {
      if (dangThu) return;             // micro đang mở không lọc vọng: phát mẫu lúc này là máy đo chấm luôn tiếng mẫu
      const tu = tuDo(a); if (tu.length === 2) docCap(tu, +n.dataset.g, 0, n, true); else doc(n.dataset.t, true, 0, n);
    };
  });
  const mic = oTrong.querySelector('.pa-do-mic');
  if (mic) mic.onclick = () => doMic(a);
}

function baoDo(chu, nang) {
  const n = oTrong.querySelector('.pa-do .pa-loi');
  if (!n) return;
  n.hidden = !chu; n.textContent = chu || '';
  n.classList.toggle('nang', !!nang);
}

async function doMic(a) {
  if (dangThu) return;
  if (dangNghe) { baoDo('Đang nghe ở phần nói thử — chờ nó xong đã.', true); return; }
  const D = self.TDTD_DOAM;
  if (!D) { baoDo('Phần đo chưa tải xong, thử lại sau giây lát.', true); return; }
  const tu = tuDo(a), noi = tu[hai(a) ? doBuoc : 0];
  imLang();                         // tắt cả bản thu đang phát — micro mở không lọc vọng, sẽ thu luôn tiếng mẫu
  const mic = oTrong.querySelector('.pa-do-mic'), muc = oTrong.querySelector('.pa-do-muc');
  dangThu = true; baoDo('');
  mic.classList.add('dang'); mic.textContent = 'Đang mở micro…';
  if (muc) muc.hidden = false;
  let mau;
  const the = phienMan;
  try {
    let moRoi = false;
    mau = await thuAm((m) => {
      if (!moRoi) { moRoi = true; mic.textContent = `Đang nghe… nói "${noi}"`; }   // micro đã mở thật: giờ mới bảo nói
      const i = muc && muc.querySelector('i'); if (i) i.style.width = Math.round(m * 100) + '%';
    });
  } catch (e) {
    dangThu = false;
    if (the !== phienMan) return;                      // đã rời màn: micro đã tắt, không báo gì vào màn mới
    mic.classList.remove('dang'); mic.textContent = `Nhấn rồi nói "${noi}"`;
    if (muc) muc.hidden = true;
    baoDo(e && e.message === 'khongMic' ? 'Trình duyệt này không cho dùng micro. Phần hình và phần nghe ở trên vẫn dùng bình thường.'
      : e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'Máy chưa cho dùng micro. Bật quyền micro cho trang này rồi thử lại.'
      : 'Không mở được micro.', true);
    return;
  }
  dangThu = false;
  if (!am || am !== a || the !== phienMan) return;     // đã chuyển màn giữa lúc thu: bỏ đoạn thu dở, đừng chấm nó
  /* giữ tiếng vừa thu để nghe lại: máy báo "chưa đạt" mà không cho nghe lại mình thì người học không biết sửa chỗ nào */
  const gon = gonTieng(mau.x, mau.sr);
  if (gon && moLoa()) { const b = ac.createBuffer(1, gon.length, mau.sr); b.getChannelData(0).set(gon); doTieng = { b, tu: noi }; }
  if (!hai(a)) {
    ghiKq(a, D.cham(a.do.kieu, [mau.x], mau.sr), tu[0]);
  } else if (doBuoc === 0) {
    const l = D.chatLuong(D.phanTich(mau.x, mau.sr));
    if (l) { doKq = { loi: l.loi, chu: l.chu }; veBuoc(); return; }
    doMau1 = mau; doBuoc = 1; doKq = null; veBuoc();
    return;
  } else {
    const kq = doMau1 && doMau1.sr === mau.sr ? D.cham(a.do.kieu, [doMau1.x, mau.x], mau.sr)
      : { loi: 'khac', chu: 'Hai lần thu không khớp nhau, nói lại từ đầu nhé.' };
    doBuoc = 0; doMau1 = null;
    ghiKq(a, kq, tu.join(' / '));
  }
}

function ghiKq(a, kq, tu) {
  doKq = kq;
  if (!kq.loi) { doLuot.push({ dat: !!kq.dat, tu }); if (doLuot.length > 5) doLuot.shift(); }
  veBuoc();
}

/* Thu một từ. Trả về { x: Float32Array, sr }. `baoMuc` nhận độ to 0..1 để vẽ thanh mức.
   nghi: lặng bao lâu thì coi như nói xong; toiDa: thu lâu nhất bao nhiêu giây. Nói theo cả
   "[sa] … [asa]" thì giữa hai âm tiết có một quãng nghỉ, nên chỗ đó cần nghi dài hơn.
   huyThu: tắt micro ngay, dùng khi đóng sao giữa lúc đang thu. */
let huyThu = null;
async function thuAm(baoMuc, nghi = .6, toiDa = 3) {
  if (mauGia.length) {                                 // móc kiểm thử: nạp sẵn mẫu thay cho micro
    const m = mauGia.shift();
    for (let i = 1; i <= 5; i++) { baoMuc(i / 5); await new Promise(r => setTimeout(r, 40)); }
    return m;
  }
  const md = navigator.mediaDevices;
  if (!md || !md.getUserMedia) throw new Error('khongMic');
  const AC = self.AudioContext || self.webkitAudioContext;
  if (!AC) throw new Error('khongMic');
  const ctx = new AC();                                // tạo ngay trong cú chạm, iPhone mới cho chạy
  let luong = null;
  const the = phienMan;
  try { if (navigator.audioSession) navigator.audioSession.type = 'play-and-record'; } catch (e) {}
  try {
    if (ctx.state === 'suspended') await ctx.resume();
    luong = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false,
                                             autoGainControl: false, channelCount: 1 } });
  } catch (e) { try { ctx.close(); } catch (e2) {} throw e; }
  /* Trình duyệt hỏi quyền micro có khi mất vài giây; trong lúc đó người dùng đã đóng sao hoặc sang
     màn khác thì tắt micro ngay khi vừa được cấp, đừng để nó thu tiếp cho một màn đã không còn. */
  if (the !== phienMan || !(tam && tam.classList.contains('hien'))) {
    luong.getTracks().forEach(t => t.stop());
    try { ctx.close(); } catch (e) {}
    throw new Error('daRoi');
  }
  const sr = ctx.sampleRate;
  const nguon = ctx.createMediaStreamSource(luong);
  const xl = ctx.createScriptProcessor(2048, 1, 1);
  const cam = ctx.createGain(); cam.gain.value = 0;    // phải nối ra loa thì Chrome mới chạy, nhưng tắt tiếng
  nguon.connect(xl); xl.connect(cam); cam.connect(ctx.destination);
  const khuc = [];
  let nen = null, daNoi = false, lang = 0, tong = 0;
  return await new Promise((xong) => {
    const dung = () => {
      huyThu = null;
      xl.onaudioprocess = null;
      try { nguon.disconnect(); xl.disconnect(); cam.disconnect(); } catch (e) {}
      luong.getTracks().forEach(t => t.stop());          // tắt micro ngay
      try { ctx.close(); } catch (e) {}
      const n = khuc.reduce((s, k) => s + k.length, 0), x = new Float32Array(n);
      let o = 0; for (const k of khuc) { x.set(k, o); o += k.length; }
      xong({ x, sr });
    };
    huyThu = dung;
    xl.onaudioprocess = (e) => {
      const d = new Float32Array(e.inputBuffer.getChannelData(0));
      khuc.push(d); tong += d.length;
      let q = 0; for (let i = 0; i < d.length; i++) q += d[i] * d[i];
      const rms = Math.sqrt(q / d.length);
      baoMuc(Math.min(1, rms * 12));
      if (tong < sr * .25) { nen = nen === null ? rms : Math.min(nen, rms); return; }   // 0,25 giây đầu: nghe tiếng ồn nền
      const nguong = Math.max((nen || 1e-4) * 5, .004);
      if (rms > nguong) { daNoi = true; lang = 0; }
      else if (daNoi) lang += d.length;
      if ((daNoi && lang > sr * nghi) || tong > sr * toiDa) dung();
    };
  });
}

/* ---- Nói thử: máy nghe ra chữ gì ----
   Người dùng hỏi: "chưa có chỗ nói thử để xem máy có nghe được mình nói gì không". Bản trước CÓ phần
   nhận giọng, nhưng giấu ở bước 5, dưới dòng "Hoặc thử cách khác", trông như thẻ chữ, bấm vào lại sang
   một màn khác — và màn đó chỉ cho nói từ ĐẦU của cặp. Giờ là một khối dùng chung, đặt ngay chỗ người
   ta tìm: bước 5 của mỗi bài, màn của từng âm, và một mục riêng ở đầu danh sách.

   Máy nhận giọng đóng vai một người nghe không quen giọng bạn: nó ghi ra chữ nó nghe được. Đó là thứ
   đo được thật. Nó KHÔNG chấm giọng hay dở, và app không đổi nó ra điểm. */
let nt = null;      // { khoa, tu: [từ], ban: {từ: từ kia trong cặp}, chon, luot: [], am, canhBao, tuDo }

function taoNoiThu(khoa, tu, cap, am, canhBao, tuDo) {
  if (nt && nt.khoa === khoa) return nt;          // vẽ lại cùng một màn: giữ từ đang chọn và các lượt đã nói
  const ban = {}, ds = [];
  for (const [a, b] of cap || []) {
    ban[a] = b; ban[b] = a;
    for (const t of [a, b]) if (!ds.includes(t)) ds.push(t);
  }
  for (const t of tu || []) if (!ds.includes(t)) ds.push(t);
  nt = { khoa, tu: ds, ban, chon: tuDo ? -1 : 0, luot: [], am: am || '', canhBao: canhBao || '', tuDo: !!tuDo };
  return nt;
}

/* So chữ máy nghe ra với từ người dùng định nói. So KHỚP NGUYÊN TỪ, không so "gần giống": với một từ
   đơn, gần giống là sai — "bucks" gần "books" lắm, nhưng máy đã hiểu thành một từ khác. Có tính từ
   đồng âm thật (see/sea, write/right) và chữ số (máy hay ghi "five" thành "5"). */
function soChu(nghe, dich, ban) {
  const N = self.TDTD_NGHE, TN = self.TDTD_TUNGUOI;
  const c = (x) => (N ? N.chuanHoa(x) : String(x || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim());
  const n = c(nghe);
  if (!n) return 'rong';
  if (!dich) return 'tudo';
  const khop = (t) => {
    if (!t) return false;
    const ct = c(t);
    if (n === ct) return true;
    return ((TN && TN.DONG && TN.DONG[ct]) || []).some(d => c(d) === n);
  };
  if (khop(dich)) return 'dung';
  if (ban && khop(ban)) return 'ban';
  if (n.split(' ').includes(c(dich)) && !(ban && n.split(' ').includes(c(ban)))) return 'dung';   // "the books"
  return 'khac';
}

function kqNoiThu(l) {
  if (!l) return '';
  if (l.kieu === 'loi') return `<div class="pa-nt-kq loi"><b>${esc(l.chu)}</b></div>`;
  const nghe = `<b>Máy nghe ra: “${esc(l.nghe)}”</b>${l.nghe && phienAm(l.nghe) ? phienAm(l.nghe) : ''}`;
  const khac = l.khac && l.khac.length ? `<i>Máy còn phân vân giữa: ${l.khac.map(k => '“' + esc(k) + '”').join(', ')}</i>` : '';
  if (l.kieu === 'tudo') return `<div class="pa-nt-kq">${nghe}${khac}</div>`;
  if (l.kieu === 'dung') return `<div class="pa-nt-kq dung">${nghe}<span>Đúng từ bạn định nói.</span>${khac}</div>`;
  if (l.kieu === 'ban') return `<div class="pa-nt-kq sai">${nghe}<span>Máy hiểu thành từ kia trong cặp. Chỗ khác nhau giữa
    “${esc(l.tu)}” và “${esc(l.ban)}”${l.am ? ' (' + esc(l.am) + ')' : ''} chưa ra rõ — bấm nghe mẫu rồi thử lại.</span>${khac}</div>`;
  return `<div class="pa-nt-kq sai">${nghe}<span>Không khớp “${esc(l.tu)}”. Nói chậm, rõ, mỗi lần một từ, rồi thử lại.</span>${khac}</div>`;
}

function veNoiThu() {
  if (!nt) return '';
  const dich = nt.chon >= 0 ? nt.tu[nt.chon] : null;
  const coDich = nt.luot.filter(l => l.tu && (l.kieu === 'dung' || l.kieu === 'ban' || l.kieu === 'khac'));
  const dung = coDich.filter(l => l.kieu === 'dung').length;
  if (!coNghe()) return `<div class="pa-khoi pa-nt pa-mo">
    <p class="pa-nhan">Nói thử — máy nghe ra chữ gì?</p>
    <p class="pa-chu pa-nho">${IOS_CAI
      ? 'iPhone khi mở từ biểu tượng ngoài màn hình chính thì không cho trang web dùng micro. Mở trang này trong Safari là nói thử được.'
      : 'Trình duyệt này không có phần nhận giọng nói. Chrome, Edge hay Safari thì chạy được.'}</p></div>`;
  return `<div class="pa-khoi pa-nt">
    <p class="pa-nhan">Nói thử — máy nghe ra chữ gì?</p>
    <p class="pa-chu pa-nho">${dich ? 'Chọn một từ, bấm micro rồi nói đúng từ đó.' : 'Bấm micro rồi nói một từ hoặc một câu tiếng Anh.'}
      Máy sẽ ghi ra chữ nó nghe được — như một người nghe không quen giọng bạn. Đây không phải chấm giọng hay dở:
      nó chỉ cho biết người nghe hiểu ra chữ gì.</p>
    ${nt.canhBao ? `<p class="pa-chu pa-nho pa-nt-canh">${esc(nt.canhBao)}</p>` : ''}
    ${nt.tu.length ? `<div class="pa-nt-chon">
      ${nt.tuDo ? `<button class="pa-nt-tu${nt.chon < 0 ? ' dang' : ''}" data-nt="-1" type="button"><b>Nói tự do</b><i class="pa-pa">từ hay câu bất kỳ</i></button>` : ''}
      ${nt.tu.map((t, i) => `<button class="pa-nt-tu${i === nt.chon ? ' dang' : ''}" data-nt="${i}" type="button"><b>${esc(t)}</b>${phienAm(t, true)}</button>`).join('')}
    </div>` : ''}
    ${dich ? `<button class="pa-phu-nut pa-nt-mau" type="button">▶ Nghe mẫu “${esc(dich)}”</button>` : ''}
    <button class="pa-mic pa-nt-mic" type="button">● ${dich ? `Nhấn rồi nói “${esc(dich)}”` : 'Nhấn rồi nói'}</button>
    <p class="pa-loi pa-nt-bao" role="status"></p>
    <div class="pa-nt-kqs" aria-live="polite">${kqNoiThu(nt.luot[0])}</div>
    ${coDich.length >= 2 ? `<p class="pa-chu pa-nho">Buổi này máy hiểu đúng ${dung}/${coDich.length} lần.</p>` : ''}
    ${nt.luot.length > 1 ? `<div class="pa-luot">${nt.luot.slice(1, 7).map(l => `<span class="${l.kieu === 'dung' ? 'dung' : l.kieu === 'tudo' ? '' : 'sai'}">${
      l.tu ? esc(l.tu) + ' → ' : ''}${esc(l.nghe || l.chu || '—')}</span>`).join('')}</div>` : ''}
    ${daBaoGui ? '' : `<p class="pa-gui">Bấm micro là giọng bạn được gửi lên máy chủ của hãng trình duyệt (Google, Apple...) để nhận
      ra chữ, giống gõ bằng giọng nói. App không lưu gì. Phần hình và phần nghe thì không gửi gì đi đâu cả.</p>`}
    <p class="pa-chu pa-nho pa-thua">Đo trên máy nhận giọng nói, giọng người Việt bị chép sai nhiều nhất trong sáu nhóm từng được đo
      — khoảng một phần bảy số từ bị chép sai kể cả khi nói tốt. Một lần sai chưa nói lên gì: thử vài lần.</p>
  </div>`;
}

function veLaiNoiThu() {
  const k = oTrong && oTrong.querySelector('.pa-nt');
  if (!k) return;
  k.outerHTML = veNoiThu();
  ganNoiThu();
}

function ganNoiThu() {
  const k = oTrong && oTrong.querySelector('.pa-nt');
  if (!k || !nt) return;
  k.querySelectorAll('[data-nt]').forEach(n => { n.onclick = () => { if (dangNghe) return; nt.chon = +n.dataset.nt; veLaiNoiThu(); }; });
  const mau = k.querySelector('.pa-nt-mau');
  if (mau) mau.onclick = () => {
    const t = nt.tu[nt.chon], b = nt.ban[t];
    luotVd[t] = luotVd[t] === undefined ? 0 : luotVd[t] + 1;
    if (b) docCap([t, b], 0, luotVd[t], mau); else doc(t, false, luotVd[t], mau);
  };
  const mic = k.querySelector('.pa-nt-mic');
  if (mic) mic.onclick = ngheNoiThu;
}

function baoNt(chu) { const n = oTrong && oTrong.querySelector('.pa-nt-bao'); if (n) n.textContent = chu; }

function ngheNoiThu() {
  if (dangNghe || !nt) return;
  if (dangThu || dangThuLe) { baoNt('Micro đang bận thu ở phần khác — chờ nó xong đã.'); return; }
  const RS = self.SpeechRecognition || self.webkitSpeechRecognition;
  if (IOS_CAI) { baoNt('iPhone mở từ biểu tượng ngoài màn hình chính thì không cho dùng micro. Mở trang này trong Safari là nói được.'); return; }
  if (!RS) { baoNt('Trình duyệt này không nghe được. Chrome, Edge hay Safari thì được.'); return; }
  imLang();                          // tắt tiếng mẫu đang kêu: micro mà thu luôn tiếng mẫu thì máy chép tiếng mẫu
  try { if (mayNghe) mayNghe.abort(); } catch (e) {}
  const dich = nt.chon >= 0 ? nt.tu[nt.chon] : null, ban = dich ? nt.ban[dich] : null;
  const the = phienMan, khoa = nt.khoa;
  mayNghe = new RS();
  mayNghe.lang = 'en-US'; mayNghe.continuous = false; mayNghe.interimResults = false; mayNghe.maxAlternatives = 5;
  let ds = [], loi = null;
  daBaoGui = true;
  dangNghe = true;
  const mic = oTrong.querySelector('.pa-nt-mic');
  if (mic) { mic.classList.add('dang'); mic.textContent = 'Đang mở micro…'; }
  baoNt('');
  mayNghe.onaudiostart = () => { if (mic) mic.textContent = dich ? `Đang nghe… nói “${dich}”` : 'Đang nghe… nói đi'; };
  mayNghe.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      for (let k = 0; k < r.length; k++) ds.push(r[k].transcript);
    }
  };
  mayNghe.onerror = (e) => { loi = e.error; };
  mayNghe.onend = () => {
    dangNghe = false;
    if (the !== phienMan || !nt || nt.khoa !== khoa) return;      // đã rời màn trong lúc nghe
    let l;
    if (loi === 'not-allowed') l = { kieu: 'loi', chu: 'Máy chưa cho dùng micro. Bật quyền micro cho trang này rồi thử lại.' };
    else if (loi === 'service-not-allowed') l = { kieu: 'loi', chu: 'Trình duyệt đang tắt dịch vụ nhận giọng nói (hay gặp ở cửa sổ ẩn danh, hoặc khi chưa bật Đọc chính tả trong cài đặt máy).' };
    else if (loi === 'network') l = { kieu: 'loi', chu: 'Nhận giọng nói cần mạng, mà mạng đang trục trặc.' };
    else if (loi === 'no-speech' || (!loi && !ds.length)) l = { kieu: 'loi', chu: 'Máy không nghe thấy gì. Nói to hơn, gần máy hơn một chút.' };
    else if (loi && loi !== 'aborted') l = { kieu: 'loi', chu: 'Nghe không được (' + loi + ').' };
    else if (loi === 'aborted') { veLaiNoiThu(); return; }
    else {
      const dau = String(ds[0] || '').trim();
      const kieu = soChu(dau, dich, ban);
      const da = new Set([dau.toLowerCase()]);
      const khac = ds.slice(1).map(x => String(x).trim()).filter(x => x && !da.has(x.toLowerCase()) && da.add(x.toLowerCase())).slice(0, 3);
      l = { kieu, nghe: dau, tu: dich, ban, am: nt.am, khac };
    }
    nt.luot.unshift(l);
    if (nt.luot.length > 12) nt.luot.pop();
    veLaiNoiThu();
  };
  try { mayNghe.start(); } catch (e) { dangNghe = false; veLaiNoiThu(); baoNt('Không mở được micro.'); }
}

/* Quyết định cho một lượt nói. Tách khỏi phần vẽ để kiểm thử được bằng Node — chính vì trước
   đây nó dính liền với phần vẽ nên không có bài kiểm nào, và lỗi dưới đây lọt ra tới người dùng.

   CHỈ xét phương án ĐẦU, không đem cả danh sách đi so. Máy nhận giọng trả về tới năm phương án,
   mà với cặp tối thiểu thì danh sách đó gần như luôn chứa CẢ HAI từ — hai từ vốn giống nhau, đó
   là lý do chúng thành một cặp. Đem cả danh sách đi so thì phương án này khớp "books" hoàn hảo,
   phương án kia khớp "book" hoàn hảo, bộ so khớp thấy hoà bèn báo "không phân biệt được", và
   người nói đúng vẫn bị đếm sai — đúng mãi mãi 0 điểm.
   Thứ đo được thật là máy QUYẾT bạn vừa nói từ nào, tức phương án xếp đầu. */
function quyet(ds, cap) {
  const dau = (ds && ds[0] ? String(ds[0]) : '').trim();
  if (!dau || !cap) return { nghe: dau, chi: -1, dung: false };
  const k = soChu(dau, cap[0], cap[1]);
  return { nghe: dau, chi: k === 'dung' ? 0 : k === 'ban' ? 1 : -1, dung: k === 'dung' };
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
  thoiNghe(); thoiHinh(); roiMan();
  if (huyThu) huyThu();                         // đang thu dở thì tắt micro ngay, đèn micro tắt theo
  amLe = null; quayVe = null;
  phienTai++;                                   // đóng sao rồi thì hẹn giờ cũ đừng kêu nữa
  if (ac) { try { ac.suspend(); } catch (e) {} }
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });

self.TDTD_PHATAM = { mo, dong, _am: AM,
  _le: (ma) => veLe(ma),
  _baiAm: (ma) => baiAm(self.TDTD_AMNGUOI.tim(ma)),
  _dsMau: (a) => dsMau(a).map(m => m.f),
  _amLe: () => amLe && amLe.ma,
  _daPhat: () => daPhat.slice(),
  _gonTieng: (x, sr) => gonTieng(x, sr),
  _dsNguoi: (a) => dsNguoi(a).map(d => (d.laSai ? '!' : '') + d.x.ma),
  _dangThu: () => !!huyThu,
  _phat: (t, k) => phatAm(t, k),
  _loa: () => ac && ac.state,
  _giong: () => dsGiong.map(v => v.name),
  _buoc: () => buoc,
  _soBuoc: (a) => cacBuoc(a),
  _khung: (kh, tac) => khungHinh(kh, tac),
  _tai: () => ({ lich: taiLich, vi: taiVi, kq: taiKQ }),
  _chonTai: (a) => chonTai(a),
  _batTai: (a) => batTai(a),
  _moAm: (i) => moAm(AM[i]),
  _tuDo: () => veNoiTuDo(),
  _xepLich: (a) => xepLich(a),
  _noiThu: () => nt && { tu: nt.tu.slice(), chon: nt.chon, ban: Object.assign({}, nt.ban), luot: nt.luot.slice() },
  _soChu: (n, d, b) => soChu(n, d, b),
  _quyet: (ds, cap) => quyet(ds, cap),
  _mauGia: (x, sr) => { mauGia.push({ x, sr }); return mauGia.length; },
  _doKq: () => doKq,
  _doLuot: () => doLuot.slice(),
  _trangThai: () => ({ am: am ? am.ipa : null, cap: capDang ? capDang[0] + '/' + capDang[1] : null, luot: luot.length,
                       dung: luot.filter(l => l.dung).length, nghe: coNghe() }) };
})();
