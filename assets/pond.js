/* Hồ nước — chạm vào rồi nó tự sống. Không điểm, không thắng thua, không kết thúc. */
(() => {
'use strict';

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let song = [], la = [], tMua = 0;

const rnd = (a, b) => a + Math.random() * (b - a);

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'ho';
  tam.innerHTML = `
    <canvas class="ho-cv"></canvas>
    <button class="ho-dong" aria-label="Đóng">✕</button>
    <p class="ho-nhac">Chạm vào mặt nước</p>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.ho-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.ho-dong').onclick = dong;

  const cham = (e) => {
    const r = cv.getBoundingClientRect();
    themSong(e.clientX - r.left, e.clientY - r.top, 1);
    tam.querySelector('.ho-nhac').classList.add('mo');
  };
  cv.addEventListener('pointerdown', cham);
  cv.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') { if (Math.random() < .28) cham(e); } });
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  la = Array.from({ length: 5 }, () => ({
    x: rnd(W * .12, W * .88), y: rnd(H * .18, H * .88),
    r: rnd(26, 50), goc: rnd(0, 6.28), nhun: 0,
  }));
}

const themSong = (x, y, manh) => {
  if (song.length > 60) song.shift();
  song.push({ x, y, t: 0, manh, doi: rnd(2600, 3400) });
};

function veSong(s) {
  const p = s.t / s.doi;
  if (p >= 1) return false;
  const rMax = Math.max(W, H) * .42 * s.manh;
  for (let i = 0; i < 3; i++) {
    const tre = i * .13;
    const q = p - tre;
    if (q <= 0) continue;
    const r = q * rMax;
    const a = (1 - q) * (1 - q) * .5 * s.manh / (1 + i * .8);
    if (a <= .002) continue;
    ctx.strokeStyle = `rgba(190,225,240,${a})`;
    ctx.lineWidth = Math.max(.5, 2.4 * (1 - q));
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.284); ctx.stroke();
  }
  // đốm sáng ngay chỗ vừa chạm
  if (p < .3) {
    const a = (1 - p / .3) * .32 * s.manh;
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 34);
    g.addColorStop(0, `rgba(220,245,255,${a})`); g.addColorStop(1, 'rgba(220,245,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 34, 0, 6.284); ctx.fill();
  }
  return true;
}

function veLa(l, t) {
  // lá nhún khi sóng đi qua
  let nhun = 0;
  for (const s of song) {
    const d = Math.hypot(l.x - s.x, l.y - s.y);
    const rSong = (s.t / s.doi) * Math.max(W, H) * .42 * s.manh;
    const lech = Math.abs(d - rSong);
    if (lech < 40) nhun += (1 - lech / 40) * (1 - s.t / s.doi) * 5;
  }
  l.nhun += (nhun - l.nhun) * .18;
  const y = l.y + Math.sin(t / 2600 + l.goc) * 2.5 + l.nhun;

  ctx.save(); ctx.translate(l.x, y); ctx.rotate(l.goc + l.nhun * .012);
  const g = ctx.createRadialGradient(-l.r * .3, -l.r * .3, l.r * .1, 0, 0, l.r);
  g.addColorStop(0, 'rgba(70,120,96,.9)'); g.addColorStop(1, 'rgba(32,68,58,.9)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, l.r, .42, 6.284); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(150,200,170,.22)'; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = .55 + i * (5.6 / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * l.r * .9, Math.sin(a) * l.r * .9); ctx.stroke();
  }
  ctx.restore();
}

function vong(t) {
  raf = requestAnimationFrame(vong);
  buoc(t);
}

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0e2430'); g.addColorStop(.5, '#0d1c2c'); g.addColorStop(1, '#080f1c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // vệt trăng loang trên mặt nước
  const m = ctx.createRadialGradient(W * .5, H * .2, 10, W * .5, H * .2, Math.max(W, H) * .7);
  m.addColorStop(0, 'rgba(150,200,230,.10)'); m.addColorStop(1, 'rgba(150,200,230,0)');
  ctx.fillStyle = m; ctx.fillRect(0, 0, W, H);

  tMua -= dt;
  if (tMua <= 0) { themSong(rnd(0, W), rnd(0, H), rnd(.28, .5)); tMua = rnd(1400, 3800); }

  for (let i = song.length - 1; i >= 0; i--) { song[i].t += dt; if (!veSong(song[i])) song.splice(i, 1); }
  for (const l of la) veLa(l, t);
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  song = []; tMua = 900;
  tam.querySelector('.ho-nhac').classList.remove('mo');
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  song = [];
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_HO = { mo, dong, _buoc: (t) => buoc(t), _cham: (x, y) => themSong(x, y, 1), _debug: () => ({ song: song.length, la: la.length, W, H }) };
})();
