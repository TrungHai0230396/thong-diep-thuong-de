/* Kiểm thử hồ nước: node scripts/test-pond.js
   pond.js viết cho trình duyệt, nên ở đây dựng sẵn một bộ DOM và canvas giả vừa đủ để nó chạy,
   rồi quay tay từng khung hình qua hook _khung. Không vẽ được gì thật, nhưng toàn bộ phần
   tính toán — lá, ếch, nòng nọc, cá, chạy bù thời gian — chạy y như trên máy người dùng. */
const fs = require('fs');
const path = require('path');

/* ---- DOM giả ---- */
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
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {},
    clientWidth: 380, clientHeight: 720, width: 380, height: 720,
    classList: {
      _s: new Set(cls.split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); },
      remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); },
      contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 380, height: 720 }),
    appendChild(c) { o.children.push(c); return c; },
    getContext: () => ve2d,
    querySelector(sel) { const k = sel.replace('.', ''); return o._q[k] || (o._q[k] = nut(k)); },
  };
  return o;
};

const than = nut('body');
global.document = { body: than, hidden: false, documentElement: nut(),
                    createElement: () => nut(), querySelector: () => null, addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1; global.innerWidth = 380; global.innerHeight = 720;
global.matchMedia = () => ({ matches: false, addEventListener() {} });

/* Đồng hồ: mặc định chỉ nhích khi mình bảo, cho kết quả lặp lại được.
   Bật gioThuc thì cộng thêm thời gian thật đã trôi — cần cho chỗ đo ngân sách mỗi khung. */
let dongHo = 0, thuc = false, mocThuc = 0;
global.performance = { now: () => dongHo + (thuc ? Date.now() - mocThuc : 0) };
const gioThuc = (b) => { thuc = b; mocThuc = Date.now(); };
const themGio = (v) => (dongHo += v);

new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'pond.js'), 'utf8'))();
const HO = global.TDTD_HO;
const chay = (giay, buoc = 33) => {
  const n = Math.round(giay * 1000 / buoc);
  for (let i = 0; i < n; i++) HO._khung(themGio(buoc));
  return n;
};

let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${n}${extra ? ' — ' + extra : ''}`); };
const suc = (r) => r < 22 ? 1 : Math.max(2, Math.min(5, 2 + Math.floor((r - 26) / 6)));

/* Lá chở quá sức là chuyện thường và chỉ thoáng qua: con nào giật mình cũng có quyền nhảy bừa
   lên một chiếc lá đông, lá lún xuống rồi hất con lên sau cùng. Cái phải kiểm là nó tự gỡ ra. */
const quaSuc = () => {
  const la = HO._la(), dem = new Map();
  for (const e of HO._ech()) if (!e.nhay && !e.boi && e.tan === null && la[e.la]) dem.set(e.la, (dem.get(e.la) || 0) + 1);
  return [...dem].filter(([i, n]) => n > suc(la[i].r)).map(([i, n]) => `lá#${i} ${n}/${suc(la[i].r)}`);
};

/* Dựng thẳng đúng tình huống từng làm hỏng bất biến ở phút 30, thay vì chờ nó tự xảy ra
   khoảng một lần trong ba lượt chạy ba phút. Hai lỗi ghép lại mới ra:
   1. đáp xuống lá xong mà không xoá e.dich, nên con đang ngồi vẫn mang mục tiêu bơi cũ;
   2. boLa() so e.la === i SAU khi đã dời chỉ số, nên so nhầm sang chiếc lá khác.
   Kết quả: con ếch ngồi trên lá j > i, bị dời thành j-1, rồi vẫn bị gán cho đang bơi. */
