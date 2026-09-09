/* Chém Trái Cây — Đồ Long Đao. Game xả stress, không lưu điểm, đóng là hết. */
(() => {
'use strict';

const TRAI = [
  { ten: 'dưa hấu',   vo: '#2f7d3a', vo2: '#1d5827', ruot: '#e8455f', r: 46, hat: true },
  { ten: 'cam',       vo: '#f08a1d', vo2: '#c96a08', ruot: '#ffb454', r: 36 },
  { ten: 'chanh',     vo: '#8bc34a', vo2: '#5f9227', ruot: '#e8f0a8', r: 30 },
  { ten: 'thanh long',vo: '#e0407a', vo2: '#ab255a', ruot: '#f7eef2', r: 40, dom: true },
  { ten: 'dừa',       vo: '#7b5230', vo2: '#4e3018', ruot: '#f6efe2', r: 38 },
  { ten: 'xoài',      vo: '#f2c033', vo2: '#cf9410', ruot: '#ffdf7a', r: 34, det: .78 },
  { ten: 'măng cụt',  vo: '#6b3b6e', vo2: '#46224a', ruot: '#f4eaf2', r: 32 },
];

let cv, ctx, W, H, DPR, raf = null, dangChay = false, tam = null;
let trai = [], nua = [], hat = [], vet = [], bom = [];
let diem = 0, mang = 3, combo = 0, tCombo = 0, tSpawn = 0, rung = 0, chop = 0, ketThuc = false;
let chuot = { x: 0, y: 0, xuong: false, chuot_that: false };
let tTruoc = 0;

const rnd = (a, b) => a + Math.random() * (b - a);
const chon = (m) => m[Math.floor(Math.random() * m.length)];

/* ---------- dựng khung ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'game';
  tam.innerHTML = `
    <canvas class="game-cv"></canvas>
    <div class="game-hud">
      <div class="g-diem"><span class="g-so">0</span><span class="g-nhan"></span></div>
      <div class="g-mang"></div>
      <button class="g-dong" aria-label="Đóng">✕</button>
    </div>
    <div class="game-mo">
      <div class="g-dao">
        <svg viewBox="0 0 240 60" aria-hidden="true">
          <defs><linearGradient id="ldao" x1="0" x2="1">
            <stop offset="0" stop-color="#8a7a4a"/><stop offset=".45" stop-color="#f5e6b8"/>
            <stop offset=".7" stop-color="#e8c37a"/><stop offset="1" stop-color="#7a6636"/>
          </linearGradient></defs>
          <path d="M14 40q70-26 176-32l38 6q-16 14-44 20Q96 46 20 47z" fill="url(#ldao)"/>
          <path d="M20 47q76-1 164-13" fill="none" stroke="#fff8e0" stroke-opacity=".7" stroke-width="1.4"/>
          <rect x="4" y="34" width="20" height="15" rx="4" fill="#3a2a12" stroke="#c9a24d" stroke-width="1.2"/>
        </svg>
      </div>
      <h2>Đồ Long Đao</h2>
      <p class="g-phu">Đao này chém trái cây. Xả cho nhẹ người.</p>
      <button class="primary g-batdau">Rút đao</button>
      <p class="g-cach"></p>
    </div>
    <div class="game-het" hidden>
      <h2>Hết mạng</h2>
      <p class="g-tong"></p>
      <button class="primary g-lai">Chém tiếp</button>
      <button class="ghost g-thoi">Thôi, đủ rồi</button>
    </div>`;
  document.body.appendChild(tam);

  cv = tam.querySelector('.game-cv');
  ctx = cv.getContext('2d');

  tam.querySelector('.g-dong').onclick = dong;
  tam.querySelector('.g-batdau').onclick = batDau;
  tam.querySelector('.g-lai').onclick = batDau;
  tam.querySelector('.g-thoi').onclick = dong;
  tam.querySelector('.g-cach').textContent = matchMedia('(pointer:coarse)').matches
    ? 'Miết ngón tay qua trái cây. Tránh quả bom.'
    : 'Rê chuột qua trái cây. Tránh quả bom.';

  cv.addEventListener('pointerdown', e => { chuot.xuong = true; ghiChuot(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', () => { chuot.xuong = false; vet.length = 0; });
  cv.addEventListener('pointercancel', () => { chuot.xuong = false; vet.length = 0; });
  cv.addEventListener('pointermove', e => { chuot.chuot_that = e.pointerType === 'mouse'; ghiChuot(e); });
  addEventListener('resize', doCo);
}

function ghiChuot(e) {
  const r = cv.getBoundingClientRect();
  chuot.x = e.clientX - r.left;
  chuot.y = e.clientY - r.top;
  if (dangChay && !ketThuc && (chuot.xuong || chuot.chuot_that)) {
    vet.push({ x: chuot.x, y: chuot.y, t: performance.now() });
    if (vet.length > 16) vet.shift();
  }
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

/* ---------- vòng đời ---------- */
function batDau() {
  trai = []; nua = []; hat = []; bom = []; vet = [];
  diem = 0; mang = 3; combo = 0; tCombo = 0; tSpawn = 0; rung = 0; chop = 0;
  ketThuc = false; dangChay = true;
  tam.querySelector('.game-mo').hidden = true;
  tam.querySelector('.game-het').hidden = true;
  veHud();
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function het() {
  ketThuc = true; dangChay = false;
  const h = tam.querySelector('.game-het');
  tam.querySelector('.g-tong').textContent = `Chém được ${diem} điểm.`;
  h.hidden = false;
  tam.querySelector('.game-mo').hidden = true;
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  tam.querySelector('.game-mo').hidden = false;
  tam.querySelector('.game-het').hidden = true;
  veHud();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  dangChay = false;
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

/* ---------- sinh trái ---------- */
function sinh() {
  const soLuong = Math.random() < .18 ? 3 : Math.random() < .45 ? 2 : 1;
  for (let i = 0; i < soLuong; i++) {
    const laBom = Math.random() < .13;
    const cao = rnd(H * .52, H * .82);
    const x = rnd(W * .12, W * .88);
    const g = 1.25e-6 * H;                      // px/ms²: bay lên ~1 giây rồi rơi
    const vy = -Math.sqrt(2 * g * cao);
    const vx = (W / 2 - x) / rnd(700, 1400) + rnd(-.05, .05);
    const o = { x, y: H + 60, vx, vy, g, goc: rnd(0, 6.28), vgoc: rnd(-.004, .004) };
    if (laBom) { o.r = 30; bom.push(o); }
    else { const t = chon(TRAI); Object.assign(o, { loai: t, r: t.r * (W < 420 ? .82 : 1) }); trai.push(o); }
  }
}

/* ---------- va chạm ---------- */
function catQua(dt) {
  if (vet.length < 2) return;
  const a = vet[vet.length - 2], b = vet[vet.length - 1];
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.hypot(dx, dy) < 9) return;              // phải vung đủ nhanh mới ăn

  const chamVao = (o) => {
    const fx = o.x - a.x, fy = o.y - a.y;
    const d2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, (fx * dx + fy * dy) / d2));
    return Math.hypot(fx - dx * t, fy - dy * t) < o.r;
  };

  for (let i = trai.length - 1; i >= 0; i--) {
    if (!chamVao(trai[i])) continue;
    const o = trai.splice(i, 1)[0];
    const goc = Math.atan2(dy, dx);
    tachDoi(o, goc);
    combo++; tCombo = 320;
    diem += 10 * Math.min(combo, 5);
    veHud();
  }
  for (let i = bom.length - 1; i >= 0; i--) {
    if (!chamVao(bom[i])) continue;
    bom.splice(i, 1);
    no();
  }
}

function tachDoi(o, goc) {
  for (const ben of [-1, 1]) {
    nua.push({
      x: o.x, y: o.y, r: o.r, loai: o.loai, ben, gocCat: goc,
      vx: o.vx + Math.cos(goc + ben * Math.PI / 2) * .22,
      vy: o.vy * .55 + Math.sin(goc + ben * Math.PI / 2) * .22 - .05,
      g: o.g, goc: 0, vgoc: ben * rnd(.0015, .004),
    });
  }
  for (let i = 0; i < 16; i++) {
    const a = rnd(0, 6.28), s = rnd(.05, .38);
    hat.push({ x: o.x, y: o.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(2, 5.5), mau: o.loai.ruot, doi: 1 });
  }
}

function no() {
  rung = 420; chop = 320; combo = 0;
  mang--; veHud();
  for (let i = 0; i < 26; i++) {
    const a = rnd(0, 6.28), s = rnd(.1, .5);
    hat.push({ x: chuot.x, y: chuot.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(2, 7), mau: i % 3 ? '#ff9d3d' : '#5a5a5a', doi: 1 });
  }
  if (mang <= 0) setTimeout(het, 420);
}

/* ---------- vẽ ---------- */
function veHud() {
  if (!tam) return;
  tam.querySelector('.g-so').textContent = diem;
  tam.querySelector('.g-nhan').textContent = combo >= 2 ? `×${Math.min(combo, 5)}` : '';
  tam.querySelector('.g-mang').innerHTML =
    '<span class="tim day">❤</span>'.repeat(Math.max(0, mang)) +
    '<span class="tim">♡</span>'.repeat(Math.max(0, 3 - mang));
}

function veQua(o) {
  const t = o.loai, det = t.det || 1;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc); ctx.scale(1, det);
  const g = ctx.createRadialGradient(-o.r * .3, -o.r * .35, o.r * .1, 0, 0, o.r);
  g.addColorStop(0, t.vo); g.addColorStop(1, t.vo2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, 6.284); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.22)';
  ctx.beginPath(); ctx.ellipse(-o.r * .32, -o.r * .38, o.r * .26, o.r * .16, -.6, 0, 6.284); ctx.fill();
  ctx.restore();
}

