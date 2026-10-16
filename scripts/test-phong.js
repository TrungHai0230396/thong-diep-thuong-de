/* Kiểm thử chơi qua mạng (Cờ vua ba người): node scripts/test-phong.js
   Người dùng: "cờ vua 3 người làm tạo phòng để chơi nhiều máy đi, đừng làm đánh trên 1 máy". Bài này dựng máy chủ giả
   (scripts/fb-gia.js — làm đúng những gì đã đo trên Firebase thật) rồi cho ba "máy" — ba bản app riêng, mỗi bản một kho
   lưu riêng — vào chung một phòng: tạo phòng, vào bằng mã, hai người tranh một ghế, bắt đầu với máy chơi thay ghế trống,
   đi quân, nước sai luật, hai máy ghi cùng một ô, người vắng thì cho máy đi thay rồi quay lại tự đi tiếp, ván nữa, hết
   ván thì dọn phòng, phòng không có, phòng quá hạn. Sau mỗi bước so thế cờ của các máy: phải giống hệt nhau. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const { taoMay } = require('./fb-gia.js');
const goc = path.join(__dirname, '..');
const NGUON_PHONG = fs.readFileSync(path.join(goc, 'assets', 'phong.js'), 'utf8');
const NGUON_COBA = fs.readFileSync(path.join(goc, 'assets', 'coba.js'), 'utf8');
const NGUON_MAQR = fs.readFileSync(path.join(goc, 'assets', 'maqr.js'), 'utf8');
const QR = require(path.join(goc, 'assets', 'maqr.js'));

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const cho = (ms) => new Promise(r => setTimeout(r, ms));
async function doi(dk, ms = 5000) { const a = Date.now(); while (Date.now() - a < ms) { if (dk()) return true; await cho(20); } return !!dk(); }

/* EventSource tối giản cho Node; tamDung giữ sự kiện lại (giả một máy chưa kịp nhận) */
class ES {
  constructor(url) {
    this.readyState = 0; this.nghe = {}; this.onerror = null; this.tamDung = false; this.hang = [];
    this.req = http.get(url, { headers: { Accept: 'text/event-stream' } }, (res) => {
      this.readyState = 1; let dem = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { dem += c; let i; while ((i = dem.indexOf('\n\n')) >= 0) { const k = dem.slice(0, i); dem = dem.slice(i + 2); this.nhan(k); } });
      res.on('end', () => { this.readyState = 2; });
    });
    this.req.on('error', () => { this.readyState = 2; if (this.onerror) this.onerror(); });
  }
  nhan(khoi) {
    let ev = 'message', du = '';
    for (const d of khoi.split('\n')) { if (d.startsWith('event:')) ev = d.slice(6).trim(); else if (d.startsWith('data:')) du += d.slice(5).trim(); }
    if (this.tamDung) { this.hang.push([ev, du]); return; }
    (this.nghe[ev] || []).forEach(f => f({ data: du }));
  }
  chayTiep() { this.tamDung = false; const h = this.hang; this.hang = []; for (const [ev, du] of h) (this.nghe[ev] || []).forEach(f => f({ data: du })); }
  addEventListener(t, f) { (this.nghe[t] = this.nghe[t] || []).push(f); }
  close() { this.readyState = 2; this.req.destroy(); }
}

const ve2d = new Proxy({}, { get: (_, k) => (k === 'createLinearGradient' || k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 10 }) : () => {}), set: () => true });
function nut(cls = '') {
  const o = {
    className: cls, innerHTML: '', textContent: '', value: '', style: {}, children: [], _q: {}, dataset: {}, disabled: false,
    hidden: /cb-(tin|bao|noi|thay)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 560, bottom: 40 }),
    appendChild(c) { o.children.push(c); return c; }, getContext: () => ve2d, closest: () => null,
    querySelector(sel) { const k = String(sel).replace(/^[.#]/, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
  };
  return o;
}
/* một "máy": bản app riêng (phong.js + coba.js) trong một ngữ cảnh riêng, kho lưu riêng, địa chỉ riêng */
function mayKhach(ten, url) {
  const luu = { 'tdtd.coba': JSON.stringify({ h: 1, ten }) };
  const m = { ten, luu, es: null };
  const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval, performance, URL, fetch, TDTD_FB_THU: url,
    devicePixelRatio: 1, innerWidth: 375, innerHeight: 812,
    navigator: { share: () => Promise.resolve(), clipboard: { writeText: (chu) => { m.chep = chu; return Promise.resolve(); } } },   // như điện thoại
    localStorage: { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } },
    location: { origin: 'http://' + ten.toLowerCase(), pathname: '/', search: '', hash: '' },
    EventSource: class extends ES { constructor(u) { super(u); m.es = this; } },
  };
  ctx.history = { replaceState: (_, __, u) => { const i = String(u).indexOf('#'); ctx.location.hash = i >= 0 ? String(u).slice(i) : ''; } };
  ctx.document = { body: nut('body'), hidden: false, createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  ctx.addEventListener = () => {}; ctx.removeEventListener = () => {};
  ctx.requestAnimationFrame = (f) => setTimeout(() => f(performance.now() + 60000), 3);   // hình động xong ngay ở khung kế
  ctx.cancelAnimationFrame = (i) => clearTimeout(i);
  ctx.self = ctx; ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(NGUON_PHONG, ctx);
  vm.runInContext(NGUON_MAQR, ctx);
  vm.runInContext(NGUON_COBA, ctx);
  Object.assign(m, { ctx, C: ctx.TDTD_COBA, PH: ctx.TDTD_PHONG, khung: () => ctx.document.body.children.find(c => c.className === 'coba') });
  m.tin = () => m.khung().querySelector('.cb-tin').querySelector('.cb-tin-trong').innerHTML;
  m.the = () => { const v = m.C._van(); return v ? Array.from(v.the.o).join(',') + '|' + v.the.luot + '|' + v.the.song.join('') : ''; };
  m.yen = () => !m.C._hoat() && m.C._van() && m.C._van().dangNghi < 0;
  m.bam = (sel, ds = {}) => m.C._bam({ target: { closest: (s) => (s === sel ? { dataset: ds } : null) } });   // bấm nút trong bảng
  return m;
}