function soatBoLa() {
  const truoc = HO._la().length;
  if (truoc < 3) return ['hồ chưa đủ lá để dựng phép thử'];
  const loi = [];
  /* con #0 ngồi trên lá 2 nhưng còn mang mục tiêu cũ là lá 1 — đúng vết mà lỗi để lại */
  HO._datEch([{ la: 2, dich: 1 }, { la: 1, dich: -1 }, { la: -1, boi: true, dich: 1 }]);
  HO._boLa(1);
  const e = HO._ech(), la = HO._la();
  if (e[0].boi) loi.push('con đang ngồi lá khác bị gán cho đang bơi khi một lá xa nó biến mất');
  if (e[0].la !== 1) loi.push(`con ngồi lá 2 phải được dời thành lá 1, đang là ${e[0].la}`);
  if (e[1].la !== -1) loi.push('con ngồi đúng chiếc lá vừa mất phải được gỡ ra');
  if (e[1].la === -1 && !e[1].boi) loi.push('con mất lá phải xuống nước bơi');
  if (!e[2].boi || e[2].la >= 0) loi.push('con đang bơi tới lá vừa mất phải bơi tiếp, không được bám lá');
  e.forEach((x, i) => { if (x.boi && x.la >= 0) loi.push(`ếch #${i} vừa bơi vừa bám lá`); });
  if (la.length !== truoc - 1) loi.push('số lá không giảm đúng một');
  return loi;
}

/* `chat` = hồ đang bị nhồi ếch quá mức thiết kế. Lúc đó chuyện lá chở quá sức là liên tục và
   đúng ý đồ: con nào cũng có quyền nhảy lên lá đông, lá lún rồi hất con lên sau cùng xuống,
   nhồi gấp ba sức chứa thì vòng đó không bao giờ ngớt. Chỉ đòi lá tự gỡ ra ở hồ chạy tự nhiên. */
const soatBatBien = (nhan, chat = false) => {
  const la = HO._la(), loi = [];
  HO._ech().forEach((e, i) => {
    if (!e.nhay && !e.boi && e.tan === null && !la[e.la]) loi.push(`ếch #${i} ngồi trên lá ${e.la} không có thật`);
    if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) loi.push(`ếch #${i} toạ độ NaN`);
    if (e.boi && e.la >= 0) loi.push(`ếch #${i} vừa bơi vừa bám lá`);
  });
  if (!chat) {
    let qua = quaSuc();
    if (qua.length) { chay(10); qua = quaSuc(); if (qua.length) loi.push(`quá sức kéo dài: ${qua.join(', ')}`); }
  }
  ok(nhan, loi.length === 0, loi.slice(0, 3).join('; '));
};

console.log('\n— Lá hết chỗ thì ếch ở lại dưới nước —');
HO.mo(); chay(3);
const chuaNhoi = HO._debug();
HO._themEch(190, 400, chuaNhoi.cho + 10);               // nhồi nhiều hơn hẳn tổng chỗ ngồi
chay(60);                                               // nhồi cả đàn vào một điểm, cho chúng tản ra đã
let d = HO._debug();
ok('có ếch nổi dưới nước', d.boi > 0, `${d.boi}/${d.ech} con`);
ok('số con ngồi không vượt tổng chỗ', d.ech - d.boi - d.bay <= d.cho + 2, `ngồi ${d.ech - d.boi - d.bay} / chỗ ${d.cho}`);
/* Chỉ đòi mấy con **thả nổi** giữ khoảng. Con đang bơi có đích thì cứ lao tới mép lá, xúm lại
   ở đó là đúng — như một đám chen lên bến, không phải lỗi. */
ok('mấy con thả nổi không chồng lên nhau', (() => {
  const n = HO._ech().filter(e => e.boi && e.dich < 0 && e.tan === null);
  if (n.length < 2) return true;
  const gan = Math.min(...n.map(a => Math.min(...n.filter(b => b !== a)
    .map(b => Math.hypot(a.x - b.x, a.y - b.y)))));
  return gan >= 12;
})(), (() => {
  const n = HO._ech().filter(e => e.boi && e.dich < 0 && e.tan === null);
  if (n.length < 2) return `${n.length} con thả nổi`;
  const gan = Math.min(...n.map(a => Math.min(...n.filter(b => b !== a)
    .map(b => Math.hypot(a.x - b.x, a.y - b.y)))));
  return `${n.length} con, gần nhau nhất ${Math.round(gan)} px`;
})());
soatBatBien('bất biến sau khi nhồi ếch', true);
ok('chỗ đếm ghi đúng số ếch', HO._dem() === String(d.ech), `"${HO._dem()}" / ${d.ech} con`);

