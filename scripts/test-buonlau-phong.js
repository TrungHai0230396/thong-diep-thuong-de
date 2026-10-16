/* Kiểm thử Buôn lậu phố cổ chơi qua mạng: node scripts/test-buonlau-phong.js (Node 18 trở lên, cần fetch)
   Như scripts/test-bida-phong.js: dựng máy chủ giả (scripts/fb-gia.js, nhánh buonlau và sanhbuonlau theo
   firebase-rules.json) rồi cho mấy "máy" — mỗi máy một bản app riêng, một kho lưu riêng — vào chung một phòng. Chỗ khác
   hai trò kia là bí mật: chỗ tay buôn đứng không được lên máy chủ khi hiệp còn chơi; máy hải quan chỉ biết những gì luật
   cho biết; hết hiệp mới lộ, mọi máy kiểm lại từng mã cam kết, từng câu trả lời. Sau mỗi bước so phần công khai của mọi
   máy: khắc, lượt, chỗ lính, các lần soát và kết quả, tin giao hàng, ai thoát ai bị bắt — phải giống hệt nhau. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const { taoMay } = require('./fb-gia.js');
const goc = path.join(__dirname, '..');
const NGUON = ['phong.js', 'maqr.js', 'buonlau.js'].map(t => fs.readFileSync(t === 'buonlau.js' && process.env.BL_THU ? process.env.BL_THU : path.join(goc, 'assets', t), 'utf8'));   // BL_THU: bản thử phá mã

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const cho = (ms) => new Promise(r => setTimeout(r, ms));
async function doi(dk, ms = 8000) { const a = Date.now(); while (Date.now() - a < ms) { if (dk()) return true; await cho(15); } return !!dk(); }

/* EventSource tối giản cho Node */
class ES {
  constructor(url) {
    this.readyState = 0; this.nghe = {}; this.onerror = null;
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
    (this.nghe[ev] || []).forEach(f => f({ data: du }));
  }
  addEventListener(t, f) { (this.nghe[t] = this.nghe[t] || []).push(f); }
  close() { this.readyState = 2; this.req.destroy(); }
}
function nut(cls = '') {
  const o = {
    className: cls, innerHTML: '', textContent: '', value: '', style: {}, children: [], _q: {}, dataset: {}, disabled: false,
    hidden: /bl-(tin|bao|nhat)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 600, bottom: 600 }),
    appendChild(c) { o.children.push(c); return c; }, closest: () => null,
    querySelector(sel) {
      const k = String(sel).split(' ').pop().replace(/^[.#]/, '');
      if (/^bl-o-(ten|ma|link)$/.test(k) && !String(o.innerHTML).includes(k) && !Object.values(o._q).some(c => String(c.innerHTML).includes(k))) return null;   // ô nhập chỉ có khi bảng đang hiện ô đó
      return o._q[k] || (o._q[k] = nut(k));
    },
    querySelectorAll() { return []; },
  };
  return o;
}
/* một "máy": bản app riêng trong một ngữ cảnh riêng, kho lưu riêng; hình động lính đi chạy hết ngay (khung hình giả) */
function mayKhach(ten, url, luuSan) {
  const luu = luuSan || { 'tdtd.buonlau': JSON.stringify({ h: 1, ten }) };
  const m = { ten, luu, es: null };
  let dongHo = 1e6;
  const ctx = {
    console, setTimeout, clearTimeout, setInterval, clearInterval, URL, fetch, TDTD_FB_THU: url, TextEncoder,
    navigator: { share: () => Promise.resolve(), clipboard: { writeText: (chu) => { m.chep = chu; return Promise.resolve(); } } },
    localStorage: { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } },
    location: { origin: 'http://' + ten.toLowerCase().replace(/[^a-z]/g, ''), pathname: '/', search: '', hash: '' },
    EventSource: class extends ES { constructor(u) { super(u); m.es = this; } },
  };
  ctx.history = { state: null, replaceState: (_, __, u) => { const v = new URL(String(u), ctx.location.origin + ctx.location.pathname); Object.assign(ctx.location, { pathname: v.pathname, search: v.search, hash: v.hash }); } };
  ctx.document = { body: nut('body'), hidden: false, createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
  ctx.addEventListener = () => {}; ctx.removeEventListener = () => {};
  ctx.requestAnimationFrame = (f) => setTimeout(() => f(dongHo += 5000), 1);
  ctx.cancelAnimationFrame = (i) => clearTimeout(i);
  ctx.self = ctx; ctx.window = ctx;
  vm.createContext(ctx);
  for (const n of NGUON) vm.runInContext(n, ctx);
  ctx.TDTD_BUONLAU._nhanh(0.2);                                    // máy chơi thay chờ 0,1–0,14 giây mỗi nước thay vì 0,5–0,7
  Object.assign(m, { ctx, C: ctx.TDTD_BUONLAU, PH: ctx.TDTD_PHONG, khung: () => ctx.document.body.children.find(c => c.className === 'buonlau') });
  m.tin = () => m.khung().querySelector('.bl-tin').querySelector('.bl-tin-trong').innerHTML;
  m.bao = () => m.khung().querySelector('.bl-bao').textContent;
  m.bam = (sel, ds = {}) => m.C._bam({ target: { closest: (s) => (s === sel ? { dataset: ds } : null) } });
  /* phần công khai của trận trên máy này */
  m.cong = () => { const v = m.C._van(); return v && v.h ? v.h.cong : null; };
  m.the = () => {
    const v = m.C._van(); if (!v || !v.h) return '';
    const c = v.h.cong;
    return JSON.stringify([v.hiep, c.khac, c.luot, c.linh, c.soat.map(r => [r.k, r.z, r.kq]), c.giao, c.tb, v.diem, v.xong]);
  };
  m.yen = () => !!m.C._van() && m.C._ui() && m.C._ui().che !== 'cho';
  return m;
}

