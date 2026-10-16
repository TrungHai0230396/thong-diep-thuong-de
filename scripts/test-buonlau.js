/* Kiểm thử Buôn lậu phố cổ: node scripts/test-buonlau.js
   Bản đồ (ngã phố thật, ngõ chỉ tay buôn đi, mối cách cửa vào đủ xa, bố cục đủ thưa để chạm), luật (đi, dời lính, lục soát,
   dấu chân, tin đồn, giao hàng lộ chậm một khắc, lên thuyền, bị vây, trời sáng, điểm, bốn người thay phiên soát), đoán vị
   trí (không bao giờ bỏ sót chỗ thật — kể cả khi có dấu giả, dấu bị soát trúng nhiều lần; các tình huống tay), máy (nước
   nào cũng hợp lệ, mức Khó soát giỏi hơn Dễ), giao diện (mở, đóng, chọn cửa, đi, tin đồn, dời lính, lục soát, hết hiệp,
   hết trận, chỉ lưu cài đặt). */
'use strict';
const fs = require('fs');
const path = require('path');
const goc = path.join(__dirname, '..');

const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', value: '', style: {}, children: [], _q: {}, dataset: {}, disabled: false,
    hidden: /bl-(tin|bao|nhat)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 560, bottom: 560 }),
    appendChild(c) { o.children.push(c); return c; }, closest: () => null,
    querySelector(sel) { const k = String(sel).split(' ').pop().replace(/^[.#]/, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
  };
  return o;
};
let luu = {};
global.document = { body: nut('body'), hidden: false, createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {}; global.removeEventListener = () => {};
global.localStorage = { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.location = { origin: 'http://x', pathname: '/', search: '', hash: '' };
global.history = { replaceState() {}, state: null };
new Function(fs.readFileSync(path.join(goc, 'assets', 'phong.js'), 'utf8'))();
new Function(fs.readFileSync(process.env.BL_THU || path.join(goc, 'assets', 'buonlau.js'), 'utf8'))();   // BL_THU: bản thử phá mã
const B = global.TDTD_BUONLAU, L = B.L, { N, SO, KE, KP, DH, DP, LOAI, TEN } = L;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const S = (k) => SO[k];
let hat = 20261016;
/* mulberry32: chu kỳ 2^32. Đừng dùng hat·1103515245 bằng số thực — tích vượt 2^53 mất bit, rơi vào vòng lặp 10466 số */
const rnd = () => { hat = (hat + 0x6D2B79F5) | 0; let t = Math.imul(hat ^ (hat >>> 15), 1 | hat); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

console.log('\n— Bản đồ: ngã phố thật ở nửa đông phố cổ —');
{
  const nga = L.DINH.filter(d => d[4] !== 'vao'), cua = L.DINH.filter(d => d[4] === 'vao');
  ok('51 ngã phố, 7 cửa vào ngoài rìa, 7 mối, 4 bến', nga.length === 51 && cua.length === 7 && L.MOI.length === 7 && L.BEN.length === 4);
  const ke = (a, b) => KE[S(a)].includes(S(b));
  ok('phố đúng thứ tự thật: Hàng Bạc (Hàng Đào → Tạ Hiện → Mã Mây → Hàng Bè), Tạ Hiện, Mã Mây, Hàng Buồm, đê Trần Nhật Duật',
    ke('hd1', 'hbac') && ke('hbac', 'mm4') && ke('mm4', 'hbe1') && ke('hb', 'th1') && ke('th1', 'th2') && ke('th2', 'hbac') &&
    ke('mm1', 'mm2') && ke('mm2', 'mm3') && ke('mm3', 'mm4') && ke('lo', 'hg2') && ke('hg2', 'hb') && ke('hb', 'mm1') &&
    ke('b1', 'b2') && ke('b2', 'hch') && ke('hch', 'b3') && ke('b3', 'hmb') && ke('hmb', 'b5'));
  ok('Ô Quan Chưởng ở đầu Hàng Chiếu, thông ra bến', ke('hg1', 'oqc') && ke('oqc', 'b1') && TEN[S('oqc')] === 'Ô Quan Chưởng');
  const ngo = L.CANH.filter(c => c[3] === 1);
  ok('bảy ngõ thật là lối riêng của tay buôn: lính không đi được, tay buôn đi được',
    ['Ngõ Gạch', 'Ngõ Phất Lộc', 'Ngõ Trung Yên', 'Ngõ Cầu Gỗ', 'Ngõ Đào Duy Từ', 'Ngõ Đồng Xuân', 'Ngõ Nguyễn Hữu Huân'].every(t => ngo.some(c => c[2] === t)) &&
    ngo.every(([a, b]) => KE[S(a)].includes(S(b)) && !KP[S(a)].includes(S(b))));
  ok('Ngõ Phất Lộc có một ngã chỉ vào được bằng ngõ — chỗ trốn của tay buôn', KP[S('pl')].length === 0 && KE[S('pl')].length === 3);
  let lien = true; for (let v = 0; v < N; v++) if (LOAI[v] !== 'vao' && DH[S('mm3') * N + v] >= 99) lien = false;
  let lienPho = true; for (let v = 0; v < N; v++) if (LOAI[v] !== 'vao' && v !== S('pl') && DP[S('mm3') * N + v] >= 99) lienPho = false;
  ok('cả bản đồ liền một khối (theo mọi lối, và theo phố trừ ngã chỉ có ngõ)', lien && lienPho);
  const ch = L.cauHinh('1v1');
  const xaNhat = Math.min(...ch.vao.map(v => 1 + Math.min(...ch.moi.map(m => DH[L.LOI_VAO[v] * N + m]))));
  ok('mối nào cũng cách mọi cửa vào ít nhất 3 bước (bản đầu mối Hàng Đào sát cửa nên kiện đầu giao ngay khắc 1–2)', xaNhat >= 3, `gần nhất ${xaNhat} bước`);
  const BX = B._BX, BY = B._BY, VB = B._VB;
  let dmin = 1e9; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) dmin = Math.min(dmin, Math.hypot(BX[i] - BX[j], BY[i] - BY[j]));
  ok('bố cục: đủ toạ độ, các ngã cách nhau ít nhất 90 đơn vị (chừng 33 px trên màn hình 375 px) — đủ để chạm, nằm trong khung',
    BX.length === N && BY.length === N && dmin >= 90 && BX.every(x => x >= VB.x && x <= VB.x + VB.w) && BY.every(y => y >= VB.y && y <= VB.y + VB.h), `gần nhất ${dmin.toFixed(0)}`);
  /* bố cục giữ đúng thứ tự trên dưới, trái phải của các nơi chính: chợ Đồng Xuân trên cùng, Hồ Gươm dưới cùng, sông bên phải */
  ok('bố cục giữ hình phố cổ: Đồng Xuân trên, Cầu Gỗ dưới, đê Trần Nhật Duật bên phải, Hàng Đường bên trái',
    BY[S('dx')] < BY[S('mm3')] && BY[S('cg2')] > BY[S('mm3')] && BX[S('b3')] > BX[S('mm3')] && BX[S('lo')] < BX[S('th1')]);
}

console.log('\n— Luật —');
{
  const ch = L.cauHinh('1v1');
  ok('1 đấu 1: 3 lính ở Ô Quan Chưởng, Mã Mây, Hàng Thùng; 18 khắc; 3 kiện; 2 tin đồn; tin giao hàng lộ chậm một khắc',
    ch.linh.map(v => L.KHOA[v]).join() === 'oqc,mm3,hth1' && ch.T === 18 && ch.can === 3 && ch.R === 2 && ch.tre === 1);
  const h = L.hiepMoi(ch, [S('vlo')]), { cong, kin } = h, k = kin[0];
  ok('khắc 1 tay buôn đi trước; từ cửa vào chỉ có đúng một lối', cong.luot.ai === 'tb' && L.keDi(k.o).length === 1 && L.keDi(k.o)[0] === S('lo'));
  ok('không đi được hai bước, không đứng yên được', !L.nuocTBHopLe(cong, k, { toi: S('hg2'), gia: -1 }) && !L.nuocTBHopLe(cong, k, { toi: S('vlo'), gia: -1 }));
  ok('khắc 1 chưa rải tin đồn được (chưa có khắc trước để giả)', !L.giaHopLe(cong, k, S('hb')));
  {
    const h_ = L.hiepMoi(ch, [S('vlo')]), c_ = h_.cong, k_ = h_.kin[0];
    c_.linh = [S('lo'), S('mm3'), S('hth1')];
    ok('không bước vào chỗ có lính (lính chặn đầu cửa thì cửa đó bị vây)', !L.nuocTBHopLe(c_, k_, { toi: S('lo'), gia: -1 }) && L.biVay(c_, k_));
    c_.linh = [S('ng'), S('mm3'), S('hth1')];
    c_.luot = { ai: 'hq', i: 0 };
    ok('lính đứng ở đầu Ngõ Gạch không sang được đầu kia trong một khắc (ngõ chỉ tay buôn đi; đi vòng theo phố mất 3 bước)',
      !L.nuocHQHopLe(c_, 0, { linh: [S('ns'), S('mm3'), S('hth1')], soat: S('ns') }) && L.nuocHQHopLe(c_, 0, { linh: [S('ng'), S('mm3'), S('hth1')], soat: S('ns') }));
  }
  L.apTB(cong, L.kinDi(cong, k, { toi: S('lo'), gia: -1 }));
  ok('đi rồi tới lượt hải quan; dấu chân khắc 1 ở chỗ vừa tới', cong.luot.ai === 'hq' && k.dau[S('lo')] === 1);
  const linh = cong.linh.slice();
  ok('lính đi tối đa 2 bước theo phố, không đi qua ngõ, không đứng chung một chỗ',
    L.nuocHQHopLe(cong, 0, { linh: [S('cg'), linh[1], linh[2]], soat: S('cg') }) &&
    !L.nuocHQHopLe(cong, 0, { linh: [S('mm2'), linh[1], linh[2]], soat: S('mm2') }) && DP[S('oqc') * N + S('mm2')] === 3 &&
    !L.nuocHQHopLe(cong, 0, { linh: [linh[1], linh[1], linh[2]], soat: linh[1] }) &&
    DP[S('ng') * N + S('ns')] > 1 && DH[S('ng') * N + S('ns')] === 1);
  ok('chỉ lục soát chỗ lính đứng hay sát bên (kể cả qua ngõ)',
    L.nuocHQHopLe(cong, 0, { linh, soat: S('mm2') }) && !L.nuocHQHopLe(cong, 0, { linh, soat: S('hb') }) &&
    L.SOAT[S('pl1')].includes(S('pl')));
  L.apHQ(cong, { j: 0, linh, soat: S('mm2'), kq: [L.traLoi(k, S('mm2'))] });   // soát chỗ sát bên lính (không phải chỗ lính đứng)
  L.hetKhac(cong, [-1]);
  ok('hết khắc: sang khắc 2, lại tới tay buôn', cong.khac === 2 && cong.luot.ai === 'tb');
  /* tin đồn: rải đầu khắc 2 mang số khắc 1, không ở chỗ mình đứng khắc 1, không dưới chân lính, không ở chỗ vừa soát */
  ok('tin đồn: rải được ở ngã xa; không rải ở chỗ mình đứng khắc trước, dưới chân lính, chỗ vừa bị soát, ở cửa vào',
    L.giaHopLe(cong, k, S('hm')) && !L.giaHopLe(cong, k, S('lo')) && !L.giaHopLe(cong, k, cong.linh[0]) && !cong.linh.includes(S('mm2')) && !L.giaHopLe(cong, k, S('mm2')) && L.giaHopLe(cong, k, S('mm1')) && !L.giaHopLe(cong, k, S('vdx')));
  L.apTB(cong, L.kinDi(cong, k, { toi: S('hg2'), gia: S('hm') }));
  {
    const k_ = L.kinMoi(ch, 0, S('vlo'));
    k_.dau[S('lo')] = 1; k_.dau[S('lo')] = 4;
    const h_ = L.hiepMoi(ch, [S('vlo')]), c_ = h_.cong, kk = h_.kin[0];
    const di_ = (v) => { L.apTB(c_, L.kinDi(c_, kk, { toi: v, gia: -1 })); L.apHQ(c_, { j: 0, linh: c_.linh.slice(), soat: c_.linh[0], kq: [L.traLoi(kk, c_.linh[0])] }); L.hetKhac(c_, [-1]); };
    di_(S('lo')); di_(S('hg2')); di_(S('lo')); di_(S('ng'));
    ok('đi qua một chỗ hai lần: soát trúng thấy dấu mới nhất (khắc 3, không phải khắc 1)', L.traLoi(kk, S('lo')).dau === 3 && L.traLoi(kk, S('hg2')).dau === 2);
  }
  ok('dấu giả mang số khắc vừa rồi, trả lời lục soát y như dấu thật; tốn một lá', k.dau[S('hm')] === 1 && k.gia[S('hm')] === 1 && k.tinDon === 1 &&
    JSON.stringify(L.traLoi(k, S('hm'))) === JSON.stringify(L.traLoi(k, S('lo'))) && L.traLoi(k, S('hg2')).loai === 'bat' && L.traLoi(k, S('cg')).loai === 'trong');
  /* giao hàng, lộ chậm một khắc */
  const h2 = L.hiepMoi(ch, [S('vhd')]), c2 = h2.cong, k2 = h2.kin[0];
  const di = (v, them) => { L.apTB(c2, L.kinDi(c2, k2, Object.assign({ toi: v, gia: -1 }, them || {}))); };
  const linhXa = [S('b1'), S('b2'), S('b5')];
  c2.linh = linhXa.slice(); c2.linhLuc[1] = linhXa.slice();
  const qua = () => { L.apHQ(c2, { j: 0, linh: c2.linh.slice(), soat: c2.linh[0], kq: [L.traLoi(k2, c2.linh[0])] }); L.hetKhac(c2, [L.giaoTrongKhac(c2, k2)]); };
  di(S('hd1')); qua(); di(S('hbac')); qua();
  ok('chỉ giao ở mối, mỗi mối một lần', !L.nuocTBHopLe(c2, k2, { toi: S('th2'), gia: -1, giao: true }) && L.nuocTBHopLe(c2, k2, { toi: S('mm4'), gia: -1, giao: true }));
  di(S('mm4'), { giao: true }); qua();
  ok('giao ở khắc 3: hết khắc 3 chưa ai biết', c2.giao.length === 0 && k2.giao.length === 1);
  di(S('hbe1')); qua();
  ok('hết khắc 4 thì lộ: "khắc 3, một kiện đã tới mối Hàng Bạc"', c2.giao.length === 1 && c2.giao[0].m === S('mm4') && c2.giao[0].k === 3);
  ok('mối đã giao thì không giao lại được', !L.nuocTBHopLe(c2, k2, { toi: S('mm4'), gia: -1, giao: true }));
  /* bị vây */
  const h3 = L.hiepMoi(ch, [S('vlo')]), c3 = h3.cong, k3 = h3.kin[0];
  L.apTB(c3, L.kinDi(c3, k3, { toi: S('lo'), gia: -1 }));
  c3.linh = [S('ng'), S('hg2'), S('hd1')];
  L.apHQ(c3, { j: 0, linh: c3.linh.slice(), soat: -1, kq: [] });
  ok('(nước soát −1 bị từ chối khi được soát)', c3.luot.ai === 'hq');
  L.apHQ(c3, { j: 0, linh: c3.linh.slice(), soat: S('ng'), kq: [L.traLoi(k3, S('ng'))] }); L.hetKhac(c3, [-1]);
  ok('mọi chỗ sát bên có lính: tay buôn bị vây', L.biVay(c3, k3));
  L.apTB(c3, { i: 0, vay: true });
  ok('bị vây là bị bắt, hết hiệp; điểm vẫn tính kiện đã giao', c3.tb[0].bat === 2 && c3.tb[0].vay && c3.xong);
  /* lên thuyền, trời sáng */
  const h4 = L.hiepMoi(ch, [S('vho')]), c4 = h4.cong;
  ok('lên thuyền chỉ ở bến; lính đứng ở bến thì không vào được', !L.apTB(c4, { i: 0, thoat: S('mm3') }) && (c4.linh = [S('b5'), S('mm3'), S('oqc')], !L.apTB(c4, { i: 0, thoat: S('b5') })));
  {
    /* tay buôn đi qua đi lại hai ngã xa lính, hải quan đứng yên soát chỗ khác: hết khắc 18 thì trời sáng */
    const h5 = L.hiepMoi(ch, [S('vlo')]), c5 = h5.cong, k5 = h5.kin[0];
    let khacCuoi = 0;
    for (let lap = 0; lap < 100 && !c5.xong; lap++) {
      const l = c5.luot;
      if (l.ai === 'het') { khacCuoi = c5.khac; L.hetKhac(c5, [-1]); continue; }
      if (l.ai === 'tb') { L.apTB(c5, L.kinDi(c5, k5, { toi: k5.o === S('lo') || LOAI[k5.o] === 'vao' ? S('ng') : S('lo'), gia: -1 })); continue; }
      L.apHQ(c5, { j: 0, linh: c5.linh.slice(), soat: c5.linh[0], kq: [L.traLoi(k5, c5.linh[0])] });
    }
    ok('hết khắc 18 thì trời sáng, hết hiệp — không sớm, không muộn', c5.xong && khacCuoi === 18 && c5.tb[0].bat < 0 && c5.tb[0].thoat < 0);
  }
  /* bốn người */
  const c6 = L.cauHinh('2v2');
  ok('2 đấu 2: hai tay buôn (2 kiện, 1 tin đồn), bốn lính chia hai người', c6.soTB === 2 && c6.soHQ === 2 && c6.can === 2 && c6.R === 1 && c6.chu.join() === '0,0,1,1');
  const h6 = L.hiepMoi(c6, [S('vlo'), S('vhd')]), g6 = h6.cong;
  L.apTB(g6, L.kinDi(g6, h6.kin[0], { toi: S('lo'), gia: -1 })); L.apTB(g6, L.kinDi(g6, h6.kin[1], { toi: S('hd1'), gia: -1 }));
  ok('cả phe hải quan mỗi khắc chỉ soát một chỗ, hai người thay phiên: khắc lẻ người 1, khắc chẵn người 2',
    L.duocSoat(g6, 0) && !L.duocSoat(g6, 1) && !L.nuocHQHopLe(g6, 0, { linh: g6.linh.slice(), soat: -1 }) && L.nuocHQHopLe(g6, 0, { linh: g6.linh.slice(), soat: g6.linh[0] }));
  ok('mỗi hải quan chỉ dời lính của mình', !L.nuocHQHopLe(g6, 0, { linh: [g6.linh[0], g6.linh[1], S('hb'), g6.linh[3]], soat: g6.linh[0] }));
}

console.log('\n— Đoán vị trí: không bao giờ bỏ sót chỗ thật —');
{
  let sai = 0, lan = 0, soGT = 0;
  for (const kieu of ['1v1', '2v2']) for (let g = 0; g < 70; g++) {
    const ch = L.cauHinh(kieu), vao = []; for (let i = 0; i < ch.soTB; i++) vao.push(L.chonVao(ch, rnd, vao));
    const { cong, kin } = L.hiepMoi(ch, vao);
    while (!cong.xong && cong.luot) {
      const l = cong.luot;
      if (l.ai === 'het') { L.hetKhac(cong, kin.map(x => L.giaoTrongKhac(cong, x))); continue; }
      if (l.ai === 'tb') { const kn = kin[l.i]; if (L.biVay(cong, kn)) { L.apTB(cong, { i: l.i, vay: true }); continue; } L.apTB(cong, L.kinDi(cong, kn, L.mayTB(cong, kn, g % 3, rnd))); continue; }
      for (let i = 0; i < ch.soTB; i++) if (L.conChoi(cong, i)) {
        const b = L.niemTin(cong, i); lan++;
        if (!(b.P[kin[i].o] > 0)) sai++;
        for (let t = 0; t < cong.khac; t++) if (!(b.lan[t][kin[i].duong[t]] > 0)) { sai++; break; }
      }
      const n = L.mayHQ(cong, l.i, g % 3, rnd); if (n.soat >= 0) n.kq = kin.map(x => L.traLoi(x, n.soat)); L.apHQ(cong, n);
      soGT += cong.soat.filter(r => r.kq.some(x => x && x.loai === 'dau')).length > 0 ? 1 : 0;
    }
  }
  ok('140 ván máy đấu máy (1v1 và 2v2, đủ ba mức): ở mọi lần hải quan nghĩ, chỗ tay buôn đứng và cả đường đã đi đều nằm trong vùng đoán', sai === 0 && lan > 1000, `${lan} lần đoán, bỏ sót ${sai}`);
  /* tình huống tay */
  const ch = L.cauHinh('1v1');
  const { cong, kin } = L.hiepMoi(ch, [S('vlo')]), k = kin[0];
  const b0 = L.niemTin(cong, 0, 1);
  ok('khắc 1: hắn chỉ có thể ở một trong bảy ngã đầu cửa', b0.so === 7 && ch.vao.every(v => b0.P[L.LOI_VAO[v]] > 0));
  L.apTB(cong, L.kinDi(cong, k, { toi: S('lo'), gia: -1 }));
  L.apHQ(cong, { j: 0, linh: cong.linh.slice(), soat: cong.linh[0], kq: [L.traLoi(k, cong.linh[0])] }); L.hetKhac(cong, [-1]);
  L.apTB(cong, L.kinDi(cong, k, { toi: S('hg2'), gia: -1 }));
  /* khắc 2 soát Hàng Đường – Lãn Ông, thấy dấu chân khắc 1 */
  cong.soat.push({ k: 2, j: 0, z: S('lo'), kq: [L.traLoi(k, S('lo'))] });
  const b1 = L.niemTin(cong, 0, 2);
  const keLo = L.KE[S('lo')].filter(v => !cong.linh.includes(v));
  const quanhLo = keLo.reduce((s_, v) => s_ + b1.P[v], 0);
  ok('khắc 2 soát Hàng Đường – Lãn Ông thấy dấu chân khắc 1: thật thì hắn chỉ ở sát đó, giả thì ở chỗ khác — sát đó nặng ký hơn nửa (dấu giả nặng 0,15 lần mỗi dấu)',
    cong.soat[cong.soat.length - 1].kq[0].dau === 1 && keLo.every(v => b1.P[v] > 0) && quanhLo > 0.5 && b1.P[S('lo')] === 0, `quanh đó ${(quanhLo * 100).toFixed(0)}%`);
  cong.soat.pop();
  /* soát trống thì gạch: hắn chưa từng qua */
  cong.soat.push({ k: 2, j: 0, z: S('ng'), kq: [{ loai: 'trong' }] });
  const b2 = L.niemTin(cong, 0, 2);
  ok('soát Hàng Đường – ngõ Gạch thấy trống: khắc 1, khắc 2 hắn không ở đó', b2.lan[1][S('ng')] === 0 && b2.P[S('ng')] === 0 && b2.P[S('hg2')] > 0);
  cong.soat.pop();
  /* thông tin mâu thuẫn (không giả thuyết nào hợp): vùng đoán rỗng, máy hải quan vẫn đi được nước hợp lệ */
  cong.soat.push({ k: 2, j: 0, z: S('lo'), kq: [{ loai: 'dau', dau: 2 }] });
  const b9 = L.niemTin(cong, 0, 2);
  L.apHQ(cong, { j: 0, linh: cong.linh.slice(), soat: cong.linh[0], kq: [{ loai: 'trong' }] });
  cong.soat.pop();
  ok('dấu mang đúng khắc đang soát mà không bắt được là vô lý (thật thì đã bị bắt, giả thì chưa kịp rải): vùng đoán rỗng, máy hải quan vẫn ra nước hợp lệ',
    !b9.coThe && b9.so === 0 && (() => { const h_ = L.hiepMoi(ch, [S('vlo')]); h_.cong.soat.push({ k: 1, j: 0, z: S('lo'), kq: [{ loai: 'dau', dau: 1 }] }); h_.cong.luot = { ai: 'hq', i: 0 }; return L.nuocHQHopLe(h_.cong, 0, L.mayHQ(h_.cong, 0, 2, rnd)); })());
  /* một dấu bị soát trúng hai lần (lỗi bản đầu: tính thành hai dấu, giả thuyết "đó là dấu giả" bị loại oan) */
  const h7 = L.hiepMoi(ch, [S('vlo')]), c7 = h7.cong, k7 = h7.kin[0];
  const buoc = (v, gia, soat) => { L.apTB(c7, L.kinDi(c7, k7, { toi: v, gia: gia === undefined ? -1 : gia })); L.apHQ(c7, { j: 0, linh: c7.linh.slice(), soat, kq: [L.traLoi(k7, soat)] }); L.hetKhac(c7, [-1]); };
  c7.linh = [S('hm'), S('cg'), S('hbe2')]; c7.linhLuc[1] = c7.linh.slice();
  buoc(S('lo'), -1, S('hm')); buoc(S('ng'), -1, S('hm')); buoc(S('dx2'), S('nhh1'), S('hm'));
  buoc(S('hc'), -1, S('nhh1')); buoc(S('hg1'), -1, S('nhh1'));
  const b3 = L.niemTin(c7, 0, 5);
  ok('dấu giả bị soát trúng hai lần vẫn được coi là có thể giả: vùng đoán vẫn chứa chỗ thật', b3.P[k7.o] > 0 && c7.soat.filter(r => r.kq[0].loai === 'dau').length === 2);
}

console.log('\n— Máy chơi —');
{
  let saiTB = 0, saiHQ = 0, van = 0;
  for (const kieu of ['1v1', '2v2']) for (let g = 0; g < 40; g++) {
    const ch = L.cauHinh(kieu), vao = []; for (let i = 0; i < ch.soTB; i++) vao.push(L.chonVao(ch, rnd, vao));
    const { cong, kin } = L.hiepMoi(ch, vao); van++;
    while (!cong.xong && cong.luot) {
      const l = cong.luot;
      if (l.ai === 'het') { L.hetKhac(cong, kin.map(x => L.giaoTrongKhac(cong, x))); continue; }
      if (l.ai === 'tb') { const kn = kin[l.i]; if (L.biVay(cong, kn)) { L.apTB(cong, { i: l.i, vay: true }); continue; } const n = L.mayTB(cong, kn, g % 3, rnd); if (!L.nuocTBHopLe(cong, kn, n)) { saiTB++; break; } L.apTB(cong, L.kinDi(cong, kn, n)); continue; }
      const n = L.mayHQ(cong, l.i, g % 3, rnd); if (!L.nuocHQHopLe(cong, l.i, n)) { saiHQ++; break; } if (n.soat >= 0) n.kq = kin.map(x => L.traLoi(x, n.soat)); L.apHQ(cong, n);
    }
  }
  ok(`${van} ván máy đấu máy: mọi nước của máy đều hợp lệ`, saiTB === 0 && saiHQ === 0);
  /* đo nhanh: máy hải quan Khó bắt được nhiều hơn Dễ, cùng một tay buôn Khó */
  const bat = (mucHQ, so) => {
    let b = 0;
    for (let g = 0; g < so; g++) {
      const ch = L.cauHinh('1v1'), h = L.hiepMoi(ch, [L.chonVao(ch, rnd)]);
      L.chayMay(h, () => false, (l) => (l.ai === 'tb' ? 2 : mucHQ), rnd);
      if (h.cong.tb[0].bat >= 0) b++;
    }
    return b / so;
  };
  const de = bat(0, 120), kho = bat(2, 120);
  ok('hải quan Khó bắt được tay buôn Khó nhiều hơn hải quan Dễ', kho > de, `Dễ ${(de * 100).toFixed(0)}%, Khó ${(kho * 100).toFixed(0)}%`);
  /* phía tay buôn: trước cùng hải quan Khó, mức càng cao càng ăn nhiều điểm (đo lại bằng bộ sinh số chuẩn: Dễ 1,58, Vừa
     1,92, Khó 2,33 trên 3000 ván mỗi mức) */
  const anDiem = (mucTB, so) => {
    let d = 0;
    for (let g = 0; g < so; g++) {
      const ch = L.cauHinh('1v1'), h = L.hiepMoi(ch, [L.chonVao(ch, rnd)]);
      L.chayMay(h, () => false, (l) => (l.ai === 'tb' ? mucTB : 2), rnd);
      d += L.diemTB(h.cong, 0, h.kin[0]);
    }
    return d / so;
  };
  const dTB = [0, 1, 2].map(m => anDiem(m, 250));
  ok('trước cùng hải quan Khó: tay buôn Khó ăn nhiều điểm hơn Vừa, Vừa hơn Dễ', dTB[0] < dTB[1] && dTB[1] < dTB[2], dTB.map(x => x.toFixed(2)).join(' < '));
  {
    /* chỗ soát của máy Khó bốc theo tỉ lệ độ đáng ngờ (không dồn hẳn một chỗ, không soát bừa): đo trên một thế cố định —
       khắc 3, hắn vào từ một cửa phía tây; độ đáng ngờ trung bình của chỗ máy soát phải cao hơn hẳn soát đều */
    const ch3 = L.cauHinh('1v1'), h3 = L.hiepMoi(ch3, [S('vhd')]), c3 = h3.cong, k3 = h3.kin[0];
    c3.linh = [S('ns'), S('th2'), S('dl2')]; c3.linhLuc[1] = c3.linh.slice();
    const di3 = (v) => { L.apTB(c3, L.kinDi(c3, k3, { toi: v, gia: -1 })); L.apHQ(c3, { j: 0, linh: c3.linh.slice(), soat: S('cg'), kq: [L.traLoi(k3, S('cg'))] }); L.hetKhac(c3, [-1]); };
    di3(S('hd1')); di3(S('hd2'));
    L.apTB(c3, L.kinDi(c3, k3, { toi: S('hgai'), gia: -1 }));
    const P3 = L.niemTin(c3, 0).P, dem = new Map();
    let tong = 0;
    for (let lan = 0; lan < 150; lan++) { const n = L.mayHQ(c3, 0, 2, rnd); dem.set(n.soat, (dem.get(n.soat) || 0) + 1); tong += P3[n.soat]; }
    const n0 = L.mayHQ(c3, 0, 2, rnd), tam = new Set(); n0.linh.forEach(o => L.SOAT[o].forEach(z => tam.add(z)));
    const deu = [...tam].reduce((s_, z) => s_ + P3[z], 0) / tam.size, kho_ = tong / 150;
    ok('máy hải quan Khó soát theo tỉ lệ độ đáng ngờ: trung bình gấp rưỡi soát đều, mà vẫn rải ra nhiều chỗ', kho_ > 1.5 * deu && dem.size >= 2,
      `soát đều ${(deu * 100).toFixed(1)}%, máy ${(kho_ * 100).toFixed(1)}%, ${dem.size} chỗ khác nhau`);
    /* soát bừa (bốc đều mọi chỗ trong tầm) là cách làm máy dễ hơn: Khó không bao giờ, Vừa chừng một phần ba số lần, Dễ một
       nửa. Bản trước Khó còn soát cả chỗ hắn từng qua (để thấy dấu) — đo ra yếu hơn cả Vừa */
    const bua = (muc) => { let b = 0; for (let lan = 0; lan < 150; lan++) { const n = L.mayHQ(c3, 0, muc, rnd); if (!(P3[n.soat] > 1e-9)) b++; } return b / 150; };
    const bua2 = bua(2), bua1 = bua(1), bua0 = bua(0);
    ok('hải quan Khó chỉ soát chỗ hắn có thể đang đứng; Vừa, Dễ có lúc soát bừa', bua2 === 0 && bua1 >= 0.05 && bua0 >= 0.05,
      `soát chỗ không thể: Khó ${(bua2 * 100).toFixed(0)}%, Vừa ${(bua1 * 100).toFixed(0)}%, Dễ ${(bua0 * 100).toFixed(0)}%`);
  }
  /* đã giao đủ mà đứng ngay cạnh bến: lên thuyền luôn */
  const ch = L.cauHinh('1v1'), h = L.hiepMoi(ch, [S('vlo')]), k = h.kin[0];
  k.o = S('hch'); k.duong = [S('vlo'), S('lo'), S('hg2'), S('hb'), S('mm1'), S('mm2'), S('hch')]; h.cong.khac = 7; h.cong.linhLuc = [null, h.cong.linh, h.cong.linh, h.cong.linh, h.cong.linh, h.cong.linh, h.cong.linh, h.cong.linh];
  k.giao = [{ m: S('hb'), k: 3 }, { m: S('mm2'), k: 5 }, { m: S('cg'), k: 6 }];
  h.cong.linh = [S('oqc'), S('ddt2'), S('hth1')];
  const n = L.mayTB(h.cong, k, 2, rnd);
  ok('máy tay buôn đã giao đủ 3 kiện, đứng sát bến: lên thuyền', n && L.LOAI[n.toi] === 'ben' && n.thoat, n ? TEN[n.toi] : '');
  /* luồng nghĩ riêng dựng từ chính mã lõi */
  const LOI2 = new Function(`return (${L.LOI ? '' : ''}${B.LOI.toString()})`)();
  const L2 = LOI2();
  ok('mã lõi tự chứa (dựng lại được trong Web Worker từ LOI.toString())', L2.N === N && typeof L2.mayHQ === 'function' && typeof L2.niemTin === 'function');
}

console.log('\n— Giao diện —');
{
  luu = {};
  B._nhanh(0);
  B.mo();
  const tin = () => B._tam().querySelector('.bl-tin').querySelector('.bl-tin-trong').innerHTML;
  ok('mở lần đầu: hiện cách chơi', /Cách chơi/.test(tin()) && /Tin đồn/.test(tin()) && /Bị vây/.test(tin()));
  B._moMan('chinh');
  ok('bảng ván mới: đấu với máy, tạo phòng, vào phòng, tìm phòng nhanh, xem phòng đang chờ, cách chơi',
    ['Đấu với máy', 'Tạo phòng, mời bạn', 'Vào phòng của bạn', 'Tìm phòng nhanh', 'Xem phòng đang chờ', 'Cách chơi'].every(t => tin().includes(t)));
  B._moMan('may');
  ok('đấu với máy: chọn vai hiệp đầu và mức máy', /Hiệp đầu bạn làm/.test(tin()) && /Dễ/.test(tin()) && /Khó/.test(tin()));
  /* làm tay buôn: chọn cửa bằng cách chạm, đi bằng chạm hai lần */
  B._vanMoi({ cheDo: 'may', kieu: '1v1', muc: 1, buonTruoc: 0 });
  let u = B._ui(), v = B._van();
  ok('ván mới: bạn là tay buôn hiệp đầu, chờ chọn cửa vào', u.che === 'cua' && v.ghe[0].minh && v.ghe[1].may);
  B._cham(S('vhg'));
  ok('chạm một cửa vào: thành chỗ khắc 0 của bạn', v.h.kin[0] && v.h.kin[0].o === S('vhg') && B._ui().che === 'tb');
  B._cham(S('hgai'));
  ok('chạm chỗ sáng: chọn, chưa đi', B._ui().chon === S('hgai') && v.h.cong.khac === 1 && v.h.cong.luot.ai === 'tb');
  B._cham(S('hgai'));
  B._tuaHet();
  ok('chạm lần nữa: đi; tới lượt máy hải quan', v.h.kin[0].o === S('hgai') && (B._ui().che === 'cho' || v.h.cong.luot.ai === 'hq'));
  const doiLuot = async (che) => { for (let k = 0; k < 2000 && B._ui().che !== che && B._ui().che !== 'het'; k++) { B._tuaHet(); await new Promise(r => setTimeout(r, 5)); } };
  (async () => {
    await doiLuot('tb');
    ok('máy hải quan dời lính, lục soát; khắc 2 tới lượt bạn', B._ui().che === 'tb' && v.h.cong.khac === 2 && v.h.cong.soat.length === 1);
    /* tin đồn: bấm nút, chạm một ngã xa */
    B._bam({ target: { closest: (s) => (s === '.bl-gia' ? {} : null) } });
    ok('bấm Tin đồn: chọn chỗ rải', B._ui().dangGia === true);
    const xa = [S('hm'), S('b3'), S('nhh2')].find(z => L.giaHopLe(v.h.cong, v.h.kin[0], z));
    B._cham(xa);
    ok('chạm ngã xa: dấu giả đặt ở đó, quay về chọn chỗ đi', B._ui().gia === xa && !B._ui().dangGia);
    const toi = L.keDi(v.h.kin[0].o).find(x => !v.h.cong.linh.includes(x));
    B._cham(toi); B._xongTB(); B._tuaHet();
    ok('đi kèm tin đồn: dấu giả mang số khắc 1, còn 1 lá', v.h.kin[0].dau[xa] === 1 && v.h.kin[0].gia[xa] === 1 && v.h.kin[0].tinDon === 1);
    /* chạy hết hiệp: tay buôn đi bừa nước hợp lệ */
    for (let lap = 0; lap < 4000 && B._ui().che !== 'het'; lap++) {
      const uu = B._ui();
      if (uu.che === 'tb') { const n = L.mayTB(v.h.cong, v.h.kin[0], 0, rnd); Object.assign(uu, { chon: n.toi, gia: -1, giao: n.giao, thoat: n.thoat }); B._xongTB(); }
      B._tuaHet(); await new Promise(r => setTimeout(r, 5));
    }
    ok('hết hiệp 1: có lời kết, điểm phe buôn đúng bằng số kiện cộng lên thuyền', B._ui().che === 'het' && v.ketHiep[0] &&
      v.ketHiep[0].d === v.h.kin[0].giao.length + (v.h.cong.tb[0].thoat >= 0 ? 1 : 0), v.ketHiep[0] && v.ketHiep[0].dong.join(' '));
    ok('hết hiệp thì lộ đường đi của tay buôn trên bản đồ', B._ui().lo === true);
    B._sangHiepSau();
    u = B._ui(); v = B._van();
    ok('hiệp 2 đổi vai: bạn làm hải quan, máy chọn cửa bí mật', v.hiep === 1 && v.h.kin[0] && u.che !== 'cua');
    await doiLuot('hq');
    ok('tới lượt bạn dời lính: lính đầu tiên được chọn sẵn', B._ui().che === 'hq' && B._ui().linhChon === 0 && B._ui().buocHQ === 'linh');
    const o0 = v.h.cong.linh[0], toiLinh = L.TOI[o0].find(x => x !== o0 && !v.h.cong.linh.includes(x));
    B._cham(toiLinh);
    ok('chạm chỗ sáng: lính 1 dời tới đó, chọn sang lính kế', B._ui().linhMoi[0] === toiLinh && B._ui().linhChon === 1);
    B._bam({ target: { closest: (s) => (s === '.bl-toi-soat' ? {} : null) } });
    ok('bấm Lục soát: sang bước chọn chỗ soát', B._ui().buocHQ === 'soat');
    B._cham(toiLinh); B._cham(toiLinh); B._tuaHet();
    ok('chạm chỗ đỏ hai lần: lục soát, có kết quả trong nhật ký', v.h.cong.soat.length === 1 && v.h.cong.soat[0].z === toiLinh && /lục soát/.test(v.nhat.map(x => x.chu).join()));
    for (let lap = 0; lap < 6000 && !v.xong; lap++) {
      const uu = B._ui();
      if (uu.che === 'hq') { const n = L.mayHQ(v.h.cong, uu.hq, 0, rnd); Object.assign(uu, { linhMoi: n.linh.slice(), soat: n.soat, buocHQ: 'soat' }); B._xongHQ(); }
      if (uu.che === 'het') B._sangHiepSau();
      B._tuaHet(); await new Promise(r => setTimeout(r, 5));
    }
    ok('hết trận: điểm hai phe, bảng kết có "Ván mới, như cũ"', v.xong && /Ván mới, như cũ/.test(tin()), `${v.diem.join('–')}`);
    const l = JSON.parse(luu['tdtd.buonlau'] || '{}');
    ok('chỉ lưu cài đặt (đã xem cách chơi…), không lưu ván, không lưu đường đi khi chơi với máy', !('bm' in l) && !('van' in l) && Object.keys(l).every(k => ['h', 'muc', 'truoc', 'tieng', 'nghi', 'ten', 'kieuPhong', 'truocPhong', 'mo', 'kho'].includes(k)), Object.keys(l).join(','));
    B.dong();
    ok('đóng được, mở lại được', (B.mo(), B.dong(), true));
    console.log(`\n${pass} đạt, ${fail} hỏng`);
    process.exit(fail ? 1 : 0);
  })().catch(e => { console.error(e); process.exit(1); });
}
