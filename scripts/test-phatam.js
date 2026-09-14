/* Kiểm thử ngôi sao luyện phát âm: node scripts/test-phatam.js

   Hai thứ dễ sai ở trò này, và cả hai đều không phải mã:
   1. NỘI DUNG — cặp tối thiểu phải là hai TỪ CÓ THẬT. Nếu lỗi thường gặp đẻ ra chuỗi vô nghĩa
      (life → "laip") thì máy tự nắn về từ gần nhất và giấu lỗi, nên phép đo thành vô nghĩa.
      Những mục như vậy phải đánh dấu kiemDuoc:false và KHÔNG được có cặp nào.
   2. HÌNH — hình khẩu hình vẽ bằng toạ độ tính tay, rất dễ lệch ra ngoài khung mà không ai thấy. */
const fs = require('fs');
const path = require('path');

global.self = global;
global.addEventListener = () => {};
const gia = () => ({ style: {}, dataset: {}, children: [],
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  appendChild(c) { this.children.push(c); return c; }, querySelector() { return null; },
  querySelectorAll() { return []; }, setAttribute() {}, addEventListener() {}, remove() {} });
global.document = { createElement: gia, body: Object.assign(gia(), { classList: { add() {}, remove() {} } }) };

const doc = (f) => fs.readFileSync(path.join(__dirname, '..', 'assets', f), 'utf8');
/* nghe.js và khauhinh.js xuất kiểu kép, nạp bằng require thì lấy được thẳng.
   ipa.js chỉ gắn vào self nên phải eval — và nó cần TDTD_NGHE, TDTD_KHAUHINH có sẵn trên self. */
const K = require('../assets/khauhinh.js');
const N = require('../assets/nghe.js');
self.TDTD_NGHE = N; self.TDTD_KHAUHINH = K;
eval(doc('ipa.js'));
const AM = self.TDTD_PHATAM._am;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Bộ âm —');
ok('có ít nhất mười hai âm', AM.length >= 12, `${AM.length} âm`);
ok('ký hiệu không trùng nhau', new Set(AM.map(a => a.ipa)).size === AM.length);
ok('âm nào cũng đủ tên, vì sao, cách làm', AM.every(a => a.ten && a.viSao && a.cach));
ok('lời giải thích đủ dài để hiểu được', AM.every(a => a.viSao.length > 40 && a.cach.length > 40));
ok('âm nào cũng có từ ví dụ', AM.every(a => a.tu.length >= 4));
ok('âm nào cũng thuộc một nhóm đã khai báo',
   AM.every(a => ['Cuối từ', 'Cụm phụ âm', 'Phụ âm đầu', 'Nguyên âm'].includes(a.nhom)));

console.log('\n— Thứ tự theo bằng chứng, không theo cảm giác —');
const uu = (n) => AM.filter(a => a.nhom === n).reduce((m, a) => Math.max(m, a.uuTien), 0);
ok('nhóm cuối từ được xếp cao nhất', uu('Cuối từ') >= uu('Phụ âm đầu') && uu('Cuối từ') > uu('Nguyên âm'),
   `cuối từ ${uu('Cuối từ')} / phụ âm đầu ${uu('Phụ âm đầu')} / nguyên âm ${uu('Nguyên âm')}`);
const th = AM.find(a => a.ipa.includes('θ'));
ok('hai âm "th" bị xếp thấp hơn phụ âm cuối', th && th.uuTien < uu('Cuối từ'), `th = ${th && th.uuTien}`);
ok('mục xếp thấp vẫn nói rõ vì sao nó không gấp', th && /vẫn hiểu|ít làm hỏng|ít lợi/i.test(th.viSao));

console.log('\n— Cặp tối thiểu —');
const cap = AM.flatMap(a => a.cap.map(c => ({ a, c })));
ok('có ít nhất hai mươi cặp', cap.length >= 20, `${cap.length} cặp`);
ok('cặp nào cũng đủ hai từ và một lời dịch', cap.every(({ c }) => c[0] && c[1] && c[2]));
ok('hai từ trong cặp phải khác nhau', cap.every(({ c }) => c[0] !== c[1]));
ok('cặp nào cũng chỉ một từ, không phải cả câu', cap.every(({ c }) => !/\s/.test(c[0] + c[1])),
   (cap.find(({ c }) => /\s/.test(c[0] + c[1])) || { c: [''] }).c[0]);
