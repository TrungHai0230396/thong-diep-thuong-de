/* Kiểm thử bầu trời đêm: node scripts/test-troidem.js

   Bầu trời vốn chỉ có bài kiểm phần TÍNH (scripts/test-astro.js), không có bài nào chạm tới
   phần NHÌN và phần CHẠM. Đúng chỗ đó đẻ ra hai lỗi người dùng bắt được:
   - Trăng đã lặn mà dòng chữ bảo "chưa lên khỏi chân trời";
   - bấm vào Mặt Trăng, Mặt Trời thì không có gì xảy ra, vì app chưa hề có chức năng chạm chọn.
   Nên tệp này dựng một bộ DOM và canvas giả vừa đủ để chạy thật vòng vẽ, rồi soi vào đó. */
/* Mọi mốc giờ trong tệp tính theo giờ Việt Nam: chạy trên máy đặt múi giờ khác thì bài vẫn phải ra như nhau. */
process.env.TZ = 'Asia/Ho_Chi_Minh';
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
for (const t of ['astro.js', 'constellation.js', 'saosang.js', 'nightsky.js', 'datlien.js', 'vutru.js'])
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
/* Chạm vào một thiên thể ĐANG NẰM TRONG MÀN. Bản trước lấy bừa cái đầu danh sách — Sao Thổ, mà nó ở (−13, −21),
   ngoài mép, chạm không trúng; bài này chỉ đỗ nhờ hành tinh còn lệch 0,37° (chưa tính tuế sai) nên lọt vào màn. */
const bM = T._bauTroi(DEM);
T._nhin(bM.trang.huong, Math.max(-80, Math.min(80, bM.trang.cao)), 75);
T._ve(DEM);
const mm = T._moc().filter(m => m.x > 0 && m.y > 0 && m.x < 380 && m.y < 720);     // màn giả 380×720
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

