/* Kiểm thử chơi qua mạng của Bida lỗ: node scripts/test-bida-phong.js (Node 18 trở lên, cần fetch)
   Như scripts/test-phong.js của cờ ba người: dựng máy chủ giả (scripts/fb-gia.js — làm đúng những gì đã đo trên Firebase
   thật, thêm nhánh bida và quan theo firebase-rules.json) rồi cho ba "máy" — ba bản app riêng, mỗi bản một kho lưu riêng —
   vào quán bida 16 bàn: ngồi bàn, vào bàn, đánh, cú sai khuôn, hai máy ghi cùng một ô, bỏ ngang, dọn ván, giữ bàn, ván nữa,
   tranh ghế, bida 3 bi qua mạng. Sau mỗi bước so thế bàn của các máy: vị trí từng bi, lượt, nhóm bi, người thắng phải giống
   hệt nhau. Chơi qua mạng giờ chỉ ở quán (không còn phòng riêng, link mời, phòng mở, máy chơi thay). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const { taoMay } = require('./fb-gia.js');
const goc = path.join(__dirname, '..');
const NGUON = ['phong.js', 'maqr.js', 'bida.js'].map(t => fs.readFileSync(path.join(goc, 'assets', t), 'utf8'));

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
  ctx.history = { state: null, replaceState: (_, __, u) => { const v = new URL(String(u), ctx.location.origin + ctx.location.pathname); Object.assign(ctx.location, { pathname: v.pathname, search: v.search, hash: v.hash }); } };
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
    ok('luật có nhánh bida (ván ở một bàn) và quan (16 bàn); không còn phòng mở (sanhbida), máy chơi thay (may); không ai liệt kê được các ván',
      !!ph && !!luat.quan && !luat.sanhbida && !ph.may && !('.read' in luat.bida));
    ok('ván mới phải thuộc một bàn trong quán (khoá ban), 2–4 ghế (3, 4 người: 9 bi, bida bài; 4 đánh đôi: 8 bi, 3 bi); bàn lỗ 8, 9 bi, bài; bàn phăng 3 bi; ghế chỉ giành được khi chủ bàn đã đồng ý',
      ph['.validate'].includes("(data.exists() || newData.hasChild('ban'))") && ph.so['.validate'].includes('newData.val() >= 2 && newData.val() <= 4') && /beginsWith\('P'\)/.test(ph.ban['.validate']) &&
      ph.ghe.$P['.validate'].includes('/^[0-3]$/') && /duyet\/' \+ newData\.val\(\)\)\.val\(\) === true/.test(ph.ghe.$P.id['.write']) && !!ph.xin && !!ph.duyet && !!ph.doi && !!ph.la);
    ok('cú đánh chỉ ghi một lần, sau khi bắt đầu; ghế chỉ giành một lần, trước khi bắt đầu; khoá lạ bị chặn',
       /!data\.exists\(\) && root\.child\('bida\/' \+ \$ma \+ '\/batDau'\)\.exists\(\)/.test(ph.cu.$n['.write']) &&
       /^!data\.exists\(\) && !root/.test(ph.ghe.$P.id['.write']) && ph.$khac['.validate'] === false && ph.cu.$n.$khac['.validate'] === false);
    ok('khuôn chữ của cú (d) và kết quả (kq) trong luật đúng bằng khuôn app ghi; ván chỉ xoá được khi quá một ngày hay hết ván 5 phút',
       ph.cu.$n.d['.validate'].includes('/^[-0-9,]+$/') && ph.cu.$n.kq['.validate'].includes('/^[-0-9.,:;]+$/') && ph['.read'].includes('/^[A-HJ-NP-Z2-9]{6}$/') &&
       /86400000/.test(ph['.write']) && /xong'\)\.val\(\) < now - 300000/.test(ph['.write']));
    const sv = { '.sv': 'timestamp' }, ghe = { 0: { id: 'abcdefgh1234', ten: 'X', thay: sv } };
    const tao = (ma, du) => fetch(`${url}/bida/${ma}.json`, { method: 'PUT', body: JSON.stringify(du) }).then(r => r.status);
    const goc_ = { tao: sv, chu: 0, kieu: 8, so: 2, kho: 0, pha: 0, ghe }, voi = (them) => Object.assign({}, goc_, them);
    const kq = [await tao('AAAAAA', goc_), await tao('AAAAAB', voi({ kieu: 8, so: 3, ban: 'L1' })), await tao('AAAAAC', voi({ kieu: 3, ban: 'L2' })),
      await tao('AAAAAD', voi({ ban: 'P1' })), await tao('AAAAAE', voi({ ban: 'L9' })), await tao('AAAAAF', voi({ ban: 'L1', la: 1 })),
      await tao('AAAAAG', voi({ tao: 5, ban: 'L1' })), await tao('AAAAAH', voi({ kieu: 9, kho: 1, pha: 1, ban: 'L1' }))];
    ok('máy chủ giả làm đúng luật: ván không thuộc bàn nào (phòng riêng), 8 bi ba ghế, bàn lỗ mà 3 bi, bàn phăng mà 8 bi, bàn ngoài 16 bàn, khoá lạ, giờ giả đều bị chặn; ván 9 bi hai ghế ở bàn L1 thì tạo được',
       kq.join() === '401,401,401,401,401,401,401,200', kq.join());
    const kq2 = [await tao('AAAAAJ', voi({ so: 4, ban: 'L2' })), await tao('AAAAAK', voi({ so: 4, doi: true, ban: 'L2' })), await tao('AAAAAL', voi({ kieu: 9, so: 3, ban: 'L3' })),
      await tao('AAAAAM', voi({ kieu: 52, so: 3, la: 5, ban: 'L4' })), await tao('AAAAAN', voi({ kieu: 52, so: 2, la: 4, ban: 'L5' })), await tao('AAAAAP', voi({ kieu: 52, ban: 'P2' })),
      await tao('AAAAAQ', voi({ kieu: 9, so: 4, doi: true, ban: 'L6' }))];
    ok('máy chủ giả: 8 bi bốn ghế mà không đánh đôi, bida bài 4 lá, bida bài ở bàn phăng, 9 bi đánh đôi đều bị chặn; 8 bi bốn ghế đánh đôi, 9 bi ba ghế, bida bài 5 lá ba ghế thì tạo được',
       kq2.join() === '401,200,200,200,401,401,401', kq2.join());
    const xin = (ma, id, du, cach = 'PUT') => fetch(`${url}/bida/${ma}/${id}.json`, { method: cach, body: JSON.stringify(du) }).then(r => r.status);
    const kq3 = [await xin('AAAAAK', 'ghe/1', { id: 'zzzzzzzz9', ten: 'Lạ', thay: sv }, 'PATCH'), await xin('AAAAAK', 'xin/zzzzzzzz9', { ten: 'Lạ', P: 1, thay: sv }),
      await xin('AAAAAK', 'duyet/zzzzzzzz9', true), await xin('AAAAAK', 'ghe/1', { id: 'zzzzzzzz9', ten: 'Lạ', thay: sv }, 'PATCH')];
    ok('máy chủ giả: chưa được chủ bàn đồng ý thì không giành ghế được; xin vào, được đồng ý rồi thì giành được', kq3.join() === '401,200,200,200', kq3.join());
    for (const m of ['AAAAAH', 'AAAAAK', 'AAAAAL', 'AAAAAM']) may.gieo(`bida/${m}`, null);
  }

  /* xin vào bàn rồi chủ bàn đồng ý (người dùng: "người vô bàn trước có quyền đồng ý cho người kia vô chơi hay không") */
  const vaoDuocDuyet = async (m, ban, chu, P = -1) => {
    await m.C._vaoBanQuan(ban, P);
    await doi(() => m.C._phong() && chu.C._phong() && chu.C._phong().cay && chu.C._phong().cay.xin && chu.C._phong().cay.xin[m.C._phong().id], 6000);
    chu.C._duyetXin(m.C._phong().id, true);
  };
  console.log('\n— Một bàn: ngồi, vào, đánh — hai máy luôn cùng một thế bàn —');
  for (const m of ca) m.khung().querySelector('.bd-o-ten').value = m.ten;    // ô "Tên của bạn" trên bảng bàn (app điền sẵn tên đã lưu)
  An.C._moMan('quan');
  await An.C._taiQuan();
  await An.C._ngoiBanQuan('L1');
  await doi(() => An.C._phong() && An.C._phong().cay && /Đang chờ người vào bàn/.test(An.tin()));
  const ma = An.C._phong().ma, hai = [An, Binh];
  ok('An ngồi bàn L1: ván có mã, An ghế 1 (phá trước), địa chỉ mang mã ván (?phong=MÃ, không dấu #), máy nhớ ghế để mở lại', !!ma && An.C._phong().P === 0 && An.ctx.location.search === '?phong=' + ma && !An.ctx.location.hash &&
     JSON.parse(An.luu['tdtd.bida']).phong.ma === ma && /Ghế 1 · phá trước/.test(An.tin()));
  await Binh.C._batQuan();
  await vaoDuocDuyet(Binh, 'L1', An);
  await doi(() => hai.every(m => m.C._van() && m.C._van().cheDo === 'phong' && m.C._van().ma === ma && m.yen()), 8000);
  ok('Bình vào bàn: ván bắt đầu ngay, cùng một cách xếp bi (hạt giống lấy từ mã ván), lượt An phá; mỗi máy chỉ đánh được ghế của mình',
    khop(hai) && An.C._van().the.luot === 0 && An.C._laMinh(0) && Binh.C._laMinh(1) && !An.C._laMinh(1) && !Binh.C._laMinh(0));
  An.C._danhCu({ dx: 1, dy: 0.003, v: 8.4, a: 0, b: -0.15, cx: L.KE_DAU - 0.05, cy: L.RONG / 2 }, 0);
  await doi(() => yenHet(hai, 1), 8000);
  const r0 = may.lay(`bida/${ma}/cu/0`);
  ok('An phá: máy chủ giữ cú (P, d, kq); máy Bình chạy lại cú đó rồi đặt bi đúng kết quả — hai máy cùng thế bàn',
     !!r0 && r0.P === 0 && typeof r0.d === 'string' && typeof r0.kq === 'string' && khop(hai), hai.map(m => m.C._phong().ke).join());
  /* cú nâng cơ (bi chủ nảy lên, có khi bay khỏi bàn): mã cú chín trường; máy nào cũng chạy lại cú bay đó như nhau */
  {
    const P = An.C._van().the.luot, m = P === 0 ? An : Binh, cu = Object.assign(cuCua(m), { nang: 0.5 });
    cu.v = Math.max(cu.v, 4);
    m.C._danhCu(cu, P);
    await doi(() => yenHet(hai, 2), 8000);
    const r1 = may.lay(`bida/${ma}/cu/1`);
    ok('cú nâng cơ 30°: máy chủ giữ mã cú chín trường; máy kia chạy lại cú bay đó — hai máy cùng thế bàn', !!r1 && r1.d.split(',').length === 9 && khop(hai), r1 && r1.d);
  }
  let soCu = 2;
  const tuTruoc = may.soTuChoi();
  for (let i = 0; i < 6 && An.C._van().the.thang < 0; i++) {
    const P = An.C._van().the.luot, m = P === 0 ? An : Binh;
    m.C._danhCu(cuCua(m), P);
    soCu++;
    await doi(() => yenHet(hai, soCu), 8000);
  }
  ok(`${soCu} cú qua lại: hai máy luôn khớp từng vị trí bi, lượt, nhóm bi`, khop(hai) && yenHet(hai, soCu), `ke ${hai.map(m => m.C._phong().ke)}`);
  ok('máy chủ không phải từ chối cú nào: chỉ máy tới lượt mới ghi', may.soTuChoi() === tuTruoc, `${may.soTuChoi() - tuTruoc} lần từ chối`);

  console.log('\n— Cú sai khuôn, hai máy ghi cùng một ô —');
  if (An.C._van().the.thang < 0) {
    const n = An.C._phong().ke, luot = An.C._van().the.luot;
    await fetch(`${url}/bida/${ma}/cu/${n}.json`, { method: 'PUT', body: JSON.stringify({ P: luot, d: '1,2,3', kq: '9;9;9;;' }) });
    await doi(() => hai.every(m => m.C._phong().ke === n + 1));
    ok('người lạ ghi một cú sai khuôn vào ô kế tiếp: máy nào cũng bỏ qua như nhau, vẫn đúng lượt cũ', khop(hai) && An.C._van().the.luot === luot);
    const sai = luot === 0 ? 1 : 0, t = An.C._van().the, cuSai = { dx: 1, dy: 0, v: 2, a: 0, b: 0 };
    const kqSai = L.danh(L.viTriDanh(t, null), cuSai);
    await fetch(`${url}/bida/${ma}/cu/${n + 1}.json`, { method: 'PUT', body: JSON.stringify({ P: sai, d: L.maCu(cuSai), kq: L.maKq(kqSai) }) });
    await doi(() => hai.every(m => m.C._phong().ke === n + 2));
    ok('cú đúng khuôn mà sai lượt (ghế không tới lượt đánh): cũng bị bỏ qua', khop(hai) && An.C._van().the.luot === luot);
    /* máy của người tới lượt chưa kịp nhận thì có người ghi trước một cú khác vào đúng ô nó định ghi */
    const m = luot === 0 ? An : Binh, khac = hai.filter(x => x !== m);
    await doi(() => hai.every(x => x.yen()));
    m.es.tamDung = true;
    const k = m.C._phong().ke, chen = Object.assign(cuCua(m), {}), kqChen = L.danh(L.viTriDanh(m.C._van().the, chen), chen);
    await fetch(`${url}/bida/${ma}/cu/${k}.json`, { method: 'PUT', body: JSON.stringify({ P: luot, d: L.maCu(chen), kq: L.maKq(kqChen) }) });
    await doi(() => khac.every(x => x.C._phong().ke === k + 1 && x.yen()), 8000);
    const sauChen = khac[0].the();
    const tu = may.soTuChoi();
    const daGhi = m.C._danhCu(cuNhe(m), luot);
    await cho(300);
    m.es.chayTiep();
    await doi(() => hai.every(x => x.yen() && x.C._phong().ke >= k + 1) && khop(hai), 8000);
    ok('máy ghi sau bị từ chối (401), dựng lại từ danh sách trên máy chủ: hai máy khớp, cú được tính là cú ghi trước',
       daGhi && may.soTuChoi() === tu + 1 && khop(hai) && m.the() === sauChen, `${may.soTuChoi() - tu} lần từ chối`);
  } else ok('(bỏ qua phần cú sai khuôn: ván đã xong trong mấy cú trước)', true);

  console.log('\n— Bỏ ngang, dọn ván —');
  {
    await doi(() => hai.every(m => m.yen()));
    const conVan = An.C._van().the.thang < 0;
    await Binh.C._roiBanQuan();                                       // Bình bỏ ngang (Về quán giữa ván)
    await doi(() => An.C._van().the.thang >= 0 && /bd-olaiban/.test(An.tin()) && !!may.lay(`bida/${ma}/xong`), 4000);
    ok('Bình bỏ ngang: An thắng (đối thủ rời bàn), ván ghi mốc xong, bàn L1 vẫn của An', (!conVan || An.C._van().the.lyDo === 'duoi') && !!may.lay(`bida/${ma}/xong`) &&
      (may.lay('quan/L1') || {}).ma === ma && Binh.C._phong() === null);
    const xoaSom = await fetch(`${url}/bida/${ma}.json`, { method: 'DELETE' });
    may.datLech(6 * 60000);
    An.C._phong().lech += 6 * 60000;
    await An.C._roiBanQuan();
    await doi(() => may.lay(`bida/${ma}`) === null && !may.lay('quan/L1'), 3000);
    ok('xoá ván sớm bị từ chối; hết ván đủ 5 phút thì người rời sau cùng dọn ván; bàn L1 trống lại', xoaSom.status === 401 && may.lay(`bida/${ma}`) === null && !may.lay('quan/L1'));
    may.datLech(0);
  }

  console.log('\n— Quán bida: 16 bàn, giữ bàn —');
  {
    /* người dùng: "8 bàn bida 3 bi, 8 bàn bida lỗ như 1 quán thực tế; full hết thì ko cho vô nữa; 3p ko đánh là bị kích ra" */
    for (const m of ca) if (m.C._phong()) m.C._roiPhong();
    for (const m of ca) m.khung().querySelector('.bd-o-ten').value = m.ten;   // ô "Tên của bạn" trên bảng bàn (app điền sẵn tên đã lưu)
    const luuKieu = (m, o) => { m.luu['tdtd.bida'] = JSON.stringify(Object.assign(JSON.parse(m.luu['tdtd.bida'] || '{}'), o)); };
    const sv = { '.sv': 'timestamp' }, ghiBan = (b, cach, du) => fetch(`${url}/quan/${b}.json`, { method: cach, body: du === undefined ? undefined : JSON.stringify(du) }).then(r => r.status);
    An.C._moMan('quan');
    await An.C._taiQuan();
    An.C._veQuan();
    const hinh = An.C._quan().hinh;
    ok('quán mới: 16 bàn trống; màn quán vẽ đủ 16 bàn, mỗi bàn một sofa; chạm vào giữa bàn hay sofa của bàn nào ra đúng bàn đó', An.C._demQuan().trong === 16 && /16 bàn trống/.test(An.C._chuQuan()) &&
      new Set(hinh.map(h => h.ban)).size === 16 && hinh.every(h => An.C._banTai(h.tam[0], h.tam[1]) === h.ban), An.C._chuQuan());
    /* người dùng: "Quán bida cho to full đi đừng làm popup, khi chọn bàn thì ở background vẫn là quán chứ" */
    const lopQuan = An.khung().querySelector('.bd-quan'), tinAn = An.khung().querySelector('.bd-tin');
    ok('quán phủ kín khung trò, không nằm trong bảng tin: lớp quán hiện, bảng tin ẩn', An.C._quanHien() && lopQuan.hidden === false && tinAn.hidden === true);
    const dsNut = An.khung().querySelector('.bd-quan-ds').innerHTML;
    An.bam('[data-quanban]', { quanban: 'L3' });
    ok('hàng nút 16 bàn dưới hình (bàn xa nhỏ khó chạm, người dùng bàn phím): đủ 16 nút, mỗi nút đọc được tên bàn, trạng thái; bấm L3 mở đúng bảng bàn L3',
      (dsNut.match(/data-quanban=/g) || []).length === 16 && dsNut.includes('aria-label="Bàn L3, bida lỗ, trống"') && dsNut.includes('aria-label="Bàn P8, bida 3 bi, trống"') &&
      /Bàn L3 · bida lỗ/.test(An.tin()) && /Bàn trống/.test(An.tin()));
    ok('bảng bàn L3 hiện đè lên quán: quán vẫn hiện ở sau', tinAn.hidden === false && An.C._quanHien() && lopQuan.hidden === false && An.C._quan().ban === 'L3');
    An.bam('[data-man]', { man: 'quan' });
    const veQuanDuoc = tinAn.hidden === true && An.C._quanHien();
    An.bam('[data-quanban]', { quanban: 'L3' });
    ok('bấm "‹ Về quán" trên bảng bàn: bảng tắt, còn quán; chạm lại L3 thì bảng hiện lại', veQuanDuoc && tinAn.hidden === false && /Bàn trống/.test(An.tin()));
    luuKieu(An, { kieuBan: 8 });
    await An.C._ngoiBanQuan('L3');
    await doi(() => An.C._phong() && An.C._phong().cay && /Đang chờ người vào bàn/.test(An.tin()));
    const maL3 = An.C._phong().ma, L3 = may.lay('quan/L3');
    ok('An ngồi bàn L3 (8 bi): quan/L3 trỏ tới phòng mới mang bàn L3, An chờ người; quán vẫn ở sau bảng chờ', !!L3 && L3.ma === maL3 && L3.kieu === 8 && may.lay(`bida/${maL3}/ban`) === 'L3' &&
      An.C._quanHien() && tinAn.hidden === false);
    await Binh.C._batQuan();
    ok('Bình xem quán: bàn L3 có An chờ, còn 15 bàn trống', Binh.C._trangBan('L3') === 'cho' && Binh.C._demQuan().trong === 15);
    const chan = [await ghiBan('L3', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 2, thay: sv }), await ghiBan('L3', 'DELETE'), await ghiBan('L9', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 2, thay: sv }),
      await ghiBan('P1', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 2, thay: sv }), await ghiBan('L1', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 5, thay: sv }),
      await ghiBan('L1', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 2, thay: 5 }), await ghiBan('L1', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 2, thay: sv, la: 1 }),
      await ghiBan('L1', 'PUT', { ma: 'BBBBBB', kieu: 8, so: 2, thay: sv, luat: 1 }), await ghiBan('P1', 'PUT', { ma: 'BBBBBB', kieu: 3, so: 2, thay: sv, dich: 7 })];
    ok('luật quán: giành hay xoá bàn đang có người, bàn ngoài 16 bàn, bàn phăng mà 8 bi, 5 người, giờ giả, khoá lạ, bàn lỗ ghi luật băng, số điểm lạ đều bị chặn',
      chan.join() === '401,401,401,401,401,401,401,401,401', chan.join());
    const ghiXem = (b, id, cach, du) => fetch(`${url}/quan/${b}/xem/${id}.json`, { method: cach, body: du === undefined ? undefined : JSON.stringify(du) }).then(r => r.status);
    const kqXem = [await ghiXem('L8', 'abcdefgh1', 'PUT', sv), await ghiXem('L3', 'abc', 'PUT', sv), await ghiXem('L3', 'abcdefgh1', 'PUT', 5),
      await ghiXem('L3', 'abcdefgh1', 'PUT', sv), await ghiXem('L3', 'abcdefgh1', 'DELETE')];
    ok('luật sofa xem (quan/<bàn>/xem/<id>): bàn trống, id sai khuôn, giờ giả đều bị chặn; bàn đang có người thì ngồi sofa được, đứng dậy (xoá) được',
      kqXem.join() === '401,401,401,200,200', kqXem.join());
    await vaoDuocDuyet(Binh, 'L3', An);
    await doi(() => [An, Binh].every(m => m.C._van() && m.C._van().cheDo === 'phong' && m.C._van().ma === maL3 && m.yen()), 8000);
    const L3b = may.lay('quan/L3');
    ok('Bình vào bàn: tự ngồi ghế 2, ván bắt đầu ngay (An phá); bàn ghi đang chơi, đủ hai tên; vào ván thì lớp quán ẩn, thôi hỏi quán', !!L3b && L3b.choi === true && L3b.ten[0] === 'An' && L3b.ten[1] === 'Bình' &&
      khop([An, Binh]) && An.C._van().the.luot === 0 && !An.C._quanHien() && !Binh.C._quanHien() && !An.C._quan().hen && lopQuan.hidden === true, JSON.stringify(L3b));
    await Chi.C._batQuan();
    Chi.C._moMan('quan');                                              // màn quán dựng hàng nút theo dữ liệu vừa tải
    const nutL3 = (/<button[^>]*data-quanban="L3"[^>]*>/.exec(Chi.khung().querySelector('.bd-quan-ds').innerHTML) || [''])[0];
    ok('nút bàn L3 trên màn quán của Chi: xám "đang chơi", đọc được tên hai người', /bd-quan-choi/.test(nutL3) && nutL3.includes('đang chơi: An và Bình'), nutL3);
    Chi.C._moBanQuan('L3');
    ok('Chi xem bàn L3: đang chơi, không có nút ngồi hay vào', Chi.C._trangBan('L3') === 'choi' && /Bàn đang chơi/.test(Chi.tin()) && !/bd-ngoiban|bd-vaoban/.test(Chi.tin()));
    /* mời ra: tới lượt An (phá) mà quá 3 phút không đánh */
    Binh.C._kiemBanQuan();
    Binh.C._phong().luotTu = Date.now() - 181000;
    Binh.C._kiemBanQuan();
    await doi(() => may.lay(`bida/${maL3}/duoi/0`) && [An, Binh].every(m => m.C._van() && m.C._van().the.thang === 1));
    ok('tới lượt An mà quá 3 phút không đánh: máy Bình ghi lời mời ra (số cú lúc đó: 0); cả hai máy dừng ván ở đó, Bình thắng',
      (may.lay(`bida/${maL3}/duoi/0`) || {}).n === 0 && [An, Binh].every(m => m.C._van().the.lyDo === 'duoi'));
    await doi(() => /Bạn đã rời bàn/.test(An.tin()) && /bd-olaiban/.test(Binh.tin()));
    ok('An thấy "Bạn đã rời bàn", chỉ còn Về quán; Bình thấy An đã rời bàn, có "Ở lại bàn, chờ người mới"', /Bạn đã rời bàn/.test(An.tin()) && !/bd-olaiban|bd-vannua/.test(An.tin()) &&
      /An đã rời bàn/.test(Binh.tin()));
    const lai = await fetch(`${url}/bida/${maL3}/duoi/0.json`, { method: 'PUT', body: JSON.stringify({ n: 1, luc: sv }) }).then(r => r.status);
    ok('lời mời ra chỉ ghi được một lần', lai === 401);
    await Binh.C._olaiBan();
    await doi(() => Binh.C._phong() && Binh.C._phong().ma !== maL3 && Binh.C._phong().cay && /Đang chờ người vào bàn/.test(Binh.tin()));
    ok('Bình ở lại: bàn L3 trỏ sang phòng mới (phòng cũ đã xong nên máy chủ cho), Bình chờ người mới', (may.lay('quan/L3') || {}).ma === Binh.C._phong().ma && !may.lay('quan/L3').choi);
    await An.C._roiBanQuan();
    ok('An về quán: bàn L3 vẫn của Bình (An không xoá bàn đã sang phòng khác)', An.C._phong() === null && (may.lay('quan/L3') || {}).ma === Binh.C._phong().ma);
    /* chờ một mình quá 5 phút: nhường bàn */
    Binh.C._phong().choTu = Date.now() - 301000;
    Binh.C._kiemBanQuan();
    await doi(() => !may.lay('quan/L3') && Binh.C._phong() === null);
    ok('Bình chờ quá 5 phút chưa ai vào: tự nhường bàn (L3 trống lại), về màn quán, có lời báo', !may.lay('quan/L3') && Binh.C._phong() === null && /Chờ quá 5 phút/.test(Binh.bao()));
    /* kín bàn */
    for (const b of ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'])
      may.gieo(`quan/${b}`, { ma: 'CCCCCC', kieu: b[0] === 'L' ? 8 : 3, so: 2, ten: { 0: 'A', 1: 'B' }, choi: true, thay: Date.now() });
    await Chi.C._taiQuan();
    Chi.C._moBanQuan('P2');
    ok('cả 16 bàn đang chơi: "Quán kín bàn", bàn nào cũng không cho ngồi', Chi.C._demQuan().kin && /Quán kín bàn/.test(Chi.C._chuQuan()) && !/bd-ngoiban|bd-vaoban/.test(Chi.tin()));
    /* bàn bỏ quên quá 3 phút (tắt app): coi như trống, ngồi được — bida 3 bi */
    may.gieo('quan/P5', { ma: 'CCCCCC', kieu: 3, so: 2, ten: { 0: 'A' }, choi: false, thay: Date.now() - 200000 });
    await Chi.C._taiQuan();
    luuKieu(Chi, { luat: 1, dich: 5 });
    const trongP5 = Chi.C._trangBan('P5');
    /* đồng hồ máy Chi chậm 5 phút so với máy chủ: vẫn thấy P5 là bàn bỏ quên (mốc là giờ "thay" mới nhất trong quán) */
    vm.runInContext('globalThis.__gio = Date.now; Date.now = () => __gio() - 300000;', Chi.ctx);
    const trongCham = Chi.C._trangBan('P5'), kinCham = Chi.C._trangBan('L1');
    vm.runInContext('Date.now = __gio;', Chi.ctx);
    ok('đồng hồ máy chậm 5 phút: bàn bỏ quên vẫn là bàn trống, bàn đang chơi vẫn là đang chơi', trongCham === 'trong' && kinCham === 'choi', `${trongCham} · ${kinCham}`);
    await Chi.C._ngoiBanQuan('P5');
    await doi(() => Chi.C._phong() && Chi.C._phong().cay && (may.lay('quan/P5') || {}).ma === Chi.C._phong().ma);
    const cP5 = Chi.C._phong().cay;
    const qP5 = may.lay('quan/P5') || {};
    ok('bàn P5 quá 3 phút không ai giữ: coi như trống, Chi ngồi được (máy chủ cho ghi đè); phòng bida 3 bi, 1 băng, tới 5 điểm, bàn trong quán cũng ghi luật và số điểm',
      trongP5 === 'trong' && cP5.kieu === 3 && cP5.luat === 1 && cP5.dich === 5 && qP5.luat === 1 && qP5.dich === 5, JSON.stringify(qP5));
    /* bida 3 bi qua mạng */
    await An.C._batQuan();
    An.C._moBanQuan('P5');
    ok('An chạm bàn P5: thấy Chi đang chờ, bàn đánh bida 3 bi, 1 băng, tới 5 điểm — biết trước khi vào', /Chi đang chờ người/.test(An.tin()) && /Bida 3 bi, 1 băng, tới 5 điểm/.test(An.tin()));
    await vaoDuocDuyet(An, 'P5', Chi);
    const maP5 = Chi.C._phong().ma, hai = [Chi, An];
    await doi(() => hai.every(m => m.C._van() && m.C._van().ma === maP5 && m.yen()), 8000);
    /* Dũng (máy thứ tư) ngồi sofa xem bàn P5 — người dùng: "ai ngồi ghế sofa bàn nào thì có thể xem bàn đó, tất cả ngồi ghế
       sofa đi, rồi trên bàn có mắt xem nếu có người xem" */
    const Dung = mayKhach('Dũng', url);
    Dung.C.mo(); Dung.khung().querySelector('.bd-o-ten').value = 'Dũng';
    await Dung.C._batQuan();
    Dung.C._moBanQuan('P5');
    const coNutXem = /bd-xemban/.test(Dung.tin()) && /còn 3 chỗ/.test(Dung.tin());
    await Dung.C._xemBanQuan('P5');
    await doi(() => Dung.C._van() && Dung.C._van().ma === maP5 && Dung.yen() && khop([Chi, Dung]), 8000);
    const idDung = Dung.C._phong().id;
    ok('Dũng chạm bàn P5 đang chơi: có nút ngồi sofa xem (sofa còn 3 chỗ); vào xem: không ngồi ghế, có tên trên sofa (quan/P5/xem), cùng thế bàn với hai người chơi',
      coNutXem && Dung.C._phong().P === -1 && Dung.C._phong().xem && typeof may.lay(`quan/P5/xem/${idDung}`) === 'number' && khop([Chi, An, Dung]) && !may.lay(`bida/${maP5}/ghe/2`));
    const tD = Chi.C._van().the;
    ok('người ngồi sofa xem chỉ xem: không đánh được ghế nào; tiêu đề ghi "bạn đang xem"',
      !Dung.C._laMinh(0) && !Dung.C._laMinh(1) && Dung.C._danhCu({ dx: 1, dy: 0, v: 2, a: 0, b: 0, ca: tD.luot }, tD.luot) === false &&
      /bạn đang xem/.test(Dung.khung().querySelector('.bd-ten span').textContent),
      `${Dung.C._laMinh(0)} ${Dung.C._laMinh(1)} | ${Dung.khung().querySelector('.bd-ten span').textContent}`);
    await Binh.C._taiQuan();
    Binh.C._moBanQuan('P5');
    ok('cả quán thấy bàn P5 có 1 người xem (con mắt trên bàn); bảng bàn ghi 1 người đang ngồi sofa xem, sofa còn 2 chỗ',
      Binh.C._soXem('P5') === 1 && /1 người đang ngồi sofa xem/.test(Binh.tin()) && /còn 2 chỗ/.test(Binh.tin()));
    may.gieo('quan/P5/xem/zzzzzzzz1', Date.now()); may.gieo('quan/P5/xem/zzzzzzzz2', Date.now()); may.gieo('quan/P5/xem/zzzzzzzz3', Date.now() - 70000);
    await Binh.C._taiQuan();
    Binh.C._moBanQuan('P5');
    const kinXem = Binh.C._soXem('P5') === 3 && /đã kín người xem/.test(Binh.tin()) && !/bd-xemban/.test(Binh.tin());
    await Binh.C._xemBanQuan('P5');
    ok('sofa kín (ba người xem; người im quá 60 giây không tính): không còn nút xem, bấm cũng không vào', kinXem && Binh.C._phong() === null && /vừa kín/.test(Binh.bao()));
    for (const k of ['zzzzzzzz1', 'zzzzzzzz2', 'zzzzzzzz3']) may.gieo(`quan/P5/xem/${k}`, null);
    let soCu3 = 0;
    for (let i = 0; i < 4 && Chi.C._van().the.thang < 0; i++) {
      const t = Chi.C._van().the, m = hai.find(x => x.C._phong().P === t.luot);
      m.C._danhCu(Chi.C.L3.timCu(m.C._van().the, t.luot, 0, Chi.C.L3.mulberry32(i + 3)), t.luot);
      soCu3++;
      await doi(() => yenHet(hai, soCu3), 8000);
    }
    const r3 = may.lay(`bida/${maP5}/cu/0`);
    ok('bida 3 bi qua mạng: Chi khai cuộc bi trắng, An bi vàng; mỗi cú ghi kèm phần chạm hai bi / mấy băng; hai máy luôn cùng thế bàn, cùng điểm',
      !!r3 && r3.kq.split(';').length === 7 && khop(hai) && JSON.stringify(Chi.C._van().the.diem) === JSON.stringify(An.C._van().the.diem), `${soCu3} cú, điểm ${JSON.stringify(Chi.C._van().the.diem)}`);

    console.log('\n— Quán bida: hết ván, ván nữa giữ chỗ, tranh ghế, người kia đã đi —');
    /* máy ghi lại các lần gọi máy chủ của một máy (xem máy đó có ghi "thay" cho bàn hay không) */
    const ghiGoi = (m) => { const ds = [], goc = m.ctx.fetch; m.ctx.fetch = (u, o) => { ds.push(`${(o && o.method) || 'GET'} ${String(u).slice(url.length)}`); return goc(u, o); }; return { ds, tra: () => { m.ctx.fetch = goc; } }; };
    /* đánh tới hết ván (máy đánh mức Khó cho người tới lượt), sau mỗi cú so thế bàn và điểm của hai máy. nhuong: cú đầu của bi
       trắng là cú nhẹ chỉ chạm bi vàng (không ăn, mất lượt) để bi vàng chắc có lượt; lượt đầu của bi vàng mà đường thẳng tới bi
       trắng trống thì đánh thẳng vào bi trắng: cú chạm đầu là bi 0 (trước đây máy nhận đọc hỏng, lệch cả ván) */
    const danhHet = async (ds, ke, nhuong) => {
      let lech = 0, vangTrang = false, daNhuong = !nhuong;
      for (let i = 0; i < 80 && ds[0].C._van().the.thang < 0; i++) {
        const t = ds[0].C._van().the, m = ds.find(x => x.C._phong().P === t.luot), tm = m.C._van().the, [v, w, d] = tm.bi;
        const ux = w[0] - v[0], uy = w[1] - v[1], n = Math.hypot(ux, uy), chan = Math.abs((d[0] - v[0]) * uy - (d[1] - v[1]) * ux) / n < 0.07 && (d[0] - v[0]) * ux + (d[1] - v[1]) * uy > 0;
        const cu = t.luot === 0 && !daNhuong ? { dx: ux / n, dy: uy / n, v: 0.5, a: 0, b: 0, ca: 0 }           // trắng → vàng, nhẹ
          : t.luot === 1 && !vangTrang && !chan ? { dx: -ux / n, dy: -uy / n, v: 2.2, a: 0, b: 0.2, ca: 1 }      // vàng → trắng
          : m.C.L3.timCu(tm, t.luot, 2, m.C.L3.mulberry32(i + 11));
        if (t.luot === 0) daNhuong = true;
        if (t.luot === 1 && !chan) vangTrang = true;
        m.C._danhCu(cu, t.luot);
        ke++;
        await doi(() => yenHet(ds, ke), 8000);
        if (!khop(ds) || JSON.stringify(ds[0].C._van().the.diem) !== JSON.stringify(ds[1].C._van().the.diem)) lech++;
      }
      return { ke, lech };
    };
    const het5 = await danhHet(hai, soCu3, true), cuP5 = Object.values(may.lay(`bida/${maP5}/cu`) || {});
    ok('bida 3 bi đánh tới hết ván qua mạng: sau từng cú hai máy cùng thế bàn, cùng điểm — kể cả cú bi vàng chạm bi trắng trước',
      het5.lech === 0 && cuP5.some(r => r.P === 1 && /^0;/.test(r.kq)) && Chi.C._van().the.thang >= 0, `${het5.ke} cú, ${het5.lech} lần lệch`);
    await doi(() => hai.every(m => /bd-vannua/.test(m.tin())), 4000);
    await doi(() => Dung.yen() && Dung.C._phong().ke === Chi.C._phong().ke && /bd-het-xem/.test(Dung.tin()), 4000);
    ok('Dũng xem tới hết ván: cùng thế bàn với hai người chơi; bảng hết ván của người xem chỉ có Về quán (không Ở lại bàn, không Chơi ván nữa)',
      khop([Chi, Dung]) && /bd-roiban/.test(Dung.tin()) && !/bd-olaiban|bd-vannua/.test(Dung.tin()));
    await Binh.C._batQuan();
    ok('hết ván ở bàn P5 (đủ 5 điểm): cả hai thấy Chơi ván nữa, Ở lại bàn, Về quán; cả quán vẫn thấy bàn đang chơi (người còn đứng ở bàn)',
      Chi.C._van().the.thang >= 0 && hai.every(m => /bd-vannua/.test(m.tin()) && /bd-olaiban/.test(m.tin()) && /bd-roiban/.test(m.tin())) && Binh.C._trangBan('P5') === 'choi',
      `điểm ${JSON.stringify(Chi.C._van().the.diem)}`);
    /* Chi mời ván nữa: bàn giữ chỗ cho An */
    await Chi.C._vanNua();
    await doi(() => Chi.C._phong() && Chi.C._phong().ma !== maP5 && Chi.C._phong().cay && /Đang chờ An vào ván mới/.test(Chi.tin()));
    const R2 = Chi.C._phong().ma, q2 = may.lay('quan/P5') || {};
    await Binh.C._taiQuan();
    const choiP5 = Binh.C._trangBan('P5');
    await Binh.C._vaoBanQuan('P5');
    ok('Chi mời ván nữa: bàn P5 sang phòng mới, giữ chỗ cho An (đủ hai tên, cả quán thấy đang chơi); Bình chạm bàn P5 không vào được',
      q2.ma === R2 && q2.choi === true && q2.ten && q2.ten[0] === 'Chi' && q2.ten[1] === 'An' && choiP5 === 'choi' && Binh.C._phong() === null && /Bàn vừa đổi/.test(Binh.bao()), JSON.stringify(q2));
    await doi(() => /bd-vaotiep/.test(Dung.tin()), 4000);
    Dung.bam('.bd-vaotiep');
    await doi(() => Dung.C._phong() && Dung.C._phong().ma === R2 && Dung.C._phong().cay && /Chờ ván mới bắt đầu/.test(Dung.tin()), 4000);
    ok('Chi mời ván nữa: Dũng thấy "Xem ván mới", bấm là sang ngồi sofa chờ xem ván mới — không ngồi ghế nào',
      Dung.C._phong().xem && Dung.C._phong().P === -1 && !may.lay(`bida/${R2}/ghe/1`) && /Chờ ván mới bắt đầu/.test(Dung.tin()));
    const goiAn = ghiGoi(An), goiChi = ghiGoi(Chi);
    An.C._phong().nhipQuan = 0; An.C._kiemBanQuan();
    Chi.C._phong().nhipQuan = 0; Chi.C._kiemBanQuan();
    await doi(() => goiChi.ds.includes('PUT /quan/P5/thay.json'), 3000);
    await cho(150);
    goiAn.tra(); goiChi.tra();
    ok('giữ bàn chỉ khi bàn còn trỏ về phòng mình: máy An (còn ở phòng cũ) hỏi bàn rồi thôi ghi "thay"; máy Chi (phòng mới) ghi',
      goiAn.ds.includes('GET /quan/P5/ma.json') && !goiAn.ds.some(x => /^PUT \/quan/.test(x)) && goiChi.ds.includes('PUT /quan/P5/thay.json'), `${goiAn.ds.join(' ')} | ${goiChi.ds.join(' ')}`);
    /* An chưa vào sau một phút: bàn mở cho người khác */
    Chi.C._phong().henLai.tu -= 61000;
    Chi.C._kiemPhong();
    await doi(() => { const q = may.lay('quan/P5'); return q && q.choi === false && !q.ten[1]; });
    await doi(() => /Đang chờ người vào bàn/.test(Chi.tin()), 3000);
    await Binh.C._taiQuan();
    ok('An chưa vào sau một phút: bàn mở cho cả quán (còn tên Chi, có người chờ); bảng của Chi đổi thành "Đang chờ người vào bàn"',
      Binh.C._trangBan('P5') === 'cho' && /Đang chờ người vào bàn/.test(Chi.tin()), JSON.stringify(may.lay('quan/P5')));
    /* tranh ghế: An (còn ở bảng hết ván) bấm "Ở lại bàn" — Chi đã mời ván nữa nên An vào luôn phòng mới — cùng lúc Bình vào từ quán */
    An.bam('.bd-olaiban');
    await Binh.C._vaoBanQuan('P5');
    const vao2 = (m) => m.C._phong() && m.C._phong().ma === R2 && m.C._phong().P === 1;
    await doi(() => [An, Binh].some(vao2) && [An, Binh].some(m => !m.C._phong()), 8000);
    const ngoi = [An, Binh].find(vao2), ve = [An, Binh].find(m => !m.C._phong());
    await doi(() => !!ngoi && [Chi, ngoi].every(m => m.C._van() && m.C._van().ma === R2 && m.yen()), 8000);
    const q4 = may.lay('quan/P5') || {};
    ok('An bấm Ở lại bàn (Chi vừa mời ván nữa nên An theo lời mời) cùng lúc Bình vào từ quán, cùng ghế 2: một người ngồi được, ván bắt đầu ngay; người kia về quán, báo "Bàn vừa đủ người"',
      !!ngoi && !!ve && /Bàn vừa đủ người/.test(ve.bao()) && [Chi, ngoi].every(m => m.C._van() && m.C._van().ma === R2) && q4.choi === true && q4.ten[1] === ngoi.ten,
      ngoi ? `${ngoi.ten} ngồi, ${ve && ve.ten} về quán` : 'không ai ngồi');
    await doi(() => Dung.C._van() && Dung.C._van().ma === R2 && Dung.yen(), 8000);
    const idDung2 = Dung.C._phong().id;
    Dung.C._kiemPhong();
    await doi(() => typeof may.lay(`quan/P5/xem/${idDung2}`) === 'number', 3000);
    ok('ván mới bắt đầu (Dũng không giành ghế trong lúc hai người tranh): Dũng xem tiếp, lại có tên trên sofa bàn P5',
      Dung.C._van().ma === R2 && Dung.C._phong().P === -1 && khop([Chi, Dung]) && typeof may.lay(`quan/P5/xem/${idDung2}`) === 'number');
    await Dung.C._roiBanQuan();
    ok('Dũng về quán: nhường chỗ trên sofa (tên rời quan/P5/xem), không đụng gì tới ván', Dung.C._phong() === null && may.lay(`quan/P5/xem/${idDung2}`) == null &&
      Chi.C._van().ma === R2 && (may.lay('quan/P5') || {}).ma === R2, `${Dung.C._phong() && Dung.C._phong().ma} ${JSON.stringify(may.lay('quan/P5/xem'))} ${Chi.C._van().ma}/${R2} ${(may.lay('quan/P5') || {}).ma}`);
    Dung.C.dong();
    /* người về quán mở lại link phòng đang chơi: quán không cho đứng xem, về quán */
    ve.C._vaoPhong(R2);
    await doi(() => ve.C._phong() === null && /Bàn vừa đủ người/.test(ve.bao()), 4000);
    ok(`${ve.ten} mở link phòng bàn P5 đang chơi (không qua nút ngồi sofa xem): không đứng xem, về quán, báo "Bàn vừa đủ người"`,
      ve.C._phong() === null && /Bàn vừa đủ người/.test(ve.bao()) && [Chi, ngoi].every(m => m.C._van() && m.C._van().ma === R2));
    /* người vừa vào bỏ ngang: bàn vẫn của Chi */
    const hai2 = [Chi, ngoi];
    await ngoi.C._roiBanQuan();
    await doi(() => Chi.C._van().the.thang === 0 && /bd-olaiban/.test(Chi.tin()));
    ok(`${ngoi.ten} bỏ ngang (Về quán giữa ván): Chi thắng, thấy "${ngoi.ten} đã rời bàn", còn Ở lại bàn, thôi Chơi ván nữa; bàn P5 vẫn của Chi (người đi không xoá)`,
      Chi.C._van().the.lyDo === 'duoi' && new RegExp(`${ngoi.ten} đã rời bàn`).test(Chi.tin()) && !/bd-vannua/.test(Chi.tin()) && ngoi.C._phong() === null && (may.lay('quan/P5') || {}).ma === R2);
    /* hết ván 3 phút không ai bấm gì */
    Chi.C._phong().hetTu = Date.now() - 181000;
    Chi.C._kiemBanQuan();
    await doi(() => !may.lay('quan/P5') && Chi.C._phong() === null);
    ok('hết ván 3 phút không ai bấm gì: tự nhường bàn (P5 trống lại), Chi về quán, có lời báo', !may.lay('quan/P5') && Chi.C._phong() === null && /Hết ván đã 3 phút/.test(Chi.bao()));
    /* hết ván rồi một người về quán: bàn để lại cho người còn đứng đó */
    may.gieo('quan/P6', null);
    luuKieu(Chi, { luat: 0, dich: 5 });
    await Chi.C._ngoiBanQuan('P6');
    await doi(() => Chi.C._phong() && Chi.C._phong().cay && (may.lay('quan/P6') || {}).ma === Chi.C._phong().ma);
    await Binh.C._batQuan();
    await vaoDuocDuyet(Binh, 'P6', Chi);
    const maP6 = Chi.C._phong().ma, hai3 = [Chi, Binh];
    await doi(() => hai3.every(m => m.C._van() && m.C._van().ma === maP6 && m.yen()), 8000);
    const het6a = await danhHet(hai3, 0);
    await doi(() => hai3.every(m => /bd-vannua/.test(m.tin())), 4000);
    /* hết ván: Chi bấm Ở lại bàn trước (bàn sang phòng mới, Chi chờ), Bình bấm Chơi ván nữa sau — bàn không ghi được nữa, Bình
       vào luôn phòng Chi đang chờ ở bàn đó */
    await Chi.C._olaiBan();
    await doi(() => Chi.C._phong() && Chi.C._phong().ma !== maP6 && Chi.C._phong().cay && (may.lay('quan/P6') || {}).ma === Chi.C._phong().ma);
    const maP6c = Chi.C._phong().ma;
    await Binh.C._vanNua();
    await doi(() => Binh.C._phong() && Binh.C._phong().ma === maP6c && Chi.C._phong().cay.xin && Chi.C._phong().cay.xin[Binh.C._phong().id], 6000);
    Chi.C._duyetXin(Binh.C._phong().id, true);                         // Chi ở lại chờ người mới: Bình xin vào, Chi đồng ý
    await doi(() => hai3.every(m => m.C._van() && m.C._van().ma === maP6c && m.yen()), 8000);
    ok('hết ván ở P6: Chi bấm Ở lại bàn trước, Bình bấm Chơi ván nữa sau — Bình vào luôn phòng Chi đang chờ ở P6, ván mới bắt đầu',
      het6a.lech === 0 && hai3.every(m => m.C._van() && m.C._van().ma === maP6c) && (may.lay('quan/P6') || {}).ma === maP6c && may.lay('quan/P6').choi === true,
      `${het6a.ke} cú, ${het6a.lech} lần lệch`);
    const het6 = await danhHet(hai3, 0);
    await doi(() => hai3.every(m => /bd-vannua/.test(m.tin())), 4000);
    await Binh.C._roiBanQuan();
    await doi(() => /Bình đã về quán/.test(Chi.tin()), 4000);
    ok('hết ván sau ở P6, Bình về quán: bàn vẫn của Chi (Chi còn đứng đó); Chi thấy "Bình đã về quán.", thôi nút Chơi ván nữa, còn Ở lại bàn',
      het6.lech === 0 && Binh.C._phong() === null && (may.lay('quan/P6') || {}).ma === maP6c && /Bình đã về quán/.test(Chi.tin()) && !/bd-vannua/.test(Chi.tin()) && /bd-olaiban/.test(Chi.tin()),
      `điểm ${JSON.stringify(Chi.C._van().the.diem)}, ${het6.ke} cú, ${het6.lech} lần lệch`);
    await Chi.C._olaiBan();
    await doi(() => Chi.C._phong() && Chi.C._phong().ma !== maP6c && Chi.C._phong().cay && /Đang chờ người vào bàn/.test(Chi.tin()));
    const maP6b = Chi.C._phong().ma;
    ok('Chi ở lại: bàn P6 sang phòng mới, Chi chờ người mới', (may.lay('quan/P6') || {}).ma === maP6b);
    await Chi.C._roiBanQuan();
    ok('Chi về quán khi đang chờ một mình: nhường bàn (P6 trống)', Chi.C._phong() === null && !may.lay('quan/P6'));
    /* người kia tắt app giữa ván, tới lượt mình mà mình cũng bỏ đi: chính máy mình mời mình ra */
    may.gieo('quan/L5', null);
    luuKieu(An, { kieuBan: 8 });
    await An.C._ngoiBanQuan('L5');
    await doi(() => An.C._phong() && An.C._phong().cay && (may.lay('quan/L5') || {}).ma === An.C._phong().ma);
    await Binh.C._batQuan();
    await vaoDuocDuyet(Binh, 'L5', An);
    const maL5 = An.C._phong().ma;
    await doi(() => [An, Binh].every(m => m.C._van() && m.C._van().ma === maL5 && m.yen()), 8000);
    Binh.C._roiPhong();                                                // Bình tắt app: không ghi gì, máy Bình thôi canh bàn
    An.C._kiemBanQuan();
    An.C._phong().luotTu = Date.now() - 181000;
    An.C._kiemBanQuan();
    await cho(200);
    const chuaMoi = !may.lay(`bida/${maL5}/duoi/0`);
    An.C._phong().luotTu = Date.now() - 196000;
    An.C._kiemBanQuan();
    await doi(() => may.lay(`bida/${maL5}/duoi/0`) && An.C._van().the.thang === 1 && /Bạn đã rời bàn/.test(An.tin()));
    ok('tới lượt An mà Bình đã tắt app (không ai mời giùm): quá 3 phút chưa tính, quá 3 phút 15 giây thì chính máy An ghi lời mời ra; An thấy "Bạn đã rời bàn"',
      chuaMoi && !!may.lay(`bida/${maL5}/duoi/0`) && An.C._van().the.lyDo === 'duoi' && /Bạn đã rời bàn/.test(An.tin()));
    const goiAn2 = ghiGoi(An);
    An.C._phong().nhipQuan = 0; An.C._kiemBanQuan();
    await cho(200);
    goiAn2.tra();
    ok('người đã bị mời ra thôi giữ bàn: máy An không hỏi, không ghi gì lên bàn nữa', !goiAn2.ds.some(x => /\/quan\//.test(x)), goiAn2.ds.join(' '));
    /* theo lời mời ván nữa mà phòng mới không thành */
    An.C._theoTiep('ZZZZZZ');
    await doi(() => An.C._phong() && An.C._phong().cay === null);
    An.C._kiemPhong();
    const conCho = !!An.C._phong();
    An.C._phong().choTiep = Date.now() - 21000;
    An.C._kiemPhong();
    ok('theo lời mời ván nữa mà phòng mới không thành: chờ 20 giây, rồi về quán, có lời báo (trước đây kẹt ở "Đang vào phòng…")',
      conCho && An.C._phong() === null && /Ván mới không mở được/.test(An.bao()));
    for (const m of ca) if (m.C._phong()) m.C._roiPhong();
    may.gieo('quan', null);
  }

  console.log('\n— Quán: chủ bàn duyệt người vào, bàn 3 người, đánh đôi 4 người, bida bài —');
  {
    /* người dùng: "Người vô bàn trước có quyền đồng ý cho người kia vô chơi hay không, cho chọn đội, chơi 3 4 nười nữa, có chế độ chơi bài nữa" */
    for (const m of ca) if (m.C._phong()) m.C._roiPhong();
    may.gieo('quan', null);
    for (const m of ca) m.khung().querySelector('.bd-o-ten').value = m.ten;
    const luuK = (m, o) => { m.luu['tdtd.bida'] = JSON.stringify(Object.assign(JSON.parse(m.luu['tdtd.bida'] || '{}'), o)); };
    const Dung = mayKhach('Dũng', url);
    Dung.C.mo(); Dung.khung().querySelector('.bd-o-ten').value = 'Dũng';
    luuK(An, { kieuBan: 9, soBanL: 3 });
    An.C._moMan('quan'); await An.C._taiQuan();
    await An.C._ngoiBanQuan('L7');
    await doi(() => An.C._phong() && An.C._phong().cay && /Đang chờ người vào bàn/.test(An.tin()));
    let ma7 = An.C._phong().ma;
    ok('An ngồi bàn L7, chọn 9 bi 3 người: ván ghi 3 ghế, bàn trong quán cũng ghi 3 người', may.lay(`bida/${ma7}/so`) === 3 && (may.lay('quan/L7') || {}).so === 3);
    await Binh.C._batQuan();
    Binh.C._moBanQuan('L7');
    const coNutXin = /Xin vào chơi với An/.test(Binh.tin()) && /chủ bàn/.test(Binh.tin()) && /9 bi, 3 người/.test(Binh.tin());
    await Binh.C._vaoBanQuan('L7');
    await doi(() => An.C._phong().cay.xin && An.C._phong().cay.xin[Binh.C._phong().id] && /bd-duyet/.test(An.tin()) && /Đang chờ An đồng ý/.test(Binh.tin()), 6000);
    ok('Bình chạm bàn L7: nút "Xin vào chơi"; xin rồi thì chờ An đồng ý, chưa ngồi ghế nào; An thấy "Bình xin vào" với nút Đồng ý, Không',
      coNutXin && /Bình<\/b> xin vào/.test(An.tin()) && !may.lay(`bida/${ma7}/ghe/1`));
    An.C._duyetXin(Binh.C._phong().id, false);
    await doi(() => Binh.C._phong() === null && /chưa đồng ý/.test(Binh.bao()), 4000);
    ok('An bấm Không: Bình về quán, báo An chưa đồng ý; ghế vẫn trống', Binh.C._phong() === null && /chưa đồng ý/.test(Binh.bao()) && !may.lay(`bida/${ma7}/ghe/1`));
    await vaoDuocDuyet(Binh, 'L7', An);
    await doi(() => Binh.C._phong() && Binh.C._phong().P >= 0, 6000);
    ok('xin lại, An đồng ý: Bình ngồi ghế 2; chưa đủ 3 người nên chưa bắt đầu', Binh.C._phong().P === 1 && !may.lay(`bida/${ma7}/batDau`) && (may.lay('quan/L7') || {}).choi !== true);
    await Chi.C._batQuan();
    await Chi.C._vaoBanQuan('L7');
    await doi(() => [An, Binh].every(m => m.C._phong().cay.xin && m.C._phong().cay.xin[Chi.C._phong().id]), 6000);
    const idChi = Chi.C._phong().id;
    Binh.C._duyetXin(idChi, true);
    await new Promise(r => setTimeout(r, 400));
    ok('chỉ chủ bàn mới duyệt: Bình (đã ngồi, không phải chủ bàn) không thấy nút Đồng ý, gọi duyệt cũng không ghi gì; Chi vẫn chờ',
      !/bd-duyet/.test(Binh.tin()) && may.lay(`bida/${ma7}/duyet/${idChi}`) == null && Chi.C._phong().P < 0);
    An.C._duyetXin(idChi, true);
    const ba = [An, Binh, Chi];
    await doi(() => ba.every(m => m.C._van() && m.C._van().ma === ma7 && m.yen()), 8000);
    ok('Chi được đồng ý, đủ 3 người: ván 9 bi ba người bắt đầu ngay, ba máy cùng thế bàn', khop(ba) && An.C._van().so === 3 && (may.lay('quan/L7') || {}).choi === true);
    await Dung.C._batQuan();
    Dung.C._moBanQuan('L7');
    ok('Dũng chạm bàn L7 đang chơi ba người: sofa bốn chỗ, hai người chờ lượt ngồi đó, còn 2 chỗ cho người xem', /Sofa bàn này còn 2 chỗ/.test(Dung.tin()) && /An – Bình – Chi/.test(Dung.tin()),
      Dung.tin().replace(/<[^>]+>/g, ' ').slice(0, 300));
    let ke = 0;
    for (let i = 0; i < 3 && An.C._van().the.thang < 0; i++) {
      const t = An.C._van().the, m = ba.find(x => x.C._phong().P === t.luot);
      m.C._danhCu(cuNhe(m), t.luot); ke++;
      await doi(() => yenHet(ba, ke), 8000);
    }
    ok('ba người đánh qua lại: ba máy luôn khớp', khop(ba) && An.C._van().the.thang < 0, `${ke} cú`);
    await doi(() => ba.every(m => m.yen()));
    /* Chơi ván nữa ở bàn ba người (giả như ván vừa hết: ghi xong như máy nào hết ván cũng ghi — khỏi phải đánh tới bi 9) */
    await fetch(`${url}/bida/${ma7}/xong.json`, { method: 'PUT', body: JSON.stringify({ '.sv': 'timestamp' }) });
    await doi(() => ba.every(m => m.C._phong().cay && m.C._phong().cay.xong), 4000);
    const idBinh = Binh.C._phong().id;
    await An.C._vanNua();
    await doi(() => may.lay(`bida/${ma7}/tiep`) && An.C._phong() && An.C._phong().ma === may.lay(`bida/${ma7}/tiep`), 6000);
    const ma7b = may.lay(`bida/${ma7}/tiep`), q7 = may.lay('quan/L7') || {};
    ok('Chơi ván nữa ở bàn ba người: phòng mới vẫn 9 bi, 3 ghế; Bình và Chi được duyệt sẵn (khỏi xin lại); bàn L7 trỏ sang phòng mới, giữ chỗ cả ba người',
      may.lay(`bida/${ma7b}/so`) === 3 && may.lay(`bida/${ma7b}/kieu`) === 9 && may.lay(`bida/${ma7b}/duyet/${idBinh}`) === true && may.lay(`bida/${ma7b}/duyet/${idChi}`) === true &&
      q7.ma === ma7b && q7.so === 3 && q7.choi === true && Object.keys(q7.ten || {}).length === 3, JSON.stringify(q7));
    Binh.C._theoTiep(ma7b); Chi.C._theoTiep(ma7b);
    await doi(() => ba.every(m => m.C._van() && m.C._van().ma === ma7b && m.yen()), 8000);
    ok('Bình, Chi bấm Vào ván mới: ngồi lại đúng ghế cũ, ván mới bắt đầu ngay, người kế (Bình) phá; ba máy khớp',
      Binh.C._phong().P === 1 && Chi.C._phong().P === 2 && An.C._van().the.luot === 1 && An.C._van().the.pha === true && khop(ba), `lượt ${An.C._van().the.luot}`);
    ma7 = ma7b; ke = 0;
    await Chi.C._roiBanQuan();
    const hai = [An, Binh];
    await doi(() => hai.every(m => m.C._van().ra && m.C._van().ra.has(2)), 4000);
    let quaChi = true;
    for (let i = 0; i < 4 && An.C._van().the.thang < 0; i++) {
      if (An.C._van().the.luot === 2) quaChi = false;
      const t = An.C._van().the, m = hai.find(x => x.C._phong().P === t.luot);
      if (!m) { quaChi = false; break; }
      m.C._danhCu(cuNhe(m), t.luot); ke++;
      await doi(() => yenHet(hai, ke), 8000);
    }
    ok('Chi bỏ ngang giữa ván 3 người: ván không hết, An và Bình đánh tiếp, tới lượt Chi thì bỏ qua; hai máy vẫn khớp; bàn vẫn của An',
      quaChi && khop(hai) && An.C._van().the.thang < 0 && An.C._van().the.luot !== 2 && Chi.C._phong() === null && (may.lay('quan/L7') || {}).ma === ma7, `${ke} cú, lượt ${An.C._van().the.luot}`);
    await Binh.C._roiBanQuan();
    await doi(() => An.C._van().the.thang === 0 && An.C._van().the.lyDo === 'duoi', 4000);
    ok('Bình cũng bỏ ngang: còn mỗi An, An thắng', An.C._van().the.thang === 0 && An.C._van().the.lyDo === 'duoi');
    await An.C._roiBanQuan();
    /* đánh đôi 8 bi ở L8: bốn người, chọn ghế là chọn đội */
    const bon = [An, Binh, Chi, Dung];
    luuK(An, { kieuBan: 8, soBanL: 4 });
    An.C._moMan('quan'); await An.C._taiQuan();
    await An.C._ngoiBanQuan('L8');
    await doi(() => An.C._phong() && An.C._phong().cay && /Đang chờ người vào bàn/.test(An.tin()));
    const ma8 = An.C._phong().ma;
    await Binh.C._batQuan();
    Binh.C._moBanQuan('L8');
    const nutDoi = /Xin vào ghế 2 · Đội B/.test(Binh.tin()) && /Xin vào ghế 3 · Đội A/.test(Binh.tin()) && /Xin vào ghế 4 · Đội B/.test(Binh.tin());
    ok('An ngồi bàn L8, chọn 8 bi 4 người: ván ghi đánh đôi; người vào thấy mỗi ghế trống một nút, kèm đội (ghế 1, 3 đội A — ghế 2, 4 đội B)',
      may.lay(`bida/${ma8}/doi`) === true && may.lay(`bida/${ma8}/so`) === 4 && nutDoi);
    await vaoDuocDuyet(Binh, 'L8', An, 3);                                // chọn ghế không theo thứ tự: ghế 4 (đội B)
    await doi(() => Binh.C._phong() && Binh.C._phong().P === 3, 6000);
    await Chi.C._batQuan();
    await vaoDuocDuyet(Chi, 'L8', An, 2);
    await doi(() => Chi.C._phong() && Chi.C._phong().P === 2, 6000);
    await Dung.C._batQuan();
    await vaoDuocDuyet(Dung, 'L8', An, 1);
    await doi(() => bon.every(m => m.C._van() && m.C._van().ma === ma8 && m.yen()), 8000);
    ok('đủ bốn người, mỗi người đúng ghế mình chọn: ván đánh đôi bắt đầu, bốn máy cùng thế bàn', khop(bon) && An.C._van().the.doi === true && Dung.C._phong().P === 1 && Binh.C._phong().P === 3 && Chi.C._phong().P === 2 &&
      /Đội B/.test(Binh.khung().querySelector('.bd-nguoi').innerHTML));
    An.C._danhCu({ dx: 1, dy: 0.003, v: 8.4, a: 0, b: -0.15, cx: L.KE_DAU - 0.05, cy: L.RONG / 2 }, 0);
    ke = 1;
    await doi(() => yenHet(bon, ke), 8000);
    for (let i = 0; i < 3 && An.C._van().the.thang < 0; i++) {
      const t = An.C._van().the, m = bon.find(x => x.C._phong().P === t.luot);
      m.C._danhCu(cuNhe(m), t.luot); ke++;
      await doi(() => yenHet(bon, ke), 8000);
    }
    const nh = An.C._van().the.nhom;
    ok('đánh đôi đánh qua lại: bốn máy luôn khớp; đã chia nhóm thì hai người một đội chung một nhóm bi', khop(bon) && (nh.every(g => g === 0) || (nh[0] === nh[2] && nh[1] === nh[3] && nh[0] !== nh[1])),
      `${ke} cú, nhóm ${JSON.stringify(nh)}`);
    /* Chi (ghế 3, đội A) về quán giữa ván: như ngoài quán, An đánh luôn lượt của Chi, lượt vẫn xen đội A, B, A, B */
    await doi(() => bon.every(m => m.yen()));
    await Chi.C._roiBanQuan();
    const ba2 = [An, Binh, Dung];
    await doi(() => ba2.every(m => m.C._van().ra && m.C._van().ra.has(2)), 4000);
    ok('Chi bỏ ngang giữa ván đánh đôi: ván chưa hết, ba máy còn lại cùng biết Chi đã ra', An.C._van().the.thang < 0 && ba2.every(m => m.C._van().ra.has(2)) &&
      /đã rời bàn/.test(Binh.khung().querySelector('.bd-nguoi').innerHTML));
    let lanThay = 0, thayDung = false, chuBinh = '', theAn = '';
    for (let i = 0; i < 12 && An.C._van().the.thang < 0; i++) {
      const luot = An.C._van().the.luot, m = ba2.find(x => x.C._laMinh(luot));
      if (!m) break;
      if (luot === 2) {
        if (++lanThay === 2) break;                                    // lần thứ hai tới lượt của Chi: thử mời ra (dưới)
        thayDung = m === An && !Binh.C._laMinh(2) && !Dung.C._laMinh(2);
        chuBinh = Binh.khung().querySelector('.bd-luot').textContent; theAn = An.khung().querySelector('.bd-nguoi').innerHTML;
      }
      m.C._danhCu(cuNhe(m), luot); ke++;
      await doi(() => yenHet(ba2, ke), 8000);
    }
    ok('tới lượt của Chi thì An đánh thay (máy An cầm cơ, máy Bình, Dũng thì không); Bình thấy "An đang đánh thay Chi"; thẻ của An ghi "đánh thay Chi"; ba máy vẫn khớp',
      lanThay === 2 && thayDung && /An đang đánh thay Chi/.test(chuBinh) && /đánh thay Chi/.test(theAn) && khop(ba2) && An.C._van().the.thang < 0, `${chuBinh} | lượt ${An.C._van().the.luot}`);
    /* lượt của Chi mà An (người đánh thay) quá 3 phút không đánh: mời An ra — không phải ghế của Chi đã về — đội A hết người */
    Binh.C._kiemBanQuan();
    Binh.C._phong().luotTu = Date.now() - 181000;
    Binh.C._kiemBanQuan();
    await doi(() => may.lay(`bida/${ma8}/duoi/0`) && [Binh, Dung].every(m => m.C._van().the.thang >= 0), 4000);
    const theDung = Dung.khung().querySelector('.bd-nguoi').innerHTML;
    await doi(() => /Đội B thắng/.test(Dung.tin()) && /Bạn đã rời bàn/.test(An.tin()), 4000);
    ok('lượt của Chi mà An quá 3 phút không đánh: máy Bình mời An ra; đội A hết người, đội B thắng — máy Dũng ghi "thắng" cho cả Bình lẫn Dũng, báo "Đội B thắng"; An thấy "Bạn đã rời bàn"',
      (may.lay(`bida/${ma8}/duoi/0`) || {}).n === ke && [1, 3].includes(Dung.C._van().the.thang) && (theDung.match(/thắng/g) || []).length === 2 &&
      /Đội B thắng/.test(Dung.tin()) && /Bạn đã rời bàn/.test(An.tin()), theDung.replace(/<[^>]+>/g, ' '));
    for (const m of [An, Binh, Dung]) await m.C._roiBanQuan();
    /* bida bài ở L6: mỗi người chỉ thấy bài của mình */
    may.gieo('quan', null);
    luuK(An, { kieuBan: 52, soBanL: 2, laBan: 5 });
    An.C._moMan('quan'); await An.C._taiQuan();
    await An.C._ngoiBanQuan('L6');
    await doi(() => An.C._phong() && An.C._phong().cay && /Đang chờ người vào bàn/.test(An.tin()));
    const ma6 = An.C._phong().ma;
    await Binh.C._batQuan();
    await vaoDuocDuyet(Binh, 'L6', An);
    const hai6 = [An, Binh];
    await doi(() => hai6.every(m => m.C._van() && m.C._van().ma === ma6 && m.yen()), 8000);
    const baiAn = An.khung().querySelector('.bd-bai').innerHTML, baiBinh = Binh.khung().querySelector('.bd-bai').innerHTML, tB = An.C._van().the;
    ok('bida bài ở quán (5 lá): ván ghi kiểu 52, mỗi máy hiện đúng 5 lá của chính mình, bài hai người khác nhau, thế bài hai máy như nhau',
      may.lay(`bida/${ma6}/kieu`) === 52 && may.lay(`bida/${ma6}/la`) === 5 && /Bài của bạn/.test(baiAn) && (baiAn.match(/class="bd-la/g) || []).length === 5 &&
      (baiBinh.match(/class="bd-la/g) || []).length === 5 && baiAn !== baiBinh && JSON.stringify(tB.bai) === JSON.stringify(Binh.C._van().the.bai));
    An.C._danhCu({ dx: 1, dy: 0.003, v: 8.4, a: 0, b: -0.15, cx: L.KE_DAU - 0.05, cy: L.RONG / 2 }, 0);
    await doi(() => yenHet(hai6, 1), 8000);
    ok('phá bida bài qua mạng: hai máy cùng thế bàn, cùng bài trên tay mỗi người', khop(hai6) && JSON.stringify(An.C._van().the.bai) === JSON.stringify(Binh.C._van().the.bai));
    for (const m of hai6) await m.C._roiBanQuan();
    Dung.C.dong();
    may.gieo('quan', null);
  }

  console.log('\n— Phòng không có, phòng quá hạn —');
  {
    Chi.C._vaoPhong('ZZZZZZ');
    await doi(() => Chi.C._phong() === null);
    ok('mã sai: báo không thấy bàn, không giữ gì trong máy', /Không thấy bàn này/.test(Chi.tin()) && !JSON.parse(Chi.luu['tdtd.bida']).phong);
    may.gieo('bida/QQQQQQ', { tao: Date.now() - 90000000, chu: 0, kieu: 8, so: 2, kho: 0, pha: 0, ghe: { 0: { id: 'abcdefgh1234', ten: 'Cũ', thay: Date.now() - 90000000 } } });
    Chi.C._vaoPhong('QQQQQQ');
    await doi(() => may.lay('bida/QQQQQQ') === null && Chi.C._phong() === null, 3000);
    ok('ván quá một ngày: dọn luôn (luật cho xoá), báo ván đã đóng', may.lay('bida/QQQQQQ') === null && /đã đóng/.test(Chi.tin()));
    /* link phòng riêng kiểu cũ (trước khi chỉ còn quán): phòng không có khoá ban */
    may.gieo('bida/RRRRRR', { tao: Date.now(), chu: 0, kieu: 8, so: 2, kho: 0, pha: 0, ghe: { 0: { id: 'abcdefgh1234', ten: 'Cũ', thay: Date.now() } } });
    Chi.C._vaoPhong('RRRRRR');
    await doi(() => Chi.C._phong() === null && /Phòng riêng không còn/.test(Chi.bao()), 3000);
    ok('link phòng riêng kiểu cũ: không vào, về quán, báo chơi qua mạng giờ ở quán bida', Chi.C._phong() === null && /Phòng riêng không còn/.test(Chi.bao()) && Chi.C._quanHien());
    /* Người dùng: "các trò chơi bạn xóa # hết đi, để copy có ghi chú" — trong trò, thanh địa chỉ là …/bida-lo/?phong=MÃ; chép
       gửi đi hay tải lại trang thì mã đọc ở đó */
    const Giang = mayKhach('Giang', url);
    Object.assign(Giang.ctx.location, { pathname: '/bida-lo/', search: '?phong=RRRRRR' });
    Giang.C.mo();
    const docMa = !!Giang.C._phong() && Giang.C._phong().ma === 'RRRRRR';
    await doi(() => Giang.C._phong() === null && /Phòng riêng không còn/.test(Giang.bao()), 3000);
    ok('mở trò ở …/bida-lo/?phong=MÃ (chép thanh địa chỉ): đọc mã ở ?phong; phòng riêng kiểu cũ thì về quán, địa chỉ bỏ ?phong, vẫn là trang riêng',
       docMa && Giang.C._phong() === null && Giang.ctx.location.pathname === '/bida-lo/' && !/phong=/.test(Giang.ctx.location.search) && !Giang.ctx.location.hash,
       Giang.ctx.location.pathname + Giang.ctx.location.search + Giang.ctx.location.hash);
    Giang.C.dong();
  }

  for (const m of ca) m.C.dong();
  await may.dongLai();
  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
