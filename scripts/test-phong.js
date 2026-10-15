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
    devicePixelRatio: 1, innerWidth: 375, innerHeight: 812, navigator: {},
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
  vm.runInContext(NGUON_COBA, ctx);
  Object.assign(m, { ctx, C: ctx.TDTD_COBA, PH: ctx.TDTD_PHONG, khung: () => ctx.document.body.children.find(c => c.className === 'coba') });
  m.tin = () => m.khung().querySelector('.cb-tin').querySelector('.cb-tin-trong').innerHTML;
  m.the = () => { const v = m.C._van(); return v ? Array.from(v.the.o).join(',') + '|' + v.the.luot + '|' + v.the.song.join('') : ''; };
  m.yen = () => !m.C._hoat() && m.C._van() && m.C._van().dangNghi < 0;
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
  Binh.C._vaoPhong(ma); Chi.C._vaoPhong(ma);
  await doi(() => Binh.C._phong().cay && Chi.C._phong().cay);
  ok('Bình, Chi vào bằng mã: thấy phòng chờ, chưa có ghế, có nút Ngồi đây', Binh.C._phong().P === -1 && /data-ngoi="2"/.test(Binh.tin()) && /An/.test(Binh.tin()));
  for (const m of [Binh, Chi]) m.khung().querySelector('.cb-o-ten').value = m.ten;   // ô tên trong phòng chờ điền sẵn tên đã lưu
  await Promise.all([Binh.C._ngoiGhe(2), Chi.C._ngoiGhe(2)]);
  const den = [Binh, Chi].find(m => m.C._phong().P === 2), xem = den === Binh ? Chi : Binh;
  ok('hai người cùng bấm ghế Đen một lúc: đúng một người được, người kia vẫn đang xem', !!den && xem.C._phong().P === -1 && [Binh, Chi].filter(m => m.C._phong().P === 2).length === 1);
  await doi(() => /Bắt đầu/.test(An.tin()) && An.C._phong().cay.ghe[2]);
  ok('chỉ chủ phòng có nút Bắt đầu', /cb-batdau-phong/.test(An.tin()) && !/cb-batdau-phong/.test(den.tin()));
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
    An.C._phong().lech += 70000;                                       // vặn đồng hồ máy An: Đen đã im lặng hơn 60 giây
    An.C._kiemPhong();
    ok('quá 60 giây mà tới lượt Đen chưa đi: An thấy nút "Cho máy đi thay"', An.C._viecPhong() === 'thay');
    An.C._choMayThay();
    await doi(() => An.C._phong().cay.may && An.C._phong().cay.may[2] === 'rua');
    await doi(() => [An, xem].every(m => m.yen()) && An.C._van().the.luot === 0, 8000);
    ok('An bấm: Rùa chơi thay ghế Đen (Hổ đã ở ghế Đỏ), máy An nghĩ giùm và ghi nước; người xem vẫn khớp',
       An.C._tenNha(2) === 'Rùa' && khop([An, xem]) && An.C._van().the.luot === 0);
    An.C._phong().lech -= 70000;
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

  console.log('\n— Gắn vào app —');
  {
    const app = fs.readFileSync(path.join(goc, 'assets', 'app.js'), 'utf8'), sw = fs.readFileSync(path.join(goc, 'sw.js'), 'utf8');
    const html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8'), trang = fs.readFileSync(path.join(goc, 'co-vua-ba-nguoi', 'index.html'), 'utf8');
    ok('địa chỉ #co-ba-nguoi/MÃ vẫn mở đúng trò (app.js chỉ xét phần trước dấu /)', /location\.hash\.slice\(1\)\.split\('\/'\)\[0\]/.test(app));
    ok('link mời …/co-vua-ba-nguoi/?phong=MÃ chuyển thẳng vào phòng', /\[\?&\]phong=\(\[A-HJ-NP-Z2-9\]\{6\}\)/.test(trang) && trang.includes("location.replace('../#co-ba-nguoi' + (m ? '/' + m[1] : ''))"));
    ok('phong.js nạp trước coba.js, có trong bộ nhớ chạy offline; service worker không chen vào Firebase',
       html.indexOf('assets/phong.js') > 0 && html.indexOf('assets/phong.js') < html.indexOf('assets/coba.js') && sw.includes("'assets/phong.js'") && /firebasedatabase\.app'\)\) return;/.test(sw));
  }

  for (const m of ca) { m.C._roiPhong(); m.C.dong(); }
  await cho(50);
  await may.dongLai();
  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
