/* Kiểm thử bầu trời đêm: node scripts/test-troidem.js

   Bầu trời vốn chỉ có bài kiểm phần TÍNH (scripts/test-astro.js), không có bài nào chạm tới
   phần NHÌN và phần CHẠM. Đúng chỗ đó đẻ ra hai lỗi người dùng bắt được:
   - Trăng đã lặn mà dòng chữ bảo "chưa lên khỏi chân trời";
   - bấm vào Mặt Trăng, Mặt Trời thì không có gì xảy ra, vì app chưa hề có chức năng chạm chọn.
   Nên tệp này dựng một bộ DOM và canvas giả vừa đủ để chạy thật vòng vẽ, rồi soi vào đó. */
const fs = require('fs');
const path = require('path');

/* ---- DOM và canvas giả ---- */
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
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {}, dataset: {},
    hidden: false, clientWidth: 380, clientHeight: 720, width: 380, height: 720,
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
    querySelectorAll() { return []; },
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

/* Chòm sao do constellation.js cung cấp qua self.TDTD_CHOMSAO — thiếu nó thì bầu trời vẫn
   chạy nhưng không có chòm nào, nên phải nạp đủ mới kiểm được đúng thứ người dùng thấy. */
for (const t of ['astro.js', 'constellation.js', 'saosang.js', 'nightsky.js'])
  new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', t), 'utf8'))();
const T = global.TDTD_TROIDEM;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

T.mo();

console.log('\n— Chưa chọn nơi thì hỏi, không lặng lẽ lấy TP.HCM —');
/* Trước đây ai chưa bấm Đổi nơi đều thấy dự báo mưa của TP.HCM, kể cả người ở Hà Nội. */
{
  const tam = than.children.find(c => c.className === 'troidem');
  const bang = tam && tam.querySelector('.td-bang');
  ok('máy chưa lưu nơi nào thì coi là chưa chọn', T._daChon() === false);
  ok('mở màn lần đầu là hiện bảng "Bạn đang ở đâu?"',
     bang && bang.hidden === false && bang.innerHTML.includes('Bạn đang ở đâu'));
  ok('lần đầu nút đóng ghi "Để sau", và không đánh dấu sẵn TP.HCM như đã chọn',
     bang.innerHTML.includes('Để sau') && !bang.innerHTML.includes('class="dang"'));
  ok('chưa chọn thì không có dự báo mưa nào', T._mua().tinh === 'chua' && T._mua().dong.length === 0);
}

const HCM = T._noi(10.8231, 106.6297, 'TP.HCM');
ok('chọn nơi xong thì tính là đã chọn', T._daChon() === true);
/* Một lúc chắc chắn là ban đêm ở Việt Nam, để Mặt Trời nằm dưới chân trời. */
const DEM = new Date(2026, 8, 15, 23, 30, 0).getTime();
const dauN = (h) => new Date(2026, 8, 15, 0, 0, 0).getTime() + h * 36e5;
const NGAY = new Date(2026, 8, 15, 10, 0, 0).getTime();

console.log('\n— Bầu trời tính ra được —');
const bDem = T._bauTroi(DEM), bNgay = T._bauTroi(NGAY);
ok('nửa đêm thì Mặt Trời ở dưới chân trời', bDem.troi.cao < -10, `${bDem.troi.cao.toFixed(1)}°`);
ok('mười giờ sáng thì Mặt Trời ở trên cao', bNgay.troi.cao > 30, `${bNgay.troi.cao.toFixed(1)}°`);
ok('có đủ Mặt Trăng, hành tinh, chòm sao', !!bDem.trang && bDem.ht.length > 0 && bDem.chom.length > 0,
   `trăng ${!!bDem.trang} · hành tinh ${bDem.ht.length} · chòm sao ${bDem.chom.length}`);

console.log('\n— Chạm chọn: thứ trước đây hoàn toàn không có —');
ok('có hàm dò chạm', typeof T._chonTai === 'function');
ok('có danh sách mốc chạm', Array.isArray(T._moc()));
/* Ngắm thẳng vào Mặt Trời lúc ban ngày rồi chạm vào giữa màn hình. */
T._nhin(Math.round(bNgay.troi.huong), Math.round(bNgay.troi.cao), 75);
T._ve(NGAY);
const mocNgay = T._moc();
ok('ban ngày, ngắm vào Mặt Trời thì nó nằm trong danh sách chạm được',
   mocNgay.some(m => m.ten === 'Mặt Trời'), mocNgay.map(m => m.ten).join(', ') || 'rỗng');
