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
for (const t of ['astro.js', 'constellation.js', 'nightsky.js'])
  new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', t), 'utf8'))();
const T = global.TDTD_TROIDEM;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

T.mo();
const HCM = T._noi(10.8231, 106.6297, 'TP.HCM');
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

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