(async () => {
  const may = await taoMay(0);
  const url = 'http://127.0.0.1:' + may.cong;
  const An = mayKhach('An', url), Binh = mayKhach('Bình', url), Chi = mayKhach('Chi', url);
  const ca = [An, Binh, Chi];
  for (const m of ca) m.C.mo();
  const L = An.C.L, o = (P, f, r) => L.oCua(P, 'abcdefgh'.indexOf(f), r);
  const nuoc = (m, P, tu, toi) => L.nuocHopLe(m.C._van().the, P).find(n => n.tu === tu && n.toi === toi);
  const khop = (ds) => ds.every(m => m.the() === ds[0].the());

  console.log('\n— Mã phòng, dữ liệu Firebase, luật —');
  {
    const PH = An.PH, r = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    const ma = Array.from({ length: 300 }, () => PH.maMoi(r)), id = Array.from({ length: 50 }, () => PH.idMoi(r));
    ok('mã phòng 6 ký tự, không có I, O, 0, 1 cho khỏi đọc nhầm; mã người chơi đúng khuôn luật', ma.every(x => /^[A-HJ-NP-Z2-9]{6}$/.test(x) && PH.laMa(x)) && id.every(x => /^[a-z0-9]{8,16}$/.test(x)) && !PH.laMa('ABCDE0') && !PH.laMa('abcdef'));
    const tm = An.C._trichMa;
    ok('ô nhập mã nhận mã trần (chữ thường, có cách, có gạch), cả link mời, link #co-ba-nguoi/MÃ, cả tin nhắn mời dán nguyên; mã sai khuôn thì không',
       ['ryxqqe', ' RYX-QQE ', 'https://thong-diep-thuong-de.vercel.app/co-vua-ba-nguoi/?phong=RYXQQE', 'http://localhost:5179/#co-ba-nguoi/RYXQQE',
        'Vào phòng RYXQQE chơi cờ ba người https://thong-diep-thuong-de.vercel.app/co-vua-ba-nguoi/?phong=RYXQQE'].every(x => tm(x) === 'RYXQQE') &&
       ['ABCDE0', 'RYXQQ', 'RYXQQEE', '', 'https://thong-diep-thuong-de.vercel.app/co-vua-ba-nguoi/?phong=RYXQ0E'].every(x => tm(x) === ''));
    ok('Firebase trả mảng (khoá số liền nhau, chỗ trống null): đổi về đối tượng', JSON.stringify(PH.chuan({ ghe: [{ id: 'a' }, null, { id: 'b' }], nuoc: [{ P: 0 }] })) === JSON.stringify({ ghe: { 0: { id: 'a' }, 2: { id: 'b' } }, nuoc: { 0: { P: 0 } } }));
    let c = PH.ap(null, 'put', '/', { tao: 1, ghe: [{ id: 'a' }] });
    c = PH.ap(c, 'patch', '/', { batDau: 5, 'may/1': 'ho' });
    c = PH.ap(c, 'put', '/nuoc/0', { P: 0, tu: 12, toi: 28 });
    c = PH.ap(c, 'put', '/may/1', null);
    ok('put thay hẳn một chỗ, patch thay vài khoá (cả khoá có dấu /), null là xoá và nhánh rỗng mất', JSON.stringify(c) === JSON.stringify({ tao: 1, ghe: { 0: { id: 'a' } }, batDau: 5, nuoc: { 0: { P: 0, tu: 12, toi: 28 } } }), JSON.stringify(c));
    /* nước tới từ máy chủ phải khớp đúng một nước hợp lệ; tốt phong cấp thì nhận Hậu, Xe, Tượng, Mã (máy đi qua mạng
       chọn được như người chơi tại chỗ) */
    const t = L.theMoi(); t.o.fill(0); t.nhap = 0; t.vua = [o(0, 'e', 1), o(1, 'e', 1), o(2, 'e', 1)];
    t.o[t.vua[0]] = 0 * 8 + L.LOAI.VUA; t.o[t.vua[1]] = 1 * 8 + L.LOAI.VUA; t.o[t.vua[2]] = 2 * 8 + L.LOAI.VUA;
    let tot = -1, toi = -1;
    for (let c = 0; c < 96 && tot < 0; c++) {
      const d = L.TOT_TIEN[0][c];
      if (L.nhaO(c) !== 0 && L.hangO(c) === 2 && d >= 0 && L.hangO(d) === 1 && L.nhaO(d) !== 0 && !t.o[d] && !t.o[c]) { tot = c; toi = d; }
    }
    t.o[tot] = 0 * 8 + L.LOAI.TOT; t.luot = 0;
    const nhan = (phong) => !!An.C._timNuocMang(t, { P: 0, tu: tot, toi, phong, nhap: 0 });
    ok('nước từ máy chủ: tốt phong cấp nhận Hậu, Xe, Tượng, Mã; không nhận phong thành tốt, vua, hay quên chọn quân',
       tot >= 0 && [5, 4, 3, 2].every(nhan) && ![0, 1, 6].some(nhan) && An.C._timNuocMang(t, { P: 0, tu: tot, toi, phong: 4, nhap: 0 }).phong === 4);
    const thuong = L.nuocHopLe(L.theMoi(), 0).find(n => !n.phong);
    ok('nước thường mà kèm phong cấp, sai lượt, hay không có quân thì không nhận',
       !An.C._timNuocMang(L.theMoi(), { P: 0, tu: thuong.tu, toi: thuong.toi, phong: 5, nhap: 0 }) && !An.C._timNuocMang(L.theMoi(), { P: 2, tu: thuong.tu, toi: thuong.toi, phong: 0, nhap: 0 }) &&
       !An.C._timNuocMang(L.theMoi(), { P: 0, tu: 40, toi: 41, phong: 0, nhap: 0 }) && !!An.C._timNuocMang(L.theMoi(), { P: 0, tu: thuong.tu, toi: thuong.toi, phong: 0, nhap: 0 }));
    const luat = JSON.parse(fs.readFileSync(path.join(goc, 'firebase-rules.json'), 'utf8')).rules, ph = luat.coba.$ma;
    ok('luật: gốc đóng; không ai liệt kê được các phòng (Firebase không cho so lớn nhỏ trên câu tìm nên bỏ hẳn)',
       luat['.read'] === false && luat['.write'] === false && !('.read' in luat.coba) && !('.indexOn' in luat.coba));
    ok('luật: nước đi chỉ ghi một lần và sau khi bắt đầu; ghế chỉ giành một lần, trước khi bắt đầu; khoá lạ bị chặn',
       /!data\.exists\(\) && root\.child\('coba\/' \+ \$ma \+ '\/batDau'\)\.exists\(\)/.test(ph.nuoc.$n['.write']) &&
       /^!data\.exists\(\) && !root/.test(ph.ghe.$P.id['.write']) && ph.$khac['.validate'] === false && ph.nuoc.$n.$khac['.validate'] === false);
    ok('luật: khuôn mã phòng trong luật đúng bằng khuôn app dùng; phòng chỉ xoá được khi quá một ngày, hay hết ván 5 phút',
       ph['.read'].includes('/^[A-HJ-NP-Z2-9]{6}$/') && /86400000/.test(ph['.write']) && /xong'\)\.val\(\) < now - 300000/.test(ph['.write']));
  }

  console.log('\n— Tạo phòng, vào bằng mã, tranh ghế, bắt đầu —');
  await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An' });
  const ma = An.C._phong() && An.C._phong().ma;
  await doi(() => An.C._phong().cay);
  ok('An tạo phòng: có mã, ngồi Trắng, địa chỉ mang mã phòng, máy nhớ ghế để mở lại', !!ma && An.C._phong().P === 0 && An.ctx.location.hash === '#co-ba-nguoi/' + ma &&
     JSON.parse(An.luu['tdtd.coba']).phong.ma === ma && /Phòng chờ/.test(An.tin()));
  /* Người dùng: "chỗ tạo phòng vô phòng khó sài quá". Phòng chờ giờ đổi theo ai đang xem và đã có ai vào chưa */
  ok('chủ phòng lúc chưa ai vào: Gửi link mời là nút chính, Bắt đầu là nút phụ nằm dưới, nói rõ máy chơi thay 2 ghế; có nút hiện mã QR',
     /Chưa ai vào/.test(An.tin()) && /class="cb-moi-ban">Gửi link mời/.test(An.tin()) && /class="cb-phu cb-batdau-phong">Bắt đầu<small>máy chơi thay 2 ghế trống<\/small>/.test(An.tin()) &&
     /cb-qr-bat">Hiện mã QR/.test(An.tin()) && An.tin().indexOf('cb-moi-ban') < An.tin().indexOf('cb-batdau-phong'));
  An.bam('.cb-qr-bat');
  const coQR = An.tin().includes(QR.svg(`http://an/co-vua-ba-nguoi/?phong=${ma}`)) && /cb-qr-bat">Ẩn mã QR/.test(An.tin());
  An.bam('.cb-qr-bat');
  ok('bấm hiện mã QR: mã trong phòng chờ chính là link mời …/co-vua-ba-nguoi/?phong=MÃ; bấm lần nữa thì ẩn', coQR && !/<svg/.test(An.tin()));
  /* Người dùng: "gửi link mời cho sao chép link nữa" */
  ok('điện thoại có bảng chia sẻ: cạnh "Gửi link mời" có nút "Chép link"',
     /class="cb-moi-ban">Gửi link mời<\/button><button type="button" class="cb-phu cb-chep-link">Chép link<\/button>/.test(An.tin()));
  An.bam('.cb-chep-link'); await cho(20);
  ok('bấm Chép link: chép đúng link mời …/co-vua-ba-nguoi/?phong=MÃ; nút đổi thành "Đã chép ✓", có lời báo; đang có bảng thì lời báo dời xuống dưới, nằm trên bảng',
     An.chep === `http://an/co-vua-ba-nguoi/?phong=${ma}` && An.khung().querySelector('.cb-tin .cb-chep-link').textContent === 'Đã chép ✓' &&
     /Đã chép link mời phòng/.test(An.khung().querySelector('.cb-bao').textContent) && An.khung().classList.contains('cb-co-tin'), An.chep);
  {
    const chiaSe = An.ctx.navigator.share, boNho = An.ctx.navigator.clipboard;
    delete An.ctx.navigator.share; An.C._kiemPhong();
    ok('máy không có bảng chia sẻ (trình duyệt trong Zalo, máy tính): một nút "Chép link mời" làm nút chính', /class="cb-chep-link">Chép link mời/.test(An.tin()) && !/cb-moi-ban/.test(An.tin()));
    An.ctx.navigator.clipboard = { writeText: () => Promise.reject(new Error('không cho')) };
    An.bam('.cb-chep-link'); await cho(20);
    ok('chép tự động không được (cả cách cũ): hiện link trong ô để chạm giữ mà chép', /cb-o-link[^>]*value="http:\/\/an\/co-vua-ba-nguoi\/\?phong=/.test(An.tin()));
    An.ctx.navigator.share = chiaSe; An.ctx.navigator.clipboard = boNho;
    An.bam('.cb-dongtin');
    ok('bấm Xong: về lại phòng chờ, lại có Gửi link mời và Chép link', /Phòng chờ/.test(An.tin()) && /cb-moi-ban">Gửi link mời/.test(An.tin()) && /cb-chep-link">Chép link</.test(An.tin()));
  }
  Binh.C._vaoPhong(ma); Chi.C._vaoPhong(ma);
  await doi(() => Binh.C._phong().cay && Chi.C._phong().cay);
  ok('người mở link: thấy An mời, mỗi ghế trống một nút "Vào chơi quân …" (Đen rồi Đỏ, đúng thứ tự đi), ghế trống ghi "Chờ bạn"',
     /An mời bạn chơi cờ ba người/.test(Binh.tin()) && /data-ngoi="2"><i[^>]*><\/i>Vào chơi quân Đen<\/button><button[^>]*data-ngoi="1"><i[^>]*><\/i>Vào chơi quân Đỏ/.test(Binh.tin()) &&
     (Binh.tin().match(/<b>Chờ bạn<\/b>/g) || []).length === 2);
  ok('Bình, Chi vào bằng mã: thấy phòng chờ, chưa có ghế, có nút Ngồi đây', Binh.C._phong().P === -1 && /data-ngoi="2"/.test(Binh.tin()) && /An/.test(Binh.tin()));
  for (const m of [Binh, Chi]) m.khung().querySelector('.cb-o-ten').value = m.ten;   // ô tên trong phòng chờ điền sẵn tên đã lưu
  await Promise.all([Binh.C._ngoiGhe(2), Chi.C._ngoiGhe(2)]);
  const den = [Binh, Chi].find(m => m.C._phong().P === 2), xem = den === Binh ? Chi : Binh;
  ok('hai người cùng bấm ghế Đen một lúc: đúng một người được, người kia vẫn đang xem', !!den && xem.C._phong().P === -1 && [Binh, Chi].filter(m => m.C._phong().P === 2).length === 1);
  await doi(() => /Bắt đầu/.test(An.tin()) && An.C._phong().cay.ghe[2]);
  ok('chỉ chủ phòng có nút Bắt đầu', /cb-batdau-phong/.test(An.tin()) && !/cb-batdau-phong/.test(den.tin()));
  ok('chủ phòng thấy bạn đã vào: Bắt đầu thành nút chính (máy chơi thay 1 ghế), Gửi link mời lùi xuống nút phụ',
     /1 bạn đã vào, còn 1 ghế trống/.test(An.tin()) && /class="cb-batdau-phong">Bắt đầu<small>máy chơi thay 1 ghế trống/.test(An.tin()) &&
     /class="cb-phu cb-moi-ban">Gửi link mời/.test(An.tin()) && An.tin().indexOf('cb-batdau-phong') < An.tin().indexOf('cb-moi-ban'));
  ok('người được mời đã ngồi: chờ An bấm Bắt đầu, có Mời thêm bạn (nút phụ), không có "1 bạn đã vào" như chủ phòng',
     /Chờ An bấm Bắt đầu/.test(den.tin()) && /class="cb-phu cb-moi-ban">Mời thêm bạn/.test(den.tin()) && !/bạn đã vào/.test(den.tin()));
  /* chủ phòng chuyển sang Zalo gửi link là thôi báo "còn ở đây"; quá một phút thì người được mời mới có Bắt đầu, nút phụ */
  den.C._phong().lech += 70000; den.C._kiemPhong();
  ok('chủ phòng vắng quá một phút: người được mời thấy An đang vắng, có Bắt đầu nhưng là nút phụ (khỏi bấm nhầm khi người thứ ba chưa vào)',
     /An đang vắng/.test(den.tin()) && /class="cb-phu cb-batdau-phong">Bắt đầu/.test(den.tin()) && !/class="cb-batdau-phong"/.test(den.tin()));
  den.C._phong().lech -= 70000; den.C._kiemPhong();
  await An.C._batDauPhong();
  await doi(() => ca.every(m => m.C._van() && m.C._van().cheDo === 'phong' && m.yen()));
  ok('An bấm Bắt đầu: cả ba máy vào ván; ghế Đỏ trống thì Hổ chơi thay; người thua ghế thành người xem',
     ca.every(m => m.C._van().nguoi.join() === 'nguoi,may,nguoi') && An.C._tenNha(1) === 'Hổ' && An.C._tenNha(0) === 'Bạn' && den.C._tenNha(0) === 'An' && xem.C._van().nguoiChoi === -1 && khop(ca));
  ok('người xem không đi được quân nào', !xem.C._laMinh(0) && !xem.C._laMinh(1) && !xem.C._laMinh(2));

  console.log('\n— Đi quân: mọi máy luôn cùng một thế cờ —');
  An.C._diNuoc(nuoc(An, 0, o(0, 'e', 2), o(0, 'e', 4)), 0);
  await doi(() => ca.every(m => m.C._phong().ke === 1 && m.yen()));
  ok('An đi e2–e4: hai máy kia nhận được, tới lượt Đen', khop(ca) && den.C._van().the.luot === 2 && den.C._laMinh(2));
  den.C._diNuoc(nuoc(den, 2, o(2, 'e', 2), o(2, 'e', 4)), 2);
  await doi(() => ca.every(m => m.C._phong().ke === 3 && m.yen() && m.C._van().the.luot === 0), 8000);
  ok('Đen đi; Hổ (Đỏ) do máy An nghĩ giùm — ghế số nhỏ nhất còn ở đây; ba máy cùng thế cờ, lại tới lượt An',
     khop(ca) && An.C._toiChayMay() && !den.C._toiChayMay() && !xem.C._toiChayMay(), `ke ${ca.map(m => m.C._phong().ke)}`);
  ok('không máy nào nghĩ trùng nước của Hổ: máy chủ không phải từ chối lần ghi nào (chỉ một lần, lúc tranh ghế)',
     Object.keys(may.lay(`coba/${ma}/nuoc`)).length === 3 && may.soTuChoi() === 1, `${may.soTuChoi()} lần từ chối`);

  console.log('\n— Nước sai luật, hai máy ghi cùng một ô —');
  {
    const n = An.C._phong().ke;
    await fetch(`${url}/coba/${ma}/nuoc/${n}.json`, { method: 'PUT', body: JSON.stringify({ P: 2, tu: 0, toi: 1, phong: 0, nhap: 0 }) });
    await doi(() => ca.every(m => m.C._phong().ke === n + 1));
    ok('người lạ ghi một nước sai luật vào ô kế tiếp: máy nào cũng bỏ qua như nhau, vẫn lượt An', khop(ca) && An.C._van().the.luot === 0);
    An.C._diNuoc(nuoc(An, 0, o(0, 'g', 1), o(0, 'f', 3)), 0);
    await doi(() => ca.every(m => m.C._phong().ke === n + 2 && m.yen()));
    ok('An đi tiếp ở ô sau đó: ba máy vẫn khớp, tới lượt Đen', khop(ca) && den.C._van().the.luot === 2);
    /* máy Đen chưa kịp nhận thì có người ghi trước một nước khác của Đen vào đúng ô Đen định ghi */
    den.es.tamDung = true;
    const k = An.C._phong().ke, chen = nuoc(An, 2, o(2, 'd', 2), o(2, 'd', 3));
    await fetch(`${url}/coba/${ma}/nuoc/${k}.json`, { method: 'PUT', body: JSON.stringify({ P: 2, tu: chen.tu, toi: chen.toi, phong: 0, nhap: 0 }) });
    den.C._diNuoc(nuoc(den, 2, o(2, 'b', 1), o(2, 'c', 3)), 2);
    await cho(300);
    den.es.chayTiep();
    await doi(() => ca.every(m => m.yen() && m.C._phong().ke >= k + 1) && khop(ca), 8000);
    ok('máy Đen ghi sau thì bị từ chối (401), dựng lại từ danh sách trên máy chủ: ba máy khớp, nước được tính là nước ghi trước',
       khop(ca) && den.C._van().the.o[chen.toi] !== 0 && den.C._van().the.o[o(2, 'c', 3)] === 0);
  }

  console.log('\n— Người vắng: cho máy đi thay, quay lại thì tự đi tiếp —');
  {
    await doi(() => ca.every(m => m.yen()) && An.C._van().the.luot === 0, 8000);
    An.C._diNuoc(L.nuocHopLe(An.C._van().the, 0)[0], 0);
    await doi(() => ca.every(m => m.yen()) && An.C._van().the.luot === 2);
    den.C.dong();                                                      // Đen tắt app: thôi nghe, thôi báo "còn ở đây"
    ok('chưa quá 60 giây: chưa có nút cho máy đi thay', An.C._viecPhong() === '');
    const lechThat = An.C._phong().lech;
    An.C._phong().lech += 70000;                                       // vặn đồng hồ máy An: Đen đã im lặng hơn 60 giây
    An.C._kiemPhong();
    ok('quá 60 giây mà tới lượt Đen chưa đi: An thấy nút "Cho máy đi thay"', An.C._viecPhong() === 'thay');
    An.C._choMayThay();
    await doi(() => An.C._phong().cay.may && An.C._phong().cay.may[2] === 'rua');
    /* chờ cả người xem nhận xong nước cuối (luồng sự kiện tới sau vài mili giây) — bản trước chỉ chờ hai máy rảnh nên lâu lâu
       so lúc người xem còn thiếu một nước */
    await doi(() => [An, xem].every(m => m.yen()) && An.C._van().the.luot === 0 && khop([An, xem]), 8000);
    ok('An bấm: Rùa chơi thay ghế Đen (Hổ đã ở ghế Đỏ), máy An nghĩ giùm và ghi nước; người xem vẫn khớp',
       An.C._tenNha(2) === 'Rùa' && khop([An, xem]) && An.C._van().the.luot === 0,
       `tên ${An.C._tenNha(2)} · khớp ${khop([An, xem])} · lượt ${An.C._van().the.luot} · yên ${An.yen()}/${xem.yen()} · nghĩ ${An.C._van().dangNghi} · ke ${An.C._phong().ke}/${xem.C._phong().ke} · máy ${JSON.stringify(An.C._phong().cay.may)} · lệch ${An.C._phong().lech}`);
    An.C._phong().lech = lechThat;                                     // trả đồng hồ (máy An báo "còn ở đây" có thể đã đo lại lệch)
    den.C.mo();                                                        // Đen mở lại app
    await doi(() => den.C._viecPhong() === 'tudi' && den.yen() && khop([An, den]), 6000);
    ok('Đen quay lại: đuổi kịp các nước đã đi, thấy nút "Tự đi tiếp"', den.C._viecPhong() === 'tudi' && khop([An, den, xem]));
    den.C._tuDiTiep();
    await doi(() => !An.C._phong().cay.may[2] && An.C._van().nguoi[2] === 'nguoi');
    ok('Đen bấm Tự đi tiếp: ghế Đen lại là người, máy An thấy tên Đen', An.C._van().nguoi[2] === 'nguoi' && An.C._tenNha(2) === den.ten);
  }

  console.log('\n— Hết ván, ván nữa, dọn phòng —');
  {
    await doi(() => ca.every(m => m.yen()));
    /* giả hết ván ở máy An (khỏi phải đánh tới chiếu hết): An ghi mốc hết ván, hiện bảng Chơi ván nữa */
    An.C._van().the.thang = 0;
    An.C._kiemPhong();
    await doi(() => may.lay(`coba/${ma}/xong`) && /cb-vannua/.test(An.tin()), 3000);
    ok('hết ván: ghi mốc xong lên máy chủ, hiện "Chơi ván nữa" và "Rời phòng"', !!may.lay(`coba/${ma}/xong`) && /cb-vannua/.test(An.tin()) && /cb-roi/.test(An.tin()));
    await An.C._vanNua();
    await doi(() => An.C._phong() && An.C._phong().ma !== ma && An.C._phong().cay);
    const ma2 = An.C._phong().ma;
    ok('An bấm Chơi ván nữa: phòng cũ ghi mã phòng mới (một lần), An vào phòng mới ở ghế Trắng',
       may.lay(`coba/${ma}/tiep`) === ma2 && An.C._phong().P === 0);
    const r = await fetch(`${url}/coba/${ma}/tiep.json`, { method: 'PUT', body: JSON.stringify('ZZZZZZ') });
    ok('không ai ghi đè được lời mời ván nữa', r.status === 401);
    await doi(() => den.C._phong().cay && den.C._phong().cay.tiep === ma2);
    den.C._theoTiep(ma2);
    await doi(() => den.C._phong().ma === ma2 && den.C._phong().P === 2 && /Bình|Chi/.test(An.tin()));
    ok('Đen theo vào phòng mới và tự ngồi lại ghế Đen', den.C._phong().ma === ma2 && den.C._phong().P === 2);
    /* phòng cũ: chỉ xoá được khi hết ván đủ 5 phút */
    const xoaSom = await fetch(`${url}/coba/${ma}.json`, { method: 'DELETE' });
    may.datLech(6 * 60000);
    xem.C._phong().lech += 6 * 60000;
    xem.C._roiPhong();
    await doi(() => may.lay(`coba/${ma}`) === null, 3000);
    ok('phòng cũ: xoá sớm bị từ chối; hết ván đủ 5 phút thì người rời sau cùng dọn luôn', xoaSom.status === 401 && may.lay(`coba/${ma}`) === null);
    may.datLech(0);
  }

  console.log('\n— Phòng luật Tam quốc —');
  {
    /* chủ phòng chọn luật Tam quốc: phòng nhớ luật (ô luat, chỉ ghi lúc tạo), máy nào vào cũng chơi đúng luật đó; nước phong
       tướng (ô đi = ô đến) đi qua máy chủ như mọi nước khác */
    await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An', luat: 'tq' });
    const ma3 = An.C._phong().ma;
    await doi(() => An.C._phong().cay);
    Binh.C._vaoPhong(ma3);
    await doi(() => Binh.C._phong() && Binh.C._phong().cay);
    Binh.khung().querySelector('.cb-o-ten').value = Binh.ten;
    await Binh.C._ngoiGhe(2);
    await doi(() => /Phòng chờ/.test(Binh.tin()));
    Binh.bam('.cb-hoi'); Binh.bam('.cb-dongtin');
    ok('mở Cách chơi từ phòng chờ rồi bấm Chơi: về lại phòng chờ (bản trước về bảng Ván mới); phòng chờ có nút xem cách đi từng quân',
       /Phòng chờ/.test(Binh.tin()) && !Binh.khung().querySelector('.cb-tin').hidden && /cb-xemquan/.test(Binh.tin()));
    /* Người dùng: "trong lúc chờ cho nhấn để xem nước đi từng con". Bình xem trong lúc chờ: phòng đổi thì không bật lại
       bảng phòng chờ, chỉ báo; chủ phòng bấm Bắt đầu thì tự đóng */
    Binh.bam('.cb-xemquan', { tu: 'sanh' });
    ok('bấm xem cách đi từng quân: bảng phòng chờ ẩn, nút dưới thành "Về phòng chờ", luật Tam quốc có thêm Tướng',
       !!Binh.C._xem() && Binh.khung().querySelector('.cb-tin').hidden && Binh.khung().querySelector('.cb-xong').textContent === 'Về phòng chờ' &&
       Binh.khung().querySelector('.cb-xem').innerHTML.includes('data-xq="7"'));
    Chi.C._vaoPhong(ma3);
    await doi(() => Chi.C._phong() && Chi.C._phong().cay);
    Chi.khung().querySelector('.cb-o-ten').value = Chi.ten;
    await Chi.C._ngoiGhe(1);
    await doi(() => Chi.C._phong().cay.ghe && Chi.C._phong().cay.ghe[1]);
    Chi.C._roiPhong();                                                 // rời phòng chờ, rồi mở lại link
    Chi.C._vaoPhong(ma3);
    await doi(() => Chi.C._phong() && Chi.C._phong().cay && /Phòng chờ/.test(Chi.tin()));
    ok('rời phòng chờ rồi mở lại link: ngồi lại đúng ghế cũ (máy chủ không cho xoá ghế đã giành, không nhớ thì bị chính ghế mình chặn)',
       Chi.C._phong().P === 1 && !/data-ngoi/.test(Chi.tin()));
    await doi(() => An.C._phong().cay.ghe && An.C._phong().cay.ghe[2] && An.C._phong().cay.ghe[1] && /Đủ ba người/.test(An.tin()));
    await doi(() => Binh.C._phong().cay.ghe && Binh.C._phong().cay.ghe[1]);
    ok('Chi vào lúc Bình đang xem: bảng phòng chờ không bật lại, chỉ báo "Chi vừa vào", dòng dưới tên trò ghi 3/3 người',
       !!Binh.C._xem() && Binh.khung().querySelector('.cb-tin').hidden && /Chi vừa vào chơi quân Đỏ/.test(Binh.khung().querySelector('.cb-bao').textContent) &&
       /3\/3 người · chờ An bắt đầu/.test(Binh.khung().querySelector('.cb-ten span').textContent), Binh.khung().querySelector('.cb-ten span').textContent);
    ok('đủ ba người: chủ phòng thấy "Đủ ba người rồi", Bắt đầu là nút chính, thôi nút mời và mã QR; phòng chờ ghi luật Tam quốc',
       /Đủ ba người rồi/.test(An.tin()) && /class="cb-batdau-phong">Bắt đầu<\/button>/.test(An.tin()) && !/cb-moi-ban|cb-chep-link|cb-qr-bat/.test(An.tin()) && /Phòng chờ · Luật Tam quốc/.test(An.tin()));
    await An.C._batDauPhong();
    await doi(() => [An, Binh, Chi].every(m => m.C._van() && m.C._van().cheDo === 'phong' && m.C._van().ma === ma3));
    ok('An bấm Bắt đầu lúc Bình còn đang xem: bảng xem tự đóng, Bình vào ván, có lời báo',
       !Binh.C._xem() && Binh.khung().querySelector('.cb-xong').hidden && /Ván bắt đầu rồi/.test(Binh.khung().querySelector('.cb-bao').textContent));
    ok('phòng Tam quốc: máy chủ nhớ luat = tq; cả hai máy vào ván đúng luật Tam quốc', may.lay(`coba/${ma3}/luat`) === 'tq' && [An, Binh].every(m => m.C._van().the.tq === true && m.C._van().luat === 'tq'));
    const r = await fetch(`${url}/coba/${ma3}/luat.json`, { method: 'PUT', body: JSON.stringify('tq') });
    ok('không ai đổi được luật sau khi tạo phòng', r.status === 401);
    /* thế chờ chọn tướng dựng tay: nước phong tướng từ máy chủ được nhận đúng; nước thường lúc đó thì không */
    const t = L.theMoi('tq'); t.o.fill(0); t.nhap = 0; t.vua = [o(0, 'e', 1), -1, o(2, 'e', 1)]; t.song = [1, 0, 1];
    t.o[o(0, 'e', 1)] = 6; t.o[o(2, 'e', 1)] = 2 * 8 + 6; t.o[o(1, 'a', 2)] = 1 * 8 + 1; t.o[o(1, 'b', 1)] = 1 * 8 + 2; t.chu = [0, 0, 2]; t.cho = [{ ai: 0, dao: 1, sau: 0 }]; t.luot = 0;
    ok('nước phong tướng từ máy chủ được nhận; lúc đang chờ chọn tướng thì nước thường bị bỏ qua',
       !!An.C._timNuocMang(t, { P: 0, tu: o(1, 'b', 1), toi: o(1, 'b', 1), phong: 0, nhap: 0 }) && !An.C._timNuocMang(t, { P: 0, tu: o(0, 'e', 1), toi: o(0, 'd', 1), phong: 0, nhap: 0 }) &&
       !An.C._timNuocMang(t, { P: 0, tu: o(0, 'e', 1), toi: o(0, 'e', 1), phong: 0, nhap: 0 }));
    for (const m of [An, Binh, Chi]) m.C._roiPhong();
  }

  console.log('\n— Phòng không có, phòng quá hạn —');
  {
    xem.C._vaoPhong('ZZZZZZ');
    await doi(() => xem.C._phong() === null);
    ok('mã sai: báo không thấy phòng, không giữ gì trong máy', /Không thấy phòng/.test(xem.tin()) && !JSON.parse(xem.luu['tdtd.coba']).phong);
    may.gieo('coba/QQQQQQ', { tao: Date.now() - 90000000, chu: 0, kho: 0, ghe: { 0: { id: 'abcdefgh1234', ten: 'Cũ', thay: Date.now() - 90000000 } } });
    xem.C._vaoPhong('QQQQQQ');
    await doi(() => may.lay('coba/QQQQQQ') === null && xem.C._phong() === null, 3000);
    ok('phòng quá một ngày: dọn luôn (luật cho xoá), báo phòng đã đóng', may.lay('coba/QQQQQQ') === null && /đã đóng/.test(xem.tin()));
  }

  console.log('\n— Phòng mở: ai cũng tìm thấy, vào chơi không cần mã —');
  {
    /* Người dùng: "làm tìm phòng trống không có mật khẩu để mọi người tự vô chơi nữa" */
    const dong = (ma) => may.lay(`sanh/${ma}`);
    await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An' });
    const maRieng = An.C._phong().ma;
    await doi(() => An.C._phong().cay && /Phòng chờ/.test(An.tin()));
    await cho(60);
    ok('phòng riêng (mặc định): không hiện trong danh sách phòng mở', !dong(maRieng) && !/Phòng mở/.test(An.tin()));
    An.C._roiPhong();
    await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An', mo: true });
    const ma5 = An.C._phong().ma;
    await doi(() => dong(ma5) && /Phòng mở/.test(An.tin()));
    const d0 = dong(ma5);
    ok('tạo phòng mở: một dòng trong /sanh — tên chủ phòng, còn 2 ghế, dấu giờ máy chủ; phòng chờ ghi "Phòng mở", có nút thôi cho người lạ vào',
       !!d0 && d0.ten === 'An' && d0.trong === 2 && typeof d0.tao === 'number' && typeof d0.thay === 'number' && !('luat' in d0) && /cb-doi-mo/.test(An.tin()), JSON.stringify(d0));
    Binh.C._moCaiDat(); Binh.bam('[data-man]', { man: 'tim' });
    await doi(() => Binh.C._timPhong() && Binh.C._timPhong().xong);
    const ds = (Binh.C._timPhong() || { ds: [] }).ds;
    ok('Bình mở "Tìm phòng đang chờ": thấy phòng của An còn 2 ghế; phòng riêng không có trong danh sách',
       ds.some(d => d.ma === ma5 && d.ten === 'An' && d.trong === 2) && !ds.some(d => d.ma === maRieng), JSON.stringify(ds));
    Binh.bam('[data-phongmo]', { phongmo: ma5 });
    await doi(() => Binh.C._phong() && Binh.C._phong().ma === ma5 && /data-ngoi/.test(Binh.tin()));
    ok('chạm phòng: vào thẳng, không cần mã — thấy "Phòng của An", chọn quân để vào; thôi đọc danh sách',
       /Phòng của An/.test(Binh.tin()) && /Phòng mở/.test(Binh.tin()) && !Binh.C._timPhong());
    Binh.khung().querySelector('.cb-o-ten').value = Binh.ten;
    An.C._phong().nhipCuoi = Date.now();                               // hoãn nhịp "còn ở đây" của An: số ghế phải đổi ngay khi có người vào
    await Binh.C._ngoiGhe(2);
    await doi(() => (dong(ma5) || {}).trong === 1, 2000);
    ok('Bình vào ghế: dòng của phòng còn 1 ghế, đổi ngay (không đợi nhịp báo còn ở đây); phòng chờ của Bình vẫn ghi "Phòng mở"',
       (dong(ma5) || {}).trong === 1 && /Phòng mở/.test(Binh.tin()));
    Chi.C._moCaiDat(); Chi.bam('[data-man]', { man: 'tim' });
    await doi(() => Chi.C._timPhong() && Chi.C._timPhong().xong && Chi.C._timPhong().ds.some(d => d.ma === ma5));
    const dc = (Chi.C._timPhong() || { ds: [] }).ds.find(d => d.ma === ma5);
    Chi.bam('[data-phongmo]', { phongmo: ma5 });
    await doi(() => Chi.C._phong() && Chi.C._phong().ma === ma5 && /data-ngoi/.test(Chi.tin()));
    Chi.khung().querySelector('.cb-o-ten').value = Chi.ten;
    await Chi.C._ngoiGhe(1);
    await doi(() => !dong(ma5));
    ok('Chi thấy còn 1 ghế, vào nốt: đủ ba người thì phòng thôi hiện trong danh sách', !!dc && dc.trong === 1 && !dong(ma5));
    for (const m of [Binh, Chi]) m.C._roiPhong();
    An.C._roiPhong();

    /* luật: chỉ phòng có thật, chưa bắt đầu; đúng khuôn; ai cũng xoá được dòng (dọn dòng đã im) */
    const sv = { '.sv': 'timestamp' }, ghi = (ma, cach, du) => fetch(`${url}/sanh/${ma}.json`, { method: cach, body: du === undefined ? undefined : JSON.stringify(du) }).then(r => r.status);
    const kq = [await ghi('ZZZZZZ', 'PUT', { tao: sv, ten: 'Lạ', trong: 2, thay: sv }), await ghi(maRieng, 'PUT', { tao: sv, trong: 2, thay: sv }),
      await ghi(maRieng, 'PUT', { tao: sv, ten: 'X', trong: 3, thay: sv }), await ghi(maRieng, 'PUT', { tao: sv, ten: 'X', trong: 2, thay: sv, la: 1 }),
      await ghi(maRieng, 'PUT', { tao: sv, ten: 'X', trong: 2, thay: sv, luat: 'khac' }), await ghi(maRieng, 'PUT', { tao: 5, ten: 'X', trong: 2, thay: sv }),
      await ghi(maRieng, 'PUT', { tao: sv, ten: 'X', trong: 2, thay: sv }), await ghi(maRieng, 'DELETE')];
    ok('luật: dòng của phòng không có thật, thiếu tên, ghế trống 3, khoá lạ, luật lạ, giờ giả đều bị chặn; dòng đúng khuôn thì ghi được; ai cũng xoá được',
       kq.join() === '401,401,401,401,401,401,200,200', kq.join());
    may.gieo(`sanh/${maRieng}`, { tao: Date.now() - 200000, ten: 'Cũ', trong: 2, thay: Date.now() - 120000 });
    may.gieo('sanh/QQQQQQ', { tao: Date.now() - 900000, ten: 'Lâu', trong: 2, thay: Date.now() - 700000 });
    Binh.C._moCaiDat(); Binh.bam('[data-man]', { man: 'tim' });
    await doi(() => Binh.C._timPhong() && Binh.C._timPhong().xong);
    await doi(() => !may.lay('sanh/QQQQQQ'), 1500);
    const ds2 = (Binh.C._timPhong() || { ds: [] }).ds;
    ok('danh sách bỏ dòng im quá 90 giây (chủ phòng đã tắt app), dọn giùm dòng im quá 10 phút',
       !ds2.some(d => d.ma === maRieng) && !ds2.some(d => d.ma === 'QQQQQQ') && !may.lay('sanh/QQQQQQ') && !!dong(maRieng));
    Binh.C._moCaiDat();
    may.gieo(`sanh/${maRieng}`, null);

    /* chủ phòng đổi phòng riêng ↔ phòng mở; bắt đầu ván, rời phòng thì xoá dòng */
    await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An', luat: 'tq' });
    const ma6 = An.C._phong().ma;
    await doi(() => An.C._phong().cay && /cb-doi-mo/.test(An.tin()));
    An.bam('.cb-doi-mo');
    await doi(() => dong(ma6));
    const moLai = dong(ma6);
    An.bam('.cb-doi-mo');
    await doi(() => !dong(ma6));
    ok('phòng riêng bấm "Cho người lạ tìm thấy": hiện trong danh sách (phòng Tam quốc ghi luat tq); bấm lần nữa: thôi hiện',
       !!moLai && moLai.luat === 'tq' && !dong(ma6));
    An.bam('.cb-doi-mo');
    await doi(() => dong(ma6));
    await An.C._batDauPhong();
    await doi(() => !dong(ma6) && An.C._van() && An.C._van().ma === ma6);
    ok('bắt đầu ván (máy chơi thay ghế trống): phòng thôi hiện; luật chặn ghi lại dòng cho phòng đã bắt đầu',
       !dong(ma6) && await ghi(ma6, 'PUT', { tao: sv, ten: 'An', trong: 2, thay: sv }) === 401);
    An.C._roiPhong();
    await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An', mo: true });
    const ma7 = An.C._phong().ma;
    await doi(() => dong(ma7));
    An.C._roiPhong();
    await doi(() => !dong(ma7));
    ok('chủ phòng mở rời phòng: phòng thôi hiện trong danh sách', !dong(ma7));
  }

  console.log('\n— Tải lại trang —');
  {
    await An.C._taoPhong({ mau: 0, kho: 0, ten: 'An' });
    const ma4 = An.C._phong().ma;
    await doi(() => An.C._phong().cay);
    An.C.dong();                                                       // trang cũ thôi chạy
    const An2 = mayKhach('An', url);
    An2.luu['tdtd.coba'] = An.luu['tdtd.coba'];                        // trang mới, cùng kho lưu
    An2.C.mo();
    await doi(() => An2.C._phong() && An2.C._phong().cay);
    const truoc = may.lay(`coba/${ma4}/ghe/0/thay`);
    await cho(5);
    An2.C._kiemPhong();
    await doi(() => may.lay(`coba/${ma4}/ghe/0/thay`) !== truoc, 2000);
    ok('tải lại trang: vào lại đúng ghế, báo "còn ở đây" ngay lượt kiểm đầu, khỏi đợi 20 giây cho người khác thấy mình vắng',
       An2.C._phong().P === 0 && may.lay(`coba/${ma4}/ghe/0/thay`) !== truoc && /Phòng chờ/.test(An2.tin()));
    An2.C._roiPhong(); An2.C.dong();
  }

  console.log('\n— Gắn vào app —');
  {
    const app = fs.readFileSync(path.join(goc, 'assets', 'app.js'), 'utf8'), sw = fs.readFileSync(path.join(goc, 'sw.js'), 'utf8');
    const html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8'), trang = fs.readFileSync(path.join(goc, 'co-vua-ba-nguoi', 'index.html'), 'utf8');
    ok('địa chỉ #co-ba-nguoi/MÃ vẫn mở đúng trò (app.js chỉ xét phần trước dấu /)', /location\.hash\.slice\(1\)\.split\('\/'\)\[0\]/.test(app));
    ok('link mời …/co-vua-ba-nguoi/?phong=MÃ chuyển thẳng vào phòng', /\[\?&\]phong=\(\[A-HJ-NP-Z2-9\]\{6\}\)/.test(trang) && trang.includes("location.replace('../#co-ba-nguoi' + (m ? '/' + m[1] : ''))"));
    /* người dùng: "trong app bạn nhắc đến cờ tải lên firebase chi vậy, ẩn mấy chú thích đó đi" — chữ hiện cho người chơi không
       nhắc tên máy chủ (chỉ ghi chú trong mã mới nói) */
    const khongGhiChu = NGUON_COBA.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');
    const chuoiFirebase = khongGhiChu.split('\n').filter(l => /Firebase/i.test(l));
    ok('không còn chữ nào nhắc Firebase hiện ra cho người chơi', !chuoiFirebase.length, chuoiFirebase.join(' | ').slice(0, 160));
    ok('phong.js, maqr.js nạp trước coba.js, có trong bộ nhớ chạy offline; service worker không chen vào Firebase',
       ['phong.js', 'maqr.js'].every(t => html.indexOf('assets/' + t) > 0 && html.indexOf('assets/' + t) < html.indexOf('assets/coba.js') && sw.includes(`'assets/${t}'`)) &&
       /firebasedatabase\.app'\)\) return;/.test(sw));
  }

  for (const m of ca) { m.C._roiPhong(); m.C.dong(); }
  await cho(50);
  await may.dongLai();
  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
