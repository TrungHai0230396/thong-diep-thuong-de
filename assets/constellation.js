/* Nối sao thành chòm — kéo tay nối các ngôi sáng lại thành hình.
   Không đếm giờ, không thua. Nối trật thì đường tự tan.
   Toạ độ sao trong khung 0..1, sẽ co giãn theo màn hình. */
(() => {
'use strict';

const CHOM = [
  {
    ten: 'Tua Rua',
    phu: 'cụm sao Thất Nữ · sao Mạ',
    loi: 'Nông dân đồng bằng Bắc Bộ gọi là sao Mạ, vì Tua Rua ló lên là tới mùa gieo mạ.',
    cadao: 'Tua rua đi rắc mạ mùa\nTiểu thử đi bừa, cày ruộng rất sâu',
    sao: [[.30,.30],[.44,.22],[.58,.28],[.50,.42],[.36,.48],[.62,.46],[.46,.58]],
    noi: [[0,1],[1,2],[2,3],[3,4],[0,4],[3,5],[4,6],[6,5]],
  },
  {
    ten: 'Bắc Đẩu',
    phu: 'bảy sao của chòm Đại Hùng',
    loi: 'Hình cái gàu múc nước. Kéo dài mép ngoài của gàu chừng năm lần là gặp sao Bắc Cực, nên xưa đi biển đi rừng nhìn nó tìm phương bắc.',
    cadao: '',
    sao: [[.18,.62],[.32,.66],[.46,.64],[.58,.56],[.68,.42],[.58,.30],[.44,.32]],
    noi: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
  },
  {
    ten: 'Lưỡi Cày',
    phu: 'ba sao giữa chòm Lạp Hộ',
    loi: 'Bốn ngôi ngoài là bốn góc thửa ruộng, ba ngôi thẳng hàng ở giữa là lưỡi cày. Tháng Giêng chừng chín giờ tối nhìn rõ nhất.',
    cadao: '',
    sao: [[.30,.24],[.62,.20],[.40,.46],[.48,.50],[.56,.54],[.26,.74],[.62,.78]],
    noi: [[0,2],[2,3],[3,4],[4,1],[0,5],[1,6],[5,2],[4,6]],
  },
  {
    ten: 'Thần Nông',
    phu: 'nhóm sao dân gian, phần trên chòm Thiên Yết',
    loi: 'Người xưa thấy hình ông Thần Nông chống gậy. Đây là cách gọi dân gian cho một nhóm sao, không trùng khớp với chòm Thiên Yết trong thiên văn.',
    cadao: '',
    sao: [[.24,.24],[.36,.32],[.30,.44],[.46,.44],[.58,.50],[.66,.62],[.60,.74],[.46,.78]],
    noi: [[0,1],[1,2],[1,3],[3,4],[4,5],[5,6],[6,7]],
  },
];

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let chi = 0, diem = [], canhCanNoi = [], daNoi = new Set(), keo = null, xong = false, sangDan = 0, nen = [];

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

  const toa = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const gan = (p) => {
    let tot = -1, gn = 34;
    diem.forEach((d, i) => { const k = Math.hypot(d.x - p.x, d.y - p.y); if (k < gn) { gn = k; tot = i; } });
    return tot;
  };
  cv.addEventListener('pointerdown', e => {
    if (xong) return;
    const i = gan(toa(e));
    if (i >= 0) { keo = { tu: i, ...toa(e) }; cv.setPointerCapture(e.pointerId); }
  });
  cv.addEventListener('pointermove', e => { if (keo) Object.assign(keo, toa(e)); });
  cv.addEventListener('pointerup', e => {
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
  cv.addEventListener('pointercancel', () => { keo = null; });
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
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
  const leTren = 130, leDuoi = xong ? 250 : 120;
  const oW = W - 60, oH = H - leTren - leDuoi;
  const canh = Math.min(oW, oH);
  const x0 = (W - canh) / 2, y0 = leTren + (oH - canh) / 2;
  diem = c.sao.map(([sx, sy], i) => ({
    x: x0 + sx * canh, y: y0 + sy * canh,
    sang: diem[i] ? diem[i].sang : 0, nhay: rnd(0, 6.28),
  }));
}

function nap(i) {
  chi = i; xong = false; sangDan = 0; daNoi = new Set(); keo = null;
  const c = CHOM[chi];
  canhCanNoi = new Set(c.noi.map(([a, b]) => khoa(a, b)));
  diem = [];
  datSao();
  tam.querySelector('.cs-ten').textContent = c.ten;
  tam.querySelector('.cs-phu').textContent = c.phu;
  tam.querySelector('.cs-xong').hidden = true;
  tam.querySelector('.cs-nhac').classList.remove('mo');
}

function hoanThanh() {
  xong = true;
  tam.querySelector('.cs-nhac').classList.add('mo');
  const c = CHOM[chi];
  tam.querySelector('.cs-loi').textContent = c.loi;
  const cd = tam.querySelector('.cs-cadao');
  cd.textContent = c.cadao;
  cd.hidden = !c.cadao;
  tam.querySelector('.cs-xong').hidden = false;
  datSao();
  if (navigator.vibrate) { try { navigator.vibrate([16, 60, 30]); } catch (e) {} }
}

function vong(t) { raf = requestAnimationFrame(vong); buoc(t); }

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  if (xong && sangDan < 1) sangDan = Math.min(1, sangDan + dt / 900);

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
  for (const d of diem) {
    const nhay = .82 + Math.sin(t / 900 + d.nhay) * .18;
    const r = (d.sang ? 4.6 : 3.4) * nhay + sangDan * 1.6;
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
self.TDTD_CHOMSAO = { mo, dong, _buoc: (t) => buoc(t), _chom: CHOM,
  _nap: (i) => nap(i),
  _noi: (a, b) => { const k = khoa(a, b);
    if (canhCanNoi.has(k) && !daNoi.has(k)) { daNoi.add(k); diem[a].sang = diem[b].sang = 1;
      if (daNoi.size === canhCanNoi.size) hoanThanh(); return true; } return false; },
  _debug: () => ({ chom: CHOM[chi].ten, canNoi: canhCanNoi.size, daNoi: daNoi.size, xong, soSao: diem.length }) };
})();