ok('từ trong cặp không lẫn dấu tiếng Việt',
   cap.every(({ c }) => !/[àáảãạăâđêôơưèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i.test(c[0] + c[1])));
ok('lời dịch có đủ hai nghĩa, ngăn bằng dấu gạch', cap.every(({ c }) => c[2].includes('/')));

console.log('\n— Mục máy không kiểm được thì không được giả vờ kiểm —');
const khong = AM.filter(a => !a.kiemDuoc);
ok('có đánh dấu mục máy không kiểm được', khong.length >= 1, khong.map(a => a.ipa).join(', '));
ok('mục không kiểm được thì không có cặp nào', khong.every(a => a.cap.length === 0),
   khong.filter(a => a.cap.length).map(a => a.ipa).join(', '));
ok('mục đó nói rõ lý do máy không kiểm được',
   khong.every(a => /không phải từ|vô nghĩa|tự nắn|không có trong/i.test(a.viSao) || a.cap.length === 0));
ok('mục kiểm được thì phải có cặp để kiểm',
   AM.filter(a => a.kiemDuoc).every(a => a.cap.length >= 1),
   AM.filter(a => a.kiemDuoc && !a.cap.length).map(a => a.ipa).join(', '));

console.log('\n— Bộ so chữ nhận ra đúng từ trong cặp —');
let lech = 0, lan = 0;
for (const { c } of cap) {
  for (const k of [0, 1]) {
    lan++;
    const kq = N.chonCau([c[k]], [c[0], c[1]]);
    if (kq.chi !== k) { lech++; if (lech <= 3) console.log(`      lẫn: nói "${c[k]}" mà chọn ra "${c[kq.chi]}"`); }
  }
}
ok('nghe đúng chữ thì phải chọn đúng từ đó', lech === 0, `${lan - lech}/${lan}`);

console.log('\n— Hình khẩu hình —');
const svg = AM.map(a => ({ a, s: K.ve(a.kh, { nhan: a.ipa }) }));
ok('âm nào cũng vẽ ra được hình', svg.every(({ s }) => s.startsWith('<svg') && s.endsWith('</svg>')));
ok('hình nào cũng có nhãn cho người đọc màn hình', svg.every(({ s }) => s.includes('aria-label')));
ok('không toạ độ nào là NaN', svg.every(({ s }) => !/NaN|undefined/.test(s)),
   (svg.find(({ s }) => /NaN|undefined/.test(s)) || { a: {} }).a.ipa || '');
/* Chỉ soi toạ độ thật (d, x, y, cx, cy...), không soi mọi con số trong chuỗi —
   font-weight="600" không phải là một điểm nằm ngoài khung. */
const toaDo = (sv) => {
  const ra = [];
  /* Bỏ qua <defs>: hình trong đó (đầu mũi tên) có hệ toạ độ riêng của nó, không phải của hình lớn. */
  const s = sv.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const m of s.matchAll(/\sd="([^"]+)"/g)) {
    /* Chỉ lệnh VIẾT HOA mới mang toạ độ tuyệt đối; lệnh viết thường là độ dời,
       nên "l0,-9" (đi lên 9px) không phải là một điểm nằm ở -9. */
    for (const doan of m[1].split(/(?=[A-Za-z])/)) {
      if (!/^[A-Z]/.test(doan) || /^[HVZ]/i.test(doan)) continue;
      ra.push(...(doan.slice(1).match(/-?\d+(\.\d+)?/g) || []).map(Number));
    }
  }
  for (const m of s.matchAll(/\s(?:x|y|cx|cy|x1|y1|x2|y2|width|height)="(-?[\d.]+)"/g))
    ra.push(Number(m[1]));
  return ra;
};
ok('không nét nào lọt ra ngoài khung vẽ', svg.every(({ a, s }) => {
  const kh = s.match(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!kh) return false;
  const [x0, y0, r, c] = kh.slice(1).map(Number);
  const xau = toaDo(s).filter(v => v < Math.min(x0, y0) - 2 || v > Math.max(x0 + r, y0 + c) + 2);
  if (xau.length) console.log(`      ${a.ipa}: ${xau.slice(0, 6).join(' ')}`);
  return !xau.length;
}));
ok('chỗ lưỡi chạm được vẽ ra khi âm có chỗ chạm', AM.filter(a => a.kh.chamO !== 'khong')
   .every(a => K.ve(a.kh, {}).includes('<circle') || K.ve(a.kh, {}).includes('stroke-dasharray')));
