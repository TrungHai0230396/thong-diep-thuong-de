/* Kiểm thử lõi: node scripts/test-core.js */
const C = require('../assets/core.js');
const cards = require('../data/cards.json');
const IDS = cards.map(c => c.id);
let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${n}${extra ? ' — ' + extra : ''}`); };

console.log('\n— Ngày địa phương —');
ok('ymd đúng định dạng', C.ymd(new Date(2026, 8, 8)) === '2026-09-08');
ok('không lệch UTC lúc 00:30', C.ymd(new Date(2026, 0, 1, 0, 30)) === '2026-01-01');
ok('không lệch UTC lúc 23:30', C.ymd(new Date(2026, 0, 1, 23, 30)) === '2026-01-01');
ok('qua cuối tháng', C.addDays('2026-01-31', 1) === '2026-02-01');
ok('lùi qua đầu năm', C.addDays('2026-01-01', -1) === '2025-12-31');
ok('năm nhuận 2028', C.addDays('2028-02-28', 1) === '2028-02-29');
ok('dayIndex tăng đều', C.dayIndex('2026-01-02') - C.dayIndex('2026-01-01') === 1);
ok('dayIndex qua năm', C.dayIndex('2027-01-01') - C.dayIndex('2026-01-01') === 365);

console.log('\n— Xáo bài có hạt giống —');
ok('cùng seed cho cùng kết quả', JSON.stringify(C.shuffle(IDS, 7)) === JSON.stringify(C.shuffle(IDS, 7)));
ok('seed khác cho kết quả khác', JSON.stringify(C.shuffle(IDS, 7)) !== JSON.stringify(C.shuffle(IDS, 8)));
ok('giữ đủ 100 lá', new Set(C.shuffle(IDS, 7)).size === 100);
ok('thực sự đảo thứ tự', JSON.stringify(C.shuffle(IDS, 7)) !== JSON.stringify(IDS));

console.log('\n— Lá của ngày: không cần lưu gì —');
ok('cùng ngày luôn ra cùng lá', C.cardForDate(IDS, '2026-09-08') === C.cardForDate(IDS, '2026-09-08'));
ok('hai ngày liền kề khác lá', C.cardForDate(IDS, '2026-09-08') !== C.cardForDate(IDS, '2026-09-09'));
ok('ngày trước mốc vẫn hợp lệ', IDS.includes(C.cardForDate(IDS, '2020-03-15')));
ok('ngày xa trong tương lai vẫn hợp lệ', IDS.includes(C.cardForDate(IDS, '2099-12-31')));

console.log('\n— Mỗi vòng 100 ngày đi trọn bộ bài —');
let allFull = true, worst = 0;
for (let r = 0; r < 30; r++) {
  const blk = Array.from({ length: 100 }, (_, i) => C.cardForDate(IDS, C.addDays('2026-01-01', r * 100 + i)));
  if (new Set(blk).size !== 100) { allFull = false; worst = r; }
}
ok('30 vòng đầu, vòng nào cũng đủ 100 lá khác nhau', allFull, allFull ? '' : `hỏng ở vòng ${worst}`);

console.log('\n— Không gặp lại lá quá sớm —');
let d = '2026-01-01', last = {}, minGap = Infinity, when = '';
for (let k = 0; k < 3000; k++) {
  const id = C.cardForDate(IDS, d);
  if (last[id] !== undefined && k - last[id] < minGap) { minGap = k - last[id]; when = d; }
  last[id] = k; d = C.addDays(d, 1);
}
ok('quét 3000 ngày: khoảng cách trùng lá > 50 ngày', minGap > 50, `nhỏ nhất ${minGap} ngày (${when})`);

console.log('\n— Dữ liệu —');
ok('đúng 100 lá', cards.length === 100);
ok('ID liên tục 1–100', IDS.every((v, i) => v === i + 1));
ok('không lá nào thiếu thông điệp', cards.every(c => c.thong_diep && c.thong_diep.length > 40));
ok('không lá nào thiếu ý nghĩa', cards.every(c => c.y_nghia && c.y_nghia.length > 15));
ok('không trùng thông điệp', new Set(cards.map(c => c.thong_diep.toLowerCase())).size === 100);
ok('không lọt "HEBs"', !cards.some(c => (c.thong_diep + c.y_nghia).includes('HEBs')));
ok('không lọt tên riêng "Kiên"', !cards.some(c => (c.thong_diep + c.y_nghia).includes('Kiên')));
ok('không còn ghi chú cơ chế game trong bundle', !cards.some(c => 'ghi_chu_thiet_ke' in c || 'co_che_game' in c));

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
