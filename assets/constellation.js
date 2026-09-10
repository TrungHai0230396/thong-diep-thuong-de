/* Nối sao thành chòm — kéo tay nối các ngôi sáng lại thành hình.
   Không đếm giờ, không thua. Nối trật thì đường tự tan.
   Toạ độ sao trong khung 0..1, sẽ co giãn theo màn hình. */
(() => {
'use strict';

/* Mỗi ngôi sao ghi bằng toạ độ thiên văn thật (xích kinh giờ, xích vĩ độ, mốc J2000)
   rồi chương trình tự chiếu xuống khung 0..1, nên hình dạng đúng như trên trời
   chứ không phải đặt tay. Thêm chòm mới chỉ cần tra toạ độ, không phải căn chỉnh. */
/* Mỗi ngôi sao ghi bằng số liệu thiên văn thật: xích kinh (giờ), xích vĩ (độ) mốc J2000,
   và khoảng cách tới Trái Đất (năm ánh sáng). Chương trình dựng vị trí ba chiều rồi chiếu
   xuống màn hình, nên nhìn từ Trái Đất thì hình đúng như trên trời, còn xoay đi thì hình vỡ ra
   — vì chòm sao vốn chỉ là một góc nhìn, không phải một vật có thật.
   Vài khoảng cách còn tranh cãi trong giới thiên văn, rõ nhất là Betelgeuse và Alnilam. */
const CHOM = [
  {
    ten: 'Bắc Đẩu',
    phu: 'bảy sao của chòm Đại Hùng',
    loi: 'Hình cái gàu múc nước: bốn ngôi làm thân gàu, ba ngôi làm cán. Kéo dài mép ngoài thân gàu chừng năm lần là gặp sao Bắc Cực, nên xưa đi biển đi rừng nhìn nó tìm phương bắc.',
    xoay: 'Năm ngôi ở giữa cùng sinh ra từ một đám mây khí và đang trôi cùng hướng. Riêng Thiên Xu và Dao Quang ở hai đầu thì không cùng họ, nên vài chục vạn năm nữa cái gàu sẽ méo dần rồi tan.',
    cadao: '',
    sao: [
      ['Thiên Xu (Dubhe)',     11.0621,  61.751, 123],
      ['Thiên Toàn (Merak)',   11.0307,  56.382,  79.7],
      ['Thiên Cơ (Phecda)',    11.8972,  53.695,  83.2],
      ['Thiên Quyền (Megrez)', 12.2571,  57.033,  80.5],
      ['Ngọc Hành (Alioth)',   12.9005,  55.960,  82.6],
      ['Khai Dương (Mizar)',   13.3987,  54.925,  82.9],
      ['Dao Quang (Alkaid)',   13.7924,  49.313, 103.9],
    ],
    noi: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]],
  },
  {
    ten: 'Lưỡi Cày',
    phu: 'chòm Lạp Hộ',
    loi: 'Bốn ngôi ngoài là bốn góc thửa ruộng, ba ngôi thẳng hàng ở giữa là lưỡi cày. Tháng Giêng chừng chín giờ tối nhìn rõ nhất.',
    xoay: 'Ba ngôi thắt lưng nhìn từ đây thì thẳng tăm tắp, nhưng ngôi xa nhất cách ta gần gấp đôi ngôi gần nhất. Chúng chỉ tình cờ nằm cùng một hướng nhìn.',
    cadao: '',
    sao: [
      ['Betelgeuse', 5.9195,   7.407,  550],
      ['Bellatrix',  5.4188,   6.350,  243],
      ['Mintaka',    5.5334,  -0.299,  916],
      ['Alnilam',    5.6036,  -1.202, 1300],
      ['Alnitak',    5.6793,  -1.943,  736],
      ['Saiph',      5.7959,  -9.670,  645],
      ['Rigel',      5.2423,  -8.202,  848],
    ],
    noi: [[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[2,6]],
  },
  {
    ten: 'Tua Rua',
    phu: 'cụm sao Thất Nữ · sao Mạ',
    loi: 'Nông dân đồng bằng Bắc Bộ gọi là sao Mạ, vì Tua Rua ló lên là tới mùa gieo mạ. Mắt thường thấy chừng sáu bảy ngôi, xếp thành cái gàu tí hon.',
    xoay: 'Xoay thế nào chúng cũng dính chùm với nhau, chỉ nghiêng đi chứ không vỡ. Đây là cụm sao thật: bảy ngôi cùng sinh ra một chỗ, cách nhau vài năm ánh sáng và vẫn đang đi cùng nhau, khác hẳn mấy chòm kia.',
    cadao: 'Tua rua đi rắc mạ mùa\nTiểu thử đi bừa, cày ruộng rất sâu',
    // Cụm này ở quanh 135 parsec, tức chừng 440 năm ánh sáng. Các ngôi sáng nằm cách nhau
    // chỉ vài năm ánh sáng nên ghi cùng một khoảng cách là sát thực tế hơn là chép
    // các số đo lẻ từng ngôi, vốn sai số lớn hơn cả bề dày thật của cụm.
    sao: [
      ['Alcyone', 3.7914, 24.105, 440],
      ['Atlas',   3.8194, 24.053, 440],
      ['Electra', 3.7483, 24.113, 440],
      ['Maia',    3.7644, 24.368, 440],
      ['Merope',  3.7719, 23.948, 440],
      ['Taygeta', 3.7539, 24.467, 440],
      ['Pleione', 3.8203, 24.136, 440],
    ],
    noi: [[2,4],[4,0],[0,1],[1,6],[2,3],[3,5],[3,0]],
  },
  {
    ten: 'Ngưu Lang Chức Nữ',
    phu: 'tam giác mùa hè',
    loi: 'Ngưu Lang ở chòm Thiên Ưng, Chức Nữ ở chòm Thiên Cầm, hai người ngồi hai bên sông Ngân. Ngôi thứ ba là Thiên Tân bên chòm Thiên Nga. Mùa hè ngẩng lên là thấy tam giác này ngay đỉnh đầu.',
    xoay: 'Ngưu Lang cách ta 17 năm ánh sáng, Chức Nữ 25, còn Thiên Tân thì tới 2600. Nhìn từ Trái Đất thì ba ngôi thành một tam giác đẹp, xoay đi một chút là Thiên Tân trôi tuốt ra xa. Chuyện đôi lứa cách sông cũng là chuyện của góc nhìn.',
    cadao: '',
    sao: [
      ['Chức Nữ (Vega)',   18.6156,  38.784,   25],
      ['Ngưu Lang (Altair)', 19.8464,   8.868,   16.7],
      ['Thiên Tân (Deneb)', 20.6905,  45.280, 2600],
    ],
    noi: [[0,1],[1,2],[2,0]],
  },
  {
    ten: 'Thiên Nga',
    phu: 'chữ thập phương bắc',
    loi: 'Con thiên nga sải cánh bay dọc sông Ngân, cổ vươn dài về phía trước. Người phương Tây gọi là chữ thập phương bắc. Mùa hè và đầu thu nhìn rõ.',
    xoay: 'Ngôi ở đầu cánh chỉ cách ta 73 năm ánh sáng, còn ngôi ở đuôi xa tới 2600, gấp hơn ba mươi lần. Cây thánh giá này mỏng như tờ giấy khi nhìn từ đây, nhưng thật ra trải dài cả ngàn năm ánh sáng.',
    cadao: '',
    sao: [
      ['Thiên Tân (Deneb)', 20.6905, 45.280, 2600],
      ['Sadr',              20.3705, 40.257, 1800],
      ['Albireo',           19.5120, 27.960,  415],
      ['Delta Cygni',       19.7495, 45.131,  165],
      ['Gienah',            20.7702, 33.970,   72.7],
    ],
    noi: [[0,1],[1,2],[3,1],[1,4]],
  },
  {
    ten: 'Tiên Hậu',
    phu: 'hình chữ M',
    loi: 'Năm ngôi sáng xếp thành chữ M, hoặc chữ W tuỳ lúc trong đêm. Chòm này nằm gần sao Bắc Cực nên quay quanh nó suốt năm, ai ở miền Bắc nhìn về hướng bắc là thấy.',
    xoay: 'Năm ngôi nằm rải từ 55 tới 550 năm ánh sáng. Chữ M gọn gàng kia thật ra là năm ngôi sao ở năm độ sâu khác nhau, tình cờ chồng lên nhau trong mắt ta.',
    cadao: '',
    sao: [
      ['Caph',         0.1528, 59.150,  54.7],
      ['Schedar',      0.6751, 56.537, 228],
      ['Gamma Cas',    0.9451, 60.717, 550],
      ['Ruchbah',      1.4303, 60.235,  99],
      ['Segin',        1.9067, 63.670, 410],
    ],
    noi: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    ten: 'Sư Tử',
    phu: 'lưỡi liềm và thân sư tử',
    loi: 'Sáu ngôi phía trước uốn thành lưỡi liềm, chính là đầu và bờm sư tử, ngôi sáng nhất ở chân liềm là Hiên Viên. Ba ngôi phía sau khép lại thành thân và đuôi. Mùa xuân nhìn rõ nhất.',
    xoay: 'Ngôi ở giữa lưỡi liềm xa tới 1270 năm ánh sáng, trong khi ngôi cuối đuôi chỉ 36. Con sư tử này được ghép từ những ngôi sao chẳng liên quan gì tới nhau.',
    cadao: '',
    sao: [
      ['Hiên Viên (Regulus)', 10.1395, 11.967,   79.3],
      ['Eta Leonis',          10.1222, 16.763, 1270],
      ['Algieba',             10.3329, 19.841,  130],
      ['Adhafera',            10.2783, 23.417,  260],
      ['Mu Leonis',            9.8794, 26.007,  133],
      ['Epsilon Leonis',       9.7648, 23.774,  247],
      ['Zosma',               11.2351, 20.524,   58.4],
      ['Denebola',            11.8177, 14.572,   35.9],
      ['Chertan',             11.2372, 15.430,  165],
    ],
    noi: [[5,4],[4,3],[3,2],[2,1],[1,0],[2,6],[6,7],[7,8],[8,0]],
  },
  {
    ten: 'Thần Nông',
    phu: 'nhóm sao dân gian, phần trên chòm Thiên Yết',
    loi: 'Người xưa thấy hình ông Thần Nông chống gậy. Đây là cách gọi dân gian cho một nhóm sao, không trùng khớp với chòm Thiên Yết trong thiên văn học, vì thiếu phần đuôi bọ cạp.',
    xoay: 'Ngôi cuối ở chân hình chỉ cách ta chừng sáu mươi lăm năm ánh sáng, gần gấp gần mười lần các ngôi còn lại. Xoay một chút là nó rời hẳn ra.',
    cadao: '',
    sao: [
      ['Acrab',       16.0903, -19.805, 400],
      ['Dschubba',    16.0055, -22.622, 490],
      ['Pi Sco',      15.9817, -26.114, 590],
      ['Sigma Sco',   16.3533, -25.593, 700],
      ['Antares',     16.4901, -26.432, 550],
      ['Tau Sco',     16.5983, -28.216, 470],
      ['Epsilon Sco', 16.8360, -34.293,  65],
    ],
    noi: [[2,1],[1,0],[1,3],[3,4],[4,5],[5,6]],
  },
];

/* Vị trí ba chiều thật, gốc toạ độ là Trái Đất, đơn vị năm ánh sáng. */
function viTri3D(sao) {
  return sao.map(([, ra, dec, ly]) => {
    const a = ra * 15 * Math.PI / 180, d = dec * Math.PI / 180;
    return [ly * Math.cos(d) * Math.cos(a), ly * Math.cos(d) * Math.sin(a), ly * Math.sin(d)];
  });
}

const tru = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const cong = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const nhan = (a, k) => [a[0]*k, a[1]*k, a[2]*k];
const cham = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const tich = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dai = (a) => Math.hypot(a[0], a[1], a[2]);
const chuan = (a) => { const l = dai(a) || 1; return nhan(a, 1/l); };
const xoayQuanh = (v, truc, goc) => {          // công thức Rodrigues
  const c = Math.cos(goc), s = Math.sin(goc);
  return cong(cong(nhan(v, c), nhan(tich(truc, v), s)), nhan(truc, cham(truc, v) * (1 - c)));
};

/* Chiếu các sao lên mặt phẳng ảnh.
   quay = 0 nghĩa là đứng đúng chỗ Trái Đất, khi đó hình hiện ra y như nhìn lên trời thật. */
function chieu(diem3d, tam3d, ngang, doc) {
  const R = dai(tam3d) || 1;
  const veTraiDat = chuan(nhan(tam3d, -1));
  const bac = [0, 0, 1];
  let ph = chuan(tich(veTraiDat, bac));
  if (dai(ph) < 1e-6) ph = [1, 0, 0];
  const tren0 = chuan(tich(ph, veTraiDat));
  let huong = xoayQuanh(veTraiDat, tren0, ngang);
  huong = xoayQuanh(huong, chuan(tich(huong, tren0)), doc);
  const may = cong(tam3d, nhan(huong, R));            // vị trí người xem
  const truoc = chuan(tru(tam3d, may));
  let phai = tich(truoc, bac);
  if (dai(phai) < 1e-6) phai = tich(truoc, [0, 1, 0]);
  phai = chuan(phai);
  const tren = chuan(tich(phai, truoc));
  return diem3d.map(p => {
    const v = tru(p, may);
    const sau = Math.max(cham(v, truoc), R * .02);     // chặn sao rơi ra sau lưng
    return [cham(v, phai) / sau, -cham(v, tren) / sau, sau];
  });
}


/* Chiếu toạ độ thiên văn xuống khung vuông 0..1, giữ đúng tỉ lệ hình.
   Xích kinh tăng về phía đông, trên bầu trời đông nằm bên trái, nên trục x đảo dấu. */
function chieuSao(sao) {
  const decTB = sao.reduce((s, r) => s + r[2], 0) / sao.length;
  const k = Math.cos(decTB * Math.PI / 180);
  const tho = sao.map(([, ra, dec]) => [-ra * 15 * k, -dec]);
  const xs = tho.map(t => t[0]), ys = tho.map(t => t[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const rong = x1 - x0, cao = y1 - y0;
  const canh = Math.max(rong, cao) || 1;
  const le = 0.08, ty = 1 - le * 2;
  const dx = le + (canh - rong) / canh * ty / 2;
  const dy = le + (canh - cao) / canh * ty / 2;
  return tho.map(([x, y]) => [dx + (x - x0) / canh * ty, dy + (y - y0) / canh * ty]);
}


let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let chi = 0, diem = [], canhCanNoi = [], daNoi = new Set(), keo = null, xong = false, sangDan = 0, nen = [];
let banKinhBam = 34;   // co lại ở chòm có sao nằm sát nhau, để không bắt nhầm ngôi bên cạnh
let goc3d = [0, 0], tyLe = 0, tyLeDich = 0, tam3d = null, diem3d = null, xoayTay = null, oX = 0, oY = 0;
let giua = [0, 0];   // tâm khung bao của hình chiếu, không phải trọng tâm 3 chiều

const rnd = (a, b) => a + Math.random() * (b - a);
const khoa = (a, b) => a < b ? a + '-' + b : b + '-' + a;

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'chomsao';
  tam.innerHTML = `
    <canvas class="cs-cv"></canvas>
    <button class="cs-dong" aria-label="Đóng">✕</button>
    <div class="cs-tren">
      <p class="cs-ten"></p>
      <p class="cs-phu"></p>
    </div>
    <p class="cs-nhac">Kéo từ ngôi sao này sang ngôi sao kia</p>
    <button class="cs-goc" hidden>Về góc nhìn Trái Đất</button>
    <div class="cs-xong" hidden>
      <p class="cs-loi"></p>
      <p class="cs-cadao"></p>
      <button class="primary cs-tiep">Chòm khác</button>
    </div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.cs-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.cs-dong').onclick = dong;
  tam.querySelector('.cs-tiep').onclick = () => nap((chi + 1) % CHOM.length);
  tam.querySelector('.cs-goc').onclick = () => { goc3d = [0, 0]; xoayTay = null; };

  const toa = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const gan = (p) => {
    let tot = -1, gn = banKinhBam;
    diem.forEach((d, i) => { const k = Math.hypot(d.x - p.x, d.y - p.y); if (k < gn) { gn = k; tot = i; } });
    return tot;
  };
  cv.addEventListener('pointerdown', e => {
    const p = toa(e);
    cv.setPointerCapture(e.pointerId);
    if (xong) { xoayTay = { x: p.x, y: p.y, g0: goc3d.slice() }; return; }   // xong rồi thì kéo để xoay
    const i = gan(p);
    if (i >= 0) keo = { tu: i, ...p };
  });
  cv.addEventListener('pointermove', e => {
    const p = toa(e);
    if (xoayTay) {
      const GH = 1.15;                                    // chặn góc, không cho lộn ngược
      goc3d[0] = Math.max(-GH, Math.min(GH, xoayTay.g0[0] + (p.x - xoayTay.x) * .0055));
      goc3d[1] = Math.max(-1.0, Math.min(1.0, xoayTay.g0[1] - (p.y - xoayTay.y) * .0055));
      return;
    }
    if (keo) Object.assign(keo, p);
  });
  cv.addEventListener('pointerup', e => {
    if (xoayTay) { xoayTay = null; return; }
    if (!keo) return;
    const j = gan(toa(e));
    if (j >= 0 && j !== keo.tu) {
      const k = khoa(keo.tu, j);
      if (canhCanNoi.has(k) && !daNoi.has(k)) {
        daNoi.add(k);
        diem[keo.tu].sang = diem[j].sang = 1;
        if (navigator.vibrate) { try { navigator.vibrate(14); } catch (err) {} }
        tam.querySelector('.cs-nhac').classList.add('mo');
        if (daNoi.size === canhCanNoi.size) hoanThanh();
      }
    }
    keo = null;
  });
  cv.addEventListener('pointercancel', () => { keo = null; xoayTay = null; });
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  /* Thẻ bọc đang ẩn thì clientWidth bằng 0, mọi toạ độ tính từ đó thành vô định
     rồi canvas ném lỗi. Lấy tạm kích thước cửa sổ cho tới khi trang bày xong. */
  W = tam.clientWidth || innerWidth || 360;
  H = tam.clientHeight || innerHeight || 640;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  nen = Array.from({ length: Math.round(W * H / 4200) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .3, a: Math.random() * .4 + .08,
  }));
  datSao();
}

/* Đặt các ngôi sáng vào giữa màn hình, chừa lề trên dưới cho chữ. */
function datSao() {
  const c = CHOM[chi];
  if (!c || !W) return;
  diem3d = c._p3 || (c._p3 = viTri3D(c.sao));
  tam3d = c._tam || (c._tam = nhan(diem3d.reduce(cong, [0, 0, 0]), 1 / diem3d.length));

  const [leTren, leDuoi] = doLe();
  oX = W / 2;
  oY = leTren + (H - leTren - leDuoi) / 2;

  const ph = chieu(diem3d, tam3d, goc3d[0], goc3d[1]);
  const k = doKhung(ph);
  giua = k.giua;
  tyLeDich = vuaKhung(k, leTren, leDuoi);
  if (!tyLe) tyLe = tyLeDich;                       // lần đầu thì khớp luôn, không phóng dần

  veLaiDiem(ph);

  /* Có chòm mà hai ngôi nằm rất sát nhau ngoài trời thật, như hai sao giữa lưỡi cày.
     Thay vì kéo giãn cho dễ bấm, giữ nguyên hình và thu nhỏ vùng bắt điểm lại. */
  let gapMin = Infinity;
  for (let a = 0; a < diem.length; a++)
    for (let b = a + 1; b < diem.length; b++)
      gapMin = Math.min(gapMin, Math.hypot(diem[a].x - diem[b].x, diem[a].y - diem[b].y));
  banKinhBam = Math.max(13, Math.min(34, gapMin * .46));
}

/* Đo bề rộng và tâm của hình sau khi chiếu.
   Không dùng trọng tâm ba chiều làm tâm, vì chòm nào có một ngôi ở rất xa,
   như Thiên Tân cách 2600 năm ánh sáng, thì trọng tâm bị kéo lệch hẳn khỏi hình nhìn thấy. */
function doKhung(ph) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of ph) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { giua: [(x0 + x1) / 2, (y0 + y1) / 2], rongX: (x1 - x0) || 1e-6, rongY: (y1 - y0) || 1e-6 };
}

/* Phóng to nhất có thể mà vẫn lọt cả bề ngang lẫn bề dọc. */
function vuaKhung(k, leTren, leDuoi) {
  return Math.min((W - 52) * .94 / k.rongX, (H - leTren - leDuoi) * .94 / k.rongY);
}

/* Hình chiếm gần trọn màn hình. Chữ nằm đè lên trên với nền mờ dần,
   vẫn đọc được mà sao vẫn to. Muốn nhìn ngôi bị khuất thì kéo xoay là thấy. */
function doLe() {
  const day = (q) => { const n = tam.querySelector(q); if (!n || n.hidden) return 0;
    const r = n.getBoundingClientRect(); return r.height ? r.bottom : 0; };
  const tren = Math.max(day('.cs-tren'), day('.cs-goc')) + 14;
  return [Math.max(96, tren), 96];
}

function veLaiDiem(ph) {
  const c = CHOM[chi];
  diem = ph.map(([x, y, sau], i) => ({
    x: oX + (x - giua[0]) * tyLe, y: oY + (y - giua[1]) * tyLe, sau,
    ten: c.sao[i][0], ly: c.sao[i][3],
    sang: diem[i] ? diem[i].sang : 0, nhay: diem[i] ? diem[i].nhay : rnd(0, 6.28),
  }));
}

function nap(i) {
  chi = i; xong = false; sangDan = 0; daNoi = new Set(); keo = null;
  goc3d = [0, 0]; tyLe = 0; xoayTay = null;
  const c = CHOM[chi];
  canhCanNoi = new Set(c.noi.map(([a, b]) => khoa(a, b)));
  diem = [];
  datSao();
  tam.querySelector('.cs-ten').textContent = c.ten;
  tam.querySelector('.cs-phu').textContent = c.phu;
  tam.querySelector('.cs-xong').hidden = true;
  tam.querySelector('.cs-nhac').textContent = 'Kéo từ ngôi sao này sang ngôi sao kia';
  tam.querySelector('.cs-nhac').classList.remove('mo', 'tren');
  tam.querySelector('.cs-goc').hidden = true;
}

function hoanThanh() {
  xong = true;
  tam.querySelector('.cs-nhac').classList.add('mo');
  const c = CHOM[chi];
  tam.querySelector('.cs-loi').textContent = c.loi;
  const cd = tam.querySelector('.cs-cadao');
  cd.textContent = c.cadao;
  cd.hidden = !c.cadao;
  tam.querySelector('.cs-loi').textContent = c.loi + ' ' + c.xoay;
  tam.querySelector('.cs-xong').hidden = false;
  const n = tam.querySelector('.cs-nhac');
  n.textContent = 'Kéo màn hình để xoay, nhìn từ hướng khác';
  n.classList.remove('mo');
  n.classList.add('tren');
  setTimeout(() => n.classList.add('mo'), 6000);
  datSao();
  if (navigator.vibrate) { try { navigator.vibrate([16, 60, 30]); } catch (e) {} }
}

function vong(t) { raf = requestAnimationFrame(vong); buoc(t); }

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  if (xong && sangDan < 1) sangDan = Math.min(1, sangDan + dt / 900);

  if (diem3d) {
    const ph = chieu(diem3d, tam3d, goc3d[0], goc3d[1]);
    const [lt, ld] = doLe();
    oY = lt + (H - lt - ld) / 2;
    const k = doKhung(ph);
    giua = k.giua;
    tyLeDich = vuaKhung(k, lt, ld);
    tyLe += (tyLeDich - tyLe) * Math.min(1, dt / 160);    // thu phóng theo kịp, không giật
    veLaiDiem(ph);
    if (xong) {
      const lech = Math.round(Math.hypot(goc3d[0], goc3d[1]) * 180 / Math.PI);
      const nut = tam.querySelector('.cs-goc');
      nut.hidden = lech < 4;
      nut.textContent = `Về góc nhìn Trái Đất · đang lệch ${lech}°`;
    }
  }

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#141032'); g.addColorStop(.6, '#100d28'); g.addColorStop(1, '#080716');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  for (const s of nen) {
    ctx.globalAlpha = s.a * (.7 + Math.sin(t / 1500 + s.x) * .3);
    ctx.fillStyle = '#dcd8ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // các đường đã nối
  ctx.lineCap = 'round';
  for (const k of daNoi) {
    const [a, b] = k.split('-').map(Number);
    if (!diem[a] || !diem[b]) continue;
    ctx.strokeStyle = `rgba(232,195,122,${.55 + sangDan * .4})`;
    ctx.lineWidth = 1.6 + sangDan * 1.4;
    ctx.shadowColor = 'rgba(232,195,122,.7)'; ctx.shadowBlur = 6 + sangDan * 14;
    ctx.beginPath(); ctx.moveTo(diem[a].x, diem[a].y); ctx.lineTo(diem[b].x, diem[b].y); ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // đường đang kéo
  if (keo && diem[keo.tu]) {
    ctx.strokeStyle = 'rgba(232,195,122,.4)'; ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(diem[keo.tu].x, diem[keo.tu].y); ctx.lineTo(keo.x, keo.y); ctx.stroke();
    ctx.setLineDash([]);
  }

  // các ngôi sao của chòm
  const sauMin = Math.min(...diem.map(d => d.sau)), sauMax = Math.max(...diem.map(d => d.sau));
  for (const d of diem) {
    const gan_ = sauMax > sauMin ? 1 - (d.sau - sauMin) / (sauMax - sauMin) : 1;   // 1 = gần nhất
    const nhay = .82 + Math.sin(t / 900 + d.nhay) * .18;
    const r = ((d.sang ? 4.6 : 3.4) * (.72 + gan_ * .5)) * nhay + sangDan * 1.6;
    const q = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 5);
    const dam = d.sang ? .5 : .26;
    q.addColorStop(0, `rgba(255,244,214,${dam + sangDan * .3})`);
    q.addColorStop(1, 'rgba(255,244,214,0)');
    ctx.fillStyle = q; ctx.beginPath(); ctx.arc(d.x, d.y, r * 5, 0, 6.284); ctx.fill();
    ctx.fillStyle = d.sang ? '#fff8e4' : 'rgba(255,248,228,.82)';
    ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, 6.284); ctx.fill();
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  nap(Math.floor(Math.random() * CHOM.length));
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_CHOMSAO = { mo, dong, _v3: viTri3D, _chieuXa: chieu, _buoc: (t) => buoc(t), _chom: CHOM, _chieu: chieuSao,
  _nap: (i) => nap(i),
  _diem: () => diem.map(d => ({ x: d.x, y: d.y, sau: d.sau, ten: d.ten })),
  _xoay: (a, b) => { goc3d = [a, b]; },
  _noi: (a, b) => { const k = khoa(a, b);
    if (canhCanNoi.has(k) && !daNoi.has(k)) { daNoi.add(k); diem[a].sang = diem[b].sang = 1;
      if (daNoi.size === canhCanNoi.size) hoanThanh(); return true; } return false; },
  _debug: () => ({ chom: CHOM[chi].ten, canNoi: canhCanNoi.size, daNoi: daNoi.size, xong, soSao: diem.length }) };
})();