const mTroi = mocNgay.find(m => m.ten === 'Mặt Trời');
ok('chạm trúng tâm Mặt Trời thì chọn được nó', mTroi && T._chonTai(mTroi.x, mTroi.y) === 'Mặt Trời');
ok('chạm lệch trong bán kính vẫn trúng — ngón tay không bao giờ chạm đúng tâm',
   mTroi && T._chonTai(mTroi.x + mTroi.r - 3, mTroi.y) === 'Mặt Trời');
ok('chạm ra xa hẳn thì không chọn nhầm ai', T._chonTai(2, 2) === null);
ok('chạm ra ngoài mép màn thì không chọn nhầm ai', T._chonTai(-50, -50) === null);

console.log('\n— Thiên thể đã lặn vẫn thấy và vẫn chạm được —');
/* Đây là chỗ người dùng kêu: "bấm vô xem mặt trăng mặt trời thì ko xem đc". Lúc chúng đã lặn
   thì chúng không nằm trên bầu trời, nên phải chúc mắt xuống dưới chân trời mới thấy. */
const bD = T._bauTroi(DEM);
ok('nửa đêm thì cả Mặt Trời lẫn Mặt Trăng đều đã khuất', bD.troi.cao < 0 && bD.trang.cao < 0,
   `trời ${bD.troi.cao.toFixed(0)}°, trăng ${bD.trang.cao.toFixed(0)}°`);
T._nhin(Math.round(bD.troi.huong), Math.round(bD.troi.cao), 75);
T._ve(DEM);
const mocDem = T._moc();
const bongTroi = mocDem.find(m => m.ten === 'Mặt Trời');
ok('chúc mắt xuống thì Mặt Trời đã lặn vẫn hiện ra để mà chạm',
   !!bongTroi, mocDem.map(m => m.ten + '(' + m.loai + ')').join(', ') || 'không có gì');
ok('nó được đánh dấu là bóng mờ dưới chân trời, không nhầm là đang mọc',
   bongTroi && bongTroi.loai === 'bong', bongTroi ? bongTroi.loai : '');
ok('chạm vào bóng mờ thì chọn được', bongTroi && T._chonTai(bongTroi.x, bongTroi.y) === 'Mặt Trời');

console.log('\n— Quay nhìn về phía một thiên thể —');
ok('có hàm quay nhìn', typeof T._nhinToi === 'function');
T._nhin(0, 40, 75);
T._nhinToi(bD.trang.cao, bD.trang.huong);
for (let i = 0; i < 400; i++) T._keoNhin();
const d = T._debug();
ok('quay xong thì hướng nhìn trùng hướng của Mặt Trăng',
   Math.abs(((d.huongNhin - bD.trang.huong + 540) % 360) - 180) < 2,
   `nhìn ${d.huongNhin}° so với trăng ${Math.round(bD.trang.huong)}°`);
ok('và mắt chúc xuống đúng độ cao âm của nó',
   Math.abs(d.caoNhin - Math.max(-82, bD.trang.cao)) < 2,
   `nhìn ${d.caoNhin}° so với trăng ${bD.trang.cao.toFixed(0)}°`);
ok('quay nhìn được xuống sâu dưới chân trời, không bị chặn ở -20°', d.caoNhin < -20, `${d.caoNhin}°`);

console.log('\n— Chữ mô tả: "chưa mọc" khác hẳn "đã lặn" —');
const A = global.TDTD_ASTRO;
const ml = A.mocLan(dauN(0), HCM.vi, HCM.kinh, 'trang');
const mlM = A.mocLan(dauN(24), HCM.vi, HCM.kinh, 'trang');
ok('trước giờ mọc thì nói chưa mọc', /chưa mọc/.test(T._dangODau(-30, 0, ml, mlM, dauN(4))));
ok('sau giờ lặn thì nói đã lặn, không nói chưa mọc',
   (() => { const c = T._dangODau(-40, 0, ml, mlM, dauN(23)); return /đã lặn/.test(c) && !/chưa mọc/.test(c); })(),
   T._dangODau(-40, 0, ml, mlM, dauN(23)));