ok('bốn kiểu môi vẽ được hết', ['det', 'trung', 'tron', 'mo'].every(k => K.veMoi(k, {}).startsWith('<svg')));
ok('âm nào cũng khai báo kiểu môi có thật',
   AM.every(a => ['det', 'trung', 'tron', 'mo'].includes(a.moi)));

console.log('\n— Hình khác nhau giữa các âm, không phải một hình dán đi dán lại —');
const than = AM.map(a => (K.ve(a.kh, {}) + (a.kh2 ? K.ve(a.kh2, {}) : '')).replace(/aria-label="[^"]*"/g, ''));
ok('mỗi mục ra một hình riêng, không dán đi dán lại', new Set(than).size === than.length,
   `${new Set(than).size}/${than.length} hình khác nhau`);
const doi = AM.filter(a => a.kh2);
ok('mục so sánh hai âm thì vẽ đủ hai hình', doi.length >= 3, `${doi.length} mục có hai hình`);
ok('hai hình trong một mục phải khác nhau',
   doi.every(a => K.ve(a.kh, {}) !== K.ve(a.kh2, {})),
   doi.filter(a => K.ve(a.kh, {}) === K.ve(a.kh2, {})).map(a => a.ipa).join(', '));
ok('mục hai hình phải có nhãn cho từng hình', doi.every(a => a.nhan2 && a.nhan1));

console.log('\n— Hình nguyên âm —');
const co = AM.filter(a => a.bieu);
ok('âm nào khai báo biểu đồ thì phải có trong bảng nguyên âm',
   co.every(a => K.NGUYEN_AM.some(v => v.ipa === a.bieu)), co.map(a => a.bieu).join(' '));
ok('biểu đồ nguyên âm vẽ được', co.every(a => K.veNguyenAm(a.bieu).startsWith('<svg')));

console.log('\n— Không lưu gì xuống máy, không đẻ ra điểm giả —');
const nguon = doc('ipa.js');
ok('không đụng tới localStorage', !/localStorage/.test(nguon));
ok('không dùng confidence của bộ nhận dạng', !/\.confidence/.test(nguon));
ok('có nói rõ đây không phải chấm giọng', /không phải chấm giọng|không nói rằng giọng bạn/.test(nguon));
ok('có báo trước việc gửi giọng đi', /được gửi lên máy chủ/.test(nguon));
ok('có nói ra cái dở của máy với giọng Việt', /người Việt bị chép sai|một phần bảy/.test(nguon));
ok('dùng lại bộ so chữ sẵn có, không viết bộ thứ hai', /TDTD_NGHE/.test(nguon) && !/function diceChu/.test(nguon));
ok('nhận dạng đặt đúng cấu hình', /maxAlternatives = 5/.test(nguon) && /interimResults = false/.test(nguon)
   && /continuous = false/.test(nguon) && /lang = 'en-US'/.test(nguon));

console.log('\n— Máy không nghe được thì phải nói vì sao, đừng im lặng —');
ok('có lối đi cho máy không có phần nhận giọng nói', /không có phần nhận giọng nói/.test(nguon));
ok('có lối đi cho iPhone đã cài ra màn hình chính', /navigator && self\.navigator\.standalone/.test(nguon)
   && /màn hình chính/.test(nguon));
ok('vẫn giữ được phần hình khi không có micro', /vẫn dùng bình thường|xem hình và nghe mẫu/.test(nguon));
ok('báo rõ từng loại lỗi micro',
   ['not-allowed', 'no-speech', 'network'].every(e => nguon.includes(e)));

console.log(`\n${fail ? '✗' : '✓'} Tất cả: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail ? 1 : 0);