console.log('\n— Không quẩn vòng trèo lên rồi tuột xuống —');
let nhay = 0, truoc = HO._ech().map(e => e.nhay);
for (let i = 0; i < 900; i++) {
  chay(1 / 30, 33);
  const g = HO._ech().map(e => e.nhay);
  for (let k = 0; k < Math.min(g.length, truoc.length); k++) if (g[k] && !truoc[k]) nhay++;
  truoc = g;
}
ok('không nhảy loạn trong hồ chật', nhay < 60, `${nhay} cú trong 30 giây với ${HO._debug().ech} con`);

console.log('\n— Ếch nổi dưới nước vẫn già, vẫn chết —');
HO.mo(); chay(2);
HO._themEch(190, 400, 14); chay(20);
const truocGia = HO._debug().ech;
HO._giaDi(400000); chay(30);
ok('quá tuổi thì chết, kể cả con dưới nước', HO._debug().ech < truocGia, `${truocGia} → ${HO._debug().ech} con`);

console.log('\n— Chạy bù thời gian ẩn tab —');
HO.mo(); chay(3);
HO._buTru(8 * 3600 * 1000);
const no0 = HO._debug().noTua;
ok('nhận đủ tám tiếng, không cắt bớt', no0 > 7.5 * 3600 * 1000, `${(no0 / 3600000).toFixed(1)} giờ`);
gioThuc(true);
let dinh = 0, tong = 0, khung = 0;
while (HO._debug().noTua > 0 && khung < 200000) {
  const a = Date.now(); chay(1 / 30, 33); const b = Date.now() - a;
  dinh = Math.max(dinh, b); tong += b; khung++;
}
gioThuc(false);
ok('trả hết nợ', HO._debug().noTua === 0, `${khung} khung, tổng ${tong} ms`);
ok('chia ra nhiều khung chứ không dồn một cục', khung > 20, `${khung} khung`);
ok('không khung nào đơ quá 60 ms', dinh <= 60, `nặng nhất ${dinh} ms`);   // ngân sách 40 cộng một bước lỡ nhịp
const khung8 = khung;                                 // mốc để đong bài một ngày ở dưới

HO.mo(); chay(3);
HO._buTru(30 * 60 * 1000);
gioThuc(true);
const x0 = HO._ech().map(e => e.x);
chay(1 / 30, 33);
const x1 = HO._ech().map(e => e.x);
gioThuc(false);
ok('còn nợ sau một khung', HO._debug().noTua > 0);
ok('khung có vẽ vẫn tiến trong lúc trả nợ', x0.length !== x1.length || x0.some((v, i) => v !== x1[i]));
ok('đóng hồ thì xoá sạch phần còn nợ', (HO.dong(), HO._debug().noTua === 0));

/* Nợ cộng vào theo giờ ngoài đời, nhưng chỉ trả được lúc người ta đang nhìn. Không chặn cái
   đuôi nợ thì để hồ mở, ẩn một ngày ghé nhìn năm giây, ngày nào cũng vậy, nợ cứ dày thêm mãi:
   dòng "thời gian đang trôi nhanh" không bao giờ tắt và mỗi khung vĩnh viễn mất ngân sách. */
HO.mo(); chay(3);
const dayNo = [];
for (let v = 0; v < 6; v++) {
  HO._buTru(24 * 3600 * 1000);
  gioThuc(true);
  const het = Date.now() + 1500;
  while (Date.now() < het) chay(1 / 60, 33);
  gioThuc(false);
  dayNo.push(HO._debug().noTua);
}
ok('nợ không dày thêm qua từng lần ghé', dayNo[5] <= dayNo[1] + 36e5,
   dayNo.map(v => (v / 3600000).toFixed(1) + 'h').join(' → '));