ok('đang trên trời thì nói độ cao và hướng', /đang ở 30° trên/.test(T._dangODau(30, 90, ml, mlM, dauN(12))));

console.log('\n— Đổi nơi thì mọi thứ phải theo nơi mới —');
/* Giờ mọc lặn được nhớ lại cho đỡ tốn (tính nó là vòng lặp 1441 bước, tám lời gọi mất 25ms mà
   dòng chữ chạy mỗi giây). Nhớ mà quên xoá khi đổi nơi thì app hiện giờ mọc của nơi cũ, và
   chẳng ai thấy sai ở đâu cả. */
T._noi(10.8231, 106.6297, 'TP.HCM');
const troiHCM = T._dangODau(-30, 0, A.mocLan(dauN(0), 10.8231, 106.6297), null, dauN(3));
T._noi(21.0278, 105.8342, 'Hà Nội');
const bHN = T._bauTroi(DEM);
T._noi(10.8231, 106.6297, 'TP.HCM');
const bHCM2 = T._bauTroi(DEM);
ok('đổi nơi thì độ cao thiên thể đổi theo', Math.abs(bHN.troi.cao - bHCM2.troi.cao) > 1,
   `Hà Nội ${bHN.troi.cao.toFixed(1)}° so với TP.HCM ${bHCM2.troi.cao.toFixed(1)}°`);
/* Kiểm đúng cái BỘ NHỚ, bằng chính đường mà app dùng. Hai nơi lệch 16 độ kinh tuyến thì giờ
   mọc phải lệch hơn một tiếng; nếu bộ nhớ không được xoá khi đổi nơi thì lần đo thứ hai sẽ trả
   về y hệt lần đầu.
   (Đừng lấy Hà Nội với TP.HCM làm mốc: gần ngày thu phân thì vĩ độ gần như không ảnh hưởng giờ
   mọc, hai nơi chỉ lệch một phút — bài kiểm sẽ mong manh mà chẳng canh được gì.) */
T._noi(10.8231, 106.6297, 'TP.HCM');
const mocA = T._mocLanNho(dauN(0)).moc;
ok('có nhớ lại giờ mọc lặn, không tính lại mỗi giây', T._coNhoMocLan() > 0);
T._noi(10.8231, 90.0, 'xa 16 độ kinh tuyến');
ok('đổi nơi thì bộ nhớ cũ bị xoá sạch', T._coNhoMocLan() === 0);
const mocB = T._mocLanNho(dauN(0)).moc;
ok('và giờ mọc tính lại theo nơi mới, không trả về của nơi cũ',
   Math.abs(mocB - mocA) > 3000000, `lệch ${Math.round(Math.abs(mocB - mocA) / 60000)} phút`);
T._noi(10.8231, 106.6297, 'TP.HCM');
ok('hỏi lại cùng một nơi cùng một ngày thì trả về đúng vật cũ, không tính lại',
   T._mocLanNho(dauN(0)) === T._mocLanNho(dauN(0)));

console.log('\n— Bẫy đơn vị: cùng tên kc, hai thang đo khác nhau —');
/* kc của Mặt Trăng tính bằng KM, còn kc của Mặt Trời và hành tinh tính bằng ĐƠN VỊ THIÊN VĂN.
   Cùng một tên trường, hai thang lệch nhau 150 triệu lần. Viết một dòng hiển thị dùng chung cho
   cả ba là ra ngay một Mặt Trăng cách Trái Đất 385 nghìn tỉ km. */
const bK = T._bauTroi(DEM);
ok('kc của Trăng nằm trong khoảng km thật (356k–407k)', bK.trang.kc > 350000 && bK.trang.kc < 410000,
   `${Math.round(bK.trang.kc)}`);
ok('kc của Mặt Trời nằm trong khoảng đơn vị thiên văn (0,98–1,02)',
   bK.troi.kc > .98 && bK.troi.kc < 1.02, `${bK.troi.kc.toFixed(4)}`);
ok('kc của hành tinh cũng là đơn vị thiên văn, không phải km',
   bK.ht.every(p => !p.kc || (p.kc > .2 && p.kc < 40)),
   bK.ht.map(p => p.ten + ' ' + (p.kc ? p.kc.toFixed(1) : '—')).join(', '));
