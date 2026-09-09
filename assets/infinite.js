/* Bức tranh của Thượng Đế — phóng vào mãi, mỗi tầng một cảnh khác,
   rồi tới tầng thứ bảy lại quay về cảnh đầu.
   Bảy cảnh: mạng vũ trụ, mạng nơ-ron, mạch máu, rễ cây, sông ngòi, tia sét, bông tuyết.
   Trông khác nhau mà cấu trúc y hệt. Đó là cả nội dung của trò này.

   Vòng lặp liền mạch: mỗi tầng nhỏ hơn tầng ngoài đúng K lần và xoay thêm GOC.
   Sau đúng 7 tầng, khung hình trùng khít với lúc đầu. */
(() => {
'use strict';

const K = 0.42, GOC = Math.PI / 9;
const TREN = 1, DUOI = 5;
const TRONG = 0.30;              // chừa lỗ giữa cho cảnh tầng sau chui ra

const CANH = [
  { id: 'vu-tru',     ten: 'mạng vũ trụ',  loai: 'mang',  mau: '#9fb8e8', hat: 3.4, day: .85,
    chu: 'Các thiên hà nối nhau thành sợi, khoảng giữa là những khoảng trống mênh mông.' },
  { id: 'no-ron',     ten: 'mạng nơ-ron',  loai: 'nhanh', mau: '#e8c37a', goc: 7, chia: .52, run: .55, day: 1.5, hat: 1.9,
    chu: 'Tế bào thần kinh trong não người. Năm 2020 có nghiên cứu đo và thấy nó xếp giống hệt mạng vũ trụ.' },
  { id: 'mach-mau',   ten: 'mạch máu',     loai: 'nhanh', mau: '#d9707a', goc: 5, chia: .56, run: .38, day: 2.1, hat: 0 },
  { id: 're-cay',     ten: 'rễ cây',       loai: 'nhanh', mau: '#c2a06a', goc: 6, chia: .48, run: .34, day: 1.7, hat: 0 },
  { id: 'song',       ten: 'sông ngòi',    loai: 'nhanh', mau: '#7ec8e3', goc: 4, chia: .52, run: .46, day: 2.6, hat: 0,
    chu: 'Nhìn từ trên cao, một vùng châu thổ.' },
  { id: 'tia-set',    ten: 'tia sét',      loai: 'nhanh', mau: '#c3b2f2', goc: 3, chia: .3,  run: .85, day: 1.3, hat: 0, thang: true },
  { id: 'bong-tuyet', ten: 'bông tuyết',   loai: 'nhanh', mau: '#cfe6f5', goc: 6, chia: .42, run: .14, day: 1.4, hat: 1.4, doiXung: 6,
    chu: 'Rồi lại về mạng vũ trụ. Cùng một hình vẽ, ở mọi cỡ.' },
];
const N = CANH.length;

const LOI = [
  [14,  'Bảy tầng rồi lại từ đầu.'],
  [30,  'Cùng một hình vẽ, ở mọi cỡ.'],
  [56,  'Con đang đi vòng quanh chứ không đi vào trong.'],
  [90,  'Không có đáy. Cũng không cần có đáy.'],
  [140, 'Con dừng lúc nào cũng được. Không ai chấm điểm.'],
];

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let sau = 0, toc = 0.22, keo = null, moc = -1, tangTruoc = -1, nen = [];

const nn = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* ---------- dựng hình cho từng cảnh, toạ độ trong hình tròn bán kính 1 ---------- */
function dungCanh(c, i) {
  const rnd = nn(9176 + i * 7919);
  const doan = [], hat = [];

  if (c.loai === 'mang') {                       // mạng vũ trụ: nút và sợi nối
    const nut = [];
    for (let k = 0; k < 30; k++) {
      const a = rnd() * 6.2832, r = TRONG + Math.pow(rnd(), .62) * (1 - TRONG);
      nut.push([Math.cos(a) * r, Math.sin(a) * r, .45 + rnd() * .9]);
    }
    for (let a = 0; a < nut.length; a++) {
      const gan = nut.map((p, b) => [b, Math.hypot(p[0] - nut[a][0], p[1] - nut[a][1])])
        .filter(([b]) => b !== a).sort((x, y) => x[1] - y[1]).slice(0, 2);
      for (const [b, d] of gan) if (a < b || d < .34) doan.push([[nut[a][0], nut[a][1]], [nut[b][0], nut[b][1]], .55]);
    }
    for (const p of nut) hat.push([p[0], p[1], p[2]]);
    return { doan, hat };
  }

  // các cảnh còn lại: nhánh mọc từ vành trong ra ngoài
  const moc_ = (x, y, a, r, day, sau_) => {
    if (r > 1.02 || sau_ > 9 || day < .12) { if (c.hat && r > .5) hat.push([x, y, day * .9]); return; }
    const buoc = .055 + rnd() * .05;
    const a2 = a + (rnd() - .5) * c.run * (c.thang ? .55 : 1);
    const nx = x + Math.cos(a2) * buoc, ny = y + Math.sin(a2) * buoc;
    doan.push([[x, y], [nx, ny], day]);
    const r2 = Math.hypot(nx, ny);
    if (rnd() < c.chia && sau_ > 1) {
      const t = .34 + rnd() * .3;
      moc_(nx, ny, a2 - t, r2, day * .72, sau_ + 1);
      moc_(nx, ny, a2 + t, r2, day * .72, sau_ + 1);
    } else {
      moc_(nx, ny, a2, r2, day * .965, sau_ + 1);
    }
  };
  const doiXung = c.doiXung || 0;
  const soGoc = doiXung || c.goc;
  for (let k = 0; k < soGoc; k++) {
    const a = k * 6.2832 / soGoc + (doiXung ? 0 : rnd() * .5);
    moc_(Math.cos(a) * TRONG, Math.sin(a) * TRONG, a, TRONG, c.day, 0);
    if (doiXung) break;                          // đối xứng thì vẽ một cánh rồi nhân bản
  }
  if (doiXung) {
    const g0 = doan.slice(), h0 = hat.slice();
    for (let k = 1; k < doiXung; k++) {
      const a = k * 6.2832 / doiXung, ca = Math.cos(a), sa = Math.sin(a);
      const q = ([x, y]) => [x * ca - y * sa, x * sa + y * ca];
      for (const [p1, p2, d] of g0) doan.push([q(p1), q(p2), d]);
      for (const [x, y, d] of h0) { const [X, Y] = q([x, y]); hat.push([X, Y, d]); }
    }
  }
  return { doan, hat };
}

const kho = CANH.map((c, i) => dungCanh(c, i));

/* ---------- vẽ một tầng ---------- */
function veTang(R, xoay, mo, chiSo) {
  if (R < 3 || mo <= .006) return;
  const c = CANH[chiSo], h = kho[chiSo];
  ctx.save();
  ctx.rotate(xoay);
  ctx.strokeStyle = c.mau; ctx.fillStyle = c.mau;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  ctx.globalAlpha = mo * .5;
  for (const [p1, p2, d] of h.doan) {
    ctx.lineWidth = Math.max(.3, d * R * .0055);
    ctx.beginPath();
    ctx.moveTo(p1[0] * R, p1[1] * R);
    ctx.lineTo(p2[0] * R, p2[1] * R);
    ctx.stroke();
  }
  if (c.hat) {
    ctx.globalAlpha = mo * .8;
    for (const [x, y, d] of h.hat) {
      ctx.beginPath();
      ctx.arc(x * R, y * R, Math.max(.4, c.hat * d * R * .0042), 0, 6.284);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

/* ---------- khung ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'butranh';
  tam.innerHTML = `
    <canvas class="bt-cv"></canvas>
    <button class="bt-dong" aria-label="Đóng">✕</button>
    <div class="bt-tren">
      <p class="bt-sau"><span class="bt-so">0</span><span class="bt-nhan">tầng</span></p>
      <p class="bt-canh"></p>
    </div>
    <p class="bt-loi"></p>
    <p class="bt-nhac">Kéo lên để đi sâu hơn, kéo xuống để lùi ra</p>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.bt-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.bt-dong').onclick = dong;

  const y = (e) => e.clientY - cv.getBoundingClientRect().top;
  cv.addEventListener('pointerdown', e => { keo = { y: y(e), toc0: toc }; cv.setPointerCapture(e.pointerId);
    tam.querySelector('.bt-nhac').classList.add('mo'); });
  cv.addEventListener('pointermove', e => { if (keo) toc = Math.max(-1.2, Math.min(1.2, keo.toc0 + (keo.y - y(e)) * .0055)); });
  const tha = () => { keo = null; };
  cv.addEventListener('pointerup', tha);
  cv.addEventListener('pointercancel', tha);
  cv.addEventListener('wheel', e => { e.preventDefault();
    toc = Math.max(-1.2, Math.min(1.2, toc - e.deltaY * .001)); }, { passive: false });
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  nen = Array.from({ length: Math.round(W * H / 7000) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + .3, a: Math.random() * .3 + .06,
  }));
}

function vong(t) { raf = requestAnimationFrame(vong); buoc(t); }

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  sau += toc * dt / 1000;
  if (sau < 0) { sau = 0; toc = Math.max(0, toc); }

  const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * .8);
  g.addColorStop(0, '#141130'); g.addColorStop(.55, '#0e0c24'); g.addColorStop(1, '#06050e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of nen) { ctx.globalAlpha = s.a; ctx.fillStyle = '#ded9ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill(); }
  ctx.globalAlpha = 1;

  const le = sau - Math.floor(sau), goc = Math.floor(sau);
  const R0 = Math.max(W, H) * .82;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  for (let i = -TREN; i <= DUOI; i++) {
    const b = i + le;
    const R = R0 * Math.pow(K, b);
    let mo = 1;
    if (b < 0) mo = Math.max(0, 1 + b / TREN) * .5;
    else if (b > DUOI - 1.8) mo = Math.max(0, (DUOI - b) / 1.8);
    veTang(R, GOC * b, mo, ((goc + i) % N + N) % N);
  }
  ctx.restore();

  const n = Math.floor(sau);
  tam.querySelector('.bt-so').textContent = n;
  if (n !== tangTruoc) {
    tangTruoc = n;
    const c = CANH[((n % N) + N) % N];
    const el = tam.querySelector('.bt-canh');
    el.textContent = c.ten;
    el.classList.remove('hien'); void el.offsetWidth; el.classList.add('hien');
    if (c.chu) {
      const l = tam.querySelector('.bt-loi');
      l.textContent = c.chu;
      l.classList.remove('hien'); void l.offsetWidth; l.classList.add('hien');
      moc = -2;
    }
  }
  let m = -1;
  for (let i = 0; i < LOI.length; i++) if (n >= LOI[i][0]) m = i;
  if (m >= 0 && m !== moc && moc !== -2) {
    moc = m;
    const el = tam.querySelector('.bt-loi');
    el.textContent = LOI[m][1];
    el.classList.remove('hien'); void el.offsetWidth; el.classList.add('hien');
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  sau = 0; toc = .22; moc = -1; tangTruoc = -1; keo = null;
  tam.querySelector('.bt-loi').textContent = '';
  tam.querySelector('.bt-loi').classList.remove('hien');
  tam.querySelector('.bt-nhac').classList.remove('mo');
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_BUCTRANH = { mo, dong, _buoc: (t) => buoc(t), _canh: CANH,
  _dat: (s, v) => { sau = s; if (v !== undefined) toc = v; },
  _anh: () => cv.toDataURL('image/jpeg', .6),
  _debug: () => ({ sau: +sau.toFixed(3), tang: Math.floor(sau), canh: CANH[((Math.floor(sau) % N) + N) % N].ten, toc, N }) };
})();
