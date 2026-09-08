/* Kiểm thử lõi: node scripts/test-core.js */
const C = require('../assets/core.js');
const cards = require('../data/cards.json');
const IDS = cards.map(c => c.id);
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${name}${extra ? ' — ' + extra : ''}`); };

console.log('\n— Ngày địa phương —');
ok('ymd đúng định dạng', C.ymd(new Date(2026, 8, 8)) === '2026-09-08', C.ymd(new Date(2026, 8, 8)));
ok('không lệch UTC lúc 00:30', C.ymd(new Date(2026, 0, 1, 0, 30)) === '2026-01-01');
ok('không lệch UTC lúc 23:30', C.ymd(new Date(2026, 0, 1, 23, 30)) === '2026-01-01');
ok('qua cuối tháng', C.addDays('2026-01-31', 1) === '2026-02-01');
ok('lùi qua đầu năm', C.addDays('2026-01-01', -1) === '2025-12-31');
ok('năm nhuận 2028', C.addDays('2028-02-28', 1) === '2028-02-29');

console.log('\n— Xáo bài có hạt giống —');
const s1 = C.shuffle(IDS, 12345), s2 = C.shuffle(IDS, 12345), s3 = C.shuffle(IDS, 999);
ok('cùng seed cho cùng kết quả', JSON.stringify(s1) === JSON.stringify(s2));
ok('seed khác cho kết quả khác', JSON.stringify(s1) !== JSON.stringify(s3));
ok('giữ đủ 100 lá, không mất không thêm', new Set(s1).size === 100 && s1.length === 100);
ok('thực sự có đảo thứ tự', JSON.stringify(s1) !== JSON.stringify(IDS));

console.log('\n— Không lặp lá trong 100 ngày —');
for (const seed of [1, 42, 777, 2 ** 30, -55]) {
  const got = Array.from({ length: 100 }, (_, i) => C.nextCardId(IDS, seed, i));
  ok(`seed ${seed}: 100 ngày đủ 100 lá khác nhau`, new Set(got).size === 100);
}

console.log('\n— Vòng thứ hai xáo lại —');
const v1 = Array.from({ length: 100 }, (_, i) => C.nextCardId(IDS, 42, i));
const v2 = Array.from({ length: 100 }, (_, i) => C.nextCardId(IDS, 42, 100 + i));
ok('vòng 2 vẫn đủ 100 lá khác nhau', new Set(v2).size === 100);
ok('vòng 2 có thứ tự khác vòng 1', JSON.stringify(v1) !== JSON.stringify(v2));
const same = v1.filter((x, i) => x === v2[i]).length;
ok('vòng 2 không trùng vị trí quá nhiều', same < 10, `${same}/100 vị trí trùng`);
ok('300 ngày vẫn chạy đúng', new Set(Array.from({ length: 100 }, (_, i) => C.nextCardId(IDS, 42, 200 + i))).size === 100);

console.log('\n— Ổn định: mở lại app không đổi kết quả —');
ok('cùng số lá đã rút cho cùng lá kế tiếp',
   C.nextCardId(IDS, 42, 7) === C.nextCardId(IDS, 42, 7));

console.log('\n— Chuỗi ngày —');
const mk = (...ds) => ds.map(d => ({ d, id: 1 }));
ok('chưa rút lần nào = 0', C.streakOf([], '2026-09-08') === 0);
ok('rút hôm nay = 1', C.streakOf(mk('2026-09-08'), '2026-09-08') === 1);
ok('3 ngày liên tiếp tới hôm nay = 3', C.streakOf(mk('2026-09-06', '2026-09-07', '2026-09-08'), '2026-09-08') === 3);
ok('hôm nay chưa rút nhưng hôm qua có = 2', C.streakOf(mk('2026-09-06', '2026-09-07'), '2026-09-08') === 2);
ok('đứt quãng thì tính lại từ đầu', C.streakOf(mk('2026-09-01', '2026-09-02', '2026-09-08'), '2026-09-08') === 1);
ok('bỏ 2 ngày thì chuỗi = 0', C.streakOf(mk('2026-09-01', '2026-09-02'), '2026-09-08') === 0);
ok('chuỗi vắt qua đầu tháng', C.streakOf(mk('2026-08-30', '2026-08-31', '2026-09-01'), '2026-09-01') === 3);

console.log('\n— Dữ liệu —');
ok('đúng 100 lá', cards.length === 100);
ok('ID liên tục 1–100', IDS.every((v, i) => v === i + 1));
ok('không lá nào thiếu thông điệp', cards.every(c => c.thong_diep && c.thong_diep.length > 40));
ok('không lá nào thiếu ý nghĩa', cards.every(c => c.y_nghia && c.y_nghia.length > 15));
ok('không trùng thông điệp', new Set(cards.map(c => c.thong_diep.toLowerCase())).size === 100);
ok('không lọt "HEBs"', !cards.some(c => (c.thong_diep + c.y_nghia).includes('HEBs')));
ok('không lọt tên riêng "Kiên"', !cards.some(c => (c.thong_diep + c.y_nghia).includes('Kiên')));

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