ok('hai thang lệch nhau ít nhất một triệu lần, đủ để không bao giờ lẫn được',
   bK.trang.kc / bK.troi.kc > 1e5);

console.log('\n— Đóng màn thì buông lựa chọn ra —');
/* Không buông thì mở lại, vòng kéo hướng nhìn sẽ lôi mắt về thiên thể chọn từ lần trước, ghi
   đè hướng mà mo() vừa đặt — người dùng mở ra thấy đang chúi xuống đất mà không hiểu vì sao. */
T._nhin(180, 25, 75);
T._ve(DEM);
const mm = T._moc();
if (mm.length) T._chonTai(mm[0].x, mm[0].y);
ok('chọn được một thiên thể trước đã', T._chon() !== null, String(T._chon()));
T.dong();
ok('đóng màn thì bỏ lựa chọn', T._chon() === null);
T.mo();
T._nhin(180, 25, 75);
for (let i = 0; i < 60; i++) T._keoNhin();
const sauMo = T._debug();
ok('mở lại thì hướng nhìn đứng yên chỗ mình đặt, không bị lôi về mục tiêu cũ',
   Math.abs(sauMo.huongNhin - 180) < 2 && Math.abs(sauMo.caoNhin - 25) < 2,
   `${sauMo.huongNhin}° cao ${sauMo.caoNhin}°`);

console.log('\n— Trôi êm: cảm biến rung thì hình không rung theo, vuốt xong thì trôi rồi dừng —');
{
  const quanh = (x) => ((x % 360) + 540) % 360 - 180;
  T._nhin(100, 30);
  T._mucMay(130, 30);
  const r1 = T._troiNhin(16.7);
  ok('xoay máy 30° thì một khung hình không nhảy hết 30°', r1.huongNhin > 100 && r1.huongNhin < 110, `${r1.huongNhin.toFixed(1)}°`);
  let r = r1;
  for (let i = 0; i < 60; i++) r = T._troiNhin(16.7);   // một giây
  ok('sau một giây thì đã bám kịp hướng máy', Math.abs(quanh(r.huongNhin - 130)) < .5, `${r.huongNhin.toFixed(2)}°`);

  /* Cảm biến rung ±2° mỗi lần đọc: màn hình phải êm hơn hẳn thế. */
  T._nhin(130, 30);
  let lon = 0;
  for (let i = 0; i < 120; i++) {
    T._mucMay(130 + (i % 2 ? 2 : -2), 30);
    const x = T._troiNhin(16.7).huongNhin;
    if (i > 20) lon = Math.max(lon, Math.abs(quanh(x - 130)));
  }
  ok('cảm biến rung ±2° thì màn hình chỉ rung dưới 0,5°', lon < .5, `rung ${lon.toFixed(2)}°`);

  /* Qua mốc 0°/360° phải đi đường ngắn, không quay ngược cả vòng. */
  T._nhin(355, 30); T._mucMay(5, 30);
  const qua = T._troiNhin(16.7).huongNhin;
  ok('từ 355° sang 5° đi đường ngắn qua 0°, không quay ngược 350°', qua > 355 || qua < 5, `${qua.toFixed(1)}°`);
  T.dong(); T.mo();                                    // tắt xoay theo máy

  T._nhin(100, 30);
  T._quanTinh(.06, 0);                                 // vuốt nhanh 60° mỗi giây rồi nhấc ngón
  let q = null, buoc = 0;
  do { q = T._troiNhin(16.7); buoc++; } while (q.quanTinh && buoc < 600);
  const di = quanh(q.huongNhin - 100);
  ok('nhấc ngón thì bầu trời trôi thêm một đoạn', di > 10 && di < 30, `${di.toFixed(1)}°`);
  ok('rồi tự dừng, không trôi mãi', !q.quanTinh && buoc < 300, `${buoc} khung`);
  T._quanTinh(null);
}

