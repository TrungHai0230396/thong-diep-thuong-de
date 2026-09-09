/* Hộp thở — thở vuông 4 nhịp: hít vào, giữ, thở ra, giữ. Không điểm, không thể sai. */
(() => {
'use strict';

const NHIP = [
  { ten: 'Hít vào', giay: 4, tu: .52, den: 1 },
  { ten: 'Giữ',     giay: 4, tu: 1,   den: 1 },
  { ten: 'Thở ra',  giay: 4, tu: 1,   den: .52 },
  { ten: 'Giữ',     giay: 4, tu: .52, den: .52 },
];
const TONG = NHIP.reduce((s, n) => s + n.giay, 0) * 1000;

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let chay = false, troi = 0, vong_ = 0, nhipTruoc = -1;

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'hopho';
  tam.innerHTML = `
    <canvas class="ht-cv"></canvas>
    <button class="ht-dong" aria-label="Đóng">✕</button>
    <div class="ht-giua">
      <p class="ht-nhip">Hít vào</p>
      <p class="ht-dem">4</p>
    </div>
    <p class="ht-vong"></p>
    <div class="ht-mo">
      <h2>Hộp thở</h2>
      <p>Bốn giây hít vào, bốn giây giữ, bốn giây thở ra, bốn giây giữ.<br>Chỉ cần thở theo vòng tròn.</p>
      <button class="primary ht-batdau">Bắt đầu</button>
    </div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.ht-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.ht-dong').onclick = dong;
  tam.querySelector('.ht-batdau').onclick = batDau;
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

const muot = (x) => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;   // vào chậm ra chậm

function batDau() {
  tam.querySelector('.ht-mo').hidden = true;
  tam.querySelector('.ht-giua').classList.add('hien');
  chay = true; troi = 0; vong_ = 0; nhipTruoc = -1;
  tTruoc = performance.now();
}

function vong(t) {
  raf = requestAnimationFrame(vong);
  buoc(t);
}

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  if (chay) troi += dt;

  const R = Math.min(W, H) * .30;
  const cx = W / 2, cy = H / 2;

  ctx.clearRect(0, 0, W, H);
  const nen = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * .75);
  nen.addColorStop(0, '#221b46'); nen.addColorStop(1, '#0c0a1c');
  ctx.fillStyle = nen; ctx.fillRect(0, 0, W, H);

  // xác định nhịp hiện tại
  let co = NHIP[0].tu, conLai = NHIP[0].giay, chiSo = 0, tienDo = 0;
  if (chay) {
    const trong = troi % TONG;
    vong_ = Math.floor(troi / TONG);
    let m = 0;
    for (let i = 0; i < NHIP.length; i++) {
      const d = NHIP[i].giay * 1000;
      if (trong < m + d) {
        chiSo = i;
        const p = (trong - m) / d;
        co = NHIP[i].tu + (NHIP[i].den - NHIP[i].tu) * muot(p);
        conLai = Math.ceil(NHIP[i].giay - p * NHIP[i].giay);
        tienDo = trong / TONG;
        break;
      }
      m += d;
    }
    if (chiSo !== nhipTruoc) {
      nhipTruoc = chiSo;
      tam.querySelector('.ht-nhip').textContent = NHIP[chiSo].ten;
      tam.querySelector('.ht-vong').textContent = vong_ > 0 ? `vòng ${vong_ + 1}` : '';
      if (navigator.vibrate) { try { navigator.vibrate(18); } catch (e) {} }
    }
    tam.querySelector('.ht-dem').textContent = conLai;
  }

  // vòng tròn thở
  const r = R * co;
  const g = ctx.createRadialGradient(cx, cy, r * .2, cx, cy, r);
  g.addColorStop(0, 'rgba(184,168,232,.30)'); g.addColorStop(1, 'rgba(184,168,232,.05)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.284); ctx.fill();
  ctx.strokeStyle = 'rgba(200,186,240,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.284); ctx.stroke();

  ctx.strokeStyle = 'rgba(200,186,240,.14)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.284); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * .52, 0, 6.284); ctx.stroke();

  // cung tiến độ một vòng thở
  if (chay) {
    ctx.strokeStyle = 'rgba(232,195,122,.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, -Math.PI / 2, -Math.PI / 2 + tienDo * 6.283); ctx.stroke();
    // chấm chạy theo cung
    const a = -Math.PI / 2 + tienDo * 6.283;
    ctx.fillStyle = '#e8c37a';
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R * 1.28, cy + Math.sin(a) * R * 1.28, 5, 0, 6.284); ctx.fill();
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  chay = false;
  tam.querySelector('.ht-mo').hidden = false;
  tam.querySelector('.ht-giua').classList.remove('hien');
  tam.querySelector('.ht-vong').textContent = '';
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  chay = false;
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_THO = { mo, dong, _buoc: (t) => buoc(t), _batDau: batDau,
  _debug: () => ({ chay, troi: Math.round(troi), vong: vong_, nhip: tam && tam.querySelector('.ht-nhip').textContent,
                   dem: tam && tam.querySelector('.ht-dem').textContent }) };
})();
