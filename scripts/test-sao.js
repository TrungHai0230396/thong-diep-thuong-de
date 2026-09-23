/* Kiểm thử vòng đời mọi ngôi sao: node scripts/test-sao.js

   Vì sao có tệp này: một lần tôi tách hàm trong ipa.js và phép thay thế nuốt mất hàm thoiHinh,
   khiến dong() ném lỗi NGAY TRƯỚC dòng gỡ lớp "hien". Màn phát âm mở ra là không bao giờ đóng,
   mà nó phủ kín màn hình, nên bấm ngôi sao nào cũng như không có gì xảy ra. Người dùng gặp lỗi
   đó trước khi tôi thấy — vì không một bài kiểm nào từng GỌI dong().

   Bài này không kiểm nội dung trò nào cả. Nó chỉ hỏi đúng mấy câu mà mọi ngôi sao đều phải trả
   lời được: mở có nổ không, đóng có nổ không, đóng rồi có thật sự đóng không, mở lại có được
   không. Rẻ, và bắt đúng loại lỗi làm hỏng cả app. */
const fs = require('fs');
const path = require('path');

const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'canvas') return { width: 380, height: 720 };
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'measureText') return () => ({ width: 10 });
    return () => {};
  },
  set: () => true,
});
const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', style: { setProperty() {} }, children: [], _q: {}, dataset: {},
    hidden: false, clientWidth: 380, clientHeight: 720, width: 380, height: 720, id: '',
    classList: {
      _s: new Set(cls.split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); },
      remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); },
      contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; },
    blur() {}, focus() {}, select() {}, scrollIntoView() {},
    addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 380, height: 720 }),
    appendChild(c) { o.children.push(c); return c; },
    getContext: () => ve2d,
    querySelector(sel) { const k = String(sel).replace(/[.#]/g, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
    closest() { return null; },
  };
  return o;
};
const than = nut('body');
global.document = { body: than, hidden: false, documentElement: nut(),
                    createElement: () => nut(), querySelector: () => null,
                    querySelectorAll: () => [], addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {};
global.removeEventListener = () => {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1; global.innerWidth = 380; global.innerHeight = 720;
global.matchMedia = () => ({ matches: false, addEventListener() {} });
global.fetch = () => Promise.reject(new Error('bài kiểm này không gọi mạng'));
global.performance = { now: () => Date.now() };

/* Nạp mọi tệp trò, đúng thứ tự như index.html. */
const TEP = ['core.js', 'game.js', 'share.js', 'lantern.js', 'pond.js', 'breath.js',
             'constellation.js', 'typing.js', 'nghe.js', 'english.js', 'mua.js',
             'astro.js', 'nightsky.js', 'lich.js', 'almanac.js', 'amvi.js', 'khauhinh.js', 'ipa.js'];
for (const t of TEP) new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', t), 'utf8'))();

/* Danh sách ngôi sao đọc THẲNG từ app.js, để thêm sao mới là bài kiểm tự biết. */
const nguon = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
const khoiSao = nguon.slice(nguon.indexOf('const SAO = ['), nguon.indexOf('];', nguon.indexOf('const SAO = [')));
const SAO = [...khoiSao.matchAll(/id:\s*'([^']+)'[\s\S]*?khung:\s*'\.([^']+)'[\s\S]*?mun:\s*'([^']+)'/g)]
  .map(m => ({ id: m[1], khung: m[2], mun: m[3] }));

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Đọc được danh sách ngôi sao từ app.js —');
ok('tìm thấy các ngôi sao', SAO.length >= 9, `${SAO.length} sao: ${SAO.map(s => s.id).join(', ')}`);
ok('sao nào cũng khai báo tên mô-đun', SAO.every(s => s.mun));

console.log('\n— Mô-đun của mỗi sao phải có mặt và đủ hai cửa mo/dong —');
for (const s of SAO) {
  const m = global[s.mun];
  ok(`${s.id}: có mô-đun ${s.mun}`, !!m);
  if (m) ok(`${s.id}: có cả mo() lẫn dong()`, typeof m.mo === 'function' && typeof m.dong === 'function');
}

console.log('\n— Mở rồi đóng, không được ném lỗi ---');
/* Đây là bài đáng giá nhất của cả tệp: chính chỗ này từng để lọt lỗi ra tới người dùng. */
for (const s of SAO) {
  const m = global[s.mun];
  if (!m) continue;
  let loi = null;
  try { m.mo(); } catch (e) { loi = 'mo(): ' + e.message; }
  if (!loi) { try { m.dong(); } catch (e) { loi = 'dong(): ' + e.message; } }
  ok(`${s.id}: mở rồi đóng trót lọt`, loi === null, loi || '');
}

console.log('\n— Đóng rồi phải thật sự đóng, và mở lại được —');
for (const s of SAO) {
  const m = global[s.mun];
  if (!m) continue;
  let loi = null, conMo = null;
  try {
    m.mo();
    /* Tìm ĐÚNG khung của trò này theo lớp khai báo trong app.js. Bản đầu tôi lấy "phần tử mang
       lớp hien đầu tiên", và nó chỉ về khung của một trò KHÁC chưa đóng được — thành ra hai sao
       vô tội bị báo hỏng oan. */
    const khung = than.children.find(c => c.classList && c.classList.contains(s.khung));
    m.dong();
    conMo = khung ? khung.classList.contains('hien') : null;
    m.mo(); m.dong();                      // mở lại lần nữa, phải vẫn êm
  } catch (e) { loi = e.message; }
  ok(`${s.id}: đóng xong không còn lớp hien, và mở lại được`,
     loi === null && conMo !== true, loi || (conMo === true ? 'vẫn còn mở' : ''));
}

console.log('\n— Đóng khi CHƯA từng mở cũng không được nổ —');
/* app.js gọi dong() ở nhiều nhánh, có nhánh chạy trước khi trò kịp mở lần nào. */
for (const t of TEP) new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', t), 'utf8'))();
for (const s of SAO) {
  const m = global[s.mun];
  if (!m) continue;
  let loi = null;
  try { m.dong(); } catch (e) { loi = e.message; }
  ok(`${s.id}: đóng lúc chưa mở`, loi === null, loi || '');
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
