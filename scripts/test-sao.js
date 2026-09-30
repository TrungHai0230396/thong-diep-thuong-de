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
             'constellation.js', 'nghe.js', 'mua.js',
             'astro.js', 'nightsky.js', 'lich.js', 'almanac.js', 'sohoc.js', 'thanso.js', 'amvi.js', 'khauhinh.js', 'dophatam.js', 'ipa.js'];
for (const t of TEP) new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', t), 'utf8'))();

/* Danh sách ngôi sao đọc THẲNG từ app.js, để thêm sao mới là bài kiểm tự biết. */
const nguon = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
const khoiSao = nguon.slice(nguon.indexOf('const SAO = ['), nguon.indexOf('];', nguon.indexOf('const SAO = [')));
const SAO = [...khoiSao.matchAll(/id:\s*'([^']+)'[\s\S]*?khung:\s*'\.([^']+)'[\s\S]*?mun:\s*'([^']+)'/g)]
  .map(m => ({ id: m[1], khung: m[2], mun: m[3] }));

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Đọc được danh sách ngôi sao từ app.js —');
ok('tìm thấy các ngôi sao', SAO.length >= 8, `${SAO.length} sao: ${SAO.map(s => s.id).join(', ')}`);
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

console.log('\n— Tự nhận bản mới: không tải lại hai lần, không tải lại giữa lúc đang dùng —');
{
  /* Người dùng báo "mở trang chủ lâu lâu bị reset 2 lần". */
  /* app.js dính DOM nên không chạy nguyên tệp ở đây; tách riêng hàm quyết định (hàm thuần) ra chạy */
  const m = nguon.match(/function nenTaiLai\([^)]*\) \{[\s\S]*?\n\}/);
  const Q = m ? new Function(m[0] + '; return nenTaiLai;')() : null;
  ok('có hàm quyết định tải lại', typeof Q === 'function');
  if (Q) {
    const mo = 1e6;
    ok('vừa mở 2 giây, chưa chạm gì: tải lại ngay', Q(mo + 2000, 0, false, mo) === 'ngay');
    ok('vừa tự tải lại 8 giây trước: không tải lần hai', Q(mo + 2000, mo - 6000, false, mo) === 'hoan');
    ok('đã chạm vào trang (lật bài, mở sao): đợi lúc chuyển đi mới tải', Q(mo + 2000, 0, true, mo) === 'hoan');
    ok('mở đã lâu: đợi lúc chuyển đi mới tải', Q(mo + 60000, 0, false, mo) === 'hoan');
    ok('lần tự tải lại trước đã qua lâu: lại được tải ngay', Q(mo + 2000, mo - 60000, false, mo) === 'ngay');
  }
}

