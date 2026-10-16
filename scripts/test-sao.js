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
             'astro.js', 'saosang.js', 'nightsky.js', 'datlien.js', 'vutru.js', 'toancanh.js', 'lich.js', 'almanac.js', 'sohoc.js', 'thanso.js', 'rungu.js', 'nhacngu.js', 'luanxa.js', 'thienluanxa.js', 'baicode.js', 'laptrinh.js', 'mansoko.js', 'sokoban.js', 'phong.js', 'maqr.js', 'coba.js', 'bida.js', 'amvi.js', 'khauhinh.js', 'dophatam.js', 'ipa.js'];
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
  function mo({ coBanCu = true, lanTruoc = 0, gioMo = 0, nhac = false } = {}) {
    const nghe = {}, ngheTrang = {}, ngheTaiLieu = {};
    const bang = { tai: 0, gio: gioMo, nhac, kho: lanTruoc ? { 'tdtd.taiLai': String(lanTruoc) } : {} };
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
      self: { TDTD_NGU: { dangPhat: () => bang.nhac } },
    };
    const chay = new Function(...Object.keys(moiTruong), khoi + '; tuCapNhat();');
    chay(...Object.values(moiTruong));
    return {
      bang,
      banMoi: () => (nghe.controllerchange || []).forEach(f => f()),
      cham: () => (ngheTrang.pointerdown || []).forEach(f => f()),
      an: () => { moiTruong.document.hidden = true; (ngheTaiLieu.visibilitychange || []).forEach(f => f()); },
      troi: (ms) => { bang.gio += ms; },
      hien: () => { moiTruong.document.hidden = false; (ngheTaiLieu.visibilitychange || []).forEach(f => f()); },
      hetNhac: () => { bang.nhac = false; (ngheTrang['tdtd-ngu-het'] || []).forEach(f => f()); },
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
  /* Nhạc ngủ: khoá màn hình cũng làm trang bị ẩn. Tải lại lúc đó là tắt nhạc của người đang ngủ. */
  t = mo({ gioMo: 1e6, nhac: true }); t.troi(1000); t.cham(); t.banMoi(); t.an();
  ok('đang phát nhạc ngủ mà khoá màn hình: không tải lại', t.bang.tai === 0, `${t.bang.tai} lần`);
  t.hetNhac();
  ok('nhạc tự tắt xong, màn hình vẫn khoá: lúc đó mới lặng lẽ tải lại', t.bang.tai === 1, `${t.bang.tai} lần`);
  t = mo({ gioMo: 1e6, nhac: true }); t.troi(1000); t.cham(); t.banMoi(); t.an(); t.hien(); t.hetNhac();
  ok('nhạc tắt lúc người dùng đang nhìn trang: không tải lại trước mặt', t.bang.tai === 0, `${t.bang.tai} lần`);
  t.an();
  ok('chuyển đi rồi mới tải', t.bang.tai === 1, `${t.bang.tai} lần`);
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

console.log('\n— Chia sẻ link một trò —');
{
  /* Người dùng báo: bấm chia sẻ thì ra hai link (link nằm cả trong chữ lẫn trong địa chỉ). Và muốn link phát âm
     tiếng Anh đừng hiện tên "Thông Điệp Của Thượng Đế". Chạy thẳng hai hàm linkTro, chepLink cắt ra từ app.js. */
  const cat = (ten) => { const a = nguon.indexOf(`function ${ten}(`); return nguon.slice(a, nguon.indexOf('\n}\n', a) + 2); };
  const goi = [];
  const chay = new Function('location', 'navigator', 'toast', 'chepTay', 'TEN_GOC',
    `${cat('linkTro')}\n${cat('chepLink')}\nreturn { linkTro, chepLink };`)(
    { origin: 'https://x.vercel.app', pathname: '/' }, { share: (o) => { goi.push(o); return Promise.resolve(); } },
    () => {}, () => {}, 'Thông Điệp Của Thượng Đế');
  const dsSao = [...khoiSao.matchAll(/\{ id: '([^']+)'[\s\S]*?\}/g)].map(m => {
    const k = m[0], lay = (t) => ((k.match(new RegExp(`${t}:\\s*'([^']*)'`)) || [])[1]);
    return { id: lay('id'), nhan: lay('nhan'), duong: lay('duong'), tieuDe: lay('tieuDe'), trang: lay('trang') };
  });
  for (const sao of dsSao) chay.chepLink(sao);
  ok('mọi trò: chia sẻ chỉ có MỘT link — chữ đi kèm không chứa link', goi.length === dsSao.length && goi.every(o => !/https?:/.test(o.text || '') && /^https:/.test(o.url)),
     goi.filter(o => /https?:/.test(o.text || '')).map(o => o.url).join(', '));
  const pa = dsSao.find(x => x.id === 'sao-phatam'), oPa = goi[dsSao.indexOf(pa)];
  ok('phát âm: chia sẻ trang riêng /luyen-phat-am/, tiêu đề "Luyện phát âm tiếng Anh"', oPa.url === 'https://x.vercel.app/luyen-phat-am/' && oPa.title === 'Luyện phát âm tiếng Anh', oPa.url);
  /* Người dùng: "mỗi game làm cài app như chỗ luyện âm, có chú thích khác luôn" — giờ trò nào cũng có trang riêng */
  const lechTrang = dsSao.filter((x, i) => !x.trang || !x.tieuDe || goi[i].url !== 'https://x.vercel.app/' + x.trang || goi[i].title !== x.tieuDe);
  ok(`cả ${dsSao.length} trò đều chia sẻ trang riêng của nó, tiêu đề là tên riêng của trò`, !lechTrang.length, lechTrang.map(x => x.id).join(', '));
  ok('trang riêng không trùng nhau, không trùng thư mục của app', new Set(dsSao.map(x => x.trang)).size === dsSao.length &&
     dsSao.every(x => /^[a-z0-9-]+\/$/.test(x.trang) && !['assets/', 'icons/', 'data/', 'scripts/', 'content/', 'phat-am/'].includes(x.trang)));
  ok('trò chưa có trang riêng thì vẫn chia sẻ link #trò', chay.linkTro({ duong: 'tro-moi' }) === 'https://x.vercel.app/#tro-moi');
  const moTaDa = new Map();
  /* Trang chia sẻ đang dùng, và trang cũ /phat-am/ (link đã gửi đi vẫn phải mở được; đã sửa) */
  for (const sao of dsSao.filter(x => x.trang).concat([{ ...pa, trang: 'phat-am/' }])) {
    const f = path.join(__dirname, '..', sao.trang, 'index.html');
    const html = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
    const tieuDe = (html.match(/<title>([^<]*)<\/title>/) || [])[1], og = (html.match(/property="og:title" content="([^"]*)"/) || [])[1];
    ok(`${sao.trang}: có trang riêng, tiêu đề và og:title trùng tieuDe trong app.js, không nhắc tên app`,
       tieuDe === sao.tieuDe && og === sao.tieuDe && !/Thông Điệp/.test(html), `${tieuDe} / ${og}`);
    /* Không thẻ meta làm mới trang: Telegram đi theo nó về trang chủ và hiện tên app (người dùng gửi ảnh).
       Tắt JavaScript thì còn link bấm tay. */
    ok(`${sao.trang}: người mở được chuyển vào #${sao.duong} bằng JavaScript; không có thẻ refresh cho trình đọc link đi theo`,
       html.includes(`location.replace('../#${sao.duong}'`) && !/http-equiv/i.test(html) && html.includes(`href="../#${sao.duong}"`));
    ok(`${sao.trang}: og:url trỏ đúng chính trang này`, html.includes(`property="og:url" content="https://thong-diep-thuong-de.vercel.app/${sao.trang}"`));
    const moTa = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
    const ogMoTa = (html.match(/property="og:description" content="([^"]*)"/) || [])[1];
    const chuAnh = (html.match(/property="og:image:alt" content="([^"]*)"/) || [])[1] || '';
    ok(`${sao.trang}: có chú thích riêng (description và og:description trùng nhau), ảnh có chữ thay thế`,
       moTa.length >= 60 && moTa.length <= 230 && ogMoTa === moTa && chuAnh.length >= 10, `${moTa.length} ký tự`);
    if (sao.trang !== 'phat-am/') moTaDa.set(moTa, (moTaDa.get(moTa) || []).concat(sao.trang));
    /* Zalo không hiện khung xem trước khi trang chưa có ảnh (người dùng báo). Ảnh phải là địa chỉ đầy đủ, có thật,
       đúng 1200×630 như thẻ khai, và nhẹ (WhatsApp chỉ nhận ảnh nhỏ, cỡ 300 KB). */
    const anh = (html.match(/property="og:image" content="https:\/\/thong-diep-thuong-de\.vercel\.app\/([^"]+)"/) || [])[1];
    const tepAnh = anh && path.join(__dirname, '..', anh), b = tepAnh && fs.existsSync(tepAnh) ? fs.readFileSync(tepAnh) : null;
    let rong = 0, cao = 0;                                   // đọc kích thước từ khung SOF của JPEG
    for (let i = 2; b && i < b.length - 9;) {
      if (b[i] !== 0xFF) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xC0 && m <= 0xC3) { cao = b.readUInt16BE(i + 5); rong = b.readUInt16BE(i + 7); break; }
      i += 2 + b.readUInt16BE(i + 2);
    }
    ok(`${sao.trang}: có ảnh xem trước thật, ${rong}×${cao} khớp thẻ khai, nhẹ dưới 300 KB`, !!b && rong === 1200 && cao === 630 &&
       html.includes('og:image:width" content="1200"') && html.includes('og:image:height" content="630"') && b.length < 300 * 1024,
       b ? `${Math.round(b.length / 1024)} KB` : 'không có ảnh');
  }
  const trungMoTa = [...moTaDa.values()].filter(ds => ds.length > 1);
  ok('mỗi trò một chú thích khác nhau, không chép của nhau', !trungMoTa.length, trungMoTa.map(ds => ds.join(' = ')).join('; '));
}