(async () => {
  const may = await taoMay(0);
  const url = 'http://127.0.0.1:' + may.cong;
  const An = mayKhach('An', url), Binh = mayKhach('Bình', url), Chi = mayKhach('Chi', url);
  const ca = [An, Binh, Chi];
  for (const m of ca) m.C.mo();
  const L = An.C.L;

  console.log('\n— Luật Firebase của Buôn lậu phố cổ —');
  {
    const luat = JSON.parse(fs.readFileSync(path.join(goc, 'firebase-rules.json'), 'utf8')).rules, ph = luat.buonlau && luat.buonlau.$ma;
    ok('firebase-rules.json có nhánh buonlau và sanhbuonlau', !!ph && !!luat.sanhbuonlau);
    ok('phòng: ai có mã thì đọc được, không ai liệt kê được các phòng; nước đi, câu trả lời, bản lộ chỉ ghi một lần, sau khi bắt đầu',
      !!ph && /\$ma\.matches/.test(ph['.read']) && !luat.buonlau['.read'] && ['nuoc', 'dap', 'mo'].every(k => ph[k] && /!data\.exists\(\)/.test(ph[k].$n ? ph[k].$n['.write'] : ph[k].$id['.write']) && /batDau/.test(ph[k].$n ? ph[k].$n['.write'] : ph[k].$id['.write'])));
    ok('nước tay buôn chỉ mang mã cam kết (16 chữ số hệ 16), không có chỗ đứng; lạ khoá là bị chặn',
      !!ph && /\^\[0-9a-f\]\{16\}\$/.test(JSON.stringify(ph.nuoc.$n.c)) && ph.nuoc.$n.$khac['.validate'] === false && !('toi' in ph.nuoc.$n) && !('o' in ph.nuoc.$n && /tb/.test(ph.nuoc.$n.o['.validate'] || '')));
  }

  console.log('\n— Tạo phòng, vào phòng —');
  await An.C._taoPhong({ kieu: '1v1', kho: 1, ten: 'An', truoc: 0 });
  await doi(() => An.C._phong() && An.C._phong().cay);
  const ma = An.C._phong().ma;
  ok('An tạo phòng 2 người, ngồi ghế 1', An.C._phong().P === 0 && An.C._phong().cay.kieu === '1v1', ma);
  /* người dùng: "các trò chơi bạn xóa # hết đi, để copy có ghi chú" — địa chỉ mang ?phong=MÃ (trang riêng của trò), không # */
  ok('địa chỉ mang mã phòng ?phong=MÃ, không dấu #', An.ctx.location.search === '?phong=' + ma && !An.ctx.location.hash, An.ctx.location.search + An.ctx.location.hash);
  Binh.C._vaoPhong(ma);
  await doi(() => Binh.C._phong() && Binh.C._phong().cay);
  await Binh.C._ngoiGhe(1);
  await doi(() => An.C._phong().cay.ghe && An.C._phong().cay.ghe[1]);
  ok('Bình vào bằng mã, ngồi ghế 2', Binh.C._phong().P === 1 && !!An.C._phong().cay.ghe[1]);
  ok('link mời đi qua trang chia sẻ riêng của trò', An.C._linkMoi(ma) === `http://an/buon-lau-pho-co/?phong=${ma}` && An.C._trichMa(`http://an/buon-lau-pho-co/?phong=${ma}`) === ma);
  {
    /* chép thanh địa chỉ …/buon-lau-pho-co/?phong=MÃ gửi đi, hay tải lại trang: mã đọc ở ?phong */
    const Khoa = mayKhach('Khoa', url);
    Object.assign(Khoa.ctx.location, { pathname: '/buon-lau-pho-co/', search: '?tro=buon-lau&phong=' + ma });
    Khoa.C.mo();
    const docMa = !!Khoa.C._phong() && Khoa.C._phong().ma === ma && Khoa.C._phong().P === -1;
    Khoa.C._roiPhong(); Khoa.C.dong(); if (Khoa.es) Khoa.es.close();
    ok('mở trò ở …/buon-lau-pho-co/?phong=MÃ là vào đúng phòng đó (chưa giành ghế); rời phòng thì địa chỉ bỏ ?phong, giữ ?tro',
       docMa && Khoa.ctx.location.pathname === '/buon-lau-pho-co/' && Khoa.ctx.location.search === '?tro=buon-lau' && !Khoa.ctx.location.hash,
       Khoa.ctx.location.pathname + Khoa.ctx.location.search);
  }
  await An.C._batDauPhong();
  await doi(() => An.C._van() && Binh.C._van());
  ok('bắt đầu: cả hai máy dựng trận hai hiệp, An làm tay buôn hiệp đầu', An.C._van().cheDo === 'phong' && An.C._ui().che === 'cua' && Binh.C._ui().che === 'cho');

  /* lái hai "người": tay buôn đi theo máy Vừa trên chính bí mật của mình, hải quan đi theo máy Vừa trên phần công khai.
     yen: hải quan giữ lính đứng yên và soát ngay chỗ lính mình — tay buôn không vào được chỗ có lính nên không bao giờ bị
     bắt (cho những cảnh cần hiệp còn chơi). Hết giờ (máy bận chạy việc khác) cũng thôi, không chỉ hết số vòng. */
  const lai = async (ds, gioiHan = 400, yen = false, giay = 120) => {
    const han = Date.now() + giay * 1000;
    for (let lap = 0; lap < gioiHan && Date.now() < han; lap++) {
      const vXong = ds.every(m => m.C._van() && m.C._van().xong);
      if (vXong) return true;
      let lam = false;
      for (const m of ds) {
        const u = m.C._ui(), v = m.C._van();
        if (!v || !v.h || !u) continue;
        const cong = v.h.cong;
        if (u.che === 'cua') { const ch = cong.ch; const i = u.tb !== undefined ? u.tb : 0; m.C._chonCua(i, L.chonVao(ch, Math.random, [])); lam = true; continue; }
        if (u.che === 'tb') {
          const kn = v.h.kin[u.tb], n = L.mayTB(cong, kn, 1);
          if (!n) continue;
          Object.assign(u, { chon: n.toi, gia: n.gia, giao: n.giao, thoat: n.thoat });
          m.C._xongTB(); lam = true; continue;
        }
        if (u.che === 'hq') {
          const n = yen ? { linh: cong.linh.slice(), soat: L.duocSoat(cong, u.hq) ? cong.linh[cong.ch.chu.indexOf(u.hq)] : -1 } : L.mayHQ(cong, u.hq, 1);
          Object.assign(u, { linhMoi: n.linh.slice(), soat: n.soat, buocHQ: 'soat' });
          m.C._xongHQ(); lam = true; continue;
        }
      }
      await cho(lam ? 30 : 20);
    }
    return false;
  };
  /* trong lúc chơi: máy chủ không được có chỗ đứng của tay buôn; máy kia không được biết bí mật */
  let lo = false, lechThe = 0, soLanSo = 0, daSo = -1, mauLech = null;
  const canh = setInterval(() => {
    const cay = may.lay(`buonlau/${ma}`) || {};
    const v = An.C._van();
    if (v && !v.xong && cay.nuoc) for (const r of Object.values(cay.nuoc)) if (r && r.l === 'tb' && Object.keys(r).some(k => !['P', 'h', 'l', 'k', 'c', 't', 'v', 'b'].includes(k))) lo = true;
    const vb = Binh.C._van();
    if (vb && vb.h && vb.hiep === 0 && !vb.h.cong.xong && vb.h.kin.some(Boolean)) lo = true;
    const pa = An.C._phong(), pb = Binh.C._phong();
    if (pa && pb && pa.daAp === pb.daAp && pa.daAp !== daSo && JSON.stringify((pa.cay || {}).dap || {}) === JSON.stringify((pb.cay || {}).dap || {})) { daSo = pa.daAp; soLanSo++; if (An.the() !== Binh.the()) { lechThe++; if (!mauLech) mauLech = [An.the(), Binh.the()]; } }
  }, 25);
  const xong = await lai([An, Binh]);
  clearInterval(canh);
  await doi(() => An.C._van().ketHiep.length === 2 && Binh.C._van().ketHiep.length === 2 && An.C._van().ketHiep.every(k => !/chờ máy/.test(k.dong.join())) && Binh.C._van().ketHiep.every(k => !/chờ máy/.test(k.dong.join())));
  ok('chơi trọn hai hiệp qua mạng', xong && An.C._van().xong && Binh.C._van().xong, `điểm ${An.C._van().diem.join('–')}`);
  ok('suốt trận, máy chủ không có chỗ đứng của tay buôn và máy hải quan không biết bí mật', !lo);
  ok('hai máy đã áp cùng số nước thì phần công khai giống hệt nhau (khắc, lượt, lính, các lần soát, tin giao hàng, ai thoát ai bị bắt)', lechThe === 0 && soLanSo > 10, `${soLanSo} lần so${mauLech ? ' · ' + mauLech.join(' ≠ ') : ''}`);
  ok('tên người chơi đi theo ghế: máy An gọi Bình đúng tên', An.C._van().ghe[1].ten === 'Bình', An.C._van().ghe[1].ten);
  ok('hết trận: hai máy cùng điểm, cùng lời kết từng hiệp', An.C._van().diem.join() === Binh.C._van().diem.join() &&
    JSON.stringify(An.C._van().ketHiep.map(k => k.d)) === JSON.stringify(Binh.C._van().ketHiep.map(k => k.d)), An.C._van().ketHiep.map(k => k.dong.join(' ')).join(' | '));
  const cay = may.lay(`buonlau/${ma}`);
  ok('hết hiệp mỗi tay buôn lộ đường đi; mọi máy kiểm lại khớp từng mã cam kết, từng câu trả lời', !!(cay.mo && cay.mo['0-0'] && cay.mo['1-0']) &&
    [An, Binh].every(m => m.C._van().ketHiep.every(k => k.dong.every(d => !/KHÔNG KHỚP/.test(d)))));
  {
    /* sửa một câu trả lời trong bản sao: bản lộ phải bị bắt là không khớp */
    const sao = JSON.parse(JSON.stringify(cay));
    const k0 = Object.keys(sao.dap).find(k => k.startsWith('0-'));
    sao.dap[k0].r = sao.dap[k0].r === 't' ? 3 : 't';
    const kq = An.C._kiemMo(sao, 0, 0, sao.mo['0-0']);
    const sao2 = JSON.parse(JSON.stringify(cay)); sao2.mo['0-0'].m = 'muoisai1234';
    const kq2 = An.C._kiemMo(sao2, 0, 0, sao2.mo['0-0']);
    ok('câu trả lời bị sửa, hay muối không đúng: kiểm ra không khớp', !kq.ok && !kq2.ok, `${kq.loi}; ${kq2.loi}`);
  }


  console.log('\n— Luật máy chủ chặn đúng —');
  {
    const goi = (d, cach, gt) => An.PH.goi(d, cach, gt);
    const r1 = await goi(`buonlau/${ma}/nuoc/9999`, 'PUT', { P: 0, h: 0, l: 'tb', k: 3, c: '0123456789abcdef', o: '1,2,3' });
    const r2 = await goi(`buonlau/${ma}/nuoc/9998`, 'PUT', { P: 0, h: 0, l: 'tb', k: 3, toi: 12 });
    const r3 = await goi(`buonlau/${ma}/dap/0-1-0`, 'PUT', { r: 't', g: -1 });
    const r4 = await goi(`buonlau/${ma}/nuoc/9997`, 'PUT', { P: 0, h: 0, l: 'hq', k: 3, o: '1,2,3', s: 4 });
    const r5 = await goi(`buonlau/${ma}/mo/0-0`, 'PUT', { m: 'abcdefgh', d: '', f: '', g: '' });
    ok('nước tay buôn mang thêm chỗ đứng hay khoá lạ: bị chặn; câu trả lời, bản lộ đã có: không ghi đè được; nước hải quan đúng khuôn: được',
      !r1.ok && !r2.ok && !r3.ok && r4.ok && !r5.ok, [r1, r2, r3, r4, r5].map(r => r.ma).join(','));
  }

  console.log('\n— Bốn người: hai phe, một ghế máy chơi thay —');
  for (const m of ca) { m.C._roiPhong(); }
  await An.C._taoPhong({ kieu: '2v2', kho: 1, ten: 'An', truoc: 0 });
  await doi(() => An.C._phong() && An.C._phong().cay);
  const ma2 = An.C._phong().ma;
  Binh.C._vaoPhong(ma2); Chi.C._vaoPhong(ma2);
  await doi(() => Binh.C._phong().cay && Chi.C._phong().cay);
  await Binh.C._ngoiGhe(1); await Chi.C._ngoiGhe(2);
  await doi(() => An.C._phong().cay.ghe[1] && An.C._phong().cay.ghe[2]);
  await An.C._batDauPhong();
  await doi(() => [An, Binh, Chi].every(m => m.C._van() && m.C._van().kieu === '2v2'));
  ok('phòng 4 người: An, Bình phe 1 (tay buôn hiệp đầu), Chi phe 2, ghế 4 máy chơi', An.C._phong().cay.may && An.C._phong().cay.may[3] === true && An.C._toiChayMay());
  let lo2 = false, lech2 = 0, so2 = 0, daSo2 = -1;
  const canh2 = setInterval(() => {
    const vc = Chi.C._van();
    if (vc && vc.h && vc.hiep === 0 && !vc.h.cong.xong && vc.h.kin.some(Boolean)) lo2 = true;           // Chi là hải quan hiệp đầu
    const vb = Binh.C._van();
    if (vb && vb.h && vb.hiep === 0 && !vb.h.cong.xong && vb.h.kin[0]) lo2 = true;                          // đồng đội cũng không thấy nhau
    const ps = [An, Binh, Chi].map(m => m.C._phong());
    if (ps.every(p => p && p.daAp === ps[0].daAp) && ps[0].daAp !== daSo2 && ps.every(p => JSON.stringify((p.cay || {}).dap || {}) === JSON.stringify((ps[0].cay || {}).dap || {}))) {
      daSo2 = ps[0].daAp; so2++; if (!(An.the() === Binh.the() && Binh.the() === Chi.the())) lech2++;
    }
  }, 25);
  const xong2 = await lai([An, Binh, Chi], 4000);
  clearInterval(canh2);
  await doi(() => [An, Binh, Chi].every(m => m.C._van().ketHiep.length === 2 && m.C._van().ketHiep.every(k => !/chờ máy/.test(k.dong.join()))), 15000);
  ok('chơi trọn trận bốn người: ghế máy làm tay buôn hiệp đầu (máy An chạy giùm), làm hải quan hiệp sau', xong2 && [An, Binh, Chi].every(m => m.C._van().xong), `điểm ${An.C._van().diem.join('–')}`);
  ok('ba máy đã áp cùng số nước thì cùng phần công khai; không máy nào thấy bí mật của người khác, kể cả đồng đội', lech2 === 0 && so2 > 10 && !lo2, `${so2} lần so`);
  ok('ba máy cùng điểm, mọi bản lộ (cả của máy chơi thay) khớp', [Binh, Chi].every(m => m.C._van().diem.join() === An.C._van().diem.join()) &&
    [An, Binh, Chi].every(m => m.C._van().ketHiep.every(k => k.dong.every(d => !/KHÔNG KHỚP/.test(d)))), An.C._van().ketHiep.map(k => k.dong.join(' ')).join(' | '));

  console.log('\n— Người vắng, tải lại trang —');
  for (const m of ca) { m.C._roiPhong(); }
  await An.C._taoPhong({ kieu: '1v1', kho: 1, ten: 'An', truoc: 0 });
  await doi(() => An.C._phong() && An.C._phong().cay);
  const ma3 = An.C._phong().ma;
  Binh.C._vaoPhong(ma3); await doi(() => Binh.C._phong().cay); await Binh.C._ngoiGhe(1);
  await doi(() => An.C._phong().cay.ghe[1]);
  await An.C._batDauPhong();
  await doi(() => An.C._ui() && An.C._ui().che === 'cua');
  /* An (tay buôn) đi ba khắc, rồi "tải lại trang": một máy mới cùng kho lưu. Bình đứng yên (xem lai): hiệp 1 không hết
     sớm vì một lần soát trúng, cảnh dưới mới đúng là An đang giữ bí mật */
  const buoc = async (m, k) => { for (let lap = 0; lap < 200; lap++) { const v = m.C._van(); if (v && v.h && v.h.cong.khac > k) return; await lai([An, Binh], 1, true); await cho(10); } };
  await buoc(An, 3);
  const khac3 = An.C._van().h.cong.khac, bm = JSON.parse(An.luu['tdtd.buonlau']).bm;
  ok('bí mật của tay buôn cất trong kho máy (để tải lại trang vẫn chơi tiếp), đúng phòng', !!bm && bm.ma === ma3 && !!bm.ds['0-0'] && bm.ds['0-0'].duong.length === khac3);
  An.C._roiPhong(); if (An.es) An.es.close();
  const An2 = mayKhach('An', url, Object.assign({}, An.luu));
  An2.luu['tdtd.buonlau'] = JSON.stringify(Object.assign(JSON.parse(An.luu['tdtd.buonlau']), { phong: { ma: ma3, id: An.C._phong ? JSON.parse(An.luu['tdtd.buonlau']).cu.id : '', P: 0 } }));
  An2.C.mo();
  await doi(() => An2.C._van() && An2.C._van().h && An2.C._van().h.kin[0]);
  ok('mở lại app: vào lại đúng ghế, lấy lại bí mật, đi tiếp được', !!An2.C._van() && !!An2.C._van().h.kin[0] && An2.C._van().h.kin[0].duong.length === khac3 && An2.C._phong().P === 0);
  /* Bình vắng tới lượt hải quan: An2 thấy nút cho máy đi thay */
  await doi(() => An2.C._van().h.cong.luot && An2.C._van().h.cong.luot.ai === 'hq' || (An2.C._ui() && An2.C._ui().che === 'tb'));
  if (An2.C._ui().che === 'tb') await lai([An2], 1);
  await doi(() => An2.C._van().h.cong.luot && An2.C._van().h.cong.luot.ai === 'hq');
  Binh.C._roiPhong(); if (Binh.es) Binh.es.close();
  const g1 = An2.C._phong().cay.ghe[1]; g1.thay = Date.now() + An2.C._phong().lech - 200000;
  const vang = An2.C._viecVang();
  ok('hải quan vắng quá một phút tới lượt: người kia được bấm "Cho máy đi thay"', !!vang && vang.loai === 'thay' && vang.P === 1);
  const khacThay = An2.C._van().h.cong.khac;
  An2.C._choMayThay();
  await doi(() => An2.C._phong().cay.may && An2.C._phong().cay.may[1]);
  /* máy đi thay có thể soát trúng An: khi đó sang hiệp 2, An làm hải quan — vẫn là tới lượt An, không ai phải chờ Bình */
  const mayDi = () => Object.values(An2.C._phong().cay.nuoc || {}).some(r => r && r.l === 'hq' && r.P === 1 && r.h === 0 && r.k === khacThay);
  await doi(() => mayDi() && ['tb', 'hq'].includes(An2.C._ui().che), 10000);
  ok('máy (do máy An chạy) đi thay ghế Bình, rồi tới lượt An đi tiếp', mayDi() && ['tb', 'hq'].includes(An2.C._ui().che), `khắc ${khacThay}, An: ${An2.C._ui().che}`);

  console.log('\n— Phòng mở, tìm phòng nhanh, dọn phòng —');
  An2.C._roiPhong(); if (An2.es) An2.es.close();
  const Dung = mayKhach('Dũng', url), Em = mayKhach('Em', url);
  Dung.C.mo(); Em.C.mo();
  await Dung.C._timNhanh();
  await doi(() => Dung.C._phong() && Dung.C._phong().cay && Dung.C._phong().mo);
  const ma4 = Dung.C._phong().ma;
  await doi(() => !!may.lay(`sanhbuonlau/${ma4}`));
  ok('tìm phòng nhanh khi chưa có phòng nào: tự tạo phòng mở, hiện trong danh sách phòng đang chờ', !!may.lay(`sanhbuonlau/${ma4}`) && may.lay(`sanhbuonlau/${ma4}`).trong === 1);
  await Em.C._timNhanh();
  await doi(() => Em.C._phong() && Em.C._phong().P === 1 && Em.C._phong().ma === ma4);
  ok('người kế bấm tìm phòng nhanh: vào đúng phòng đó, ngồi ghế trống', Em.C._phong() && Em.C._phong().ma === ma4 && Em.C._phong().P === 1);
  await doi(() => !may.lay(`sanhbuonlau/${ma4}`));
  ok('đủ người thì phòng thôi hiện trong danh sách', !may.lay(`sanhbuonlau/${ma4}`));
  {
    const r = await An.PH.goi(`buonlau/${ma4}`, 'DELETE');
    ok('phòng chưa xong thì không ai xoá được', !r.ok);
  }
  for (const m of [Dung, Em]) { m.C._roiPhong(); if (m.es) m.es.close(); }
  console.log(`\n${pass} đạt, ${fail} hỏng`);
  for (const m of ca) { try { m.C._roiPhong(); } catch (e) {} if (m.es) m.es.close(); }
  await may.dongLai();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
