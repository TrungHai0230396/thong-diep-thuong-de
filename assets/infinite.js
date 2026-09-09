/* Bức tranh của Thượng Đế — một hình chứa chính nó, phóng vào mãi không hết.
   Mẹo ở đây: mỗi tầng nhỏ hơn tầng trước đúng K lần và xoay đúng GOC độ.
   Nên khi độ sâu tăng thêm 1, toàn bộ khung hình trùng khít với lúc đầu.
   Vòng lặp liền mạch tuyệt đối, không có điểm nối, không có đáy. */
(() => {
'use strict';

const K = 0.5;                       // mỗi tầng nhỏ đi một nửa
const GOC = Math.PI / 7;             // và xoay thêm chừng ấy
const TIA = 12;                      // số tia mỗi tầng
const TREN = 3, DUOI = 9;            // vẽ mấy tầng phía ngoài và phía trong

const LOI = [
  [8,   'Con đang đi vào trong.'],
  [18,  'Vẫn còn nữa.'],
  [32,  'Bức tranh không đổi. Con có để ý không?'],
  [50,  'Vì con không đi vào trong. Con đang đi vòng quanh.'],
  [75,  'Mỗi tầng là một đời. Tầng nào cũng y như tầng trước.'],
  [110, 'Không có đáy. Cũng không cần có đáy.'],
  [160, 'Con dừng lúc nào cũng được. Không ai chấm điểm.'],
  [230, 'Vẫn còn đi à. Ta ngồi đây với con.'],
];

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let sau = 0, toc = 0.55, keo = null, moc = -1, nen = [];

const dungKhung = () => {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'butranh';
  tam.innerHTML = `
    <canvas class="bt-cv"></canvas>
    <button class="bt-dong" aria-label="Đóng">✕</button>
    <div class="bt-tren">
      <p class="bt-sau"><span class="bt-so">0</span><span class="bt-nhan">tầng</span></p>
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
  cv.addEventListener('pointermove', e => {
    if (!keo) return;
    toc = Math.max(-3.2, Math.min(3.2, keo.toc0 + (keo.y - y(e)) * .013));
  });
  const tha = () => { keo = null; };
  cv.addEventListener('pointerup', tha);
  cv.addEventListener('pointercancel', tha);
  cv.addEventListener('wheel', e => { e.preventDefault();
    toc = Math.max(-3.2, Math.min(3.2, toc - e.deltaY * .002)); }, { passive: false });
  addEventListener('resize', doCo);
};

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  nen = Array.from({ length: Math.round(W * H / 6000) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .3, a: Math.random() * .35 + .07,
  }));
}

/* Một tầng: vòng tròn, các tia, hạt ở đầu tia, và một mặt trời con ở giữa. */
function veTang(R, xoay, mo) {
  if (R < 1.5 || mo <= .004) return;
  ctx.save();
  ctx.rotate(xoay);
  ctx.globalAlpha = mo;

  ctx.strokeStyle = '#e8c37a';
  ctx.lineWidth = Math.max(.4, R * .008);
  ctx.globalAlpha = mo * .5;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.284); ctx.stroke();
  ctx.globalAlpha = mo * .22;
  ctx.beginPath(); ctx.arc(0, 0, R * .74, 0, 6.284); ctx.stroke();

  ctx.globalAlpha = mo * .62;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(.4, R * .011);
  for (let i = 0; i < TIA; i++) {
    const a = i * 6.2832 / TIA;
    const c = Math.cos(a), s = Math.sin(a);
    ctx.beginPath();
    ctx.moveTo(c * R * .78, s * R * .78);
    ctx.lineTo(c * R * .97, s * R * .97);
    ctx.stroke();
  }
  ctx.globalAlpha = mo * .85;
  ctx.fillStyle = '#f4dca6';
  for (let i = 0; i < TIA; i++) {
    const a = (i + .5) * 6.2832 / TIA;
    ctx.beginPath(); ctx.arc(Math.cos(a) * R * .87, Math.sin(a) * R * .87, Math.max(.5, R * .018), 0, 6.284); ctx.fill();
  }

  // cánh hoa giữa
  ctx.globalAlpha = mo * .3;
  ctx.strokeStyle = '#c9a24d';
  ctx.lineWidth = Math.max(.35, R * .006);
  for (let i = 0; i < TIA / 2; i++) {
    const a = i * 6.2832 / (TIA / 2);
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * R * .38, Math.sin(a) * R * .38, R * .34, R * .13, a, 0, 6.284);
    ctx.stroke();
  }

  // mặt trời con ở tâm, chính là mầm của tầng kế tiếp
  ctx.globalAlpha = mo;
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * .17);
  g.addColorStop(0, 'rgba(255,240,205,.95)');
  g.addColorStop(.55, 'rgba(232,195,122,.5)');
  g.addColorStop(1, 'rgba(232,195,122,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, R * .17, 0, 6.284); ctx.fill();

  ctx.restore();
}

function vong(t) { raf = requestAnimationFrame(vong); buoc(t); }

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  sau += toc * dt / 1000;
  if (sau < 0) { sau = 0; toc = Math.max(0, toc); }

  const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * .8);
  g.addColorStop(0, '#1b1540'); g.addColorStop(.55, '#120f2c'); g.addColorStop(1, '#07060f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of nen) {
    ctx.globalAlpha = s.a; ctx.fillStyle = '#ded9ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* Chỉ phần lẻ của độ sâu mới quyết định hình. Phần nguyên bị triệt tiêu,
     nên tầng 3 và tầng 3000 hiện ra giống hệt nhau. Đó chính là điều cần thấy. */
  const le = sau - Math.floor(sau);
  const R0 = Math.max(W, H) * .78;

  ctx.save();
  ctx.translate(W / 2, H / 2);
  for (let i = -TREN; i <= DUOI; i++) {
    const b = i + le;                       // khoảng cách tới tầng hiện tại
    const R = R0 * Math.pow(K, b);
    let mo = 1;
    if (b < 0) mo = Math.max(0, 1 + b / TREN);          // tầng ngoài mờ dần khi trôi ra
    else if (b > DUOI - 2.2) mo = Math.max(0, (DUOI - b) / 2.2);
    veTang(R, GOC * b, mo);
  }
  ctx.restore();

  // hào quang ở tâm
  const q = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * .2);
  q.addColorStop(0, 'rgba(255,240,205,.16)'); q.addColorStop(1, 'rgba(255,240,205,0)');
  ctx.fillStyle = q; ctx.fillRect(0, 0, W, H);

  const n = Math.floor(sau);
  tam.querySelector('.bt-so').textContent = n;
  let m = -1;
  for (let i = 0; i < LOI.length; i++) if (n >= LOI[i][0]) m = i;
  if (m !== moc) {
    moc = m;
    const el = tam.querySelector('.bt-loi');
    el.textContent = m >= 0 ? LOI[m][1] : '';
    el.classList.remove('hien');
    void el.offsetWidth;                 // ép tính lại layout, không nhờ vòng vẽ
    if (m >= 0) el.classList.add('hien');
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  sau = 0; toc = .55; moc = -1; keo = null;
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
self.TDTD_BUCTRANH = { mo, dong, _buoc: (t) => buoc(t),
  _dat: (s, v) => { sau = s; if (v !== undefined) toc = v; },
  _anh: () => cv.toDataURL('image/jpeg', .6),
  _debug: () => ({ sau: +sau.toFixed(3), tang: Math.floor(sau), toc, moc, K, GOC }) };
})();
