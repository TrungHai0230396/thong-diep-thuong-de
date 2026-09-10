/* Thả đèn hoa đăng — viết ra điều đang nặng lòng rồi để nó bay đi.
   Chữ chỉ nằm trong bộ nhớ, không ghi xuống máy, không gửi đi đâu. */
(() => {
'use strict';

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let den = [], troi = [], nuoc = 0;

const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- khung ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'hoadang';
  tam.innerHTML = `
    <canvas class="hd-cv"></canvas>
    <button class="hd-dong" aria-label="Đóng">✕</button>
    <div class="hd-lop">
      <div class="hd-viet">
        <p class="hd-hoi">Điều gì đang nặng trong lòng?</p>
        <textarea class="hd-o" rows="3" maxlength="140"
          placeholder="Viết ra đây. Hoặc để trống cũng được."></textarea>
        <button class="primary hd-tha">Thả đi</button>
        <p class="hd-ghi">Chữ này không được lưu ở đâu cả. Thả xong là mất.</p>
      </div>
      <div class="hd-xong" hidden>
        <p class="hd-loi">Đã thả rồi.</p>
        <button class="ghost hd-nua">Thả thêm một chiếc</button>
      </div>
    </div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.hd-cv');
  ctx = cv.getContext('2d');

  tam.querySelector('.hd-dong').onclick = dong;
  tam.querySelector('.hd-tha').onclick = tha;
  tam.querySelector('.hd-nua').onclick = vietTiep;
  tam.querySelector('.hd-o').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); tha(); }
  });
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
  nuoc = H * .8;
  troi = Array.from({ length: Math.round(W * H / 5200) }, () => ({
    x: Math.random() * W, y: Math.random() * nuoc,
    r: Math.random() * 1.3 + .3, a: Math.random() * .5 + .12,
  }));
}

/* ---------- thả đèn ---------- */
function tha() {
  const o = tam.querySelector('.hd-o');
  const chu = o.value.trim().slice(0, 140);
  o.value = '';                                   // xoá ngay, không giữ lại
  o.blur();
  den.push(taoDen(chu, true));
  tam.querySelector('.hd-viet').hidden = true;
  tam.querySelector('.hd-xong').hidden = true;
  setTimeout(() => { if (tam && tam.classList.contains('hien')) tam.querySelector('.hd-xong').hidden = false; }, 6500);
}

function vietTiep() {
  tam.querySelector('.hd-xong').hidden = true;
  tam.querySelector('.hd-viet').hidden = false;
  tam.querySelector('.hd-o').focus();
}

function taoDen(chu, cuaMinh) {
  return {
    chu, cuaMinh,
    x: cuaMinh ? W / 2 : rnd(W * .1, W * .9),
    y: cuaMinh ? nuoc - 20 : rnd(nuoc * .3, nuoc - 40),
    t: 0,
    doi: cuaMinh ? 17000 : rnd(24000, 40000),
    lac: rnd(0, 6.28),
    nhipLac: rnd(.00035, .0007),
    bienLac: rnd(14, 34),
    coBanDau: cuaMinh ? 1 : rnd(.28, .55),
  };
}

/* ---------- vẽ ---------- */
function veDen(d) {
  const p = d.t / d.doi;                                   // 0 → 1
  if (p >= 1) return false;
  const co = d.coBanDau * (1 - p * .8);                    // càng lên càng nhỏ
  const y = d.y - p * (d.y + 80);
  const x = d.x + Math.sin(d.lac + d.t * d.nhipLac) * d.bienLac;
  const mo = p < .82 ? 1 : 1 - (p - .82) / .18;            // gần hết thì tắt dần

  const w = 78 * co, h = 96 * co;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = mo;

  // quầng sáng
  const q = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 2.4);
  q.addColorStop(0, 'rgba(255,190,110,.5)');
  q.addColorStop(.45, 'rgba(255,150,70,.14)');
  q.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = q;
  ctx.beginPath(); ctx.arc(0, 0, w * 2.4, 0, 6.284); ctx.fill();

  // thân giấy
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, 'rgba(255,214,150,.95)');
  g.addColorStop(.55, 'rgba(250,160,80,.95)');
  g.addColorStop(1, 'rgba(214,104,44,.92)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w / 2 * .78, -h / 2);
  ctx.quadraticCurveTo(-w / 2 * 1.12, 0, -w / 2 * .84, h / 2);
  ctx.lineTo(w / 2 * .84, h / 2);
  ctx.quadraticCurveTo(w / 2 * 1.12, 0, w / 2 * .78, -h / 2);
  ctx.closePath(); ctx.fill();

  // nan dọc
  ctx.strokeStyle = 'rgba(150,70,20,.28)'; ctx.lineWidth = Math.max(.6, 1.1 * co);
  for (const k of [-.34, 0, .34]) {
    ctx.beginPath(); ctx.moveTo(w * k * .8, -h / 2 + 2); ctx.lineTo(w * k * .88, h / 2 - 2); ctx.stroke();
  }
  // vành trên dưới
  ctx.strokeStyle = 'rgba(120,55,15,.5)'; ctx.lineWidth = Math.max(.8, 1.6 * co);
  ctx.beginPath(); ctx.moveTo(-w / 2 * .78, -h / 2); ctx.lineTo(w / 2 * .78, -h / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w / 2 * .84, h / 2); ctx.lineTo(w / 2 * .84, h / 2); ctx.stroke();

  // ngọn lửa
  const nhay = 1 + Math.sin(d.t / 90) * .18;
  ctx.fillStyle = 'rgba(255,236,180,.95)';
  ctx.beginPath(); ctx.ellipse(0, h * .22, 4.4 * co * nhay, 7.5 * co * nhay, 0, 0, 6.284); ctx.fill();

  ctx.restore();

  // chữ, mờ dần theo độ cao
  if (d.chu && p < .5) {
    const moChu = Math.min(1, (1 - p / .5) * 1.25) * mo;
    ctx.save();
    ctx.globalAlpha = moChu;
    ctx.textAlign = 'center';
    const coChu = Math.max(12, 17 * d.coBanDau * (1 - p * .5));
    ctx.font = `400 ${coChu}px "Be Vietnam Pro", system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,238,214,.92)';
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 8;
    let yy = y + h / 2 + coChu * 2.1;
    for (const dong of catDong(ctx, d.chu, Math.min(W - 60, 320))) {
      ctx.fillText(dong, x, yy); yy += coChu * 1.5;
    }
    ctx.restore();
  }
  return true;
}

