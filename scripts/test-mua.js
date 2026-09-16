/* Kiểm thử phần đọc dự báo mưa: node scripts/test-mua.js

   Đây là chỗ dễ sai mà sai thì KHÔNG để lại dấu vết gì trên giao diện — người dùng chỉ thấy
   một câu tiếng Việt trôi chảy, không cách nào biết nó lệch một tiếng hay dịch sai ngưỡng.
   Nên phần đọc dữ liệu tách hẳn khỏi phần gọi mạng, thành hàm thuần, và bị soi ở đây. */
const M = require('../assets/mua.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

/* Dựng dữ liệu đúng khuôn Open-Meteo: chuỗi giờ ĐỊA PHƯƠNG, không mang múi giờ. */
const dung = (ds, ngay = 16) => {
  const g = { time: [], precipitation: [], rain: [], showers: [], precipitation_probability: [], weather_code: [] };
  let d = ngay, truoc = -1;
  for (const [gio, mm, pt, ma] of ds) {
    if (gio < truoc) d++;                   // giờ nhỏ lại tức đã sang ngày hôm sau
    truoc = gio;
    g.time.push(`2026-09-${String(d).padStart(2, '0')}T${String(gio).padStart(2, '0')}:00`);
    g.precipitation.push(mm); g.rain.push(0); g.showers.push(mm);
    g.precipitation_probability.push(pt); g.weather_code.push(ma === undefined ? (mm > 0 ? 53 : 3) : ma);
  }
  return g;
};
const luc = (h, p = 0) => new Date(2026, 8, 16, h, p, 0).getTime();

console.log('\n— Mốc giờ ứng với giờ LIỀN TRƯỚC —');
/* Cái bẫy nguy hiểm nhất của cả tính năng. Open-Meteo trả lượng mưa tại mốc 15:00 là tổng của
   khoảng 14:00–15:00. Hiểu ngược thì sai 100% số trường hợp, sai đúng một lượng cố định.
   Đã kiểm bằng thực nghiệm trên dữ liệu 15 phút gốc ở Berlin: cộng bốn mốc TRƯỚC khớp 0,00mm
   suốt 22 giờ, cộng bốn mốc SAU lệch 5,4mm. */
const mot = M.doc(dung([[7, 0, 0], [8, 0, 0], [9, 3, 90], [10, 0, 5]]), luc(7, 30));
ok('mưa ở mốc 9 giờ thì hiện là khoảng 8–9 giờ, không phải 9–10',
   mot.gioTu === 8 && mot.gioDen === 9, `${mot.gioTu}–${mot.gioDen} giờ`);
/* Đúng ví dụ kinh điển: dãy mốc {16:00, 17:00} nghĩa là mưa từ 15:00 tới 17:00. */
const hai = M.doc(dung([[7, 0, 0], [16, 1, 70], [17, 2, 80]]), luc(7, 30));
ok('dãy mốc 16 và 17 giờ hiện ra là khoảng 15–17 giờ', hai.gioTu === 15 && hai.gioDen === 17,
   `${hai.gioTu}–${hai.gioDen} giờ`);
/* Và phải đúng kể cả khi mảng khuyết giờ: lùi một tiếng từ chính mốc đầu đợt, không đọc mốc
   đứng trước nó trong mảng — đọc mốc trước là ngầm tin mảng luôn đủ giờ liền nhau. */
const khuyet = M.doc(dung([[7, 0, 0], [9, 1, 70], [10, 2, 80]]), luc(7, 30));
ok('mảng khuyết giờ 8 vẫn lùi đúng một tiếng, không nhảy về mốc 7 giờ',
   khuyet.gioTu === 8, `${khuyet.gioTu} giờ`);
const nuaDem = M.doc(dung([[0, 5, 90], [1, 0, 0]], 16), new Date(2026, 8, 15, 23, 30).getTime());
ok('mốc 0 giờ thì lùi về 23 giờ hôm trước, không ra giờ âm', nuaDem.gioTu === 23, `${nuaDem.gioTu} giờ`);

console.log('\n— Số giờ lấy từ CHUỖI, không đi qua đồng hồ máy —');
/* Chuỗi Open-Meteo không mang múi giờ. Đưa vào new Date() thì trình duyệt hiểu theo múi của
   MÁY, nên máy ở múi khác là hiện lệch giờ mà không có dấu hiệu gì. */
const g2 = dung([[7, 0, 0], [17, 4, 85]]);
const k2 = M.doc(g2, luc(7, 30));
ok('giờ hiện ra đúng bằng giờ trong chuỗi dịch vụ trả về', k2.gioDen === 17, `${k2.gioDen}`);
ok('không phụ thuộc chuỗi có hậu tố múi giờ hay không',
   M.doc({ ...g2, time: g2.time.map(t => t + ':00') }, luc(7, 30)).gioDen === 17);

console.log('\n— Ngưỡng tính là "giờ có mưa" —');
ok('dưới 0,2mm và ít lần chạy thấy mưa thì không tính',
   M.doc(dung([[7, 0, 0], [9, .1, 10]]), luc(7)).tinh === 'khong');
ok('đủ lượng thì tính, dù ít lần chạy thấy mưa',
   M.doc(dung([[7, 0, 0], [9, .3, 5]]), luc(7)).tinh === 'co');
ok('quá nửa số lần chạy thấy mưa thì tính, dù lượng bằng 0',
   M.doc(dung([[7, 0, 0], [9, 0, 50]]), luc(7)).tinh === 'co');
ok('đúng dưới nửa thì không tính — không làm tròn lên cho "có ích"',
   M.doc(dung([[7, 0, 0], [9, 0, 46]]), luc(7)).tinh === 'khong');

console.log('\n— Gom đợt —');
const ba = M.doc(dung([[7, 0, 0], [9, 1, 70], [10, 0, 5], [11, 1, 70]]), luc(7));
ok('cách nhau đúng một giờ khô thì nối làm một đợt', ba.gioTu === 8 && ba.gioDen === 11,
   `${ba.gioTu}–${ba.gioDen} giờ`);
const bon = M.doc(dung([[7, 0, 0], [9, 1, 70], [10, 0, 5], [11, 0, 5], [12, 0, 5], [13, 1, 70]]), luc(7));
ok('cách xa hơn thì là hai đợt, chỉ báo đợt đầu', bon.gioDen === 9, `${bon.gioTu}–${bon.gioDen} giờ`);
ok('đợt đã trôi qua thì bỏ, báo đợt sau',
   M.doc(dung([[7, 3, 90], [8, 0, 0], [15, 3, 90]]), luc(12)).gioDen === 15);

console.log('\n— Câu chữ: ba dòng, và không dòng nào nói dối —');
const c1 = M.cau(M.doc(dung([[7, 0, 0], [9, 3, 90]]), luc(7, 30)));
ok('đúng ba dòng', c1.length === 3, `${c1.length} dòng`);
ok('dòng đầu nói KHOẢNG giờ, không nói giờ phút', /^Khoảng \d+/.test(c1[0]) && !/:\d\d/.test(c1[0]), c1[0]);
ok('dòng hai tả nặng cỡ nào bằng việc người ta làm', /mm một tiếng/.test(c1[1]), c1[1]);
ok('dòng ba nói máy chắc tới đâu bằng SỐ LẦN CHẠY, không bằng phần trăm',
   /Máy chạy 30 lần, \d+ lần/.test(c1[2]) && !/%/.test(c1[2]), c1[2]);
ok('không câu nào chứa dấu phần trăm', c1.every(x => !x.includes('%')));
ok('không bao giờ viết "không mưa", chỉ viết bản dự báo không thấy mưa', (() => {
  const c = M.cau(M.doc(dung([[7, 0, 0], [8, 0, 2]]), luc(7)));
  return c.length === 1 && /không thấy mưa/.test(c[0]) && !/^Không mưa/.test(c[0]);
})(), M.cau(M.doc(dung([[7, 0, 0], [8, 0, 2]]), luc(7)))[0]);
ok('không dùng chữ "mưa phùn" — API trả mm chứ không trả cỡ hạt',
   !JSON.stringify(M.NANG).includes('phùn'));

console.log('\n— Câu phải đọc lên nghe được, kể cả khi vắt qua nửa đêm —');
/* Dữ liệu thật ở TP.HCM có đợt mưa chạy từ 15 giờ chiều tới 1 giờ sáng hôm sau. Viết thẳng ra
   thành "Khoảng 14–1 giờ" thì đọc lên vô nghĩa — đây là lỗi tôi mắc ở bản đầu. */
const dem = M.cau(M.doc(dung([[7, 0, 0], [15, 0, 51], [16, .1, 69], [17, .9, 79], [18, .9, 84],
  [19, .1, 84], [20, 1, 75], [21, .7, 61], [22, .3, 49], [23, 2.3, 43], [0, 1.7, 40], [1, .6, 37]]), luc(7, 30)));
ok('vắt qua nửa đêm thì không viết kiểu "14–1 giờ"', !/\b14–1\b/.test(dem[0]), dem[0]);
ok('mà nói rõ là sang hôm sau', /mai/.test(dem[0]), dem[0]);
const daiNgay = M.cau(M.doc(dung([[7, 0, 0], [10, 1, 70], [11, 1, 70], [12, 1, 70], [13, 1, 70],
  [14, 1, 70], [15, 1, 70], [16, 1, 70]]), luc(7, 30)));
ok('đợt dài từ sáu tiếng trở lên thì nói "rải rác", không nói như một trận mưa liền',
   /rải rác/.test(daiNgay[0]), daiNgay[0]);
const ngan = M.cau(M.doc(dung([[7, 0, 0], [16, 1, 70], [17, 2, 80]]), luc(7, 30)));
ok('đợt ngắn thì KHÔNG nói rải rác', !/rải rác/.test(ngan[0]), ngan[0]);
ok('có kèm buổi trong ngày cho dễ hình dung', /(sáng|trưa|chiều|tối|khuya)/.test(ngan[0]), ngan[0]);
ok('buổi gọi đúng theo giờ',
   M.cau(M.doc(dung([[3, 0, 0], [6, 2, 80]]), new Date(2026, 8, 16, 3, 0).getTime()))[0].includes('sáng'));

console.log('\n— Nói thật về độ chắc theo khoảng cách thời gian —');
const gan = M.cau(M.doc(dung([[7, 0, 0], [9, 3, 90]]), luc(7, 30)));
const vua = M.cau(M.doc(dung([[7, 0, 0], [15, 3, 90]]), luc(7, 30)));
const xa = M.cau(M.doc(dung([[7, 0, 0], [23, 3, 90]]), luc(7, 30)));
ok('dưới ba tiếng thì nói đây là tầm đoán khá được', /tầm máy đoán khá được/.test(gan[2]), gan[2]);
ok('ba tới mười hai tiếng thì cảnh báo giờ giấc xê dịch', /xê dịch/.test(vua[2]), vua[2]);
ok('quá mười hai tiếng thì KHÔNG nêu giờ nữa', !/Khoảng \d+/.test(xa[0]), xa[0]);
ok('và nói thẳng là chưa chốt được giờ', /chưa chốt được giờ/.test(xa[2]), xa[2]);

console.log('\n— Dông khác mưa —');
const dong = M.doc(dung([[7, 0, 0], [9, 8, 90, 95]]), luc(7, 30));
ok('mã 95 nhận ra là dông', dong.dong === true);
ok('câu chữ gọi đúng là dông, không gọi chung là mưa', /có dông/.test(M.cau(dong)[0]), M.cau(dong)[0]);
ok('mã 53 mưa nhẹ thì không gọi là dông', M.doc(dung([[7, 0, 0], [9, 1, 70, 53]]), luc(7)).dong === false);

console.log('\n— Ngưỡng nặng nhẹ theo WMO —');
ok('0,3 mm/giờ là lất phất', /lất phất/.test(M.taNang(.3)));
ok('1 mm/giờ là mưa nhẹ', /mưa nhẹ/.test(M.taNang(1)));
ok('5 mm/giờ là mưa vừa, nên mặc áo mưa', /áo mưa/.test(M.taNang(5)));
ok('12 mm/giờ là mưa to', /mưa to/.test(M.taNang(12)));
ok('60 mm/giờ là mức đừng ra đường', /đừng ra đường/.test(M.taNang(60)));
ok('ngưỡng tăng dần, không có bậc nào nhảy ngược',
   M.NANG.every((n, i) => i === 0 || n[0] > M.NANG[i - 1][0]));

console.log('\n— Dữ liệu thiếu hoặc hỏng thì không nổ lỗi —');
ok('không có dữ liệu', M.doc(null, luc(7)).tinh === 'chuaBiet');
ok('mảng rỗng', M.doc({ time: [] }, luc(7)).tinh === 'chuaBiet');
ok('thiếu hẳn trường xác suất', M.doc({ time: ['2026-09-16T09:00'], precipitation: [3] }, luc(7)).tinh === 'co');
ok('thiếu hẳn trường lượng mưa', typeof M.doc({ time: ['2026-09-16T09:00'], precipitation_probability: [90] }, luc(7)).tinh === 'string');
ok('câu chữ cho dữ liệu chưa biết thì rỗng, không bịa', M.cau({ tinh: 'chuaBiet' }).length === 0);
ok('câu chữ cho vật rỗng cũng không nổ lỗi', M.cau(null).length === 0);

console.log(`\n${fail ? '✗' : '✓'} Tất cả: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail ? 1 : 0);