function veNua(n) {
  const t = n.loai, det = t.det || 1;
  ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(n.gocCat + n.goc); ctx.scale(1, det);
  if (n.ben < 0) ctx.scale(1, -1);
  ctx.beginPath(); ctx.arc(0, 0, n.r, 0, Math.PI); ctx.closePath();
  const g = ctx.createRadialGradient(-n.r * .3, n.r * .3, n.r * .1, 0, 0, n.r);
  g.addColorStop(0, t.vo); g.addColorStop(1, t.vo2);
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = t.ruot;
  ctx.beginPath(); ctx.ellipse(0, 0, n.r * .96, n.r * .82, 0, 0, 6.284); ctx.fill();
  if (t.hat) { ctx.fillStyle = '#2a1a12';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * n.r * .3, n.r * .34, n.r * .07, n.r * .11, 0, 0, 6.284); ctx.fill(); } }
  if (t.dom) { ctx.fillStyle = '#2b2b33';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(rnd(-.6, .6) * n.r, rnd(.05, .6) * n.r, n.r * .045, 0, 6.284); ctx.fill(); } }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-n.r, 0); ctx.lineTo(n.r, 0); ctx.stroke();
  ctx.restore();
}

function veBom(o) {
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc);
  const g = ctx.createRadialGradient(-o.r * .3, -o.r * .35, o.r * .1, 0, 0, o.r);
  g.addColorStop(0, '#4a4a55'); g.addColorStop(1, '#141419');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, 6.284); ctx.fill();
  ctx.strokeStyle = '#c94f3d'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -o.r); ctx.quadraticCurveTo(o.r * .5, -o.r * 1.5, o.r * .2, -o.r * 1.8); ctx.stroke();
  ctx.fillStyle = '#ffcf5a'; ctx.beginPath();
  ctx.arc(o.r * .2, -o.r * 1.85, 3.4 + Math.sin(performance.now() / 70) * 1.4, 0, 6.284); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath(); ctx.ellipse(-o.r * .3, -o.r * .34, o.r * .24, o.r * .14, -.6, 0, 6.284); ctx.fill();
  ctx.restore();
}