HO.mo(); chay(3);
HO._buTru(3 * 24 * 3600 * 1000);
ok('quãng ẩn dài hơn một ngày thì gom về một ngày', HO._debug().noTua <= 24 * 3600 * 1000 + 1,
   `${(HO._debug().noTua / 3600000).toFixed(1)}h`);
gioThuc(true);
let khungNgay = 0;
while (HO._debug().noTua > 0 && khungNgay < 500000) { chay(1 / 60, 33); khungNgay++; }
gioThuc(false);
/* Đong bằng chính bài tám tiếng ở trên, đo trên cùng cái máy trong cùng lượt chạy — nhờ vậy
   tốc độ máy bị khử đi. Phải làm thế vì con số tuyệt đối không nói lên gì về thuật toán: cùng
   một đoạn mã, máy rảnh ra 5xx khung, máy đang đánh chỉ mục ra 7xx, nên ngưỡng 600 cứng lúc
   đạt lúc hỏng. Mà bỏ hẳn giờ thật đi cũng không xong: không có giờ thật thì cơ chế chia ngân
   sách chẳng bị ép gì, nó trả sạch nợ trong ĐÚNG MỘT khung và bài kiểm thành ra đạt suông.

   Ngưỡng đặt theo phương sai ĐO ĐƯỢC, không theo cảm tính: một ngày gấp ba lần tám tiếng, mà
   tỉ lệ thật đo qua nhiều lượt trải từ 1,8 tới 5,4 lần — hai phép đo diễn ra ở hai lúc khác
   nhau nên tải máy giữa chúng cũng khác. Lấy mười lần là còn gần gấp đôi chỗ trống so với lượt
   xấu nhất từng thấy, mà vẫn bắt được hồi quy thật: thuật toán mà hỏng thì tỉ lệ vọt lên hàng
   chục lần chứ không nhích lên vài phần mười. */
ok('một ngày nợ không tốn quá nhiều khung hơn tám tiếng',
   khungNgay < Math.max(200, khung8 * 10), `${khungNgay} khung, tám tiếng tốn ${khung8}`);

console.log('\n— Đàn bọ là một quần thể, không phải cái vòi phun —');
HO.mo(); chay(60);
HO._donSach();                                          // dọn sạch ếch, nòng nọc, trứng
/* Mốc chắc chắn: đàn đang dưới sức chứa thì bước nào cũng phải dày thêm, không cần chờ mùa. */
HO._datDamBo(.4);
const boA = HO._dam().damBo;
chay(1);
ok('không ai ăn thì đàn bọ dày lên ngay', HO._dam().damBo > boA, `${boA} → ${HO._dam().damBo}`);
/* Mốc theo thời gian: mùa đổi 50–110 giây một lần nên phải nhìn cả quãng dài, và nhìn đỉnh
   chứ không nhìn lúc cuối — cuối quãng có thể rơi đúng mùa vắng. */
let dinhBo = HO._dam().damBo;
/* Giữ hồ TRỐNG suốt quãng đo, thay vì để mặc rồi nhìn đỉnh. Lý do: chừng một phút là có ếch
   lạc bơi tới ăn, mà nó tới lúc nào thì ngẫu nhiên — nên đỉnh đo được lúc 2,4 lúc 1,92, và
   bài kiểm hỏng oan chừng một lần trong bốn lượt. Điều cần khẳng định ở đây là "không ai ăn
   thì đàn bọ dày lên", nên dọn sạch kẻ ăn đi là đo đúng thứ định đo, chứ không phải nới ngưỡng
   cho nó qua. */
