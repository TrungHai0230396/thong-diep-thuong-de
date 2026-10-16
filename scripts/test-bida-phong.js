/* Kiểm thử chơi qua mạng của Bida lỗ: node scripts/test-bida-phong.js (Node 18 trở lên, cần fetch)
   Như scripts/test-phong.js của cờ ba người: dựng máy chủ giả (scripts/fb-gia.js — làm đúng những gì đã đo trên Firebase
   thật, thêm nhánh bida và sanhbida theo firebase-rules.json) rồi cho ba "máy" — ba bản app riêng, mỗi bản một kho lưu
   riêng — vào chung một phòng: tạo phòng, mời bằng mã và mã QR, tranh ghế, bắt đầu, đánh, cú sai khuôn, hai máy ghi cùng
   một ô, máy chơi thay ghế trống và người vắng, ván nữa, dọn phòng, phòng mở, tìm phòng nhanh. Sau mỗi bước so thế bàn của
   các máy: vị trí từng bi, lượt, nhóm bi, người thắng phải giống hệt nhau. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const { taoMay } = require('./fb-gia.js');
const goc = path.join(__dirname, '..');
const NGUON = ['phong.js', 'maqr.js', 'bida.js'].map(t => fs.readFileSync(path.join(goc, 'assets', t), 'utf8'));
const QR = require(path.join(goc, 'assets', 'maqr.js'));

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const cho = (ms) => new Promise(r => setTimeout(r, ms));
async function doi(dk, ms = 6000) { const a = Date.now(); while (Date.now() - a < ms) { if (dk()) return true; await cho(15); } return !!dk(); }

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
    hidden: /bd-(tin|bao|thay|xoay-bang)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 600, bottom: 600 }),
    appendChild(c) { o.children.push(c); return c; }, getContext: () => ve2d, closest: () => null,
    querySelector(sel) { const k = String(sel).replace(/^[.#]/, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
  };
  return o;
}
/* một "máy": bản app riêng (phong.js + maqr.js + bida.js) trong một ngữ cảnh riêng, kho lưu riêng, địa chỉ riêng. Khung
   hình động chạy theo đồng hồ giả, mỗi khung 0,4 giây: cú đánh chạy hết trong vài chục khung, khỏi chờ thật. */
function mayKhach(ten, url) {
  const luu = { 'tdtd.bida': JSON.stringify({ h: 1, ten }) };
  const m = { ten, luu, es: null };
  let dongHo = performance.now() + 60000;
  const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval, performance, URL, fetch, TDTD_FB_THU: url,
    devicePixelRatio: 1, innerWidth: 375, innerHeight: 812,
    navigator: { share: () => Promise.resolve(), clipboard: { writeText: (chu) => { m.chep = chu; return Promise.resolve(); } } },
    localStorage: { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } },
    location: { origin: 'http://' + ten.toLowerCase().replace(/[^a-z]/g, ''), pathname: '/', search: '', hash: '' },
    EventSource: class extends ES { constructor(u) { super(u); m.es = this; } },
  };
  ctx.history = { state: null, replaceState: (_, __, u) => { const i = String(u).indexOf('#'); ctx.location.hash = i >= 0 ? String(u).slice(i) : ''; } };
  ctx.document = { body: nut('body'), hidden: false, createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  ctx.addEventListener = () => {}; ctx.removeEventListener = () => {};
  ctx.requestAnimationFrame = (f) => setTimeout(() => f(dongHo += 400), 2);
  ctx.cancelAnimationFrame = (i) => clearTimeout(i);
  ctx.self = ctx; ctx.window = ctx;
  vm.createContext(ctx);
  for (const n of NGUON) vm.runInContext(n, ctx);
  Object.assign(m, { ctx, C: ctx.TDTD_BIDA, PH: ctx.TDTD_PHONG, khung: () => ctx.document.body.children.find(c => c.className === 'bida') });
  m.tin = () => m.khung().querySelector('.bd-tin').querySelector('.bd-tin-trong').innerHTML;
  m.bao = () => m.khung().querySelector('.bd-bao').textContent;
  m.the = () => { const v = m.C._van(); if (!v) return ''; const t = v.the; return JSON.stringify([t.bi, t.luot, t.tuDo, t.nhom, t.thang, t.soCu, t.pha]); };
  m.yen = () => !!m.C._van() && !m.C._dang() && !m.C._mayNgam() && !m.C._van().doiMay;
  m.bam = (sel, ds = {}) => m.C._bam({ target: { closest: (s) => (s === sel ? { dataset: ds } : null) } });
  return m;
}