console.log('\n— Xoay theo máy hết trễ: mô phỏng bàn tay thật —');
{
  /* Người dùng: "xoay theo máy bị lag, không mượt". Đo một khung vẽ chỉ 0,3–1,1 ms (cả lúc nửa đêm đầy sao) — không
     phải do vẽ. Là do bộ làm mượt trễ cố định 100 ms. Mô phỏng: 60 lần đọc cảm biến mỗi giây, tay rung ngẫu nhiên
     (cùng một chuỗi cho cả hai cách lọc), đứng yên 1 giây, xoay ngang 90°/giây trong 1 giây, rồi dừng. */
  let hat = 7;
  const ngau = () => { hat = (hat * 1103515245 + 12345) % 2147483648; return hat / 2147483648; };
  const gauss = () => Math.sqrt(-2 * Math.log(ngau() + 1e-12)) * Math.cos(2 * Math.PI * ngau());
  const N = 180, dt = 1000 / 60, that = [], doc = [];
  for (let i = 0; i < N; i++) {
    const t = i / 60, h = 100 + (t < 1 ? 0 : t < 2 ? (t - 1) * 90 : 90);
    that.push(h); doc.push({ h: h + gauss() * .35, c: 25 + gauss() * .35 });
  }
  const quanh = (x) => ((x % 360) + 540) % 360 - 180;
  const vec = (h, c) => A.vecHuong(h, c);
  const lechGoc = (h1, c1, h2, c2) => { const a = vec(h1, c1), b = vec(h2, c2); return Math.acos(Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)) * 180 / Math.PI; };
  const doDac = (ra) => {
    let rung = 0; for (let i = 13; i < 60; i++) rung += lechGoc(ra[i].h, ra[i].c, ra[i - 1].h, ra[i - 1].c) ** 2;
    let tre = 0; for (let i = 90; i < 120; i++) tre += Math.abs(quanh(that[i] - ra[i].h));
    return { rung: Math.sqrt(rung / 47), tre: tre / 30, sauDung: Math.abs(quanh(190 - ra[137].h)) };
  };
  /* cách cũ: trôi về hướng cảm biến với hằng số 100 ms */
  const cu = []; let h = 100, c = 25;
  for (let i = 0; i < N; i++) {
    const k = 1 - Math.exp(-dt / 100), a = vec(h, c), b = vec(doc[i].h, doc[i].c);
    const g = A.gocHuong({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
    h = g.huong; c = g.cao; cu.push({ h, c });
  }
  /* cách mới: chạy đúng bộ lọc trong app */
  T._nhin(100, 25); T._datLaiLoc();
  const moi = [];
  for (let i = 0; i < N; i++) { T._mucMay(doc[i].h, doc[i].c); const r = T._troiNhin(dt); moi.push({ h: r.huongNhin, c: r.caoNhin }); }
  const C = doDac(cu), M = doDac(moi);
  ok('đang xoay 90°/giây: bầu trời chậm sau tay ít hơn 3 lần so với trước', M.tre * 3 <= C.tre, `trước chậm ${C.tre.toFixed(1)}°, giờ ${M.tre.toFixed(1)}°`);
  ok('đứng yên: rung không hơn trước', M.rung <= C.rung * 1.1, `trước ${C.rung.toFixed(3)}°/khung, giờ ${M.rung.toFixed(3)}°/khung`);
  ok('dừng tay 0,3 giây: đã về sát hướng tay, không trôi lửng lơ', M.sauDung < C.sauDung && M.sauDung < 1, `trước còn lệch ${C.sauDung.toFixed(2)}°, giờ ${M.sauDung.toFixed(2)}°`);
  T.dong(); T.mo();
}
{
  /* iPhone: chuyển động lấy từ con quay (alpha, mốc tuỳ ý — ở đây lệch 123°), la bàn chỉ để chỉnh hướng Bắc. */
  const lechH = (a, b) => { let d = Math.abs(a - b); return d > 180 ? 360 - d : d; };
  T._datLaiLoc();
  const ev = (alpha, heading, beta = 60, acc = 10) => T._camBien({ alpha, beta, gamma: 0, webkitCompassHeading: heading, webkitCompassAccuracy: acc });
  const dau = ev(123, 40);
  ok('iPhone: hướng Bắc lấy từ la bàn dù alpha của con quay tính từ mốc tuỳ ý', lechH(dau.h, 40) < 1, `${dau.h.toFixed(1)}°`);
  /* xoay máy 20° sang phải: con quay báo ngay (alpha giảm 20), la bàn iOS chậm, còn đứng ở 40° */
  const sau = ev(103, 40);
  ok('iPhone: xoay máy là bầu trời đi theo con quay ngay, không chờ la bàn chậm', lechH(sau.h, 60) < 1.5, `${sau.h.toFixed(1)}° (đúng 60°)`);
  let r = sau; for (let i = 0; i < 400; i++) r = ev(103, 60);
  ok('la bàn bắt kịp rồi thì vẫn khớp, không lệch dần', lechH(r.h, 60) < .5, `${r.h.toFixed(1)}°`);
  const vongQuay = ev(103, 200, 60, 90);
  ok('la bàn báo độ chính xác kém (90°) thì không kéo hướng theo', lechH(vongQuay.h, 60) < .5, `${vongQuay.h.toFixed(1)}°`);
  T._datLaiLoc();
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

console.log('\n— Nhìn từ vũ trụ: Trái Đất, Mặt Trăng, Hệ Mặt Trời —');
{
  const V = global.TDTD_VUTRU, A = global.TDTD_ASTRO;
  ok('có cảnh vũ trụ', !!V && typeof V.ve === 'function');
  const DIEM = [['Hà Nội', 21.03, 105.85, 1], ['TP.HCM', 10.82, 106.63, 1], ['giữa Biển Đông', 14, 114, 0], ['giữa Thái Bình Dương', 0, -150, 0],
                ['Sahara', 23, 13, 1], ['Nam Cực', -85, 0, 1], ['giữa Đại Tây Dương', 30, -40, 0], ['Mũi Cà Mau (đất liền)', 9.0, 105.0, 1]];
  const sai = DIEM.filter(([, vi, kinh, la]) => Math.round(V._laDat(vi, kinh)) !== la).map(d => d[0]);
  ok('bản đồ lục địa: đất ra đất, biển ra biển ở 8 điểm đã biết', !sai.length, sai.join(', '));

  const noi = { ten: 'TP.HCM', vi: 10.8231, kinh: 106.6297 };
  let lech = 0, lechTrang = 0;
  for (let h = 0; h < 48; h++) {
    const luc = DEM + h * 36e5, JD = A.ngayJulius(luc), c = V._canhTD(JD, noi);
    const t = A.matTroi(JD), cao = A.docCao(t.ra, t.dec, noi.vi, noi.kinh, JD).cao;
    lech = Math.max(lech, Math.abs((c.u.x * c.s.x + c.u.y * c.s.y + c.u.z * c.s.z) - Math.sin(cao * Math.PI / 180)));
    const cosI = -(c.vM.x * c.s.x + c.vM.y * c.s.y + c.vM.z * c.s.z);
    lechTrang = Math.max(lechTrang, Math.abs((1 + cosI) / 2 - c.sang));
  }
  ok('chấm "chỗ bạn đứng" quay theo Trái Đất đúng giờ: nửa ngày, nửa đêm khớp độ cao Mặt Trời ngoài trời (48 giờ liền)', lech < .01, lech.toExponential(1));
  ok('phần Mặt Trăng được chiếu sáng trên quả cầu khớp phần đĩa sáng của trăng ngoài trời', lechTrang < .02, lechTrang.toFixed(3));

  /* Mặt Trăng ở cảnh vũ trụ dùng cùng bản đồ biển, và quay đúng mặt gần về Trái Đất: chiếu như trăng tròn,
     điểm Biển Nguy hiểm phải tối hơn cao nguyên phía Nam */
  const c = V._canhTD(A.ngayJulius(DEM), noi), vM = c.vM;
  const CUC = { x: 0, y: -Math.sin(23.4393 * Math.PI / 180), z: Math.cos(23.4393 * Math.PI / 180) };
  const zl = { x: -vM.x, y: -vM.y, z: -vM.z }, d0 = CUC.x * zl.x + CUC.y * zl.y + CUC.z * zl.z;
  let yl = { x: CUC.x - d0 * zl.x, y: CUC.y - d0 * zl.y, z: CUC.z - d0 * zl.z };
  const ly = Math.hypot(yl.x, yl.y, yl.z); yl = { x: yl.x / ly, y: yl.y / ly, z: yl.z / ly };
  const xl = { x: vM.y * yl.z - vM.z * yl.y, y: vM.z * yl.x - vM.x * yl.z, z: vM.x * yl.y - vM.y * yl.x };
  const diem = (vi, kinh) => { const r = Math.PI / 180, X = Math.cos(vi * r) * Math.sin(kinh * r), Y = Math.sin(vi * r), Z = Math.cos(vi * r) * Math.cos(kinh * r);
    return { x: X * xl.x + Y * yl.x + Z * zl.x, y: X * xl.y + Y * yl.y + Z * zl.y, z: X * xl.z + Y * yl.z + Z * zl.z }; };
  const tron = { ...c, s: zl };
  const bien = V._mauTrang(diem(16.18, 59.1), tron)[0], caoNguyen = V._mauTrang(diem(-50, 10), tron)[0];
  ok('Mặt Trăng quay mặt gần về Trái Đất: Biển Nguy hiểm tối hơn cao nguyên phía Nam', bien < caoNguyen * .8, `${Math.round(bien)} so với ${Math.round(caoNguyen)}`);

  const hm = V._homMai(A.ngayJulius(DEM));
  ok('Sao Kim không xa Mặt Trời quá 48°, Sao Thuỷ không quá 28° — nên chỉ thấy lúc chiều tối hoặc rạng sáng',
     Math.abs(hm[0].lech) <= 48 && Math.abs(hm[1].lech) <= 28, hm.map(h => `${h.ten} ${h.lech.toFixed(1)}°`).join(', '));

  const k = V._datMay({ x: 1, y: 2, z: 3 }, { yaw: 30, pitch: 20, xa: 9 }, 380, 720), p = V._chieu({ x: 1, y: 2, z: 3 });
  ok('máy quay nhìn đúng vào đích: đích nằm giữa màn', p && Math.abs(p.x - 190) < 1e-6 && Math.abs(p.y - 360) < 1e-6);
  void k;
  ok('nút tua: giờ thật → 1 giờ mỗi giây → 1 ngày mỗi giây → giờ thật', [V.doiTua(), V.doiTua(), V.doiTua()].join(' · ') === '1 giờ mỗi giây · 1 ngày mỗi giây · Giờ thật');
  const cv = { measureText: () => ({ width: 40 }) };
  const ctxGia = new Proxy(cv, { get: (o, k2) => k2 in o ? o[k2] : (k2 === 'createRadialGradient' || k2 === 'createLinearGradient') ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
  let loi = null;
  try {
    V.vao(); V.ve(ctxGia, 380, 720, 2, DEM, noi);
    V.doiCanh(); V.ve(ctxGia, 380, 720, 2, DEM, noi);
    V.doiCanh(); V.ve(ctxGia, 380, 720, 2, DEM, noi);
    /* Về lại cảnh Trái Đất rồi mới kéo, phóng. Bản trước gọi doiCanh hai lần, tưởng là về chỗ cũ — đúng khi còn
       hai cảnh; từ khi có cảnh thứ ba thì nó dừng ở So kích thước, và hai bài dưới không còn kiểm gì. */
    while (V.canh() !== 'traiDat') V.doiCanh();
    V.batDauKeo(100, 100); V.keo(200, 50); V.thaKeo(); V.phong(.5); V.phong(100);
  } catch (e) { loi = e.message; }
  ok('vẽ cả ba cảnh, kéo xoay, phóng to thu nhỏ không nổ lỗi', loi === null, loi || '');
  const cam = V._cam();
  ok('phóng to thu nhỏ có giới hạn: không chui vào trong Trái Đất, không bay quá xa', cam.traiDat.xa >= 2.4 && cam.traiDat.xa <= 30
     && cam.traiDat.xa !== 9, `${cam.traiDat.xa}`);
  ok('ngước quá đầu không lộn ngược: góc ngẩng kẹp trong ±85°', Math.abs(cam.traiDat.pitch) <= 85);
  T._vuTru(true);
  ok('bật cảnh vũ trụ từ bầu trời, rồi đóng màn thì về lại bầu trời', T._vuTru() === true && (T.dong(), T._vuTru() === false));
  T.mo();
}

console.log('\n— Dưới chân trời, và Mặt Trời trong cảnh vũ trụ —');
{
  /* Người dùng hỏi "không cho thấy sao hoặc trăng ở dưới đường chân trời hả": mặt đất đục che mất, và cúi
     xuống thì đất chỉ còn một dải mỏng (đa giác chân trời gãy đôi ở hướng Bắc). */
  T._noi(10.8231, 106.6297, 'TP.HCM');
  T._nhin(0, 0, 75);
  ok('nhìn ngang: đường chân trời ở đúng giữa màn', Math.abs(T._yChanTroi() - 360) < 1e-6);
  T._nhin(0, -30, 75);
  ok('cúi xuống: đường chân trời lên trên, đất phủ từ đó xuống hết đáy', T._yChanTroi() < 360);
  T._nhin(0, -70, 75);
  ok('cúi hẳn xuống: đường chân trời ra khỏi mép trên, đất phủ kín cả màn', T._yChanTroi() < 0);
  /* Nhìn về đúng hướng Mặt Trăng đang ở dưới đất: phải vẽ và chạm được nó */
  let luc = DEM, bb = T._bauTroi(luc);
  for (let h = 0; h < 30 && bb.trang.cao > -10; h++) { luc += 36e5; bb = T._bauTroi(luc); }
  T._nhin(bb.trang.huong, Math.max(-80, bb.trang.cao), 75);
  T._ve(luc);
  ok('Mặt Trăng ở dưới chân trời vẫn vẽ ra và chạm được, ghi "dưới chân trời"', T._moc().some(m => m.ten === 'Mặt Trăng' && m.loai === 'bong'),
     `trăng ở ${bb.trang.cao.toFixed(0)}°`);
  T._nhin(180, 25, 75);

  const V = global.TDTD_VUTRU, A = global.TDTD_ASTRO, noi = { ten: 'TP.HCM', vi: 10.8231, kinh: 106.6297 };
  const cv = { measureText: () => ({ width: 40 }) };
  const ctxGia = new Proxy(cv, { get: (o, k2) => k2 in o ? o[k2] : (k2 === 'createRadialGradient' || k2 === 'createLinearGradient') ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
  if (V.canh() !== 'traiDat') V.doiCanh();
  V.vao();
  let t = DEM;
  V.ve(ctxGia, 380, 720, 2, t, noi);
  ok('chạm mũi tên Mặt Trời thì máy quay bắt đầu xoay về phía nó', V._quayVeMatTroi() === true && V._quay() !== null);
  for (let i = 0; i < 400 && V._quay(); i++) { t += 16; V.ve(ctxGia, 380, 720, 2, t, noi); }
  const s = V._canhTD(A.ngayJulius(t), noi).s, p = V._chieuHuong(s);
  ok('xoay xong: Mặt Trời nằm trong khung, Trái Đất vẫn ở giữa', V._quay() === null && p && p.x > 0 && p.x < 380 && p.y > 0 && p.y < 720,
     p ? `Mặt Trời ở (${p.x.toFixed(0)}, ${p.y.toFixed(0)})` : 'không thấy');
  /* Vành Sao Thổ: trục quay (IAU, J2000) nghiêng so với pháp tuyến quỹ đạo đúng 26,73° */
  const Tr = V._trucTho, R = Math.PI / 180, I = 2.48599187 * R, O = 113.66242448 * R;
  const n = { x: Math.sin(I) * Math.sin(O), y: -Math.sin(I) * Math.cos(O), z: Math.cos(I) };
  const nghieng = Math.acos(Tr.x * n.x + Tr.y * n.y + Tr.z * n.z) / R;
  ok('vành Sao Thổ nằm trong mặt phẳng xích đạo thật: trục nghiêng 26,73° so với quỹ đạo', Math.abs(nghieng - 26.73) < .05, `${nghieng.toFixed(2)}°`);
}

console.log('\n— To nhỏ: đúng tỉ lệ ở đâu, nén ở đâu, và nói rõ —');
{
  const V = global.TDTD_VUTRU;
  /* Đường kính NASA (Planetary Fact Sheet, Sun Fact Sheet), chép lại để đối chiếu */
  /* Đường kính: NASA Planetary Fact Sheet, Sun Fact Sheet, Pluto Fact Sheet; Ceres, Ganymede, Titan theo bán kính
     trung bình của JPL (469,7; 2631,2; 2574,7 km) */
  const NASA = { troi: 1391400, moc: 142984, tho: 120536, thien: 51118, hai: 49528, dat: 12756, kim: 12104, hoa: 6792,
                 gany: 5262, titan: 5149, thuy: 4879, trang: 3475, diem: 2376, ceres: 939 };
  /* khối chữ + hàng nút ở đáy đo trên Chromium 375×812 là 214px — đưa đúng số đó vào, khỏi đo theo số đoán 290 */
  { const cvG = { measureText: () => ({ width: 40 }) }, ctxG = new Proxy(cvG, { get: (o, k2) => k2 in o ? o[k2] : (k2 === 'createRadialGradient' || k2 === 'createLinearGradient') ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
    V.ve(ctxG, 375, 812, 2, DEM, { ten: 'TP.HCM', vi: 10.8231, kinh: 106.6297 }, 214); }
  V._cam().kichThuoc.w = 0;                                   // tính cỡ lại từ đầu cho 375×812
  const ds = V._boKichThuoc(375, 812), dat = ds.find(b => b.ma === 'dat');
  const sai = ds.filter(b => Math.abs(b.r / dat.r - NASA[b.ma] / NASA.dat) > 1e-9).map(b => b.ten);
  ok('cảnh So kích thước: đủ 14 vật thể (Mặt Trời, 8 hành tinh, 2 hành tinh lùn, 3 mặt trăng), bán kính đúng tỉ lệ đường kính thật',
     ds.length === 14 && Object.keys(NASA).every(m => ds.some(b => b.ma === m)) && !sai.length, sai.join(', ') || `${ds.length} vật thể`);
  const yCua = (m) => ds.find(b => b.ma === m).y;
  ok('Thiên Vương, Hải Vương đứng giữa Sao Thổ và Trái Đất (to thứ ba, thứ tư)',
     yCua('tho') < yCua('thien') && yCua('thien') === yCua('hai') && yCua('hai') < yCua('dat'));
  const thuTu = ['dat', 'kim', 'hoa', 'gany', 'titan', 'thuy', 'trang', 'diem', 'ceres'];
  ok('hàng vật thể nhỏ xếp từ to tới nhỏ: Trái Đất … Ceres', thuTu.every((m, i) => !i || NASA[m] < NASA[thuTu[i - 1]])
     && thuTu.every((m, i) => !i || yCua(m) >= yCua(thuTu[i - 1])));
  ok('màn 375×812: cả khối vừa khoảng trống trên khối chữ ở đáy (không phải kéo mới thấy Ceres)',
     yCua('ceres') + 56 <= 812 - 214, `đáy ở ${Math.round(yCua('ceres') + 56)}`);
  ok('không quả cầu nào tràn ra ngoài bề ngang', ds.filter(b => b.ma !== 'troi').every(b => b.x - b.r * (b.ma === 'tho' ? 2.27 : 1) > 0
     && b.x + b.r * (b.ma === 'tho' ? 2.27 : 1) < 375));
  ok('Mặt Trời rộng gấp 109 lần Trái Đất, Sao Mộc 11,2 lần, Mặt Trăng 0,27 lần',
     Math.abs(V._soTD('troi') - 109.08) < .05 && Math.abs(V._soTD('moc') - 11.21) < .01 && Math.abs(V._soTD('trang') - .2724) < .001);
  const moc = ds.find(b => b.ma === 'moc'), tho = ds.find(b => b.ma === 'tho'), troi = ds.find(b => b.ma === 'troi');
  ok('xếp dọc không chồng nhau: cung Mặt Trời, rồi Sao Mộc, Sao Thổ, rồi hàng hành tinh nhỏ',
     troi.y + troi.r < moc.y - moc.r && moc.y + moc.r < tho.y - tho.r && tho.y + tho.r < dat.y);
  ok('mặc định Sao Mộc và cả vành Sao Thổ (2,27 lần bán kính) nằm gọn trong bề ngang màn',
     2 * moc.r < 375 && 2 * tho.r * 2.27 < 375);
  const co = ['troi', 'moc', 'tho', 'thien', 'hai', 'dat', 'kim', 'hoa', 'thuy'].map(V._coNen);
  ok('cảnh Hệ Mặt Trời: cỡ nén theo căn bậc ba nhưng thứ tự to nhỏ đúng (Mặt Trời > Mộc > Thổ > Thiên Vương > Hải Vương > Đất > Kim > Hoả > Thuỷ)',
     co.every((c, i) => i === 0 || c < co[i - 1]), co.map(c => c.toFixed(1)).join(' > '));
  ok('Sao Mộc vẽ to hơn Trái Đất hẳn (bản đầu: chỉ 1,6 lần)', V._coNen('moc') / V._coNen('dat') > 2);

  /* Bầu trời: Mặt Trăng vẽ to hơn thật thì thẻ phải nói rõ gấp mấy lần */
  T._noi(10.8231, 106.6297, 'TP.HCM');
  let luc = DEM, bb = T._bauTroi(luc);
  for (let h = 0; h < 30 && bb.trang.cao < 15; h++) { luc += 36e5; bb = T._bauTroi(luc); }
  T._nhin(bb.trang.huong, bb.trang.cao, 75); T._datGoc(75);
  T._ve(luc);
  const mT = T._moc().find(m => m.ten === 'Mặt Trăng' && m.loai === 'trang');
  const tam = than.children.find(c => c.className === 'troidem');
  if (mT) T._chonTai(mT.x, mT.y);
  const html = T._the(luc) || '';
  void tam;
  const lan = +(html.match(/to gấp (\d+) lần thật/) || [])[1];
  ok('thẻ Mặt Trăng nói rõ "vẽ to gấp N lần thật", N khoảng 15 ở góc nhìn thường', !!mT && lan > 8 && lan < 25, lan ? `gấp ${lan} lần` : html.slice(0, 80));
  T._datGoc(12);
  const lan2 = +((T._the(luc) || '').match(/to gấp (\d+) lần thật/) || [])[1];
  ok('phóng to thì trăng gần cỡ thật hơn, con số nhỏ lại', lan2 > 0 && lan2 < lan, `gấp ${lan2} lần`);
  T._datGoc(75);
}

console.log('\n— "Sáng rồi Trăng không chịu lặn", "khuya mà Trăng không mọc" —');
{
  /* Người dùng ngờ app tính sai. Giờ mọc lặn khớp JPL Horizons (xem test-astro.js); cái thiếu là
     lời: Trăng mọc tối nay lặn sáng mai thì không ghi giờ lặn, và không ai nói vì sao Trăng có
     tuần ở trên trời buổi sáng, có tuần khuya không thấy. */
  const A = global.TDTD_ASTRO;
  const ngay = (s) => Date.parse(`${s}T00:00:00+07:00`);
  const mlT = (s) => A.mocLan(ngay(s), 10.8231, 106.6297, 'trang');
  const luc22 = Date.parse('2026-10-01T22:00:00+07:00');
  const caoTr = (ms) => { const JD = A.ngayJulius(ms), m = A.matTrang(JD); return A.docCao(m.ra, m.dec, 10.8231, 106.6297, JD); };
  const p22 = caoTr(luc22);
  const c22 = T._dangODau(p22.cao, p22.huong, mlT('2026-10-01'), mlT('2026-10-02'), luc22, A.NGUONG.trang);
  ok('22:00 ngày 1/10: ghi giờ lặn sáng mai', /lặn lúc 10:4\d|lặn lúc 10:5\d/.test(c22) && /sáng mai/.test(c22), c22);
  const luc20 = Date.parse('2026-10-12T20:00:00+07:00'), p20 = caoTr(luc20);
  const c20 = T._dangODau(p20.cao, p20.huong, mlT('2026-10-12'), mlT('2026-10-13'), luc20, A.NGUONG.trang);
  ok('20:00 ngày 12/10: đã lặn, mai mọc lúc mấy giờ, buổi nào', /đã lặn lúc 18:\d\d/.test(c20) && /mai mọc lúc 07:\d\d sáng/.test(c20), c20);
  ok('vừa ló khỏi chân trời thì nói "sát chân trời", không ghi độ cao âm',
     /sát chân trời phía đông/.test(T._dangODau(-0.3, 90, { moc: luc20 - 6e4, lan: luc20 + 6 * 36e5 }, null, luc20, -0.833)));
  ok('cao hẳn thì vẫn ghi số độ', /đang ở 30° trên/.test(T._dangODau(30, 90, { moc: luc20 - 36e5, lan: luc20 + 36e5 }, null, luc20)));

  /* Mỗi câu giải thích của từng pha phải ĐÚNG trên bầu trời tính được: chạy cả năm 2026 ở TP.HCM và
     Hà Nội, ngày nào Trăng đang ở pha đó thì kiểm đúng điều câu ấy nói. */
  const tenPha = (t) => t < 1.5 || t > 28 ? 'non' : t < 6.5 ? 'dau' : t < 8.5 ? 'thuong' : t < 13.5 ? 'khuyetDau'
    : t < 16.5 ? 'tron' : t < 21.5 ? 'khuyetCuoi' : t < 23.5 ? 'ha' : 'cuoi';
  const MAU = { non: 0.5, dau: 4, thuong: 7.4, khuyetDau: 11, tron: 15, khuyetCuoi: 19, ha: 22.5, cuoi: 26 };
  const KIEM = {
    non:        [[/cả đêm không có trăng/, (d) => d + 24 * 36e5, false]],
    dau:        [[/đầu hôm ở phía tây/, (d, r, l) => l + 20 * 6e4, true, 'tay'], [/khuya là đã lặn/, (d) => d + 24.5 * 36e5, false]],
    thuong:     [[/nửa đầu đêm/, (d) => d + 20 * 36e5, true], [/khuya thì không/, (d) => d + 27 * 36e5, false]],
    khuyetDau:  [[/gần hết đêm/, (d) => d + 22 * 36e5, true]],
    tron:       [[/suốt đêm/, (d) => d + 24 * 36e5, true]],
    khuyetCuoi: [[/sáng ra vẫn còn trăng ở phía tây/, (d, r) => r + 30 * 6e4, true, 'tay']],
    ha:         [[/cả buổi sáng vẫn thấy trăng/, (d) => d + 8 * 36e5, true]],
    cuoi:       [[/phía đông trước bình minh/, (d, r) => r - 20 * 6e4, true, 'dong'], [/sáng rồi vẫn chưa lặn/, (d) => d + 8 * 36e5, true]],
  };
  for (const [ten, vi, kinh] of [['TP.HCM', 10.8231, 106.6297], ['Hà Nội', 21.0285, 105.8542]]) {
    let dem = 0, sai = [];
    for (let i = 0; i < 365; i++) {
      const d = Date.parse('2026-01-01T00:00:00+07:00') + i * 864e5;
      const mt = A.mocLan(d, vi, kinh);
      for (const pha in KIEM) for (const [cau, khi, tren, huong] of KIEM[pha]) {
        const ms = khi(d, mt.moc, mt.lan), JD = A.ngayJulius(ms), m = A.matTrang(JD);
        if (tenPha(m.tuoi) !== pha) continue;
        const p = A.docCao(m.ra, m.dec, vi, kinh, JD);
        let dung = (p.cao > A.NGUONG.trang) === tren;
        if (dung && huong) dung = huong === 'tay' ? p.huong > 180 && p.huong < 360 : p.huong > 0 && p.huong < 180;
        dem++;
        if (!dung) sai.push(`${pha} ${new Date(ms + 7 * 36e5).toISOString().slice(0, 16)}`);
      }
    }
    ok(`${ten}, cả năm 2026: mọi câu giải thích theo pha đều đúng với vị trí Trăng tính được`, dem > 450 && sai.length === 0,
       `${dem} lần kiểm, ${sai.length} sai ${sai.slice(0, 3).join('; ')}`);
  }
  ok('câu giải thích nói đúng điều được kiểm, pha nào cũng có',
     Object.keys(KIEM).every(pha => KIEM[pha].every(([cau]) => cau.test(T._nhipTrang(MAU[pha])))),
     Object.keys(KIEM).filter(pha => !KIEM[pha].every(([cau]) => cau.test(T._nhipTrang(MAU[pha])))).join(', '));
  ok('các mốc chia pha của câu giải thích trùng mốc tên pha',
     Object.keys(MAU).every(pha => tenPha(MAU[pha]) === pha) &&
     [1.4, 1.6, 6.4, 6.6, 8.4, 8.6, 13.4, 13.6, 16.4, 16.6, 21.4, 21.6, 23.4, 23.6, 27.9, 28.1].every((t, i, a) =>
       i % 2 === 0 || (T._tenTrang(t, 0) !== T._tenTrang(a[i - 1], 0)) === (T._nhipTrang(t) !== T._nhipTrang(a[i - 1]))));

  /* Thẻ Mặt Trăng có câu đó. 8/10/2026 7:00 — tuần "sáng rồi Trăng không chịu lặn". */
  T._noi(10.8231, 106.6297, 'TP.HCM');
  const luc7 = Date.parse('2026-10-08T07:00:00+07:00');
  T._chon('Mặt Trăng');
  const the = T._the(luc7) || '';
  ok('thẻ Mặt Trăng sáng 8/10: còn trên trời, ghi giờ lặn chiều nay, và nói vì sao', /lặn lúc 15:5\d/.test(the) &&
     /sáng rồi vẫn chưa lặn/.test(the) && /mọc trễ hơn chừng 50 phút/.test(the), the.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 260));
  T._chon(null);
}

console.log('\n— Hệ Mặt Trời đủ tám hành tinh: vừa màn, Mặt Trời không che Sao Thuỷ, chạm ra thông tin —');
{
  /* Người dùng hỏi "hệ mặt trời đầy đủ chưa hay thiếu": bản trước dừng ở Sao Thổ (sáu hành tinh). */
  const V = global.TDTD_VUTRU, A = global.TDTD_ASTRO, noi = { ten: 'TP.HCM', vi: 10.8231, kinh: 106.6297 };
  const cv = { measureText: () => ({ width: 40 }) };
  const ctxGia = new Proxy(cv, { get: (o, k2) => k2 in o ? o[k2] : (k2 === 'createRadialGradient' || k2 === 'createLinearGradient') ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
  ok('cảnh Hệ Mặt Trời vẽ đủ tám hành tinh, từ Sao Thuỷ tới Hải Vương', V._HANH.join() === 'thuy,kim,dat,hoa,moc,tho,thien,hai', V._HANH.join());
  ok('bảng quỹ đạo có Thiên Vương, Hải Vương', A.TEN_HANH_TINH.includes('thien') && A.TEN_HANH_TINH.includes('hai'));
  const nen2 = (q) => { const r = Math.hypot(q.x, q.y, q.z), k = V._nenKC(r) / r; return { x: q.x * k, y: q.y * k, z: q.z * k }; };
  V.vao();
  while (V.canh() !== 'heMatTroi') V.doiCanh();
  const cam = V._cam().heMatTroi, goc = { ...cam };
  /* Mọi quỹ đạo, kể cả Hải Vương, nằm gọn trong khoảng trống giữa nút đóng và khối chữ ở đáy — trên ba cỡ màn */
  const JD = A.ngayJulius(DEM), tran = [];
  for (const [w, h] of [[320, 568], [375, 812], [430, 932], [1280, 800]]) {
    for (let i = 0; i < 40; i++) V.ve(ctxGia, w, h, 2, DEM, noi, 290);      // để tâm dọc trượt tới chỗ
    for (const ma of V._HANH) for (const q of A.quyDao(ma, JD, 72)) {
      const p = V._chieu(nen2(q));
      if (!p || p.x < 4 || p.x > w - 4 || p.y < 50 || p.y > h - 290) { tran.push(`${w}×${h} ${ma}`); break; }
    }
  }
  ok('quỹ đạo Hải Vương và cả tám quỹ đạo nằm gọn trong màn, không đè lên khối chữ ở đáy (4 cỡ màn)', !tran.length, [...new Set(tran)].join(', '));
  /* Mặt Trời đo bằng cùng đơn vị với khoảng cách: lúc nào cũng nằm trong chỗ gần nhất của quỹ đạo Sao Thuỷ */
  ok('Mặt Trời nhỏ hơn chỗ gần nhất của quỹ đạo Sao Thuỷ (0,307 đvtv), ở mọi độ phóng', V._coNen('troi') < V._nenKC(.3075) * .8,
     `${V._coNen('troi').toFixed(2)} so với ${V._nenKC(.3075).toFixed(2)}`);
  const hong = [];
  for (const xa of [6, 30, 60]) {
    Object.assign(cam, { xa, pitch: 85 });
    V.ve(ctxGia, 375, 812, 2, DEM, noi, 290);
    const d = V._diemCham(), troi = d.find(x => x.ma === 'troi'), thuy = d.find(x => x.ma === 'thuy');
    if (!troi || !thuy || Math.hypot(thuy.x - troi.x, thuy.y - troi.y) < troi.rv + thuy.rv) hong.push(xa);
  }
  ok('nhìn từ trên xuống, phóng gần hay lùi xa thì Mặt Trời cũng không che Sao Thuỷ (bản trước: lùi xa là che)', !hong.length, hong.join(', '));
  Object.assign(cam, goc);
  /* Chạm: trúng Sao Mộc thì chữ dưới đáy thành thông tin Sao Mộc; chạm chỗ trống thì bỏ chọn */
  let kq = V.ve(ctxGia, 375, 812, 2, DEM, noi, 290);
  const moc = V._diemCham().find(x => x.ma === 'moc');
  ok('chạm trúng Sao Mộc là chọn nó', moc && V.cham(moc.x, moc.y) === true && V._chon() === 'moc');
  kq = V.ve(ctxGia, 375, 812, 2, DEM, noi, 290);
  const chu = V.giaiThich(kq, noi);
  ok('chữ dưới đáy thành thông tin Sao Mộc: cách Mặt Trời bao xa lúc này, to gấp mấy, một vòng bao lâu',
     /Sao Mộc · hành tinh khí khổng lồ/.test(chu) && /cách Mặt Trời 5,\d+ đơn vị thiên văn/.test(chu) && /Rộng gấp 11 lần/.test(chu) && /11,9 năm/.test(chu), chu.replace(/<[^>]+>/g, ' ').slice(0, 160));
  ok('chạm chỗ trống thì bỏ chọn, chữ về như cũ', V.cham(3, 3) === true && V._chon() === null && !/Chạm chỗ trống để bỏ chọn/.test(V.giaiThich(V.ve(ctxGia, 375, 812, 2, DEM, noi, 290), noi)));
  const hai = V._thongTinHT('hai', JD).dong.join(' ');
  ok('thông tin Hải Vương: cách Mặt Trời chừng 30 đơn vị thiên văn, nắng đi hơn 4 giờ mới tới, một vòng 164,8 năm (chu kỳ so với sao)',
     /cách Mặt Trời 29,\d+|cách Mặt Trời 30,\d+/.test(hai) && /4,\d giờ/.test(hai) && /164,8 năm/.test(hai), hai.slice(0, 160));
  ok('đang tua sang năm khác thì ghi "Ngày …", không ghi "Lúc này"', /^Ngày 19\/3\/2043 cách Mặt Trời/.test(V._thongTinHT('hoa', A.ngayJulius(Date.UTC(2043, 2, 19)), new Date(Date.UTC(2043, 2, 19, 5))).dong[0]));
  ok('nhỏ hơn Trái Đất thì nói "chỉ bằng", không nói "gấp 0,38 lần"', /Rộng chỉ bằng 0,38 lần Trái Đất/.test(V._thongTinHT('thuy', JD).dong[1]) && /— chỉ bằng 0,07 lần Trái Đất/.test(V._thongTinKT('ceres').dong[0]));
  /* Dòng chữ nói cả Sao Kim lẫn Sao Thuỷ (bản trước tính Sao Thuỷ xong rồi bỏ) */
  const chu0 = V.giaiThich(V.ve(ctxGia, 375, 812, 2, DEM, noi, 290), noi);
  const dong2 = (chu0.match(/<p class="td-dong2">([\s\S]*?)<\/p>/) || [, ''])[1];
  ok('dòng chữ cảnh Hệ Mặt Trời nói cả Sao Kim lẫn Sao Thuỷ', /Sao Kim (cách|đang)/.test(dong2) && /Sao Thuỷ (cách|đang)/.test(dong2), dong2.replace(/<[^>]+>/g, ' '));
  /* 24/10/2026: Sao Kim đi ngang giữa Trái Đất và Mặt Trời. Bản trước ghi "thấy lúc rạng sáng (Sao Mai)" ở 0°. */
  const giao = V._homMai(A.ngayJulius(Date.UTC(2026, 9, 24, 12))).find(h => h.ma === 'kim');
  ok('lúc Sao Kim ở giữa Trái Đất và Mặt Trời (24/10/2026) thì báo "chìm trong nắng, không thấy được"',
     !giao.thay && giao.truoc && /ở giữa Trái Đất và Mặt Trời .* chìm trong nắng, không thấy được/.test(V._cauHomMai(giao)), V._cauHomMai(giao));
  /* 6/1/2026: Sao Kim ở phía bên kia Mặt Trời (giao hội trên); Sao Thuỷ cách Mặt Trời chừng 9°, dưới ngưỡng 14° */
  const hm6 = V._homMai(A.ngayJulius(Date.UTC(2026, 0, 6, 12))), kim6 = hm6.find(h => h.ma === 'kim'), thuy6 = hm6.find(h => h.ma === 'thuy');
  ok('giao hội trên (6/1/2026): Sao Kim "ở phía bên kia Mặt Trời", không thấy được', !kim6.thay && !kim6.truoc && /phía bên kia Mặt Trời/.test(V._cauHomMai(kim6)), V._cauHomMai(kim6));
  ok('Sao Thuỷ dưới 14° cũng báo chìm trong nắng (6/1/2026)', !thuy6.thay && thuy6.goc < 14 && /chìm trong nắng/.test(V._cauHomMai(thuy6)), V._cauHomMai(thuy6));
  ok('góc ghi trên màn là góc thật tới Mặt Trời, không phải hiệu kinh độ (24/10: 6–8°, không phải 0–1°)', giao.goc > 5 && giao.goc < 9, giao.goc.toFixed(1) + '°');
  const hom = V._homMai(A.ngayJulius(Date.UTC(2026, 9, 14, 12))).find(h => h.ma === 'kim');
  ok('14/10/2026 Sao Kim cách Mặt Trời 16–17° phía Đông: vẫn là Sao Hôm', hom.thay && hom.lech > 0 && Math.abs(hom.goc - 16.6) < 1.2 && /Sao Hôm/.test(V._cauHomMai(hom)), hom.goc.toFixed(1) + '°');
  ok('tua ở cảnh Hệ Mặt Trời có thêm mức 100 ngày mỗi giây (Hải Vương đi một vòng mất 165 năm)',
     [V.doiTua(), V.doiTua(), V.doiTua(), V.doiTua()].join(' · ') === '1 ngày mỗi giây · 10 ngày mỗi giây · 100 ngày mỗi giây · Giờ thật');
  /* Bảng tua cảnh Trái Đất chỉ có 3 mức: đổi cảnh khi đang ở mức thứ tư mà không đặt lại thì mỗi khung ném lỗi */
  V.doiTua(); V.doiTua(); V.doiTua();
  let loiTua = null;
  try { V.doiCanh(); V.doiCanh(); V.ve(ctxGia, 375, 812, 2, DEM, noi, 290); V.tua(); } catch (e) { loiTua = e.message; }
  ok('đang tua 100 ngày mỗi giây mà đổi cảnh thì tua về giờ thật, không nổ lỗi', loiTua === null && V.tua() === 'Giờ thật', loiTua || V.tua());
  while (V.canh() !== 'heMatTroi') V.doiCanh();
  /* Khối chữ ở đáy cao bao nhiêu thì cả hệ dời theo bấy nhiêu (nightsky.js đo rồi đưa vào) */
  for (let i = 0; i < 60; i++) V.ve(ctxGia, 375, 812, 2, DEM, noi, 200);
  const cy200 = V._CY();
  for (let i = 0; i < 60; i++) V.ve(ctxGia, 375, 812, 2, DEM, noi, 360);
  ok('khối chữ đáy cao lên 160px thì tâm cảnh Hệ Mặt Trời lùi lên chừng 80px', Math.abs((cy200 - V._CY()) - 80) < 3, `${Math.round(cy200)} → ${Math.round(V._CY())}`);
  /* So kích thước: chạm một quả cầu ra đường kính thật */
  V.doiCanh();
  kq = V.ve(ctxGia, 375, 812, 2, DEM, noi, 214);
  for (let i = 0; i < 60; i++) V.ve(ctxGia, 375, 812, 2, DEM, noi, 214);
  const dsK = V._boKichThuoc(375, 812), mocK = dsK.find(b => b.ma === 'moc');
  V.cham(mocK.x, mocK.y + mocK.r + 16);                        // chạm vào chữ "Sao Mộc" ngay dưới Sao Mộc
  ok('chạm vào chữ "Sao Mộc" không ra Sao Thổ (vùng chạm Sao Thổ là elip ôm vành, không phải hình tròn to)', V._chon() !== 'tho', String(V._chon()));
  V._chon(null);
  const thoK = dsK.find(b => b.ma === 'tho');
  ok('chạm vào mép vành Sao Thổ thì ra Sao Thổ', V.cham(thoK.x + thoK.r * 2.1, thoK.y) && V._chon() === 'tho');
  V._chon(null);
  const ceres = V._diemCham().find(x => x.ma === 'ceres');
  V.cham(ceres.x, ceres.y);
  const kt = V.giaiThich(V.ve(ctxGia, 375, 812, 2, DEM, noi, 290), noi);
  ok('cảnh So kích thước: chạm Ceres ra "hành tinh lùn", đường kính 939 km', /Ceres · hành tinh lùn/.test(kt) && /939 km/.test(kt), kt.replace(/<[^>]+>/g, ' ').slice(0, 120));
  V._chon(null);
  /* Màn thấp: không ép mọi thứ về tí hon; giữ cỡ tối thiểu, phần còn lại kéo lên mà xem, và có dòng nhắc */
  const coMan = [];
  for (const [w, h, d] of [[375, 812, 214], [430, 932, 214], [375, 667, 214], [360, 640, 230], [320, 568, 270]]) {
    for (let i = 0; i < 60; i++) V.ve(ctxGia, w, h, 2, DEM, noi, d);
    const dd = V._boKichThuoc(w, h), datK = dd.find(b => b.ma === 'dat');
    coMan.push({ w, h, r: datK.r, tran: V._tranKT() });
  }
  ok('màn nào Trái Đất cũng không nhỏ dưới 2,5 điểm ảnh (bản trước: 0,5 ở 375×667)', coMan.every(m => m.r >= 2.49), coMan.map(m => `${m.w}×${m.h} ${m.r.toFixed(1)}`).join(', '));
  ok('màn cao thì vừa hết, màn thấp thì nhắc "kéo lên để xem tiếp"', !coMan[0].tran && !coMan[1].tran && coMan[4].tran, coMan.map(m => `${m.w}×${m.h} ${m.tran ? 'tràn' : 'vừa'}`).join(', '));
  for (let i = 0; i < 80; i++) V.ve(ctxGia, 375, 812, 2, DEM, noi, 214);              // để cỡ trượt tới chỗ, đứng yên
  const k1 = V._cam().kichThuoc.k;
  V.ve(ctxGia, 812, 375, 2, DEM, noi, 214); const k2 = V._cam().kichThuoc.k;     // cùng khối chữ đáy, chỉ đổi cỡ màn
  ok('xoay máy (đổi cỡ màn) thì tính lại cỡ', k1 !== k2, `${k1.toFixed(2)} → ${k2.toFixed(2)}`);
  V.doiCanh();
  ok('đổi cảnh thì bỏ chọn', V._chon() === null);
  /* Cảnh Trái Đất gọi tên tuần trăng giống hệt bầu trời (bản trước: bên theo % sáng, bên theo tuổi trăng) */
  const lech = [];
  for (let h = 0; h < 24 * 30; h += 7) {
    const luc = DEM + h * 36e5, c = V._canhTD(A.ngayJulius(luc), noi);
    const chuTD = V.giaiThich({ canh: 'traiDat', luc, sang: c.sang, tuoi: c.tuoi, kc: c.kc, ngay: true }, noi);
    if (!chuTD.includes(T._tenTrang(T._bauTroi(luc).trang.tuoi))) lech.push(h);
  }
  ok('cảnh Trái Đất và bầu trời cùng một tên tuần trăng, suốt một tháng', !lech.length, `${lech.length} giờ lệch`);
}

console.log('\n— Bầu trời: Mặt Trăng tại chỗ đứng, hành tinh cùng hệ với sao —');
{
  /* JPL Horizons, TP.HCM (106,6297°E, 10,8231°N), 17/10/2026, độ cao không tính khúc xạ. Bản trước tính Trăng
     từ tâm Trái Đất: cao hơn thật 0,6–0,75°. */
  const H = [[12, 41.902244], [13, 32.146582], [14, 20.871177], [15, 8.749620]];
  let lechMax = 0;
  for (const [gio, cao] of H) lechMax = Math.max(lechMax, Math.abs(T._bauTroi(Date.UTC(2026, 9, 17, gio)).trang.cao - cao));
  ok('Mặt Trăng đã trừ thị sai chỗ đứng: độ cao khớp JPL Horizons trong 0,25° (bản trước lệch tới 0,75°)', lechMax < .25, lechMax.toFixed(2) + '°');
  const nguon = require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'nightsky.js'), 'utf8');
  /* Dòng trạng thái Trăng (đang trên trời / chưa mọc / đã lặn) phải khớp giờ mọc lặn in ngay bên cạnh, từng phút
     suốt ngày — kể cả hôm Trăng ở gần nhất (17/5/2026, thị sai lớn nhất). Ngưỡng đặt cứng thì quanh lúc mọc lặn hai
     thứ cãi nhau. Cho lệch trong 1 phút quanh mốc (giờ mọc lặn chỉ in tới phút). */
  const caiNhau = [];
  for (const [ten, vi, kinh, ngay] of [['TP.HCM', 10.8231, 106.6297, '2026-10-12'], ['Hà Nội', 21.0285, 105.8542, '2026-05-17']]) {
    T._noi(vi, kinh, ten);
    const dau = Date.parse(`${ngay}T00:00:00+07:00`), ml = A.mocLan(dau, vi, kinh, 'trang'), mlMai = A.mocLan(dau + 864e5, vi, kinh, 'trang');
    for (let ms = dau; ms < dau + 864e5; ms += 30000) {
      const b = T._bauTroi(ms), t = A.trangThaiMocLan(b.trang.cao, ml, mlMai, ms, b.trang.nguong).tinh;
      const gan = [ml.moc, ml.lan].some(m => m !== null && Math.abs(ms - m) < 60000);
      const tren = ml.moc !== null && ml.lan !== null ? (ml.moc < ml.lan ? ms >= ml.moc && ms < ml.lan : ms >= ml.moc || ms < ml.lan)
        : ml.lan !== null ? ms < ml.lan : ml.moc !== null ? ms >= ml.moc : b.trang.cao > 0;
      if (!gan && (t === 'tren') !== tren) caiNhau.push(`${ten} ${new Date(ms).toTimeString().slice(0, 5)}`);
    }
  }
  T._noi(10.8231, 106.6297, 'TP.HCM');
  ok('trạng thái Trăng khớp giờ mọc lặn từng nửa phút, cả hôm Trăng gần nhất', !caiNhau.length, caiNhau.slice(0, 4).join(', '));
  /* 14/9/2026, TP.HCM: Mặt Trăng che Sao Kim. Theo JPL Horizons (tại chỗ, không khúc xạ): 11:40 UT còn cách 0,63°;
     12:48 UT đã lọt vào trong đĩa (cách 0,15°), Trăng cao 2,7°; 13:12 UT Trăng đã xuống −2,8°. Công thức Mặt Trăng
     của app sai chừng 0,1–0,3°, ngang bán kính đĩa, nên app chỉ được nói "bị che, hoặc ngay sát mép". */
  const cau = (h, m) => T._cauGap(Date.UTC(2026, 8, 14, h, m));
  ok('11:40 UT, Sao Kim còn cách Mặt Trăng 0,6°: báo "đang sát", không báo bị che', /Sao Kim đang sát Mặt Trăng, cách 0,[67]°/.test(cau(11, 40)), cau(11, 40));
  ok('12:48 UT, Sao Kim đã nấp sau đĩa trăng: báo "đang bị Mặt Trăng che, hoặc ngay sát mép"', /Sao Kim đang bị Mặt Trăng che, hoặc ngay sát mép/.test(cau(12, 48)), cau(12, 48));
  /* 12:36 UT: Horizons cách 0,24° — vừa lọt vào đĩa — mà app tính ra hơn bán kính (sai số Mặt Trăng): vẫn phải
     báo "bị che, hoặc ngay sát mép", không được bảo "đang sát, cách 0,3°" */
  ok('12:36 UT, vừa bị che (app tính hơi xa vì sai số Trăng): vẫn báo "bị che, hoặc ngay sát mép"', /Sao Kim đang bị Mặt Trăng che, hoặc ngay sát mép/.test(cau(12, 36)), cau(12, 36));
  /* 13:05 UT: Trăng đã lặn (app ghi "đã lặn lúc 20:02"), Sao Kim sát chân trời −1,2° — trên −2° nên bản trước vẫn báo */
  ok('13:05 UT, Trăng đã lặn: thôi báo (bản trước: vừa ghi "đã lặn" vừa ghi "đang nấp sau Mặt Trăng")', !/Sao Kim/.test(cau(13, 5)) && !/Sao Kim/.test(cau(13, 12)), cau(13, 5));
  ok('không nói "không hành tinh nào trên trời" (Thiên Vương, Hải Vương vẫn có thể đang ở trên)',
     !/'Không hành tinh nào trên trời lúc này'/.test(nguon) && /nhìn được bằng mắt thường/.test(nguon));
  const css = require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'app.css'), 'utf8');
  ok('khối chữ đáy đứng trên hàng nút theo chiều cao đo được, hàng nút xuống dòng chứ không bóp chữ trong nút',
     /\.td-tin\{[^}]*var\(--thanh/.test(css) && /\.td-thanh\{[^}]*flex-wrap:wrap/.test(css) && /\.td-thanh button\{[^}]*white-space:nowrap/.test(css));
}

console.log('\n— Dự báo mưa theo chỗ đang đứng: mở bầu trời là lấy lại vị trí —');
(async () => {
  /* Người dùng hỏi dự báo mưa có đúng vị trí hiện tại không: bản trước lấy vị trí một lần lúc bấm nút rồi nhớ luôn. */
  const HCM = { vi: 10.8231, kinh: 106.6297 }, HN = { vi: 21.0285, kinh: 105.8542 };
  const kmHN = T._cachKm(HCM, HN);
  ok('đo khoảng cách: TP.HCM – Hà Nội chừng 1.140 km, 0,01 độ vĩ chừng 1,1 km',
     Math.abs(kmHN - 1140) < 25 && Math.abs(T._cachKm({ vi: 10, kinh: 106 }, { vi: 10.01, kinh: 106 }) - 1.11) < 0.02, `${Math.round(kmHN)} km`);
  const gocNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const dat = (quyen, viTri, coPerm = true) => {
    const ghi = { hoi: 0 };
    Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true, value: {
      permissions: coPerm ? { query: async () => ({ state: quyen }) } : undefined,
      geolocation: { getCurrentPosition: (xong, loi) => { ghi.hoi++; viTri ? xong({ coords: { latitude: viTri.vi, longitude: viTri.kinh } }) : loi(new Error('x')); } },
    } });
    return ghi;
  };
  let g = dat('granted', { vi: 10.9, kinh: 106.7 });
  T._noi(HCM.vi, HCM.kinh, 'TP.HCM');
  ok('chọn thành phố (không phải vị trí máy): không động tới định vị', await T._capNhatViTri() === 'bo' && g.hoi === 0);
  T._noiMay(HCM.vi, HCM.kinh);
  g = dat('prompt', { vi: 10.9, kinh: 106.7 });
  ok('quyền vị trí chưa cho (hay bị từ chối): KHÔNG tự bật hộp hỏi quyền, giữ chỗ đã lưu',
     await T._capNhatViTri() === 'bo' && g.hoi === 0 && T._noiHienTai().vi === HCM.vi);
  g = dat('granted', { vi: 10.9, kinh: 106.7 }, false);
  ok('trình duyệt không có Permissions API: không hỏi, giữ chỗ đã lưu', await T._capNhatViTri() === 'bo' && g.hoi === 0);
  g = dat('granted', { vi: HCM.vi + 0.002, kinh: HCM.kinh + 0.002 });
  ok('đã cho quyền, mới dời vài trăm mét: giữ nguyên, khỏi xoá dự báo đang có', await T._capNhatViTri() === 'gan' && g.hoi === 1 && T._noiHienTai().vi === HCM.vi);
  g = dat('granted', { vi: 10.9, kinh: 106.7 });
  const r = await T._capNhatViTri(), n = T._noiHienTai();
  ok('đã cho quyền, đi xa hơn 1 km: đổi sang chỗ mới, vẫn là vị trí máy', r === 'doi' && n.vi === 10.9 && n.kinh === 106.7 && n.tuMay === true, `${r} → ${n.vi}, ${n.kinh}`);
  ok('đổi chỗ là xin lại dự báo mưa cho chỗ mới (dự báo cũ hết giá trị)', T._muaLuc() === 0);
  g = dat('granted', null);
  ok('lấy vị trí bị lỗi: giữ chỗ đã lưu', await T._capNhatViTri() === 'loi' && T._noiHienTai().vi === 10.9);
  ok('mở bầu trời là cập nhật vị trí (khi đã chọn nơi rồi)', /if \(!daChon\) moBangChonNoi\(\);\s*else capNhatViTri\(\)/.test(require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'nightsky.js'), 'utf8')));
  if (gocNav) Object.defineProperty(globalThis, 'navigator', gocNav); else delete globalThis.navigator;
  T._noi(HCM.vi, HCM.kinh, 'TP.HCM');
  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
  process.exit(fail ? 1 : 0);
})();