/* Vệt Đồ Long Đao: lưỡi vàng nặng, lõi trắng, có quầng sáng. */
function veDao() {
  if (vet.length < 3) return;
  const n = vet.length;
  const day = (i) => 1.5 + 19 * (i / (n - 1)) ** 1.6;
  const tren = [], duoi = [];
  for (let i = 0; i < n; i++) {
    const p = vet[i];
    const q = vet[Math.min(i + 1, n - 1)], r = vet[Math.max(i - 1, 0)];
    const a = Math.atan2(q.y - r.y, q.x - r.x) + Math.PI / 2;
    const d = day(i) / 2;
    tren.push([p.x + Math.cos(a) * d, p.y + Math.sin(a) * d]);
    duoi.push([p.x - Math.cos(a) * d, p.y - Math.sin(a) * d]);
  }
  const duong = () => {
    ctx.beginPath(); ctx.moveTo(tren[0][0], tren[0][1]);
    for (const [x, y] of tren) ctx.lineTo(x, y);
    for (let i = duoi.length - 1; i >= 0; i--) ctx.lineTo(duoi[i][0], duoi[i][1]);
    ctx.closePath();
  };
  const g = ctx.createLinearGradient(vet[0].x, vet[0].y, vet[n - 1].x, vet[n - 1].y);
  g.addColorStop(0, 'rgba(122,102,54,0)'); g.addColorStop(.45, 'rgba(232,195,122,.85)');
  g.addColorStop(.85, 'rgba(255,248,224,.98)'); g.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.save();
  ctx.shadowColor = 'rgba(232,195,122,.85)'; ctx.shadowBlur = 22;
  ctx.fillStyle = g; duong(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(vet[0].x, vet[0].y);
  for (const p of vet) ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.restore();
}

/* ---------- vòng lặp ---------- */
function vong(t) {
  raf = requestAnimationFrame(vong);
  buoc(t);
}

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;   // chặn âm, phòng đồng hồ nhảy lùi

  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (rung > 0) { rung -= dt; const m = rung / 420 * 9; ctx.translate(rnd(-m, m), rnd(-m, m)); }
  ctx.clearRect(-20, -20, W + 40, H + 40);

  if (dangChay && !ketThuc) {
    tSpawn -= dt;
    if (tSpawn <= 0) { sinh(); tSpawn = rnd(620, 1150) * (diem > 300 ? .78 : 1); }
    if (tCombo > 0) { tCombo -= dt; if (tCombo <= 0 && combo) { combo = 0; veHud(); } }
    catQua(dt);
  }

  const buoc = (o) => { o.x += o.vx * dt; o.vy += o.g * dt; o.y += o.vy * dt; o.goc += o.vgoc * dt; };

  for (let i = trai.length - 1; i >= 0; i--) {
    const o = trai[i]; buoc(o); veQua(o);
    if (o.y - o.r > H + 80) {
      trai.splice(i, 1);
      if (dangChay && !ketThuc) { mang--; combo = 0; veHud(); chop = 180; if (mang <= 0) het(); }
    }
  }
  for (let i = bom.length - 1; i >= 0; i--) { const o = bom[i]; buoc(o); veBom(o); if (o.y - o.r > H + 80) bom.splice(i, 1); }
  for (let i = nua.length - 1; i >= 0; i--) { const n = nua[i]; buoc(n); veNua(n); if (n.y - n.r > H + 120) nua.splice(i, 1); }
  for (let i = hat.length - 1; i >= 0; i--) {
    const p = hat[i];
    p.x += p.vx * dt; p.vy += 1.6e-6 * H * dt; p.y += p.vy * dt; p.doi -= dt / 900;
    if (p.doi <= 0 || p.y > H + 40) { hat.splice(i, 1); continue; }
    ctx.globalAlpha = Math.max(0, p.doi); ctx.fillStyle = p.mau;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.284); ctx.fill(); ctx.globalAlpha = 1;
  }

  const gio = performance.now();
  while (vet.length && gio - vet[0].t > 190) vet.shift();
  if (dangChay && !ketThuc) veDao();

  if (chop > 0) { chop -= dt; ctx.fillStyle = `rgba(220,60,50,${chop / 320 * .3})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_GAME = { mo, dong,
  _buoc: (t) => buoc(t),                       // chạy tay một khung hình, dùng khi kiểm thử
  _vung: (x, y, t) => { vet.push({ x, y, t }); if (vet.length > 16) vet.shift(); },
  _batDau: batDau,
  _debug: () => ({ dangChay, ketThuc, W, H, trai: trai.length, bom: bom.length, nua: nua.length, hat: hat.length, vet: vet.length, diem, mang, tSpawn, y0: trai[0] && Math.round(trai[0].y), vy0: trai[0] && +trai[0].vy.toFixed(4) }) };
})();