(async () => {
  const may = await taoMay(0);
  const url = 'http://127.0.0.1:' + may.cong;
  const An = mayKhach('An', url), Binh = mayKhach('Bình', url), Chi = mayKhach('Chi', url);
  const ca = [An, Binh, Chi];
  for (const m of ca) m.C.mo();
  const L = An.C.L;
  const khop = (ds) => ds.every(m => m.the() === ds[0].the());
  const yenHet = (ds, ke) => ds.every(m => m.yen() && m.C._phong() && m.C._phong().ke === ke);
  /* cú đánh của ghế đang tới lượt: dùng máy đánh (mức Khó) cho ra một cú hợp lệ */
  const cuCua = (m) => L.timCu(m.C._van().the, m.C._van().the.luot, 2, L.mulberry32(m.C._van().the.soCu + 7));
  /* cú nhẹ vào giữa bi số nhỏ nhất: gần như chắc không vào bi, nên lượt chuyển sang ghế kế */
  const cuNhe = (m) => {
    const t = m.C._van().the, q = t.bi[L.thapNhat(t)], cu = { a: 0, b: 0, v: 0.9 };
    let c = t.bi[0];
    if (t.tuDo || !c) {
      c = [[0.4, 0.3], [0.4, 0.95], [2.1, 0.3], [2.1, 0.95], [1.27, 0.635], [0.3, 0.635]].find(([x, y]) => L.datDuoc(t, x, y));
      cu.cx = c[0]; cu.cy = c[1];
    }
    const dx = q[0] - c[0], dy = q[1] - c[1], n = Math.hypot(dx, dy);
    if (L.denBi8(t, t.luot)) cu.lo = 0;                               // tới bi 8 thì cú nào cũng phải chọn lỗ
    return Object.assign(cu, { dx: dx / n, dy: dy / n });
  };

  console.log('\n— Luật Firebase của bida —');
  {
    const luat = JSON.parse(fs.readFileSync(path.join(goc, 'firebase-rules.json'), 'utf8')).rules, ph = luat.bida && luat.bida.$ma;
    ok('luật có nhánh bida (phòng) và sanhbida (danh sách phòng mở); không ai liệt kê được các phòng', !!ph && !!luat.sanhbida && !('.read' in luat.bida) && luat.sanhbida['.read'] === true);
    ok('cú đánh chỉ ghi một lần, sau khi bắt đầu; ghế chỉ giành một lần, trước khi bắt đầu; khoá lạ bị chặn',
       /!data\.exists\(\) && root\.child\('bida\/' \+ \$ma \+ '\/batDau'\)\.exists\(\)/.test(ph.cu.$n['.write']) &&
       /^!data\.exists\(\) && !root/.test(ph.ghe.$P.id['.write']) && ph.$khac['.validate'] === false && ph.cu.$n.$khac['.validate'] === false);
    ok('khuôn chữ của cú (d) và kết quả (kq) trong luật đúng bằng khuôn app ghi; phòng chỉ xoá được khi quá một ngày hay hết ván 5 phút',
       ph.cu.$n.d['.validate'].includes('/^[-0-9,]+$/') && ph.cu.$n.kq['.validate'].includes('/^[-0-9.,:;]+$/') && ph['.read'].includes('/^[A-HJ-NP-Z2-9]{6}$/') &&
       /86400000/.test(ph['.write']) && /xong'\)\.val\(\) < now - 300000/.test(ph['.write']));
    const sv = { '.sv': 'timestamp' }, ghe = { 0: { id: 'abcdefgh1234', ten: 'X', thay: sv } };
    const tao = (ma, du) => fetch(`${url}/bida/${ma}.json`, { method: 'PUT', body: JSON.stringify(du) }).then(r => r.status);
    const kq = [await tao('AAAAAA', { tao: sv, chu: 0, kieu: 8, so: 3, kho: 0, pha: 0, ghe }), await tao('AAAAAB', { tao: sv, chu: 0, kieu: 7, so: 2, kho: 0, pha: 0, ghe }),
      await tao('AAAAAC', { tao: sv, chu: 0, kieu: 9, so: 4, kho: 0, pha: 4, ghe }), await tao('AAAAAD', { tao: sv, chu: 0, kieu: 9, so: 3, kho: 0, pha: 0, ghe, la: 1 }),
      await tao('AAAAAE', { tao: 5, chu: 0, kieu: 8, so: 2, kho: 0, pha: 0, ghe }), await tao('AAAAAF', { tao: sv, chu: 0, kieu: 9, so: 4, kho: 2, pha: 3, ghe })];
    ok('máy chủ giả làm đúng luật: 8 bi ba ghế, kiểu lạ, ghế phá ngoài số ghế, khoá lạ, giờ giả đều bị chặn; 9 bi bốn ghế đúng khuôn thì tạo được',
       kq.join() === '401,401,401,401,401,200', kq.join());
    may.gieo('bida/AAAAAF', null);
  }

  console.log('\n— Tạo phòng 8 bi, vào bằng mã, tranh ghế, bắt đầu —');
  await An.C._taoPhong({ P: 0, kieu: 8, so: 2, kho: 0, ten: 'An' });
  const ma = An.C._phong() && An.C._phong().ma;
  await doi(() => An.C._phong().cay && /Phòng chờ/.test(An.tin()));
  ok('An tạo phòng: có mã, ngồi ghế 1 (phá trước), địa chỉ mang mã phòng, máy nhớ ghế để mở lại', !!ma && An.C._phong().P === 0 && An.ctx.location.hash === '#bida/' + ma &&
     JSON.parse(An.luu['tdtd.bida']).phong.ma === ma && /Ghế 1 · phá trước/.test(An.tin()));
  ok('chủ phòng lúc chưa ai vào: Gửi link mời là nút chính, Bắt đầu là nút phụ nói rõ máy chơi thay 1 ghế',
     /Chưa ai vào/.test(An.tin()) && /class="bd-moi-ban">Gửi link mời/.test(An.tin()) && /class="bd-phu bd-batdau-phong">Bắt đầu<small>máy chơi thay 1 ghế trống<\/small>/.test(An.tin()));
  An.bam('.bd-qr-bat');
  const coQR = An.tin().includes(QR.svg(`http://an/bida-lo/?phong=${ma}`));
  An.bam('.bd-qr-bat');
  ok('mã QR trong phòng chờ là link mời …/bida-lo/?phong=MÃ (trang chia sẻ riêng của bida)', coQR && !/<svg/.test(An.tin()));
  An.bam('.bd-chep-link'); await cho(20);
  ok('Chép link: chép đúng link mời', An.chep === `http://an/bida-lo/?phong=${ma}`, An.chep);
  const trongAn = An.khung().querySelector('.bd-tin').querySelector('.bd-tin-trong');
  trongAn.scrollTop = 120;                                    // An cuộn xuống xem ghế, nút
  Binh.C._vaoPhong(ma); Chi.C._vaoPhong(ma);
  await doi(() => Binh.C._phong().cay && Chi.C._phong().cay && /data-ngoi/.test(Binh.tin()));
  ok('người mở link: thấy An mời chơi bida, nút "Vào chơi ghế 2", ghế trống ghi "Chờ bạn"',
     /An mời bạn chơi bida/.test(Binh.tin()) && /data-ngoi="1">Vào chơi ghế 2<\/button>/.test(Binh.tin()) && /<b>Chờ bạn<\/b>/.test(Binh.tin()));
  for (const m of [Binh, Chi]) m.khung().querySelector('.bd-o-ten').value = m.ten;
  await Promise.all([Binh.C._ngoiGhe(1), Chi.C._ngoiGhe(1)]);
  const ban = [Binh, Chi].find(m => m.C._phong().P === 1), xem = ban === Binh ? Chi : Binh;
  ok('hai người cùng bấm ghế 2 một lúc: đúng một người được, người kia vẫn đang xem', !!ban && xem.C._phong().P === -1);
  await doi(() => /class="bd-batdau-phong">Bắt đầu/.test(An.tin()));
  ok('phòng chờ vẽ lại khi có người vào: giữ chỗ An đang cuộn, không nhảy về đầu bảng', trongAn.scrollTop === 120, String(trongAn.scrollTop));
  ok('chủ phòng thấy bạn đã vào: Bắt đầu thành nút chính; người được mời thì chờ An bấm Bắt đầu', /Đủ người rồi/.test(An.tin()) && /Chờ An bấm Bắt đầu/.test(ban.tin()));
  await An.C._batDauPhong();
  await doi(() => ca.every(m => m.C._van() && m.C._van().cheDo === 'phong' && m.yen()));
  ok('An bấm Bắt đầu: cả ba máy vào ván, cùng một cách xếp bi (hạt giống lấy từ mã phòng), lượt An phá', khop(ca) && An.C._van().the.luot === 0 && An.C._laMinh(0) && ban.C._laMinh(1));
  ok('người xem không đánh được ghế nào', !xem.C._laMinh(0) && !xem.C._laMinh(1));

  console.log('\n— Đánh: mọi máy luôn cùng một thế bàn —');
  An.C._danhCu({ dx: 1, dy: 0.003, v: 8.4, a: 0, b: -0.15, cx: L.KE_DAU - 0.05, cy: L.RONG / 2 }, 0);
  await doi(() => yenHet(ca, 1), 8000);
  const r0 = may.lay(`bida/${ma}/cu/0`);
  ok('An phá: máy chủ giữ cú (P, d, kq); hai máy kia chạy lại cú đó rồi đặt bi đúng kết quả — ba máy cùng thế bàn',
     !!r0 && r0.P === 0 && typeof r0.d === 'string' && typeof r0.kq === 'string' && khop(ca), ca.map(m => m.C._phong().ke).join());
  let soCu = 1;
  const tuTruoc = may.soTuChoi();
  for (let i = 0; i < 6 && An.C._van().the.thang < 0; i++) {
    const P = An.C._van().the.luot, m = P === 0 ? An : ban;
    m.C._danhCu(cuCua(m), P);
    soCu++;
    await doi(() => yenHet(ca, soCu), 8000);
  }
  ok(`${soCu} cú qua lại: ba máy luôn khớp từng vị trí bi, lượt, nhóm bi`, khop(ca) && yenHet(ca, soCu), `ke ${ca.map(m => m.C._phong().ke)}`);
  ok('máy chủ không phải từ chối cú nào: chỉ máy tới lượt mới ghi', may.soTuChoi() === tuTruoc, `${may.soTuChoi() - tuTruoc} lần từ chối`);

  console.log('\n— Cú sai khuôn, hai máy ghi cùng một ô —');
  {
    const n = An.C._phong().ke, luot = An.C._van().the.luot;
    await fetch(`${url}/bida/${ma}/cu/${n}.json`, { method: 'PUT', body: JSON.stringify({ P: luot, d: '1,2,3', kq: '9;9;9;;' }) });
    await doi(() => ca.every(m => m.C._phong().ke === n + 1));
    ok('người lạ ghi một cú sai khuôn vào ô kế tiếp: máy nào cũng bỏ qua như nhau, vẫn đúng lượt cũ', khop(ca) && An.C._van().the.luot === luot);
    const sai = luot === 0 ? 1 : 0, t = An.C._van().the, cuSai = { dx: 1, dy: 0, v: 2, a: 0, b: 0 };
    const kqSai = L.danh(L.viTriDanh(t, null), cuSai);
    await fetch(`${url}/bida/${ma}/cu/${n + 1}.json`, { method: 'PUT', body: JSON.stringify({ P: sai, d: L.maCu(cuSai), kq: L.maKq(kqSai) }) });
    await doi(() => ca.every(m => m.C._phong().ke === n + 2));
    ok('cú đúng khuôn mà sai lượt (ghế không tới lượt đánh): cũng bị bỏ qua', khop(ca) && An.C._van().the.luot === luot);
    /* máy của người tới lượt chưa kịp nhận thì có người ghi trước một cú khác vào đúng ô nó định ghi */
    const m = luot === 0 ? An : ban, khac = [An, ban, xem].filter(x => x !== m);
    await doi(() => ca.every(x => x.yen()));
    m.es.tamDung = true;
    const k = m.C._phong().ke, chen = Object.assign(cuCua(m), {}), kqChen = L.danh(L.viTriDanh(m.C._van().the, chen), chen);
    await fetch(`${url}/bida/${ma}/cu/${k}.json`, { method: 'PUT', body: JSON.stringify({ P: luot, d: L.maCu(chen), kq: L.maKq(kqChen) }) });
    await doi(() => khac.every(x => x.C._phong().ke === k + 1 && x.yen()), 8000);
    const sauChen = khac[0].the();
    const tu = may.soTuChoi();
    const daGhi = m.C._danhCu(cuNhe(m), luot);
    await cho(300);
    m.es.chayTiep();
    await doi(() => ca.every(x => x.yen() && x.C._phong().ke >= k + 1) && khop(ca), 8000);
    ok('máy ghi sau bị từ chối (401), dựng lại từ danh sách trên máy chủ: ba máy khớp, cú được tính là cú ghi trước',
       daGhi && may.soTuChoi() === tu + 1 && khop(ca) && m.the() === sauChen, `${may.soTuChoi() - tu} lần từ chối`);
  }

  console.log('\n— Hết ván, ván nữa, dọn phòng —');
  {
    await doi(() => ca.every(m => m.yen()));
    An.C._van().the.thang = 0;                                        // giả hết ván ở máy An (khỏi đánh tới bi 8)
    An.C._kiemPhong();
    await doi(() => may.lay(`bida/${ma}/xong`) && /bd-vannua/.test(An.tin()), 3000);
    ok('hết ván: ghi mốc xong lên máy chủ, hiện "Chơi ván nữa" và "Rời phòng"', !!may.lay(`bida/${ma}/xong`) && /bd-vannua/.test(An.tin()) && /bd-roi/.test(An.tin()));
    await An.C._vanNua();
    await doi(() => An.C._phong() && An.C._phong().ma !== ma && An.C._phong().cay);
    const ma2 = An.C._phong().ma;
    ok('An bấm Chơi ván nữa: phòng cũ ghi mã phòng mới (một lần), phòng mới cùng kiểu, ghế 2 phá (luân phiên phá), An vẫn ghế 1',
       may.lay(`bida/${ma}/tiep`) === ma2 && An.C._phong().P === 0 && may.lay(`bida/${ma2}/pha`) === 1 && may.lay(`bida/${ma2}/kieu`) === 8);
    const r = await fetch(`${url}/bida/${ma}/tiep.json`, { method: 'PUT', body: JSON.stringify('ZZZZZZ') });
    ok('không ai ghi đè được lời mời ván nữa', r.status === 401);
    await doi(() => ban.C._phong().cay && ban.C._phong().cay.tiep === ma2);
    ban.C._theoTiep(ma2);
    await doi(() => ban.C._phong().ma === ma2 && ban.C._phong().P === 1);
    ok('người chơi kia theo vào phòng mới và tự ngồi lại ghế cũ', ban.C._phong().ma === ma2 && ban.C._phong().P === 1);
    const xoaSom = await fetch(`${url}/bida/${ma}.json`, { method: 'DELETE' });
    may.datLech(6 * 60000);
    xem.C._phong().lech += 6 * 60000;
    xem.C._roiPhong();
    await doi(() => may.lay(`bida/${ma}`) === null, 3000);
    ok('phòng cũ: xoá sớm bị từ chối; hết ván đủ 5 phút thì người rời sau cùng dọn luôn', xoaSom.status === 401 && may.lay(`bida/${ma}`) === null);
    may.datLech(0);
    for (const m of [An, ban]) m.C._roiPhong();
  }

  console.log('\n— 9 bi ba ghế: máy chơi thay ghế trống, người vắng —');
  try {
    await An.C._taoPhong({ P: 0, kieu: 9, so: 3, kho: 1, ten: 'An', pha: 2 });
    const ma3 = An.C._phong().ma;
    await doi(() => An.C._phong().cay && /Phòng chờ/.test(An.tin()));
    ok('phòng 9 bi ba người: ba ghế, ghế 3 phá trước', /9 bi · 3 người/.test(An.tin()) && /Ghế 3 · phá trước/.test(An.tin()));
    Binh.C._vaoPhong(ma3);
    await doi(() => Binh.C._phong() && Binh.C._phong().cay && /data-ngoi/.test(Binh.tin()));
    Binh.khung().querySelector('.bd-o-ten').value = Binh.ten;
    await Binh.C._ngoiGhe(1);
    await doi(() => An.C._phong().cay.ghe && An.C._phong().cay.ghe[1]);
    Chi.C._vaoPhong(ma3);
    await doi(() => Chi.C._phong() && Chi.C._phong().cay);
    /* máy An (chạy máy chơi thay) đang ẩn — người dùng chuyển sang app khác, trình duyệt thôi chạy khung hình: máy vẫn phải
       đánh, cả phòng đang chờ (bản đầu đợi cơ quay xong mới ghi cú, nên treo tới lúc An quay lại) */
    const rafAn = An.ctx.requestAnimationFrame;
    An.ctx.document.hidden = true; An.ctx.requestAnimationFrame = () => 0;
    await An.C._batDauPhong();
    const ba = [An, Binh, Chi];
    await doi(() => !!may.lay(`bida/${ma3}/cu/0`), 6000);
    ok('máy chạy máy chơi thay đang ẩn (không có khung hình): máy vẫn đánh và ghi cú ngay', !!may.lay(`bida/${ma3}/cu/0`));
    An.ctx.document.hidden = false; An.ctx.requestAnimationFrame = rafAn; An.C._kiemPhong(); An.C.mo();
    await doi(() => ba.every(m => m.C._van() && m.C._van().ma === ma3 && m.C._phong().ke >= 1 && m.yen()), 10000);
    ok('bắt đầu với ghế 3 trống: máy Sóc chơi thay ghế 3 và phá luôn — máy An (ghế số nhỏ nhất còn ở đây) nghĩ giùm rồi ghi cú',
       may.lay(`bida/${ma3}/may/2`) === true && An.C._toiChayMay() && !Binh.C._toiChayMay() && may.lay(`bida/${ma3}/cu/0`).P === 2 && khop(ba) &&
       An.C._van().the.soCu >= 1 && Binh.C._viecPhong() === '', `ke ${ba.map(m => m.C._phong().ke)}`);
    /* đánh tới lượt Bình (ghế 2): cú của An do An đánh, cú của Sóc do máy An */
    for (let i = 0; i < 12 && An.C._van().the.luot !== 1 && An.C._van().the.thang < 0; i++) {
      const ke = An.C._phong().ke;
      if (An.C._van().the.luot === 0) An.C._danhCu(cuNhe(An), 0);
      await doi(() => ba.every(m => m.C._phong().ke > ke && m.yen()), 10000);
    }
    const toiBinh = An.C._van().the.luot === 1 && An.C._van().the.thang < 0;
    ok('mọi máy luôn cùng thế bàn trong lúc máy chơi thay đánh xen', khop(ba), `lượt ${An.C._van().the.luot}`);
    if (toiBinh) {
      Binh.C.dong();                                                   // Bình tắt app: thôi nghe, thôi báo "còn ở đây"
      ok('chưa quá 60 giây: chưa có nút cho máy đánh thay', An.C._viecPhong() === '');
      const lechThat = An.C._phong().lech;
      An.C._phong().lech += 70000;
      An.C._kiemPhong();
      ok('tới lượt Bình mà Bình im lặng quá 60 giây: An thấy nút "Cho máy đánh thay"', An.C._viecPhong() === 'thay');
      const ke = An.C._phong().ke;
      An.C._choMayThay();
      await doi(() => An.C._phong().cay.may && An.C._phong().cay.may[1] === true && [An, Chi].every(m => m.C._phong().ke > ke && m.yen()) && khop([An, Chi]), 10000);
      ok('An bấm: máy chơi thay ghế Bình (tên ghi "máy thay"), máy An nghĩ giùm và ghi cú; người xem vẫn khớp',
        An.C._phong().ke > ke && khop([An, Chi]) && /Bình \(máy thay\)/.test(An.khung().querySelector('.bd-nguoi').innerHTML), `ke ${ke} → ${[An, Chi].map(m => m.C._phong().ke)}`);
      An.C._phong().lech = lechThat;
      Binh.C.mo();
      if (An.C._van().the.thang >= 0) {                              // máy chơi thay đánh hết ván luôn (vào bi 9): khỏi thử Tự đánh tiếp
        await doi(() => Binh.yen() && khop([An, Binh]), 8000);
        ok(`máy chơi thay ghế Bình đánh tới hết ván (${An.C._van().the.lyDo}): Bình quay lại thấy đúng kết quả`, khop([An, Binh, Chi]) && Binh.C._van().the.thang === An.C._van().the.thang);
        for (const m of ba) m.C._roiPhong();
        throw 'xong';
      }
      await doi(() => Binh.C._viecPhong() === 'tudi' && Binh.yen() && khop([An, Binh]), 8000);
      ok('Bình quay lại: đuổi kịp các cú đã đánh, thấy nút "Tự đánh tiếp"', Binh.C._viecPhong() === 'tudi' && khop([An, Binh, Chi]),
        `việc ${Binh.C._viecPhong()} yên ${ba.map(m => m.yen())} khớp ${khop([An, Binh])}/${khop([An, Chi])} ke ${ba.map(m => m.C._phong().ke)} lượt ${ba.map(m => m.C._van().the.luot)} thắng ${An.C._van().the.thang} máy ${JSON.stringify(An.C._phong().cay.may)} P ${Binh.C._phong().P} đang ${!!Binh.C._dang()}/${!!Binh.C._mayNgam()}/${Binh.C._van().doiMay}`);
      Binh.C._tuDiTiep();
      await doi(() => !(An.C._phong().cay.may || {})[1]);
      ok('Bình bấm Tự đánh tiếp: ghế Bình lại là người', !(An.C._phong().cay.may || {})[1] && !An.C._laMinh(1) && Binh.C._laMinh(1));
    } else ok('(bỏ qua phần người vắng: ván đã xong trước khi tới lượt Bình)', true);
    for (const m of ba) m.C._roiPhong();
  } catch (e) { if (e !== 'xong') throw e; }

  console.log('\n— Phòng mở, tìm phòng nhanh —');
  {
    const dong = (ma) => may.lay(`sanhbida/${ma}`);
    await An.C._taoPhong({ P: 0, kieu: 9, so: 3, kho: 0, ten: 'An' });
    const maRieng = An.C._phong().ma;
    await doi(() => An.C._phong().cay && /Phòng chờ/.test(An.tin()));
    await cho(60);
    ok('phòng riêng (mặc định): không hiện trong danh sách phòng mở', !dong(maRieng));
    An.C._roiPhong();
    await An.C._taoPhong({ P: 0, kieu: 9, so: 3, kho: 0, ten: 'An', mo: true });
    const ma5 = An.C._phong().ma;
    await doi(() => dong(ma5) && /Phòng mở/.test(An.tin()));
    const d0 = dong(ma5);
    ok('tạo phòng mở: một dòng trong /sanhbida — tên chủ phòng, 9 bi, 3 người, còn 2 ghế, dấu giờ máy chủ', !!d0 && d0.ten === 'An' && d0.kieu === 9 && d0.so === 3 && d0.trong === 2 &&
       typeof d0.tao === 'number' && typeof d0.thay === 'number', JSON.stringify(d0));
    Binh.C._moCaiDat(); Binh.bam('[data-man]', { man: 'tim' });
    await doi(() => Binh.C._timPhong() && Binh.C._timPhong().xong);
    const ds = (Binh.C._timPhong() || { ds: [] }).ds;
    ok('Bình mở "Xem phòng đang chờ": thấy phòng của An (9 bi, còn 2 ghế); phòng riêng không có', ds.some(d => d.ma === ma5 && d.trong === 2 && d.kieu === 9) && !ds.some(d => d.ma === maRieng));
    Binh.C._timNhanh();
    await doi(() => Binh.C._phong() && Binh.C._phong().ma === ma5 && Binh.C._phong().P === 1 && (dong(ma5) || {}).trong === 1, 4000);
    ok('Bình bấm Tìm phòng nhanh: vào ngay phòng của An, ngồi ghế trống đầu tiên; dòng còn 1 ghế', Binh.C._phong().P === 1 && (dong(ma5) || {}).trong === 1);
    Chi.C._timNhanh();
    await doi(() => Chi.C._phong() && Chi.C._phong().ma === ma5 && Chi.C._phong().P === 2 && !dong(ma5), 4000);
    ok('Chi tìm nhanh, vào nốt ghế cuối: đủ người thì phòng thôi hiện', Chi.C._phong().P === 2 && !dong(ma5));
    for (const m of [An, Binh, Chi]) m.C._roiPhong();
    Binh.C._timNhanh();
    await doi(() => Binh.C._phong() && Binh.C._phong().P === 0 && Binh.C._phong().mo && Binh.C._phong().cay, 4000);
    const maTu = Binh.C._phong().ma;
    await doi(() => !!dong(maTu));
    ok('không còn phòng nào đang chờ: tự tạo phòng mở, có trong danh sách', !!dong(maTu) && /đã tạo phòng mở/.test(Binh.bao()));
    Binh.C._roiPhong();
    await doi(() => !dong(maTu));
    ok('chủ phòng mở rời đi: phòng thôi hiện', !dong(maTu));
    const sv = { '.sv': 'timestamp' }, ghi = (m, cach, du) => fetch(`${url}/sanhbida/${m}.json`, { method: cach, body: du === undefined ? undefined : JSON.stringify(du) }).then(r => r.status);
    await An.C._taoPhong({ P: 0, kieu: 8, so: 2, kho: 0, ten: 'An' });
    const maR = An.C._phong().ma;
    await doi(() => An.C._phong().cay);
    const kq = [await ghi('ZZZZZZ', 'PUT', { tao: sv, ten: 'Lạ', trong: 1, kieu: 8, so: 2, thay: sv }), await ghi(maR, 'PUT', { tao: sv, trong: 1, kieu: 8, so: 2, thay: sv }),
      await ghi(maR, 'PUT', { tao: sv, ten: 'X', trong: 4, kieu: 8, so: 2, thay: sv }), await ghi(maR, 'PUT', { tao: sv, ten: 'X', trong: 1, kieu: 8, so: 2, thay: sv, la: 1 }),
      await ghi(maR, 'PUT', { tao: sv, ten: 'X', trong: 1, kieu: 10, so: 2, thay: sv }), await ghi(maR, 'PUT', { tao: 5, ten: 'X', trong: 1, kieu: 8, so: 2, thay: sv }),
      await ghi(maR, 'PUT', { tao: sv, ten: 'X', trong: 1, kieu: 8, so: 2, thay: sv }), await ghi(maR, 'DELETE')];
    ok('luật danh sách: phòng không có thật, thiếu tên, ghế trống 4, khoá lạ, kiểu lạ, giờ giả đều bị chặn; đúng khuôn thì ghi được; ai cũng xoá được',
       kq.join() === '401,401,401,401,401,401,200,200', kq.join());
    An.C._roiPhong();
  }

  console.log('\n— Phòng không có, phòng quá hạn —');
  {
    Chi.C._vaoPhong('ZZZZZZ');
    await doi(() => Chi.C._phong() === null);
    ok('mã sai: báo không thấy phòng, không giữ gì trong máy', /Không thấy phòng/.test(Chi.tin()) && !JSON.parse(Chi.luu['tdtd.bida']).phong);
    may.gieo('bida/QQQQQQ', { tao: Date.now() - 90000000, chu: 0, kieu: 8, so: 2, kho: 0, pha: 0, ghe: { 0: { id: 'abcdefgh1234', ten: 'Cũ', thay: Date.now() - 90000000 } } });
    Chi.C._vaoPhong('QQQQQQ');
    await doi(() => may.lay('bida/QQQQQQ') === null && Chi.C._phong() === null, 3000);
    ok('phòng quá một ngày: dọn luôn (luật cho xoá), báo phòng đã đóng', may.lay('bida/QQQQQQ') === null && /đã đóng/.test(Chi.tin()));
  }

  for (const m of ca) m.C.dong();
  await may.dongLai();
  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
