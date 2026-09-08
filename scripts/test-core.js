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

const S1 = 123456, S2 = 987654;
console.log('\n— Lá của ngày, riêng cho từng người —');
ok('cùng người cùng ngày luôn ra cùng lá', C.cardFor(IDS, '2026-09-08', S1) === C.cardFor(IDS, '2026-09-08', S1));
ok('hai ngày liền kề khác lá', C.cardFor(IDS, '2026-09-08', S1) !== C.cardFor(IDS, '2026-09-09', S1));
ok('ngày trước mốc vẫn hợp lệ', IDS.includes(C.cardFor(IDS, '2020-03-15', S1)));
ok('ngày xa trong tương lai vẫn hợp lệ', IDS.includes(C.cardFor(IDS, '2099-12-31', S1)));
let khac = 0;
for (let k = 0; k < 200; k++) if (C.cardFor(IDS, '2026-09-08', k * 7919 + 13) !== C.cardFor(IDS, '2026-09-08', S1)) khac++;
ok('200 người khác hạt giống: đa số nhận lá khác nhau', khac > 190, `${khac}/200 khác`);
const spread = new Set(Array.from({ length: 500 }, (_, k) => C.cardFor(IDS, '2026-09-08', C.mulberry32(k)() * 2 ** 31 | 0)));
ok('500 người trải đều trên nhiều lá', spread.size > 60, `chạm ${spread.size}/100 lá`);
ok('newSeed sinh giá trị khác nhau', C.newSeed() !== C.newSeed());

console.log('\n— Mỗi vòng 100 ngày đi trọn bộ bài —');
let allFull = true, worst = '';
for (const sd of [S1, S2, 0, -991, 2 ** 30]) {
  for (let r = 0; r < 20; r++) {
    const blk = Array.from({ length: 100 }, (_, i) => C.cardFor(IDS, C.addDays('2026-01-01', r * 100 + i), sd));
    if (new Set(blk).size !== 100) { allFull = false; worst = `hạt giống ${sd}, vòng ${r}`; }
  }
}
ok('5 hạt giống × 20 vòng: vòng nào cũng đủ 100 lá khác nhau', allFull, worst);

console.log('\n— Không gặp lại lá quá sớm —');
let minGap = Infinity, when = '';
for (const sd of [S1, S2, 7, -3, 2 ** 29]) {
  let d = '2026-01-01', last = {};
  for (let k = 0; k < 3000; k++) {
    const id = C.cardFor(IDS, d, sd);
    if (last[id] !== undefined && k - last[id] < minGap) { minGap = k - last[id]; when = `${d}, hạt giống ${sd}`; }
    last[id] = k; d = C.addDays(d, 1);
  }
}
ok('5 hạt giống × 3000 ngày: khoảng cách trùng lá > 50 ngày', minGap > 50, `nhỏ nhất ${minGap} ngày (${when})`);

console.log('\n— Số may mắn (giải trí) —');
const L1 = C.luckyNumbers('2026-09-08', S1, 6, 45, 1);
ok('đủ 6 số', L1.length === 6);
ok('không trùng số', new Set(L1).size === 6);
ok('nằm trong 1–45', L1.every(n => n >= 1 && n <= 45));
ok('đã sắp tăng dần', L1.every((n, i) => i === 0 || n >= L1[i - 1]));
ok('cùng người cùng ngày ra cùng bộ', JSON.stringify(L1) === JSON.stringify(C.luckyNumbers('2026-09-08', S1, 6, 45, 1)));
ok('người khác ra bộ khác', JSON.stringify(L1) !== JSON.stringify(C.luckyNumbers('2026-09-08', S2, 6, 45, 1)));
ok('ngày khác ra bộ khác', JSON.stringify(L1) !== JSON.stringify(C.luckyNumbers('2026-09-09', S1, 6, 45, 1)));
ok('hai loại vé ra bộ khác', JSON.stringify(L1) !== JSON.stringify(C.luckyNumbers('2026-09-08', S1, 6, 45, 2)));
ok('Power 6/55 nằm trong 1–55', C.luckyNumbers('2026-09-08', S1, 6, 55, 2).every(n => n >= 1 && n <= 55));
const L535 = C.luckyNumbers('2026-09-08', S1, 5, 35, 4);
ok('Điện toán 5/35 đủ 5 số trong 1–35', L535.length === 5 && L535.every(n => n >= 1 && n <= 35), L535.join(' '));
ok('Điện toán 5/35 không trùng số', new Set(L535).size === 5);
ok('4 loại vé cho 4 bộ khác nhau', new Set([
  C.luckyNumbers('2026-09-08', S1, 6, 45, 1).join(),
  C.luckyNumbers('2026-09-08', S1, 6, 55, 2).join(),
  L535.join(),
  C.luckyDigits('2026-09-08', S1, 6, 3),
]).size === 4);
const D1 = C.luckyDigits('2026-09-08', S1, 6, 3);
ok('giải đặc biệt đúng 6 chữ số', /^\d{6}$/.test(D1), D1);
ok('giải đặc biệt ổn định trong ngày', D1 === C.luckyDigits('2026-09-08', S1, 6, 3));
let deu = new Set();
for (let k = 0; k < 300; k++) deu.add(C.luckyNumbers('2026-09-08', k * 7919 + 3, 6, 45, 1).join());
ok('300 người cho 300 bộ số gần như đều khác nhau', deu.size > 295, `${deu.size}/300 bộ khác nhau`);

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