function catDong(ctx, chu, rong) {
  const tu = chu.split(/\s+/), ds = [];
  let hien = '';
  for (const t of tu) {
    const thu = hien ? hien + ' ' + t : t;
    if (ctx.measureText(thu).width <= rong || !hien) hien = thu; else { ds.push(hien); hien = t; }
  }
  if (hien) ds.push(hien);
  return ds.slice(0, 5);
}

function vong(t) {
  raf = requestAnimationFrame(vong);
  buoc(t);
}

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;

  // trời đêm
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#141032'); g.addColorStop(.55, '#1d1740'); g.addColorStop(1, '#0d0b1f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  for (const s of troi) {
    ctx.globalAlpha = s.a * (.75 + Math.sin(t / 1400 + s.x) * .25);
    ctx.fillStyle = '#eae6ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // mặt nước
  const n = ctx.createLinearGradient(0, nuoc, 0, H);
  n.addColorStop(0, 'rgba(60,48,110,.75)'); n.addColorStop(1, 'rgba(10,8,26,.95)');
  ctx.fillStyle = n; ctx.fillRect(0, nuoc, W, H - nuoc);
  ctx.strokeStyle = 'rgba(255,190,120,.10)'; ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const y = nuoc + 12 + i * ((H - nuoc) / 8);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, y + Math.sin(x / 46 + t / 900 + i) * 2.2);
    ctx.stroke();
  }

  // đèn nền cho khỏi trống trải
  if (den.filter(d => !d.cuaMinh).length < 4 && Math.random() < .006) den.push(taoDen('', false));

  for (let i = den.length - 1; i >= 0; i--) {
    den[i].t += dt;
    if (!veDen(den[i])) den.splice(i, 1);
  }
}

/* ---------- vòng đời ---------- */
function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  den = [];
  for (let i = 0; i < 3; i++) { const d = taoDen('', false); d.t = rnd(0, d.doi * .6); den.push(d); }
  tam.querySelector('.hd-viet').hidden = false;
  tam.querySelector('.hd-xong').hidden = true;
  tam.querySelector('.hd-o').value = '';
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) { tam.classList.remove('hien'); tam.querySelector('.hd-o').value = ''; }
  den = [];
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_HOADANG = { mo, dong, _buoc: (t) => buoc(t), _debug: () => ({ den: den.length, coChu: den.filter(d => d.chu).length, W, H }) };
})();