/* Chạy nguyên đoạn tự cập nhật của app.js trên một trình duyệt giả, kích các tình huống có bản mới
   rồi đếm số lần trang tải lại. */
{
  const khoi = nguon.slice(nguon.indexOf('const MO_LUC = Date.now();'), nguon.indexOf('tuCapNhat();      //'));
  function mo({ coBanCu = true, lanTruoc = 0, gioMo = 0 } = {}) {
    const nghe = {}, ngheTrang = {}, ngheTaiLieu = {};
    const bang = { tai: 0, gio: gioMo, kho: lanTruoc ? { 'tdtd.taiLai': String(lanTruoc) } : {} };
    const moiTruong = {
      navigator: { serviceWorker: {
        controller: coBanCu ? {} : null,
        addEventListener: (t, f) => { (nghe[t] = nghe[t] || []).push(f); },
        register: () => Promise.resolve({ update: () => Promise.resolve() }),
      } },
      location: { protocol: 'https:', reload: () => { bang.tai++; } },
      document: { hidden: false, addEventListener: (t, f) => { (ngheTaiLieu[t] = ngheTaiLieu[t] || []).push(f); } },
      addEventListener: (t, f) => { (ngheTrang[t] = ngheTrang[t] || []).push(f); },
      sessionStorage: { getItem: (k) => bang.kho[k] || null, setItem: (k, v) => { bang.kho[k] = v; } },
      setInterval: () => 0,
      Date: { now: () => bang.gio },
    };
    const chay = new Function(...Object.keys(moiTruong), khoi + '; tuCapNhat();');
    chay(...Object.values(moiTruong));
    return {
      bang,
      banMoi: () => (nghe.controllerchange || []).forEach(f => f()),
      cham: () => (ngheTrang.pointerdown || []).forEach(f => f()),
      an: () => { moiTruong.document.hidden = true; (ngheTaiLieu.visibilitychange || []).forEach(f => f()); },
      troi: (ms) => { bang.gio += ms; },
    };
  }
  let t = mo({ gioMo: 1e6 }); t.troi(1500); t.banMoi(); t.banMoi();
  ok('vừa mở, có bản mới (kể cả tin tới hai lần): tải lại đúng một lần', t.bang.tai === 1, `${t.bang.tai} lần`);
  const lan = +t.bang.kho['tdtd.taiLai'];
  t = mo({ gioMo: lan + 800, lanTruoc: lan }); t.troi(1000); t.banMoi();
  ok('trang vừa tự tải lại gặp thêm một bản mới nữa: không tải lại lần hai trước mặt', t.bang.tai === 0, `${t.bang.tai} lần`);
  t.an();
  ok('mà đợi tới lúc chuyển sang app khác mới tải', t.bang.tai === 1, `${t.bang.tai} lần`);
  t = mo({ gioMo: 1e6 }); t.troi(1000); t.cham(); t.troi(500); t.banMoi();
  ok('đang dùng dở (đã chạm vào trang): không tải lại giữa chừng', t.bang.tai === 0);
  t.an();
  ok('chuyển đi rồi mới tải lại', t.bang.tai === 1);
  t = mo({ coBanCu: false, gioMo: 1e6 }); t.troi(1000); t.banMoi(); t.an();
  ok('lần cài đầu tiên (chưa có bản cũ): không tải lại', t.bang.tai === 0);
}

console.log('\n— Tệp lịch (.ics) của trang Xem ngày —');
{
  const X = global.TDTD_XEMNGAY;
  const ics = X && X._ics && X._ics([
    { dd: 6, mm: 2, yy: 2027, ten: 'Tết Nguyên đán', am: { ngay: 1, thang: 1, nhuan: false } },
    { dd: 23, mm: 6, yy: 2028, ten: 'Mùng 1 tháng 5 nhuận; giỗ ông, bà — nhắc cả nhà về sớm để chuẩn bị cỗ cúng', am: { ngay: 1, thang: 5, nhuan: true } },
  ]);
  ok('tạo được tệp lịch', typeof ics === 'string' && ics.startsWith('BEGIN:VCALENDAR'));
  if (ics) {
    const dong = ics.split('\r\n');
    ok('dòng kết thúc bằng CRLF như chuẩn RFC 5545', !/[^\r]\n/.test(ics) && ics.endsWith('\r\n'));
    ok('không dòng nào quá 75 byte (tiếng Việt có dấu tính theo byte)',
       dong.every(d => Buffer.byteLength(d, 'utf8') <= 75), Math.max(...dong.map(d => Buffer.byteLength(d, 'utf8'))) + ' byte');
    ok('hai sự kiện, mỗi sự kiện một nhắc nhở', (ics.match(/BEGIN:VEVENT/g) || []).length === 2 && (ics.match(/BEGIN:VALARM/g) || []).length === 2);
    ok('ngày trọn: DTSTART 20270206, DTEND hôm sau', ics.includes('DTSTART;VALUE=DATE:20270206') && ics.includes('DTEND;VALUE=DATE:20270207'));
    ok('nhắc lúc 9 giờ sáng hôm trước', ics.includes('TRIGGER:-PT15H'));
    const gop = ics.replace(/\r\n /g, '');
    ok('dấu chấm phẩy và dấu phẩy trong tên được thoát, gập dòng không làm mất chữ',
       gop.includes('SUMMARY:Mùng 1 tháng 5 nhuận\\; giỗ ông\\, bà — nhắc cả nhà về sớm để chuẩn bị cỗ cúng'));
  }
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