console.log('\n— Xoay theo máy: cổ tay xoay thì bầu trời phải đi theo —');
/* Người dùng báo "nhìn mặt trời lag". Không phải lag: đo được một khung vẽ chỉ tốn 0,18ms kể
   cả khi ngắm thẳng mặt trời. Lỗi là bộ bắt cảm biến lấy alpha làm hướng, beta làm độ cao và
   BỎ HẲN gamma — nên xoay cổ tay bao nhiêu bầu trời cũng đứng yên, bị ghim sai chỗ, người ta
   rà mãi không khớp vào mặt trời. Máy bàn không bật được cảm biến nên chỗ này chỉ kiểm được
   bằng Node, và đó chính là lý do nó sống lâu vậy. */
const bien = (al, be, ga) => T._camBien({ alpha: al, beta: be, gamma: ga });
const lechH = (a, b) => { let d = Math.abs(a - b); return d > 180 ? 360 - d : d; };
const thang = bien(30, 151, 0);
ok('bắt được sự kiện cảm biến', !!thang && typeof thang.h === 'number', JSON.stringify(thang));
const nghieng = bien(30, 151, 30);
ok('xoay cổ tay 30° thì hướng ngắm đổi theo, không đứng yên',
   lechH(thang.h, nghieng.h) > 10, `lệch ${lechH(thang.h, nghieng.h).toFixed(0)}°`);
ok('cầm thẳng không nghiêng thì hướng khớp với la bàn như cũ',
   lechH(bien(0, 120, 0).h, 0) < 1, `${bien(0, 120, 0).h.toFixed(1)}°`);
ok('ngửa lên bao nhiêu thì độ cao ra bấy nhiêu',
   Math.abs(bien(0, 140, 0).c - 50) < 1, `${bien(0, 140, 0).c.toFixed(1)}°`);
ok('chúc xuống dưới chân trời cũng theo được, không bị chặn ở -20°',
   bien(0, 40, 0).c < -20, `${bien(0, 40, 0).c.toFixed(1)}°`);
ok('iOS có la bàn thật thì dùng la bàn, không dùng alpha',
   (() => { const v = T._camBien({ alpha: 200, beta: 120, gamma: 0, webkitCompassHeading: 90 });
            return lechH(v.h, 90) < 1; })());
ok('thiếu hẳn dữ liệu thì bỏ qua, không nổ lỗi và không ghi bừa',
   (() => { const truoc = bien(10, 120, 0); const sau = T._camBien({ alpha: null, beta: null, gamma: null });
            return sau && Math.abs(sau.h - truoc.h) < .01; })());

