/* Kiểm thử trò tập nói tiếng Anh: node scripts/test-english.js
   Phần dễ sai của trò này là nội dung chứ không phải mã, nên kiểm nội dung là chính:
   mỗi lượt đúng một câu đúng, câu sai nào cũng phải có lời giải thích, câu tiếng Anh
   không được lẫn tiếng Việt, và câu phải đủ ngắn cho mức A1. */
const fs = require('fs');
const path = require('path');

/* Vỏ tối thiểu để nạp được file, vì file có gọi addEventListener lúc nạp. */
global.self = global;
global.addEventListener = () => {};
const gia = () => ({ style: {}, dataset: {}, children: [],
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  appendChild(c) { this.children.push(c); return c; }, querySelector() { return null; },
  querySelectorAll() { return []; }, setAttribute() {}, addEventListener() {}, remove() {} });
global.document = { createElement: gia, body: Object.assign(gia(), { classList: { add() {}, remove() {} } }) };

eval(fs.readFileSync(path.join(__dirname, '..', 'assets', 'english.js'), 'utf8'));
const CANH = self.TDTD_ANHNGU._canh;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Bộ cảnh —');
ok('có ít nhất sáu cảnh', CANH.length >= 6, `${CANH.length} cảnh`);
ok('mã cảnh không trùng nhau', new Set(CANH.map(c => c.id)).size === CANH.length);
ok('cảnh nào cũng có tên, mô tả, hình', CANH.every(c => c.ten && c.moTa && c.hinh));
ok('cảnh nào cũng từ bốn lượt trở lên', CANH.every(c => c.luot.length >= 4),
   CANH.map(c => c.luot.length).join('/'));

const luot = CANH.flatMap(c => c.luot.map(l => ({ c, l })));
console.log(`\n— Từng lượt (${luot.length} lượt) —`);
ok('lượt nào cũng có câu của người kia và bản dịch', luot.every(({ l }) => l.ho && l.hoVi));
ok('lượt nào cũng có đúng ba câu để chọn', luot.every(({ l }) => l.chon.length === 3));
ok('lượt nào cũng có **đúng một** câu đúng',
   luot.every(({ l }) => l.chon.filter(o => o.dung).length === 1));
ok('câu nào cũng có bản tiếng Anh và bản dịch', luot.every(({ l }) => l.chon.every(o => o.en && o.vi)));
ok('câu sai nào cũng nói được vì sao sai',
   luot.every(({ l }) => l.chon.filter(o => !o.dung).every(o => o.viSao && o.viSao.length > 8)));
ok('lượt nào cũng có một dòng mẹo', luot.every(({ l }) => l.meo && l.meo.length > 10));

console.log('\n— Tiếng Anh sạch, không lẫn tiếng Việt —');
const cauAnh = luot.flatMap(({ l }) => [l.ho, ...l.chon.map(o => o.en)]);
const dauViet = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i;
ok('không câu tiếng Anh nào lẫn dấu tiếng Việt', cauAnh.every(c => !dauViet.test(c)),
   cauAnh.filter(c => dauViet.test(c))[0] || '');
const dai = cauAnh.map(c => c.split(/\s+/).length);
ok('câu nào cũng ngắn, không quá 12 chữ (mức A1)', Math.max(...dai) <= 12, 'dài nhất ' + Math.max(...dai) + ' chữ');
ok('câu nào cũng có dấu kết câu', cauAnh.every(c => /[.!?]$/.test(c.trim())),
   cauAnh.find(c => !/[.!?]$/.test(c.trim())) || '');
ok('câu nào cũng viết hoa chữ đầu', cauAnh.every(c => /^[A-Z"']/.test(c.trim())),
   cauAnh.find(c => !/^[A-Z"']/.test(c.trim())) || '');

console.log('\n— Bản dịch —');
const cauViet = luot.flatMap(({ l }) => [l.hoVi, ...l.chon.map(o => o.vi)]);
ok('bản dịch nào cũng có chữ', cauViet.every(c => c && c.trim().length > 2));
ok('bản dịch không bị bỏ trùng với bản tiếng Anh',
   luot.every(({ l }) => l.chon.every(o => o.vi !== o.en)));

console.log('\n— Không có câu chọn trùng nhau trong cùng một lượt —');
ok('ba câu trong một lượt khác nhau',
   luot.every(({ l }) => new Set(l.chon.map(o => o.en)).size === 3));

console.log('\n— Móc dùng cho kiểm thử và cho app —');
const M = self.TDTD_ANHNGU;
ok('có mo và dong', typeof M.mo === 'function' && typeof M.dong === 'function');
ok('_dsCanh trả về đủ số cảnh', M._dsCanh().length === CANH.length);
ok('_trangThai chạy được khi chưa mở cảnh nào', M._trangThai().canh === null);

console.log(`\n${fail === 0 ? '✓ Tất cả' : '✗ Có lỗi'}: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail === 0 ? 0 : 1);