console.log('\n— Cài app: chỉ mở khi người dùng bấm —');
{
  /* Người đến từ link phát âm đi thẳng vào trò, không thấy trang chính nên không được gợi ý cài. Người dùng chọn:
     vào trò 3 giây thì gợi ý. */
  /* "Đang sử dụng hiển thị cài app khó chịu lắm": không bảng nào tự bật, chỉ mở khi người dùng bấm nút */
  const soTro = [...khoiSao.matchAll(/\{ id: '/g)].length, soNut = [...khoiSao.matchAll(/nutCai: true/g)].length;
  ok('mọi trò khai nutCai (có nút Cài app riêng, như phát âm)', soTro >= 14 && soNut === soTro, `${soNut}/${soTro} trò`);
  const goiCai = [...nguon.matchAll(/^.*moCaiApp.*$/gm)].map(m => m[0].trim()).filter(d => !d.startsWith('function moCaiApp'));
  ok('bảng cài app không tự bật: chỉ mở từ nút bấm (không setTimeout, không goiYCaiApp)',
     !/goiYCaiApp|nenTuHien/.test(nguon) && goiCai.length >= 3 && goiCai.every(d => /onclick = (\(\) => )?moCaiApp/.test(d)), goiCai.join(' | '));
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  ok('thanh trên cùng có nút cài app, ẩn sẵn cho tới khi biết máy cần', /<button class="icon-btn" id="btn-cai"[^>]*aria-label="Cài app vào điện thoại"[^>]*hidden>/.test(html));
  ok('máy đã cài, máy tính thì không hiện nút; vừa cài xong thì ẩn',
     /nutCai\.hidden = \['daCai', 'daCaiTrinhDuyet', 'mayTinh'\]\.includes\(loaiCai\(\)\)/.test(nguon) && /addEventListener\('appinstalled', \(\) => \{ nutCai\.hidden = true; \}\)/.test(nguon));
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.css'), 'utf8');
  const z = (lop) => +((css.match(new RegExp(`\\.${lop}\\{[^}]*z-index:(\\d+)`)) || [])[1] || 0);
  ok('bảng gợi ý nổi trên màn trò (nếu không sẽ hiện mà bị che mất), dưới dòng thông báo',
     z('sheet-wrap') > z('phatam') && z('sheet-wrap') < z('toast'), `bảng ${z('sheet-wrap')}, trò ${z('phatam')}, thông báo ${z('toast')}`);
}

console.log('\n— Bảng cài app: link đưa ra Safari, Chrome giữ đúng trò đang mở —');
{
  /* Người dùng báo: mở link phát âm trong Zalo, bấm Mở bằng Safari thì Safari ra trang chính, mất phần tiếng Anh. */
  const cat = (ten) => { const a = nguon.indexOf(`function ${ten}(`); return nguon.slice(a, nguon.indexOf('\n}\n', a) + 2); };
  const CA = require('../assets/caiapp.js');
  const tao = (sao) => new Function('location', 'saoDangMo', `${cat('linkTro')}\n${cat('linkCaiApp')}\nreturn linkCaiApp();`)(
    { origin: 'https://thong-diep-thuong-de.vercel.app', pathname: '/' }, sao);
  const pa = { duong: 'phat-am', trang: 'luyen-phat-am/' }, hd = { duong: 'tha-den' };
  ok('đang ở trò phát âm: link là trang riêng /luyen-phat-am/', tao(pa) === 'https://thong-diep-thuong-de.vercel.app/luyen-phat-am/', tao(pa));
  ok('Mở bằng Safari giữ nguyên trang phát âm', CA.linkSafari(tao(pa)) === 'x-safari-https://thong-diep-thuong-de.vercel.app/luyen-phat-am/');
  ok('Mở bằng Chrome (Android) giữ nguyên trang phát âm', CA.linkChrome(tao(pa)).startsWith('intent://thong-diep-thuong-de.vercel.app/luyen-phat-am/#Intent;'), CA.linkChrome(tao(pa)));
  ok('trò không có trang riêng: link #trò cho Safari', tao(hd) === 'https://thong-diep-thuong-de.vercel.app/#tha-den');
  ok('không ở trò nào (mở từ nút ?): trang chính', tao(null) === 'https://thong-diep-thuong-de.vercel.app/');
  ok('bảng cài app dùng đúng hàm này cho cả ba nút', /function bangCai\(loai\) \{\s*const link = linkCaiApp\(\);/.test(nguon) &&
     /CA\.linkSafari\(link\)/.test(nguon) && /CA\.linkChrome\(link\)/.test(nguon) && /writeText\(link\)/.test(nguon));
}

console.log('\n— Nút Cài app trong mọi trò —');
{
  /* Người dùng: trong Zalo đã thấy bảng một lần nên không hiện lại (luật 3 lần, cách 7 ngày), mà không có chỗ mở lại.
     Chọn thêm nút "Cài app" trong trò. */
  ok('mở trò là gắn nút Cài app (chỉ trò có nutCai)', /themNutChepLink\(s\);\s*themNutCaiApp\(s\);/.test(nguon) &&
     /function themNutCaiApp\(s\) \{[\s\S]{0,200}!s\.nutCai/.test(nguon));
  ok('nút mở thẳng bảng hướng dẫn, không qua luật 3 lần/7 ngày', /function themNutCaiApp[\s\S]{0,900}b\.onclick = moCaiApp;/.test(nguon));
  ok('máy đã cài, máy tính thì không có nút', /function themNutCaiApp[\s\S]{0,400}\['daCai', 'daCaiTrinhDuyet', 'mayTinh'\]\.includes\(loaiCai\(\)\)\) return;/.test(nguon));
  ok('đóng trò bằng đường nào cũng gỡ nút (✕ của trò, Back, mở trò khác)',
     /function dongSao[\s\S]{0,300}goNutTro\(\);/.test(nguon) && /saoDangMo = null; document\.title = TEN_GOC; boDau\(\);\s*goNutTro\(\);/.test(nguon) &&
     /function goNutTro\(\) \{\s*\['#nut-chep-link', '#nut-cai-app'\]/.test(nguon));
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.css'), 'utf8');
  const phai = (lop) => +((css.match(new RegExp(`\\.${lop}\\{[^}]*right:(\\d+)px`)) || [])[1] || 0);
  ok('nút Cài app nằm bên trái nút 🔗, không đè lên nhau (🔗 rộng 34px từ right:58px)', phai('nut-cai') >= phai('nut-link') + 34 + 6, `Cài app right:${phai('nut-cai')}px, 🔗 right:${phai('nut-link')}px`);
  /* Nút rộng chừng 94 px (đo trên trình duyệt giả điện thoại 375 px): nằm từ right:100 tới right:194. Đo bằng trình
     duyệt thấy đè lên tim của Mùa Chín, số ếch, nút phóng của Trời đêm, và tiêu đề cùng nút ? của Robot thắp sao,
     Đẩy thùng sao, Cờ ba người. Có nút thì khung trò mang lớp co-nut-cai, các thứ đó nhường chỗ. */
  ok('có nút thì khung trò mang lớp co-nut-cai; đóng trò thì gỡ lớp cùng với nút',
     /function themNutCaiApp[\s\S]{0,900}k\.appendChild\(b\);\s*k\.classList\.add\('co-nut-cai'\);/.test(nguon) &&
     /function goNutTro\(\) \{[^}]*\}\);\s*\$\$\('\.co-nut-cai'\)\.forEach\(k => k\.classList\.remove\('co-nut-cai'\)\);/.test(nguon));
  const so = (re) => +((css.match(re) || [])[1] || 0);
  const tim = so(/\.game-hud\{[^}]*padding:calc\(env\(safe-area-inset-top,0px\) \+ 14px\) (\d+)px/);
  ok('tim của Mùa Chín không nằm dưới nút 🔗 (lỗi có từ trước: thanh điểm chỉ chừa 58 px)', tim >= phai('nut-link') + 34 + 6, `chừa ${tim}px`);
  ok('có nút Cài app: tim của Mùa Chín và số ếch dời sang trái nút',
     so(/\.co-nut-cai \.game-hud\{padding-right:(\d+)px\}/) >= 198 && so(/\.co-nut-cai \.ho-dem\{right:(\d+)px\}/) >= 198);
  ok('có nút Cài app: thanh tiêu đề của Robot, Đẩy thùng, Cờ ba người chừa chỗ; điện thoại hẹp thì lùi xuống dưới hàng nút',
     /\.co-nut-cai \.lt-dau,\.co-nut-cai \.sk-dau,\.co-nut-cai \.cb-dau\{padding-right:(19[8-9]|2\d\d)px\}/.test(css) &&
     /@media \(max-width:479px\)\{[^@]*\.co-nut-cai \.lt-dau,\.co-nut-cai \.sk-dau,\.co-nut-cai \.cb-dau\{padding-top:calc\(env\(safe-area-inset-top,0px\) \+ (5[2-9]|6\d)px\)/.test(css) &&
     /@media \(max-width:479px\)\{[^@]*\.co-nut-cai \.td-phong\{top:calc\(env\(safe-area-inset-top,0px\) \+ (5[2-9]|6\d)px\)\}/.test(css));
}

console.log('\n— Cài app từ trò nào thì mở app là vào thẳng trò đó —');
{
  /* Người dùng hỏi "tải app trong mỗi game là vô app có tự động vô game không hay bay ra trang chủ", chọn: vào thẳng trò.
     Chrome mở start_url của manifest và đọc lại manifest khi thẻ <link> đổi, nên mỗi trò có manifest riêng start_url
     ?tro=<duong>, cùng id "/"; app.js gắn manifest của trò đang mở. Safari (iPhone) đọc manifest một lần lúc tải trang
     rồi giữ — người dùng báo "vô game thêm màn hình chính toàn ra trang chủ" — nên với WebKit không gắn manifest, Safari
     lưu địa chỉ đang xem, và địa chỉ trong trò mang ?tro=<duong>. */
  const goc = path.join(__dirname, '..'), mien = 'https://thong-diep-thuong-de.vercel.app/';
  const mf = JSON.parse(fs.readFileSync(path.join(goc, 'manifest.webmanifest'), 'utf8'));
  const tuyet = (u, ve) => new URL(u, ve).href;
  const lay = (dong, k) => (dong.match(new RegExp(k + ":\\s*'([^']*)'")) || [])[1];
  const DS = [...khoiSao.matchAll(/\{[^{}]*\}/g)].map(m => ({ duong: lay(m[0], 'duong'), trang: lay(m[0], 'trang'), tieuDe: lay(m[0], 'tieuDe'), tenApp: lay(m[0], 'tenApp') }))
    .filter(t => t.duong && t.trang);
  const hong = [];
  for (const t of DS) {
    let m = null;
    const tep = path.join(goc, t.trang, 'app.webmanifest'), ve = mien + t.trang + 'app.webmanifest';
    try { m = JSON.parse(fs.readFileSync(tep, 'utf8')); } catch (e) { hong.push(`${t.trang}: không đọc được`); continue; }
    if (m.id !== '/') hong.push(`${t.duong}: id ${m.id}`);
    if (tuyet(m.start_url, ve) !== mien + '?tro=' + t.duong) hong.push(`${t.duong}: start_url ${m.start_url}`);
    if (tuyet(m.scope, ve) !== mien) hong.push(`${t.duong}: scope ${m.scope}`);
    if (JSON.stringify(m.icons.map(i => tuyet(i.src, ve))) !== JSON.stringify(mf.icons.map(i => tuyet(i.src, mien + 'manifest.webmanifest')))) hong.push(`${t.duong}: icons`);
    for (const k of ['description', 'lang', 'display', 'orientation', 'background_color', 'theme_color']) if (m[k] !== mf[k]) hong.push(`${t.duong}: ${k}`);
    if (m.short_name !== t.tenApp || m.name !== (t.tieuDe || '').split(' — ')[0]) hong.push(`${t.duong}: tên ${m.name} / ${m.short_name}`);
  }
  ok(`manifest chính có id "/"; đủ ${DS.length} manifest riêng (mỗi trò một): cùng id "/" — vẫn một app —, start_url ?tro=<trò>, scope là cả trang, biểu tượng như manifest chính, tên là tên trò (short_name = tenApp, name = tieuDe bỏ phần sau " — ")`,
     mf.id === '/' && DS.length >= 14 && !hong.length, hong.slice(0, 3).join('; '));
  const vc = JSON.parse(fs.readFileSync(path.join(goc, 'vercel.json'), 'utf8'));
  ok('Vercel trả manifest của trò đúng kiểu application/manifest+json, không cache lâu',
     vc.headers.some(h => h.source === '/:trang/app.webmanifest' && h.headers.some(x => x.key === 'Content-Type' && /manifest\+json/.test(x.value)) &&
       h.headers.some(x => x.key === 'Cache-Control' && /max-age=0/.test(x.value))));

  /* chạy nguyên khối trong app.js trên một trình duyệt giả */
  const khoi = nguon.slice(nguon.indexOf("const KHOA_TRO_CAI = 'tdtd.troCai';"), nguon.indexOf('/* Link đưa ra ngoài'));
  /* keKhai: trang có thẻ manifest (Chrome) hay không (Safari, mọi trình duyệt trên iPhone — xem index.html).
     iphone: navigator.standalone như app mở từ màn hình chính iPhone. diaChiNay(): địa chỉ lúc này, sau mọi replaceState. */
  function moTrang({ url = mien, app = false, iphone = false, taiLai = false, kho = {}, dangMo = null, keKhai = true } = {}) {
    const u = new URL(url), kq = { kho, link: 'manifest.webmanifest', ten: 'Thông Điệp', diaChi: null, nghe: {}, boHop: 0 };
    const link = { getAttribute: () => kq.link, setAttribute: (k, v) => { kq.link = v; } };
    const theTen = { getAttribute: () => kq.ten, setAttribute: (k, v) => { kq.ten = v; } };
    const loc = { search: u.search, hash: u.hash, pathname: u.pathname };
    const moiTruong = {
      SAO: DS, navigator: { standalone: iphone }, matchMedia: () => ({ matches: app }),
      localStorage: { getItem: (k) => (k in kho ? kho[k] : null), setItem: (k, v) => { kho[k] = String(v); }, removeItem: (k) => { delete kho[k]; } },
      document: { querySelector: (q) => (q === 'link[rel="manifest"]' ? (keKhai ? link : null) : q === 'meta[name="apple-mobile-web-app-title"]' ? theTen : null) },
      CA: { xoaNhacCai: () => { kq.boHop++; } },
      location: loc,
      history: { state: null, replaceState: (a, b, d) => { kq.diaChi = d; const v = new URL(d, mien); Object.assign(loc, { search: v.search, hash: v.hash, pathname: v.pathname }); } },
      performance: { getEntriesByType: () => [{ type: taiLai ? 'reload' : 'navigate' }] },
      addEventListener: (ten, f) => { kq.nghe[ten] = f; },
    };
    const f = new Function(...Object.keys(moiTruong), 'saoDangMo',
      khoi + '\nvaoTroDaCai(); return { datKeKhai, troLucMo, keKhaiCua, datSao: (s) => { saoDangMo = s; } };');
    Object.assign(kq, f(...Object.values(moiTruong), dangMo));
    kq.diaChiNay = () => loc.pathname + loc.search + loc.hash;
    kq.datThang = (h) => { loc.hash = h; };          // như location.hash = … (moSao): đổi phần sau #, giữ ?tro
    return kq;
  }
  const co = moTrang({ url: mien + '?tro=co-ba-nguoi', app: true });
  ok('app mở lần đầu với ?tro=co-ba-nguoi: nhớ trò vào kho của app, gắn manifest của cờ, vào thẳng cờ (#co-ba-nguoi)',
     co.kho['tdtd.troCai'] === 'co-ba-nguoi' && co.link === 'co-vua-ba-nguoi/app.webmanifest' && co.diaChi === '/?tro=co-ba-nguoi#co-ba-nguoi', JSON.stringify(co.diaChi));
  const lan2 = moTrang({ url: mien, app: true, kho: { 'tdtd.troCai': 'co-ba-nguoi' } });
  ok('mở app lần sau (Chrome mở trang chủ, hay kho đã nhớ): vẫn vào thẳng cờ', lan2.diaChi === '/#co-ba-nguoi' && lan2.link === 'co-vua-ba-nguoi/app.webmanifest');
  const taiLai = moTrang({ url: mien, app: true, taiLai: true, kho: { 'tdtd.troCai': 'co-ba-nguoi' } });
  ok('tải lại trang lúc đang ở trang chủ của app (đã bấm ✕ đóng trò): không tự mở lại trò', taiLai.diaChi === null);
  const coDau = moTrang({ url: mien + '#ho-sen', app: true, kho: { 'tdtd.troCai': 'co-ba-nguoi' } });
  ok('địa chỉ đã có #trò khác: để theo địa chỉ', coDau.diaChi === null);
  coDau.datKeKhai('ho-sen');
  ok('trong app đang ở trò khác: manifest vẫn là của trò đã cài (Chrome kiểm bản cập nhật lúc đó cũng không đổi trang mở đầu)', coDau.link === 'co-vua-ba-nguoi/app.webmanifest');
  const web = moTrang({ url: mien });
  web.datKeKhai('ho-sen');
  const khiMo = web.link;
  web.datKeKhai(null);
  ok('trong trình duyệt: mở trò nào thì gắn manifest của trò đó (cài lúc này thì app mở vào trò này), về trang chủ thì manifest chính',
     khiMo === 'ho-sen/app.webmanifest' && web.link === 'manifest.webmanifest' && web.diaChi === null && !('tdtd.troCai' in web.kho));
  web.datSao({ duong: 'thien-luan-xa' }); web.nghe.appinstalled();
  const sauCai = web.kho['tdtd.troCai'];
  web.datSao(null); web.nghe.appinstalled();
  ok('Android: cài xong lúc đang ở trò nào thì ghi trò đó vào kho (app dùng chung kho với Chrome); cài từ trang chủ thì xoá',
     sauCai === 'thien-luan-xa' && !('tdtd.troCai' in web.kho));
  const la = moTrang({ url: mien + '?tro=khong-co', app: true, kho: { 'tdtd.troCai': 'cung-khong-co' } });
  ok('trò lạ (?tro sai, hay trò đã bỏ): không mở gì, xoá trò lạ khỏi kho, dùng manifest chính',
     la.diaChi === null && !('tdtd.troCai' in la.kho) && la.link === 'manifest.webmanifest');
  const linkLe = moTrang({ url: mien + '?tro=phat-am' });
  ok('ngoài app mà mở link ?tro=: vào thẳng trò đó nhưng không nhớ gì', linkLe.diaChi === '/?tro=phat-am#phat-am' && !('tdtd.troCai' in linkLe.kho));
  ok('gắn vào app: mở trò gọi datKeKhai(s.duong), mọi đường đóng trò (goNutTro) gọi datKeKhai(null), vaoTroDaCai chạy trước theoDiaChi',
     /themNutCaiApp\(s\);\s*datKeKhai\(s\.duong\);/.test(nguon) && /function goNutTro\(\) \{[\s\S]{0,300}datKeKhai\(null\);/.test(nguon) &&
     /vaoTroDaCai\(\);[^\n]*\n\s*theoDiaChi\(\);/.test(nguon));

  /* iPhone: người dùng báo "Sao vô game thêm màn hình chính toàn ra trang chủ không vậy". WebKit đọc manifest một lần lúc
     tải trang (DocumentLoader::loadApplicationManifest: đã có bộ tải thì trả bản cũ), nên đổi thẻ <link> khi vào trò không
     tới được Safari. */
  const html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8');
  const dau = html.slice(0, html.indexOf('</head>'));
  const maKeKhai = (dau.match(/<script>([\s\S]*?)<\/script>/g) || []).map(s => s.slice(8, -9)).find(s => s.includes("rel = 'manifest'")) || '';
  const gan = (ua, { cham = 0, webkit = false } = {}) => {
    const them = [];
    const win = webkit ? { GestureEvent: function () {} } : {};
    try {
      new Function('window', 'navigator', 'document', maKeKhai)(win, { userAgent: ua, maxTouchPoints: cham },
        { createElement: () => ({}), head: { appendChild: (l) => them.push(l) } });
    } catch (e) { return 'lỗi: ' + e.message; }
    return them.length === 1 && them[0].rel === 'manifest' && them[0].href === 'manifest.webmanifest' ? 'co' : them.length ? 'hong' : 'khong';
  };
  const UA = {
    safariIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
    chromeIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1',
    ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    samsung: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  };
  const kqGan = {
    safariIphone: gan(UA.safariIphone, { webkit: true }), chromeIphone: gan(UA.chromeIphone, { webkit: true }),
    iphoneKhongDauHieu: gan(UA.safariIphone), ipad: gan(UA.ipad, { cham: 5 }), safariMac: gan(UA.ipad, { webkit: true }),
    chromeAndroid: gan(UA.chromeAndroid), samsung: gan(UA.samsung), chromeMac: gan(UA.chromeMac),
  };
  ok('index.html không gắn sẵn manifest: đoạn mã đầu trang gắn cho Chrome Android, Samsung, Chrome máy tính; không gắn cho Safari, Chrome trên iPhone, iPad (tự xưng là Mac), Safari máy Mac',
     !/<link[^>]*rel="manifest"/.test(html) && maKeKhai &&
       ['chromeAndroid', 'samsung', 'chromeMac'].every(k => kqGan[k] === 'co') &&
       ['safariIphone', 'chromeIphone', 'iphoneKhongDauHieu', 'ipad', 'safariMac'].every(k => kqGan[k] === 'khong'),
     JSON.stringify(kqGan));
  ok('tên dưới biểu tượng iPhone là "Thông Điệp" (như short_name, như bảng hướng dẫn "Mở Thông Điệp") — không có manifest thì Safari lấy tên thẻ, mà vào trò thì tên thẻ là tên trò',
     (dau.match(/<meta name="apple-mobile-web-app-title" content="([^"]+)">/) || [])[1] === mf.short_name);

  const ip = moTrang({ url: mien + '#co-ba-nguoi', keKhai: false });
  ip.datKeKhai('co-ba-nguoi');
  const trongTro = ip.diaChiNay();
  ip.datKeKhai(null);
  ok('iPhone, trong Safari: vào cờ thì địa chỉ thành /?tro=co-ba-nguoi#co-ba-nguoi ("Thêm vào MH chính" lưu địa chỉ này); về trang chủ thì bỏ ?tro',
     trongTro === '/?tro=co-ba-nguoi#co-ba-nguoi' && ip.diaChiNay() === '/#co-ba-nguoi' && !('tdtd.troCai' in ip.kho), `${trongTro} → ${ip.diaChiNay()}`);
  const ipTuNha = moTrang({ url: mien, keKhai: false });
  ipTuNha.datThang('#ho-sen'); ipTuNha.datKeKhai('ho-sen');
  ok('iPhone, mở trò từ trang chủ (ngôi sao): ?tro gắn vào đúng trò vừa mở', ipTuNha.diaChiNay() === '/?tro=ho-sen#ho-sen', ipTuNha.diaChiNay());
  const ipPhong = moTrang({ url: mien + '?ngay=2026-10-16#co-ba-nguoi/ABCDEF', keKhai: false });
  ipPhong.datKeKhai('co-ba-nguoi');
  ok('iPhone: giữ nguyên mã phòng sau # và các tham số khác (?ngay=)', ipPhong.diaChiNay() === '/?ngay=2026-10-16&tro=co-ba-nguoi#co-ba-nguoi/ABCDEF', ipPhong.diaChiNay());
  const ipLa = moTrang({ url: mien + '#khong-co', keKhai: false });
  ipLa.datKeKhai('khong-co');
  ok('iPhone: trò lạ thì không gắn ?tro', ipLa.diaChi === null && ipLa.diaChiNay() === '/#khong-co');
  const ipLoad = moTrang({ url: mien + '?tro=co-ba-nguoi#co-ba-nguoi', keKhai: false });
  ok('iPhone, tải lại trang trong Safari lúc đang ở cờ: chưa mở trò thì bỏ ?tro (theoDiaChi mở cờ rồi gắn lại), không nhớ gì',
     ipLoad.diaChiNay() === '/#co-ba-nguoi' && !('tdtd.troCai' in ipLoad.kho), ipLoad.diaChiNay());

  const ipApp = moTrang({ url: mien + '?tro=co-ba-nguoi#co-ba-nguoi', iphone: true, keKhai: false });
  ipApp.datKeKhai('ho-sen'); ipApp.datKeKhai(null);
  ok('iPhone, mở app từ màn hình chính (địa chỉ đã lưu): nhớ cờ, vào thẳng cờ; trong app mở trò khác, về trang chủ cũng không đổi địa chỉ',
     ipApp.kho['tdtd.troCai'] === 'co-ba-nguoi' && ipApp.diaChiNay() === '/?tro=co-ba-nguoi#co-ba-nguoi', ipApp.diaChiNay());
  const ipKhongThang = moTrang({ url: mien + '?tro=co-ba-nguoi', iphone: true, keKhai: false });
  ok('iPhone bỏ phần sau # khi lưu (nếu có): ?tro vẫn vào thẳng cờ', ipKhongThang.diaChi === '/?tro=co-ba-nguoi#co-ba-nguoi' && ipKhongThang.kho['tdtd.troCai'] === 'co-ba-nguoi');
  const ipPhongCu = moTrang({ url: mien + '?tro=co-ba-nguoi#co-ba-nguoi/ABCDEF', iphone: true, keKhai: false });
  ok('thêm vào MH chính lúc đang trong phòng cờ: mở app vào thẳng cờ, bỏ mã phòng cũ (không thì lần nào mở app cũng vào lại phòng đã tan)',
     ipPhongCu.diaChiNay() === '/?tro=co-ba-nguoi#co-ba-nguoi' && ipPhongCu.kho['tdtd.troCai'] === 'co-ba-nguoi', ipPhongCu.diaChiNay());
  const ipPhongTaiLai = moTrang({ url: mien + '?tro=co-ba-nguoi#co-ba-nguoi/ABCDEF', iphone: true, taiLai: true, kho: { 'tdtd.troCai': 'co-ba-nguoi' } });
  ok('app tải lại lúc đang trong phòng (app tự cập nhật bản mới): giữ phòng', ipPhongTaiLai.diaChi === null);
  const ipTroKhac = moTrang({ url: mien + '?tro=co-ba-nguoi#ho-sen', app: true, kho: { 'tdtd.troCai': 'co-ba-nguoi' } });
  ok('app mở với ?tro mà sau # là trò khác: vẫn để theo địa chỉ', ipTroKhac.diaChi === null);
  ok('init nghe cả popstate: Back từ trò (địa chỉ có ?tro) về trang chủ thì Safari không báo hashchange, chỉ báo popstate',
     /addEventListener\('hashchange', theoDiaChi\);[\s\S]{0,600}addEventListener\('popstate', theoDiaChi\);/.test(nguon));
  ok('theoDiaChi gọi hai lần liền (popstate rồi hashchange) không mở, đóng trò lần nữa',
     /function theoDiaChi\(\) \{[\s\S]{0,200}if \(s\) \{ if \(saoDangMo !== s\) moSao\(s\); \}\s*else if \(saoDangMo\) dongSao\(true\);/.test(nguon));

  /* Tên gợi ý: người dùng "khi bấm thêm màn hình chính luôn ra thông điệp, mỗi game bạn tự sửa lại tên gợi ý đó cho đúng" */
  const tenDai = DS.filter(t => !t.tenApp || [...t.tenApp].length > 13);
  const trungTen = DS.filter((t, i) => DS.findIndex(x => x.tenApp === t.tenApp) !== i);
  ok('trò nào cũng có tên app riêng (tenApp), không quá 13 chữ — dưới biểu tượng iPhone chỉ hiện chừng 12 chữ (đo bằng phông Apple: dài cỡ "Authenticator" còn vừa) —, không trùng nhau',
     DS.length >= 14 && !tenDai.length && !trungTen.length, tenDai.concat(trungTen).map(t => t.duong + ': ' + t.tenApp).join('; '));
  ok('tên gốc "Thông Điệp" khớp cả ba chỗ: thẻ trong index.html, short_name của manifest chính, TEN_GOC_APP trong app.js',
     (dau.match(/<meta name="apple-mobile-web-app-title" content="([^"]+)">/) || [])[1] === mf.short_name && nguon.includes(`const TEN_GOC_APP = '${mf.short_name}';`));
  for (const keKhai of [false, true]) {
    const t = moTrang({ url: mien, keKhai });
    const luc0 = t.ten;
    t.datThang('#co-ba-nguoi'); t.datKeKhai('co-ba-nguoi');
    const trongCo = t.ten;
    t.datKeKhai('khong-co');
    const trongLa = t.ten;
    t.datKeKhai(null);
    ok(`${keKhai ? 'Chrome' : 'iPhone'}: thẻ tên gợi ý — vào cờ thì "Cờ ba người", trò lạ hay về trang chủ thì "Thông Điệp"`,
       luc0 === 'Thông Điệp' && trongCo === 'Cờ ba người' && trongLa === 'Thông Điệp' && t.ten === 'Thông Điệp', `${luc0} → ${trongCo} → ${trongLa} → ${t.ten}`);
  }
  /* Android: Chrome bỏ hộp cài đã đưa khi manifest đổi (DidUpdateWebManifestURL → Stop → ResetBindings) rồi đưa hộp mới */
  const ch = moTrang({ url: mien });
  ch.datKeKhai('co-ba-nguoi');
  const sauVao = ch.boHop;
  ch.datKeKhai('co-ba-nguoi');
  const vaoLai = ch.boHop;
  ch.datKeKhai(null);
  ok('Chrome: manifest đổi (vào trò, về trang chủ) thì bỏ hộp cài đang cất — hộp đó Chrome đã bỏ; manifest không đổi thì giữ',
     ch.boHop === 2 && sauVao === 1 && vaoLai === 1, `${sauVao}, ${vaoLai}, ${ch.boHop}`);
}

console.log('\n— Mọi #id mà app.js cần phải có trong index.html —');
{
  /* Ngày 9/9 khung bảng trượt bị xoá nhầm khỏi index.html; app.js vẫn gọi $('#sheet-title') nên nút "?"
     ném lỗi và không mở gì — gần một tháng không ai biết, vì không bài kiểm nào đọc index.html. */
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const can = [...new Set([...nguon.matchAll(/\$\('#([\w-]+)'\)/g)].map(m => m[1]))];
  const tuSinh = new Set(['nut-chep-link', 'nut-cai-app']); // phần tử app.js tự tạo bằng createElement
  /* id nằm trong chuỗi HTML do chính app.js dựng (như nút xáo lại trong bảng Giới thiệu) cũng tính là có */
  const thieu = can.filter(id => !tuSinh.has(id) && !html.includes(`id="${id}"`) && !nguon.includes(`id="${id}"`));
  ok(`${can.length} #id mà app.js dùng đều có trong index.html`, !thieu.length, thieu.join(', '));
}

console.log('\n— Bấm Cài app: Android cài luôn, máy khác mới có bảng các bước —');
let choBangCai = Promise.resolve();                  // bấm là việc async: tổng kết ở cuối tệp đợi nó xong
{
  /* Người dùng: "trên android bấm vô chữ cài app, app ko đc cài" (nút trong bảng trùng id với nút cài trên thanh trên cùng,
     thành nút chết), rồi "bấm vô chữ cài app là cài luôn bỏ cái popup giải thích đi". Chạy nguyên moCaiApp, caiNgay, bangCai
     trên một trang giả: $() trả phần tử đầu tiên theo thứ tự trong trang — các phần tử của index.html đứng trước bảng. */
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const cat = (ten) => { const a = nguon.search(new RegExp(`(async )?function ${ten}\\(`)); return nguon.slice(a, nguon.indexOf('\n}\n', a) + 2); };
  const TEN = Object.fromEntries([...khoiSao.matchAll(/duong:\s*'([^']+)'[^}]*?tenApp:\s*'([^']+)'/g)].map(m => [m[1], m[2]]));
  const idTrang = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  /* bangDangMo: đang mở một bảng khác (Giới thiệu) lúc bấm. goiNgay: số lần gọi prompt() ngay trong lúc bấm, trước mọi
     await — Chrome đòi prompt() đi cùng cử chỉ của người dùng. */
  function bam({ loai = 'nhacCai', hop = null, dangMo = null, bangDangMo = false } = {}) {
    const kq = { mo: [], dong: 0, bao: [], tt: null, bo: 0, goi: 0 };
    const trang = Object.fromEntries([...idTrang].map(id => [id, { id, tu: 'trang' }]));
    trang['sheet-wrap'].hidden = !bangDangMo;
    let bang = {};
    if (hop) { const p = hop.prompt; hop.prompt = () => { kq.goi++; return p(); }; }
    const moiTruong = {
      loaiCai: () => loai, linkCaiApp: () => 'https://thong-diep-thuong-de.vercel.app/co-vua-ba-nguoi/',
      toast: (c) => kq.bao.push(c), esc: (c) => String(c), chepTay: () => {},
      navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/129.0.0.0 Mobile Safari/537.36', maxTouchPoints: 5 },
      location: { host: 'thong-diep-thuong-de.vercel.app' }, ICO_CHIA_SE: '', ICO_THEM: '', ICO_BA_CHAM: '',
      tenAppCua: (d) => TEN[d] || 'Thông Điệp', docTroCai: () => null, saoDangMo: dangMo,
      CA: { cachChiaSe: () => ({ nut: 'thanhDuoi', bang: 'keo' }), laIpad: () => false, tenTrongApp: () => null,
            linkSafari: () => null, linkChrome: () => null, nhacCai: () => hop, xoaNhacCai: () => { kq.bo++; hop = null; },
            ghiTT: (t) => { kq.tt = t; }, docTT: () => null },
      openSheet: (t, h) => {
        kq.mo.push(h); trang['sheet-wrap'].hidden = false; bang = {};
        for (const m of h.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>([^<]*)</g)) bang[m[2]] = { id: m[2], tu: 'bang', chu: m[3].trim() };
      },
      closeSheet: () => { kq.dong++; trang['sheet-wrap'].hidden = true; },
      $: (s) => { const id = s.replace(/^#/, ''); return trang[id] || bang[id] || null; },
    };
    new Function(...Object.keys(moiTruong), cat('moCaiApp') + cat('caiNgay') + cat('bangCai') + '\nmoCaiApp();')(...Object.values(moiTruong));
    kq.goiNgay = kq.goi;
    kq.xong = new Promise(r => setTimeout(r, 0));      // hộp cài giả trả lời ngay: một vòng là xong mọi await
    return kq;
  }
  const hopCai = (chon) => ({ prompt: () => Promise.resolve({ outcome: chon }), userChoice: Promise.resolve({ outcome: chon, platform: 'web' }) });
  const hopChet = () => ({ prompt: () => Promise.reject(new Error('The prompt() method was called on an event that is no longer valid.')), userChoice: new Promise(() => {}) });
  const tay = (h) => /Cài đặt ứng dụng/.test(h || '');

  choBangCai = (async () => {
    const b0 = bam({ hop: hopCai('accepted') });
    await b0.xong;
    ok('Android có hộp cài: bấm Cài app là gọi hộp cài của Chrome ngay trong lúc bấm, không mở bảng giải thích; đồng ý thì báo đang cài, nhớ đã cài',
       b0.goiNgay === 1 && !b0.mo.length && b0.bao.includes('Đang cài app…') && b0.tt && b0.tt.daCai === true && b0.bo >= 1,
       JSON.stringify({ goiNgay: b0.goiNgay, moBang: b0.mo.length, bao: b0.bao }));
    const b1 = bam({ hop: hopCai('dismissed') });
    await b1.xong;
    ok('bấm Cài app rồi bấm Huỷ: không mở bảng, không báo gì', b1.goi === 1 && !b1.mo.length && !b1.bao.length && !b1.tt);
    const b2 = bam({ hop: hopChet() });
    await b2.xong;
    ok('hộp cài đã chết (Chrome bỏ khi manifest đổi): không im — mở bảng cách cài bằng menu Chrome', b2.mo.length === 1 && tay(b2.mo[0]), `${b2.mo.length} lần mở bảng`);
    const b3 = bam({ hop: null });
    await b3.xong;
    ok('lúc bấm không còn hộp cài nào: mở bảng cách cài bằng menu', b3.mo.length === 1 && tay(b3.mo[0]));
    const b4 = bam({ hop: hopCai('accepted'), bangDangMo: true });
    await b4.xong;
    ok('đang mở bảng Giới thiệu (mục ?) mà bấm "Cài app vào điện thoại": đóng bảng rồi gọi hộp cài ngay', b4.dong === 1 && b4.goiNgay === 1 && !b4.mo.length);
    const b5 = bam({ loai: 'androidTay' });
    ok('Android chưa đưa hộp cài: bảng các bước cài bằng menu', b5.mo.length === 1 && tay(b5.mo[0]));
    ok('iPhone vẫn là bảng các bước (Apple không cho trang web tự cài), ghi đúng tên sẽ hiện dưới biểu tượng: trong cờ "Cờ ba người", ở trang chủ "Thông Điệp"',
       /Mở <b>Cờ ba người<\/b> từ màn hình chính/.test(bam({ loai: 'iosSafari', dangMo: { duong: 'co-ba-nguoi' } }).mo[0]) &&
       /Mở <b>Thông Điệp<\/b> từ màn hình chính/.test(bam({ loai: 'iosSafari' }).mo[0]));
    const idApp = [...new Set([...nguon.matchAll(/id="([^"$]+)"/g)].map(m => m[1]))];
    const trung = idApp.filter(id => idTrang.has(id));
    ok('không id nào trong các bảng app.js dựng trùng id của index.html — trùng thì $() lấy phần tử của trang, nút trong bảng thành nút chết',
       !trung.length, trung.join(', '));
  })();
}

choBangCai.catch((e) => ok('bài kiểm bảng cài app chạy hết', false, e.message)).then(() => {
  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
  process.exit(fail ? 1 : 0);
});