for (let i = 0; i < 24; i++) { HO._donSach(); chay(15); dinhBo = Math.max(dinhBo, HO._dam().damBo); }
ok('không có gì ăn thì đàn bọ dày lên rõ', dinhBo >= 2, `đỉnh ${dinhBo.toFixed(2)}`);
ok('đàn bọ không vượt quá sức chứa của mùa', HO._dam().damBo <= HO._dam().sucBo * 1.45,
   `${HO._dam().damBo} / sức chứa ${HO._dam().sucBo}`);
/* Bản đầu tôi làm tròn thay vì lấy phần nguyên: đàn 0,5 con vẫn thả một con bay ra, ếch nuốt
   xong trừ một thành âm rồi bị kéo về 0 — hồ đẻ mồi từ không khí và đàn ếch không bao giờ đói. */
/* Mở lại hồ cho trời quang đã: hạ số đàn không làm mấy con đang bay biến mất, chúng chỉ
   mất khi bị ăn hoặc hết đời — đúng như phải thế, nên phải bắt đầu từ hồ chưa có con nào. */
HO.mo(); HO._datDamBo(0.5); chay(1 / 30, 33);
ok('đàn dưới một con thì không thả con nào bay', HO._debug().bo === 0, `${HO._debug().bo} con bay`);
/* Đặt trong sức chứa của mùa hiện tại: đặt cao hơn thì code kéo về đúng sức chứa — đúng như
   phải thế — và phép thử hoá ra đi đòi cái mùa vắng không có. */
const dat = Math.max(1, Math.floor(HO._dam().sucBo));
HO._datDamBo(dat); chay(1 / 30, 33);
ok('đàn có mấy con thì thả ra bấy nhiêu', HO._debug().bo === dat, `đặt ${dat}, thả ${HO._debug().bo}`);

console.log('\n— Hồ trống thì có ếch lạc tới —');
HO.mo(); chay(30);
HO._donSach();
let toi = 0;
for (let g = 0; g < 300 && HO._debug().ech === 0; g++) { chay(1); toi = g + 1; }
ok('hồ trống thì lâu lâu có một con lạc vào', HO._debug().ech > 0, `tới ở giây ${toi}`);
chay(420);
const hoiLai = HO._debug();
ok('từ một con gây lại được cả đàn', hoiLai.ech >= 3,
   `${hoiLai.ech} ếch, ${hoiLai.nong} nòng nọc sau bảy phút`);
/* Đếm thẳng số lần con lạ tới, chứ đếm đầu ếch thì không phân biệt được với đẻ. */
HO.mo(); chay(120);
const khachTruoc = HO._soKhach();
chay(300);
ok('hồ còn ếch thì không con lạ nào chen vào', HO._soKhach() === khachTruoc,
   `${HO._soKhach() - khachTruoc} lần trong năm phút, hồ đang có ${HO._debug().ech} con`);

console.log('\n— Rời tab lâu rồi quay lại vẫn còn ếch —');
let chetHo = 0;
for (let i = 0; i < 6; i++) {
  HO.mo(); chay(30);
  HO._buTru(24 * 3600 * 1000);
  gioThuc(true);
  let n = 0;
  while (HO._debug().noTua > 0 && n < 400000) { chay(1 / 60, 33); n++; }
  gioThuc(false);
  if (HO._debug().ech === 0) chetHo++;
}
ok('ẩn tab một ngày rồi quay lại, hồ không chết sạch', chetHo <= 1, `${chetHo}/6 hồ trống`);

console.log('\n— Gỡ một chiếc lá giữa mảng —');
const loiBoLa = soatBoLa();
ok('gỡ lá xong không con nào rơi vào trạng thái mâu thuẫn', loiBoLa.length === 0, loiBoLa.join('; '));

console.log('\n— Chạy dài một tiếng —');
HO.mo(); chay(3);
const batDau = Date.now();
for (let p = 0; p < 12; p++) { chay(290); soatBatBien(`bất biến ở phút ${(p + 1) * 5}`); }
d = HO._debug();
console.log(`  một tiếng mô phỏng tốn ${Date.now() - batDau} ms — ếch ${d.ech}, lá ${d.la}, nòng nọc ${d.nong}`);

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