console.log('\n— Chiều sâu: sao thật, Ngân Hà, Mặt Trăng hình cầu, chụm để phóng to —');
{
  T._noi(10.8231, 106.6297, 'TP.HCM');
  const S = T._sao(DEM);
  ok('nạp đủ 5.080 sao thật', S && S.n === 5080);
  let dai = 0;
  for (let i = 0; i < S.n; i++) dai = Math.max(dai, Math.abs(Math.hypot(S.x[i], S.y[i], S.z[i]) - 1));
  ok('vector chân trời của mọi sao dài đúng 1', dai < 1e-5, dai.toExponential(1));
  /* Sao Bắc Cực: độ cao luôn xấp xỉ vĩ độ chỗ đứng (TP.HCM 10,8°), xê dịch theo vòng nhỏ 0,66° quanh cực */
  let bc = -1;
  for (let i = 0; i < S.n; i++) if (S.dec[i] > 89) bc = i;
  const caoBC = Math.asin(S.z[bc]) * 180 / Math.PI;
  ok('Sao Bắc Cực đứng ở độ cao bằng vĩ độ TP.HCM, sai dưới 0,8°', bc >= 0 && Math.abs(caoBC - 10.82) < 0.8, `${caoBC.toFixed(2)}°`);
  ok('đã tính tuế sai: Sao Bắc Cực năm 2026 nằm sát cực hơn năm 2000 (89,26°)', S.dec[bc] > 89.3, `${S.dec[bc].toFixed(3)}°`);
  const N = T._nganHa(DEM), tam = T._vecto(0, 0);
  const thu = (ra, dec) => ({ x: Math.cos(dec * Math.PI / 180) * Math.cos(ra * Math.PI / 180), y: Math.cos(dec * Math.PI / 180) * Math.sin(ra * Math.PI / 180), z: Math.sin(dec * Math.PI / 180) });
  const tamTH = thu(266.405, -28.936), doiTH = thu(86.405, 28.936);
  let gan = 0, xa = 0, trongDai = 0;
  for (let i = 0; i < N.n; i++) {
    const v = thu(N.ra[i], N.dec[i]);
    const cTam = v.x * tamTH.x + v.y * tamTH.y + v.z * tamTH.z, cDoi = v.x * doiTH.x + v.y * doiTH.y + v.z * doiTH.z;
    if (cTam > Math.cos(40 * Math.PI / 180)) gan++;
    if (cDoi > Math.cos(40 * Math.PI / 180)) xa++;
  }
  ok('Ngân Hà dày về phía tâm thiên hà (Nhân Mã) hơn hẳn phía đối tâm', gan > 2.5 * xa, `${gan} so với ${xa} đám`);
  void tam; void trongDai;

  const bToi = { trang: { cao: -10, sang: 0 } }, bTrangTron = { trang: { cao: 60, sang: 1 } };
  T._datGoc(75);
  const dem = T._nguong(0, bToi).lim, ngay = T._nguong(1, bToi).lim, trang = T._nguong(0, bTrangTron).lim;
  T._datGoc(30); const phong = T._nguong(0, bToi).lim; T._datGoc(75);
  ok('đêm tối không trăng thấy tới cấp 5; phóng to thấy thêm sao mờ, tối đa cấp 6', Math.abs(dem - 5) < 1e-9 && phong > 5.5 && phong <= 6, `${dem} / ${phong.toFixed(2)}`);
  ok('trăng tròn trên cao mất chừng 1,3 cấp; ban ngày không còn sao nào', Math.abs(dem - trang - 1.3) < 1e-9 && ngay < -1.5);

  ok('chụm hai ngón: ngón dang gấp đôi thì góc nhìn hẹp lại một nửa', Math.abs(T._chum(100, 200) - 37.5) < 1e-9);
  T._datGoc(75);
  ok('góc nhìn không hẹp quá 12° (cỡ ống nhòm), không rộng quá 110°', T._datGoc(3) === 12 && T._datGoc(500) === 110);
  T._datGoc(75);

  /* Hướng trên màn: đứng nhìn về Nam ở độ cao 30°, điểm cao hơn cùng phương vị phải ở phía "lên",
     điểm lệch về phía Đông (bên trái khi nhìn về Nam) phải ở bên trái. */
  T._nhin(180, 30, 75);
  const v = T._vecto(30, 180);
  const len = T._gocTrenMan(v, T._vecto(40, 180)) * 180 / Math.PI, trai = T._gocTrenMan(v, T._vecto(30, 179.5)) * 180 / Math.PI;
  ok('xoay kết cấu Mặt Trăng: tính đúng hướng "lên" và hướng "trái" trên màn', Math.abs(len) < 1 && Math.abs(trai + 90) < 2,
     `lên ${len.toFixed(1)}°, phía Đông ${trai.toFixed(1)}°`);
  const BIEN = T._bien;
  ok('30 vùng tròn ghép thành các biển trên Mặt Trăng, tất cả ở mặt quay về Trái Đất', BIEN.length === 30 && BIEN.every(m => m.z > 0));
  ok('Biển Nguy hiểm (Mare Crisium, kinh độ 59° Đông) nằm bên phải khi Bắc lên trên, Biển Mưa (Imbrium) ở trên trái',
     BIEN[3].x > .7 && BIEN[0].x < 0 && BIEN[0].y > .5);
  let thap = 9, cao = 0;
  for (let h = 0; h < 360; h += .5) { thap = Math.min(thap, T._vien(h)); cao = Math.max(cao, T._vien(h)); }
  ok('viền cây đồi thấp: 0,1°–2,8°, che rất ít trời', thap >= .1 && cao <= 2.8, `${thap.toFixed(2)}°–${cao.toFixed(2)}°`);
  let loi = null;
  try { T._nhin(200, 35, 75); T._ve(DEM); T._datGoc(14); T._ve(DEM); T._nhin(0, 88, 75); T._ve(DEM); T._datGoc(75); T._ve(NGAY); } catch (e) { loi = e.message; }
  ok('vẽ đủ các tư thế (đêm, ngày, phóng to, nhìn thẳng lên đỉnh đầu) không nổ lỗi', loi === null, loi || '');
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
